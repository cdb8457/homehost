using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HomeHost.CloudApi.Services;
using HomeHost.CloudApi.Models;
using System.Security.Claims;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PerformanceMonitoringController : ControllerBase
    {
        private readonly IPerformanceMonitoringService _performanceMonitoringService;
        private readonly ILogger<PerformanceMonitoringController> _logger;

        public PerformanceMonitoringController(
            IPerformanceMonitoringService performanceMonitoringService,
            ILogger<PerformanceMonitoringController> logger)
        {
            _performanceMonitoringService = performanceMonitoringService;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID");
            }
            return userId;
        }

        // Server Performance Monitoring
        [HttpGet("servers/{serverId}/metrics")]
        public async Task<ActionResult<ServerPerformanceMetrics>> GetServerPerformanceMetrics(Guid serverId)
        {
            try
            {
                var metrics = await _performanceMonitoringService.GetServerPerformanceMetricsAsync(serverId);
                return Ok(metrics);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance metrics for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/metrics/history")]
        public async Task<ActionResult<List<ServerPerformanceMetrics>>> GetServerPerformanceHistory(
            Guid serverId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var history = await _performanceMonitoringService.GetServerPerformanceHistoryAsync(serverId, startDate, endDate);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance history for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/snapshots")]
        public async Task<ActionResult<ServerPerformanceSnapshot>> CreatePerformanceSnapshot(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var snapshot = await _performanceMonitoringService.CreatePerformanceSnapshotAsync(serverId, userId);
                return Ok(snapshot);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating performance snapshot for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/snapshots")]
        public async Task<ActionResult<List<ServerPerformanceSnapshot>>> GetPerformanceSnapshots(Guid serverId)
        {
            try
            {
                var snapshots = await _performanceMonitoringService.GetPerformanceSnapshotsAsync(serverId);
                return Ok(snapshots);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance snapshots for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("snapshots/{snapshotId}")]
        public async Task<ActionResult> DeletePerformanceSnapshot(Guid snapshotId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.DeletePerformanceSnapshotAsync(snapshotId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting performance snapshot {SnapshotId}", snapshotId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Real-time Performance Monitoring
        [HttpGet("servers/{serverId}/realtime")]
        public async Task<ActionResult<RealTimeMetrics>> GetRealTimeMetrics(Guid serverId)
        {
            try
            {
                var metrics = await _performanceMonitoringService.GetRealTimeMetricsAsync(serverId);
                return Ok(metrics);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time metrics for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/monitoring/start")]
        public async Task<ActionResult> StartRealTimeMonitoring(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.StartRealTimeMonitoringAsync(serverId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting real-time monitoring for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/monitoring/stop")]
        public async Task<ActionResult> StopRealTimeMonitoring(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.StopRealTimeMonitoringAsync(serverId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping real-time monitoring for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/alerts/active")]
        public async Task<ActionResult<List<MetricAlert>>> GetActiveAlerts(Guid serverId)
        {
            try
            {
                var alerts = await _performanceMonitoringService.GetActiveAlertsAsync(serverId);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active alerts for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("alerts/{alertId}/acknowledge")]
        public async Task<ActionResult> AcknowledgeAlert(Guid alertId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.AcknowledgeAlertAsync(alertId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error acknowledging alert {AlertId}", alertId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Performance Alerts & Notifications
        [HttpPost("servers/{serverId}/alerts")]
        public async Task<ActionResult<PerformanceAlert>> CreatePerformanceAlert(Guid serverId, CreatePerformanceAlertRequest request)
        {
            try
            {
                var userId = GetUserId();
                var alert = await _performanceMonitoringService.CreatePerformanceAlertAsync(serverId, userId, request);
                return Ok(alert);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating performance alert for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/alerts")]
        public async Task<ActionResult<List<PerformanceAlert>>> GetPerformanceAlerts(Guid serverId)
        {
            try
            {
                var alerts = await _performanceMonitoringService.GetPerformanceAlertsAsync(serverId);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance alerts for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("alerts/{alertId}")]
        public async Task<ActionResult<PerformanceAlert>> UpdatePerformanceAlert(Guid alertId, UpdatePerformanceAlertRequest request)
        {
            try
            {
                var userId = GetUserId();
                var alert = await _performanceMonitoringService.UpdatePerformanceAlertAsync(alertId, userId, request);
                return Ok(alert);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating performance alert {AlertId}", alertId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("alerts/{alertId}")]
        public async Task<ActionResult> DeletePerformanceAlert(Guid alertId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.DeletePerformanceAlertAsync(alertId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting performance alert {AlertId}", alertId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("alerts/{alertId}/enable")]
        public async Task<ActionResult> EnablePerformanceAlert(Guid alertId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.EnablePerformanceAlertAsync(alertId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling performance alert {AlertId}", alertId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("alerts/{alertId}/disable")]
        public async Task<ActionResult> DisablePerformanceAlert(Guid alertId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.DisablePerformanceAlertAsync(alertId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling performance alert {AlertId}", alertId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Performance Analysis & Insights
        [HttpPost("servers/{serverId}/analyze")]
        public async Task<ActionResult<PerformanceAnalysisReport>> AnalyzeServerPerformance(Guid serverId, [FromBody] AnalyzePerformanceRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _performanceMonitoringService.AnalyzeServerPerformanceAsync(serverId, userId, request.TimeRange);
                return Ok(report);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing server performance for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/bottlenecks")]
        public async Task<ActionResult<List<PerformanceBottleneck>>> IdentifyPerformanceBottlenecks(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var bottlenecks = await _performanceMonitoringService.IdentifyPerformanceBottlenecksAsync(serverId, userId);
                return Ok(bottlenecks);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error identifying performance bottlenecks for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/insights")]
        public async Task<ActionResult<PerformanceInsights>> GetPerformanceInsights(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var insights = await _performanceMonitoringService.GetPerformanceInsightsAsync(serverId, userId);
                return Ok(insights);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance insights for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/trends")]
        public async Task<ActionResult<List<PerformanceTrend>>> GetPerformanceTrends(Guid serverId, [FromBody] TrendAnalysisRequest request)
        {
            try
            {
                var trends = await _performanceMonitoringService.GetPerformanceTrendsAsync(serverId, request);
                return Ok(trends);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance trends for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/compare")]
        public async Task<ActionResult<PerformanceComparison>> CompareServerPerformance([FromBody] CompareServersRequest request)
        {
            try
            {
                var userId = GetUserId();
                var comparison = await _performanceMonitoringService.CompareServerPerformanceAsync(request.ServerId1, request.ServerId2, userId);
                return Ok(comparison);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing server performance between {ServerId1} and {ServerId2}", request.ServerId1, request.ServerId2);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Resource Utilization Monitoring
        [HttpGet("servers/{serverId}/resources")]
        public async Task<ActionResult<ResourceUtilization>> GetResourceUtilization(Guid serverId)
        {
            try
            {
                var utilization = await _performanceMonitoringService.GetResourceUtilizationAsync(serverId);
                return Ok(utilization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource utilization for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/resources/history")]
        public async Task<ActionResult<List<ResourceUtilization>>> GetResourceUtilizationHistory(
            Guid serverId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var history = await _performanceMonitoringService.GetResourceUtilizationHistoryAsync(serverId, startDate, endDate);
                return Ok(history);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource utilization history for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/optimization-report")]
        public async Task<ActionResult<ResourceOptimizationReport>> GetResourceOptimizationReport(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var report = await _performanceMonitoringService.GetResourceOptimizationReportAsync(serverId, userId);
                return Ok(report);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource optimization report for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/recommendations")]
        public async Task<ActionResult<List<ResourceRecommendation>>> GetResourceRecommendations(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var recommendations = await _performanceMonitoringService.GetResourceRecommendationsAsync(serverId, userId);
                return Ok(recommendations);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource recommendations for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/optimize")]
        public async Task<ActionResult> ApplyResourceOptimization(Guid serverId, [FromBody] List<ResourceOptimizationAction> actions)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.ApplyResourceOptimizationAsync(serverId, userId, actions);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying resource optimization for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Performance Optimization Plans
        [HttpPost("servers/{serverId}/optimization-plans")]
        public async Task<ActionResult<PerformanceOptimizationPlan>> CreateOptimizationPlan(Guid serverId, CreateOptimizationPlanRequest request)
        {
            try
            {
                var userId = GetUserId();
                var plan = await _performanceMonitoringService.CreateOptimizationPlanAsync(serverId, userId, request);
                return Ok(plan);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating optimization plan for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/optimization-plans")]
        public async Task<ActionResult<List<PerformanceOptimizationPlan>>> GetOptimizationPlans(Guid serverId)
        {
            try
            {
                var plans = await _performanceMonitoringService.GetOptimizationPlansAsync(serverId);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization plans for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("optimization-plans/{planId}/execute")]
        public async Task<ActionResult<OptimizationResult>> ExecuteOptimizationPlan(Guid planId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _performanceMonitoringService.ExecuteOptimizationPlanAsync(planId, userId);
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing optimization plan {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("optimization-plans/{planId}/rollback")]
        public async Task<ActionResult> RollbackOptimization(Guid planId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.RollbackOptimizationAsync(planId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back optimization plan {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/optimization-history")]
        public async Task<ActionResult<OptimizationHistory>> GetOptimizationHistory(Guid serverId)
        {
            try
            {
                var history = await _performanceMonitoringService.GetOptimizationHistoryAsync(serverId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization history for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // System Health Monitoring
        [HttpGet("servers/{serverId}/health")]
        public async Task<ActionResult<SystemHealthStatus>> GetSystemHealthStatus(Guid serverId)
        {
            try
            {
                var status = await _performanceMonitoringService.GetSystemHealthStatusAsync(serverId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system health status for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/health-checks")]
        public async Task<ActionResult<List<HealthCheckResult>>> RunHealthChecks(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var results = await _performanceMonitoringService.RunHealthChecksAsync(serverId, userId);
                return Ok(results);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running health checks for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/health-check-schedules")]
        public async Task<ActionResult<HealthCheckSchedule>> ScheduleHealthCheck(Guid serverId, ScheduleHealthCheckRequest request)
        {
            try
            {
                var userId = GetUserId();
                var schedule = await _performanceMonitoringService.ScheduleHealthCheckAsync(serverId, userId, request);
                return Ok(schedule);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling health check for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/health-check-schedules")]
        public async Task<ActionResult<List<HealthCheckSchedule>>> GetHealthCheckSchedules(Guid serverId)
        {
            try
            {
                var schedules = await _performanceMonitoringService.GetHealthCheckSchedulesAsync(serverId);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting health check schedules for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("health-check-schedules/{scheduleId}")]
        public async Task<ActionResult> CancelHealthCheckSchedule(Guid scheduleId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _performanceMonitoringService.CancelHealthCheckScheduleAsync(scheduleId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling health check schedule {ScheduleId}", scheduleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Performance Benchmarking
        [HttpPost("servers/{serverId}/benchmarks")]
        public async Task<ActionResult<BenchmarkResult>> RunPerformanceBenchmark(Guid serverId, [FromBody] BenchmarkConfiguration config)
        {
            try
            {
                var userId = GetUserId();
                var result = await _performanceMonitoringService.RunPerformanceBenchmarkAsync(serverId, userId, config);
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running performance benchmark for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/benchmarks")]
        public async Task<ActionResult<List<BenchmarkResult>>> GetBenchmarkHistory(Guid serverId)
        {
            try
            {
                var history = await _performanceMonitoringService.GetBenchmarkHistoryAsync(serverId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting benchmark history for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("benchmarks/compare")]
        public async Task<ActionResult<BenchmarkComparison>> CompareBenchmarks([FromBody] CompareBenchmarksRequest request)
        {
            try
            {
                var userId = GetUserId();
                var comparison = await _performanceMonitoringService.CompareBenchmarksAsync(request.BenchmarkId1, request.BenchmarkId2, userId);
                return Ok(comparison);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing benchmarks {BenchmarkId1} and {BenchmarkId2}", request.BenchmarkId1, request.BenchmarkId2);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Benchmark Templates
        [HttpPost("benchmark-templates")]
        public async Task<ActionResult<BenchmarkTemplate>> CreateBenchmarkTemplate(CreateBenchmarkTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var template = await _performanceMonitoringService.CreateBenchmarkTemplateAsync(userId, request);
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating benchmark template");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("benchmark-templates")]
        public async Task<ActionResult<List<BenchmarkTemplate>>> GetBenchmarkTemplates([FromQuery] Guid? gameId = null)
        {
            try
            {
                var templates = await _performanceMonitoringService.GetBenchmarkTemplatesAsync(gameId);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting benchmark templates");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTOs
    public class AnalyzePerformanceRequest
    {
        public AnalysisTimeRange TimeRange { get; set; } = new();
    }

    public class CompareServersRequest
    {
        public Guid ServerId1 { get; set; }
        public Guid ServerId2 { get; set; }
    }

    public class CompareBenchmarksRequest
    {
        public Guid BenchmarkId1 { get; set; }
        public Guid BenchmarkId2 { get; set; }
    }
}