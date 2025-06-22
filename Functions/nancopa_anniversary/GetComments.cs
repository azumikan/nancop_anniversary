using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Extensions.CosmosDB;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace Nancopa;

public class GetComments
{
    private readonly ILogger<GetComments> _logger;

    public GetComments(ILogger<GetComments> logger)
    {
        _logger = logger;
    }    [Function("GetComments")]
    public IActionResult Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "options")] HttpRequest req,
        [CosmosDBInput(
            "nancopa", 
            "messages", 
            Connection = "CosmosDBConnection",
            SqlQuery = "SELECT * FROM c ORDER BY RAND() OFFSET 0 LIMIT 100")] 
        IEnumerable<Comment> comments){
        _logger.LogInformation("GetComments function processed a request.");

        // OPTIONSリクエストの場合（CORSプリフライト）
        if (req.Method == "OPTIONS")
        {
            return new OkResult();
        }

        try
        {
            // CORSヘッダーを設定
            var response = new OkObjectResult(comments);
            
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving comments: {ex.Message}");
            return new StatusCodeResult(500);
        }
    }
}
