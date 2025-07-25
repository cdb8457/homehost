using HomeHost.CloudApi.Data;
using HomeHost.CloudApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace HomeHost.CloudApi.Services
{
    public class AuthService : IAuthService
    {
        private readonly HomeHostContext _context;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            HomeHostContext context,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        public async Task<AuthResult> AuthenticateAsync(string email, string password)
        {
            try
            {
                // For now, basic email authentication (extend with proper password hashing)
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

                if (user == null)
                {
                    return new AuthResult { Success = false, Error = "Invalid credentials" };
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();
                var expiresAt = DateTime.UtcNow.AddHours(24);

                // Store refresh token
                await StoreRefreshTokenAsync(user.Id, refreshToken, expiresAt);

                return new AuthResult
                {
                    Success = true,
                    Token = token,
                    RefreshToken = refreshToken,
                    User = user,
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Authentication failed for email: {Email}", email);
                return new AuthResult { Success = false, Error = "Authentication failed" };
            }
        }

        public async Task<AuthResult> AuthenticateWithSteamAsync(string steamId, string steamTicket)
        {
            try
            {
                // Verify Steam ticket with Steam Web API
                var steamUser = await VerifySteamTicketAsync(steamId, steamTicket);
                if (steamUser == null)
                {
                    return new AuthResult { Success = false, Error = "Invalid Steam authentication" };
                }

                // Find or create user
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.SteamId == steamId);

                if (user == null)
                {
                    // Create new user from Steam profile
                    user = new User
                    {
                        Id = Guid.NewGuid(),
                        SteamId = steamId,
                        Email = steamUser.Email ?? $"{steamId}@steam.local",
                        DisplayName = steamUser.DisplayName ?? $"Steam User {steamId}",
                        AvatarUrl = steamUser.AvatarUrl,
                        PersonaType = PersonaType.Alex, // Default to casual
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        IsActive = true
                    };

                    _context.Users.Add(user);
                }

                // Update last login and Steam profile data
                user.LastLoginAt = DateTime.UtcNow;
                user.DisplayName = steamUser.DisplayName ?? user.DisplayName;
                user.AvatarUrl = steamUser.AvatarUrl ?? user.AvatarUrl;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                var token = GenerateJwtToken(user);
                var refreshToken = GenerateRefreshToken();
                var expiresAt = DateTime.UtcNow.AddHours(24);

                // Store refresh token
                await StoreRefreshTokenAsync(user.Id, refreshToken, expiresAt);

                return new AuthResult
                {
                    Success = true,
                    Token = token,
                    RefreshToken = refreshToken,
                    User = user,
                    ExpiresAt = expiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Steam authentication failed for SteamId: {SteamId}", steamId);
                return new AuthResult { Success = false, Error = "Steam authentication failed" };
            }
        }

        public async Task<AuthResult> RefreshTokenAsync(string refreshToken)
        {
            try
            {
                var session = await _context.UserSessions
                    .Include(s => s.User)
                    .FirstOrDefaultAsync(s => s.RefreshToken == refreshToken && 
                                             !s.IsRevoked && 
                                             s.ExpiresAt > DateTime.UtcNow);

                if (session == null)
                {
                    return new AuthResult { Success = false, Error = "Invalid refresh token" };
                }

                // Generate new tokens
                var newToken = GenerateJwtToken(session.User);
                var newRefreshToken = GenerateRefreshToken();
                var newExpiresAt = DateTime.UtcNow.AddHours(24);

                // Revoke old session and create new one
                session.IsRevoked = true;
                await StoreRefreshTokenAsync(session.UserId, newRefreshToken, newExpiresAt);

                await _context.SaveChangesAsync();

                return new AuthResult
                {
                    Success = true,
                    Token = newToken,
                    RefreshToken = newRefreshToken,
                    User = session.User,
                    ExpiresAt = newExpiresAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token refresh failed");
                return new AuthResult { Success = false, Error = "Token refresh failed" };
            }
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["JWT_SECRET_KEY"] ?? "your_jwt_secret_key_change_in_production");

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JWT_ISSUER"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JWT_AUDIENCE"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out SecurityToken validatedToken);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task RevokeTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    var sessions = await _context.UserSessions
                        .Where(s => s.UserId == userId && !s.IsRevoked)
                        .ToListAsync();

                    foreach (var session in sessions)
                    {
                        session.IsRevoked = true;
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Token revocation failed");
            }
        }

        public string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JWT_SECRET_KEY"] ?? "your_jwt_secret_key_change_in_production");

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(ClaimTypes.Email, user.Email),
                new(ClaimTypes.Name, user.DisplayName),
                new("persona_type", user.PersonaType.ToString()),
                new("steam_id", user.SteamId ?? ""),
                new("avatar_url", user.AvatarUrl ?? "")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = _configuration["JWT_ISSUER"],
                Audience = _configuration["JWT_AUDIENCE"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private async Task StoreRefreshTokenAsync(Guid userId, string refreshToken, DateTime expiresAt)
        {
            var session = new UserSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                CreatedAt = DateTime.UtcNow,
                IsRevoked = false
            };

            _context.UserSessions.Add(session);
        }

        private async Task<SteamUserInfo?> VerifySteamTicketAsync(string steamId, string steamTicket)
        {
            try
            {
                var steamApiKey = _configuration["STEAM_API_KEY"];
                if (string.IsNullOrEmpty(steamApiKey))
                {
                    _logger.LogWarning("Steam API key not configured");
                    return null;
                }

                var httpClient = _httpClientFactory.CreateClient();
                
                // Verify the auth ticket with Steam's AuthenticateUserTicket endpoint
                var ticketVerificationUrl = $"https://api.steampowered.com/ISteamUserAuth/AuthenticateUserTicket/v1/";
                var ticketVerificationData = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("key", steamApiKey),
                    new KeyValuePair<string, string>("appid", "480"), // Use Spacewar app ID for testing
                    new KeyValuePair<string, string>("ticket", steamTicket)
                });

                var ticketResponse = await httpClient.PostAsync(ticketVerificationUrl, ticketVerificationData);
                
                if (!ticketResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Steam ticket verification failed with status: {StatusCode}", ticketResponse.StatusCode);
                    return null;
                }

                var ticketResponseJson = await ticketResponse.Content.ReadAsStringAsync();
                using var ticketDocument = JsonDocument.Parse(ticketResponseJson);
                
                if (!ticketDocument.RootElement.TryGetProperty("response", out var ticketResponseElement) ||
                    !ticketResponseElement.TryGetProperty("params", out var paramsElement) ||
                    !paramsElement.TryGetProperty("result", out var resultElement) ||
                    resultElement.GetString() != "OK")
                {
                    _logger.LogWarning("Steam ticket validation failed");
                    return null;
                }

                // Extract validated Steam ID from ticket response
                var validatedSteamId = paramsElement.GetProperty("steamid").GetString();
                if (validatedSteamId != steamId)
                {
                    _logger.LogWarning("Steam ID mismatch: provided {ProvidedSteamId}, validated {ValidatedSteamId}", steamId, validatedSteamId);
                    return null;
                }
                
                // Get user profile from Steam Web API
                var profileUrl = $"https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={steamApiKey}&steamids={steamId}";
                var response = await httpClient.GetStringAsync(profileUrl);
                
                using var document = JsonDocument.Parse(response);
                var players = document.RootElement
                    .GetProperty("response")
                    .GetProperty("players");

                if (players.GetArrayLength() == 0)
                {
                    return null;
                }

                var player = players[0];
                
                return new SteamUserInfo
                {
                    SteamId = steamId,
                    DisplayName = player.GetProperty("personaname").GetString(),
                    AvatarUrl = player.GetProperty("avatarfull").GetString(),
                    Email = null // Steam doesn't provide email via public API
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to verify Steam ticket for SteamId: {SteamId}", steamId);
                return null;
            }
        }

        private class SteamUserInfo
        {
            public string? SteamId { get; set; }
            public string? DisplayName { get; set; }
            public string? AvatarUrl { get; set; }
            public string? Email { get; set; }
        }
    }
}