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
    public class BackupRecoveryController : ControllerBase
    {
        private readonly IBackupRecoveryService _backupRecoveryService;
        private readonly ILogger<BackupRecoveryController> _logger;

        public BackupRecoveryController(
            IBackupRecoveryService backupRecoveryService,
            ILogger<BackupRecoveryController> logger)
        {
            _backupRecoveryService = backupRecoveryService;
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

        // Server Backup Management
        [HttpPost("servers/{serverId}/backups")]
        public async Task<ActionResult<ServerBackup>> CreateServerBackup(Guid serverId, CreateServerBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _backupRecoveryService.CreateServerBackupAsync(serverId, userId, request);
                return Ok(backup);
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
                _logger.LogError(ex, "Error creating backup for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/backups")]
        public async Task<ActionResult<List<ServerBackup>>> GetServerBackups(Guid serverId)
        {
            try
            {
                var backups = await _backupRecoveryService.GetServerBackupsAsync(serverId);
                return Ok(backups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backups for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backups/{backupId}")]
        public async Task<ActionResult<ServerBackup>> GetServerBackup(Guid backupId)
        {
            try
            {
                var backup = await _backupRecoveryService.GetServerBackupAsync(backupId);
                return Ok(backup);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("backups/{backupId}")]
        public async Task<ActionResult> DeleteServerBackup(Guid backupId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.DeleteServerBackupAsync(backupId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backups/{backupId}/progress")]
        public async Task<ActionResult<BackupProgress>> GetBackupProgress(Guid backupId)
        {
            try
            {
                var progress = await _backupRecoveryService.GetBackupProgressAsync(backupId);
                return Ok(progress);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup progress {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("backups/{backupId}/cancel")]
        public async Task<ActionResult> CancelBackup(Guid backupId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.CancelBackupAsync(backupId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Server Recovery Management
        [HttpPost("backups/{backupId}/restore")]
        public async Task<ActionResult<RecoveryJob>> RestoreServerFromBackup(Guid backupId, RestoreServerRequest request)
        {
            try
            {
                var userId = GetUserId();
                var job = await _backupRecoveryService.RestoreServerFromBackupAsync(backupId, userId, request);
                return Ok(job);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring from backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/recovery-jobs")]
        public async Task<ActionResult<List<RecoveryJob>>> GetRecoveryJobs(Guid serverId)
        {
            try
            {
                var jobs = await _backupRecoveryService.GetRecoveryJobsAsync(serverId);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recovery jobs for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recovery-jobs/{jobId}")]
        public async Task<ActionResult<RecoveryJob>> GetRecoveryJob(Guid jobId)
        {
            try
            {
                var job = await _backupRecoveryService.GetRecoveryJobAsync(jobId);
                return Ok(job);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recovery job {JobId}", jobId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("recovery-jobs/{jobId}/progress")]
        public async Task<ActionResult<RecoveryProgress>> GetRecoveryProgress(Guid jobId)
        {
            try
            {
                var progress = await _backupRecoveryService.GetRecoveryProgressAsync(jobId);
                return Ok(progress);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recovery progress {JobId}", jobId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("recovery-jobs/{jobId}/cancel")]
        public async Task<ActionResult> CancelRecovery(Guid jobId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.CancelRecoveryAsync(jobId, userId);
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling recovery job {JobId}", jobId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Automated Backup Scheduling
        [HttpPost("servers/{serverId}/backup-schedules")]
        public async Task<ActionResult<BackupSchedule>> CreateBackupSchedule(Guid serverId, CreateBackupScheduleRequest request)
        {
            try
            {
                var userId = GetUserId();
                var schedule = await _backupRecoveryService.CreateBackupScheduleAsync(serverId, userId, request);
                return Ok(schedule);
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
                _logger.LogError(ex, "Error creating backup schedule for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/backup-schedules")]
        public async Task<ActionResult<List<BackupSchedule>>> GetBackupSchedules(Guid serverId)
        {
            try
            {
                var schedules = await _backupRecoveryService.GetBackupSchedulesAsync(serverId);
                return Ok(schedules);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup schedules for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("backup-schedules/{scheduleId}")]
        public async Task<ActionResult<BackupSchedule>> UpdateBackupSchedule(Guid scheduleId, UpdateBackupScheduleRequest request)
        {
            try
            {
                var userId = GetUserId();
                var schedule = await _backupRecoveryService.UpdateBackupScheduleAsync(scheduleId, userId, request);
                return Ok(schedule);
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
                _logger.LogError(ex, "Error updating backup schedule {ScheduleId}", scheduleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("backup-schedules/{scheduleId}")]
        public async Task<ActionResult> DeleteBackupSchedule(Guid scheduleId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.DeleteBackupScheduleAsync(scheduleId, userId);
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
                _logger.LogError(ex, "Error deleting backup schedule {ScheduleId}", scheduleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("backup-schedules/{scheduleId}/enable")]
        public async Task<ActionResult> EnableBackupSchedule(Guid scheduleId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.EnableBackupScheduleAsync(scheduleId, userId);
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
                _logger.LogError(ex, "Error enabling backup schedule {ScheduleId}", scheduleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("backup-schedules/{scheduleId}/disable")]
        public async Task<ActionResult> DisableBackupSchedule(Guid scheduleId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.DisableBackupScheduleAsync(scheduleId, userId);
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
                _logger.LogError(ex, "Error disabling backup schedule {ScheduleId}", scheduleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Backup Policies & Retention
        [HttpPost("servers/{serverId}/backup-policies")]
        public async Task<ActionResult<BackupPolicy>> CreateBackupPolicy(Guid serverId, CreateBackupPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _backupRecoveryService.CreateBackupPolicyAsync(serverId, userId, request);
                return Ok(policy);
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
                _logger.LogError(ex, "Error creating backup policy for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/backup-policies")]
        public async Task<ActionResult<List<BackupPolicy>>> GetBackupPolicies(Guid serverId)
        {
            try
            {
                var policies = await _backupRecoveryService.GetBackupPoliciesAsync(serverId);
                return Ok(policies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup policies for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("backup-policies/{policyId}")]
        public async Task<ActionResult<BackupPolicy>> UpdateBackupPolicy(Guid policyId, UpdateBackupPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _backupRecoveryService.UpdateBackupPolicyAsync(policyId, userId, request);
                return Ok(policy);
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
                _logger.LogError(ex, "Error updating backup policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("backup-policies/{policyId}")]
        public async Task<ActionResult> DeleteBackupPolicy(Guid policyId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.DeleteBackupPolicyAsync(policyId, userId);
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
                _logger.LogError(ex, "Error deleting backup policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/apply-policy/{policyId}")]
        public async Task<ActionResult> ApplyBackupPolicy(Guid serverId, Guid policyId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.ApplyBackupPolicyAsync(serverId, policyId, userId);
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
                _logger.LogError(ex, "Error applying backup policy {PolicyId} to server {ServerId}", policyId, serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Incremental & Differential Backups
        [HttpPost("servers/{serverId}/incremental-backups")]
        public async Task<ActionResult<ServerBackup>> CreateIncrementalBackup(Guid serverId, CreateIncrementalBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _backupRecoveryService.CreateIncrementalBackupAsync(serverId, userId, request);
                return Ok(backup);
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
                _logger.LogError(ex, "Error creating incremental backup for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/differential-backups")]
        public async Task<ActionResult<ServerBackup>> CreateDifferentialBackup(Guid serverId, CreateDifferentialBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _backupRecoveryService.CreateDifferentialBackupAsync(serverId, userId, request);
                return Ok(backup);
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
                _logger.LogError(ex, "Error creating differential backup for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backups/{baseBackupId}/chain")]
        public async Task<ActionResult<List<ServerBackup>>> GetBackupChain(Guid baseBackupId)
        {
            try
            {
                var chain = await _backupRecoveryService.GetBackupChainAsync(baseBackupId);
                return Ok(chain);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup chain for {BaseBackupId}", baseBackupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backups/{backupId}/chain-info")]
        public async Task<ActionResult<BackupChainInfo>> GetBackupChainInfo(Guid backupId)
        {
            try
            {
                var info = await _backupRecoveryService.GetBackupChainInfoAsync(backupId);
                return Ok(info);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup chain info for {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Backup Verification & Integrity
        [HttpPost("backups/{backupId}/verify")]
        public async Task<ActionResult<BackupVerificationResult>> VerifyBackupIntegrity(Guid backupId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _backupRecoveryService.VerifyBackupIntegrityAsync(backupId, userId);
                return Ok(result);
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
                _logger.LogError(ex, "Error verifying backup integrity {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backups/{backupId}/verification-history")]
        public async Task<ActionResult<List<BackupVerificationResult>>> GetBackupVerificationHistory(Guid backupId)
        {
            try
            {
                var history = await _backupRecoveryService.GetBackupVerificationHistoryAsync(backupId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup verification history {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("backups/{backupId}/schedule-verification")]
        public async Task<ActionResult> ScheduleBackupVerification(Guid backupId, [FromBody] VerificationSchedule schedule)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.ScheduleBackupVerificationAsync(backupId, userId, schedule);
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
                _logger.LogError(ex, "Error scheduling backup verification {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/backup-health")]
        public async Task<ActionResult<BackupHealthReport>> GetBackupHealthReport(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var report = await _backupRecoveryService.GetBackupHealthReportAsync(serverId, userId);
                return Ok(report);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup health report for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Disaster Recovery Planning
        [HttpPost("servers/{serverId}/disaster-recovery-plans")]
        public async Task<ActionResult<DisasterRecoveryPlan>> CreateDisasterRecoveryPlan(Guid serverId, CreateDisasterRecoveryPlanRequest request)
        {
            try
            {
                var userId = GetUserId();
                var plan = await _backupRecoveryService.CreateDisasterRecoveryPlanAsync(serverId, userId, request);
                return Ok(plan);
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
                _logger.LogError(ex, "Error creating disaster recovery plan for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/disaster-recovery-plans")]
        public async Task<ActionResult<List<DisasterRecoveryPlan>>> GetDisasterRecoveryPlans(Guid serverId)
        {
            try
            {
                var plans = await _backupRecoveryService.GetDisasterRecoveryPlansAsync(serverId);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting disaster recovery plans for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("disaster-recovery-plans/{planId}")]
        public async Task<ActionResult<DisasterRecoveryPlan>> UpdateDisasterRecoveryPlan(Guid planId, UpdateDisasterRecoveryPlanRequest request)
        {
            try
            {
                var userId = GetUserId();
                var plan = await _backupRecoveryService.UpdateDisasterRecoveryPlanAsync(planId, userId, request);
                return Ok(plan);
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
                _logger.LogError(ex, "Error updating disaster recovery plan {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("disaster-recovery-plans/{planId}")]
        public async Task<ActionResult> DeleteDisasterRecoveryPlan(Guid planId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.DeleteDisasterRecoveryPlanAsync(planId, userId);
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
                _logger.LogError(ex, "Error deleting disaster recovery plan {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("disaster-recovery-plans/{planId}/drill")]
        public async Task<ActionResult<DrillResult>> ExecuteDisasterRecoveryDrill(Guid planId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _backupRecoveryService.ExecuteDisasterRecoveryDrillAsync(planId, userId);
                return Ok(result);
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
                _logger.LogError(ex, "Error executing disaster recovery drill {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Backup Storage Management
        [HttpPost("backup-storage")]
        public async Task<ActionResult<BackupStorage>> ConfigureBackupStorage(ConfigureBackupStorageRequest request)
        {
            try
            {
                var userId = GetUserId();
                var storage = await _backupRecoveryService.ConfigureBackupStorageAsync(userId, request);
                return Ok(storage);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring backup storage");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backup-storage")]
        public async Task<ActionResult<List<BackupStorage>>> GetBackupStorageConfigurations()
        {
            try
            {
                var userId = GetUserId();
                var configurations = await _backupRecoveryService.GetBackupStorageConfigurationsAsync(userId);
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup storage configurations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("backup-storage/{storageId}")]
        public async Task<ActionResult<BackupStorage>> UpdateBackupStorage(Guid storageId, UpdateBackupStorageRequest request)
        {
            try
            {
                var userId = GetUserId();
                var storage = await _backupRecoveryService.UpdateBackupStorageAsync(storageId, userId, request);
                return Ok(storage);
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
                _logger.LogError(ex, "Error updating backup storage {StorageId}", storageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("backup-storage/{storageId}")]
        public async Task<ActionResult> DeleteBackupStorage(Guid storageId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _backupRecoveryService.DeleteBackupStorageAsync(storageId, userId);
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
                _logger.LogError(ex, "Error deleting backup storage {StorageId}", storageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backup-storage/{storageId}/usage")]
        public async Task<ActionResult<StorageUsageReport>> GetStorageUsageReport(Guid storageId)
        {
            try
            {
                var userId = GetUserId();
                var report = await _backupRecoveryService.GetStorageUsageReportAsync(storageId, userId);
                return Ok(report);
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
                _logger.LogError(ex, "Error getting storage usage report {StorageId}", storageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Cross-Platform Backup Support
        [HttpPost("servers/{serverId}/cross-platform-backups")]
        public async Task<ActionResult<ServerBackup>> CreateCrossPlatformBackup(Guid serverId, CrossPlatformBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _backupRecoveryService.CreateCrossPlatformBackupAsync(serverId, userId, request);
                return Ok(backup);
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
                _logger.LogError(ex, "Error creating cross-platform backup for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("backups/{backupId}/cross-platform-restore")]
        public async Task<ActionResult<RecoveryJob>> RestoreCrossPlatformBackup(Guid backupId, CrossPlatformRestoreRequest request)
        {
            try
            {
                var userId = GetUserId();
                var job = await _backupRecoveryService.RestoreCrossPlatformBackupAsync(backupId, userId, request);
                return Ok(job);
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
                _logger.LogError(ex, "Error restoring cross-platform backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backups/{backupId}/platform-compatibility")]
        public async Task<ActionResult<PlatformCompatibilityReport>> GetPlatformCompatibilityReport(Guid backupId)
        {
            try
            {
                var report = await _backupRecoveryService.GetPlatformCompatibilityReportAsync(backupId);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting platform compatibility report {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Backup Analytics & Reporting
        [HttpGet("servers/{serverId}/backup-analytics")]
        public async Task<ActionResult<BackupAnalytics>> GetBackupAnalytics(Guid serverId, [FromQuery] AnalyticsTimeRange timeRange)
        {
            try
            {
                var userId = GetUserId();
                var analytics = await _backupRecoveryService.GetBackupAnalyticsAsync(serverId, userId, timeRange);
                return Ok(analytics);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup analytics for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/backup-reports")]
        public async Task<ActionResult<BackupReport>> GenerateBackupReport(Guid serverId, BackupReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _backupRecoveryService.GenerateBackupReportAsync(serverId, userId, request);
                return Ok(report);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating backup report for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/backup-trends")]
        public async Task<ActionResult<List<BackupTrend>>> GetBackupTrends(Guid serverId, [FromQuery] TrendAnalysisRequest request)
        {
            try
            {
                var trends = await _backupRecoveryService.GetBackupTrendsAsync(serverId, request);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup trends for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/backup-cost-analysis")]
        public async Task<ActionResult<BackupCostAnalysis>> GetBackupCostAnalysis(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var analysis = await _backupRecoveryService.GetBackupCostAnalysisAsync(serverId, userId);
                return Ok(analysis);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting backup cost analysis for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}