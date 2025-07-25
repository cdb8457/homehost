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
    public class AdvancedModdingController : ControllerBase
    {
        private readonly IAdvancedModdingService _advancedModdingService;
        private readonly ILogger<AdvancedModdingController> _logger;

        public AdvancedModdingController(
            IAdvancedModdingService advancedModdingService,
            ILogger<AdvancedModdingController> logger)
        {
            _advancedModdingService = advancedModdingService;
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

        // Mod Management
        [HttpPost("organizations/{organizationId}/mods")]
        public async Task<ActionResult<Mod>> CreateMod(Guid organizationId, CreateModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var mod = await _advancedModdingService.CreateModAsync(organizationId, userId, request);
                return Ok(mod);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/mods")]
        public async Task<ActionResult<List<Mod>>> GetMods(Guid organizationId, [FromQuery] ModFilter filter)
        {
            try
            {
                var mods = await _advancedModdingService.GetModsAsync(organizationId, filter);
                return Ok(mods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mods for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}")]
        public async Task<ActionResult<Mod>> GetMod(Guid modId)
        {
            try
            {
                var mod = await _advancedModdingService.GetModAsync(modId);
                return Ok(mod);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("mods/{modId}")]
        public async Task<ActionResult<Mod>> UpdateMod(Guid modId, UpdateModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var mod = await _advancedModdingService.UpdateModAsync(modId, userId, request);
                return Ok(mod);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("mods/{modId}")]
        public async Task<ActionResult<bool>> DeleteMod(Guid modId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModAsync(modId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/versions")]
        public async Task<ActionResult<ModVersion>> CreateModVersion(Guid modId, CreateModVersionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var version = await _advancedModdingService.CreateModVersionAsync(modId, userId, request);
                return Ok(version);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod version for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/versions")]
        public async Task<ActionResult<List<ModVersion>>> GetModVersions(Guid modId, [FromQuery] ModVersionFilter filter)
        {
            try
            {
                var versions = await _advancedModdingService.GetModVersionsAsync(modId, filter);
                return Ok(versions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod versions for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("versions/{versionId}")]
        public async Task<ActionResult<ModVersion>> GetModVersion(Guid versionId)
        {
            try
            {
                var version = await _advancedModdingService.GetModVersionAsync(versionId);
                return Ok(version);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod version {VersionId}", versionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("versions/{versionId}")]
        public async Task<ActionResult<bool>> DeleteModVersion(Guid versionId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModVersionAsync(versionId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod version {VersionId}", versionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Development Tools
        [HttpPost("organizations/{organizationId}/projects")]
        public async Task<ActionResult<ModProject>> CreateModProject(Guid organizationId, CreateModProjectRequest request)
        {
            try
            {
                var userId = GetUserId();
                var project = await _advancedModdingService.CreateModProjectAsync(organizationId, userId, request);
                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod project for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/projects")]
        public async Task<ActionResult<List<ModProject>>> GetModProjects(Guid organizationId, [FromQuery] ModProjectFilter filter)
        {
            try
            {
                var projects = await _advancedModdingService.GetModProjectsAsync(organizationId, filter);
                return Ok(projects);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod projects for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("projects/{projectId}")]
        public async Task<ActionResult<ModProject>> GetModProject(Guid projectId)
        {
            try
            {
                var project = await _advancedModdingService.GetModProjectAsync(projectId);
                return Ok(project);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("projects/{projectId}")]
        public async Task<ActionResult<ModProject>> UpdateModProject(Guid projectId, UpdateModProjectRequest request)
        {
            try
            {
                var userId = GetUserId();
                var project = await _advancedModdingService.UpdateModProjectAsync(projectId, userId, request);
                return Ok(project);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("projects/{projectId}")]
        public async Task<ActionResult<bool>> DeleteModProject(Guid projectId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModProjectAsync(projectId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("projects/{projectId}/build")]
        public async Task<ActionResult<ModBuild>> BuildMod(Guid projectId, BuildModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var build = await _advancedModdingService.BuildModAsync(projectId, userId, request);
                return Ok(build);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error building mod for project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("projects/{projectId}/builds")]
        public async Task<ActionResult<List<ModBuild>>> GetModBuilds(Guid projectId, [FromQuery] ModBuildFilter filter)
        {
            try
            {
                var builds = await _advancedModdingService.GetModBuildsAsync(projectId, filter);
                return Ok(builds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod builds for project {ProjectId}", projectId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("builds/{buildId}")]
        public async Task<ActionResult<ModBuild>> GetModBuild(Guid buildId)
        {
            try
            {
                var build = await _advancedModdingService.GetModBuildAsync(buildId);
                return Ok(build);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod build {BuildId}", buildId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod SDK & API
        [HttpPost("organizations/{organizationId}/sdks")]
        public async Task<ActionResult<ModSDK>> CreateModSDK(Guid organizationId, CreateModSDKRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sdk = await _advancedModdingService.CreateModSDKAsync(organizationId, userId, request);
                return Ok(sdk);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod SDK for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/sdks")]
        public async Task<ActionResult<List<ModSDK>>> GetModSDKs(Guid organizationId, [FromQuery] ModSDKFilter filter)
        {
            try
            {
                var sdks = await _advancedModdingService.GetModSDKsAsync(organizationId, filter);
                return Ok(sdks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod SDKs for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sdks/{sdkId}")]
        public async Task<ActionResult<ModSDK>> GetModSDK(Guid sdkId)
        {
            try
            {
                var sdk = await _advancedModdingService.GetModSDKAsync(sdkId);
                return Ok(sdk);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod SDK {SdkId}", sdkId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("sdks/{sdkId}")]
        public async Task<ActionResult<ModSDK>> UpdateModSDK(Guid sdkId, UpdateModSDKRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sdk = await _advancedModdingService.UpdateModSDKAsync(sdkId, userId, request);
                return Ok(sdk);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod SDK {SdkId}", sdkId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("sdks/{sdkId}")]
        public async Task<ActionResult<bool>> DeleteModSDK(Guid sdkId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModSDKAsync(sdkId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod SDK {SdkId}", sdkId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("sdks/{sdkId}/apis")]
        public async Task<ActionResult<ModAPI>> CreateModAPI(Guid sdkId, CreateModAPIRequest request)
        {
            try
            {
                var userId = GetUserId();
                var api = await _advancedModdingService.CreateModAPIAsync(sdkId, userId, request);
                return Ok(api);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod API for SDK {SdkId}", sdkId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("sdks/{sdkId}/apis")]
        public async Task<ActionResult<List<ModAPI>>> GetModAPIs(Guid sdkId, [FromQuery] ModAPIFilter filter)
        {
            try
            {
                var apis = await _advancedModdingService.GetModAPIsAsync(sdkId, filter);
                return Ok(apis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod APIs for SDK {SdkId}", sdkId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("apis/{apiId}")]
        public async Task<ActionResult<ModAPI>> GetModAPI(Guid apiId)
        {
            try
            {
                var api = await _advancedModdingService.GetModAPIAsync(apiId);
                return Ok(api);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod API {ApiId}", apiId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("apis/{apiId}")]
        public async Task<ActionResult<ModAPI>> UpdateModAPI(Guid apiId, UpdateModAPIRequest request)
        {
            try
            {
                var userId = GetUserId();
                var api = await _advancedModdingService.UpdateModAPIAsync(apiId, userId, request);
                return Ok(api);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod API {ApiId}", apiId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Marketplace
        [HttpPost("mods/{modId}/marketplace")]
        public async Task<ActionResult<ModMarketplaceListing>> CreateMarketplaceListing(Guid modId, CreateMarketplaceListingRequest request)
        {
            try
            {
                var userId = GetUserId();
                var listing = await _advancedModdingService.CreateMarketplaceListingAsync(modId, userId, request);
                return Ok(listing);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating marketplace listing for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/marketplace")]
        public async Task<ActionResult<List<ModMarketplaceListing>>> GetMarketplaceListings(Guid organizationId, [FromQuery] MarketplaceListingFilter filter)
        {
            try
            {
                var listings = await _advancedModdingService.GetMarketplaceListingsAsync(organizationId, filter);
                return Ok(listings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting marketplace listings for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("marketplace/{listingId}")]
        public async Task<ActionResult<ModMarketplaceListing>> GetMarketplaceListing(Guid listingId)
        {
            try
            {
                var listing = await _advancedModdingService.GetMarketplaceListingAsync(listingId);
                return Ok(listing);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting marketplace listing {ListingId}", listingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("marketplace/{listingId}")]
        public async Task<ActionResult<ModMarketplaceListing>> UpdateMarketplaceListing(Guid listingId, UpdateMarketplaceListingRequest request)
        {
            try
            {
                var userId = GetUserId();
                var listing = await _advancedModdingService.UpdateMarketplaceListingAsync(listingId, userId, request);
                return Ok(listing);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating marketplace listing {ListingId}", listingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("marketplace/{listingId}")]
        public async Task<ActionResult<bool>> DeleteMarketplaceListing(Guid listingId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteMarketplaceListingAsync(listingId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting marketplace listing {ListingId}", listingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("marketplace/{listingId}/purchase")]
        public async Task<ActionResult<ModPurchase>> PurchaseMod(Guid listingId, PurchaseModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var purchase = await _advancedModdingService.PurchaseModAsync(listingId, userId, request);
                return Ok(purchase);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error purchasing mod listing {ListingId}", listingId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/purchases")]
        public async Task<ActionResult<List<ModPurchase>>> GetModPurchases(Guid organizationId, [FromQuery] ModPurchaseFilter filter)
        {
            try
            {
                var purchases = await _advancedModdingService.GetModPurchasesAsync(organizationId, filter);
                return Ok(purchases);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod purchases for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/reviews")]
        public async Task<ActionResult<ModReview>> CreateModReview(Guid modId, CreateModReviewRequest request)
        {
            try
            {
                var userId = GetUserId();
                var review = await _advancedModdingService.CreateModReviewAsync(modId, userId, request);
                return Ok(review);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod review for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/reviews")]
        public async Task<ActionResult<List<ModReview>>> GetModReviews(Guid modId, [FromQuery] ModReviewFilter filter)
        {
            try
            {
                var reviews = await _advancedModdingService.GetModReviewsAsync(modId, filter);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod reviews for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Installation & Management
        [HttpPost("mods/{modId}/install")]
        public async Task<ActionResult<ModInstallation>> InstallMod(Guid modId, InstallModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var installation = await _advancedModdingService.InstallModAsync(modId, userId, request);
                return Ok(installation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error installing mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/installations")]
        public async Task<ActionResult<List<ModInstallation>>> GetModInstallations(Guid organizationId, [FromQuery] ModInstallationFilter filter)
        {
            try
            {
                var installations = await _advancedModdingService.GetModInstallationsAsync(organizationId, filter);
                return Ok(installations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod installations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}")]
        public async Task<ActionResult<ModInstallation>> GetModInstallation(Guid installationId)
        {
            try
            {
                var installation = await _advancedModdingService.GetModInstallationAsync(installationId);
                return Ok(installation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("installations/{installationId}")]
        public async Task<ActionResult<ModInstallation>> UpdateModInstallation(Guid installationId, UpdateModInstallationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var installation = await _advancedModdingService.UpdateModInstallationAsync(installationId, userId, request);
                return Ok(installation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("installations/{installationId}")]
        public async Task<ActionResult<bool>> UninstallMod(Guid installationId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.UninstallModAsync(installationId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uninstalling mod {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("installations/{installationId}/configure")]
        public async Task<ActionResult<ModConfiguration>> ConfigureMod(Guid installationId, ConfigureModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var configuration = await _advancedModdingService.ConfigureModAsync(installationId, userId, request);
                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring mod installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("installations/{installationId}/configurations")]
        public async Task<ActionResult<List<ModConfiguration>>> GetModConfigurations(Guid installationId, [FromQuery] ModConfigurationFilter filter)
        {
            try
            {
                var configurations = await _advancedModdingService.GetModConfigurationsAsync(installationId, filter);
                return Ok(configurations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod configurations for installation {InstallationId}", installationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/compatibility")]
        public async Task<ActionResult<ModCompatibility>> CheckModCompatibility(Guid modId, CheckModCompatibilityRequest request)
        {
            try
            {
                var compatibility = await _advancedModdingService.CheckModCompatibilityAsync(modId, request);
                return Ok(compatibility);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking mod compatibility for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Scripting Engine
        [HttpPost("mods/{modId}/scripts")]
        public async Task<ActionResult<ModScript>> CreateModScript(Guid modId, CreateModScriptRequest request)
        {
            try
            {
                var userId = GetUserId();
                var script = await _advancedModdingService.CreateModScriptAsync(modId, userId, request);
                return Ok(script);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod script for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/scripts")]
        public async Task<ActionResult<List<ModScript>>> GetModScripts(Guid modId, [FromQuery] ModScriptFilter filter)
        {
            try
            {
                var scripts = await _advancedModdingService.GetModScriptsAsync(modId, filter);
                return Ok(scripts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod scripts for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("scripts/{scriptId}")]
        public async Task<ActionResult<ModScript>> GetModScript(Guid scriptId)
        {
            try
            {
                var script = await _advancedModdingService.GetModScriptAsync(scriptId);
                return Ok(script);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod script {ScriptId}", scriptId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("scripts/{scriptId}")]
        public async Task<ActionResult<ModScript>> UpdateModScript(Guid scriptId, UpdateModScriptRequest request)
        {
            try
            {
                var userId = GetUserId();
                var script = await _advancedModdingService.UpdateModScriptAsync(scriptId, userId, request);
                return Ok(script);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod script {ScriptId}", scriptId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("scripts/{scriptId}")]
        public async Task<ActionResult<bool>> DeleteModScript(Guid scriptId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModScriptAsync(scriptId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod script {ScriptId}", scriptId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("scripts/{scriptId}/execute")]
        public async Task<ActionResult<ModScriptExecution>> ExecuteModScript(Guid scriptId, ExecuteModScriptRequest request)
        {
            try
            {
                var userId = GetUserId();
                var execution = await _advancedModdingService.ExecuteModScriptAsync(scriptId, userId, request);
                return Ok(execution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing mod script {ScriptId}", scriptId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("scripts/{scriptId}/executions")]
        public async Task<ActionResult<List<ModScriptExecution>>> GetModScriptExecutions(Guid scriptId, [FromQuery] ModScriptExecutionFilter filter)
        {
            try
            {
                var executions = await _advancedModdingService.GetModScriptExecutionsAsync(scriptId, filter);
                return Ok(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod script executions for script {ScriptId}", scriptId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("scripts/{scriptId}/debug")]
        public async Task<ActionResult<ModScriptDebugSession>> StartScriptDebugSession(Guid scriptId, StartScriptDebugSessionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var session = await _advancedModdingService.StartScriptDebugSessionAsync(scriptId, userId, request);
                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting debug session for script {ScriptId}", scriptId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("scripts/{scriptId}/debug")]
        public async Task<ActionResult<List<ModScriptDebugSession>>> GetScriptDebugSessions(Guid scriptId, [FromQuery] ModScriptDebugSessionFilter filter)
        {
            try
            {
                var sessions = await _advancedModdingService.GetScriptDebugSessionsAsync(scriptId, filter);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting debug sessions for script {ScriptId}", scriptId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Asset Management
        [HttpPost("mods/{modId}/assets")]
        public async Task<ActionResult<ModAsset>> CreateModAsset(Guid modId, CreateModAssetRequest request)
        {
            try
            {
                var userId = GetUserId();
                var asset = await _advancedModdingService.CreateModAssetAsync(modId, userId, request);
                return Ok(asset);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod asset for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/assets")]
        public async Task<ActionResult<List<ModAsset>>> GetModAssets(Guid modId, [FromQuery] ModAssetFilter filter)
        {
            try
            {
                var assets = await _advancedModdingService.GetModAssetsAsync(modId, filter);
                return Ok(assets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod assets for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("assets/{assetId}")]
        public async Task<ActionResult<ModAsset>> GetModAsset(Guid assetId)
        {
            try
            {
                var asset = await _advancedModdingService.GetModAssetAsync(assetId);
                return Ok(asset);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod asset {AssetId}", assetId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("assets/{assetId}")]
        public async Task<ActionResult<ModAsset>> UpdateModAsset(Guid assetId, UpdateModAssetRequest request)
        {
            try
            {
                var userId = GetUserId();
                var asset = await _advancedModdingService.UpdateModAssetAsync(assetId, userId, request);
                return Ok(asset);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod asset {AssetId}", assetId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("assets/{assetId}")]
        public async Task<ActionResult<bool>> DeleteModAsset(Guid assetId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModAssetAsync(assetId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod asset {AssetId}", assetId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/asset-pipelines")]
        public async Task<ActionResult<ModAssetPipeline>> CreateAssetPipeline(Guid modId, CreateAssetPipelineRequest request)
        {
            try
            {
                var userId = GetUserId();
                var pipeline = await _advancedModdingService.CreateAssetPipelineAsync(modId, userId, request);
                return Ok(pipeline);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating asset pipeline for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/asset-pipelines")]
        public async Task<ActionResult<List<ModAssetPipeline>>> GetAssetPipelines(Guid modId, [FromQuery] ModAssetPipelineFilter filter)
        {
            try
            {
                var pipelines = await _advancedModdingService.GetAssetPipelinesAsync(modId, filter);
                return Ok(pipelines);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting asset pipelines for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("pipelines/{pipelineId}/run")]
        public async Task<ActionResult<ModAssetPipelineExecution>> RunAssetPipeline(Guid pipelineId, RunAssetPipelineRequest request)
        {
            try
            {
                var userId = GetUserId();
                var execution = await _advancedModdingService.RunAssetPipelineAsync(pipelineId, userId, request);
                return Ok(execution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running asset pipeline {PipelineId}", pipelineId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Testing & Quality Assurance
        [HttpPost("mods/{modId}/test-suites")]
        public async Task<ActionResult<ModTestSuite>> CreateModTestSuite(Guid modId, CreateModTestSuiteRequest request)
        {
            try
            {
                var userId = GetUserId();
                var testSuite = await _advancedModdingService.CreateModTestSuiteAsync(modId, userId, request);
                return Ok(testSuite);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod test suite for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/test-suites")]
        public async Task<ActionResult<List<ModTestSuite>>> GetModTestSuites(Guid modId, [FromQuery] ModTestSuiteFilter filter)
        {
            try
            {
                var testSuites = await _advancedModdingService.GetModTestSuitesAsync(modId, filter);
                return Ok(testSuites);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod test suites for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("test-suites/{testSuiteId}")]
        public async Task<ActionResult<ModTestSuite>> GetModTestSuite(Guid testSuiteId)
        {
            try
            {
                var testSuite = await _advancedModdingService.GetModTestSuiteAsync(testSuiteId);
                return Ok(testSuite);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod test suite {TestSuiteId}", testSuiteId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("test-suites/{testSuiteId}")]
        public async Task<ActionResult<ModTestSuite>> UpdateModTestSuite(Guid testSuiteId, UpdateModTestSuiteRequest request)
        {
            try
            {
                var userId = GetUserId();
                var testSuite = await _advancedModdingService.UpdateModTestSuiteAsync(testSuiteId, userId, request);
                return Ok(testSuite);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod test suite {TestSuiteId}", testSuiteId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("test-suites/{testSuiteId}")]
        public async Task<ActionResult<bool>> DeleteModTestSuite(Guid testSuiteId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModTestSuiteAsync(testSuiteId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod test suite {TestSuiteId}", testSuiteId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("test-suites/{testSuiteId}/run")]
        public async Task<ActionResult<ModTestExecution>> RunModTestSuite(Guid testSuiteId, RunModTestSuiteRequest request)
        {
            try
            {
                var userId = GetUserId();
                var execution = await _advancedModdingService.RunModTestSuiteAsync(testSuiteId, userId, request);
                return Ok(execution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running mod test suite {TestSuiteId}", testSuiteId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("test-suites/{testSuiteId}/executions")]
        public async Task<ActionResult<List<ModTestExecution>>> GetModTestExecutions(Guid testSuiteId, [FromQuery] ModTestExecutionFilter filter)
        {
            try
            {
                var executions = await _advancedModdingService.GetModTestExecutionsAsync(testSuiteId, filter);
                return Ok(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod test executions for test suite {TestSuiteId}", testSuiteId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("executions/{executionId}/results")]
        public async Task<ActionResult<ModTestResult>> GetModTestResult(Guid executionId)
        {
            try
            {
                var result = await _advancedModdingService.GetModTestResultAsync(executionId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod test result for execution {ExecutionId}", executionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Security & Validation
        [HttpPost("mods/{modId}/security-scans")]
        public async Task<ActionResult<ModSecurityScan>> CreateModSecurityScan(Guid modId, CreateModSecurityScanRequest request)
        {
            try
            {
                var userId = GetUserId();
                var scan = await _advancedModdingService.CreateModSecurityScanAsync(modId, userId, request);
                return Ok(scan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod security scan for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/security-scans")]
        public async Task<ActionResult<List<ModSecurityScan>>> GetModSecurityScans(Guid modId, [FromQuery] ModSecurityScanFilter filter)
        {
            try
            {
                var scans = await _advancedModdingService.GetModSecurityScansAsync(modId, filter);
                return Ok(scans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod security scans for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("security-scans/{scanId}")]
        public async Task<ActionResult<ModSecurityScan>> GetModSecurityScan(Guid scanId)
        {
            try
            {
                var scan = await _advancedModdingService.GetModSecurityScanAsync(scanId);
                return Ok(scan);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod security scan {ScanId}", scanId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/validate")]
        public async Task<ActionResult<ModValidation>> ValidateMod(Guid modId, ValidateModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var validation = await _advancedModdingService.ValidateModAsync(modId, userId, request);
                return Ok(validation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/validations")]
        public async Task<ActionResult<List<ModValidation>>> GetModValidations(Guid modId, [FromQuery] ModValidationFilter filter)
        {
            try
            {
                var validations = await _advancedModdingService.GetModValidationsAsync(modId, filter);
                return Ok(validations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod validations for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/certify")]
        public async Task<ActionResult<ModCertification>> CertifyMod(Guid modId, CertifyModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var certification = await _advancedModdingService.CertifyModAsync(modId, userId, request);
                return Ok(certification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error certifying mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/certifications")]
        public async Task<ActionResult<List<ModCertification>>> GetModCertifications(Guid modId, [FromQuery] ModCertificationFilter filter)
        {
            try
            {
                var certifications = await _advancedModdingService.GetModCertificationsAsync(modId, filter);
                return Ok(certifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod certifications for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Distribution & Packaging
        [HttpPost("mods/{modId}/packages")]
        public async Task<ActionResult<ModPackage>> CreateModPackage(Guid modId, CreateModPackageRequest request)
        {
            try
            {
                var userId = GetUserId();
                var package = await _advancedModdingService.CreateModPackageAsync(modId, userId, request);
                return Ok(package);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod package for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/packages")]
        public async Task<ActionResult<List<ModPackage>>> GetModPackages(Guid modId, [FromQuery] ModPackageFilter filter)
        {
            try
            {
                var packages = await _advancedModdingService.GetModPackagesAsync(modId, filter);
                return Ok(packages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod packages for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("packages/{packageId}")]
        public async Task<ActionResult<ModPackage>> GetModPackage(Guid packageId)
        {
            try
            {
                var package = await _advancedModdingService.GetModPackageAsync(packageId);
                return Ok(package);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod package {PackageId}", packageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("packages/{packageId}")]
        public async Task<ActionResult<ModPackage>> UpdateModPackage(Guid packageId, UpdateModPackageRequest request)
        {
            try
            {
                var userId = GetUserId();
                var package = await _advancedModdingService.UpdateModPackageAsync(packageId, userId, request);
                return Ok(package);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod package {PackageId}", packageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("packages/{packageId}")]
        public async Task<ActionResult<bool>> DeleteModPackage(Guid packageId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModPackageAsync(packageId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod package {PackageId}", packageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("packages/{packageId}/distribute")]
        public async Task<ActionResult<ModDistribution>> CreateModDistribution(Guid packageId, CreateModDistributionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var distribution = await _advancedModdingService.CreateModDistributionAsync(packageId, userId, request);
                return Ok(distribution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod distribution for package {PackageId}", packageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("packages/{packageId}/distributions")]
        public async Task<ActionResult<List<ModDistribution>>> GetModDistributions(Guid packageId, [FromQuery] ModDistributionFilter filter)
        {
            try
            {
                var distributions = await _advancedModdingService.GetModDistributionsAsync(packageId, filter);
                return Ok(distributions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod distributions for package {PackageId}", packageId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("distributions/{distributionId}/metrics")]
        public async Task<ActionResult<ModDistributionMetrics>> GetModDistributionMetrics(Guid distributionId, [FromQuery] ModDistributionMetricsFilter filter)
        {
            try
            {
                var metrics = await _advancedModdingService.GetModDistributionMetricsAsync(distributionId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod distribution metrics for distribution {DistributionId}", distributionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Version Control
        [HttpPost("mods/{modId}/repositories")]
        public async Task<ActionResult<ModRepository>> CreateModRepository(Guid modId, CreateModRepositoryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var repository = await _advancedModdingService.CreateModRepositoryAsync(modId, userId, request);
                return Ok(repository);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod repository for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/repositories")]
        public async Task<ActionResult<List<ModRepository>>> GetModRepositories(Guid modId, [FromQuery] ModRepositoryFilter filter)
        {
            try
            {
                var repositories = await _advancedModdingService.GetModRepositoriesAsync(modId, filter);
                return Ok(repositories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod repositories for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("repositories/{repositoryId}")]
        public async Task<ActionResult<ModRepository>> GetModRepository(Guid repositoryId)
        {
            try
            {
                var repository = await _advancedModdingService.GetModRepositoryAsync(repositoryId);
                return Ok(repository);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod repository {RepositoryId}", repositoryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("repositories/{repositoryId}")]
        public async Task<ActionResult<ModRepository>> UpdateModRepository(Guid repositoryId, UpdateModRepositoryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var repository = await _advancedModdingService.UpdateModRepositoryAsync(repositoryId, userId, request);
                return Ok(repository);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod repository {RepositoryId}", repositoryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("repositories/{repositoryId}")]
        public async Task<ActionResult<bool>> DeleteModRepository(Guid repositoryId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModRepositoryAsync(repositoryId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod repository {RepositoryId}", repositoryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("repositories/{repositoryId}/commits")]
        public async Task<ActionResult<ModCommit>> CreateModCommit(Guid repositoryId, CreateModCommitRequest request)
        {
            try
            {
                var userId = GetUserId();
                var commit = await _advancedModdingService.CreateModCommitAsync(repositoryId, userId, request);
                return Ok(commit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod commit for repository {RepositoryId}", repositoryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("repositories/{repositoryId}/commits")]
        public async Task<ActionResult<List<ModCommit>>> GetModCommits(Guid repositoryId, [FromQuery] ModCommitFilter filter)
        {
            try
            {
                var commits = await _advancedModdingService.GetModCommitsAsync(repositoryId, filter);
                return Ok(commits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod commits for repository {RepositoryId}", repositoryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("commits/{commitId}")]
        public async Task<ActionResult<ModCommit>> GetModCommit(Guid commitId)
        {
            try
            {
                var commit = await _advancedModdingService.GetModCommitAsync(commitId);
                return Ok(commit);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod commit {CommitId}", commitId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("repositories/{repositoryId}/branches")]
        public async Task<ActionResult<ModBranch>> CreateModBranch(Guid repositoryId, CreateModBranchRequest request)
        {
            try
            {
                var userId = GetUserId();
                var branch = await _advancedModdingService.CreateModBranchAsync(repositoryId, userId, request);
                return Ok(branch);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod branch for repository {RepositoryId}", repositoryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("repositories/{repositoryId}/branches")]
        public async Task<ActionResult<List<ModBranch>>> GetModBranches(Guid repositoryId, [FromQuery] ModBranchFilter filter)
        {
            try
            {
                var branches = await _advancedModdingService.GetModBranchesAsync(repositoryId, filter);
                return Ok(branches);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod branches for repository {RepositoryId}", repositoryId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Collaboration
        [HttpPost("mods/{modId}/collaborations")]
        public async Task<ActionResult<ModCollaboration>> CreateModCollaboration(Guid modId, CreateModCollaborationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var collaboration = await _advancedModdingService.CreateModCollaborationAsync(modId, userId, request);
                return Ok(collaboration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod collaboration for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/collaborations")]
        public async Task<ActionResult<List<ModCollaboration>>> GetModCollaborations(Guid modId, [FromQuery] ModCollaborationFilter filter)
        {
            try
            {
                var collaborations = await _advancedModdingService.GetModCollaborationsAsync(modId, filter);
                return Ok(collaborations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod collaborations for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("collaborations/{collaborationId}")]
        public async Task<ActionResult<ModCollaboration>> GetModCollaboration(Guid collaborationId)
        {
            try
            {
                var collaboration = await _advancedModdingService.GetModCollaborationAsync(collaborationId);
                return Ok(collaboration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod collaboration {CollaborationId}", collaborationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("collaborations/{collaborationId}")]
        public async Task<ActionResult<ModCollaboration>> UpdateModCollaboration(Guid collaborationId, UpdateModCollaborationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var collaboration = await _advancedModdingService.UpdateModCollaborationAsync(collaborationId, userId, request);
                return Ok(collaboration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod collaboration {CollaborationId}", collaborationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("collaborations/{collaborationId}")]
        public async Task<ActionResult<bool>> DeleteModCollaboration(Guid collaborationId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModCollaborationAsync(collaborationId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod collaboration {CollaborationId}", collaborationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("collaborations/{collaborationId}/collaborators")]
        public async Task<ActionResult<ModCollaborator>> AddModCollaborator(Guid collaborationId, AddModCollaboratorRequest request)
        {
            try
            {
                var userId = GetUserId();
                var collaborator = await _advancedModdingService.AddModCollaboratorAsync(collaborationId, userId, request);
                return Ok(collaborator);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding mod collaborator to collaboration {CollaborationId}", collaborationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("collaborations/{collaborationId}/collaborators")]
        public async Task<ActionResult<List<ModCollaborator>>> GetModCollaborators(Guid collaborationId, [FromQuery] ModCollaboratorFilter filter)
        {
            try
            {
                var collaborators = await _advancedModdingService.GetModCollaboratorsAsync(collaborationId, filter);
                return Ok(collaborators);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod collaborators for collaboration {CollaborationId}", collaborationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("collaborations/{collaborationId}/collaborators/{collaboratorId}")]
        public async Task<ActionResult<bool>> RemoveModCollaborator(Guid collaborationId, Guid collaboratorId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.RemoveModCollaboratorAsync(collaborationId, collaboratorId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing mod collaborator {CollaboratorId} from collaboration {CollaborationId}", collaboratorId, collaborationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Analytics & Insights
        [HttpGet("mods/{modId}/analytics")]
        public async Task<ActionResult<ModAnalytics>> GetModAnalytics(Guid modId, [FromQuery] ModAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _advancedModdingService.GetModAnalyticsAsync(modId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod analytics for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/metrics")]
        public async Task<ActionResult<List<ModMetric>>> GetModMetrics(Guid modId, [FromQuery] ModMetricsFilter filter)
        {
            try
            {
                var metrics = await _advancedModdingService.GetModMetricsAsync(modId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod metrics for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/usage-report")]
        public async Task<ActionResult<ModUsageReport>> GenerateModUsageReport(Guid modId, GenerateModUsageReportRequest request)
        {
            try
            {
                var userId = GetUserId();
                var report = await _advancedModdingService.GenerateModUsageReportAsync(modId, userId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating mod usage report for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/insights")]
        public async Task<ActionResult<List<ModInsight>>> GetModInsights(Guid modId, [FromQuery] ModInsightFilter filter)
        {
            try
            {
                var insights = await _advancedModdingService.GetModInsightsAsync(modId, filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod insights for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/performance-report")]
        public async Task<ActionResult<ModPerformanceReport>> GetModPerformanceReport(Guid modId, [FromQuery] ModPerformanceReportFilter filter)
        {
            try
            {
                var report = await _advancedModdingService.GetModPerformanceReportAsync(modId, filter);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod performance report for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/trends")]
        public async Task<ActionResult<List<ModTrend>>> GetModTrends(Guid organizationId, [FromQuery] ModTrendFilter filter)
        {
            try
            {
                var trends = await _advancedModdingService.GetModTrendsAsync(organizationId, filter);
                return Ok(trends);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod trends for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Community Features
        [HttpPost("mods/{modId}/communities")]
        public async Task<ActionResult<ModCommunity>> CreateModCommunity(Guid modId, CreateModCommunityRequest request)
        {
            try
            {
                var userId = GetUserId();
                var community = await _advancedModdingService.CreateModCommunityAsync(modId, userId, request);
                return Ok(community);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod community for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/communities")]
        public async Task<ActionResult<List<ModCommunity>>> GetModCommunities(Guid modId, [FromQuery] ModCommunityFilter filter)
        {
            try
            {
                var communities = await _advancedModdingService.GetModCommunitiesAsync(modId, filter);
                return Ok(communities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod communities for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities/{communityId}")]
        public async Task<ActionResult<ModCommunity>> GetModCommunity(Guid communityId)
        {
            try
            {
                var community = await _advancedModdingService.GetModCommunityAsync(communityId);
                return Ok(community);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("communities/{communityId}")]
        public async Task<ActionResult<ModCommunity>> UpdateModCommunity(Guid communityId, UpdateModCommunityRequest request)
        {
            try
            {
                var userId = GetUserId();
                var community = await _advancedModdingService.UpdateModCommunityAsync(communityId, userId, request);
                return Ok(community);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("communities/{communityId}")]
        public async Task<ActionResult<bool>> DeleteModCommunity(Guid communityId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModCommunityAsync(communityId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("communities/{communityId}/forums")]
        public async Task<ActionResult<ModForum>> CreateModForum(Guid communityId, CreateModForumRequest request)
        {
            try
            {
                var userId = GetUserId();
                var forum = await _advancedModdingService.CreateModForumAsync(communityId, userId, request);
                return Ok(forum);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod forum for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("communities/{communityId}/forums")]
        public async Task<ActionResult<List<ModForum>>> GetModForums(Guid communityId, [FromQuery] ModForumFilter filter)
        {
            try
            {
                var forums = await _advancedModdingService.GetModForumsAsync(communityId, filter);
                return Ok(forums);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod forums for community {CommunityId}", communityId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("forums/{forumId}/posts")]
        public async Task<ActionResult<ModForumPost>> CreateModForumPost(Guid forumId, CreateModForumPostRequest request)
        {
            try
            {
                var userId = GetUserId();
                var post = await _advancedModdingService.CreateModForumPostAsync(forumId, userId, request);
                return Ok(post);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod forum post for forum {ForumId}", forumId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("forums/{forumId}/posts")]
        public async Task<ActionResult<List<ModForumPost>>> GetModForumPosts(Guid forumId, [FromQuery] ModForumPostFilter filter)
        {
            try
            {
                var posts = await _advancedModdingService.GetModForumPostsAsync(forumId, filter);
                return Ok(posts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod forum posts for forum {ForumId}", forumId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Documentation
        [HttpPost("mods/{modId}/documentation")]
        public async Task<ActionResult<ModDocumentation>> CreateModDocumentation(Guid modId, CreateModDocumentationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var documentation = await _advancedModdingService.CreateModDocumentationAsync(modId, userId, request);
                return Ok(documentation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod documentation for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/documentation")]
        public async Task<ActionResult<List<ModDocumentation>>> GetModDocumentation(Guid modId, [FromQuery] ModDocumentationFilter filter)
        {
            try
            {
                var documentation = await _advancedModdingService.GetModDocumentationAsync(modId, filter);
                return Ok(documentation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod documentation for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("documentation/{documentationId}")]
        public async Task<ActionResult<ModDocumentation>> GetModDocumentation(Guid documentationId)
        {
            try
            {
                var documentation = await _advancedModdingService.GetModDocumentationAsync(documentationId);
                return Ok(documentation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod documentation {DocumentationId}", documentationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("documentation/{documentationId}")]
        public async Task<ActionResult<ModDocumentation>> UpdateModDocumentation(Guid documentationId, UpdateModDocumentationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var documentation = await _advancedModdingService.UpdateModDocumentationAsync(documentationId, userId, request);
                return Ok(documentation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod documentation {DocumentationId}", documentationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("documentation/{documentationId}")]
        public async Task<ActionResult<bool>> DeleteModDocumentation(Guid documentationId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModDocumentationAsync(documentationId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod documentation {DocumentationId}", documentationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/tutorials")]
        public async Task<ActionResult<ModTutorial>> CreateModTutorial(Guid modId, CreateModTutorialRequest request)
        {
            try
            {
                var userId = GetUserId();
                var tutorial = await _advancedModdingService.CreateModTutorialAsync(modId, userId, request);
                return Ok(tutorial);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod tutorial for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/tutorials")]
        public async Task<ActionResult<List<ModTutorial>>> GetModTutorials(Guid modId, [FromQuery] ModTutorialFilter filter)
        {
            try
            {
                var tutorials = await _advancedModdingService.GetModTutorialsAsync(modId, filter);
                return Ok(tutorials);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod tutorials for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tutorials/{tutorialId}")]
        public async Task<ActionResult<ModTutorial>> GetModTutorial(Guid tutorialId)
        {
            try
            {
                var tutorial = await _advancedModdingService.GetModTutorialAsync(tutorialId);
                return Ok(tutorial);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod tutorial {TutorialId}", tutorialId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("tutorials/{tutorialId}")]
        public async Task<ActionResult<ModTutorial>> UpdateModTutorial(Guid tutorialId, UpdateModTutorialRequest request)
        {
            try
            {
                var userId = GetUserId();
                var tutorial = await _advancedModdingService.UpdateModTutorialAsync(tutorialId, userId, request);
                return Ok(tutorial);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod tutorial {TutorialId}", tutorialId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Licensing & Legal
        [HttpPost("mods/{modId}/licenses")]
        public async Task<ActionResult<ModLicense>> CreateModLicense(Guid modId, CreateModLicenseRequest request)
        {
            try
            {
                var userId = GetUserId();
                var license = await _advancedModdingService.CreateModLicenseAsync(modId, userId, request);
                return Ok(license);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod license for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/licenses")]
        public async Task<ActionResult<List<ModLicense>>> GetModLicenses(Guid modId, [FromQuery] ModLicenseFilter filter)
        {
            try
            {
                var licenses = await _advancedModdingService.GetModLicensesAsync(modId, filter);
                return Ok(licenses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod licenses for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("licenses/{licenseId}")]
        public async Task<ActionResult<ModLicense>> GetModLicense(Guid licenseId)
        {
            try
            {
                var license = await _advancedModdingService.GetModLicenseAsync(licenseId);
                return Ok(license);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod license {LicenseId}", licenseId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("licenses/{licenseId}")]
        public async Task<ActionResult<ModLicense>> UpdateModLicense(Guid licenseId, UpdateModLicenseRequest request)
        {
            try
            {
                var userId = GetUserId();
                var license = await _advancedModdingService.UpdateModLicenseAsync(licenseId, userId, request);
                return Ok(license);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod license {LicenseId}", licenseId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("licenses/{licenseId}")]
        public async Task<ActionResult<bool>> DeleteModLicense(Guid licenseId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModLicenseAsync(licenseId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod license {LicenseId}", licenseId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/compliance")]
        public async Task<ActionResult<ModLegalCompliance>> CheckModLegalCompliance(Guid modId, CheckModLegalComplianceRequest request)
        {
            try
            {
                var userId = GetUserId();
                var compliance = await _advancedModdingService.CheckModLegalComplianceAsync(modId, userId, request);
                return Ok(compliance);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking mod legal compliance for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/compliance")]
        public async Task<ActionResult<List<ModLegalCompliance>>> GetModLegalCompliances(Guid modId, [FromQuery] ModLegalComplianceFilter filter)
        {
            try
            {
                var compliances = await _advancedModdingService.GetModLegalCompliancesAsync(modId, filter);
                return Ok(compliances);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod legal compliances for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Monetization
        [HttpPost("mods/{modId}/monetization")]
        public async Task<ActionResult<ModMonetization>> CreateModMonetization(Guid modId, CreateModMonetizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var monetization = await _advancedModdingService.CreateModMonetizationAsync(modId, userId, request);
                return Ok(monetization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod monetization for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/monetization")]
        public async Task<ActionResult<List<ModMonetization>>> GetModMonetizations(Guid modId, [FromQuery] ModMonetizationFilter filter)
        {
            try
            {
                var monetizations = await _advancedModdingService.GetModMonetizationsAsync(modId, filter);
                return Ok(monetizations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod monetizations for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("monetization/{monetizationId}")]
        public async Task<ActionResult<ModMonetization>> GetModMonetization(Guid monetizationId)
        {
            try
            {
                var monetization = await _advancedModdingService.GetModMonetizationAsync(monetizationId);
                return Ok(monetization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod monetization {MonetizationId}", monetizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("monetization/{monetizationId}")]
        public async Task<ActionResult<ModMonetization>> UpdateModMonetization(Guid monetizationId, UpdateModMonetizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var monetization = await _advancedModdingService.UpdateModMonetizationAsync(monetizationId, userId, request);
                return Ok(monetization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod monetization {MonetizationId}", monetizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("monetization/{monetizationId}")]
        public async Task<ActionResult<bool>> DeleteModMonetization(Guid monetizationId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModMonetizationAsync(monetizationId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod monetization {MonetizationId}", monetizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/revenue")]
        public async Task<ActionResult<ModRevenue>> GetModRevenue(Guid modId, [FromQuery] ModRevenueFilter filter)
        {
            try
            {
                var revenue = await _advancedModdingService.GetModRevenueAsync(modId, filter);
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod revenue for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/payouts")]
        public async Task<ActionResult<List<ModPayout>>> GetModPayouts(Guid modId, [FromQuery] ModPayoutFilter filter)
        {
            try
            {
                var payouts = await _advancedModdingService.GetModPayoutsAsync(modId, filter);
                return Ok(payouts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod payouts for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/payouts")]
        public async Task<ActionResult<ModPayout>> CreateModPayout(Guid modId, CreateModPayoutRequest request)
        {
            try
            {
                var userId = GetUserId();
                var payout = await _advancedModdingService.CreateModPayoutAsync(modId, userId, request);
                return Ok(payout);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod payout for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Localization
        [HttpPost("mods/{modId}/localization")]
        public async Task<ActionResult<ModLocalization>> CreateModLocalization(Guid modId, CreateModLocalizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var localization = await _advancedModdingService.CreateModLocalizationAsync(modId, userId, request);
                return Ok(localization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod localization for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/localization")]
        public async Task<ActionResult<List<ModLocalization>>> GetModLocalizations(Guid modId, [FromQuery] ModLocalizationFilter filter)
        {
            try
            {
                var localizations = await _advancedModdingService.GetModLocalizationsAsync(modId, filter);
                return Ok(localizations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod localizations for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("localization/{localizationId}")]
        public async Task<ActionResult<ModLocalization>> GetModLocalization(Guid localizationId)
        {
            try
            {
                var localization = await _advancedModdingService.GetModLocalizationAsync(localizationId);
                return Ok(localization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod localization {LocalizationId}", localizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("localization/{localizationId}")]
        public async Task<ActionResult<ModLocalization>> UpdateModLocalization(Guid localizationId, UpdateModLocalizationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var localization = await _advancedModdingService.UpdateModLocalizationAsync(localizationId, userId, request);
                return Ok(localization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod localization {LocalizationId}", localizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("localization/{localizationId}")]
        public async Task<ActionResult<bool>> DeleteModLocalization(Guid localizationId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModLocalizationAsync(localizationId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod localization {LocalizationId}", localizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("localization/{localizationId}/translations")]
        public async Task<ActionResult<ModTranslation>> CreateModTranslation(Guid localizationId, CreateModTranslationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var translation = await _advancedModdingService.CreateModTranslationAsync(localizationId, userId, request);
                return Ok(translation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod translation for localization {LocalizationId}", localizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("localization/{localizationId}/translations")]
        public async Task<ActionResult<List<ModTranslation>>> GetModTranslations(Guid localizationId, [FromQuery] ModTranslationFilter filter)
        {
            try
            {
                var translations = await _advancedModdingService.GetModTranslationsAsync(localizationId, filter);
                return Ok(translations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod translations for localization {LocalizationId}", localizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("translations/{translationId}")]
        public async Task<ActionResult<ModTranslation>> UpdateModTranslation(Guid translationId, UpdateModTranslationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var translation = await _advancedModdingService.UpdateModTranslationAsync(translationId, userId, request);
                return Ok(translation);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod translation {TranslationId}", translationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Backup & Recovery
        [HttpPost("mods/{modId}/backups")]
        public async Task<ActionResult<ModBackup>> CreateModBackup(Guid modId, CreateModBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _advancedModdingService.CreateModBackupAsync(modId, userId, request);
                return Ok(backup);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod backup for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/backups")]
        public async Task<ActionResult<List<ModBackup>>> GetModBackups(Guid modId, [FromQuery] ModBackupFilter filter)
        {
            try
            {
                var backups = await _advancedModdingService.GetModBackupsAsync(modId, filter);
                return Ok(backups);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod backups for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("backups/{backupId}")]
        public async Task<ActionResult<ModBackup>> GetModBackup(Guid backupId)
        {
            try
            {
                var backup = await _advancedModdingService.GetModBackupAsync(backupId);
                return Ok(backup);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("backups/{backupId}")]
        public async Task<ActionResult<ModBackup>> UpdateModBackup(Guid backupId, UpdateModBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var backup = await _advancedModdingService.UpdateModBackupAsync(backupId, userId, request);
                return Ok(backup);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("backups/{backupId}")]
        public async Task<ActionResult<bool>> DeleteModBackup(Guid backupId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModBackupAsync(backupId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("backups/{backupId}/restore")]
        public async Task<ActionResult<ModRestore>> RestoreModFromBackup(Guid backupId, RestoreModFromBackupRequest request)
        {
            try
            {
                var userId = GetUserId();
                var restore = await _advancedModdingService.RestoreModFromBackupAsync(backupId, userId, request);
                return Ok(restore);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring mod from backup {BackupId}", backupId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/restores")]
        public async Task<ActionResult<List<ModRestore>>> GetModRestores(Guid modId, [FromQuery] ModRestoreFilter filter)
        {
            try
            {
                var restores = await _advancedModdingService.GetModRestoresAsync(modId, filter);
                return Ok(restores);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod restores for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("restores/{restoreId}")]
        public async Task<ActionResult<ModRestore>> GetModRestore(Guid restoreId)
        {
            try
            {
                var restore = await _advancedModdingService.GetModRestoreAsync(restoreId);
                return Ok(restore);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod restore {RestoreId}", restoreId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Performance & Optimization
        [HttpPost("mods/{modId}/performance-profiles")]
        public async Task<ActionResult<ModPerformanceProfile>> CreateModPerformanceProfile(Guid modId, CreateModPerformanceProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _advancedModdingService.CreateModPerformanceProfileAsync(modId, userId, request);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod performance profile for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/performance-profiles")]
        public async Task<ActionResult<List<ModPerformanceProfile>>> GetModPerformanceProfiles(Guid modId, [FromQuery] ModPerformanceProfileFilter filter)
        {
            try
            {
                var profiles = await _advancedModdingService.GetModPerformanceProfilesAsync(modId, filter);
                return Ok(profiles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod performance profiles for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("performance-profiles/{profileId}")]
        public async Task<ActionResult<ModPerformanceProfile>> GetModPerformanceProfile(Guid profileId)
        {
            try
            {
                var profile = await _advancedModdingService.GetModPerformanceProfileAsync(profileId);
                return Ok(profile);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod performance profile {ProfileId}", profileId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("performance-profiles/{profileId}")]
        public async Task<ActionResult<ModPerformanceProfile>> UpdateModPerformanceProfile(Guid profileId, UpdateModPerformanceProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                var profile = await _advancedModdingService.UpdateModPerformanceProfileAsync(profileId, userId, request);
                return Ok(profile);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod performance profile {ProfileId}", profileId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("performance-profiles/{profileId}")]
        public async Task<ActionResult<bool>> DeleteModPerformanceProfile(Guid profileId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModPerformanceProfileAsync(profileId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod performance profile {ProfileId}", profileId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("mods/{modId}/optimize")]
        public async Task<ActionResult<ModOptimization>> OptimizeMod(Guid modId, OptimizeModRequest request)
        {
            try
            {
                var userId = GetUserId();
                var optimization = await _advancedModdingService.OptimizeModAsync(modId, userId, request);
                return Ok(optimization);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error optimizing mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/optimizations")]
        public async Task<ActionResult<List<ModOptimization>>> GetModOptimizations(Guid modId, [FromQuery] ModOptimizationFilter filter)
        {
            try
            {
                var optimizations = await _advancedModdingService.GetModOptimizationsAsync(modId, filter);
                return Ok(optimizations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod optimizations for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("optimizations/{optimizationId}")]
        public async Task<ActionResult<ModOptimization>> GetModOptimization(Guid optimizationId)
        {
            try
            {
                var optimization = await _advancedModdingService.GetModOptimizationAsync(optimizationId);
                return Ok(optimization);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod optimization {OptimizationId}", optimizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Integration & Hooks
        [HttpPost("mods/{modId}/integrations")]
        public async Task<ActionResult<ModIntegration>> CreateModIntegration(Guid modId, CreateModIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _advancedModdingService.CreateModIntegrationAsync(modId, userId, request);
                return Ok(integration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod integration for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/integrations")]
        public async Task<ActionResult<List<ModIntegration>>> GetModIntegrations(Guid modId, [FromQuery] ModIntegrationFilter filter)
        {
            try
            {
                var integrations = await _advancedModdingService.GetModIntegrationsAsync(modId, filter);
                return Ok(integrations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod integrations for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("integrations/{integrationId}")]
        public async Task<ActionResult<ModIntegration>> GetModIntegration(Guid integrationId)
        {
            try
            {
                var integration = await _advancedModdingService.GetModIntegrationAsync(integrationId);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("integrations/{integrationId}")]
        public async Task<ActionResult<ModIntegration>> UpdateModIntegration(Guid integrationId, UpdateModIntegrationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var integration = await _advancedModdingService.UpdateModIntegrationAsync(integrationId, userId, request);
                return Ok(integration);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("integrations/{integrationId}")]
        public async Task<ActionResult<bool>> DeleteModIntegration(Guid integrationId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModIntegrationAsync(integrationId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("integrations/{integrationId}/hooks")]
        public async Task<ActionResult<ModHook>> CreateModHook(Guid integrationId, CreateModHookRequest request)
        {
            try
            {
                var userId = GetUserId();
                var hook = await _advancedModdingService.CreateModHookAsync(integrationId, userId, request);
                return Ok(hook);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod hook for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("integrations/{integrationId}/hooks")]
        public async Task<ActionResult<List<ModHook>>> GetModHooks(Guid integrationId, [FromQuery] ModHookFilter filter)
        {
            try
            {
                var hooks = await _advancedModdingService.GetModHooksAsync(integrationId, filter);
                return Ok(hooks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod hooks for integration {IntegrationId}", integrationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("hooks/{hookId}")]
        public async Task<ActionResult<ModHook>> GetModHook(Guid hookId)
        {
            try
            {
                var hook = await _advancedModdingService.GetModHookAsync(hookId);
                return Ok(hook);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod hook {HookId}", hookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("hooks/{hookId}")]
        public async Task<ActionResult<ModHook>> UpdateModHook(Guid hookId, UpdateModHookRequest request)
        {
            try
            {
                var userId = GetUserId();
                var hook = await _advancedModdingService.UpdateModHookAsync(hookId, userId, request);
                return Ok(hook);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod hook {HookId}", hookId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Workflow & Automation
        [HttpPost("mods/{modId}/workflows")]
        public async Task<ActionResult<ModWorkflow>> CreateModWorkflow(Guid modId, CreateModWorkflowRequest request)
        {
            try
            {
                var userId = GetUserId();
                var workflow = await _advancedModdingService.CreateModWorkflowAsync(modId, userId, request);
                return Ok(workflow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod workflow for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("mods/{modId}/workflows")]
        public async Task<ActionResult<List<ModWorkflow>>> GetModWorkflows(Guid modId, [FromQuery] ModWorkflowFilter filter)
        {
            try
            {
                var workflows = await _advancedModdingService.GetModWorkflowsAsync(modId, filter);
                return Ok(workflows);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod workflows for mod {ModId}", modId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("workflows/{workflowId}")]
        public async Task<ActionResult<ModWorkflow>> GetModWorkflow(Guid workflowId)
        {
            try
            {
                var workflow = await _advancedModdingService.GetModWorkflowAsync(workflowId);
                return Ok(workflow);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod workflow {WorkflowId}", workflowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("workflows/{workflowId}")]
        public async Task<ActionResult<ModWorkflow>> UpdateModWorkflow(Guid workflowId, UpdateModWorkflowRequest request)
        {
            try
            {
                var userId = GetUserId();
                var workflow = await _advancedModdingService.UpdateModWorkflowAsync(workflowId, userId, request);
                return Ok(workflow);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod workflow {WorkflowId}", workflowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("workflows/{workflowId}")]
        public async Task<ActionResult<bool>> DeleteModWorkflow(Guid workflowId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModWorkflowAsync(workflowId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod workflow {WorkflowId}", workflowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("workflows/{workflowId}/run")]
        public async Task<ActionResult<ModWorkflowExecution>> RunModWorkflow(Guid workflowId, RunModWorkflowRequest request)
        {
            try
            {
                var userId = GetUserId();
                var execution = await _advancedModdingService.RunModWorkflowAsync(workflowId, userId, request);
                return Ok(execution);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running mod workflow {WorkflowId}", workflowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("workflows/{workflowId}/executions")]
        public async Task<ActionResult<List<ModWorkflowExecution>>> GetModWorkflowExecutions(Guid workflowId, [FromQuery] ModWorkflowExecutionFilter filter)
        {
            try
            {
                var executions = await _advancedModdingService.GetModWorkflowExecutionsAsync(workflowId, filter);
                return Ok(executions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod workflow executions for workflow {WorkflowId}", workflowId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("executions/{executionId}")]
        public async Task<ActionResult<ModWorkflowExecution>> GetModWorkflowExecution(Guid executionId)
        {
            try
            {
                var execution = await _advancedModdingService.GetModWorkflowExecutionAsync(executionId);
                return Ok(execution);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod workflow execution {ExecutionId}", executionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Mod Templates & Scaffolding
        [HttpPost("organizations/{organizationId}/templates")]
        public async Task<ActionResult<ModTemplate>> CreateModTemplate(Guid organizationId, CreateModTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var template = await _advancedModdingService.CreateModTemplateAsync(organizationId, userId, request);
                return Ok(template);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod template for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/templates")]
        public async Task<ActionResult<List<ModTemplate>>> GetModTemplates(Guid organizationId, [FromQuery] ModTemplateFilter filter)
        {
            try
            {
                var templates = await _advancedModdingService.GetModTemplatesAsync(organizationId, filter);
                return Ok(templates);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod templates for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("templates/{templateId}")]
        public async Task<ActionResult<ModTemplate>> GetModTemplate(Guid templateId)
        {
            try
            {
                var template = await _advancedModdingService.GetModTemplateAsync(templateId);
                return Ok(template);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("templates/{templateId}")]
        public async Task<ActionResult<ModTemplate>> UpdateModTemplate(Guid templateId, UpdateModTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var template = await _advancedModdingService.UpdateModTemplateAsync(templateId, userId, request);
                return Ok(template);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating mod template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("templates/{templateId}")]
        public async Task<ActionResult<bool>> DeleteModTemplate(Guid templateId)
        {
            try
            {
                var userId = GetUserId();
                var result = await _advancedModdingService.DeleteModTemplateAsync(templateId, userId);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting mod template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("templates/{templateId}/create-mod")]
        public async Task<ActionResult<ModProject>> CreateModFromTemplate(Guid templateId, CreateModFromTemplateRequest request)
        {
            try
            {
                var userId = GetUserId();
                var project = await _advancedModdingService.CreateModFromTemplateAsync(templateId, userId, request);
                return Ok(project);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mod from template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("templates/{templateId}/scaffold")]
        public async Task<ActionResult<ModScaffold>> GenerateModScaffold(Guid templateId, GenerateModScaffoldRequest request)
        {
            try
            {
                var userId = GetUserId();
                var scaffold = await _advancedModdingService.GenerateModScaffoldAsync(templateId, userId, request);
                return Ok(scaffold);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating mod scaffold for template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("templates/{templateId}/scaffolds")]
        public async Task<ActionResult<List<ModScaffold>>> GetModScaffolds(Guid templateId, [FromQuery] ModScaffoldFilter filter)
        {
            try
            {
                var scaffolds = await _advancedModdingService.GetModScaffoldsAsync(templateId, filter);
                return Ok(scaffolds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting mod scaffolds for template {TemplateId}", templateId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}