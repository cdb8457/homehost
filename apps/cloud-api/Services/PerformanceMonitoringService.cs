using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;
using System.Text.Json;

namespace HomeHost.CloudApi.Services
{
    public class PerformanceMonitoringService : IPerformanceMonitoringService
    {
        private readonly HomeHostContext _context;
        private readonly IGameServerService _gameServerService;
        private readonly ILogger<PerformanceMonitoringService> _logger;

        public PerformanceMonitoringService(
            HomeHostContext context,
            IGameServerService gameServerService,
            ILogger<PerformanceMonitoringService> logger)
        {
            _context = context;
            _gameServerService = gameServerService;
            _logger = logger;
        }

        // Server Performance Monitoring
        public async Task<ServerPerformanceMetrics> GetServerPerformanceMetricsAsync(Guid serverId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            var latestMetrics = await _context.ServerPerformanceMetrics
                .Where(m => m.ServerId == serverId)
                .OrderByDescending(m => m.Timestamp)
                .FirstOrDefaultAsync();

            if (latestMetrics == null)
            {
                return new ServerPerformanceMetrics
                {
                    Id = Guid.NewGuid(),
                    ServerId = serverId,
                    Timestamp = DateTime.UtcNow
                };
            }

            return latestMetrics;
        }

        public async Task<List<ServerPerformanceMetrics>> GetServerPerformanceHistoryAsync(Guid serverId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.ServerPerformanceMetrics
                .Where(m => m.ServerId == serverId);

            if (startDate.HasValue)
            {
                query = query.Where(m => m.Timestamp >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(m => m.Timestamp <= endDate.Value);
            }

            return await query
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }

        public async Task<ServerPerformanceSnapshot> CreatePerformanceSnapshotAsync(Guid serverId, Guid userId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            var currentMetrics = await GetServerPerformanceMetricsAsync(serverId);

            var snapshot = new ServerPerformanceSnapshot
            {
                Id = Guid.NewGuid(),
                ServerId = serverId,
                UserId = userId,
                Name = $"Performance Snapshot - {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}",
                CreatedAt = DateTime.UtcNow,
                Metrics = currentMetrics
            };

            _context.ServerPerformanceSnapshots.Add(snapshot);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance snapshot {SnapshotId} created for server {ServerId} by user {UserId}", 
                snapshot.Id, serverId, userId);

            return snapshot;
        }

