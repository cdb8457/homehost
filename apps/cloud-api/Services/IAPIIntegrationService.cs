using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IAPIIntegrationService
    {
        // API Key Management
        Task<APIKey> CreateAPIKeyAsync(Guid organizationId, Guid userId, CreateAPIKeyRequest request);
        Task<List<APIKey>> GetAPIKeysAsync(Guid organizationId, APIKeyFilter? filter = null);
        Task<APIKey> GetAPIKeyAsync(Guid keyId);
        Task<APIKey> UpdateAPIKeyAsync(Guid keyId, Guid userId, UpdateAPIKeyRequest request);
        Task<bool> RevokeAPIKeyAsync(Guid keyId, Guid userId);
        Task<bool> RegenerateAPIKeyAsync(Guid keyId, Guid userId);
        Task<APIKeyUsage> GetAPIKeyUsageAsync(Guid keyId, APIKeyUsageFilter filter);

        // Webhook Management
        Task<Webhook> CreateWebhookAsync(Guid organizationId, Guid userId, CreateWebhookRequest request);
        Task<List<Webhook>> GetWebhooksAsync(Guid organizationId, WebhookFilter? filter = null);
        Task<Webhook> GetWebhookAsync(Guid webhookId);
        Task<Webhook> UpdateWebhookAsync(Guid webhookId, Guid userId, UpdateWebhookRequest request);
        Task<bool> DeleteWebhookAsync(Guid webhookId, Guid userId);
        Task<bool> TestWebhookAsync(Guid webhookId, TestWebhookRequest request);
        Task<List<WebhookDelivery>> GetWebhookDeliveriesAsync(Guid webhookId, WebhookDeliveryFilter? filter = null);
        Task<bool> RetryWebhookDeliveryAsync(Guid deliveryId);

        // Third-party Integrations
        Task<Integration> CreateIntegrationAsync(Guid organizationId, Guid userId, CreateIntegrationRequest request);
        Task<List<Integration>> GetIntegrationsAsync(Guid organizationId, IntegrationFilter? filter = null);
        Task<Integration> GetIntegrationAsync(Guid integrationId);
        Task<Integration> UpdateIntegrationAsync(Guid integrationId, Guid userId, UpdateIntegrationRequest request);
        Task<bool> DeleteIntegrationAsync(Guid integrationId, Guid userId);
        Task<bool> TestIntegrationAsync(Guid integrationId, TestIntegrationRequest request);
        Task<List<IntegrationType>> GetAvailableIntegrationTypesAsync();

        // OAuth Management
        Task<OAuthApplication> CreateOAuthApplicationAsync(Guid organizationId, Guid userId, CreateOAuthApplicationRequest request);
        Task<List<OAuthApplication>> GetOAuthApplicationsAsync(Guid organizationId, OAuthApplicationFilter? filter = null);
        Task<OAuthApplication> GetOAuthApplicationAsync(Guid applicationId);
        Task<OAuthApplication> UpdateOAuthApplicationAsync(Guid applicationId, Guid userId, UpdateOAuthApplicationRequest request);
        Task<bool> DeleteOAuthApplicationAsync(Guid applicationId, Guid userId);
        Task<OAuthToken> CreateOAuthTokenAsync(Guid applicationId, CreateOAuthTokenRequest request);
        Task<bool> RevokeOAuthTokenAsync(Guid tokenId);
        Task<List<OAuthToken>> GetOAuthTokensAsync(Guid applicationId, OAuthTokenFilter? filter = null);

        // Rate Limiting
        Task<RateLimitPolicy> CreateRateLimitPolicyAsync(Guid organizationId, Guid userId, CreateRateLimitPolicyRequest request);
        Task<List<RateLimitPolicy>> GetRateLimitPoliciesAsync(Guid organizationId, RateLimitPolicyFilter? filter = null);
        Task<RateLimitPolicy> UpdateRateLimitPolicyAsync(Guid policyId, Guid userId, UpdateRateLimitPolicyRequest request);
        Task<bool> DeleteRateLimitPolicyAsync(Guid policyId, Guid userId);
        Task<RateLimitStatus> GetRateLimitStatusAsync(string identifier, string policyName);
        Task<bool> ResetRateLimitAsync(string identifier, string policyName);

        // API Documentation
        Task<APIDocumentation> GetAPIDocumentationAsync(string version = "latest");
        Task<OpenAPISpec> GetOpenAPISpecAsync(string version = "latest");
        Task<List<APIEndpoint>> GetAPIEndpointsAsync(APIEndpointFilter? filter = null);
        Task<APIEndpoint> GetAPIEndpointAsync(string endpoint);
        Task<APISchema> GetAPISchemaAsync(string schemaName);
        Task<List<APIExample>> GetAPIExamplesAsync(string endpoint);

        // SDK Management
        Task<List<SDK>> GetAvailableSDKsAsync(SDKFilter? filter = null);
        Task<SDK> GetSDKAsync(string language, string version = "latest");
        Task<byte[]> DownloadSDKAsync(string language, string version = "latest");
        Task<SDKDocumentation> GetSDKDocumentationAsync(string language, string version = "latest");
        Task<List<CodeSample>> GetCodeSamplesAsync(string language, CodeSampleFilter? filter = null);

        // API Analytics & Monitoring
        Task<APIAnalytics> GetAPIAnalyticsAsync(Guid organizationId, APIAnalyticsFilter filter);
        Task<List<APIUsageMetric>> GetAPIUsageMetricsAsync(Guid organizationId, APIUsageFilter filter);
        Task<APIPerformanceMetrics> GetAPIPerformanceMetricsAsync(Guid organizationId, APIPerformanceFilter filter);
        Task<List<APIError>> GetAPIErrorsAsync(Guid organizationId, APIErrorFilter filter);
        Task<APIHealthStatus> GetAPIHealthStatusAsync();
        Task<List<APIAlert>> GetAPIAlertsAsync(Guid organizationId, APIAlertFilter? filter = null);

        // Integration Templates
        Task<IntegrationTemplate> CreateIntegrationTemplateAsync(Guid organizationId, Guid userId, CreateIntegrationTemplateRequest request);
        Task<List<IntegrationTemplate>> GetIntegrationTemplatesAsync(IntegrationTemplateFilter? filter = null);
        Task<IntegrationTemplate> GetIntegrationTemplateAsync(Guid templateId);
        Task<Integration> CreateIntegrationFromTemplateAsync(Guid organizationId, Guid userId, Guid templateId, CreateIntegrationFromTemplateRequest request);
        Task<bool> ShareIntegrationTemplateAsync(Guid templateId, Guid userId, ShareTemplateRequest request);

        // Data Transformation
        Task<DataTransformation> CreateDataTransformationAsync(Guid organizationId, Guid userId, CreateDataTransformationRequest request);
        Task<List<DataTransformation>> GetDataTransformationsAsync(Guid organizationId, DataTransformationFilter? filter = null);
        Task<DataTransformation> UpdateDataTransformationAsync(Guid transformationId, Guid userId, UpdateDataTransformationRequest request);
        Task<bool> DeleteDataTransformationAsync(Guid transformationId, Guid userId);
        Task<object> ExecuteDataTransformationAsync(Guid transformationId, object inputData);
        Task<bool> TestDataTransformationAsync(Guid transformationId, object testData);

        // Event Streaming
        Task<EventStream> CreateEventStreamAsync(Guid organizationId, Guid userId, CreateEventStreamRequest request);
        Task<List<EventStream>> GetEventStreamsAsync(Guid organizationId, EventStreamFilter? filter = null);
        Task<EventStream> UpdateEventStreamAsync(Guid streamId, Guid userId, UpdateEventStreamRequest request);
        Task<bool> DeleteEventStreamAsync(Guid streamId, Guid userId);
        Task<bool> PublishEventAsync(Guid streamId, PublishEventRequest request);
        Task<List<StreamEvent>> GetStreamEventsAsync(Guid streamId, StreamEventFilter filter);

        // Integration Marketplace
        Task<List<MarketplaceIntegration>> GetMarketplaceIntegrationsAsync(MarketplaceIntegrationFilter? filter = null);
        Task<MarketplaceIntegration> GetMarketplaceIntegrationAsync(Guid integrationId);
        Task<MarketplaceIntegration> InstallMarketplaceIntegrationAsync(Guid organizationId, Guid userId, Guid integrationId, InstallIntegrationRequest request);
        Task<bool> UninstallMarketplaceIntegrationAsync(Guid organizationId, Guid userId, Guid integrationId);
        Task<List<IntegrationReview>> GetIntegrationReviewsAsync(Guid integrationId, IntegrationReviewFilter? filter = null);
        Task<IntegrationReview> CreateIntegrationReviewAsync(Guid integrationId, Guid userId, CreateIntegrationReviewRequest request);

        // Custom Connectors
        Task<CustomConnector> CreateCustomConnectorAsync(Guid organizationId, Guid userId, CreateCustomConnectorRequest request);
        Task<List<CustomConnector>> GetCustomConnectorsAsync(Guid organizationId, CustomConnectorFilter? filter = null);
        Task<CustomConnector> UpdateCustomConnectorAsync(Guid connectorId, Guid userId, UpdateCustomConnectorRequest request);
        Task<bool> DeleteCustomConnectorAsync(Guid connectorId, Guid userId);
        Task<bool> TestCustomConnectorAsync(Guid connectorId, TestConnectorRequest request);
        Task<ConnectorSchema> GetConnectorSchemaAsync(Guid connectorId);

        // API Gateway Features
        Task<APIGatewayRule> CreateAPIGatewayRuleAsync(Guid organizationId, Guid userId, CreateAPIGatewayRuleRequest request);
        Task<List<APIGatewayRule>> GetAPIGatewayRulesAsync(Guid organizationId, APIGatewayRuleFilter? filter = null);
        Task<APIGatewayRule> UpdateAPIGatewayRuleAsync(Guid ruleId, Guid userId, UpdateAPIGatewayRuleRequest request);
        Task<bool> DeleteAPIGatewayRuleAsync(Guid ruleId, Guid userId);
        Task<APIGatewayMetrics> GetAPIGatewayMetricsAsync(Guid organizationId, APIGatewayMetricsFilter filter);
        Task<List<APIRoute>> GetAPIRoutesAsync(Guid organizationId, APIRouteFilter? filter = null);

        // Workflow Automation
        Task<Workflow> CreateWorkflowAsync(Guid organizationId, Guid userId, CreateWorkflowRequest request);
        Task<List<Workflow>> GetWorkflowsAsync(Guid organizationId, WorkflowFilter? filter = null);
        Task<Workflow> UpdateWorkflowAsync(Guid workflowId, Guid userId, UpdateWorkflowRequest request);
        Task<bool> DeleteWorkflowAsync(Guid workflowId, Guid userId);
        Task<WorkflowExecution> ExecuteWorkflowAsync(Guid workflowId, ExecuteWorkflowRequest request);
        Task<List<WorkflowExecution>> GetWorkflowExecutionsAsync(Guid workflowId, WorkflowExecutionFilter? filter = null);
        Task<List<WorkflowTemplate>> GetWorkflowTemplatesAsync(WorkflowTemplateFilter? filter = null);

        // API Versioning
        Task<APIVersion> CreateAPIVersionAsync(Guid organizationId, Guid userId, CreateAPIVersionRequest request);
        Task<List<APIVersion>> GetAPIVersionsAsync(Guid organizationId, APIVersionFilter? filter = null);
        Task<APIVersion> UpdateAPIVersionAsync(Guid versionId, Guid userId, UpdateAPIVersionRequest request);
        Task<bool> DeprecateAPIVersionAsync(Guid versionId, Guid userId, DeprecateVersionRequest request);
        Task<VersionCompatibility> CheckVersionCompatibilityAsync(string fromVersion, string toVersion);
        Task<MigrationGuide> GetMigrationGuideAsync(string fromVersion, string toVersion);
    }
}