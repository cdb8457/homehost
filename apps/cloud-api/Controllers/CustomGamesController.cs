using HomeHost.CloudApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/custom-games")]
    [Authorize]
    public class CustomGamesController : ControllerBase
    {
        private readonly ICustomGameService _customGameService;
        private readonly ILogger<CustomGamesController> _logger;

        public CustomGamesController(
            ICustomGameService customGameService,
            ILogger<CustomGamesController> logger)
        {
            _customGameService = customGameService;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<ActionResult<FileUploadResponse>> UploadCustomGame(IFormFile file, [FromForm] string? tempPath = null)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { error = "No file provided" });
                }

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var result = await _customGameService.UploadCustomGameAsync(
                    file, 
                    userId, 
                    tempPath ?? Path.GetTempPath()
                );

                var response = new FileUploadResponse
                {
                    Success = result.Success,
                    Message = result.Message,
                    FilePath = result.FilePath,
                    FileSize = result.FileSize,
                    FileName = result.FileName,
                    FileHash = result.FileHash,
                    Warnings = result.Warnings,
                    Errors = result.Errors,
                    Metadata = result.Metadata
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading custom game file");
                return StatusCode(500, new { error = "Upload failed" });
            }
        }

        [HttpPost("validate")]
        public async Task<ActionResult<ValidationResponse>> ValidateExecutable(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { error = "No file provided" });
                }

                var result = await _customGameService.ValidateExecutableAsync(file);

                var response = new ValidationResponse
                {
                    IsValid = result.Success,
                    Message = result.Message,
                    Warnings = result.Warnings,
                    Errors = result.Errors
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating executable file");
                return StatusCode(500, new { error = "Validation failed" });
            }
        }

        [HttpPost("analyze")]
        public async Task<ActionResult<GamePatternAnalysisResponse>> AnalyzeGame([FromBody] AnalyzeGameRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var analysis = await _customGameService.AnalyzeGamePatternAsync(request.ExecutablePath);

                var response = new GamePatternAnalysisResponse
                {
                    ExecutablePath = analysis.ExecutablePath,
                    DetectedEngines = analysis.DetectedEngines.Select(e => new DetectedGameEngineResponse
                    {
                        Name = e.Name,
                        Version = e.Version,
                        Confidence = e.Confidence,
                        IndicatorFiles = e.IndicatorFiles,
                        EngineSpecificData = e.EngineSpecificData
                    }).ToList(),
                    DetectedPatterns = analysis.DetectedPatterns.Select(p => new DetectedPatternResponse
                    {
                        PatternType = p.PatternType,
                        Description = p.Description,
                        Value = p.Value,
                        Confidence = p.Confidence
                    }).ToList(),
                    ConfigurationFiles = analysis.ConfigurationFiles.Select(f => new ConfigurationFileResponse
                    {
                        FilePath = f.FilePath,
                        FileType = f.FileType,
                        ParsedContent = f.ParsedContent,
                        SuggestedOptions = f.SuggestedOptions.Select(o => new ConfigurationOptionResponse
                        {
                            Key = o.Key,
                            Name = o.Name,
                            Description = o.Description,
                            Type = o.Type,
                            DefaultValue = o.DefaultValue,
                            CurrentValue = o.CurrentValue,
                            IsRequired = o.IsRequired,
                            ValidationRules = o.ValidationRules
                        }).ToList()
                    }).ToList(),
                    SuggestedPorts = analysis.SuggestedPorts,
                    SuggestedServerName = analysis.SuggestedServerName,
                    EngineMetadata = analysis.EngineMetadata,
                    ConfidenceScore = analysis.ConfidenceScore
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing game pattern for {ExecutablePath}", request.ExecutablePath);
                return StatusCode(500, new { error = "Analysis failed" });
            }
        }

        [HttpPost("suggest-configuration")]
        public async Task<ActionResult<ServerConfigurationResponse>> SuggestConfiguration([FromBody] SuggestConfigurationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Convert request analysis to service model
                var analysis = new GamePatternAnalysis
                {
                    ExecutablePath = request.Analysis.ExecutablePath,
                    DetectedEngines = request.Analysis.DetectedEngines.Select(e => new DetectedGameEngine
                    {
                        Name = e.Name,
                        Version = e.Version,
                        Confidence = e.Confidence,
                        IndicatorFiles = e.IndicatorFiles,
                        EngineSpecificData = e.EngineSpecificData
                    }).ToList(),
                    DetectedPatterns = request.Analysis.DetectedPatterns.Select(p => new DetectedPattern
                    {
                        PatternType = p.PatternType,
                        Description = p.Description,
                        Value = p.Value,
                        Confidence = p.Confidence
                    }).ToList(),
                    ConfigurationFiles = request.Analysis.ConfigurationFiles.Select(f => new ConfigurationFile
                    {
                        FilePath = f.FilePath,
                        FileType = f.FileType,
                        ParsedContent = f.ParsedContent,
                        SuggestedOptions = f.SuggestedOptions.Select(o => new ConfigurationOption
                        {
                            Key = o.Key,
                            Name = o.Name,
                            Description = o.Description,
                            Type = o.Type,
                            DefaultValue = o.DefaultValue,
                            CurrentValue = o.CurrentValue,
                            IsRequired = o.IsRequired,
                            ValidationRules = o.ValidationRules
                        }).ToList()
                    }).ToList(),
                    SuggestedPorts = request.Analysis.SuggestedPorts,
                    SuggestedServerName = request.Analysis.SuggestedServerName,
                    EngineMetadata = request.Analysis.EngineMetadata,
                    ConfidenceScore = request.Analysis.ConfidenceScore
                };

                var configuration = await _customGameService.SuggestConfigurationAsync(analysis);

                var response = new ServerConfigurationResponse
                {
                    ServerName = configuration.ServerName,
                    ExecutablePath = configuration.ExecutablePath,
                    WorkingDirectory = configuration.WorkingDirectory,
                    CommandLineArguments = configuration.CommandLineArguments,
                    RequiredPorts = configuration.RequiredPorts,
                    EnvironmentVariables = configuration.EnvironmentVariables,
                    ConfigurationOptions = configuration.ConfigurationOptions.Select(o => new ConfigurationOptionResponse
                    {
                        Key = o.Key,
                        Name = o.Name,
                        Description = o.Description,
                        Type = o.Type,
                        DefaultValue = o.DefaultValue,
                        CurrentValue = o.CurrentValue,
                        IsRequired = o.IsRequired,
                        ValidationRules = o.ValidationRules
                    }).ToList(),
                    ConfigurationFilePath = configuration.ConfigurationFilePath,
                    LogFilePath = configuration.LogFilePath,
                    MaxPlayers = configuration.MaxPlayers,
                    GameEngine = configuration.GameEngine
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suggesting configuration");
                return StatusCode(500, new { error = "Configuration suggestion failed" });
            }
        }

        [HttpPost("configurations")]
        public async Task<ActionResult<CustomGameConfigurationResponse>> CreateConfiguration([FromBody] CreateCustomGameConfigurationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var serviceRequest = new CustomGameConfigurationRequest
                {
                    Name = request.Name,
                    Description = request.Description,
                    ExecutablePath = request.ExecutablePath,
                    Configuration = new ServerConfiguration
                    {
                        ServerName = request.Configuration.ServerName,
                        ExecutablePath = request.Configuration.ExecutablePath,
                        WorkingDirectory = request.Configuration.WorkingDirectory,
                        CommandLineArguments = request.Configuration.CommandLineArguments,
                        RequiredPorts = request.Configuration.RequiredPorts,
                        EnvironmentVariables = request.Configuration.EnvironmentVariables,
                        ConfigurationOptions = request.Configuration.ConfigurationOptions.Select(o => new ConfigurationOption
                        {
                            Key = o.Key,
                            Name = o.Name,
                            Description = o.Description,
                            Type = o.Type,
                            DefaultValue = o.DefaultValue,
                            CurrentValue = o.CurrentValue,
                            IsRequired = o.IsRequired,
                            ValidationRules = o.ValidationRules
                        }).ToList(),
                        ConfigurationFilePath = request.Configuration.ConfigurationFilePath,
                        LogFilePath = request.Configuration.LogFilePath,
                        MaxPlayers = request.Configuration.MaxPlayers,
                        GameEngine = request.Configuration.GameEngine
                    },
                    IsPublic = request.IsPublic,
                    Tags = request.Tags
                };

                var configuration = await _customGameService.CreateConfigurationAsync(serviceRequest, userId);

                var response = new CustomGameConfigurationResponse
                {
                    Id = configuration.Id,
                    Name = configuration.Name,
                    Description = configuration.Description,
                    UserId = configuration.UserId,
                    ExecutablePath = configuration.ExecutablePath,
                    GameEngine = configuration.GameEngine,
                    Configuration = new ServerConfigurationResponse
                    {
                        ServerName = configuration.Configuration.ServerName,
                        ExecutablePath = configuration.Configuration.ExecutablePath,
                        WorkingDirectory = configuration.Configuration.WorkingDirectory,
                        CommandLineArguments = configuration.Configuration.CommandLineArguments,
                        RequiredPorts = configuration.Configuration.RequiredPorts,
                        EnvironmentVariables = configuration.Configuration.EnvironmentVariables,
                        ConfigurationOptions = configuration.Configuration.ConfigurationOptions.Select(o => new ConfigurationOptionResponse
                        {
                            Key = o.Key,
                            Name = o.Name,
                            Description = o.Description,
                            Type = o.Type,
                            DefaultValue = o.DefaultValue,
                            CurrentValue = o.CurrentValue,
                            IsRequired = o.IsRequired,
                            ValidationRules = o.ValidationRules
                        }).ToList(),
                        ConfigurationFilePath = configuration.Configuration.ConfigurationFilePath,
                        LogFilePath = configuration.Configuration.LogFilePath,
                        MaxPlayers = configuration.Configuration.MaxPlayers,
                        GameEngine = configuration.Configuration.GameEngine
                    },
                    IsPublic = configuration.IsPublic,
                    CreatedAt = configuration.CreatedAt,
                    UpdatedAt = configuration.UpdatedAt,
                    UsageCount = configuration.UsageCount,
                    Tags = configuration.Tags
                };

                return CreatedAtAction(nameof(GetConfiguration), new { id = configuration.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating custom game configuration");
                return StatusCode(500, new { error = "Configuration creation failed" });
            }
        }

        [HttpGet("configurations/{id}")]
        public async Task<ActionResult<CustomGameConfigurationResponse>> GetConfiguration(Guid id)
        {
            try
            {
                var configuration = await _customGameService.GetConfigurationAsync(id);
                if (configuration == null)
                {
                    return NotFound();
                }

                var response = new CustomGameConfigurationResponse
                {
                    Id = configuration.Id,
                    Name = configuration.Name,
                    Description = configuration.Description,
                    UserId = configuration.UserId,
                    ExecutablePath = configuration.ExecutablePath,
                    GameEngine = configuration.GameEngine,
                    Configuration = new ServerConfigurationResponse
                    {
                        ServerName = configuration.Configuration.ServerName,
                        ExecutablePath = configuration.Configuration.ExecutablePath,
                        WorkingDirectory = configuration.Configuration.WorkingDirectory,
                        CommandLineArguments = configuration.Configuration.CommandLineArguments,
                        RequiredPorts = configuration.Configuration.RequiredPorts,
                        EnvironmentVariables = configuration.Configuration.EnvironmentVariables,
                        ConfigurationOptions = configuration.Configuration.ConfigurationOptions.Select(o => new ConfigurationOptionResponse
                        {
                            Key = o.Key,
                            Name = o.Name,
                            Description = o.Description,
                            Type = o.Type,
                            DefaultValue = o.DefaultValue,
                            CurrentValue = o.CurrentValue,
                            IsRequired = o.IsRequired,
                            ValidationRules = o.ValidationRules
                        }).ToList(),
                        ConfigurationFilePath = configuration.Configuration.ConfigurationFilePath,
                        LogFilePath = configuration.Configuration.LogFilePath,
                        MaxPlayers = configuration.Configuration.MaxPlayers,
                        GameEngine = configuration.Configuration.GameEngine
                    },
                    IsPublic = configuration.IsPublic,
                    CreatedAt = configuration.CreatedAt,
                    UpdatedAt = configuration.UpdatedAt,
                    UsageCount = configuration.UsageCount,
                    Tags = configuration.Tags
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving configuration {ConfigurationId}", id);
                return StatusCode(500, new { error = "Failed to retrieve configuration" });
            }
        }

        [HttpGet("configurations")]
        public async Task<ActionResult<List<CustomGameConfigurationResponse>>> GetUserConfigurations()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var configurations = await _customGameService.GetUserConfigurationsAsync(userId);

                var response = configurations.Select(config => new CustomGameConfigurationResponse
                {
                    Id = config.Id,
                    Name = config.Name,
                    Description = config.Description,
                    UserId = config.UserId,
                    ExecutablePath = config.ExecutablePath,
                    GameEngine = config.GameEngine,
                    IsPublic = config.IsPublic,
                    CreatedAt = config.CreatedAt,
                    UpdatedAt = config.UpdatedAt,
                    UsageCount = config.UsageCount,
                    Tags = config.Tags
                    // Note: Configuration details excluded from list view for performance
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user configurations");
                return StatusCode(500, new { error = "Failed to retrieve configurations" });
            }
        }

        // Additional endpoints would be implemented here for templates, community profiles, etc.
    }

    // Request/Response DTOs
    public class FileUploadResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public long FileSize { get; set; }
        public string? FileName { get; set; }
        public string? FileHash { get; set; }
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class ValidationResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Warnings { get; set; } = new();
        public List<string> Errors { get; set; } = new();
    }

    public class AnalyzeGameRequest
    {
        [Required]
        public string ExecutablePath { get; set; } = string.Empty;
    }

    public class GamePatternAnalysisResponse
    {
        public string ExecutablePath { get; set; } = string.Empty;
        public List<DetectedGameEngineResponse> DetectedEngines { get; set; } = new();
        public List<DetectedPatternResponse> DetectedPatterns { get; set; } = new();
        public List<ConfigurationFileResponse> ConfigurationFiles { get; set; } = new();
        public List<int> SuggestedPorts { get; set; } = new();
        public string? SuggestedServerName { get; set; }
        public Dictionary<string, object> EngineMetadata { get; set; } = new();
        public float ConfidenceScore { get; set; }
    }

    public class DetectedGameEngineResponse
    {
        public string Name { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public float Confidence { get; set; }
        public List<string> IndicatorFiles { get; set; } = new();
        public Dictionary<string, object> EngineSpecificData { get; set; } = new();
    }

    public class DetectedPatternResponse
    {
        public string PatternType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public float Confidence { get; set; }
    }

    public class ConfigurationFileResponse
    {
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public Dictionary<string, object> ParsedContent { get; set; } = new();
        public List<ConfigurationOptionResponse> SuggestedOptions { get; set; } = new();
    }

    public class ConfigurationOptionResponse
    {
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public object? DefaultValue { get; set; }
        public object? CurrentValue { get; set; }
        public bool IsRequired { get; set; }
        public Dictionary<string, object> ValidationRules { get; set; } = new();
    }

    public class SuggestConfigurationRequest
    {
        [Required]
        public GamePatternAnalysisResponse Analysis { get; set; } = new();
    }

    public class ServerConfigurationResponse
    {
        public string ServerName { get; set; } = string.Empty;
        public string ExecutablePath { get; set; } = string.Empty;
        public string WorkingDirectory { get; set; } = string.Empty;
        public string CommandLineArguments { get; set; } = string.Empty;
        public List<int> RequiredPorts { get; set; } = new();
        public Dictionary<string, string> EnvironmentVariables { get; set; } = new();
        public List<ConfigurationOptionResponse> ConfigurationOptions { get; set; } = new();
        public string? ConfigurationFilePath { get; set; }
        public string? LogFilePath { get; set; }
        public int MaxPlayers { get; set; }
        public string? GameEngine { get; set; }
    }

    public class CreateCustomGameConfigurationRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string ExecutablePath { get; set; } = string.Empty;
        
        [Required]
        public ServerConfigurationResponse Configuration { get; set; } = new();
        
        public bool IsPublic { get; set; }
        
        public List<string> Tags { get; set; } = new();
    }

    public class CustomGameConfigurationResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string ExecutablePath { get; set; } = string.Empty;
        public string? GameEngine { get; set; }
        public ServerConfigurationResponse? Configuration { get; set; }
        public bool IsPublic { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UsageCount { get; set; }
        public List<string> Tags { get; set; } = new();
    }
}