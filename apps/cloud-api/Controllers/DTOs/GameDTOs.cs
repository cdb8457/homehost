using System.ComponentModel.DataAnnotations;

namespace HomeHost.CloudApi.Controllers
{
    // Response DTOs
    public class GameResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string BannerUrl { get; set; } = string.Empty;
        public int MinPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public string DeploymentDifficulty { get; set; } = string.Empty;
        public int EstimatedSetupTime { get; set; }
        public double PopularityScore { get; set; }
        public bool IsEarlyAccess { get; set; }
        public string? SteamAppId { get; set; }
        public string[] SupportedPlatforms { get; set; } = Array.Empty<string>();
        public int[] RequiredPorts { get; set; } = Array.Empty<int>();
        public Dictionary<string, object> SystemRequirements { get; set; } = new();
        public int CommunityServerCount { get; set; }
        public string RecentActivity { get; set; } = string.Empty;
        public string[] Tags { get; set; } = Array.Empty<string>();
        public string[] Features { get; set; } = Array.Empty<string>();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class GameDetailResponse : GameResponse
    {
        public string InstallationGuide { get; set; } = string.Empty;
        public Dictionary<string, object> ConfigurationOptions { get; set; } = new();
        public List<PluginResponse> CompatiblePlugins { get; set; } = new();
        public List<CommunityServerResponse> CommunityServers { get; set; } = new();
        public List<GameReviewResponse> Reviews { get; set; } = new();
    }

    public class PluginResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Rating { get; set; }
        public int DownloadCount { get; set; }
        public decimal Price { get; set; }
        public bool IsVerified { get; set; }
    }

    public class CommunityServerResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CurrentPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public string Status { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
    }

    public class GameReviewResponse
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class DeploymentResponse
    {
        public Guid ServerId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime EstimatedCompletionTime { get; set; }
        public string ProgressUrl { get; set; } = string.Empty;
    }

    // Request DTOs
    public class DeploymentRequest
    {
        [Required]
        [StringLength(100)]
        public string ServerName { get; set; } = string.Empty;

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Range(1, 100)]
        public int? MaxPlayers { get; set; }

        public bool IsPublic { get; set; } = false;

        [StringLength(50)]
        public string? Password { get; set; }

        public Guid? CommunityId { get; set; }
    }
}