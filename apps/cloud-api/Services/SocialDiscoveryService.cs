using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;
using System.Diagnostics;

namespace HomeHost.CloudApi.Services
{
    public class SocialDiscoveryService : ISocialDiscoveryService
    {
        private readonly HomeHostContext _context;
        private readonly IPlayerManagementService _playerService;
        private readonly ICommunityService _communityService;
        private readonly ILogger<SocialDiscoveryService> _logger;

        public SocialDiscoveryService(
            HomeHostContext context, 
            IPlayerManagementService playerService,
            ICommunityService communityService,
            ILogger<SocialDiscoveryService> logger)
        {
            _context = context;
            _playerService = playerService;
            _communityService = communityService;
            _logger = logger;
        }

        // Community Discovery
        public async Task<DiscoveryResults<Community>> DiscoverCommunitiesAsync(Guid userId, DiscoveryRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            var userProfile = await GetUserInterestProfileAsync(userId);
            var preferences = await GetDiscoveryPreferencesAsync(userId);

            var query = _context.Communities.Include(c => c.Owner).Where(c => c.IsPublic);

            // Apply filters
            if (!string.IsNullOrEmpty(request.Query))
            {
                query = query.Where(c => c.Name.Contains(request.Query) || 
                                       c.Description.Contains(request.Query) ||
                                       c.Tags.Any(t => t.Contains(request.Query)));
            }

            if (request.PreferredGames.Any())
            {
                query = query.Where(c => c.Settings.AllowedGames.Any(g => request.PreferredGames.Contains(g)));
            }

            if (request.Tags.Any())
            {
                query = query.Where(c => c.Tags.Any(t => request.Tags.Contains(t)));
            }

            if (request.MinMembers.HasValue)
            {
                query = query.Where(c => c.MemberCount >= request.MinMembers.Value);
            }

            if (request.MaxMembers.HasValue)
            {
                query = query.Where(c => c.MemberCount <= request.MaxMembers.Value);
            }

            // Get base results
            var totalCount = await query.CountAsync();
            var communities = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize * 2) // Get more for scoring and filtering
                .ToListAsync();

            // Score and rank communities
            var scoredCommunities = new List<(Community community, float score)>();
            
            foreach (var community in communities)
            {
                var matchScore = await CalculateCommunityMatchScore(userId, community, userProfile, preferences);
                scoredCommunities.Add((community, matchScore.OverallScore));
            }

            // Apply serendipity
            var finalCommunities = ApplySerendipity(scoredCommunities, request.SerendipityLevel, request.PageSize);

            stopwatch.Stop();

            return new DiscoveryResults<Community>
            {
                Items = finalCommunities.Select(x => x.community).ToList(),
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                Metadata = new DiscoveryMetadata
                {
                    Algorithm = "hybrid_community_discovery",
                    ConfidenceScore = finalCommunities.Any() ? finalCommunities.Average(x => x.score) : 0,
                    FactorWeights = GetFactorWeights(preferences),
                    ExplanationFactors = GetExplanationFactors("community", userProfile),
                    GeneratedAt = DateTime.UtcNow,
                    ProcessingTime = stopwatch.Elapsed
                },
                AppliedFilters = BuildAppliedFilters(request)
            };
        }

        public async Task<List<Community>> GetRecommendedCommunitiesAsync(Guid userId, int limit = 10)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            var userFriends = await _playerService.GetPlayerFriendsAsync(userId);
            var friendIds = userFriends.Select(f => f.RelatedUserId).ToList();

            // Get communities user's friends are in
            var friendCommunities = await _context.CommunityMembers
                .Where(m => friendIds.Contains(m.UserId))
                .Select(m => m.CommunityId)
                .Distinct()
                .Take(20)
                .ToListAsync();

            // Get communities with similar interests
            var interestBasedCommunities = await _context.Communities
                .Where(c => c.IsPublic && 
                           c.Tags.Any(t => userProfile.PreferredGames.Contains(t)) ||
                           c.Settings.AllowedGames.Any(g => userProfile.PreferredGames.Contains(g)))
                .Take(20)
                .ToListAsync();

            // Combine and score
            var allCandidates = await _context.Communities
                .Include(c => c.Owner)
                .Where(c => friendCommunities.Contains(c.Id) || interestBasedCommunities.Select(ic => ic.Id).Contains(c.Id))
                .ToListAsync();

            var preferences = await GetDiscoveryPreferencesAsync(userId);
            var scoredCommunities = new List<(Community community, float score)>();

            foreach (var community in allCandidates)
            {
                var matchScore = await CalculateCommunityMatchScore(userId, community, userProfile, preferences);
                scoredCommunities.Add((community, matchScore.OverallScore));
            }

