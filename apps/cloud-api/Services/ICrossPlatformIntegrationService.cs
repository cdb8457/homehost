using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface ICrossPlatformIntegrationService
    {
        // Platform Management
        Task<Platform> CreatePlatformAsync(Guid organizationId, Guid userId, CreatePlatformRequest request);
        Task<List<Platform>> GetPlatformsAsync(Guid organizationId, PlatformFilter? filter = null);
        Task<Platform> GetPlatformAsync(Guid platformId);
        Task<Platform> UpdatePlatformAsync(Guid platformId, Guid userId, UpdatePlatformRequest request);
        Task<bool> DeletePlatformAsync(Guid platformId, Guid userId);
        Task<PlatformConnection> ConnectPlatformAsync(Guid platformId, Guid userId, ConnectPlatformRequest request);
        Task<bool> DisconnectPlatformAsync(Guid platformId, Guid userId);
        Task<PlatformStatus> GetPlatformStatusAsync(Guid platformId);

        // Cross-Platform Authentication
        Task<CrossPlatformAuth> CreateCrossPlatformAuthAsync(Guid organizationId, Guid userId, CreateCrossPlatformAuthRequest request);
        Task<List<CrossPlatformAuth>> GetCrossPlatformAuthsAsync(Guid organizationId, CrossPlatformAuthFilter? filter = null);
        Task<CrossPlatformAuth> GetCrossPlatformAuthAsync(Guid authId);
        Task<CrossPlatformAuth> UpdateCrossPlatformAuthAsync(Guid authId, Guid userId, UpdateCrossPlatformAuthRequest request);
        Task<bool> DeleteCrossPlatformAuthAsync(Guid authId, Guid userId);
        Task<AuthToken> AuthenticateWithPlatformAsync(Guid authId, Guid userId, AuthenticateWithPlatformRequest request);
        Task<bool> RefreshPlatformTokenAsync(Guid authId, Guid userId);

        // Data Synchronization
        Task<DataSyncJob> CreateDataSyncJobAsync(Guid organizationId, Guid userId, CreateDataSyncJobRequest request);
        Task<List<DataSyncJob>> GetDataSyncJobsAsync(Guid organizationId, DataSyncJobFilter? filter = null);
        Task<DataSyncJob> GetDataSyncJobAsync(Guid jobId);
        Task<DataSyncJob> UpdateDataSyncJobAsync(Guid jobId, Guid userId, UpdateDataSyncJobRequest request);
        Task<bool> DeleteDataSyncJobAsync(Guid jobId, Guid userId);
        Task<DataSyncExecution> RunDataSyncJobAsync(Guid jobId, Guid userId, RunDataSyncJobRequest request);
        Task<List<DataSyncExecution>> GetDataSyncExecutionsAsync(Guid jobId, DataSyncExecutionFilter? filter = null);
        Task<DataSyncStatus> GetDataSyncStatusAsync(Guid jobId);

        // Cross-Platform Messaging
        Task<CrossPlatformMessage> SendCrossPlatformMessageAsync(Guid organizationId, Guid userId, SendCrossPlatformMessageRequest request);
        Task<List<CrossPlatformMessage>> GetCrossPlatformMessagesAsync(Guid organizationId, CrossPlatformMessageFilter? filter = null);
        Task<CrossPlatformMessage> GetCrossPlatformMessageAsync(Guid messageId);
        Task<CrossPlatformMessage> UpdateCrossPlatformMessageAsync(Guid messageId, Guid userId, UpdateCrossPlatformMessageRequest request);
        Task<bool> DeleteCrossPlatformMessageAsync(Guid messageId, Guid userId);
        Task<MessageDeliveryStatus> GetMessageDeliveryStatusAsync(Guid messageId);
        Task<bool> MarkMessageAsReadAsync(Guid messageId, Guid userId);

        // Universal Profile Management
        Task<UniversalProfile> CreateUniversalProfileAsync(Guid organizationId, Guid userId, CreateUniversalProfileRequest request);
        Task<List<UniversalProfile>> GetUniversalProfilesAsync(Guid organizationId, UniversalProfileFilter? filter = null);
        Task<UniversalProfile> GetUniversalProfileAsync(Guid profileId);
        Task<UniversalProfile> UpdateUniversalProfileAsync(Guid profileId, Guid userId, UpdateUniversalProfileRequest request);
        Task<bool> DeleteUniversalProfileAsync(Guid profileId, Guid userId);
        Task<UniversalProfile> LinkPlatformProfileAsync(Guid profileId, Guid userId, LinkPlatformProfileRequest request);
        Task<bool> UnlinkPlatformProfileAsync(Guid profileId, Guid userId, UnlinkPlatformProfileRequest request);
        Task<List<PlatformProfile>> GetLinkedPlatformProfilesAsync(Guid profileId);

        // Cross-Platform Analytics
        Task<CrossPlatformAnalytics> GetCrossPlatformAnalyticsAsync(Guid organizationId, CrossPlatformAnalyticsFilter filter);
        Task<List<PlatformMetric>> GetPlatformMetricsAsync(Guid organizationId, PlatformMetricsFilter filter);
        Task<PlatformComparison> ComparePlatformMetricsAsync(Guid organizationId, ComparePlatformMetricsRequest request);
        Task<CrossPlatformInsights> GetCrossPlatformInsightsAsync(Guid organizationId, CrossPlatformInsightsFilter filter);
        Task<List<PlatformTrend>> GetPlatformTrendsAsync(Guid organizationId, PlatformTrendFilter filter);
        Task<CrossPlatformReport> GenerateCrossPlatformReportAsync(Guid organizationId, Guid userId, GenerateCrossPlatformReportRequest request);

        // Migration Services
        Task<MigrationJob> CreateMigrationJobAsync(Guid organizationId, Guid userId, CreateMigrationJobRequest request);
        Task<List<MigrationJob>> GetMigrationJobsAsync(Guid organizationId, MigrationJobFilter? filter = null);
        Task<MigrationJob> GetMigrationJobAsync(Guid jobId);
        Task<MigrationJob> UpdateMigrationJobAsync(Guid jobId, Guid userId, UpdateMigrationJobRequest request);
        Task<bool> DeleteMigrationJobAsync(Guid jobId, Guid userId);
        Task<MigrationExecution> RunMigrationJobAsync(Guid jobId, Guid userId, RunMigrationJobRequest request);
        Task<List<MigrationExecution>> GetMigrationExecutionsAsync(Guid jobId, MigrationExecutionFilter? filter = null);
        Task<MigrationStatus> GetMigrationStatusAsync(Guid jobId);

        // API Gateway & Routing
        Task<APIGateway> CreateAPIGatewayAsync(Guid organizationId, Guid userId, CreateAPIGatewayRequest request);
        Task<List<APIGateway>> GetAPIGatewaysAsync(Guid organizationId, APIGatewayFilter? filter = null);
        Task<APIGateway> GetAPIGatewayAsync(Guid gatewayId);
        Task<APIGateway> UpdateAPIGatewayAsync(Guid gatewayId, Guid userId, UpdateAPIGatewayRequest request);
        Task<bool> DeleteAPIGatewayAsync(Guid gatewayId, Guid userId);
        Task<APIRoute> CreateAPIRouteAsync(Guid gatewayId, Guid userId, CreateAPIRouteRequest request);
        Task<List<APIRoute>> GetAPIRoutesAsync(Guid gatewayId, APIRouteFilter? filter = null);
        Task<APIRoute> UpdateAPIRouteAsync(Guid routeId, Guid userId, UpdateAPIRouteRequest request);
        Task<bool> DeleteAPIRouteAsync(Guid routeId, Guid userId);

        // Protocol Adapters
        Task<ProtocolAdapter> CreateProtocolAdapterAsync(Guid organizationId, Guid userId, CreateProtocolAdapterRequest request);
        Task<List<ProtocolAdapter>> GetProtocolAdaptersAsync(Guid organizationId, ProtocolAdapterFilter? filter = null);
        Task<ProtocolAdapter> GetProtocolAdapterAsync(Guid adapterId);
        Task<ProtocolAdapter> UpdateProtocolAdapterAsync(Guid adapterId, Guid userId, UpdateProtocolAdapterRequest request);
        Task<bool> DeleteProtocolAdapterAsync(Guid adapterId, Guid userId);
        Task<ProtocolTransformation> TransformProtocolAsync(Guid adapterId, ProtocolTransformationRequest request);
        Task<List<ProtocolTransformation>> GetProtocolTransformationsAsync(Guid adapterId, ProtocolTransformationFilter? filter = null);

        // Cross-Platform Save Data
        Task<CrossPlatformSave> CreateCrossPlatformSaveAsync(Guid organizationId, Guid userId, CreateCrossPlatformSaveRequest request);
        Task<List<CrossPlatformSave>> GetCrossPlatformSavesAsync(Guid organizationId, CrossPlatformSaveFilter? filter = null);
        Task<CrossPlatformSave> GetCrossPlatformSaveAsync(Guid saveId);
        Task<CrossPlatformSave> UpdateCrossPlatformSaveAsync(Guid saveId, Guid userId, UpdateCrossPlatformSaveRequest request);
        Task<bool> DeleteCrossPlatformSaveAsync(Guid saveId, Guid userId);
        Task<SaveSyncResult> SyncSaveDataAsync(Guid saveId, Guid userId, SyncSaveDataRequest request);
        Task<List<SaveConflict>> GetSaveConflictsAsync(Guid saveId, SaveConflictFilter? filter = null);
        Task<SaveConflict> ResolveSaveConflictAsync(Guid conflictId, Guid userId, ResolveSaveConflictRequest request);

        // Cross-Platform Achievements
        Task<CrossPlatformAchievement> CreateCrossPlatformAchievementAsync(Guid organizationId, Guid userId, CreateCrossPlatformAchievementRequest request);
        Task<List<CrossPlatformAchievement>> GetCrossPlatformAchievementsAsync(Guid organizationId, CrossPlatformAchievementFilter? filter = null);
        Task<CrossPlatformAchievement> GetCrossPlatformAchievementAsync(Guid achievementId);
        Task<CrossPlatformAchievement> UpdateCrossPlatformAchievementAsync(Guid achievementId, Guid userId, UpdateCrossPlatformAchievementRequest request);
        Task<bool> DeleteCrossPlatformAchievementAsync(Guid achievementId, Guid userId);
        Task<AchievementSync> SyncAchievementAsync(Guid achievementId, Guid userId, SyncAchievementRequest request);
        Task<List<AchievementProgress>> GetAchievementProgressAsync(Guid achievementId, AchievementProgressFilter? filter = null);

        // Cross-Platform Leaderboards
        Task<CrossPlatformLeaderboard> CreateCrossPlatformLeaderboardAsync(Guid organizationId, Guid userId, CreateCrossPlatformLeaderboardRequest request);
        Task<List<CrossPlatformLeaderboard>> GetCrossPlatformLeaderboardsAsync(Guid organizationId, CrossPlatformLeaderboardFilter? filter = null);
        Task<CrossPlatformLeaderboard> GetCrossPlatformLeaderboardAsync(Guid leaderboardId);
        Task<CrossPlatformLeaderboard> UpdateCrossPlatformLeaderboardAsync(Guid leaderboardId, Guid userId, UpdateCrossPlatformLeaderboardRequest request);
        Task<bool> DeleteCrossPlatformLeaderboardAsync(Guid leaderboardId, Guid userId);
        Task<LeaderboardSync> SyncLeaderboardAsync(Guid leaderboardId, Guid userId, SyncLeaderboardRequest request);
        Task<List<LeaderboardEntry>> GetLeaderboardEntriesAsync(Guid leaderboardId, LeaderboardEntryFilter? filter = null);

        // Cross-Platform Social Features
        Task<CrossPlatformFriend> SendCrossPlatformFriendRequestAsync(Guid organizationId, Guid userId, SendCrossPlatformFriendRequestRequest request);
        Task<List<CrossPlatformFriend>> GetCrossPlatformFriendsAsync(Guid organizationId, CrossPlatformFriendFilter? filter = null);
        Task<CrossPlatformFriend> GetCrossPlatformFriendAsync(Guid friendId);
        Task<CrossPlatformFriend> UpdateCrossPlatformFriendAsync(Guid friendId, Guid userId, UpdateCrossPlatformFriendRequest request);
        Task<bool> DeleteCrossPlatformFriendAsync(Guid friendId, Guid userId);
        Task<bool> AcceptFriendRequestAsync(Guid friendId, Guid userId);
        Task<bool> DeclineFriendRequestAsync(Guid friendId, Guid userId);
        Task<SocialActivity> GetSocialActivityAsync(Guid organizationId, SocialActivityFilter filter);

        // Cross-Platform Notifications
        Task<CrossPlatformNotification> CreateCrossPlatformNotificationAsync(Guid organizationId, Guid userId, CreateCrossPlatformNotificationRequest request);
        Task<List<CrossPlatformNotification>> GetCrossPlatformNotificationsAsync(Guid organizationId, CrossPlatformNotificationFilter? filter = null);
        Task<CrossPlatformNotification> GetCrossPlatformNotificationAsync(Guid notificationId);
        Task<CrossPlatformNotification> UpdateCrossPlatformNotificationAsync(Guid notificationId, Guid userId, UpdateCrossPlatformNotificationRequest request);
        Task<bool> DeleteCrossPlatformNotificationAsync(Guid notificationId, Guid userId);
        Task<NotificationDelivery> SendNotificationAsync(Guid notificationId, Guid userId, SendNotificationRequest request);
        Task<List<NotificationDelivery>> GetNotificationDeliveriesAsync(Guid notificationId, NotificationDeliveryFilter? filter = null);

        // Cross-Platform Inventory
        Task<CrossPlatformInventory> CreateCrossPlatformInventoryAsync(Guid organizationId, Guid userId, CreateCrossPlatformInventoryRequest request);
        Task<List<CrossPlatformInventory>> GetCrossPlatformInventoriesAsync(Guid organizationId, CrossPlatformInventoryFilter? filter = null);
        Task<CrossPlatformInventory> GetCrossPlatformInventoryAsync(Guid inventoryId);
        Task<CrossPlatformInventory> UpdateCrossPlatformInventoryAsync(Guid inventoryId, Guid userId, UpdateCrossPlatformInventoryRequest request);
        Task<bool> DeleteCrossPlatformInventoryAsync(Guid inventoryId, Guid userId);
        Task<InventorySync> SyncInventoryAsync(Guid inventoryId, Guid userId, SyncInventoryRequest request);
        Task<List<InventoryItem>> GetInventoryItemsAsync(Guid inventoryId, InventoryItemFilter? filter = null);
        Task<InventoryTransfer> TransferInventoryItemAsync(Guid inventoryId, Guid userId, TransferInventoryItemRequest request);

        // Platform-Specific Integrations
        Task<SteamIntegration> CreateSteamIntegrationAsync(Guid organizationId, Guid userId, CreateSteamIntegrationRequest request);
        Task<List<SteamIntegration>> GetSteamIntegrationsAsync(Guid organizationId, SteamIntegrationFilter? filter = null);
        Task<SteamIntegration> GetSteamIntegrationAsync(Guid integrationId);
        Task<SteamIntegration> UpdateSteamIntegrationAsync(Guid integrationId, Guid userId, UpdateSteamIntegrationRequest request);
        Task<bool> DeleteSteamIntegrationAsync(Guid integrationId, Guid userId);
        Task<SteamSync> SyncWithSteamAsync(Guid integrationId, Guid userId, SyncWithSteamRequest request);

        Task<EpicGamesIntegration> CreateEpicGamesIntegrationAsync(Guid organizationId, Guid userId, CreateEpicGamesIntegrationRequest request);
        Task<List<EpicGamesIntegration>> GetEpicGamesIntegrationsAsync(Guid organizationId, EpicGamesIntegrationFilter? filter = null);
        Task<EpicGamesIntegration> GetEpicGamesIntegrationAsync(Guid integrationId);
        Task<EpicGamesIntegration> UpdateEpicGamesIntegrationAsync(Guid integrationId, Guid userId, UpdateEpicGamesIntegrationRequest request);
        Task<bool> DeleteEpicGamesIntegrationAsync(Guid integrationId, Guid userId);
        Task<EpicGamesSync> SyncWithEpicGamesAsync(Guid integrationId, Guid userId, SyncWithEpicGamesRequest request);

        Task<PlayStationIntegration> CreatePlayStationIntegrationAsync(Guid organizationId, Guid userId, CreatePlayStationIntegrationRequest request);
        Task<List<PlayStationIntegration>> GetPlayStationIntegrationsAsync(Guid organizationId, PlayStationIntegrationFilter? filter = null);
        Task<PlayStationIntegration> GetPlayStationIntegrationAsync(Guid integrationId);
        Task<PlayStationIntegration> UpdatePlayStationIntegrationAsync(Guid integrationId, Guid userId, UpdatePlayStationIntegrationRequest request);
        Task<bool> DeletePlayStationIntegrationAsync(Guid integrationId, Guid userId);
        Task<PlayStationSync> SyncWithPlayStationAsync(Guid integrationId, Guid userId, SyncWithPlayStationRequest request);

        Task<XboxIntegration> CreateXboxIntegrationAsync(Guid organizationId, Guid userId, CreateXboxIntegrationRequest request);
        Task<List<XboxIntegration>> GetXboxIntegrationsAsync(Guid organizationId, XboxIntegrationFilter? filter = null);
        Task<XboxIntegration> GetXboxIntegrationAsync(Guid integrationId);
        Task<XboxIntegration> UpdateXboxIntegrationAsync(Guid integrationId, Guid userId, UpdateXboxIntegrationRequest request);
        Task<bool> DeleteXboxIntegrationAsync(Guid integrationId, Guid userId);
        Task<XboxSync> SyncWithXboxAsync(Guid integrationId, Guid userId, SyncWithXboxRequest request);

        Task<NintendoIntegration> CreateNintendoIntegrationAsync(Guid organizationId, Guid userId, CreateNintendoIntegrationRequest request);
        Task<List<NintendoIntegration>> GetNintendoIntegrationsAsync(Guid organizationId, NintendoIntegrationFilter? filter = null);
        Task<NintendoIntegration> GetNintendoIntegrationAsync(Guid integrationId);
        Task<NintendoIntegration> UpdateNintendoIntegrationAsync(Guid integrationId, Guid userId, UpdateNintendoIntegrationRequest request);
        Task<bool> DeleteNintendoIntegrationAsync(Guid integrationId, Guid userId);
        Task<NintendoSync> SyncWithNintendoAsync(Guid integrationId, Guid userId, SyncWithNintendoRequest request);

        Task<MobileIntegration> CreateMobileIntegrationAsync(Guid organizationId, Guid userId, CreateMobileIntegrationRequest request);
        Task<List<MobileIntegration>> GetMobileIntegrationsAsync(Guid organizationId, MobileIntegrationFilter? filter = null);
        Task<MobileIntegration> GetMobileIntegrationAsync(Guid integrationId);
        Task<MobileIntegration> UpdateMobileIntegrationAsync(Guid integrationId, Guid userId, UpdateMobileIntegrationRequest request);
        Task<bool> DeleteMobileIntegrationAsync(Guid integrationId, Guid userId);
        Task<MobileSync> SyncWithMobileAsync(Guid integrationId, Guid userId, SyncWithMobileRequest request);

        // Cross-Platform Events
        Task<CrossPlatformEvent> CreateCrossPlatformEventAsync(Guid organizationId, Guid userId, CreateCrossPlatformEventRequest request);
        Task<List<CrossPlatformEvent>> GetCrossPlatformEventsAsync(Guid organizationId, CrossPlatformEventFilter? filter = null);
        Task<CrossPlatformEvent> GetCrossPlatformEventAsync(Guid eventId);
        Task<CrossPlatformEvent> UpdateCrossPlatformEventAsync(Guid eventId, Guid userId, UpdateCrossPlatformEventRequest request);
        Task<bool> DeleteCrossPlatformEventAsync(Guid eventId, Guid userId);
        Task<EventSync> SyncEventAsync(Guid eventId, Guid userId, SyncEventRequest request);
        Task<List<EventParticipant>> GetEventParticipantsAsync(Guid eventId, EventParticipantFilter? filter = null);

        // Cross-Platform Matchmaking
        Task<CrossPlatformMatchmaking> CreateCrossPlatformMatchmakingAsync(Guid organizationId, Guid userId, CreateCrossPlatformMatchmakingRequest request);
        Task<List<CrossPlatformMatchmaking>> GetCrossPlatformMatchmakingsAsync(Guid organizationId, CrossPlatformMatchmakingFilter? filter = null);
        Task<CrossPlatformMatchmaking> GetCrossPlatformMatchmakingAsync(Guid matchmakingId);
        Task<CrossPlatformMatchmaking> UpdateCrossPlatformMatchmakingAsync(Guid matchmakingId, Guid userId, UpdateCrossPlatformMatchmakingRequest request);
        Task<bool> DeleteCrossPlatformMatchmakingAsync(Guid matchmakingId, Guid userId);
        Task<CrossPlatformMatch> FindCrossPlatformMatchAsync(Guid matchmakingId, Guid userId, FindCrossPlatformMatchRequest request);
        Task<List<CrossPlatformMatch>> GetCrossPlatformMatchesAsync(Guid matchmakingId, CrossPlatformMatchFilter? filter = null);

        // Cross-Platform Commerce
        Task<CrossPlatformCommerce> CreateCrossPlatformCommerceAsync(Guid organizationId, Guid userId, CreateCrossPlatformCommerceRequest request);
        Task<List<CrossPlatformCommerce>> GetCrossPlatformCommercesAsync(Guid organizationId, CrossPlatformCommerceFilter? filter = null);
        Task<CrossPlatformCommerce> GetCrossPlatformCommerceAsync(Guid commerceId);
        Task<CrossPlatformCommerce> UpdateCrossPlatformCommerceAsync(Guid commerceId, Guid userId, UpdateCrossPlatformCommerceRequest request);
        Task<bool> DeleteCrossPlatformCommerceAsync(Guid commerceId, Guid userId);
        Task<CrossPlatformTransaction> ProcessCrossPlatformTransactionAsync(Guid commerceId, Guid userId, ProcessCrossPlatformTransactionRequest request);
        Task<List<CrossPlatformTransaction>> GetCrossPlatformTransactionsAsync(Guid commerceId, CrossPlatformTransactionFilter? filter = null);

        // Platform SDK Management
        Task<PlatformSDK> CreatePlatformSDKAsync(Guid organizationId, Guid userId, CreatePlatformSDKRequest request);
        Task<List<PlatformSDK>> GetPlatformSDKsAsync(Guid organizationId, PlatformSDKFilter? filter = null);
        Task<PlatformSDK> GetPlatformSDKAsync(Guid sdkId);
        Task<PlatformSDK> UpdatePlatformSDKAsync(Guid sdkId, Guid userId, UpdatePlatformSDKRequest request);
        Task<bool> DeletePlatformSDKAsync(Guid sdkId, Guid userId);
        Task<SDKIntegration> IntegrateSDKAsync(Guid sdkId, Guid userId, IntegrateSDKRequest request);
        Task<List<SDKIntegration>> GetSDKIntegrationsAsync(Guid sdkId, SDKIntegrationFilter? filter = null);

        // Cross-Platform Configuration
        Task<CrossPlatformConfiguration> CreateCrossPlatformConfigurationAsync(Guid organizationId, Guid userId, CreateCrossPlatformConfigurationRequest request);
        Task<List<CrossPlatformConfiguration>> GetCrossPlatformConfigurationsAsync(Guid organizationId, CrossPlatformConfigurationFilter? filter = null);
        Task<CrossPlatformConfiguration> GetCrossPlatformConfigurationAsync(Guid configId);
        Task<CrossPlatformConfiguration> UpdateCrossPlatformConfigurationAsync(Guid configId, Guid userId, UpdateCrossPlatformConfigurationRequest request);
        Task<bool> DeleteCrossPlatformConfigurationAsync(Guid configId, Guid userId);
        Task<ConfigurationSync> SyncConfigurationAsync(Guid configId, Guid userId, SyncConfigurationRequest request);
        Task<List<ConfigurationValidation>> ValidateConfigurationAsync(Guid configId, ValidateConfigurationRequest request);

        // Cross-Platform Monitoring
        Task<CrossPlatformMonitoring> CreateCrossPlatformMonitoringAsync(Guid organizationId, Guid userId, CreateCrossPlatformMonitoringRequest request);
        Task<List<CrossPlatformMonitoring>> GetCrossPlatformMonitoringsAsync(Guid organizationId, CrossPlatformMonitoringFilter? filter = null);
        Task<CrossPlatformMonitoring> GetCrossPlatformMonitoringAsync(Guid monitoringId);
        Task<CrossPlatformMonitoring> UpdateCrossPlatformMonitoringAsync(Guid monitoringId, Guid userId, UpdateCrossPlatformMonitoringRequest request);
        Task<bool> DeleteCrossPlatformMonitoringAsync(Guid monitoringId, Guid userId);
        Task<MonitoringAlert> CreateMonitoringAlertAsync(Guid monitoringId, Guid userId, CreateMonitoringAlertRequest request);
        Task<List<MonitoringAlert>> GetMonitoringAlertsAsync(Guid monitoringId, MonitoringAlertFilter? filter = null);
        Task<MonitoringMetrics> GetMonitoringMetricsAsync(Guid monitoringId, MonitoringMetricsFilter filter);
    }
}