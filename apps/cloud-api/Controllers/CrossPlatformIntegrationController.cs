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
    public class CrossPlatformIntegrationController : ControllerBase
    {
        private readonly ICrossPlatformIntegrationService _crossPlatformIntegrationService;
        private readonly ILogger<CrossPlatformIntegrationController> _logger;

        public CrossPlatformIntegrationController(
            ICrossPlatformIntegrationService crossPlatformIntegrationService,
            ILogger<CrossPlatformIntegrationController> logger)
        {
            _crossPlatformIntegrationService = crossPlatformIntegrationService;
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

        // Platform Management
        [HttpPost("organizations/{organizationId}/platforms")]
        public async Task<ActionResult<Platform>> CreatePlatform(Guid organizationId, CreatePlatformRequest request)
        {
            try
            {
                var userId = GetUserId();
                var platform = await _crossPlatformIntegrationService.CreatePlatformAsync(organizationId, userId, request);
                return Ok(platform);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating platform for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/platforms")]
        public async Task<ActionResult<List<Platform>>> GetPlatforms(Guid organizationId, [FromQuery] PlatformFilter filter)
        {
            try
            {
                var platforms = await _crossPlatformIntegrationService.GetPlatformsAsync(organizationId, filter);
                return Ok(platforms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platforms for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("platforms/{platformId}")]
        public async Task<ActionResult<Platform>> GetPlatform(Guid platformId)
        {
            try
            {
                var platform = await _crossPlatformIntegrationService.GetPlatformAsync(platformId);
                return Ok(platform);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platform {PlatformId}", platformId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("platforms/{platformId}")]
        public async Task<ActionResult<Platform>> UpdatePlatform(Guid platformId, UpdatePlatformRequest request)
        {
            try
            {
                var userId = GetUserId();
                var platform = await _crossPlatformIntegrationService.UpdatePlatformAsync(platformId, userId, request);
                return Ok(platform);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating platform {PlatformId}", platformId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("platforms/{platformId}")]
        public async Task<ActionResult> DeletePlatform(Guid platformId)
        {
            try
            {
                var userId = GetUserId();
                await _crossPlatformIntegrationService.DeletePlatformAsync(platformId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting platform {PlatformId}", platformId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("platforms/{platformId}/connect")]
        public async Task<ActionResult<PlatformConnection>> ConnectPlatform(Guid platformId, ConnectPlatformRequest request)
        {
            try
            {
                var userId = GetUserId();
                var connection = await _crossPlatformIntegrationService.ConnectPlatformAsync(platformId, userId, request);
                return Ok(connection);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error connecting platform {PlatformId}", platformId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("platforms/{platformId}/disconnect")]
        public async Task<ActionResult> DisconnectPlatform(Guid platformId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _crossPlatformIntegrationService.DisconnectPlatformAsync(platformId, userId);
                return Ok(new { success, message = success ? "Platform disconnected successfully" : "Failed to disconnect platform" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disconnecting platform {PlatformId}", platformId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("platforms/{platformId}/status")]
        public async Task<ActionResult<PlatformStatus>> GetPlatformStatus(Guid platformId)
        {
            try
            {
                var status = await _crossPlatformIntegrationService.GetPlatformStatusAsync(platformId);
                return Ok(status);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platform status for {PlatformId}", platformId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cross-Platform Authentication
        [HttpPost("organizations/{organizationId}/auth")]
        public async Task<ActionResult<CrossPlatformAuth>> CreateCrossPlatformAuth(Guid organizationId, CreateCrossPlatformAuthRequest request)
        {
            try
            {
                var userId = GetUserId();
                var auth = await _crossPlatformIntegrationService.CreateCrossPlatformAuthAsync(organizationId, userId, request);
                return Ok(auth);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cross-platform auth for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/auth")]
        public async Task<ActionResult<List<CrossPlatformAuth>>> GetCrossPlatformAuths(Guid organizationId, [FromQuery] CrossPlatformAuthFilter filter)
        {
            try
            {
                var auths = await _crossPlatformIntegrationService.GetCrossPlatformAuthsAsync(organizationId, filter);
                return Ok(auths);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform auths for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("auth/{authId}")]
        public async Task<ActionResult<CrossPlatformAuth>> GetCrossPlatformAuth(Guid authId)
        {
            try
            {
                var auth = await _crossPlatformIntegrationService.GetCrossPlatformAuthAsync(authId);
                return Ok(auth);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform auth {AuthId}", authId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("auth/{authId}/authenticate")]
        public async Task<ActionResult<AuthToken>> AuthenticateWithPlatform(Guid authId, AuthenticateWithPlatformRequest request)
        {
            try
            {
                var userId = GetUserId();
                var token = await _crossPlatformIntegrationService.AuthenticateWithPlatformAsync(authId, userId, request);
                return Ok(token);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating with platform for auth {AuthId}", authId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("auth/{authId}/refresh")]
        public async Task<ActionResult> RefreshPlatformToken(Guid authId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _crossPlatformIntegrationService.RefreshPlatformTokenAsync(authId, userId);
                return Ok(new { success, message = success ? "Token refreshed successfully" : "Failed to refresh token" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing platform token for auth {AuthId}", authId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Data Synchronization
        [HttpPost("organizations/{organizationId}/sync-jobs")]
        public async Task<ActionResult<DataSyncJob>> CreateDataSyncJob(Guid organizationId, CreateDataSyncJobRequest request)
        {
            try
            {
                var userId = GetUserId();
                var job = await _crossPlatformIntegrationService.CreateDataSyncJobAsync(organizationId, userId, request);
                return Ok(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating data sync job for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/sync-jobs")]
        public async Task<ActionResult<List<DataSyncJob>>> GetDataSyncJobs(Guid organizationId, [FromQuery] DataSyncJobFilter filter)
        {
            try
            {
                var jobs = await _crossPlatformIntegrationService.GetDataSyncJobsAsync(organizationId, filter);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data sync jobs for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sync-jobs/{jobId}")]
        public async Task<ActionResult<DataSyncJob>> GetDataSyncJob(Guid jobId)
        {
            try
            {
                var job = await _crossPlatformIntegrationService.GetDataSyncJobAsync(jobId);
                return Ok(job);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data sync job {JobId}", jobId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("sync-jobs/{jobId}/run")]
        public async Task<ActionResult<DataSyncExecution>> RunDataSyncJob(Guid jobId, RunDataSyncJobRequest request)
        {
            try
            {
                var userId = GetUserId();
                var execution = await _crossPlatformIntegrationService.RunDataSyncJobAsync(jobId, userId, request);
                return Ok(execution);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running data sync job {JobId}", jobId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sync-jobs/{jobId}/executions")]
        public async Task<ActionResult<List<DataSyncExecution>>> GetDataSyncExecutions(Guid jobId, [FromQuery] DataSyncExecutionFilter filter)
        {
            try
            {
                var executions = await _crossPlatformIntegrationService.GetDataSyncExecutionsAsync(jobId, filter);
                return Ok(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data sync executions for job {JobId}", jobId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sync-jobs/{jobId}/status")]
        public async Task<ActionResult<DataSyncStatus>> GetDataSyncStatus(Guid jobId)
        {
            try
            {
                var status = await _crossPlatformIntegrationService.GetDataSyncStatusAsync(jobId);
                return Ok(status);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting data sync status for job {JobId}", jobId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Universal Profile Management
        [HttpPost("organizations/{organizationId}/universal-profiles")]
        public async Task<ActionResult<UniversalProfile>> CreateUniversalProfile(Guid organizationId, CreateUniversalProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _crossPlatformIntegrationService.CreateUniversalProfileAsync(organizationId, userId, request);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating universal profile for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/universal-profiles")]
        public async Task<ActionResult<List<UniversalProfile>>> GetUniversalProfiles(Guid organizationId, [FromQuery] UniversalProfileFilter filter)
        {
            try
            {
                var profiles = await _crossPlatformIntegrationService.GetUniversalProfilesAsync(organizationId, filter);
                return Ok(profiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting universal profiles for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("universal-profiles/{profileId}")]
        public async Task<ActionResult<UniversalProfile>> GetUniversalProfile(Guid profileId)
        {
            try
            {
                var profile = await _crossPlatformIntegrationService.GetUniversalProfileAsync(profileId);
                return Ok(profile);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting universal profile {ProfileId}", profileId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("universal-profiles/{profileId}/link-platform")]
        public async Task<ActionResult<UniversalProfile>> LinkPlatformProfile(Guid profileId, LinkPlatformProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _crossPlatformIntegrationService.LinkPlatformProfileAsync(profileId, userId, request);
                return Ok(profile);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error linking platform profile for universal profile {ProfileId}", profileId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("universal-profiles/{profileId}/unlink-platform")]
        public async Task<ActionResult> UnlinkPlatformProfile(Guid profileId, UnlinkPlatformProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _crossPlatformIntegrationService.UnlinkPlatformProfileAsync(profileId, userId, request);
                return Ok(new { success, message = success ? "Platform profile unlinked successfully" : "Failed to unlink platform profile" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error unlinking platform profile for universal profile {ProfileId}", profileId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("universal-profiles/{profileId}/linked-platforms")]
        public async Task<ActionResult<List<PlatformProfile>>> GetLinkedPlatformProfiles(Guid profileId)
        {
            try
            {
                var profiles = await _crossPlatformIntegrationService.GetLinkedPlatformProfilesAsync(profileId);
                return Ok(profiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting linked platform profiles for universal profile {ProfileId}", profileId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cross-Platform Analytics
        [HttpGet("organizations/{organizationId}/analytics")]
        public async Task<ActionResult<CrossPlatformAnalytics>> GetCrossPlatformAnalytics(Guid organizationId, [FromQuery] CrossPlatformAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _crossPlatformIntegrationService.GetCrossPlatformAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/platform-metrics")]
        public async Task<ActionResult<List<PlatformMetric>>> GetPlatformMetrics(Guid organizationId, [FromQuery] PlatformMetricsFilter filter)
        {
            try
            {
                var metrics = await _crossPlatformIntegrationService.GetPlatformMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platform metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/compare-platforms")]
        public async Task<ActionResult<PlatformComparison>> ComparePlatformMetrics(Guid organizationId, ComparePlatformMetricsRequest request)
        {
            try
            {
                var comparison = await _crossPlatformIntegrationService.ComparePlatformMetricsAsync(organizationId, request);
                return Ok(comparison);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing platform metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/cross-platform-insights")]
        public async Task<ActionResult<CrossPlatformInsights>> GetCrossPlatformInsights(Guid organizationId, [FromQuery] CrossPlatformInsightsFilter filter)
        {
            try
            {
                var insights = await _crossPlatformIntegrationService.GetCrossPlatformInsightsAsync(organizationId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform insights for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/platform-trends")]
        public async Task<ActionResult<List<PlatformTrend>>> GetPlatformTrends(Guid organizationId, [FromQuery] PlatformTrendFilter filter)
        {
            try
            {
                var trends = await _crossPlatformIntegrationService.GetPlatformTrendsAsync(organizationId, filter);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platform trends for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/generate-report")]
        public async Task<ActionResult<CrossPlatformReport>> GenerateCrossPlatformReport(Guid organizationId, GenerateCrossPlatformReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _crossPlatformIntegrationService.GenerateCrossPlatformReportAsync(organizationId, userId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating cross-platform report for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Platform-Specific Integrations - Steam
        [HttpPost("organizations/{organizationId}/steam-integrations")]
        public async Task<ActionResult<SteamIntegration>> CreateSteamIntegration(Guid organizationId, CreateSteamIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _crossPlatformIntegrationService.CreateSteamIntegrationAsync(organizationId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Steam integration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/steam-integrations")]
        public async Task<ActionResult<List<SteamIntegration>>> GetSteamIntegrations(Guid organizationId, [FromQuery] SteamIntegrationFilter filter)
        {
            try
            {
                var integrations = await _crossPlatformIntegrationService.GetSteamIntegrationsAsync(organizationId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Steam integrations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("steam-integrations/{integrationId}")]
        public async Task<ActionResult<SteamIntegration>> GetSteamIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _crossPlatformIntegrationService.GetSteamIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Steam integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("steam-integrations/{integrationId}/sync")]
        public async Task<ActionResult<SteamSync>> SyncWithSteam(Guid integrationId, SyncWithSteamRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncWithSteamAsync(integrationId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing with Steam for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Platform-Specific Integrations - Epic Games
        [HttpPost("organizations/{organizationId}/epic-games-integrations")]
        public async Task<ActionResult<EpicGamesIntegration>> CreateEpicGamesIntegration(Guid organizationId, CreateEpicGamesIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _crossPlatformIntegrationService.CreateEpicGamesIntegrationAsync(organizationId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Epic Games integration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/epic-games-integrations")]
        public async Task<ActionResult<List<EpicGamesIntegration>>> GetEpicGamesIntegrations(Guid organizationId, [FromQuery] EpicGamesIntegrationFilter filter)
        {
            try
            {
                var integrations = await _crossPlatformIntegrationService.GetEpicGamesIntegrationsAsync(organizationId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Epic Games integrations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("epic-games-integrations/{integrationId}")]
        public async Task<ActionResult<EpicGamesIntegration>> GetEpicGamesIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _crossPlatformIntegrationService.GetEpicGamesIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Epic Games integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("epic-games-integrations/{integrationId}/sync")]
        public async Task<ActionResult<EpicGamesSync>> SyncWithEpicGames(Guid integrationId, SyncWithEpicGamesRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncWithEpicGamesAsync(integrationId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing with Epic Games for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Platform-Specific Integrations - PlayStation
        [HttpPost("organizations/{organizationId}/playstation-integrations")]
        public async Task<ActionResult<PlayStationIntegration>> CreatePlayStationIntegration(Guid organizationId, CreatePlayStationIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _crossPlatformIntegrationService.CreatePlayStationIntegrationAsync(organizationId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating PlayStation integration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/playstation-integrations")]
        public async Task<ActionResult<List<PlayStationIntegration>>> GetPlayStationIntegrations(Guid organizationId, [FromQuery] PlayStationIntegrationFilter filter)
        {
            try
            {
                var integrations = await _crossPlatformIntegrationService.GetPlayStationIntegrationsAsync(organizationId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PlayStation integrations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("playstation-integrations/{integrationId}")]
        public async Task<ActionResult<PlayStationIntegration>> GetPlayStationIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _crossPlatformIntegrationService.GetPlayStationIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting PlayStation integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("playstation-integrations/{integrationId}/sync")]
        public async Task<ActionResult<PlayStationSync>> SyncWithPlayStation(Guid integrationId, SyncWithPlayStationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncWithPlayStationAsync(integrationId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing with PlayStation for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Platform-Specific Integrations - Xbox
        [HttpPost("organizations/{organizationId}/xbox-integrations")]
        public async Task<ActionResult<XboxIntegration>> CreateXboxIntegration(Guid organizationId, CreateXboxIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _crossPlatformIntegrationService.CreateXboxIntegrationAsync(organizationId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Xbox integration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/xbox-integrations")]
        public async Task<ActionResult<List<XboxIntegration>>> GetXboxIntegrations(Guid organizationId, [FromQuery] XboxIntegrationFilter filter)
        {
            try
            {
                var integrations = await _crossPlatformIntegrationService.GetXboxIntegrationsAsync(organizationId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Xbox integrations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("xbox-integrations/{integrationId}")]
        public async Task<ActionResult<XboxIntegration>> GetXboxIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _crossPlatformIntegrationService.GetXboxIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Xbox integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("xbox-integrations/{integrationId}/sync")]
        public async Task<ActionResult<XboxSync>> SyncWithXbox(Guid integrationId, SyncWithXboxRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncWithXboxAsync(integrationId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing with Xbox for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Platform-Specific Integrations - Nintendo
        [HttpPost("organizations/{organizationId}/nintendo-integrations")]
        public async Task<ActionResult<NintendoIntegration>> CreateNintendoIntegration(Guid organizationId, CreateNintendoIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _crossPlatformIntegrationService.CreateNintendoIntegrationAsync(organizationId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Nintendo integration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/nintendo-integrations")]
        public async Task<ActionResult<List<NintendoIntegration>>> GetNintendoIntegrations(Guid organizationId, [FromQuery] NintendoIntegrationFilter filter)
        {
            try
            {
                var integrations = await _crossPlatformIntegrationService.GetNintendoIntegrationsAsync(organizationId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Nintendo integrations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("nintendo-integrations/{integrationId}")]
        public async Task<ActionResult<NintendoIntegration>> GetNintendoIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _crossPlatformIntegrationService.GetNintendoIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Nintendo integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("nintendo-integrations/{integrationId}/sync")]
        public async Task<ActionResult<NintendoSync>> SyncWithNintendo(Guid integrationId, SyncWithNintendoRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncWithNintendoAsync(integrationId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing with Nintendo for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Platform-Specific Integrations - Mobile
        [HttpPost("organizations/{organizationId}/mobile-integrations")]
        public async Task<ActionResult<MobileIntegration>> CreateMobileIntegration(Guid organizationId, CreateMobileIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _crossPlatformIntegrationService.CreateMobileIntegrationAsync(organizationId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Mobile integration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/mobile-integrations")]
        public async Task<ActionResult<List<MobileIntegration>>> GetMobileIntegrations(Guid organizationId, [FromQuery] MobileIntegrationFilter filter)
        {
            try
            {
                var integrations = await _crossPlatformIntegrationService.GetMobileIntegrationsAsync(organizationId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Mobile integrations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mobile-integrations/{integrationId}")]
        public async Task<ActionResult<MobileIntegration>> GetMobileIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _crossPlatformIntegrationService.GetMobileIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Mobile integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mobile-integrations/{integrationId}/sync")]
        public async Task<ActionResult<MobileSync>> SyncWithMobile(Guid integrationId, SyncWithMobileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncWithMobileAsync(integrationId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing with Mobile for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cross-Platform Save Data
        [HttpPost("organizations/{organizationId}/cross-platform-saves")]
        public async Task<ActionResult<CrossPlatformSave>> CreateCrossPlatformSave(Guid organizationId, CreateCrossPlatformSaveRequest request)
        {
            try
            {
                var userId = GetUserId();
                var save = await _crossPlatformIntegrationService.CreateCrossPlatformSaveAsync(organizationId, userId, request);
                return Ok(save);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cross-platform save for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/cross-platform-saves")]
        public async Task<ActionResult<List<CrossPlatformSave>>> GetCrossPlatformSaves(Guid organizationId, [FromQuery] CrossPlatformSaveFilter filter)
        {
            try
            {
                var saves = await _crossPlatformIntegrationService.GetCrossPlatformSavesAsync(organizationId, filter);
                return Ok(saves);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform saves for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cross-platform-saves/{saveId}")]
        public async Task<ActionResult<CrossPlatformSave>> GetCrossPlatformSave(Guid saveId)
        {
            try
            {
                var save = await _crossPlatformIntegrationService.GetCrossPlatformSaveAsync(saveId);
                return Ok(save);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform save {SaveId}", saveId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("cross-platform-saves/{saveId}/sync")]
        public async Task<ActionResult<SaveSyncResult>> SyncSaveData(Guid saveId, SyncSaveDataRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _crossPlatformIntegrationService.SyncSaveDataAsync(saveId, userId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing save data for save {SaveId}", saveId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cross-platform-saves/{saveId}/conflicts")]
        public async Task<ActionResult<List<SaveConflict>>> GetSaveConflicts(Guid saveId, [FromQuery] SaveConflictFilter filter)
        {
            try
            {
                var conflicts = await _crossPlatformIntegrationService.GetSaveConflictsAsync(saveId, filter);
                return Ok(conflicts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting save conflicts for save {SaveId}", saveId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("save-conflicts/{conflictId}/resolve")]
        public async Task<ActionResult<SaveConflict>> ResolveSaveConflict(Guid conflictId, ResolveSaveConflictRequest request)
        {
            try
            {
                var userId = GetUserId();
                var conflict = await _crossPlatformIntegrationService.ResolveSaveConflictAsync(conflictId, userId, request);
                return Ok(conflict);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving save conflict {ConflictId}", conflictId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cross-Platform Achievements
        [HttpPost("organizations/{organizationId}/cross-platform-achievements")]
        public async Task<ActionResult<CrossPlatformAchievement>> CreateCrossPlatformAchievement(Guid organizationId, CreateCrossPlatformAchievementRequest request)
        {
            try
            {
                var userId = GetUserId();
                var achievement = await _crossPlatformIntegrationService.CreateCrossPlatformAchievementAsync(organizationId, userId, request);
                return Ok(achievement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cross-platform achievement for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/cross-platform-achievements")]
        public async Task<ActionResult<List<CrossPlatformAchievement>>> GetCrossPlatformAchievements(Guid organizationId, [FromQuery] CrossPlatformAchievementFilter filter)
        {
            try
            {
                var achievements = await _crossPlatformIntegrationService.GetCrossPlatformAchievementsAsync(organizationId, filter);
                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform achievements for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cross-platform-achievements/{achievementId}")]
        public async Task<ActionResult<CrossPlatformAchievement>> GetCrossPlatformAchievement(Guid achievementId)
        {
            try
            {
                var achievement = await _crossPlatformIntegrationService.GetCrossPlatformAchievementAsync(achievementId);
                return Ok(achievement);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform achievement {AchievementId}", achievementId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("cross-platform-achievements/{achievementId}/sync")]
        public async Task<ActionResult<AchievementSync>> SyncAchievement(Guid achievementId, SyncAchievementRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncAchievementAsync(achievementId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing achievement {AchievementId}", achievementId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cross-platform-achievements/{achievementId}/progress")]
        public async Task<ActionResult<List<AchievementProgress>>> GetAchievementProgress(Guid achievementId, [FromQuery] AchievementProgressFilter filter)
        {
            try
            {
                var progress = await _crossPlatformIntegrationService.GetAchievementProgressAsync(achievementId, filter);
                return Ok(progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting achievement progress for achievement {AchievementId}", achievementId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cross-Platform Leaderboards
        [HttpPost("organizations/{organizationId}/cross-platform-leaderboards")]
        public async Task<ActionResult<CrossPlatformLeaderboard>> CreateCrossPlatformLeaderboard(Guid organizationId, CreateCrossPlatformLeaderboardRequest request)
        {
            try
            {
                var userId = GetUserId();
                var leaderboard = await _crossPlatformIntegrationService.CreateCrossPlatformLeaderboardAsync(organizationId, userId, request);
                return Ok(leaderboard);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating cross-platform leaderboard for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/cross-platform-leaderboards")]
        public async Task<ActionResult<List<CrossPlatformLeaderboard>>> GetCrossPlatformLeaderboards(Guid organizationId, [FromQuery] CrossPlatformLeaderboardFilter filter)
        {
            try
            {
                var leaderboards = await _crossPlatformIntegrationService.GetCrossPlatformLeaderboardsAsync(organizationId, filter);
                return Ok(leaderboards);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform leaderboards for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cross-platform-leaderboards/{leaderboardId}")]
        public async Task<ActionResult<CrossPlatformLeaderboard>> GetCrossPlatformLeaderboard(Guid leaderboardId)
        {
            try
            {
                var leaderboard = await _crossPlatformIntegrationService.GetCrossPlatformLeaderboardAsync(leaderboardId);
                return Ok(leaderboard);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting cross-platform leaderboard {LeaderboardId}", leaderboardId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("cross-platform-leaderboards/{leaderboardId}/sync")]
        public async Task<ActionResult<LeaderboardSync>> SyncLeaderboard(Guid leaderboardId, SyncLeaderboardRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sync = await _crossPlatformIntegrationService.SyncLeaderboardAsync(leaderboardId, userId, request);
                return Ok(sync);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing leaderboard {LeaderboardId}", leaderboardId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("cross-platform-leaderboards/{leaderboardId}/entries")]
        public async Task<ActionResult<List<LeaderboardEntry>>> GetLeaderboardEntries(Guid leaderboardId, [FromQuery] LeaderboardEntryFilter filter)
        {
            try
            {
                var entries = await _crossPlatformIntegrationService.GetLeaderboardEntriesAsync(leaderboardId, filter);
                return Ok(entries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting leaderboard entries for leaderboard {LeaderboardId}", leaderboardId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}