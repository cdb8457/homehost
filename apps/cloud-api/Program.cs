using HomeHost.CloudApi.Data;
using HomeHost.CloudApi.Hubs;
using HomeHost.CloudApi.Middleware;
using HomeHost.CloudApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Entity Framework
builder.Services.AddDbContext<HomeHostContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Redis
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// Configure Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.ASCII.GetBytes(builder.Configuration["JWT_SECRET_KEY"] ?? "your_jwt_secret_key_change_in_production")),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["JWT_ISSUER"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["JWT_AUDIENCE"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

// Configure SignalR
builder.Services.AddSignalR()
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("Redis"));

// Add application services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISteamService, SteamService>();
builder.Services.AddScoped<ICustomGameService, CustomGameService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGameServerService, GameServerService>();
builder.Services.AddScoped<ICommunityService, CommunityService>();
builder.Services.AddScoped<IPlayerManagementService, PlayerManagementService>();
builder.Services.AddScoped<ISocialDiscoveryService, SocialDiscoveryService>();
builder.Services.AddScoped<ICommunityAnalyticsService, CommunityAnalyticsService>();
builder.Services.AddScoped<IPlayerInvitationService, PlayerInvitationService>();
builder.Services.AddScoped<IGameLibraryService, GameLibraryService>();
builder.Services.AddScoped<IAdvancedServerConfigService, AdvancedServerConfigService>();
builder.Services.AddScoped<IPerformanceMonitoringService, PerformanceMonitoringService>();
builder.Services.AddScoped<IBackupRecoveryService, BackupRecoveryService>();
builder.Services.AddScoped<ITournamentService, TournamentService>();
builder.Services.AddScoped<IRevenueService, RevenueService>();
builder.Services.AddScoped<IEnterpriseAdminService, EnterpriseAdminService>();
builder.Services.AddScoped<IBusinessIntelligenceService, BusinessIntelligenceService>();
builder.Services.AddScoped<IAPIIntegrationService, APIIntegrationService>();
builder.Services.AddScoped<IEnterpriseSupportService, EnterpriseSupportService>();
builder.Services.AddScoped<IAdvancedGamingService, AdvancedGamingService>();
builder.Services.AddScoped<IStreamingService, StreamingService>();
builder.Services.AddScoped<IAIGameOptimizationService, AIGameOptimizationService>();
builder.Services.AddScoped<ICrossPlatformIntegrationService, CrossPlatformIntegrationService>();
builder.Services.AddScoped<IAdvancedModdingService, AdvancedModdingService>();
builder.Services.AddScoped<IPluginService, PluginService>();
builder.Services.AddScoped<ISyncService, SyncService>();

// Add HttpClient for external API calls
builder.Services.AddHttpClient();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowWebDashboard", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://dashboard.homehost.io")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add health checks
builder.Services.AddHealthChecks()
    .AddDbContext<HomeHostContext>()
    .AddRedis(builder.Configuration.GetConnectionString("Redis"));

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowWebDashboard");
app.UseAuthentication();
app.UseAuthorization();

// Add custom middleware
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.MapControllers();
app.MapHub<SyncHub>("/sync-hub");
app.MapHealthChecks("/health");

try
{
    Log.Information("Starting HomeHost Cloud API");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}