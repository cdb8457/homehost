using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IPlayerInvitationService
    {
        // Community Invitations
        Task<CommunityInvitation> CreateCommunityInvitationAsync(Guid inviterId, CreateCommunityInvitationRequest request);
        Task<CommunityInvitation> GetCommunityInvitationAsync(Guid invitationId);
        Task<List<CommunityInvitation>> GetCommunityInvitationsAsync(Guid communityId, InvitationStatus? status = null, int page = 1, int pageSize = 50);
        Task<List<CommunityInvitation>> GetUserInvitationsAsync(Guid userId, InvitationStatus? status = null, int page = 1, int pageSize = 20);
        Task<CommunityInvitation> UpdateInvitationStatusAsync(Guid invitationId, Guid userId, InvitationAction action, string? message = null);
        Task<bool> RevokeInvitationAsync(Guid invitationId, Guid revokerId);
        Task<bool> ResendInvitationAsync(Guid invitationId, Guid senderId);
        Task<InvitationLink> GenerateInvitationLinkAsync(Guid communityId, Guid creatorId, InvitationLinkSettings settings);
        Task<CommunityInvitation> AcceptInvitationByLinkAsync(string inviteCode, Guid userId);
        Task<bool> DeactivateInvitationLinkAsync(string inviteCode, Guid deactivatorId);

        // Friend Invitations
        Task<FriendInvitation> SendFriendInvitationAsync(Guid senderId, Guid targetUserId, string? message = null);
        Task<List<FriendInvitation>> GetFriendInvitationsAsync(Guid userId, InvitationDirection direction, InvitationStatus? status = null);
        Task<FriendInvitation> RespondToFriendInvitationAsync(Guid invitationId, Guid userId, InvitationAction action);
        Task<bool> CancelFriendInvitationAsync(Guid invitationId, Guid userId);

        // Server Invitations
        Task<ServerInvitation> CreateServerInvitationAsync(Guid inviterId, CreateServerInvitationRequest request);
        Task<List<ServerInvitation>> GetServerInvitationsAsync(Guid serverId, InvitationStatus? status = null);
        Task<ServerInvitation> AcceptServerInvitationAsync(Guid invitationId, Guid userId);
        Task<bool> DeclineServerInvitationAsync(Guid invitationId, Guid userId, string? reason = null);

        // Bulk Invitations
        Task<BulkInvitationResult> SendBulkInvitationsAsync(Guid senderId, BulkInvitationRequest request);
        Task<BulkInvitationStatus> GetBulkInvitationStatusAsync(Guid bulkInvitationId);
        Task<bool> CancelBulkInvitationAsync(Guid bulkInvitationId, Guid cancelerId);

        // Invitation Analytics
        Task<InvitationAnalytics> GetInvitationAnalyticsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<List<InvitationConversionMetric>> GetInvitationConversionMetricsAsync(Guid communityId, Guid userId);
        Task<InvitationPerformanceReport> GetInvitationPerformanceReportAsync(Guid communityId, Guid userId, InvitationReportTimeframe timeframe);

        // Onboarding Flows
        Task<OnboardingFlow> CreateOnboardingFlowAsync(Guid communityId, Guid creatorId, CreateOnboardingFlowRequest request);
        Task<OnboardingFlow> GetOnboardingFlowAsync(Guid flowId);
        Task<List<OnboardingFlow>> GetCommunityOnboardingFlowsAsync(Guid communityId);
        Task<OnboardingFlow> UpdateOnboardingFlowAsync(Guid flowId, Guid updaterId, UpdateOnboardingFlowRequest request);
        Task<bool> DeleteOnboardingFlowAsync(Guid flowId, Guid deleterId);
        Task<OnboardingFlow> DuplicateOnboardingFlowAsync(Guid flowId, Guid duplicatorId, string newName);

        // Player Onboarding Sessions
        Task<OnboardingSession> StartOnboardingSessionAsync(Guid userId, Guid communityId, Guid? flowId = null);
        Task<OnboardingSession> GetOnboardingSessionAsync(Guid sessionId);
        Task<OnboardingSession> AdvanceOnboardingStepAsync(Guid sessionId, Guid userId, OnboardingStepResult stepResult);
        Task<OnboardingSession> CompleteOnboardingAsync(Guid sessionId, Guid userId, OnboardingCompletionData completionData);
        Task<bool> AbandonOnboardingAsync(Guid sessionId, Guid userId, string? reason = null);
        Task<OnboardingSession> RestartOnboardingAsync(Guid sessionId, Guid userId);

        // Onboarding Progress Tracking
        Task<List<OnboardingSession>> GetUserOnboardingSessionsAsync(Guid userId, OnboardingStatus? status = null);
        Task<OnboardingProgress> GetOnboardingProgressAsync(Guid sessionId);
        Task<List<OnboardingCheckpoint>> GetOnboardingCheckpointsAsync(Guid sessionId);
        Task<bool> UpdateOnboardingCheckpointAsync(Guid sessionId, Guid checkpointId, OnboardingCheckpointData data);

        // Onboarding Analytics
        Task<OnboardingAnalytics> GetOnboardingAnalyticsAsync(Guid communityId, Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<OnboardingFunnelAnalysis> GetOnboardingFunnelAnalysisAsync(Guid flowId, Guid userId);
        Task<List<OnboardingDropoffPoint>> GetOnboardingDropoffPointsAsync(Guid flowId, Guid userId);
        Task<OnboardingOptimizationReport> GetOnboardingOptimizationReportAsync(Guid communityId, Guid userId);

        // Welcome Experience
        Task<WelcomeExperience> CreateWelcomeExperienceAsync(Guid communityId, Guid creatorId, CreateWelcomeExperienceRequest request);
        Task<WelcomeExperience> GetWelcomeExperienceAsync(Guid experienceId);
        Task<WelcomeExperience> UpdateWelcomeExperienceAsync(Guid experienceId, Guid updaterId, UpdateWelcomeExperienceRequest request);
        Task<WelcomeExperience> TriggerWelcomeExperienceAsync(Guid userId, Guid communityId, WelcomeTrigger trigger);

        // Buddy System
        Task<BuddyAssignment> AssignBuddyAsync(Guid newUserId, Guid communityId, BuddyAssignmentCriteria? criteria = null);
        Task<List<BuddyAssignment>> GetBuddyAssignmentsAsync(Guid userId, BuddyRole role);
        Task<BuddyAssignment> UpdateBuddyAssignmentAsync(Guid assignmentId, Guid updaterId, UpdateBuddyAssignmentRequest request);
        Task<bool> CompleteBuddyAssignmentAsync(Guid assignmentId, Guid completerId, BuddyCompletionData completionData);
        Task<List<PotentialBuddy>> GetPotentialBuddiesAsync(Guid newUserId, Guid communityId, int limit = 10);

        // Invitation Templates
        Task<InvitationTemplate> CreateInvitationTemplateAsync(Guid creatorId, CreateInvitationTemplateRequest request);
        Task<List<InvitationTemplate>> GetInvitationTemplatesAsync(Guid userId, InvitationTemplateType? type = null);
        Task<InvitationTemplate> UpdateInvitationTemplateAsync(Guid templateId, Guid updaterId, UpdateInvitationTemplateRequest request);
        Task<bool> DeleteInvitationTemplateAsync(Guid templateId, Guid deleterId);

        // Referral System
        Task<ReferralCode> GenerateReferralCodeAsync(Guid userId, ReferralCodeSettings settings);
        Task<List<ReferralCode>> GetUserReferralCodesAsync(Guid userId, bool activeOnly = true);
        Task<ReferralResult> ProcessReferralAsync(string referralCode, Guid newUserId);
        Task<ReferralAnalytics> GetReferralAnalyticsAsync(Guid userId, DateTime? startDate = null, DateTime? endDate = null);
        Task<List<ReferralReward>> GetReferralRewardsAsync(Guid userId, bool claimedOnly = false);
        Task<bool> ClaimReferralRewardAsync(Guid rewardId, Guid userId);

        // Smart Recommendations
        Task<List<InvitationSuggestion>> GetInvitationSuggestionsAsync(Guid userId, Guid communityId, int limit = 10);
        Task<List<OnboardingRecommendation>> GetOnboardingRecommendationsAsync(Guid userId, Guid communityId);
        Task<PersonalizedInvitationContent> GeneratePersonalizedInvitationAsync(Guid senderId, Guid targetUserId, Guid communityId);

        // Integration & Automation
        Task<bool> EnableDiscordIntegrationAsync(Guid communityId, Guid userId, DiscordIntegrationSettings settings);
        Task<bool> SyncInvitationsWithDiscordAsync(Guid communityId);
        Task<AutomationRule> CreateInvitationAutomationAsync(Guid communityId, Guid creatorId, CreateAutomationRuleRequest request);
        Task<List<AutomationRule>> GetInvitationAutomationsAsync(Guid communityId);
        Task<bool> TriggerAutomationRuleAsync(Guid ruleId, AutomationTriggerContext context);

        // Notification Management
        Task<bool> SendInvitationNotificationAsync(Guid invitationId, NotificationChannel channel);
        Task<List<InvitationNotification>> GetInvitationNotificationsAsync(Guid userId, bool unreadOnly = true);
        Task<bool> MarkNotificationAsReadAsync(Guid notificationId, Guid userId);
        Task<NotificationPreferences> GetNotificationPreferencesAsync(Guid userId);
        Task<NotificationPreferences> UpdateNotificationPreferencesAsync(Guid userId, UpdateNotificationPreferencesRequest request);
    }

    // Data Models
    public class CommunityInvitation
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid InviterId { get; set; }
        public Guid? InviteeId { get; set; }
        public string? InviteeEmail { get; set; }
        public string? InviteeUsername { get; set; }
        public InvitationType Type { get; set; }
        public InvitationStatus Status { get; set; }
        public string? PersonalMessage { get; set; }
        public List<string> Permissions { get; set; } = new();
        public InvitationMetadata Metadata { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? DeclinedAt { get; set; }
        public DateTime? RevokedAt { get; set; }
        public string? DeclineReason { get; set; }
        public string? RevokeReason { get; set; }
        public int ResendCount { get; set; }
        public DateTime? LastResendAt { get; set; }

        // Navigation properties
        public Community? Community { get; set; }
        public User? Inviter { get; set; }
        public User? Invitee { get; set; }
    }

    public class InvitationMetadata
    {
        public string? Source { get; set; } // "manual", "bulk", "automation", "referral"
        public string? Campaign { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public string? OriginalLanguage { get; set; }
        public string? InviterDevice { get; set; }
        public string? InviterLocation { get; set; }
    }

    public class InvitationLink
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid CreatorId { get; set; }
        public string InviteCode { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public InvitationLinkSettings Settings { get; set; } = new();
        public InvitationLinkUsage Usage { get; set; } = new();
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? DeactivatedAt { get; set; }
    }

    public class InvitationLinkSettings
    {
        public int? MaxUses { get; set; }
        public TimeSpan? ValidDuration { get; set; }
        public List<string> AllowedRoles { get; set; } = new();
        public bool RequireApproval { get; set; } = false;
        public List<string> RestrictedRegions { get; set; } = new();
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class InvitationLinkUsage
    {
        public int TimesUsed { get; set; }
        public int SuccessfulAccepts { get; set; }
        public List<InvitationLinkUse> RecentUses { get; set; } = new();
        public DateTime? FirstUsed { get; set; }
        public DateTime? LastUsed { get; set; }
    }

    public class InvitationLinkUse
    {
        public Guid UserId { get; set; }
        public DateTime UsedAt { get; set; }
        public string? UserLocation { get; set; }
        public string? UserDevice { get; set; }
        public bool WasAccepted { get; set; }
    }

    public class FriendInvitation
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public Guid TargetUserId { get; set; }
        public InvitationStatus Status { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? DeclinedAt { get; set; }
        public string? DeclineReason { get; set; }

        // Navigation properties
        public User? Sender { get; set; }
        public User? TargetUser { get; set; }
    }

    public class ServerInvitation
    {
        public Guid Id { get; set; }
        public Guid ServerId { get; set; }
        public Guid InviterId { get; set; }
        public Guid InviteeId { get; set; }
        public InvitationStatus Status { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? DeclinedAt { get; set; }
        public string? DeclineReason { get; set; }

        // Navigation properties
        public GameServer? Server { get; set; }
        public User? Inviter { get; set; }
        public User? Invitee { get; set; }
    }

    public class OnboardingFlow
    {
        public Guid Id { get; set; }
        public Guid CommunityId { get; set; }
        public Guid CreatorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public bool IsDefault { get; set; } = false;
        public OnboardingFlowConfiguration Configuration { get; set; } = new();
        public List<OnboardingStep> Steps { get; set; } = new();
        public OnboardingFlowMetrics Metrics { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int Version { get; set; } = 1;

        // Navigation properties
        public Community? Community { get; set; }
        public User? Creator { get; set; }
    }

    public class OnboardingFlowConfiguration
    {
        public bool AllowSkipping { get; set; } = false;
        public bool RequireCompletion { get; set; } = true;
        public TimeSpan? MaxDuration { get; set; }
        public string? WelcomeMessage { get; set; }
        public string? CompletionMessage { get; set; }
        public List<OnboardingTrigger> Triggers { get; set; } = new();
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class OnboardingStep
    {
        public Guid Id { get; set; }
        public int Order { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public OnboardingStepType Type { get; set; }
        public OnboardingStepContent Content { get; set; } = new();
        public OnboardingStepValidation Validation { get; set; } = new();
        public bool IsRequired { get; set; } = true;
        public bool IsSkippable { get; set; } = false;
        public TimeSpan? EstimatedDuration { get; set; }
        public List<string> Prerequisites { get; set; } = new();
    }

    public class OnboardingStepContent
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? VideoUrl { get; set; }
        public List<string> ImageUrls { get; set; } = new();
        public string? InteractiveContent { get; set; }
        public List<OnboardingAction> Actions { get; set; } = new();
        public Dictionary<string, object> CustomContent { get; set; } = new();
    }

    public class OnboardingAction
    {
        public string Type { get; set; } = string.Empty; // "button", "link", "form", "game", "social"
        public string Label { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Url { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new();
        public bool IsRequired { get; set; } = true;
    }

    public class OnboardingStepValidation
    {
        public bool RequiresManualApproval { get; set; } = false;
        public List<ValidationRule> Rules { get; set; } = new();
        public int? MinimumScore { get; set; }
        public Dictionary<string, object> CustomValidation { get; set; } = new();
    }

    public class ValidationRule
    {
        public string Field { get; set; } = string.Empty;
        public string Operator { get; set; } = string.Empty;
        public object Value { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public class OnboardingSession
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid CommunityId { get; set; }
        public Guid FlowId { get; set; }
        public OnboardingStatus Status { get; set; }
        public int CurrentStepIndex { get; set; } = 0;
        public OnboardingProgress Progress { get; set; } = new();
        public List<OnboardingStepResult> CompletedSteps { get; set; } = new();
        public OnboardingSessionMetadata Metadata { get; set; } = new();
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? AbandonedAt { get; set; }
        public DateTime? LastActivityAt { get; set; }
        public string? AbandonReason { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public Community? Community { get; set; }
        public OnboardingFlow? Flow { get; set; }
    }

    public class OnboardingProgress
    {
        public float CompletionPercentage { get; set; }
        public int StepsCompleted { get; set; }
        public int TotalSteps { get; set; }
        public TimeSpan TimeSpent { get; set; }
        public TimeSpan? EstimatedTimeRemaining { get; set; }
        public float EngagementScore { get; set; }
        public List<string> Achievements { get; set; } = new();
    }

    public class OnboardingStepResult
    {
        public Guid StepId { get; set; }
        public OnboardingStepStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public TimeSpan TimeSpent { get; set; }
        public Dictionary<string, object> Data { get; set; } = new();
        public float? Score { get; set; }
        public string? Feedback { get; set; }
        public int AttemptCount { get; set; } = 1;
    }

    public class OnboardingSessionMetadata
    {
        public string? SourceInvitation { get; set; }
        public string? ReferralCode { get; set; }
        public string? UserDevice { get; set; }
        public string? UserLocation { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }

    // Request DTOs
    public class CreateCommunityInvitationRequest
    {
        public Guid CommunityId { get; set; }
        public string? InviteeEmail { get; set; }
        public string? InviteeUsername { get; set; }
        public Guid? InviteeId { get; set; }
        public string? PersonalMessage { get; set; }
        public List<string> Permissions { get; set; } = new();
        public DateTime? ExpiresAt { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class CreateServerInvitationRequest
    {
        public Guid ServerId { get; set; }
        public Guid InviteeId { get; set; }
        public string? Message { get; set; }
    }

    public class BulkInvitationRequest
    {
        public Guid CommunityId { get; set; }
        public List<BulkInvitationTarget> Targets { get; set; } = new();
        public string? DefaultMessage { get; set; }
        public List<string> Permissions { get; set; } = new();
        public DateTime? ExpiresAt { get; set; }
        public BulkInvitationSettings Settings { get; set; } = new();
    }

    public class BulkInvitationTarget
    {
        public string? Email { get; set; }
        public string? Username { get; set; }
        public Guid? UserId { get; set; }
        public string? PersonalMessage { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class BulkInvitationSettings
    {
        public int BatchSize { get; set; } = 10;
        public TimeSpan BatchDelay { get; set; } = TimeSpan.FromSeconds(1);
        public bool SendImmediately { get; set; } = true;
        public bool SkipDuplicates { get; set; } = true;
        public string? Campaign { get; set; }
    }

    public class CreateOnboardingFlowRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
        public OnboardingFlowConfiguration Configuration { get; set; } = new();
        public List<OnboardingStep> Steps { get; set; } = new();
    }

    public class UpdateOnboardingFlowRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDefault { get; set; }
        public OnboardingFlowConfiguration? Configuration { get; set; }
        public List<OnboardingStep>? Steps { get; set; }
    }

    // Enums
    public enum InvitationType
    {
        Direct,
        Email,
        Link,
        Bulk,
        Automated
    }

    public enum InvitationStatus
    {
        Pending,
        Sent,
        Accepted,
        Declined,
        Expired,
        Revoked
    }

    public enum InvitationAction
    {
        Accept,
        Decline,
        Revoke
    }

    public enum InvitationDirection
    {
        Sent,
        Received
    }

    public enum OnboardingStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Abandoned,
        Paused
    }

    public enum OnboardingStepType
    {
        Welcome,
        ProfileSetup,
        TutorialVideo,
        InteractiveGuide,
        CommunityIntroduction,
        RulesAgreement,
        ServerSelection,
        FriendInvitation,
        CustomContent,
        Survey,
        Verification
    }

    public enum OnboardingStepStatus
    {
        NotStarted,
        InProgress,
        Completed,
        Skipped,
        Failed
    }

    public enum OnboardingTrigger
    {
        AccountCreation,
        CommunityJoin,
        FirstLogin,
        InvitationAccept,
        Manual
    }

    public enum WelcomeTrigger
    {
        FirstJoin,
        ReturnVisit,
        SpecialEvent,
        Achievement,
        Manual
    }

    public enum BuddyRole
    {
        Mentor,
        Mentee
    }

    public enum InvitationTemplateType
    {
        Community,
        Friend,
        Server,
        Event
    }

    public enum NotificationChannel
    {
        Email,
        InApp,
        Discord,
        SMS,
        Push
    }

    public enum InvitationReportTimeframe
    {
        Week,
        Month,
        Quarter,
        Year
    }

    // Result & Analytics Classes (Simplified placeholders)
    public class BulkInvitationResult
    {
        public Guid Id { get; set; }
        public int TotalTargets { get; set; }
        public int SuccessfulSends { get; set; }
        public int FailedSends { get; set; }
        public BulkInvitationStatus Status { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public List<BulkInvitationError> Errors { get; set; } = new();
    }

    public class BulkInvitationStatus
    {
        public string Phase { get; set; } = string.Empty; // "Queued", "Processing", "Completed", "Failed"
        public float Progress { get; set; }
        public int ProcessedCount { get; set; }
        public int RemainingCount { get; set; }
        public TimeSpan? EstimatedTimeRemaining { get; set; }
    }

    public class BulkInvitationError
    {
        public string Target { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public string? Details { get; set; }
    }

    public class InvitationAnalytics
    {
        public Guid CommunityId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public InvitationMetrics Metrics { get; set; } = new();
        public List<InvitationTrend> Trends { get; set; } = new();
        public InvitationConversionAnalysis Conversion { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
    }

    public class InvitationMetrics
    {
        public int TotalInvitations { get; set; }
        public int AcceptedInvitations { get; set; }
        public int DeclinedInvitations { get; set; }
        public int PendingInvitations { get; set; }
        public float AcceptanceRate { get; set; }
        public float DeclineRate { get; set; }
        public TimeSpan AverageResponseTime { get; set; }
    }

    public class InvitationTrend
    {
        public DateTime Date { get; set; }
        public int Sent { get; set; }
        public int Accepted { get; set; }
        public int Declined { get; set; }
        public float AcceptanceRate { get; set; }
    }

    public class InvitationConversionAnalysis
    {
        public Dictionary<string, float> ConversionBySource { get; set; } = new();
        public Dictionary<string, float> ConversionByType { get; set; } = new();
        public Dictionary<string, TimeSpan> ResponseTimeByType { get; set; } = new();
        public List<string> TopPerformingMessages { get; set; } = new();
    }

    // Additional placeholder classes
    public class InvitationConversionMetric { }
    public class InvitationPerformanceReport { }
    public class OnboardingCheckpoint { }
    public class OnboardingCheckpointData { }
    public class OnboardingCompletionData { }
    public class OnboardingAnalytics { }
    public class OnboardingFunnelAnalysis { }
    public class OnboardingDropoffPoint { }
    public class OnboardingOptimizationReport { }
    public class OnboardingFlowMetrics { }
    public class WelcomeExperience { }
    public class CreateWelcomeExperienceRequest { }
    public class UpdateWelcomeExperienceRequest { }
    public class BuddyAssignment { }
    public class BuddyAssignmentCriteria { }
    public class UpdateBuddyAssignmentRequest { }
    public class BuddyCompletionData { }
    public class PotentialBuddy { }
    public class InvitationTemplate { }
    public class CreateInvitationTemplateRequest { }
    public class UpdateInvitationTemplateRequest { }
    public class ReferralCode { }
    public class ReferralCodeSettings { }
    public class ReferralResult { }
    public class ReferralAnalytics { }
    public class ReferralReward { }
    public class InvitationSuggestion { }
    public class OnboardingRecommendation { }
    public class PersonalizedInvitationContent { }
    public class DiscordIntegrationSettings { }
    public class AutomationRule { }
    public class CreateAutomationRuleRequest { }
    public class AutomationTriggerContext { }
    public class InvitationNotification { }
    public class NotificationPreferences { }
    public class UpdateNotificationPreferencesRequest { }
}