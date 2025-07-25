using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HomeHost.CloudApi.Services;
using HomeHost.CloudApi.Models;
using System.Security.Claims;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/communities/{communityId}/analytics")]
    [Authorize]
    public class CommunityAnalyticsController : ControllerBase
    {
        private readonly ICommunityAnalyticsService _analyticsService;
        private readonly ILogger<CommunityAnalyticsController> _logger;

        public CommunityAnalyticsController(ICommunityAnalyticsService analyticsService, ILogger<CommunityAnalyticsController> logger)
        {
            _analyticsService = analyticsService;
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

        // Core Analytics
        [HttpGet("dashboard")]
        public async Task<ActionResult<CommunityDashboard>> GetDashboard(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var dashboard = await _analyticsService.GetCommunityDashboardAsync(communityId, userId, timeframe);
                return Ok(dashboard);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community dashboard for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("metrics")]
        public async Task<ActionResult<CommunityMetrics>> GetMetrics(Guid communityId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var metrics = await _analyticsService.GetCommunityMetricsAsync(communityId, userId, startDate, endDate);
                return Ok(metrics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community metrics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("widgets")]
        public async Task<ActionResult<List<AnalyticsWidget>>> GetDashboardWidgets(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var widgets = await _analyticsService.GetDashboardWidgetsAsync(communityId, userId);
                return Ok(widgets);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard widgets for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("widgets/{widgetType}")]
        public async Task<ActionResult<AnalyticsWidget>> GetCustomWidget(Guid communityId, string widgetType, [FromBody] Dictionary<string, object> parameters)
        {
            try
            {
                var userId = GetUserId();
                var widget = await _analyticsService.GetCustomWidgetAsync(communityId, userId, widgetType, parameters);
                return Ok(widget);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting custom widget {WidgetType} for {CommunityId}", widgetType, communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Member Analytics
        [HttpGet("members")]
        public async Task<ActionResult<MemberAnalytics>> GetMemberAnalytics(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _analyticsService.GetMemberAnalyticsAsync(communityId, userId, timeframe);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member analytics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("members/engagement")]
        public async Task<ActionResult<List<MemberEngagementMetric>>> GetMemberEngagement(Guid communityId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var userId = GetUserId();
                var engagement = await _analyticsService.GetMemberEngagementAsync(communityId, userId, page, pageSize);
                return Ok(engagement);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member engagement for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("members/retention")]
        public async Task<ActionResult<MemberRetentionAnalysis>> GetMemberRetention(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var retention = await _analyticsService.GetMemberRetentionAsync(communityId, userId);
                return Ok(retention);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member retention for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("members/segments")]
        public async Task<ActionResult<List<MemberSegment>>> GetMemberSegments(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var segments = await _analyticsService.GetMemberSegmentsAsync(communityId, userId);
                return Ok(segments);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member segments for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("members/lifecycle")]
        public async Task<ActionResult<MemberLifecycleAnalysis>> GetMemberLifecycle(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var lifecycle = await _analyticsService.GetMemberLifecycleAsync(communityId, userId);
                return Ok(lifecycle);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting member lifecycle for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Growth Analytics
        [HttpGet("growth")]
        public async Task<ActionResult<GrowthAnalytics>> GetGrowthAnalytics(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _analyticsService.GetGrowthAnalyticsAsync(communityId, userId, timeframe);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting growth analytics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("growth/forecast")]
        public async Task<ActionResult<GrowthForecast>> GetGrowthForecast(Guid communityId, [FromQuery] int daysAhead = 30)
        {
            try
            {
                var userId = GetUserId();
                var forecast = await _analyticsService.GetGrowthForecastAsync(communityId, userId, daysAhead);
                return Ok(forecast);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting growth forecast for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("growth/drivers")]
        public async Task<ActionResult<List<GrowthDriver>>> GetGrowthDrivers(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var drivers = await _analyticsService.GetGrowthDriversAsync(communityId, userId);
                return Ok(drivers);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting growth drivers for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("growth/competitive")]
        public async Task<ActionResult<CompetitiveAnalysis>> GetCompetitiveAnalysis(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var analysis = await _analyticsService.GetCompetitiveAnalysisAsync(communityId, userId);
                return Ok(analysis);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting competitive analysis for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Engagement Analytics
        [HttpGet("engagement")]
        public async Task<ActionResult<EngagementAnalytics>> GetEngagementAnalytics(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _analyticsService.GetEngagementAnalyticsAsync(communityId, userId, timeframe);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting engagement analytics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("engagement/heatmap")]
        public async Task<ActionResult<List<ActivityHeatmap>>> GetActivityHeatmap(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Week)
        {
            try
            {
                var userId = GetUserId();
                var heatmap = await _analyticsService.GetActivityHeatmapAsync(communityId, userId, timeframe);
                return Ok(heatmap);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting activity heatmap for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("engagement/funnel")]
        public async Task<ActionResult<EngagementFunnel>> GetEngagementFunnel(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var funnel = await _analyticsService.GetEngagementFunnelAsync(communityId, userId);
                return Ok(funnel);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting engagement funnel for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("engagement/content")]
        public async Task<ActionResult<List<ContentPerformance>>> GetContentPerformance(Guid communityId, [FromQuery] ContentType contentType, [FromQuery] int limit = 20)
        {
            try
            {
                var userId = GetUserId();
                var performance = await _analyticsService.GetContentPerformanceAsync(communityId, userId, contentType, limit);
                return Ok(performance);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content performance for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Server Analytics
        [HttpGet("servers")]
        public async Task<ActionResult<ServerAnalytics>> GetServerAnalytics(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _analyticsService.GetServerAnalyticsAsync(communityId, userId, timeframe);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server analytics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/performance")]
        public async Task<ActionResult<List<ServerPerformance>>> GetServerPerformance(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var performance = await _analyticsService.GetServerPerformanceAsync(communityId, userId);
                return Ok(performance);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server performance for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/utilization")]
        public async Task<ActionResult<ServerUtilizationAnalysis>> GetServerUtilization(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var utilization = await _analyticsService.GetServerUtilizationAsync(communityId, userId);
                return Ok(utilization);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server utilization for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/game-modes")]
        public async Task<ActionResult<List<PopularGameModes>>> GetPopularGameModes(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var gameModes = await _analyticsService.GetPopularGameModesAsync(communityId, userId);
                return Ok(gameModes);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular game modes for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Revenue Analytics
        [HttpGet("revenue")]
        public async Task<ActionResult<RevenueAnalytics>> GetRevenueAnalytics(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _analyticsService.GetRevenueAnalyticsAsync(communityId, userId, timeframe);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue analytics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("revenue/streams")]
        public async Task<ActionResult<List<RevenueStream>>> GetRevenueStreams(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var streams = await _analyticsService.GetRevenueStreamsAsync(communityId, userId);
                return Ok(streams);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue streams for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("revenue/optimization")]
        public async Task<ActionResult<RevenueOptimization>> GetRevenueOptimization(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var optimization = await _analyticsService.GetRevenueOptimizationAsync(communityId, userId);
                return Ok(optimization);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue optimization for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("revenue/donations")]
        public async Task<ActionResult<List<DonationAnalysis>>> GetDonationAnalysis(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var analysis = await _analyticsService.GetDonationAnalysisAsync(communityId, userId);
                return Ok(analysis);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting donation analysis for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Social Analytics
        [HttpGet("social")]
        public async Task<ActionResult<SocialAnalytics>> GetSocialAnalytics(Guid communityId, [FromQuery] AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _analyticsService.GetSocialAnalyticsAsync(communityId, userId, timeframe);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting social analytics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("social/network")]
        public async Task<ActionResult<NetworkAnalysis>> GetNetworkAnalysis(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var analysis = await _analyticsService.GetNetworkAnalysisAsync(communityId, userId);
                return Ok(analysis);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting network analysis for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("social/influencers")]
        public async Task<ActionResult<List<InfluencerMetric>>> GetInfluencerMetrics(Guid communityId, [FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var metrics = await _analyticsService.GetInfluencerMetricsAsync(communityId, userId, limit);
                return Ok(metrics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting influencer metrics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("social/sentiment")]
        public async Task<ActionResult<SocialSentimentAnalysis>> GetSentimentAnalysis(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var sentiment = await _analyticsService.GetSentimentAnalysisAsync(communityId, userId);
                return Ok(sentiment);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting sentiment analysis for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Predictive Analytics
        [HttpGet("predictions/churn")]
        public async Task<ActionResult<ChurnPrediction>> GetChurnPrediction(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var prediction = await _analyticsService.GetChurnPredictionAsync(communityId, userId);
                return Ok(prediction);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting churn prediction for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("predictions/at-risk")]
        public async Task<ActionResult<List<AtRiskMember>>> GetAtRiskMembers(Guid communityId, [FromQuery] int limit = 20)
        {
            try
            {
                var userId = GetUserId();
                var atRisk = await _analyticsService.GetAtRiskMembersAsync(communityId, userId, limit);
                return Ok(atRisk);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting at-risk members for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("predictions/opportunities")]
        public async Task<ActionResult<GrowthOpportunities>> GetGrowthOpportunities(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var opportunities = await _analyticsService.GetGrowthOpportunitiesAsync(communityId, userId);
                return Ok(opportunities);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting growth opportunities for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("predictions/engagement")]
        public async Task<ActionResult<EngagementRecommendations>> GetEngagementRecommendations(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var recommendations = await _analyticsService.GetEngagementRecommendationsAsync(communityId, userId);
                return Ok(recommendations);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting engagement recommendations for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Comparative Analytics
        [HttpGet("benchmarks")]
        public async Task<ActionResult<BenchmarkingReport>> GetBenchmarkingReport(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var report = await _analyticsService.GetBenchmarkingReportAsync(communityId, userId);
                return Ok(report);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting benchmarking report for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("industry/{gameCategory}")]
        public async Task<ActionResult<IndustryComparison>> GetIndustryComparison(Guid communityId, string gameCategory)
        {
            try
            {
                var userId = GetUserId();
                var comparison = await _analyticsService.GetIndustryComparisonAsync(communityId, userId, gameCategory);
                return Ok(comparison);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting industry comparison for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("peers")]
        public async Task<ActionResult<PeerAnalysis>> GetPeerAnalysis(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var analysis = await _analyticsService.GetPeerAnalysisAsync(communityId, userId);
                return Ok(analysis);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting peer analysis for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Custom Reports
        [HttpPost("reports/custom")]
        public async Task<ActionResult<CustomReport>> GenerateCustomReport(Guid communityId, [FromBody] CustomReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _analyticsService.GenerateCustomReportAsync(communityId, userId, request);
                return Ok(report);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating custom report for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("reports/templates")]
        public async Task<ActionResult<List<ReportTemplate>>> GetReportTemplates()
        {
            try
            {
                var userId = GetUserId();
                var templates = await _analyticsService.GetReportTemplatesAsync(userId);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting report templates");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reports/templates")]
        public async Task<ActionResult<ReportTemplate>> SaveReportTemplate([FromBody] SaveReportTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var template = await _analyticsService.SaveReportTemplateAsync(userId, request);
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving report template");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("reports/export")]
        public async Task<ActionResult<ExportResult>> ExportReport(Guid communityId, [FromBody] ExportReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _analyticsService.ExportReportAsync(communityId, userId, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error exporting report for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Real-time Analytics
        [HttpGet("realtime")]
        public async Task<ActionResult<RealTimeMetrics>> GetRealTimeMetrics(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var metrics = await _analyticsService.GetRealTimeMetricsAsync(communityId, userId);
                return Ok(metrics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time metrics for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("realtime/events")]
        public async Task<ActionResult<List<LiveEvent>>> GetLiveEvents(Guid communityId, [FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var events = await _analyticsService.GetLiveEventsAsync(communityId, userId, limit);
                return Ok(events);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live events for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("alerts")]
        public async Task<ActionResult<AlertConfiguration>> GetAnalyticsAlerts(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var alerts = await _analyticsService.GetAnalyticsAlertsAsync(communityId, userId);
                return Ok(alerts);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting analytics alerts for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("alerts")]
        public async Task<ActionResult<AlertConfiguration>> UpdateAnalyticsAlerts(Guid communityId, [FromBody] UpdateAlertsRequest request)
        {
            try
            {
                var userId = GetUserId();
                var alerts = await _analyticsService.UpdateAnalyticsAlertsAsync(communityId, userId, request);
                return Ok(alerts);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating analytics alerts for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}