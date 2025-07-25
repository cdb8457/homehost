using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Services;

namespace HomeHost.CloudApi.Data
{
    public class HomeHostContext : DbContext
    {
        public HomeHostContext(DbContextOptions<HomeHostContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Community> Communities { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<GameServer> GameServers { get; set; }
        public DbSet<Plugin> Plugins { get; set; }
        public DbSet<CommunityMember> CommunityMembers { get; set; }
        public DbSet<CommunityInvitation> CommunityInvitations { get; set; }
        public DbSet<CommunityBan> CommunityBans { get; set; }
        public DbSet<CommunityActivity> CommunityActivities { get; set; }
        public DbSet<PlayerRelationship> PlayerRelationships { get; set; }
        public DbSet<ReputationEntry> ReputationEntries { get; set; }
        public DbSet<PlayerSession> PlayerSessions { get; set; }
        public DbSet<PlayerActivity> PlayerActivities { get; set; }
        public DbSet<PlayerAchievement> PlayerAchievements { get; set; }
        public DbSet<PlayerMessage> PlayerMessages { get; set; }
        public DbSet<PlayerConversation> PlayerConversations { get; set; }
        public DbSet<UserInterestProfile> UserInterestProfiles { get; set; }
        public DbSet<DiscoveryAction> DiscoveryActions { get; set; }
        public DbSet<DiscoveryFeedback> DiscoveryFeedbacks { get; set; }
        public DbSet<DiscoveryPreferences> DiscoveryPreferences { get; set; }
        public DbSet<DiscoveryEvent> DiscoveryEvents { get; set; }
        public DbSet<PluginInstallation> PluginInstallations { get; set; }
        public DbSet<RevenueTransaction> RevenueTransactions { get; set; }
        public DbSet<SyncOperation> SyncOperations { get; set; }
        public DbSet<UserSession> UserSessions { get; set; }
        public DbSet<InvitationLink> InvitationLinks { get; set; }
        public DbSet<FriendInvitation> FriendInvitations { get; set; }
        public DbSet<ServerInvitation> ServerInvitations { get; set; }
        public DbSet<OnboardingFlow> OnboardingFlows { get; set; }
        public DbSet<OnboardingSession> OnboardingSessions { get; set; }
        public DbSet<GameLibraryEntry> GameLibraryEntries { get; set; }
        public DbSet<GameInstallation> GameInstallations { get; set; }
        public DbSet<GameVersion> GameVersions { get; set; }
        public DbSet<GameMod> GameMods { get; set; }
        public DbSet<GameConfiguration> GameConfigurations { get; set; }
        public DbSet<ServerConfiguration> ServerConfigurations { get; set; }
        public DbSet<ScalingPolicy> ScalingPolicies { get; set; }
        public DbSet<LoadBalancer> LoadBalancers { get; set; }
        public DbSet<CustomGameMode> CustomGameModes { get; set; }
        public DbSet<ConfigurationSnapshot> ConfigurationSnapshots { get; set; }
        public DbSet<ServerPerformanceMetrics> ServerPerformanceMetrics { get; set; }
        public DbSet<ServerPerformanceSnapshot> ServerPerformanceSnapshots { get; set; }
        public DbSet<PerformanceAlert> PerformanceAlerts { get; set; }
        public DbSet<ServerBackup> ServerBackups { get; set; }
        public DbSet<RecoveryJob> RecoveryJobs { get; set; }
        public DbSet<BackupSchedule> BackupSchedules { get; set; }
        public DbSet<BackupPolicy> BackupPolicies { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<TournamentParticipation> TournamentParticipations { get; set; }
        public DbSet<TournamentBracket> TournamentBrackets { get; set; }
        public DbSet<TournamentMatch> TournamentMatches { get; set; }
        public DbSet<TournamentFormat> TournamentFormats { get; set; }
        public DbSet<TournamentPrize> TournamentPrizes { get; set; }
        public DbSet<TournamentStream> TournamentStreams { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public DbSet<PaymentMethod> PaymentMethods { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<TransactionItem> TransactionItems { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceItem> InvoiceItems { get; set; }
        public DbSet<MarketplaceItem> MarketplaceItems { get; set; }
        public DbSet<MarketplaceSale> MarketplaceSales { get; set; }
        public DbSet<RevenueShare> RevenueShares { get; set; }
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrganizationMember> OrganizationMembers { get; set; }
        public DbSet<OrganizationInvitation> OrganizationInvitations { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<ComplianceCheck> ComplianceChecks { get; set; }
        public DbSet<ComplianceIssue> ComplianceIssues { get; set; }
        public DbSet<SecurityPolicy> SecurityPolicies { get; set; }
        public DbSet<SecurityViolation> SecurityViolations { get; set; }
        public DbSet<SsoConfiguration> SsoConfigurations { get; set; }
        public DbSet<SsoSession> SsoSessions { get; set; }
        public DbSet<MfaConfiguration> MfaConfigurations { get; set; }
        public DbSet<MfaToken> MfaTokens { get; set; }
        public DbSet<DashboardWidget> DashboardWidgets { get; set; }
        public DbSet<DashboardTemplate> DashboardTemplates { get; set; }
        public DbSet<Dashboard> Dashboards { get; set; }
        public DbSet<UserSegment> UserSegments { get; set; }
        public DbSet<CustomReport> CustomReports { get; set; }
        public DbSet<ReportExecution> ReportExecutions { get; set; }
        public DbSet<DataExport> DataExports { get; set; }
        public DbSet<ExportTemplate> ExportTemplates { get; set; }
        public DbSet<RealTimeAlert> RealTimeAlerts { get; set; }
        public DbSet<AlertRule> AlertRules { get; set; }
        public DbSet<Alert> Alerts { get; set; }
        public DbSet<AlertConfiguration> AlertConfigurations { get; set; }
        public DbSet<KPI> KPIs { get; set; }
        public DbSet<BusinessGoal> BusinessGoals { get; set; }
        public DbSet<Milestone> Milestones { get; set; }
        public DbSet<DataSource> DataSources { get; set; }
        public DbSet<APIKey> APIKeys { get; set; }
        public DbSet<APILog> APILogs { get; set; }
        public DbSet<Webhook> Webhooks { get; set; }
        public DbSet<WebhookDelivery> WebhookDeliveries { get; set; }
        public DbSet<Integration> Integrations { get; set; }
        public DbSet<IntegrationType> IntegrationTypes { get; set; }
        public DbSet<OAuthApplication> OAuthApplications { get; set; }
        public DbSet<OAuthToken> OAuthTokens { get; set; }
        public DbSet<RateLimitPolicy> RateLimitPolicies { get; set; }
        public DbSet<IntegrationTemplate> IntegrationTemplates { get; set; }
        public DbSet<DataTransformation> DataTransformations { get; set; }
        public DbSet<EventStream> EventStreams { get; set; }
        public DbSet<StreamEvent> StreamEvents { get; set; }
        public DbSet<MarketplaceIntegration> MarketplaceIntegrations { get; set; }
        public DbSet<IntegrationReview> IntegrationReviews { get; set; }
        public DbSet<CustomConnector> CustomConnectors { get; set; }
        public DbSet<APIGatewayRule> APIGatewayRules { get; set; }
        public DbSet<APIRoute> APIRoutes { get; set; }
        public DbSet<Workflow> Workflows { get; set; }
        public DbSet<WorkflowExecution> WorkflowExecutions { get; set; }
        public DbSet<WorkflowTemplate> WorkflowTemplates { get; set; }
        public DbSet<APIVersion> APIVersions { get; set; }
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<SupportTicketComment> SupportTicketComments { get; set; }
        public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles { get; set; }
        public DbSet<KnowledgeBaseCategory> KnowledgeBaseCategories { get; set; }
        public DbSet<KnowledgeBaseRating> KnowledgeBaseRatings { get; set; }
        public DbSet<LiveChatSession> LiveChatSessions { get; set; }
        public DbSet<LiveChatMessage> LiveChatMessages { get; set; }
        public DbSet<SLAPolicy> SLAPolicies { get; set; }
        public DbSet<SLAViolation> SLAViolations { get; set; }
        public DbSet<EscalationRule> EscalationRules { get; set; }
        public DbSet<EscalationEvent> EscalationEvents { get; set; }
        public DbSet<SupportAgent> SupportAgents { get; set; }
        public DbSet<AutomatedResponse> AutomatedResponses { get; set; }
        public DbSet<AutomatedResponseLog> AutomatedResponseLogs { get; set; }
        public DbSet<CustomerSatisfactionSurvey> CustomerSatisfactionSurveys { get; set; }
        public DbSet<SatisfactionSurveyResponse> SatisfactionSurveyResponses { get; set; }
        public DbSet<SupportCategory> SupportCategories { get; set; }
        public DbSet<SupportPriority> SupportPriorities { get; set; }
        public DbSet<SupportQueue> SupportQueues { get; set; }
        public DbSet<TrainingMaterial> TrainingMaterials { get; set; }
        public DbSet<SupportFeedback> SupportFeedbacks { get; set; }
        public DbSet<ImprovementSuggestion> ImprovementSuggestions { get; set; }
        public DbSet<GameInstance> GameInstances { get; set; }
        public DbSet<ServerTemplate> ServerTemplates { get; set; }
        public DbSet<GameWorld> GameWorlds { get; set; }
        public DbSet<WorldBackup> WorldBackups { get; set; }
        public DbSet<PlayerData> PlayerDatas { get; set; }
        public DbSet<PlayerInventory> PlayerInventories { get; set; }
        public DbSet<GameEvent> GameEvents { get; set; }
        public DbSet<GameLogEntry> GameLogEntries { get; set; }
        public DbSet<MatchmakingQueue> MatchmakingQueues { get; set; }
        public DbSet<MatchmakingTicket> MatchmakingTickets { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<ResourcePool> ResourcePools { get; set; }
        public DbSet<ResourceAllocation> ResourceAllocations { get; set; }
        public DbSet<PerformanceProfile> PerformanceProfiles { get; set; }
        public DbSet<GameContent> GameContents { get; set; }
        public DbSet<ContentVersion> ContentVersions { get; set; }
        public DbSet<NetworkConfiguration> NetworkConfigurations { get; set; }
        public DbSet<GameState> GameStates { get; set; }
        public DbSet<GameStateSnapshot> GameStateSnapshots { get; set; }
        public DbSet<MonitoringRule> MonitoringRules { get; set; }
        public DbSet<MonitoringAlert> MonitoringAlerts { get; set; }
        public DbSet<AntiCheatConfiguration> AntiCheatConfigurations { get; set; }
        public DbSet<AntiCheatViolation> AntiCheatViolations { get; set; }
        public DbSet<VirtualItem> VirtualItems { get; set; }
        public DbSet<VirtualCurrency> VirtualCurrencies { get; set; }
        public DbSet<PlayerInventoryItem> PlayerInventoryItems { get; set; }
        public DbSet<Leaderboard> Leaderboards { get; set; }
        public DbSet<LeaderboardEntry> LeaderboardEntries { get; set; }
        public DbSet<AutomationScript> AutomationScripts { get; set; }
        public DbSet<AutomationExecution> AutomationExecutions { get; set; }
        
        // Streaming Entities
        public DbSet<StreamChannel> StreamChannels { get; set; }
        public DbSet<LiveStream> LiveStreams { get; set; }
        public DbSet<StreamRecording> StreamRecordings { get; set; }
        public DbSet<StreamViewer> StreamViewers { get; set; }
        public DbSet<RecordingSegment> RecordingSegments { get; set; }
        public DbSet<ContentProject> ContentProjects { get; set; }
        public DbSet<ContentAsset> ContentAssets { get; set; }
        public DbSet<ContentItem> ContentItems { get; set; }
        public DbSet<ContentLibrary> ContentLibraries { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<StreamOverlay> StreamOverlays { get; set; }
        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<StreamDonation> StreamDonations { get; set; }
        public DbSet<StreamSubscription> StreamSubscriptions { get; set; }
        public DbSet<StreamHighlight> StreamHighlights { get; set; }
        public DbSet<StreamClip> StreamClips { get; set; }
        public DbSet<StreamSchedule> StreamSchedules { get; set; }
        public DbSet<ModerationRule> ModerationRules { get; set; }
        public DbSet<ModerationAction> ModerationActions { get; set; }
        public DbSet<VideoEditingSession> VideoEditingSessions { get; set; }
        public DbSet<VideoClip> VideoClips { get; set; }
        public DbSet<AudioProcessingJob> AudioProcessingJobs { get; set; }
        public DbSet<AudioTrack> AudioTracks { get; set; }
        public DbSet<ThumbnailGenerationJob> ThumbnailGenerationJobs { get; set; }
        public DbSet<Thumbnail> Thumbnails { get; set; }
        public DbSet<PublishingTarget> PublishingTargets { get; set; }
        public DbSet<PublishingJob> PublishingJobs { get; set; }
        public DbSet<CollaborationInvite> CollaborationInvites { get; set; }
        public DbSet<Collaborator> Collaborators { get; set; }
        public DbSet<CollaborationActivity> CollaborationActivities { get; set; }
        public DbSet<AutomationRule> AutomationRules { get; set; }
        public DbSet<EncodingProfile> EncodingProfiles { get; set; }
        public DbSet<EncodingJob> EncodingJobs { get; set; }
        public DbSet<CDNConfiguration> CDNConfigurations { get; set; }
        public DbSet<CDNEdgeLocation> CDNEdgeLocations { get; set; }
        
        // AI Game Optimization Entities
        public DbSet<PerformanceAnalysis> PerformanceAnalyses { get; set; }
        public DbSet<OptimizationRecommendation> OptimizationRecommendations { get; set; }
        public DbSet<OptimizationResult> OptimizationResults { get; set; }
        public DbSet<PerformanceMetric> PerformanceMetrics { get; set; }
        public DbSet<PerformancePrediction> PerformancePredictions { get; set; }
        public DbSet<PlayerBehaviorAnalysis> PlayerBehaviorAnalyses { get; set; }
        public DbSet<PlayerSegment> PlayerSegments { get; set; }
        public DbSet<ContentOptimization> ContentOptimizations { get; set; }
        public DbSet<DifficultyRecommendation> DifficultyRecommendations { get; set; }
        public DbSet<MatchmakingOptimization> MatchmakingOptimizations { get; set; }
        public DbSet<MLModel> MLModels { get; set; }
        public DbSet<MLModelTraining> MLModelTrainings { get; set; }
        public DbSet<MLModelPrediction> MLModelPredictions { get; set; }
        public DbSet<MLModelEvaluation> MLModelEvaluations { get; set; }
        public DbSet<DataPipeline> DataPipelines { get; set; }
        public DbSet<DataPipelineExecution> DataPipelineExecutions { get; set; }
        public DbSet<AIConfiguration> AIConfigurations { get; set; }
        public DbSet<AIModelDeployment> AIModelDeployments { get; set; }
        public DbSet<RealTimeOptimization> RealTimeOptimizations { get; set; }
        public DbSet<RealTimeOptimizationMetric> RealTimeOptimizationMetrics { get; set; }
        public DbSet<AIInsightsReport> AIInsightsReports { get; set; }
        public DbSet<AIInsight> AIInsights { get; set; }
        public DbSet<AITestSuite> AITestSuites { get; set; }
        public DbSet<AITestExecution> AITestExecutions { get; set; }
        public DbSet<AITestResult> AITestResults { get; set; }
        public DbSet<CheatDetectionAnalysis> CheatDetectionAnalyses { get; set; }
        public DbSet<CheatPrediction> CheatPredictions { get; set; }
        public DbSet<SecurityThreatAnalysis> SecurityThreatAnalyses { get; set; }
        public DbSet<SecurityRecommendation> SecurityRecommendations { get; set; }
        public DbSet<FraudDetectionResult> FraudDetectionResults { get; set; }
        public DbSet<AnomalyDetectionResult> AnomalyDetectionResults { get; set; }
        public DbSet<PlayerDemandPrediction> PlayerDemandPredictions { get; set; }
        public DbSet<ServerLoadPrediction> ServerLoadPredictions { get; set; }
        public DbSet<RevenueProjection> RevenueProjections { get; set; }
        public DbSet<MarketTrendAnalysis> MarketTrendAnalyses { get; set; }
        public DbSet<CompetitorAnalysis> CompetitorAnalyses { get; set; }
        public DbSet<GrowthProjection> GrowthProjections { get; set; }
        public DbSet<ChatModerationResult> ChatModerationResults { get; set; }
        public DbSet<SentimentAnalysis> SentimentAnalyses { get; set; }
        public DbSet<ChatInsight> ChatInsights { get; set; }
        public DbSet<LanguageDetectionResult> LanguageDetectionResults { get; set; }
        public DbSet<ContentGenerationResult> ContentGenerationResults { get; set; }
        public DbSet<TranslationResult> TranslationResults { get; set; }
        public DbSet<ExperimentalFeature> ExperimentalFeatures { get; set; }
        public DbSet<ExperimentResult> ExperimentResults { get; set; }
        public DbSet<AIModelMarketplace> AIModelMarketplaces { get; set; }
        public DbSet<AIModelPurchase> AIModelPurchases { get; set; }
        
        // Cross-Platform Integration Entities
        public DbSet<Platform> Platforms { get; set; }
        public DbSet<PlatformConnection> PlatformConnections { get; set; }
        public DbSet<PlatformStatus> PlatformStatuses { get; set; }
        public DbSet<CrossPlatformAuth> CrossPlatformAuths { get; set; }
        public DbSet<AuthToken> AuthTokens { get; set; }
        public DbSet<DataSyncJob> DataSyncJobs { get; set; }
        public DbSet<DataSyncExecution> DataSyncExecutions { get; set; }
        public DbSet<DataSyncStatus> DataSyncStatuses { get; set; }
        public DbSet<UniversalProfile> UniversalProfiles { get; set; }
        public DbSet<PlatformProfile> PlatformProfiles { get; set; }
        public DbSet<CrossPlatformAnalytics> CrossPlatformAnalytics { get; set; }
        public DbSet<PlatformMetric> PlatformMetrics { get; set; }
        public DbSet<SteamIntegration> SteamIntegrations { get; set; }
        public DbSet<SteamSync> SteamSyncs { get; set; }
        public DbSet<EpicGamesIntegration> EpicGamesIntegrations { get; set; }
        public DbSet<EpicGamesSync> EpicGamesSyncs { get; set; }
        public DbSet<PlayStationIntegration> PlayStationIntegrations { get; set; }
        public DbSet<PlayStationSync> PlayStationSyncs { get; set; }
        public DbSet<XboxIntegration> XboxIntegrations { get; set; }
        public DbSet<XboxSync> XboxSyncs { get; set; }
        public DbSet<NintendoIntegration> NintendoIntegrations { get; set; }
        public DbSet<NintendoSync> NintendoSyncs { get; set; }
        public DbSet<MobileIntegration> MobileIntegrations { get; set; }
        public DbSet<MobileSync> MobileSyncs { get; set; }
        public DbSet<CrossPlatformSave> CrossPlatformSaves { get; set; }
        public DbSet<SaveConflict> SaveConflicts { get; set; }
        public DbSet<CrossPlatformAchievement> CrossPlatformAchievements { get; set; }
        public DbSet<AchievementProgress> AchievementProgresses { get; set; }
        public DbSet<CrossPlatformLeaderboard> CrossPlatformLeaderboards { get; set; }
        public DbSet<CrossPlatformFriend> CrossPlatformFriends { get; set; }
        
        // Advanced Modding Framework Entities
        public DbSet<Mod> Mods { get; set; }
        public DbSet<ModVersion> ModVersions { get; set; }
        public DbSet<ModProject> ModProjects { get; set; }
        public DbSet<ModBuild> ModBuilds { get; set; }
        public DbSet<ModSDK> ModSDKs { get; set; }
        public DbSet<ModAPI> ModAPIs { get; set; }
        public DbSet<ModMarketplaceListing> ModMarketplaceListings { get; set; }
        public DbSet<ModPurchase> ModPurchases { get; set; }
        public DbSet<ModReview> ModReviews { get; set; }
        public DbSet<ModInstallation> ModInstallations { get; set; }
        public DbSet<ModConfiguration> ModConfigurations { get; set; }
        public DbSet<ModCompatibility> ModCompatibilities { get; set; }
        public DbSet<ModScript> ModScripts { get; set; }
        public DbSet<ModScriptExecution> ModScriptExecutions { get; set; }
        public DbSet<ModScriptDebugSession> ModScriptDebugSessions { get; set; }
        public DbSet<ModAsset> ModAssets { get; set; }
        public DbSet<ModAssetPipeline> ModAssetPipelines { get; set; }
        public DbSet<ModAssetPipelineExecution> ModAssetPipelineExecutions { get; set; }
        public DbSet<ModTestSuite> ModTestSuites { get; set; }
        public DbSet<ModTestExecution> ModTestExecutions { get; set; }
        public DbSet<ModTestResult> ModTestResults { get; set; }
        public DbSet<ModSecurityScan> ModSecurityScans { get; set; }
        public DbSet<ModValidation> ModValidations { get; set; }
        public DbSet<ModCertification> ModCertifications { get; set; }
        public DbSet<ModPackage> ModPackages { get; set; }
        public DbSet<ModDistribution> ModDistributions { get; set; }
        public DbSet<ModDistributionMetrics> ModDistributionMetrics { get; set; }
        public DbSet<ModRepository> ModRepositories { get; set; }
        public DbSet<ModCommit> ModCommits { get; set; }
        public DbSet<ModBranch> ModBranches { get; set; }
        public DbSet<ModCollaboration> ModCollaborations { get; set; }
        public DbSet<ModCollaborator> ModCollaborators { get; set; }
        public DbSet<ModAnalytics> ModAnalytics { get; set; }
        public DbSet<ModMetric> ModMetrics { get; set; }
        public DbSet<ModUsageReport> ModUsageReports { get; set; }
        public DbSet<ModInsight> ModInsights { get; set; }
        public DbSet<ModPerformanceReport> ModPerformanceReports { get; set; }
        public DbSet<ModTrend> ModTrends { get; set; }
        public DbSet<ModCommunity> ModCommunities { get; set; }
        public DbSet<ModForum> ModForums { get; set; }
        public DbSet<ModForumPost> ModForumPosts { get; set; }
        public DbSet<ModDocumentation> ModDocumentation { get; set; }
        public DbSet<ModTutorial> ModTutorials { get; set; }
        public DbSet<ModLicense> ModLicenses { get; set; }
        public DbSet<ModLegalCompliance> ModLegalCompliances { get; set; }
        public DbSet<ModMonetization> ModMonetizations { get; set; }
        public DbSet<ModRevenue> ModRevenues { get; set; }
        public DbSet<ModPayout> ModPayouts { get; set; }
        public DbSet<ModLocalization> ModLocalizations { get; set; }
        public DbSet<ModTranslation> ModTranslations { get; set; }
        public DbSet<ModBackup> ModBackups { get; set; }
        public DbSet<ModRestore> ModRestores { get; set; }
        public DbSet<ModPerformanceProfile> ModPerformanceProfiles { get; set; }
        public DbSet<ModOptimization> ModOptimizations { get; set; }
        public DbSet<ModIntegration> ModIntegrations { get; set; }
        public DbSet<ModHook> ModHooks { get; set; }
        public DbSet<ModWorkflow> ModWorkflows { get; set; }
        public DbSet<ModWorkflowExecution> ModWorkflowExecutions { get; set; }
        public DbSet<ModTemplate> ModTemplates { get; set; }
        public DbSet<ModScaffold> ModScaffolds { get; set; }
        public DbSet<CrossPlatformNotification> CrossPlatformNotifications { get; set; }
        public DbSet<CrossPlatformInventory> CrossPlatformInventories { get; set; }
        public DbSet<CrossPlatformEvent> CrossPlatformEvents { get; set; }
        public DbSet<CrossPlatformMatchmaking> CrossPlatformMatchmakings { get; set; }
        public DbSet<CrossPlatformMatch> CrossPlatformMatches { get; set; }
        public DbSet<CrossPlatformCommerce> CrossPlatformCommerces { get; set; }
        public DbSet<CrossPlatformTransaction> CrossPlatformTransactions { get; set; }
        public DbSet<PlatformSDK> PlatformSDKs { get; set; }
        public DbSet<SDKIntegration> SDKIntegrations { get; set; }
        public DbSet<CrossPlatformConfiguration> CrossPlatformConfigurations { get; set; }
        public DbSet<CrossPlatformMonitoring> CrossPlatformMonitorings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("users");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.Property(e => e.DisplayName).HasColumnName("display_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(20).HasDefaultValue("Basic");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastSeen).HasColumnName("last_seen").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Profile).HasColumnName("profile").HasColumnType("jsonb");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                
                entity.HasIndex(e => e.Email).IsUnique();
            });


            // Configure GameServer entity
            modelBuilder.Entity<GameServer>(entity =>
            {
                entity.ToTable("game_servers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.GameType).HasColumnName("game_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.PerformanceMetrics).HasColumnName("performance_metrics").HasColumnType("jsonb");
                entity.Property(e => e.PlayerCount).HasColumnName("player_count").HasDefaultValue(0);
                entity.Property(e => e.MaxPlayers).HasColumnName("max_players").HasDefaultValue(10);
                entity.Property(e => e.UptimeSeconds).HasColumnName("uptime_seconds").HasDefaultValue(0);
                entity.Property(e => e.LastBackup).HasColumnName("last_backup");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.OwnerId).HasColumnName("owner_id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");

                entity.HasOne(e => e.Owner)
                      .WithMany()
                      .HasForeignKey(e => e.OwnerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.OwnerId);
                entity.HasIndex(e => e.CommunityId);
                entity.HasIndex(e => e.Status);
            });

            // Configure Plugin entity
            modelBuilder.Entity<Plugin>(entity =>
            {
                entity.ToTable("plugins");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Version).HasColumnName("version").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
                entity.Property(e => e.Downloads).HasColumnName("downloads").HasDefaultValue(0);
                entity.Property(e => e.Rating).HasColumnName("rating").HasColumnType("decimal(3,2)").HasDefaultValue(0.00m);
                entity.Property(e => e.ReviewCount).HasColumnName("review_count").HasDefaultValue(0);
                entity.Property(e => e.SupportedGames).HasColumnName("supported_games").HasColumnType("text[]");
                entity.Property(e => e.IsVerified).HasColumnName("is_verified").HasDefaultValue(false);
                entity.Property(e => e.PackageUrl).HasColumnName("package_url").HasMaxLength(500);
                entity.Property(e => e.InstallationGuide).HasColumnName("installation_guide");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.DeveloperId).HasColumnName("developer_id");

                entity.HasOne(e => e.Developer)
                      .WithMany()
                      .HasForeignKey(e => e.DeveloperId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.Category);
            });


            // Configure CommunityInvitation entity
            modelBuilder.Entity<CommunityInvitation>(entity =>
            {
                entity.ToTable("community_invitations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.CreatedByUserId).HasColumnName("created_by_user_id");
                entity.Property(e => e.InviteCode).HasColumnName("invite_code").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Message).HasColumnName("message");
                entity.Property(e => e.MaxUses).HasColumnName("max_uses").HasDefaultValue(1);
                entity.Property(e => e.UsedCount).HasColumnName("used_count").HasDefaultValue(0);
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.CreatedBy)
                      .WithMany()
                      .HasForeignKey(e => e.CreatedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.InviteCode).IsUnique();
                entity.HasIndex(e => e.CommunityId);
            });

            // Configure CommunityBan entity
            modelBuilder.Entity<CommunityBan>(entity =>
            {
                entity.ToTable("community_bans");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.BannedByUserId).HasColumnName("banned_by_user_id");
                entity.Property(e => e.Reason).HasColumnName("reason").IsRequired();
                entity.Property(e => e.BannedAt).HasColumnName("banned_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.BannedBy)
                      .WithMany()
                      .HasForeignKey(e => e.BannedByUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.CommunityId, e.UserId });
            });

            // Configure CommunityActivity entity
            modelBuilder.Entity<CommunityActivity>(entity =>
            {
                entity.ToTable("community_activities");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.ActivityType).HasColumnName("activity_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.UserName).HasColumnName("user_name").HasMaxLength(100);
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.ServerName).HasColumnName("server_name").HasMaxLength(200);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasIndex(e => e.CommunityId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ActivityType);
            });

            // Update CommunityMember entity with additional properties
            modelBuilder.Entity<CommunityMember>(entity =>
            {
                entity.ToTable("community_members");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(20).HasDefaultValue("Member");
                entity.Property(e => e.JoinedAt).HasColumnName("joined_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ApplicationMessage).HasColumnName("application_message");
                entity.Property(e => e.LastActiveAt).HasColumnName("last_active_at");
                entity.Property(e => e.ReputationScore).HasColumnName("reputation_score").HasDefaultValue(0);
                entity.Property(e => e.CustomData).HasColumnName("custom_data").HasColumnType("jsonb");

                entity.HasOne(e => e.Community)
                      .WithMany(c => c.Members)
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.CommunityId, e.UserId }).IsUnique();
            });

            // Update Community entity with additional properties
            modelBuilder.Entity<Community>(entity =>
            {
                entity.ToTable("communities");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Slug).HasColumnName("slug").HasMaxLength(250).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.LogoUrl).HasColumnName("logo_url").HasMaxLength(500);
                entity.Property(e => e.BannerUrl).HasColumnName("banner_url").HasMaxLength(500);
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.MemberCount).HasColumnName("member_count").HasDefaultValue(0);
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Stats).HasColumnName("stats").HasColumnType("jsonb");
                entity.Property(e => e.OwnerId).HasColumnName("owner_id");

