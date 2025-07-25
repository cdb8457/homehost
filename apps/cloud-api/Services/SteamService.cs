using HomeHost.CloudApi.Data;
using HomeHost.CloudApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Diagnostics;
using System.IO;

namespace HomeHost.CloudApi.Services
{
    public class SteamService : ISteamService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<SteamService> _logger;
        private readonly HomeHostContext _context;
        private readonly string _steamApiKey;
        private readonly string _steamCmdPath;

        // Steam Web API endpoints
        private const string STEAM_API_BASE = "https://api.steampowered.com";
        private const string STEAM_STORE_API_BASE = "https://store.steampowered.com/api";

        public SteamService(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<SteamService> logger,
            HomeHostContext context)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
            _context = context;
            _steamApiKey = configuration["STEAM_API_KEY"] ?? throw new InvalidOperationException("Steam API key not configured");
            _steamCmdPath = configuration["STEAMCMD_PATH"] ?? @"C:\steamcmd\steamcmd.exe";
        }

        public async Task<SteamAppInfo?> GetAppInfoAsync(string steamAppId)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                
                // Get detailed app info from Steam Store API
                var response = await httpClient.GetStringAsync(
                    $"{STEAM_STORE_API_BASE}/appdetails?appids={steamAppId}&cc=US&l=english");

                var jsonDoc = JsonDocument.Parse(response);
                if (!jsonDoc.RootElement.TryGetProperty(steamAppId, out var appData) ||
                    !appData.TryGetProperty("success", out var success) ||
                    !success.GetBoolean())
                {
                    return null;
                }

                var data = appData.GetProperty("data");
                var appInfo = new SteamAppInfo
                {
                    AppId = steamAppId,
                    Name = GetJsonString(data, "name"),
                    Description = GetJsonString(data, "detailed_description"),
                    Developer = GetJsonStringArray(data, "developers").FirstOrDefault() ?? "",
                    Publisher = GetJsonStringArray(data, "publishers").FirstOrDefault() ?? "",
                    HeaderImage = GetJsonString(data, "header_image"),
                    IsFree = GetJsonBool(data, "is_free"),
                    Categories = GetCategories(data),
                    Genres = GetGenres(data),
                    Screenshots = GetScreenshots(data),
                    SystemRequirements = GetSystemRequirements(data)
                };

                // Try to parse release date
                if (data.TryGetProperty("release_date", out var releaseData) &&
                    releaseData.TryGetProperty("date", out var dateStr) &&
                    DateTime.TryParse(dateStr.GetString(), out var releaseDate))
                {
                    appInfo.ReleaseDate = releaseDate;
                }

                // Get platform support
                if (data.TryGetProperty("platforms", out var platforms))
                {
                    appInfo.PlatformWindows = GetJsonBool(platforms, "windows") ? "true" : "false";
                    appInfo.PlatformLinux = GetJsonBool(platforms, "linux") ? "true" : "false";
                }

                return appInfo;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get Steam app info for {AppId}", steamAppId);
                return null;
            }
        }

        public async Task<List<SteamAppInfo>> SearchAppsAsync(string query)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                
                // Get app list and filter by query
                var response = await httpClient.GetStringAsync(
                    $"{STEAM_API_BASE}/ISteamApps/GetAppList/v2/?key={_steamApiKey}");

                var jsonDoc = JsonDocument.Parse(response);
                var apps = jsonDoc.RootElement
                    .GetProperty("applist")
                    .GetProperty("apps")
                    .EnumerateArray()
                    .Where(app => app.GetProperty("name").GetString()?.Contains(query, StringComparison.OrdinalIgnoreCase) == true)
                    .Take(20)
                    .ToList();

                var results = new List<SteamAppInfo>();
                foreach (var app in apps)
                {
                    var appId = app.GetProperty("appid").GetInt32().ToString();
                    var appInfo = await GetAppInfoAsync(appId);
                    if (appInfo != null)
                    {
                        results.Add(appInfo);
                    }
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to search Steam apps for query: {Query}", query);
                return new List<SteamAppInfo>();
            }
        }

        public async Task<SteamUserProfile?> GetUserProfileAsync(string steamId)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                var response = await httpClient.GetStringAsync(
                    $"{STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key={_steamApiKey}&steamids={steamId}");

                var jsonDoc = JsonDocument.Parse(response);
                var players = jsonDoc.RootElement
                    .GetProperty("response")
                    .GetProperty("players");

                if (players.GetArrayLength() == 0)
                {
                    return null;
                }

                var player = players[0];
                return new SteamUserProfile
                {
                    SteamId = steamId,
                    PersonaName = GetJsonString(player, "personaname"),
                    RealName = GetJsonString(player, "realname"),
                    Avatar = GetJsonString(player, "avatar"),
                    AvatarMedium = GetJsonString(player, "avatarmedium"),
                    AvatarFull = GetJsonString(player, "avatarfull"),
                    PersonaState = GetJsonInt(player, "personastate"),
                    ProfileUrl = GetJsonString(player, "profileurl"),
                    CountryCode = GetJsonString(player, "loccountrycode"),
                    TimeCreated = DateTimeOffset.FromUnixTimeSeconds(GetJsonLong(player, "timecreated")).DateTime,
                    LastLogoff = DateTimeOffset.FromUnixTimeSeconds(GetJsonLong(player, "lastlogoff")).DateTime
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get Steam user profile for {SteamId}", steamId);
                return null;
            }
        }

        public async Task<bool> ValidateSteamIdAsync(string steamId)
        {
            try
            {
                var profile = await GetUserProfileAsync(steamId);
                return profile != null;
            }
            catch
            {
                return false;
            }
        }

        public async Task<SteamServerInfo?> GetDedicatedServerInfoAsync(string steamAppId)
        {
            try
            {
                // Check our known dedicated server configurations
                var knownServers = GetKnownDedicatedServers();
                if (knownServers.TryGetValue(steamAppId, out var serverInfo))
                {
                    return serverInfo;
                }

                // For unknown apps, try to detect dedicated server by common patterns
                var appInfo = await GetAppInfoAsync(steamAppId);
                if (appInfo == null) return null;

                var hasServer = appInfo.Name.Contains("Dedicated Server", StringComparison.OrdinalIgnoreCase) ||
                               appInfo.Categories.Any(c => c.Contains("Multi-player") || c.Contains("Co-op"));

                if (hasServer)
                {
                    return new SteamServerInfo
                    {
                        AppId = steamAppId,
                        Name = appInfo.Name,
                        HasDedicatedServer = true,
                        ServerExecutable = "server.exe", // Generic default
                        DefaultPorts = new List<int> { 7777, 7778 },
                        SupportedPlatforms = new List<string> { "Windows" },
                        InstallationNotes = "Automatic detection - manual configuration may be required",
                        ConfigurationGuide = "Please refer to the game's documentation for server configuration"
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get dedicated server info for {AppId}", steamAppId);
                return null;
            }
        }

        public async Task<bool> HasDedicatedServerAsync(string steamAppId)
        {
            var serverInfo = await GetDedicatedServerInfoAsync(steamAppId);
            return serverInfo?.HasDedicatedServer == true;
        }

        public async Task<List<SteamCompatibilityWarning>> CheckCompatibilityAsync(string steamAppId)
        {
            var warnings = new List<SteamCompatibilityWarning>();

            try
            {
                var serverInfo = await GetDedicatedServerInfoAsync(steamAppId);
                if (serverInfo == null)
                {
                    warnings.Add(new SteamCompatibilityWarning
                    {
                        Type = "error",
                        Message = "No dedicated server found for this Steam application",
                        Resolution = "This game may not support dedicated servers or requires manual configuration",
                        BlocksDeployment = true
                    });
                    return warnings;
                }

                var appInfo = await GetAppInfoAsync(steamAppId);
                if (appInfo != null)
                {
                    // Check platform compatibility
                    if (appInfo.PlatformWindows != "true")
                    {
                        warnings.Add(new SteamCompatibilityWarning
                        {
                            Type = "warning",
                            Message = "This game may not support Windows dedicated servers",
                            Resolution = "Consider using a Linux-based deployment or check game documentation",
                            BlocksDeployment = false
                        });
                    }

                    // Check if it's Early Access
                    if (appInfo.Categories.Any(c => c.Contains("Early Access")))
                    {
                        warnings.Add(new SteamCompatibilityWarning
                        {
                            Type = "info",
                            Message = "This is an Early Access game - servers may be unstable",
                            Resolution = "Expect frequent updates and potential compatibility issues",
                            BlocksDeployment = false
                        });
                    }
                }

                return warnings;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to check compatibility for {AppId}", steamAppId);
                warnings.Add(new SteamCompatibilityWarning
                {
                    Type = "error",
                    Message = "Unable to check compatibility",
                    Resolution = "Please try again or contact support",
                    BlocksDeployment = true
                });
                return warnings;
            }
        }

        public async Task<SteamCMDResult> DownloadServerFilesAsync(string steamAppId, string installPath)
        {
            try
            {
                if (!File.Exists(_steamCmdPath))
                {
                    return new SteamCMDResult
                    {
                        Success = false,
                        Message = "SteamCMD not found. Please install SteamCMD first.",
                        Errors = new List<string> { $"SteamCMD path not found: {_steamCmdPath}" }
                    };
                }

                var startTime = DateTime.UtcNow;
                var arguments = $"+force_install_dir \"{installPath}\" +login anonymous +app_update {steamAppId} validate +quit";

                var processInfo = new ProcessStartInfo
                {
                    FileName = _steamCmdPath,
                    Arguments = arguments,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using var process = Process.Start(processInfo);
                if (process == null)
                {
                    throw new InvalidOperationException("Failed to start SteamCMD process");
                }

                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                var duration = DateTime.UtcNow - startTime;
                var bytesDownloaded = GetDownloadedBytes(installPath);

                var result = new SteamCMDResult
                {
                    Success = process.ExitCode == 0,
                    Message = process.ExitCode == 0 ? "Download completed successfully" : "Download failed",
                    InstallPath = installPath,
                    BytesDownloaded = bytesDownloaded,
                    Duration = duration,
                    Metadata = new Dictionary<string, object>
                    {
                        { "output", output },
                        { "exitCode", process.ExitCode }
                    }
                };

                if (!string.IsNullOrEmpty(error))
                {
                    result.Errors.Add(error);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to download server files for {AppId}", steamAppId);
                return new SteamCMDResult
                {
                    Success = false,
                    Message = "Download failed with exception",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<SteamCMDResult> UpdateServerFilesAsync(string steamAppId, string installPath)
        {
            // Update is the same process as download in SteamCMD
            return await DownloadServerFilesAsync(steamAppId, installPath);
        }

        public async Task<SteamUpdateInfo> CheckForUpdatesAsync(string steamAppId)
        {
            // This would require comparing local version with Steam's latest
            // For now, return a placeholder implementation
            return new SteamUpdateInfo
            {
                AppId = steamAppId,
                CurrentVersion = "unknown",
                LatestVersion = "unknown",
                UpdateAvailable = false,
                UpdateSize = 0,
                LastChecked = DateTime.UtcNow,
                ReleaseNotes = "Update checking not yet implemented"
            };
        }

        // Steam Workshop Integration
        public async Task<List<SteamWorkshopItem>> GetWorkshopItemsAsync(string steamAppId, int page = 1, int pageSize = 20)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                
                // Use Steam Web API to get workshop items
                var response = await httpClient.GetStringAsync(
                    $"{STEAM_API_BASE}/IPublishedFileService/QueryFiles/v1/?key={_steamApiKey}&format=json" +
                    $"&appid={steamAppId}&page={page}&numperpage={pageSize}&return_metadata=true&return_tags=true");

                var jsonDoc = JsonDocument.Parse(response);
                var files = jsonDoc.RootElement
                    .GetProperty("response")
                    .GetProperty("publishedfiledetails");

                var workshopItems = new List<SteamWorkshopItem>();
                
                foreach (var file in files.EnumerateArray())
                {
                    workshopItems.Add(new SteamWorkshopItem
                    {
                        PublishedFileId = GetJsonString(file, "publishedfileid"),
                        Title = GetJsonString(file, "title"),
                        Description = GetJsonString(file, "description"),
                        Author = GetJsonString(file, "creator"),
                        TimeCreated = DateTimeOffset.FromUnixTimeSeconds(GetJsonLong(file, "time_created")).DateTime,
                        TimeUpdated = DateTimeOffset.FromUnixTimeSeconds(GetJsonLong(file, "time_updated")).DateTime,
                        PreviewUrl = GetJsonString(file, "preview_url"),
                        FileSize = GetJsonLong(file, "file_size"),
                        Subscriptions = GetJsonInt(file, "subscriptions"),
                        Score = GetJsonFloat(file, "score"),
                        Tags = GetWorkshopTags(file),
                        AppId = steamAppId
                    });
                }

                return workshopItems;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get workshop items for {AppId}", steamAppId);
                return new List<SteamWorkshopItem>();
            }
        }

        public async Task<SteamWorkshopItem?> GetWorkshopItemAsync(string workshopId)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient();
                
                var response = await httpClient.GetStringAsync(
                    $"{STEAM_API_BASE}/IPublishedFileService/GetDetails/v1/?key={_steamApiKey}&format=json" +
                    $"&publishedfileids[0]={workshopId}");

                var jsonDoc = JsonDocument.Parse(response);
                var files = jsonDoc.RootElement
                    .GetProperty("response")
                    .GetProperty("publishedfiledetails");

                if (files.GetArrayLength() == 0)
                {
                    return null;
                }

                var file = files[0];
                return new SteamWorkshopItem
                {
                    PublishedFileId = workshopId,
                    Title = GetJsonString(file, "title"),
                    Description = GetJsonString(file, "description"),
                    Author = GetJsonString(file, "creator"),
                    TimeCreated = DateTimeOffset.FromUnixTimeSeconds(GetJsonLong(file, "time_created")).DateTime,
                    TimeUpdated = DateTimeOffset.FromUnixTimeSeconds(GetJsonLong(file, "time_updated")).DateTime,
                    PreviewUrl = GetJsonString(file, "preview_url"),
                    FileSize = GetJsonLong(file, "file_size"),
                    Subscriptions = GetJsonInt(file, "subscriptions"),
                    Score = GetJsonFloat(file, "score"),
                    Tags = GetWorkshopTags(file),
                    AppId = GetJsonString(file, "consumer_app_id")
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get workshop item {WorkshopId}", workshopId);
                return null;
            }
        }

        public async Task<SteamCMDResult> DownloadWorkshopItemAsync(string workshopId, string installPath)
        {
            try
            {
                if (!File.Exists(_steamCmdPath))
                {
                    return new SteamCMDResult
                    {
                        Success = false,
                        Message = "SteamCMD not found",
                        Errors = new List<string> { $"SteamCMD path not found: {_steamCmdPath}" }
                    };
                }

                var startTime = DateTime.UtcNow;
                var arguments = $"+force_install_dir \"{installPath}\" +login anonymous +workshop_download_item {workshopId} +quit";

                var processInfo = new ProcessStartInfo
                {
                    FileName = _steamCmdPath,
                    Arguments = arguments,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    CreateNoWindow = true
                };

                using var process = Process.Start(processInfo);
                if (process == null)
                {
                    throw new InvalidOperationException("Failed to start SteamCMD process");
                }

                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                var duration = DateTime.UtcNow - startTime;
                var bytesDownloaded = GetDownloadedBytes(installPath);

                var result = new SteamCMDResult
                {
                    Success = process.ExitCode == 0,
                    Message = process.ExitCode == 0 ? "Workshop item downloaded successfully" : "Workshop download failed",
                    InstallPath = installPath,
                    BytesDownloaded = bytesDownloaded,
                    Duration = duration,
                    Metadata = new Dictionary<string, object>
                    {
                        { "output", output },
                        { "exitCode", process.ExitCode },
                        { "workshopItemId", workshopId }
                    }
                };

                if (!string.IsNullOrEmpty(error))
                {
                    result.Errors.Add(error);
                }

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to download workshop item {WorkshopId}", workshopId);
                return new SteamCMDResult
                {
                    Success = false,
                    Message = "Workshop download failed with exception",
                    Errors = new List<string> { ex.Message }
                };
            }
        }

        public async Task<SteamAuthResult> ValidateUserTicketAsync(string steamId, string ticket)
        {
            // This would integrate with Steam's ticket validation API
            return new SteamAuthResult
            {
                Success = false,
                Error = "Steam ticket validation not yet implemented"
            };
        }

        public async Task<bool> VerifyServerOwnershipAsync(string steamId, string steamAppId)
        {
            // This would check if the user owns the game
            return true; // Placeholder
        }

        public async Task<SteamServerStatus> GetServerStatusAsync(string serverIp, int port)
        {
            // This would query the game server for status
            return new SteamServerStatus
            {
                ServerIp = serverIp,
                Port = port,
                Online = false,
                LastChecked = DateTime.UtcNow
            };
        }

        // Helper methods
        private Dictionary<string, SteamServerInfo> GetKnownDedicatedServers()
        {
            return new Dictionary<string, SteamServerInfo>
            {
                // Valheim
                ["896660"] = new SteamServerInfo
                {
                    AppId = "896660",
                    Name = "Valheim Dedicated Server",
                    HasDedicatedServer = true,
                    ServerExecutable = "valheim_server.exe",
                    DefaultPorts = new List<int> { 2456, 2457, 2458 },
                    SupportedPlatforms = new List<string> { "Windows", "Linux" },
                    DefaultConfiguration = new Dictionary<string, object>
                    {
                        { "name", "Valheim Server" },
                        { "world", "Dedicated" },
                        { "password", "" },
                        { "port", 2456 },
                        { "public", 1 }
                    }
                },
                // CS2 Dedicated Server
                ["730"] = new SteamServerInfo
                {
                    AppId = "730",
                    Name = "Counter-Strike 2 Dedicated Server",
                    HasDedicatedServer = true,
                    ServerExecutable = "cs2.exe",
                    DefaultPorts = new List<int> { 27015, 27016 },
                    SupportedPlatforms = new List<string> { "Windows", "Linux" }
                },
                // Rust Dedicated Server
                ["258550"] = new SteamServerInfo
                {
                    AppId = "258550",
                    Name = "Rust Dedicated Server",
                    HasDedicatedServer = true,
                    ServerExecutable = "RustDedicated.exe",
                    DefaultPorts = new List<int> { 28015, 28016 },
                    SupportedPlatforms = new List<string> { "Windows", "Linux" }
                }
            };
        }

        private long GetDownloadedBytes(string path)
        {
            try
            {
                if (Directory.Exists(path))
                {
                    return new DirectoryInfo(path)
                        .GetFiles("*", SearchOption.AllDirectories)
                        .Sum(f => f.Length);
                }
            }
            catch
            {
                // Ignore errors
            }
            return 0;
        }

        // JSON helper methods
        private string GetJsonString(JsonElement element, string property)
        {
            return element.TryGetProperty(property, out var prop) ? prop.GetString() ?? "" : "";
        }

        private bool GetJsonBool(JsonElement element, string property)
        {
            return element.TryGetProperty(property, out var prop) && prop.GetBoolean();
        }

        private int GetJsonInt(JsonElement element, string property)
        {
            return element.TryGetProperty(property, out var prop) ? prop.GetInt32() : 0;
        }

        private long GetJsonLong(JsonElement element, string property)
        {
            return element.TryGetProperty(property, out var prop) ? prop.GetInt64() : 0;
        }

        private float GetJsonFloat(JsonElement element, string property)
        {
            return element.TryGetProperty(property, out var prop) ? prop.GetSingle() : 0f;
        }

        private List<string> GetJsonStringArray(JsonElement element, string property)
        {
            if (element.TryGetProperty(property, out var prop) && prop.ValueKind == JsonValueKind.Array)
            {
                return prop.EnumerateArray().Select(x => x.GetString() ?? "").ToList();
            }
            return new List<string>();
        }

        private List<string> GetCategories(JsonElement data)
        {
            if (data.TryGetProperty("categories", out var categories))
            {
                return categories.EnumerateArray()
                    .Select(c => GetJsonString(c, "description"))
                    .Where(d => !string.IsNullOrEmpty(d))
                    .ToList();
            }
            return new List<string>();
        }

        private List<string> GetGenres(JsonElement data)
        {
            if (data.TryGetProperty("genres", out var genres))
            {
                return genres.EnumerateArray()
                    .Select(g => GetJsonString(g, "description"))
                    .Where(d => !string.IsNullOrEmpty(d))
                    .ToList();
            }
            return new List<string>();
        }

        private List<string> GetScreenshots(JsonElement data)
        {
            if (data.TryGetProperty("screenshots", out var screenshots))
            {
                return screenshots.EnumerateArray()
                    .Select(s => GetJsonString(s, "path_thumbnail"))
                    .Where(p => !string.IsNullOrEmpty(p))
                    .ToList();
            }
            return new List<string>();
        }

        private Dictionary<string, object> GetSystemRequirements(JsonElement data)
        {
            var requirements = new Dictionary<string, object>();
            
            if (data.TryGetProperty("pc_requirements", out var pcReq))
            {
                requirements["minimum"] = GetJsonString(pcReq, "minimum");
                requirements["recommended"] = GetJsonString(pcReq, "recommended");
            }

            return requirements;
        }

        private List<string> GetWorkshopTags(JsonElement file)
        {
            var tags = new List<string>();
            
            if (file.TryGetProperty("tags", out var tagsElement) && tagsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var tag in tagsElement.EnumerateArray())
                {
                    if (tag.TryGetProperty("tag", out var tagValue))
                    {
                        var tagString = tagValue.GetString();
                        if (!string.IsNullOrEmpty(tagString))
                        {
                            tags.Add(tagString);
                        }
                    }
                }
            }
            
            return tags;
        }
    }
}