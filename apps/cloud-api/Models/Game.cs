using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeHost.CloudApi.Models
{
    [Table("Games")]
    public class Game
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Genre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(500)]
        public string BannerUrl { get; set; } = string.Empty;

        [Range(1, 100)]
        public int MinPlayers { get; set; } = 1;

        [Range(1, 1000)]
        public int MaxPlayers { get; set; } = 10;

        [Required]
        [MaxLength(20)]
        public string DeploymentDifficulty { get; set; } = "Easy"; // Easy, Medium, Hard

        [Range(1, 180)]
        public int EstimatedSetupTime { get; set; } = 5; // Minutes

        [Range(0, 100)]
        public double PopularityScore { get; set; } = 0;

        public bool IsEarlyAccess { get; set; } = false;

        [MaxLength(20)]
        public string? SteamAppId { get; set; }

        [MaxLength(50)]
        public string? Version { get; set; }

        // JSON columns for complex data
        [Column(TypeName = "jsonb")]
        public string[] SupportedPlatforms { get; set; } = Array.Empty<string>();

        [Column(TypeName = "jsonb")]
        public int[] RequiredPorts { get; set; } = Array.Empty<int>();

        [Column(TypeName = "jsonb")]
        public Dictionary<string, object> SystemRequirements { get; set; } = new();

        [Column(TypeName = "jsonb")]
        public Dictionary<string, object> ConfigurationOptions { get; set; } = new();

        [Column(TypeName = "jsonb")]
        public string[] Tags { get; set; } = Array.Empty<string>();

        [Column(TypeName = "jsonb")]
        public string[] Features { get; set; } = Array.Empty<string>();

        public string InstallationGuide { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public virtual ICollection<GameServer> GameServers { get; set; } = new List<GameServer>();
    }
}