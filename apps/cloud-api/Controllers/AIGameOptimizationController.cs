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
    public class AIGameOptimizationController : ControllerBase
    {
        private readonly IAIGameOptimizationService _aiGameOptimizationService;
        private readonly ILogger<AIGameOptimizationController> _logger;

        public AIGameOptimizationController(
            IAIGameOptimizationService aiGameOptimizationService,
            ILogger<AIGameOptimizationController> logger)
        {
            _aiGameOptimizationService = aiGameOptimizationService;
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

        // Performance Analysis & Optimization
        [HttpPost("servers/{serverId}/analyze-performance")]
        public async Task<ActionResult<PerformanceAnalysis>> AnalyzeServerPerformance(Guid serverId, PerformanceAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzeServerPerformanceAsync(serverId, request);
                return Ok(analysis);
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

        [HttpGet("servers/{serverId}/optimization-recommendations")]
        public async Task<ActionResult<List<OptimizationRecommendation>>> GetOptimizationRecommendations(Guid serverId, [FromQuery] OptimizationFilter filter)
        {
            try
            {
                var recommendations = await _aiGameOptimizationService.GetOptimizationRecommendationsAsync(serverId, filter);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization recommendations for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/apply-optimization")]
        public async Task<ActionResult<OptimizationResult>> ApplyOptimization(Guid serverId, ApplyOptimizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _aiGameOptimizationService.ApplyOptimizationAsync(serverId, userId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying optimization for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/performance-metrics")]
        public async Task<ActionResult<List<PerformanceMetric>>> GetPerformanceMetrics(Guid serverId, [FromQuery] PerformanceMetricsFilter filter)
        {
            try
            {
                var metrics = await _aiGameOptimizationService.GetPerformanceMetricsAsync(serverId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting performance metrics for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/predict-performance")]
        public async Task<ActionResult<PerformancePrediction>> PredictPerformance(Guid serverId, PerformancePredictionRequest request)
        {
            try
            {
                var prediction = await _aiGameOptimizationService.PredictPerformanceAsync(serverId, request);
                return Ok(prediction);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting performance for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/benchmark")]
        public async Task<ActionResult<BenchmarkResult>> RunPerformanceBenchmark(Guid serverId, BenchmarkRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _aiGameOptimizationService.RunPerformanceBenchmarkAsync(serverId, userId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running performance benchmark for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Player Behavior Analysis
        [HttpPost("players/{playerId}/analyze-behavior")]
        public async Task<ActionResult<PlayerBehaviorAnalysis>> AnalyzePlayerBehavior(Guid playerId, PlayerBehaviorAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzePlayerBehaviorAsync(playerId, request);
                return Ok(analysis);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing player behavior for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/player-segments")]
        public async Task<ActionResult<List<PlayerSegment>>> GetPlayerSegments(Guid organizationId, [FromQuery] PlayerSegmentFilter filter)
        {
            try
            {
                var segments = await _aiGameOptimizationService.GetPlayerSegmentsAsync(organizationId, filter);
                return Ok(segments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player segments for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/player-segments")]
        public async Task<ActionResult<PlayerSegment>> CreatePlayerSegment(Guid organizationId, CreatePlayerSegmentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var segment = await _aiGameOptimizationService.CreatePlayerSegmentAsync(organizationId, userId, request);
                return Ok(segment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating player segment for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/{playerId}/engagement-insights")]
        public async Task<ActionResult<PlayerEngagementInsights>> GetPlayerEngagementInsights(Guid playerId, [FromQuery] EngagementInsightsFilter filter)
        {
            try
            {
                var insights = await _aiGameOptimizationService.GetPlayerEngagementInsightsAsync(playerId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player engagement insights for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/predict-churn")]
        public async Task<ActionResult<List<PlayerChurnPrediction>>> PredictPlayerChurn(Guid organizationId, ChurnPredictionRequest request)
        {
            try
            {
                var predictions = await _aiGameOptimizationService.PredictPlayerChurnAsync(organizationId, request);
                return Ok(predictions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting player churn for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analyze-retention")]
        public async Task<ActionResult<PlayerRetentionAnalysis>> AnalyzePlayerRetention(Guid organizationId, RetentionAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzePlayerRetentionAsync(organizationId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing player retention for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("players/{playerId}/calculate-lifetime-value")]
        public async Task<ActionResult<PlayerLifetimeValue>> CalculatePlayerLifetimeValue(Guid playerId, PLVCalculationRequest request)
        {
            try
            {
                var plv = await _aiGameOptimizationService.CalculatePlayerLifetimeValueAsync(playerId, request);
                return Ok(plv);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating player lifetime value for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Dynamic Content Optimization
        [HttpPost("game-instances/{gameInstanceId}/optimize-content")]
        public async Task<ActionResult<ContentOptimization>> OptimizeGameContent(Guid gameInstanceId, ContentOptimizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var optimization = await _aiGameOptimizationService.OptimizeGameContentAsync(gameInstanceId, userId, request);
                return Ok(optimization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error optimizing game content for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("players/{playerId}/game-instances/{gameInstanceId}/recommend-difficulty")]
        public async Task<ActionResult<DifficultyRecommendation>> RecommendDifficultyAdjustment(Guid playerId, Guid gameInstanceId, DifficultyAnalysisRequest request)
        {
            try
            {
                var recommendation = await _aiGameOptimizationService.RecommendDifficultyAdjustmentAsync(playerId, gameInstanceId, request);
                return Ok(recommendation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recommending difficulty adjustment for player {PlayerId} in game {GameInstanceId}", playerId, gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/{playerId}/content-recommendations")]
        public async Task<ActionResult<List<ContentRecommendation>>> GetContentRecommendations(Guid playerId, [FromQuery] ContentRecommendationFilter filter)
        {
            try
            {
                var recommendations = await _aiGameOptimizationService.GetContentRecommendationsAsync(playerId, filter);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting content recommendations for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/analyze-balance")]
        public async Task<ActionResult<GameBalanceAnalysis>> AnalyzeGameBalance(Guid gameInstanceId, GameBalanceAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzeGameBalanceAsync(gameInstanceId, request);
                return Ok(analysis);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing game balance for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-instances/{gameInstanceId}/balance-adjustments")]
        public async Task<ActionResult<List<GameBalanceAdjustment>>> GetBalanceAdjustments(Guid gameInstanceId, [FromQuery] BalanceAdjustmentFilter filter)
        {
            try
            {
                var adjustments = await _aiGameOptimizationService.GetBalanceAdjustmentsAsync(gameInstanceId, filter);
                return Ok(adjustments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting balance adjustments for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/apply-balance-adjustment")]
        public async Task<ActionResult> ApplyGameBalanceAdjustment(Guid gameInstanceId, ApplyBalanceAdjustmentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _aiGameOptimizationService.ApplyGameBalanceAdjustmentAsync(gameInstanceId, userId, request);
                return Ok(new { success, message = success ? "Balance adjustment applied successfully" : "Failed to apply balance adjustment" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying balance adjustment for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Intelligent Matchmaking
        [HttpPost("game-instances/{gameInstanceId}/optimize-matchmaking")]
        public async Task<ActionResult<MatchmakingOptimization>> OptimizeMatchmaking(Guid gameInstanceId, MatchmakingOptimizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var optimization = await _aiGameOptimizationService.OptimizeMatchmakingAsync(gameInstanceId, userId, request);
                return Ok(optimization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error optimizing matchmaking for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-instances/{gameInstanceId}/matchmaking-pools")]
        public async Task<ActionResult<List<MatchmakingPool>>> GetMatchmakingPools(Guid gameInstanceId, [FromQuery] MatchmakingPoolFilter filter)
        {
            try
            {
                var pools = await _aiGameOptimizationService.GetMatchmakingPoolsAsync(gameInstanceId, filter);
                return Ok(pools);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting matchmaking pools for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/matchmaking-pools")]
        public async Task<ActionResult<MatchmakingPool>> CreateMatchmakingPool(Guid gameInstanceId, CreateMatchmakingPoolRequest request)
        {
            try
            {
                var userId = GetUserId();
                var pool = await _aiGameOptimizationService.CreateMatchmakingPoolAsync(gameInstanceId, userId, request);
                return Ok(pool);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating matchmaking pool for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/predict-match")]
        public async Task<ActionResult<MatchPrediction>> PredictMatchOutcome(Guid gameInstanceId, MatchPredictionRequest request)
        {
            try
            {
                var prediction = await _aiGameOptimizationService.PredictMatchOutcomeAsync(gameInstanceId, request);
                return Ok(prediction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting match outcome for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-instances/{gameInstanceId}/matchmaking-metrics")]
        public async Task<ActionResult<MatchmakingMetrics>> GetMatchmakingMetrics(Guid gameInstanceId, [FromQuery] MatchmakingMetricsFilter filter)
        {
            try
            {
                var metrics = await _aiGameOptimizationService.GetMatchmakingMetricsAsync(gameInstanceId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting matchmaking metrics for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("players/{playerId}/game-instances/{gameInstanceId}/calculate-skill-rating")]
        public async Task<ActionResult<SkillRating>> CalculatePlayerSkillRating(Guid playerId, Guid gameInstanceId, SkillRatingRequest request)
        {
            try
            {
                var rating = await _aiGameOptimizationService.CalculatePlayerSkillRatingAsync(playerId, gameInstanceId, request);
                return Ok(rating);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating skill rating for player {PlayerId} in game {GameInstanceId}", playerId, gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Machine Learning Models
        [HttpPost("organizations/{organizationId}/ml-models")]
        public async Task<ActionResult<MLModel>> CreateMLModel(Guid organizationId, CreateMLModelRequest request)
        {
            try
            {
                var userId = GetUserId();
                var model = await _aiGameOptimizationService.CreateMLModelAsync(organizationId, userId, request);
                return Ok(model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating ML model for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/ml-models")]
        public async Task<ActionResult<List<MLModel>>> GetMLModels(Guid organizationId, [FromQuery] MLModelFilter filter)
        {
            try
            {
                var models = await _aiGameOptimizationService.GetMLModelsAsync(organizationId, filter);
                return Ok(models);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ML models for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("ml-models/{modelId}")]
        public async Task<ActionResult<MLModel>> GetMLModel(Guid modelId)
        {
            try
            {
                var model = await _aiGameOptimizationService.GetMLModelAsync(modelId);
                return Ok(model);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ML model {ModelId}", modelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("ml-models/{modelId}")]
        public async Task<ActionResult<MLModel>> UpdateMLModel(Guid modelId, UpdateMLModelRequest request)
        {
            try
            {
                var userId = GetUserId();
                var model = await _aiGameOptimizationService.UpdateMLModelAsync(modelId, userId, request);
                return Ok(model);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating ML model {ModelId}", modelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("ml-models/{modelId}")]
        public async Task<ActionResult> DeleteMLModel(Guid modelId)
        {
            try
            {
                var userId = GetUserId();
                await _aiGameOptimizationService.DeleteMLModelAsync(modelId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting ML model {ModelId}", modelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("ml-models/{modelId}/train")]
        public async Task<ActionResult<MLModelTraining>> TrainMLModel(Guid modelId, TrainMLModelRequest request)
        {
            try
            {
                var userId = GetUserId();
                var training = await _aiGameOptimizationService.TrainMLModelAsync(modelId, userId, request);
                return Ok(training);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error training ML model {ModelId}", modelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("ml-models/{modelId}/predict")]
        public async Task<ActionResult<MLModelPrediction>> PredictWithMLModel(Guid modelId, MLModelPredictionRequest request)
        {
            try
            {
                var prediction = await _aiGameOptimizationService.PredictWithMLModelAsync(modelId, request);
                return Ok(prediction);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error making prediction with ML model {ModelId}", modelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("ml-models/{modelId}/evaluate")]
        public async Task<ActionResult<MLModelEvaluation>> EvaluateMLModel(Guid modelId, MLModelEvaluationRequest request)
        {
            try
            {
                var evaluation = await _aiGameOptimizationService.EvaluateMLModelAsync(modelId, request);
                return Ok(evaluation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error evaluating ML model {ModelId}", modelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Anti-Cheat & Security
        [HttpPost("game-instances/{gameInstanceId}/analyze-cheat-detection")]
        public async Task<ActionResult<CheatDetectionAnalysis>> AnalyzeCheatDetection(Guid gameInstanceId, CheatDetectionRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzeCheatDetectionAsync(gameInstanceId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing cheat detection for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/predict-cheat-behavior")]
        public async Task<ActionResult<List<CheatPrediction>>> PredictCheatBehavior(Guid gameInstanceId, CheatPredictionRequest request)
        {
            try
            {
                var predictions = await _aiGameOptimizationService.PredictCheatBehaviorAsync(gameInstanceId, request);
                return Ok(predictions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting cheat behavior for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/analyze-security-threats")]
        public async Task<ActionResult<SecurityThreatAnalysis>> AnalyzeSecurityThreats(Guid gameInstanceId, SecurityThreatAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzeSecurityThreatsAsync(gameInstanceId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing security threats for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-instances/{gameInstanceId}/security-recommendations")]
        public async Task<ActionResult<List<SecurityRecommendation>>> GetSecurityRecommendations(Guid gameInstanceId, [FromQuery] SecurityRecommendationFilter filter)
        {
            try
            {
                var recommendations = await _aiGameOptimizationService.GetSecurityRecommendationsAsync(gameInstanceId, filter);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting security recommendations for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("transactions/{transactionId}/detect-fraud")]
        public async Task<ActionResult<FraudDetectionResult>> DetectFraud(Guid transactionId, FraudDetectionRequest request)
        {
            try
            {
                var result = await _aiGameOptimizationService.DetectFraudAsync(transactionId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting fraud for transaction {TransactionId}", transactionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/detect-anomalies")]
        public async Task<ActionResult<AnomalyDetectionResult>> DetectAnomalies(Guid gameInstanceId, AnomalyDetectionRequest request)
        {
            try
            {
                var result = await _aiGameOptimizationService.DetectAnomaliesAsync(gameInstanceId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting anomalies for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Predictive Analytics
        [HttpPost("game-instances/{gameInstanceId}/predict-demand")]
        public async Task<ActionResult<PlayerDemandPrediction>> PredictPlayerDemand(Guid gameInstanceId, DemandPredictionRequest request)
        {
            try
            {
                var prediction = await _aiGameOptimizationService.PredictPlayerDemandAsync(gameInstanceId, request);
                return Ok(prediction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting player demand for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/predict-load")]
        public async Task<ActionResult<ServerLoadPrediction>> PredictServerLoad(Guid serverId, LoadPredictionRequest request)
        {
            try
            {
                var prediction = await _aiGameOptimizationService.PredictServerLoadAsync(serverId, request);
                return Ok(prediction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting server load for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/project-revenue")]
        public async Task<ActionResult<RevenueProjection>> ProjectRevenue(Guid organizationId, RevenueProjectionRequest request)
        {
            try
            {
                var projection = await _aiGameOptimizationService.ProjectRevenueAsync(organizationId, request);
                return Ok(projection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error projecting revenue for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analyze-market-trends")]
        public async Task<ActionResult<MarketTrendAnalysis>> AnalyzeMarketTrends(Guid organizationId, MarketTrendAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzeMarketTrendsAsync(organizationId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing market trends for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analyze-competitors")]
        public async Task<ActionResult<CompetitorAnalysis>> AnalyzeCompetitors(Guid organizationId, CompetitorAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzeCompetitorsAsync(organizationId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing competitors for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/project-growth")]
        public async Task<ActionResult<GrowthProjection>> ProjectGrowth(Guid organizationId, GrowthProjectionRequest request)
        {
            try
            {
                var projection = await _aiGameOptimizationService.ProjectGrowthAsync(organizationId, request);
                return Ok(projection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error projecting growth for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Natural Language Processing
        [HttpPost("chat-rooms/{chatRoomId}/moderate")]
        public async Task<ActionResult<ChatModerationResult>> ModerateChat(Guid chatRoomId, ChatModerationRequest request)
        {
            try
            {
                var result = await _aiGameOptimizationService.ModerateChatAsync(chatRoomId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error moderating chat for room {ChatRoomId}", chatRoomId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/analyze-sentiment")]
        public async Task<ActionResult<SentimentAnalysis>> AnalyzeSentiment(Guid organizationId, SentimentAnalysisRequest request)
        {
            try
            {
                var analysis = await _aiGameOptimizationService.AnalyzeSentimentAsync(organizationId, request);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing sentiment for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("chat-rooms/{chatRoomId}/insights")]
        public async Task<ActionResult<List<ChatInsight>>> GetChatInsights(Guid chatRoomId, [FromQuery] ChatInsightFilter filter)
        {
            try
            {
                var insights = await _aiGameOptimizationService.GetChatInsightsAsync(chatRoomId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting chat insights for room {ChatRoomId}", chatRoomId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/detect-language")]
        public async Task<ActionResult<LanguageDetectionResult>> DetectLanguage(Guid organizationId, LanguageDetectionRequest request)
        {
            try
            {
                var result = await _aiGameOptimizationService.DetectLanguageAsync(organizationId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting language for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/generate-content")]
        public async Task<ActionResult<ContentGenerationResult>> GenerateContent(Guid organizationId, ContentGenerationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _aiGameOptimizationService.GenerateContentAsync(organizationId, userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating content for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/translate")]
        public async Task<ActionResult<TranslationResult>> TranslateContent(Guid organizationId, TranslationRequest request)
        {
            try
            {
                var result = await _aiGameOptimizationService.TranslateContentAsync(organizationId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error translating content for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // AI Insights & Reporting
        [HttpPost("organizations/{organizationId}/generate-insights-report")]
        public async Task<ActionResult<AIInsightsReport>> GenerateAIInsightsReport(Guid organizationId, GenerateAIInsightsReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _aiGameOptimizationService.GenerateAIInsightsReportAsync(organizationId, userId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI insights report for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/ai-insights")]
        public async Task<ActionResult<List<AIInsight>>> GetAIInsights(Guid organizationId, [FromQuery] AIInsightFilter filter)
        {
            try
            {
                var insights = await _aiGameOptimizationService.GetAIInsightsAsync(organizationId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI insights for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/ai-performance-report")]
        public async Task<ActionResult<AIPerformanceReport>> GetAIPerformanceReport(Guid organizationId, AIPerformanceReportRequest request)
        {
            try
            {
                var report = await _aiGameOptimizationService.GetAIPerformanceReportAsync(organizationId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI performance report for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/ai-recommendations")]
        public async Task<ActionResult<List<AIRecommendation>>> GetAIRecommendations(Guid organizationId, [FromQuery] AIRecommendationFilter filter)
        {
            try
            {
                var recommendations = await _aiGameOptimizationService.GetAIRecommendationsAsync(organizationId, filter);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI recommendations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("ml-models/{modelId}/metrics")]
        public async Task<ActionResult<AIModelMetrics>> GetAIModelMetrics(Guid modelId, [FromQuery] AIModelMetricsFilter filter)
        {
            try
            {
                var metrics = await _aiGameOptimizationService.GetAIModelMetricsAsync(modelId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI model metrics for model {ModelId}", modelId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/ai-system-health")]
        public async Task<ActionResult<AISystemHealth>> GetAISystemHealth(Guid organizationId)
        {
            try
            {
                var health = await _aiGameOptimizationService.GetAISystemHealthAsync(organizationId);
                return Ok(health);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting AI system health for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Real-time Optimization
        [HttpPost("game-instances/{gameInstanceId}/start-real-time-optimization")]
        public async Task<ActionResult<RealTimeOptimization>> StartRealTimeOptimization(Guid gameInstanceId, StartRealTimeOptimizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var optimization = await _aiGameOptimizationService.StartRealTimeOptimizationAsync(gameInstanceId, userId, request);
                return Ok(optimization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting real-time optimization for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("game-instances/{gameInstanceId}/stop-real-time-optimization")]
        public async Task<ActionResult> StopRealTimeOptimization(Guid gameInstanceId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _aiGameOptimizationService.StopRealTimeOptimizationAsync(gameInstanceId, userId);
                return Ok(new { success, message = success ? "Real-time optimization stopped successfully" : "Failed to stop real-time optimization" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping real-time optimization for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-instances/{gameInstanceId}/real-time-optimization-status")]
        public async Task<ActionResult<RealTimeOptimizationStatus>> GetRealTimeOptimizationStatus(Guid gameInstanceId)
        {
            try
            {
                var status = await _aiGameOptimizationService.GetRealTimeOptimizationStatusAsync(gameInstanceId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time optimization status for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-instances/{gameInstanceId}/real-time-optimization-metrics")]
        public async Task<ActionResult<List<RealTimeOptimizationMetric>>> GetRealTimeOptimizationMetrics(Guid gameInstanceId, [FromQuery] RealTimeOptimizationMetricsFilter filter)
        {
            try
            {
                var metrics = await _aiGameOptimizationService.GetRealTimeOptimizationMetricsAsync(gameInstanceId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting real-time optimization metrics for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("game-instances/{gameInstanceId}/real-time-optimization-config")]
        public async Task<ActionResult<RealTimeOptimizationConfig>> UpdateRealTimeOptimizationConfig(Guid gameInstanceId, UpdateRealTimeOptimizationConfigRequest request)
        {
            try
            {
                var userId = GetUserId();
                var config = await _aiGameOptimizationService.UpdateRealTimeOptimizationConfigAsync(gameInstanceId, userId, request);
                return Ok(config);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating real-time optimization config for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}