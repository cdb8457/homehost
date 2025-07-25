using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IEnterpriseAdminService
    {
        // Organization Management
        Task<Organization> CreateOrganizationAsync(Guid creatorId, CreateOrganizationRequest request);
        Task<List<Organization>> GetOrganizationsAsync(OrganizationFilter? filter = null);
        Task<Organization> GetOrganizationAsync(Guid organizationId);
        Task<Organization> UpdateOrganizationAsync(Guid organizationId, Guid userId, UpdateOrganizationRequest request);
        Task<bool> DeleteOrganizationAsync(Guid organizationId, Guid userId);
        Task<List<Organization>> GetUserOrganizationsAsync(Guid userId);
        Task<bool> TransferOrganizationOwnershipAsync(Guid organizationId, Guid currentOwnerId, Guid newOwnerId);

        // Organization Members
        Task<OrganizationMember> AddOrganizationMemberAsync(Guid organizationId, Guid userId, AddOrganizationMemberRequest request);
        Task<List<OrganizationMember>> GetOrganizationMembersAsync(Guid organizationId, OrganizationMemberFilter? filter = null);
        Task<OrganizationMember> GetOrganizationMemberAsync(Guid organizationId, Guid userId);
        Task<OrganizationMember> UpdateOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId, UpdateOrganizationMemberRequest request);
        Task<bool> RemoveOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId);
        Task<bool> SuspendOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId, SuspendMemberRequest request);
        Task<bool> ReactivateOrganizationMemberAsync(Guid organizationId, Guid memberId, Guid userId);

        // Organization Invitations
        Task<OrganizationInvitation> CreateOrganizationInvitationAsync(Guid organizationId, Guid userId, CreateOrganizationInvitationRequest request);
        Task<List<OrganizationInvitation>> GetOrganizationInvitationsAsync(Guid organizationId, InvitationFilter? filter = null);
        Task<OrganizationInvitation> GetOrganizationInvitationAsync(Guid invitationId);
        Task<bool> AcceptOrganizationInvitationAsync(Guid invitationId, Guid userId);
        Task<bool> DeclineOrganizationInvitationAsync(Guid invitationId, Guid userId, DeclineInvitationRequest request);
        Task<bool> CancelOrganizationInvitationAsync(Guid invitationId, Guid userId);
        Task<bool> ResendOrganizationInvitationAsync(Guid invitationId, Guid userId);

        // Role Management
        Task<Role> CreateRoleAsync(Guid organizationId, Guid userId, CreateRoleRequest request);
        Task<List<Role>> GetRolesAsync(Guid organizationId, RoleFilter? filter = null);
        Task<Role> GetRoleAsync(Guid roleId);
        Task<Role> UpdateRoleAsync(Guid roleId, Guid userId, UpdateRoleRequest request);
        Task<bool> DeleteRoleAsync(Guid roleId, Guid userId);
        Task<bool> AssignRoleToUserAsync(Guid roleId, Guid userId, Guid assignedBy);
        Task<bool> RemoveRoleFromUserAsync(Guid roleId, Guid userId, Guid removedBy);
        Task<List<Role>> GetUserRolesAsync(Guid userId, Guid organizationId);

        // Permission Management
        Task<Permission> CreatePermissionAsync(Guid organizationId, Guid userId, CreatePermissionRequest request);
        Task<List<Permission>> GetPermissionsAsync(Guid organizationId, PermissionFilter? filter = null);
        Task<Permission> GetPermissionAsync(Guid permissionId);
        Task<Permission> UpdatePermissionAsync(Guid permissionId, Guid userId, UpdatePermissionRequest request);
        Task<bool> DeletePermissionAsync(Guid permissionId, Guid userId);
        Task<bool> AssignPermissionToRoleAsync(Guid permissionId, Guid roleId, Guid userId);
        Task<bool> RemovePermissionFromRoleAsync(Guid permissionId, Guid roleId, Guid userId);
        Task<List<Permission>> GetRolePermissionsAsync(Guid roleId);
        Task<List<Permission>> GetUserPermissionsAsync(Guid userId, Guid organizationId);
        Task<bool> CheckUserPermissionAsync(Guid userId, Guid organizationId, string permissionName);

        // Audit Logging
        Task<AuditLog> CreateAuditLogAsync(CreateAuditLogRequest request);
        Task<List<AuditLog>> GetAuditLogsAsync(AuditLogFilter? filter = null);
        Task<AuditLog> GetAuditLogAsync(Guid auditLogId);
        Task<List<AuditLog>> GetUserAuditLogsAsync(Guid userId, UserAuditLogFilter? filter = null);
        Task<List<AuditLog>> GetOrganizationAuditLogsAsync(Guid organizationId, OrganizationAuditLogFilter? filter = null);
        Task<List<AuditLog>> GetResourceAuditLogsAsync(string resourceType, Guid resourceId, ResourceAuditLogFilter? filter = null);
        Task<AuditReport> GenerateAuditReportAsync(AuditReportRequest request);
        Task<bool> ExportAuditLogsAsync(ExportAuditLogsRequest request);

        // Security Compliance
        Task<ComplianceCheck> RunComplianceCheckAsync(Guid organizationId, ComplianceCheckRequest request);
        Task<List<ComplianceCheck>> GetComplianceChecksAsync(Guid organizationId, ComplianceCheckFilter? filter = null);
        Task<ComplianceCheck> GetComplianceCheckAsync(Guid checkId);
        Task<ComplianceReport> GenerateComplianceReportAsync(Guid organizationId, ComplianceReportRequest request);
        Task<List<ComplianceIssue>> GetComplianceIssuesAsync(Guid organizationId, ComplianceIssueFilter? filter = null);
        Task<bool> ResolveComplianceIssueAsync(Guid issueId, Guid userId, ResolveComplianceIssueRequest request);
        Task<ComplianceScore> GetComplianceScoreAsync(Guid organizationId);

        // Security Policies
        Task<SecurityPolicy> CreateSecurityPolicyAsync(Guid organizationId, Guid userId, CreateSecurityPolicyRequest request);
        Task<List<SecurityPolicy>> GetSecurityPoliciesAsync(Guid organizationId, SecurityPolicyFilter? filter = null);
        Task<SecurityPolicy> GetSecurityPolicyAsync(Guid policyId);
        Task<SecurityPolicy> UpdateSecurityPolicyAsync(Guid policyId, Guid userId, UpdateSecurityPolicyRequest request);
        Task<bool> DeleteSecurityPolicyAsync(Guid policyId, Guid userId);
        Task<bool> EnforceSecurityPolicyAsync(Guid policyId, Guid userId);
        Task<List<SecurityViolation>> GetSecurityViolationsAsync(Guid organizationId, SecurityViolationFilter? filter = null);

        // Authentication & SSO
        Task<SsoConfiguration> CreateSsoConfigurationAsync(Guid organizationId, Guid userId, CreateSsoConfigurationRequest request);
        Task<List<SsoConfiguration>> GetSsoConfigurationsAsync(Guid organizationId);
        Task<SsoConfiguration> GetSsoConfigurationAsync(Guid configId);
        Task<SsoConfiguration> UpdateSsoConfigurationAsync(Guid configId, Guid userId, UpdateSsoConfigurationRequest request);
        Task<bool> DeleteSsoConfigurationAsync(Guid configId, Guid userId);
        Task<bool> TestSsoConfigurationAsync(Guid configId, Guid userId);
        Task<SsoSession> InitiateSsoLoginAsync(Guid organizationId, SsoLoginRequest request);
        Task<SsoSession> CompleteSsoLoginAsync(Guid sessionId, CompleteSsoLoginRequest request);

        // Multi-Factor Authentication
        Task<MfaConfiguration> CreateMfaConfigurationAsync(Guid organizationId, Guid userId, CreateMfaConfigurationRequest request);
        Task<MfaConfiguration> GetMfaConfigurationAsync(Guid organizationId);
        Task<MfaConfiguration> UpdateMfaConfigurationAsync(Guid organizationId, Guid userId, UpdateMfaConfigurationRequest request);
        Task<bool> EnforceMfaForOrganizationAsync(Guid organizationId, Guid userId);
        Task<MfaToken> GenerateMfaTokenAsync(Guid userId, GenerateMfaTokenRequest request);
        Task<bool> VerifyMfaTokenAsync(Guid userId, VerifyMfaTokenRequest request);
        Task<List<MfaDevice>> GetUserMfaDevicesAsync(Guid userId);
        Task<MfaDevice> RegisterMfaDeviceAsync(Guid userId, RegisterMfaDeviceRequest request);
        Task<bool> RemoveMfaDeviceAsync(Guid deviceId, Guid userId);

        // Session Management
        Task<UserSession> CreateUserSessionAsync(Guid userId, CreateUserSessionRequest request);
        Task<List<UserSession>> GetUserSessionsAsync(Guid userId, UserSessionFilter? filter = null);
        Task<UserSession> GetUserSessionAsync(Guid sessionId);
        Task<bool> InvalidateUserSessionAsync(Guid sessionId, Guid userId);
        Task<bool> InvalidateAllUserSessionsAsync(Guid userId);
        Task<List<UserSession>> GetOrganizationSessionsAsync(Guid organizationId, OrganizationSessionFilter? filter = null);
        Task<bool> InvalidateOrganizationSessionsAsync(Guid organizationId, Guid userId);
        Task<SessionAnalytics> GetSessionAnalyticsAsync(Guid organizationId, SessionAnalyticsFilter filter);

        // Data Privacy & GDPR
        Task<DataPrivacySettings> GetDataPrivacySettingsAsync(Guid organizationId);
        Task<DataPrivacySettings> UpdateDataPrivacySettingsAsync(Guid organizationId, Guid userId, UpdateDataPrivacySettingsRequest request);
        Task<List<DataProcessingActivity>> GetDataProcessingActivitiesAsync(Guid organizationId);
        Task<DataProcessingActivity> CreateDataProcessingActivityAsync(Guid organizationId, Guid userId, CreateDataProcessingActivityRequest request);
        Task<DataExportRequest> RequestDataExportAsync(Guid userId, RequestDataExportRequest request);
        Task<List<DataExportRequest>> GetDataExportRequestsAsync(Guid organizationId, DataExportRequestFilter? filter = null);
        Task<bool> ProcessDataExportRequestAsync(Guid requestId, Guid userId);
        Task<DataDeletionRequest> RequestDataDeletionAsync(Guid userId, RequestDataDeletionRequest request);
        Task<List<DataDeletionRequest>> GetDataDeletionRequestsAsync(Guid organizationId, DataDeletionRequestFilter? filter = null);
        Task<bool> ProcessDataDeletionRequestAsync(Guid requestId, Guid userId);

        // Security Monitoring
        Task<SecurityEvent> CreateSecurityEventAsync(CreateSecurityEventRequest request);
        Task<List<SecurityEvent>> GetSecurityEventsAsync(SecurityEventFilter? filter = null);
        Task<SecurityEvent> GetSecurityEventAsync(Guid eventId);
        Task<List<SecurityThreat>> GetSecurityThreatsAsync(Guid organizationId, SecurityThreatFilter? filter = null);
        Task<SecurityThreat> GetSecurityThreatAsync(Guid threatId);
        Task<bool> MitigateSecurityThreatAsync(Guid threatId, Guid userId, MitigateSecurityThreatRequest request);
        Task<SecurityDashboard> GetSecurityDashboardAsync(Guid organizationId);
        Task<List<SecurityAlert>> GetSecurityAlertsAsync(Guid organizationId, SecurityAlertFilter? filter = null);
        Task<bool> AcknowledgeSecurityAlertAsync(Guid alertId, Guid userId);

        // API Keys & Access Tokens
        Task<ApiKey> CreateApiKeyAsync(Guid organizationId, Guid userId, CreateApiKeyRequest request);
        Task<List<ApiKey>> GetApiKeysAsync(Guid organizationId, ApiKeyFilter? filter = null);
        Task<ApiKey> GetApiKeyAsync(Guid keyId);
        Task<ApiKey> UpdateApiKeyAsync(Guid keyId, Guid userId, UpdateApiKeyRequest request);
        Task<bool> RevokeApiKeyAsync(Guid keyId, Guid userId);
        Task<bool> RegenerateApiKeyAsync(Guid keyId, Guid userId);
        Task<ApiKeyUsage> GetApiKeyUsageAsync(Guid keyId, ApiKeyUsageFilter filter);
        Task<List<ApiKeyUsage>> GetOrganizationApiUsageAsync(Guid organizationId, OrganizationApiUsageFilter filter);

        // Backup & Recovery
        Task<OrganizationBackup> CreateOrganizationBackupAsync(Guid organizationId, Guid userId, CreateOrganizationBackupRequest request);
        Task<List<OrganizationBackup>> GetOrganizationBackupsAsync(Guid organizationId, OrganizationBackupFilter? filter = null);
        Task<OrganizationBackup> GetOrganizationBackupAsync(Guid backupId);
        Task<bool> RestoreOrganizationBackupAsync(Guid backupId, Guid userId, RestoreOrganizationBackupRequest request);
        Task<bool> DeleteOrganizationBackupAsync(Guid backupId, Guid userId);
        Task<BackupPolicy> CreateBackupPolicyAsync(Guid organizationId, Guid userId, CreateBackupPolicyRequest request);
        Task<List<BackupPolicy>> GetBackupPoliciesAsync(Guid organizationId);
        Task<BackupPolicy> UpdateBackupPolicyAsync(Guid policyId, Guid userId, UpdateBackupPolicyRequest request);
    }

    // Data Models
    public class Organization
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid OwnerId { get; set; }
        public string Status { get; set; } = "Active";
        public OrganizationSettings Settings { get; set; } = new();
        public OrganizationLimits Limits { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public OrganizationMetadata Metadata { get; set; } = new();

        // Navigation properties
        public User? Owner { get; set; }
        public List<OrganizationMember> Members { get; set; } = new();
        public List<Role> Roles { get; set; } = new();
        public List<Permission> Permissions { get; set; } = new();
        public List<SecurityPolicy> SecurityPolicies { get; set; } = new();
    }

    public class OrganizationSettings
    {
        public bool RequireMfa { get; set; } = false;
        public bool RequireSso { get; set; } = false;
        public bool AllowGuestAccess { get; set; } = true;
        public int SessionTimeoutMinutes { get; set; } = 480;
        public int MaxActiveSessionsPerUser { get; set; } = 5;
        public bool EnableAuditLogging { get; set; } = true;
        public bool EnableComplianceChecks { get; set; } = false;
        public Dictionary<string, object> CustomSettings { get; set; } = new();
    }

    public class OrganizationLimits
    {
        public int MaxMembers { get; set; } = 100;
        public int MaxRoles { get; set; } = 20;
        public int MaxPermissions { get; set; } = 200;
        public int MaxApiKeys { get; set; } = 50;
        public int MaxBackups { get; set; } = 10;
        public Dictionary<string, object> CustomLimits { get; set; } = new();
    }

    public class OrganizationMetadata
    {
        public string Industry { get; set; } = string.Empty;
        public string CompanySize { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string TimeZone { get; set; } = "UTC";
        public string? LogoUrl { get; set; }
        public string? WebsiteUrl { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class OrganizationMember
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid UserId { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime JoinedAt { get; set; }
        public DateTime? SuspendedAt { get; set; }
        public string? SuspensionReason { get; set; }
        public DateTime? LastActiveAt { get; set; }
        public List<Guid> RoleIds { get; set; } = new();
        public MemberMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public User? User { get; set; }
        public List<Role> Roles { get; set; } = new();
    }

    public class MemberMetadata
    {
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public string? ManagerId { get; set; }
        public DateTime? StartDate { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class OrganizationInvitation
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid InvitedById { get; set; }
        public string Email { get; set; } = string.Empty;
        public List<Guid> RoleIds { get; set; } = new();
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? DeclinedAt { get; set; }
        public string? DeclineReason { get; set; }
        public string? Message { get; set; }
        public InvitationMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public User? InvitedBy { get; set; }
    }

    public class InvitationMetadata
    {
        public string Department { get; set; } = string.Empty;
        public string JobTitle { get; set; } = string.Empty;
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class Role
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = "Custom";
        public bool IsSystemRole { get; set; } = false;
        public List<Guid> PermissionIds { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public RoleMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public List<Permission> Permissions { get; set; } = new();
        public List<OrganizationMember> Members { get; set; } = new();
    }

    public class RoleMetadata
    {
        public string Category { get; set; } = string.Empty;
        public int Priority { get; set; } = 0;
        public string? Color { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class Permission
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Scope { get; set; } = "Organization";
        public bool IsSystemPermission { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public PermissionMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public List<Role> Roles { get; set; } = new();
    }

    public class PermissionMetadata
    {
        public string Category { get; set; } = string.Empty;
        public string SubCategory { get; set; } = string.Empty;
        public bool IsHighRisk { get; set; } = false;
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class AuditLog
    {
        public Guid Id { get; set; }
        public Guid? OrganizationId { get; set; }
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public Guid? ResourceId { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string Result { get; set; } = "Success";
        public string? ErrorMessage { get; set; }
        public AuditMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public User? User { get; set; }
    }

    public class AuditMetadata
    {
        public Dictionary<string, object> Changes { get; set; } = new();
        public Dictionary<string, object> OldValues { get; set; } = new();
        public Dictionary<string, object> NewValues { get; set; } = new();
        public string SessionId { get; set; } = string.Empty;
        public string RequestId { get; set; } = string.Empty;
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class ComplianceCheck
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Standard { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public ComplianceResult Result { get; set; } = new();
        public List<ComplianceIssue> Issues { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
    }

    public class ComplianceResult
    {
        public int TotalChecks { get; set; }
        public int PassedChecks { get; set; }
        public int FailedChecks { get; set; }
        public int SkippedChecks { get; set; }
        public decimal ComplianceScore { get; set; }
        public string Grade { get; set; } = string.Empty;
        public Dictionary<string, object> Details { get; set; } = new();
    }

    public class ComplianceIssue
    {
        public Guid Id { get; set; }
        public Guid ComplianceCheckId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Resolution { get; set; } = string.Empty;
        public string Status { get; set; } = "Open";
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public Guid? ResolvedById { get; set; }
        public string? ResolvedByName { get; set; }

        // Navigation properties
        public ComplianceCheck? ComplianceCheck { get; set; }
    }

    public class ComplianceScore
    {
        public Guid OrganizationId { get; set; }
        public decimal OverallScore { get; set; }
        public Dictionary<string, decimal> CategoryScores { get; set; } = new();
        public List<ComplianceRecommendation> Recommendations { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class ComplianceRecommendation
    {
        public string Category { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Impact { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
    }

    public class SecurityPolicy
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public PolicyConfiguration Configuration { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastEnforcedAt { get; set; }

        // Navigation properties
        public Organization? Organization { get; set; }
        public List<SecurityViolation> Violations { get; set; } = new();
    }

    public class PolicyConfiguration
    {
        public Dictionary<string, object> Rules { get; set; } = new();
        public Dictionary<string, object> Parameters { get; set; } = new();
        public List<string> Exceptions { get; set; } = new();
        public string EnforcementMode { get; set; } = "Warn";
    }

    public class SecurityViolation
    {
        public Guid Id { get; set; }
        public Guid SecurityPolicyId { get; set; }
        public Guid? UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DetectedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public string Status { get; set; } = "Open";
        public ViolationMetadata Metadata { get; set; } = new();

        // Navigation properties
        public SecurityPolicy? SecurityPolicy { get; set; }
        public User? User { get; set; }
    }

    public class ViolationMetadata
    {
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public Dictionary<string, object> Context { get; set; } = new();
    }

    public class SsoConfiguration
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string Protocol { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public SsoSettings Settings { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastTestedAt { get; set; }

        // Navigation properties
        public Organization? Organization { get; set; }
    }

    public class SsoSettings
    {
        public string EntityId { get; set; } = string.Empty;
        public string SignOnUrl { get; set; } = string.Empty;
        public string SignOutUrl { get; set; } = string.Empty;
        public string Certificate { get; set; } = string.Empty;
        public Dictionary<string, string> AttributeMapping { get; set; } = new();
        public Dictionary<string, object> ProviderSettings { get; set; } = new();
    }

    public class SsoSession
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid SsoConfigurationId { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? ErrorMessage { get; set; }
        public SsoSessionMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public SsoConfiguration? SsoConfiguration { get; set; }
    }

    public class SsoSessionMetadata
    {
        public string RelayState { get; set; } = string.Empty;
        public string SamlResponse { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public Dictionary<string, object> Attributes { get; set; } = new();
    }

    public class MfaConfiguration
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public bool IsEnabled { get; set; } = false;
        public bool IsRequired { get; set; } = false;
        public List<string> AllowedMethods { get; set; } = new();
        public MfaSettings Settings { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public Organization? Organization { get; set; }
    }

    public class MfaSettings
    {
        public int TokenValidityMinutes { get; set; } = 5;
        public int MaxRetryAttempts { get; set; } = 3;
        public int BackupCodeCount { get; set; } = 10;
        public Dictionary<string, object> MethodSettings { get; set; } = new();
    }

    public class MfaToken
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Method { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsUsed { get; set; } = false;
        public DateTime CreatedAt { get; set; }
        public DateTime? UsedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
    }

    public class MfaDevice
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Secret { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
        public DeviceMetadata Metadata { get; set; } = new();

        // Navigation properties
        public User? User { get; set; }
    }

    public class DeviceMetadata
    {
        public string Platform { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class SecurityEvent
    {
        public Guid Id { get; set; }
        public Guid? OrganizationId { get; set; }
        public Guid? UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DetectedAt { get; set; }
        public string Status { get; set; } = "Open";
        public SecurityEventMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public User? User { get; set; }
    }

    public class SecurityEventMetadata
    {
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public Dictionary<string, object> Context { get; set; } = new();
        public List<string> Indicators { get; set; } = new();
    }

    public class SecurityThreat
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime DetectedAt { get; set; }
        public DateTime? MitigatedAt { get; set; }
        public string Status { get; set; } = "Open";
        public ThreatMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
    }

    public class ThreatMetadata
    {
        public string Source { get; set; } = string.Empty;
        public decimal RiskScore { get; set; }
        public List<string> Indicators { get; set; } = new();
        public Dictionary<string, object> Context { get; set; } = new();
    }

    public class ApiKey
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public Guid CreatedById { get; set; }
        public string Name { get; set; } = string.Empty;
        public string KeyHash { get; set; } = string.Empty;
        public string Prefix { get; set; } = string.Empty;
        public List<string> Scopes { get; set; } = new();
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? LastUsedAt { get; set; }
        public ApiKeyMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
        public User? CreatedBy { get; set; }
    }

    public class ApiKeyMetadata
    {
        public string Environment { get; set; } = string.Empty;
        public List<string> AllowedIps { get; set; } = new();
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class ApiKeyUsage
    {
        public Guid Id { get; set; }
        public Guid ApiKeyId { get; set; }
        public string Endpoint { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
        public int StatusCode { get; set; }
        public DateTime Timestamp { get; set; }
        public UsageMetadata Metadata { get; set; } = new();

        // Navigation properties
        public ApiKey? ApiKey { get; set; }
    }

    public class UsageMetadata
    {
        public long ResponseTime { get; set; }
        public long RequestSize { get; set; }
        public long ResponseSize { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class OrganizationBackup
    {
        public Guid Id { get; set; }
        public Guid OrganizationId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public long SizeBytes { get; set; }
        public string StoragePath { get; set; } = string.Empty;
        public BackupMetadata Metadata { get; set; } = new();

        // Navigation properties
        public Organization? Organization { get; set; }
    }

    public class BackupMetadata
    {
        public string Compression { get; set; } = string.Empty;
        public string Encryption { get; set; } = string.Empty;
        public List<string> IncludedResources { get; set; } = new();
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    // Request DTOs
    public class CreateOrganizationRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public OrganizationSettings Settings { get; set; } = new();
        public OrganizationMetadata Metadata { get; set; } = new();
    }

    public class UpdateOrganizationRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public OrganizationSettings? Settings { get; set; }
        public OrganizationMetadata? Metadata { get; set; }
    }

    public class AddOrganizationMemberRequest
    {
        public Guid UserId { get; set; }
        public List<Guid> RoleIds { get; set; } = new();
        public MemberMetadata Metadata { get; set; } = new();
    }

    public class UpdateOrganizationMemberRequest
    {
        public List<Guid>? RoleIds { get; set; }
        public MemberMetadata? Metadata { get; set; }
    }

    public class SuspendMemberRequest
    {
        public string Reason { get; set; } = string.Empty;
        public DateTime? ReactivateAt { get; set; }
    }

    public class CreateOrganizationInvitationRequest
    {
        public string Email { get; set; } = string.Empty;
        public List<Guid> RoleIds { get; set; } = new();
        public string? Message { get; set; }
        public InvitationMetadata Metadata { get; set; } = new();
    }

    public class DeclineInvitationRequest
    {
        public string Reason { get; set; } = string.Empty;
    }

    public class CreateRoleRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<Guid> PermissionIds { get; set; } = new();
        public RoleMetadata Metadata { get; set; } = new();
    }

    public class UpdateRoleRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public List<Guid>? PermissionIds { get; set; }
        public RoleMetadata? Metadata { get; set; }
    }

    public class CreatePermissionRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string Scope { get; set; } = "Organization";
        public PermissionMetadata Metadata { get; set; } = new();
    }

    public class UpdatePermissionRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Resource { get; set; }
        public string? Action { get; set; }
        public string? Scope { get; set; }
        public PermissionMetadata? Metadata { get; set; }
    }

    public class CreateAuditLogRequest
    {
        public Guid? OrganizationId { get; set; }
        public Guid? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Resource { get; set; } = string.Empty;
        public Guid? ResourceId { get; set; }
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string Result { get; set; } = "Success";
        public string? ErrorMessage { get; set; }
        public AuditMetadata Metadata { get; set; } = new();
    }

    public class ComplianceCheckRequest
    {
        public string Type { get; set; } = string.Empty;
        public string Standard { get; set; } = string.Empty;
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    public class CreateSecurityPolicyRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public PolicyConfiguration Configuration { get; set; } = new();
    }

    public class UpdateSecurityPolicyRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? IsEnabled { get; set; }
        public PolicyConfiguration? Configuration { get; set; }
    }

    public class CreateSsoConfigurationRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string Protocol { get; set; } = string.Empty;
        public SsoSettings Settings { get; set; } = new();
    }

    public class UpdateSsoConfigurationRequest
    {
        public string? Name { get; set; }
        public bool? IsEnabled { get; set; }
        public SsoSettings? Settings { get; set; }
    }

    public class CreateMfaConfigurationRequest
    {
        public bool IsEnabled { get; set; } = false;
        public bool IsRequired { get; set; } = false;
        public List<string> AllowedMethods { get; set; } = new();
        public MfaSettings Settings { get; set; } = new();
    }

    public class UpdateMfaConfigurationRequest
    {
        public bool? IsEnabled { get; set; }
        public bool? IsRequired { get; set; }
        public List<string>? AllowedMethods { get; set; }
        public MfaSettings? Settings { get; set; }
    }

    public class CreateApiKeyRequest
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Scopes { get; set; } = new();
        public DateTime? ExpiresAt { get; set; }
        public ApiKeyMetadata Metadata { get; set; } = new();
    }

    public class UpdateApiKeyRequest
    {
        public string? Name { get; set; }
        public List<string>? Scopes { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public ApiKeyMetadata? Metadata { get; set; }
    }

    public class CreateOrganizationBackupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public List<string> IncludedResources { get; set; } = new();
        public BackupMetadata Metadata { get; set; } = new();
    }

    // Response DTOs
    public class AuditReport
    {
        public Guid OrganizationId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalEvents { get; set; }
        public Dictionary<string, int> EventsByAction { get; set; } = new();
        public Dictionary<string, int> EventsByUser { get; set; } = new();
        public Dictionary<string, int> EventsByResource { get; set; } = new();
        public List<AuditLog> CriticalEvents { get; set; } = new();
    }

    public class ComplianceReport
    {
        public Guid OrganizationId { get; set; }
        public string Standard { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public ComplianceResult Result { get; set; } = new();
        public List<ComplianceIssue> Issues { get; set; } = new();
        public List<ComplianceRecommendation> Recommendations { get; set; } = new();
    }

    public class SecurityDashboard
    {
        public Guid OrganizationId { get; set; }
        public int TotalEvents { get; set; }
        public int CriticalEvents { get; set; }
        public int OpenThreats { get; set; }
        public int ActiveSessions { get; set; }
        public decimal ComplianceScore { get; set; }
        public List<SecurityEvent> RecentEvents { get; set; } = new();
        public List<SecurityThreat> ActiveThreats { get; set; } = new();
    }

    public class SessionAnalytics
    {
        public Guid OrganizationId { get; set; }
        public int TotalSessions { get; set; }
        public int ActiveSessions { get; set; }
        public TimeSpan AverageSessionDuration { get; set; }
        public Dictionary<string, int> SessionsByLocation { get; set; } = new();
        public Dictionary<string, int> SessionsByDevice { get; set; } = new();
    }

    // Filter Classes
    public class OrganizationFilter
    {
        public string? Status { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class OrganizationMemberFilter
    {
        public string? Status { get; set; }
        public Guid? RoleId { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class InvitationFilter
    {
        public string? Status { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class RoleFilter
    {
        public string? Type { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class PermissionFilter
    {
        public string? Resource { get; set; }
        public string? Action { get; set; }
        public string? Scope { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class AuditLogFilter
    {
        public Guid? OrganizationId { get; set; }
        public Guid? UserId { get; set; }
        public string? Action { get; set; }
        public string? Resource { get; set; }
        public string? Result { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class UserAuditLogFilter : AuditLogFilter { }
    public class OrganizationAuditLogFilter : AuditLogFilter { }
    public class ResourceAuditLogFilter : AuditLogFilter { }

    public class ComplianceCheckFilter
    {
        public string? Type { get; set; }
        public string? Standard { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class ComplianceIssueFilter
    {
        public string? Type { get; set; }
        public string? Severity { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class SecurityPolicyFilter
    {
        public string? Type { get; set; }
        public bool? IsEnabled { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class SecurityViolationFilter
    {
        public string? Type { get; set; }
        public string? Severity { get; set; }
        public string? Status { get; set; }
        public Guid? UserId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class SecurityEventFilter
    {
        public Guid? OrganizationId { get; set; }
        public string? Type { get; set; }
        public string? Severity { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class SecurityThreatFilter
    {
        public string? Type { get; set; }
        public string? Severity { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class SecurityAlertFilter
    {
        public string? Type { get; set; }
        public string? Severity { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class ApiKeyFilter
    {
        public bool? IsActive { get; set; }
        public string? Search { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class ApiKeyUsageFilter
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Endpoint { get; set; }
        public string? Method { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class OrganizationApiUsageFilter : ApiKeyUsageFilter { }

    public class UserSessionFilter
    {
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class OrganizationSessionFilter : UserSessionFilter { }

    public class SessionAnalyticsFilter
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Granularity { get; set; } = "daily";
    }

    public class OrganizationBackupFilter
    {
        public string? Type { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    // Placeholder classes for complex types
    public class ExportAuditLogsRequest { }
    public class AuditReportRequest { }
    public class ResolveComplianceIssueRequest { }
    public class SsoLoginRequest { }
    public class CompleteSsoLoginRequest { }
    public class GenerateMfaTokenRequest { }
    public class VerifyMfaTokenRequest { }
    public class RegisterMfaDeviceRequest { }
    public class CreateUserSessionRequest { }
    public class DataPrivacySettings { }
    public class UpdateDataPrivacySettingsRequest { }
    public class DataProcessingActivity { }
    public class CreateDataProcessingActivityRequest { }
    public class DataExportRequest { }
    public class RequestDataExportRequest { }
    public class DataExportRequestFilter { }
    public class DataDeletionRequest { }
    public class RequestDataDeletionRequest { }
    public class DataDeletionRequestFilter { }
    public class CreateSecurityEventRequest { }
    public class MitigateSecurityThreatRequest { }
    public class SecurityAlert { }
    public class RestoreOrganizationBackupRequest { }
    public class CreateBackupPolicyRequest { }
    public class UpdateBackupPolicyRequest { }
}