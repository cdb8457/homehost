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
    public class AdvancedServerConfigController : ControllerBase
    {
        private readonly IAdvancedServerConfigService _advancedServerConfigService;
        private readonly ILogger<AdvancedServerConfigController> _logger;

        public AdvancedServerConfigController(
            IAdvancedServerConfigService advancedServerConfigService,
            ILogger<AdvancedServerConfigController> logger)
        {
            _advancedServerConfigService = advancedServerConfigService;
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

        // Server Configuration Management
        [HttpPost("configurations")]
        public async Task<ActionResult<ServerConfiguration>> CreateServerConfiguration(CreateServerConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var configuration = await _advancedServerConfigService.CreateServerConfigurationAsync(userId, request);
                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating server configuration");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("configurations")]
        public async Task<ActionResult<List<ServerConfiguration>>> GetUserServerConfigurations([FromQuery] ServerConfigFilter? filter = null)
        {
            try
            {
                var userId = GetUserId();
                var configurations = await _advancedServerConfigService.GetUserServerConfigurationsAsync(userId, filter);
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user server configurations");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("configurations/{configurationId}")]
        public async Task<ActionResult<ServerConfiguration>> GetServerConfiguration(Guid configurationId)
        {
            try
            {
                var configuration = await _advancedServerConfigService.GetServerConfigurationAsync(configurationId);
                return Ok(configuration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting server configuration {ConfigurationId}", configurationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("configurations/{configurationId}")]
        public async Task<ActionResult<ServerConfiguration>> UpdateServerConfiguration(Guid configurationId, UpdateServerConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var configuration = await _advancedServerConfigService.UpdateServerConfigurationAsync(configurationId, userId, request);
                return Ok(configuration);
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
                _logger.LogError(ex, "Error updating server configuration {ConfigurationId}", configurationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("configurations/{configurationId}")]
        public async Task<ActionResult> DeleteServerConfiguration(Guid configurationId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.DeleteServerConfigurationAsync(configurationId, userId);
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
                _logger.LogError(ex, "Error deleting server configuration {ConfigurationId}", configurationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("configurations/{configurationId}/duplicate")]
        public async Task<ActionResult<ServerConfiguration>> DuplicateServerConfiguration(Guid configurationId, [FromBody] DuplicateConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var configuration = await _advancedServerConfigService.DuplicateServerConfigurationAsync(configurationId, userId, request.NewName);
                return Ok(configuration);
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
                _logger.LogError(ex, "Error duplicating server configuration {ConfigurationId}", configurationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/apply-configuration")]
        public async Task<ActionResult> ApplyConfigurationToServer(Guid serverId, [FromBody] ApplyConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.ApplyConfigurationToServerAsync(serverId, request.ConfigurationId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying configuration to server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Dynamic Server Scaling
        [HttpPost("servers/{serverId}/scaling-policies")]
        public async Task<ActionResult<ScalingPolicy>> CreateScalingPolicy(Guid serverId, CreateScalingPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _advancedServerConfigService.CreateScalingPolicyAsync(serverId, userId, request);
                return Ok(policy);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating scaling policy for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/scaling-policies")]
        public async Task<ActionResult<List<ScalingPolicy>>> GetServerScalingPolicies(Guid serverId)
        {
            try
            {
                var policies = await _advancedServerConfigService.GetServerScalingPoliciesAsync(serverId);
                return Ok(policies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting scaling policies for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("scaling-policies/{policyId}")]
        public async Task<ActionResult<ScalingPolicy>> UpdateScalingPolicy(Guid policyId, UpdateScalingPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _advancedServerConfigService.UpdateScalingPolicyAsync(policyId, userId, request);
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
                _logger.LogError(ex, "Error updating scaling policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("scaling-policies/{policyId}")]
        public async Task<ActionResult> DeleteScalingPolicy(Guid policyId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.DeleteScalingPolicyAsync(policyId, userId);
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
                _logger.LogError(ex, "Error deleting scaling policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/auto-scaling/enable")]
        public async Task<ActionResult> EnableAutoScaling(Guid serverId, [FromBody] AutoScalingConfiguration config)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.EnableAutoScalingAsync(serverId, userId, config);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enabling auto scaling for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/auto-scaling/disable")]
        public async Task<ActionResult> DisableAutoScaling(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.DisableAutoScalingAsync(serverId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error disabling auto scaling for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/scaling-history")]
        public async Task<ActionResult<ScalingHistory>> GetScalingHistory(Guid serverId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var history = await _advancedServerConfigService.GetScalingHistoryAsync(serverId, startDate, endDate);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting scaling history for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/scaling/manual")]
        public async Task<ActionResult> TriggerManualScaling(Guid serverId, [FromBody] ManualScalingRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.TriggerManualScalingAsync(serverId, userId, request);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error triggering manual scaling for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Load Balancing
        [HttpPost("load-balancers")]
        public async Task<ActionResult<LoadBalancer>> CreateLoadBalancer(CreateLoadBalancerRequest request)
        {
            try
            {
                var userId = GetUserId();
                var loadBalancer = await _advancedServerConfigService.CreateLoadBalancerAsync(userId, request);
                return Ok(loadBalancer);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating load balancer");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("load-balancers")]
        public async Task<ActionResult<List<LoadBalancer>>> GetUserLoadBalancers()
        {
            try
            {
                var userId = GetUserId();
                var loadBalancers = await _advancedServerConfigService.GetUserLoadBalancersAsync(userId);
                return Ok(loadBalancers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user load balancers");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("load-balancers/{loadBalancerId}")]
        public async Task<ActionResult<LoadBalancer>> GetLoadBalancer(Guid loadBalancerId)
        {
            try
            {
                var loadBalancer = await _advancedServerConfigService.GetLoadBalancerAsync(loadBalancerId);
                return Ok(loadBalancer);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting load balancer {LoadBalancerId}", loadBalancerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("load-balancers/{loadBalancerId}")]
        public async Task<ActionResult<LoadBalancer>> UpdateLoadBalancer(Guid loadBalancerId, UpdateLoadBalancerRequest request)
        {
            try
            {
                var userId = GetUserId();
                var loadBalancer = await _advancedServerConfigService.UpdateLoadBalancerAsync(loadBalancerId, userId, request);
                return Ok(loadBalancer);
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
                _logger.LogError(ex, "Error updating load balancer {LoadBalancerId}", loadBalancerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("load-balancers/{loadBalancerId}")]
        public async Task<ActionResult> DeleteLoadBalancer(Guid loadBalancerId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.DeleteLoadBalancerAsync(loadBalancerId, userId);
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
                _logger.LogError(ex, "Error deleting load balancer {LoadBalancerId}", loadBalancerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("load-balancers/{loadBalancerId}/servers/{serverId}")]
        public async Task<ActionResult> AddServerToLoadBalancer(Guid loadBalancerId, Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.AddServerToLoadBalancerAsync(loadBalancerId, serverId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding server {ServerId} to load balancer {LoadBalancerId}", serverId, loadBalancerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("load-balancers/{loadBalancerId}/servers/{serverId}")]
        public async Task<ActionResult> RemoveServerFromLoadBalancer(Guid loadBalancerId, Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.RemoveServerFromLoadBalancerAsync(loadBalancerId, serverId, userId);
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
                _logger.LogError(ex, "Error removing server {ServerId} from load balancer {LoadBalancerId}", serverId, loadBalancerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("load-balancers/{loadBalancerId}/metrics")]
        public async Task<ActionResult<LoadBalancerMetrics>> GetLoadBalancerMetrics(Guid loadBalancerId)
        {
            try
            {
                var metrics = await _advancedServerConfigService.GetLoadBalancerMetricsAsync(loadBalancerId);
                return Ok(metrics);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting load balancer metrics {LoadBalancerId}", loadBalancerId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Custom Game Mode Management
        [HttpPost("servers/{serverId}/game-modes")]
        public async Task<ActionResult<CustomGameMode>> CreateCustomGameMode(Guid serverId, CreateCustomGameModeRequest request)
        {
            try
            {
                var userId = GetUserId();
                var gameMode = await _advancedServerConfigService.CreateCustomGameModeAsync(serverId, userId, request);
                return Ok(gameMode);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating custom game mode for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/game-modes")]
        public async Task<ActionResult<List<CustomGameMode>>> GetServerGameModes(Guid serverId)
        {
            try
            {
                var gameModes = await _advancedServerConfigService.GetServerGameModesAsync(serverId);
                return Ok(gameModes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting game modes for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("game-modes/{gameModeId}")]
        public async Task<ActionResult<CustomGameMode>> GetCustomGameMode(Guid gameModeId)
        {
            try
            {
                var gameMode = await _advancedServerConfigService.GetCustomGameModeAsync(gameModeId);
                return Ok(gameMode);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting custom game mode {GameModeId}", gameModeId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("game-modes/{gameModeId}")]
        public async Task<ActionResult<CustomGameMode>> UpdateCustomGameMode(Guid gameModeId, UpdateCustomGameModeRequest request)
        {
            try
            {
                var userId = GetUserId();
                var gameMode = await _advancedServerConfigService.UpdateCustomGameModeAsync(gameModeId, userId, request);
                return Ok(gameMode);
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
                _logger.LogError(ex, "Error updating custom game mode {GameModeId}", gameModeId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("game-modes/{gameModeId}")]
        public async Task<ActionResult> DeleteCustomGameMode(Guid gameModeId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.DeleteCustomGameModeAsync(gameModeId, userId);
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
                _logger.LogError(ex, "Error deleting custom game mode {GameModeId}", gameModeId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/game-modes/{gameModeId}/activate")]
        public async Task<ActionResult> SetActiveGameMode(Guid serverId, Guid gameModeId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.SetActiveGameModeAsync(serverId, gameModeId, userId);
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
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting active game mode {GameModeId} for server {ServerId}", gameModeId, serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Configuration Validation & Testing
        [HttpPost("configurations/{configurationId}/validate")]
        public async Task<ActionResult<ValidationResult>> ValidateServerConfiguration(Guid configurationId)
        {
            try
            {
                var result = await _advancedServerConfigService.ValidateServerConfigurationAsync(configurationId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating server configuration {ConfigurationId}", configurationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/validate-settings")]
        public async Task<ActionResult<ValidationResult>> ValidateServerSettings(Guid serverId, [FromBody] Dictionary<string, object> settings)
        {
            try
            {
                var result = await _advancedServerConfigService.ValidateServerSettingsAsync(serverId, settings);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating server settings for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/test-configuration")]
        public async Task<ActionResult<TestResult>> TestServerConfiguration(Guid serverId, TestConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedServerConfigService.TestServerConfigurationAsync(serverId, userId, request);
                return Ok(result);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing server configuration for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/rollback-configuration")]
        public async Task<ActionResult> RollbackConfiguration(Guid serverId, [FromBody] RollbackConfigurationRequest? request = null)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.RollbackConfigurationAsync(serverId, userId, request?.TargetConfigurationId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rolling back configuration for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/configuration-history")]
        public async Task<ActionResult<List<ConfigurationSnapshot>>> GetConfigurationHistory(Guid serverId)
        {
            try
            {
                var history = await _advancedServerConfigService.GetConfigurationHistoryAsync(serverId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting configuration history for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/configuration-snapshot")]
        public async Task<ActionResult<ConfigurationSnapshot>> CreateConfigurationSnapshot(Guid serverId, [FromBody] CreateSnapshotRequest? request = null)
        {
            try
            {
                var userId = GetUserId();
                var snapshot = await _advancedServerConfigService.CreateConfigurationSnapshotAsync(serverId, userId, request?.Description);
                return Ok(snapshot);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating configuration snapshot for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Resource Management
        [HttpGet("servers/{serverId}/resource-allocation")]
        public async Task<ActionResult<ResourceAllocation>> GetResourceAllocation(Guid serverId)
        {
            try
            {
                var allocation = await _advancedServerConfigService.GetResourceAllocationAsync(serverId);
                return Ok(allocation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource allocation for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("servers/{serverId}/resource-allocation")]
        public async Task<ActionResult<ResourceAllocation>> UpdateResourceAllocation(Guid serverId, UpdateResourceAllocationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var allocation = await _advancedServerConfigService.UpdateResourceAllocationAsync(serverId, userId, request);
                return Ok(allocation);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating resource allocation for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/optimization-suggestions")]
        public async Task<ActionResult<ResourceOptimizationSuggestions>> GetResourceOptimizationSuggestions(Guid serverId)
        {
            try
            {
                var userId = GetUserId();
                var suggestions = await _advancedServerConfigService.GetResourceOptimizationSuggestionsAsync(serverId, userId);
                return Ok(suggestions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource optimization suggestions for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/apply-optimization")]
        public async Task<ActionResult> ApplyResourceOptimization(Guid serverId, [FromBody] List<OptimizationAction> actions)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.ApplyResourceOptimizationAsync(serverId, userId, actions);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error applying resource optimization for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("servers/{serverId}/resource-usage-history")]
        public async Task<ActionResult<ResourceUsageHistory>> GetResourceUsageHistory(Guid serverId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var history = await _advancedServerConfigService.GetResourceUsageHistoryAsync(serverId, startDate, endDate);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resource usage history for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/resource-limits")]
        public async Task<ActionResult> SetResourceLimits(Guid serverId, [FromBody] ResourceLimits limits)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.SetResourceLimitsAsync(serverId, userId, limits);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting resource limits for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("servers/{serverId}/resource-alerts")]
        public async Task<ActionResult> ConfigureResourceAlerts(Guid serverId, [FromBody] List<ResourceAlert> alerts)
        {
            try
            {
                var userId = GetUserId();
                var success = await _advancedServerConfigService.ConfigureResourceAlertsAsync(serverId, userId, alerts);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring resource alerts for server {ServerId}", serverId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTOs
    public class DuplicateConfigurationRequest
    {
        public string NewName { get; set; } = string.Empty;
    }

    public class ApplyConfigurationRequest
    {
        public Guid ConfigurationId { get; set; }
    }

    public class RollbackConfigurationRequest
    {
        public Guid? TargetConfigurationId { get; set; }
    }

    public class CreateSnapshotRequest
    {
        public string? Description { get; set; }
    }
}