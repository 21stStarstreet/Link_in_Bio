using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LinkInBio.Api.Models
{
    public class ClickEvent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int LinkId { get; set; }
        public Link Link { get; set; } = null!;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [MaxLength(45)]
        public string? IpAddress { get; set; } // Can be hashed for privacy

        [MaxLength(50)]
        public string? DeviceType { get; set; } // "Desktop", "Mobile", "Tablet"

        [MaxLength(50)]
        public string? OperatingSystem { get; set; } // "iOS", "Android", "Windows", "macOS"
    }
}
