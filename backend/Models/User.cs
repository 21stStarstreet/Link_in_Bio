using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LinkInBio.Api.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string AvatarUrl { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Bio { get; set; } = string.Empty;

        public int ProfileViews { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<Link> Links { get; set; } = new List<Link>();
        
        [JsonIgnore]
        public Theme? Theme { get; set; }
    }
}
