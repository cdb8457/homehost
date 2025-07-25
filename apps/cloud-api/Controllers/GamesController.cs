using HomeHost.CloudApi.Data;
using HomeHost.CloudApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly HomeHostContext _context;
        private readonly ILogger<GamesController> _logger;

        public GamesController(HomeHostContext context, ILogger<GamesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GameResponse>>> GetGames(
            [FromQuery] string? search = null,
            [FromQuery] string? genre = null,
            [FromQuery] int? minPlayers = null,
            [FromQuery] int? maxPlayers = null,
            [FromQuery] string? difficulty = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.Games.AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(g => g.Name.Contains(search) || g.Description.Contains(search));
                }

                if (!string.IsNullOrEmpty(genre))
                {
                    query = query.Where(g => g.Genre.ToLower() == genre.ToLower());
                }

                if (minPlayers.HasValue)
                {
                    query = query.Where(g => g.MinPlayers >= minPlayers.Value);
                }

                if (maxPlayers.HasValue)
                {
                    query = query.Where(g => g.MaxPlayers <= maxPlayers.Value);
                }

                if (!string.IsNullOrEmpty(difficulty))
                {
                    query = query.Where(g => g.DeploymentDifficulty.ToLower() == difficulty.ToLower());
                }

                // Apply pagination
                var totalCount = await query.CountAsync();
                var games = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(g => new GameResponse
                    {
                        Id = g.Id,
                        Name = g.Name,
                        Description = g.Description,
                        Genre = g.Genre,
                        ImageUrl = g.ImageUrl,
                        BannerUrl = g.BannerUrl,
                        MinPlayers = g.MinPlayers,
                        MaxPlayers = g.MaxPlayers,
                        DeploymentDifficulty = g.DeploymentDifficulty,
                        EstimatedSetupTime = g.EstimatedSetupTime,
                        PopularityScore = g.PopularityScore,
                        IsEarlyAccess = g.IsEarlyAccess,
                        SteamAppId = g.SteamAppId,
                        SupportedPlatforms = g.SupportedPlatforms,
                        RequiredPorts = g.RequiredPorts,
                        SystemRequirements = g.SystemRequirements,
                        CommunityServerCount = GetCommunityServerCount(g.Id),
                        RecentActivity = GetRecentActivity(g.Id),
                        Tags = g.Tags,
                        Features = g.Features,
                        CreatedAt = g.CreatedAt,
                        UpdatedAt = g.UpdatedAt
                    })
                    .ToListAsync();

                var response = new
                {
                    games,
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving games");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GameDetailResponse>> GetGame(Guid id)
        {
            try
            {
                var game = await _context.Games
                    .FirstOrDefaultAsync(g => g.Id == id);

                if (game == null)
                {
                    return NotFound();
                }

                var gameDetail = new GameDetailResponse
                {
                    Id = game.Id,
                    Name = game.Name,
                    Description = game.Description,
                    Genre = game.Genre,
                    ImageUrl = game.ImageUrl,
                    BannerUrl = game.BannerUrl,
                    MinPlayers = game.MinPlayers,
                    MaxPlayers = game.MaxPlayers,
                    DeploymentDifficulty = game.DeploymentDifficulty,
                    EstimatedSetupTime = game.EstimatedSetupTime,
                    PopularityScore = game.PopularityScore,
                    IsEarlyAccess = game.IsEarlyAccess,
                    SteamAppId = game.SteamAppId,
                    SupportedPlatforms = game.SupportedPlatforms,
                    RequiredPorts = game.RequiredPorts,
                    SystemRequirements = game.SystemRequirements,
                    CommunityServerCount = GetCommunityServerCount(game.Id),
                    RecentActivity = GetRecentActivity(game.Id),
                    Tags = game.Tags,
                    Features = game.Features,
                    CreatedAt = game.CreatedAt,
                    UpdatedAt = game.UpdatedAt,
                    // Additional detail fields
                    InstallationGuide = game.InstallationGuide,
                    ConfigurationOptions = game.ConfigurationOptions,
                    CompatiblePlugins = await GetCompatiblePlugins(game.Id),
                    CommunityServers = await GetCommunityServers(game.Id),
                    Reviews = await GetGameReviews(game.Id)
                };

                return Ok(gameDetail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving game {GameId}", id);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("{id}/deploy")]
        [Authorize]
        public async Task<ActionResult<DeploymentResponse>> DeployGame(Guid id, [FromBody] DeploymentRequest request)
        {
            try
            {
                var game = await _context.Games.FindAsync(id);
                if (game == null)
                {
                    return NotFound();
                }

                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                // Create new game server
                var gameServer = new GameServer
                {
                    Id = Guid.NewGuid(),
                    Name = request.ServerName,
                    Description = request.Description,
                    GameId = game.Id.ToString(),
                    Version = game.Version ?? "latest",
                    Status = ServerStatus.Starting,
                    Port = await GetAvailablePort(),
                    MaxPlayers = request.MaxPlayers ?? game.MaxPlayers,
                    CurrentPlayers = 0,
                    IsPublic = request.IsPublic,
                    Password = request.Password,
                    OwnerId = userId,
                    CommunityId = request.CommunityId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.GameServers.Add(gameServer);
                await _context.SaveChangesAsync();

                // Start deployment process (this would integrate with actual deployment service)
                _ = Task.Run(async () => await ProcessDeploymentAsync(gameServer.Id));

                var response = new DeploymentResponse
                {
                    ServerId = gameServer.Id,
                    Status = "starting",
                    Message = "Deployment initiated successfully",
                    EstimatedCompletionTime = DateTime.UtcNow.AddMinutes(game.EstimatedSetupTime),
                    ProgressUrl = $"/api/servers/{gameServer.Id}/status"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deploying game {GameId}", id);
                return StatusCode(500, new { error = "Deployment failed" });
            }
        }

        [HttpGet("popular")]
        public async Task<ActionResult<IEnumerable<GameResponse>>> GetPopularGames(int limit = 10)
        {
            try
            {
                var games = await _context.Games
                    .OrderByDescending(g => g.PopularityScore)
                    .Take(limit)
                    .Select(g => new GameResponse
                    {
                        Id = g.Id,
                        Name = g.Name,
                        Description = g.Description,
                        Genre = g.Genre,
                        ImageUrl = g.ImageUrl,
                        BannerUrl = g.BannerUrl,
                        MinPlayers = g.MinPlayers,
                        MaxPlayers = g.MaxPlayers,
                        DeploymentDifficulty = g.DeploymentDifficulty,
                        EstimatedSetupTime = g.EstimatedSetupTime,
                        PopularityScore = g.PopularityScore,
                        IsEarlyAccess = g.IsEarlyAccess,
                        SteamAppId = g.SteamAppId,
                        CommunityServerCount = GetCommunityServerCount(g.Id),
                        RecentActivity = GetRecentActivity(g.Id),
                        Tags = g.Tags,
                        Features = g.Features
                    })
                    .ToListAsync();

                return Ok(games);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving popular games");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("genres")]
        public async Task<ActionResult<IEnumerable<string>>> GetGenres()
        {
            try
            {
                var genres = await _context.Games
                    .Select(g => g.Genre)
                    .Distinct()
                    .OrderBy(g => g)
                    .ToListAsync();

                return Ok(genres);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving genres");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        // Helper methods
        private int GetCommunityServerCount(Guid gameId)
        {
            return _context.GameServers
                .Count(s => s.GameId == gameId.ToString() && s.IsPublic);
        }

        private string GetRecentActivity(Guid gameId)
        {
            var recentServers = _context.GameServers
                .Where(s => s.GameId == gameId.ToString())
                .OrderByDescending(s => s.CreatedAt)
                .Take(3)
                .Count();

            return recentServers switch
            {
                0 => "No recent activity",
                1 => "1 server deployed recently",
                _ => $"{recentServers} servers deployed recently"
            };
        }

        private async Task<int> GetAvailablePort()
        {
            var usedPorts = await _context.GameServers
                .Where(s => s.Status == ServerStatus.Running || s.Status == ServerStatus.Starting)
                .Select(s => s.Port)
                .ToListAsync();

            // Simple port allocation - in production, this would be more sophisticated
            for (int port = 7000; port < 8000; port++)
            {
                if (!usedPorts.Contains(port))
                {
                    return port;
                }
            }

            return 7000; // Fallback
        }

        private async Task ProcessDeploymentAsync(Guid serverId)
        {
            // This would integrate with actual deployment service
            // For now, simulate deployment process
            await Task.Delay(5000); // Simulate setup time

            var server = await _context.GameServers.FindAsync(serverId);
            if (server != null)
            {
                server.Status = ServerStatus.Running;
                server.LastStartedAt = DateTime.UtcNow;
                server.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        private async Task<List<PluginResponse>> GetCompatiblePlugins(Guid gameId)
        {
            return await _context.Plugins
                .Where(p => p.SupportedGames.Contains(gameId.ToString()))
                .Take(10)
                .Select(p => new PluginResponse
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Version = p.Version,
                    Category = p.Category,
                    Rating = p.Rating,
                    DownloadCount = p.DownloadCount,
                    Price = p.Price,
                    IsVerified = p.IsVerified
                })
                .ToListAsync();
        }

        private async Task<List<CommunityServerResponse>> GetCommunityServers(Guid gameId)
        {
            return await _context.GameServers
                .Where(s => s.GameId == gameId.ToString() && s.IsPublic)
                .Take(5)
                .Select(s => new CommunityServerResponse
                {
                    Id = s.Id,
                    Name = s.Name,
                    Description = s.Description,
                    CurrentPlayers = s.CurrentPlayers,
                    MaxPlayers = s.MaxPlayers,
                    Status = s.Status.ToString(),
                    OwnerName = s.Owner.DisplayName
                })
                .ToListAsync();
        }

        private async Task<List<GameReviewResponse>> GetGameReviews(Guid gameId)
        {
            // This would come from a reviews table in production
            return new List<GameReviewResponse>();
        }
    }
}