using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;

namespace HomeHost.CloudApi.Services
{
    public class PlayerManagementService : IPlayerManagementService
    {
        private readonly HomeHostContext _context;
        private readonly ILogger<PlayerManagementService> _logger;

        public PlayerManagementService(HomeHostContext context, ILogger<PlayerManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Player Profile Management
        public async Task<PlayerProfile> GetPlayerProfileAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new ArgumentException("User not found");

            var stats = await GetPlayerStatsAsync(userId);
            var reputation = await GetPlayerReputationAsync(userId);
            var presence = await GetPlayerPresenceAsync(userId);
            var achievements = await GetPlayerAchievementsAsync(userId);

            return new PlayerProfile
            {
                UserId = user.Id,
                DisplayName = user.DisplayName,
                Bio = user.Profile?.GetValueOrDefault("bio")?.ToString(),
                AvatarUrl = user.Profile?.GetValueOrDefault("avatarUrl")?.ToString(),
                Country = user.Profile?.GetValueOrDefault("country")?.ToString(),
                FavoriteGames = user.Profile?.GetValueOrDefault("favoriteGames") as List<string> ?? new(),
                PlayingStyles = user.Profile?.GetValueOrDefault("playingStyles") as List<string> ?? new(),
                Preferences = user.Settings ?? new(),
                GlobalStats = stats,
                Reputation = reputation,
                Presence = presence,
                JoinedAt = user.CreatedAt,
                LastActiveAt = user.LastSeen,
                FeaturedAchievements = achievements.Where(a => a.IsFeatured).Take(5).ToList(),
                Privacy = GetPrivacySettings(user.Settings)
            };
        }

        public async Task<PlayerProfile> UpdatePlayerProfileAsync(Guid userId, UpdatePlayerProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new ArgumentException("User not found");

            // Update user properties
            if (!string.IsNullOrEmpty(request.DisplayName))
                user.DisplayName = request.DisplayName;

            // Update profile data
            var profile = user.Profile ?? new Dictionary<string, object>();
            
            if (request.Bio != null)
                profile["bio"] = request.Bio;
            if (request.AvatarUrl != null)
                profile["avatarUrl"] = request.AvatarUrl;
            if (request.Country != null)
                profile["country"] = request.Country;
            if (request.FavoriteGames != null)
                profile["favoriteGames"] = request.FavoriteGames;
            if (request.PlayingStyles != null)
                profile["playingStyles"] = request.PlayingStyles;

            user.Profile = profile;

            // Update preferences and privacy
            if (request.Preferences != null)
            {
                var settings = user.Settings ?? new Dictionary<string, object>();
                foreach (var pref in request.Preferences)
                {
                    settings[pref.Key] = pref.Value;
                }
                user.Settings = settings;
            }

            if (request.Privacy != null)
            {
                var settings = user.Settings ?? new Dictionary<string, object>();
                settings["privacy"] = request.Privacy;
                user.Settings = settings;
            }

            await _context.SaveChangesAsync();

            return await GetPlayerProfileAsync(userId);
        }

        public async Task<List<PlayerAchievement>> GetPlayerAchievementsAsync(Guid userId)
        {
            return await _context.PlayerAchievements
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.UnlockedAt)
                .ToListAsync();
        }

        public async Task<PlayerStats> GetPlayerStatsAsync(Guid userId, Guid? communityId = null)
        {
            var sessions = _context.PlayerSessions.Where(s => s.UserId == userId);
            
            if (communityId.HasValue)
                sessions = sessions.Where(s => s.CommunityId == communityId.Value);

            var sessionList = await sessions.ToListAsync();
            var friendsCount = await _context.PlayerRelationships
                .Where(r => r.UserId == userId && r.Type == RelationshipType.Friend && r.Status == RelationshipStatus.Accepted)
                .CountAsync();

            var communitiesCount = await _context.CommunityMembers
                .Where(m => m.UserId == userId)
                .CountAsync();

            var gamePlayTime = sessionList
                .Where(s => s.EndTime.HasValue)
                .GroupBy(s => s.Server.GameType)
                .ToDictionary(g => g.Key, g => g.Sum(s => s.DurationMinutes ?? 0));

            return new PlayerStats
            {
                UserId = userId,
                CommunityId = communityId,
                TotalPlayTime = sessionList.Where(s => s.DurationMinutes.HasValue).Sum(s => s.DurationMinutes!.Value),
                SessionsPlayed = sessionList.Count,
                ServersJoined = sessionList.Select(s => s.ServerId).Distinct().Count(),
                FriendsCount = friendsCount,
                CommunitiesJoined = communitiesCount,
                AverageSessionLength = sessionList.Where(s => s.DurationMinutes.HasValue).Any() 
                    ? sessionList.Where(s => s.DurationMinutes.HasValue).Average(s => s.DurationMinutes!.Value) 
                    : 0,
                GamePlayTime = gamePlayTime,
                LastUpdated = DateTime.UtcNow
            };
        }

