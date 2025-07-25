using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IPerformanceMonitoringService
    {
        // Server Performance Monitoring
        Task<ServerPerformanceMetrics> GetServerPerformanceMetricsAsync(Guid serverId);
        Task<List<ServerPerformanceMetrics>> GetServerPerformanceHistoryAsync(Guid serverId, DateTime? startDate = null, DateTime? endDate = null);
        Task<ServerPerformanceSnapshot> CreatePerformanceSnapshotAsync(Guid serverId, Guid userId);
        Task<List<ServerPerformanceSnapshot>> GetPerformanceSnapshotsAsync(Guid serverId);
        Task<bool> DeletePerformanceSnapshotAsync(Guid snapshotId, Guid userId);

        // Real-time Performance Monitoring
        Task<RealTimeMetrics> GetRealTimeMetricsAsync(Guid serverId);
        Task<bool> StartRealTimeMonitoringAsync(Guid serverId, Guid userId);
        Task<bool> StopRealTimeMonitoringAsync(Guid serverId, Guid userId);
        Task<List<MetricAlert>> GetActiveAlertsAsync(Guid serverId);
        Task<bool> AcknowledgeAlertAsync(Guid alertId, Guid userId);

        // Performance Alerts & Notifications
        Task<PerformanceAlert> CreatePerformanceAlertAsync(Guid serverId, Guid userId, CreatePerformanceAlertRequest request);
        Task<List<PerformanceAlert>> GetPerformanceAlertsAsync(Guid serverId);
        Task<PerformanceAlert> UpdatePerformanceAlertAsync(Guid alertId, Guid userId, UpdatePerformanceAlertRequest request);
        Task<bool> DeletePerformanceAlertAsync(Guid alertId, Guid userId);
        Task<bool> EnablePerformanceAlertAsync(Guid alertId, Guid userId);
        Task<bool> DisablePerformanceAlertAsync(Guid alertId, Guid userId);

        // Performance Analysis & Insights
        Task<PerformanceAnalysisReport> AnalyzeServerPerformanceAsync(Guid serverId, Guid userId, AnalysisTimeRange timeRange);
        Task<List<PerformanceBottleneck>> IdentifyPerformanceBottlenecksAsync(Guid serverId, Guid userId);
        Task<PerformanceInsights> GetPerformanceInsightsAsync(Guid serverId, Guid userId);
        Task<List<PerformanceTrend>> GetPerformanceTrendsAsync(Guid serverId, TrendAnalysisRequest request);
        Task<PerformanceComparison> CompareServerPerformanceAsync(Guid serverId1, Guid serverId2, Guid userId);

        // Resource Utilization Monitoring
        Task<ResourceUtilization> GetResourceUtilizationAsync(Guid serverId);
        Task<List<ResourceUtilization>> GetResourceUtilizationHistoryAsync(Guid serverId, DateTime? startDate = null, DateTime? endDate = null);
        Task<ResourceOptimizationReport> GetResourceOptimizationReportAsync(Guid serverId, Guid userId);
        Task<List<ResourceRecommendation>> GetResourceRecommendationsAsync(Guid serverId, Guid userId);
        Task<bool> ApplyResourceOptimizationAsync(Guid serverId, Guid userId, List<ResourceOptimizationAction> actions);

        // Performance Optimization
        Task<PerformanceOptimizationPlan> CreateOptimizationPlanAsync(Guid serverId, Guid userId, CreateOptimizationPlanRequest request);
        Task<List<PerformanceOptimizationPlan>> GetOptimizationPlansAsync(Guid serverId);
        Task<OptimizationResult> ExecuteOptimizationPlanAsync(Guid planId, Guid userId);
        Task<bool> RollbackOptimizationAsync(Guid planId, Guid userId);
        Task<OptimizationHistory> GetOptimizationHistoryAsync(Guid serverId);

        // System Health Monitoring
        Task<SystemHealthStatus> GetSystemHealthStatusAsync(Guid serverId);
        Task<List<HealthCheckResult>> RunHealthChecksAsync(Guid serverId, Guid userId);
        Task<HealthCheckSchedule> ScheduleHealthCheckAsync(Guid serverId, Guid userId, ScheduleHealthCheckRequest request);
        Task<List<HealthCheckSchedule>> GetHealthCheckSchedulesAsync(Guid serverId);
        Task<bool> CancelHealthCheckScheduleAsync(Guid scheduleId, Guid userId);

        // Performance Benchmarking
        Task<BenchmarkResult> RunPerformanceBenchmarkAsync(Guid serverId, Guid userId, BenchmarkConfiguration config);
        Task<List<BenchmarkResult>> GetBenchmarkHistoryAsync(Guid serverId);
        Task<BenchmarkComparison> CompareBenchmarksAsync(Guid benchmarkId1, Guid benchmarkId2, Guid userId);
        Task<BenchmarkTemplate> CreateBenchmarkTemplateAsync(Guid userId, CreateBenchmarkTemplateRequest request);
        Task<List<BenchmarkTemplate>> GetBenchmarkTemplatesAsync(Guid? gameId = null);

        // Performance Reporting
        Task<PerformanceReport> GeneratePerformanceReportAsync(Guid serverId, Guid userId, PerformanceReportRequest request);
        Task<List<PerformanceReport>> GetPerformanceReportsAsync(Guid serverId);
        Task<bool> SchedulePerformanceReportAsync(Guid serverId, Guid userId, ScheduleReportRequest request);
        Task<bool> ExportPerformanceDataAsync(Guid serverId, Guid userId, DataExportRequest request);

        // Custom Metrics & Monitoring
        Task<CustomMetric> CreateCustomMetricAsync(Guid serverId, Guid userId, CreateCustomMetricRequest request);
        Task<List<CustomMetric>> GetCustomMetricsAsync(Guid serverId);
        Task<CustomMetric> UpdateCustomMetricAsync(Guid metricId, Guid userId, UpdateCustomMetricRequest request);
        Task<bool> DeleteCustomMetricAsync(Guid metricId, Guid userId);
        Task<List<CustomMetricData>> GetCustomMetricDataAsync(Guid metricId, DateTime? startDate = null, DateTime? endDate = null);

        // Performance Thresholds & Baselines
        Task<PerformanceThreshold> SetPerformanceThresholdAsync(Guid serverId, Guid userId, SetPerformanceThresholdRequest request);
        Task<List<PerformanceThreshold>> GetPerformanceThresholdsAsync(Guid serverId);
        Task<PerformanceBaseline> CreatePerformanceBaselineAsync(Guid serverId, Guid userId, CreatePerformanceBaselineRequest request);
        Task<List<PerformanceBaseline>> GetPerformanceBaselinesAsync(Guid serverId);
        Task<BaselineComparison> CompareToBaselineAsync(Guid serverId, Guid baselineId, Guid userId);

        // Multi-Server Performance Monitoring
        Task<MultiServerMetrics> GetMultiServerMetricsAsync(List<Guid> serverIds, Guid userId);
        Task<ServerGroupPerformance> GetServerGroupPerformanceAsync(Guid groupId, Guid userId);
        Task<PerformanceCorrelation> AnalyzePerformanceCorrelationAsync(List<Guid> serverIds, Guid userId);
        Task<ClusterPerformanceMetrics> GetClusterPerformanceMetricsAsync(Guid clusterId, Guid userId);
    }

    // Data Models
    public class ServerPerformanceMetrics
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public DateTime Timestamp { get; set; }
        public double CpuUsagePercent { get; set; }
        public double MemoryUsagePercent { get; set; }
        public double DiskUsagePercent { get; set; }
        public double NetworkInMbps { get; set; }
        public double NetworkOutMbps { get; set; }
        public int ActivePlayers { get; set; }
        public double ResponseTimeMs { get; set; }
        public double ThroughputRequests { get; set; }
        public double ErrorRate { get; set; }
        public double UptimePercent { get; set; }
        public Dictionary<string, object> CustomMetrics { get; set; } = new();
        public PerformanceMetadata Metadata { get; set; } = new();
    }

    public class ServerPerformanceSnapshot
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public ServerPerformanceMetrics Metrics { get; set; } = new();
        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

    public class RealTimeMetrics
    {
        public Guid ServerId { get; set; }
        public DateTime LastUpdated { get; set; }
        public bool IsMonitoring { get; set; }
        public ServerPerformanceMetrics CurrentMetrics { get; set; } = new();
        public List<MetricDataPoint> RecentDataPoints { get; set; } = new();
        public List<ActiveAlert> ActiveAlerts { get; set; } = new();
    }

    public class MetricDataPoint
    {
        public DateTime Timestamp { get; set; }
        public string MetricName { get; set; } = string.Empty;
        public double Value { get; set; }
        public Dictionary<string, object> Tags { get; set; } = new();
    }

    public class ActiveAlert
    {
        public Guid AlertId { get; set; }
        public string AlertType { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public AlertSeverity Severity { get; set; }
        public DateTime TriggeredAt { get; set; }
        public bool IsAcknowledged { get; set; }
    }

    public class PerformanceAlert
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MetricType { get; set; } = string.Empty;
        public AlertCondition Condition { get; set; } = new();
        public AlertSeverity Severity { get; set; }
        public bool IsEnabled { get; set; } = true;
        public NotificationSettings NotificationSettings { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? LastTriggeredAt { get; set; }
        public int TriggerCount { get; set; } = 0;
    }

    public class AlertCondition
    {
        public string Operator { get; set; } = string.Empty; // "gt", "lt", "eq", "gte", "lte"
        public double Threshold { get; set; }
        public TimeSpan EvaluationWindow { get; set; }
        public int ConsecutiveFailures { get; set; } = 1;
        public Dictionary<string, object> CustomParameters { get; set; } = new();
    }

    public class NotificationSettings
    {
        public bool EmailEnabled { get; set; } = true;
        public bool SlackEnabled { get; set; } = false;
        public bool WebhookEnabled { get; set; } = false;
        public string? WebhookUrl { get; set; }
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class PerformanceAnalysisReport
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public DateTime GeneratedAt { get; set; }
        public AnalysisTimeRange TimeRange { get; set; } = new();
        public PerformanceSummary Summary { get; set; } = new();
        public List<PerformanceInsight> Insights { get; set; } = new();
        public List<PerformanceRecommendation> Recommendations { get; set; } = new();
        public List<PerformanceBottleneck> Bottlenecks { get; set; } = new();
        public Dictionary<string, object> DetailedAnalysis { get; set; } = new();
    }

    public class PerformanceSummary
    {
        public double AverageCpuUsage { get; set; }
        public double AverageMemoryUsage { get; set; }
        public double AverageResponseTime { get; set; }
        public double UptimePercentage { get; set; }
        public int TotalRequests { get; set; }
        public double ErrorRate { get; set; }
        public int PeakPlayers { get; set; }
        public Dictionary<string, double> CustomMetricAverages { get; set; } = new();
    }

    public class PerformanceInsight
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public InsightSeverity Severity { get; set; }
        public DateTime DetectedAt { get; set; }
        public Dictionary<string, object> Data { get; set; } = new();
    }

    public class PerformanceRecommendation
    {
        public string Category { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public RecommendationPriority Priority { get; set; }
        public double ImpactScore { get; set; }
        public List<string> ActionItems { get; set; } = new();
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public class PerformanceBottleneck
    {
        public string Type { get; set; } = string.Empty;
        public string Component { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public BottleneckSeverity Severity { get; set; }
        public double ImpactScore { get; set; }
        public DateTime DetectedAt { get; set; }
        public List<string> SuggestedActions { get; set; } = new();
        public Dictionary<string, object> Metrics { get; set; } = new();
    }

    public class ResourceUtilization
    {
        public Guid ServerId { get; set; }
        public DateTime Timestamp { get; set; }
        public CpuUtilization Cpu { get; set; } = new();
        public MemoryUtilization Memory { get; set; } = new();
        public DiskUtilization Disk { get; set; } = new();
        public NetworkUtilization Network { get; set; } = new();
        public Dictionary<string, object> CustomResources { get; set; } = new();
    }

    public class CpuUtilization
    {
        public double UsagePercent { get; set; }
        public double LoadAverage { get; set; }
        public int CoreCount { get; set; }
        public List<double> PerCoreUsage { get; set; } = new();
    }

    public class MemoryUtilization
    {
        public long TotalMB { get; set; }
        public long UsedMB { get; set; }
        public long FreeMB { get; set; }
        public double UsagePercent { get; set; }
        public long CacheMB { get; set; }
        public long SwapUsedMB { get; set; }
    }

    public class DiskUtilization
    {
        public long TotalGB { get; set; }
        public long UsedGB { get; set; }
        public long FreeGB { get; set; }
        public double UsagePercent { get; set; }
        public double ReadIOPS { get; set; }
        public double WriteIOPS { get; set; }
        public List<DiskPartition> Partitions { get; set; } = new();
    }

    public class DiskPartition
    {
        public string Path { get; set; } = string.Empty;
        public long SizeGB { get; set; }
        public long UsedGB { get; set; }
        public double UsagePercent { get; set; }
    }

    public class NetworkUtilization
    {
        public double InboundMbps { get; set; }
        public double OutboundMbps { get; set; }
        public long PacketsIn { get; set; }
        public long PacketsOut { get; set; }
        public double ErrorRate { get; set; }
        public List<NetworkInterface> Interfaces { get; set; } = new();
    }

    public class NetworkInterface
    {
        public string Name { get; set; } = string.Empty;
        public double InboundMbps { get; set; }
        public double OutboundMbps { get; set; }
        public bool IsActive { get; set; }
    }

    public class PerformanceOptimizationPlan
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<OptimizationAction> Actions { get; set; } = new();
        public OptimizationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExecutedAt { get; set; }
        public OptimizationResult? Result { get; set; }
    }

    public class OptimizationAction
    {
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
        public int Priority { get; set; }
        public bool IsRequired { get; set; }
    }

    public class OptimizationResult
    {
        public bool Success { get; set; }
        public List<string> AppliedActions { get; set; } = new();
        public List<string> FailedActions { get; set; } = new();
        public PerformanceImprovement? Improvement { get; set; }
        public List<string> Warnings { get; set; } = new();
        public Dictionary<string, object> Details { get; set; } = new();
    }

    public class PerformanceImprovement
    {
        public double CpuImprovementPercent { get; set; }
        public double MemoryImprovementPercent { get; set; }
        public double ResponseTimeImprovementPercent { get; set; }
        public double ThroughputImprovementPercent { get; set; }
        public Dictionary<string, double> CustomMetricImprovements { get; set; } = new();
    }

    public class BenchmarkResult
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid UserId { get; set; }
        public string BenchmarkType { get; set; } = string.Empty;
        public DateTime ExecutedAt { get; set; }
        public TimeSpan Duration { get; set; }
        public BenchmarkConfiguration Configuration { get; set; } = new();
        public Dictionary<string, double> Results { get; set; } = new();
        public BenchmarkScore Score { get; set; } = new();
    }

    public class BenchmarkConfiguration
    {
        public string TestType { get; set; } = string.Empty;
        public TimeSpan Duration { get; set; }
        public int Iterations { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public class BenchmarkScore
    {
        public double OverallScore { get; set; }
        public Dictionary<string, double> CategoryScores { get; set; } = new();
        public string PerformanceGrade { get; set; } = string.Empty;
    }

    // Request DTOs
    public class CreatePerformanceAlertRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MetricType { get; set; } = string.Empty;
        public AlertCondition Condition { get; set; } = new();
        public AlertSeverity Severity { get; set; }
        public NotificationSettings NotificationSettings { get; set; } = new();
    }

    public class UpdatePerformanceAlertRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public AlertCondition? Condition { get; set; }
        public AlertSeverity? Severity { get; set; }
        public NotificationSettings? NotificationSettings { get; set; }
    }

    public class CreateOptimizationPlanRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<OptimizationAction> Actions { get; set; } = new();
    }

    public class ScheduleHealthCheckRequest
    {
        public string Name { get; set; } = string.Empty;
        public string CheckType { get; set; } = string.Empty;
        public string Schedule { get; set; } = string.Empty; // Cron expression
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public class CreateBenchmarkTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string GameType { get; set; } = string.Empty;
        public BenchmarkConfiguration Configuration { get; set; } = new();
    }

    public class CreateCustomMetricRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string MetricType { get; set; } = string.Empty;
        public string DataSource { get; set; } = string.Empty;
        public Dictionary<string, object> Configuration { get; set; } = new();
    }

    public class UpdateCustomMetricRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public Dictionary<string, object>? Configuration { get; set; }
    }

    public class SetPerformanceThresholdRequest
    {
        public string MetricType { get; set; } = string.Empty;
        public double WarningThreshold { get; set; }
        public double CriticalThreshold { get; set; }
        public string? Description { get; set; }
    }

    public class CreatePerformanceBaselineRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<string> MetricTypes { get; set; } = new();
    }

    // Enums
    public enum AlertSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum InsightSeverity
    {
        Info,
        Warning,
        Error,
        Critical
    }

    public enum RecommendationPriority
    {
        Low,
        Medium,
        High,
        Critical
    }

    public enum BottleneckSeverity
    {
        Minor,
        Moderate,
        Major,
        Critical
    }

    public enum OptimizationStatus
    {
        Draft,
        Scheduled,
        Executing,
        Completed,
        Failed,
        Cancelled
    }

    // Placeholder classes for complex types
    public class MetricAlert { }
    public class PerformanceInsights { }
    public class PerformanceTrend { }
    public class PerformanceComparison { }
    public class TrendAnalysisRequest { }
    public class AnalysisTimeRange { }
    public class ResourceOptimizationReport { }
    public class ResourceRecommendation { }
    public class ResourceOptimizationAction { }
    public class SystemHealthStatus { }
    public class HealthCheckResult { }
    public class HealthCheckSchedule { }
    public class OptimizationHistory { }
    public class BenchmarkComparison { }
    public class BenchmarkTemplate { }
    public class PerformanceReport { }
    public class PerformanceReportRequest { }
    public class ScheduleReportRequest { }
    public class DataExportRequest { }
    public class CustomMetric { }
    public class CustomMetricData { }
    public class PerformanceThreshold { }
    public class PerformanceBaseline { }
    public class BaselineComparison { }
    public class MultiServerMetrics { }
    public class ServerGroupPerformance { }
    public class PerformanceCorrelation { }
    public class ClusterPerformanceMetrics { }
    public class PerformanceMetadata { }
}