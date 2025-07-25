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
    public class AdvancedGamingController : ControllerBase
    {
        private readonly IAdvancedGamingService _advancedGamingService;
        private readonly ILogger<AdvancedGamingController> _logger;

        public AdvancedGamingController(
            IAdvancedGamingService advancedGamingService,
            ILogger<AdvancedGamingController> logger)
        {
            _advancedGamingService = advancedGamingService;
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

        // Game Instance Management
        [HttpPost("organizations/{organizationId}/instances")]
        public async Task<ActionResult<GameInstance>> CreateGameInstance(Guid organizationId, CreateGameInstanceRequest request)
        {
            try
            {
                var userId = GetUserId();
                var instance = await _advancedGamingService.CreateGameInstanceAsync(organizationId, userId, request);
                return Ok(instance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating game instance for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/instances")]
        public async Task<ActionResult<List<GameInstance>>> GetGameInstances(Guid organizationId, [FromQuery] GameInstanceFilter filter)
        {
            try
            {
                var instances = await _advancedGamingService.GetGameInstancesAsync(organizationId, filter);
                return Ok(instances);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game instances for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("instances/{instanceId}")]
        public async Task<ActionResult<GameInstance>> GetGameInstance(Guid instanceId)
        {
            try
            {
                var instance = await _advancedGamingService.GetGameInstanceAsync(instanceId);
                return Ok(instance);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game instance {InstanceId}", instanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("instances/{instanceId}")]
        public async Task<ActionResult<GameInstance>> UpdateGameInstance(Guid instanceId, UpdateGameInstanceRequest request)
        {
            try
            {
                var userId = GetUserId();
                var instance = await _advancedGamingService.UpdateGameInstanceAsync(instanceId, userId, request);
                return Ok(instance);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating game instance {InstanceId}", instanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("instances/{instanceId}")]
        public async Task<ActionResult> DeleteGameInstance(Guid instanceId)
        {
            try
            {
                var userId = GetUserId();
                await _advancedGamingService.DeleteGameInstanceAsync(instanceId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game instance {InstanceId}", instanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("instances/{instanceId}/clone")]
        public async Task<ActionResult<GameInstance>> CloneGameInstance(Guid instanceId, CloneGameInstanceRequest request)
        {
            try
            {
                var userId = GetUserId();
                var clonedInstance = await _advancedGamingService.CloneGameInstanceAsync(instanceId, userId, request);
                return Ok(clonedInstance);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cloning game instance {InstanceId}", instanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("instances/{instanceId}/start")]
        public async Task<ActionResult> StartGameInstance(Guid instanceId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedGamingService.StartGameInstanceAsync(instanceId, userId);
                return Ok(new { success, message = success ? "Instance started successfully" : "Failed to start instance" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting game instance {InstanceId}", instanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("instances/{instanceId}/stop")]
        public async Task<ActionResult> StopGameInstance(Guid instanceId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedGamingService.StopGameInstanceAsync(instanceId, userId);
                return Ok(new { success, message = success ? "Instance stopped successfully" : "Failed to stop instance" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping game instance {InstanceId}", instanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("instances/{instanceId}/restart")]
        public async Task<ActionResult> RestartGameInstance(Guid instanceId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedGamingService.RestartGameInstanceAsync(instanceId, userId);
                return Ok(new { success, message = success ? "Instance restarted successfully" : "Failed to restart instance" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restarting game instance {InstanceId}", instanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Server Template Management
        [HttpPost("organizations/{organizationId}/templates")]
        public async Task<ActionResult<ServerTemplate>> CreateServerTemplate(Guid organizationId, CreateServerTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var template = await _advancedGamingService.CreateServerTemplateAsync(organizationId, userId, request);
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating server template for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/templates")]
        public async Task<ActionResult<List<ServerTemplate>>> GetServerTemplates(Guid organizationId, [FromQuery] ServerTemplateFilter filter)
        {
            try
            {
                var templates = await _advancedGamingService.GetServerTemplatesAsync(organizationId, filter);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server templates for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("templates/{templateId}")]
        public async Task<ActionResult<ServerTemplate>> GetServerTemplate(Guid templateId)
        {
            try
            {
                var template = await _advancedGamingService.GetServerTemplateAsync(templateId);
                return Ok(template);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("templates/{templateId}")]
        public async Task<ActionResult<ServerTemplate>> UpdateServerTemplate(Guid templateId, UpdateServerTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var template = await _advancedGamingService.UpdateServerTemplateAsync(templateId, userId, request);
                return Ok(template);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating server template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("templates/{templateId}")]
        public async Task<ActionResult> DeleteServerTemplate(Guid templateId)
        {
            try
            {
                var userId = GetUserId();
                await _advancedGamingService.DeleteServerTemplateAsync(templateId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting server template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("templates/{templateId}/create-instance")]
        public async Task<ActionResult<GameInstance>> CreateInstanceFromTemplate(Guid templateId, CreateInstanceFromTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var instance = await _advancedGamingService.CreateInstanceFromTemplateAsync(templateId, userId, request);
                return Ok(instance);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating instance from template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("templates/public")]
        public async Task<ActionResult<List<ServerTemplate>>> GetPublicServerTemplates([FromQuery] PublicTemplateFilter filter)
        {
            try
            {
                var templates = await _advancedGamingService.GetPublicServerTemplatesAsync(filter);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting public server templates");
                return BadRequest(new { message = ex.Message });
            }
        }

        // World Management
        [HttpPost("organizations/{organizationId}/worlds")]
        public async Task<ActionResult<GameWorld>> CreateGameWorld(Guid organizationId, CreateGameWorldRequest request)
        {
            try
            {
                var userId = GetUserId();
                var world = await _advancedGamingService.CreateGameWorldAsync(organizationId, userId, request);
                return Ok(world);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating game world for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/worlds")]
        public async Task<ActionResult<List<GameWorld>>> GetGameWorlds(Guid organizationId, [FromQuery] GameWorldFilter filter)
        {
            try
            {
                var worlds = await _advancedGamingService.GetGameWorldsAsync(organizationId, filter);
                return Ok(worlds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game worlds for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("worlds/{worldId}")]
        public async Task<ActionResult<GameWorld>> GetGameWorld(Guid worldId)
        {
            try
            {
                var world = await _advancedGamingService.GetGameWorldAsync(worldId);
                return Ok(world);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game world {WorldId}", worldId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("worlds/{worldId}")]
        public async Task<ActionResult<GameWorld>> UpdateGameWorld(Guid worldId, UpdateGameWorldRequest request)
        {
            try
            {
                var userId = GetUserId();
                var world = await _advancedGamingService.UpdateGameWorldAsync(worldId, userId, request);
                return Ok(world);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating game world {WorldId}", worldId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("worlds/{worldId}")]
        public async Task<ActionResult> DeleteGameWorld(Guid worldId)
        {
            try
            {
                var userId = GetUserId();
                await _advancedGamingService.DeleteGameWorldAsync(worldId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting game world {WorldId}", worldId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("worlds/{worldId}/backups")]
        public async Task<ActionResult<WorldBackup>> CreateWorldBackup(Guid worldId, CreateWorldBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _advancedGamingService.CreateWorldBackupAsync(worldId, userId, request);
                return Ok(backup);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating world backup for world {WorldId}", worldId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("worlds/{worldId}/backups")]
        public async Task<ActionResult<List<WorldBackup>>> GetWorldBackups(Guid worldId, [FromQuery] WorldBackupFilter filter)
        {
            try
            {
                var backups = await _advancedGamingService.GetWorldBackupsAsync(worldId, filter);
                return Ok(backups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting world backups for world {WorldId}", worldId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("worlds/{worldId}/restore/{backupId}")]
        public async Task<ActionResult> RestoreWorldFromBackup(Guid worldId, Guid backupId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedGamingService.RestoreWorldFromBackupAsync(worldId, backupId, userId);
                return Ok(new { success, message = success ? "World restored successfully" : "Failed to restore world" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring world {WorldId} from backup {BackupId}", worldId, backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("worlds/{worldId}/transfer")]
        public async Task<ActionResult> TransferWorld(Guid worldId, TransferWorldRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedGamingService.TransferWorldAsync(worldId, request.FromInstanceId, request.ToInstanceId, userId);
                return Ok(new { success, message = success ? "World transferred successfully" : "Failed to transfer world" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring world {WorldId}", worldId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Player Data Management
        [HttpGet("players/{playerId}/data")]
        public async Task<ActionResult<PlayerData>> GetPlayerData(Guid playerId, [FromQuery] Guid gameInstanceId)
        {
            try
            {
                var playerData = await _advancedGamingService.GetPlayerDataAsync(playerId, gameInstanceId);
                return Ok(playerData);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player data for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("players/{playerId}/data")]
        public async Task<ActionResult<PlayerData>> UpdatePlayerData(Guid playerId, [FromQuery] Guid gameInstanceId, UpdatePlayerDataRequest request)
        {
            try
            {
                var playerData = await _advancedGamingService.UpdatePlayerDataAsync(playerId, gameInstanceId, request);
                return Ok(playerData);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating player data for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("players/{playerId}/transfer-data")]
        public async Task<ActionResult> TransferPlayerData(Guid playerId, TransferPlayerDataRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedGamingService.TransferPlayerDataAsync(playerId, request.FromInstanceId, request.ToInstanceId, userId);
                return Ok(new { success, message = success ? "Player data transferred successfully" : "Failed to transfer player data" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring player data for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/{playerId}/inventory")]
        public async Task<ActionResult<List<PlayerInventory>>> GetPlayerInventory(Guid playerId, [FromQuery] Guid gameInstanceId)
        {
            try
            {
                var inventory = await _advancedGamingService.GetPlayerInventoryAsync(playerId, gameInstanceId);
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player inventory for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("players/{playerId}/inventory")]
        public async Task<ActionResult<PlayerInventory>> UpdatePlayerInventory(Guid playerId, [FromQuery] Guid gameInstanceId, UpdatePlayerInventoryRequest request)
        {
            try
            {
                var inventory = await _advancedGamingService.UpdatePlayerInventoryAsync(playerId, gameInstanceId, request);
                return Ok(inventory);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating player inventory for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/{playerId}/achievements")]
        public async Task<ActionResult<List<PlayerAchievement>>> GetPlayerAchievements(Guid playerId, [FromQuery] PlayerAchievementFilter filter)
        {
            try
            {
                var achievements = await _advancedGamingService.GetPlayerAchievementsAsync(playerId, filter);
                return Ok(achievements);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player achievements for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("players/{playerId}/achievements/{achievementId}")]
        public async Task<ActionResult<PlayerAchievement>> GrantPlayerAchievement(Guid playerId, Guid achievementId)
        {
            try
            {
                var userId = GetUserId();
                var achievement = await _advancedGamingService.GrantPlayerAchievementAsync(playerId, achievementId, userId);
                return Ok(achievement);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error granting achievement {AchievementId} to player {PlayerId}", achievementId, playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Game Events & Logging
        [HttpPost("instances/{gameInstanceId}/events")]
        public async Task<ActionResult<GameEvent>> CreateGameEvent(Guid gameInstanceId, CreateGameEventRequest request)
        {
            try
            {
                var gameEvent = await _advancedGamingService.CreateGameEventAsync(gameInstanceId, request);
                return Ok(gameEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating game event for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("instances/{gameInstanceId}/events")]
        public async Task<ActionResult<List<GameEvent>>> GetGameEvents(Guid gameInstanceId, [FromQuery] GameEventFilter filter)
        {
            try
            {
                var events = await _advancedGamingService.GetGameEventsAsync(gameInstanceId, filter);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game events for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("players/{playerId}/events")]
        public async Task<ActionResult<List<GameEvent>>> GetPlayerEvents(Guid playerId, [FromQuery] Guid gameInstanceId, [FromQuery] PlayerEventFilter filter)
        {
            try
            {
                var events = await _advancedGamingService.GetPlayerEventsAsync(playerId, gameInstanceId, filter);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting player events for player {PlayerId}", playerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("instances/{gameInstanceId}/events/analytics")]
        public async Task<ActionResult<GameEventAnalytics>> GetGameEventAnalytics(Guid gameInstanceId, [FromQuery] GameEventAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _advancedGamingService.GetGameEventAnalyticsAsync(gameInstanceId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game event analytics for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("instances/{gameInstanceId}/logs")]
        public async Task<ActionResult<List<GameLogEntry>>> GetGameLogs(Guid gameInstanceId, [FromQuery] GameLogFilter filter)
        {
            try
            {
                var logs = await _advancedGamingService.GetGameLogsAsync(gameInstanceId, filter);
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game logs for instance {GameInstanceId}", gameInstanceId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}