using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface ICommunityService
    {
        // Community Profile Management
        Task<Community> CreateCommunityAsync(CreateCommunityRequest request, Guid ownerId);
        Task<Community?> GetCommunityAsync(Guid communityId);
        Task<Community?> GetCommunityBySlugAsync(string slug);
        Task<List<Community>> GetUserCommunitiesAsync(Guid userId);
        Task<Community> UpdateCommunityAsync(Guid communityId, UpdateCommunityRequest request, Guid userId);
        Task<bool> DeleteCommunityAsync(Guid communityId, Guid userId);
        
        // Community Discovery
        Task<List<Community>> SearchCommunitiesAsync(CommunitySearchRequest request);
        Task<List<Community>> GetTrendingCommunitiesAsync(int limit = 10);
        Task<List<Community>> GetRecommendedCommunitiesAsync(Guid userId, int limit = 10);
        Task<List<Community>> GetPopularCommunitiesAsync(int limit = 10);
        Task<CommunitySearchResults> GetCommunitiesByGameAsync(string gameId, int page = 1, int pageSize = 20);
        
        // Member Management
        Task<CommunityMember> JoinCommunityAsync(Guid communityId, Guid userId, JoinCommunityRequest? request = null);
        Task<bool> LeaveCommunityAsync(Guid communityId, Guid userId);
        Task<List<CommunityMember>> GetCommunityMembersAsync(Guid communityId, int page = 1, int pageSize = 50);
        Task<CommunityMember?> GetCommunityMemberAsync(Guid communityId, Guid userId);
        Task<CommunityMember> UpdateMemberRoleAsync(Guid communityId, Guid userId, CommunityRole role, Guid adminUserId);
        Task<bool> RemoveMemberAsync(Guid communityId, Guid userId, Guid adminUserId);
        
        // Server Association
        Task<bool> AddServerToCommunityAsync(Guid communityId, Guid serverId, Guid userId);
        Task<bool> RemoveServerFromCommunityAsync(Guid communityId, Guid serverId, Guid userId);
        Task<List<GameServer>> GetCommunityServersAsync(Guid communityId);
        
        // Community Analytics
        Task<CommunityAnalytics> GetCommunityAnalyticsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<CommunityGrowthMetrics> GetGrowthMetricsAsync(Guid communityId, Guid userId);
        Task<List<CommunityInsight>> GetCommunityInsightsAsync(Guid communityId, Guid userId);
        
        // Invitation System
        Task<CommunityInvitation> CreateInvitationAsync(Guid communityId, CreateInvitationRequest request, Guid userId);
        Task<CommunityInvitation?> GetInvitationAsync(string inviteCode);
        Task<CommunityMember> AcceptInvitationAsync(string inviteCode, Guid userId);
        Task<bool> RevokeInvitationAsync(Guid invitationId, Guid userId);
        Task<List<CommunityInvitation>> GetCommunityInvitationsAsync(Guid communityId, Guid userId);
        
        // Community Settings
        Task<CommunitySettings> GetCommunitySettingsAsync(Guid communityId, Guid userId);
        Task<CommunitySettings> UpdateCommunitySettingsAsync(Guid communityId, UpdateCommunitySettingsRequest request, Guid userId);
        
        // Moderation
        Task<bool> BanMemberAsync(Guid communityId, Guid userId, BanMemberRequest request, Guid adminUserId);
        Task<bool> UnbanMemberAsync(Guid communityId, Guid userId, Guid adminUserId);
        Task<List<CommunityBan>> GetCommunityBansAsync(Guid communityId, Guid adminUserId);
        
        // Public Profile Features
        Task<CommunityPublicProfile> GetPublicProfileAsync(Guid communityId);
        Task<CommunityPublicProfile> GetPublicProfileBySlugAsync(string slug);
        Task<List<CommunityActivity>> GetCommunityActivityAsync(Guid communityId, int limit = 20);
        Task<CommunityStats> GetCommunityStatsAsync(Guid communityId);
    }

    // Data Models
    public class Community
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public bool IsPublic { get; set; } = true;
        public Guid OwnerId { get; set; }
        public int MemberCount { get; set; }
        public CommunitySettings Settings { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public CommunityStats Stats { get; set; } = new();
        
        // Navigation properties
        public virtual User Owner { get; set; } = null!;
        public virtual ICollection<CommunityMember> Members { get; set; } = new List<CommunityMember>();
        public virtual ICollection<GameServer> Servers { get; set; } = new List<GameServer>();
    }

    public class CommunitySettings
    {
        public JoinRequirement JoinRequirement { get; set; } = JoinRequirement.Open;
        public List<string> AllowedGames { get; set; } = new();
        public ModerationLevel ModerationLevel { get; set; } = ModerationLevel.Standard;
        public bool MonetizationEnabled { get; set; } = false;
        public string? DiscordServerId { get; set; }
        public string? DiscordInviteUrl { get; set; }
        public bool RequireApplicationMessage { get; set; } = false;
        public string? WelcomeMessage { get; set; }
        public string? Rules { get; set; }
        public bool AllowServerSharing { get; set; } = true;
        public bool ShowMemberList { get; set; } = true;
        public string? CustomDomain { get; set; }
        public Dictionary<string, object> CustomFields { get; set; } = new();
    }

    public class CommunityMember
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid UserId { get; set; }
        public CommunityRole Role { get; set; } = CommunityRole.Member;
        public DateTime JoinedAt { get; set; }
        public string? ApplicationMessage { get; set; }
        public DateTime? LastActiveAt { get; set; }
        public int ReputationScore { get; set; } = 0;
        public Dictionary<string, object> CustomData { get; set; } = new();
        
        // Navigation properties
        public virtual Community Community { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }

    public class CommunityInvitation
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid CreatedByUserId { get; set; }
        public string InviteCode { get; set; } = string.Empty;
        public string? Message { get; set; }
        public int MaxUses { get; set; } = 1;
        public int UsedCount { get; set; } = 0;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual Community Community { get; set; } = null!;
        public virtual User CreatedBy { get; set; } = null!;
    }

    public class CommunityBan
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid UserId { get; set; }
        public Guid BannedByUserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public DateTime BannedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual Community Community { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual User BannedBy { get; set; } = null!;
    }

    public class CommunityAnalytics
    {
        public Guid CommunityId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int NewMembers { get; set; }
        public int ActiveMembers { get; set; }
        public int LostMembers { get; set; }
        public int TotalSessions { get; set; }
        public TimeSpan AverageSessionDuration { get; set; }
        public Dictionary<string, int> GameActivity { get; set; } = new();
        public Dictionary<string, int> PopularServers { get; set; } = new();
        public float GrowthRate { get; set; }
        public float RetentionRate { get; set; }
        public List<CommunityMetricPoint> MembershipGrowth { get; set; } = new();
        public List<CommunityMetricPoint> ActivityTrends { get; set; } = new();
    }

    public class CommunityGrowthMetrics
    {
        public Guid CommunityId { get; set; }
        public int TotalMembers { get; set; }
        public int NewMembersToday { get; set; }
        public int NewMembersThisWeek { get; set; }
        public int NewMembersThisMonth { get; set; }
        public float WeeklyGrowthRate { get; set; }
        public float MonthlyGrowthRate { get; set; }
        public int ChurnedMembersThisMonth { get; set; }
        public float RetentionRate { get; set; }
        public List<CommunityMetricPoint> GrowthHistory { get; set; } = new();
    }

    public class CommunityInsight
    {
        public string Type { get; set; } = string.Empty; // "growth_opportunity", "engagement_low", "popular_game"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ActionText { get; set; }
        public string? ActionUrl { get; set; }
        public float Impact { get; set; } // 0-1 scale
        public DateTime GeneratedAt { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class CommunityMetricPoint
    {
        public DateTime Date { get; set; }
        public float Value { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }

    public class CommunityPublicProfile
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public List<string> Tags { get; set; } = new();
        public CommunityStats Stats { get; set; } = new();
        public List<CommunityServerInfo> FeaturedServers { get; set; } = new();
        public List<CommunityMemberProfile> FeaturedMembers { get; set; } = new();
        public List<CommunityActivity> RecentActivity { get; set; } = new();
        public string? DiscordInviteUrl { get; set; }
        public JoinRequirement JoinRequirement { get; set; }
        public bool CanJoin { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CommunityStats
    {
        public int TotalMembers { get; set; }
        public int OnlineMembers { get; set; }
        public int ActiveServers { get; set; }
        public int TotalServers { get; set; }
        public int TotalPlaytime { get; set; } // In hours
        public List<string> PopularGames { get; set; } = new();
        public float AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public DateTime? LastActivity { get; set; }
    }

    public class CommunityActivity
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public string ActivityType { get; set; } = string.Empty; // "member_joined", "server_created", "event_scheduled"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid? UserId { get; set; }
        public string? UserName { get; set; }
        public Guid? ServerId { get; set; }
        public string? ServerName { get; set; }
        public DateTime CreatedAt { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class CommunityServerInfo
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string GameId { get; set; } = string.Empty;
        public string GameName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int CurrentPlayers { get; set; }
        public int MaxPlayers { get; set; }
        public string? Map { get; set; }
        public bool IsPasswordProtected { get; set; }
        public List<string> Tags { get; set; } = new();
    }

    public class CommunityMemberProfile
    {
        public Guid UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public CommunityRole Role { get; set; }
        public int ReputationScore { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? LastActiveAt { get; set; }
        public List<string> Badges { get; set; } = new();
    }

    public class CommunitySearchResults
    {
        public List<Community> Communities { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public List<CommunityFilter> AppliedFilters { get; set; } = new();
    }

    public class CommunityFilter
    {
        public string Type { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
    }

    // Enums
    public enum JoinRequirement
    {
        Open,
        Application,
        InviteOnly
    }

    public enum ModerationLevel
    {
        Relaxed,
        Standard,
        Strict
    }

    public enum CommunityRole
    {
        Member,
        Moderator,
        Admin,
        Owner
    }

    // Request DTOs
    public class CreateCommunityRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public bool IsPublic { get; set; } = true;
        public List<string> Tags { get; set; } = new();
        public CommunitySettings? Settings { get; set; }
    }

    public class UpdateCommunityRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public bool? IsPublic { get; set; }
        public List<string>? Tags { get; set; }
    }

    public class CommunitySearchRequest
    {
        public string? Query { get; set; }
        public List<string> Games { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public JoinRequirement? JoinRequirement { get; set; }
        public int? MinMembers { get; set; }
        public int? MaxMembers { get; set; }
        public string? SortBy { get; set; } = "popular"; // popular, newest, members, activity
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class JoinCommunityRequest
    {
        public string? ApplicationMessage { get; set; }
        public string? InviteCode { get; set; }
    }

    public class CreateInvitationRequest
    {
        public string? Message { get; set; }
        public int MaxUses { get; set; } = 1;
        public DateTime? ExpiresAt { get; set; }
    }

    public class UpdateCommunitySettingsRequest
    {
        public JoinRequirement? JoinRequirement { get; set; }
        public List<string>? AllowedGames { get; set; }
        public ModerationLevel? ModerationLevel { get; set; }
        public bool? MonetizationEnabled { get; set; }
        public string? DiscordServerId { get; set; }
        public string? DiscordInviteUrl { get; set; }
        public bool? RequireApplicationMessage { get; set; }
        public string? WelcomeMessage { get; set; }
        public string? Rules { get; set; }
        public bool? AllowServerSharing { get; set; }
        public bool? ShowMemberList { get; set; }
    }

    public class BanMemberRequest
    {
        public string Reason { get; set; } = string.Empty;
        public DateTime? ExpiresAt { get; set; }
    }
}