                entity.HasOne(e => e.Owner)
                      .WithMany()
                      .HasForeignKey(e => e.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.Slug).IsUnique();
                entity.HasIndex(e => e.OwnerId);
                entity.HasIndex(e => e.IsPublic);
            });

            // Configure PlayerRelationship entity
            modelBuilder.Entity<PlayerRelationship>(entity =>
            {
                entity.ToTable("player_relationships");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.RelatedUserId).HasColumnName("related_user_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Notes).HasColumnName("notes");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.AcceptedAt).HasColumnName("accepted_at");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.RelatedUser)
                      .WithMany()
                      .HasForeignKey(e => e.RelatedUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => new { e.UserId, e.RelatedUserId, e.Type });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.RelatedUserId);
            });

            // Configure ReputationEntry entity
            modelBuilder.Entity<ReputationEntry>(entity =>
            {
                entity.ToTable("reputation_entries");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.FromUserId).HasColumnName("from_user_id");
                entity.Property(e => e.ToUserId).HasColumnName("to_user_id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Score).HasColumnName("score").IsRequired();
                entity.Property(e => e.Comment).HasColumnName("comment");
                entity.Property(e => e.CategoryScores).HasColumnName("category_scores").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsAnonymous).HasColumnName("is_anonymous").HasDefaultValue(false);

                entity.HasOne(e => e.FromUser)
                      .WithMany()
                      .HasForeignKey(e => e.FromUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ToUser)
                      .WithMany()
                      .HasForeignKey(e => e.ToUserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.ToUserId);
                entity.HasIndex(e => e.FromUserId);
                entity.HasIndex(e => new { e.FromUserId, e.ToUserId, e.CreatedAt });
            });

            // Configure PlayerSession entity
            modelBuilder.Entity<PlayerSession>(entity =>
            {
                entity.ToTable("player_sessions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.StartTime).HasColumnName("start_time").IsRequired();
                entity.Property(e => e.EndTime).HasColumnName("end_time");
                entity.Property(e => e.DurationMinutes).HasColumnName("duration_minutes");
                entity.Property(e => e.GameMode).HasColumnName("game_mode").HasMaxLength(50);
                entity.Property(e => e.SessionData).HasColumnName("session_data").HasColumnType("jsonb");
                entity.Property(e => e.PlayedWith).HasColumnName("played_with").HasColumnType("uuid[]");
                entity.Property(e => e.DisconnectReason).HasColumnName("disconnect_reason");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.StartTime);
                entity.HasIndex(e => new { e.UserId, e.StartTime });
            });

            // Configure PlayerActivity entity
            modelBuilder.Entity<PlayerActivity>(entity =>
            {
                entity.ToTable("player_activities");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.ActivityType).HasColumnName("activity_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").IsRequired();
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.ServerName).HasColumnName("server_name").HasMaxLength(200);
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.CommunityName).HasColumnName("community_name").HasMaxLength(200);
                entity.Property(e => e.RelatedUserId).HasColumnName("related_user_id");
                entity.Property(e => e.RelatedUserName).HasColumnName("related_user_name").HasMaxLength(100);
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsVisible).HasColumnName("is_visible").HasDefaultValue(true);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ActivityType);
                entity.HasIndex(e => new { e.UserId, e.IsVisible, e.CreatedAt });
            });

            // Configure PlayerAchievement entity
            modelBuilder.Entity<PlayerAchievement>(entity =>
            {
                entity.ToTable("player_achievements");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.AchievementId).HasColumnName("achievement_id").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").IsRequired();
                entity.Property(e => e.IconUrl).HasColumnName("icon_url").HasMaxLength(500);
                entity.Property(e => e.Rarity).HasColumnName("rarity").HasMaxLength(20).IsRequired();
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.GameType).HasColumnName("game_type").HasMaxLength(50);
                entity.Property(e => e.UnlockedAt).HasColumnName("unlocked_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.IsFeatured).HasColumnName("is_featured").HasDefaultValue(false);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.AchievementId);
                entity.HasIndex(e => new { e.UserId, e.UnlockedAt });
                entity.HasIndex(e => new { e.UserId, e.IsFeatured });
            });

            // Configure PlayerMessage entity
            modelBuilder.Entity<PlayerMessage>(entity =>
            {
                entity.ToTable("player_messages");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.FromUserId).HasColumnName("from_user_id");
                entity.Property(e => e.ToUserId).HasColumnName("to_user_id");
                entity.Property(e => e.ConversationId).HasColumnName("conversation_id");
                entity.Property(e => e.Content).HasColumnName("content").IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.SentAt).HasColumnName("sent_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ReadAt).HasColumnName("read_at");
                entity.Property(e => e.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);
                entity.Property(e => e.Attachments).HasColumnName("attachments").HasColumnType("jsonb");

                entity.HasOne(e => e.FromUser)
                      .WithMany()
                      .HasForeignKey(e => e.FromUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ToUser)
                      .WithMany()
                      .HasForeignKey(e => e.ToUserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.ConversationId);
                entity.HasIndex(e => e.FromUserId);
                entity.HasIndex(e => e.ToUserId);
                entity.HasIndex(e => new { e.ConversationId, e.SentAt });
            });

            // Configure PlayerConversation entity
            modelBuilder.Entity<PlayerConversation>(entity =>
            {
                entity.ToTable("player_conversations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.User1Id).HasColumnName("user1_id");
                entity.Property(e => e.User2Id).HasColumnName("user2_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastMessageAt).HasColumnName("last_message_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UnreadCount).HasColumnName("unread_count").HasDefaultValue(0);
                entity.Property(e => e.IsArchived).HasColumnName("is_archived").HasDefaultValue(false);
                entity.Property(e => e.LastMessagePreview).HasColumnName("last_message_preview").HasMaxLength(500);

                entity.HasOne(e => e.User1)
                      .WithMany()
                      .HasForeignKey(e => e.User1Id)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User2)
                      .WithMany()
                      .HasForeignKey(e => e.User2Id)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Messages)
                      .WithOne()
                      .HasForeignKey(m => m.ConversationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.User1Id, e.User2Id }).IsUnique();
                entity.HasIndex(e => e.User1Id);
                entity.HasIndex(e => e.User2Id);
                entity.HasIndex(e => e.LastMessageAt);
            });

            // Configure UserInterestProfile entity
            modelBuilder.Entity<UserInterestProfile>(entity =>
            {
                entity.ToTable("user_interest_profiles");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.GameGenreScores).HasColumnName("game_genre_scores").HasColumnType("jsonb");
                entity.Property(e => e.PlayStyleScores).HasColumnName("play_style_scores").HasColumnType("jsonb");
                entity.Property(e => e.FeaturePreferences).HasColumnName("feature_preferences").HasColumnType("jsonb");
                entity.Property(e => e.CommunityPreferences).HasColumnName("community_preferences").HasColumnType("jsonb");
                entity.Property(e => e.PreferredGames).HasColumnName("preferred_games").HasColumnType("text[]");
                entity.Property(e => e.AvoidedGames).HasColumnName("avoided_games").HasColumnType("text[]");
                entity.Property(e => e.PersonalityTraits).HasColumnName("personality_traits").HasColumnType("jsonb");
                entity.Property(e => e.PreferredPlayTimes).HasColumnName("preferred_play_times").HasColumnType("jsonb");
                entity.Property(e => e.LastUpdated).HasColumnName("last_updated").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ProfileCompleteness).HasColumnName("profile_completeness").HasDefaultValue(0.0f);

                entity.HasIndex(e => e.LastUpdated);
                entity.HasIndex(e => e.ProfileCompleteness);
            });

            // Configure DiscoveryAction entity
            modelBuilder.Entity<DiscoveryAction>(entity =>
            {
                entity.ToTable("discovery_actions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.ActionType).HasColumnName("action_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ItemType).HasColumnName("item_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ItemId).HasColumnName("item_id");
                entity.Property(e => e.ItemName).HasColumnName("item_name").HasMaxLength(200);
                entity.Property(e => e.RecommendationContext).HasColumnName("recommendation_context").HasMaxLength(100);
                entity.Property(e => e.RecommendationScore).HasColumnName("recommendation_score");
                entity.Property(e => e.ActionMetadata).HasColumnName("action_metadata").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UserFeedback).HasColumnName("user_feedback");
                entity.Property(e => e.UserRating).HasColumnName("user_rating");

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ActionType);
                entity.HasIndex(e => e.ItemType);
                entity.HasIndex(e => new { e.UserId, e.CreatedAt });
                entity.HasIndex(e => new { e.ItemType, e.ItemId });
            });

            // Configure DiscoveryFeedback entity
            modelBuilder.Entity<DiscoveryFeedback>(entity =>
            {
                entity.ToTable("discovery_feedbacks");
                entity.HasKey(e => e.RecommendationId);
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.RecommendationId).HasColumnName("recommendation_id");
                entity.Property(e => e.ItemType).HasColumnName("item_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ItemId).HasColumnName("item_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Rating).HasColumnName("rating");
                entity.Property(e => e.Comment).HasColumnName("comment");
                entity.Property(e => e.ReasonTags).HasColumnName("reason_tags").HasColumnType("text[]");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => new { e.UserId, e.ItemType });
            });

            // Configure DiscoveryPreferences entity
            modelBuilder.Entity<DiscoveryPreferences>(entity =>
            {
                entity.ToTable("discovery_preferences");
                entity.HasKey(e => e.UserId);
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.CategoryWeights).HasColumnName("category_weights").HasColumnType("jsonb");
                entity.Property(e => e.PreferredAlgorithms).HasColumnName("preferred_algorithms").HasColumnType("text[]");
                entity.Property(e => e.SerendipityLevel).HasColumnName("serendipity_level").HasDefaultValue(0.2f);
                entity.Property(e => e.IncludeTrendingContent).HasColumnName("include_trending_content").HasDefaultValue(true);
                entity.Property(e => e.IncludeFriendActivity).HasColumnName("include_friend_activity").HasDefaultValue(true);
                entity.Property(e => e.AllowCrossGameRecommendations).HasColumnName("allow_cross_game_recommendations").HasDefaultValue(true);
                entity.Property(e => e.MaxRecommendationsPerDay).HasColumnName("max_recommendations_per_day").HasDefaultValue(50);
                entity.Property(e => e.BlockedCategories).HasColumnName("blocked_categories").HasColumnType("text[]");
                entity.Property(e => e.AdvancedSettings).HasColumnName("advanced_settings").HasColumnType("jsonb");
                entity.Property(e => e.LastUpdated).HasColumnName("last_updated").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.LastUpdated);
            });

            // Configure DiscoveryEvent entity
            modelBuilder.Entity<DiscoveryEvent>(entity =>
            {
                entity.ToTable("discovery_events");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.EventType).HasColumnName("event_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").IsRequired();
                entity.Property(e => e.ActionText).HasColumnName("action_text").HasMaxLength(100);
                entity.Property(e => e.ActionUrl).HasColumnName("action_url").HasMaxLength(500);
                entity.Property(e => e.RelatedItemId).HasColumnName("related_item_id");
                entity.Property(e => e.RelatedItemType).HasColumnName("related_item_type").HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.IsPersonalized).HasColumnName("is_personalized").HasDefaultValue(true);
                entity.Property(e => e.RelevanceScore).HasColumnName("relevance_score").HasDefaultValue(0.5f);
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.EventType);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ExpiresAt);
                entity.HasIndex(e => new { e.UserId, e.RelevanceScore });
            });

            // Configure InvitationLink entity
            modelBuilder.Entity<InvitationLink>(entity =>
            {
                entity.ToTable("invitation_links");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.InviteCode).HasColumnName("invite_code").HasMaxLength(50).IsRequired();
                entity.Property(e => e.DisplayName).HasColumnName("display_name").HasMaxLength(200);
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.Usage).HasColumnName("usage").HasColumnType("jsonb");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.DeactivatedAt).HasColumnName("deactivated_at");

                entity.HasIndex(e => e.InviteCode).IsUnique();
                entity.HasIndex(e => e.CommunityId);
                entity.HasIndex(e => e.CreatorId);
            });

            // Configure FriendInvitation entity
            modelBuilder.Entity<FriendInvitation>(entity =>
            {
                entity.ToTable("friend_invitations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.SenderId).HasColumnName("sender_id");
                entity.Property(e => e.TargetUserId).HasColumnName("target_user_id");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Message).HasColumnName("message");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.AcceptedAt).HasColumnName("accepted_at");
                entity.Property(e => e.DeclinedAt).HasColumnName("declined_at");
                entity.Property(e => e.DeclineReason).HasColumnName("decline_reason");

                entity.HasOne(e => e.Sender)
                      .WithMany()
                      .HasForeignKey(e => e.SenderId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.TargetUser)
                      .WithMany()
                      .HasForeignKey(e => e.TargetUserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.SenderId);
                entity.HasIndex(e => e.TargetUserId);
                entity.HasIndex(e => new { e.SenderId, e.TargetUserId });
            });

            // Configure ServerInvitation entity
            modelBuilder.Entity<ServerInvitation>(entity =>
            {
                entity.ToTable("server_invitations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.InviterId).HasColumnName("inviter_id");
                entity.Property(e => e.InviteeId).HasColumnName("invitee_id");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Message).HasColumnName("message");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.AcceptedAt).HasColumnName("accepted_at");
                entity.Property(e => e.DeclinedAt).HasColumnName("declined_at");
                entity.Property(e => e.DeclineReason).HasColumnName("decline_reason");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Inviter)
                      .WithMany()
                      .HasForeignKey(e => e.InviterId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Invitee)
                      .WithMany()
                      .HasForeignKey(e => e.InviteeId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.InviterId);
                entity.HasIndex(e => e.InviteeId);
            });

            // Configure OnboardingFlow entity
            modelBuilder.Entity<OnboardingFlow>(entity =>
            {
                entity.ToTable("onboarding_flows");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IsDefault).HasColumnName("is_default").HasDefaultValue(false);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.Steps).HasColumnName("steps").HasColumnType("jsonb");
                entity.Property(e => e.Metrics).HasColumnName("metrics").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.Version).HasColumnName("version").HasDefaultValue(1);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Creator)
                      .WithMany()
                      .HasForeignKey(e => e.CreatorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.CommunityId);
                entity.HasIndex(e => e.CreatorId);
                entity.HasIndex(e => new { e.CommunityId, e.IsDefault });
            });

            // Configure OnboardingSession entity
            modelBuilder.Entity<OnboardingSession>(entity =>
            {
                entity.ToTable("onboarding_sessions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.CommunityId).HasColumnName("community_id");
                entity.Property(e => e.FlowId).HasColumnName("flow_id");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.CurrentStepIndex).HasColumnName("current_step_index").HasDefaultValue(0);
                entity.Property(e => e.Progress).HasColumnName("progress").HasColumnType("jsonb");
                entity.Property(e => e.CompletedSteps).HasColumnName("completed_steps").HasColumnType("jsonb");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.StartedAt).HasColumnName("started_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.AbandonedAt).HasColumnName("abandoned_at");
                entity.Property(e => e.LastActivityAt).HasColumnName("last_activity_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.AbandonReason).HasColumnName("abandon_reason");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Community)
                      .WithMany()
                      .HasForeignKey(e => e.CommunityId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Flow)
                      .WithMany()
                      .HasForeignKey(e => e.FlowId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CommunityId);
                entity.HasIndex(e => e.FlowId);
                entity.HasIndex(e => new { e.UserId, e.Status });
            });

            // Configure GameLibraryEntry entity
            modelBuilder.Entity<GameLibraryEntry>(entity =>
            {
                entity.ToTable("game_library_entries");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.GameId).HasColumnName("game_id");
                entity.Property(e => e.GameName).HasColumnName("game_name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.GameDescription).HasColumnName("game_description");
                entity.Property(e => e.IconUrl).HasColumnName("icon_url").HasMaxLength(500);
                entity.Property(e => e.BannerUrl).HasColumnName("banner_url").HasMaxLength(500);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Categories).HasColumnName("categories").HasColumnType("text[]");
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.AddedAt).HasColumnName("added_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastPlayedAt).HasColumnName("last_played_at");
                entity.Property(e => e.TotalPlaytime).HasColumnName("total_playtime");
                entity.Property(e => e.LaunchCount).HasColumnName("launch_count").HasDefaultValue(0);
                entity.Property(e => e.UserRating).HasColumnName("user_rating").HasDefaultValue(0);
                entity.Property(e => e.UserNotes).HasColumnName("user_notes");
                entity.Property(e => e.IsFavorite).HasColumnName("is_favorite").HasDefaultValue(false);
                entity.Property(e => e.IsHidden).HasColumnName("is_hidden").HasDefaultValue(false);

                entity.HasOne(e => e.Game)
                      .WithMany()
                      .HasForeignKey(e => e.GameId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.UserId, e.GameId }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
            });

            // Configure GameInstallation entity
            modelBuilder.Entity<GameInstallation>(entity =>
            {
                entity.ToTable("game_installations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.GameId).HasColumnName("game_id");
                entity.Property(e => e.LibraryEntryId).HasColumnName("library_entry_id");
                entity.Property(e => e.InstallPath).HasColumnName("install_path").HasMaxLength(500).IsRequired();
                entity.Property(e => e.VersionId).HasColumnName("version_id");
                entity.Property(e => e.VersionName).HasColumnName("version_name").HasMaxLength(100);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.TotalSizeBytes).HasColumnName("total_size_bytes").HasDefaultValue(0);
                entity.Property(e => e.InstalledSizeBytes).HasColumnName("installed_size_bytes").HasDefaultValue(0);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.ActiveConfigurationId).HasColumnName("active_configuration_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.InstalledAt).HasColumnName("installed_at");
                entity.Property(e => e.LastVerifiedAt).HasColumnName("last_verified_at");
                entity.Property(e => e.Health).HasColumnName("health").HasColumnType("jsonb");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Game)
                      .WithMany()
                      .HasForeignKey(e => e.GameId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.LibraryEntry)
                      .WithMany(le => le.Installations)
                      .HasForeignKey(e => e.LibraryEntryId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Version)
                      .WithMany()
                      .HasForeignKey(e => e.VersionId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ActiveConfiguration)
                      .WithMany()
                      .HasForeignKey(e => e.ActiveConfigurationId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.GameId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => new { e.UserId, e.InstallPath });
            });

            // Configure GameVersion entity
            modelBuilder.Entity<GameVersion>(entity =>
            {
                entity.ToTable("game_versions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.GameId).HasColumnName("game_id");
                entity.Property(e => e.VersionNumber).HasColumnName("version_number").HasMaxLength(50).IsRequired();
                entity.Property(e => e.DisplayName).HasColumnName("display_name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.ChangelogUrl).HasColumnName("changelog_url").HasMaxLength(500);
                entity.Property(e => e.Changelog).HasColumnName("changelog").HasColumnType("text[]");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Stability).HasColumnName("stability").HasMaxLength(20).IsRequired();
                entity.Property(e => e.SizeBytes).HasColumnName("size_bytes").HasDefaultValue(0);
                entity.Property(e => e.DownloadUrl).HasColumnName("download_url").HasMaxLength(500);
                entity.Property(e => e.ChecksumMd5).HasColumnName("checksum_md5").HasMaxLength(32);
                entity.Property(e => e.ChecksumSha256).HasColumnName("checksum_sha256").HasMaxLength(64);
                entity.Property(e => e.MinimumRequirements).HasColumnName("minimum_requirements").HasColumnType("jsonb");
                entity.Property(e => e.RecommendedRequirements).HasColumnName("recommended_requirements").HasColumnType("jsonb");
                entity.Property(e => e.SupportedPlatforms).HasColumnName("supported_platforms").HasColumnType("text[]");
                entity.Property(e => e.ReleasedAt).HasColumnName("released_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IsPrerelease).HasColumnName("is_prerelease").HasDefaultValue(false);
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Game)
                      .WithMany()
                      .HasForeignKey(e => e.GameId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.GameId);
                entity.HasIndex(e => new { e.GameId, e.VersionNumber });
                entity.HasIndex(e => new { e.GameId, e.IsActive });
            });

            // Configure GameMod entity
            modelBuilder.Entity<GameMod>(entity =>
            {
                entity.ToTable("game_mods");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.InstallationId).HasColumnName("installation_id");
                entity.Property(e => e.ModDefinitionId).HasColumnName("mod_definition_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Version).HasColumnName("version").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Author).HasColumnName("author").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.InstallPath).HasColumnName("install_path").HasMaxLength(500).IsRequired();
                entity.Property(e => e.SizeBytes).HasColumnName("size_bytes").HasDefaultValue(0);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.Dependencies).HasColumnName("dependencies").HasColumnType("jsonb");
                entity.Property(e => e.Compatibility).HasColumnName("compatibility").HasColumnType("jsonb");
                entity.Property(e => e.InstalledAt).HasColumnName("installed_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.LoadOrder).HasColumnName("load_order").HasDefaultValue(0);

                entity.HasOne(e => e.Installation)
                      .WithMany(i => i.InstalledMods)
                      .HasForeignKey(e => e.InstallationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.InstallationId);
                entity.HasIndex(e => e.ModDefinitionId);
                entity.HasIndex(e => new { e.InstallationId, e.LoadOrder });
            });

            // Configure GameConfiguration entity
            modelBuilder.Entity<GameConfiguration>(entity =>
            {
                entity.ToTable("game_configurations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.InstallationId).HasColumnName("installation_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.LaunchParameters).HasColumnName("launch_parameters").HasColumnType("jsonb");
                entity.Property(e => e.EnabledMods).HasColumnName("enabled_mods").HasColumnType("text[]");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(false);
                entity.Property(e => e.IsDefault).HasColumnName("is_default").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Installation)
                      .WithMany(i => i.Configurations)
                      .HasForeignKey(e => e.InstallationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.InstallationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => new { e.InstallationId, e.IsActive });
            });

            // Configure ServerConfiguration entity
            modelBuilder.Entity<ServerConfiguration>(entity =>
            {
                entity.ToTable("server_configurations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.GameType).HasColumnName("game_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.NetworkConfig).HasColumnName("network_config").HasColumnType("jsonb");
                entity.Property(e => e.SecurityConfig).HasColumnName("security_config").HasColumnType("jsonb");
                entity.Property(e => e.ResourceConfig).HasColumnName("resource_config").HasColumnType("jsonb");
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(false);
                entity.Property(e => e.IsTemplate).HasColumnName("is_template").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.GameType);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => new { e.UserId, e.Name });
            });

            // Configure ScalingPolicy entity
            modelBuilder.Entity<ScalingPolicy>(entity =>
            {
                entity.ToTable("scaling_policies");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Trigger).HasColumnName("trigger").HasColumnType("jsonb");
                entity.Property(e => e.Action).HasColumnName("action").HasColumnType("jsonb");
                entity.Property(e => e.Constraints).HasColumnName("constraints").HasColumnType("jsonb");
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastTriggeredAt).HasColumnName("last_triggered_at");
                entity.Property(e => e.TriggerCount).HasColumnName("trigger_count").HasDefaultValue(0);

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.IsEnabled);
            });

            // Configure LoadBalancer entity
            modelBuilder.Entity<LoadBalancer>(entity =>
            {
                entity.ToTable("load_balancers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Algorithm).HasColumnName("algorithm").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ServerIds).HasColumnName("server_ids").HasColumnType("uuid[]");
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.HealthCheck).HasColumnName("health_check").HasColumnType("jsonb");
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Metrics).HasColumnName("metrics").HasColumnType("jsonb");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsEnabled);
            });

            // Configure CustomGameMode entity
            modelBuilder.Entity<CustomGameMode>(entity =>
            {
                entity.ToTable("custom_game_modes");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.Rules).HasColumnName("rules").HasColumnType("jsonb");
                entity.Property(e => e.Objectives).HasColumnName("objectives").HasColumnType("jsonb");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(false);
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Creator)
                      .WithMany()
                      .HasForeignKey(e => e.CreatorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.CreatorId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => new { e.ServerId, e.IsActive });
            });

            // Configure ConfigurationSnapshot entity
            modelBuilder.Entity<ConfigurationSnapshot>(entity =>
            {
                entity.ToTable("configuration_snapshots");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure ServerPerformanceMetrics entity
            modelBuilder.Entity<ServerPerformanceMetrics>(entity =>
            {
                entity.ToTable("server_performance_metrics");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.Timestamp).HasColumnName("timestamp").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CpuUsagePercent).HasColumnName("cpu_usage_percent");
                entity.Property(e => e.MemoryUsagePercent).HasColumnName("memory_usage_percent");
                entity.Property(e => e.DiskUsagePercent).HasColumnName("disk_usage_percent");
                entity.Property(e => e.NetworkInMbps).HasColumnName("network_in_mbps");
                entity.Property(e => e.NetworkOutMbps).HasColumnName("network_out_mbps");
                entity.Property(e => e.ActivePlayers).HasColumnName("active_players").HasDefaultValue(0);
                entity.Property(e => e.ResponseTimeMs).HasColumnName("response_time_ms");
                entity.Property(e => e.ThroughputRequests).HasColumnName("throughput_requests");
                entity.Property(e => e.ErrorRate).HasColumnName("error_rate");
                entity.Property(e => e.UptimePercent).HasColumnName("uptime_percent");
                entity.Property(e => e.CustomMetrics).HasColumnName("custom_metrics").HasColumnType("jsonb");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => new { e.ServerId, e.Timestamp });
            });

            // Configure ServerPerformanceSnapshot entity
            modelBuilder.Entity<ServerPerformanceSnapshot>(entity =>
            {
                entity.ToTable("server_performance_snapshots");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Metrics).HasColumnName("metrics").HasColumnType("jsonb");
                entity.Property(e => e.AdditionalData).HasColumnName("additional_data").HasColumnType("jsonb");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure PerformanceAlert entity
            modelBuilder.Entity<PerformanceAlert>(entity =>
            {
                entity.ToTable("performance_alerts");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.MetricType).HasColumnName("metric_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Condition).HasColumnName("condition").HasColumnType("jsonb");
                entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20).IsRequired();
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.NotificationSettings).HasColumnName("notification_settings").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastTriggeredAt).HasColumnName("last_triggered_at");
                entity.Property(e => e.TriggerCount).HasColumnName("trigger_count").HasDefaultValue(0);

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.MetricType);
                entity.HasIndex(e => e.IsEnabled);
            });

            // Configure ServerBackup entity
            modelBuilder.Entity<ServerBackup>(entity =>
            {
                entity.ToTable("server_backups");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.SizeBytes).HasColumnName("size_bytes").HasDefaultValue(0);
                entity.Property(e => e.StoragePath).HasColumnName("storage_path").HasMaxLength(500);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.Files).HasColumnName("files").HasColumnType("jsonb");
                entity.Property(e => e.ErrorMessage).HasColumnName("error_message").HasMaxLength(1000);
                entity.Property(e => e.ProgressPercent).HasColumnName("progress_percent").HasDefaultValue(0.0);
                entity.Property(e => e.ParentBackupId).HasColumnName("parent_backup_id");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.ParentBackup)
                      .WithMany()
                      .HasForeignKey(e => e.ParentBackupId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure RecoveryJob entity
            modelBuilder.Entity<RecoveryJob>(entity =>
            {
                entity.ToTable("recovery_jobs");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.BackupId).HasColumnName("backup_id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.ErrorMessage).HasColumnName("error_message").HasMaxLength(1000);
                entity.Property(e => e.ProgressPercent).HasColumnName("progress_percent").HasDefaultValue(0.0);

                entity.HasOne(e => e.Backup)
                      .WithMany()
                      .HasForeignKey(e => e.BackupId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.BackupId);
                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure BackupSchedule entity
            modelBuilder.Entity<BackupSchedule>(entity =>
            {
                entity.ToTable("backup_schedules");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.CronExpression).HasColumnName("cron_expression").HasMaxLength(100).IsRequired();
                entity.Property(e => e.BackupType).HasColumnName("backup_type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.RetentionPolicy).HasColumnName("retention_policy").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.NextRunTime).HasColumnName("next_run_time");
                entity.Property(e => e.LastRunTime).HasColumnName("last_run_time");
                entity.Property(e => e.SuccessfulRuns).HasColumnName("successful_runs").HasDefaultValue(0);
                entity.Property(e => e.FailedRuns).HasColumnName("failed_runs").HasDefaultValue(0);

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsEnabled);
                entity.HasIndex(e => e.NextRunTime);
            });

            // Configure BackupPolicy entity
            modelBuilder.Entity<BackupPolicy>(entity =>
            {
                entity.ToTable("backup_policies");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.DefaultConfiguration).HasColumnName("default_configuration").HasColumnType("jsonb");
                entity.Property(e => e.RetentionPolicy).HasColumnName("retention_policy").HasColumnType("jsonb");
                entity.Property(e => e.Rules).HasColumnName("rules").HasColumnType("jsonb");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure Tournament entity
            modelBuilder.Entity<Tournament>(entity =>
            {
                entity.ToTable("tournaments");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizerId).HasColumnName("organizer_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
                entity.Property(e => e.GameIds).HasColumnName("game_ids").HasColumnType("uuid[]");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.FormatId).HasColumnName("format_id");
                entity.Property(e => e.MaxParticipants).HasColumnName("max_participants").IsRequired();
                entity.Property(e => e.MinParticipants).HasColumnName("min_participants").IsRequired();
                entity.Property(e => e.EntryFee).HasColumnName("entry_fee").HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
                entity.Property(e => e.PrizePool).HasColumnName("prize_pool").HasColumnType("decimal(10,2)").HasDefaultValue(0.00m);
                entity.Property(e => e.StartDate).HasColumnName("start_date").IsRequired();
                entity.Property(e => e.EndDate).HasColumnName("end_date").IsRequired();
                entity.Property(e => e.RegistrationDeadline).HasColumnName("registration_deadline").IsRequired();
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.AllowSpectators).HasColumnName("allow_spectators").HasDefaultValue(true);
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Organizer)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Format)
                      .WithMany()
                      .HasForeignKey(e => e.FormatId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.OrganizerId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.StartDate);
                entity.HasIndex(e => e.IsPublic);
            });

            // Configure TournamentParticipation entity
            modelBuilder.Entity<TournamentParticipation>(entity =>
            {
                entity.ToTable("tournament_participations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TournamentId).HasColumnName("tournament_id");
                entity.Property(e => e.ParticipantId).HasColumnName("participant_id");
                entity.Property(e => e.TeamName).HasColumnName("team_name").HasMaxLength(200);
                entity.Property(e => e.TeamMembers).HasColumnName("team_members").HasColumnType("uuid[]");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.RegisteredAt).HasColumnName("registered_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ApprovedAt).HasColumnName("approved_at");
                entity.Property(e => e.Statistics).HasColumnName("statistics").HasColumnType("jsonb");

                entity.HasOne(e => e.Tournament)
                      .WithMany(t => t.Participants)
                      .HasForeignKey(e => e.TournamentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Participant)
                      .WithMany()
                      .HasForeignKey(e => e.ParticipantId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TournamentId);
                entity.HasIndex(e => e.ParticipantId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => new { e.TournamentId, e.ParticipantId }).IsUnique();
            });

            // Configure TournamentBracket entity
            modelBuilder.Entity<TournamentBracket>(entity =>
            {
                entity.ToTable("tournament_brackets");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TournamentId).HasColumnName("tournament_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Rounds).HasColumnName("rounds").HasColumnType("jsonb");
                entity.Property(e => e.GeneratedAt).HasColumnName("generated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");

                entity.HasOne(e => e.Tournament)
                      .WithMany()
                      .HasForeignKey(e => e.TournamentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TournamentId);
            });

            // Configure TournamentMatch entity
            modelBuilder.Entity<TournamentMatch>(entity =>
            {
                entity.ToTable("tournament_matches");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TournamentId).HasColumnName("tournament_id");
                entity.Property(e => e.BracketId).HasColumnName("bracket_id");
                entity.Property(e => e.RoundNumber).HasColumnName("round_number").IsRequired();
                entity.Property(e => e.MatchNumber).HasColumnName("match_number").IsRequired();
                entity.Property(e => e.ParticipantIds).HasColumnName("participant_ids").HasColumnType("uuid[]");
                entity.Property(e => e.WinnerId).HasColumnName("winner_id");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.ScheduledAt).HasColumnName("scheduled_at");
                entity.Property(e => e.StartedAt).HasColumnName("started_at");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.Result).HasColumnName("result").HasColumnType("jsonb");
                entity.Property(e => e.Games).HasColumnName("games").HasColumnType("jsonb");

                entity.HasOne(e => e.Tournament)
                      .WithMany(t => t.Matches)
                      .HasForeignKey(e => e.TournamentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Bracket)
                      .WithMany()
                      .HasForeignKey(e => e.BracketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Winner)
                      .WithMany()
                      .HasForeignKey(e => e.WinnerId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.TournamentId);
                entity.HasIndex(e => e.BracketId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => new { e.TournamentId, e.RoundNumber, e.MatchNumber });
            });

            // Configure TournamentFormat entity
            modelBuilder.Entity<TournamentFormat>(entity =>
            {
                entity.ToTable("tournament_formats");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.SupportedGameIds).HasColumnName("supported_game_ids").HasColumnType("uuid[]");
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Creator)
                      .WithMany()
                      .HasForeignKey(e => e.CreatorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.CreatorId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsPublic);
            });

            // Configure TournamentPrize entity
            modelBuilder.Entity<TournamentPrize>(entity =>
            {
                entity.ToTable("tournament_prizes");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TournamentId).HasColumnName("tournament_id");
                entity.Property(e => e.Position).HasColumnName("position").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Value).HasColumnName("value").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
                entity.Property(e => e.IsAwarded).HasColumnName("is_awarded").HasDefaultValue(false);
                entity.Property(e => e.AwardedToId).HasColumnName("awarded_to_id");
                entity.Property(e => e.AwardedAt).HasColumnName("awarded_at");

                entity.HasOne(e => e.Tournament)
                      .WithMany(t => t.Prizes)
                      .HasForeignKey(e => e.TournamentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.AwardedTo)
                      .WithMany()
                      .HasForeignKey(e => e.AwardedToId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.TournamentId);
                entity.HasIndex(e => e.Position);
                entity.HasIndex(e => e.IsAwarded);
            });

            // Configure TournamentStream entity
            modelBuilder.Entity<TournamentStream>(entity =>
            {
                entity.ToTable("tournament_streams");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TournamentId).HasColumnName("tournament_id");
                entity.Property(e => e.StreamerId).HasColumnName("streamer_id");
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Platform).HasColumnName("platform").HasMaxLength(50).IsRequired();
                entity.Property(e => e.StreamUrl).HasColumnName("stream_url").HasMaxLength(500).IsRequired();
                entity.Property(e => e.IsLive).HasColumnName("is_live").HasDefaultValue(false);
                entity.Property(e => e.ViewerCount).HasColumnName("viewer_count").HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Tournament)
                      .WithMany()
                      .HasForeignKey(e => e.TournamentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Streamer)
                      .WithMany()
                      .HasForeignKey(e => e.StreamerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TournamentId);
                entity.HasIndex(e => e.StreamerId);
                entity.HasIndex(e => e.IsLive);
            });

            // Configure Subscription entity
            modelBuilder.Entity<Subscription>(entity =>
            {
                entity.ToTable("subscriptions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.PlanId).HasColumnName("plan_id");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.StartDate).HasColumnName("start_date").IsRequired();
                entity.Property(e => e.EndDate).HasColumnName("end_date");
                entity.Property(e => e.NextBillingDate).HasColumnName("next_billing_date").IsRequired();
                entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(3).HasDefaultValue("USD");
                entity.Property(e => e.BillingCycle).HasColumnName("billing_cycle").HasMaxLength(20).IsRequired();
                entity.Property(e => e.BillingInterval).HasColumnName("billing_interval").HasDefaultValue(1);
                entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("decimal(10,2)").HasDefaultValue(0);
                entity.Property(e => e.DiscountCode).HasColumnName("discount_code").HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CancelledAt).HasColumnName("cancelled_at");
                entity.Property(e => e.CancellationReason).HasColumnName("cancellation_reason").HasMaxLength(500);
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.Features).HasColumnName("features").HasColumnType("jsonb");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Plan)
                      .WithMany(p => p.Subscriptions)
                      .HasForeignKey(e => e.PlanId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.PlanId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.NextBillingDate);
            });

            // Configure SubscriptionPlan entity
            modelBuilder.Entity<SubscriptionPlan>(entity =>
            {
                entity.ToTable("subscription_plans");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
                entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(3).HasDefaultValue("USD");
                entity.Property(e => e.BillingCycle).HasColumnName("billing_cycle").HasMaxLength(20).IsRequired();
                entity.Property(e => e.BillingInterval).HasColumnName("billing_interval").HasDefaultValue(1);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);
                entity.Property(e => e.Features).HasColumnName("features").HasColumnType("jsonb");
                entity.Property(e => e.Limits).HasColumnName("limits").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.DeactivatedAt).HasColumnName("deactivated_at");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Creator)
                      .WithMany()
                      .HasForeignKey(e => e.CreatorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.CreatorId);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsPublic);
                entity.HasIndex(e => e.SortOrder);
            });

            // Configure PaymentMethod entity
            modelBuilder.Entity<PaymentMethod>(entity =>
            {
                entity.ToTable("payment_methods");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Provider).HasColumnName("provider").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ProviderPaymentMethodId).HasColumnName("provider_payment_method_id").HasMaxLength(200).IsRequired();
                entity.Property(e => e.IsDefault).HasColumnName("is_default").HasDefaultValue(false);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.Details).HasColumnName("details").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.LastUsedAt).HasColumnName("last_used_at");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsDefault);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure Transaction entity
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("transactions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.SubscriptionId).HasColumnName("subscription_id");
                entity.Property(e => e.PaymentMethodId).HasColumnName("payment_method_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(3).HasDefaultValue("USD");
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
                entity.Property(e => e.Reference).HasColumnName("reference").HasMaxLength(100);
                entity.Property(e => e.ProviderTransactionId).HasColumnName("provider_transaction_id").HasMaxLength(200);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ProcessedAt).HasColumnName("processed_at");
                entity.Property(e => e.FailedAt).HasColumnName("failed_at");
                entity.Property(e => e.FailureReason).HasColumnName("failure_reason").HasMaxLength(500);
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Subscription)
                      .WithMany(s => s.Transactions)
                      .HasForeignKey(e => e.SubscriptionId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.PaymentMethod)
                      .WithMany(pm => pm.Transactions)
                      .HasForeignKey(e => e.PaymentMethodId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.SubscriptionId);
                entity.HasIndex(e => e.PaymentMethodId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure TransactionItem entity
            modelBuilder.Entity<TransactionItem>(entity =>
            {
                entity.ToTable("transaction_items");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.ItemId).HasColumnName("item_id");
                entity.Property(e => e.ItemName).HasColumnName("item_name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Quantity).HasColumnName("quantity").HasDefaultValue(1);
                entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.TotalPrice).HasColumnName("total_price").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.TaxAmount).HasColumnName("tax_amount").HasColumnType("decimal(10,2)");
                entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("decimal(10,2)");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Transaction)
                      .WithMany(t => t.Items)
                      .HasForeignKey(e => e.TransactionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TransactionId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.ItemId);
            });

            // Configure Invoice entity
            modelBuilder.Entity<Invoice>(entity =>
            {
                entity.ToTable("invoices");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.SubscriptionId).HasColumnName("subscription_id");
                entity.Property(e => e.InvoiceNumber).HasColumnName("invoice_number").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Subtotal).HasColumnName("subtotal").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.TaxAmount).HasColumnName("tax_amount").HasColumnType("decimal(10,2)").HasDefaultValue(0);
                entity.Property(e => e.DiscountAmount).HasColumnName("discount_amount").HasColumnType("decimal(10,2)").HasDefaultValue(0);
                entity.Property(e => e.Total).HasColumnName("total").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(3).HasDefaultValue("USD");
                entity.Property(e => e.IssueDate).HasColumnName("issue_date").IsRequired();
                entity.Property(e => e.DueDate).HasColumnName("due_date").IsRequired();
                entity.Property(e => e.PaidAt).HasColumnName("paid_at");
                entity.Property(e => e.SentAt).HasColumnName("sent_at");
                entity.Property(e => e.BillingAddress).HasColumnName("billing_address").HasColumnType("jsonb");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Subscription)
                      .WithMany(s => s.Invoices)
                      .HasForeignKey(e => e.SubscriptionId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.SubscriptionId);
                entity.HasIndex(e => e.InvoiceNumber).IsUnique();
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IssueDate);
                entity.HasIndex(e => e.DueDate);
            });

            // Configure InvoiceItem entity
            modelBuilder.Entity<InvoiceItem>(entity =>
            {
                entity.ToTable("invoice_items");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.InvoiceId).HasColumnName("invoice_id");
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500).IsRequired();
                entity.Property(e => e.Quantity).HasColumnName("quantity").HasDefaultValue(1);
                entity.Property(e => e.UnitPrice).HasColumnName("unit_price").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.TotalPrice).HasColumnName("total_price").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.PeriodStart).HasColumnName("period_start");
                entity.Property(e => e.PeriodEnd).HasColumnName("period_end");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Invoice)
                      .WithMany(i => i.Items)
                      .HasForeignKey(e => e.InvoiceId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.InvoiceId);
            });

            // Configure MarketplaceItem entity
            modelBuilder.Entity<MarketplaceItem>(entity =>
            {
                entity.ToTable("marketplace_items");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(3).HasDefaultValue("USD");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IsFeatured).HasColumnName("is_featured").HasDefaultValue(false);
                entity.Property(e => e.Downloads).HasColumnName("downloads").HasDefaultValue(0);
                entity.Property(e => e.Rating).HasColumnName("rating").HasColumnType("decimal(3,2)").HasDefaultValue(0);
                entity.Property(e => e.ReviewCount).HasColumnName("review_count").HasDefaultValue(0);
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.Screenshots).HasColumnName("screenshots").HasColumnType("text[]");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Creator)
                      .WithMany()
                      .HasForeignKey(e => e.CreatorId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.CreatorId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsFeatured);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure MarketplaceSale entity
            modelBuilder.Entity<MarketplaceSale>(entity =>
            {
                entity.ToTable("marketplace_sales");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ItemId).HasColumnName("item_id");
                entity.Property(e => e.BuyerId).HasColumnName("buyer_id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.Price).HasColumnName("price").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(3).HasDefaultValue("USD");
                entity.Property(e => e.CreatorRevenue).HasColumnName("creator_revenue").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.PlatformRevenue).HasColumnName("platform_revenue").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.RevenueSharePercent).HasColumnName("revenue_share_percent").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Item)
                      .WithMany(i => i.Sales)
                      .HasForeignKey(e => e.ItemId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Buyer)
                      .WithMany()
                      .HasForeignKey(e => e.BuyerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Creator)
                      .WithMany()
                      .HasForeignKey(e => e.CreatorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.ItemId);
                entity.HasIndex(e => e.BuyerId);
                entity.HasIndex(e => e.CreatorId);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure RevenueShare entity
            modelBuilder.Entity<RevenueShare>(entity =>
            {
                entity.ToTable("revenue_shares");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.SaleId).HasColumnName("sale_id");
                entity.Property(e => e.CreatorId).HasColumnName("creator_id");
                entity.Property(e => e.Amount).HasColumnName("amount").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(3).HasDefaultValue("USD");
                entity.Property(e => e.Percentage).HasColumnName("percentage").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.PaidAt).HasColumnName("paid_at");
                entity.Property(e => e.PayoutReference).HasColumnName("payout_reference").HasMaxLength(200);

                entity.HasOne(e => e.Sale)
                      .WithMany()
                      .HasForeignKey(e => e.SaleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Creator)
                      .WithMany()
                      .HasForeignKey(e => e.CreatorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.SaleId);
                entity.HasIndex(e => e.CreatorId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure Organization entity
            modelBuilder.Entity<Organization>(entity =>
            {
                entity.ToTable("organizations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.DisplayName).HasColumnName("display_name").HasMaxLength(200);
                entity.Property(e => e.Domain).HasColumnName("domain").HasMaxLength(255);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50);
                entity.Property(e => e.Industry).HasColumnName("industry").HasMaxLength(100);
                entity.Property(e => e.Size).HasColumnName("size").HasMaxLength(50);
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Logo).HasColumnName("logo").HasMaxLength(500);
                entity.Property(e => e.Website).HasColumnName("website").HasMaxLength(255);
                entity.Property(e => e.Country).HasColumnName("country").HasMaxLength(100);
                entity.Property(e => e.Timezone).HasColumnName("timezone").HasMaxLength(50);
                entity.Property(e => e.Currency).HasColumnName("currency").HasMaxLength(10);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.OwnerId).HasColumnName("owner_id").IsRequired();
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.Features).HasColumnName("features").HasColumnType("jsonb");
                entity.Property(e => e.Limits).HasColumnName("limits").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Owner)
                      .WithMany()
                      .HasForeignKey(e => e.OwnerId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasIndex(e => e.Domain);
                entity.HasIndex(e => e.OwnerId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure OrganizationMember entity
            modelBuilder.Entity<OrganizationMember>(entity =>
            {
                entity.ToTable("organization_members");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.RoleId).HasColumnName("role_id").IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.JoinedAt).HasColumnName("joined_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.InvitedBy).HasColumnName("invited_by");
                entity.Property(e => e.SuspendedAt).HasColumnName("suspended_at");
                entity.Property(e => e.SuspendedBy).HasColumnName("suspended_by");
                entity.Property(e => e.SuspensionReason).HasColumnName("suspension_reason").HasMaxLength(500);
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.Permissions).HasColumnName("permissions").HasColumnType("jsonb");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Organization)
                      .WithMany(o => o.Members)
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Role)
                      .WithMany(r => r.Members)
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.OrganizationId, e.UserId }).IsUnique();
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.JoinedAt);
            });

            // Configure OrganizationInvitation entity
            modelBuilder.Entity<OrganizationInvitation>(entity =>
            {
                entity.ToTable("organization_invitations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.Property(e => e.RoleId).HasColumnName("role_id").IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.Token).HasColumnName("token").HasMaxLength(500).IsRequired();
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at").IsRequired();
                entity.Property(e => e.Message).HasColumnName("message").HasMaxLength(1000);
                entity.Property(e => e.Permissions).HasColumnName("permissions").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.AcceptedAt).HasColumnName("accepted_at");
                entity.Property(e => e.AcceptedBy).HasColumnName("accepted_by");
                entity.Property(e => e.DeclinedAt).HasColumnName("declined_at");
                entity.Property(e => e.DeclinedBy).HasColumnName("declined_by");
                entity.Property(e => e.DeclineReason).HasColumnName("decline_reason").HasMaxLength(500);
                entity.Property(e => e.CancelledAt).HasColumnName("cancelled_at");
                entity.Property(e => e.CancelledBy).HasColumnName("cancelled_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Role)
                      .WithMany()
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => e.Token).IsUnique();
                entity.HasIndex(e => e.Email);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure Role entity
            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("roles");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50);
                entity.Property(e => e.IsSystem).HasColumnName("is_system").HasDefaultValue(false);
                entity.Property(e => e.Permissions).HasColumnName("permissions").HasColumnType("jsonb");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsSystem);
            });

            // Configure Permission entity
            modelBuilder.Entity<Permission>(entity =>
            {
                entity.ToTable("permissions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50);
                entity.Property(e => e.Resource).HasColumnName("resource").HasMaxLength(100);
                entity.Property(e => e.Action).HasColumnName("action").HasMaxLength(50);
                entity.Property(e => e.Scope).HasColumnName("scope").HasMaxLength(100);
                entity.Property(e => e.IsSystem).HasColumnName("is_system").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Resource);
                entity.HasIndex(e => e.Action);
            });

            // Configure RolePermission entity
            modelBuilder.Entity<RolePermission>(entity =>
            {
                entity.ToTable("role_permissions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.RoleId).HasColumnName("role_id").IsRequired();
                entity.Property(e => e.PermissionId).HasColumnName("permission_id").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");

                entity.HasOne(e => e.Role)
                      .WithMany(r => r.RolePermissions)
                      .HasForeignKey(e => e.RoleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Permission)
                      .WithMany(p => p.RolePermissions)
                      .HasForeignKey(e => e.PermissionId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.RoleId, e.PermissionId }).IsUnique();
            });

            // Configure AuditLog entity
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("audit_logs");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Action).HasColumnName("action").HasMaxLength(100).IsRequired();
                entity.Property(e => e.ResourceType).HasColumnName("resource_type").HasMaxLength(100);
                entity.Property(e => e.ResourceId).HasColumnName("resource_id");
                entity.Property(e => e.Details).HasColumnName("details").HasMaxLength(2000);
                entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(500);
                entity.Property(e => e.SessionId).HasColumnName("session_id").HasMaxLength(100);
                entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20).HasDefaultValue("Info");
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).HasDefaultValue("General");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Success");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.Action);
                entity.HasIndex(e => e.ResourceType);
                entity.HasIndex(e => e.ResourceId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure ComplianceCheck entity
            modelBuilder.Entity<ComplianceCheck>(entity =>
            {
                entity.ToTable("compliance_checks");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Framework).HasColumnName("framework").HasMaxLength(100);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.StartedAt).HasColumnName("started_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.StartedBy).HasColumnName("started_by");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.Score).HasColumnName("score");
                entity.Property(e => e.TotalIssues).HasColumnName("total_issues").HasDefaultValue(0);
                entity.Property(e => e.HighSeverityIssues).HasColumnName("high_severity_issues").HasDefaultValue(0);
                entity.Property(e => e.MediumSeverityIssues).HasColumnName("medium_severity_issues").HasDefaultValue(0);
                entity.Property(e => e.LowSeverityIssues).HasColumnName("low_severity_issues").HasDefaultValue(0);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.Results).HasColumnName("results").HasColumnType("jsonb");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.StartedAt);
            });

            // Configure ComplianceIssue entity
            modelBuilder.Entity<ComplianceIssue>(entity =>
            {
                entity.ToTable("compliance_issues");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.CheckId).HasColumnName("check_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Recommendation).HasColumnName("recommendation").HasMaxLength(1000);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Open");
                entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
                entity.Property(e => e.ResolvedBy).HasColumnName("resolved_by");
                entity.Property(e => e.Resolution).HasColumnName("resolution").HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Check)
                      .WithMany(c => c.Issues)
                      .HasForeignKey(e => e.CheckId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Severity);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure SecurityPolicy entity
            modelBuilder.Entity<SecurityPolicy>(entity =>
            {
                entity.ToTable("security_policies");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(500);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50);
                entity.Property(e => e.Rules).HasColumnName("rules").HasColumnType("jsonb");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.EnforcementLevel).HasColumnName("enforcement_level").HasMaxLength(20).HasDefaultValue("Medium");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsEnabled);
            });

            // Configure SecurityViolation entity
            modelBuilder.Entity<SecurityViolation>(entity =>
            {
                entity.ToTable("security_violations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.PolicyId).HasColumnName("policy_id");
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Open");
                entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
                entity.Property(e => e.ResolvedBy).HasColumnName("resolved_by");
                entity.Property(e => e.Resolution).HasColumnName("resolution").HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Policy)
                      .WithMany(p => p.Violations)
                      .HasForeignKey(e => e.PolicyId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Severity);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure SsoConfiguration entity
            modelBuilder.Entity<SsoConfiguration>(entity =>
            {
                entity.ToTable("sso_configurations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Provider).HasColumnName("provider").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Protocol).HasColumnName("protocol").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();
                entity.HasIndex(e => e.Provider);
                entity.HasIndex(e => e.IsEnabled);
            });

            // Configure SsoSession entity
            modelBuilder.Entity<SsoSession>(entity =>
            {
                entity.ToTable("sso_sessions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.Provider).HasColumnName("provider").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Initiated");
                entity.Property(e => e.ReturnUrl).HasColumnName("return_url").HasMaxLength(500);
                entity.Property(e => e.State).HasColumnName("state").HasMaxLength(100).IsRequired();
                entity.Property(e => e.UserInfo).HasColumnName("user_info").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at").IsRequired();

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.State).IsUnique();
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure MfaConfiguration entity
            modelBuilder.Entity<MfaConfiguration>(entity =>
            {
                entity.ToTable("mfa_configurations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(false);
                entity.Property(e => e.IsEnforced).HasColumnName("is_enforced").HasDefaultValue(false);
                entity.Property(e => e.Methods).HasColumnName("methods").HasColumnType("jsonb");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.GracePeriodDays).HasColumnName("grace_period_days").HasDefaultValue(7);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.UpdatedBy).HasColumnName("updated_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.OrganizationId).IsUnique();
                entity.HasIndex(e => e.IsEnabled);
                entity.HasIndex(e => e.IsEnforced);
            });

            // Configure MfaToken entity
            modelBuilder.Entity<MfaToken>(entity =>
            {
                entity.ToTable("mfa_tokens");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Method).HasColumnName("method").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Token).HasColumnName("token").HasMaxLength(10).IsRequired();
                entity.Property(e => e.IsUsed).HasColumnName("is_used").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at").IsRequired();
                entity.Property(e => e.UsedAt).HasColumnName("used_at");

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.Token);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ExpiresAt);
            });

            // Configure DashboardWidget entity
            modelBuilder.Entity<DashboardWidget>(entity =>
            {
                entity.ToTable("dashboard_widgets");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Size).HasColumnName("size").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Position).HasColumnName("position").IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.DataSource).HasColumnName("data_source").HasMaxLength(100);
                entity.Property(e => e.RefreshInterval).HasColumnName("refresh_interval").HasDefaultValue(300);
                entity.Property(e => e.IsVisible).HasColumnName("is_visible").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.UserId });
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Position);
            });

            // Configure DashboardTemplate entity
            modelBuilder.Entity<DashboardTemplate>(entity =>
            {
                entity.ToTable("dashboard_templates");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50);
                entity.Property(e => e.Industry).HasColumnName("industry").HasMaxLength(100);
                entity.Property(e => e.Layout).HasColumnName("layout").HasColumnType("jsonb");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");

                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Industry);
                entity.HasIndex(e => e.IsPublic);
            });

            // Configure Dashboard entity
            modelBuilder.Entity<Dashboard>(entity =>
            {
                entity.ToTable("dashboards");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Layout).HasColumnName("layout").HasColumnType("jsonb");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.IsShared).HasColumnName("is_shared").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.UserId });
                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.IsShared);
            });

            // Configure UserSegment entity
            modelBuilder.Entity<UserSegment>(entity =>
            {
                entity.ToTable("user_segments");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50);
                entity.Property(e => e.Criteria).HasColumnName("criteria").HasColumnType("jsonb");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.Size).HasColumnName("size").HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Status);
            });

            // Configure CustomReport entity
            modelBuilder.Entity<CustomReport>(entity =>
            {
                entity.ToTable("custom_reports");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Query).HasColumnName("query").HasColumnType("text");
                entity.Property(e => e.Parameters).HasColumnName("parameters").HasColumnType("jsonb");
                entity.Property(e => e.Schedule).HasColumnName("schedule").HasColumnType("jsonb");
                entity.Property(e => e.Format).HasColumnName("format").HasMaxLength(20).HasDefaultValue("JSON");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name });
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.CreatedBy);
            });

            // Configure ReportExecution entity
            modelBuilder.Entity<ReportExecution>(entity =>
            {
                entity.ToTable("report_executions");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ReportId).HasColumnName("report_id").IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Running");
                entity.Property(e => e.StartedAt).HasColumnName("started_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.ExecutionTime).HasColumnName("execution_time");
                entity.Property(e => e.ResultSize).HasColumnName("result_size");
                entity.Property(e => e.ResultPath).HasColumnName("result_path").HasMaxLength(500);
                entity.Property(e => e.ErrorMessage).HasColumnName("error_message").HasMaxLength(2000);
                entity.Property(e => e.Parameters).HasColumnName("parameters").HasColumnType("jsonb");
                entity.Property(e => e.ExecutedBy).HasColumnName("executed_by");

                entity.HasOne(e => e.Report)
                      .WithMany(r => r.Executions)
                      .HasForeignKey(e => e.ReportId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ReportId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.StartedAt);
            });

            // Configure DataExport entity
            modelBuilder.Entity<DataExport>(entity =>
            {
                entity.ToTable("data_exports");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Format).HasColumnName("format").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.FilePath).HasColumnName("file_path").HasMaxLength(500);
                entity.Property(e => e.FileSize).HasColumnName("file_size");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure ExportTemplate entity
            modelBuilder.Entity<ExportTemplate>(entity =>
            {
                entity.ToTable("export_templates");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Format).HasColumnName("format").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");

                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Format);
                entity.HasIndex(e => e.IsPublic);
            });

            // Configure AlertRule entity
            modelBuilder.Entity<AlertRule>(entity =>
            {
                entity.ToTable("alert_rules");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Condition).HasColumnName("condition").HasColumnType("jsonb");
                entity.Property(e => e.Threshold).HasColumnName("threshold").HasColumnType("jsonb");
                entity.Property(e => e.Actions).HasColumnName("actions").HasColumnType("jsonb");
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20).HasDefaultValue("Medium");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name });
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsEnabled);
                entity.HasIndex(e => e.Severity);
            });

            // Configure Alert entity
            modelBuilder.Entity<Alert>(entity =>
            {
                entity.ToTable("alerts");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.RuleId).HasColumnName("rule_id");
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Message).HasColumnName("message").HasMaxLength(2000);
                entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Open");
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50);
                entity.Property(e => e.Source).HasColumnName("source").HasMaxLength(100);
                entity.Property(e => e.Data).HasColumnName("data").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.AcknowledgedAt).HasColumnName("acknowledged_at");
                entity.Property(e => e.AcknowledgedBy).HasColumnName("acknowledged_by");
                entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
                entity.Property(e => e.ResolvedBy).HasColumnName("resolved_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Rule)
                      .WithMany(r => r.Alerts)
                      .HasForeignKey(e => e.RuleId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.Severity);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure AlertConfiguration entity
            modelBuilder.Entity<AlertConfiguration>(entity =>
            {
                entity.ToTable("alert_configurations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.EmailEnabled).HasColumnName("email_enabled").HasDefaultValue(true);
                entity.Property(e => e.SmsEnabled).HasColumnName("sms_enabled").HasDefaultValue(false);
                entity.Property(e => e.WebhookEnabled).HasColumnName("webhook_enabled").HasDefaultValue(false);
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.OrganizationId).IsUnique();
            });

            // Configure KPI entity
            modelBuilder.Entity<KPI>(entity =>
            {
                entity.ToTable("kpis");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50);
                entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                entity.Property(e => e.TargetValue).HasColumnName("target_value");
                entity.Property(e => e.CurrentValue).HasColumnName("current_value");
                entity.Property(e => e.Calculation).HasColumnName("calculation").HasColumnType("jsonb");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name });
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure BusinessGoal entity
            modelBuilder.Entity<BusinessGoal>(entity =>
            {
                entity.ToTable("business_goals");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50);
                entity.Property(e => e.TargetValue).HasColumnName("target_value");
                entity.Property(e => e.CurrentValue).HasColumnName("current_value");
                entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                entity.Property(e => e.StartDate).HasColumnName("start_date");
                entity.Property(e => e.EndDate).HasColumnName("end_date");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.Priority).HasColumnName("priority").HasMaxLength(20).HasDefaultValue("Medium");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name });
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.Priority);
            });

            // Configure Milestone entity
            modelBuilder.Entity<Milestone>(entity =>
            {
                entity.ToTable("milestones");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.GoalId).HasColumnName("goal_id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.TargetValue).HasColumnName("target_value");
                entity.Property(e => e.CurrentValue).HasColumnName("current_value");
                entity.Property(e => e.Unit).HasColumnName("unit").HasMaxLength(20);
                entity.Property(e => e.DueDate).HasColumnName("due_date");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Pending");
                entity.Property(e => e.Progress).HasColumnName("progress").HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.CompletedAt).HasColumnName("completed_at");
                entity.Property(e => e.CompletedBy).HasColumnName("completed_by");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Goal)
                      .WithMany(g => g.Milestones)
                      .HasForeignKey(e => e.GoalId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.GoalId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.DueDate);
            });

            // Configure DataSource entity
            modelBuilder.Entity<DataSource>(entity =>
            {
                entity.ToTable("data_sources");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ConnectionString).HasColumnName("connection_string").HasMaxLength(1000);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.LastSyncAt).HasColumnName("last_sync_at");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name });
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Status);
            });

            // Configure RealTimeAlert entity
            modelBuilder.Entity<RealTimeAlert>(entity =>
            {
                entity.ToTable("realtime_alerts");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Condition).HasColumnName("condition").HasColumnType("jsonb");
                entity.Property(e => e.Threshold).HasColumnName("threshold").HasColumnType("jsonb");
                entity.Property(e => e.Actions).HasColumnName("actions").HasColumnType("jsonb");
                entity.Property(e => e.IsEnabled).HasColumnName("is_enabled").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.CreatedBy).HasColumnName("created_by");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name });
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.IsEnabled);
            });

            // Configure APIKey entity
            modelBuilder.Entity<APIKey>(entity =>
            {
                entity.ToTable("api_keys");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.KeyHash).HasColumnName("key_hash").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Permissions).HasColumnName("permissions").HasColumnType("text[]");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.LastUsedAt).HasColumnName("last_used_at");
                entity.Property(e => e.RevokedAt).HasColumnName("revoked_at");
                entity.Property(e => e.UsageCount).HasColumnName("usage_count").HasDefaultValue(0);
                entity.Property(e => e.RateLimitPolicy).HasColumnName("rate_limit_policy").HasColumnType("jsonb");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.KeyHash).IsUnique();
                entity.HasIndex(e => new { e.OrganizationId, e.IsActive });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ExpiresAt);
            });

            // Configure APILog entity
            modelBuilder.Entity<APILog>(entity =>
            {
                entity.ToTable("api_logs");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.APIKeyId).HasColumnName("api_key_id");
                entity.Property(e => e.Method).HasColumnName("method").HasMaxLength(10).IsRequired();
                entity.Property(e => e.Endpoint).HasColumnName("endpoint").HasMaxLength(500).IsRequired();
                entity.Property(e => e.StatusCode).HasColumnName("status_code").IsRequired();
                entity.Property(e => e.ResponseTime).HasColumnName("response_time").IsRequired();
                entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(500);
                entity.Property(e => e.IPAddress).HasColumnName("ip_address").HasMaxLength(45);
                entity.Property(e => e.RequestSize).HasColumnName("request_size");
                entity.Property(e => e.ResponseSize).HasColumnName("response_size");
                entity.Property(e => e.Timestamp).HasColumnName("timestamp").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ErrorMessage).HasColumnName("error_message");

                entity.HasOne(e => e.APIKey)
                      .WithMany()
                      .HasForeignKey(e => e.APIKeyId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.APIKeyId);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => e.StatusCode);
                entity.HasIndex(e => e.Endpoint);
            });

            // Configure Webhook entity
            modelBuilder.Entity<Webhook>(entity =>
            {
                entity.ToTable("webhooks");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Url).HasColumnName("url").HasMaxLength(2000).IsRequired();
                entity.Property(e => e.Events).HasColumnName("events").HasColumnType("text[]");
                entity.Property(e => e.Headers).HasColumnName("headers").HasColumnType("jsonb");
                entity.Property(e => e.Secret).HasColumnName("secret").HasMaxLength(100).IsRequired();
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.RetryPolicy).HasColumnName("retry_policy").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.IsActive });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Events);
            });

            // Configure WebhookDelivery entity
            modelBuilder.Entity<WebhookDelivery>(entity =>
            {
                entity.ToTable("webhook_deliveries");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.WebhookId).HasColumnName("webhook_id").IsRequired();
                entity.Property(e => e.EventType).HasColumnName("event_type").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Payload).HasColumnName("payload").HasColumnType("text").IsRequired();
                entity.Property(e => e.StatusCode).HasColumnName("status_code");
                entity.Property(e => e.Response).HasColumnName("response").HasColumnType("text");
                entity.Property(e => e.IsSuccessful).HasColumnName("is_successful").HasDefaultValue(false);
                entity.Property(e => e.DeliveredAt).HasColumnName("delivered_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Duration).HasColumnName("duration");
                entity.Property(e => e.IsRetry).HasColumnName("is_retry").HasDefaultValue(false);
                entity.Property(e => e.OriginalDeliveryId).HasColumnName("original_delivery_id");

                entity.HasOne(e => e.Webhook)
                      .WithMany()
                      .HasForeignKey(e => e.WebhookId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.WebhookId);
                entity.HasIndex(e => e.EventType);
                entity.HasIndex(e => e.DeliveredAt);
                entity.HasIndex(e => e.IsSuccessful);
            });

            // Configure Integration entity
            modelBuilder.Entity<Integration>(entity =>
            {
                entity.ToTable("integrations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.TypeId).HasColumnName("type_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.Credentials).HasColumnName("credentials").HasColumnType("jsonb");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.LastSync).HasColumnName("last_sync");
                entity.Property(e => e.SyncInterval).HasColumnName("sync_interval");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Type)
                      .WithMany()
                      .HasForeignKey(e => e.TypeId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.OrganizationId, e.IsActive });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.TypeId);
                entity.HasIndex(e => e.Status);
            });

            // Configure IntegrationType entity
            modelBuilder.Entity<IntegrationType>(entity =>
            {
                entity.ToTable("integration_types");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                entity.Property(e => e.DisplayName).HasColumnName("display_name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Provider).HasColumnName("provider").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Version).HasColumnName("version").HasMaxLength(20).IsRequired();
                entity.Property(e => e.ConfigurationSchema).HasColumnName("configuration_schema").HasColumnType("jsonb");
                entity.Property(e => e.CredentialsSchema).HasColumnName("credentials_schema").HasColumnType("jsonb");
                entity.Property(e => e.SupportedFeatures).HasColumnName("supported_features").HasColumnType("text[]");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IconUrl).HasColumnName("icon_url").HasMaxLength(500);
                entity.Property(e => e.DocumentationUrl).HasColumnName("documentation_url").HasMaxLength(500);
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Provider);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure OAuthApplication entity
            modelBuilder.Entity<OAuthApplication>(entity =>
            {
                entity.ToTable("oauth_applications");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.ClientId).HasColumnName("client_id").HasMaxLength(100).IsRequired();
                entity.Property(e => e.ClientSecret).HasColumnName("client_secret").HasMaxLength(200).IsRequired();
                entity.Property(e => e.RedirectUris).HasColumnName("redirect_uris").HasColumnType("text[]");
                entity.Property(e => e.Scopes).HasColumnName("scopes").HasColumnType("text[]");
                entity.Property(e => e.GrantTypes).HasColumnName("grant_types").HasColumnType("text[]");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ClientId).IsUnique();
                entity.HasIndex(e => new { e.OrganizationId, e.IsActive });
                entity.HasIndex(e => e.UserId);
            });

            // Configure OAuthToken entity
            modelBuilder.Entity<OAuthToken>(entity =>
            {
                entity.ToTable("oauth_tokens");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ApplicationId).HasColumnName("application_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.TokenType).HasColumnName("token_type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.AccessToken).HasColumnName("access_token").HasMaxLength(500).IsRequired();
                entity.Property(e => e.RefreshToken).HasColumnName("refresh_token").HasMaxLength(500);
                entity.Property(e => e.Scopes).HasColumnName("scopes").HasColumnType("text[]");
                entity.Property(e => e.ExpiresAt).HasColumnName("expires_at");
                entity.Property(e => e.IsRevoked).HasColumnName("is_revoked").HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.RevokedAt).HasColumnName("revoked_at");

                entity.HasOne(e => e.Application)
                      .WithMany()
                      .HasForeignKey(e => e.ApplicationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.AccessToken).IsUnique();
                entity.HasIndex(e => e.RefreshToken);
                entity.HasIndex(e => e.ApplicationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ExpiresAt);
            });

            // Configure RateLimitPolicy entity
            modelBuilder.Entity<RateLimitPolicy>(entity =>
            {
                entity.ToTable("rate_limit_policies");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.MaxRequests).HasColumnName("max_requests").IsRequired();
                entity.Property(e => e.WindowSize).HasColumnName("window_size").IsRequired();
                entity.Property(e => e.WindowUnit).HasColumnName("window_unit").HasMaxLength(10).IsRequired();
                entity.Property(e => e.Rules).HasColumnName("rules").HasColumnType("jsonb");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Name }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure SupportTicket entity
            modelBuilder.Entity<SupportTicket>(entity =>
            {
                entity.ToTable("support_tickets");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.TicketNumber).HasColumnName("ticket_number").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Subject).HasColumnName("subject").HasMaxLength(500).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasColumnType("text").IsRequired();
                entity.Property(e => e.CategoryId).HasColumnName("category_id");
                entity.Property(e => e.PriorityId).HasColumnName("priority_id").IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Source).HasColumnName("source").HasMaxLength(20);
                entity.Property(e => e.CustomerType).HasColumnName("customer_type").HasMaxLength(20);
                entity.Property(e => e.AssignedAgentId).HasColumnName("assigned_agent_id");
                entity.Property(e => e.Resolution).HasColumnName("resolution").HasColumnType("text");
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.Attachments).HasColumnName("attachments").HasColumnType("jsonb");
                entity.Property(e => e.SLADueDate).HasColumnName("sla_due_date");
                entity.Property(e => e.EscalationLevel).HasColumnName("escalation_level").HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastUpdatedAt).HasColumnName("last_updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
                entity.Property(e => e.ClosedAt).HasColumnName("closed_at");
                entity.Property(e => e.LastUpdatedByUserId).HasColumnName("last_updated_by_user_id");
                entity.Property(e => e.ResolvedByAgentId).HasColumnName("resolved_by_agent_id");
                entity.Property(e => e.ClosedByAgentId).HasColumnName("closed_by_agent_id");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Priority)
                      .WithMany()
                      .HasForeignKey(e => e.PriorityId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.AssignedAgent)
                      .WithMany()
                      .HasForeignKey(e => e.AssignedAgentId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.TicketNumber).IsUnique();
                entity.HasIndex(e => new { e.OrganizationId, e.Status });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.AssignedAgentId);
                entity.HasIndex(e => e.CategoryId);
                entity.HasIndex(e => e.PriorityId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.SLADueDate);
            });

            // Configure SupportTicketComment entity
            modelBuilder.Entity<SupportTicketComment>(entity =>
            {
                entity.ToTable("support_ticket_comments");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TicketId).HasColumnName("ticket_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Content).HasColumnName("content").HasColumnType("text").IsRequired();
                entity.Property(e => e.IsInternal).HasColumnName("is_internal").HasDefaultValue(false);
                entity.Property(e => e.Attachments).HasColumnName("attachments").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Ticket)
                      .WithMany(t => t.Comments)
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TicketId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure KnowledgeBaseArticle entity
            modelBuilder.Entity<KnowledgeBaseArticle>(entity =>
            {
                entity.ToTable("knowledge_base_articles");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id");
                entity.Property(e => e.CategoryId).HasColumnName("category_id").IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(500).IsRequired();
                entity.Property(e => e.Content).HasColumnName("content").HasColumnType("text").IsRequired();
                entity.Property(e => e.Summary).HasColumnName("summary").HasMaxLength(1000);
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.AuthorId).HasColumnName("author_id").IsRequired();
                entity.Property(e => e.LastUpdatedByUserId).HasColumnName("last_updated_by_user_id");
                entity.Property(e => e.ViewCount).HasColumnName("view_count").HasDefaultValue(0);
                entity.Property(e => e.AverageRating).HasColumnName("average_rating");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                      .WithMany()
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Author)
                      .WithMany()
                      .HasForeignKey(e => e.AuthorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.OrganizationId, e.Status });
                entity.HasIndex(e => e.CategoryId);
                entity.HasIndex(e => e.AuthorId);
                entity.HasIndex(e => e.IsPublic);
                entity.HasIndex(e => e.UpdatedAt);
                entity.HasIndex(e => e.ViewCount);
            });

            // Configure KnowledgeBaseCategory entity
            modelBuilder.Entity<KnowledgeBaseCategory>(entity =>
            {
                entity.ToTable("knowledge_base_categories");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.SortOrder).HasColumnName("sort_order").HasDefaultValue(0);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IconUrl).HasColumnName("icon_url").HasMaxLength(500);
                entity.Property(e => e.ParentId).HasColumnName("parent_id");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Parent)
                      .WithMany(p => p.Children)
                      .HasForeignKey(e => e.ParentId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.Name);
                entity.HasIndex(e => e.SortOrder);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.ParentId);
            });

            // Configure KnowledgeBaseRating entity
            modelBuilder.Entity<KnowledgeBaseRating>(entity =>
            {
                entity.ToTable("knowledge_base_ratings");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ArticleId).HasColumnName("article_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Rating).HasColumnName("rating").IsRequired();
                entity.Property(e => e.Feedback).HasColumnName("feedback").HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Article)
                      .WithMany(a => a.Ratings)
                      .HasForeignKey(e => e.ArticleId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.ArticleId, e.UserId }).IsUnique();
                entity.HasIndex(e => e.ArticleId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Rating);
            });

            // Configure SupportAgent entity
            modelBuilder.Entity<SupportAgent>(entity =>
            {
                entity.ToTable("support_agents");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.DisplayName).HasColumnName("display_name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Email).HasColumnName("email").HasMaxLength(255).IsRequired();
                entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Department).HasColumnName("department").HasMaxLength(100);
                entity.Property(e => e.Skills).HasColumnName("skills").HasColumnType("text[]");
                entity.Property(e => e.Languages).HasColumnName("languages").HasColumnType("text[]");
                entity.Property(e => e.MaxConcurrentTickets).HasColumnName("max_concurrent_tickets").HasDefaultValue(10);
                entity.Property(e => e.CurrentWorkload).HasColumnName("current_workload").HasDefaultValue(0);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.IsAvailable).HasColumnName("is_available").HasDefaultValue(true);
                entity.Property(e => e.LastActiveAt).HasColumnName("last_active_at");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.UserId }).IsUnique();
                entity.HasIndex(e => e.Email);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.IsAvailable);
                entity.HasIndex(e => e.CurrentWorkload);
            });

            // Configure SLAPolicy entity
            modelBuilder.Entity<SLAPolicy>(entity =>
            {
                entity.ToTable("sla_policies");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.PriorityId).HasColumnName("priority_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.ResponseTimeHours).HasColumnName("response_time_hours").IsRequired();
                entity.Property(e => e.ResolutionTimeHours).HasColumnName("resolution_time_hours").IsRequired();
                entity.Property(e => e.BusinessHoursOnly).HasColumnName("business_hours_only").HasDefaultValue(false);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Priority)
                      .WithMany()
                      .HasForeignKey(e => e.PriorityId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(e => new { e.OrganizationId, e.PriorityId }).IsUnique();
                entity.HasIndex(e => e.IsActive);
            });

            // Configure SLAViolation entity
            modelBuilder.Entity<SLAViolation>(entity =>
            {
                entity.ToTable("sla_violations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TicketId).HasColumnName("ticket_id").IsRequired();
                entity.Property(e => e.ViolationType).HasColumnName("violation_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ViolatedAt).HasColumnName("violated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.ResolvedAt).HasColumnName("resolved_at");
                entity.Property(e => e.IsResolved).HasColumnName("is_resolved").HasDefaultValue(false);
                entity.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(1000);

                entity.HasOne(e => e.Ticket)
                      .WithMany()
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TicketId);
                entity.HasIndex(e => e.ViolationType);
                entity.HasIndex(e => e.ViolatedAt);
                entity.HasIndex(e => e.IsResolved);
            });

            // Configure EscalationEvent entity
            modelBuilder.Entity<EscalationEvent>(entity =>
            {
                entity.ToTable("escalation_events");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.TicketId).HasColumnName("ticket_id").IsRequired();
                entity.Property(e => e.FromAgentId).HasColumnName("from_agent_id");
                entity.Property(e => e.ToAgentId).HasColumnName("to_agent_id").IsRequired();
                entity.Property(e => e.EscalatedByUserId).HasColumnName("escalated_by_user_id").IsRequired();
                entity.Property(e => e.Reason).HasColumnName("reason").HasMaxLength(500);
                entity.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(1000);
                entity.Property(e => e.EscalatedAt).HasColumnName("escalated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Ticket)
                      .WithMany()
                      .HasForeignKey(e => e.TicketId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.TicketId);
                entity.HasIndex(e => e.FromAgentId);
                entity.HasIndex(e => e.ToAgentId);
                entity.HasIndex(e => e.EscalatedAt);
            });

            // Configure GameInstance entity
            modelBuilder.Entity<GameInstance>(entity =>
            {
                entity.ToTable("game_instances");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.GameType).HasColumnName("game_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.GameVersion).HasColumnName("game_version").HasMaxLength(20);
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.ResourceRequirements).HasColumnName("resource_requirements").HasColumnType("jsonb");
                entity.Property(e => e.MaxPlayers).HasColumnName("max_players").HasDefaultValue(10);
                entity.Property(e => e.CurrentPlayers).HasColumnName("current_players").HasDefaultValue(0);
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(false);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Region).HasColumnName("region").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.CustomSettings).HasColumnName("custom_settings").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastStartedAt).HasColumnName("last_started_at");
                entity.Property(e => e.LastStoppedAt).HasColumnName("last_stopped_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Status });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.GameType);
                entity.HasIndex(e => e.Region);
                entity.HasIndex(e => e.IsPublic);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure ServerTemplate entity
            modelBuilder.Entity<ServerTemplate>(entity =>
            {
                entity.ToTable("server_templates");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.GameType).HasColumnName("game_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.ResourceRequirements).HasColumnName("resource_requirements").HasColumnType("jsonb");
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(false);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.GameType });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsPublic);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure GameWorld entity
            modelBuilder.Entity<GameWorld>(entity =>
            {
                entity.ToTable("game_worlds");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.GameType).HasColumnName("game_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.WorldType).HasColumnName("world_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.SeedData).HasColumnName("seed_data").HasColumnType("jsonb");
                entity.Property(e => e.SizeBytes).HasColumnName("size_bytes").HasDefaultValue(0);
                entity.Property(e => e.Version).HasColumnName("version").HasDefaultValue(1);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.GameType });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.WorldType);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.UpdatedAt);
            });

            // Configure WorldBackup entity
            modelBuilder.Entity<WorldBackup>(entity =>
            {
                entity.ToTable("world_backups");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.WorldId).HasColumnName("world_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.BackupType).HasColumnName("backup_type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.SizeBytes).HasColumnName("size_bytes").HasDefaultValue(0);
                entity.Property(e => e.Version).HasColumnName("version").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.World)
                      .WithMany(w => w.Backups)
                      .HasForeignKey(e => e.WorldId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.WorldId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.BackupType);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure StreamChannel entity
            modelBuilder.Entity<StreamChannel>(entity =>
            {
                entity.ToTable("stream_channels");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Language).HasColumnName("language").HasMaxLength(10).HasDefaultValue("en");
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.StreamKey).HasColumnName("stream_key").HasMaxLength(200);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Offline");
                entity.Property(e => e.ViewerCount).HasColumnName("viewer_count").HasDefaultValue(0);
                entity.Property(e => e.FollowerCount).HasColumnName("follower_count").HasDefaultValue(0);
                entity.Property(e => e.TotalViews).HasColumnName("total_views").HasDefaultValue(0);
                entity.Property(e => e.TotalStreamTime).HasColumnName("total_stream_time").HasDefaultValue(0);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure LiveStream entity
            modelBuilder.Entity<LiveStream>(entity =>
            {
                entity.ToTable("live_streams");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ChannelId).HasColumnName("channel_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(300).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(100).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Preparing");
                entity.Property(e => e.Quality).HasColumnName("quality").HasMaxLength(20).HasDefaultValue("1080p");
                entity.Property(e => e.Bitrate).HasColumnName("bitrate").HasDefaultValue(3000);
                entity.Property(e => e.IsRecording).HasColumnName("is_recording").HasDefaultValue(false);
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.ViewerCount).HasColumnName("viewer_count").HasDefaultValue(0);
                entity.Property(e => e.MaxViewers).HasColumnName("max_viewers").HasDefaultValue(0);
                entity.Property(e => e.Duration).HasColumnName("duration").HasDefaultValue(0);
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.ThumbnailUrl).HasColumnName("thumbnail_url").HasMaxLength(500);
                entity.Property(e => e.StartedAt).HasColumnName("started_at");
                entity.Property(e => e.EndedAt).HasColumnName("ended_at");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Channel)
                      .WithMany()
                      .HasForeignKey(e => e.ChannelId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ChannelId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.StartedAt);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure StreamRecording entity
            modelBuilder.Entity<StreamRecording>(entity =>
            {
                entity.ToTable("stream_recordings");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.StreamId).HasColumnName("stream_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(300).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(2000);
                entity.Property(e => e.Duration).HasColumnName("duration").IsRequired();
                entity.Property(e => e.FileSize).HasColumnName("file_size").IsRequired();
                entity.Property(e => e.Quality).HasColumnName("quality").HasMaxLength(20).HasDefaultValue("1080p");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Processing");
                entity.Property(e => e.FilePath).HasColumnName("file_path").HasMaxLength(500);
                entity.Property(e => e.ThumbnailUrl).HasColumnName("thumbnail_url").HasMaxLength(500);
                entity.Property(e => e.ViewCount).HasColumnName("view_count").HasDefaultValue(0);
                entity.Property(e => e.LikeCount).HasColumnName("like_count").HasDefaultValue(0);
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(true);
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.ProcessedAt).HasColumnName("processed_at");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Stream)
                      .WithMany()
                      .HasForeignKey(e => e.StreamId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.StreamId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure StreamViewer entity
            modelBuilder.Entity<StreamViewer>(entity =>
            {
                entity.ToTable("stream_viewers");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.StreamId).HasColumnName("stream_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id");
                entity.Property(e => e.AnonymousId).HasColumnName("anonymous_id").HasMaxLength(100);
                entity.Property(e => e.IpAddress).HasColumnName("ip_address").HasMaxLength(45);
                entity.Property(e => e.UserAgent).HasColumnName("user_agent").HasMaxLength(500);
                entity.Property(e => e.Country).HasColumnName("country").HasMaxLength(50);
                entity.Property(e => e.City).HasColumnName("city").HasMaxLength(100);
                entity.Property(e => e.JoinedAt).HasColumnName("joined_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LeftAt).HasColumnName("left_at");
                entity.Property(e => e.ViewDuration).HasColumnName("view_duration").HasDefaultValue(0);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.DeviceType).HasColumnName("device_type").HasMaxLength(50);
                entity.Property(e => e.Platform).HasColumnName("platform").HasMaxLength(50);
                entity.Property(e => e.ChatParticipated).HasColumnName("chat_participated").HasDefaultValue(false);
                entity.Property(e => e.LastActivity).HasColumnName("last_activity").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Stream)
                      .WithMany()
                      .HasForeignKey(e => e.StreamId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.StreamId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.JoinedAt);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure ContentProject entity
            modelBuilder.Entity<ContentProject>(entity =>
            {
                entity.ToTable("content_projects");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.Settings).HasColumnName("settings").HasColumnType("jsonb");
                entity.Property(e => e.Timeline).HasColumnName("timeline").HasColumnType("jsonb");
                entity.Property(e => e.Assets).HasColumnName("assets").HasColumnType("jsonb");
                entity.Property(e => e.Tags).HasColumnName("tags").HasColumnType("text[]");
                entity.Property(e => e.DurationMinutes).HasColumnName("duration_minutes").HasDefaultValue(0);
                entity.Property(e => e.IsPublic).HasColumnName("is_public").HasDefaultValue(false);
                entity.Property(e => e.LastRendered).HasColumnName("last_rendered");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Type);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure PerformanceAnalysis entity
            modelBuilder.Entity<PerformanceAnalysis>(entity =>
            {
                entity.ToTable("performance_analyses");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id").IsRequired();
                entity.Property(e => e.AnalysisType).HasColumnName("analysis_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.StartTime).HasColumnName("start_time").IsRequired();
                entity.Property(e => e.EndTime).HasColumnName("end_time").IsRequired();
                entity.Property(e => e.CpuUsage).HasColumnName("cpu_usage").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.MemoryUsage).HasColumnName("memory_usage").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.NetworkUsage).HasColumnName("network_usage").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.DiskUsage).HasColumnName("disk_usage").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.PlayerCount).HasColumnName("player_count").IsRequired();
                entity.Property(e => e.ResponseTime).HasColumnName("response_time").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.ThroughputOps).HasColumnName("throughput_ops").HasColumnType("decimal(10,2)").IsRequired();
                entity.Property(e => e.ErrorRate).HasColumnName("error_rate").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.BottleneckAreas).HasColumnName("bottleneck_areas").HasColumnType("text[]");
                entity.Property(e => e.RecommendedActions).HasColumnName("recommended_actions").HasColumnType("text[]");
                entity.Property(e => e.AnalysisData).HasColumnName("analysis_data").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.AnalysisType);
                entity.HasIndex(e => e.StartTime);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure OptimizationRecommendation entity
            modelBuilder.Entity<OptimizationRecommendation>(entity =>
            {
                entity.ToTable("optimization_recommendations");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ServerId).HasColumnName("server_id").IsRequired();
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.Priority).HasColumnName("priority").HasMaxLength(20).IsRequired();
                entity.Property(e => e.ImpactScore).HasColumnName("impact_score").HasColumnType("decimal(5,2)").IsRequired();
                entity.Property(e => e.DifficultyLevel).HasColumnName("difficulty_level").HasMaxLength(20).IsRequired();
                entity.Property(e => e.EstimatedBenefit).HasColumnName("estimated_benefit").HasMaxLength(500);
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.RecommendationData).HasColumnName("recommendation_data").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Server)
                      .WithMany()
                      .HasForeignKey(e => e.ServerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ServerId);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Priority);
                entity.HasIndex(e => e.ImpactScore);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure MLModel entity
            modelBuilder.Entity<MLModel>(entity =>
            {
                entity.ToTable("ml_models");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.ModelType).HasColumnName("model_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Algorithm).HasColumnName("algorithm").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Creating");
                entity.Property(e => e.Version).HasColumnName("version").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Configuration).HasColumnName("configuration").HasColumnType("jsonb");
                entity.Property(e => e.TrainingData).HasColumnName("training_data").HasColumnType("jsonb");
                entity.Property(e => e.ModelMetrics).HasColumnName("model_metrics").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ModelType);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure MLModelTraining entity
            modelBuilder.Entity<MLModelTraining>(entity =>
            {
                entity.ToTable("ml_model_trainings");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.ModelId).HasColumnName("model_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.TrainingData).HasColumnName("training_data").HasColumnType("jsonb");
                entity.Property(e => e.TrainingParameters).HasColumnName("training_parameters").HasColumnType("jsonb");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Training");
                entity.Property(e => e.StartTime).HasColumnName("start_time").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.EndTime).HasColumnName("end_time");
                entity.Property(e => e.Accuracy).HasColumnName("accuracy").HasColumnType("decimal(5,4)");
                entity.Property(e => e.Loss).HasColumnName("loss").HasColumnType("decimal(10,6)");
                entity.Property(e => e.ValidationAccuracy).HasColumnName("validation_accuracy").HasColumnType("decimal(5,4)");
                entity.Property(e => e.TrainingMetrics).HasColumnName("training_metrics").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Model)
                      .WithMany()
                      .HasForeignKey(e => e.ModelId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.ModelId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.StartTime);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure PlayerBehaviorAnalysis entity
            modelBuilder.Entity<PlayerBehaviorAnalysis>(entity =>
            {
                entity.ToTable("player_behavior_analyses");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.PlayerId).HasColumnName("player_id").IsRequired();
                entity.Property(e => e.AnalysisType).HasColumnName("analysis_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.StartTime).HasColumnName("start_time").IsRequired();
                entity.Property(e => e.EndTime).HasColumnName("end_time").IsRequired();
                entity.Property(e => e.SessionCount).HasColumnName("session_count").IsRequired();
                entity.Property(e => e.TotalPlayTime).HasColumnName("total_play_time").IsRequired();
                entity.Property(e => e.AverageSessionDuration).HasColumnName("average_session_duration").IsRequired();
                entity.Property(e => e.ChurnProbability).HasColumnName("churn_probability").HasColumnType("decimal(5,4)").IsRequired();
                entity.Property(e => e.EngagementLevel).HasColumnName("engagement_level").HasMaxLength(20).IsRequired();
                entity.Property(e => e.PreferredGameModes).HasColumnName("preferred_game_modes").HasColumnType("text[]");
                entity.Property(e => e.PlayPatterns).HasColumnName("play_patterns").HasColumnType("jsonb");
                entity.Property(e => e.SocialInteractions).HasColumnName("social_interactions").HasColumnType("jsonb");
                entity.Property(e => e.BehaviorData).HasColumnName("behavior_data").HasColumnType("jsonb");
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Player)
                      .WithMany()
                      .HasForeignKey(e => e.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.PlayerId);
                entity.HasIndex(e => e.AnalysisType);
                entity.HasIndex(e => e.StartTime);
                entity.HasIndex(e => e.EngagementLevel);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure PlayerSegment entity
            modelBuilder.Entity<PlayerSegment>(entity =>
            {
                entity.ToTable("player_segments");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.SegmentType).HasColumnName("segment_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Criteria).HasColumnName("criteria").HasColumnType("jsonb");
                entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20).HasDefaultValue("Active");
                entity.Property(e => e.PlayerCount).HasColumnName("player_count").IsRequired();
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => e.OrganizationId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.SegmentType);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure GameEvent entity
            modelBuilder.Entity<GameEvent>(entity =>
            {
                entity.ToTable("game_events");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.GameInstanceId).HasColumnName("game_instance_id").IsRequired();
                entity.Property(e => e.PlayerId).HasColumnName("player_id");
                entity.Property(e => e.EventType).HasColumnName("event_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.EventData).HasColumnName("event_data").HasColumnType("jsonb");
                entity.Property(e => e.Timestamp).HasColumnName("timestamp").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.SessionId).HasColumnName("session_id");
                entity.Property(e => e.Source).HasColumnName("source").HasMaxLength(50);
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");

                entity.HasOne(e => e.GameInstance)
                      .WithMany()
                      .HasForeignKey(e => e.GameInstanceId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Player)
                      .WithMany()
                      .HasForeignKey(e => e.PlayerId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(e => e.GameInstanceId);
                entity.HasIndex(e => e.PlayerId);
                entity.HasIndex(e => e.EventType);
                entity.HasIndex(e => e.Timestamp);
                entity.HasIndex(e => e.SessionId);
            });

            // Configure VirtualItem entity
            modelBuilder.Entity<VirtualItem>(entity =>
            {
                entity.ToTable("virtual_items");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.ItemType).HasColumnName("item_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
                entity.Property(e => e.Rarity).HasColumnName("rarity").HasMaxLength(20).IsRequired();
                entity.Property(e => e.Properties).HasColumnName("properties").HasColumnType("jsonb");
                entity.Property(e => e.IsStackable).HasColumnName("is_stackable").HasDefaultValue(false);
                entity.Property(e => e.MaxStackSize).HasColumnName("max_stack_size").HasDefaultValue(1);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.ItemType });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.Rarity);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure VirtualCurrency entity
            modelBuilder.Entity<VirtualCurrency>(entity =>
            {
                entity.ToTable("virtual_currencies");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Symbol).HasColumnName("symbol").HasMaxLength(10).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.InitialAmount).HasColumnName("initial_amount").HasDefaultValue(0);
                entity.Property(e => e.MaxAmount).HasColumnName("max_amount");
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.Symbol }).IsUnique();
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.IsActive);
            });

            // Configure Leaderboard entity
            modelBuilder.Entity<Leaderboard>(entity =>
            {
                entity.ToTable("leaderboards");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.OrganizationId).HasColumnName("organization_id").IsRequired();
                entity.Property(e => e.UserId).HasColumnName("user_id").IsRequired();
                entity.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Description).HasColumnName("description").HasMaxLength(1000);
                entity.Property(e => e.GameType).HasColumnName("game_type").HasMaxLength(50).IsRequired();
                entity.Property(e => e.ScoreType).HasColumnName("score_type").HasMaxLength(20).IsRequired();
                entity.Property(e => e.SortOrder).HasColumnName("sort_order").HasMaxLength(10).IsRequired();
                entity.Property(e => e.ResetFrequency).HasColumnName("reset_frequency").HasMaxLength(20);
                entity.Property(e => e.MaxEntries).HasColumnName("max_entries").HasDefaultValue(1000);
                entity.Property(e => e.IsActive).HasColumnName("is_active").HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");
                entity.Property(e => e.LastResetAt).HasColumnName("last_reset_at");

                entity.HasOne(e => e.Organization)
                      .WithMany()
                      .HasForeignKey(e => e.OrganizationId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.User)
                      .WithMany()
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.OrganizationId, e.GameType });
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ScoreType);
                entity.HasIndex(e => e.IsActive);
                entity.HasIndex(e => e.CreatedAt);
            });

            // Configure LeaderboardEntry entity
            modelBuilder.Entity<LeaderboardEntry>(entity =>
            {
                entity.ToTable("leaderboard_entries");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.LeaderboardId).HasColumnName("leaderboard_id").IsRequired();
                entity.Property(e => e.PlayerId).HasColumnName("player_id").IsRequired();
                entity.Property(e => e.PlayerName).HasColumnName("player_name").HasMaxLength(200).IsRequired();
                entity.Property(e => e.Score).HasColumnName("score").IsRequired();
                entity.Property(e => e.Rank).HasColumnName("rank").IsRequired();
                entity.Property(e => e.Metadata).HasColumnName("metadata").HasColumnType("jsonb");
                entity.Property(e => e.UpdatedAt).HasColumnName("updated_at").HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasOne(e => e.Leaderboard)
                      .WithMany(l => l.Entries)
                      .HasForeignKey(e => e.LeaderboardId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Player)
                      .WithMany()
                      .HasForeignKey(e => e.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.LeaderboardId, e.PlayerId }).IsUnique();
                entity.HasIndex(e => new { e.LeaderboardId, e.Rank });
                entity.HasIndex(e => e.PlayerId);
                entity.HasIndex(e => e.Score);
                entity.HasIndex(e => e.UpdatedAt);
            });
        }
    }
}