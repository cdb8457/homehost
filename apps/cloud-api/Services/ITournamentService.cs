using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface ITournamentService
    {
        // Tournament Management
        Task<Tournament> CreateTournamentAsync(Guid userId, CreateTournamentRequest request);
        Task<List<Tournament>> GetTournamentsAsync(TournamentFilter? filter = null);
        Task<Tournament> GetTournamentAsync(Guid tournamentId);
        Task<Tournament> UpdateTournamentAsync(Guid tournamentId, Guid userId, UpdateTournamentRequest request);
        Task<bool> DeleteTournamentAsync(Guid tournamentId, Guid userId);
        Task<List<Tournament>> GetUserTournamentsAsync(Guid userId, TournamentFilter? filter = null);

        // Tournament Participation
        Task<TournamentParticipation> JoinTournamentAsync(Guid tournamentId, Guid userId, JoinTournamentRequest request);
        Task<bool> LeaveTournamentAsync(Guid tournamentId, Guid userId);
        Task<List<TournamentParticipation>> GetTournamentParticipantsAsync(Guid tournamentId);
        Task<TournamentParticipation> GetParticipationAsync(Guid tournamentId, Guid userId);
        Task<bool> KickParticipantAsync(Guid tournamentId, Guid participantId, Guid userId);

        // Tournament Brackets & Matchmaking
        Task<TournamentBracket> GenerateBracketAsync(Guid tournamentId, Guid userId);
        Task<TournamentBracket> GetTournamentBracketAsync(Guid tournamentId);
        Task<List<TournamentMatch>> GetTournamentMatchesAsync(Guid tournamentId);
        Task<TournamentMatch> GetMatchAsync(Guid matchId);
        Task<TournamentMatch> UpdateMatchResultAsync(Guid matchId, Guid userId, UpdateMatchResultRequest request);

        // Tournament Scheduling
        Task<TournamentSchedule> CreateTournamentScheduleAsync(Guid tournamentId, Guid userId, CreateTournamentScheduleRequest request);
        Task<TournamentSchedule> GetTournamentScheduleAsync(Guid tournamentId);
        Task<TournamentSchedule> UpdateTournamentScheduleAsync(Guid scheduleId, Guid userId, UpdateTournamentScheduleRequest request);
        Task<List<TournamentEvent>> GetTournamentEventsAsync(Guid tournamentId);
        Task<bool> RescheduleTournamentAsync(Guid tournamentId, Guid userId, RescheduleTournamentRequest request);

        // Tournament Administration
        Task<bool> StartTournamentAsync(Guid tournamentId, Guid userId);
        Task<bool> PauseTournamentAsync(Guid tournamentId, Guid userId);
        Task<bool> ResumeTournamentAsync(Guid tournamentId, Guid userId);
        Task<bool> CancelTournamentAsync(Guid tournamentId, Guid userId);
        Task<bool> FinalizeTournamentAsync(Guid tournamentId, Guid userId);

        // Tournament Rules & Configuration
        Task<TournamentRules> CreateTournamentRulesAsync(Guid tournamentId, Guid userId, CreateTournamentRulesRequest request);
        Task<TournamentRules> GetTournamentRulesAsync(Guid tournamentId);
        Task<TournamentRules> UpdateTournamentRulesAsync(Guid rulesId, Guid userId, UpdateTournamentRulesRequest request);
        Task<bool> EnforceTournamentRulesAsync(Guid tournamentId, Guid userId);

        // Multi-Game Support
        Task<List<SupportedGame>> GetSupportedGamesAsync();
        Task<GameConfiguration> GetGameConfigurationAsync(Guid gameId);
        Task<GameConfiguration> UpdateGameConfigurationAsync(Guid gameId, Guid userId, UpdateGameConfigurationRequest request);
        Task<bool> AddGameToTournamentAsync(Guid tournamentId, Guid gameId, Guid userId);
        Task<bool> RemoveGameFromTournamentAsync(Guid tournamentId, Guid gameId, Guid userId);

        // Tournament Formats
        Task<TournamentFormat> CreateTournamentFormatAsync(Guid userId, CreateTournamentFormatRequest request);
        Task<List<TournamentFormat>> GetTournamentFormatsAsync(Guid? gameId = null);
        Task<TournamentFormat> GetTournamentFormatAsync(Guid formatId);
        Task<TournamentFormat> UpdateTournamentFormatAsync(Guid formatId, Guid userId, UpdateTournamentFormatRequest request);
        Task<bool> DeleteTournamentFormatAsync(Guid formatId, Guid userId);

        // Tournament Prizes & Rewards
        Task<TournamentPrize> CreateTournamentPrizeAsync(Guid tournamentId, Guid userId, CreateTournamentPrizeRequest request);
        Task<List<TournamentPrize>> GetTournamentPrizesAsync(Guid tournamentId);
        Task<TournamentPrize> UpdateTournamentPrizeAsync(Guid prizeId, Guid userId, UpdateTournamentPrizeRequest request);
        Task<bool> DeleteTournamentPrizeAsync(Guid prizeId, Guid userId);
        Task<bool> DistributePrizesAsync(Guid tournamentId, Guid userId);

        // Tournament Statistics & Analytics
        Task<TournamentStatistics> GetTournamentStatisticsAsync(Guid tournamentId);
        Task<ParticipantStatistics> GetParticipantStatisticsAsync(Guid tournamentId, Guid participantId);
        Task<List<TournamentLeaderboard>> GetTournamentLeaderboardAsync(Guid tournamentId);
        Task<TournamentAnalytics> GetTournamentAnalyticsAsync(Guid tournamentId, Guid userId);

        // Tournament Streaming & Broadcasting
        Task<TournamentStream> CreateTournamentStreamAsync(Guid tournamentId, Guid userId, CreateTournamentStreamRequest request);
        Task<List<TournamentStream>> GetTournamentStreamsAsync(Guid tournamentId);
        Task<TournamentStream> UpdateTournamentStreamAsync(Guid streamId, Guid userId, UpdateTournamentStreamRequest request);
        Task<bool> DeleteTournamentStreamAsync(Guid streamId, Guid userId);

        // Tournament Notifications
        Task<bool> SendTournamentNotificationAsync(Guid tournamentId, Guid userId, SendTournamentNotificationRequest request);
        Task<List<TournamentNotification>> GetTournamentNotificationsAsync(Guid tournamentId);
        Task<bool> SubscribeToTournamentAsync(Guid tournamentId, Guid userId);
        Task<bool> UnsubscribeFromTournamentAsync(Guid tournamentId, Guid userId);

        // Tournament Moderation
        Task<TournamentModerator> AddTournamentModeratorAsync(Guid tournamentId, Guid moderatorId, Guid userId);
        Task<List<TournamentModerator>> GetTournamentModeratorsAsync(Guid tournamentId);
        Task<bool> RemoveTournamentModeratorAsync(Guid tournamentId, Guid moderatorId, Guid userId);
        Task<bool> ReportTournamentIssueAsync(Guid tournamentId, Guid userId, ReportTournamentIssueRequest request);
        Task<List<TournamentReport>> GetTournamentReportsAsync(Guid tournamentId);

        // Tournament Templates
        Task<TournamentTemplate> CreateTournamentTemplateAsync(Guid userId, CreateTournamentTemplateRequest request);
        Task<List<TournamentTemplate>> GetTournamentTemplatesAsync(Guid? gameId = null);
        Task<TournamentTemplate> GetTournamentTemplateAsync(Guid templateId);
        Task<Tournament> CreateTournamentFromTemplateAsync(Guid templateId, Guid userId, CreateTournamentFromTemplateRequest request);
        Task<bool> DeleteTournamentTemplateAsync(Guid templateId, Guid userId);

        // Tournament Series & Leagues
        Task<TournamentSeries> CreateTournamentSeriesAsync(Guid userId, CreateTournamentSeriesRequest request);
        Task<List<TournamentSeries>> GetTournamentSeriesAsync(Guid? gameId = null);
        Task<TournamentSeries> GetTournamentSeriesAsync(Guid seriesId);
        Task<bool> AddTournamentToSeriesAsync(Guid seriesId, Guid tournamentId, Guid userId);
        Task<bool> RemoveTournamentFromSeriesAsync(Guid seriesId, Guid tournamentId, Guid userId);

        // Tournament Spectating
        Task<TournamentSpectator> JoinAsSpectatorAsync(Guid tournamentId, Guid userId);
        Task<bool> LeaveAsSpectatorAsync(Guid tournamentId, Guid userId);
        Task<List<TournamentSpectator>> GetTournamentSpectatorsAsync(Guid tournamentId);
        Task<SpectatorExperience> GetSpectatorExperienceAsync(Guid tournamentId, Guid userId);

        // Tournament Replay System
        Task<TournamentReplay> CreateTournamentReplayAsync(Guid matchId, Guid userId, CreateTournamentReplayRequest request);
        Task<List<TournamentReplay>> GetTournamentReplaysAsync(Guid tournamentId);
        Task<TournamentReplay> GetTournamentReplayAsync(Guid replayId);
        Task<bool> DeleteTournamentReplayAsync(Guid replayId, Guid userId);
    }

    // Data Models
    public class Tournament
    {
        public Guid Id { get; set; }
        public Guid OrganizerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<Guid> GameIds { get; set; } = new();
        public TournamentType Type { get; set; }
        public TournamentStatus Status { get; set; }
        public Guid FormatId { get; set; }
        public int MaxParticipants { get; set; }
        public int MinParticipants { get; set; }
        public decimal EntryFee { get; set; }
        public decimal PrizePool { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime RegistrationDeadline { get; set; }
        public bool IsPublic { get; set; } = true;
        public bool AllowSpectators { get; set; } = true;
        public TournamentSettings Settings { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public TournamentMetadata Metadata { get; set; } = new();

        // Navigation properties
        public User? Organizer { get; set; }
        public TournamentFormat? Format { get; set; }
        public List<TournamentParticipation> Participants { get; set; } = new();
        public List<TournamentMatch> Matches { get; set; } = new();
        public List<TournamentPrize> Prizes { get; set; } = new();
    }

    public class TournamentSettings
    {
        public bool AllowLateRegistration { get; set; } = false;
        public bool RequireApproval { get; set; } = false;
        public bool EnableChat { get; set; } = true;
        public bool EnableStreaming { get; set; } = true;
        public bool EnableReplays { get; set; } = true;
        public int MaxTeamSize { get; set; } = 1;
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class TournamentMetadata
    {
        public string Region { get; set; } = string.Empty;
        public string Language { get; set; } = "en";
        public List<string> Tags { get; set; } = new();
        public string? BannerUrl { get; set; }
        public string? LogoUrl { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

    public class TournamentParticipation
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public Guid ParticipantId { get; set; }
        public string? TeamName { get; set; }
        public List<Guid> TeamMembers { get; set; } = new();
        public ParticipationStatus Status { get; set; }
        public DateTime RegisteredAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public ParticipantStatistics Statistics { get; set; } = new();

        // Navigation properties
        public Tournament? Tournament { get; set; }
        public User? Participant { get; set; }
    }

    public class TournamentBracket
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public BracketType Type { get; set; }
        public List<BracketRound> Rounds { get; set; } = new();
        public DateTime GeneratedAt { get; set; }
        public BracketConfiguration Configuration { get; set; } = new();

        // Navigation properties
        public Tournament? Tournament { get; set; }
    }

    public class BracketRound
    {
        public int RoundNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<TournamentMatch> Matches { get; set; } = new();
        public DateTime? ScheduledStart { get; set; }
        public RoundStatus Status { get; set; }
    }

    public class TournamentMatch
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public Guid BracketId { get; set; }
        public int RoundNumber { get; set; }
        public int MatchNumber { get; set; }
        public List<Guid> ParticipantIds { get; set; } = new();
        public Guid? WinnerId { get; set; }
        public MatchStatus Status { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public MatchResult Result { get; set; } = new();
        public List<MatchGame> Games { get; set; } = new();

        // Navigation properties
        public Tournament? Tournament { get; set; }
        public TournamentBracket? Bracket { get; set; }
        public User? Winner { get; set; }
    }

    public class MatchResult
    {
        public Dictionary<Guid, int> ParticipantScores { get; set; } = new();
        public string? Notes { get; set; }
        public List<string> Screenshots { get; set; } = new();
        public Dictionary<string, object> GameSpecificData { get; set; } = new();
    }

    public class MatchGame
    {
        public Guid GameId { get; set; }
        public string GameName { get; set; } = string.Empty;
        public Dictionary<Guid, int> Scores { get; set; } = new();
        public Guid? WinnerId { get; set; }
        public DateTime? PlayedAt { get; set; }
        public GameResult Result { get; set; } = new();
    }

    public class GameResult
    {
        public TimeSpan Duration { get; set; }
        public Dictionary<string, object> Statistics { get; set; } = new();
        public string? ReplayUrl { get; set; }
    }

    public class TournamentSchedule
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public string TimeZone { get; set; } = "UTC";
        public List<ScheduledEvent> Events { get; set; } = new();
        public Dictionary<string, object> Settings { get; set; } = new();

        // Navigation properties
        public Tournament? Tournament { get; set; }
    }

    public class ScheduledEvent
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public EventType Type { get; set; }
        public DateTime ScheduledTime { get; set; }
        public TimeSpan? Duration { get; set; }
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public class TournamentRules
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<TournamentRule> Rules { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Tournament? Tournament { get; set; }
    }

    public class TournamentRule
    {
        public string Category { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public RuleSeverity Severity { get; set; }
        public List<string> Penalties { get; set; } = new();
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public class TournamentFormat
    {
        public Guid Id { get; set; }
        public Guid CreatorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public FormatType Type { get; set; }
        public List<Guid> SupportedGameIds { get; set; } = new();
        public FormatConfiguration Configuration { get; set; } = new();
        public bool IsPublic { get; set; } = true;
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public User? Creator { get; set; }
    }

    public class FormatConfiguration
    {
        public int MaxParticipants { get; set; }
        public int MinParticipants { get; set; }
        public int MaxRounds { get; set; }
        public bool AllowByes { get; set; } = true;
        public bool UseSeeding { get; set; } = true;
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class TournamentPrize
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public int Position { get; set; }
        public string Name { get; set; } = string.Empty;
        public PrizeType Type { get; set; }
        public decimal Value { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAwarded { get; set; } = false;
        public Guid? AwardedToId { get; set; }
        public DateTime? AwardedAt { get; set; }

        // Navigation properties
        public Tournament? Tournament { get; set; }
        public User? AwardedTo { get; set; }
    }

    public class TournamentStatistics
    {
        public Guid TournamentId { get; set; }
        public int TotalParticipants { get; set; }
        public int CompletedMatches { get; set; }
        public int TotalMatches { get; set; }
        public TimeSpan AverageMatchDuration { get; set; }
        public Dictionary<string, int> GamePlayCounts { get; set; } = new();
        public Dictionary<string, object> AdditionalStats { get; set; } = new();
    }

    public class ParticipantStatistics
    {
        public Guid ParticipantId { get; set; }
        public int MatchesPlayed { get; set; }
        public int MatchesWon { get; set; }
        public int MatchesLost { get; set; }
        public double WinRate { get; set; }
        public int CurrentPosition { get; set; }
        public Dictionary<string, object> GameSpecificStats { get; set; } = new();
    }

    public class TournamentLeaderboard
    {
        public int Position { get; set; }
        public Guid ParticipantId { get; set; }
        public string ParticipantName { get; set; } = string.Empty;
        public int Points { get; set; }
        public int MatchesPlayed { get; set; }
        public int MatchesWon { get; set; }
        public double WinRate { get; set; }
    }

    public class TournamentStream
    {
        public Guid Id { get; set; }
        public Guid TournamentId { get; set; }
        public Guid StreamerId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string StreamUrl { get; set; } = string.Empty;
        public bool IsLive { get; set; } = false;
        public int ViewerCount { get; set; } = 0;
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Tournament? Tournament { get; set; }
        public User? Streamer { get; set; }
    }

    // Request DTOs
    public class CreateTournamentRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<Guid> GameIds { get; set; } = new();
        public TournamentType Type { get; set; }
        public Guid FormatId { get; set; }
        public int MaxParticipants { get; set; }
        public int MinParticipants { get; set; }
        public decimal EntryFee { get; set; } = 0;
        public decimal PrizePool { get; set; } = 0;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime RegistrationDeadline { get; set; }
        public bool IsPublic { get; set; } = true;
        public bool AllowSpectators { get; set; } = true;
        public TournamentSettings Settings { get; set; } = new();
        public TournamentMetadata Metadata { get; set; } = new();
    }

    public class UpdateTournamentRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<Guid>? GameIds { get; set; }
        public int? MaxParticipants { get; set; }
        public int? MinParticipants { get; set; }
        public decimal? EntryFee { get; set; }
        public decimal? PrizePool { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime? RegistrationDeadline { get; set; }
        public bool? IsPublic { get; set; }
        public bool? AllowSpectators { get; set; }
        public TournamentSettings? Settings { get; set; }
        public TournamentMetadata? Metadata { get; set; }
    }

    public class JoinTournamentRequest
    {
        public string? TeamName { get; set; }
        public List<Guid> TeamMembers { get; set; } = new();
        public string? Message { get; set; }
    }

    public class UpdateMatchResultRequest
    {
        public Guid WinnerId { get; set; }
        public MatchResult Result { get; set; } = new();
        public string? Notes { get; set; }
    }

    public class CreateTournamentScheduleRequest
    {
        public string TimeZone { get; set; } = "UTC";
        public List<ScheduledEvent> Events { get; set; } = new();
        public Dictionary<string, object> Settings { get; set; } = new();
    }

    public class UpdateTournamentScheduleRequest
    {
        public string? TimeZone { get; set; }
        public List<ScheduledEvent>? Events { get; set; }
        public Dictionary<string, object>? Settings { get; set; }
    }

    public class RescheduleTournamentRequest
    {
        public DateTime NewStartDate { get; set; }
        public DateTime NewEndDate { get; set; }
        public string? Reason { get; set; }
    }

    public class CreateTournamentRulesRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<TournamentRule> Rules { get; set; } = new();
    }

    public class UpdateTournamentRulesRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public List<TournamentRule>? Rules { get; set; }
    }

    public class UpdateGameConfigurationRequest
    {
        public Dictionary<string, object> Settings { get; set; } = new();
    }

    public class CreateTournamentFormatRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public FormatType Type { get; set; }
        public List<Guid> SupportedGameIds { get; set; } = new();
        public FormatConfiguration Configuration { get; set; } = new();
        public bool IsPublic { get; set; } = true;
    }

    public class UpdateTournamentFormatRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<Guid>? SupportedGameIds { get; set; }
        public FormatConfiguration? Configuration { get; set; }
        public bool? IsPublic { get; set; }
    }

    public class CreateTournamentPrizeRequest
    {
        public int Position { get; set; }
        public string Name { get; set; } = string.Empty;
        public PrizeType Type { get; set; }
        public decimal Value { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class UpdateTournamentPrizeRequest
    {
        public int? Position { get; set; }
        public string? Name { get; set; }
        public PrizeType? Type { get; set; }
        public decimal? Value { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class CreateTournamentStreamRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Platform { get; set; } = string.Empty;
        public string StreamUrl { get; set; } = string.Empty;
    }

    public class UpdateTournamentStreamRequest
    {
        public string? Title { get; set; }
        public string? Platform { get; set; }
        public string? StreamUrl { get; set; }
        public bool? IsLive { get; set; }
    }

    public class SendTournamentNotificationRequest
    {
        public string Message { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public List<Guid>? TargetParticipants { get; set; }
        public bool SendToAll { get; set; } = false;
    }

    public class ReportTournamentIssueRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public IssueType Type { get; set; }
        public IssueSeverity Severity { get; set; }
        public List<string> Evidence { get; set; } = new();
    }

    public class CreateTournamentTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<Guid> GameIds { get; set; } = new();
        public TournamentType Type { get; set; }
        public Guid FormatId { get; set; }
        public TournamentSettings Settings { get; set; } = new();
        public bool IsPublic { get; set; } = true;
    }

    public class CreateTournamentFromTemplateRequest
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime RegistrationDeadline { get; set; }
        public int MaxParticipants { get; set; }
        public decimal EntryFee { get; set; } = 0;
        public decimal PrizePool { get; set; } = 0;
    }

    public class CreateTournamentSeriesRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<Guid> GameIds { get; set; } = new();
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public SeriesSettings Settings { get; set; } = new();
    }

    public class CreateTournamentReplayRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string ReplayUrl { get; set; } = string.Empty;
        public TimeSpan Duration { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    // Enums
    public enum TournamentType
    {
        SingleElimination,
        DoubleElimination,
        RoundRobin,
        Swiss,
        Custom
    }

    public enum TournamentStatus
    {
        Draft,
        Open,
        InProgress,
        Completed,
        Cancelled
    }

    public enum ParticipationStatus
    {
        Registered,
        Approved,
        Rejected,
        Withdrawn
    }

    public enum BracketType
    {
        SingleElimination,
        DoubleElimination,
        RoundRobin,
        Swiss
    }

    public enum RoundStatus
    {
        Pending,
        InProgress,
        Completed
    }

    public enum MatchStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Cancelled,
        Disputed
    }

    public enum EventType
    {
        Registration,
        TournamentStart,
        RoundStart,
        MatchStart,
        MatchEnd,
        RoundEnd,
        TournamentEnd
    }

    public enum RuleSeverity
    {
        Info,
        Warning,
        Minor,
        Major,
        Critical
    }

    public enum FormatType
    {
        SingleElimination,
        DoubleElimination,
        RoundRobin,
        Swiss,
        Custom
    }

    public enum PrizeType
    {
        Cash,
        Item,
        Trophy,
        Title,
        Custom
    }

    public enum NotificationType
    {
        General,
        MatchStart,
        MatchResult,
        TournamentUpdate,
        RuleViolation
    }

    public enum IssueType
    {
        Technical,
        Behavioral,
        Cheating,
        RuleViolation,
        Other
    }

    public enum IssueSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }

    // Placeholder classes for complex types
    public class TournamentFilter { }
    public class TournamentEvent { }
    public class SupportedGame { }
    public class GameConfiguration { }
    public class TournamentAnalytics { }
    public class TournamentNotification { }
    public class TournamentModerator { }
    public class TournamentReport { }
    public class TournamentTemplate { }
    public class TournamentSeries { }
    public class SeriesSettings { }
    public class TournamentSpectator { }
    public class SpectatorExperience { }
    public class TournamentReplay { }
    public class BracketConfiguration { }
}