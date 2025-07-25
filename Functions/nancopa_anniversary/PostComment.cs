using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Extensions.CosmosDB;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Nancopa;

public class PostComment
{
    private const int MaxMessageLength = 600;
    private readonly ILogger<PostComment> _logger;

    public PostComment(ILogger<PostComment> logger)
    {
        _logger = logger;
    }
    
    [Function("PostComment")]
    public async Task<MultiResponse> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", "options")] HttpRequest req)
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        // POSTリクエストの場合、リクエストボディからメッセージを取得
        if (req.Method == "POST")
        {
            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                var requestData = JsonSerializer.Deserialize<Dictionary<string, object>>(requestBody);
                
                if (requestData != null && requestData.ContainsKey("message"))
                {
                    var message = requestData["message"]?.ToString() ?? "";
                    var comment = new Comment
                    {
                        Id = Guid.NewGuid().ToString(),
                        Message = message[0.. (message.Length < MaxMessageLength ? message.Length : MaxMessageLength)],
                        Timestamp = DateTime.UtcNow,
                        Year = DateTime.UtcNow.Year
                    };

                    _logger.LogInformation($"Creating comment: {comment.Message}");

                    var successResponse = new OkObjectResult(new { id = comment.Id, message = "投稿ありがとう！" });
                    
                    return new MultiResponse
                    {
                        HttpResponse = successResponse,
                        CosmosDocument = comment
                    };
                }
                else
                {
                    return new MultiResponse
                    {
                        HttpResponse = new BadRequestObjectResult("Message is required"),
                        CosmosDocument = null
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error processing request: {ex.Message}");
                return new MultiResponse
                {
                    HttpResponse = new StatusCodeResult(500),
                    CosmosDocument = null
                };
            }
        }

        // GETリクエストの場合は簡単なレスポンスを返す
        return new MultiResponse
        {
            HttpResponse = new OkObjectResult("Welcome to Azure Functions! Use POST to create a comment."),
            CosmosDocument = null
        };
    }

    public class MultiResponse
    {
        [HttpResult]
        public IActionResult HttpResponse { get; set; } = new OkResult();

        [CosmosDBOutput("nancopa", "messages", Connection = "CosmosDBConnection")]
        public Comment? CosmosDocument { get; set; }
    }
}