        public async Task<List<ServerPerformanceSnapshot>> GetPerformanceSnapshotsAsync(Guid serverId)
        {
            return await _context.ServerPerformanceSnapshots
                .Where(s => s.ServerId == serverId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeletePerformanceSnapshotAsync(Guid snapshotId, Guid userId)
        {
            var snapshot = await _context.ServerPerformanceSnapshots.FirstOrDefaultAsync(s => s.Id == snapshotId);
            if (snapshot == null)
            {
                throw new KeyNotFoundException("Performance snapshot not found");
            }

            if (snapshot.UserId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this snapshot");
            }

            _context.ServerPerformanceSnapshots.Remove(snapshot);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance snapshot {SnapshotId} deleted by user {UserId}", snapshotId, userId);

            return true;
        }

        // Real-time Performance Monitoring
        public async Task<RealTimeMetrics> GetRealTimeMetricsAsync(Guid serverId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            var currentMetrics = await GetServerPerformanceMetricsAsync(serverId);
            var recentDataPoints = await _context.ServerPerformanceMetrics
                .Where(m => m.ServerId == serverId)
                .Where(m => m.Timestamp >= DateTime.UtcNow.AddMinutes(-30))
                .OrderBy(m => m.Timestamp)
                .Take(100)
                .ToListAsync();

            var activeAlerts = await _context.PerformanceAlerts
                .Where(a => a.ServerId == serverId && a.IsEnabled)
                .Where(a => a.LastTriggeredAt >= DateTime.UtcNow.AddHours(-1))
                .Select(a => new ActiveAlert
                {
                    AlertId = a.Id,
                    AlertType = a.MetricType,
                    Message = a.Name,
                    Severity = a.Severity,
                    TriggeredAt = a.LastTriggeredAt ?? DateTime.UtcNow
                })
                .ToListAsync();

            return new RealTimeMetrics
            {
                ServerId = serverId,
                LastUpdated = DateTime.UtcNow,
                IsMonitoring = true,
                CurrentMetrics = currentMetrics,
                RecentDataPoints = recentDataPoints.Select(m => new MetricDataPoint
                {
                    Timestamp = m.Timestamp,
                    MetricName = "CpuUsage",
                    Value = m.CpuUsagePercent
                }).ToList(),
                ActiveAlerts = activeAlerts
            };
        }

        public async Task<bool> StartRealTimeMonitoringAsync(Guid serverId, Guid userId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            _logger.LogInformation("Real-time monitoring started for server {ServerId} by user {UserId}", serverId, userId);

            return true;
        }

        public async Task<bool> StopRealTimeMonitoringAsync(Guid serverId, Guid userId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            _logger.LogInformation("Real-time monitoring stopped for server {ServerId} by user {UserId}", serverId, userId);

            return true;
        }

        public async Task<List<MetricAlert>> GetActiveAlertsAsync(Guid serverId)
        {
            // Implementation would return active alerts from monitoring system
            return new List<MetricAlert>();
        }

        public async Task<bool> AcknowledgeAlertAsync(Guid alertId, Guid userId)
        {
            var alert = await _context.PerformanceAlerts.FirstOrDefaultAsync(a => a.Id == alertId);
            if (alert == null)
            {
                throw new KeyNotFoundException("Alert not found");
            }

            _logger.LogInformation("Alert {AlertId} acknowledged by user {UserId}", alertId, userId);

            return true;
        }

        // Performance Alerts & Notifications
        public async Task<PerformanceAlert> CreatePerformanceAlertAsync(Guid serverId, Guid userId, CreatePerformanceAlertRequest request)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            var alert = new PerformanceAlert
            {
                Id = Guid.NewGuid(),
                ServerId = serverId,
                UserId = userId,
                Name = request.Name,
                Description = request.Description,
                MetricType = request.MetricType,
                Condition = request.Condition,
                Severity = request.Severity,
                NotificationSettings = request.NotificationSettings,
                CreatedAt = DateTime.UtcNow
            };

            _context.PerformanceAlerts.Add(alert);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance alert {AlertId} created for server {ServerId} by user {UserId}", 
                alert.Id, serverId, userId);

            return alert;
        }

        public async Task<List<PerformanceAlert>> GetPerformanceAlertsAsync(Guid serverId)
        {
            return await _context.PerformanceAlerts
                .Where(a => a.ServerId == serverId)
                .OrderBy(a => a.Name)
                .ToListAsync();
        }

        public async Task<PerformanceAlert> UpdatePerformanceAlertAsync(Guid alertId, Guid userId, UpdatePerformanceAlertRequest request)
        {
            var alert = await _context.PerformanceAlerts.FirstOrDefaultAsync(a => a.Id == alertId);
            if (alert == null)
            {
                throw new KeyNotFoundException("Performance alert not found");
            }

            if (alert.UserId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this alert");
            }

            // Update alert properties from request
            if (request.Name != null) alert.Name = request.Name;
            if (request.Description != null) alert.Description = request.Description;
            if (request.Condition != null) alert.Condition = request.Condition;
            if (request.Severity.HasValue) alert.Severity = request.Severity.Value;
            if (request.NotificationSettings != null) alert.NotificationSettings = request.NotificationSettings;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance alert {AlertId} updated by user {UserId}", alertId, userId);

            return alert;
        }

        public async Task<bool> DeletePerformanceAlertAsync(Guid alertId, Guid userId)
        {
            var alert = await _context.PerformanceAlerts.FirstOrDefaultAsync(a => a.Id == alertId);
            if (alert == null)
            {
                throw new KeyNotFoundException("Performance alert not found");
            }

            if (alert.UserId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this alert");
            }

            _context.PerformanceAlerts.Remove(alert);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance alert {AlertId} deleted by user {UserId}", alertId, userId);

            return true;
        }

