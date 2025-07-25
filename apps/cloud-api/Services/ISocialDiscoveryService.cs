using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface ISocialDiscoveryService
    {
        // Community Discovery
        Task<DiscoveryResults<Community>> DiscoverCommunitiesAsync(Guid userId, DiscoveryRequest request);
        Task<List<Community>> GetRecommendedCommunitiesAsync(Guid userId, int limit = 10);
        Task<List<Community>> GetTrendingCommunitiesAsync(string? gameType = null, int limit = 10);
        Task<List<Community>> GetSimilarCommunitiesAsync(Guid communityId, int limit = 5);
        Task<CommunityMatchScore> GetCommunityMatchAsync(Guid userId, Guid communityId);
        
        // Server Discovery
        Task<DiscoveryResults<GameServer>> DiscoverServersAsync(Guid userId, ServerDiscoveryRequest request);
        Task<List<GameServer>> GetRecommendedServersAsync(Guid userId, int limit = 10);
        Task<List<GameServer>> GetPopularServersAsync(string? gameType = null, int limit = 10);
        Task<List<GameServer>> GetFriendsServersAsync(Guid userId, int limit = 20);
        Task<ServerMatchScore> GetServerMatchAsync(Guid userId, Guid serverId);
        
        // Player Discovery
        Task<DiscoveryResults<PlayerProfile>> DiscoverPlayersAsync(Guid userId, PlayerDiscoveryRequest request);
        Task<List<PlayerProfile>> GetRecommendedPlayersAsync(Guid userId, int limit = 10);
        Task<List<PlayerProfile>> GetSimilarPlayersAsync(Guid userId, int limit = 10);
        Task<List<PlayerProfile>> GetPlayersInCommunityAsync(Guid userId, Guid communityId, int limit = 20);
        Task<PlayerMatchScore> GetPlayerMatchAsync(Guid userId, Guid targetUserId);
        
        // Game Discovery
        Task<DiscoveryResults<Game>> DiscoverGamesAsync(Guid userId, GameDiscoveryRequest request);
        Task<List<Game>> GetRecommendedGamesAsync(Guid userId, int limit = 10);
        Task<List<Game>> GetTrendingGamesAsync(int limit = 10);
        Task<List<Game>> GetSimilarGamesAsync(string gameId, int limit = 5);
        
        // Social Signals & Analytics
        Task<SocialInsights> GetUserSocialInsightsAsync(Guid userId);
        Task<DiscoveryAnalytics> GetDiscoveryAnalyticsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<List<SocialTrend>> GetSocialTrendsAsync(string category, int limit = 10);
        
        // Interest Profiling
        Task<UserInterestProfile> GetUserInterestProfileAsync(Guid userId);
        Task<UserInterestProfile> UpdateUserInterestProfileAsync(Guid userId, UpdateInterestProfileRequest request);
        Task<List<InterestMatch>> GetInterestBasedRecommendationsAsync(Guid userId, string category, int limit = 10);
        
        // Discovery History & Feedback
        Task<bool> RecordDiscoveryActionAsync(Guid userId, DiscoveryAction action);
        Task<List<DiscoveryAction>> GetDiscoveryHistoryAsync(Guid userId, int page = 1, int pageSize = 20);
        Task<bool> ProvideDiscoveryFeedbackAsync(Guid userId, DiscoveryFeedback feedback);
        Task<DiscoveryPreferences> GetDiscoveryPreferencesAsync(Guid userId);
        Task<DiscoveryPreferences> UpdateDiscoveryPreferencesAsync(Guid userId, UpdateDiscoveryPreferencesRequest request);
        
        // Advanced Discovery Features
        Task<List<DiscoveryEvent>> GetDiscoveryEventsAsync(Guid userId, int limit = 10);
        Task<List<CrossGameRecommendation>> GetCrossGameRecommendationsAsync(Guid userId, int limit = 5);
        Task<SerendipityRecommendations> GetSerendipityRecommendationsAsync(Guid userId);
        Task<SocialGraphInsights> GetSocialGraphInsightsAsync(Guid userId);
    }

    // Data Models
    public class DiscoveryResults<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public DiscoveryMetadata Metadata { get; set; } = new();
        public List<DiscoveryFilter> AppliedFilters { get; set; } = new();
        public string? NextPageToken { get; set; }
    }

    public class DiscoveryMetadata
    {
        public string Algorithm { get; set; } = string.Empty;
        public float ConfidenceScore { get; set; }
        public Dictionary<string, float> FactorWeights { get; set; } = new();
        public List<string> ExplanationFactors { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
        public TimeSpan ProcessingTime { get; set; }
    }

    public class DiscoveryFilter
    {
        public string Type { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class CommunityMatchScore
    {
        public Guid UserId { get; set; }
        public Guid CommunityId { get; set; }
        public float OverallScore { get; set; } // 0-1
        public Dictionary<string, float> CategoryScores { get; set; } = new();
        public List<string> MatchReasons { get; set; } = new();
        public List<string> ConcernFactors { get; set; } = new();
        public float CompatibilityScore { get; set; }
        public float ActivityScore { get; set; }
        public float SocialScore { get; set; }
        public DateTime CalculatedAt { get; set; }
    }

    public class ServerMatchScore
    {
        public Guid UserId { get; set; }
        public Guid ServerId { get; set; }
        public float OverallScore { get; set; } // 0-1
        public Dictionary<string, float> CategoryScores { get; set; } = new();
        public List<string> MatchReasons { get; set; } = new();
        public float SkillMatchScore { get; set; }
        public float PlayStyleScore { get; set; }
        public float ScheduleScore { get; set; }
        public float PopularityScore { get; set; }
        public DateTime CalculatedAt { get; set; }
    }

    public class PlayerMatchScore
    {
        public Guid UserId { get; set; }
        public Guid TargetUserId { get; set; }
        public float OverallScore { get; set; } // 0-1
        public Dictionary<string, float> CategoryScores { get; set; } = new();
        public List<string> MatchReasons { get; set; } = new();
        public int MutualFriendsCount { get; set; }
        public List<string> SharedInterests { get; set; } = new();
        public float PlayStyleCompatibility { get; set; }
        public float SkillCompatibility { get; set; }
        public float ScheduleOverlap { get; set; }
        public DateTime CalculatedAt { get; set; }
    }

    public class UserInterestProfile
    {
        public Guid UserId { get; set; }
        public Dictionary<string, float> GameGenreScores { get; set; } = new(); // "fps", "rpg", "strategy" -> 0-1
        public Dictionary<string, float> PlayStyleScores { get; set; } = new(); // "competitive", "casual", "social" -> 0-1
        public Dictionary<string, float> FeaturePreferences { get; set; } = new(); // "voice_chat", "mods", "pvp" -> 0-1
        public Dictionary<string, float> CommunityPreferences { get; set; } = new(); // "large", "small", "active" -> 0-1
        public List<string> PreferredGames { get; set; } = new();
        public List<string> AvoidedGames { get; set; } = new();
        public Dictionary<string, object> PersonalityTraits { get; set; } = new();
        public TimeProfile PreferredPlayTimes { get; set; } = new();
        public DateTime LastUpdated { get; set; }
        public float ProfileCompleteness { get; set; } // 0-1
    }

    public class TimeProfile
    {
        public List<DayOfWeek> PreferredDays { get; set; } = new();
        public TimeSpan PreferredStartTime { get; set; }
        public TimeSpan PreferredEndTime { get; set; }
        public string TimeZone { get; set; } = string.Empty;
        public Dictionary<DayOfWeek, TimeSlot> DaySpecificSlots { get; set; } = new();
    }

    public class TimeSlot
    {
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public float Probability { get; set; } // 0-1, how likely to be online
    }

    public class SocialInsights
    {
        public Guid UserId { get; set; }
        public int NetworkSize { get; set; } // Total friends
        public int ActiveConnections { get; set; } // Friends active in last week
        public float SocialScore { get; set; } // 0-1, how socially connected
        public List<string> SocialCircles { get; set; } = new(); // "Valorant Squad", "Community Builders"
        public Dictionary<string, int> ActivityBreakdown { get; set; } = new(); // Type -> count
        public List<InfluencialConnection> TopConnections { get; set; } = new();
        public SocialGrowthTrends GrowthTrends { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class InfluencialConnection
    {
        public Guid UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public float InfluenceScore { get; set; }
        public List<string> SharedInterests { get; set; } = new();
        public string ConnectionType { get; set; } = string.Empty; // "friend", "community_leader", "gaming_buddy"
    }

    public class SocialGrowthTrends
    {
        public int NewConnectionsThisWeek { get; set; }
        public int NewConnectionsLastWeek { get; set; }
        public float GrowthRate { get; set; }
        public List<string> GrowthFactors { get; set; } = new();
        public Dictionary<string, int> ConnectionSourceBreakdown { get; set; } = new();
    }

    public class DiscoveryAnalytics
    {
        public Guid UserId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalRecommendations { get; set; }
        public int ActionsOnRecommendations { get; set; }
        public float EngagementRate { get; set; }
        public Dictionary<string, int> ActionBreakdown { get; set; } = new(); // "viewed", "joined", "bookmarked"
        public Dictionary<string, float> CategoryPerformance { get; set; } = new(); // "communities", "servers", "players"
        public List<TopPerformingRecommendation> TopRecommendations { get; set; } = new();
        public DiscoveryImprovementSuggestions Suggestions { get; set; } = new();
    }

    public class TopPerformingRecommendation
    {
        public string Type { get; set; } = string.Empty;
        public Guid ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public float Score { get; set; }
        public string Action { get; set; } = string.Empty;
        public DateTime RecommendedAt { get; set; }
        public DateTime ActionAt { get; set; }
    }

    public class DiscoveryImprovementSuggestions
    {
        public List<string> ProfileCompletionTips { get; set; } = new();
        public List<string> InteractionSuggestions { get; set; } = new();
        public List<string> ExplorationOpportunities { get; set; } = new();
    }

    public class SocialTrend
    {
        public string Category { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public float TrendScore { get; set; } // How trending it is
        public float GrowthRate { get; set; } // Week over week growth
        public int ParticipantCount { get; set; }
        public List<string> RelatedTags { get; set; } = new();
        public DateTime StartedTrendingAt { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class InterestMatch
    {
        public string Category { get; set; } = string.Empty;
        public Guid ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public float MatchScore { get; set; }
        public List<string> MatchingInterests { get; set; } = new();
        public string ReasonExplanation { get; set; } = string.Empty;
    }

    public class DiscoveryAction
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string ActionType { get; set; } = string.Empty; // "view", "join", "bookmark", "share", "dismiss"
        public string ItemType { get; set; } = string.Empty; // "community", "server", "player", "game"
        public Guid ItemId { get; set; }
        public string? ItemName { get; set; }
        public string? RecommendationContext { get; set; } // Which algorithm recommended it
        public float? RecommendationScore { get; set; }
        public Dictionary<string, object> ActionMetadata { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public string? UserFeedback { get; set; }
        public int? UserRating { get; set; } // 1-5 stars
    }

    public class DiscoveryFeedback
    {
        public Guid UserId { get; set; }
        public Guid RecommendationId { get; set; }
        public string ItemType { get; set; } = string.Empty;
        public Guid ItemId { get; set; }
        public FeedbackType Type { get; set; }
        public int? Rating { get; set; } // 1-5 stars
        public string? Comment { get; set; }
        public List<string> ReasonTags { get; set; } = new(); // "not_interested", "wrong_skill_level", "great_match"
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class DiscoveryPreferences
    {
        public Guid UserId { get; set; }
        public Dictionary<string, float> CategoryWeights { get; set; } = new(); // "social", "skill", "activity" -> 0-1
        public List<string> PreferredAlgorithms { get; set; } = new(); // "collaborative", "content_based", "hybrid"
        public float SerendipityLevel { get; set; } = 0.2f; // 0-1, how much unexpected content to show
        public bool IncludeTrendingContent { get; set; } = true;
        public bool IncludeFriendActivity { get; set; } = true;
        public bool AllowCrossGameRecommendations { get; set; } = true;
        public int MaxRecommendationsPerDay { get; set; } = 50;
        public List<string> BlockedCategories { get; set; } = new();
        public Dictionary<string, object> AdvancedSettings { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class DiscoveryEvent
    {
        public Guid Id { get; set; }
        public string EventType { get; set; } = string.Empty; // "friend_joined_community", "game_trending", "new_server_match"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ActionText { get; set; }
        public string? ActionUrl { get; set; }
        public Guid? RelatedItemId { get; set; }
        public string? RelatedItemType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsPersonalized { get; set; } = true;
        public float RelevanceScore { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class CrossGameRecommendation
    {
        public string SourceGame { get; set; } = string.Empty;
        public string TargetGame { get; set; } = string.Empty;
        public float SimilarityScore { get; set; }
        public List<string> SharedElements { get; set; } = new(); // "team_based", "strategic", "competitive"
        public string TransitionReason { get; set; } = string.Empty;
        public List<Community> RelevantCommunities { get; set; } = new();
        public List<PlayerProfile> PlayersWhoMadeTransition { get; set; } = new();
        public float SuccessRate { get; set; } // Of users who tried the transition
    }

    public class SerendipityRecommendations
    {
        public Guid UserId { get; set; }
        public List<SerendipityItem> Items { get; set; } = new();
        public float SerendipityThreshold { get; set; }
        public string GenerationStrategy { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
    }

    public class SerendipityItem
    {
        public string Type { get; set; } = string.Empty;
        public Guid ItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public float UnexpectednessScore { get; set; }
        public string DiscoveryReason { get; set; } = string.Empty;
        public List<string> IntriguingFactors { get; set; } = new();
    }

    public class SocialGraphInsights
    {
        public Guid UserId { get; set; }
        public NetworkStructure Network { get; set; } = new();
        public List<CommunityCluster> Clusters { get; set; } = new();
        public List<BridgeConnection> Bridges { get; set; } = new();
        public InfluenceMetrics Influence { get; set; } = new();
        public List<GrowthOpportunity> GrowthOpportunities { get; set; } = new();
        public DateTime AnalyzedAt { get; set; }
    }

    public class NetworkStructure
    {
        public int DirectConnections { get; set; }
        public int IndirectConnections { get; set; }
        public float ClusteringCoefficient { get; set; }
        public float Centrality { get; set; }
        public int PathLengthToInfluencers { get; set; }
    }

    public class CommunityCluster
    {
        public string ClusterName { get; set; } = string.Empty;
        public List<Guid> MemberIds { get; set; } = new();
        public List<string> SharedInterests { get; set; } = new();
        public float Cohesion { get; set; }
        public Guid? CommunityId { get; set; }
    }

    public class BridgeConnection
    {
        public Guid UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public List<string> ConnectedClusters { get; set; } = new();
        public float BridgeStrength { get; set; }
        public string ImportanceReason { get; set; } = string.Empty;
    }

    public class InfluenceMetrics
    {
        public float LocalInfluence { get; set; }
        public float GlobalInfluence { get; set; }
        public List<string> InfluenceTopics { get; set; } = new();
        public int FollowerCount { get; set; }
        public float EngagementRate { get; set; }
    }

    public class GrowthOpportunity
    {
        public string Type { get; set; } = string.Empty; // "expand_cluster", "bridge_gap", "join_community"
        public string Description { get; set; } = string.Empty;
        public float PotentialImpact { get; set; }
        public List<Guid> SuggestedConnections { get; set; } = new();
        public string ActionSuggestion { get; set; } = string.Empty;
    }

    // Enums
    public enum FeedbackType
    {
        Helpful,
        NotHelpful,
        Irrelevant,
        Perfect,
        WrongTiming,
        AlreadyKnown
    }

    // Request DTOs
    public class DiscoveryRequest
    {
        public string? Query { get; set; }
        public List<string> PreferredGames { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public string? Mood { get; set; } // "casual", "competitive", "social", "learning"
        public int? MinMembers { get; set; }
        public int? MaxMembers { get; set; }
        public string? ActivityLevel { get; set; } // "low", "medium", "high"
        public bool IncludeFriendsActivity { get; set; } = true;
        public float SerendipityLevel { get; set; } = 0.2f;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SortBy { get; set; } = "relevance";
    }

    public class ServerDiscoveryRequest : DiscoveryRequest
    {
        public string? GameType { get; set; }
        public string? Region { get; set; }
        public int? MaxPing { get; set; }
        public bool RequireSlots { get; set; } = true;
        public List<string> RequiredMods { get; set; } = new();
        public List<string> PreferredModes { get; set; } = new();
        public string? SkillLevel { get; set; } // "beginner", "intermediate", "advanced", "expert"
    }

    public class PlayerDiscoveryRequest : DiscoveryRequest
    {
        public List<string> PlayingStyles { get; set; } = new();
        public string? SkillLevel { get; set; }
        public string? Region { get; set; }
        public bool OnlineOnly { get; set; } = false;
        public bool HasMicrophone { get; set; } = false;
        public int? MinReputationScore { get; set; }
        public bool MutualFriendsOnly { get; set; } = false;
    }

    public class GameDiscoveryRequest : DiscoveryRequest
    {
        public List<string> Genres { get; set; } = new();
        public string? Platform { get; set; } = "PC";
        public decimal? MaxPrice { get; set; }
        public bool FreeToPlayOnly { get; set; } = false;
        public bool MultiplayerOnly { get; set; } = true;
        public List<string> RequiredFeatures { get; set; } = new(); // "voice_chat", "mod_support", "competitive"
    }

    public class UpdateInterestProfileRequest
    {
        public Dictionary<string, float>? GameGenreScores { get; set; }
        public Dictionary<string, float>? PlayStyleScores { get; set; }
        public Dictionary<string, float>? FeaturePreferences { get; set; }
        public Dictionary<string, float>? CommunityPreferences { get; set; }
        public List<string>? PreferredGames { get; set; }
        public List<string>? AvoidedGames { get; set; }
        public TimeProfile? PreferredPlayTimes { get; set; }
    }

    public class UpdateDiscoveryPreferencesRequest
    {
        public Dictionary<string, float>? CategoryWeights { get; set; }
        public List<string>? PreferredAlgorithms { get; set; }
        public float? SerendipityLevel { get; set; }
        public bool? IncludeTrendingContent { get; set; }
        public bool? IncludeFriendActivity { get; set; }
        public bool? AllowCrossGameRecommendations { get; set; }
        public int? MaxRecommendationsPerDay { get; set; }
        public List<string>? BlockedCategories { get; set; }
    }
}