using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IAuthService
    {
        Task<AuthResult> AuthenticateAsync(string email, string password);
        Task<AuthResult> AuthenticateWithSteamAsync(string steamId, string steamTicket);
        Task<AuthResult> RefreshTokenAsync(string refreshToken);
        Task<bool> ValidateTokenAsync(string token);
        Task RevokeTokenAsync(string token);
        string GenerateJwtToken(User user);
        string GenerateRefreshToken();
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string? Token { get; set; }
        public string? RefreshToken { get; set; }
        public User? User { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public string? Error { get; set; }
    }
}