using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LinkInBio.Api.Models
{
    public class VisitEvent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [MaxLength(45)]
        public string? IpAddress { get; set; } // Can be hashed for privacy

        [MaxLength(500)]
        public string? UserAgent { get; set; }

        [MaxLength(50)]
        public string? DeviceType { get; set; } // "Desktop", "Mobile", "Tablet"

        [MaxLength(50)]
        public string? OperatingSystem { get; set; } // "iOS", "Android", "Windows", "macOS"

        [MaxLength(500)]
        public string? Referrer { get; set; } // E.g., "instagram.com", "twitter.com"
    }
}