        // Cross-Server Relationships
        public async Task<PlayerRelationship> AddFriendAsync(Guid userId, Guid friendUserId)
        {
            if (userId == friendUserId)
                throw new InvalidOperationException("Cannot add yourself as friend");

            var existingRelationship = await _context.PlayerRelationships
                .FirstOrDefaultAsync(r => 
                    (r.UserId == userId && r.RelatedUserId == friendUserId) ||
                    (r.UserId == friendUserId && r.RelatedUserId == userId));

            if (existingRelationship != null)
            {
                if (existingRelationship.Type == RelationshipType.Friend)
                    throw new InvalidOperationException("Friendship already exists or is pending");
                if (existingRelationship.Type == RelationshipType.Block)
                    throw new InvalidOperationException("Cannot add blocked user as friend");
            }

            var relationship = new PlayerRelationship
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RelatedUserId = friendUserId,
                Type = RelationshipType.Friend,
                Status = RelationshipStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.PlayerRelationships.Add(relationship);
            await _context.SaveChangesAsync();

            // Create activity
            await UpdatePlayerActivityAsync(userId, new PlayerActivityUpdate
            {
                ActivityType = "friend_request_sent",
                Title = "Friend Request Sent",
                Description = $"Sent a friend request to {await GetUserDisplayNameAsync(friendUserId)}",
                RelatedUserId = friendUserId,
                IsVisible = false // Private activity
            });

            _logger.LogInformation("Friend request sent from {UserId} to {FriendUserId}", userId, friendUserId);
            return relationship;
        }

        public async Task<bool> RemoveFriendAsync(Guid userId, Guid friendUserId)
        {
            var relationship = await _context.PlayerRelationships
                .FirstOrDefaultAsync(r => 
                    (r.UserId == userId && r.RelatedUserId == friendUserId) ||
                    (r.UserId == friendUserId && r.RelatedUserId == userId));

            if (relationship == null || relationship.Type != RelationshipType.Friend)
                return false;

            _context.PlayerRelationships.Remove(relationship);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Friendship removed between {UserId} and {FriendUserId}", userId, friendUserId);
            return true;
        }

        public async Task<List<PlayerRelationship>> GetPlayerFriendsAsync(Guid userId)
        {
            return await _context.PlayerRelationships
                .Include(r => r.RelatedUser)
                .Where(r => r.UserId == userId && r.Type == RelationshipType.Friend && r.Status == RelationshipStatus.Accepted)
                .OrderBy(r => r.RelatedUser.DisplayName)
                .ToListAsync();
        }

        public async Task<List<PlayerRelationship>> GetFriendRequestsAsync(Guid userId)
        {
            return await _context.PlayerRelationships
                .Include(r => r.User)
                .Where(r => r.RelatedUserId == userId && r.Type == RelationshipType.Friend && r.Status == RelationshipStatus.Pending)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<PlayerRelationship> AcceptFriendRequestAsync(Guid userId, Guid requesterId)
        {
            var relationship = await _context.PlayerRelationships
                .FirstOrDefaultAsync(r => r.UserId == requesterId && r.RelatedUserId == userId && 
                                        r.Type == RelationshipType.Friend && r.Status == RelationshipStatus.Pending);

            if (relationship == null)
                throw new ArgumentException("Friend request not found");

            relationship.Status = RelationshipStatus.Accepted;
            relationship.AcceptedAt = DateTime.UtcNow;

            // Create reciprocal relationship
            var reciprocal = new PlayerRelationship
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                RelatedUserId = requesterId,
                Type = RelationshipType.Friend,
                Status = RelationshipStatus.Accepted,
                CreatedAt = DateTime.UtcNow,
                AcceptedAt = DateTime.UtcNow
            };

            _context.PlayerRelationships.Add(reciprocal);
            await _context.SaveChangesAsync();

            // Create activities
            await UpdatePlayerActivityAsync(userId, new PlayerActivityUpdate
            {
                ActivityType = "friend_added",
                Title = "New Friend",
                Description = $"Added {await GetUserDisplayNameAsync(requesterId)} as a friend",
                RelatedUserId = requesterId
            });

            _logger.LogInformation("Friend request accepted: {RequesterId} -> {UserId}", requesterId, userId);
            return relationship;
        }

