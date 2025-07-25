using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface ICommunityAnalyticsService
    {
        // Core Analytics
        Task<CommunityDashboard> GetCommunityDashboardAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month);
        Task<CommunityMetrics> GetCommunityMetricsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<List<AnalyticsWidget>> GetDashboardWidgetsAsync(Guid communityId, Guid userId);
        Task<AnalyticsWidget> GetCustomWidgetAsync(Guid communityId, Guid userId, string widgetType, Dictionary<string, object> parameters);
        
        // Member Analytics
        Task<MemberAnalytics> GetMemberAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month);
        Task<List<MemberEngagementMetric>> GetMemberEngagementAsync(Guid communityId, Guid userId, int page = 1, int pageSize = 50);
        Task<MemberRetentionAnalysis> GetMemberRetentionAsync(Guid communityId, Guid userId);
        Task<List<MemberSegment>> GetMemberSegmentsAsync(Guid communityId, Guid userId);
        Task<MemberLifecycleAnalysis> GetMemberLifecycleAsync(Guid communityId, Guid userId);
        
        // Growth Analytics
        Task<GrowthAnalytics> GetGrowthAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month);
        Task<GrowthForecast> GetGrowthForecastAsync(Guid communityId, Guid userId, int daysAhead = 30);
        Task<List<GrowthDriver>> GetGrowthDriversAsync(Guid communityId, Guid userId);
        Task<CompetitiveAnalysis> GetCompetitiveAnalysisAsync(Guid communityId, Guid userId);
        
        // Engagement Analytics
        Task<EngagementAnalytics> GetEngagementAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month);
        Task<List<ActivityHeatmap>> GetActivityHeatmapAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Week);
        Task<EngagementFunnel> GetEngagementFunnelAsync(Guid communityId, Guid userId);
        Task<List<ContentPerformance>> GetContentPerformanceAsync(Guid communityId, Guid userId, ContentType contentType, int limit = 20);
        
        // Server Analytics
        Task<ServerAnalytics> GetServerAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month);
        Task<List<ServerPerformance>> GetServerPerformanceAsync(Guid communityId, Guid userId);
        Task<ServerUtilizationAnalysis> GetServerUtilizationAsync(Guid communityId, Guid userId);
        Task<List<PopularGameModes>> GetPopularGameModesAsync(Guid communityId, Guid userId);
        
        // Revenue Analytics
        Task<RevenueAnalytics> GetRevenueAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month);
        Task<List<RevenueStream>> GetRevenueStreamsAsync(Guid communityId, Guid userId);
        Task<RevenueOptimization> GetRevenueOptimizationAsync(Guid communityId, Guid userId);
        Task<List<DonationAnalysis>> GetDonationAnalysisAsync(Guid communityId, Guid userId);
        
        // Social Analytics
        Task<SocialAnalytics> GetSocialAnalyticsAsync(Guid communityId, Guid userId, AnalyticsTimeframe timeframe = AnalyticsTimeframe.Month);
        Task<NetworkAnalysis> GetNetworkAnalysisAsync(Guid communityId, Guid userId);
        Task<List<InfluencerMetric>> GetInfluencerMetricsAsync(Guid communityId, Guid userId, int limit = 10);
        Task<SocialSentimentAnalysis> GetSentimentAnalysisAsync(Guid communityId, Guid userId);
        
        // Predictive Analytics
        Task<ChurnPrediction> GetChurnPredictionAsync(Guid communityId, Guid userId);
        Task<List<AtRiskMember>> GetAtRiskMembersAsync(Guid communityId, Guid userId, int limit = 20);
        Task<GrowthOpportunities> GetGrowthOpportunitiesAsync(Guid communityId, Guid userId);
        Task<EngagementRecommendations> GetEngagementRecommendationsAsync(Guid communityId, Guid userId);
        
        // Comparative Analytics
        Task<BenchmarkingReport> GetBenchmarkingReportAsync(Guid communityId, Guid userId);
        Task<IndustryComparison> GetIndustryComparisonAsync(Guid communityId, Guid userId, string gameCategory);
        Task<PeerAnalysis> GetPeerAnalysisAsync(Guid communityId, Guid userId);
        
        // Custom Reports
        Task<CustomReport> GenerateCustomReportAsync(Guid communityId, Guid userId, CustomReportRequest request);
        Task<List<ReportTemplate>> GetReportTemplatesAsync(Guid userId);
        Task<ReportTemplate> SaveReportTemplateAsync(Guid userId, SaveReportTemplateRequest request);
        Task<ExportResult> ExportReportAsync(Guid communityId, Guid userId, ExportReportRequest request);
        
        // Real-time Analytics
        Task<RealTimeMetrics> GetRealTimeMetricsAsync(Guid communityId, Guid userId);
        Task<List<LiveEvent>> GetLiveEventsAsync(Guid communityId, Guid userId, int limit = 10);
        Task<AlertConfiguration> GetAnalyticsAlertsAsync(Guid communityId, Guid userId);
        Task<AlertConfiguration> UpdateAnalyticsAlertsAsync(Guid communityId, Guid userId, UpdateAlertsRequest request);
    }

    // Data Models
    public class CommunityDashboard
    {
        public Guid CommunityId { get; set; }
        public AnalyticsTimeframe Timeframe { get; set; }
        public CommunityOverview Overview { get; set; } = new();
        public List<KeyMetric> KeyMetrics { get; set; } = new();
        public List<TrendChart> TrendCharts { get; set; } = new();
        public List<AnalyticsInsight> Insights { get; set; } = new();
        public List<ActionableRecommendation> Recommendations { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
        public AnalyticsMetadata Metadata { get; set; } = new();
    }

    public class CommunityOverview
    {
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public float GrowthRate { get; set; }
        public float EngagementRate { get; set; }
        public int TotalServers { get; set; }
        public int ActiveServers { get; set; }
        public TimeSpan AverageSessionDuration { get; set; }
        public float MemberSatisfactionScore { get; set; }
        public int TotalEvents { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }

    public class KeyMetric
    {
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public object Value { get; set; } = new();
        public object PreviousValue { get; set; } = new();
        public float ChangePercentage { get; set; }
        public MetricTrend Trend { get; set; }
        public string Format { get; set; } = "number"; // "number", "percentage", "currency", "time"
        public string Icon { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public bool IsPositiveTrend { get; set; }
    }

    public class TrendChart
    {
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "line", "bar", "area", "pie"
        public List<ChartDataPoint> DataPoints { get; set; } = new();
        public ChartConfiguration Configuration { get; set; } = new();
        public string TimeFormat { get; set; } = "date";
        public List<string> Colors { get; set; } = new();
    }

    public class ChartDataPoint
    {
        public DateTime Date { get; set; }
        public string Label { get; set; } = string.Empty;
        public Dictionary<string, object> Values { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class ChartConfiguration
    {
        public bool ShowLegend { get; set; } = true;
        public bool ShowGrid { get; set; } = true;
        public bool EnableZoom { get; set; } = true;
        public string XAxisLabel { get; set; } = string.Empty;
        public string YAxisLabel { get; set; } = string.Empty;
        public Dictionary<string, object> CustomOptions { get; set; } = new();
    }

    public class AnalyticsInsight
    {
        public string Type { get; set; } = string.Empty; // "positive", "negative", "neutral", "warning"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public float Impact { get; set; } // 0-1 scale
        public float Confidence { get; set; } // 0-1 scale
        public List<string> SupportingData { get; set; } = new();
        public string? ActionSuggestion { get; set; }
        public DateTime DetectedAt { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class ActionableRecommendation
    {
        public string Category { get; set; } = string.Empty; // "growth", "engagement", "retention"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string> Steps { get; set; } = new();
        public float PotentialImpact { get; set; } // 0-1 scale
        public string Difficulty { get; set; } = string.Empty; // "easy", "medium", "hard"
        public int EstimatedTimeHours { get; set; }
        public List<string> RequiredResources { get; set; } = new();
        public string Priority { get; set; } = string.Empty; // "high", "medium", "low"
    }

    public class MemberAnalytics
    {
        public Guid CommunityId { get; set; }
        public AnalyticsTimeframe Timeframe { get; set; }
        public MemberGrowthMetrics Growth { get; set; } = new();
        public MemberDemographics Demographics { get; set; } = new();
        public MemberActivityMetrics Activity { get; set; } = new();
        public MemberRetentionMetrics Retention { get; set; } = new();
        public List<MemberCohort> Cohorts { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class MemberGrowthMetrics
    {
        public int NewMembers { get; set; }
        public int ChurnedMembers { get; set; }
        public int NetGrowth { get; set; }
        public float GrowthRate { get; set; }
        public float ChurnRate { get; set; }
        public List<GrowthDataPoint> GrowthHistory { get; set; } = new();
        public Dictionary<string, int> AcquisitionChannels { get; set; } = new();
    }

    public class GrowthDataPoint
    {
        public DateTime Date { get; set; }
        public int NewMembers { get; set; }
        public int ChurnedMembers { get; set; }
        public int TotalMembers { get; set; }
        public float GrowthRate { get; set; }
    }

    public class MemberDemographics
    {
        public Dictionary<string, int> AgeGroups { get; set; } = new();
        public Dictionary<string, int> Locations { get; set; } = new();
        public Dictionary<string, int> PlayStyles { get; set; } = new();
        public Dictionary<string, int> PreferredGames { get; set; } = new();
        public Dictionary<string, int> JoinReasons { get; set; } = new();
        public Dictionary<string, float> EngagementByDemographic { get; set; } = new();
    }

    public class MemberActivityMetrics
    {
        public float AverageSessionsPerMember { get; set; }
        public TimeSpan AverageSessionDuration { get; set; }
        public float DailyActiveUsers { get; set; }
        public float WeeklyActiveUsers { get; set; }
        public float MonthlyActiveUsers { get; set; }
        public Dictionary<DayOfWeek, float> ActivityByDay { get; set; } = new();
        public Dictionary<int, float> ActivityByHour { get; set; } = new();
        public List<ActivityTrend> ActivityTrends { get; set; } = new();
    }

    public class ActivityTrend
    {
        public DateTime Date { get; set; }
        public float DailyActive { get; set; }
        public float WeeklyActive { get; set; }
        public float MonthlyActive { get; set; }
        public TimeSpan AverageSessionDuration { get; set; }
    }

    public class MemberRetentionMetrics
    {
        public float OverallRetentionRate { get; set; }
        public Dictionary<int, float> RetentionByDays { get; set; } = new(); // Day 1, 7, 30, etc.
        public Dictionary<string, float> RetentionBySegment { get; set; } = new();
        public List<RetentionCohort> RetentionCohorts { get; set; } = new();
        public float ChurnRisk { get; set; }
        public List<ChurnFactor> ChurnFactors { get; set; } = new();
    }

    public class RetentionCohort
    {
        public DateTime CohortMonth { get; set; }
        public int InitialSize { get; set; }
        public Dictionary<int, float> RetentionRates { get; set; } = new(); // Period -> Rate
        public Dictionary<int, int> RemainingMembers { get; set; } = new(); // Period -> Count
    }

    public class ChurnFactor
    {
        public string Factor { get; set; } = string.Empty;
        public float Impact { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class MemberEngagementMetric
    {
        public Guid UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public EngagementScore Score { get; set; } = new();
        public MemberActivitySummary Activity { get; set; } = new();
        public DateTime JoinedAt { get; set; }
        public DateTime LastActiveAt { get; set; }
        public List<string> Badges { get; set; } = new();
        public EngagementTrend Trend { get; set; }
    }

    public class EngagementScore
    {
        public float Overall { get; set; }
        public float Social { get; set; }
        public float Gaming { get; set; }
        public float Community { get; set; }
        public float Consistency { get; set; }
        public string Tier { get; set; } = string.Empty; // "Champion", "Active", "Casual", "At-Risk"
    }

    public class MemberActivitySummary
    {
        public int SessionsThisMonth { get; set; }
        public TimeSpan PlaytimeThisMonth { get; set; }
        public int MessagesThisMonth { get; set; }
        public int EventsAttended { get; set; }
        public int FriendsInCommunity { get; set; }
        public List<string> FavoriteServers { get; set; } = new();
    }

    public class MemberSegment
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public float Percentage { get; set; }
        public MemberSegmentCharacteristics Characteristics { get; set; } = new();
        public List<SegmentInsight> Insights { get; set; } = new();
        public List<SegmentRecommendation> Recommendations { get; set; } = new();
    }

    public class MemberSegmentCharacteristics
    {
        public float AverageEngagement { get; set; }
        public TimeSpan AverageSessionLength { get; set; }
        public List<string> PreferredGames { get; set; } = new();
        public List<string> CommonBehaviors { get; set; } = new();
        public float RetentionRate { get; set; }
        public float RevenueContribution { get; set; }
    }

    public class SegmentInsight
    {
        public string Type { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public float Significance { get; set; }
    }

    public class SegmentRecommendation
    {
        public string Action { get; set; } = string.Empty;
        public string Rationale { get; set; } = string.Empty;
        public float ExpectedImpact { get; set; }
    }

    public class MemberLifecycleAnalysis
    {
        public List<LifecycleStage> Stages { get; set; } = new();
        public Dictionary<string, int> StageDistribution { get; set; } = new();
        public List<LifecycleTransition> Transitions { get; set; } = new();
        public List<LifecycleOptimization> Optimizations { get; set; } = new();
    }

    public class LifecycleStage
    {
        public string Name { get; set; } = string.Empty; // "New", "Active", "Champion", "At-Risk", "Churned"
        public string Description { get; set; } = string.Empty;
        public int MemberCount { get; set; }
        public float AverageTimeInStage { get; set; } // Days
        public List<string> TypicalBehaviors { get; set; } = new();
        public List<string> SuccessFactors { get; set; } = new();
    }

    public class LifecycleTransition
    {
        public string FromStage { get; set; } = string.Empty;
        public string ToStage { get; set; } = string.Empty;
        public float TransitionRate { get; set; }
        public float AverageTransitionTime { get; set; } // Days
        public List<string> TriggerFactors { get; set; } = new();
    }

    public class LifecycleOptimization
    {
        public string Stage { get; set; } = string.Empty;
        public string Opportunity { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public float PotentialImpact { get; set; }
    }

    public class GrowthAnalytics
    {
        public Guid CommunityId { get; set; }
        public AnalyticsTimeframe Timeframe { get; set; }
        public GrowthOverview Overview { get; set; } = new();
        public List<GrowthChannel> Channels { get; set; } = new();
        public ViralityMetrics Virality { get; set; } = new();
        public List<GrowthExperiment> Experiments { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class GrowthOverview
    {
        public float GrowthRate { get; set; }
        public int NewMembers { get; set; }
        public int TotalMembers { get; set; }
        public float ChurnRate { get; set; }
        public float NetGrowthRate { get; set; }
        public GrowthVelocity Velocity { get; set; } = new();
        public List<GrowthMilestone> Milestones { get; set; } = new();
    }

    public class GrowthVelocity
    {
        public float Current { get; set; } // Members per day
        public float Average { get; set; }
        public float Peak { get; set; }
        public DateTime PeakDate { get; set; }
        public float Acceleration { get; set; } // Change in velocity
    }

    public class GrowthMilestone
    {
        public int MemberCount { get; set; }
        public DateTime? AchievedAt { get; set; }
        public DateTime? ProjectedAt { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class GrowthChannel
    {
        public string Name { get; set; } = string.Empty; // "Organic", "Referral", "Social", "Events"
        public int MembersAcquired { get; set; }
        public float ConversionRate { get; set; }
        public decimal CostPerAcquisition { get; set; }
        public float RetentionRate { get; set; }
        public float LifetimeValue { get; set; }
        public ChannelPerformance Performance { get; set; } = new();
    }

    public class ChannelPerformance
    {
        public float Efficiency { get; set; } // ROI-based score
        public float Quality { get; set; } // Retention-based score
        public float Volume { get; set; } // Scale of acquisition
        public float Trend { get; set; } // Growth trend
        public string Status { get; set; } = string.Empty; // "Growing", "Stable", "Declining"
    }

    public class ViralityMetrics
    {
        public float ViralCoefficient { get; set; }
        public float InvitationRate { get; set; }
        public float InvitationAcceptanceRate { get; set; }
        public float ReferralRate { get; set; }
        public int AverageInvitesPerMember { get; set; }
        public Dictionary<string, float> ViralityByFeature { get; set; } = new();
    }

    public class GrowthExperiment
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "A/B Test", "Feature Flag", "Campaign"
        public string Status { get; set; } = string.Empty; // "Running", "Completed", "Planned"
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public GrowthExperimentResults? Results { get; set; }
    }

    public class GrowthExperimentResults
    {
        public float LiftPercentage { get; set; }
        public float Confidence { get; set; }
        public bool IsSignificant { get; set; }
        public Dictionary<string, object> Metrics { get; set; } = new();
    }

    public class AnalyticsWidget
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "metric", "chart", "table", "insight"
        public string Title { get; set; } = string.Empty;
        public string Size { get; set; } = "medium"; // "small", "medium", "large"
        public object Data { get; set; } = new();
        public WidgetConfiguration Configuration { get; set; } = new();
        public DateTime LastUpdated { get; set; }
        public bool IsCustomizable { get; set; } = true;
    }

    public class WidgetConfiguration
    {
        public string RefreshInterval { get; set; } = "5m"; // "1m", "5m", "1h", "manual"
        public bool ShowTrends { get; set; } = true;
        public bool ShowComparisons { get; set; } = true;
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    // Enums
    public enum AnalyticsTimeframe
    {
        Day,
        Week,
        Month,
        Quarter,
        Year,
        Custom
    }

    public enum MetricTrend
    {
        Up,
        Down,
        Flat,
        Volatile
    }

    public enum EngagementTrend
    {
        Increasing,
        Stable,
        Decreasing,
        Volatile
    }

    public enum ContentType
    {
        Posts,
        Events,
        Announcements,
        Discussions,
        Media
    }

    public class AnalyticsMetadata
    {
        public string Version { get; set; } = "1.0";
        public DateTime LastCalculated { get; set; }
        public TimeSpan CalculationDuration { get; set; }
        public int DataPoints { get; set; }
        public float Confidence { get; set; }
        public List<string> DataSources { get; set; } = new();
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    // Additional models for other analytics features would be defined here...
    // (Simplified for brevity - each major analytics area would have its full model set)
    
    public class CommunityMetrics
    {
        public Guid CommunityId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public Dictionary<string, object> Metrics { get; set; } = new();
        public List<MetricTrend> Trends { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class MemberCohort
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public int InitialSize { get; set; }
        public Dictionary<int, CohortMetric> Metrics { get; set; } = new(); // Period -> Metrics
    }

    public class CohortMetric
    {
        public int ActiveMembers { get; set; }
        public float RetentionRate { get; set; }
        public float EngagementRate { get; set; }
        public TimeSpan AverageSessionTime { get; set; }
    }

    // Request DTOs
    public class CustomReportRequest
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Metrics { get; set; } = new();
        public List<string> Dimensions { get; set; } = new();
        public List<AnalyticsFilter> Filters { get; set; } = new();
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Granularity { get; set; } = "daily"; // "hourly", "daily", "weekly", "monthly"
    }

    public class AnalyticsFilter
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = string.Empty; // "equals", "contains", "greater_than", etc.
        public object Value { get; set; } = new();
    }

    public class SaveReportTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public CustomReportRequest ReportConfiguration { get; set; } = new();
        public bool IsPublic { get; set; } = false;
    }

    public class ExportReportRequest
    {
        public string ReportType { get; set; } = string.Empty;
        public string Format { get; set; } = "pdf"; // "pdf", "excel", "csv", "json"
        public CustomReportRequest? CustomReport { get; set; }
        public Dictionary<string, object> Options { get; set; } = new();
    }

    public class UpdateAlertsRequest
    {
        public List<AnalyticsAlert> Alerts { get; set; } = new();
    }

    public class AnalyticsAlert
    {
        public string Name { get; set; } = string.Empty;
        public string Metric { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty; // "above", "below", "equals", "change"
        public object Threshold { get; set; } = new();
        public bool IsEnabled { get; set; } = true;
        public List<string> NotificationChannels { get; set; } = new(); // "email", "discord", "slack"
    }

    // Result types for complex analytics operations
    public class CustomReport
    {
        public string Name { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public List<ReportSection> Sections { get; set; } = new();
        public ReportSummary Summary { get; set; } = new();
        public AnalyticsMetadata Metadata { get; set; } = new();
    }

    public class ReportSection
    {
        public string Title { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "table", "chart", "insight"
        public object Data { get; set; } = new();
        public string Description { get; set; } = string.Empty;
    }

    public class ReportSummary
    {
        public List<KeyMetric> HighlightMetrics { get; set; } = new();
        public List<string> KeyFindings { get; set; } = new();
        public List<ActionableRecommendation> Recommendations { get; set; } = new();
    }

    public class ReportTemplate
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public CustomReportRequest Configuration { get; set; } = new();
        public bool IsPublic { get; set; }
        public int UseCount { get; set; }
    }

    public class ExportResult
    {
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public long FileSizeBytes { get; set; }
        public DateTime ExpiresAt { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class RealTimeMetrics
    {
        public Guid CommunityId { get; set; }
        public int OnlineMembers { get; set; }
        public int ActiveSessions { get; set; }
        public List<LiveActivity> RecentActivities { get; set; } = new();
        public Dictionary<string, int> ServerPopulations { get; set; } = new();
        public float CurrentEngagementRate { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class LiveActivity
    {
        public string Type { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
        public string? UserName { get; set; }
        public DateTime Timestamp { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class LiveEvent
    {
        public string Type { get; set; } = string.Empty; // "spike", "milestone", "anomaly"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public float Significance { get; set; } // 0-1
        public DateTime DetectedAt { get; set; }
        public Dictionary<string, object> Data { get; set; } = new();
    }

    public class AlertConfiguration
    {
        public Guid CommunityId { get; set; }
        public List<AnalyticsAlert> Alerts { get; set; } = new();
        public AlertSettings Settings { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class AlertSettings
    {
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = false;
        public bool DiscordIntegration { get; set; } = false;
        public string? DiscordWebhookUrl { get; set; }
        public TimeSpan QuietHours { get; set; } = TimeSpan.Zero;
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    // Placeholder classes for other major analytics areas
    public class EngagementAnalytics { }
    public class ActivityHeatmap { }
    public class EngagementFunnel { }
    public class ContentPerformance { }
    public class ServerAnalytics { }
    public class ServerPerformance { }
    public class ServerUtilizationAnalysis { }
    public class PopularGameModes { }
    public class RevenueAnalytics { }
    public class RevenueStream { }
    public class RevenueOptimization { }
    public class DonationAnalysis { }
    public class SocialAnalytics { }
    public class NetworkAnalysis { }
    public class InfluencerMetric { }
    public class SocialSentimentAnalysis { }
    public class ChurnPrediction { }
    public class AtRiskMember { }
    public class GrowthOpportunities { }
    public class EngagementRecommendations { }
    public class BenchmarkingReport { }
    public class IndustryComparison { }
    public class PeerAnalysis { }
    public class GrowthForecast { }
    public class GrowthDriver { }
    public class CompetitiveAnalysis { }
}