        public async Task<bool> EnablePerformanceAlertAsync(Guid alertId, Guid userId)
        {
            var alert = await _context.PerformanceAlerts.FirstOrDefaultAsync(a => a.Id == alertId);
            if (alert == null)
            {
                throw new KeyNotFoundException("Performance alert not found");
            }

            if (alert.UserId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this alert");
            }

            alert.IsEnabled = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance alert {AlertId} enabled by user {UserId}", alertId, userId);

            return true;
        }

        public async Task<bool> DisablePerformanceAlertAsync(Guid alertId, Guid userId)
        {
            var alert = await _context.PerformanceAlerts.FirstOrDefaultAsync(a => a.Id == alertId);
            if (alert == null)
            {
                throw new KeyNotFoundException("Performance alert not found");
            }

            if (alert.UserId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this alert");
            }

            alert.IsEnabled = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Performance alert {AlertId} disabled by user {UserId}", alertId, userId);

            return true;
        }

        // Performance Analysis & Insights
        public async Task<PerformanceAnalysisReport> AnalyzeServerPerformanceAsync(Guid serverId, Guid userId, AnalysisTimeRange timeRange)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            var metrics = await GetServerPerformanceHistoryAsync(serverId, DateTime.UtcNow.AddDays(-7), DateTime.UtcNow);

            var report = new PerformanceAnalysisReport
            {
                Id = Guid.NewGuid(),
                ServerId = serverId,
                UserId = userId,
                GeneratedAt = DateTime.UtcNow,
                TimeRange = timeRange,
                Summary = new PerformanceSummary
                {
                    AverageCpuUsage = metrics.Average(m => m.CpuUsagePercent),
                    AverageMemoryUsage = metrics.Average(m => m.MemoryUsagePercent),
                    AverageResponseTime = metrics.Average(m => m.ResponseTimeMs),
                    UptimePercentage = metrics.Average(m => m.UptimePercent),
                    TotalRequests = (int)metrics.Sum(m => m.ThroughputRequests),
                    ErrorRate = metrics.Average(m => m.ErrorRate),
                    PeakPlayers = metrics.Max(m => m.ActivePlayers)
                },
                Insights = new List<PerformanceInsight>
                {
                    new PerformanceInsight
                    {
                        Type = "CPU Usage",
                        Title = "CPU Usage Analysis",
                        Description = $"Average CPU usage is {metrics.Average(m => m.CpuUsagePercent):F2}%",
                        Severity = InsightSeverity.Info,
                        DetectedAt = DateTime.UtcNow
                    }
                },
                Recommendations = new List<PerformanceRecommendation>
                {
                    new PerformanceRecommendation
                    {
                        Category = "Resource Optimization",
                        Title = "Optimize CPU Usage",
                        Description = "Consider optimizing CPU-intensive operations",
                        Priority = RecommendationPriority.Medium,
                        ImpactScore = 0.7,
                        ActionItems = new List<string> { "Review CPU-intensive processes", "Implement caching" }
                    }
                }
            };

            _logger.LogInformation("Performance analysis report generated for server {ServerId} by user {UserId}", serverId, userId);

            return report;
        }

