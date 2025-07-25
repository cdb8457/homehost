using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IEnterpriseSupportService
    {
        // Ticket Management
        Task<SupportTicket> CreateSupportTicketAsync(Guid organizationId, Guid userId, CreateSupportTicketRequest request);
        Task<List<SupportTicket>> GetSupportTicketsAsync(Guid organizationId, SupportTicketFilter? filter = null);
        Task<SupportTicket> GetSupportTicketAsync(Guid ticketId);
        Task<SupportTicket> UpdateSupportTicketAsync(Guid ticketId, Guid userId, UpdateSupportTicketRequest request);
        Task<bool> CloseSupportTicketAsync(Guid ticketId, Guid userId, CloseSupportTicketRequest request);
        Task<bool> EscalateSupportTicketAsync(Guid ticketId, Guid userId, EscalateSupportTicketRequest request);
        Task<SupportTicketComment> AddTicketCommentAsync(Guid ticketId, Guid userId, AddTicketCommentRequest request);
        Task<List<SupportTicketComment>> GetTicketCommentsAsync(Guid ticketId);

        // Knowledge Base
        Task<KnowledgeBaseArticle> CreateKnowledgeBaseArticleAsync(Guid organizationId, Guid userId, CreateKnowledgeBaseArticleRequest request);
        Task<List<KnowledgeBaseArticle>> GetKnowledgeBaseArticlesAsync(KnowledgeBaseFilter? filter = null);
        Task<KnowledgeBaseArticle> GetKnowledgeBaseArticleAsync(Guid articleId);
        Task<KnowledgeBaseArticle> UpdateKnowledgeBaseArticleAsync(Guid articleId, Guid userId, UpdateKnowledgeBaseArticleRequest request);
        Task<bool> DeleteKnowledgeBaseArticleAsync(Guid articleId, Guid userId);
        Task<List<KnowledgeBaseArticle>> SearchKnowledgeBaseAsync(SearchKnowledgeBaseRequest request);
        Task<bool> RateKnowledgeBaseArticleAsync(Guid articleId, Guid userId, RateArticleRequest request);
        Task<List<KnowledgeBaseCategory>> GetKnowledgeBaseCategoriesAsync();

        // Live Chat Support
        Task<LiveChatSession> StartLiveChatSessionAsync(Guid organizationId, Guid userId, StartLiveChatRequest request);
        Task<List<LiveChatSession>> GetLiveChatSessionsAsync(Guid organizationId, LiveChatSessionFilter? filter = null);
        Task<LiveChatSession> GetLiveChatSessionAsync(Guid sessionId);
        Task<LiveChatMessage> SendLiveChatMessageAsync(Guid sessionId, Guid userId, SendLiveChatMessageRequest request);
        Task<List<LiveChatMessage>> GetLiveChatMessagesAsync(Guid sessionId, LiveChatMessageFilter? filter = null);
        Task<bool> EndLiveChatSessionAsync(Guid sessionId, Guid userId, EndLiveChatSessionRequest request);
        Task<bool> TransferLiveChatSessionAsync(Guid sessionId, Guid fromAgentId, Guid toAgentId, TransferChatRequest request);
        Task<LiveChatAnalytics> GetLiveChatAnalyticsAsync(Guid organizationId, LiveChatAnalyticsFilter filter);

        // Service Level Agreements (SLA)
        Task<SLAPolicy> CreateSLAPolicyAsync(Guid organizationId, Guid userId, CreateSLAPolicyRequest request);
        Task<List<SLAPolicy>> GetSLAPoliciesAsync(Guid organizationId, SLAPolicyFilter? filter = null);
        Task<SLAPolicy> UpdateSLAPolicyAsync(Guid policyId, Guid userId, UpdateSLAPolicyRequest request);
        Task<bool> DeleteSLAPolicyAsync(Guid policyId, Guid userId);
        Task<SLAViolation> CreateSLAViolationAsync(Guid policyId, Guid ticketId, CreateSLAViolationRequest request);
        Task<List<SLAViolation>> GetSLAViolationsAsync(Guid organizationId, SLAViolationFilter? filter = null);
        Task<SLAReport> GetSLAReportAsync(Guid organizationId, SLAReportFilter filter);

        // Escalation Management
        Task<EscalationRule> CreateEscalationRuleAsync(Guid organizationId, Guid userId, CreateEscalationRuleRequest request);
        Task<List<EscalationRule>> GetEscalationRulesAsync(Guid organizationId, EscalationRuleFilter? filter = null);
        Task<EscalationRule> UpdateEscalationRuleAsync(Guid ruleId, Guid userId, UpdateEscalationRuleRequest request);
        Task<bool> DeleteEscalationRuleAsync(Guid ruleId, Guid userId);
        Task<List<EscalationEvent>> GetEscalationEventsAsync(Guid organizationId, EscalationEventFilter? filter = null);
        Task<bool> ProcessEscalationRulesAsync(Guid ticketId);

        // Support Agent Management
        Task<SupportAgent> CreateSupportAgentAsync(Guid organizationId, Guid userId, CreateSupportAgentRequest request);
        Task<List<SupportAgent>> GetSupportAgentsAsync(Guid organizationId, SupportAgentFilter? filter = null);
        Task<SupportAgent> GetSupportAgentAsync(Guid agentId);
        Task<SupportAgent> UpdateSupportAgentAsync(Guid agentId, Guid userId, UpdateSupportAgentRequest request);
        Task<bool> DeactivateSupportAgentAsync(Guid agentId, Guid userId);
        Task<SupportAgentMetrics> GetSupportAgentMetricsAsync(Guid agentId, SupportAgentMetricsFilter filter);
        Task<List<SupportAgentWorkload>> GetSupportAgentWorkloadsAsync(Guid organizationId, WorkloadFilter? filter = null);

        // Automated Responses
        Task<AutomatedResponse> CreateAutomatedResponseAsync(Guid organizationId, Guid userId, CreateAutomatedResponseRequest request);
        Task<List<AutomatedResponse>> GetAutomatedResponsesAsync(Guid organizationId, AutomatedResponseFilter? filter = null);
        Task<AutomatedResponse> UpdateAutomatedResponseAsync(Guid responseId, Guid userId, UpdateAutomatedResponseRequest request);
        Task<bool> DeleteAutomatedResponseAsync(Guid responseId, Guid userId);
        Task<bool> TriggerAutomatedResponseAsync(Guid ticketId, AutomatedResponseTrigger trigger);
        Task<List<AutomatedResponseLog>> GetAutomatedResponseLogsAsync(Guid organizationId, AutomatedResponseLogFilter? filter = null);

        // Customer Satisfaction
        Task<CustomerSatisfactionSurvey> CreateSatisfactionSurveyAsync(Guid organizationId, Guid userId, CreateSatisfactionSurveyRequest request);
        Task<List<CustomerSatisfactionSurvey>> GetSatisfactionSurveysAsync(Guid organizationId, SatisfactionSurveyFilter? filter = null);
        Task<SatisfactionSurveyResponse> SubmitSatisfactionSurveyAsync(Guid surveyId, Guid customerId, SubmitSatisfactionSurveyRequest request);
        Task<List<SatisfactionSurveyResponse>> GetSatisfactionSurveyResponsesAsync(Guid surveyId, SurveyResponseFilter? filter = null);
        Task<SatisfactionAnalytics> GetSatisfactionAnalyticsAsync(Guid organizationId, SatisfactionAnalyticsFilter filter);
        Task<CustomerSatisfactionReport> GetSatisfactionReportAsync(Guid organizationId, SatisfactionReportFilter filter);

        // Support Analytics & Reporting
        Task<SupportAnalytics> GetSupportAnalyticsAsync(Guid organizationId, SupportAnalyticsFilter filter);
        Task<List<SupportMetric>> GetSupportMetricsAsync(Guid organizationId, SupportMetricsFilter filter);
        Task<TicketTrendAnalysis> GetTicketTrendAnalysisAsync(Guid organizationId, TicketTrendFilter filter);
        Task<ResponseTimeAnalysis> GetResponseTimeAnalysisAsync(Guid organizationId, ResponseTimeFilter filter);
        Task<ResolutionAnalysis> GetResolutionAnalysisAsync(Guid organizationId, ResolutionAnalysisFilter filter);
        Task<SupportReport> GenerateSupportReportAsync(Guid organizationId, GenerateSupportReportRequest request);

        // Integration & API Support
        Task<APIIntegrationSupport> GetAPIIntegrationSupportAsync(Guid organizationId, APIIntegrationSupportFilter? filter = null);
        Task<DeveloperTicket> CreateDeveloperTicketAsync(Guid organizationId, Guid developerId, CreateDeveloperTicketRequest request);
        Task<List<DeveloperTicket>> GetDeveloperTicketsAsync(Guid organizationId, DeveloperTicketFilter? filter = null);
        Task<CodeSample> CreateCodeSampleAsync(Guid organizationId, Guid userId, CreateCodeSampleRequest request);
        Task<List<CodeSample>> GetCodeSamplesAsync(CodeSampleFilter? filter = null);
        Task<APIDocumentationFeedback> SubmitAPIDocumentationFeedbackAsync(Guid organizationId, Guid userId, SubmitAPIDocFeedbackRequest request);

        // Priority Support
        Task<PrioritySupportPlan> GetPrioritySupportPlanAsync(Guid organizationId);
        Task<PrioritySupportPlan> UpdatePrioritySupportPlanAsync(Guid organizationId, Guid userId, UpdatePrioritySupportPlanRequest request);
        Task<List<PrioritySupportFeature>> GetPrioritySupportFeaturesAsync(string planTier);
        Task<PrioritySupportTicket> CreatePrioritySupportTicketAsync(Guid organizationId, Guid userId, CreatePrioritySupportTicketRequest request);
        Task<List<PrioritySupportTicket>> GetPrioritySupportTicketsAsync(Guid organizationId, PrioritySupportTicketFilter? filter = null);
        Task<bool> RequestPriorityCallbackAsync(Guid organizationId, Guid userId, RequestPriorityCallbackRequest request);

        // Support Configuration
        Task<SupportConfiguration> GetSupportConfigurationAsync(Guid organizationId);
        Task<SupportConfiguration> UpdateSupportConfigurationAsync(Guid organizationId, Guid userId, UpdateSupportConfigurationRequest request);
        Task<List<SupportCategory>> GetSupportCategoriesAsync(Guid organizationId);
        Task<SupportCategory> CreateSupportCategoryAsync(Guid organizationId, Guid userId, CreateSupportCategoryRequest request);
        Task<List<SupportPriority>> GetSupportPrioritiesAsync(Guid organizationId);
        Task<SupportPriority> UpdateSupportPriorityAsync(Guid organizationId, Guid priorityId, UpdateSupportPriorityRequest request);

        // Support Queue Management
        Task<List<SupportQueue>> GetSupportQueuesAsync(Guid organizationId, SupportQueueFilter? filter = null);
        Task<SupportQueue> CreateSupportQueueAsync(Guid organizationId, Guid userId, CreateSupportQueueRequest request);
        Task<SupportQueue> UpdateSupportQueueAsync(Guid queueId, Guid userId, UpdateSupportQueueRequest request);
        Task<bool> AssignTicketToQueueAsync(Guid ticketId, Guid queueId, Guid userId);
        Task<List<SupportTicket>> GetQueueTicketsAsync(Guid queueId, QueueTicketFilter? filter = null);
        Task<QueueMetrics> GetQueueMetricsAsync(Guid queueId, QueueMetricsFilter filter);

        // Training & Documentation
        Task<TrainingMaterial> CreateTrainingMaterialAsync(Guid organizationId, Guid userId, CreateTrainingMaterialRequest request);
        Task<List<TrainingMaterial>> GetTrainingMaterialsAsync(Guid organizationId, TrainingMaterialFilter? filter = null);
        Task<TrainingMaterial> UpdateTrainingMaterialAsync(Guid materialId, Guid userId, UpdateTrainingMaterialRequest request);
        Task<bool> DeleteTrainingMaterialAsync(Guid materialId, Guid userId);
        Task<TrainingProgress> GetTrainingProgressAsync(Guid agentId, TrainingProgressFilter? filter = null);
        Task<bool> MarkTrainingCompletedAsync(Guid agentId, Guid materialId, TrainingCompletionRequest request);

        // Feedback & Improvement
        Task<SupportFeedback> SubmitSupportFeedbackAsync(Guid organizationId, Guid userId, SubmitSupportFeedbackRequest request);
        Task<List<SupportFeedback>> GetSupportFeedbackAsync(Guid organizationId, SupportFeedbackFilter? filter = null);
        Task<ImprovementSuggestion> CreateImprovementSuggestionAsync(Guid organizationId, Guid userId, CreateImprovementSuggestionRequest request);
        Task<List<ImprovementSuggestion>> GetImprovementSuggestionsAsync(Guid organizationId, ImprovementSuggestionFilter? filter = null);
        Task<bool> ImplementImprovementSuggestionAsync(Guid suggestionId, Guid userId, ImplementSuggestionRequest request);
        Task<SupportQualityAnalysis> GetSupportQualityAnalysisAsync(Guid organizationId, SupportQualityFilter filter);
    }
}