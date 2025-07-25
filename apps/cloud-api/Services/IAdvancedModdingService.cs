using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IAdvancedModdingService
    {
        // Mod Management
        Task<Mod> CreateModAsync(Guid organizationId, Guid userId, CreateModRequest request);
        Task<List<Mod>> GetModsAsync(Guid organizationId, ModFilter? filter = null);
        Task<Mod> GetModAsync(Guid modId);
        Task<Mod> UpdateModAsync(Guid modId, Guid userId, UpdateModRequest request);
        Task<bool> DeleteModAsync(Guid modId, Guid userId);
        Task<ModVersion> CreateModVersionAsync(Guid modId, Guid userId, CreateModVersionRequest request);
        Task<List<ModVersion>> GetModVersionsAsync(Guid modId, ModVersionFilter? filter = null);
        Task<ModVersion> GetModVersionAsync(Guid versionId);
        Task<bool> DeleteModVersionAsync(Guid versionId, Guid userId);

        // Mod Development Tools
        Task<ModProject> CreateModProjectAsync(Guid organizationId, Guid userId, CreateModProjectRequest request);
        Task<List<ModProject>> GetModProjectsAsync(Guid organizationId, ModProjectFilter? filter = null);
        Task<ModProject> GetModProjectAsync(Guid projectId);
        Task<ModProject> UpdateModProjectAsync(Guid projectId, Guid userId, UpdateModProjectRequest request);
        Task<bool> DeleteModProjectAsync(Guid projectId, Guid userId);
        Task<ModBuild> BuildModAsync(Guid projectId, Guid userId, BuildModRequest request);
        Task<List<ModBuild>> GetModBuildsAsync(Guid projectId, ModBuildFilter? filter = null);
        Task<ModBuild> GetModBuildAsync(Guid buildId);

        // Mod SDK & API
        Task<ModSDK> CreateModSDKAsync(Guid organizationId, Guid userId, CreateModSDKRequest request);
        Task<List<ModSDK>> GetModSDKsAsync(Guid organizationId, ModSDKFilter? filter = null);
        Task<ModSDK> GetModSDKAsync(Guid sdkId);
        Task<ModSDK> UpdateModSDKAsync(Guid sdkId, Guid userId, UpdateModSDKRequest request);
        Task<bool> DeleteModSDKAsync(Guid sdkId, Guid userId);
        Task<ModAPI> CreateModAPIAsync(Guid sdkId, Guid userId, CreateModAPIRequest request);
        Task<List<ModAPI>> GetModAPIsAsync(Guid sdkId, ModAPIFilter? filter = null);
        Task<ModAPI> GetModAPIAsync(Guid apiId);
        Task<ModAPI> UpdateModAPIAsync(Guid apiId, Guid userId, UpdateModAPIRequest request);

        // Mod Marketplace
        Task<ModMarketplaceListing> CreateMarketplaceListingAsync(Guid modId, Guid userId, CreateMarketplaceListingRequest request);
        Task<List<ModMarketplaceListing>> GetMarketplaceListingsAsync(Guid organizationId, MarketplaceListingFilter? filter = null);
        Task<ModMarketplaceListing> GetMarketplaceListingAsync(Guid listingId);
        Task<ModMarketplaceListing> UpdateMarketplaceListingAsync(Guid listingId, Guid userId, UpdateMarketplaceListingRequest request);
        Task<bool> DeleteMarketplaceListingAsync(Guid listingId, Guid userId);
        Task<ModPurchase> PurchaseModAsync(Guid listingId, Guid userId, PurchaseModRequest request);
        Task<List<ModPurchase>> GetModPurchasesAsync(Guid organizationId, ModPurchaseFilter? filter = null);
        Task<ModReview> CreateModReviewAsync(Guid modId, Guid userId, CreateModReviewRequest request);
        Task<List<ModReview>> GetModReviewsAsync(Guid modId, ModReviewFilter? filter = null);

        // Mod Installation & Management
        Task<ModInstallation> InstallModAsync(Guid modId, Guid userId, InstallModRequest request);
        Task<List<ModInstallation>> GetModInstallationsAsync(Guid organizationId, ModInstallationFilter? filter = null);
        Task<ModInstallation> GetModInstallationAsync(Guid installationId);
        Task<ModInstallation> UpdateModInstallationAsync(Guid installationId, Guid userId, UpdateModInstallationRequest request);
        Task<bool> UninstallModAsync(Guid installationId, Guid userId);
        Task<ModConfiguration> ConfigureModAsync(Guid installationId, Guid userId, ConfigureModRequest request);
        Task<List<ModConfiguration>> GetModConfigurationsAsync(Guid installationId, ModConfigurationFilter? filter = null);
        Task<ModCompatibility> CheckModCompatibilityAsync(Guid modId, CheckModCompatibilityRequest request);

        // Mod Scripting Engine
        Task<ModScript> CreateModScriptAsync(Guid modId, Guid userId, CreateModScriptRequest request);
        Task<List<ModScript>> GetModScriptsAsync(Guid modId, ModScriptFilter? filter = null);
        Task<ModScript> GetModScriptAsync(Guid scriptId);
        Task<ModScript> UpdateModScriptAsync(Guid scriptId, Guid userId, UpdateModScriptRequest request);
        Task<bool> DeleteModScriptAsync(Guid scriptId, Guid userId);
        Task<ModScriptExecution> ExecuteModScriptAsync(Guid scriptId, Guid userId, ExecuteModScriptRequest request);
        Task<List<ModScriptExecution>> GetModScriptExecutionsAsync(Guid scriptId, ModScriptExecutionFilter? filter = null);
        Task<ModScriptDebugSession> StartScriptDebugSessionAsync(Guid scriptId, Guid userId, StartScriptDebugSessionRequest request);
        Task<List<ModScriptDebugSession>> GetScriptDebugSessionsAsync(Guid scriptId, ModScriptDebugSessionFilter? filter = null);

        // Mod Asset Management
        Task<ModAsset> CreateModAssetAsync(Guid modId, Guid userId, CreateModAssetRequest request);
        Task<List<ModAsset>> GetModAssetsAsync(Guid modId, ModAssetFilter? filter = null);
        Task<ModAsset> GetModAssetAsync(Guid assetId);
        Task<ModAsset> UpdateModAssetAsync(Guid assetId, Guid userId, UpdateModAssetRequest request);
        Task<bool> DeleteModAssetAsync(Guid assetId, Guid userId);
        Task<ModAssetPipeline> CreateAssetPipelineAsync(Guid modId, Guid userId, CreateAssetPipelineRequest request);
        Task<List<ModAssetPipeline>> GetAssetPipelinesAsync(Guid modId, ModAssetPipelineFilter? filter = null);
        Task<ModAssetPipelineExecution> RunAssetPipelineAsync(Guid pipelineId, Guid userId, RunAssetPipelineRequest request);

        // Mod Testing & Quality Assurance
        Task<ModTestSuite> CreateModTestSuiteAsync(Guid modId, Guid userId, CreateModTestSuiteRequest request);
        Task<List<ModTestSuite>> GetModTestSuitesAsync(Guid modId, ModTestSuiteFilter? filter = null);
        Task<ModTestSuite> GetModTestSuiteAsync(Guid testSuiteId);
        Task<ModTestSuite> UpdateModTestSuiteAsync(Guid testSuiteId, Guid userId, UpdateModTestSuiteRequest request);
        Task<bool> DeleteModTestSuiteAsync(Guid testSuiteId, Guid userId);
        Task<ModTestExecution> RunModTestSuiteAsync(Guid testSuiteId, Guid userId, RunModTestSuiteRequest request);
        Task<List<ModTestExecution>> GetModTestExecutionsAsync(Guid testSuiteId, ModTestExecutionFilter? filter = null);
        Task<ModTestResult> GetModTestResultAsync(Guid executionId);

        // Mod Security & Validation
        Task<ModSecurityScan> CreateModSecurityScanAsync(Guid modId, Guid userId, CreateModSecurityScanRequest request);
        Task<List<ModSecurityScan>> GetModSecurityScansAsync(Guid modId, ModSecurityScanFilter? filter = null);
        Task<ModSecurityScan> GetModSecurityScanAsync(Guid scanId);
        Task<ModValidation> ValidateModAsync(Guid modId, Guid userId, ValidateModRequest request);
        Task<List<ModValidation>> GetModValidationsAsync(Guid modId, ModValidationFilter? filter = null);
        Task<ModCertification> CertifyModAsync(Guid modId, Guid userId, CertifyModRequest request);
        Task<List<ModCertification>> GetModCertificationsAsync(Guid modId, ModCertificationFilter? filter = null);

        // Mod Distribution & Packaging
        Task<ModPackage> CreateModPackageAsync(Guid modId, Guid userId, CreateModPackageRequest request);
        Task<List<ModPackage>> GetModPackagesAsync(Guid modId, ModPackageFilter? filter = null);
        Task<ModPackage> GetModPackageAsync(Guid packageId);
        Task<ModPackage> UpdateModPackageAsync(Guid packageId, Guid userId, UpdateModPackageRequest request);
        Task<bool> DeleteModPackageAsync(Guid packageId, Guid userId);
        Task<ModDistribution> CreateModDistributionAsync(Guid packageId, Guid userId, CreateModDistributionRequest request);
        Task<List<ModDistribution>> GetModDistributionsAsync(Guid packageId, ModDistributionFilter? filter = null);
        Task<ModDistributionMetrics> GetModDistributionMetricsAsync(Guid distributionId, ModDistributionMetricsFilter filter);

        // Mod Version Control
        Task<ModRepository> CreateModRepositoryAsync(Guid modId, Guid userId, CreateModRepositoryRequest request);
        Task<List<ModRepository>> GetModRepositoriesAsync(Guid modId, ModRepositoryFilter? filter = null);
        Task<ModRepository> GetModRepositoryAsync(Guid repositoryId);
        Task<ModRepository> UpdateModRepositoryAsync(Guid repositoryId, Guid userId, UpdateModRepositoryRequest request);
        Task<bool> DeleteModRepositoryAsync(Guid repositoryId, Guid userId);
        Task<ModCommit> CreateModCommitAsync(Guid repositoryId, Guid userId, CreateModCommitRequest request);
        Task<List<ModCommit>> GetModCommitsAsync(Guid repositoryId, ModCommitFilter? filter = null);
        Task<ModCommit> GetModCommitAsync(Guid commitId);
        Task<ModBranch> CreateModBranchAsync(Guid repositoryId, Guid userId, CreateModBranchRequest request);
        Task<List<ModBranch>> GetModBranchesAsync(Guid repositoryId, ModBranchFilter? filter = null);

        // Mod Collaboration
        Task<ModCollaboration> CreateModCollaborationAsync(Guid modId, Guid userId, CreateModCollaborationRequest request);
        Task<List<ModCollaboration>> GetModCollaborationsAsync(Guid modId, ModCollaborationFilter? filter = null);
        Task<ModCollaboration> GetModCollaborationAsync(Guid collaborationId);
        Task<ModCollaboration> UpdateModCollaborationAsync(Guid collaborationId, Guid userId, UpdateModCollaborationRequest request);
        Task<bool> DeleteModCollaborationAsync(Guid collaborationId, Guid userId);
        Task<ModCollaborator> AddModCollaboratorAsync(Guid collaborationId, Guid userId, AddModCollaboratorRequest request);
        Task<List<ModCollaborator>> GetModCollaboratorsAsync(Guid collaborationId, ModCollaboratorFilter? filter = null);
        Task<bool> RemoveModCollaboratorAsync(Guid collaborationId, Guid collaboratorId, Guid userId);

        // Mod Analytics & Insights
        Task<ModAnalytics> GetModAnalyticsAsync(Guid modId, ModAnalyticsFilter filter);
        Task<List<ModMetric>> GetModMetricsAsync(Guid modId, ModMetricsFilter filter);
        Task<ModUsageReport> GenerateModUsageReportAsync(Guid modId, Guid userId, GenerateModUsageReportRequest request);
        Task<List<ModInsight>> GetModInsightsAsync(Guid modId, ModInsightFilter? filter = null);
        Task<ModPerformanceReport> GetModPerformanceReportAsync(Guid modId, ModPerformanceReportFilter filter);
        Task<List<ModTrend>> GetModTrendsAsync(Guid organizationId, ModTrendFilter filter);

        // Mod Community Features
        Task<ModCommunity> CreateModCommunityAsync(Guid modId, Guid userId, CreateModCommunityRequest request);
        Task<List<ModCommunity>> GetModCommunitiesAsync(Guid modId, ModCommunityFilter? filter = null);
        Task<ModCommunity> GetModCommunityAsync(Guid communityId);
        Task<ModCommunity> UpdateModCommunityAsync(Guid communityId, Guid userId, UpdateModCommunityRequest request);
        Task<bool> DeleteModCommunityAsync(Guid communityId, Guid userId);
        Task<ModForum> CreateModForumAsync(Guid communityId, Guid userId, CreateModForumRequest request);
        Task<List<ModForum>> GetModForumsAsync(Guid communityId, ModForumFilter? filter = null);
        Task<ModForumPost> CreateModForumPostAsync(Guid forumId, Guid userId, CreateModForumPostRequest request);
        Task<List<ModForumPost>> GetModForumPostsAsync(Guid forumId, ModForumPostFilter? filter = null);

        // Mod Documentation
        Task<ModDocumentation> CreateModDocumentationAsync(Guid modId, Guid userId, CreateModDocumentationRequest request);
        Task<List<ModDocumentation>> GetModDocumentationAsync(Guid modId, ModDocumentationFilter? filter = null);
        Task<ModDocumentation> GetModDocumentationAsync(Guid documentationId);
        Task<ModDocumentation> UpdateModDocumentationAsync(Guid documentationId, Guid userId, UpdateModDocumentationRequest request);
        Task<bool> DeleteModDocumentationAsync(Guid documentationId, Guid userId);
        Task<ModTutorial> CreateModTutorialAsync(Guid modId, Guid userId, CreateModTutorialRequest request);
        Task<List<ModTutorial>> GetModTutorialsAsync(Guid modId, ModTutorialFilter? filter = null);
        Task<ModTutorial> GetModTutorialAsync(Guid tutorialId);
        Task<ModTutorial> UpdateModTutorialAsync(Guid tutorialId, Guid userId, UpdateModTutorialRequest request);

        // Mod Licensing & Legal
        Task<ModLicense> CreateModLicenseAsync(Guid modId, Guid userId, CreateModLicenseRequest request);
        Task<List<ModLicense>> GetModLicensesAsync(Guid modId, ModLicenseFilter? filter = null);
        Task<ModLicense> GetModLicenseAsync(Guid licenseId);
        Task<ModLicense> UpdateModLicenseAsync(Guid licenseId, Guid userId, UpdateModLicenseRequest request);
        Task<bool> DeleteModLicenseAsync(Guid licenseId, Guid userId);
        Task<ModLegalCompliance> CheckModLegalComplianceAsync(Guid modId, Guid userId, CheckModLegalComplianceRequest request);
        Task<List<ModLegalCompliance>> GetModLegalCompliancesAsync(Guid modId, ModLegalComplianceFilter? filter = null);

        // Mod Monetization
        Task<ModMonetization> CreateModMonetizationAsync(Guid modId, Guid userId, CreateModMonetizationRequest request);
        Task<List<ModMonetization>> GetModMonetizationsAsync(Guid modId, ModMonetizationFilter? filter = null);
        Task<ModMonetization> GetModMonetizationAsync(Guid monetizationId);
        Task<ModMonetization> UpdateModMonetizationAsync(Guid monetizationId, Guid userId, UpdateModMonetizationRequest request);
        Task<bool> DeleteModMonetizationAsync(Guid monetizationId, Guid userId);
        Task<ModRevenue> GetModRevenueAsync(Guid modId, ModRevenueFilter filter);
        Task<List<ModPayout>> GetModPayoutsAsync(Guid modId, ModPayoutFilter? filter = null);
        Task<ModPayout> CreateModPayoutAsync(Guid modId, Guid userId, CreateModPayoutRequest request);

        // Mod Localization
        Task<ModLocalization> CreateModLocalizationAsync(Guid modId, Guid userId, CreateModLocalizationRequest request);
        Task<List<ModLocalization>> GetModLocalizationsAsync(Guid modId, ModLocalizationFilter? filter = null);
        Task<ModLocalization> GetModLocalizationAsync(Guid localizationId);
        Task<ModLocalization> UpdateModLocalizationAsync(Guid localizationId, Guid userId, UpdateModLocalizationRequest request);
        Task<bool> DeleteModLocalizationAsync(Guid localizationId, Guid userId);
        Task<ModTranslation> CreateModTranslationAsync(Guid localizationId, Guid userId, CreateModTranslationRequest request);
        Task<List<ModTranslation>> GetModTranslationsAsync(Guid localizationId, ModTranslationFilter? filter = null);
        Task<ModTranslation> UpdateModTranslationAsync(Guid translationId, Guid userId, UpdateModTranslationRequest request);

        // Mod Backup & Recovery
        Task<ModBackup> CreateModBackupAsync(Guid modId, Guid userId, CreateModBackupRequest request);
        Task<List<ModBackup>> GetModBackupsAsync(Guid modId, ModBackupFilter? filter = null);
        Task<ModBackup> GetModBackupAsync(Guid backupId);
        Task<ModBackup> UpdateModBackupAsync(Guid backupId, Guid userId, UpdateModBackupRequest request);
        Task<bool> DeleteModBackupAsync(Guid backupId, Guid userId);
        Task<ModRestore> RestoreModFromBackupAsync(Guid backupId, Guid userId, RestoreModFromBackupRequest request);
        Task<List<ModRestore>> GetModRestoresAsync(Guid modId, ModRestoreFilter? filter = null);
        Task<ModRestore> GetModRestoreAsync(Guid restoreId);

        // Mod Performance & Optimization
        Task<ModPerformanceProfile> CreateModPerformanceProfileAsync(Guid modId, Guid userId, CreateModPerformanceProfileRequest request);
        Task<List<ModPerformanceProfile>> GetModPerformanceProfilesAsync(Guid modId, ModPerformanceProfileFilter? filter = null);
        Task<ModPerformanceProfile> GetModPerformanceProfileAsync(Guid profileId);
        Task<ModPerformanceProfile> UpdateModPerformanceProfileAsync(Guid profileId, Guid userId, UpdateModPerformanceProfileRequest request);
        Task<bool> DeleteModPerformanceProfileAsync(Guid profileId, Guid userId);
        Task<ModOptimization> OptimizeModAsync(Guid modId, Guid userId, OptimizeModRequest request);
        Task<List<ModOptimization>> GetModOptimizationsAsync(Guid modId, ModOptimizationFilter? filter = null);
        Task<ModOptimization> GetModOptimizationAsync(Guid optimizationId);

        // Mod Integration & Hooks
        Task<ModIntegration> CreateModIntegrationAsync(Guid modId, Guid userId, CreateModIntegrationRequest request);
        Task<List<ModIntegration>> GetModIntegrationsAsync(Guid modId, ModIntegrationFilter? filter = null);
        Task<ModIntegration> GetModIntegrationAsync(Guid integrationId);
        Task<ModIntegration> UpdateModIntegrationAsync(Guid integrationId, Guid userId, UpdateModIntegrationRequest request);
        Task<bool> DeleteModIntegrationAsync(Guid integrationId, Guid userId);
        Task<ModHook> CreateModHookAsync(Guid integrationId, Guid userId, CreateModHookRequest request);
        Task<List<ModHook>> GetModHooksAsync(Guid integrationId, ModHookFilter? filter = null);
        Task<ModHook> GetModHookAsync(Guid hookId);
        Task<ModHook> UpdateModHookAsync(Guid hookId, Guid userId, UpdateModHookRequest request);

        // Mod Workflow & Automation
        Task<ModWorkflow> CreateModWorkflowAsync(Guid modId, Guid userId, CreateModWorkflowRequest request);
        Task<List<ModWorkflow>> GetModWorkflowsAsync(Guid modId, ModWorkflowFilter? filter = null);
        Task<ModWorkflow> GetModWorkflowAsync(Guid workflowId);
        Task<ModWorkflow> UpdateModWorkflowAsync(Guid workflowId, Guid userId, UpdateModWorkflowRequest request);
        Task<bool> DeleteModWorkflowAsync(Guid workflowId, Guid userId);
        Task<ModWorkflowExecution> RunModWorkflowAsync(Guid workflowId, Guid userId, RunModWorkflowRequest request);
        Task<List<ModWorkflowExecution>> GetModWorkflowExecutionsAsync(Guid workflowId, ModWorkflowExecutionFilter? filter = null);
        Task<ModWorkflowExecution> GetModWorkflowExecutionAsync(Guid executionId);

        // Mod Templates & Scaffolding
        Task<ModTemplate> CreateModTemplateAsync(Guid organizationId, Guid userId, CreateModTemplateRequest request);
        Task<List<ModTemplate>> GetModTemplatesAsync(Guid organizationId, ModTemplateFilter? filter = null);
        Task<ModTemplate> GetModTemplateAsync(Guid templateId);
        Task<ModTemplate> UpdateModTemplateAsync(Guid templateId, Guid userId, UpdateModTemplateRequest request);
        Task<bool> DeleteModTemplateAsync(Guid templateId, Guid userId);
        Task<ModProject> CreateModFromTemplateAsync(Guid templateId, Guid userId, CreateModFromTemplateRequest request);
        Task<ModScaffold> GenerateModScaffoldAsync(Guid templateId, Guid userId, GenerateModScaffoldRequest request);
        Task<List<ModScaffold>> GetModScaffoldsAsync(Guid templateId, ModScaffoldFilter? filter = null);
    }
}