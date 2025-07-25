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
    public class BusinessIntelligenceController : ControllerBase
    {
        private readonly IBusinessIntelligenceService _businessIntelligenceService;
        private readonly ILogger<BusinessIntelligenceController> _logger;

        public BusinessIntelligenceController(
            IBusinessIntelligenceService businessIntelligenceService,
            ILogger<BusinessIntelligenceController> logger)
        {
            _businessIntelligenceService = businessIntelligenceService;
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

        // Dashboard Analytics
        [HttpGet("organizations/{organizationId}/dashboard/analytics")]
        public async Task<ActionResult<DashboardAnalytics>> GetDashboardAnalytics(Guid organizationId, [FromQuery] DashboardAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _businessIntelligenceService.GetDashboardAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/dashboard/widgets")]
        public async Task<ActionResult<List<DashboardWidget>>> GetDashboardWidgets(Guid organizationId)
        {
            try
            {
                var userId = GetUserId();
                var widgets = await _businessIntelligenceService.GetDashboardWidgetsAsync(organizationId, userId);
                return Ok(widgets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard widgets for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/dashboard/widgets")]
        public async Task<ActionResult<DashboardWidget>> CreateDashboardWidget(Guid organizationId, CreateDashboardWidgetRequest request)
        {
            try
            {
                var userId = GetUserId();
                var widget = await _businessIntelligenceService.CreateDashboardWidgetAsync(organizationId, userId, request);
                return Ok(widget);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating dashboard widget for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("dashboard/widgets/{widgetId}")]
        public async Task<ActionResult<DashboardWidget>> UpdateDashboardWidget(Guid widgetId, UpdateDashboardWidgetRequest request)
        {
            try
            {
                var userId = GetUserId();
                var widget = await _businessIntelligenceService.UpdateDashboardWidgetAsync(widgetId, userId, request);
                return Ok(widget);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating dashboard widget {WidgetId}", widgetId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("dashboard/widgets/{widgetId}")]
        public async Task<ActionResult> DeleteDashboardWidget(Guid widgetId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _businessIntelligenceService.DeleteDashboardWidgetAsync(widgetId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting dashboard widget {WidgetId}", widgetId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("dashboard/templates")]
        public async Task<ActionResult<List<DashboardTemplate>>> GetDashboardTemplates([FromQuery] DashboardTemplateFilter? filter = null)
        {
            try
            {
                var templates = await _businessIntelligenceService.GetDashboardTemplatesAsync(filter);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard templates");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/dashboard/from-template/{templateId}")]
        public async Task<ActionResult<Dashboard>> CreateDashboardFromTemplate(Guid organizationId, Guid templateId)
        {
            try
            {
                var userId = GetUserId();
                var dashboard = await _businessIntelligenceService.CreateDashboardFromTemplateAsync(organizationId, userId, templateId);
                return Ok(dashboard);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating dashboard from template {TemplateId} for organization {OrganizationId}", templateId, organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Gaming Analytics
        [HttpGet("organizations/{organizationId}/analytics/gaming")]
        public async Task<ActionResult<GameAnalytics>> GetGameAnalytics(Guid organizationId, [FromQuery] GameAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _businessIntelligenceService.GetGameAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/gaming/performance")]
        public async Task<ActionResult<List<GamePerformanceMetric>>> GetGamePerformanceMetrics(Guid organizationId, [FromQuery] GamePerformanceFilter filter)
        {
            try
            {
                var metrics = await _businessIntelligenceService.GetGamePerformanceMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game performance metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/gaming/player-behavior")]
        public async Task<ActionResult<PlayerBehaviorAnalytics>> GetPlayerBehaviorAnalytics(Guid organizationId, [FromQuery] PlayerBehaviorFilter filter)
        {
            try
            {
                var analytics = await _businessIntelligenceService.GetPlayerBehaviorAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player behavior analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/gaming/sessions")]
        public async Task<ActionResult<List<GameSessionAnalytics>>> GetGameSessionAnalytics(Guid organizationId, [FromQuery] GameSessionFilter filter)
        {
            try
            {
                var analytics = await _businessIntelligenceService.GetGameSessionAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game session analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/gaming/server-utilization")]
        public async Task<ActionResult<GameServerUtilization>> GetGameServerUtilization(Guid organizationId, [FromQuery] ServerUtilizationFilter filter)
        {
            try
            {
                var utilization = await _businessIntelligenceService.GetGameServerUtilizationAsync(organizationId, filter);
                return Ok(utilization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game server utilization for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/gaming/popular-games")]
        public async Task<ActionResult<List<PopularGame>>> GetPopularGames(Guid organizationId, [FromQuery] PopularGamesFilter filter)
        {
            try
            {
                var games = await _businessIntelligenceService.GetPopularGamesAsync(organizationId, filter);
                return Ok(games);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular games for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/gaming/trends")]
        public async Task<ActionResult<GameTrendAnalysis>> GetGameTrendAnalysis(Guid organizationId, [FromQuery] GameTrendFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetGameTrendAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game trend analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // User Analytics
        [HttpGet("organizations/{organizationId}/analytics/users")]
        public async Task<ActionResult<UserAnalytics>> GetUserAnalytics(Guid organizationId, [FromQuery] UserAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _businessIntelligenceService.GetUserAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/users/engagement")]
        public async Task<ActionResult<List<UserEngagementMetric>>> GetUserEngagementMetrics(Guid organizationId, [FromQuery] UserEngagementFilter filter)
        {
            try
            {
                var metrics = await _businessIntelligenceService.GetUserEngagementMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user engagement metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/users/retention")]
        public async Task<ActionResult<UserRetentionAnalysis>> GetUserRetentionAnalysis(Guid organizationId, [FromQuery] UserRetentionFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetUserRetentionAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user retention analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/users/segments")]
        public async Task<ActionResult<List<UserSegment>>> GetUserSegments(Guid organizationId, [FromQuery] UserSegmentFilter? filter = null)
        {
            try
            {
                var segments = await _businessIntelligenceService.GetUserSegmentsAsync(organizationId, filter);
                return Ok(segments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user segments for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/users/segments")]
        public async Task<ActionResult<UserSegment>> CreateUserSegment(Guid organizationId, CreateUserSegmentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var segment = await _businessIntelligenceService.CreateUserSegmentAsync(organizationId, userId, request);
                return Ok(segment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user segment for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/users/lifetime-value")]
        public async Task<ActionResult<UserLifetimeValue>> GetUserLifetimeValue(Guid organizationId, [FromQuery] UserLifetimeValueFilter filter)
        {
            try
            {
                var ltv = await _businessIntelligenceService.GetUserLifetimeValueAsync(organizationId, filter);
                return Ok(ltv);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user lifetime value for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/users/churn")]
        public async Task<ActionResult<UserChurnAnalysis>> GetUserChurnAnalysis(Guid organizationId, [FromQuery] UserChurnFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetUserChurnAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user churn analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Performance Analytics
        [HttpGet("organizations/{organizationId}/analytics/performance")]
        public async Task<ActionResult<PerformanceAnalytics>> GetPerformanceAnalytics(Guid organizationId, [FromQuery] PerformanceAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _businessIntelligenceService.GetPerformanceAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/performance/system-health")]
        public async Task<ActionResult<List<SystemHealthMetric>>> GetSystemHealthMetrics(Guid organizationId, [FromQuery] SystemHealthFilter filter)
        {
            try
            {
                var metrics = await _businessIntelligenceService.GetSystemHealthMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting system health metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/performance/resource-utilization")]
        public async Task<ActionResult<ResourceUtilization>> GetResourceUtilization(Guid organizationId, [FromQuery] ResourceUtilizationFilter filter)
        {
            try
            {
                var utilization = await _businessIntelligenceService.GetResourceUtilizationAsync(organizationId, filter);
                return Ok(utilization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource utilization for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/performance/alerts")]
        public async Task<ActionResult<List<PerformanceAlert>>> GetPerformanceAlerts(Guid organizationId, [FromQuery] PerformanceAlertFilter? filter = null)
        {
            try
            {
                var alerts = await _businessIntelligenceService.GetPerformanceAlertsAsync(organizationId, filter);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance alerts for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/performance/server-load")]
        public async Task<ActionResult<ServerLoadAnalysis>> GetServerLoadAnalysis(Guid organizationId, [FromQuery] ServerLoadFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetServerLoadAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server load analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/performance/network-latency")]
        public async Task<ActionResult<NetworkLatencyAnalysis>> GetNetworkLatencyAnalysis(Guid organizationId, [FromQuery] NetworkLatencyFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetNetworkLatencyAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting network latency analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Financial Analytics
        [HttpGet("organizations/{organizationId}/analytics/financial")]
        public async Task<ActionResult<FinancialAnalytics>> GetFinancialAnalytics(Guid organizationId, [FromQuery] FinancialAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _businessIntelligenceService.GetFinancialAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/financial/revenue-breakdown")]
        public async Task<ActionResult<RevenueBreakdown>> GetRevenueBreakdown(Guid organizationId, [FromQuery] RevenueBreakdownFilter filter)
        {
            try
            {
                var breakdown = await _businessIntelligenceService.GetRevenueBreakdownAsync(organizationId, filter);
                return Ok(breakdown);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue breakdown for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/financial/cost-analysis")]
        public async Task<ActionResult<CostAnalysis>> GetCostAnalysis(Guid organizationId, [FromQuery] CostAnalysisFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetCostAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cost analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/financial/profitability")]
        public async Task<ActionResult<ProfitabilityAnalysis>> GetProfitabilityAnalysis(Guid organizationId, [FromQuery] ProfitabilityFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetProfitabilityAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting profitability analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/financial/trends")]
        public async Task<ActionResult<List<FinancialTrend>>> GetFinancialTrends(Guid organizationId, [FromQuery] FinancialTrendFilter filter)
        {
            try
            {
                var trends = await _businessIntelligenceService.GetFinancialTrendsAsync(organizationId, filter);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial trends for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/financial/budget")]
        public async Task<ActionResult<BudgetAnalysis>> GetBudgetAnalysis(Guid organizationId, [FromQuery] BudgetAnalysisFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetBudgetAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting budget analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/financial/forecast")]
        public async Task<ActionResult<FinancialForecast>> GetFinancialForecast(Guid organizationId, [FromQuery] FinancialForecastFilter filter)
        {
            try
            {
                var forecast = await _businessIntelligenceService.GetFinancialForecastAsync(organizationId, filter);
                return Ok(forecast);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting financial forecast for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Custom Reports
        [HttpPost("organizations/{organizationId}/reports/custom")]
        public async Task<ActionResult<CustomReport>> CreateCustomReport(Guid organizationId, CreateCustomReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _businessIntelligenceService.CreateCustomReportAsync(organizationId, userId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating custom report for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/reports/custom")]
        public async Task<ActionResult<List<CustomReport>>> GetCustomReports(Guid organizationId, [FromQuery] CustomReportFilter? filter = null)
        {
            try
            {
                var reports = await _businessIntelligenceService.GetCustomReportsAsync(organizationId, filter);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting custom reports for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("reports/custom/{reportId}")]
        public async Task<ActionResult<CustomReport>> GetCustomReport(Guid reportId)
        {
            try
            {
                var report = await _businessIntelligenceService.GetCustomReportAsync(reportId);
                return Ok(report);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting custom report {ReportId}", reportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("reports/custom/{reportId}")]
        public async Task<ActionResult<CustomReport>> UpdateCustomReport(Guid reportId, UpdateCustomReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _businessIntelligenceService.UpdateCustomReportAsync(reportId, userId, request);
                return Ok(report);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating custom report {ReportId}", reportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("reports/custom/{reportId}")]
        public async Task<ActionResult> DeleteCustomReport(Guid reportId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _businessIntelligenceService.DeleteCustomReportAsync(reportId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting custom report {ReportId}", reportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reports/custom/{reportId}/execute")]
        public async Task<ActionResult<ReportExecution>> ExecuteCustomReport(Guid reportId, ReportExecutionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var execution = await _businessIntelligenceService.ExecuteCustomReportAsync(reportId, userId, request);
                return Ok(execution);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing custom report {ReportId}", reportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("reports/custom/{reportId}/executions")]
        public async Task<ActionResult<List<ReportExecution>>> GetReportExecutions(Guid reportId, [FromQuery] ReportExecutionFilter? filter = null)
        {
            try
            {
                var executions = await _businessIntelligenceService.GetReportExecutionsAsync(reportId, filter);
                return Ok(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report executions for report {ReportId}", reportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reports/custom/{reportId}/schedule")]
        public async Task<ActionResult> ScheduleCustomReport(Guid reportId, ScheduleReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _businessIntelligenceService.ScheduleCustomReportAsync(reportId, userId, request);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling custom report {ReportId}", reportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Data Export
        [HttpPost("organizations/{organizationId}/data/export")]
        public async Task<ActionResult<DataExport>> CreateDataExport(Guid organizationId, CreateDataExportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var export = await _businessIntelligenceService.CreateDataExportAsync(organizationId, userId, request);
                return Ok(export);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating data export for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/data/exports")]
        public async Task<ActionResult<List<DataExport>>> GetDataExports(Guid organizationId, [FromQuery] DataExportFilter? filter = null)
        {
            try
            {
                var exports = await _businessIntelligenceService.GetDataExportsAsync(organizationId, filter);
                return Ok(exports);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data exports for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("data/exports/{exportId}")]
        public async Task<ActionResult<DataExport>> GetDataExport(Guid exportId)
        {
            try
            {
                var export = await _businessIntelligenceService.GetDataExportAsync(exportId);
                return Ok(export);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data export {ExportId}", exportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("data/exports/{exportId}/cancel")]
        public async Task<ActionResult> CancelDataExport(Guid exportId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _businessIntelligenceService.CancelDataExportAsync(exportId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling data export {ExportId}", exportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("data/exports/{exportId}/download")]
        public async Task<ActionResult> DownloadDataExport(Guid exportId)
        {
            try
            {
                var userId = GetUserId();
                var data = await _businessIntelligenceService.DownloadDataExportAsync(exportId, userId);
                return File(data, "application/octet-stream", $"export_{exportId}.zip");
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading data export {ExportId}", exportId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("data/export-templates")]
        public async Task<ActionResult<List<ExportTemplate>>> GetExportTemplates([FromQuery] ExportTemplateFilter? filter = null)
        {
            try
            {
                var templates = await _businessIntelligenceService.GetExportTemplatesAsync(filter);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting export templates");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Real-time Analytics
        [HttpGet("organizations/{organizationId}/analytics/realtime")]
        public async Task<ActionResult<RealTimeMetrics>> GetRealTimeMetrics(Guid organizationId, [FromQuery] RealTimeMetricsFilter filter)
        {
            try
            {
                var metrics = await _businessIntelligenceService.GetRealTimeMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/realtime/sessions")]
        public async Task<ActionResult<List<LivePlayerSession>>> GetLivePlayerSessions(Guid organizationId, [FromQuery] LiveSessionFilter? filter = null)
        {
            try
            {
                var sessions = await _businessIntelligenceService.GetLivePlayerSessionsAsync(organizationId, filter);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live player sessions for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/realtime/server-status")]
        public async Task<ActionResult<ServerStatusSnapshot>> GetServerStatusSnapshot(Guid organizationId)
        {
            try
            {
                var snapshot = await _businessIntelligenceService.GetServerStatusSnapshotAsync(organizationId);
                return Ok(snapshot);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server status snapshot for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/realtime/events")]
        public async Task<ActionResult<List<ActiveEvent>>> GetActiveEvents(Guid organizationId, [FromQuery] ActiveEventFilter? filter = null)
        {
            try
            {
                var events = await _businessIntelligenceService.GetActiveEventsAsync(organizationId, filter);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active events for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/realtime/alerts")]
        public async Task<ActionResult<RealTimeAlert>> CreateRealTimeAlert(Guid organizationId, CreateRealTimeAlertRequest request)
        {
            try
            {
                var userId = GetUserId();
                var alert = await _businessIntelligenceService.CreateRealTimeAlertAsync(organizationId, userId, request);
                return Ok(alert);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating real-time alert for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/realtime/alerts")]
        public async Task<ActionResult<List<RealTimeAlert>>> GetRealTimeAlerts(Guid organizationId, [FromQuery] RealTimeAlertFilter? filter = null)
        {
            try
            {
                var alerts = await _businessIntelligenceService.GetRealTimeAlertsAsync(organizationId, filter);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time alerts for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Machine Learning Insights
        [HttpGet("organizations/{organizationId}/analytics/ml/insights")]
        public async Task<ActionResult<MLInsights>> GetMachineLearningInsights(Guid organizationId, [FromQuery] MLInsightsFilter filter)
        {
            try
            {
                var insights = await _businessIntelligenceService.GetMachineLearningInsightsAsync(organizationId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ML insights for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/ml/predictions")]
        public async Task<ActionResult<List<Prediction>>> GetPredictions(Guid organizationId, [FromQuery] PredictionFilter filter)
        {
            try
            {
                var predictions = await _businessIntelligenceService.GetPredictionsAsync(organizationId, filter);
                return Ok(predictions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting predictions for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/ml/anomaly-detection")]
        public async Task<ActionResult<AnomalyDetectionResult>> RunAnomalyDetection(Guid organizationId, AnomalyDetectionRequest request)
        {
            try
            {
                var result = await _businessIntelligenceService.RunAnomalyDetectionAsync(organizationId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running anomaly detection for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/ml/recommendations")]
        public async Task<ActionResult<List<Recommendation>>> GetRecommendations(Guid organizationId, [FromQuery] RecommendationFilter filter)
        {
            try
            {
                var recommendations = await _businessIntelligenceService.GetRecommendationsAsync(organizationId, filter);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommendations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("users/{userId}/analytics/ml/behavior-prediction")]
        public async Task<ActionResult<PlayerBehaviorPrediction>> PredictPlayerBehavior(Guid userId, PlayerBehaviorPredictionRequest request)
        {
            try
            {
                var prediction = await _businessIntelligenceService.PredictPlayerBehaviorAsync(userId, request);
                return Ok(prediction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting player behavior for user {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/ml/churn-prediction")]
        public async Task<ActionResult<ChurnPrediction>> PredictUserChurn(Guid organizationId, ChurnPredictionRequest request)
        {
            try
            {
                var prediction = await _businessIntelligenceService.PredictUserChurnAsync(organizationId, request);
                return Ok(prediction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting user churn for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/ml/revenue-forecasting")]
        public async Task<ActionResult<RevenueForecasting>> GetRevenueForecasting(Guid organizationId, RevenueForecastingRequest request)
        {
            try
            {
                var forecasting = await _businessIntelligenceService.GetRevenueForecastingAsync(organizationId, request);
                return Ok(forecasting);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue forecasting for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Additional endpoint categories would continue here...
        // For brevity, I'll add a few more key endpoints

        // Business Metrics
        [HttpGet("organizations/{organizationId}/analytics/business/metrics")]
        public async Task<ActionResult<BusinessMetrics>> GetBusinessMetrics(Guid organizationId, [FromQuery] BusinessMetricsFilter filter)
        {
            try
            {
                var metrics = await _businessIntelligenceService.GetBusinessMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting business metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/business/kpis")]
        public async Task<ActionResult<List<KPI>>> GetKPIs(Guid organizationId, [FromQuery] KPIFilter? filter = null)
        {
            try
            {
                var kpis = await _businessIntelligenceService.GetKPIsAsync(organizationId, filter);
                return Ok(kpis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting KPIs for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/business/kpis")]
        public async Task<ActionResult<KPI>> CreateKPI(Guid organizationId, CreateKPIRequest request)
        {
            try
            {
                var userId = GetUserId();
                var kpi = await _businessIntelligenceService.CreateKPIAsync(organizationId, userId, request);
                return Ok(kpi);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating KPI for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Advanced Analytics
        [HttpPost("organizations/{organizationId}/analytics/advanced/cohort")]
        public async Task<ActionResult<CohortAnalysis>> GetCohortAnalysis(Guid organizationId, CohortAnalysisRequest request)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetCohortAnalysisAsync(organizationId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cohort analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/advanced/funnel")]
        public async Task<ActionResult<FunnelAnalysis>> GetFunnelAnalysis(Guid organizationId, FunnelAnalysisRequest request)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetFunnelAnalysisAsync(organizationId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting funnel analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/advanced/attribution")]
        public async Task<ActionResult<AttributionAnalysis>> GetAttributionAnalysis(Guid organizationId, AttributionAnalysisRequest request)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetAttributionAnalysisAsync(organizationId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting attribution analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/advanced/geographic")]
        public async Task<ActionResult<GeographicAnalysis>> GetGeographicAnalysis(Guid organizationId, [FromQuery] GeographicAnalysisFilter filter)
        {
            try
            {
                var analysis = await _businessIntelligenceService.GetGeographicAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting geographic analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Optimization Insights
        [HttpGet("organizations/{organizationId}/analytics/optimization/insights")]
        public async Task<ActionResult<OptimizationInsights>> GetOptimizationInsights(Guid organizationId, [FromQuery] OptimizationFilter filter)
        {
            try
            {
                var insights = await _businessIntelligenceService.GetOptimizationInsightsAsync(organizationId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization insights for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/analytics/optimization/recommendations")]
        public async Task<ActionResult<List<OptimizationRecommendation>>> GetOptimizationRecommendations(Guid organizationId, [FromQuery] OptimizationRecommendationFilter filter)
        {
            try
            {
                var recommendations = await _businessIntelligenceService.GetOptimizationRecommendationsAsync(organizationId, filter);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization recommendations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/optimization/performance")]
        public async Task<ActionResult<PerformanceOptimization>> GetPerformanceOptimization(Guid organizationId, PerformanceOptimizationRequest request)
        {
            try
            {
                var optimization = await _businessIntelligenceService.GetPerformanceOptimizationAsync(organizationId, request);
                return Ok(optimization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance optimization for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/optimization/cost")]
        public async Task<ActionResult<CostOptimization>> GetCostOptimization(Guid organizationId, CostOptimizationRequest request)
        {
            try
            {
                var optimization = await _businessIntelligenceService.GetCostOptimizationAsync(organizationId, request);
                return Ok(optimization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cost optimization for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analytics/optimization/capacity-planning")]
        public async Task<ActionResult<CapacityPlanning>> GetCapacityPlanning(Guid organizationId, CapacityPlanningRequest request)
        {
            try
            {
                var planning = await _businessIntelligenceService.GetCapacityPlanningAsync(organizationId, request);
                return Ok(planning);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting capacity planning for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}