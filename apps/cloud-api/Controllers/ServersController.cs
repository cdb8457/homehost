using HomeHost.CloudApi.Data;
using HomeHost.CloudApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ServersController : ControllerBase
    {
        private readonly HomeHostContext _context;
        private readonly ILogger<ServersController> _logger;

        public ServersController(HomeHostContext context, ILogger<ServersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{id}/status")]
        public async Task<ActionResult<ServerStatusResponse>> GetServerStatus(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var server = await _context.GameServers
                    .Include(s => s.Owner)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (server == null)
                {
                    return NotFound();
                }

                // Check if user owns this server
                if (server.OwnerId != userId)
                {
                    return Forbid();
                }

                var response = new ServerStatusResponse
                {
                    Id = server.Id,
                    Name = server.Name,
                    Status = server.Status.ToString().ToLower(),
                    CurrentPlayers = server.CurrentPlayers,
                    MaxPlayers = server.MaxPlayers,
                    Port = server.Port,
                    IsPublic = server.IsPublic,
                    GameId = server.GameId,
                    CreatedAt = server.CreatedAt,
                    LastStartedAt = server.LastStartedAt,
                    Uptime = server.LastStartedAt.HasValue 
                        ? DateTime.UtcNow - server.LastStartedAt.Value 
                        : TimeSpan.Zero,
                    ConnectionInfo = server.Status == ServerStatus.Running 
                        ? new ServerConnectionInfo
                        {
                            IpAddress = "play.homehost.io", // In production, this would be dynamic
                            Port = server.Port,
                            DirectConnect = $"play.homehost.io:{server.Port}",
                            SteamConnect = !string.IsNullOrEmpty(server.Password) 
                                ? null 
                                : $"steam://connect/play.homehost.io:{server.Port}"
                        }
                        : null
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving server status for {ServerId}", id);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServerSummaryResponse>>> GetUserServers()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var servers = await _context.GameServers
                    .Where(s => s.OwnerId == userId)
                    .OrderByDescending(s => s.CreatedAt)
                    .Select(s => new ServerSummaryResponse
                    {
                        Id = s.Id,
                        Name = s.Name,
                        GameId = s.GameId,
                        Status = s.Status.ToString().ToLower(),
                        CurrentPlayers = s.CurrentPlayers,
                        MaxPlayers = s.MaxPlayers,
                        CreatedAt = s.CreatedAt,
                        LastStartedAt = s.LastStartedAt
                    })
                    .ToListAsync();

                return Ok(servers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user servers");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("{id}/start")]
        public async Task<ActionResult> StartServer(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var server = await _context.GameServers
                    .FirstOrDefaultAsync(s => s.Id == id && s.OwnerId == userId);

                if (server == null)
                {
                    return NotFound();
                }

                if (server.Status == ServerStatus.Running)
                {
                    return BadRequest(new { error = "Server is already running" });
                }

                server.Status = ServerStatus.Starting;
                server.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Start the server (would integrate with actual deployment service)
                _ = Task.Run(async () => await StartServerAsync(server.Id));

                return Ok(new { message = "Server start initiated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting server {ServerId}", id);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("{id}/stop")]
        public async Task<ActionResult> StopServer(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var server = await _context.GameServers
                    .FirstOrDefaultAsync(s => s.Id == id && s.OwnerId == userId);

                if (server == null)
                {
                    return NotFound();
                }

                if (server.Status == ServerStatus.Stopped)
                {
                    return BadRequest(new { error = "Server is already stopped" });
                }

                server.Status = ServerStatus.Stopping;
                server.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Stop the server (would integrate with actual deployment service)
                _ = Task.Run(async () => await StopServerAsync(server.Id));

                return Ok(new { message = "Server stop initiated" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping server {ServerId}", id);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteServer(Guid id)
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return Unauthorized();
                }

                var server = await _context.GameServers
                    .FirstOrDefaultAsync(s => s.Id == id && s.OwnerId == userId);

                if (server == null)
                {
                    return NotFound();
                }

                // Stop server if running
                if (server.Status == ServerStatus.Running)
                {
                    server.Status = ServerStatus.Stopping;
                    await _context.SaveChangesAsync();
                    await StopServerAsync(server.Id);
                }

                _context.GameServers.Remove(server);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Server deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting server {ServerId}", id);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        // Helper methods
        private async Task StartServerAsync(Guid serverId)
        {
            // Simulate server startup time
            await Task.Delay(3000);

            var server = await _context.GameServers.FindAsync(serverId);
            if (server != null)
            {
                server.Status = ServerStatus.Running;
                server.LastStartedAt = DateTime.UtcNow;
                server.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        private async Task StopServerAsync(Guid serverId)
        {
            // Simulate server shutdown time
            await Task.Delay(2000);

            var server = await _context.GameServers.FindAsync(serverId);
            if (server != null)
            {
                server.Status = ServerStatus.Stopped;
                server.CurrentPlayers = 0;
                server.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }

    // Response DTOs
    public class ServerStatusResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int CurrentPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public int Port { get; set; }
        public bool IsPublic { get; set; }
        public string GameId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastStartedAt { get; set; }
        public TimeSpan Uptime { get; set; }
        public ServerConnectionInfo? ConnectionInfo { get; set; }
    }

    public class ServerConnectionInfo
    {
        public string IpAddress { get; set; } = string.Empty;
        public int Port { get; set; }
        public string DirectConnect { get; set; } = string.Empty;
        public string? SteamConnect { get; set; }
    }

    public class ServerSummaryResponse
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string GameId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int CurrentPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastStartedAt { get; set; }
    }
}