using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IGameLibraryService
    {
        // Game Management
        Task<GameLibraryEntry> AddGameToLibraryAsync(Guid userId, AddGameToLibraryRequest request);
        Task<GameLibraryEntry> GetGameLibraryEntryAsync(Guid entryId);
        Task<List<GameLibraryEntry>> GetUserGameLibraryAsync(Guid userId, GameLibraryFilter? filter = null);
        Task<GameLibraryEntry> UpdateGameLibraryEntryAsync(Guid entryId, Guid userId, UpdateGameLibraryEntryRequest request);
        Task<bool> RemoveGameFromLibraryAsync(Guid entryId, Guid userId);
        Task<GameLibraryStats> GetGameLibraryStatsAsync(Guid userId);

        // Game Installation & Management
        Task<GameInstallation> InstallGameAsync(Guid userId, Guid gameId, InstallGameRequest request);
        Task<GameInstallation> GetGameInstallationAsync(Guid installationId);
        Task<List<GameInstallation>> GetUserGameInstallationsAsync(Guid userId, Guid? gameId = null);
        Task<GameInstallation> UpdateGameInstallationAsync(Guid installationId, Guid userId, UpdateGameInstallationRequest request);
        Task<bool> UninstallGameAsync(Guid installationId, Guid userId);
        Task<InstallationProgress> GetInstallationProgressAsync(Guid installationId);
        Task<bool> PauseInstallationAsync(Guid installationId, Guid userId);
        Task<bool> ResumeInstallationAsync(Guid installationId, Guid userId);
        Task<bool> CancelInstallationAsync(Guid installationId, Guid userId);

        // Game Version Management
        Task<List<GameVersion>> GetAvailableGameVersionsAsync(Guid gameId);
        Task<GameVersion> GetGameVersionAsync(Guid versionId);
        Task<GameInstallation> UpdateGameVersionAsync(Guid installationId, Guid userId, Guid targetVersionId);
        Task<bool> RollbackGameVersionAsync(Guid installationId, Guid userId, Guid targetVersionId);
        Task<List<GameVersion>> GetInstalledGameVersionsAsync(Guid installationId);
        Task<VersionCompatibilityReport> CheckVersionCompatibilityAsync(Guid gameId, Guid versionId, Guid serverId);

        // Game Detection & Discovery
        Task<List<DetectedGame>> ScanForInstalledGamesAsync(Guid userId, ScanGameRequest request);
        Task<GameDetectionResult> DetectGameAsync(Guid userId, string gamePath);
        Task<List<GameSuggestion>> GetGameSuggestionsAsync(Guid userId, int limit = 10);
        Task<GameLibraryEntry> ImportDetectedGameAsync(Guid userId, ImportGameRequest request);
        Task<bool> VerifyGameInstallationAsync(Guid installationId);

        // Mod Management
        Task<GameMod> InstallModAsync(Guid installationId, Guid userId, InstallModRequest request);
        Task<List<GameMod>> GetInstalledModsAsync(Guid installationId);
        Task<List<AvailableMod>> GetAvailableModsAsync(Guid gameId, ModSearchFilter? filter = null);
        Task<GameMod> UpdateModAsync(Guid modId, Guid userId, UpdateModRequest request);
        Task<bool> UninstallModAsync(Guid modId, Guid userId);
        Task<ModCompatibilityReport> CheckModCompatibilityAsync(Guid installationId, Guid modId);
        Task<List<ModDependency>> GetModDependenciesAsync(Guid modId);
        Task<bool> ResolveModDependenciesAsync(Guid installationId, Guid userId, List<Guid> modIds);

        // Configuration Profiles
        Task<GameConfiguration> CreateGameConfigurationAsync(Guid installationId, Guid userId, CreateGameConfigurationRequest request);
        Task<List<GameConfiguration>> GetGameConfigurationsAsync(Guid installationId);
        Task<GameConfiguration> GetActiveGameConfigurationAsync(Guid installationId);
        Task<GameConfiguration> UpdateGameConfigurationAsync(Guid configurationId, Guid userId, UpdateGameConfigurationRequest request);
        Task<bool> DeleteGameConfigurationAsync(Guid configurationId, Guid userId);
        Task<GameConfiguration> SetActiveConfigurationAsync(Guid installationId, Guid userId, Guid configurationId);
        Task<GameConfiguration> DuplicateConfigurationAsync(Guid configurationId, Guid userId, string newName);
        Task<bool> ExportConfigurationAsync(Guid configurationId, Guid userId, ExportConfigurationRequest request);
        Task<GameConfiguration> ImportConfigurationAsync(Guid installationId, Guid userId, ImportConfigurationRequest request);

        // Game Launching & Runtime
        Task<GameLaunchResult> LaunchGameAsync(Guid installationId, Guid userId, LaunchGameRequest request);
        Task<List<ActiveGameSession>> GetActiveGameSessionsAsync(Guid userId);
        Task<GameSession> GetGameSessionAsync(Guid sessionId);
        Task<bool> TerminateGameSessionAsync(Guid sessionId, Guid userId);
        Task<GamePerformanceMetrics> GetGamePerformanceMetricsAsync(Guid sessionId);
        Task<bool> UpdateGameSessionAsync(Guid sessionId, UpdateGameSessionRequest request);

        // Library Organization
        Task<GameCategory> CreateGameCategoryAsync(Guid userId, CreateGameCategoryRequest request);
        Task<List<GameCategory>> GetUserGameCategoriesAsync(Guid userId);
        Task<GameCategory> UpdateGameCategoryAsync(Guid categoryId, Guid userId, UpdateGameCategoryRequest request);
        Task<bool> DeleteGameCategoryAsync(Guid categoryId, Guid userId);
        Task<bool> AddGameToCategoryAsync(Guid entryId, Guid userId, Guid categoryId);
        Task<bool> RemoveGameFromCategoryAsync(Guid entryId, Guid userId, Guid categoryId);
        Task<List<GameTag>> GetGameTagsAsync(Guid userId, string? searchTerm = null);
        Task<bool> AddGameTagsAsync(Guid entryId, Guid userId, List<string> tags);
        Task<bool> RemoveGameTagsAsync(Guid entryId, Guid userId, List<string> tags);

        // Game Assets & Resources
        Task<List<GameAsset>> GetGameAssetsAsync(Guid gameId, GameAssetType? type = null);
        Task<GameAsset> DownloadGameAssetAsync(Guid assetId, Guid userId);
        Task<bool> CacheGameAssetsAsync(Guid installationId, Guid userId, List<GameAssetType> assetTypes);
        Task<GameAssetManifest> GetGameAssetManifestAsync(Guid gameId, Guid versionId);
        Task<bool> VerifyGameAssetsAsync(Guid installationId, Guid userId);

        // Game Servers Integration
        Task<List<CompatibleServer>> GetCompatibleServersAsync(Guid installationId);
        Task<ServerCompatibilityReport> CheckServerCompatibilityAsync(Guid installationId, Guid serverId);
        Task<bool> LaunchGameWithServerAsync(Guid installationId, Guid userId, Guid serverId, LaunchWithServerRequest request);
        Task<List<GameServerTemplate>> GetServerTemplatesForGameAsync(Guid gameId);

        // Backup & Sync
        Task<GameBackup> CreateGameBackupAsync(Guid installationId, Guid userId, CreateGameBackupRequest request);
        Task<List<GameBackup>> GetGameBackupsAsync(Guid installationId);
        Task<bool> RestoreGameBackupAsync(Guid backupId, Guid userId);
        Task<bool> DeleteGameBackupAsync(Guid backupId, Guid userId);
        Task<SyncOperation> SyncGameLibraryAsync(Guid userId, SyncGameLibraryRequest request);
        Task<bool> EnableCloudSyncAsync(Guid installationId, Guid userId, CloudSyncSettings settings);

        // Analytics & Insights
        Task<GamePlaytimeAnalytics> GetGamePlaytimeAnalyticsAsync(Guid userId, Guid? gameId = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<GamePerformanceAnalytics> GetGamePerformanceAnalyticsAsync(Guid installationId, Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<LibraryInsights> GetLibraryInsightsAsync(Guid userId);
        Task<List<GameRecommendation>> GetGameRecommendationsAsync(Guid userId, int limit = 10);
        Task<GameUsageReport> GetGameUsageReportAsync(Guid userId, GameUsageReportType reportType, DateTime? startDate = null, DateTime? endDate = null);

        // Advanced Features
        Task<GameBenchmark> RunGameBenchmarkAsync(Guid installationId, Guid userId, BenchmarkConfiguration config);
        Task<List<GameBenchmark>> GetGameBenchmarksAsync(Guid installationId);
        Task<SystemRequirementsCheck> CheckSystemRequirementsAsync(Guid gameId, Guid? versionId = null);
        Task<OptimizationSuggestions> GetOptimizationSuggestionsAsync(Guid installationId, Guid userId);
        Task<bool> ApplyOptimizationAsync(Guid installationId, Guid userId, List<OptimizationAction> actions);

        // Community Features
        Task<GameReview> CreateGameReviewAsync(Guid gameId, Guid userId, CreateGameReviewRequest request);
        Task<List<GameReview>> GetGameReviewsAsync(Guid gameId, ReviewFilter? filter = null);
        Task<GameReview> UpdateGameReviewAsync(Guid reviewId, Guid userId, UpdateGameReviewRequest request);
        Task<bool> DeleteGameReviewAsync(Guid reviewId, Guid userId);
        Task<List<GameScreenshot>> GetGameScreenshotsAsync(Guid gameId, ScreenshotFilter? filter = null);
        Task<GameScreenshot> UploadGameScreenshotAsync(Guid gameId, Guid userId, UploadScreenshotRequest request);
        Task<bool> DeleteGameScreenshotAsync(Guid screenshotId, Guid userId);

        // Automation & Scheduling
        Task<AutomationRule> CreateGameAutomationRuleAsync(Guid userId, CreateAutomationRuleRequest request);
        Task<List<AutomationRule>> GetGameAutomationRulesAsync(Guid userId);
        Task<AutomationRule> UpdateAutomationRuleAsync(Guid ruleId, Guid userId, UpdateAutomationRuleRequest request);
        Task<bool> DeleteAutomationRuleAsync(Guid ruleId, Guid userId);
        Task<bool> ExecuteAutomationRuleAsync(Guid ruleId, Guid userId);
        Task<List<ScheduledTask>> GetScheduledGameTasksAsync(Guid userId);
        Task<ScheduledTask> CreateScheduledTaskAsync(Guid userId, CreateScheduledTaskRequest request);
    }

    // Data Models
    public class GameLibraryEntry
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid GameId { get; set; }
        public string GameName { get; set; } = string.Empty;
        public string? GameDescription { get; set; }
        public string? IconUrl { get; set; }
        public string? BannerUrl { get; set; }
        public GameLibraryStatus Status { get; set; }
        public List<string> Categories { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public GameLibraryMetadata Metadata { get; set; } = new();
        public DateTime AddedAt { get; set; }
        public DateTime? LastPlayedAt { get; set; }
        public TimeSpan TotalPlaytime { get; set; }
        public int LaunchCount { get; set; }
        public float UserRating { get; set; }
        public string? UserNotes { get; set; }
        public bool IsFavorite { get; set; }
        public bool IsHidden { get; set; }

        // Navigation properties
        public Game? Game { get; set; }
        public User? User { get; set; }
        public List<GameInstallation> Installations { get; set; } = new();
    }

    public class GameLibraryMetadata
    {
        public string? SourcePlatform { get; set; } // "steam", "epic", "manual", etc.
        public string? ExternalGameId { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
        public List<string> AchievementIds { get; set; } = new();
        public DateTime? PurchaseDate { get; set; }
        public decimal? PurchasePrice { get; set; }
        public string? LicenseType { get; set; }
    }

    public class GameInstallation
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid GameId { get; set; }
        public Guid? LibraryEntryId { get; set; }
        public string InstallPath { get; set; } = string.Empty;
        public Guid VersionId { get; set; }
        public string VersionName { get; set; } = string.Empty;
        public InstallationStatus Status { get; set; }
        public long TotalSizeBytes { get; set; }
        public long InstalledSizeBytes { get; set; }
        public InstallationConfiguration Configuration { get; set; } = new();
        public List<GameMod> InstalledMods { get; set; } = new();
        public List<GameConfiguration> Configurations { get; set; } = new();
        public Guid? ActiveConfigurationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? InstalledAt { get; set; }
        public DateTime? LastVerifiedAt { get; set; }
        public InstallationHealth Health { get; set; } = new();

        // Navigation properties
        public User? User { get; set; }
        public Game? Game { get; set; }
        public GameLibraryEntry? LibraryEntry { get; set; }
        public GameVersion? Version { get; set; }
        public GameConfiguration? ActiveConfiguration { get; set; }
    }

    public class InstallationConfiguration
    {
        public string? Language { get; set; }
        public string? Region { get; set; }
        public List<string> OptionalComponents { get; set; } = new();
        public Dictionary<string, object> InstallOptions { get; set; } = new();
        public bool AutoUpdate { get; set; } = true;
        public bool VerifyIntegrity { get; set; } = true;
        public string? InstallPriority { get; set; } = "normal";
    }

    public class InstallationHealth
    {
        public float HealthScore { get; set; } = 1.0f;
        public List<string> Issues { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public DateTime LastHealthCheck { get; set; }
        public bool IsCorrupted { get; set; } = false;
        public bool NeedsVerification { get; set; } = false;
    }

    public class GameVersion
    {
        public Guid Id { get; set; }
        public Guid GameId { get; set; }
        public string VersionNumber { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ChangelogUrl { get; set; }
        public List<string> Changelog { get; set; } = new();
        public VersionType Type { get; set; }
        public VersionStability Stability { get; set; }
        public long SizeBytes { get; set; }
        public string? DownloadUrl { get; set; }
        public string? ChecksumMd5 { get; set; }
        public string? ChecksumSha256 { get; set; }
        public SystemRequirements? MinimumRequirements { get; set; }
        public SystemRequirements? RecommendedRequirements { get; set; }
        public List<string> SupportedPlatforms { get; set; } = new();
        public DateTime ReleasedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsPrerelease { get; set; } = false;
        public VersionMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Game? Game { get; set; }
    }

    public class VersionMetadata
    {
        public List<string> BreakingChanges { get; set; } = new();
        public List<string> NewFeatures { get; set; } = new();
        public List<string> BugFixes { get; set; } = new();
        public List<string> KnownIssues { get; set; } = new();
        public Dictionary<string, string> Dependencies { get; set; } = new();
        public string? UpdatePriority { get; set; } // "critical", "high", "normal", "low"
    }

    public class SystemRequirements
    {
        public string? OperatingSystem { get; set; }
        public string? Processor { get; set; }
        public string? Memory { get; set; }
        public string? Graphics { get; set; }
        public string? DirectX { get; set; }
        public string? Network { get; set; }
        public string? Storage { get; set; }
        public string? SoundCard { get; set; }
        public List<string> AdditionalNotes { get; set; } = new();
    }

    public class GameMod
    {
        public Guid Id { get; set; }
        public Guid InstallationId { get; set; }
        public Guid ModDefinitionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public ModStatus Status { get; set; }
        public string InstallPath { get; set; } = string.Empty;
        public long SizeBytes { get; set; }
        public ModConfiguration Configuration { get; set; } = new();
        public List<ModDependency> Dependencies { get; set; } = new();
        public ModCompatibility Compatibility { get; set; } = new();
        public DateTime InstalledAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsEnabled { get; set; } = true;
        public int LoadOrder { get; set; }

        // Navigation properties
        public GameInstallation? Installation { get; set; }
        public AvailableMod? ModDefinition { get; set; }
    }

    public class ModConfiguration
    {
        public Dictionary<string, object> Settings { get; set; } = new();
        public bool AutoUpdate { get; set; } = true;
        public string? UpdateChannel { get; set; } = "stable";
        public List<string> EnabledFeatures { get; set; } = new();
    }

    public class ModDependency
    {
        public Guid ModId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? VersionConstraint { get; set; }
        public bool IsRequired { get; set; } = true;
        public bool IsInstalled { get; set; } = false;
        public string? InstallUrl { get; set; }
    }

    public class ModCompatibility
    {
        public bool IsCompatible { get; set; } = true;
        public List<string> Issues { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
        public string? CompatibilityVersion { get; set; }
        public DateTime LastChecked { get; set; }
    }

    public class AvailableMod
    {
        public Guid Id { get; set; }
        public Guid GameId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CurrentVersion { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string? AuthorUrl { get; set; }
        public string? ModUrl { get; set; }
        public string? DownloadUrl { get; set; }
        public string? IconUrl { get; set; }
        public List<string> Screenshots { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public ModRating Rating { get; set; } = new();
        public ModStats Stats { get; set; } = new();
        public List<string> SupportedVersions { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsVerified { get; set; } = false;
    }

    public class ModRating
    {
        public float AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new(); // Rating -> Count
    }

    public class ModStats
    {
        public int DownloadCount { get; set; }
        public int ActiveInstalls { get; set; }
        public int WeeklyDownloads { get; set; }
        public DateTime LastDownload { get; set; }
    }

    public class GameConfiguration
    {
        public Guid Id { get; set; }
        public Guid InstallationId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ConfigurationType Type { get; set; }
        public Dictionary<string, object> Settings { get; set; } = new();
        public Dictionary<string, object> LaunchParameters { get; set; } = new();
        public List<string> EnabledMods { get; set; } = new();
        public bool IsActive { get; set; } = false;
        public bool IsDefault { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public ConfigurationMetadata Metadata { get; set; } = new();

        // Navigation properties
        public GameInstallation? Installation { get; set; }
        public User? User { get; set; }
    }

    public class ConfigurationMetadata
    {
        public string? SourceConfiguration { get; set; }
        public List<string> Tags { get; set; } = new();
        public bool IsShared { get; set; } = false;
        public int ShareCount { get; set; } = 0;
        public float Rating { get; set; } = 0;
        public int RatingCount { get; set; } = 0;
    }

    // Request DTOs
    public class AddGameToLibraryRequest
    {
        public Guid GameId { get; set; }
        public List<string> Categories { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public string? SourcePlatform { get; set; }
        public string? ExternalGameId { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class UpdateGameLibraryEntryRequest
    {
        public List<string>? Categories { get; set; }
        public List<string>? Tags { get; set; }
        public float? UserRating { get; set; }
        public string? UserNotes { get; set; }
        public bool? IsFavorite { get; set; }
        public bool? IsHidden { get; set; }
    }

    public class InstallGameRequest
    {
        public Guid? VersionId { get; set; }
        public string InstallPath { get; set; } = string.Empty;
        public InstallationConfiguration Configuration { get; set; } = new();
        public bool StartInstallationImmediately { get; set; } = true;
    }

    public class UpdateGameInstallationRequest
    {
        public InstallationConfiguration? Configuration { get; set; }
        public bool? AutoUpdate { get; set; }
        public string? Notes { get; set; }
    }

    public class InstallModRequest
    {
        public Guid ModDefinitionId { get; set; }
        public string? Version { get; set; }
        public ModConfiguration Configuration { get; set; } = new();
        public bool AutoResolveDependencies { get; set; } = true;
    }

    public class CreateGameConfigurationRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ConfigurationType Type { get; set; }
        public Dictionary<string, object> Settings { get; set; } = new();
        public Dictionary<string, object> LaunchParameters { get; set; } = new();
        public List<string> EnabledMods { get; set; } = new();
        public bool SetAsActive { get; set; } = false;
    }

    // Enums
    public enum GameLibraryStatus
    {
        NotInstalled,
        Installing,
        Installed,
        UpdateAvailable,
        Corrupted,
        Uninstalling
    }

    public enum InstallationStatus
    {
        Queued,
        Downloading,
        Installing,
        Installed,
        Failed,
        Paused,
        Cancelled,
        Updating,
        Verifying,
        Corrupted
    }

    public enum VersionType
    {
        Release,
        Beta,
        Alpha,
        Nightly,
        Patch,
        Hotfix
    }

    public enum VersionStability
    {
        Stable,
        Testing,
        Unstable,
        Experimental
    }

    public enum ModStatus
    {
        Installed,
        Installing,
        Failed,
        Disabled,
        UpdateAvailable,
        Incompatible
    }

    public enum ConfigurationType
    {
        Performance,
        Quality,
        Competitive,
        Casual,
        Custom,
        Streaming,
        VR
    }

    public enum GameAssetType
    {
        Icon,
        Banner,
        Screenshot,
        Video,
        Soundtrack,
        Artwork,
        Manual,
        SaveGame,
        Configuration
    }

    public enum GameUsageReportType
    {
        Daily,
        Weekly,
        Monthly,
        Yearly,
        Custom
    }

    // Additional placeholder classes for complex types
    public class GameLibraryFilter { }
    public class GameLibraryStats { }
    public class InstallationProgress { }
    public class VersionCompatibilityReport { }
    public class DetectedGame { }
    public class GameDetectionResult { }
    public class ScanGameRequest { }
    public class GameSuggestion { }
    public class ImportGameRequest { }
    public class UpdateModRequest { }
    public class ModCompatibilityReport { }
    public class ModSearchFilter { }
    public class UpdateGameConfigurationRequest { }
    public class ExportConfigurationRequest { }
    public class ImportConfigurationRequest { }
    public class LaunchGameRequest { }
    public class GameLaunchResult { }
    public class ActiveGameSession { }
    public class GameSession { }
    public class UpdateGameSessionRequest { }
    public class GamePerformanceMetrics { }
    public class CreateGameCategoryRequest { }
    public class GameCategory { }
    public class UpdateGameCategoryRequest { }
    public class GameTag { }
    public class GameAsset { }
    public class GameAssetManifest { }
    public class CompatibleServer { }
    public class ServerCompatibilityReport { }
    public class LaunchWithServerRequest { }
    public class GameServerTemplate { }
    public class GameBackup { }
    public class CreateGameBackupRequest { }
    public class SyncGameLibraryRequest { }
    public class CloudSyncSettings { }
    public class GamePlaytimeAnalytics { }
    public class GamePerformanceAnalytics { }
    public class LibraryInsights { }
    public class GameRecommendation { }
    public class GameUsageReport { }
    public class GameBenchmark { }
    public class BenchmarkConfiguration { }
    public class SystemRequirementsCheck { }
    public class OptimizationSuggestions { }
    public class OptimizationAction { }
    public class GameReview { }
    public class CreateGameReviewRequest { }
    public class ReviewFilter { }
    public class UpdateGameReviewRequest { }
    public class GameScreenshot { }
    public class ScreenshotFilter { }
    public class UploadScreenshotRequest { }
    public class AutomationRule { }
    public class CreateAutomationRuleRequest { }
    public class UpdateAutomationRuleRequest { }
    public class ScheduledTask { }
    public class CreateScheduledTaskRequest { }
}