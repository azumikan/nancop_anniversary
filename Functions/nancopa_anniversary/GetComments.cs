using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Extensions.CosmosDB;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Microsoft.Azure.Cosmos;

namespace Nancopa;

public class GetComments
{
    private readonly ILogger<GetComments> _logger;

    public GetComments(ILogger<GetComments> logger)
    {
        _logger = logger;
    }
    private readonly string _alphabetAndNumbers = "abcdefghijklmnopqrstuvwxyz0123456789";

    [Function("GetComments")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req,
        [CosmosDBInput(Connection = "CosmosDBConnection")]
        CosmosClient cosmosClient)
    {
        _logger.LogInformation("GetComments function processed a request.");

        try
        {
            var shuffled = string.Join("", _alphabetAndNumbers.OrderBy(c => Guid.NewGuid()));
            var container = cosmosClient.GetContainer("nancopa", "messages");
            var query = new QueryDefinition("SELECT TOP 50 * FROM c WHERE STARTSWITH(c.id, @c)");
            List<Comment> comments = [];
            foreach (var c in shuffled)
            {
                var result = container.GetItemQueryIterator<Comment>(query.WithParameter("@c", c));
                while (result.HasMoreResults)
                {
                    var data = await result.ReadNextAsync();
                    comments.AddRange(data);
                }

                if (comments.Count >= 50)
                {
                    comments = comments.Take(50).ToList();
                    break;
                }
            }

            return new OkObjectResult(comments);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving comments: {ex.Message}");
            return new StatusCodeResult(500);
        }
    }
}
