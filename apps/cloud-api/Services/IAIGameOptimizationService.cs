using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IAIGameOptimizationService
    {
        // Performance Analysis & Optimization
        Task<PerformanceAnalysis> AnalyzeServerPerformanceAsync(Guid serverId, PerformanceAnalysisRequest request);
        Task<List<OptimizationRecommendation>> GetOptimizationRecommendationsAsync(Guid serverId, OptimizationFilter? filter = null);
        Task<OptimizationResult> ApplyOptimizationAsync(Guid serverId, Guid userId, ApplyOptimizationRequest request);
        Task<List<PerformanceMetric>> GetPerformanceMetricsAsync(Guid serverId, PerformanceMetricsFilter filter);
        Task<PerformancePrediction> PredictPerformanceAsync(Guid serverId, PerformancePredictionRequest request);
        Task<ResourceOptimization> OptimizeResourceAllocationAsync(Guid serverId, Guid userId, ResourceOptimizationRequest request);
        Task<BenchmarkResult> RunPerformanceBenchmarkAsync(Guid serverId, Guid userId, BenchmarkRequest request);

        // Player Behavior Analysis
        Task<PlayerBehaviorAnalysis> AnalyzePlayerBehaviorAsync(Guid playerId, PlayerBehaviorAnalysisRequest request);
        Task<List<PlayerSegment>> GetPlayerSegmentsAsync(Guid organizationId, PlayerSegmentFilter? filter = null);
        Task<PlayerSegment> CreatePlayerSegmentAsync(Guid organizationId, Guid userId, CreatePlayerSegmentRequest request);
        Task<PlayerEngagementInsights> GetPlayerEngagementInsightsAsync(Guid playerId, EngagementInsightsFilter filter);
        Task<List<PlayerChurnPrediction>> PredictPlayerChurnAsync(Guid organizationId, ChurnPredictionRequest request);
        Task<PlayerRetentionAnalysis> AnalyzePlayerRetentionAsync(Guid organizationId, RetentionAnalysisRequest request);
        Task<PlayerLifetimeValue> CalculatePlayerLifetimeValueAsync(Guid playerId, PLVCalculationRequest request);

        // Dynamic Content Optimization
        Task<ContentOptimization> OptimizeGameContentAsync(Guid gameInstanceId, Guid userId, ContentOptimizationRequest request);
        Task<DifficultyRecommendation> RecommendDifficultyAdjustmentAsync(Guid playerId, Guid gameInstanceId, DifficultyAnalysisRequest request);
        Task<List<ContentRecommendation>> GetContentRecommendationsAsync(Guid playerId, ContentRecommendationFilter? filter = null);
        Task<GameBalanceAnalysis> AnalyzeGameBalanceAsync(Guid gameInstanceId, GameBalanceAnalysisRequest request);
        Task<List<GameBalanceAdjustment>> GetBalanceAdjustmentsAsync(Guid gameInstanceId, BalanceAdjustmentFilter? filter = null);
        Task<bool> ApplyGameBalanceAdjustmentAsync(Guid gameInstanceId, Guid userId, ApplyBalanceAdjustmentRequest request);

        // Intelligent Matchmaking
        Task<MatchmakingOptimization> OptimizeMatchmakingAsync(Guid gameInstanceId, Guid userId, MatchmakingOptimizationRequest request);
        Task<List<MatchmakingPool>> GetMatchmakingPoolsAsync(Guid gameInstanceId, MatchmakingPoolFilter? filter = null);
        Task<MatchmakingPool> CreateMatchmakingPoolAsync(Guid gameInstanceId, Guid userId, CreateMatchmakingPoolRequest request);
        Task<MatchPrediction> PredictMatchOutcomeAsync(Guid gameInstanceId, MatchPredictionRequest request);
        Task<MatchmakingMetrics> GetMatchmakingMetricsAsync(Guid gameInstanceId, MatchmakingMetricsFilter filter);
        Task<SkillRating> CalculatePlayerSkillRatingAsync(Guid playerId, Guid gameInstanceId, SkillRatingRequest request);

        // Automated Testing & Quality Assurance
        Task<AITestSuite> CreateAITestSuiteAsync(Guid gameInstanceId, Guid userId, CreateAITestSuiteRequest request);
        Task<List<AITestSuite>> GetAITestSuitesAsync(Guid gameInstanceId, AITestSuiteFilter? filter = null);
        Task<AITestExecution> RunAITestSuiteAsync(Guid testSuiteId, Guid userId, RunAITestSuiteRequest request);
        Task<List<AITestResult>> GetAITestResultsAsync(Guid testSuiteId, AITestResultFilter? filter = null);
        Task<BugPrediction> PredictBugsAsync(Guid gameInstanceId, BugPredictionRequest request);
        Task<List<QualityInsight>> GetQualityInsightsAsync(Guid gameInstanceId, QualityInsightFilter? filter = null);
        Task<CodeQualityAnalysis> AnalyzeCodeQualityAsync(Guid gameInstanceId, Guid userId, CodeQualityAnalysisRequest request);

        // Anti-Cheat & Security
        Task<CheatDetectionAnalysis> AnalyzeCheatDetectionAsync(Guid gameInstanceId, CheatDetectionRequest request);
        Task<List<CheatPrediction>> PredictCheatBehaviorAsync(Guid gameInstanceId, CheatPredictionRequest request);
        Task<SecurityThreatAnalysis> AnalyzeSecurityThreatsAsync(Guid gameInstanceId, SecurityThreatAnalysisRequest request);
        Task<List<SecurityRecommendation>> GetSecurityRecommendationsAsync(Guid gameInstanceId, SecurityRecommendationFilter? filter = null);
        Task<FraudDetectionResult> DetectFraudAsync(Guid transactionId, FraudDetectionRequest request);
        Task<AnomalyDetectionResult> DetectAnomaliesAsync(Guid gameInstanceId, AnomalyDetectionRequest request);

        // Predictive Analytics
        Task<PlayerDemandPrediction> PredictPlayerDemandAsync(Guid gameInstanceId, DemandPredictionRequest request);
        Task<ServerLoadPrediction> PredictServerLoadAsync(Guid serverId, LoadPredictionRequest request);
        Task<RevenueProjection> ProjectRevenueAsync(Guid organizationId, RevenueProjectionRequest request);
        Task<MarketTrendAnalysis> AnalyzeMarketTrendsAsync(Guid organizationId, MarketTrendAnalysisRequest request);
        Task<CompetitorAnalysis> AnalyzeCompetitorsAsync(Guid organizationId, CompetitorAnalysisRequest request);
        Task<GrowthProjection> ProjectGrowthAsync(Guid organizationId, GrowthProjectionRequest request);

        // Natural Language Processing
        Task<ChatModerationResult> ModerateChatAsync(Guid chatRoomId, ChatModerationRequest request);
        Task<SentimentAnalysis> AnalyzeSentimentAsync(Guid organizationId, SentimentAnalysisRequest request);
        Task<List<ChatInsight>> GetChatInsightsAsync(Guid chatRoomId, ChatInsightFilter? filter = null);
        Task<LanguageDetectionResult> DetectLanguageAsync(Guid organizationId, LanguageDetectionRequest request);
        Task<ContentGenerationResult> GenerateContentAsync(Guid organizationId, Guid userId, ContentGenerationRequest request);
        Task<TranslationResult> TranslateContentAsync(Guid organizationId, TranslationRequest request);

        // Machine Learning Models
        Task<MLModel> CreateMLModelAsync(Guid organizationId, Guid userId, CreateMLModelRequest request);
        Task<List<MLModel>> GetMLModelsAsync(Guid organizationId, MLModelFilter? filter = null);
        Task<MLModel> GetMLModelAsync(Guid modelId);
        Task<MLModel> UpdateMLModelAsync(Guid modelId, Guid userId, UpdateMLModelRequest request);
        Task<bool> DeleteMLModelAsync(Guid modelId, Guid userId);
        Task<MLModelTraining> TrainMLModelAsync(Guid modelId, Guid userId, TrainMLModelRequest request);
        Task<MLModelPrediction> PredictWithMLModelAsync(Guid modelId, MLModelPredictionRequest request);
        Task<MLModelEvaluation> EvaluateMLModelAsync(Guid modelId, MLModelEvaluationRequest request);

        // Data Pipeline & Processing
        Task<DataPipeline> CreateDataPipelineAsync(Guid organizationId, Guid userId, CreateDataPipelineRequest request);
        Task<List<DataPipeline>> GetDataPipelinesAsync(Guid organizationId, DataPipelineFilter? filter = null);
        Task<DataPipeline> GetDataPipelineAsync(Guid pipelineId);
        Task<DataPipeline> UpdateDataPipelineAsync(Guid pipelineId, Guid userId, UpdateDataPipelineRequest request);
        Task<bool> DeleteDataPipelineAsync(Guid pipelineId, Guid userId);
        Task<DataPipelineExecution> RunDataPipelineAsync(Guid pipelineId, Guid userId, RunDataPipelineRequest request);
        Task<List<DataPipelineExecution>> GetDataPipelineExecutionsAsync(Guid pipelineId, DataPipelineExecutionFilter? filter = null);

        // AI Configuration & Management
        Task<AIConfiguration> CreateAIConfigurationAsync(Guid organizationId, Guid userId, CreateAIConfigurationRequest request);
        Task<List<AIConfiguration>> GetAIConfigurationsAsync(Guid organizationId, AIConfigurationFilter? filter = null);
        Task<AIConfiguration> GetAIConfigurationAsync(Guid configId);
        Task<AIConfiguration> UpdateAIConfigurationAsync(Guid configId, Guid userId, UpdateAIConfigurationRequest request);
        Task<bool> DeleteAIConfigurationAsync(Guid configId, Guid userId);
        Task<AIModelDeployment> DeployAIModelAsync(Guid modelId, Guid userId, DeployAIModelRequest request);
        Task<List<AIModelDeployment>> GetAIModelDeploymentsAsync(Guid organizationId, AIModelDeploymentFilter? filter = null);

        // Real-time Optimization
        Task<RealTimeOptimization> StartRealTimeOptimizationAsync(Guid gameInstanceId, Guid userId, StartRealTimeOptimizationRequest request);
        Task<bool> StopRealTimeOptimizationAsync(Guid gameInstanceId, Guid userId);
        Task<RealTimeOptimizationStatus> GetRealTimeOptimizationStatusAsync(Guid gameInstanceId);
        Task<List<RealTimeOptimizationMetric>> GetRealTimeOptimizationMetricsAsync(Guid gameInstanceId, RealTimeOptimizationMetricsFilter filter);
        Task<RealTimeOptimizationConfig> UpdateRealTimeOptimizationConfigAsync(Guid gameInstanceId, Guid userId, UpdateRealTimeOptimizationConfigRequest request);

        // AI Insights & Reporting
        Task<AIInsightsReport> GenerateAIInsightsReportAsync(Guid organizationId, Guid userId, GenerateAIInsightsReportRequest request);
        Task<List<AIInsight>> GetAIInsightsAsync(Guid organizationId, AIInsightFilter? filter = null);
        Task<AIPerformanceReport> GetAIPerformanceReportAsync(Guid organizationId, AIPerformanceReportRequest request);
        Task<List<AIRecommendation>> GetAIRecommendationsAsync(Guid organizationId, AIRecommendationFilter? filter = null);
        Task<AIModelMetrics> GetAIModelMetricsAsync(Guid modelId, AIModelMetricsFilter filter);
        Task<AISystemHealth> GetAISystemHealthAsync(Guid organizationId);

        // Experimental Features
        Task<ExperimentalFeature> CreateExperimentalFeatureAsync(Guid organizationId, Guid userId, CreateExperimentalFeatureRequest request);
        Task<List<ExperimentalFeature>> GetExperimentalFeaturesAsync(Guid organizationId, ExperimentalFeatureFilter? filter = null);
        Task<ExperimentalFeature> GetExperimentalFeatureAsync(Guid featureId);
        Task<ExperimentalFeature> UpdateExperimentalFeatureAsync(Guid featureId, Guid userId, UpdateExperimentalFeatureRequest request);
        Task<bool> DeleteExperimentalFeatureAsync(Guid featureId, Guid userId);
        Task<ExperimentResult> RunExperimentAsync(Guid featureId, Guid userId, RunExperimentRequest request);
        Task<List<ExperimentResult>> GetExperimentResultsAsync(Guid featureId, ExperimentResultFilter? filter = null);

        // AI Model Marketplace
        Task<AIModelMarketplace> CreateMarketplaceModelAsync(Guid organizationId, Guid userId, CreateMarketplaceModelRequest request);
        Task<List<AIModelMarketplace>> GetMarketplaceModelsAsync(Guid organizationId, MarketplaceModelFilter? filter = null);
        Task<AIModelMarketplace> GetMarketplaceModelAsync(Guid modelId);
        Task<AIModelMarketplace> UpdateMarketplaceModelAsync(Guid modelId, Guid userId, UpdateMarketplaceModelRequest request);
        Task<bool> DeleteMarketplaceModelAsync(Guid modelId, Guid userId);
        Task<AIModelPurchase> PurchaseMarketplaceModelAsync(Guid modelId, Guid userId, PurchaseMarketplaceModelRequest request);
        Task<List<AIModelPurchase>> GetMarketplaceModelPurchasesAsync(Guid organizationId, MarketplaceModelPurchaseFilter? filter = null);
    }
}