            return scoredCommunities
                .OrderByDescending(x => x.score)
                .Take(limit)
                .Select(x => x.community)
                .ToList();
        }

        public async Task<List<Community>> GetTrendingCommunitiesAsync(string? gameType = null, int limit = 10)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            
            var query = _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.IsPublic);

            if (!string.IsNullOrEmpty(gameType))
            {
                query = query.Where(c => c.Settings.AllowedGames.Contains(gameType));
            }

            // Calculate trending score based on recent member growth and activity
            var communities = await query.ToListAsync();
            var trendingCommunities = new List<(Community community, float trendScore)>();

            foreach (var community in communities)
            {
                var recentMembers = await _context.CommunityMembers
                    .Where(m => m.CommunityId == community.Id && m.JoinedAt >= oneWeekAgo)
                    .CountAsync();

                var recentActivity = await _context.CommunityActivities
                    .Where(a => a.CommunityId == community.Id && a.CreatedAt >= oneWeekAgo)
                    .CountAsync();

                var growthRate = community.MemberCount > 0 ? (float)recentMembers / community.MemberCount : 0;
                var activityScore = Math.Min(recentActivity / 50.0f, 1.0f); // Normalize activity

                var trendScore = (growthRate * 0.6f) + (activityScore * 0.4f);
                trendingCommunities.Add((community, trendScore));
            }

            return trendingCommunities
                .OrderByDescending(x => x.trendScore)
                .Take(limit)
                .Select(x => x.community)
                .ToList();
        }

        public async Task<List<Community>> GetSimilarCommunitiesAsync(Guid communityId, int limit = 5)
        {
            var targetCommunity = await _context.Communities.FindAsync(communityId);
            if (targetCommunity == null)
                return new List<Community>();

            var similarCommunities = await _context.Communities
                .Include(c => c.Owner)
                .Where(c => c.Id != communityId && c.IsPublic)
                .ToListAsync();

            var scored = new List<(Community community, float similarity)>();

            foreach (var community in similarCommunities)
            {
                var similarity = CalculateCommunitySimilarity(targetCommunity, community);
                scored.Add((community, similarity));
            }

            return scored
                .OrderByDescending(x => x.similarity)
                .Take(limit)
                .Select(x => x.community)
                .ToList();
        }

        public async Task<CommunityMatchScore> GetCommunityMatchAsync(Guid userId, Guid communityId)
        {
            var community = await _context.Communities.FindAsync(communityId);
            if (community == null)
                throw new ArgumentException("Community not found");

            var userProfile = await GetUserInterestProfileAsync(userId);
            var preferences = await GetDiscoveryPreferencesAsync(userId);

            return await CalculateCommunityMatchScore(userId, community, userProfile, preferences);
        }

        // Server Discovery
        public async Task<DiscoveryResults<GameServer>> DiscoverServersAsync(Guid userId, ServerDiscoveryRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            var userProfile = await GetUserInterestProfileAsync(userId);
            var preferences = await GetDiscoveryPreferencesAsync(userId);

            var query = _context.GameServers
                .Include(s => s.Owner)
                .Include(s => s.Community)
                .Where(s => s.Status == "Running");

            // Apply filters
            if (!string.IsNullOrEmpty(request.GameType))
            {
                query = query.Where(s => s.GameType == request.GameType);
            }

            if (!string.IsNullOrEmpty(request.Query))
            {
                query = query.Where(s => s.Name.Contains(request.Query));
            }

            if (request.RequireSlots)
            {
                query = query.Where(s => s.PlayerCount < s.MaxPlayers);
            }

            // Get base results
            var totalCount = await query.CountAsync();
            var servers = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize * 2)
                .ToListAsync();

            // Score servers
            var scoredServers = new List<(GameServer server, float score)>();
            
            foreach (var server in servers)
            {
                var matchScore = await CalculateServerMatchScore(userId, server, userProfile, preferences);
                scoredServers.Add((server, matchScore.OverallScore));
            }

            var finalServers = ApplySerendipity(scoredServers, request.SerendipityLevel, request.PageSize);

            stopwatch.Stop();

            return new DiscoveryResults<GameServer>
            {
                Items = finalServers.Select(x => x.server).ToList(),
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                Metadata = new DiscoveryMetadata
                {
                    Algorithm = "hybrid_server_discovery",
                    ConfidenceScore = finalServers.Any() ? finalServers.Average(x => x.score) : 0,
                    FactorWeights = GetFactorWeights(preferences),
                    ExplanationFactors = GetExplanationFactors("server", userProfile),
                    GeneratedAt = DateTime.UtcNow,
                    ProcessingTime = stopwatch.Elapsed
                }
            };
        }

        public async Task<List<GameServer>> GetRecommendedServersAsync(Guid userId, int limit = 10)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            var preferences = await GetDiscoveryPreferencesAsync(userId);

            // Get servers from user's preferred games
            var servers = await _context.GameServers
                .Include(s => s.Owner)
                .Include(s => s.Community)
                .Where(s => s.Status == "Running" && 
                           userProfile.PreferredGames.Contains(s.GameType))
                .Take(50) // Get more for scoring
                .ToListAsync();

            var scoredServers = new List<(GameServer server, float score)>();

            foreach (var server in servers)
            {
                var matchScore = await CalculateServerMatchScore(userId, server, userProfile, preferences);
                scoredServers.Add((server, matchScore.OverallScore));
            }

            return scoredServers
                .OrderByDescending(x => x.score)
                .Take(limit)
                .Select(x => x.server)
                .ToList();
        }

        public async Task<List<GameServer>> GetPopularServersAsync(string? gameType = null, int limit = 10)
        {
            var query = _context.GameServers
                .Include(s => s.Owner)
                .Include(s => s.Community)
                .Where(s => s.Status == "Running");

            if (!string.IsNullOrEmpty(gameType))
            {
                query = query.Where(s => s.GameType == gameType);
            }

            return await query
                .OrderByDescending(s => s.PlayerCount)
                .ThenByDescending(s => s.UptimeSeconds)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<GameServer>> GetFriendsServersAsync(Guid userId, int limit = 20)
        {
            var friends = await _playerService.GetPlayerFriendsAsync(userId);
            var friendIds = friends.Select(f => f.RelatedUserId).ToList();

            // Get servers owned by friends or where friends are currently playing
            var friendsServers = await _context.GameServers
                .Include(s => s.Owner)
                .Include(s => s.Community)
                .Where(s => s.Status == "Running" && 
                           (friendIds.Contains(s.OwnerId)))
                .Take(limit)
                .ToListAsync();

            // Also get servers where friends have recent sessions
            var recentThreshold = DateTime.UtcNow.AddDays(-7);
            var friendsRecentServers = await _context.PlayerSessions
                .Where(ps => friendIds.Contains(ps.UserId) && ps.StartTime >= recentThreshold)
                .Select(ps => ps.ServerId)
                .Distinct()
                .Take(limit)
                .ToListAsync();

            var additionalServers = await _context.GameServers
                .Include(s => s.Owner)
                .Include(s => s.Community)
                .Where(s => friendsRecentServers.Contains(s.Id) && 
                           !friendsServers.Select(fs => fs.Id).Contains(s.Id))
                .Take(limit - friendsServers.Count)
                .ToListAsync();

            friendsServers.AddRange(additionalServers);
            return friendsServers;
        }

        public async Task<ServerMatchScore> GetServerMatchAsync(Guid userId, Guid serverId)
        {
            var server = await _context.GameServers
                .Include(s => s.Owner)
                .Include(s => s.Community)
                .FirstOrDefaultAsync(s => s.Id == serverId);

            if (server == null)
                throw new ArgumentException("Server not found");

            var userProfile = await GetUserInterestProfileAsync(userId);
            var preferences = await GetDiscoveryPreferencesAsync(userId);

            return await CalculateServerMatchScore(userId, server, userProfile, preferences);
        }

        // Player Discovery
        public async Task<DiscoveryResults<PlayerProfile>> DiscoverPlayersAsync(Guid userId, PlayerDiscoveryRequest request)
        {
            var stopwatch = Stopwatch.StartNew();
            var userProfile = await GetUserInterestProfileAsync(userId);

            var query = _context.Users.AsQueryable();

            // Exclude current user and blocked users
            var blockedUsers = await _context.PlayerRelationships
                .Where(r => r.UserId == userId && r.Type == RelationshipType.Block)
                .Select(r => r.RelatedUserId)
                .ToListAsync();

            query = query.Where(u => u.Id != userId && !blockedUsers.Contains(u.Id));

            // Apply filters
            if (!string.IsNullOrEmpty(request.Query))
            {
                query = query.Where(u => u.DisplayName.Contains(request.Query));
            }

            if (request.OnlineOnly)
            {
                var recentThreshold = DateTime.UtcNow.AddMinutes(-30);
                query = query.Where(u => u.LastSeen >= recentThreshold);
            }

            var totalCount = await query.CountAsync();
            var users = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize * 2)
                .ToListAsync();

            var scoredPlayers = new List<(PlayerProfile profile, float score)>();

            foreach (var user in users)
            {
                var profile = await _playerService.GetPlayerProfileAsync(user.Id);
                var matchScore = await CalculatePlayerMatchScore(userId, user.Id, userProfile);
                scoredPlayers.Add((profile, matchScore.OverallScore));
            }

            var finalPlayers = ApplySerendipity(scoredPlayers, request.SerendipityLevel, request.PageSize);

            stopwatch.Stop();

            return new DiscoveryResults<PlayerProfile>
            {
                Items = finalPlayers.Select(x => x.profile).ToList(),
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                Metadata = new DiscoveryMetadata
                {
                    Algorithm = "hybrid_player_discovery",
                    ConfidenceScore = finalPlayers.Any() ? finalPlayers.Average(x => x.score) : 0,
                    GeneratedAt = DateTime.UtcNow,
                    ProcessingTime = stopwatch.Elapsed
                }
            };
        }

        public async Task<List<PlayerProfile>> GetRecommendedPlayersAsync(Guid userId, int limit = 10)
        {
            return await _playerService.GetRecommendedPlayersAsync(userId, limit);
        }

        public async Task<List<PlayerProfile>> GetSimilarPlayersAsync(Guid userId, int limit = 10)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            var userStats = await _playerService.GetPlayerStatsAsync(userId);

            // Find players with similar interests and play patterns
            var allUsers = await _context.Users
                .Where(u => u.Id != userId)
                .Take(100) // Limit for performance
                .ToListAsync();

            var scoredPlayers = new List<(PlayerProfile profile, float similarity)>();

            foreach (var user in allUsers)
            {
                var otherProfile = await GetUserInterestProfileAsync(user.Id);
                var otherStats = await _playerService.GetPlayerStatsAsync(user.Id);

                var similarity = CalculatePlayerSimilarity(userProfile, otherProfile, userStats, otherStats);
                
                if (similarity > 0.3f) // Only include reasonably similar players
                {
                    var profile = await _playerService.GetPlayerProfileAsync(user.Id);
                    scoredPlayers.Add((profile, similarity));
                }
            }

            return scoredPlayers
                .OrderByDescending(x => x.similarity)
                .Take(limit)
                .Select(x => x.profile)
                .ToList();
        }

        public async Task<List<PlayerProfile>> GetPlayersInCommunityAsync(Guid userId, Guid communityId, int limit = 20)
        {
            var memberIds = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId && m.UserId != userId)
                .Select(m => m.UserId)
                .Take(limit)
                .ToListAsync();

            var profiles = new List<PlayerProfile>();
            foreach (var memberId in memberIds)
            {
                profiles.Add(await _playerService.GetPlayerProfileAsync(memberId));
            }

            return profiles;
        }

        public async Task<PlayerMatchScore> GetPlayerMatchAsync(Guid userId, Guid targetUserId)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            return await CalculatePlayerMatchScore(userId, targetUserId, userProfile);
        }

        // Game Discovery
        public async Task<DiscoveryResults<Game>> DiscoverGamesAsync(Guid userId, GameDiscoveryRequest request)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            
            var query = _context.Games.AsQueryable();

            // Apply filters
            if (request.Genres.Any())
            {
                query = query.Where(g => request.Genres.Any(genre => g.Genres.Contains(genre)));
            }

            if (request.FreeToPlayOnly)
            {
                query = query.Where(g => g.IsFreeToPlay);
            }

            if (request.MultiplayerOnly)
            {
                query = query.Where(g => g.HasMultiplayer);
            }

            var totalCount = await query.CountAsync();
            var games = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            return new DiscoveryResults<Game>
            {
                Items = games,
                TotalCount = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                Metadata = new DiscoveryMetadata
                {
                    Algorithm = "content_based_game_discovery",
                    GeneratedAt = DateTime.UtcNow
                }
            };
        }

        public async Task<List<Game>> GetRecommendedGamesAsync(Guid userId, int limit = 10)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            
            // Get games based on preferred genres
            var recommendedGames = await _context.Games
                .Where(g => userProfile.GameGenreScores.Keys.Any(genre => g.Genres.Contains(genre)))
                .Take(limit)
                .ToListAsync();

            return recommendedGames;
        }

        public async Task<List<Game>> GetTrendingGamesAsync(int limit = 10)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            
            // Calculate trending based on recent server creations and player activity
            var gameActivity = await _context.GameServers
                .Where(s => s.CreatedAt >= oneWeekAgo)
                .GroupBy(s => s.GameType)
                .Select(g => new { GameType = g.Key, ServerCount = g.Count() })
                .OrderByDescending(g => g.ServerCount)
                .Take(limit)
                .ToListAsync();

            var trendingGames = new List<Game>();
            foreach (var activity in gameActivity)
            {
                var game = await _context.Games.FirstOrDefaultAsync(g => g.Id == activity.GameType);
                if (game != null)
                {
                    trendingGames.Add(game);
                }
            }

            return trendingGames;
        }

        public async Task<List<Game>> GetSimilarGamesAsync(string gameId, int limit = 5)
        {
            var targetGame = await _context.Games.FindAsync(gameId);
            if (targetGame == null)
                return new List<Game>();

            var allGames = await _context.Games
                .Where(g => g.Id != gameId)
                .ToListAsync();

            var scoredGames = new List<(Game game, float similarity)>();

            foreach (var game in allGames)
            {
                var similarity = CalculateGameSimilarity(targetGame, game);
                scoredGames.Add((game, similarity));
            }

            return scoredGames
                .OrderByDescending(x => x.similarity)
                .Take(limit)
                .Select(x => x.game)
                .ToList();
        }

        // Social Signals & Analytics
        public async Task<SocialInsights> GetUserSocialInsightsAsync(Guid userId)
        {
            var friends = await _playerService.GetPlayerFriendsAsync(userId);
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

            var activeFriends = friends.Where(f => f.RelatedUser.LastSeen >= oneWeekAgo).Count();
            
            var activities = await _playerService.GetPlayerActivitiesAsync(userId, 100);
            var activityBreakdown = activities
                .GroupBy(a => a.ActivityType)
                .ToDictionary(g => g.Key, g => g.Count());

            return new SocialInsights
            {
                UserId = userId,
                NetworkSize = friends.Count,
                ActiveConnections = activeFriends,
                SocialScore = CalculateSocialScore(friends.Count, activeFriends, activities.Count),
                ActivityBreakdown = activityBreakdown,
                GrowthTrends = await CalculateGrowthTrends(userId),
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<DiscoveryAnalytics> GetDiscoveryAnalyticsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var start = startDate ?? DateTime.UtcNow.AddDays(-30);
            var end = endDate ?? DateTime.UtcNow;

            var actions = await _context.DiscoveryActions
                .Where(a => a.UserId == userId && a.CreatedAt >= start && a.CreatedAt <= end)
                .ToListAsync();

            var totalRecommendations = actions.Count(a => a.ActionType == "view");
            var actionsOnRecommendations = actions.Count(a => a.ActionType != "view");

            return new DiscoveryAnalytics
            {
                UserId = userId,
                StartDate = start,
                EndDate = end,
                TotalRecommendations = totalRecommendations,
                ActionsOnRecommendations = actionsOnRecommendations,
                EngagementRate = totalRecommendations > 0 ? (float)actionsOnRecommendations / totalRecommendations : 0,
                ActionBreakdown = actions
                    .GroupBy(a => a.ActionType)
                    .ToDictionary(g => g.Key, g => g.Count()),
                CategoryPerformance = actions
                    .GroupBy(a => a.ItemType)
                    .ToDictionary(g => g.Key, g => g.Count(a => a.ActionType != "view") / (float)g.Count())
            };
        }

        public async Task<List<SocialTrend>> GetSocialTrendsAsync(string category, int limit = 10)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            var twoWeeksAgo = DateTime.UtcNow.AddDays(-14);

            // This is a simplified implementation - in reality would analyze various trend signals
            var trends = new List<SocialTrend>();

            if (category == "communities")
            {
                var recentCommunities = await _context.Communities
                    .Where(c => c.CreatedAt >= oneWeekAgo && c.IsPublic)
                    .OrderByDescending(c => c.MemberCount)
                    .Take(limit)
                    .ToListAsync();

                foreach (var community in recentCommunities)
                {
                    trends.Add(new SocialTrend
                    {
                        Category = "communities",
                        Name = community.Name,
                        Description = community.Description,
                        TrendScore = community.MemberCount / 100.0f,
                        ParticipantCount = community.MemberCount,
                        RelatedTags = community.Tags,
                        StartedTrendingAt = community.CreatedAt
                    });
                }
            }

            return trends;
        }

        // Interest Profiling
        public async Task<UserInterestProfile> GetUserInterestProfileAsync(Guid userId)
        {
            // Check if we have an existing profile
            var existingProfile = await _context.UserInterestProfiles.FindAsync(userId);
            if (existingProfile != null && existingProfile.LastUpdated > DateTime.UtcNow.AddDays(-7))
            {
                return existingProfile;
            }

            // Generate profile from user activity
            var profile = await GenerateInterestProfileFromActivity(userId);
            
            if (existingProfile != null)
            {
                // Update existing
                existingProfile.GameGenreScores = profile.GameGenreScores;
                existingProfile.PlayStyleScores = profile.PlayStyleScores;
                existingProfile.FeaturePreferences = profile.FeaturePreferences;
                existingProfile.CommunityPreferences = profile.CommunityPreferences;
                existingProfile.PreferredGames = profile.PreferredGames;
                existingProfile.PreferredPlayTimes = profile.PreferredPlayTimes;
                existingProfile.LastUpdated = DateTime.UtcNow;
                existingProfile.ProfileCompleteness = CalculateProfileCompleteness(profile);
            }
            else
            {
                // Create new
                profile.UserId = userId;
                profile.LastUpdated = DateTime.UtcNow;
                profile.ProfileCompleteness = CalculateProfileCompleteness(profile);
                _context.UserInterestProfiles.Add(profile);
            }

            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<UserInterestProfile> UpdateUserInterestProfileAsync(Guid userId, UpdateInterestProfileRequest request)
        {
            var profile = await GetUserInterestProfileAsync(userId);

            if (request.GameGenreScores != null)
                profile.GameGenreScores = request.GameGenreScores;
            if (request.PlayStyleScores != null)
                profile.PlayStyleScores = request.PlayStyleScores;
            if (request.FeaturePreferences != null)
                profile.FeaturePreferences = request.FeaturePreferences;
            if (request.CommunityPreferences != null)
                profile.CommunityPreferences = request.CommunityPreferences;
            if (request.PreferredGames != null)
                profile.PreferredGames = request.PreferredGames;
            if (request.AvoidedGames != null)
                profile.AvoidedGames = request.AvoidedGames;
            if (request.PreferredPlayTimes != null)
                profile.PreferredPlayTimes = request.PreferredPlayTimes;

            profile.LastUpdated = DateTime.UtcNow;
            profile.ProfileCompleteness = CalculateProfileCompleteness(profile);

            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<List<InterestMatch>> GetInterestBasedRecommendationsAsync(Guid userId, string category, int limit = 10)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            var matches = new List<InterestMatch>();

            if (category == "communities")
            {
                var communities = await _context.Communities
                    .Where(c => c.IsPublic)
                    .Take(50)
                    .ToListAsync();

                foreach (var community in communities)
                {
                    var matchScore = CalculateInterestMatch(userProfile, community);
                    if (matchScore > 0.3f)
                    {
                        matches.Add(new InterestMatch
                        {
                            Category = "communities",
                            ItemId = community.Id,
                            ItemName = community.Name,
                            MatchScore = matchScore,
                            MatchingInterests = GetMatchingInterests(userProfile, community),
                            ReasonExplanation = GenerateMatchExplanation(userProfile, community)
                        });
                    }
                }
            }

            return matches
                .OrderByDescending(m => m.MatchScore)
                .Take(limit)
                .ToList();
        }

        // Discovery History & Feedback
        public async Task<bool> RecordDiscoveryActionAsync(Guid userId, DiscoveryAction action)
        {
            action.Id = Guid.NewGuid();
            action.UserId = userId;
            action.CreatedAt = DateTime.UtcNow;

            _context.DiscoveryActions.Add(action);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Discovery action recorded: {UserId} -> {ActionType} on {ItemType}:{ItemId}", 
                userId, action.ActionType, action.ItemType, action.ItemId);

            return true;
        }

        public async Task<List<DiscoveryAction>> GetDiscoveryHistoryAsync(Guid userId, int page = 1, int pageSize = 20)
        {
            return await _context.DiscoveryActions
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<bool> ProvideDiscoveryFeedbackAsync(Guid userId, DiscoveryFeedback feedback)
        {
            feedback.UserId = userId;
            _context.DiscoveryFeedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            // Use feedback to improve future recommendations
            await UpdateRecommendationWeights(userId, feedback);

            return true;
        }

        public async Task<DiscoveryPreferences> GetDiscoveryPreferencesAsync(Guid userId)
        {
            var preferences = await _context.DiscoveryPreferences.FindAsync(userId);
            if (preferences == null)
            {
                preferences = new DiscoveryPreferences
                {
                    UserId = userId,
                    CategoryWeights = new Dictionary<string, float>
                    {
                        ["social"] = 0.3f,
                        ["skill"] = 0.25f,
                        ["activity"] = 0.25f,
                        ["interest"] = 0.2f
                    },
                    PreferredAlgorithms = new List<string> { "hybrid", "collaborative" },
                    LastUpdated = DateTime.UtcNow
                };
                
                _context.DiscoveryPreferences.Add(preferences);
                await _context.SaveChangesAsync();
            }

            return preferences;
        }

        public async Task<DiscoveryPreferences> UpdateDiscoveryPreferencesAsync(Guid userId, UpdateDiscoveryPreferencesRequest request)
        {
            var preferences = await GetDiscoveryPreferencesAsync(userId);

            if (request.CategoryWeights != null)
                preferences.CategoryWeights = request.CategoryWeights;
            if (request.PreferredAlgorithms != null)
                preferences.PreferredAlgorithms = request.PreferredAlgorithms;
            if (request.SerendipityLevel.HasValue)
                preferences.SerendipityLevel = request.SerendipityLevel.Value;
            if (request.IncludeTrendingContent.HasValue)
                preferences.IncludeTrendingContent = request.IncludeTrendingContent.Value;
            if (request.IncludeFriendActivity.HasValue)
                preferences.IncludeFriendActivity = request.IncludeFriendActivity.Value;
            if (request.AllowCrossGameRecommendations.HasValue)
                preferences.AllowCrossGameRecommendations = request.AllowCrossGameRecommendations.Value;
            if (request.MaxRecommendationsPerDay.HasValue)
                preferences.MaxRecommendationsPerDay = request.MaxRecommendationsPerDay.Value;
            if (request.BlockedCategories != null)
                preferences.BlockedCategories = request.BlockedCategories;

            preferences.LastUpdated = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return preferences;
        }

        // Advanced Discovery Features
        public async Task<List<DiscoveryEvent>> GetDiscoveryEventsAsync(Guid userId, int limit = 10)
        {
            return await _context.DiscoveryEvents
                .Where(e => e.UserId == userId && (e.ExpiresAt == null || e.ExpiresAt > DateTime.UtcNow))
                .OrderByDescending(e => e.RelevanceScore)
                .ThenByDescending(e => e.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<CrossGameRecommendation>> GetCrossGameRecommendationsAsync(Guid userId, int limit = 5)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            var currentGames = userProfile.PreferredGames;

            var recommendations = new List<CrossGameRecommendation>();

            // This is a simplified implementation - would use ML models in production
            var gameTransitions = new Dictionary<string, List<string>>
            {
                ["Counter-Strike"] = new List<string> { "Valorant", "Rainbow Six Siege" },
                ["Minecraft"] = new List<string> { "Terraria", "Valheim" },
                ["League of Legends"] = new List<string> { "Dota 2", "Heroes of the Storm" }
            };

            foreach (var currentGame in currentGames)
            {
                if (gameTransitions.TryGetValue(currentGame, out var targetGames))
                {
                    foreach (var targetGame in targetGames.Take(limit))
                    {
                        recommendations.Add(new CrossGameRecommendation
                        {
                            SourceGame = currentGame,
                            TargetGame = targetGame,
                            SimilarityScore = 0.8f,
                            SharedElements = new List<string> { "competitive", "team_based" },
                            TransitionReason = "Similar gameplay mechanics and competitive nature",
                            SuccessRate = 0.7f
                        });
                    }
                }
            }

            return recommendations.Take(limit).ToList();
        }

        public async Task<SerendipityRecommendations> GetSerendipityRecommendationsAsync(Guid userId)
        {
            var userProfile = await GetUserInterestProfileAsync(userId);
            var preferences = await GetDiscoveryPreferencesAsync(userId);

            // Get items outside user's usual preferences for serendipity
            var unexpectedCommunities = await _context.Communities
                .Where(c => c.IsPublic && 
                           !c.Tags.Any(t => userProfile.PreferredGames.Contains(t)))
                .Take(10)
                .ToListAsync();

            var serendipityItems = new List<SerendipityItem>();

            foreach (var community in unexpectedCommunities)
            {
                serendipityItems.Add(new SerendipityItem
                {
                    Type = "community",
                    ItemId = community.Id,
                    Name = community.Name,
                    UnexpectednessScore = CalculateUnexpectedness(userProfile, community),
                    DiscoveryReason = "Expanding beyond your usual interests",
                    IntriguingFactors = community.Tags
                });
            }

            return new SerendipityRecommendations
            {
                UserId = userId,
                Items = serendipityItems.OrderByDescending(i => i.UnexpectednessScore).Take(5).ToList(),
                SerendipityThreshold = preferences.SerendipityLevel,
                GenerationStrategy = "content_diversity",
                GeneratedAt = DateTime.UtcNow
            };
        }

        public async Task<SocialGraphInsights> GetSocialGraphInsightsAsync(Guid userId)
        {
            var friends = await _playerService.GetPlayerFriendsAsync(userId);
            var friendIds = friends.Select(f => f.RelatedUserId).ToList();

            // Analyze network structure
            var network = new NetworkStructure
            {
                DirectConnections = friends.Count,
                IndirectConnections = await CalculateIndirectConnections(friendIds),
                ClusteringCoefficient = await CalculateClusteringCoefficient(userId, friendIds),
                Centrality = CalculateCentrality(friends.Count),
                PathLengthToInfluencers = await CalculatePathLengthToInfluencers(userId)
            };

            return new SocialGraphInsights
            {
                UserId = userId,
                Network = network,
                Clusters = await IdentifyCommunityClusters(userId, friendIds),
                Bridges = await IdentifyBridgeConnections(userId, friendIds),
                Influence = await CalculateInfluenceMetrics(userId),
                GrowthOpportunities = await IdentifyGrowthOpportunities(userId, network),
                AnalyzedAt = DateTime.UtcNow
            };
        }

        // Helper Methods
        private async Task<CommunityMatchScore> CalculateCommunityMatchScore(Guid userId, Community community, UserInterestProfile userProfile, DiscoveryPreferences preferences)
        {
            var categoryScores = new Dictionary<string, float>();

            // Interest match
            var interestScore = CalculateInterestMatch(userProfile, community);
            categoryScores["interest"] = interestScore;

            // Social connections
            var friends = await _playerService.GetPlayerFriendsAsync(userId);
            var friendIds = friends.Select(f => f.RelatedUserId).ToList();
            var friendsInCommunity = await _context.CommunityMembers
                .Where(m => m.CommunityId == community.Id && friendIds.Contains(m.UserId))
                .CountAsync();
            var socialScore = Math.Min(friendsInCommunity / 3.0f, 1.0f);
            categoryScores["social"] = socialScore;

            // Activity level match
            var userStats = await _playerService.GetPlayerStatsAsync(userId);
            var activityScore = CalculateActivityMatch(userStats, community);
            categoryScores["activity"] = activityScore;

            // Size preference
            var sizeScore = CalculateSizePreference(userProfile, community.MemberCount);
            categoryScores["size"] = sizeScore;

            // Calculate overall score using weights
            var weights = preferences.CategoryWeights;
            var overallScore = 
                (interestScore * weights.GetValueOrDefault("interest", 0.4f)) +
                (socialScore * weights.GetValueOrDefault("social", 0.3f)) +
                (activityScore * weights.GetValueOrDefault("activity", 0.2f)) +
                (sizeScore * weights.GetValueOrDefault("size", 0.1f));

            return new CommunityMatchScore
            {
                UserId = userId,
                CommunityId = community.Id,
                OverallScore = Math.Min(overallScore, 1.0f),
                CategoryScores = categoryScores,
                MatchReasons = GenerateMatchReasons(categoryScores),
                CompatibilityScore = interestScore,
                ActivityScore = activityScore,
                SocialScore = socialScore,
                CalculatedAt = DateTime.UtcNow
            };
        }

        private async Task<ServerMatchScore> CalculateServerMatchScore(Guid userId, GameServer server, UserInterestProfile userProfile, DiscoveryPreferences preferences)
        {
            var categoryScores = new Dictionary<string, float>();

            // Game preference
            var gameScore = userProfile.PreferredGames.Contains(server.GameType) ? 1.0f : 0.3f;
            categoryScores["game"] = gameScore;

            // Population score (not too empty, not too full)
            var populationRatio = (float)server.PlayerCount / server.MaxPlayers;
            var populationScore = populationRatio switch
            {
                < 0.1f => 0.2f,
                < 0.3f => 0.6f,
                < 0.8f => 1.0f,
                < 0.95f => 0.8f,
                _ => 0.1f
            };
            categoryScores["population"] = populationScore;

            // Community connection
            var communityScore = 0.5f; // Default
            if (server.CommunityId.HasValue)
            {
                var isMember = await _context.CommunityMembers
                    .AnyAsync(m => m.CommunityId == server.CommunityId.Value && m.UserId == userId);
                communityScore = isMember ? 1.0f : 0.3f;
            }
            categoryScores["community"] = communityScore;

            // Calculate overall score
            var overallScore = 
                (gameScore * 0.4f) +
                (populationScore * 0.3f) +
                (communityScore * 0.3f);

            return new ServerMatchScore
            {
                UserId = userId,
                ServerId = server.Id,
                OverallScore = overallScore,
                CategoryScores = categoryScores,
                MatchReasons = GenerateMatchReasons(categoryScores),
                PopularityScore = populationScore,
                CalculatedAt = DateTime.UtcNow
            };
        }

        private async Task<PlayerMatchScore> CalculatePlayerMatchScore(Guid userId, Guid targetUserId, UserInterestProfile userProfile)
        {
            var targetProfile = await GetUserInterestProfileAsync(targetUserId);
            var mutualFriends = await _playerService.GetMutualFriendsAsync(userId, targetUserId);

            var categoryScores = new Dictionary<string, float>();

            // Interest similarity
            var interestSimilarity = CalculateInterestSimilarity(userProfile, targetProfile);
            categoryScores["interests"] = interestSimilarity;

            // Mutual connections
            var mutualScore = Math.Min(mutualFriends.Count / 5.0f, 1.0f);
            categoryScores["mutual_friends"] = mutualScore;

            // Play style compatibility
            var playStyleScore = CalculatePlayStyleCompatibility(userProfile.PlayStyleScores, targetProfile.PlayStyleScores);
            categoryScores["play_style"] = playStyleScore;

            var overallScore = 
                (interestSimilarity * 0.4f) +
                (mutualScore * 0.3f) +
                (playStyleScore * 0.3f);

            return new PlayerMatchScore
            {
                UserId = userId,
                TargetUserId = targetUserId,
                OverallScore = overallScore,
                CategoryScores = categoryScores,
                MutualFriendsCount = mutualFriends.Count,
                SharedInterests = GetSharedInterests(userProfile, targetProfile),
                PlayStyleCompatibility = playStyleScore,
                CalculatedAt = DateTime.UtcNow
            };
        }

        private List<(T item, float score)> ApplySerendipity<T>(List<(T item, float score)> scoredItems, float serendipityLevel, int limit)
        {
            var sortedItems = scoredItems.OrderByDescending(x => x.score).ToList();
            var serendipityCount = (int)(limit * serendipityLevel);
            var regularCount = limit - serendipityCount;

            var result = new List<(T item, float score)>();
            
            // Add top items
            result.AddRange(sortedItems.Take(regularCount));
            
            // Add some lower-ranked items for serendipity
            if (serendipityCount > 0 && sortedItems.Count > regularCount)
            {
                var random = new Random();
                var remaining = sortedItems.Skip(regularCount).ToList();
                for (int i = 0; i < serendipityCount && remaining.Any(); i++)
                {
                    var index = random.Next(remaining.Count);
                    result.Add(remaining[index]);
                    remaining.RemoveAt(index);
                }
            }

            return result.Take(limit).ToList();
        }

        // Additional helper methods would be implemented here...
        // (Simplified for brevity - in production these would be more sophisticated)

        private float CalculateCommunitySimilarity(Community a, Community b)
        {
            var tagSimilarity = a.Tags.Intersect(b.Tags).Count() / (float)a.Tags.Union(b.Tags).Count();
            var gameSimilarity = a.Settings.AllowedGames.Intersect(b.Settings.AllowedGames).Count() / 
                                (float)a.Settings.AllowedGames.Union(b.Settings.AllowedGames).Count();
            
            return (tagSimilarity * 0.6f) + (gameSimilarity * 0.4f);
        }

        private float CalculateGameSimilarity(Game a, Game b)
        {
            var genreSimilarity = a.Genres.Intersect(b.Genres).Count() / (float)a.Genres.Union(b.Genres).Count();
            return genreSimilarity;
        }

        private float CalculateInterestMatch(UserInterestProfile profile, Community community)
        {
            var gameMatch = profile.PreferredGames.Any(g => community.Settings.AllowedGames.Contains(g)) ? 1.0f : 0.0f;
            var tagMatch = profile.PreferredGames.Any(g => community.Tags.Contains(g)) ? 0.8f : 0.0f;
            
            return Math.Max(gameMatch, tagMatch);
        }

        private float CalculateActivityMatch(PlayerStats userStats, Community community)
        {
            // Simplified activity matching logic
            if (community.MemberCount < 10) return userStats.SessionsPlayed < 50 ? 0.8f : 0.3f;
            if (community.MemberCount < 50) return userStats.SessionsPlayed < 200 ? 0.9f : 0.6f;
            return userStats.SessionsPlayed > 100 ? 1.0f : 0.4f;
        }

        private float CalculateSizePreference(UserInterestProfile profile, int memberCount)
        {
            var smallPref = profile.CommunityPreferences.GetValueOrDefault("small", 0.5f);
            var largePref = profile.CommunityPreferences.GetValueOrDefault("large", 0.5f);

            if (memberCount < 20) return smallPref;
            if (memberCount < 100) return (smallPref + largePref) / 2;
            return largePref;
        }

        private List<string> GenerateMatchReasons(Dictionary<string, float> categoryScores)
        {
            var reasons = new List<string>();
            foreach (var score in categoryScores.Where(s => s.Value > 0.7f))
            {
                reasons.Add($"Strong {score.Key} match ({score.Value:P0})");
            }
            return reasons;
        }

        private Dictionary<string, float> GetFactorWeights(DiscoveryPreferences preferences)
        {
            return preferences.CategoryWeights;
        }

        private List<string> GetExplanationFactors(string type, UserInterestProfile profile)
        {
            return new List<string> { $"Based on your {type} preferences", "Your gaming history", "Social connections" };
        }

        private List<DiscoveryFilter> BuildAppliedFilters(DiscoveryRequest request)
        {
            var filters = new List<DiscoveryFilter>();
            
            if (request.PreferredGames.Any())
            {
                filters.Add(new DiscoveryFilter
                {
                    Type = "games",
                    Value = string.Join(",", request.PreferredGames),
                    DisplayName = "Preferred Games"
                });
            }

            return filters;
        }

        private async Task<UserInterestProfile> GenerateInterestProfileFromActivity(Guid userId)
        {
            var sessions = await _context.PlayerSessions
                .Where(s => s.UserId == userId)
                .Include(s => s.Server)
                .ToListAsync();

            var gamePlaytime = sessions
                .GroupBy(s => s.Server.GameType)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.DurationMinutes ?? 0));

            var preferredGames = gamePlaytime
                .OrderByDescending(g => g.Value)
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            // Generate genre scores based on games played
            var genreScores = new Dictionary<string, float>();
            foreach (var game in preferredGames)
            {
                var gameEntity = await _context.Games.FindAsync(game);
                if (gameEntity != null)
                {
                    foreach (var genre in gameEntity.Genres)
                    {
                        genreScores[genre] = genreScores.GetValueOrDefault(genre, 0) + 0.2f;
                    }
                }
            }

            return new UserInterestProfile
            {
                GameGenreScores = genreScores,
                PlayStyleScores = new Dictionary<string, float>
                {
                    ["casual"] = 0.6f,
                    ["competitive"] = 0.4f,
                    ["social"] = 0.5f
                },
                PreferredGames = preferredGames,
                PreferredPlayTimes = GenerateTimeProfile(sessions)
            };
        }

        private TimeProfile GenerateTimeProfile(List<PlayerSession> sessions)
        {
            var playTimes = sessions.GroupBy(s => s.StartTime.DayOfWeek);
            var preferredDays = playTimes
                .OrderByDescending(g => g.Count())
                .Take(3)
                .Select(g => g.Key)
                .ToList();

            return new TimeProfile
            {
                PreferredDays = preferredDays,
                PreferredStartTime = TimeSpan.FromHours(19), // Default evening
                PreferredEndTime = TimeSpan.FromHours(23),
                TimeZone = "UTC"
            };
        }

        private float CalculateProfileCompleteness(UserInterestProfile profile)
        {
            var score = 0f;
            
            if (profile.GameGenreScores.Any()) score += 0.2f;
            if (profile.PlayStyleScores.Any()) score += 0.2f;
            if (profile.PreferredGames.Any()) score += 0.3f;
            if (profile.PreferredPlayTimes != null) score += 0.2f;
            if (profile.FeaturePreferences.Any()) score += 0.1f;

            return score;
        }

        private float CalculatePlayerSimilarity(UserInterestProfile profile1, UserInterestProfile profile2, PlayerStats stats1, PlayerStats stats2)
        {
            var gamesSimilarity = profile1.PreferredGames.Intersect(profile2.PreferredGames).Count() / 
                                 (float)Math.Max(profile1.PreferredGames.Count, profile2.PreferredGames.Count);
            
            var playtimeSimilarity = 1.0f - Math.Abs(stats1.TotalPlayTime - stats2.TotalPlayTime) / 
                                    (float)Math.Max(stats1.TotalPlayTime, stats2.TotalPlayTime);
            
            return (gamesSimilarity * 0.7f) + (playtimeSimilarity * 0.3f);
        }

        private float CalculateSocialScore(int networkSize, int activeConnections, int recentActivity)
        {
            var networkScore = Math.Min(networkSize / 50.0f, 1.0f);
            var activityScore = Math.Min(activeConnections / (float)Math.Max(networkSize, 1), 1.0f);
            var engagementScore = Math.Min(recentActivity / 20.0f, 1.0f);
            
            return (networkScore * 0.4f) + (activityScore * 0.4f) + (engagementScore * 0.2f);
        }

        private async Task<SocialGrowthTrends> CalculateGrowthTrends(Guid userId)
        {
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            var twoWeeksAgo = DateTime.UtcNow.AddDays(-14);

            var thisWeek = await _context.PlayerRelationships
                .Where(r => r.UserId == userId && r.Type == RelationshipType.Friend && 
                           r.AcceptedAt >= oneWeekAgo)
                .CountAsync();

            var lastWeek = await _context.PlayerRelationships
                .Where(r => r.UserId == userId && r.Type == RelationshipType.Friend && 
                           r.AcceptedAt >= twoWeeksAgo && r.AcceptedAt < oneWeekAgo)
                .CountAsync();

            return new SocialGrowthTrends
            {
                NewConnectionsThisWeek = thisWeek,
                NewConnectionsLastWeek = lastWeek,
                GrowthRate = lastWeek > 0 ? (thisWeek - lastWeek) / (float)lastWeek : 0,
                GrowthFactors = new List<string> { "Community activity", "Gaming sessions" }
            };
        }

        private float CalculateInterestSimilarity(UserInterestProfile profile1, UserInterestProfile profile2)
        {
            var gameGenreSim = CalculateDictionarySimilarity(profile1.GameGenreScores, profile2.GameGenreScores);
            var playStyleSim = CalculateDictionarySimilarity(profile1.PlayStyleScores, profile2.PlayStyleScores);
            
            return (gameGenreSim * 0.6f) + (playStyleSim * 0.4f);
        }

        private float CalculatePlayStyleCompatibility(Dictionary<string, float> style1, Dictionary<string, float> style2)
        {
            return CalculateDictionarySimilarity(style1, style2);
        }

        private List<string> GetSharedInterests(UserInterestProfile profile1, UserInterestProfile profile2)
        {
            return profile1.PreferredGames.Intersect(profile2.PreferredGames).ToList();
        }

        private List<string> GetMatchingInterests(UserInterestProfile profile, Community community)
        {
            return profile.PreferredGames.Intersect(community.Settings.AllowedGames).ToList();
        }

        private string GenerateMatchExplanation(UserInterestProfile profile, Community community)
        {
            var matchingGames = GetMatchingInterests(profile, community);
            if (matchingGames.Any())
            {
                return $"You both enjoy {string.Join(", ", matchingGames)}";
            }
            return "Similar community preferences";
        }

        private float CalculateUnexpectedness(UserInterestProfile profile, Community community)
        {
            var hasMatchingGames = profile.PreferredGames.Any(g => community.Settings.AllowedGames.Contains(g));
            return hasMatchingGames ? 0.2f : 0.8f; // Higher if outside usual interests
        }

        private float CalculateDictionarySimilarity(Dictionary<string, float> dict1, Dictionary<string, float> dict2)
        {
            var allKeys = dict1.Keys.Union(dict2.Keys);
            if (!allKeys.Any()) return 0f;

            var similarities = new List<float>();
            foreach (var key in allKeys)
            {
                var val1 = dict1.GetValueOrDefault(key, 0f);
                var val2 = dict2.GetValueOrDefault(key, 0f);
                similarities.Add(1f - Math.Abs(val1 - val2));
            }

            return similarities.Average();
        }

        private async Task UpdateRecommendationWeights(Guid userId, DiscoveryFeedback feedback)
        {
            // In a real implementation, this would use ML to update recommendation weights
            // based on user feedback to improve future recommendations
            _logger.LogInformation("Received feedback for user {UserId}: {Type} on {ItemType}", 
                userId, feedback.Type, feedback.ItemType);
        }

        // Simplified implementations for complex graph analysis methods
        private async Task<int> CalculateIndirectConnections(List<Guid> friendIds)
        {
            return friendIds.Count * 10; // Simplified
        }

        private async Task<float> CalculateClusteringCoefficient(Guid userId, List<Guid> friendIds)
        {
            return 0.3f; // Simplified
        }

        private float CalculateCentrality(int connectionCount)
        {
            return Math.Min(connectionCount / 100.0f, 1.0f);
        }

        private async Task<int> CalculatePathLengthToInfluencers(Guid userId)
        {
            return 3; // Simplified
        }

        private async Task<List<CommunityCluster>> IdentifyCommunityClusters(Guid userId, List<Guid> friendIds)
        {
            return new List<CommunityCluster>(); // Simplified
        }

        private async Task<List<BridgeConnection>> IdentifyBridgeConnections(Guid userId, List<Guid> friendIds)
        {
            return new List<BridgeConnection>(); // Simplified
        }

        private async Task<InfluenceMetrics> CalculateInfluenceMetrics(Guid userId)
        {
            return new InfluenceMetrics
            {
                LocalInfluence = 0.5f,
                GlobalInfluence = 0.1f,
                InfluenceTopics = new List<string> { "Gaming", "Community Building" }
            };
        }

        private async Task<List<GrowthOpportunity>> IdentifyGrowthOpportunities(Guid userId, NetworkStructure network)
        {
            return new List<GrowthOpportunity>
            {
                new GrowthOpportunity
                {
                    Type = "expand_cluster",
                    Description = "Connect with more players in your favorite games",
                    PotentialImpact = 0.7f,
                    ActionSuggestion = "Join active gaming communities"
                }
            };
        }
    }
}