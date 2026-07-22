using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LinkInBio.Api.Models
{
    public class Link
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Url { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Icon { get; set; } = string.Empty;

        public int Order { get; set; }

        public bool IsActive { get; set; } = true;

        public int ClickCount { get; set; } = 0;

        [JsonIgnore]
        public User? User { get; set; }
    }
}
