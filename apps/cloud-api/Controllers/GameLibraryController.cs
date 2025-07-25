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
    public class GameLibraryController : ControllerBase
    {
        private readonly IGameLibraryService _gameLibraryService;
        private readonly ILogger<GameLibraryController> _logger;

        public GameLibraryController(IGameLibraryService gameLibraryService, ILogger<GameLibraryController> logger)
        {
            _gameLibraryService = gameLibraryService;
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

        // Game Library Management
        [HttpPost("games")]
        public async Task<ActionResult<GameLibraryEntry>> AddGameToLibrary(AddGameToLibraryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var entry = await _gameLibraryService.AddGameToLibraryAsync(userId, request);
                return Ok(entry);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding game to library");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("games")]
        public async Task<ActionResult<List<GameLibraryEntry>>> GetGameLibrary([FromQuery] GameLibraryFilter? filter = null)
        {
            try
            {
                var userId = GetUserId();
                var library = await _gameLibraryService.GetUserGameLibraryAsync(userId, filter);
                return Ok(library);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game library");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("games/{entryId}")]
        public async Task<ActionResult<GameLibraryEntry>> GetGameLibraryEntry(Guid entryId)
        {
            try
            {
                var entry = await _gameLibraryService.GetGameLibraryEntryAsync(entryId);
                return Ok(entry);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game library entry {EntryId}", entryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("games/{entryId}")]
        public async Task<ActionResult<GameLibraryEntry>> UpdateGameLibraryEntry(Guid entryId, UpdateGameLibraryEntryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var entry = await _gameLibraryService.UpdateGameLibraryEntryAsync(entryId, userId, request);
                return Ok(entry);
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
                _logger.LogError(ex, "Error updating game library entry {EntryId}", entryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("games/{entryId}")]
        public async Task<ActionResult> RemoveGameFromLibrary(Guid entryId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.RemoveGameFromLibraryAsync(entryId, userId);
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
                _logger.LogError(ex, "Error removing game from library {EntryId}", entryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<GameLibraryStats>> GetLibraryStats()
        {
            try
            {
                var userId = GetUserId();
                var stats = await _gameLibraryService.GetGameLibraryStatsAsync(userId);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting library stats");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Game Installation Management
        [HttpPost("games/{gameId}/install")]
        public async Task<ActionResult<GameInstallation>> InstallGame(Guid gameId, InstallGameRequest request)
        {
            try
            {
                var userId = GetUserId();
                var installation = await _gameLibraryService.InstallGameAsync(userId, gameId, request);
                return Ok(installation);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error installing game {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations")]
        public async Task<ActionResult<List<GameInstallation>>> GetGameInstallations([FromQuery] Guid? gameId = null)
        {
            try
            {
                var userId = GetUserId();
                var installations = await _gameLibraryService.GetUserGameInstallationsAsync(userId, gameId);
                return Ok(installations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game installations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}")]
        public async Task<ActionResult<GameInstallation>> GetGameInstallation(Guid installationId)
        {
            try
            {
                var installation = await _gameLibraryService.GetGameInstallationAsync(installationId);
                return Ok(installation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("installations/{installationId}")]
        public async Task<ActionResult<GameInstallation>> UpdateGameInstallation(Guid installationId, UpdateGameInstallationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var installation = await _gameLibraryService.UpdateGameInstallationAsync(installationId, userId, request);
                return Ok(installation);
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
                _logger.LogError(ex, "Error updating game installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("installations/{installationId}")]
        public async Task<ActionResult> UninstallGame(Guid installationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.UninstallGameAsync(installationId, userId);
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
                _logger.LogError(ex, "Error uninstalling game {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/progress")]
        public async Task<ActionResult<InstallationProgress>> GetInstallationProgress(Guid installationId)
        {
            try
            {
                var progress = await _gameLibraryService.GetInstallationProgressAsync(installationId);
                return Ok(progress);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting installation progress {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/pause")]
        public async Task<ActionResult> PauseInstallation(Guid installationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.PauseInstallationAsync(installationId, userId);
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
                _logger.LogError(ex, "Error pausing installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/resume")]
        public async Task<ActionResult> ResumeInstallation(Guid installationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.ResumeInstallationAsync(installationId, userId);
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
                _logger.LogError(ex, "Error resuming installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/cancel")]
        public async Task<ActionResult> CancelInstallation(Guid installationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.CancelInstallationAsync(installationId, userId);
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
                _logger.LogError(ex, "Error cancelling installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/verify")]
        public async Task<ActionResult> VerifyInstallation(Guid installationId)
        {
            try
            {
                var success = await _gameLibraryService.VerifyGameInstallationAsync(installationId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Game Version Management
        [HttpGet("games/{gameId}/versions")]
        public async Task<ActionResult<List<GameVersion>>> GetAvailableGameVersions(Guid gameId)
        {
            try
            {
                var versions = await _gameLibraryService.GetAvailableGameVersionsAsync(gameId);
                return Ok(versions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game versions for {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("versions/{versionId}")]
        public async Task<ActionResult<GameVersion>> GetGameVersion(Guid versionId)
        {
            try
            {
                var version = await _gameLibraryService.GetGameVersionAsync(versionId);
                return Ok(version);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game version {VersionId}", versionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/update")]
        public async Task<ActionResult<GameInstallation>> UpdateGameVersion(Guid installationId, [FromBody] UpdateGameVersionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var installation = await _gameLibraryService.UpdateGameVersionAsync(installationId, userId, request.TargetVersionId);
                return Ok(installation);
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
                _logger.LogError(ex, "Error updating game version for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/rollback")]
        public async Task<ActionResult> RollbackGameVersion(Guid installationId, [FromBody] RollbackGameVersionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.RollbackGameVersionAsync(installationId, userId, request.TargetVersionId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back game version for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/versions")]
        public async Task<ActionResult<List<GameVersion>>> GetInstalledGameVersions(Guid installationId)
        {
            try
            {
                var versions = await _gameLibraryService.GetInstalledGameVersionsAsync(installationId);
                return Ok(versions);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting installed versions for {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Game Detection & Discovery
        [HttpPost("scan")]
        public async Task<ActionResult<List<DetectedGame>>> ScanForInstalledGames(ScanGameRequest request)
        {
            try
            {
                var userId = GetUserId();
                var detectedGames = await _gameLibraryService.ScanForInstalledGamesAsync(userId, request);
                return Ok(detectedGames);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scanning for installed games");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("detect")]
        public async Task<ActionResult<GameDetectionResult>> DetectGame([FromBody] DetectGameRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _gameLibraryService.DetectGameAsync(userId, request.GamePath);
                return Ok(result);
            }
            catch (DirectoryNotFoundException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting game at path {GamePath}", request.GamePath);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("suggestions")]
        public async Task<ActionResult<List<GameSuggestion>>> GetGameSuggestions([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var suggestions = await _gameLibraryService.GetGameSuggestionsAsync(userId, limit);
                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game suggestions");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("import")]
        public async Task<ActionResult<GameLibraryEntry>> ImportDetectedGame(ImportGameRequest request)
        {
            try
            {
                var userId = GetUserId();
                var entry = await _gameLibraryService.ImportDetectedGameAsync(userId, request);
                return Ok(entry);
            }
            catch (NotImplementedException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error importing detected game");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Management
        [HttpPost("installations/{installationId}/mods")]
        public async Task<ActionResult<GameMod>> InstallMod(Guid installationId, InstallModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var mod = await _gameLibraryService.InstallModAsync(installationId, userId, request);
                return Ok(mod);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error installing mod for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/mods")]
        public async Task<ActionResult<List<GameMod>>> GetInstalledMods(Guid installationId)
        {
            try
            {
                var mods = await _gameLibraryService.GetInstalledModsAsync(installationId);
                return Ok(mods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting installed mods for {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("games/{gameId}/mods")]
        public async Task<ActionResult<List<AvailableMod>>> GetAvailableMods(Guid gameId, [FromQuery] ModSearchFilter? filter = null)
        {
            try
            {
                var mods = await _gameLibraryService.GetAvailableModsAsync(gameId, filter);
                return Ok(mods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available mods for game {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("mods/{modId}")]
        public async Task<ActionResult> UninstallMod(Guid modId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.UninstallModAsync(modId, userId);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uninstalling mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Configuration Management
        [HttpPost("installations/{installationId}/configurations")]
        public async Task<ActionResult<GameConfiguration>> CreateGameConfiguration(Guid installationId, CreateGameConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var configuration = await _gameLibraryService.CreateGameConfigurationAsync(installationId, userId, request);
                return Ok(configuration);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating game configuration for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/configurations")]
        public async Task<ActionResult<List<GameConfiguration>>> GetGameConfigurations(Guid installationId)
        {
            try
            {
                var configurations = await _gameLibraryService.GetGameConfigurationsAsync(installationId);
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game configurations for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/configurations/active")]
        public async Task<ActionResult<GameConfiguration>> GetActiveGameConfiguration(Guid installationId)
        {
            try
            {
                var configuration = await _gameLibraryService.GetActiveGameConfigurationAsync(installationId);
                return Ok(configuration);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active configuration for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Game Launching
        [HttpPost("installations/{installationId}/launch")]
        public async Task<ActionResult<GameLaunchResult>> LaunchGame(Guid installationId, LaunchGameRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _gameLibraryService.LaunchGameAsync(installationId, userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error launching game for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sessions")]
        public async Task<ActionResult<List<ActiveGameSession>>> GetActiveGameSessions()
        {
            try
            {
                var userId = GetUserId();
                var sessions = await _gameLibraryService.GetActiveGameSessionsAsync(userId);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active game sessions");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sessions/{sessionId}")]
        public async Task<ActionResult<GameSession>> GetGameSession(Guid sessionId)
        {
            try
            {
                var session = await _gameLibraryService.GetGameSessionAsync(sessionId);
                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("sessions/{sessionId}")]
        public async Task<ActionResult> TerminateGameSession(Guid sessionId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.TerminateGameSessionAsync(sessionId, userId);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error terminating game session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Analytics & Insights
        [HttpGet("analytics/playtime")]
        public async Task<ActionResult<GamePlaytimeAnalytics>> GetPlaytimeAnalytics(
            [FromQuery] Guid? gameId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _gameLibraryService.GetGamePlaytimeAnalyticsAsync(userId, gameId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting playtime analytics");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/insights")]
        public async Task<ActionResult<LibraryInsights>> GetLibraryInsights()
        {
            try
            {
                var userId = GetUserId();
                var insights = await _gameLibraryService.GetLibraryInsightsAsync(userId);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting library insights");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recommendations")]
        public async Task<ActionResult<List<GameRecommendation>>> GetGameRecommendations([FromQuery] int limit = 10)
        {
            try
            {
                var userId = GetUserId();
                var recommendations = await _gameLibraryService.GetGameRecommendationsAsync(userId, limit);
                return Ok(recommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game recommendations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("reports/usage")]
        public async Task<ActionResult<GameUsageReport>> GetGameUsageReport(
            [FromQuery] GameUsageReportType reportType,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = GetUserId();
                var report = await _gameLibraryService.GetGameUsageReportAsync(userId, reportType, startDate, endDate);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game usage report");
                return BadRequest(new { message = ex.Message });
            }
        }

        // System Requirements & Optimization
        [HttpGet("games/{gameId}/requirements")]
        public async Task<ActionResult<SystemRequirementsCheck>> CheckSystemRequirements(Guid gameId, [FromQuery] Guid? versionId = null)
        {
            try
            {
                var check = await _gameLibraryService.CheckSystemRequirementsAsync(gameId, versionId);
                return Ok(check);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking system requirements for game {GameId}", gameId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/optimization")]
        public async Task<ActionResult<OptimizationSuggestions>> GetOptimizationSuggestions(Guid installationId)
        {
            try
            {
                var userId = GetUserId();
                var suggestions = await _gameLibraryService.GetOptimizationSuggestionsAsync(installationId, userId);
                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting optimization suggestions for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/optimize")]
        public async Task<ActionResult> ApplyOptimization(Guid installationId, [FromBody] ApplyOptimizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.ApplyOptimizationAsync(installationId, userId, request.Actions);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying optimization for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Backup & Sync
        [HttpPost("installations/{installationId}/backup")]
        public async Task<ActionResult<GameBackup>> CreateGameBackup(Guid installationId, CreateGameBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _gameLibraryService.CreateGameBackupAsync(installationId, userId, request);
                return Ok(backup);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating game backup for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/backups")]
        public async Task<ActionResult<List<GameBackup>>> GetGameBackups(Guid installationId)
        {
            try
            {
                var backups = await _gameLibraryService.GetGameBackupsAsync(installationId);
                return Ok(backups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game backups for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("backups/{backupId}/restore")]
        public async Task<ActionResult> RestoreGameBackup(Guid backupId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _gameLibraryService.RestoreGameBackupAsync(backupId, userId);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring game backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTOs
    public class UpdateGameVersionRequest
    {
        public Guid TargetVersionId { get; set; }
    }

    public class RollbackGameVersionRequest
    {
        public Guid TargetVersionId { get; set; }
    }

    public class DetectGameRequest
    {
        public string GamePath { get; set; } = string.Empty;
    }

    public class ApplyOptimizationRequest
    {
        public List<OptimizationAction> Actions { get; set; } = new();
    }
}