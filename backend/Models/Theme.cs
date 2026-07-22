using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace LinkInBio.Api.Models
{
    public class Theme
    {
        public int Id { get; set; }

        public int UserId { get; set; }

        [MaxLength(20)]
        public string BackgroundColor { get; set; } = "#ffffff";

        [MaxLength(50)]
        public string BackgroundType { get; set; } = "color"; // color, gradient

        [MaxLength(20)]
        public string GradientStart { get; set; } = "#0f172a";

        [MaxLength(20)]
        public string GradientEnd { get; set; } = "#1e1b4b";

        [MaxLength(20)]
        public string ButtonStyle { get; set; } = "rounded"; // rounded, sharp, soft

        public double ButtonTransparency { get; set; } = 0.1;

        [MaxLength(20)]
        public string ButtonTextColor { get; set; } = "white"; // white, black

        [MaxLength(50)]
        public string Font { get; set; } = "Inter";

        // Social Links
        [MaxLength(200)]
        public string InstagramUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string TwitterUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string GithubUrl { get; set; } = string.Empty;

        [MaxLength(200)]
        public string LinkedinUrl { get; set; } = string.Empty;

        [JsonIgnore]
        public User? User { get; set; }
    }
}
