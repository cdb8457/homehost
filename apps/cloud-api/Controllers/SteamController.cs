using HomeHost.CloudApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SteamController : ControllerBase
    {
        private readonly ISteamService _steamService;
        private readonly ILogger<SteamController> _logger;

        public SteamController(ISteamService steamService, ILogger<SteamController> logger)
        {
            _steamService = steamService;
            _logger = logger;
        }

        [HttpGet("apps/{steamAppId}")]
        public async Task<ActionResult<SteamAppResponse>> GetAppInfo(string steamAppId)
        {
            try
            {
                var appInfo = await _steamService.GetAppInfoAsync(steamAppId);
                if (appInfo == null)
                {
                    return NotFound(new { error = "Steam application not found" });
                }

                var response = new SteamAppResponse
                {
                    AppId = appInfo.AppId,
                    Name = appInfo.Name,
                    Description = appInfo.Description,
                    Developer = appInfo.Developer,
                    Publisher = appInfo.Publisher,
                    ReleaseDate = appInfo.ReleaseDate,
                    Categories = appInfo.Categories,
                    Genres = appInfo.Genres,
                    HeaderImage = appInfo.HeaderImage,
                    Screenshots = appInfo.Screenshots,
                    IsFree = appInfo.IsFree,
                    Price = appInfo.Price,
                    PlatformSupport = new PlatformSupport
                    {
                        Windows = appInfo.PlatformWindows == "true",
                        Linux = appInfo.PlatformLinux == "true"
                    },
                    SystemRequirements = appInfo.SystemRequirements
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Steam app info for {AppId}", steamAppId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("apps/search")]
        public async Task<ActionResult<List<SteamAppResponse>>> SearchApps([FromQuery] string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query) || query.Length < 3)
                {
                    return BadRequest(new { error = "Query must be at least 3 characters long" });
                }

                var apps = await _steamService.SearchAppsAsync(query);
                var response = apps.Select(app => new SteamAppResponse
                {
                    AppId = app.AppId,
                    Name = app.Name,
                    Description = app.Description,
                    Developer = app.Developer,
                    Publisher = app.Publisher,
                    HeaderImage = app.HeaderImage,
                    Categories = app.Categories,
                    Genres = app.Genres,
                    IsFree = app.IsFree,
                    Price = app.Price
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching Steam apps for query: {Query}", query);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("apps/{steamAppId}/server-info")]
        public async Task<ActionResult<SteamServerResponse>> GetServerInfo(string steamAppId)
        {
            try
            {
                var serverInfo = await _steamService.GetDedicatedServerInfoAsync(steamAppId);
                if (serverInfo == null)
                {
                    return NotFound(new { error = "No dedicated server information found for this application" });
                }

                var response = new SteamServerResponse
                {
                    AppId = serverInfo.AppId,
                    Name = serverInfo.Name,
                    HasDedicatedServer = serverInfo.HasDedicatedServer,
                    ServerExecutable = serverInfo.ServerExecutable,
                    DefaultPorts = serverInfo.DefaultPorts,
                    DefaultConfiguration = serverInfo.DefaultConfiguration,
                    SupportedPlatforms = serverInfo.SupportedPlatforms,
                    InstallationNotes = serverInfo.InstallationNotes,
                    ConfigurationGuide = serverInfo.ConfigurationGuide
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Steam server info for {AppId}", steamAppId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("apps/{steamAppId}/compatibility")]
        public async Task<ActionResult<CompatibilityResponse>> CheckCompatibility(string steamAppId)
        {
            try
            {
                var warnings = await _steamService.CheckCompatibilityAsync(steamAppId);
                var hasServer = await _steamService.HasDedicatedServerAsync(steamAppId);

                var response = new CompatibilityResponse
                {
                    AppId = steamAppId,
                    IsCompatible = hasServer && !warnings.Any(w => w.BlocksDeployment),
                    HasDedicatedServer = hasServer,
                    Warnings = warnings.Select(w => new CompatibilityWarning
                    {
                        Type = w.Type,
                        Message = w.Message,
                        Resolution = w.Resolution,
                        BlocksDeployment = w.BlocksDeployment
                    }).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking compatibility for {AppId}", steamAppId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("apps/{steamAppId}/download")]
        [Authorize]
        public async Task<ActionResult<DownloadResponse>> DownloadServerFiles(string steamAppId, [FromBody] DownloadRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check compatibility first
                var warnings = await _steamService.CheckCompatibilityAsync(steamAppId);
                if (warnings.Any(w => w.BlocksDeployment))
                {
                    return BadRequest(new { 
                        error = "Application is not compatible", 
                        warnings = warnings.Select(w => w.Message) 
                    });
                }

                // Start download process
                var result = await _steamService.DownloadServerFilesAsync(steamAppId, request.InstallPath);

                var response = new DownloadResponse
                {
                    Success = result.Success,
                    Message = result.Message,
                    InstallPath = result.InstallPath,
                    BytesDownloaded = result.BytesDownloaded,
                    Duration = result.Duration,
                    Errors = result.Errors
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downloading server files for {AppId}", steamAppId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("apps/{steamAppId}/update")]
        [Authorize]
        public async Task<ActionResult<DownloadResponse>> UpdateServerFiles(string steamAppId, [FromBody] DownloadRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _steamService.UpdateServerFilesAsync(steamAppId, request.InstallPath);

                var response = new DownloadResponse
                {
                    Success = result.Success,
                    Message = result.Message,
                    InstallPath = result.InstallPath,
                    BytesDownloaded = result.BytesDownloaded,
                    Duration = result.Duration,
                    Errors = result.Errors
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating server files for {AppId}", steamAppId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("apps/{steamAppId}/updates")]
        public async Task<ActionResult<UpdateInfoResponse>> CheckForUpdates(string steamAppId)
        {
            try
            {
                var updateInfo = await _steamService.CheckForUpdatesAsync(steamAppId);

                var response = new UpdateInfoResponse
                {
                    AppId = updateInfo.AppId,
                    CurrentVersion = updateInfo.CurrentVersion,
                    LatestVersion = updateInfo.LatestVersion,
                    UpdateAvailable = updateInfo.UpdateAvailable,
                    UpdateSize = updateInfo.UpdateSize,
                    LastChecked = updateInfo.LastChecked,
                    ReleaseNotes = updateInfo.ReleaseNotes
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking updates for {AppId}", steamAppId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("users/{steamId}")]
        public async Task<ActionResult<SteamUserResponse>> GetUserProfile(string steamId)
        {
            try
            {
                var profile = await _steamService.GetUserProfileAsync(steamId);
                if (profile == null)
                {
                    return NotFound(new { error = "Steam user not found" });
                }

                var response = new SteamUserResponse
                {
                    SteamId = profile.SteamId,
                    PersonaName = profile.PersonaName,
                    RealName = profile.RealName,
                    Avatar = profile.Avatar,
                    AvatarMedium = profile.AvatarMedium,
                    AvatarFull = profile.AvatarFull,
                    PersonaState = profile.PersonaState,
                    ProfileUrl = profile.ProfileUrl,
                    CountryCode = profile.CountryCode,
                    TimeCreated = profile.TimeCreated,
                    LastLogoff = profile.LastLogoff
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving Steam user profile for {SteamId}", steamId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("validate-steamid")]
        public async Task<ActionResult<ValidationResponse>> ValidateSteamId([FromBody] ValidateSteamIdRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var isValid = await _steamService.ValidateSteamIdAsync(request.SteamId);

                var response = new ValidationResponse
                {
                    IsValid = isValid,
                    SteamId = request.SteamId,
                    Message = isValid ? "Steam ID is valid" : "Steam ID not found or invalid"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating Steam ID: {SteamId}", request.SteamId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }
    }

    // Request/Response DTOs
    public class SteamAppResponse
    {
        public string AppId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Developer { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public DateTime ReleaseDate { get; set; }
        public List<string> Categories { get; set; } = new();
        public List<string> Genres { get; set; } = new();
        public string HeaderImage { get; set; } = string.Empty;
        public List<string> Screenshots { get; set; } = new();
        public bool IsFree { get; set; }
        public decimal Price { get; set; }
        public PlatformSupport PlatformSupport { get; set; } = new();
        public Dictionary<string, object> SystemRequirements { get; set; } = new();
    }

    public class PlatformSupport
    {
        public bool Windows { get; set; }
        public bool Linux { get; set; }
        public bool Mac { get; set; }
    }

    public class SteamServerResponse
    {
        public string AppId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool HasDedicatedServer { get; set; }
        public string ServerExecutable { get; set; } = string.Empty;
        public List<int> DefaultPorts { get; set; } = new();
        public Dictionary<string, object> DefaultConfiguration { get; set; } = new();
        public List<string> SupportedPlatforms { get; set; } = new();
        public string InstallationNotes { get; set; } = string.Empty;
        public string ConfigurationGuide { get; set; } = string.Empty;
    }

    public class CompatibilityResponse
    {
        public string AppId { get; set; } = string.Empty;
        public bool IsCompatible { get; set; }
        public bool HasDedicatedServer { get; set; }
        public List<CompatibilityWarning> Warnings { get; set; } = new();
    }

    public class CompatibilityWarning
    {
        public string Type { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        public bool BlocksDeployment { get; set; }
    }

    public class DownloadRequest
    {
        [Required]
        public string InstallPath { get; set; } = string.Empty;
    }

    public class DownloadResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string InstallPath { get; set; } = string.Empty;
        public long BytesDownloaded { get; set; }
        public TimeSpan Duration { get; set; }
        public List<string> Errors { get; set; } = new();
    }

    public class UpdateInfoResponse
    {
        public string AppId { get; set; } = string.Empty;
        public string CurrentVersion { get; set; } = string.Empty;
        public string LatestVersion { get; set; } = string.Empty;
        public bool UpdateAvailable { get; set; }
        public long UpdateSize { get; set; }
        public DateTime LastChecked { get; set; }
        public string ReleaseNotes { get; set; } = string.Empty;
    }

    public class SteamUserResponse
    {
        public string SteamId { get; set; } = string.Empty;
        public string PersonaName { get; set; } = string.Empty;
        public string RealName { get; set; } = string.Empty;
        public string Avatar { get; set; } = string.Empty;
        public string AvatarMedium { get; set; } = string.Empty;
        public string AvatarFull { get; set; } = string.Empty;
        public int PersonaState { get; set; }
        public string ProfileUrl { get; set; } = string.Empty;
        public string CountryCode { get; set; } = string.Empty;
        public DateTime TimeCreated { get; set; }
        public DateTime LastLogoff { get; set; }
    }

    public class ValidateSteamIdRequest
    {
        [Required]
        public string SteamId { get; set; } = string.Empty;
    }

    public class ValidationResponse
    {
        public bool IsValid { get; set; }
        public string SteamId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}