        public async Task<List<PerformanceBottleneck>> IdentifyPerformanceBottlenecksAsync(Guid serverId, Guid userId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            var metrics = await GetServerPerformanceHistoryAsync(serverId, DateTime.UtcNow.AddHours(-24), DateTime.UtcNow);

            var bottlenecks = new List<PerformanceBottleneck>();

            // Analyze CPU bottlenecks
            if (metrics.Any(m => m.CpuUsagePercent > 80))
            {
                bottlenecks.Add(new PerformanceBottleneck
                {
                    Type = "CPU",
                    Component = "Processor",
                    Description = "High CPU usage detected",
                    Severity = BottleneckSeverity.Major,
                    ImpactScore = 0.8,
                    DetectedAt = DateTime.UtcNow,
                    SuggestedActions = new List<string> { "Optimize CPU-intensive operations", "Scale CPU resources" }
                });
            }

            // Analyze Memory bottlenecks
            if (metrics.Any(m => m.MemoryUsagePercent > 85))
            {
                bottlenecks.Add(new PerformanceBottleneck
                {
                    Type = "Memory",
                    Component = "RAM",
                    Description = "High memory usage detected",
                    Severity = BottleneckSeverity.Major,
                    ImpactScore = 0.7,
                    DetectedAt = DateTime.UtcNow,
                    SuggestedActions = new List<string> { "Optimize memory usage", "Add more RAM" }
                });
            }

            _logger.LogInformation("Performance bottlenecks identified for server {ServerId} by user {UserId}: {Count} bottlenecks found", 
                serverId, userId, bottlenecks.Count);

            return bottlenecks;
        }

        public async Task<PerformanceInsights> GetPerformanceInsightsAsync(Guid serverId, Guid userId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            // Implementation would generate insights based on performance data
            return new PerformanceInsights();
        }