        public async Task<bool> DeclineFriendRequestAsync(Guid userId, Guid requesterId)
        {
            var relationship = await _context.PlayerRelationships
                .FirstOrDefaultAsync(r => r.UserId == requesterId && r.RelatedUserId == userId && 
                                        r.Type == RelationshipType.Friend && r.Status == RelationshipStatus.Pending);

            if (relationship == null)
                return false;

            relationship.Status = RelationshipStatus.Declined;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<PlayerRelationship> BlockPlayerAsync(Guid userId, Guid blockedUserId)
        {
            if (userId == blockedUserId)
                throw new InvalidOperationException("Cannot block yourself");

            // Remove any existing friendship
            var existingFriendship = await _context.PlayerRelationships
                .Where(r => ((r.UserId == userId && r.RelatedUserId == blockedUserId) ||
                           (r.UserId == blockedUserId && r.RelatedUserId == userId)) &&
                           r.Type == RelationshipType.Friend)
                .ToListAsync();

            _context.PlayerRelationships.RemoveRange(existingFriendship);

            // Create or update block relationship
            var blockRelationship = await _context.PlayerRelationships
                .FirstOrDefaultAsync(r => r.UserId == userId && r.RelatedUserId == blockedUserId);

            if (blockRelationship == null)
            {
                blockRelationship = new PlayerRelationship
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    RelatedUserId = blockedUserId,
                    Type = RelationshipType.Block,
                    Status = RelationshipStatus.Active,
                    CreatedAt = DateTime.UtcNow
                };
                _context.PlayerRelationships.Add(blockRelationship);
            }
            else
            {
                blockRelationship.Type = RelationshipType.Block;
                blockRelationship.Status = RelationshipStatus.Active;
            }

            await _context.SaveChangesAsync();
            return blockRelationship;
        }

