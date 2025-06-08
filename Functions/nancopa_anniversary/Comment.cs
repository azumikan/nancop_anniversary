using System.Text.Json.Serialization;

namespace Nancopa
{
    public class Comment
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; }

        [JsonPropertyName("year")]
        public int Year { get; set; }
    }
}
