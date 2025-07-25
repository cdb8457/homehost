using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface ISteamService
    {
        // Steam Web API Integration
        Task<SteamAppInfo?> GetAppInfoAsync(string steamAppId);
        Task<List<SteamAppInfo>> SearchAppsAsync(string query);
        Task<SteamUserProfile?> GetUserProfileAsync(string steamId);
        Task<bool> ValidateSteamIdAsync(string steamId);
        
        // Dedicated Server Detection
        Task<SteamServerInfo?> GetDedicatedServerInfoAsync(string steamAppId);
        Task<bool> HasDedicatedServerAsync(string steamAppId);
        Task<List<SteamCompatibilityWarning>> CheckCompatibilityAsync(string steamAppId);
        
        // SteamCMD Integration
        Task<SteamCMDResult> DownloadServerFilesAsync(string steamAppId, string installPath);
        Task<SteamCMDResult> UpdateServerFilesAsync(string steamAppId, string installPath);
        Task<SteamUpdateInfo> CheckForUpdatesAsync(string steamAppId);
        
        // Steam Workshop Integration
        Task<List<SteamWorkshopItem>> GetWorkshopItemsAsync(string steamAppId, int page = 1, int pageSize = 20);
        Task<SteamWorkshopItem?> GetWorkshopItemAsync(string workshopId);
        Task<SteamCMDResult> DownloadWorkshopItemAsync(string workshopId, string installPath);
        
        // Authentication & Verification
        Task<SteamAuthResult> ValidateUserTicketAsync(string steamId, string ticket);
        Task<bool> VerifyServerOwnershipAsync(string steamId, string steamAppId);
        Task<SteamServerStatus> GetServerStatusAsync(string serverIp, int port);
    }

    // Data Models
    public class SteamAppInfo
    {
        public string AppId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Developer { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public DateTime ReleaseDate { get; set; }
        public List<string> Categories { get; set; } = new();
        public List<string> Genres { get; set; } = new();
        public List<string> Screenshots { get; set; } = new();
        public string HeaderImage { get; set; } = string.Empty;
        public bool IsFree { get; set; }
        public decimal Price { get; set; }
        public string PlatformWindows { get; set; } = "false";
        public string PlatformLinux { get; set; } = "false";
        public Dictionary<string, object> SystemRequirements { get; set; } = new();
    }

    public class SteamUserProfile
    {
        public string SteamId { get; set; } = string.Empty;
        public string PersonaName { get; set; } = string.Empty;
        public string RealName { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string AvatarMedium { get; set; } = string.Empty;
        public string AvatarFull { get; set; } = string.Empty;
        public int PersonaState { get; set; }
        public DateTime TimeCreated { get; set; }
        public DateTime LastLogoff { get; set; }
        public string ProfileUrl { get; set; } = string.Empty;
        public string CountryCode { get; set; } = string.Empty;
    }

    public class SteamServerInfo
    {
        public string AppId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool HasDedicatedServer { get; set; }
        public string ServerExecutable { get; set; } = string.Empty;
        public List<int> DefaultPorts { get; set; } = new();
        public Dictionary<string, object> DefaultConfiguration { get; set; } = new();
        public List<string> SupportedPlatforms { get; set; } = new();
        public string InstallationNotes { get; set; } = string.Empty;
        public string ConfigurationGuide { get; set; } = string.Empty;
    }

    public class SteamCompatibilityWarning
    {
        public string Type { get; set; } = string.Empty; // "error", "warning", "info"
        public string Message { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        public bool BlocksDeployment { get; set; }
    }

    public class SteamCMDResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string InstallPath { get; set; } = string.Empty;
        public long BytesDownloaded { get; set; }
        public TimeSpan Duration { get; set; }
        public List<string> Errors { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class SteamUpdateInfo
    {
        public string AppId { get; set; } = string.Empty;
        public string CurrentVersion { get; set; } = string.Empty;
        public string LatestVersion { get; set; } = string.Empty;
        public bool UpdateAvailable { get; set; }
        public long UpdateSize { get; set; }
        public DateTime LastChecked { get; set; }
        public string ReleaseNotes { get; set; } = string.Empty;
    }

    public class SteamWorkshopItem
    {
        public string PublishedFileId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime TimeCreated { get; set; }
        public DateTime TimeUpdated { get; set; }
        public string PreviewUrl { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public int Subscriptions { get; set; }
        public float Score { get; set; }
        public List<string> Tags { get; set; } = new();
        public string AppId { get; set; } = string.Empty;
    }

    public class SteamAuthResult
    {
        public bool Success { get; set; }
        public string SteamId { get; set; } = string.Empty;
        public string PersonaName { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public DateTime ValidatedAt { get; set; }
    }

    public class SteamServerStatus
    {
        public string ServerIp { get; set; } = string.Empty;
        public int Port { get; set; }
        public bool Online { get; set; }
        public string GameVersion { get; set; } = string.Empty;
        public int PlayerCount { get; set; }
        public int MaxPlayers { get; set; }
        public string ServerName { get; set; } = string.Empty;
        public string Map { get; set; } = string.Empty;
        public TimeSpan Ping { get; set; }
        public DateTime LastChecked { get; set; }
    }
}