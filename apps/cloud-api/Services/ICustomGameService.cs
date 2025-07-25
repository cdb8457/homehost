using HomeHost.CloudApi.Models;
using Microsoft.AspNetCore.Http;

namespace HomeHost.CloudApi.Services
{
    public interface ICustomGameService
    {
        // File Upload and Validation
        Task<FileUploadResult> ValidateExecutableAsync(IFormFile file);
        Task<FileUploadResult> UploadCustomGameAsync(IFormFile file, Guid userId, string tempPath);
        Task<bool> ValidateExecutableFormatAsync(string filePath);
        
        // Pattern Detection
        Task<GamePatternAnalysis> AnalyzeGamePatternAsync(string executablePath);
        Task<List<DetectedGameEngine>> DetectGameEngineAsync(string executablePath);
        Task<ServerConfiguration> SuggestConfigurationAsync(GamePatternAnalysis analysis);
        
        // Configuration Management
        Task<CustomGameConfiguration> CreateConfigurationAsync(CustomGameConfigurationRequest request, Guid userId);
        Task<CustomGameConfiguration?> GetConfigurationAsync(Guid configurationId);
        Task<List<CustomGameConfiguration>> GetUserConfigurationsAsync(Guid userId);
        Task<CustomGameConfiguration> UpdateConfigurationAsync(Guid configurationId, CustomGameConfigurationRequest request, Guid userId);
        Task<bool> DeleteConfigurationAsync(Guid configurationId, Guid userId);
        
        // Template System
        Task<GameTemplate> CreateTemplateAsync(CreateTemplateRequest request, Guid userId);
        Task<GameTemplate?> GetTemplateAsync(Guid templateId);
        Task<List<GameTemplate>> SearchTemplatesAsync(string? query, string? gameEngine, int page = 1, int pageSize = 20);
        Task<List<GameTemplate>> GetPopularTemplatesAsync(int limit = 10);
        Task<List<GameTemplate>> GetUserTemplatesAsync(Guid userId);
        Task<bool> DeleteTemplateAsync(Guid templateId, Guid userId);
        
        // Community Profiles
        Task<CommunityGameProfile> CreateCommunityProfileAsync(CreateCommunityProfileRequest request, Guid userId);
        Task<CommunityGameProfile?> GetCommunityProfileAsync(Guid profileId);
        Task<List<CommunityGameProfile>> SearchCommunityProfilesAsync(string? query, string? category, int page = 1, int pageSize = 20);
        Task<CommunityGameProfile> UpdateCommunityProfileAsync(Guid profileId, UpdateCommunityProfileRequest request, Guid userId);
        Task<bool> VoteCommunityProfileAsync(Guid profileId, Guid userId, bool isUpvote);
        
        // Template Application
        Task<CustomGameConfiguration> ApplyTemplateAsync(Guid templateId, ApplyTemplateRequest request, Guid userId);
        Task<CustomGameConfiguration> ApplyCommunityProfileAsync(Guid profileId, ApplyTemplateRequest request, Guid userId);
        
        // Server Deployment
        Task<CustomServerDeployment> DeployCustomServerAsync(Guid configurationId, CustomServerDeploymentRequest request, Guid userId);
        Task<CustomServerStatus> GetCustomServerStatusAsync(Guid deploymentId);
    }

