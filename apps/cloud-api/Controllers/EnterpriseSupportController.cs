using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using HomeHost.CloudApi.Services;
using HomeHost.CloudApi.Models;
using System.Security.Claims;

namespace HomeHost.CloudApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EnterpriseSupportController : ControllerBase
    {
        private readonly IEnterpriseSupportService _enterpriseSupportService;
        private readonly ILogger<EnterpriseSupportController> _logger;

        public EnterpriseSupportController(
            IEnterpriseSupportService enterpriseSupportService,
            ILogger<EnterpriseSupportController> logger)
        {
            _enterpriseSupportService = enterpriseSupportService;
            _logger = logger;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID");
            }
            return userId;
        }

        // Ticket Management
        [HttpPost("organizations/{organizationId}/tickets")]
        public async Task<ActionResult<SupportTicket>> CreateSupportTicket(Guid organizationId, CreateSupportTicketRequest request)
        {
            try
            {
                var userId = GetUserId();
                var ticket = await _enterpriseSupportService.CreateSupportTicketAsync(organizationId, userId, request);
                return Ok(ticket);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating support ticket for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/tickets")]
        public async Task<ActionResult<List<SupportTicket>>> GetSupportTickets(Guid organizationId, [FromQuery] SupportTicketFilter filter)
        {
            try
            {
                var tickets = await _enterpriseSupportService.GetSupportTicketsAsync(organizationId, filter);
                return Ok(tickets);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support tickets for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tickets/{ticketId}")]
        public async Task<ActionResult<SupportTicket>> GetSupportTicket(Guid ticketId)
        {
            try
            {
                var ticket = await _enterpriseSupportService.GetSupportTicketAsync(ticketId);
                return Ok(ticket);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support ticket {TicketId}", ticketId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("tickets/{ticketId}")]
        public async Task<ActionResult<SupportTicket>> UpdateSupportTicket(Guid ticketId, UpdateSupportTicketRequest request)
        {
            try
            {
                var userId = GetUserId();
                var ticket = await _enterpriseSupportService.UpdateSupportTicketAsync(ticketId, userId, request);
                return Ok(ticket);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating support ticket {TicketId}", ticketId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("tickets/{ticketId}/close")]
        public async Task<ActionResult> CloseSupportTicket(Guid ticketId, CloseSupportTicketRequest request)
        {
            try
            {
                var userId = GetUserId();
                await _enterpriseSupportService.CloseSupportTicketAsync(ticketId, userId, request);
                return Ok(new { message = "Ticket closed successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error closing support ticket {TicketId}", ticketId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("tickets/{ticketId}/escalate")]
        public async Task<ActionResult> EscalateSupportTicket(Guid ticketId, EscalateSupportTicketRequest request)
        {
            try
            {
                var userId = GetUserId();
                await _enterpriseSupportService.EscalateSupportTicketAsync(ticketId, userId, request);
                return Ok(new { message = "Ticket escalated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error escalating support ticket {TicketId}", ticketId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("tickets/{ticketId}/comments")]
        public async Task<ActionResult<SupportTicketComment>> AddTicketComment(Guid ticketId, AddTicketCommentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var comment = await _enterpriseSupportService.AddTicketCommentAsync(ticketId, userId, request);
                return Ok(comment);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding comment to ticket {TicketId}", ticketId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("tickets/{ticketId}/comments")]
        public async Task<ActionResult<List<SupportTicketComment>>> GetTicketComments(Guid ticketId)
        {
            try
            {
                var comments = await _enterpriseSupportService.GetTicketCommentsAsync(ticketId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting comments for ticket {TicketId}", ticketId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Knowledge Base
        [HttpPost("organizations/{organizationId}/knowledge-base/articles")]
        public async Task<ActionResult<KnowledgeBaseArticle>> CreateKnowledgeBaseArticle(Guid organizationId, CreateKnowledgeBaseArticleRequest request)
        {
            try
            {
                var userId = GetUserId();
                var article = await _enterpriseSupportService.CreateKnowledgeBaseArticleAsync(organizationId, userId, request);
                return Ok(article);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating knowledge base article for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("knowledge-base/articles")]
        public async Task<ActionResult<List<KnowledgeBaseArticle>>> GetKnowledgeBaseArticles([FromQuery] KnowledgeBaseFilter filter)
        {
            try
            {
                var articles = await _enterpriseSupportService.GetKnowledgeBaseArticlesAsync(filter);
                return Ok(articles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting knowledge base articles");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("knowledge-base/articles/{articleId}")]
        public async Task<ActionResult<KnowledgeBaseArticle>> GetKnowledgeBaseArticle(Guid articleId)
        {
            try
            {
                var article = await _enterpriseSupportService.GetKnowledgeBaseArticleAsync(articleId);
                return Ok(article);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting knowledge base article {ArticleId}", articleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("knowledge-base/articles/{articleId}")]
        public async Task<ActionResult<KnowledgeBaseArticle>> UpdateKnowledgeBaseArticle(Guid articleId, UpdateKnowledgeBaseArticleRequest request)
        {
            try
            {
                var userId = GetUserId();
                var article = await _enterpriseSupportService.UpdateKnowledgeBaseArticleAsync(articleId, userId, request);
                return Ok(article);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating knowledge base article {ArticleId}", articleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("knowledge-base/articles/{articleId}")]
        public async Task<ActionResult> DeleteKnowledgeBaseArticle(Guid articleId)
        {
            try
            {
                var userId = GetUserId();
                await _enterpriseSupportService.DeleteKnowledgeBaseArticleAsync(articleId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting knowledge base article {ArticleId}", articleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("knowledge-base/search")]
        public async Task<ActionResult<List<KnowledgeBaseArticle>>> SearchKnowledgeBase(SearchKnowledgeBaseRequest request)
        {
            try
            {
                var articles = await _enterpriseSupportService.SearchKnowledgeBaseAsync(request);
                return Ok(articles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching knowledge base");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("knowledge-base/articles/{articleId}/rate")]
        public async Task<ActionResult> RateKnowledgeBaseArticle(Guid articleId, RateArticleRequest request)
        {
            try
            {
                var userId = GetUserId();
                await _enterpriseSupportService.RateKnowledgeBaseArticleAsync(articleId, userId, request);
                return Ok(new { message = "Article rated successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error rating knowledge base article {ArticleId}", articleId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("knowledge-base/categories")]
        public async Task<ActionResult<List<KnowledgeBaseCategory>>> GetKnowledgeBaseCategories()
        {
            try
            {
                var categories = await _enterpriseSupportService.GetKnowledgeBaseCategoriesAsync();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting knowledge base categories");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Live Chat Support
        [HttpPost("organizations/{organizationId}/live-chat/sessions")]
        public async Task<ActionResult<LiveChatSession>> StartLiveChatSession(Guid organizationId, StartLiveChatRequest request)
        {
            try
            {
                var userId = GetUserId();
                var session = await _enterpriseSupportService.StartLiveChatSessionAsync(organizationId, userId, request);
                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error starting live chat session for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/live-chat/sessions")]
        public async Task<ActionResult<List<LiveChatSession>>> GetLiveChatSessions(Guid organizationId, [FromQuery] LiveChatSessionFilter filter)
        {
            try
            {
                var sessions = await _enterpriseSupportService.GetLiveChatSessionsAsync(organizationId, filter);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live chat sessions for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("live-chat/sessions/{sessionId}")]
        public async Task<ActionResult<LiveChatSession>> GetLiveChatSession(Guid sessionId)
        {
            try
            {
                var session = await _enterpriseSupportService.GetLiveChatSessionAsync(sessionId);
                return Ok(session);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live chat session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("live-chat/sessions/{sessionId}/messages")]
        public async Task<ActionResult<LiveChatMessage>> SendLiveChatMessage(Guid sessionId, SendLiveChatMessageRequest request)
        {
            try
            {
                var userId = GetUserId();
                var message = await _enterpriseSupportService.SendLiveChatMessageAsync(sessionId, userId, request);
                return Ok(message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending live chat message to session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("live-chat/sessions/{sessionId}/messages")]
        public async Task<ActionResult<List<LiveChatMessage>>> GetLiveChatMessages(Guid sessionId, [FromQuery] LiveChatMessageFilter filter)
        {
            try
            {
                var messages = await _enterpriseSupportService.GetLiveChatMessagesAsync(sessionId, filter);
                return Ok(messages);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live chat messages for session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("live-chat/sessions/{sessionId}/end")]
        public async Task<ActionResult> EndLiveChatSession(Guid sessionId, EndLiveChatSessionRequest request)
        {
            try
            {
                var userId = GetUserId();
                await _enterpriseSupportService.EndLiveChatSessionAsync(sessionId, userId, request);
                return Ok(new { message = "Live chat session ended successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error ending live chat session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("live-chat/sessions/{sessionId}/transfer")]
        public async Task<ActionResult> TransferLiveChatSession(Guid sessionId, TransferChatRequest request)
        {
            try
            {
                var fromAgentId = GetUserId();
                await _enterpriseSupportService.TransferLiveChatSessionAsync(sessionId, fromAgentId, request.ToAgentId, request);
                return Ok(new { message = "Live chat session transferred successfully" });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error transferring live chat session {SessionId}", sessionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/live-chat/analytics")]
        public async Task<ActionResult<LiveChatAnalytics>> GetLiveChatAnalytics(Guid organizationId, [FromQuery] LiveChatAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _enterpriseSupportService.GetLiveChatAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting live chat analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // SLA Management
        [HttpPost("organizations/{organizationId}/sla/policies")]
        public async Task<ActionResult<SLAPolicy>> CreateSLAPolicy(Guid organizationId, CreateSLAPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _enterpriseSupportService.CreateSLAPolicyAsync(organizationId, userId, request);
                return Ok(policy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating SLA policy for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/sla/policies")]
        public async Task<ActionResult<List<SLAPolicy>>> GetSLAPolicies(Guid organizationId, [FromQuery] SLAPolicyFilter filter)
        {
            try
            {
                var policies = await _enterpriseSupportService.GetSLAPoliciesAsync(organizationId, filter);
                return Ok(policies);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting SLA policies for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("sla/policies/{policyId}")]
        public async Task<ActionResult<SLAPolicy>> UpdateSLAPolicy(Guid policyId, UpdateSLAPolicyRequest request)
        {
            try
            {
                var userId = GetUserId();
                var policy = await _enterpriseSupportService.UpdateSLAPolicyAsync(policyId, userId, request);
                return Ok(policy);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating SLA policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("sla/policies/{policyId}")]
        public async Task<ActionResult> DeleteSLAPolicy(Guid policyId)
        {
            try
            {
                var userId = GetUserId();
                await _enterpriseSupportService.DeleteSLAPolicyAsync(policyId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting SLA policy {PolicyId}", policyId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/sla/violations")]
        public async Task<ActionResult<List<SLAViolation>>> GetSLAViolations(Guid organizationId, [FromQuery] SLAViolationFilter filter)
        {
            try
            {
                var violations = await _enterpriseSupportService.GetSLAViolationsAsync(organizationId, filter);
                return Ok(violations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting SLA violations for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/sla/report")]
        public async Task<ActionResult<SLAReport>> GetSLAReport(Guid organizationId, [FromQuery] SLAReportFilter filter)
        {
            try
            {
                var report = await _enterpriseSupportService.GetSLAReportAsync(organizationId, filter);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting SLA report for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Support Agent Management
        [HttpPost("organizations/{organizationId}/agents")]
        public async Task<ActionResult<SupportAgent>> CreateSupportAgent(Guid organizationId, CreateSupportAgentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var agent = await _enterpriseSupportService.CreateSupportAgentAsync(organizationId, userId, request);
                return Ok(agent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating support agent for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/agents")]
        public async Task<ActionResult<List<SupportAgent>>> GetSupportAgents(Guid organizationId, [FromQuery] SupportAgentFilter filter)
        {
            try
            {
                var agents = await _enterpriseSupportService.GetSupportAgentsAsync(organizationId, filter);
                return Ok(agents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support agents for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("agents/{agentId}")]
        public async Task<ActionResult<SupportAgent>> GetSupportAgent(Guid agentId)
        {
            try
            {
                var agent = await _enterpriseSupportService.GetSupportAgentAsync(agentId);
                return Ok(agent);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support agent {AgentId}", agentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("agents/{agentId}")]
        public async Task<ActionResult<SupportAgent>> UpdateSupportAgent(Guid agentId, UpdateSupportAgentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var agent = await _enterpriseSupportService.UpdateSupportAgentAsync(agentId, userId, request);
                return Ok(agent);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating support agent {AgentId}", agentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("agents/{agentId}")]
        public async Task<ActionResult> DeactivateSupportAgent(Guid agentId)
        {
            try
            {
                var userId = GetUserId();
                await _enterpriseSupportService.DeactivateSupportAgentAsync(agentId, userId);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating support agent {AgentId}", agentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("agents/{agentId}/metrics")]
        public async Task<ActionResult<SupportAgentMetrics>> GetSupportAgentMetrics(Guid agentId, [FromQuery] SupportAgentMetricsFilter filter)
        {
            try
            {
                var metrics = await _enterpriseSupportService.GetSupportAgentMetricsAsync(agentId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support agent metrics for {AgentId}", agentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/agents/workloads")]
        public async Task<ActionResult<List<SupportAgentWorkload>>> GetSupportAgentWorkloads(Guid organizationId, [FromQuery] WorkloadFilter filter)
        {
            try
            {
                var workloads = await _enterpriseSupportService.GetSupportAgentWorkloadsAsync(organizationId, filter);
                return Ok(workloads);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support agent workloads for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Support Analytics
        [HttpGet("organizations/{organizationId}/analytics")]
        public async Task<ActionResult<SupportAnalytics>> GetSupportAnalytics(Guid organizationId, [FromQuery] SupportAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _enterpriseSupportService.GetSupportAnalyticsAsync(organizationId, filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support analytics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/metrics")]
        public async Task<ActionResult<List<SupportMetric>>> GetSupportMetrics(Guid organizationId, [FromQuery] SupportMetricsFilter filter)
        {
            try
            {
                var metrics = await _enterpriseSupportService.GetSupportMetricsAsync(organizationId, filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support metrics for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/ticket-trends")]
        public async Task<ActionResult<TicketTrendAnalysis>> GetTicketTrendAnalysis(Guid organizationId, [FromQuery] TicketTrendFilter filter)
        {
            try
            {
                var analysis = await _enterpriseSupportService.GetTicketTrendAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting ticket trend analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/response-time-analysis")]
        public async Task<ActionResult<ResponseTimeAnalysis>> GetResponseTimeAnalysis(Guid organizationId, [FromQuery] ResponseTimeFilter filter)
        {
            try
            {
                var analysis = await _enterpriseSupportService.GetResponseTimeAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting response time analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/resolution-analysis")]
        public async Task<ActionResult<ResolutionAnalysis>> GetResolutionAnalysis(Guid organizationId, [FromQuery] ResolutionAnalysisFilter filter)
        {
            try
            {
                var analysis = await _enterpriseSupportService.GetResolutionAnalysisAsync(organizationId, filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting resolution analysis for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/reports")]
        public async Task<ActionResult<SupportReport>> GenerateSupportReport(Guid organizationId, GenerateSupportReportRequest request)
        {
            try
            {
                var report = await _enterpriseSupportService.GenerateSupportReportAsync(organizationId, request);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating support report for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Configuration
        [HttpGet("organizations/{organizationId}/configuration")]
        public async Task<ActionResult<SupportConfiguration>> GetSupportConfiguration(Guid organizationId)
        {
            try
            {
                var configuration = await _enterpriseSupportService.GetSupportConfigurationAsync(organizationId);
                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support configuration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("organizations/{organizationId}/configuration")]
        public async Task<ActionResult<SupportConfiguration>> UpdateSupportConfiguration(Guid organizationId, UpdateSupportConfigurationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var configuration = await _enterpriseSupportService.UpdateSupportConfigurationAsync(organizationId, userId, request);
                return Ok(configuration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating support configuration for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/categories")]
        public async Task<ActionResult<List<SupportCategory>>> GetSupportCategories(Guid organizationId)
        {
            try
            {
                var categories = await _enterpriseSupportService.GetSupportCategoriesAsync(organizationId);
                return Ok(categories);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support categories for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("organizations/{organizationId}/categories")]
        public async Task<ActionResult<SupportCategory>> CreateSupportCategory(Guid organizationId, CreateSupportCategoryRequest request)
        {
            try
            {
                var userId = GetUserId();
                var category = await _enterpriseSupportService.CreateSupportCategoryAsync(organizationId, userId, request);
                return Ok(category);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating support category for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("organizations/{organizationId}/priorities")]
        public async Task<ActionResult<List<SupportPriority>>> GetSupportPriorities(Guid organizationId)
        {
            try
            {
                var priorities = await _enterpriseSupportService.GetSupportPrioritiesAsync(organizationId);
                return Ok(priorities);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting support priorities for organization {OrganizationId}", organizationId);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}