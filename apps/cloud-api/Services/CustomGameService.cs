using HomeHost.CloudApi.Data;
using HomeHost.CloudApi.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace HomeHost.CloudApi.Services
{
    public class CustomGameService : ICustomGameService
    {
        private readonly HomeHostContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<CustomGameService> _logger;
        private readonly string _uploadPath;
        private readonly string[] _allowedExecutableExtensions = { ".exe", ".jar", ".sh", ".py" };
        private readonly long _maxFileSize = 500 * 1024 * 1024; // 500MB

        public CustomGameService(
            HomeHostContext context,
            IConfiguration configuration,
            ILogger<CustomGameService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _uploadPath = configuration["CUSTOM_GAMES_UPLOAD_PATH"] ?? Path.Combine(Path.GetTempPath(), "homehost-uploads");
            
            // Ensure upload directory exists
            Directory.CreateDirectory(_uploadPath);
        }

        public async Task<FileUploadResult> ValidateExecutableAsync(IFormFile file)
        {
            var result = new FileUploadResult();

            try
            {
                // Basic file validation
                if (file == null || file.Length == 0)
                {
                    result.Errors.Add("No file provided");
                    return result;
                }

                // Check file size
                if (file.Length > _maxFileSize)
                {
                    result.Errors.Add($"File size exceeds maximum allowed size of {_maxFileSize / (1024 * 1024)}MB");
                    return result;
                }

                // Check file extension
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!_allowedExecutableExtensions.Contains(extension))
                {
                    result.Errors.Add($"File type '{extension}' is not supported. Allowed types: {string.Join(", ", _allowedExecutableExtensions)}");
                    return result;
                }

                // Check filename for security
                if (ContainsMaliciousFilename(file.FileName))
                {
                    result.Errors.Add("Filename contains potentially dangerous characters");
                    return result;
                }

                // Basic content validation
                using var stream = file.OpenReadStream();
                var buffer = new byte[4096];
                await stream.ReadAsync(buffer, 0, buffer.Length);

                // Check for executable signatures
                if (extension == ".exe" && !HasValidExecutableSignature(buffer))
                {
                    result.Errors.Add("File does not appear to be a valid Windows executable");
                    return result;
                }

                result.Success = true;
                result.Message = "File validation passed";
                result.FileSize = file.Length;
                result.FileName = file.FileName;

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating executable file: {FileName}", file.FileName);
                result.Errors.Add("Validation failed due to internal error");
                return result;
            }
        }

        public async Task<FileUploadResult> UploadCustomGameAsync(IFormFile file, Guid userId, string tempPath)
        {
            var result = await ValidateExecutableAsync(file);
            if (!result.Success)
            {
                return result;
            }

            try
            {
                // Generate unique filename
                var fileId = Guid.NewGuid();
                var extension = Path.GetExtension(file.FileName);
                var sanitizedFileName = $"{fileId}{extension}";
                var fullPath = Path.Combine(_uploadPath, userId.ToString(), sanitizedFileName);

                // Ensure user directory exists
                var userDirectory = Path.GetDirectoryName(fullPath)!;
                Directory.CreateDirectory(userDirectory);

                // Save file
                using (var fileStream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Calculate file hash for integrity
                var fileHash = await CalculateFileHashAsync(fullPath);

                // Update result
                result.FilePath = fullPath;
                result.FileHash = fileHash;
                result.Success = true;
                result.Message = "File uploaded successfully";

                _logger.LogInformation("Custom game file uploaded: {FileName} -> {FilePath} by user {UserId}", 
                    file.FileName, fullPath, userId);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading custom game file: {FileName}", file.FileName);
                result.Success = false;
                result.Errors.Add("Upload failed due to internal error");
                return result;
            }
        }

        public async Task<bool> ValidateExecutableFormatAsync(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    return false;
                }

                var extension = Path.GetExtension(filePath).ToLowerInvariant();
                
                switch (extension)
                {
                    case ".exe":
                        return await ValidateWindowsExecutableAsync(filePath);
                    case ".jar":
                        return await ValidateJavaJarAsync(filePath);
                    case ".sh":
                        return await ValidateShellScriptAsync(filePath);
                    case ".py":
                        return await ValidatePythonScriptAsync(filePath);
                    default:
                        return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating executable format: {FilePath}", filePath);
                return false;
            }
        }

        public async Task<GamePatternAnalysis> AnalyzeGamePatternAsync(string executablePath)
        {
            var analysis = new GamePatternAnalysis
            {
                ExecutablePath = executablePath
            };

            try
            {
                // Detect game engines
                analysis.DetectedEngines = await DetectGameEngineAsync(executablePath);

                // Analyze directory structure
                var directory = Path.GetDirectoryName(executablePath)!;
                analysis.ConfigurationFiles = await FindConfigurationFilesAsync(directory);

                // Detect patterns based on files and structure
                analysis.DetectedPatterns = await DetectCommonPatternsAsync(directory, executablePath);

                // Suggest ports based on detected patterns
                analysis.SuggestedPorts = SuggestPortsFromPatterns(analysis.DetectedPatterns);

                // Generate server name suggestion
                analysis.SuggestedServerName = GenerateServerNameSuggestion(executablePath, analysis.DetectedEngines);

                // Calculate confidence score
                analysis.ConfidenceScore = CalculateConfidenceScore(analysis);

                return analysis;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing game pattern: {ExecutablePath}", executablePath);
                analysis.DetectedPatterns.Add(new DetectedPattern
                {
                    PatternType = "error",
                    Description = "Analysis failed",
                    Value = ex.Message,
                    Confidence = 0
                });
                return analysis;
            }
        }

        public async Task<List<DetectedGameEngine>> DetectGameEngineAsync(string executablePath)
        {
            var engines = new List<DetectedGameEngine>();

            try
            {
                var directory = Path.GetDirectoryName(executablePath)!;
                var files = Directory.GetFiles(directory, "*", SearchOption.AllDirectories);

                // Unity Engine Detection
                var unityIndicators = files.Where(f => 
                    f.Contains("UnityEngine") || 
                    f.EndsWith("_Data", StringComparison.OrdinalIgnoreCase) ||
                    Path.GetFileName(f).Equals("unity", StringComparison.OrdinalIgnoreCase)).ToList();

                if (unityIndicators.Any())
                {
                    engines.Add(new DetectedGameEngine
                    {
                        Name = "Unity",
                        Version = await DetectUnityVersionAsync(directory),
                        Confidence = 0.9f,
                        IndicatorFiles = unityIndicators.Take(5).ToList(),
                        EngineSpecificData = new Dictionary<string, object>
                        {
                            { "dataFolder", unityIndicators.FirstOrDefault(f => f.EndsWith("_Data")) ?? "" },
                            { "hasUnityPlayer", files.Any(f => f.Contains("UnityPlayer")) }
                        }
                    });
                }

                // Unreal Engine Detection
                var unrealIndicators = files.Where(f => 
                    f.Contains("Unreal") || 
                    f.EndsWith(".pak", StringComparison.OrdinalIgnoreCase) ||
                    f.Contains("Engine") && f.Contains("Binaries")).ToList();

                if (unrealIndicators.Any())
                {
                    engines.Add(new DetectedGameEngine
                    {
                        Name = "Unreal Engine",
                        Version = await DetectUnrealVersionAsync(directory),
                        Confidence = 0.85f,
                        IndicatorFiles = unrealIndicators.Take(5).ToList(),
                        EngineSpecificData = new Dictionary<string, object>
                        {
                            { "hasPakFiles", files.Any(f => f.EndsWith(".pak")) },
                            { "enginePath", unrealIndicators.FirstOrDefault(f => f.Contains("Engine")) ?? "" }
                        }
                    });
                }

                // Minecraft Server Detection
                if (Path.GetFileName(executablePath).Contains("minecraft", StringComparison.OrdinalIgnoreCase) ||
                    files.Any(f => Path.GetFileName(f).Contains("minecraft", StringComparison.OrdinalIgnoreCase)))
                {
                    engines.Add(new DetectedGameEngine
                    {
                        Name = "Minecraft",
                        Version = await DetectMinecraftVersionAsync(directory),
                        Confidence = 0.95f,
                        IndicatorFiles = files.Where(f => f.Contains("minecraft")).Take(3).ToList(),
                        EngineSpecificData = new Dictionary<string, object>
                        {
                            { "serverType", DetectMinecraftServerType(files) },
                            { "hasProperties", files.Any(f => f.EndsWith("server.properties")) }
                        }
                    });
                }

                // Generic patterns if no specific engine detected
                if (!engines.Any())
                {
                    engines.Add(new DetectedGameEngine
                    {
                        Name = "Custom",
                        Version = "Unknown",
                        Confidence = 0.3f,
                        IndicatorFiles = new List<string> { executablePath },
                        EngineSpecificData = new Dictionary<string, object>
                        {
                            { "executableType", Path.GetExtension(executablePath) },
                            { "directoryFileCount", files.Length }
                        }
                    });
                }

                return engines;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting game engine: {ExecutablePath}", executablePath);
                return engines;
            }
        }

        public async Task<ServerConfiguration> SuggestConfigurationAsync(GamePatternAnalysis analysis)
        {
            var config = new ServerConfiguration
            {
                ExecutablePath = analysis.ExecutablePath,
                WorkingDirectory = Path.GetDirectoryName(analysis.ExecutablePath)!,
                ServerName = analysis.SuggestedServerName ?? "Custom Game Server",
                RequiredPorts = analysis.SuggestedPorts
            };

            // Engine-specific configuration
            var primaryEngine = analysis.DetectedEngines.OrderByDescending(e => e.Confidence).FirstOrDefault();
            if (primaryEngine != null)
            {
                config.GameEngine = primaryEngine.Name;
                config = await ApplyEngineSpecificConfigurationAsync(config, primaryEngine, analysis);
            }

            // Apply pattern-based configuration
            foreach (var pattern in analysis.DetectedPatterns)
            {
                config = ApplyPatternConfiguration(config, pattern);
            }

            // Set configuration options from detected files
            foreach (var configFile in analysis.ConfigurationFiles)
            {
                config.ConfigurationOptions.AddRange(configFile.SuggestedOptions);
            }

            return config;
        }

        // Additional helper methods would be implemented here...
        // For brevity, I'll include key methods

        private bool ContainsMaliciousFilename(string filename)
        {
            var dangerousPatterns = new[] { "..", "\\", "/", ":", "*", "?", "\"", "<", ">", "|" };
            return dangerousPatterns.Any(pattern => filename.Contains(pattern));
        }

        private bool HasValidExecutableSignature(byte[] buffer)
        {
            // Check for PE signature (Windows executables)
            if (buffer.Length >= 2 && buffer[0] == 0x4D && buffer[1] == 0x5A) // MZ header
            {
                return true;
            }
            return false;
        }

        private async Task<string> CalculateFileHashAsync(string filePath)
        {
            using var sha256 = SHA256.Create();
            using var stream = File.OpenRead(filePath);
            var hash = await sha256.ComputeHashAsync(stream);
            return Convert.ToHexString(hash);
        }

        private async Task<bool> ValidateWindowsExecutableAsync(string filePath)
        {
            try
            {
                using var fileStream = File.OpenRead(filePath);
                var buffer = new byte[2];
                await fileStream.ReadAsync(buffer, 0, 2);
                return buffer[0] == 0x4D && buffer[1] == 0x5A; // MZ signature
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> ValidateJavaJarAsync(string filePath)
        {
            try
            {
                using var fileStream = File.OpenRead(filePath);
                var buffer = new byte[4];
                await fileStream.ReadAsync(buffer, 0, 4);
                return buffer[0] == 0x50 && buffer[1] == 0x4B; // PK signature (ZIP format)
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> ValidateShellScriptAsync(string filePath)
        {
            try
            {
                var firstLine = await File.ReadAllLinesAsync(filePath).ContinueWith(t => t.Result.FirstOrDefault());
                return firstLine?.StartsWith("#!") == true;
            }
            catch
            {
                return false;
            }
        }

        private async Task<bool> ValidatePythonScriptAsync(string filePath)
        {
            try
            {
                var content = await File.ReadAllTextAsync(filePath);
                return content.Contains("import ") || content.Contains("from ") || content.Contains("def ");
            }
            catch
            {
                return false;
            }
        }

        // Placeholder implementations for remaining interface methods
        public async Task<CustomGameConfiguration> CreateConfigurationAsync(CustomGameConfigurationRequest request, Guid userId)
        {
            // Implementation would create and save configuration to database
            throw new NotImplementedException();
        }

        public async Task<CustomGameConfiguration?> GetConfigurationAsync(Guid configurationId)
        {
            // Implementation would retrieve configuration from database
            throw new NotImplementedException();
        }

        public async Task<List<CustomGameConfiguration>> GetUserConfigurationsAsync(Guid userId)
        {
            // Implementation would retrieve user's configurations from database
            throw new NotImplementedException();
        }

        public async Task<CustomGameConfiguration> UpdateConfigurationAsync(Guid configurationId, CustomGameConfigurationRequest request, Guid userId)
        {
            // Implementation would update configuration in database
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteConfigurationAsync(Guid configurationId, Guid userId)
        {
            // Implementation would delete configuration from database
            throw new NotImplementedException();
        }

        public async Task<GameTemplate> CreateTemplateAsync(CreateTemplateRequest request, Guid userId)
        {
            // Implementation would create template from configuration
            throw new NotImplementedException();
        }

        public async Task<GameTemplate?> GetTemplateAsync(Guid templateId)
        {
            // Implementation would retrieve template from database
            throw new NotImplementedException();
        }

        public async Task<List<GameTemplate>> SearchTemplatesAsync(string? query, string? gameEngine, int page = 1, int pageSize = 20)
        {
            // Implementation would search templates
            throw new NotImplementedException();
        }

        public async Task<List<GameTemplate>> GetPopularTemplatesAsync(int limit = 10)
        {
            // Implementation would get popular templates
            throw new NotImplementedException();
        }

        public async Task<List<GameTemplate>> GetUserTemplatesAsync(Guid userId)
        {
            // Implementation would get user's templates
            throw new NotImplementedException();
        }

        public async Task<bool> DeleteTemplateAsync(Guid templateId, Guid userId)
        {
            // Implementation would delete template
            throw new NotImplementedException();
        }

        public async Task<CommunityGameProfile> CreateCommunityProfileAsync(CreateCommunityProfileRequest request, Guid userId)
        {
            // Implementation would create community profile
            throw new NotImplementedException();
        }

        public async Task<CommunityGameProfile?> GetCommunityProfileAsync(Guid profileId)
        {
            // Implementation would retrieve community profile
            throw new NotImplementedException();
        }

        public async Task<List<CommunityGameProfile>> SearchCommunityProfilesAsync(string? query, string? category, int page = 1, int pageSize = 20)
        {
            // Implementation would search community profiles
            throw new NotImplementedException();
        }

        public async Task<CommunityGameProfile> UpdateCommunityProfileAsync(Guid profileId, UpdateCommunityProfileRequest request, Guid userId)
        {
            // Implementation would update community profile
            throw new NotImplementedException();
        }

        public async Task<bool> VoteCommunityProfileAsync(Guid profileId, Guid userId, bool isUpvote)
        {
            // Implementation would handle voting
            throw new NotImplementedException();
        }

        public async Task<CustomGameConfiguration> ApplyTemplateAsync(Guid templateId, ApplyTemplateRequest request, Guid userId)
        {
            // Implementation would apply template to create configuration
            throw new NotImplementedException();
        }

        public async Task<CustomGameConfiguration> ApplyCommunityProfileAsync(Guid profileId, ApplyTemplateRequest request, Guid userId)
        {
            // Implementation would apply community profile
            throw new NotImplementedException();
        }

        public async Task<CustomServerDeployment> DeployCustomServerAsync(Guid configurationId, CustomServerDeploymentRequest request, Guid userId)
        {
            // Implementation would deploy custom server
            throw new NotImplementedException();
        }

        public async Task<CustomServerStatus> GetCustomServerStatusAsync(Guid deploymentId)
        {
            // Implementation would get server status
            throw new NotImplementedException();
        }

        // Helper method implementations
        private async Task<List<ConfigurationFile>> FindConfigurationFilesAsync(string directory)
        {
            var configFiles = new List<ConfigurationFile>();
            
            try
            {
                var commonConfigExtensions = new[] { ".ini", ".cfg", ".conf", ".json", ".xml", ".yaml", ".yml", ".properties", ".toml" };
                var files = Directory.GetFiles(directory, "*", SearchOption.TopDirectoryOnly)
                    .Where(f => commonConfigExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
                    .ToList();

                foreach (var file in files)
                {
                    var configFile = new ConfigurationFile
                    {
                        FilePath = file,
                        FileType = Path.GetExtension(file).TrimStart('.').ToLowerInvariant()
                    };

                    // Parse common configuration formats
                    try
                    {
                        switch (configFile.FileType)
                        {
                            case "json":
                                var jsonContent = await File.ReadAllTextAsync(file);
                                configFile.ParsedContent = JsonSerializer.Deserialize<Dictionary<string, object>>(jsonContent) ?? new();
                                break;
                            case "properties":
                                configFile.ParsedContent = await ParsePropertiesFileAsync(file);
                                break;
                            // Add more parsers as needed
                        }

                        configFile.SuggestedOptions = GenerateConfigurationOptions(configFile.ParsedContent);
                        configFiles.Add(configFile);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse configuration file: {FilePath}", file);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding configuration files in directory: {Directory}", directory);
            }

            return configFiles;
        }

        private async Task<List<DetectedPattern>> DetectCommonPatternsAsync(string directory, string executablePath)
        {
            var patterns = new List<DetectedPattern>();

            // Port detection patterns
            var portPatterns = await DetectPortPatternsAsync(directory);
            patterns.AddRange(portPatterns);

            // Command line patterns
            var cmdPatterns = DetectCommandLinePatterns(executablePath);
            patterns.AddRange(cmdPatterns);

            return patterns;
        }

        private List<int> SuggestPortsFromPatterns(List<DetectedPattern> patterns)
        {
            var ports = new List<int>();
            
            foreach (var pattern in patterns.Where(p => p.PatternType == "port_usage"))
            {
                if (int.TryParse(pattern.Value, out var port))
                {
                    ports.Add(port);
                }
            }

            // Default ports if none detected
            if (!ports.Any())
            {
                ports.AddRange(new[] { 7777, 7778 }); // Common game server ports
            }

            return ports.Distinct().ToList();
        }

        private string GenerateServerNameSuggestion(string executablePath, List<DetectedGameEngine> engines)
        {
            var baseName = Path.GetFileNameWithoutExtension(executablePath);
            var engine = engines.OrderByDescending(e => e.Confidence).FirstOrDefault();
            
            if (engine != null && engine.Name != "Custom")
            {
                return $"{baseName} {engine.Name} Server";
            }
            
            return $"{baseName} Server";
        }

        private float CalculateConfidenceScore(GamePatternAnalysis analysis)
        {
            var totalConfidence = 0f;
            var factors = 0;

            if (analysis.DetectedEngines.Any())
            {
                totalConfidence += analysis.DetectedEngines.Max(e => e.Confidence);
                factors++;
            }

            if (analysis.ConfigurationFiles.Any())
            {
                totalConfidence += 0.3f;
                factors++;
            }

            if (analysis.DetectedPatterns.Any())
            {
                totalConfidence += analysis.DetectedPatterns.Average(p => p.Confidence);
                factors++;
            }

            return factors > 0 ? totalConfidence / factors : 0f;
        }

        private async Task<string> DetectUnityVersionAsync(string directory)
        {
            // Implementation to detect Unity version from files
            return "Unknown";
        }

        private async Task<string> DetectUnrealVersionAsync(string directory)
        {
            // Implementation to detect Unreal version from files
            return "Unknown";
        }

        private async Task<string> DetectMinecraftVersionAsync(string directory)
        {
            // Implementation to detect Minecraft version from jar files
            return "Unknown";
        }

        private string DetectMinecraftServerType(string[] files)
        {
            if (files.Any(f => f.Contains("forge", StringComparison.OrdinalIgnoreCase)))
                return "Forge";
            if (files.Any(f => f.Contains("fabric", StringComparison.OrdinalIgnoreCase)))
                return "Fabric";
            if (files.Any(f => f.Contains("bukkit", StringComparison.OrdinalIgnoreCase)))
                return "Bukkit";
            if (files.Any(f => f.Contains("spigot", StringComparison.OrdinalIgnoreCase)))
                return "Spigot";
            if (files.Any(f => f.Contains("paper", StringComparison.OrdinalIgnoreCase)))
                return "Paper";
            
            return "Vanilla";
        }

        private async Task<ServerConfiguration> ApplyEngineSpecificConfigurationAsync(
            ServerConfiguration config, 
            DetectedGameEngine engine, 
            GamePatternAnalysis analysis)
        {
            switch (engine.Name.ToLowerInvariant())
            {
                case "unity":
                    config.CommandLineArguments = "-batchmode -nographics";
                    config.MaxPlayers = 10;
                    break;
                case "unreal engine":
                    config.CommandLineArguments = "-server -log";
                    config.MaxPlayers = 64;
                    break;
                case "minecraft":
                    config.CommandLineArguments = "-Xmx2G -Xms1G -jar";
                    config.MaxPlayers = 20;
                    config.RequiredPorts = new List<int> { 25565 };
                    break;
            }

            return config;
        }

        private ServerConfiguration ApplyPatternConfiguration(ServerConfiguration config, DetectedPattern pattern)
        {
            switch (pattern.PatternType)
            {
                case "port_usage":
                    if (int.TryParse(pattern.Value, out var port) && !config.RequiredPorts.Contains(port))
                    {
                        config.RequiredPorts.Add(port);
                    }
                    break;
                case "command_line":
                    if (string.IsNullOrEmpty(config.CommandLineArguments))
                    {
                        config.CommandLineArguments = pattern.Value;
                    }
                    break;
            }

            return config;
        }

        private List<ConfigurationOption> GenerateConfigurationOptions(Dictionary<string, object> parsedContent)
        {
            var options = new List<ConfigurationOption>();

            foreach (var kvp in parsedContent)
            {
                var option = new ConfigurationOption
                {
                    Key = kvp.Key,
                    Name = FormatOptionName(kvp.Key),
                    Type = DetermineOptionType(kvp.Value),
                    DefaultValue = kvp.Value,
                    CurrentValue = kvp.Value,
                    Description = GenerateOptionDescription(kvp.Key, kvp.Value)
                };

                options.Add(option);
            }

            return options;
        }

        private async Task<Dictionary<string, object>> ParsePropertiesFileAsync(string filePath)
        {
            var properties = new Dictionary<string, object>();
            var lines = await File.ReadAllLinesAsync(filePath);

            foreach (var line in lines)
            {
                if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#"))
                    continue;

                var parts = line.Split('=', 2);
                if (parts.Length == 2)
                {
                    properties[parts[0].Trim()] = parts[1].Trim();
                }
            }

            return properties;
        }

        private async Task<List<DetectedPattern>> DetectPortPatternsAsync(string directory)
        {
            var patterns = new List<DetectedPattern>();
            
            try
            {
                var configFiles = Directory.GetFiles(directory, "*", SearchOption.TopDirectoryOnly)
                    .Where(f => new[] { ".ini", ".cfg", ".conf", ".properties" }.Contains(Path.GetExtension(f).ToLowerInvariant()));

                foreach (var file in configFiles)
                {
                    var content = await File.ReadAllTextAsync(file);
                    var portMatches = Regex.Matches(content, @"port\s*[=:]\s*(\d+)", RegexOptions.IgnoreCase);

                    foreach (Match match in portMatches)
                    {
                        patterns.Add(new DetectedPattern
                        {
                            PatternType = "port_usage",
                            Description = $"Port found in {Path.GetFileName(file)}",
                            Value = match.Groups[1].Value,
                            Confidence = 0.8f
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting port patterns in directory: {Directory}", directory);
            }

            return patterns;
        }

        private List<DetectedPattern> DetectCommandLinePatterns(string executablePath)
        {
            var patterns = new List<DetectedPattern>();
            var fileName = Path.GetFileNameWithoutExtension(executablePath).ToLowerInvariant();

            // Common server patterns
            if (fileName.Contains("server"))
            {
                patterns.Add(new DetectedPattern
                {
                    PatternType = "server_type",
                    Description = "Dedicated server executable detected",
                    Value = "dedicated_server",
                    Confidence = 0.9f
                });
            }

            return patterns;
        }

        private string FormatOptionName(string key)
        {
            return key.Replace("-", " ").Replace("_", " ").ToTitleCase();
        }

        private string DetermineOptionType(object value)
        {
            return value switch
            {
                bool => "boolean",
                int => "integer",
                long => "integer",
                float => "float",
                double => "float",
                _ => "string"
            };
        }

        private string GenerateOptionDescription(string key, object value)
        {
            var keyLower = key.ToLowerInvariant();
            
            if (keyLower.Contains("port"))
                return "Network port for server communication";
            if (keyLower.Contains("max") && keyLower.Contains("player"))
                return "Maximum number of players allowed";
            if (keyLower.Contains("password"))
                return "Server password for access control";
            if (keyLower.Contains("name"))
                return "Display name for the server";
            
            return $"Configuration option: {key}";
        }
    }

    // Extension method for string formatting
    public static class StringExtensions
    {
        public static string ToTitleCase(this string input)
        {
            return System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(input.ToLower());
        }
    }
}