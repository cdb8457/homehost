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
    public class RevenueController : ControllerBase
    {
        private readonly IRevenueService _revenueService;
        private readonly ILogger<RevenueController> _logger;

        public RevenueController(
            IRevenueService revenueService,
            ILogger<RevenueController> logger)
        {
            _revenueService = revenueService;
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

        // Subscription Management
        [HttpPost("subscriptions")]
        public async Task<ActionResult<Subscription>> CreateSubscription(CreateSubscriptionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var subscription = await _revenueService.CreateSubscriptionAsync(userId, request);
                return Ok(subscription);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("subscriptions")]
        public async Task<ActionResult<List<Subscription>>> GetSubscriptions([FromQuery] SubscriptionFilter? filter = null)
        {
            try
            {
                var subscriptions = await _revenueService.GetSubscriptionsAsync(filter);
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subscriptions");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("subscriptions/{subscriptionId}")]
        public async Task<ActionResult<Subscription>> GetSubscription(Guid subscriptionId)
        {
            try
            {
                var subscription = await _revenueService.GetSubscriptionAsync(subscriptionId);
                return Ok(subscription);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("subscriptions/my")]
        public async Task<ActionResult<List<Subscription>>> GetMySubscriptions()
        {
            try
            {
                var userId = GetUserId();
                var subscriptions = await _revenueService.GetUserSubscriptionsAsync(userId);
                return Ok(subscriptions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user subscriptions");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("subscriptions/{subscriptionId}")]
        public async Task<ActionResult<Subscription>> UpdateSubscription(Guid subscriptionId, UpdateSubscriptionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var subscription = await _revenueService.UpdateSubscriptionAsync(subscriptionId, userId, request);
                return Ok(subscription);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscriptions/{subscriptionId}/cancel")]
        public async Task<ActionResult> CancelSubscription(Guid subscriptionId, CancelSubscriptionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.CancelSubscriptionAsync(subscriptionId, userId, request);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscriptions/{subscriptionId}/renew")]
        public async Task<ActionResult> RenewSubscription(Guid subscriptionId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.RenewSubscriptionAsync(subscriptionId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error renewing subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscriptions/{subscriptionId}/upgrade")]
        public async Task<ActionResult> UpgradeSubscription(Guid subscriptionId, UpgradeSubscriptionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.UpgradeSubscriptionAsync(subscriptionId, userId, request);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error upgrading subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscriptions/{subscriptionId}/downgrade")]
        public async Task<ActionResult> DowngradeSubscription(Guid subscriptionId, DowngradeSubscriptionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.DowngradeSubscriptionAsync(subscriptionId, userId, request);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error downgrading subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscriptions/{subscriptionId}/suspend")]
        public async Task<ActionResult> SuspendSubscription(Guid subscriptionId, SuspendSubscriptionRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.SuspendSubscriptionAsync(subscriptionId, userId, request);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suspending subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscriptions/{subscriptionId}/reactivate")]
        public async Task<ActionResult> ReactivateSubscription(Guid subscriptionId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.ReactivateSubscriptionAsync(subscriptionId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reactivating subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Subscription Plans
        [HttpPost("plans")]
        public async Task<ActionResult<SubscriptionPlan>> CreateSubscriptionPlan(CreateSubscriptionPlanRequest request)
        {
            try
            {
                var userId = GetUserId();
                var plan = await _revenueService.CreateSubscriptionPlanAsync(userId, request);
                return Ok(plan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription plan");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("plans")]
        public async Task<ActionResult<List<SubscriptionPlan>>> GetSubscriptionPlans([FromQuery] bool includeInactive = false)
        {
            try
            {
                var plans = await _revenueService.GetSubscriptionPlansAsync(includeInactive);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subscription plans");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("plans/{planId}")]
        public async Task<ActionResult<SubscriptionPlan>> GetSubscriptionPlan(Guid planId)
        {
            try
            {
                var plan = await _revenueService.GetSubscriptionPlanAsync(planId);
                return Ok(plan);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting subscription plan {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("plans/{planId}")]
        public async Task<ActionResult<SubscriptionPlan>> UpdateSubscriptionPlan(Guid planId, UpdateSubscriptionPlanRequest request)
        {
            try
            {
                var userId = GetUserId();
                var plan = await _revenueService.UpdateSubscriptionPlanAsync(planId, userId, request);
                return Ok(plan);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription plan {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("plans/{planId}")]
        public async Task<ActionResult> DeactivateSubscriptionPlan(Guid planId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.DeactivateSubscriptionPlanAsync(planId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deactivating subscription plan {PlanId}", planId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("plans/recommended")]
        public async Task<ActionResult<List<SubscriptionPlan>>> GetRecommendedPlans()
        {
            try
            {
                var userId = GetUserId();
                var plans = await _revenueService.GetRecommendedPlansAsync(userId);
                return Ok(plans);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recommended plans");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("plans/compare")]
        public async Task<ActionResult<PlanComparison>> ComparePlans(List<Guid> planIds)
        {
            try
            {
                var comparison = await _revenueService.ComparePlansAsync(planIds);
                return Ok(comparison);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error comparing plans");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Payment Methods
        [HttpPost("payment-methods")]
        public async Task<ActionResult<PaymentMethod>> AddPaymentMethod(AddPaymentMethodRequest request)
        {
            try
            {
                var userId = GetUserId();
                var paymentMethod = await _revenueService.AddPaymentMethodAsync(userId, request);
                return Ok(paymentMethod);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding payment method");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("payment-methods")]
        public async Task<ActionResult<List<PaymentMethod>>> GetPaymentMethods()
        {
            try
            {
                var userId = GetUserId();
                var paymentMethods = await _revenueService.GetPaymentMethodsAsync(userId);
                return Ok(paymentMethods);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment methods");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("payment-methods/{paymentMethodId}")]
        public async Task<ActionResult<PaymentMethod>> GetPaymentMethod(Guid paymentMethodId)
        {
            try
            {
                var paymentMethod = await _revenueService.GetPaymentMethodAsync(paymentMethodId);
                return Ok(paymentMethod);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting payment method {PaymentMethodId}", paymentMethodId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("payment-methods/{paymentMethodId}")]
        public async Task<ActionResult> UpdatePaymentMethod(Guid paymentMethodId, UpdatePaymentMethodRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.UpdatePaymentMethodAsync(paymentMethodId, userId, request);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment method {PaymentMethodId}", paymentMethodId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("payment-methods/{paymentMethodId}")]
        public async Task<ActionResult> DeletePaymentMethod(Guid paymentMethodId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.DeletePaymentMethodAsync(paymentMethodId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting payment method {PaymentMethodId}", paymentMethodId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("payment-methods/{paymentMethodId}/set-default")]
        public async Task<ActionResult> SetDefaultPaymentMethod(Guid paymentMethodId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.SetDefaultPaymentMethodAsync(paymentMethodId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting default payment method {PaymentMethodId}", paymentMethodId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Payments
        [HttpPost("payments")]
        public async Task<ActionResult<PaymentResult>> ProcessPayment(ProcessPaymentRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _revenueService.ProcessPaymentAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("subscriptions/{subscriptionId}/payments")]
        public async Task<ActionResult<PaymentResult>> ProcessSubscriptionPayment(Guid subscriptionId, ProcessSubscriptionPaymentRequest request)
        {
            try
            {
                var result = await _revenueService.ProcessSubscriptionPaymentAsync(subscriptionId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing subscription payment {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("payments/{paymentId}/refund")]
        public async Task<ActionResult<RefundResult>> ProcessRefund(Guid paymentId, ProcessRefundRequest request)
        {
            try
            {
                var userId = GetUserId();
                var result = await _revenueService.ProcessRefundAsync(paymentId, userId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing refund for payment {PaymentId}", paymentId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Transactions
        [HttpGet("transactions")]
        public async Task<ActionResult<List<Transaction>>> GetTransactions([FromQuery] TransactionFilter? filter = null)
        {
            try
            {
                var userId = GetUserId();
                var transactions = await _revenueService.GetTransactionsAsync(userId, filter);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transactions");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("transactions/{transactionId}")]
        public async Task<ActionResult<Transaction>> GetTransaction(Guid transactionId)
        {
            try
            {
                var transaction = await _revenueService.GetTransactionAsync(transactionId);
                return Ok(transaction);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction {TransactionId}", transactionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("transactions/all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<Transaction>>> GetAllTransactions([FromQuery] TransactionFilter? filter = null)
        {
            try
            {
                var transactions = await _revenueService.GetAllTransactionsAsync(filter);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all transactions");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Invoices
        [HttpPost("subscriptions/{subscriptionId}/invoices")]
        public async Task<ActionResult<Invoice>> GenerateInvoice(Guid subscriptionId, GenerateInvoiceRequest request)
        {
            try
            {
                var invoice = await _revenueService.GenerateInvoiceAsync(subscriptionId, request);
                return Ok(invoice);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating invoice for subscription {SubscriptionId}", subscriptionId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("invoices")]
        public async Task<ActionResult<List<Invoice>>> GetInvoices([FromQuery] InvoiceFilter? filter = null)
        {
            try
            {
                var userId = GetUserId();
                var invoices = await _revenueService.GetInvoicesAsync(userId, filter);
                return Ok(invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoices");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("invoices/{invoiceId}")]
        public async Task<ActionResult<Invoice>> GetInvoice(Guid invoiceId)
        {
            try
            {
                var invoice = await _revenueService.GetInvoiceAsync(invoiceId);
                return Ok(invoice);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting invoice {InvoiceId}", invoiceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("invoices/{invoiceId}/send")]
        public async Task<ActionResult> SendInvoice(Guid invoiceId, SendInvoiceRequest request)
        {
            try
            {
                var success = await _revenueService.SendInvoiceAsync(invoiceId, request);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending invoice {InvoiceId}", invoiceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("invoices/{invoiceId}/mark-paid")]
        public async Task<ActionResult> MarkInvoiceAsPaid(Guid invoiceId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.MarkInvoiceAsPaidAsync(invoiceId, userId);
                return Ok(new { success });
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking invoice as paid {InvoiceId}", invoiceId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // Revenue Analytics
        [HttpGet("analytics/revenue")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RevenueAnalytics>> GetRevenueAnalytics([FromQuery] RevenueAnalyticsFilter filter)
        {
            try
            {
                var analytics = await _revenueService.GetRevenueAnalyticsAsync(filter);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue analytics");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/metrics")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<RevenueMetric>>> GetRevenueMetrics([FromQuery] RevenueMetricsFilter filter)
        {
            try
            {
                var metrics = await _revenueService.GetRevenueMetricsAsync(filter);
                return Ok(metrics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue metrics");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/mrr")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MrrAnalysis>> GetMrrAnalysis([FromQuery] MrrAnalysisFilter filter)
        {
            try
            {
                var analysis = await _revenueService.GetMrrAnalysisAsync(filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting MRR analysis");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/churn")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ChurnAnalysis>> GetChurnAnalysis([FromQuery] ChurnAnalysisFilter filter)
        {
            try
            {
                var analysis = await _revenueService.GetChurnAnalysisAsync(filter);
                return Ok(analysis);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting churn analysis");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/insights")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<RevenueInsight>>> GetRevenueInsights([FromQuery] RevenueInsightsFilter filter)
        {
            try
            {
                var insights = await _revenueService.GetRevenueInsightsAsync(filter);
                return Ok(insights);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue insights");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/forecast")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<RevenueForecast>> GetRevenueForecast([FromQuery] RevenueForecastFilter filter)
        {
            try
            {
                var forecast = await _revenueService.GetRevenueForecastAsync(filter);
                return Ok(forecast);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue forecast");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/clv/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CustomerLifetimeValue>> GetCustomerLifetimeValue(Guid userId)
        {
            try
            {
                var clv = await _revenueService.CalculateCustomerLifetimeValueAsync(userId);
                return Ok(clv);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating customer lifetime value for user {UserId}", userId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("analytics/clv")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<List<CustomerLifetimeValue>>> GetCustomerLifetimeValues([FromQuery] ClvFilter filter)
        {
            try
            {
                var clvs = await _revenueService.GetCustomerLifetimeValuesAsync(filter);
                return Ok(clvs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer lifetime values");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Marketplace
        [HttpPost("marketplace/items")]
        public async Task<ActionResult<MarketplaceItem>> CreateMarketplaceItem(CreateMarketplaceItemRequest request)
        {
            try
            {
                var userId = GetUserId();
                var item = await _revenueService.CreateMarketplaceItemAsync(userId, request);
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating marketplace item");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("marketplace/items")]
        public async Task<ActionResult<List<MarketplaceItem>>> GetMarketplaceItems([FromQuery] MarketplaceFilter? filter = null)
        {
            try
            {
                var items = await _revenueService.GetMarketplaceItemsAsync(filter);
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting marketplace items");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("marketplace/items/{itemId}")]
        public async Task<ActionResult<MarketplaceItem>> GetMarketplaceItem(Guid itemId)
        {
            try
            {
                var item = await _revenueService.GetMarketplaceItemAsync(itemId);
                return Ok(item);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting marketplace item {ItemId}", itemId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("marketplace/items/{itemId}")]
        public async Task<ActionResult<MarketplaceItem>> UpdateMarketplaceItem(Guid itemId, UpdateMarketplaceItemRequest request)
        {
            try
            {
                var userId = GetUserId();
                var item = await _revenueService.UpdateMarketplaceItemAsync(itemId, userId, request);
                return Ok(item);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating marketplace item {ItemId}", itemId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("marketplace/items/{itemId}")]
        public async Task<ActionResult> DeleteMarketplaceItem(Guid itemId)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.DeleteMarketplaceItemAsync(itemId, userId);
                return Ok(new { success });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting marketplace item {ItemId}", itemId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("marketplace/items/{itemId}/purchase")]
        public async Task<ActionResult<MarketplaceSale>> PurchaseMarketplaceItem(Guid itemId, PurchaseMarketplaceItemRequest request)
        {
            try
            {
                var userId = GetUserId();
                var sale = await _revenueService.PurchaseMarketplaceItemAsync(itemId, userId, request);
                return Ok(sale);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error purchasing marketplace item {ItemId}", itemId);
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("marketplace/sales")]
        public async Task<ActionResult<List<MarketplaceSale>>> GetMarketplaceSales([FromQuery] MarketplaceSalesFilter? filter = null)
        {
            try
            {
                var userId = GetUserId();
                var sales = await _revenueService.GetMarketplaceSalesAsync(userId, filter);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting marketplace sales");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("marketplace/revenue-shares")]
        public async Task<ActionResult<List<RevenueShare>>> GetRevenueShares([FromQuery] RevenueShareFilter? filter = null)
        {
            try
            {
                var userId = GetUserId();
                var shares = await _revenueService.GetRevenueSharesAsync(userId, filter);
                return Ok(shares);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting revenue shares");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("marketplace/revenue-shares/payout")]
        public async Task<ActionResult> ProcessRevenueSharePayout(ProcessRevenueSharePayoutRequest request)
        {
            try
            {
                var userId = GetUserId();
                var success = await _revenueService.ProcessRevenueSharePayoutAsync(userId, request);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing revenue share payout");
                return BadRequest(new { message = ex.Message });
            }
        }

        // Tax Calculation
        [HttpPost("tax/calculate")]
        public async Task<ActionResult<TaxCalculation>> CalculateTax(TaxCalculationRequest request)
        {
            try
            {
                var userId = GetUserId();
                var calculation = await _revenueService.CalculateTaxAsync(userId, request);
                return Ok(calculation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating tax");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}