        public async Task<bool> UnblockPlayerAsync(Guid userId, Guid blockedUserId)
        {
            var relationship = await _context.PlayerRelationships
                .FirstOrDefaultAsync(r => r.UserId == userId && r.RelatedUserId == blockedUserId && r.Type == RelationshipType.Block);

            if (relationship == null)
                return false;

            _context.PlayerRelationships.Remove(relationship);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<PlayerRelationship>> GetBlockedPlayersAsync(Guid userId)
        {
            return await _context.PlayerRelationships
                .Include(r => r.RelatedUser)
                .Where(r => r.UserId == userId && r.Type == RelationshipType.Block)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        // Reputation System
        public async Task<PlayerReputation> GetPlayerReputationAsync(Guid userId, Guid? communityId = null)
        {
            var reputationEntries = _context.ReputationEntries.Where(r => r.ToUserId == userId);
            
            if (communityId.HasValue)
                reputationEntries = reputationEntries.Where(r => r.CommunityId == communityId.Value);

            var entries = await reputationEntries.ToListAsync();

            var categoryScores = entries
                .SelectMany(e => e.CategoryScores)
                .GroupBy(cs => cs.Key)
                .ToDictionary(g => g.Key, g => g.Average(cs => cs.Value));

            return new PlayerReputation
            {
                UserId = userId,
                CommunityId = communityId,
                OverallScore = entries.Any() ? (int)entries.Average(e => e.Score) : 0,
                HelpfulnessScore = (int)(categoryScores.GetValueOrDefault("helpfulness", 0) * 20), // Scale to 0-100
                FriendlinessScore = (int)(categoryScores.GetValueOrDefault("friendliness", 0) * 20),
                SkillScore = (int)(categoryScores.GetValueOrDefault("skill", 0) * 20),
                ReliabilityScore = (int)(categoryScores.GetValueOrDefault("reliability", 0) * 20),
                TotalReviews = entries.Count,
                RecentBadges = await GetRecentBadgesAsync(userId),
                LastUpdated = DateTime.UtcNow
            };
        }

        public async Task<ReputationEntry> AddReputationAsync(Guid fromUserId, Guid toUserId, AddReputationRequest request)
        {
            if (fromUserId == toUserId)
                throw new InvalidOperationException("Cannot give reputation to yourself");

            if (request.Score < -5 || request.Score > 5)
                throw new ArgumentException("Score must be between -5 and 5");

            // Check if user can give reputation (e.g., has played together recently)
            var canGive = await CanGiveReputationAsync(fromUserId, toUserId);
            if (!canGive)
                throw new InvalidOperationException("Cannot give reputation to this player at this time");

            var entry = new ReputationEntry
            {
                Id = Guid.NewGuid(),
                FromUserId = fromUserId,
                ToUserId = toUserId,
                CommunityId = request.CommunityId,
                ServerId = request.ServerId,
                Type = request.Type,
                Score = request.Score,
                Comment = request.Comment,
                CategoryScores = request.CategoryScores ?? new(),
                CreatedAt = DateTime.UtcNow,
                IsAnonymous = request.IsAnonymous
            };

            _context.ReputationEntries.Add(entry);
            await _context.SaveChangesAsync();

            // Create activity if positive reputation
            if (request.Score > 0)
            {
                await UpdatePlayerActivityAsync(toUserId, new PlayerActivityUpdate
                {
                    ActivityType = "reputation_gained",
                    Title = "Reputation Gained",
                    Description = $"Received positive reputation (+{request.Score})",
                    RelatedUserId = request.IsAnonymous ? null : fromUserId,
                    CommunityId = request.CommunityId,
                    ServerId = request.ServerId
                });
            }

            _logger.LogInformation("Reputation given: {FromUserId} -> {ToUserId}, Score: {Score}", fromUserId, toUserId, request.Score);
            return entry;
        }

        public async Task<List<ReputationEntry>> GetReputationHistoryAsync(Guid userId, int page = 1, int pageSize = 20)
        {
            return await _context.ReputationEntries
                .Include(r => r.FromUser)
                .Include(r => r.Community)
                .Include(r => r.Server)
                .Where(r => r.ToUserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<bool> CanGiveReputationAsync(Guid fromUserId, Guid toUserId)
        {
            // Check if users have played together in the last 7 days
            var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
            var playedTogether = await _context.PlayerSessions
                .Where(s => s.UserId == fromUserId && s.StartTime >= oneWeekAgo && s.PlayedWith.Contains(toUserId))
                .AnyAsync();

            if (!playedTogether)
                return false;

            // Check if reputation was already given in the last 24 hours
            var oneDayAgo = DateTime.UtcNow.AddDays(-1);
            var recentReputation = await _context.ReputationEntries
                .Where(r => r.FromUserId == fromUserId && r.ToUserId == toUserId && r.CreatedAt >= oneDayAgo)
                .AnyAsync();

            return !recentReputation;
        }

        public async Task<ReputationSummary> GetReputationSummaryAsync(Guid userId)
        {
            var entries = await _context.ReputationEntries
                .Where(r => r.ToUserId == userId)
                .ToListAsync();

            var recent = entries.Where(e => e.CreatedAt >= DateTime.UtcNow.AddDays(-30)).ToList();

            return new ReputationSummary
            {
                UserId = userId,
                OverallScore = entries.Any() ? (int)entries.Average(e => e.Score) : 0,
                TotalReviews = entries.Count,
                CategoryAverages = entries
                    .SelectMany(e => e.CategoryScores)
                    .GroupBy(cs => cs.Key)
                    .ToDictionary(g => g.Key, g => (float)g.Average(cs => cs.Value)),
                TopBadges = await GetTopBadgesAsync(userId),
                RecentPositiveReviews = recent.Count(e => e.Score > 0),
                RecentNegativeReviews = recent.Count(e => e.Score < 0),
                RecentComments = recent
                    .Where(e => !string.IsNullOrEmpty(e.Comment))
                    .OrderByDescending(e => e.CreatedAt)
                    .Take(5)
                    .Select(e => e.Comment!)
                    .ToList()
            };
        }

        // Cross-Server Sessions
        public async Task<PlayerSession> StartPlayerSessionAsync(Guid userId, Guid serverId, StartSessionRequest request)
        {
            var server = await _context.GameServers.FindAsync(serverId);
            if (server == null)
                throw new ArgumentException("Server not found");

            var session = new PlayerSession
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ServerId = serverId,
                CommunityId = server.CommunityId,
                StartTime = DateTime.UtcNow,
                GameMode = request.GameMode,
                SessionData = request.InitialData ?? new()
            };

            _context.PlayerSessions.Add(session);
            await _context.SaveChangesAsync();

            // Update player presence
            await UpdatePlayerPresenceAsync(userId, new UpdatePresenceRequest
            {
                Status = PresenceStatus.InGame,
                CurrentServerId = serverId,
                CurrentGame = server.GameType
            });

            _logger.LogInformation("Player session started: {UserId} on server {ServerId}", userId, serverId);
            return session;
        }

        public async Task<PlayerSession> EndPlayerSessionAsync(Guid sessionId, EndSessionRequest request)
        {
            var session = await _context.PlayerSessions.FindAsync(sessionId);
            if (session == null)
                throw new ArgumentException("Session not found");

            if (session.EndTime.HasValue)
                throw new InvalidOperationException("Session already ended");

            session.EndTime = DateTime.UtcNow;
            session.DurationMinutes = (int)(session.EndTime.Value - session.StartTime).TotalMinutes;
            session.DisconnectReason = request.DisconnectReason;

            if (request.SessionData != null)
            {
                foreach (var data in request.SessionData)
                {
                    session.SessionData[data.Key] = data.Value;
                }
            }

            await _context.SaveChangesAsync();

            // Update player presence
            await UpdatePlayerPresenceAsync(session.UserId, new UpdatePresenceRequest
            {
                Status = PresenceStatus.Online,
                CurrentServerId = null,
                CurrentGame = null
            });

            _logger.LogInformation("Player session ended: {SessionId}, Duration: {Duration} minutes", sessionId, session.DurationMinutes);
            return session;
        }

        public async Task<List<PlayerSession>> GetPlayerSessionHistoryAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.PlayerSessions
                .Include(s => s.Server)
                .Include(s => s.Community)
                .Where(s => s.UserId == userId);

            if (startDate.HasValue)
                query = query.Where(s => s.StartTime >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(s => s.StartTime <= endDate.Value);

            return await query
                .OrderByDescending(s => s.StartTime)
                .ToListAsync();
        }

        public async Task<List<PlayerSession>> GetActivePlayerSessionsAsync(Guid userId)
        {
            return await _context.PlayerSessions
                .Include(s => s.Server)
                .Include(s => s.Community)
                .Where(s => s.UserId == userId && !s.EndTime.HasValue)
                .ToListAsync();
        }

        public async Task<ServerPlayerInfo> GetPlayerInfoOnServerAsync(Guid userId, Guid serverId)
        {
            var sessions = await _context.PlayerSessions
                .Where(s => s.UserId == userId && s.ServerId == serverId)
                .ToListAsync();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new ArgumentException("User not found");

            var totalPlayTime = sessions.Where(s => s.DurationMinutes.HasValue).Sum(s => s.DurationMinutes!.Value);
            var firstSession = sessions.MinBy(s => s.StartTime);
            var lastSession = sessions.MaxBy(s => s.StartTime);

            return new ServerPlayerInfo
            {
                UserId = userId,
                ServerId = serverId,
                DisplayName = user.DisplayName,
                Role = PlayerRole.Player, // TODO: Implement server-specific roles
                FirstJoined = firstSession?.StartTime ?? DateTime.UtcNow,
                LastPlayed = lastSession?.StartTime ?? DateTime.UtcNow,
                TotalPlayTime = totalPlayTime,
                SessionCount = sessions.Count,
                ServerStats = CalculateServerStats(sessions)
            };
        }

        // Player Discovery
        public async Task<List<PlayerProfile>> SearchPlayersAsync(PlayerSearchRequest request)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(request.Query))
            {
                query = query.Where(u => u.DisplayName.Contains(request.Query) || 
                                       u.Email.Contains(request.Query));
            }

            // Apply filters based on profile data
            if (request.Games.Any())
            {
                // This would need to be implemented based on how profile data is stored
                // For now, simplified version
            }

            if (request.OnlineOnly)
            {
                var recentThreshold = DateTime.UtcNow.AddMinutes(-30);
                query = query.Where(u => u.LastSeen >= recentThreshold);
            }

            var users = await query
                .Skip((request.Page - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync();

            var profiles = new List<PlayerProfile>();
            foreach (var user in users)
            {
                profiles.Add(await GetPlayerProfileAsync(user.Id));
            }

            return profiles;
        }

        public async Task<List<PlayerProfile>> GetRecommendedPlayersAsync(Guid userId, int limit = 10)
        {
            // Get user's friends to find mutual connections
            var userFriends = await GetPlayerFriendsAsync(userId);
            var friendIds = userFriends.Select(f => f.RelatedUserId).ToList();

            // Find friends of friends who aren't already friends
            var recommendations = await _context.PlayerRelationships
                .Where(r => friendIds.Contains(r.UserId) && 
                           r.Type == RelationshipType.Friend && 
                           r.Status == RelationshipStatus.Accepted &&
                           r.RelatedUserId != userId)
                .Select(r => r.RelatedUserId)
                .Distinct()
                .Take(limit)
                .ToListAsync();

            var profiles = new List<PlayerProfile>();
            foreach (var recommendedUserId in recommendations)
            {
                profiles.Add(await GetPlayerProfileAsync(recommendedUserId));
            }

            return profiles;
        }

        public async Task<List<PlayerProfile>> GetPlayersOnServerAsync(Guid serverId)
        {
            var recentThreshold = DateTime.UtcNow.AddHours(-1);
            var activeSessions = await _context.PlayerSessions
                .Where(s => s.ServerId == serverId && !s.EndTime.HasValue)
                .Select(s => s.UserId)
                .ToListAsync();

            var profiles = new List<PlayerProfile>();
            foreach (var userId in activeSessions)
            {
                profiles.Add(await GetPlayerProfileAsync(userId));
            }

            return profiles;
        }

        public async Task<List<PlayerProfile>> GetMutualFriendsAsync(Guid userId, Guid otherUserId)
        {
            var userFriends = await GetPlayerFriendsAsync(userId);
            var otherFriends = await GetPlayerFriendsAsync(otherUserId);

            var mutualFriendIds = userFriends
                .Select(f => f.RelatedUserId)
                .Intersect(otherFriends.Select(f => f.RelatedUserId))
                .ToList();

            var profiles = new List<PlayerProfile>();
            foreach (var friendId in mutualFriendIds)
            {
                profiles.Add(await GetPlayerProfileAsync(friendId));
            }

            return profiles;
        }

        // Player Activity Tracking
        public async Task<bool> UpdatePlayerActivityAsync(Guid userId, PlayerActivityUpdate activity)
        {
            var playerActivity = new PlayerActivity
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ActivityType = activity.ActivityType,
                Title = activity.Title,
                Description = activity.Description,
                ServerId = activity.ServerId,
                ServerName = activity.ServerId.HasValue ? await GetServerNameAsync(activity.ServerId.Value) : null,
                CommunityId = activity.CommunityId,
                CommunityName = activity.CommunityId.HasValue ? await GetCommunityNameAsync(activity.CommunityId.Value) : null,
                RelatedUserId = activity.RelatedUserId,
                RelatedUserName = activity.RelatedUserId.HasValue ? await GetUserDisplayNameAsync(activity.RelatedUserId.Value) : null,
                Metadata = activity.Metadata ?? new(),
                CreatedAt = DateTime.UtcNow,
                IsVisible = activity.IsVisible
            };

            _context.PlayerActivities.Add(playerActivity);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<PlayerActivity>> GetPlayerActivitiesAsync(Guid userId, int limit = 20)
        {
            return await _context.PlayerActivities
                .Where(a => a.UserId == userId && a.IsVisible)
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<PlayerActivity>> GetFriendsActivitiesAsync(Guid userId, int limit = 50)
        {
            var friends = await GetPlayerFriendsAsync(userId);
            var friendIds = friends.Select(f => f.RelatedUserId).ToList();

            return await _context.PlayerActivities
                .Where(a => friendIds.Contains(a.UserId) && a.IsVisible)
                .OrderByDescending(a => a.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<PlayerPresence> GetPlayerPresenceAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new ArgumentException("User not found");

            var activeSession = await _context.PlayerSessions
                .Include(s => s.Server)
                .FirstOrDefaultAsync(s => s.UserId == userId && !s.EndTime.HasValue);

            var recentThreshold = DateTime.UtcNow.AddMinutes(-15);
            var status = user.LastSeen >= recentThreshold ? PresenceStatus.Online : PresenceStatus.Offline;

            if (activeSession != null)
                status = PresenceStatus.InGame;

            return new PlayerPresence
            {
                UserId = userId,
                Status = status,
                StatusMessage = user.Settings?.GetValueOrDefault("statusMessage")?.ToString(),
                CurrentServerId = activeSession?.ServerId,
                CurrentServerName = activeSession?.Server?.Name,
                CurrentGame = activeSession?.Server?.GameType,
                LastSeen = user.LastSeen,
                IsVisible = GetPrivacySettings(user.Settings).ShowOnlineStatus
            };
        }

        public async Task<bool> UpdatePlayerPresenceAsync(Guid userId, UpdatePresenceRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            var settings = user.Settings ?? new Dictionary<string, object>();
            settings["presenceStatus"] = request.Status.ToString();
            settings["statusMessage"] = request.StatusMessage;
            settings["currentServerId"] = request.CurrentServerId?.ToString();
            settings["currentGame"] = request.CurrentGame;
            settings["presenceVisible"] = request.IsVisible;

            user.Settings = settings;
            user.LastSeen = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // Community Player Management
        public async Task<List<PlayerProfile>> GetCommunityPlayersAsync(Guid communityId, int page = 1, int pageSize = 50)
        {
            var memberIds = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => m.UserId)
                .ToListAsync();

            var profiles = new List<PlayerProfile>();
            foreach (var userId in memberIds)
            {
                profiles.Add(await GetPlayerProfileAsync(userId));
            }

            return profiles;
        }

        public async Task<CommunityPlayerStats> GetCommunityPlayerStatsAsync(Guid userId, Guid communityId)
        {
            var member = await _context.CommunityMembers
                .FirstOrDefaultAsync(m => m.UserId == userId && m.CommunityId == communityId);

            if (member == null)
                throw new ArgumentException("User is not a member of this community");

            var stats = await GetPlayerStatsAsync(userId, communityId);
            var reputation = await GetPlayerReputationAsync(userId, communityId);
            var achievements = await _context.PlayerAchievements
                .Where(a => a.UserId == userId && a.CommunityId == communityId)
                .ToListAsync();

            return new CommunityPlayerStats
            {
                UserId = userId,
                CommunityId = communityId,
                JoinedAt = member.JoinedAt,
                TotalPlayTime = stats.TotalPlayTime,
                ServersPlayed = stats.ServersJoined,
                SessionsPlayed = stats.SessionsPlayed,
                Reputation = reputation,
                Achievements = achievements,
                GameStats = stats.GamePlayTime,
                Rank = await CalculateCommunityRankAsync(userId, communityId),
                Badges = await GetPlayerBadgesAsync(userId, communityId)
            };
        }

        public async Task<List<CommunityLeaderboard>> GetCommunityLeaderboardsAsync(Guid communityId)
        {
            var leaderboards = new List<CommunityLeaderboard>();

            // Playtime leaderboard
            var playtimeEntries = await GetPlaytimeLeaderboardAsync(communityId);
            leaderboards.Add(new CommunityLeaderboard
            {
                Category = "playtime",
                DisplayName = "Most Active Players",
                Entries = playtimeEntries,
                LastUpdated = DateTime.UtcNow
            });

            // Reputation leaderboard
            var reputationEntries = await GetReputationLeaderboardAsync(communityId);
            leaderboards.Add(new CommunityLeaderboard
            {
                Category = "reputation",
                DisplayName = "Highest Reputation",
                Entries = reputationEntries,
                LastUpdated = DateTime.UtcNow
            });

            return leaderboards;
        }

        public async Task<bool> BanPlayerFromCommunityAsync(Guid communityId, Guid userId, Guid adminUserId, BanPlayerRequest request)
        {
            // Implementation would integrate with community service ban functionality
            // This is a simplified version
            var communityBan = new CommunityBan
            {
                Id = Guid.NewGuid(),
                CommunityId = communityId,
                UserId = userId,
                BannedByUserId = adminUserId,
                Reason = request.Reason,
                BannedAt = DateTime.UtcNow,
                ExpiresAt = request.ExpiresAt,
                IsActive = true
            };

            _context.CommunityBans.Add(communityBan);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UnbanPlayerFromCommunityAsync(Guid communityId, Guid userId, Guid adminUserId)
        {
            var ban = await _context.CommunityBans
                .FirstOrDefaultAsync(b => b.CommunityId == communityId && b.UserId == userId && b.IsActive);

            if (ban == null)
                return false;

            ban.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        // Cross-Server Messaging
        public async Task<PlayerMessage> SendPlayerMessageAsync(Guid fromUserId, Guid toUserId, SendMessageRequest request)
        {
            // Check if users are blocked
            var isBlocked = await _context.PlayerRelationships
                .AnyAsync(r => r.UserId == toUserId && r.RelatedUserId == fromUserId && r.Type == RelationshipType.Block);

            if (isBlocked)
                throw new InvalidOperationException("Cannot send message to user who has blocked you");

            // Get or create conversation
            var conversation = await GetOrCreateConversationAsync(fromUserId, toUserId);

            var message = new PlayerMessage
            {
                Id = Guid.NewGuid(),
                FromUserId = fromUserId,
                ToUserId = toUserId,
                ConversationId = conversation.Id,
                Content = request.Content,
                Type = request.Type,
                SentAt = DateTime.UtcNow,
                Attachments = request.Attachments
            };

            _context.PlayerMessages.Add(message);

            // Update conversation
            conversation.LastMessageAt = DateTime.UtcNow;
            conversation.LastMessagePreview = request.Content.Length > 50 ? 
                request.Content.Substring(0, 50) + "..." : request.Content;
            conversation.UnreadCount++;

            await _context.SaveChangesAsync();

            return message;
        }

        public async Task<List<PlayerMessage>> GetPlayerMessagesAsync(Guid userId, Guid otherUserId, int page = 1, int pageSize = 20)
        {
            var conversation = await _context.PlayerConversations
                .FirstOrDefaultAsync(c => 
                    (c.User1Id == userId && c.User2Id == otherUserId) ||
                    (c.User1Id == otherUserId && c.User2Id == userId));

            if (conversation == null)
                return new List<PlayerMessage>();

            return await _context.PlayerMessages
                .Include(m => m.FromUser)
                .Where(m => m.ConversationId == conversation.Id && !m.IsDeleted)
                .OrderByDescending(m => m.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<PlayerConversation>> GetPlayerConversationsAsync(Guid userId)
        {
            return await _context.PlayerConversations
                .Include(c => c.User1)
                .Include(c => c.User2)
                .Where(c => c.User1Id == userId || c.User2Id == userId)
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();
        }

        public async Task<bool> MarkMessagesAsReadAsync(Guid userId, Guid conversationId)
        {
            var conversation = await _context.PlayerConversations.FindAsync(conversationId);
            if (conversation == null || (conversation.User1Id != userId && conversation.User2Id != userId))
                return false;

            var unreadMessages = await _context.PlayerMessages
                .Where(m => m.ConversationId == conversationId && m.ToUserId == userId && !m.ReadAt.HasValue)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.ReadAt = DateTime.UtcNow;
            }

            conversation.UnreadCount = 0;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteConversationAsync(Guid userId, Guid conversationId)
        {
            var conversation = await _context.PlayerConversations.FindAsync(conversationId);
            if (conversation == null || (conversation.User1Id != userId && conversation.User2Id != userId))
                return false;

            _context.PlayerConversations.Remove(conversation);
            await _context.SaveChangesAsync();

            return true;
        }

        // Helper Methods
        private PrivacySettings GetPrivacySettings(Dictionary<string, object>? settings)
        {
            if (settings?.TryGetValue("privacy", out var privacyObj) == true && privacyObj is PrivacySettings privacy)
                return privacy;

            return new PrivacySettings(); // Default settings
        }

        private async Task<string> GetUserDisplayNameAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            return user?.DisplayName ?? "Unknown User";
        }

        private async Task<string?> GetServerNameAsync(Guid serverId)
        {
            var server = await _context.GameServers.FindAsync(serverId);
            return server?.Name;
        }

        private async Task<string?> GetCommunityNameAsync(Guid communityId)
        {
            var community = await _context.Communities.FindAsync(communityId);
            return community?.Name;
        }

        private async Task<List<string>> GetRecentBadgesAsync(Guid userId)
        {
            // This would be implemented based on achievement/badge system
            return new List<string> { "Helpful Player", "Team Player" };
        }

        private async Task<List<string>> GetTopBadgesAsync(Guid userId)
        {
            // This would be implemented based on achievement/badge system
            return new List<string> { "Veteran Player", "Community Builder", "Helpful" };
        }

        private Dictionary<string, object> CalculateServerStats(List<PlayerSession> sessions)
        {
            return new Dictionary<string, object>
            {
                ["averageSessionLength"] = sessions.Where(s => s.DurationMinutes.HasValue).Any() 
                    ? sessions.Where(s => s.DurationMinutes.HasValue).Average(s => s.DurationMinutes!.Value) 
                    : 0,
                ["longestSession"] = sessions.Where(s => s.DurationMinutes.HasValue).Any()
                    ? sessions.Where(s => s.DurationMinutes.HasValue).Max(s => s.DurationMinutes!.Value)
                    : 0
            };
        }

        private async Task<int> CalculateCommunityRankAsync(Guid userId, Guid communityId)
        {
            // Calculate rank based on playtime, reputation, etc.
            // This is a simplified implementation
            var userStats = await GetPlayerStatsAsync(userId, communityId);
            var allMemberStats = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .CountAsync();

            // Simplified ranking - would be more complex in reality
            return Math.Max(1, allMemberStats / 10);
        }

        private async Task<List<string>> GetPlayerBadgesAsync(Guid userId, Guid communityId)
        {
            // This would be implemented based on achievements and milestones
            return new List<string> { "Active Member", "Team Player" };
        }

        private async Task<List<LeaderboardEntry>> GetPlaytimeLeaderboardAsync(Guid communityId)
        {
            var memberStats = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .Select(m => new { m.UserId, m.User.DisplayName })
                .ToListAsync();

            var entries = new List<LeaderboardEntry>();
            int rank = 1;

            foreach (var member in memberStats.Take(10))
            {
                var stats = await GetPlayerStatsAsync(member.UserId, communityId);
                entries.Add(new LeaderboardEntry
                {
                    Rank = rank++,
                    UserId = member.UserId,
                    DisplayName = member.DisplayName,
                    Score = stats.TotalPlayTime,
                    Suffix = "hours"
                });
            }

            return entries.OrderByDescending(e => e.Score).ToList();
        }

        private async Task<List<LeaderboardEntry>> GetReputationLeaderboardAsync(Guid communityId)
        {
            var memberStats = await _context.CommunityMembers
                .Where(m => m.CommunityId == communityId)
                .Select(m => new { m.UserId, m.User.DisplayName })
                .ToListAsync();

            var entries = new List<LeaderboardEntry>();
            int rank = 1;

            foreach (var member in memberStats.Take(10))
            {
                var reputation = await GetPlayerReputationAsync(member.UserId, communityId);
                entries.Add(new LeaderboardEntry
                {
                    Rank = rank++,
                    UserId = member.UserId,
                    DisplayName = member.DisplayName,
                    Score = reputation.OverallScore,
                    Suffix = "points"
                });
            }

            return entries.OrderByDescending(e => e.Score).ToList();
        }

        private async Task<PlayerConversation> GetOrCreateConversationAsync(Guid user1Id, Guid user2Id)
        {
            var conversation = await _context.PlayerConversations
                .FirstOrDefaultAsync(c => 
                    (c.User1Id == user1Id && c.User2Id == user2Id) ||
                    (c.User1Id == user2Id && c.User2Id == user1Id));

            if (conversation == null)
            {
                conversation = new PlayerConversation
                {
                    Id = Guid.NewGuid(),
                    User1Id = user1Id,
                    User2Id = user2Id,
                    CreatedAt = DateTime.UtcNow,
                    LastMessageAt = DateTime.UtcNow
                };

                _context.PlayerConversations.Add(conversation);
                await _context.SaveChangesAsync();
            }

            return conversation;
        }
    }
}