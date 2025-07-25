using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IPlayerManagementService
    {
        // Player Profile Management
        Task<PlayerProfile> GetPlayerProfileAsync(Guid userId);
        Task<PlayerProfile> UpdatePlayerProfileAsync(Guid userId, UpdatePlayerProfileRequest request);
        Task<List<PlayerAchievement>> GetPlayerAchievementsAsync(Guid userId);
        Task<PlayerStats> GetPlayerStatsAsync(Guid userId, Guid? communityId = null);
        
        // Cross-Server Relationships
        Task<PlayerRelationship> AddFriendAsync(Guid userId, Guid friendUserId);
        Task<bool> RemoveFriendAsync(Guid userId, Guid friendUserId);
        Task<List<PlayerRelationship>> GetPlayerFriendsAsync(Guid userId);
        Task<List<PlayerRelationship>> GetFriendRequestsAsync(Guid userId);
        Task<PlayerRelationship> AcceptFriendRequestAsync(Guid userId, Guid requesterId);
        Task<bool> DeclineFriendRequestAsync(Guid userId, Guid requesterId);
        Task<PlayerRelationship> BlockPlayerAsync(Guid userId, Guid blockedUserId);
        Task<bool> UnblockPlayerAsync(Guid userId, Guid blockedUserId);
        Task<List<PlayerRelationship>> GetBlockedPlayersAsync(Guid userId);
        
        // Reputation System
        Task<PlayerReputation> GetPlayerReputationAsync(Guid userId, Guid? communityId = null);
        Task<ReputationEntry> AddReputationAsync(Guid fromUserId, Guid toUserId, AddReputationRequest request);
        Task<List<ReputationEntry>> GetReputationHistoryAsync(Guid userId, int page = 1, int pageSize = 20);
        Task<bool> CanGiveReputationAsync(Guid fromUserId, Guid toUserId);
        Task<ReputationSummary> GetReputationSummaryAsync(Guid userId);
        
        // Cross-Server Sessions
        Task<PlayerSession> StartPlayerSessionAsync(Guid userId, Guid serverId, StartSessionRequest request);
        Task<PlayerSession> EndPlayerSessionAsync(Guid sessionId, EndSessionRequest request);
        Task<List<PlayerSession>> GetPlayerSessionHistoryAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<List<PlayerSession>> GetActivePlayerSessionsAsync(Guid userId);
        Task<ServerPlayerInfo> GetPlayerInfoOnServerAsync(Guid userId, Guid serverId);
        
        // Player Discovery
        Task<List<PlayerProfile>> SearchPlayersAsync(PlayerSearchRequest request);
        Task<List<PlayerProfile>> GetRecommendedPlayersAsync(Guid userId, int limit = 10);
        Task<List<PlayerProfile>> GetPlayersOnServerAsync(Guid serverId);
        Task<List<PlayerProfile>> GetMutualFriendsAsync(Guid userId, Guid otherUserId);
        
        // Player Activity Tracking
        Task<bool> UpdatePlayerActivityAsync(Guid userId, PlayerActivityUpdate activity);
        Task<List<PlayerActivity>> GetPlayerActivitiesAsync(Guid userId, int limit = 20);
        Task<List<PlayerActivity>> GetFriendsActivitiesAsync(Guid userId, int limit = 50);
        Task<PlayerPresence> GetPlayerPresenceAsync(Guid userId);
        Task<bool> UpdatePlayerPresenceAsync(Guid userId, UpdatePresenceRequest request);
        
        // Community Player Management
        Task<List<PlayerProfile>> GetCommunityPlayersAsync(Guid communityId, int page = 1, int pageSize = 50);
        Task<CommunityPlayerStats> GetCommunityPlayerStatsAsync(Guid userId, Guid communityId);
        Task<List<CommunityLeaderboard>> GetCommunityLeaderboardsAsync(Guid communityId);
        Task<bool> BanPlayerFromCommunityAsync(Guid communityId, Guid userId, Guid adminUserId, BanPlayerRequest request);
        Task<bool> UnbanPlayerFromCommunityAsync(Guid communityId, Guid userId, Guid adminUserId);
        
        // Cross-Server Messaging
        Task<PlayerMessage> SendPlayerMessageAsync(Guid fromUserId, Guid toUserId, SendMessageRequest request);
        Task<List<PlayerMessage>> GetPlayerMessagesAsync(Guid userId, Guid otherUserId, int page = 1, int pageSize = 20);
        Task<List<PlayerConversation>> GetPlayerConversationsAsync(Guid userId);
        Task<bool> MarkMessagesAsReadAsync(Guid userId, Guid conversationId);
        Task<bool> DeleteConversationAsync(Guid userId, Guid conversationId);
    }

    // Data Models
    public class PlayerProfile
    {
        public Guid UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Country { get; set; }
        public List<string> FavoriteGames { get; set; } = new();
        public List<string> PlayingStyles { get; set; } = new(); // "casual", "competitive", "social", "hardcore"
        public Dictionary<string, object> Preferences { get; set; } = new();
        public PlayerStats GlobalStats { get; set; } = new();
        public PlayerReputation Reputation { get; set; } = new();
        public PlayerPresence Presence { get; set; } = new();
        public DateTime JoinedAt { get; set; }
        public DateTime LastActiveAt { get; set; }
        public List<PlayerAchievement> FeaturedAchievements { get; set; } = new();
        public PrivacySettings Privacy { get; set; } = new();
    }

    public class PlayerStats
    {
        public Guid UserId { get; set; }
        public Guid? CommunityId { get; set; }
        public int TotalPlayTime { get; set; } // In minutes
        public int SessionsPlayed { get; set; }
        public int ServersJoined { get; set; }
        public int FriendsCount { get; set; }
        public int CommunitiesJoined { get; set; }
        public float AverageSessionLength { get; set; } // In minutes
        public Dictionary<string, int> GamePlayTime { get; set; } = new(); // Game -> minutes
        public Dictionary<string, object> CustomStats { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class PlayerRelationship
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid RelatedUserId { get; set; }
        public RelationshipType Type { get; set; }
        public RelationshipStatus Status { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public Guid? CommunityId { get; set; } // If relationship is community-specific
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual User RelatedUser { get; set; } = null!;
        public virtual Community? Community { get; set; }
    }

    public class PlayerReputation
    {
        public Guid UserId { get; set; }
        public Guid? CommunityId { get; set; }
        public int OverallScore { get; set; }
        public int HelpfulnessScore { get; set; }
        public int FriendlinessScore { get; set; }
        public int SkillScore { get; set; }
        public int ReliabilityScore { get; set; }
        public int TotalReviews { get; set; }
        public List<string> RecentBadges { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class ReputationEntry
    {
        public Guid Id { get; set; }
        public Guid FromUserId { get; set; }
        public Guid ToUserId { get; set; }
        public Guid? CommunityId { get; set; }
        public Guid? ServerId { get; set; }
        public ReputationType Type { get; set; }
        public int Score { get; set; } // -5 to +5
        public string? Comment { get; set; }
        public Dictionary<string, int> CategoryScores { get; set; } = new(); // helpfulness, friendliness, skill, reliability
        public DateTime CreatedAt { get; set; }
        public bool IsAnonymous { get; set; }
        
        // Navigation properties
        public virtual User FromUser { get; set; } = null!;
        public virtual User ToUser { get; set; } = null!;
        public virtual Community? Community { get; set; }
        public virtual GameServer? Server { get; set; }
    }

    public class PlayerSession
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid ServerId { get; set; }
        public Guid? CommunityId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int? DurationMinutes { get; set; }
        public string? GameMode { get; set; }
        public Dictionary<string, object> SessionData { get; set; } = new(); // Achievements, scores, etc.
        public List<Guid> PlayedWith { get; set; } = new(); // Other players in session
        public string? DisconnectReason { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual GameServer Server { get; set; } = null!;
        public virtual Community? Community { get; set; }
    }

    public class PlayerActivity
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string ActivityType { get; set; } = string.Empty; // "server_join", "achievement_unlock", "friend_add", "reputation_gain"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid? ServerId { get; set; }
        public string? ServerName { get; set; }
        public Guid? CommunityId { get; set; }
        public string? CommunityName { get; set; }
        public Guid? RelatedUserId { get; set; }
        public string? RelatedUserName { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public bool IsVisible { get; set; } = true;
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
    }

    public class PlayerPresence
    {
        public Guid UserId { get; set; }
        public PresenceStatus Status { get; set; }
        public string? StatusMessage { get; set; }
        public Guid? CurrentServerId { get; set; }
        public string? CurrentServerName { get; set; }
        public string? CurrentGame { get; set; }
        public DateTime LastSeen { get; set; }
        public bool IsVisible { get; set; } = true;
    }

    public class PlayerAchievement
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string AchievementId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? IconUrl { get; set; }
        public AchievementRarity Rarity { get; set; }
        public Guid? ServerId { get; set; }
        public Guid? CommunityId { get; set; }
        public string? GameType { get; set; }
        public DateTime UnlockedAt { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
        public bool IsFeatured { get; set; }
    }

    public class PlayerMessage
    {
        public Guid Id { get; set; }
        public Guid FromUserId { get; set; }
        public Guid ToUserId { get; set; }
        public Guid ConversationId { get; set; }
        public string Content { get; set; } = string.Empty;
        public MessageType Type { get; set; } = MessageType.Text;
        public DateTime SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
        public bool IsDeleted { get; set; }
        public Dictionary<string, object>? Attachments { get; set; }
        
        // Navigation properties
        public virtual User FromUser { get; set; } = null!;
        public virtual User ToUser { get; set; } = null!;
    }

    public class PlayerConversation
    {
        public Guid Id { get; set; }
        public Guid User1Id { get; set; }
        public Guid User2Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastMessageAt { get; set; }
        public int UnreadCount { get; set; }
        public bool IsArchived { get; set; }
        public string? LastMessagePreview { get; set; }
        
        // Navigation properties
        public virtual User User1 { get; set; } = null!;
        public virtual User User2 { get; set; } = null!;
        public virtual ICollection<PlayerMessage> Messages { get; set; } = new List<PlayerMessage>();
    }

    public class ServerPlayerInfo
    {
        public Guid UserId { get; set; }
        public Guid ServerId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string? ServerNickname { get; set; }
        public PlayerRole Role { get; set; }
        public List<string> Permissions { get; set; } = new();
        public DateTime FirstJoined { get; set; }
        public DateTime LastPlayed { get; set; }
        public int TotalPlayTime { get; set; } // In minutes
        public int SessionCount { get; set; }
        public Dictionary<string, object> ServerStats { get; set; } = new();
        public List<string> Notes { get; set; } = new(); // Admin notes
    }

    public class CommunityPlayerStats
    {
        public Guid UserId { get; set; }
        public Guid CommunityId { get; set; }
        public DateTime JoinedAt { get; set; }
        public int TotalPlayTime { get; set; }
        public int ServersPlayed { get; set; }
        public int SessionsPlayed { get; set; }
        public PlayerReputation Reputation { get; set; } = new();
        public List<PlayerAchievement> Achievements { get; set; } = new();
        public Dictionary<string, int> GameStats { get; set; } = new();
        public int Rank { get; set; }
        public List<string> Badges { get; set; } = new();
    }

    public class CommunityLeaderboard
    {
        public string Category { get; set; } = string.Empty; // "playtime", "reputation", "achievements"
        public string DisplayName { get; set; } = string.Empty;
        public List<LeaderboardEntry> Entries { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class LeaderboardEntry
    {
        public int Rank { get; set; }
        public Guid UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public float Score { get; set; }
        public string? Suffix { get; set; } // "hours", "points", etc.
    }

    public class ReputationSummary
    {
        public Guid UserId { get; set; }
        public int OverallScore { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<string, float> CategoryAverages { get; set; } = new();
        public List<string> TopBadges { get; set; } = new();
        public int RecentPositiveReviews { get; set; }
        public int RecentNegativeReviews { get; set; }
        public List<string> RecentComments { get; set; } = new();
    }

    public class PrivacySettings
    {
        public bool ShowOnlineStatus { get; set; } = true;
        public bool ShowCurrentGame { get; set; } = true;
        public bool AllowFriendRequests { get; set; } = true;
        public bool ShowPlayTime { get; set; } = true;
        public bool ShowAchievements { get; set; } = true;
        public PrivacyLevel ProfileVisibility { get; set; } = PrivacyLevel.Public;
        public PrivacyLevel ActivityVisibility { get; set; } = PrivacyLevel.Friends;
        public bool AllowReputationFromStrangers { get; set; } = true;
    }

    // Enums
    public enum RelationshipType
    {
        Friend,
        Block,
        Favorite
    }

    public enum RelationshipStatus
    {
        Pending,
        Accepted,
        Declined,
        Active,
        Blocked
    }

    public enum ReputationType
    {
        General,
        Helpfulness,
        Friendliness,
        Skill,
        Reliability,
        GameSpecific
    }

    public enum PresenceStatus
    {
        Offline,
        Online,
        InGame,
        Away,
        Busy,
        DoNotDisturb
    }

    public enum AchievementRarity
    {
        Common,
        Uncommon,
        Rare,
        Epic,
        Legendary
    }

    public enum MessageType
    {
        Text,
        Image,
        ServerInvite,
        CommunityInvite,
        System
    }

    public enum PlayerRole
    {
        Player,
        VIP,
        Moderator,
        Admin,
        Owner
    }

    public enum PrivacyLevel
    {
        Public,
        Friends,
        Community,
        Private
    }

    // Request DTOs
    public class UpdatePlayerProfileRequest
    {
        public string? DisplayName { get; set; }
        public string? Bio { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Country { get; set; }
        public List<string>? FavoriteGames { get; set; }
        public List<string>? PlayingStyles { get; set; }
        public Dictionary<string, object>? Preferences { get; set; }
        public PrivacySettings? Privacy { get; set; }
    }

    public class AddReputationRequest
    {
        public ReputationType Type { get; set; }
        public int Score { get; set; } // -5 to +5
        public string? Comment { get; set; }
        public Dictionary<string, int>? CategoryScores { get; set; }
        public Guid? CommunityId { get; set; }
        public Guid? ServerId { get; set; }
        public bool IsAnonymous { get; set; } = false;
    }

    public class StartSessionRequest
    {
        public string? GameMode { get; set; }
        public Dictionary<string, object>? InitialData { get; set; }
    }

    public class EndSessionRequest
    {
        public Dictionary<string, object>? SessionData { get; set; }
        public string? DisconnectReason { get; set; }
    }

    public class PlayerSearchRequest
    {
        public string? Query { get; set; }
        public List<string> Games { get; set; } = new();
        public List<string> PlayingStyles { get; set; } = new();
        public string? Country { get; set; }
        public int? MinReputation { get; set; }
        public bool OnlineOnly { get; set; } = false;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class PlayerActivityUpdate
    {
        public string ActivityType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid? ServerId { get; set; }
        public Guid? CommunityId { get; set; }
        public Guid? RelatedUserId { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
        public bool IsVisible { get; set; } = true;
    }

    public class UpdatePresenceRequest
    {
        public PresenceStatus Status { get; set; }
        public string? StatusMessage { get; set; }
        public Guid? CurrentServerId { get; set; }
        public string? CurrentGame { get; set; }
        public bool IsVisible { get; set; } = true;
    }

    public class BanPlayerRequest
    {
        public string Reason { get; set; } = string.Empty;
        public DateTime? ExpiresAt { get; set; }
        public bool BanFromAllServers { get; set; } = true;
    }

    public class SendMessageRequest
    {
        public string Content { get; set; } = string.Empty;
        public MessageType Type { get; set; } = MessageType.Text;
        public Dictionary<string, object>? Attachments { get; set; }
    }
}