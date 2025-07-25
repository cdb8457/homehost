using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IBackupRecoveryService
    {
        // Server Backup Management
        Task<ServerBackup> CreateServerBackupAsync(Guid serverId, Guid userId, CreateServerBackupRequest request);
        Task<List<ServerBackup>> GetServerBackupsAsync(Guid serverId);
        Task<ServerBackup> GetServerBackupAsync(Guid backupId);
        Task<bool> DeleteServerBackupAsync(Guid backupId, Guid userId);
        Task<BackupProgress> GetBackupProgressAsync(Guid backupId);
        Task<bool> CancelBackupAsync(Guid backupId, Guid userId);

        // Server Recovery Management
        Task<RecoveryJob> RestoreServerFromBackupAsync(Guid backupId, Guid userId, RestoreServerRequest request);
        Task<List<RecoveryJob>> GetRecoveryJobsAsync(Guid serverId);
        Task<RecoveryJob> GetRecoveryJobAsync(Guid jobId);
        Task<RecoveryProgress> GetRecoveryProgressAsync(Guid jobId);
        Task<bool> CancelRecoveryAsync(Guid jobId, Guid userId);

        // Automated Backup Scheduling
        Task<BackupSchedule> CreateBackupScheduleAsync(Guid serverId, Guid userId, CreateBackupScheduleRequest request);
        Task<List<BackupSchedule>> GetBackupSchedulesAsync(Guid serverId);
        Task<BackupSchedule> UpdateBackupScheduleAsync(Guid scheduleId, Guid userId, UpdateBackupScheduleRequest request);
        Task<bool> DeleteBackupScheduleAsync(Guid scheduleId, Guid userId);
        Task<bool> EnableBackupScheduleAsync(Guid scheduleId, Guid userId);
        Task<bool> DisableBackupScheduleAsync(Guid scheduleId, Guid userId);

        // Backup Policies & Retention
        Task<BackupPolicy> CreateBackupPolicyAsync(Guid serverId, Guid userId, CreateBackupPolicyRequest request);
        Task<List<BackupPolicy>> GetBackupPoliciesAsync(Guid serverId);
        Task<BackupPolicy> UpdateBackupPolicyAsync(Guid policyId, Guid userId, UpdateBackupPolicyRequest request);
        Task<bool> DeleteBackupPolicyAsync(Guid policyId, Guid userId);
        Task<bool> ApplyBackupPolicyAsync(Guid serverId, Guid policyId, Guid userId);

        // Incremental & Differential Backups
        Task<ServerBackup> CreateIncrementalBackupAsync(Guid serverId, Guid userId, CreateIncrementalBackupRequest request);
        Task<ServerBackup> CreateDifferentialBackupAsync(Guid serverId, Guid userId, CreateDifferentialBackupRequest request);
        Task<List<ServerBackup>> GetBackupChainAsync(Guid baseBackupId);
        Task<BackupChainInfo> GetBackupChainInfoAsync(Guid backupId);

        // Backup Verification & Integrity
        Task<BackupVerificationResult> VerifyBackupIntegrityAsync(Guid backupId, Guid userId);
        Task<List<BackupVerificationResult>> GetBackupVerificationHistoryAsync(Guid backupId);
        Task<bool> ScheduleBackupVerificationAsync(Guid backupId, Guid userId, VerificationSchedule schedule);
        Task<BackupHealthReport> GetBackupHealthReportAsync(Guid serverId, Guid userId);

        // Disaster Recovery Planning
        Task<DisasterRecoveryPlan> CreateDisasterRecoveryPlanAsync(Guid serverId, Guid userId, CreateDisasterRecoveryPlanRequest request);
        Task<List<DisasterRecoveryPlan>> GetDisasterRecoveryPlansAsync(Guid serverId);
        Task<DisasterRecoveryPlan> UpdateDisasterRecoveryPlanAsync(Guid planId, Guid userId, UpdateDisasterRecoveryPlanRequest request);
        Task<bool> DeleteDisasterRecoveryPlanAsync(Guid planId, Guid userId);
        Task<DrillResult> ExecuteDisasterRecoveryDrillAsync(Guid planId, Guid userId);

        // Backup Storage Management
        Task<BackupStorage> ConfigureBackupStorageAsync(Guid userId, ConfigureBackupStorageRequest request);
        Task<List<BackupStorage>> GetBackupStorageConfigurationsAsync(Guid userId);
        Task<BackupStorage> UpdateBackupStorageAsync(Guid storageId, Guid userId, UpdateBackupStorageRequest request);
        Task<bool> DeleteBackupStorageAsync(Guid storageId, Guid userId);
        Task<StorageUsageReport> GetStorageUsageReportAsync(Guid storageId, Guid userId);

        // Cross-Platform Backup Support
        Task<ServerBackup> CreateCrossPlatformBackupAsync(Guid serverId, Guid userId, CrossPlatformBackupRequest request);
        Task<RecoveryJob> RestoreCrossPlatformBackupAsync(Guid backupId, Guid userId, CrossPlatformRestoreRequest request);
        Task<PlatformCompatibilityReport> GetPlatformCompatibilityReportAsync(Guid backupId);

        // Backup Analytics & Reporting
        Task<BackupAnalytics> GetBackupAnalyticsAsync(Guid serverId, Guid userId, AnalyticsTimeRange timeRange);
        Task<BackupReport> GenerateBackupReportAsync(Guid serverId, Guid userId, BackupReportRequest request);
        Task<List<BackupTrend>> GetBackupTrendsAsync(Guid serverId, TrendAnalysisRequest request);
        Task<BackupCostAnalysis> GetBackupCostAnalysisAsync(Guid serverId, Guid userId);

        // Backup Synchronization & Replication
        Task<ReplicationJob> CreateBackupReplicationAsync(Guid backupId, Guid userId, ReplicationRequest request);
        Task<List<ReplicationJob>> GetReplicationJobsAsync(Guid serverId);
        Task<ReplicationStatus> GetReplicationStatusAsync(Guid replicationId);
        Task<bool> CancelReplicationAsync(Guid replicationId, Guid userId);

        // Backup Compression & Encryption
        Task<CompressionResult> CompressBackupAsync(Guid backupId, Guid userId, CompressionSettings settings);
        Task<EncryptionResult> EncryptBackupAsync(Guid backupId, Guid userId, EncryptionSettings settings);
        Task<bool> DecryptBackupAsync(Guid backupId, Guid userId, DecryptionSettings settings);
        Task<BackupSecurityReport> GetBackupSecurityReportAsync(Guid serverId, Guid userId);

        // Cloud Backup Integration
        Task<CloudBackupJob> CreateCloudBackupAsync(Guid serverId, Guid userId, CloudBackupRequest request);
        Task<List<CloudBackupJob>> GetCloudBackupsAsync(Guid serverId);
        Task<CloudBackupStatus> GetCloudBackupStatusAsync(Guid cloudBackupId);
        Task<bool> SyncWithCloudProviderAsync(Guid serverId, Guid userId, CloudSyncRequest request);

        // Backup Templates & Presets
        Task<BackupTemplate> CreateBackupTemplateAsync(Guid userId, CreateBackupTemplateRequest request);
        Task<List<BackupTemplate>> GetBackupTemplatesAsync(Guid? gameId = null);
        Task<BackupTemplate> UpdateBackupTemplateAsync(Guid templateId, Guid userId, UpdateBackupTemplateRequest request);
        Task<bool> DeleteBackupTemplateAsync(Guid templateId, Guid userId);
        Task<ServerBackup> CreateBackupFromTemplateAsync(Guid serverId, Guid templateId, Guid userId);

        // Backup Monitoring & Alerts
        Task<BackupAlert> CreateBackupAlertAsync(Guid serverId, Guid userId, CreateBackupAlertRequest request);
        Task<List<BackupAlert>> GetBackupAlertsAsync(Guid serverId);
        Task<BackupAlert> UpdateBackupAlertAsync(Guid alertId, Guid userId, UpdateBackupAlertRequest request);
        Task<bool> DeleteBackupAlertAsync(Guid alertId, Guid userId);
        Task<List<BackupNotification>> GetBackupNotificationsAsync(Guid userId);
    }

    // Data Models
    public class ServerBackup
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public BackupType Type { get; set; }
        public BackupStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public long SizeBytes { get; set; }
        public string StoragePath { get; set; } = string.Empty;
        public BackupConfiguration Configuration { get; set; } = new();
        public BackupMetadata Metadata { get; set; } = new();
        public List<BackupFile> Files { get; set; } = new();
        public string? ErrorMessage { get; set; }
        public double ProgressPercent { get; set; }
        public Guid? ParentBackupId { get; set; } // For incremental backups

        // Navigation properties
        public GameServer? Server { get; set; }
        public User? User { get; set; }
        public ServerBackup? ParentBackup { get; set; }
    }

    public class BackupConfiguration
    {
        public bool IncludeGameFiles { get; set; } = true;
        public bool IncludeConfigFiles { get; set; } = true;
        public bool IncludePlayerData { get; set; } = true;
        public bool IncludeLogs { get; set; } = false;
        public bool IncludeMods { get; set; } = true;
        public List<string> ExcludedPaths { get; set; } = new();
        public CompressionLevel CompressionLevel { get; set; }
        public bool EnableEncryption { get; set; } = false;
        public string? EncryptionKey { get; set; }
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class BackupMetadata
    {
        public string ServerVersion { get; set; } = string.Empty;
        public string GameVersion { get; set; } = string.Empty;
        public List<string> InstalledMods { get; set; } = new();
        public Dictionary<string, string> ServerSettings { get; set; } = new();
        public string Platform { get; set; } = string.Empty;
        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

    public class BackupFile
    {
        public string RelativePath { get; set; } = string.Empty;
        public long SizeBytes { get; set; }
        public DateTime LastModified { get; set; }
        public string Checksum { get; set; } = string.Empty;
        public bool IsCompressed { get; set; }
        public bool IsEncrypted { get; set; }
    }

    public class BackupProgress
    {
        public Guid BackupId { get; set; }
        public BackupStatus Status { get; set; }
        public double ProgressPercent { get; set; }
        public string CurrentOperation { get; set; } = string.Empty;
        public long ProcessedBytes { get; set; }
        public long TotalBytes { get; set; }
        public int ProcessedFiles { get; set; }
        public int TotalFiles { get; set; }
        public TimeSpan ElapsedTime { get; set; }
        public TimeSpan? EstimatedTimeRemaining { get; set; }
        public double TransferRateMBps { get; set; }
    }

    public class RecoveryJob
    {
        public Guid Id { get; set; }
        public Guid BackupId { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public RecoveryType Type { get; set; }
        public RecoveryStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public RecoveryConfiguration Configuration { get; set; } = new();
        public string? ErrorMessage { get; set; }
        public double ProgressPercent { get; set; }

        // Navigation properties
        public ServerBackup? Backup { get; set; }
        public GameServer? Server { get; set; }
        public User? User { get; set; }
    }

    public class RecoveryConfiguration
    {
        public bool RestoreGameFiles { get; set; } = true;
        public bool RestoreConfigFiles { get; set; } = true;
        public bool RestorePlayerData { get; set; } = true;
        public bool RestoreMods { get; set; } = true;
        public bool StopServerBeforeRestore { get; set; } = true;
        public bool StartServerAfterRestore { get; set; } = true;
        public List<string> SelectedPaths { get; set; } = new();
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class RecoveryProgress
    {
        public Guid JobId { get; set; }
        public RecoveryStatus Status { get; set; }
        public double ProgressPercent { get; set; }
        public string CurrentOperation { get; set; } = string.Empty;
        public long ProcessedBytes { get; set; }
        public long TotalBytes { get; set; }
        public int ProcessedFiles { get; set; }
        public int TotalFiles { get; set; }
        public TimeSpan ElapsedTime { get; set; }
        public TimeSpan? EstimatedTimeRemaining { get; set; }
    }

    public class BackupSchedule
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CronExpression { get; set; } = string.Empty;
        public BackupType BackupType { get; set; }
        public bool IsEnabled { get; set; } = true;
        public BackupConfiguration Configuration { get; set; } = new();
        public RetentionPolicy RetentionPolicy { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? NextRunTime { get; set; }
        public DateTime? LastRunTime { get; set; }
        public int SuccessfulRuns { get; set; } = 0;
        public int FailedRuns { get; set; } = 0;

        // Navigation properties
        public GameServer? Server { get; set; }
        public User? User { get; set; }
    }

    public class RetentionPolicy
    {
        public int KeepDailyBackups { get; set; } = 7;
        public int KeepWeeklyBackups { get; set; } = 4;
        public int KeepMonthlyBackups { get; set; } = 12;
        public int KeepYearlyBackups { get; set; } = 5;
        public long MaxStorageSizeGB { get; set; } = 0; // 0 = unlimited
        public bool DeleteOldestWhenFull { get; set; } = true;
    }

    public class BackupPolicy
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public BackupConfiguration DefaultConfiguration { get; set; } = new();
        public RetentionPolicy RetentionPolicy { get; set; } = new();
        public List<BackupRule> Rules { get; set; } = new();
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
    }

    public class BackupRule
    {
        public string Name { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public bool IsEnabled { get; set; } = true;
    }

    public class BackupVerificationResult
    {
        public Guid Id { get; set; }
        public Guid BackupId { get; set; }
        public DateTime VerifiedAt { get; set; }
        public VerificationStatus Status { get; set; }
        public List<VerificationCheck> Checks { get; set; } = new();
        public string? ErrorMessage { get; set; }
        public Dictionary<string, object> Details { get; set; } = new();
    }

    public class VerificationCheck
    {
        public string Name { get; set; } = string.Empty;
        public CheckStatus Status { get; set; }
        public string? Message { get; set; }
        public Dictionary<string, object> Data { get; set; } = new();
    }

    public class DisasterRecoveryPlan
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<RecoveryStep> Steps { get; set; } = new();
        public TimeSpan TargetRecoveryTime { get; set; }
        public TimeSpan TargetRecoveryPoint { get; set; }
        public List<string> ResponsibleUsers { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? LastTestedAt { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class RecoveryStep
    {
        public int Order { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public TimeSpan EstimatedDuration { get; set; }
        public bool IsAutomated { get; set; } = false;
    }

    public class BackupStorage
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public StorageType Type { get; set; }
        public StorageConfiguration Configuration { get; set; } = new();
        public bool IsDefault { get; set; } = false;
        public bool IsEnabled { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public StorageUsage Usage { get; set; } = new();

        // Navigation properties
        public User? User { get; set; }
    }

    public class StorageConfiguration
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string ContainerName { get; set; } = string.Empty;
        public string AccessKey { get; set; } = string.Empty;
        public string SecretKey { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class StorageUsage
    {
        public long TotalSizeBytes { get; set; }
        public int BackupCount { get; set; }
        public DateTime LastUpdated { get; set; }
        public double UsagePercent { get; set; }
    }

    // Request DTOs
    public class CreateServerBackupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public BackupType Type { get; set; } = BackupType.Full;
        public BackupConfiguration Configuration { get; set; } = new();
        public Guid? StorageId { get; set; }
    }

    public class RestoreServerRequest
    {
        public string? Name { get; set; }
        public RecoveryType Type { get; set; } = RecoveryType.Full;
        public RecoveryConfiguration Configuration { get; set; } = new();
        public Guid? TargetServerId { get; set; }
    }

    public class CreateBackupScheduleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CronExpression { get; set; } = string.Empty;
        public BackupType BackupType { get; set; } = BackupType.Full;
        public BackupConfiguration Configuration { get; set; } = new();
        public RetentionPolicy RetentionPolicy { get; set; } = new();
    }

    public class UpdateBackupScheduleRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? CronExpression { get; set; }
        public BackupType? BackupType { get; set; }
        public BackupConfiguration? Configuration { get; set; }
        public RetentionPolicy? RetentionPolicy { get; set; }
    }

    public class CreateBackupPolicyRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public BackupConfiguration DefaultConfiguration { get; set; } = new();
        public RetentionPolicy RetentionPolicy { get; set; } = new();
        public List<BackupRule> Rules { get; set; } = new();
    }

    public class UpdateBackupPolicyRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public BackupConfiguration? DefaultConfiguration { get; set; }
        public RetentionPolicy? RetentionPolicy { get; set; }
        public List<BackupRule>? Rules { get; set; }
    }

    public class CreateIncrementalBackupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid BaseBackupId { get; set; }
        public BackupConfiguration Configuration { get; set; } = new();
    }

    public class CreateDifferentialBackupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid BaseBackupId { get; set; }
        public BackupConfiguration Configuration { get; set; } = new();
    }

    public class CreateDisasterRecoveryPlanRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<RecoveryStep> Steps { get; set; } = new();
        public TimeSpan TargetRecoveryTime { get; set; }
        public TimeSpan TargetRecoveryPoint { get; set; }
        public List<string> ResponsibleUsers { get; set; } = new();
    }

    public class UpdateDisasterRecoveryPlanRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<RecoveryStep>? Steps { get; set; }
        public TimeSpan? TargetRecoveryTime { get; set; }
        public TimeSpan? TargetRecoveryPoint { get; set; }
        public List<string>? ResponsibleUsers { get; set; }
    }

    public class ConfigureBackupStorageRequest
    {
        public string Name { get; set; } = string.Empty;
        public StorageType Type { get; set; }
        public StorageConfiguration Configuration { get; set; } = new();
        public bool IsDefault { get; set; } = false;
    }

    public class UpdateBackupStorageRequest
    {
        public string? Name { get; set; }
        public StorageConfiguration? Configuration { get; set; }
        public bool? IsDefault { get; set; }
    }

    public class CrossPlatformBackupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<string> TargetPlatforms { get; set; } = new();
        public BackupConfiguration Configuration { get; set; } = new();
        public PlatformMappingConfiguration PlatformMapping { get; set; } = new();
    }

    public class CrossPlatformRestoreRequest
    {
        public string? Name { get; set; }
        public string TargetPlatform { get; set; } = string.Empty;
        public RecoveryConfiguration Configuration { get; set; } = new();
        public PlatformMappingConfiguration PlatformMapping { get; set; } = new();
    }

    public class CreateBackupTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? GameType { get; set; }
        public BackupConfiguration Configuration { get; set; } = new();
        public RetentionPolicy RetentionPolicy { get; set; } = new();
        public bool IsPublic { get; set; } = false;
    }

    public class UpdateBackupTemplateRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public BackupConfiguration? Configuration { get; set; }
        public RetentionPolicy? RetentionPolicy { get; set; }
        public bool? IsPublic { get; set; }
    }

    public class CreateBackupAlertRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public AlertTrigger Trigger { get; set; } = new();
        public NotificationSettings NotificationSettings { get; set; } = new();
    }

    public class UpdateBackupAlertRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public AlertTrigger? Trigger { get; set; }
        public NotificationSettings? NotificationSettings { get; set; }
    }

    // Enums
    public enum BackupType
    {
        Full,
        Incremental,
        Differential,
        Custom
    }

    public enum BackupStatus
    {
        Pending,
        InProgress,
        Completed,
        Failed,
        Cancelled,
        Verifying,
        Verified
    }

    public enum RecoveryType
    {
        Full,
        Partial,
        InPlace,
        AlternateLocation
    }

    public enum RecoveryStatus
    {
        Pending,
        InProgress,
        Completed,
        Failed,
        Cancelled
    }

    public enum CompressionLevel
    {
        None,
        Low,
        Medium,
        High,
        Maximum
    }

    public enum VerificationStatus
    {
        Pending,
        InProgress,
        Passed,
        Failed,
        Warning
    }

    public enum CheckStatus
    {
        Passed,
        Failed,
        Warning,
        Skipped
    }

    public enum StorageType
    {
        Local,
        AmazonS3,
        AzureBlob,
        GoogleCloud,
        FTP,
        SFTP,
        Network
    }

    // Placeholder classes for complex types
    public class BackupChainInfo { }
    public class BackupHealthReport { }
    public class DrillResult { }
    public class StorageUsageReport { }
    public class PlatformCompatibilityReport { }
    public class BackupAnalytics { }
    public class BackupReport { }
    public class BackupReportRequest { }
    public class BackupTrend { }
    public class BackupCostAnalysis { }
    public class ReplicationJob { }
    public class ReplicationRequest { }
    public class ReplicationStatus { }
    public class CompressionResult { }
    public class CompressionSettings { }
    public class EncryptionResult { }
    public class EncryptionSettings { }
    public class DecryptionSettings { }
    public class BackupSecurityReport { }
    public class CloudBackupJob { }
    public class CloudBackupRequest { }
    public class CloudBackupStatus { }
    public class CloudSyncRequest { }
    public class BackupTemplate { }
    public class BackupAlert { }
    public class BackupNotification { }
    public class AlertTrigger { }
    public class VerificationSchedule { }
    public class AnalyticsTimeRange { }
    public class PlatformMappingConfiguration { }
}