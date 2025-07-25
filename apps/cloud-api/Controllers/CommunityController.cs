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
    public class CommunityController : ControllerBase
    {
        private readonly ICommunityService _communityService;
        private readonly ILogger<CommunityController> _logger;

        public CommunityController(ICommunityService communityService, ILogger<CommunityController> logger)
        {
            _communityService = communityService;
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

        // Community Profile Management
        [HttpPost]
        public async Task<ActionResult<Community>> CreateCommunity(CreateCommunityRequest request)
        {
            try
            {
                var userId = GetUserId();
                var community = await _communityService.CreateCommunityAsync(request, userId);
                return CreatedAtAction(nameof(GetCommunity), new { id = community.Id }, community);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating community");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Community>> GetCommunity(Guid id)
        {
            try
            {
                var community = await _communityService.GetCommunityAsync(id);
                if (community == null)
                    return NotFound();

                return Ok(community);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<Community>> GetCommunityBySlug(string slug)
        {
            try
            {
                var community = await _communityService.GetCommunityBySlugAsync(slug);
                if (community == null)
                    return NotFound();

                return Ok(community);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community by slug {Slug}", slug);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-communities")]
        public async Task<ActionResult<List<Community>>> GetMyCommunities()
        {
            try
            {
                var userId = GetUserId();
                var communities = await _communityService.GetUserCommunitiesAsync(userId);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Community>> UpdateCommunity(Guid id, UpdateCommunityRequest request)
        {
            try
            {
                var userId = GetUserId();
                var community = await _communityService.UpdateCommunityAsync(id, request, userId);
                return Ok(community);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating community {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCommunity(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var success = await _communityService.DeleteCommunityAsync(id, userId);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting community {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Community Discovery
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<List<Community>>> SearchCommunities([FromQuery] CommunitySearchRequest request)
        {
            try
            {
                var communities = await _communityService.SearchCommunitiesAsync(request);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("trending")]
        [AllowAnonymous]
        public async Task<ActionResult<List<Community>>> GetTrendingCommunities([FromQuery] int limit = 10)
        {
            try
            {
                var communities = await _communityService.GetTrendingCommunitiesAsync(limit);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting trending communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recommended")]
        public async Task<ActionResult<List<Community>>> GetRecommendedCommunities([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var communities = await _communityService.GetRecommendedCommunitiesAsync(userId, limit);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("popular")]
        [AllowAnonymous]
        public async Task<ActionResult<List<Community>>> GetPopularCommunities([FromQuery] int limit = 10)
        {
            try
            {
                var communities = await _communityService.GetPopularCommunitiesAsync(limit);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting popular communities");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("by-game/{gameId}")]
        [AllowAnonymous]
        public async Task<ActionResult<CommunitySearchResults>> GetCommunitiesByGame(string gameId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                var results = await _communityService.GetCommunitiesByGameAsync(gameId, page, pageSize);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting communities by game {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Member Management
        [HttpPost("{id}/join")]
        public async Task<ActionResult<CommunityMember>> JoinCommunity(Guid id, JoinCommunityRequest? request = null)
        {
            try
            {
                var userId = GetUserId();
                var member = await _communityService.JoinCommunityAsync(id, userId, request);
                return Ok(member);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining community {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("{id}/leave")]
        public async Task<ActionResult> LeaveCommunity(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var success = await _communityService.LeaveCommunityAsync(id, userId);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving community {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/members")]
        public async Task<ActionResult<List<CommunityMember>>> GetCommunityMembers(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                var members = await _communityService.GetCommunityMembersAsync(id, page, pageSize);
                return Ok(members);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community members {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/members/{userId}")]
        public async Task<ActionResult<CommunityMember>> GetCommunityMember(Guid id, Guid userId)
        {
            try
            {
                var member = await _communityService.GetCommunityMemberAsync(id, userId);
                if (member == null)
                    return NotFound();

                return Ok(member);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community member {CommunityId}/{UserId}", id, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/members/{userId}/role")]
        public async Task<ActionResult<CommunityMember>> UpdateMemberRole(Guid id, Guid userId, [FromBody] UpdateMemberRoleRequest request)
        {
            try
            {
                var adminUserId = GetUserId();
                var member = await _communityService.UpdateMemberRoleAsync(id, userId, request.Role, adminUserId);
                return Ok(member);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member role {CommunityId}/{UserId}", id, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/members/{userId}")]
        public async Task<ActionResult> RemoveMember(Guid id, Guid userId)
        {
            try
            {
                var adminUserId = GetUserId();
                var success = await _communityService.RemoveMemberAsync(id, userId, adminUserId);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing member {CommunityId}/{UserId}", id, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Server Association
        [HttpPost("{id}/servers/{serverId}")]
        public async Task<ActionResult> AddServerToCommunity(Guid id, Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _communityService.AddServerToCommunityAsync(id, serverId, userId);
                if (!success)
                    return BadRequest();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding server to community {CommunityId}/{ServerId}", id, serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/servers/{serverId}")]
        public async Task<ActionResult> RemoveServerFromCommunity(Guid id, Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _communityService.RemoveServerFromCommunityAsync(id, serverId, userId);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing server from community {CommunityId}/{ServerId}", id, serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/servers")]
        public async Task<ActionResult<List<GameServer>>> GetCommunityServers(Guid id)
        {
            try
            {
                var servers = await _communityService.GetCommunityServersAsync(id);
                return Ok(servers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community servers {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Community Analytics
        [HttpGet("{id}/analytics")]
        public async Task<ActionResult<CommunityAnalytics>> GetCommunityAnalytics(Guid id, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _communityService.GetCommunityAnalyticsAsync(id, userId, startDate, endDate);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community analytics {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/growth-metrics")]
        public async Task<ActionResult<CommunityGrowthMetrics>> GetGrowthMetrics(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var metrics = await _communityService.GetGrowthMetricsAsync(id, userId);
                return Ok(metrics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting growth metrics {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/insights")]
        public async Task<ActionResult<List<CommunityInsight>>> GetCommunityInsights(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var insights = await _communityService.GetCommunityInsightsAsync(id, userId);
                return Ok(insights);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community insights {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Invitation System
        [HttpPost("{id}/invitations")]
        public async Task<ActionResult<CommunityInvitation>> CreateInvitation(Guid id, CreateInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _communityService.CreateInvitationAsync(id, request, userId);
                return Ok(invitation);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating invitation {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("invitations/{inviteCode}")]
        [AllowAnonymous]
        public async Task<ActionResult<CommunityInvitation>> GetInvitation(string inviteCode)
        {
            try
            {
                var invitation = await _communityService.GetInvitationAsync(inviteCode);
                if (invitation == null)
                    return NotFound();

                return Ok(invitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invitation {InviteCode}", inviteCode);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("invitations/{inviteCode}/accept")]
        public async Task<ActionResult<CommunityMember>> AcceptInvitation(string inviteCode)
        {
            try
            {
                var userId = GetUserId();
                var member = await _communityService.AcceptInvitationAsync(inviteCode, userId);
                return Ok(member);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting invitation {InviteCode}", inviteCode);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("invitations/{invitationId}")]
        public async Task<ActionResult> RevokeInvitation(Guid invitationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _communityService.RevokeInvitationAsync(invitationId, userId);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/invitations")]
        public async Task<ActionResult<List<CommunityInvitation>>> GetCommunityInvitations(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var invitations = await _communityService.GetCommunityInvitationsAsync(id, userId);
                return Ok(invitations);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community invitations {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Community Settings
        [HttpGet("{id}/settings")]
        public async Task<ActionResult<CommunitySettings>> GetCommunitySettings(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var settings = await _communityService.GetCommunitySettingsAsync(id, userId);
                return Ok(settings);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community settings {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/settings")]
        public async Task<ActionResult<CommunitySettings>> UpdateCommunitySettings(Guid id, UpdateCommunitySettingsRequest request)
        {
            try
            {
                var userId = GetUserId();
                var settings = await _communityService.UpdateCommunitySettingsAsync(id, request, userId);
                return Ok(settings);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating community settings {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Moderation
        [HttpPost("{id}/members/{userId}/ban")]
        public async Task<ActionResult> BanMember(Guid id, Guid userId, BanMemberRequest request)
        {
            try
            {
                var adminUserId = GetUserId();
                var success = await _communityService.BanMemberAsync(id, userId, request, adminUserId);
                if (!success)
                    return BadRequest();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error banning member {CommunityId}/{UserId}", id, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/members/{userId}/ban")]
        public async Task<ActionResult> UnbanMember(Guid id, Guid userId)
        {
            try
            {
                var adminUserId = GetUserId();
                var success = await _communityService.UnbanMemberAsync(id, userId, adminUserId);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unbanning member {CommunityId}/{UserId}", id, userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/bans")]
        public async Task<ActionResult<List<CommunityBan>>> GetCommunityBans(Guid id)
        {
            try
            {
                var userId = GetUserId();
                var bans = await _communityService.GetCommunityBansAsync(id, userId);
                return Ok(bans);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community bans {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Public Profile Features
        [HttpGet("{id}/public-profile")]
        [AllowAnonymous]
        public async Task<ActionResult<CommunityPublicProfile>> GetPublicProfile(Guid id)
        {
            try
            {
                var profile = await _communityService.GetPublicProfileAsync(id);
                return Ok(profile);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting public profile {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("slug/{slug}/public-profile")]
        [AllowAnonymous]
        public async Task<ActionResult<CommunityPublicProfile>> GetPublicProfileBySlug(string slug)
        {
            try
            {
                var profile = await _communityService.GetPublicProfileBySlugAsync(slug);
                return Ok(profile);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting public profile by slug {Slug}", slug);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/activity")]
        [AllowAnonymous]
        public async Task<ActionResult<List<CommunityActivity>>> GetCommunityActivity(Guid id, [FromQuery] int limit = 20)
        {
            try
            {
                var activities = await _communityService.GetCommunityActivityAsync(id, limit);
                return Ok(activities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community activity {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/stats")]
        [AllowAnonymous]
        public async Task<ActionResult<CommunityStats>> GetCommunityStats(Guid id)
        {
            try
            {
                var stats = await _communityService.GetCommunityStatsAsync(id);
                return Ok(stats);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community stats {CommunityId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTOs for controller actions
    public class UpdateMemberRoleRequest
    {
        public CommunityRole Role { get; set; }
    }
}