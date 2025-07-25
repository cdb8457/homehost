using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IBusinessIntelligenceService
    {
        // Dashboard Analytics
        Task<DashboardAnalytics> GetDashboardAnalyticsAsync(Guid organizationId, DashboardAnalyticsFilter filter);
        Task<List<DashboardWidget>> GetDashboardWidgetsAsync(Guid organizationId, Guid userId);
        Task<DashboardWidget> CreateDashboardWidgetAsync(Guid organizationId, Guid userId, CreateDashboardWidgetRequest request);
        Task<DashboardWidget> UpdateDashboardWidgetAsync(Guid widgetId, Guid userId, UpdateDashboardWidgetRequest request);
        Task<bool> DeleteDashboardWidgetAsync(Guid widgetId, Guid userId);
        Task<List<DashboardTemplate>> GetDashboardTemplatesAsync(DashboardTemplateFilter? filter = null);
        Task<Dashboard> CreateDashboardFromTemplateAsync(Guid organizationId, Guid userId, Guid templateId);

        // Gaming Analytics
        Task<GameAnalytics> GetGameAnalyticsAsync(Guid organizationId, GameAnalyticsFilter filter);
        Task<List<GamePerformanceMetric>> GetGamePerformanceMetricsAsync(Guid organizationId, GamePerformanceFilter filter);
        Task<PlayerBehaviorAnalytics> GetPlayerBehaviorAnalyticsAsync(Guid organizationId, PlayerBehaviorFilter filter);
        Task<List<GameSessionAnalytics>> GetGameSessionAnalyticsAsync(Guid organizationId, GameSessionFilter filter);
        Task<GameServerUtilization> GetGameServerUtilizationAsync(Guid organizationId, ServerUtilizationFilter filter);
        Task<List<PopularGame>> GetPopularGamesAsync(Guid organizationId, PopularGamesFilter filter);
        Task<GameTrendAnalysis> GetGameTrendAnalysisAsync(Guid organizationId, GameTrendFilter filter);

        // User Analytics
        Task<UserAnalytics> GetUserAnalyticsAsync(Guid organizationId, UserAnalyticsFilter filter);
        Task<List<UserEngagementMetric>> GetUserEngagementMetricsAsync(Guid organizationId, UserEngagementFilter filter);
        Task<UserRetentionAnalysis> GetUserRetentionAnalysisAsync(Guid organizationId, UserRetentionFilter filter);
        Task<List<UserSegment>> GetUserSegmentsAsync(Guid organizationId, UserSegmentFilter? filter = null);
        Task<UserSegment> CreateUserSegmentAsync(Guid organizationId, Guid userId, CreateUserSegmentRequest request);
        Task<UserLifetimeValue> GetUserLifetimeValueAsync(Guid organizationId, UserLifetimeValueFilter filter);
        Task<UserChurnAnalysis> GetUserChurnAnalysisAsync(Guid organizationId, UserChurnFilter filter);

        // Performance Analytics
        Task<PerformanceAnalytics> GetPerformanceAnalyticsAsync(Guid organizationId, PerformanceAnalyticsFilter filter);
        Task<List<SystemHealthMetric>> GetSystemHealthMetricsAsync(Guid organizationId, SystemHealthFilter filter);
        Task<ResourceUtilization> GetResourceUtilizationAsync(Guid organizationId, ResourceUtilizationFilter filter);
        Task<List<PerformanceAlert>> GetPerformanceAlertsAsync(Guid organizationId, PerformanceAlertFilter? filter = null);
        Task<ServerLoadAnalysis> GetServerLoadAnalysisAsync(Guid organizationId, ServerLoadFilter filter);
        Task<NetworkLatencyAnalysis> GetNetworkLatencyAnalysisAsync(Guid organizationId, NetworkLatencyFilter filter);

        // Financial Analytics
        Task<FinancialAnalytics> GetFinancialAnalyticsAsync(Guid organizationId, FinancialAnalyticsFilter filter);
        Task<RevenueBreakdown> GetRevenueBreakdownAsync(Guid organizationId, RevenueBreakdownFilter filter);
        Task<CostAnalysis> GetCostAnalysisAsync(Guid organizationId, CostAnalysisFilter filter);
        Task<ProfitabilityAnalysis> GetProfitabilityAnalysisAsync(Guid organizationId, ProfitabilityFilter filter);
        Task<List<FinancialTrend>> GetFinancialTrendsAsync(Guid organizationId, FinancialTrendFilter filter);
        Task<BudgetAnalysis> GetBudgetAnalysisAsync(Guid organizationId, BudgetAnalysisFilter filter);
        Task<FinancialForecast> GetFinancialForecastAsync(Guid organizationId, FinancialForecastFilter filter);

        // Custom Reports
        Task<CustomReport> CreateCustomReportAsync(Guid organizationId, Guid userId, CreateCustomReportRequest request);
        Task<List<CustomReport>> GetCustomReportsAsync(Guid organizationId, CustomReportFilter? filter = null);
        Task<CustomReport> GetCustomReportAsync(Guid reportId);
        Task<CustomReport> UpdateCustomReportAsync(Guid reportId, Guid userId, UpdateCustomReportRequest request);
        Task<bool> DeleteCustomReportAsync(Guid reportId, Guid userId);
        Task<ReportExecution> ExecuteCustomReportAsync(Guid reportId, Guid userId, ReportExecutionRequest request);
        Task<List<ReportExecution>> GetReportExecutionsAsync(Guid reportId, ReportExecutionFilter? filter = null);
        Task<bool> ScheduleCustomReportAsync(Guid reportId, Guid userId, ScheduleReportRequest request);

        // Data Export
        Task<DataExport> CreateDataExportAsync(Guid organizationId, Guid userId, CreateDataExportRequest request);
        Task<List<DataExport>> GetDataExportsAsync(Guid organizationId, DataExportFilter? filter = null);
        Task<DataExport> GetDataExportAsync(Guid exportId);
        Task<bool> CancelDataExportAsync(Guid exportId, Guid userId);
        Task<byte[]> DownloadDataExportAsync(Guid exportId, Guid userId);
        Task<List<ExportTemplate>> GetExportTemplatesAsync(ExportTemplateFilter? filter = null);

        // Real-time Analytics
        Task<RealTimeMetrics> GetRealTimeMetricsAsync(Guid organizationId, RealTimeMetricsFilter filter);
        Task<List<LivePlayerSession>> GetLivePlayerSessionsAsync(Guid organizationId, LiveSessionFilter? filter = null);
        Task<ServerStatusSnapshot> GetServerStatusSnapshotAsync(Guid organizationId);
        Task<List<ActiveEvent>> GetActiveEventsAsync(Guid organizationId, ActiveEventFilter? filter = null);
        Task<RealTimeAlert> CreateRealTimeAlertAsync(Guid organizationId, Guid userId, CreateRealTimeAlertRequest request);
        Task<List<RealTimeAlert>> GetRealTimeAlertsAsync(Guid organizationId, RealTimeAlertFilter? filter = null);

        // Machine Learning Insights
        Task<MLInsights> GetMachineLearningInsightsAsync(Guid organizationId, MLInsightsFilter filter);
        Task<List<Prediction>> GetPredictionsAsync(Guid organizationId, PredictionFilter filter);
        Task<AnomalyDetectionResult> RunAnomalyDetectionAsync(Guid organizationId, AnomalyDetectionRequest request);
        Task<List<Recommendation>> GetRecommendationsAsync(Guid organizationId, RecommendationFilter filter);
        Task<PlayerBehaviorPrediction> PredictPlayerBehaviorAsync(Guid userId, PlayerBehaviorPredictionRequest request);
        Task<ChurnPrediction> PredictUserChurnAsync(Guid organizationId, ChurnPredictionRequest request);
        Task<RevenueForecasting> GetRevenueForecastingAsync(Guid organizationId, RevenueForecastingRequest request);

        // Competitive Analysis
        Task<CompetitiveAnalysis> GetCompetitiveAnalysisAsync(Guid organizationId, CompetitiveAnalysisFilter filter);
        Task<List<MarketBenchmark>> GetMarketBenchmarksAsync(Guid organizationId, MarketBenchmarkFilter filter);
        Task<IndustryComparison> GetIndustryComparisonAsync(Guid organizationId, IndustryComparisonRequest request);
        Task<List<CompetitorInsight>> GetCompetitorInsightsAsync(Guid organizationId, CompetitorInsightFilter filter);

        // Data Quality & Governance
        Task<DataQualityReport> GetDataQualityReportAsync(Guid organizationId, DataQualityFilter filter);
        Task<List<DataSource>> GetDataSourcesAsync(Guid organizationId, DataSourceFilter? filter = null);
        Task<DataSource> CreateDataSourceAsync(Guid organizationId, Guid userId, CreateDataSourceRequest request);
        Task<DataLineage> GetDataLineageAsync(Guid organizationId, DataLineageRequest request);
        Task<List<DataGovernancePolicy>> GetDataGovernancePoliciesAsync(Guid organizationId);
        Task<DataGovernanceCompliance> CheckDataGovernanceComplianceAsync(Guid organizationId);

        // Alerting & Notifications
        Task<AlertRule> CreateAlertRuleAsync(Guid organizationId, Guid userId, CreateAlertRuleRequest request);
        Task<List<AlertRule>> GetAlertRulesAsync(Guid organizationId, AlertRuleFilter? filter = null);
        Task<AlertRule> UpdateAlertRuleAsync(Guid ruleId, Guid userId, UpdateAlertRuleRequest request);
        Task<bool> DeleteAlertRuleAsync(Guid ruleId, Guid userId);
        Task<List<Alert>> GetAlertsAsync(Guid organizationId, AlertFilter? filter = null);
        Task<bool> AcknowledgeAlertAsync(Guid alertId, Guid userId, AcknowledgeAlertRequest request);
        Task<AlertConfiguration> GetAlertConfigurationAsync(Guid organizationId);
        Task<AlertConfiguration> UpdateAlertConfigurationAsync(Guid organizationId, Guid userId, UpdateAlertConfigurationRequest request);

        // Advanced Analytics
        Task<CohortAnalysis> GetCohortAnalysisAsync(Guid organizationId, CohortAnalysisRequest request);
        Task<FunnelAnalysis> GetFunnelAnalysisAsync(Guid organizationId, FunnelAnalysisRequest request);
        Task<AttributionAnalysis> GetAttributionAnalysisAsync(Guid organizationId, AttributionAnalysisRequest request);
        Task<GeographicAnalysis> GetGeographicAnalysisAsync(Guid organizationId, GeographicAnalysisFilter filter);
        Task<TimeSeriesAnalysis> GetTimeSeriesAnalysisAsync(Guid organizationId, TimeSeriesAnalysisRequest request);
        Task<CorrelationAnalysis> GetCorrelationAnalysisAsync(Guid organizationId, CorrelationAnalysisRequest request);
        Task<StatisticalAnalysis> GetStatisticalAnalysisAsync(Guid organizationId, StatisticalAnalysisRequest request);

        // Business Metrics
        Task<BusinessMetrics> GetBusinessMetricsAsync(Guid organizationId, BusinessMetricsFilter filter);
        Task<KPITracker> GetKPITrackerAsync(Guid organizationId, KPIFilter filter);
        Task<KPI> CreateKPIAsync(Guid organizationId, Guid userId, CreateKPIRequest request);
        Task<List<KPI>> GetKPIsAsync(Guid organizationId, KPIFilter? filter = null);
        Task<GoalTracking> GetGoalTrackingAsync(Guid organizationId, GoalTrackingFilter filter);
        Task<BusinessGoal> CreateBusinessGoalAsync(Guid organizationId, Guid userId, CreateBusinessGoalRequest request);
        Task<List<Milestone>> GetMilestonesAsync(Guid organizationId, MilestoneFilter filter);

        // API Analytics
        Task<APIAnalytics> GetAPIAnalyticsAsync(Guid organizationId, APIAnalyticsFilter filter);
        Task<List<EndpointUsage>> GetEndpointUsageAsync(Guid organizationId, EndpointUsageFilter filter);
        Task<APIPerformanceMetrics> GetAPIPerformanceMetricsAsync(Guid organizationId, APIPerformanceFilter filter);
        Task<List<APIError>> GetAPIErrorsAsync(Guid organizationId, APIErrorFilter filter);
        Task<RateLimitAnalysis> GetRateLimitAnalysisAsync(Guid organizationId, RateLimitFilter filter);

        // Optimization Insights
        Task<OptimizationInsights> GetOptimizationInsightsAsync(Guid organizationId, OptimizationFilter filter);
        Task<List<OptimizationRecommendation>> GetOptimizationRecommendationsAsync(Guid organizationId, OptimizationRecommendationFilter filter);
        Task<PerformanceOptimization> GetPerformanceOptimizationAsync(Guid organizationId, PerformanceOptimizationRequest request);
        Task<CostOptimization> GetCostOptimizationAsync(Guid organizationId, CostOptimizationRequest request);
        Task<CapacityPlanning> GetCapacityPlanningAsync(Guid organizationId, CapacityPlanningRequest request);
    }
}