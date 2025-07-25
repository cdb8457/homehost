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
    public class APIIntegrationController : ControllerBase
    {
        private readonly IAPIIntegrationService _apiIntegrationService;
        private readonly ILogger<APIIntegrationController> _logger;

        public APIIntegrationController(
            IAPIIntegrationService apiIntegrationService,
            ILogger<APIIntegrationController> logger)
        {
            _apiIntegrationService = apiIntegrationService;
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

        // API Key Management
        [HttpPost("organizations/{organizationId}/api-keys")]
        public async Task<ActionResult<APIKey>> CreateAPIKey(Guid organizationId, CreateAPIKeyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var apiKey = await _apiIntegrationService.CreateAPIKeyAsync(organizationId, userId, request);
                return Ok(apiKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating API key for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/api-keys")]
        public async Task<ActionResult<List<APIKey>>> GetAPIKeys(Guid organizationId, [FromQuery] APIKeyFilter filter)
        {
            try
            {
                var apiKeys = await _apiIntegrationService.GetAPIKeysAsync(organizationId, filter);
                return Ok(apiKeys);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API keys for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("api-keys/{keyId}")]
        public async Task<ActionResult<APIKey>> GetAPIKey(Guid keyId)
        {
            try
            {
                var apiKey = await _apiIntegrationService.GetAPIKeyAsync(keyId);
                return Ok(apiKey);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API key {KeyId}", keyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("api-keys/{keyId}")]
        public async Task<ActionResult<APIKey>> UpdateAPIKey(Guid keyId, UpdateAPIKeyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var apiKey = await _apiIntegrationService.UpdateAPIKeyAsync(keyId, userId, request);
                return Ok(apiKey);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating API key {KeyId}", keyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("api-keys/{keyId}")]
        public async Task<ActionResult> RevokeAPIKey(Guid keyId)
        {
            try
            {
                var userId = GetUserId();
                await _apiIntegrationService.RevokeAPIKeyAsync(keyId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking API key {KeyId}", keyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("api-keys/{keyId}/regenerate")]
        public async Task<ActionResult> RegenerateAPIKey(Guid keyId)
        {
            try
            {
                var userId = GetUserId();
                await _apiIntegrationService.RegenerateAPIKeyAsync(keyId, userId);
                return Ok(new { message = "API key regenerated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error regenerating API key {KeyId}", keyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("api-keys/{keyId}/usage")]
        public async Task<ActionResult<APIKeyUsage>> GetAPIKeyUsage(Guid keyId, [FromQuery] APIKeyUsageFilter filter)
        {
            try
            {
                var usage = await _apiIntegrationService.GetAPIKeyUsageAsync(keyId, filter);
                return Ok(usage);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API key usage for {KeyId}", keyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Webhook Management
        [HttpPost("organizations/{organizationId}/webhooks")]
        public async Task<ActionResult<Webhook>> CreateWebhook(Guid organizationId, CreateWebhookRequest request)
        {
            try
            {
                var userId = GetUserId();
                var webhook = await _apiIntegrationService.CreateWebhookAsync(organizationId, userId, request);
                return Ok(webhook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating webhook for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/webhooks")]
        public async Task<ActionResult<List<Webhook>>> GetWebhooks(Guid organizationId, [FromQuery] WebhookFilter filter)
        {
            try
            {
                var webhooks = await _apiIntegrationService.GetWebhooksAsync(organizationId, filter);
                return Ok(webhooks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting webhooks for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("webhooks/{webhookId}")]
        public async Task<ActionResult<Webhook>> GetWebhook(Guid webhookId)
        {
            try
            {
                var webhook = await _apiIntegrationService.GetWebhookAsync(webhookId);
                return Ok(webhook);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting webhook {WebhookId}", webhookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("webhooks/{webhookId}")]
        public async Task<ActionResult<Webhook>> UpdateWebhook(Guid webhookId, UpdateWebhookRequest request)
        {
            try
            {
                var userId = GetUserId();
                var webhook = await _apiIntegrationService.UpdateWebhookAsync(webhookId, userId, request);
                return Ok(webhook);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating webhook {WebhookId}", webhookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("webhooks/{webhookId}")]
        public async Task<ActionResult> DeleteWebhook(Guid webhookId)
        {
            try
            {
                var userId = GetUserId();
                await _apiIntegrationService.DeleteWebhookAsync(webhookId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting webhook {WebhookId}", webhookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("webhooks/{webhookId}/test")]
        public async Task<ActionResult> TestWebhook(Guid webhookId, TestWebhookRequest request)
        {
            try
            {
                var success = await _apiIntegrationService.TestWebhookAsync(webhookId, request);
                return Ok(new { success, message = success ? "Webhook test successful" : "Webhook test failed" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing webhook {WebhookId}", webhookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("webhooks/{webhookId}/deliveries")]
        public async Task<ActionResult<List<WebhookDelivery>>> GetWebhookDeliveries(Guid webhookId, [FromQuery] WebhookDeliveryFilter filter)
        {
            try
            {
                var deliveries = await _apiIntegrationService.GetWebhookDeliveriesAsync(webhookId, filter);
                return Ok(deliveries);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting webhook deliveries for {WebhookId}", webhookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("webhook-deliveries/{deliveryId}/retry")]
        public async Task<ActionResult> RetryWebhookDelivery(Guid deliveryId)
        {
            try
            {
                var success = await _apiIntegrationService.RetryWebhookDeliveryAsync(deliveryId);
                return Ok(new { success, message = success ? "Webhook delivery retry successful" : "Webhook delivery retry failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrying webhook delivery {DeliveryId}", deliveryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Third-party Integrations
        [HttpPost("organizations/{organizationId}/integrations")]
        public async Task<ActionResult<Integration>> CreateIntegration(Guid organizationId, CreateIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _apiIntegrationService.CreateIntegrationAsync(organizationId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating integration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/integrations")]
        public async Task<ActionResult<List<Integration>>> GetIntegrations(Guid organizationId, [FromQuery] IntegrationFilter filter)
        {
            try
            {
                var integrations = await _apiIntegrationService.GetIntegrationsAsync(organizationId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting integrations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("integrations/{integrationId}")]
        public async Task<ActionResult<Integration>> GetIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _apiIntegrationService.GetIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("integrations/{integrationId}")]
        public async Task<ActionResult<Integration>> UpdateIntegration(Guid integrationId, UpdateIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _apiIntegrationService.UpdateIntegrationAsync(integrationId, userId, request);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("integrations/{integrationId}")]
        public async Task<ActionResult> DeleteIntegration(Guid integrationId)
        {
            try
            {
                var userId = GetUserId();
                await _apiIntegrationService.DeleteIntegrationAsync(integrationId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("integrations/{integrationId}/test")]
        public async Task<ActionResult> TestIntegration(Guid integrationId, TestIntegrationRequest request)
        {
            try
            {
                var success = await _apiIntegrationService.TestIntegrationAsync(integrationId, request);
                return Ok(new { success, message = success ? "Integration test successful" : "Integration test failed" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("integration-types")]
        public async Task<ActionResult<List<IntegrationType>>> GetAvailableIntegrationTypes()
        {
            try
            {
                var types = await _apiIntegrationService.GetAvailableIntegrationTypesAsync();
                return Ok(types);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available integration types");
                return BadRequest(new { message = ex.Message });
            }
        }

        // OAuth Management
        [HttpPost("organizations/{organizationId}/oauth/applications")]
        public async Task<ActionResult<OAuthApplication>> CreateOAuthApplication(Guid organizationId, CreateOAuthApplicationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var application = await _apiIntegrationService.CreateOAuthApplicationAsync(organizationId, userId, request);
                return Ok(application);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating OAuth application for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/oauth/applications")]
        public async Task<ActionResult<List<OAuthApplication>>> GetOAuthApplications(Guid organizationId, [FromQuery] OAuthApplicationFilter filter)
        {
            try
            {
                var applications = await _apiIntegrationService.GetOAuthApplicationsAsync(organizationId, filter);
                return Ok(applications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting OAuth applications for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("oauth/applications/{applicationId}")]
        public async Task<ActionResult<OAuthApplication>> GetOAuthApplication(Guid applicationId)
        {
            try
            {
                var application = await _apiIntegrationService.GetOAuthApplicationAsync(applicationId);
                return Ok(application);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting OAuth application {ApplicationId}", applicationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("oauth/applications/{applicationId}")]
        public async Task<ActionResult<OAuthApplication>> UpdateOAuthApplication(Guid applicationId, UpdateOAuthApplicationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var application = await _apiIntegrationService.UpdateOAuthApplicationAsync(applicationId, userId, request);
                return Ok(application);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating OAuth application {ApplicationId}", applicationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("oauth/applications/{applicationId}")]
        public async Task<ActionResult> DeleteOAuthApplication(Guid applicationId)
        {
            try
            {
                var userId = GetUserId();
                await _apiIntegrationService.DeleteOAuthApplicationAsync(applicationId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting OAuth application {ApplicationId}", applicationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("oauth/applications/{applicationId}/tokens")]
        public async Task<ActionResult<OAuthToken>> CreateOAuthToken(Guid applicationId, CreateOAuthTokenRequest request)
        {
            try
            {
                var token = await _apiIntegrationService.CreateOAuthTokenAsync(applicationId, request);
                return Ok(token);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating OAuth token for application {ApplicationId}", applicationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("oauth/tokens/{tokenId}")]
        public async Task<ActionResult> RevokeOAuthToken(Guid tokenId)
        {
            try
            {
                await _apiIntegrationService.RevokeOAuthTokenAsync(tokenId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revoking OAuth token {TokenId}", tokenId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("oauth/applications/{applicationId}/tokens")]
        public async Task<ActionResult<List<OAuthToken>>> GetOAuthTokens(Guid applicationId, [FromQuery] OAuthTokenFilter filter)
        {
            try
            {
                var tokens = await _apiIntegrationService.GetOAuthTokensAsync(applicationId, filter);
                return Ok(tokens);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting OAuth tokens for application {ApplicationId}", applicationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Rate Limiting
        [HttpPost("organizations/{organizationId}/rate-limit-policies")]
        public async Task<ActionResult<RateLimitPolicy>> CreateRateLimitPolicy(Guid organizationId, CreateRateLimitPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _apiIntegrationService.CreateRateLimitPolicyAsync(organizationId, userId, request);
                return Ok(policy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating rate limit policy for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/rate-limit-policies")]
        public async Task<ActionResult<List<RateLimitPolicy>>> GetRateLimitPolicies(Guid organizationId, [FromQuery] RateLimitPolicyFilter filter)
        {
            try
            {
                var policies = await _apiIntegrationService.GetRateLimitPoliciesAsync(organizationId, filter);
                return Ok(policies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rate limit policies for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("rate-limit-policies/{policyId}")]
        public async Task<ActionResult<RateLimitPolicy>> UpdateRateLimitPolicy(Guid policyId, UpdateRateLimitPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _apiIntegrationService.UpdateRateLimitPolicyAsync(policyId, userId, request);
                return Ok(policy);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating rate limit policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("rate-limit-policies/{policyId}")]
        public async Task<ActionResult> DeleteRateLimitPolicy(Guid policyId)
        {
            try
            {
                var userId = GetUserId();
                await _apiIntegrationService.DeleteRateLimitPolicyAsync(policyId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting rate limit policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("rate-limit-status")]
        public async Task<ActionResult<RateLimitStatus>> GetRateLimitStatus([FromQuery] string identifier, [FromQuery] string policyName)
        {
            try
            {
                var status = await _apiIntegrationService.GetRateLimitStatusAsync(identifier, policyName);
                return Ok(status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting rate limit status for {Identifier}", identifier);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("rate-limit-reset")]
        public async Task<ActionResult> ResetRateLimit([FromQuery] string identifier, [FromQuery] string policyName)
        {
            try
            {
                await _apiIntegrationService.ResetRateLimitAsync(identifier, policyName);
                return Ok(new { message = "Rate limit reset successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting rate limit for {Identifier}", identifier);
                return BadRequest(new { message = ex.Message });
            }
        }

        // API Documentation
        [HttpGet("documentation")]
        [AllowAnonymous]
        public async Task<ActionResult<APIDocumentation>> GetAPIDocumentation([FromQuery] string version = "latest")
        {
            try
            {
                var documentation = await _apiIntegrationService.GetAPIDocumentationAsync(version);
                return Ok(documentation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API documentation");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("openapi")]
        [AllowAnonymous]
        public async Task<ActionResult<OpenAPISpec>> GetOpenAPISpec([FromQuery] string version = "latest")
        {
            try
            {
                var spec = await _apiIntegrationService.GetOpenAPISpecAsync(version);
                return Ok(spec);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting OpenAPI spec");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("endpoints")]
        [AllowAnonymous]
        public async Task<ActionResult<List<APIEndpoint>>> GetAPIEndpoints([FromQuery] APIEndpointFilter filter)
        {
            try
            {
                var endpoints = await _apiIntegrationService.GetAPIEndpointsAsync(filter);
                return Ok(endpoints);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API endpoints");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("endpoints/{endpoint}")]
        [AllowAnonymous]
        public async Task<ActionResult<APIEndpoint>> GetAPIEndpoint(string endpoint)
        {
            try
            {
                var apiEndpoint = await _apiIntegrationService.GetAPIEndpointAsync(endpoint);
                return Ok(apiEndpoint);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API endpoint {Endpoint}", endpoint);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("schemas/{schemaName}")]
        [AllowAnonymous]
        public async Task<ActionResult<APISchema>> GetAPISchema(string schemaName)
        {
            try
            {
                var schema = await _apiIntegrationService.GetAPISchemaAsync(schemaName);
                return Ok(schema);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API schema {SchemaName}", schemaName);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("endpoints/{endpoint}/examples")]
        [AllowAnonymous]
        public async Task<ActionResult<List<APIExample>>> GetAPIExamples(string endpoint)
        {
            try
            {
                var examples = await _apiIntegrationService.GetAPIExamplesAsync(endpoint);
                return Ok(examples);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API examples for endpoint {Endpoint}", endpoint);
                return BadRequest(new { message = ex.Message });
            }
        }

        // SDK Management
        [HttpGet("sdks")]
        [AllowAnonymous]
        public async Task<ActionResult<List<SDK>>> GetAvailableSDKs([FromQuery] SDKFilter filter)
        {
            try
            {
                var sdks = await _apiIntegrationService.GetAvailableSDKsAsync(filter);
                return Ok(sdks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting available SDKs");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sdks/{language}")]
        [AllowAnonymous]
        public async Task<ActionResult<SDK>> GetSDK(string language, [FromQuery] string version = "latest")
        {
            try
            {
                var sdk = await _apiIntegrationService.GetSDKAsync(language, version);
                return Ok(sdk);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting SDK for {Language}", language);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sdks/{language}/download")]
        [AllowAnonymous]
        public async Task<ActionResult> DownloadSDK(string language, [FromQuery] string version = "latest")
        {
            try
            {
                var sdkData = await _apiIntegrationService.DownloadSDKAsync(language, version);
                return File(sdkData, "application/zip", $"homehost-sdk-{language}-{version}.zip");
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading SDK for {Language}", language);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sdks/{language}/documentation")]
        [AllowAnonymous]
        public async Task<ActionResult<SDKDocumentation>> GetSDKDocumentation(string language, [FromQuery] string version = "latest")
        {
            try
            {
                var documentation = await _apiIntegrationService.GetSDKDocumentationAsync(language, version);
                return Ok(documentation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting SDK documentation for {Language}", language);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sdks/{language}/examples")]
        [AllowAnonymous]
        public async Task<ActionResult<List<CodeSample>>> GetCodeSamples(string language, [FromQuery] CodeSampleFilter filter)
        {
            try
            {
                var samples = await _apiIntegrationService.GetCodeSamplesAsync(language, filter);
                return Ok(samples);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting code samples for {Language}", language);
                return BadRequest(new { message = ex.Message });
            }
        }

        // API Analytics & Monitoring
        [HttpGet("organizations/{organizationId}/api/analytics")]
        public async Task<ActionResult<APIAnalytics>> GetAPIAnalytics(Guid organizationId, [FromQuery] APIAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _apiIntegrationService.GetAPIAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/api/usage")]
        public async Task<ActionResult<List<APIUsageMetric>>> GetAPIUsageMetrics(Guid organizationId, [FromQuery] APIUsageFilter filter)
        {
            try
            {
                var metrics = await _apiIntegrationService.GetAPIUsageMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API usage metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/api/performance")]
        public async Task<ActionResult<APIPerformanceMetrics>> GetAPIPerformanceMetrics(Guid organizationId, [FromQuery] APIPerformanceFilter filter)
        {
            try
            {
                var metrics = await _apiIntegrationService.GetAPIPerformanceMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API performance metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/api/errors")]
        public async Task<ActionResult<List<APIError>>> GetAPIErrors(Guid organizationId, [FromQuery] APIErrorFilter filter)
        {
            try
            {
                var errors = await _apiIntegrationService.GetAPIErrorsAsync(organizationId, filter);
                return Ok(errors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API errors for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("api/health")]
        [AllowAnonymous]
        public async Task<ActionResult<APIHealthStatus>> GetAPIHealthStatus()
        {
            try
            {
                var health = await _apiIntegrationService.GetAPIHealthStatusAsync();
                return Ok(health);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API health status");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/api/alerts")]
        public async Task<ActionResult<List<APIAlert>>> GetAPIAlerts(Guid organizationId, [FromQuery] APIAlertFilter filter)
        {
            try
            {
                var alerts = await _apiIntegrationService.GetAPIAlertsAsync(organizationId, filter);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting API alerts for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}