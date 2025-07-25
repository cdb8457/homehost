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
    public class SocialDiscoveryController : ControllerBase
    {
        private readonly ISocialDiscoveryService _discoveryService;
        private readonly ILogger<SocialDiscoveryController> _logger;

        public SocialDiscoveryController(ISocialDiscoveryService discoveryService, ILogger<SocialDiscoveryController> logger)
        {
            _discoveryService = discoveryService;
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

        // Community Discovery
        [HttpPost("communities")]
        public async Task<ActionResult<DiscoveryResults<Community>>> DiscoverCommunities(DiscoveryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var results = await _discoveryService.DiscoverCommunitiesAsync(userId, request);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error discovering communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities/recommended")]
        public async Task<ActionResult<List<Community>>> GetRecommendedCommunities([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var communities = await _discoveryService.GetRecommendedCommunitiesAsync(userId, limit);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities/trending")]
        [AllowAnonymous]
        public async Task<ActionResult<List<Community>>> GetTrendingCommunities([FromQuery] string? gameType = null, [FromQuery] int limit = 10)
        {
            try
            {
                var communities = await _discoveryService.GetTrendingCommunitiesAsync(gameType, limit);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trending communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities/{communityId}/similar")]
        [AllowAnonymous]
        public async Task<ActionResult<List<Community>>> GetSimilarCommunities(Guid communityId, [FromQuery] int limit = 5)
        {
            try
            {
                var communities = await _discoveryService.GetSimilarCommunitiesAsync(communityId, limit);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting similar communities for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities/{communityId}/match")]
        public async Task<ActionResult<CommunityMatchScore>> GetCommunityMatch(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var matchScore = await _discoveryService.GetCommunityMatchAsync(userId, communityId);
                return Ok(matchScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community match for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Server Discovery
        [HttpPost("servers")]
        public async Task<ActionResult<DiscoveryResults<GameServer>>> DiscoverServers(ServerDiscoveryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var results = await _discoveryService.DiscoverServersAsync(userId, request);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error discovering servers");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/recommended")]
        public async Task<ActionResult<List<GameServer>>> GetRecommendedServers([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var servers = await _discoveryService.GetRecommendedServersAsync(userId, limit);
                return Ok(servers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended servers");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/popular")]
        [AllowAnonymous]
        public async Task<ActionResult<List<GameServer>>> GetPopularServers([FromQuery] string? gameType = null, [FromQuery] int limit = 10)
        {
            try
            {
                var servers = await _discoveryService.GetPopularServersAsync(gameType, limit);
                return Ok(servers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular servers");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/friends")]
        public async Task<ActionResult<List<GameServer>>> GetFriendsServers([FromQuery] int limit = 20)
        {
            try
            {
                var userId = GetUserId();
                var servers = await _discoveryService.GetFriendsServersAsync(userId, limit);
                return Ok(servers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting friends servers");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/match")]
        public async Task<ActionResult<ServerMatchScore>> GetServerMatch(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var matchScore = await _discoveryService.GetServerMatchAsync(userId, serverId);
                return Ok(matchScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server match for {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Player Discovery
        [HttpPost("players")]
        public async Task<ActionResult<DiscoveryResults<PlayerProfile>>> DiscoverPlayers(PlayerDiscoveryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var results = await _discoveryService.DiscoverPlayersAsync(userId, request);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error discovering players");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/recommended")]
        public async Task<ActionResult<List<PlayerProfile>>> GetRecommendedPlayers([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var players = await _discoveryService.GetRecommendedPlayersAsync(userId, limit);
                return Ok(players);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended players");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/similar")]
        public async Task<ActionResult<List<PlayerProfile>>> GetSimilarPlayers([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var players = await _discoveryService.GetSimilarPlayersAsync(userId, limit);
                return Ok(players);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting similar players");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/community/{communityId}")]
        public async Task<ActionResult<List<PlayerProfile>>> GetPlayersInCommunity(Guid communityId, [FromQuery] int limit = 20)
        {
            try
            {
                var userId = GetUserId();
                var players = await _discoveryService.GetPlayersInCommunityAsync(userId, communityId, limit);
                return Ok(players);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting players in community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/{targetUserId}/match")]
        public async Task<ActionResult<PlayerMatchScore>> GetPlayerMatch(Guid targetUserId)
        {
            try
            {
                var userId = GetUserId();
                var matchScore = await _discoveryService.GetPlayerMatchAsync(userId, targetUserId);
                return Ok(matchScore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player match for {TargetUserId}", targetUserId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Game Discovery
        [HttpPost("games")]
        public async Task<ActionResult<DiscoveryResults<Game>>> DiscoverGames(GameDiscoveryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var results = await _discoveryService.DiscoverGamesAsync(userId, request);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error discovering games");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("games/recommended")]
        public async Task<ActionResult<List<Game>>> GetRecommendedGames([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var games = await _discoveryService.GetRecommendedGamesAsync(userId, limit);
                return Ok(games);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended games");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("games/trending")]
        [AllowAnonymous]
        public async Task<ActionResult<List<Game>>> GetTrendingGames([FromQuery] int limit = 10)
        {
            try
            {
                var games = await _discoveryService.GetTrendingGamesAsync(limit);
                return Ok(games);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trending games");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("games/{gameId}/similar")]
        [AllowAnonymous]
        public async Task<ActionResult<List<Game>>> GetSimilarGames(string gameId, [FromQuery] int limit = 5)
        {
            try
            {
                var games = await _discoveryService.GetSimilarGamesAsync(gameId, limit);
                return Ok(games);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting similar games for {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Social Signals & Analytics
        [HttpGet("insights")]
        public async Task<ActionResult<SocialInsights>> GetSocialInsights()
        {
            try
            {
                var userId = GetUserId();
                var insights = await _discoveryService.GetUserSocialInsightsAsync(userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting social insights");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics")]
        public async Task<ActionResult<DiscoveryAnalytics>> GetDiscoveryAnalytics([FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _discoveryService.GetDiscoveryAnalyticsAsync(userId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discovery analytics");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("trends/{category}")]
        [AllowAnonymous]
        public async Task<ActionResult<List<SocialTrend>>> GetSocialTrends(string category, [FromQuery] int limit = 10)
        {
            try
            {
                var trends = await _discoveryService.GetSocialTrendsAsync(category, limit);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting social trends for {Category}", category);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Interest Profiling
        [HttpGet("profile")]
        public async Task<ActionResult<UserInterestProfile>> GetInterestProfile()
        {
            try
            {
                var userId = GetUserId();
                var profile = await _discoveryService.GetUserInterestProfileAsync(userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting interest profile");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<UserInterestProfile>> UpdateInterestProfile(UpdateInterestProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _discoveryService.UpdateUserInterestProfileAsync(userId, request);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating interest profile");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recommendations/{category}")]
        public async Task<ActionResult<List<InterestMatch>>> GetInterestBasedRecommendations(string category, [FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var recommendations = await _discoveryService.GetInterestBasedRecommendationsAsync(userId, category, limit);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting interest based recommendations for {Category}", category);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Discovery History & Feedback
        [HttpPost("actions")]
        public async Task<ActionResult> RecordDiscoveryAction(DiscoveryAction action)
        {
            try
            {
                var userId = GetUserId();
                var success = await _discoveryService.RecordDiscoveryActionAsync(userId, action);
                if (success)
                    return Ok();
                else
                    return BadRequest();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording discovery action");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("history")]
        public async Task<ActionResult<List<DiscoveryAction>>> GetDiscoveryHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetUserId();
                var history = await _discoveryService.GetDiscoveryHistoryAsync(userId, page, pageSize);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discovery history");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("feedback")]
        public async Task<ActionResult> ProvideDiscoveryFeedback(DiscoveryFeedback feedback)
        {
            try
            {
                var userId = GetUserId();
                var success = await _discoveryService.ProvideDiscoveryFeedbackAsync(userId, feedback);
                if (success)
                    return Ok();
                else
                    return BadRequest();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error providing discovery feedback");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("preferences")]
        public async Task<ActionResult<DiscoveryPreferences>> GetDiscoveryPreferences()
        {
            try
            {
                var userId = GetUserId();
                var preferences = await _discoveryService.GetDiscoveryPreferencesAsync(userId);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discovery preferences");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("preferences")]
        public async Task<ActionResult<DiscoveryPreferences>> UpdateDiscoveryPreferences(UpdateDiscoveryPreferencesRequest request)
        {
            try
            {
                var userId = GetUserId();
                var preferences = await _discoveryService.UpdateDiscoveryPreferencesAsync(userId, request);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating discovery preferences");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Advanced Discovery Features
        [HttpGet("events")]
        public async Task<ActionResult<List<DiscoveryEvent>>> GetDiscoveryEvents([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var events = await _discoveryService.GetDiscoveryEventsAsync(userId, limit);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting discovery events");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cross-game-recommendations")]
        public async Task<ActionResult<List<CrossGameRecommendation>>> GetCrossGameRecommendations([FromQuery] int limit = 5)
        {
            try
            {
                var userId = GetUserId();
                var recommendations = await _discoveryService.GetCrossGameRecommendationsAsync(userId, limit);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-game recommendations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("serendipity")]
        public async Task<ActionResult<SerendipityRecommendations>> GetSerendipityRecommendations()
        {
            try
            {
                var userId = GetUserId();
                var recommendations = await _discoveryService.GetSerendipityRecommendationsAsync(userId);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting serendipity recommendations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("social-graph")]
        public async Task<ActionResult<SocialGraphInsights>> GetSocialGraphInsights()
        {
            try
            {
                var userId = GetUserId();
                var insights = await _discoveryService.GetSocialGraphInsightsAsync(userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting social graph insights");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}