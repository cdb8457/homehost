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
    public class PlayerInvitationController : ControllerBase
    {
        private readonly IPlayerInvitationService _invitationService;
        private readonly ILogger<PlayerInvitationController> _logger;

        public PlayerInvitationController(IPlayerInvitationService invitationService, ILogger<PlayerInvitationController> logger)
        {
            _invitationService = invitationService;
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

        // Community Invitations
        [HttpPost("communities")]
        public async Task<ActionResult<CommunityInvitation>> CreateCommunityInvitation(CreateCommunityInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _invitationService.CreateCommunityInvitationAsync(userId, request);
                return Ok(invitation);
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
                _logger.LogError(ex, "Error creating community invitation");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities/{invitationId}")]
        public async Task<ActionResult<CommunityInvitation>> GetCommunityInvitation(Guid invitationId)
        {
            try
            {
                var invitation = await _invitationService.GetCommunityInvitationAsync(invitationId);
                return Ok(invitation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities")]
        public async Task<ActionResult<List<CommunityInvitation>>> GetCommunityInvitations(
            [FromQuery] Guid communityId,
            [FromQuery] InvitationStatus? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 50)
        {
            try
            {
                var invitations = await _invitationService.GetCommunityInvitationsAsync(communityId, status, page, pageSize);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting community invitations for {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user")]
        public async Task<ActionResult<List<CommunityInvitation>>> GetUserInvitations(
            [FromQuery] InvitationStatus? status = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetUserId();
                var invitations = await _invitationService.GetUserInvitationsAsync(userId, status, page, pageSize);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user invitations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("communities/{invitationId}/respond")]
        public async Task<ActionResult<CommunityInvitation>> RespondToCommunityInvitation(
            Guid invitationId,
            [FromBody] RespondToInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _invitationService.UpdateInvitationStatusAsync(invitationId, userId, request.Action, request.Message);
                return Ok(invitation);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("communities/{invitationId}/resend")]
        public async Task<ActionResult> ResendCommunityInvitation(Guid invitationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.ResendInvitationAsync(invitationId, userId);
                return Ok(new { success });
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
                _logger.LogError(ex, "Error resending invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("communities/{invitationId}")]
        public async Task<ActionResult> RevokeCommunityInvitation(Guid invitationId, [FromQuery] string? reason = null)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.RevokeInvitationAsync(invitationId, userId);
                return Ok(new { success });
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

        // Invitation Links
        [HttpPost("communities/{communityId}/links")]
        public async Task<ActionResult<InvitationLink>> GenerateInvitationLink(Guid communityId, [FromBody] InvitationLinkSettings settings)
        {
            try
            {
                var userId = GetUserId();
                var link = await _invitationService.GenerateInvitationLinkAsync(communityId, userId, settings);
                return Ok(link);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating invitation link for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("links/{inviteCode}/accept")]
        public async Task<ActionResult<CommunityInvitation>> AcceptInvitationByLink(string inviteCode)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _invitationService.AcceptInvitationByLinkAsync(inviteCode, userId);
                return Ok(invitation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Invalid or expired invitation link" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting invitation by link {InviteCode}", inviteCode);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("links/{inviteCode}")]
        public async Task<ActionResult> DeactivateInvitationLink(string inviteCode)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.DeactivateInvitationLinkAsync(inviteCode, userId);
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
                _logger.LogError(ex, "Error deactivating invitation link {InviteCode}", inviteCode);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Friend Invitations
        [HttpPost("friends")]
        public async Task<ActionResult<FriendInvitation>> SendFriendInvitation(SendFriendInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _invitationService.SendFriendInvitationAsync(userId, request.TargetUserId, request.Message);
                return Ok(invitation);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending friend invitation");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("friends")]
        public async Task<ActionResult<List<FriendInvitation>>> GetFriendInvitations(
            [FromQuery] InvitationDirection direction,
            [FromQuery] InvitationStatus? status = null)
        {
            try
            {
                var userId = GetUserId();
                var invitations = await _invitationService.GetFriendInvitationsAsync(userId, direction, status);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting friend invitations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("friends/{invitationId}/respond")]
        public async Task<ActionResult<FriendInvitation>> RespondToFriendInvitation(
            Guid invitationId,
            [FromBody] RespondToInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _invitationService.RespondToFriendInvitationAsync(invitationId, userId, request.Action);
                return Ok(invitation);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error responding to friend invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("friends/{invitationId}")]
        public async Task<ActionResult> CancelFriendInvitation(Guid invitationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.CancelFriendInvitationAsync(invitationId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling friend invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Server Invitations
        [HttpPost("servers")]
        public async Task<ActionResult<ServerInvitation>> CreateServerInvitation(CreateServerInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _invitationService.CreateServerInvitationAsync(userId, request);
                return Ok(invitation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Server not found" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating server invitation");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}")]
        public async Task<ActionResult<List<ServerInvitation>>> GetServerInvitations(
            Guid serverId,
            [FromQuery] InvitationStatus? status = null)
        {
            try
            {
                var invitations = await _invitationService.GetServerInvitationsAsync(serverId, status);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server invitations for {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{invitationId}/accept")]
        public async Task<ActionResult<ServerInvitation>> AcceptServerInvitation(Guid invitationId)
        {
            try
            {
                var userId = GetUserId();
                var invitation = await _invitationService.AcceptServerInvitationAsync(invitationId, userId);
                return Ok(invitation);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error accepting server invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{invitationId}/decline")]
        public async Task<ActionResult> DeclineServerInvitation(Guid invitationId, [FromBody] DeclineInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.DeclineServerInvitationAsync(invitationId, userId, request.Reason);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error declining server invitation {InvitationId}", invitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Bulk Invitations
        [HttpPost("bulk")]
        public async Task<ActionResult<BulkInvitationResult>> SendBulkInvitations(BulkInvitationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _invitationService.SendBulkInvitationsAsync(userId, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending bulk invitations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("bulk/{bulkInvitationId}/status")]
        public async Task<ActionResult<BulkInvitationStatus>> GetBulkInvitationStatus(Guid bulkInvitationId)
        {
            try
            {
                var status = await _invitationService.GetBulkInvitationStatusAsync(bulkInvitationId);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting bulk invitation status {BulkInvitationId}", bulkInvitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("bulk/{bulkInvitationId}")]
        public async Task<ActionResult> CancelBulkInvitation(Guid bulkInvitationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.CancelBulkInvitationAsync(bulkInvitationId, userId);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling bulk invitation {BulkInvitationId}", bulkInvitationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Invitation Analytics
        [HttpGet("analytics/communities/{communityId}")]
        public async Task<ActionResult<InvitationAnalytics>> GetInvitationAnalytics(
            Guid communityId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _invitationService.GetInvitationAnalyticsAsync(communityId, userId, startDate, endDate);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invitation analytics for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/communities/{communityId}/conversion")]
        public async Task<ActionResult<List<InvitationConversionMetric>>> GetInvitationConversionMetrics(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var metrics = await _invitationService.GetInvitationConversionMetricsAsync(communityId, userId);
                return Ok(metrics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invitation conversion metrics for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/communities/{communityId}/performance")]
        public async Task<ActionResult<InvitationPerformanceReport>> GetInvitationPerformanceReport(
            Guid communityId,
            [FromQuery] InvitationReportTimeframe timeframe = InvitationReportTimeframe.Month)
        {
            try
            {
                var userId = GetUserId();
                var report = await _invitationService.GetInvitationPerformanceReportAsync(communityId, userId, timeframe);
                return Ok(report);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invitation performance report for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Onboarding Flows
        [HttpPost("onboarding/flows")]
        public async Task<ActionResult<OnboardingFlow>> CreateOnboardingFlow(CreateOnboardingFlowRequest request)
        {
            try
            {
                var userId = GetUserId();
                var flow = await _invitationService.CreateOnboardingFlowAsync(request.CommunityId, userId, request);
                return Ok(flow);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating onboarding flow");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("onboarding/flows/{flowId}")]
        public async Task<ActionResult<OnboardingFlow>> GetOnboardingFlow(Guid flowId)
        {
            try
            {
                var flow = await _invitationService.GetOnboardingFlowAsync(flowId);
                return Ok(flow);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting onboarding flow {FlowId}", flowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("onboarding/communities/{communityId}/flows")]
        public async Task<ActionResult<List<OnboardingFlow>>> GetCommunityOnboardingFlows(Guid communityId)
        {
            try
            {
                var flows = await _invitationService.GetCommunityOnboardingFlowsAsync(communityId);
                return Ok(flows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting onboarding flows for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("onboarding/flows/{flowId}")]
        public async Task<ActionResult<OnboardingFlow>> UpdateOnboardingFlow(Guid flowId, UpdateOnboardingFlowRequest request)
        {
            try
            {
                var userId = GetUserId();
                var flow = await _invitationService.UpdateOnboardingFlowAsync(flowId, userId, request);
                return Ok(flow);
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
                _logger.LogError(ex, "Error updating onboarding flow {FlowId}", flowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("onboarding/flows/{flowId}")]
        public async Task<ActionResult> DeleteOnboardingFlow(Guid flowId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.DeleteOnboardingFlowAsync(flowId, userId);
                return Ok(new { success });
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
                _logger.LogError(ex, "Error deleting onboarding flow {FlowId}", flowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("onboarding/flows/{flowId}/duplicate")]
        public async Task<ActionResult<OnboardingFlow>> DuplicateOnboardingFlow(Guid flowId, [FromBody] DuplicateFlowRequest request)
        {
            try
            {
                var userId = GetUserId();
                var flow = await _invitationService.DuplicateOnboardingFlowAsync(flowId, userId, request.NewName);
                return Ok(flow);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error duplicating onboarding flow {FlowId}", flowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Player Onboarding Sessions
        [HttpPost("onboarding/sessions/start")]
        public async Task<ActionResult<OnboardingSession>> StartOnboardingSession(StartOnboardingSessionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var session = await _invitationService.StartOnboardingSessionAsync(userId, request.CommunityId, request.FlowId);
                return Ok(session);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting onboarding session");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("onboarding/sessions/{sessionId}")]
        public async Task<ActionResult<OnboardingSession>> GetOnboardingSession(Guid sessionId)
        {
            try
            {
                var session = await _invitationService.GetOnboardingSessionAsync(sessionId);
                return Ok(session);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting onboarding session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("onboarding/sessions/{sessionId}/advance")]
        public async Task<ActionResult<OnboardingSession>> AdvanceOnboardingStep(
            Guid sessionId,
            [FromBody] OnboardingStepResult stepResult)
        {
            try
            {
                var userId = GetUserId();
                var session = await _invitationService.AdvanceOnboardingStepAsync(sessionId, userId, stepResult);
                return Ok(session);
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
                _logger.LogError(ex, "Error advancing onboarding step for session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("onboarding/sessions/{sessionId}/complete")]
        public async Task<ActionResult<OnboardingSession>> CompleteOnboarding(
            Guid sessionId,
            [FromBody] OnboardingCompletionData completionData)
        {
            try
            {
                var userId = GetUserId();
                var session = await _invitationService.CompleteOnboardingAsync(sessionId, userId, completionData);
                return Ok(session);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error completing onboarding session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("onboarding/sessions/{sessionId}/abandon")]
        public async Task<ActionResult> AbandonOnboarding(Guid sessionId, [FromBody] AbandonOnboardingRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.AbandonOnboardingAsync(sessionId, userId, request.Reason);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error abandoning onboarding session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("onboarding/sessions/{sessionId}/restart")]
        public async Task<ActionResult<OnboardingSession>> RestartOnboarding(Guid sessionId)
        {
            try
            {
                var userId = GetUserId();
                var session = await _invitationService.RestartOnboardingAsync(sessionId, userId);
                return Ok(session);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restarting onboarding session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("onboarding/sessions")]
        public async Task<ActionResult<List<OnboardingSession>>> GetUserOnboardingSessions(
            [FromQuery] OnboardingStatus? status = null)
        {
            try
            {
                var userId = GetUserId();
                var sessions = await _invitationService.GetUserOnboardingSessionsAsync(userId, status);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user onboarding sessions");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("onboarding/sessions/{sessionId}/progress")]
        public async Task<ActionResult<OnboardingProgress>> GetOnboardingProgress(Guid sessionId)
        {
            try
            {
                var progress = await _invitationService.GetOnboardingProgressAsync(sessionId);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting onboarding progress for session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Notification Management
        [HttpGet("notifications")]
        public async Task<ActionResult<List<InvitationNotification>>> GetInvitationNotifications(
            [FromQuery] bool unreadOnly = true)
        {
            try
            {
                var userId = GetUserId();
                var notifications = await _invitationService.GetInvitationNotificationsAsync(userId, unreadOnly);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invitation notifications");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("notifications/{notificationId}/read")]
        public async Task<ActionResult> MarkNotificationAsRead(Guid notificationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _invitationService.MarkNotificationAsReadAsync(notificationId, userId);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking notification {NotificationId} as read", notificationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("preferences/notifications")]
        public async Task<ActionResult<NotificationPreferences>> GetNotificationPreferences()
        {
            try
            {
                var userId = GetUserId();
                var preferences = await _invitationService.GetNotificationPreferencesAsync(userId);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting notification preferences");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("preferences/notifications")]
        public async Task<ActionResult<NotificationPreferences>> UpdateNotificationPreferences(
            UpdateNotificationPreferencesRequest request)
        {
            try
            {
                var userId = GetUserId();
                var preferences = await _invitationService.UpdateNotificationPreferencesAsync(userId, request);
                return Ok(preferences);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification preferences");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Smart Recommendations
        [HttpGet("suggestions/communities/{communityId}")]
        public async Task<ActionResult<List<InvitationSuggestion>>> GetInvitationSuggestions(
            Guid communityId,
            [FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var suggestions = await _invitationService.GetInvitationSuggestionsAsync(userId, communityId, limit);
                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invitation suggestions for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recommendations/onboarding/{communityId}")]
        public async Task<ActionResult<List<OnboardingRecommendation>>> GetOnboardingRecommendations(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var recommendations = await _invitationService.GetOnboardingRecommendationsAsync(userId, communityId);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting onboarding recommendations for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("personalized/{targetUserId}/communities/{communityId}")]
        public async Task<ActionResult<PersonalizedInvitationContent>> GeneratePersonalizedInvitation(
            Guid targetUserId,
            Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var content = await _invitationService.GeneratePersonalizedInvitationAsync(userId, targetUserId, communityId);
                return Ok(content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating personalized invitation");
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTOs
    public class RespondToInvitationRequest
    {
        public InvitationAction Action { get; set; }
        public string? Message { get; set; }
    }

    public class SendFriendInvitationRequest
    {
        public Guid TargetUserId { get; set; }
        public string? Message { get; set; }
    }

    public class DeclineInvitationRequest
    {
        public string? Reason { get; set; }
    }

    public class DuplicateFlowRequest
    {
        public string NewName { get; set; } = string.Empty;
    }

    public class StartOnboardingSessionRequest
    {
        public Guid CommunityId { get; set; }
        public Guid? FlowId { get; set; }
    }

    public class AbandonOnboardingRequest
    {
        public string? Reason { get; set; }
    }

    public class CreateOnboardingFlowRequest
    {
        public Guid CommunityId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
        public OnboardingFlowConfiguration Configuration { get; set; } = new();
        public List<OnboardingStep> Steps { get; set; } = new();
    }
}