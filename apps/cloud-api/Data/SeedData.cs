using HomeHost.CloudApi.Models;
using Microsoft.EntityFrameworkCore;

namespace HomeHost.CloudApi.Data
{
    public static class SeedData
    {
        public static async Task SeedAsync(HomeHostContext context)
        {
            // Clear existing data
            await context.Database.ExecuteSqlRawAsync("DELETE FROM \"Games\"");
            
            // Seed games as specified in Story 1.2
            var games = new[]
            {
                new Game
                {
                    Id = Guid.NewGuid(),
                    Name = "Valheim",
                    Description = "A brutal exploration and survival game for 1-10 players set in a procedurally-generated purgatory inspired by Norse mythology.",
                    Genre = "Survival",
                    ImageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg",
                    BannerUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/library_hero.jpg",
                    MinPlayers = 1,
                    MaxPlayers = 10,
                    DeploymentDifficulty = "Easy",
                    EstimatedSetupTime = 5,
                    PopularityScore = 95.5,
                    IsEarlyAccess = true,
                    SteamAppId = "892970",
                    Version = "0.218.15",
                    SupportedPlatforms = new[] { "Windows", "Linux" },
                    RequiredPorts = new[] { 2456, 2457, 2458 },
                    SystemRequirements = new Dictionary<string, object>
                    {
                        { "minimum", new { os = "Windows 7 or later", processor = "2.6 GHz Quad Core", memory = "8 GB RAM", graphics = "GeForce GTX 950", directX = "Version 11", storage = "2 GB available space" } },
                        { "recommended", new { os = "Windows 10", processor = "i5 3GHz or Ryzen 5 3GHz", memory = "16 GB RAM", graphics = "GeForce GTX 1060", directX = "Version 11", storage = "2 GB available space" } }
                    },
                    ConfigurationOptions = new Dictionary<string, object>
                    {
                        { "world_name", new { type = "string", default = "Dedicated", description = "Name of the world" } },
                        { "password", new { type = "string", default = "", description = "Server password" } },
                        { "public", new { type = "boolean", default = true, description = "Make server public" } },
                        { "save_interval", new { type = "integer", default = 1800, description = "Save interval in seconds" } }
                    },
                    Tags = new[] { "survival", "crafting", "co-op", "sandbox", "early-access" },
                    Features = new[] { "Dedicated Server", "Mod Support", "Auto-Backup", "Performance Monitoring" },
                    InstallationGuide = "# Valheim Server Setup\n\n1. Steam credentials required\n2. Server will auto-configure\n3. World generates automatically\n4. Players can join immediately",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Game
                {
                    Id = Guid.NewGuid(),
                    Name = "MotorTown: Behind Closed Doors",
                    Description = "A detective story about a small town with a dark secret. Investigate, interrogate, and solve the mystery.",
                    Genre = "Mystery",
                    ImageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/1456090/header.jpg",
                    BannerUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/1456090/library_hero.jpg",
                    MinPlayers = 1,
                    MaxPlayers = 8,
                    DeploymentDifficulty = "Medium",
                    EstimatedSetupTime = 10,
                    PopularityScore = 78.2,
                    IsEarlyAccess = false,
                    SteamAppId = "1456090",
                    Version = "1.0.5",
                    SupportedPlatforms = new[] { "Windows" },
                    RequiredPorts = new[] { 7777, 7778 },
                    SystemRequirements = new Dictionary<string, object>
                    {
                        { "minimum", new { os = "Windows 10", processor = "Intel i5-4430", memory = "8 GB RAM", graphics = "NVIDIA GTX 960", directX = "Version 11", storage = "15 GB available space" } },
                        { "recommended", new { os = "Windows 11", processor = "Intel i7-8700", memory = "16 GB RAM", graphics = "NVIDIA GTX 1070", directX = "Version 12", storage = "15 GB available space" } }
                    },
                    ConfigurationOptions = new Dictionary<string, object>
                    {
                        { "max_players", new { type = "integer", default = 8, min = 1, max = 8, description = "Maximum players" } },
                        { "session_name", new { type = "string", default = "MotorTown Server", description = "Session name" } },
                        { "password_protected", new { type = "boolean", default = false, description = "Enable password protection" } }
                    },
                    Tags = new[] { "mystery", "detective", "multiplayer", "story-rich", "investigation" },
                    Features = new[] { "Voice Chat", "Private Lobbies", "Save Progress", "Admin Tools" },
                    InstallationGuide = "# MotorTown Server Setup\n\n1. Requires Steam authentication\n2. Configure session settings\n3. Set up voice chat (optional)\n4. Share lobby code with friends",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Game
                {
                    Id = Guid.NewGuid(),
                    Name = "Counter-Strike 2",
                    Description = "The world's most popular FPS game, rebuilt from the ground up with Source 2 engine.",
                    Genre = "FPS",
                    ImageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
                    BannerUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_hero.jpg",
                    MinPlayers = 2,
                    MaxPlayers = 32,
                    DeploymentDifficulty = "Hard",
                    EstimatedSetupTime = 15,
                    PopularityScore = 98.7,
                    IsEarlyAccess = false,
                    SteamAppId = "730",
                    Version = "1.39.8.8",
                    SupportedPlatforms = new[] { "Windows", "Linux" },
                    RequiredPorts = new[] { 27015, 27016, 27017, 27018, 27019, 27020 },
                    SystemRequirements = new Dictionary<string, object>
                    {
                        { "minimum", new { os = "Windows 10", processor = "4 hardware CPU threads", memory = "8 GB RAM", graphics = "Video card must be 1 GB or more", directX = "Version 11", storage = "85 GB available space" } },
                        { "recommended", new { os = "Windows 11", processor = "8 hardware CPU threads", memory = "16 GB RAM", graphics = "Video card must be 4 GB or more", directX = "Version 12", storage = "85 GB available space" } }
                    },
                    ConfigurationOptions = new Dictionary<string, object>
                    {
                        { "hostname", new { type = "string", default = "Counter-Strike 2 Server", description = "Server hostname" } },
                        { "maxplayers", new { type = "integer", default = 32, min = 2, max = 32, description = "Maximum players" } },
                        { "map", new { type = "string", default = "de_dust2", description = "Starting map" } },
                        { "game_mode", new { type = "string", default = "competitive", options = new[] { "competitive", "casual", "deathmatch", "arms_race" }, description = "Game mode" } },
                        { "rcon_password", new { type = "string", default = "", description = "RCON password for admin access" } }
                    },
                    Tags = new[] { "fps", "competitive", "esports", "multiplayer", "tactical" },
                    Features = new[] { "Competitive Matchmaking", "Workshop Maps", "RCON Support", "Statistics", "Anti-Cheat" },
                    InstallationGuide = "# Counter-Strike 2 Server Setup\n\n1. Requires Steam Game Server Account\n2. Configure server settings\n3. Set up maps and game modes\n4. Configure RCON for administration\n5. Enable VAC protection",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Game
                {
                    Id = Guid.NewGuid(),
                    Name = "Rust",
                    Description = "The only aim in Rust is to survive. Everything wants you to die - the island's wildlife and other inhabitants, the environment, other survivors.",
                    Genre = "Survival",
                    ImageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg",
                    BannerUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/252490/library_hero.jpg",
                    MinPlayers = 1,
                    MaxPlayers = 200,
                    DeploymentDifficulty = "Hard",
                    EstimatedSetupTime = 20,
                    PopularityScore = 87.3,
                    IsEarlyAccess = false,
                    SteamAppId = "252490",
                    Version = "2023.12.7",
                    SupportedPlatforms = new[] { "Windows", "Linux" },
                    RequiredPorts = new[] { 28015, 28016, 8080 },
                    SystemRequirements = new Dictionary<string, object>
                    {
                        { "minimum", new { os = "Windows 10 64bit", processor = "Intel Core i7-3770 / AMD FX-9590", memory = "10 GB RAM", graphics = "GTX 670 2GB / AMD R9 280", directX = "Version 11", storage = "25 GB available space" } },
                        { "recommended", new { os = "Windows 11 64bit", processor = "Intel Core i7-4790K / AMD Ryzen 5 1600", memory = "16 GB RAM", graphics = "GTX 980 / AMD R9 Fury", directX = "Version 12", storage = "25 GB available space" } }
                    },
                    ConfigurationOptions = new Dictionary<string, object>
                    {
                        { "hostname", new { type = "string", default = "Rust Server", description = "Server name" } },
                        { "maxplayers", new { type = "integer", default = 100, min = 1, max = 200, description = "Maximum players" } },
                        { "worldsize", new { type = "integer", default = 3000, min = 1000, max = 6000, description = "World size" } },
                        { "seed", new { type = "integer", default = 12345, description = "World seed" } },
                        { "pve", new { type = "boolean", default = false, description = "PvE mode" } },
                        { "gather_rate", new { type = "float", default = 1.0, min = 0.1, max = 10.0, description = "Resource gather rate multiplier" } }
                    },
                    Tags = new[] { "survival", "crafting", "multiplayer", "pvp", "building" },
                    Features = new[] { "Large World", "Mod Support", "Admin Panel", "Wipe Scheduling", "Performance Metrics" },
                    InstallationGuide = "# Rust Server Setup\n\n1. Steam credentials required\n2. Configure world settings\n3. Set up admin permissions\n4. Configure wipe schedule\n5. Install desired mods",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new Game
                {
                    Id = Guid.NewGuid(),
                    Name = "7 Days to Die",
                    Description = "An open-world game that is a unique combination of first person shooter, survival horror, tower defense, and role-playing games.",
                    Genre = "Survival",
                    ImageUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/header.jpg",
                    BannerUrl = "https://cdn.cloudflare.steamstatic.com/steam/apps/251570/library_hero.jpg",
                    MinPlayers = 1,
                    MaxPlayers = 8,
                    DeploymentDifficulty = "Medium",
                    EstimatedSetupTime = 8,
                    PopularityScore = 81.4,
                    IsEarlyAccess = true,
                    SteamAppId = "251570",
                    Version = "Alpha 21.2",
                    SupportedPlatforms = new[] { "Windows", "Linux" },
                    RequiredPorts = new[] { 26900, 26901, 26902, 8080, 8081, 8082 },
                    SystemRequirements = new Dictionary<string, object>
                    {
                        { "minimum", new { os = "Windows 10 64bit", processor = "Intel Core i5-8400 / AMD Ryzen 5 2600", memory = "12 GB RAM", graphics = "Nvidia GTX 1060 6GB / AMD Radeon RX 580 8GB", directX = "Version 11", storage = "47 GB available space" } },
                        { "recommended", new { os = "Windows 11 64bit", processor = "Intel Core i7-10700K / AMD Ryzen 7 3700X", memory = "16 GB RAM", graphics = "Nvidia RTX 3070 / AMD Radeon RX 6700 XT", directX = "Version 12", storage = "47 GB available space" } }
                    },
                    ConfigurationOptions = new Dictionary<string, object>
                    {
                        { "server_name", new { type = "string", default = "7 Days to Die Server", description = "Server name" } },
                        { "server_password", new { type = "string", default = "", description = "Server password" } },
                        { "max_players", new { type = "integer", default = 8, min = 1, max = 8, description = "Maximum players" } },
                        { "world_name", new { type = "string", default = "Navezgane", description = "World name" } },
                        { "difficulty", new { type = "integer", default = 2, min = 0, max = 5, description = "Game difficulty (0-5)" } },
                        { "day_night_length", new { type = "integer", default = 60, min = 10, max = 120, description = "Day/night cycle length in minutes" } },
                        { "blood_moon_frequency", new { type = "integer", default = 7, min = 1, max = 30, description = "Blood moon frequency in days" } }
                    },
                    Tags = new[] { "survival", "zombie", "crafting", "building", "co-op", "early-access" },
                    Features = new[] { "Zombie Hordes", "Base Building", "Mod Support", "Admin Commands", "Save Management" },
                    InstallationGuide = "# 7 Days to Die Server Setup\n\n1. Steam credentials required\n2. Configure world settings\n3. Set difficulty and gameplay options\n4. Configure blood moon settings\n5. Set up admin permissions",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };

            context.Games.AddRange(games);
            await context.SaveChangesAsync();
        }
    }
}