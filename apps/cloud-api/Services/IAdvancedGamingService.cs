using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IAdvancedGamingService
    {
        // Game Instance Management
        Task<GameInstance> CreateGameInstanceAsync(Guid organizationId, Guid userId, CreateGameInstanceRequest request);
        Task<List<GameInstance>> GetGameInstancesAsync(Guid organizationId, GameInstanceFilter? filter = null);
        Task<GameInstance> GetGameInstanceAsync(Guid instanceId);
        Task<GameInstance> UpdateGameInstanceAsync(Guid instanceId, Guid userId, UpdateGameInstanceRequest request);
        Task<bool> DeleteGameInstanceAsync(Guid instanceId, Guid userId);
        Task<GameInstance> CloneGameInstanceAsync(Guid instanceId, Guid userId, CloneGameInstanceRequest request);
        Task<bool> StartGameInstanceAsync(Guid instanceId, Guid userId);
        Task<bool> StopGameInstanceAsync(Guid instanceId, Guid userId);
        Task<bool> RestartGameInstanceAsync(Guid instanceId, Guid userId);

        // Advanced Server Management
        Task<ServerTemplate> CreateServerTemplateAsync(Guid organizationId, Guid userId, CreateServerTemplateRequest request);
        Task<List<ServerTemplate>> GetServerTemplatesAsync(Guid organizationId, ServerTemplateFilter? filter = null);
        Task<ServerTemplate> GetServerTemplateAsync(Guid templateId);
        Task<ServerTemplate> UpdateServerTemplateAsync(Guid templateId, Guid userId, UpdateServerTemplateRequest request);
        Task<bool> DeleteServerTemplateAsync(Guid templateId, Guid userId);
        Task<GameInstance> CreateInstanceFromTemplateAsync(Guid templateId, Guid userId, CreateInstanceFromTemplateRequest request);
        Task<List<ServerTemplate>> GetPublicServerTemplatesAsync(PublicTemplateFilter? filter = null);

        // World Management
        Task<GameWorld> CreateGameWorldAsync(Guid organizationId, Guid userId, CreateGameWorldRequest request);
        Task<List<GameWorld>> GetGameWorldsAsync(Guid organizationId, GameWorldFilter? filter = null);
        Task<GameWorld> GetGameWorldAsync(Guid worldId);
        Task<GameWorld> UpdateGameWorldAsync(Guid worldId, Guid userId, UpdateGameWorldRequest request);
        Task<bool> DeleteGameWorldAsync(Guid worldId, Guid userId);
        Task<WorldBackup> CreateWorldBackupAsync(Guid worldId, Guid userId, CreateWorldBackupRequest request);
        Task<List<WorldBackup>> GetWorldBackupsAsync(Guid worldId, WorldBackupFilter? filter = null);
        Task<bool> RestoreWorldFromBackupAsync(Guid worldId, Guid backupId, Guid userId);
        Task<bool> TransferWorldAsync(Guid worldId, Guid fromInstanceId, Guid toInstanceId, Guid userId);

        // Player Data Management
        Task<PlayerData> GetPlayerDataAsync(Guid playerId, Guid gameInstanceId);
        Task<PlayerData> UpdatePlayerDataAsync(Guid playerId, Guid gameInstanceId, UpdatePlayerDataRequest request);
        Task<bool> TransferPlayerDataAsync(Guid playerId, Guid fromInstanceId, Guid toInstanceId, Guid userId);
        Task<List<PlayerInventory>> GetPlayerInventoryAsync(Guid playerId, Guid gameInstanceId);
        Task<PlayerInventory> UpdatePlayerInventoryAsync(Guid playerId, Guid gameInstanceId, UpdatePlayerInventoryRequest request);
        Task<List<PlayerAchievement>> GetPlayerAchievementsAsync(Guid playerId, PlayerAchievementFilter? filter = null);
        Task<PlayerAchievement> GrantPlayerAchievementAsync(Guid playerId, Guid achievementId, Guid userId);

        // Game Events & Logging
        Task<GameEvent> CreateGameEventAsync(Guid gameInstanceId, CreateGameEventRequest request);
        Task<List<GameEvent>> GetGameEventsAsync(Guid gameInstanceId, GameEventFilter? filter = null);
        Task<List<GameEvent>> GetPlayerEventsAsync(Guid playerId, Guid gameInstanceId, PlayerEventFilter? filter = null);
        Task<GameEventAnalytics> GetGameEventAnalyticsAsync(Guid gameInstanceId, GameEventAnalyticsFilter filter);
        Task<bool> ProcessGameEventAsync(Guid eventId);
        Task<List<GameLogEntry>> GetGameLogsAsync(Guid gameInstanceId, GameLogFilter? filter = null);

        // Matchmaking & Lobbies
        Task<MatchmakingQueue> CreateMatchmakingQueueAsync(Guid organizationId, Guid userId, CreateMatchmakingQueueRequest request);
        Task<List<MatchmakingQueue>> GetMatchmakingQueuesAsync(Guid organizationId, MatchmakingQueueFilter? filter = null);
        Task<MatchmakingQueue> UpdateMatchmakingQueueAsync(Guid queueId, Guid userId, UpdateMatchmakingQueueRequest request);
        Task<bool> DeleteMatchmakingQueueAsync(Guid queueId, Guid userId);
        Task<MatchmakingTicket> JoinMatchmakingQueueAsync(Guid queueId, Guid playerId, JoinMatchmakingRequest request);
        Task<bool> LeaveMatchmakingQueueAsync(Guid ticketId, Guid playerId);
        Task<Match> CreateMatchAsync(Guid queueId, List<Guid> playerIds, CreateMatchRequest request);
        Task<List<Match>> GetActiveMatchesAsync(Guid organizationId, ActiveMatchFilter? filter = null);

        // Game Sessions & Analytics
        Task<GameSession> StartGameSessionAsync(Guid gameInstanceId, Guid playerId, StartGameSessionRequest request);
        Task<bool> EndGameSessionAsync(Guid sessionId, EndGameSessionRequest request);
        Task<List<GameSession>> GetGameSessionsAsync(Guid gameInstanceId, GameSessionFilter? filter = null);
        Task<GameSessionAnalytics> GetGameSessionAnalyticsAsync(Guid gameInstanceId, GameSessionAnalyticsFilter filter);
        Task<PlayerSessionMetrics> GetPlayerSessionMetricsAsync(Guid playerId, PlayerSessionMetricsFilter filter);
        Task<List<SessionEvent>> GetSessionEventsAsync(Guid sessionId, SessionEventFilter? filter = null);

        // Resource Management
        Task<ResourcePool> CreateResourcePoolAsync(Guid organizationId, Guid userId, CreateResourcePoolRequest request);
        Task<List<ResourcePool>> GetResourcePoolsAsync(Guid organizationId, ResourcePoolFilter? filter = null);
        Task<ResourcePool> UpdateResourcePoolAsync(Guid poolId, Guid userId, UpdateResourcePoolRequest request);
        Task<bool> DeleteResourcePoolAsync(Guid poolId, Guid userId);
        Task<ResourceAllocation> AllocateResourcesAsync(Guid poolId, Guid gameInstanceId, ResourceAllocationRequest request);
        Task<bool> DeallocateResourcesAsync(Guid allocationId, Guid userId);
        Task<List<ResourceUsageMetric>> GetResourceUsageMetricsAsync(Guid poolId, ResourceUsageFilter filter);

        // Performance Optimization
        Task<PerformanceProfile> CreatePerformanceProfileAsync(Guid organizationId, Guid userId, CreatePerformanceProfileRequest request);
        Task<List<PerformanceProfile>> GetPerformanceProfilesAsync(Guid organizationId, PerformanceProfileFilter? filter = null);
        Task<PerformanceProfile> UpdatePerformanceProfileAsync(Guid profileId, Guid userId, UpdatePerformanceProfileRequest request);
        Task<bool> DeletePerformanceProfileAsync(Guid profileId, Guid userId);
        Task<bool> ApplyPerformanceProfileAsync(Guid gameInstanceId, Guid profileId, Guid userId);
        Task<PerformanceAnalysis> AnalyzeGamePerformanceAsync(Guid gameInstanceId, PerformanceAnalysisRequest request);
        Task<List<PerformanceRecommendation>> GetPerformanceRecommendationsAsync(Guid gameInstanceId);

        // Content Management
        Task<GameContent> UploadGameContentAsync(Guid organizationId, Guid userId, UploadGameContentRequest request);
        Task<List<GameContent>> GetGameContentAsync(Guid organizationId, GameContentFilter? filter = null);
        Task<GameContent> GetGameContentItemAsync(Guid contentId);
        Task<GameContent> UpdateGameContentAsync(Guid contentId, Guid userId, UpdateGameContentRequest request);
        Task<bool> DeleteGameContentAsync(Guid contentId, Guid userId);
        Task<bool> DeployContentToInstanceAsync(Guid contentId, Guid gameInstanceId, Guid userId);
        Task<List<ContentVersion>> GetContentVersionsAsync(Guid contentId);

        // Custom Game Modes
        Task<CustomGameMode> CreateCustomGameModeAsync(Guid organizationId, Guid userId, CreateCustomGameModeRequest request);
        Task<List<CustomGameMode>> GetCustomGameModesAsync(Guid organizationId, CustomGameModeFilter? filter = null);
        Task<CustomGameMode> GetCustomGameModeAsync(Guid gameModeId);
        Task<CustomGameMode> UpdateCustomGameModeAsync(Guid gameModeId, Guid userId, UpdateCustomGameModeRequest request);
        Task<bool> DeleteCustomGameModeAsync(Guid gameModeId, Guid userId);
        Task<bool> EnableGameModeOnInstanceAsync(Guid gameModeId, Guid gameInstanceId, Guid userId);
        Task<List<GameModeConfiguration>> GetGameModeConfigurationsAsync(Guid gameModeId);

        // Networking & Communication
        Task<NetworkConfiguration> CreateNetworkConfigurationAsync(Guid organizationId, Guid userId, CreateNetworkConfigurationRequest request);
        Task<List<NetworkConfiguration>> GetNetworkConfigurationsAsync(Guid organizationId, NetworkConfigurationFilter? filter = null);
        Task<NetworkConfiguration> UpdateNetworkConfigurationAsync(Guid configId, Guid userId, UpdateNetworkConfigurationRequest request);
        Task<bool> DeleteNetworkConfigurationAsync(Guid configId, Guid userId);
        Task<bool> ApplyNetworkConfigurationAsync(Guid gameInstanceId, Guid configId, Guid userId);
        Task<NetworkDiagnostics> RunNetworkDiagnosticsAsync(Guid gameInstanceId, NetworkDiagnosticsRequest request);
        Task<List<NetworkMetric>> GetNetworkMetricsAsync(Guid gameInstanceId, NetworkMetricsFilter filter);

        // Game State Management
        Task<GameState> GetGameStateAsync(Guid gameInstanceId);
        Task<GameStateSnapshot> CreateGameStateSnapshotAsync(Guid gameInstanceId, Guid userId, CreateGameStateSnapshotRequest request);
        Task<List<GameStateSnapshot>> GetGameStateSnapshotsAsync(Guid gameInstanceId, GameStateSnapshotFilter? filter = null);
        Task<bool> RestoreGameStateAsync(Guid gameInstanceId, Guid snapshotId, Guid userId);
        Task<bool> SyncGameStateAsync(Guid fromInstanceId, Guid toInstanceId, Guid userId);
        Task<GameStateDiff> CompareGameStatesAsync(Guid snapshotId1, Guid snapshotId2);

        // Advanced Monitoring
        Task<MonitoringRule> CreateMonitoringRuleAsync(Guid organizationId, Guid userId, CreateMonitoringRuleRequest request);
        Task<List<MonitoringRule>> GetMonitoringRulesAsync(Guid organizationId, MonitoringRuleFilter? filter = null);
        Task<MonitoringRule> UpdateMonitoringRuleAsync(Guid ruleId, Guid userId, UpdateMonitoringRuleRequest request);
        Task<bool> DeleteMonitoringRuleAsync(Guid ruleId, Guid userId);
        Task<List<MonitoringAlert>> GetMonitoringAlertsAsync(Guid organizationId, MonitoringAlertFilter? filter = null);
        Task<bool> AcknowledgeMonitoringAlertAsync(Guid alertId, Guid userId);
        Task<MonitoringDashboard> GetMonitoringDashboardAsync(Guid organizationId, MonitoringDashboardFilter filter);

        // Anti-Cheat & Security
        Task<AntiCheatConfiguration> CreateAntiCheatConfigurationAsync(Guid organizationId, Guid userId, CreateAntiCheatConfigurationRequest request);
        Task<List<AntiCheatConfiguration>> GetAntiCheatConfigurationsAsync(Guid organizationId, AntiCheatConfigurationFilter? filter = null);
        Task<AntiCheatConfiguration> UpdateAntiCheatConfigurationAsync(Guid configId, Guid userId, UpdateAntiCheatConfigurationRequest request);
        Task<bool> DeleteAntiCheatConfigurationAsync(Guid configId, Guid userId);
        Task<AntiCheatViolation> ReportAntiCheatViolationAsync(Guid gameInstanceId, Guid playerId, ReportAntiCheatViolationRequest request);
        Task<List<AntiCheatViolation>> GetAntiCheatViolationsAsync(Guid organizationId, AntiCheatViolationFilter? filter = null);
        Task<bool> BanPlayerAsync(Guid playerId, Guid organizationId, Guid userId, BanPlayerRequest request);

        // Economy & Virtual Items
        Task<VirtualItem> CreateVirtualItemAsync(Guid organizationId, Guid userId, CreateVirtualItemRequest request);
        Task<List<VirtualItem>> GetVirtualItemsAsync(Guid organizationId, VirtualItemFilter? filter = null);
        Task<VirtualItem> UpdateVirtualItemAsync(Guid itemId, Guid userId, UpdateVirtualItemRequest request);
        Task<bool> DeleteVirtualItemAsync(Guid itemId, Guid userId);
        Task<PlayerInventoryItem> GrantVirtualItemAsync(Guid playerId, Guid itemId, Guid userId, GrantVirtualItemRequest request);
        Task<bool> RemoveVirtualItemAsync(Guid playerId, Guid itemId, Guid userId, RemoveVirtualItemRequest request);
        Task<VirtualCurrency> CreateVirtualCurrencyAsync(Guid organizationId, Guid userId, CreateVirtualCurrencyRequest request);
        Task<List<VirtualCurrency>> GetVirtualCurrenciesAsync(Guid organizationId);

        // Leaderboards & Rankings
        Task<Leaderboard> CreateLeaderboardAsync(Guid organizationId, Guid userId, CreateLeaderboardRequest request);
        Task<List<Leaderboard>> GetLeaderboardsAsync(Guid organizationId, LeaderboardFilter? filter = null);
        Task<Leaderboard> UpdateLeaderboardAsync(Guid leaderboardId, Guid userId, UpdateLeaderboardRequest request);
        Task<bool> DeleteLeaderboardAsync(Guid leaderboardId, Guid userId);
        Task<bool> UpdatePlayerScoreAsync(Guid leaderboardId, Guid playerId, UpdatePlayerScoreRequest request);
        Task<List<LeaderboardEntry>> GetLeaderboardEntriesAsync(Guid leaderboardId, LeaderboardEntryFilter? filter = null);
        Task<PlayerRanking> GetPlayerRankingAsync(Guid leaderboardId, Guid playerId);

        // Game Automation
        Task<AutomationScript> CreateAutomationScriptAsync(Guid organizationId, Guid userId, CreateAutomationScriptRequest request);
        Task<List<AutomationScript>> GetAutomationScriptsAsync(Guid organizationId, AutomationScriptFilter? filter = null);
        Task<AutomationScript> UpdateAutomationScriptAsync(Guid scriptId, Guid userId, UpdateAutomationScriptRequest request);
        Task<bool> DeleteAutomationScriptAsync(Guid scriptId, Guid userId);
        Task<AutomationExecution> ExecuteAutomationScriptAsync(Guid scriptId, Guid gameInstanceId, Guid userId, ExecuteAutomationRequest request);
        Task<List<AutomationExecution>> GetAutomationExecutionsAsync(Guid scriptId, AutomationExecutionFilter? filter = null);
        Task<bool> ScheduleAutomationScriptAsync(Guid scriptId, Guid userId, ScheduleAutomationRequest request);
    }
}