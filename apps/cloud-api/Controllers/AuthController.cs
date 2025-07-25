using HomeHost.CloudApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.AuthenticateAsync(request.Email, request.Password);
                
                if (!result.Success)
                {
                    return Unauthorized(new { error = result.Error });
                }

                var response = new LoginResponse
                {
                    Token = result.Token!,
                    RefreshToken = result.RefreshToken!,
                    ExpiresAt = result.ExpiresAt!.Value,
                    User = new UserResponse
                    {
                        Id = result.User!.Id,
                        Email = result.User.Email,
                        DisplayName = result.User.DisplayName,
                        AvatarUrl = result.User.AvatarUrl,
                        PersonaType = result.User.PersonaType.ToString(),
                        SteamId = result.User.SteamId
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Login failed for email: {Email}", request.Email);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("steam-login")]
        public async Task<IActionResult> SteamLogin([FromBody] SteamLoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.AuthenticateWithSteamAsync(request.SteamId, request.SteamTicket);
                
                if (!result.Success)
                {
                    return Unauthorized(new { error = result.Error });
                }

                var response = new LoginResponse
                {
                    Token = result.Token!,
                    RefreshToken = result.RefreshToken!,
                    ExpiresAt = result.ExpiresAt!.Value,
                    User = new UserResponse
                    {
                        Id = result.User!.Id,
                        Email = result.User.Email,
                        DisplayName = result.User.DisplayName,
                        AvatarUrl = result.User.AvatarUrl,
                        PersonaType = result.User.PersonaType.ToString(),
                        SteamId = result.User.SteamId
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Steam login failed for SteamId: {SteamId}", request.SteamId);
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var result = await _authService.RefreshTokenAsync(request.RefreshToken);
                
                if (!result.Success)
                {
                    return Unauthorized(new { error = result.Error });
                }

                var response = new LoginResponse
                {
                    Token = result.Token!,
                    RefreshToken = result.RefreshToken!,
                    ExpiresAt = result.ExpiresAt!.Value,
                    User = new UserResponse
                    {
                        Id = result.User!.Id,
                        Email = result.User.Email,
                        DisplayName = result.User.DisplayName,
                        AvatarUrl = result.User.AvatarUrl,
                        PersonaType = result.User.PersonaType.ToString(),
                        SteamId = result.User.SteamId
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token refresh failed");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var token = Request.Headers.Authorization.ToString().Replace("Bearer ", "");
                await _authService.RevokeTokenAsync(token);
                
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Logout failed");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateToken([FromBody] ValidateTokenRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var isValid = await _authService.ValidateTokenAsync(request.Token);
                
                return Ok(new { isValid });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token validation failed");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                {
                    return Unauthorized();
                }

                var user = new UserResponse
                {
                    Id = Guid.Parse(userIdClaim.Value),
                    Email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "",
                    DisplayName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value ?? "",
                    AvatarUrl = User.FindFirst("avatar_url")?.Value,
                    PersonaType = User.FindFirst("persona_type")?.Value ?? "Alex",
                    SteamId = User.FindFirst("steam_id")?.Value
                };

                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get current user failed");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }
    }

    // DTOs for API requests/responses
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }

    public class SteamLoginRequest
    {
        [Required]
        public string SteamId { get; set; } = string.Empty;

        [Required]
        public string SteamTicket { get; set; } = string.Empty;
    }

    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class ValidateTokenRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserResponse User { get; set; } = new();
    }

    public class UserResponse
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public string PersonaType { get; set; } = string.Empty;
        public string? SteamId { get; set; }
    }
}