    // Data Models
    public class FileUploadResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public long FileSize { get; set; }
        public string? FileName { get; set; }
        public string? FileHash { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class GamePatternAnalysis
    {
        public string ExecutablePath { get; set; } = string.Empty;
        public List<DetectedGameEngine> DetectedEngines { get; set; } = new();
        public List<DetectedPattern> DetectedPatterns { get; set; } = new();
        public List<ConfigurationFile> ConfigurationFiles { get; set; } = new();
        public List<int> SuggestedPorts { get; set; } = new();
        public string? SuggestedServerName { get; set; }
        public Dictionary<string, object> EngineMetadata { get; set; } = new();
        public float ConfidenceScore { get; set; }
    }

    public class DetectedGameEngine
    {
        public string Name { get; set; } = string.Empty; // Unity, Unreal, Minecraft, Custom
        public string Version { get; set; } = string.Empty;
        public float Confidence { get; set; }
        public List<string> IndicatorFiles { get; set; } = new();
        public Dictionary<string, object> EngineSpecificData { get; set; } = new();
    }

    public class DetectedPattern
    {
        public string PatternType { get; set; } = string.Empty; // "config_file", "port_usage", "command_line"
        public string Description { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public float Confidence { get; set; }
    }

    public class ConfigurationFile
    {
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty; // json, ini, xml, yaml
        public Dictionary<string, object> ParsedContent { get; set; } = new();
        public List<ConfigurationOption> SuggestedOptions { get; set; } = new();
    }

    public class ConfigurationOption
    {
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // string, int, bool, float
        public object? DefaultValue { get; set; }
        public object? CurrentValue { get; set; }
        public bool IsRequired { get; set; }
        public Dictionary<string, object> ValidationRules { get; set; } = new();
    }

    public class ServerConfiguration
    {
        public string ServerName { get; set; } = string.Empty;
        public string ExecutablePath { get; set; } = string.Empty;
        public string WorkingDirectory { get; set; } = string.Empty;
        public string CommandLineArguments { get; set; } = string.Empty;
        public List<int> RequiredPorts { get; set; } = new();
        public Dictionary<string, object> EnvironmentVariables { get; set; } = new();
        public List<ConfigurationOption> ConfigurationOptions { get; set; } = new();
        public string? ConfigurationFilePath { get; set; }
        public string? LogFilePath { get; set; }
        public int MaxPlayers { get; set; } = 10;
        public string? GameEngine { get; set; }
    }

    public class CustomGameConfiguration
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string ExecutablePath { get; set; } = string.Empty;
        public string? GameEngine { get; set; }
        public ServerConfiguration Configuration { get; set; } = new();
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UsageCount { get; set; }
        public List<string> Tags { get; set; } = new();
    }

    public class GameTemplate
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GameName { get; set; } = string.Empty;
        public string? GameEngine { get; set; }
        public Guid AuthorId { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public ServerConfiguration Configuration { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public string? IconUrl { get; set; }
        public string? DocumentationUrl { get; set; }
        public bool IsVerified { get; set; }
        public int DownloadCount { get; set; }
        public float Rating { get; set; }
        public int RatingCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CommunityGameProfile
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GameName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public Guid ContributorId { get; set; }
        public string ContributorName { get; set; } = string.Empty;
        public ServerConfiguration Configuration { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public string? ThumbnailUrl { get; set; }
        public string? SetupGuide { get; set; }
        public int Upvotes { get; set; }
        public int Downvotes { get; set; }
        public int UsageCount { get; set; }
        public bool IsModerated { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CustomServerDeployment
    {
        public Guid Id { get; set; }
        public Guid ConfigurationId { get; set; }
        public Guid UserId { get; set; }
        public string ServerName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string InstallationPath { get; set; } = string.Empty;
        public int Port { get; set; }
        public int CurrentPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastStartedAt { get; set; }
        public Dictionary<string, object> RuntimeConfiguration { get; set; } = new();
    }

    public class CustomServerStatus
    {
        public Guid DeploymentId { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsRunning { get; set; }
        public int CurrentPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public TimeSpan Uptime { get; set; }
        public DateTime LastChecked { get; set; }
        public List<string> RecentLogs { get; set; } = new();
        public Dictionary<string, object> PerformanceMetrics { get; set; } = new();
    }

    // Request DTOs
    public class CustomGameConfigurationRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ExecutablePath { get; set; } = string.Empty;
        public ServerConfiguration Configuration { get; set; } = new();
        public bool IsPublic { get; set; }
        public List<string> Tags { get; set; } = new();
    }

    public class CreateTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GameName { get; set; } = string.Empty;
        public Guid ConfigurationId { get; set; }
        public List<string> Tags { get; set; } = new();
        public string? IconUrl { get; set; }
        public string? DocumentationUrl { get; set; }
    }

    public class CreateCommunityProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GameName { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public ServerConfiguration Configuration { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public string? ThumbnailUrl { get; set; }
        public string? SetupGuide { get; set; }
    }

    public class UpdateCommunityProfileRequest
    {
        public string? Description { get; set; }
        public string? SetupGuide { get; set; }
        public List<string>? Tags { get; set; }
        public string? ThumbnailUrl { get; set; }
    }

    public class ApplyTemplateRequest
    {
        public string ServerName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Dictionary<string, object> ConfigurationOverrides { get; set; } = new();
    }

    public class CustomServerDeploymentRequest
    {
        public string ServerName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string InstallationPath { get; set; } = string.Empty;
        public Dictionary<string, object> RuntimeConfiguration { get; set; } = new();
    }
}