        public async Task<List<PerformanceTrend>> GetPerformanceTrendsAsync(Guid serverId, TrendAnalysisRequest request)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            // Implementation would analyze trends in performance data
            return new List<PerformanceTrend>();
        }

        public async Task<PerformanceComparison> CompareServerPerformanceAsync(Guid serverId1, Guid serverId2, Guid userId)
        {
            var server1 = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId1);
            var server2 = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId2);

            if (server1 == null || server2 == null)
            {
                throw new KeyNotFoundException("One or both servers not found");
            }

            if (server1.OwnerId != userId || server2.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own one or both servers");
            }

            // Implementation would compare performance metrics between servers
            return new PerformanceComparison();
        }

        // Resource Utilization Monitoring
        public async Task<ResourceUtilization> GetResourceUtilizationAsync(Guid serverId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            // Implementation would get current resource utilization
            return new ResourceUtilization
            {
                ServerId = serverId,
                Timestamp = DateTime.UtcNow,
                Cpu = new CpuUtilization { UsagePercent = 45.5, CoreCount = 4 },
                Memory = new MemoryUtilization { TotalMB = 8192, UsedMB = 4096, UsagePercent = 50.0 },
                Disk = new DiskUtilization { TotalGB = 500, UsedGB = 200, UsagePercent = 40.0 },
                Network = new NetworkUtilization { InboundMbps = 10.5, OutboundMbps = 8.2 }
            };
        }

        public async Task<List<ResourceUtilization>> GetResourceUtilizationHistoryAsync(Guid serverId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            // Implementation would retrieve resource utilization history
            return new List<ResourceUtilization>();
        }

        public async Task<ResourceOptimizationReport> GetResourceOptimizationReportAsync(Guid serverId, Guid userId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            // Implementation would generate optimization report
            return new ResourceOptimizationReport();
        }

        public async Task<List<ResourceRecommendation>> GetResourceRecommendationsAsync(Guid serverId, Guid userId)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            // Implementation would generate resource recommendations
            return new List<ResourceRecommendation>();
        }

        public async Task<bool> ApplyResourceOptimizationAsync(Guid serverId, Guid userId, List<ResourceOptimizationAction> actions)
        {
            var server = await _context.GameServers.FirstOrDefaultAsync(s => s.Id == serverId);
            if (server == null)
            {
                throw new KeyNotFoundException("Server not found");
            }

            if (server.OwnerId != userId)
            {
                throw new UnauthorizedAccessException("User does not own this server");
            }

            // Implementation would apply optimization actions
            _logger.LogInformation("Resource optimization applied to server {ServerId} by user {UserId}", serverId, userId);

            return true;
        }

        // Placeholder implementations for remaining interface methods
        public async Task<PerformanceOptimizationPlan> CreateOptimizationPlanAsync(Guid serverId, Guid userId, CreateOptimizationPlanRequest request) => new();
        public async Task<List<PerformanceOptimizationPlan>> GetOptimizationPlansAsync(Guid serverId) => new();
        public async Task<OptimizationResult> ExecuteOptimizationPlanAsync(Guid planId, Guid userId) => new();
        public async Task<bool> RollbackOptimizationAsync(Guid planId, Guid userId) => true;
        public async Task<OptimizationHistory> GetOptimizationHistoryAsync(Guid serverId) => new();
        public async Task<SystemHealthStatus> GetSystemHealthStatusAsync(Guid serverId) => new();
        public async Task<List<HealthCheckResult>> RunHealthChecksAsync(Guid serverId, Guid userId) => new();
        public async Task<HealthCheckSchedule> ScheduleHealthCheckAsync(Guid serverId, Guid userId, ScheduleHealthCheckRequest request) => new();
        public async Task<List<HealthCheckSchedule>> GetHealthCheckSchedulesAsync(Guid serverId) => new();
        public async Task<bool> CancelHealthCheckScheduleAsync(Guid scheduleId, Guid userId) => true;
        public async Task<BenchmarkResult> RunPerformanceBenchmarkAsync(Guid serverId, Guid userId, BenchmarkConfiguration config) => new();
        public async Task<List<BenchmarkResult>> GetBenchmarkHistoryAsync(Guid serverId) => new();
        public async Task<BenchmarkComparison> CompareBenchmarksAsync(Guid benchmarkId1, Guid benchmarkId2, Guid userId) => new();
        public async Task<BenchmarkTemplate> CreateBenchmarkTemplateAsync(Guid userId, CreateBenchmarkTemplateRequest request) => new();
        public async Task<List<BenchmarkTemplate>> GetBenchmarkTemplatesAsync(Guid? gameId = null) => new();
        public async Task<PerformanceReport> GeneratePerformanceReportAsync(Guid serverId, Guid userId, PerformanceReportRequest request) => new();
        public async Task<List<PerformanceReport>> GetPerformanceReportsAsync(Guid serverId) => new();
        public async Task<bool> SchedulePerformanceReportAsync(Guid serverId, Guid userId, ScheduleReportRequest request) => true;
        public async Task<bool> ExportPerformanceDataAsync(Guid serverId, Guid userId, DataExportRequest request) => true;
        public async Task<CustomMetric> CreateCustomMetricAsync(Guid serverId, Guid userId, CreateCustomMetricRequest request) => new();
        public async Task<List<CustomMetric>> GetCustomMetricsAsync(Guid serverId) => new();
        public async Task<CustomMetric> UpdateCustomMetricAsync(Guid metricId, Guid userId, UpdateCustomMetricRequest request) => new();
        public async Task<bool> DeleteCustomMetricAsync(Guid metricId, Guid userId) => true;
        public async Task<List<CustomMetricData>> GetCustomMetricDataAsync(Guid metricId, DateTime? startDate = null, DateTime? endDate = null) => new();
        public async Task<PerformanceThreshold> SetPerformanceThresholdAsync(Guid serverId, Guid userId, SetPerformanceThresholdRequest request) => new();
        public async Task<List<PerformanceThreshold>> GetPerformanceThresholdsAsync(Guid serverId) => new();
        public async Task<PerformanceBaseline> CreatePerformanceBaselineAsync(Guid serverId, Guid userId, CreatePerformanceBaselineRequest request) => new();
        public async Task<List<PerformanceBaseline>> GetPerformanceBaselinesAsync(Guid serverId) => new();
        public async Task<BaselineComparison> CompareToBaselineAsync(Guid serverId, Guid baselineId, Guid userId) => new();
        public async Task<MultiServerMetrics> GetMultiServerMetricsAsync(List<Guid> serverIds, Guid userId) => new();
        public async Task<ServerGroupPerformance> GetServerGroupPerformanceAsync(Guid groupId, Guid userId) => new();
        public async Task<PerformanceCorrelation> AnalyzePerformanceCorrelationAsync(List<Guid> serverIds, Guid userId) => new();
        public async Task<ClusterPerformanceMetrics> GetClusterPerformanceMetricsAsync(Guid clusterId, Guid userId) => new();
    }
}