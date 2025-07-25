using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeHost.CloudApi.Models
{
    [Table("UserSessions")]
    public class UserSession
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(512)]
        public string RefreshToken { get; set; } = string.Empty;

        [Required]
        public DateTime ExpiresAt { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }

        public bool IsRevoked { get; set; }

        [MaxLength(512)]
        public string? UserAgent { get; set; }

        [MaxLength(45)] // IPv6 max length
        public string? IpAddress { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;
    }
}