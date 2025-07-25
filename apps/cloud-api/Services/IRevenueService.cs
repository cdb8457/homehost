using HomeHost.CloudApi.Models;

namespace HomeHost.CloudApi.Services
{
    public interface IRevenueService
    {
        // Subscription Management
        Task<Subscription> CreateSubscriptionAsync(Guid userId, CreateSubscriptionRequest request);
        Task<List<Subscription>> GetSubscriptionsAsync(SubscriptionFilter? filter = null);
        Task<Subscription> GetSubscriptionAsync(Guid subscriptionId);
        Task<List<Subscription>> GetUserSubscriptionsAsync(Guid userId);
        Task<Subscription> UpdateSubscriptionAsync(Guid subscriptionId, Guid userId, UpdateSubscriptionRequest request);
        Task<bool> CancelSubscriptionAsync(Guid subscriptionId, Guid userId, CancelSubscriptionRequest request);
        Task<bool> RenewSubscriptionAsync(Guid subscriptionId, Guid userId);
        Task<bool> UpgradeSubscriptionAsync(Guid subscriptionId, Guid userId, UpgradeSubscriptionRequest request);
        Task<bool> DowngradeSubscriptionAsync(Guid subscriptionId, Guid userId, DowngradeSubscriptionRequest request);
        Task<bool> SuspendSubscriptionAsync(Guid subscriptionId, Guid userId, SuspendSubscriptionRequest request);
        Task<bool> ReactivateSubscriptionAsync(Guid subscriptionId, Guid userId);

        // Subscription Plans
        Task<SubscriptionPlan> CreateSubscriptionPlanAsync(Guid creatorId, CreateSubscriptionPlanRequest request);
        Task<List<SubscriptionPlan>> GetSubscriptionPlansAsync(bool includeInactive = false);
        Task<SubscriptionPlan> GetSubscriptionPlanAsync(Guid planId);
        Task<SubscriptionPlan> UpdateSubscriptionPlanAsync(Guid planId, Guid userId, UpdateSubscriptionPlanRequest request);
        Task<bool> DeactivateSubscriptionPlanAsync(Guid planId, Guid userId);
        Task<List<SubscriptionPlan>> GetRecommendedPlansAsync(Guid userId);
        Task<PlanComparison> ComparePlansAsync(List<Guid> planIds);

        // Payment Processing
        Task<PaymentMethod> AddPaymentMethodAsync(Guid userId, AddPaymentMethodRequest request);
        Task<List<PaymentMethod>> GetPaymentMethodsAsync(Guid userId);
        Task<PaymentMethod> GetPaymentMethodAsync(Guid paymentMethodId);
        Task<bool> UpdatePaymentMethodAsync(Guid paymentMethodId, Guid userId, UpdatePaymentMethodRequest request);
        Task<bool> DeletePaymentMethodAsync(Guid paymentMethodId, Guid userId);
        Task<bool> SetDefaultPaymentMethodAsync(Guid paymentMethodId, Guid userId);
        Task<PaymentResult> ProcessPaymentAsync(Guid userId, ProcessPaymentRequest request);
        Task<PaymentResult> ProcessSubscriptionPaymentAsync(Guid subscriptionId, ProcessSubscriptionPaymentRequest request);
        Task<RefundResult> ProcessRefundAsync(Guid paymentId, Guid userId, ProcessRefundRequest request);

        // Transactions & Billing
        Task<List<Transaction>> GetTransactionsAsync(Guid userId, TransactionFilter? filter = null);
        Task<Transaction> GetTransactionAsync(Guid transactionId);
        Task<List<Transaction>> GetAllTransactionsAsync(TransactionFilter? filter = null);
        Task<Invoice> GenerateInvoiceAsync(Guid subscriptionId, GenerateInvoiceRequest request);
        Task<List<Invoice>> GetInvoicesAsync(Guid userId, InvoiceFilter? filter = null);
        Task<Invoice> GetInvoiceAsync(Guid invoiceId);
        Task<bool> SendInvoiceAsync(Guid invoiceId, SendInvoiceRequest request);
        Task<bool> MarkInvoiceAsPaidAsync(Guid invoiceId, Guid userId);
        Task<TaxCalculation> CalculateTaxAsync(Guid userId, TaxCalculationRequest request);

        // Revenue Analytics
        Task<RevenueAnalytics> GetRevenueAnalyticsAsync(RevenueAnalyticsFilter filter);
        Task<List<RevenueMetric>> GetRevenueMetricsAsync(RevenueMetricsFilter filter);
        Task<MrrAnalysis> GetMrrAnalysisAsync(MrrAnalysisFilter filter);
        Task<ChurnAnalysis> GetChurnAnalysisAsync(ChurnAnalysisFilter filter);
        Task<List<RevenueInsight>> GetRevenueInsightsAsync(RevenueInsightsFilter filter);
        Task<RevenueForecast> GetRevenueForecastAsync(RevenueForecastFilter filter);
        Task<CustomerLifetimeValue> CalculateCustomerLifetimeValueAsync(Guid userId);
        Task<List<CustomerLifetimeValue>> GetCustomerLifetimeValuesAsync(ClvFilter filter);

        // Marketplace & Revenue Sharing
        Task<MarketplaceItem> CreateMarketplaceItemAsync(Guid creatorId, CreateMarketplaceItemRequest request);
        Task<List<MarketplaceItem>> GetMarketplaceItemsAsync(MarketplaceFilter? filter = null);
        Task<MarketplaceItem> GetMarketplaceItemAsync(Guid itemId);
        Task<MarketplaceItem> UpdateMarketplaceItemAsync(Guid itemId, Guid userId, UpdateMarketplaceItemRequest request);
        Task<bool> DeleteMarketplaceItemAsync(Guid itemId, Guid userId);
        Task<MarketplaceSale> PurchaseMarketplaceItemAsync(Guid itemId, Guid userId, PurchaseMarketplaceItemRequest request);
        Task<List<MarketplaceSale>> GetMarketplaceSalesAsync(Guid creatorId, MarketplaceSalesFilter? filter = null);
        Task<RevenueShare> CalculateRevenueShareAsync(Guid saleId);
        Task<List<RevenueShare>> GetRevenueSharesAsync(Guid creatorId, RevenueShareFilter? filter = null);
        Task<bool> ProcessRevenueSharePayoutAsync(Guid creatorId, ProcessRevenueSharePayoutRequest request);

        // Pricing & Discounts
        Task<PricingRule> CreatePricingRuleAsync(Guid creatorId, CreatePricingRuleRequest request);
        Task<List<PricingRule>> GetPricingRulesAsync(PricingRuleFilter? filter = null);
        Task<PricingRule> GetPricingRuleAsync(Guid ruleId);
        Task<PricingRule> UpdatePricingRuleAsync(Guid ruleId, Guid userId, UpdatePricingRuleRequest request);
        Task<bool> DeletePricingRuleAsync(Guid ruleId, Guid userId);
        Task<DiscountCode> CreateDiscountCodeAsync(Guid creatorId, CreateDiscountCodeRequest request);
        Task<List<DiscountCode>> GetDiscountCodesAsync(Guid creatorId, DiscountCodeFilter? filter = null);
        Task<DiscountCode> GetDiscountCodeAsync(Guid discountId);
        Task<DiscountValidation> ValidateDiscountCodeAsync(string code, Guid userId, ValidateDiscountRequest request);
        Task<bool> ApplyDiscountCodeAsync(Guid discountId, Guid userId, ApplyDiscountRequest request);
        Task<bool> DeactivateDiscountCodeAsync(Guid discountId, Guid userId);

        // Financial Reporting
        Task<FinancialReport> GenerateFinancialReportAsync(FinancialReportRequest request);
        Task<List<FinancialReport>> GetFinancialReportsAsync(FinancialReportFilter? filter = null);
        Task<TaxReport> GenerateTaxReportAsync(TaxReportRequest request);
        Task<List<TaxReport>> GetTaxReportsAsync(TaxReportFilter? filter = null);
        Task<PayoutReport> GeneratePayoutReportAsync(PayoutReportRequest request);
        Task<List<PayoutReport>> GetPayoutReportsAsync(PayoutReportFilter? filter = null);
        Task<RevenueReconciliation> ReconcileRevenueAsync(RevenueReconciliationRequest request);

        // Integration & Webhooks
        Task<WebhookEndpoint> CreateWebhookEndpointAsync(Guid userId, CreateWebhookEndpointRequest request);
        Task<List<WebhookEndpoint>> GetWebhookEndpointsAsync(Guid userId);
        Task<WebhookEndpoint> GetWebhookEndpointAsync(Guid endpointId);
        Task<bool> UpdateWebhookEndpointAsync(Guid endpointId, Guid userId, UpdateWebhookEndpointRequest request);
        Task<bool> DeleteWebhookEndpointAsync(Guid endpointId, Guid userId);
        Task<bool> SendWebhookAsync(Guid endpointId, WebhookPayload payload);
        Task<List<WebhookEvent>> GetWebhookEventsAsync(Guid endpointId, WebhookEventFilter? filter = null);
        Task<bool> RetryWebhookAsync(Guid eventId, Guid userId);

        // Compliance & Audit
        Task<List<ComplianceEvent>> GetComplianceEventsAsync(ComplianceEventFilter? filter = null);
        Task<ComplianceReport> GenerateComplianceReportAsync(ComplianceReportRequest request);
        Task<List<AuditLog>> GetRevenueAuditLogsAsync(AuditLogFilter? filter = null);
        Task<bool> RecordComplianceEventAsync(RecordComplianceEventRequest request);
        Task<DataRetentionReport> GetDataRetentionReportAsync(DataRetentionReportRequest request);
        Task<bool> ProcessDataRetentionAsync(ProcessDataRetentionRequest request);
    }

    // Data Models
    public class Subscription
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid PlanId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public DateTime NextBillingDate { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string BillingCycle { get; set; } = string.Empty;
        public int BillingInterval { get; set; } = 1;
        public decimal DiscountAmount { get; set; } = 0;
        public string? DiscountCode { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancellationReason { get; set; }
        public SubscriptionMetadata Metadata { get; set; } = new();
        public SubscriptionFeatures Features { get; set; } = new();

        // Navigation properties
        public User? User { get; set; }
        public SubscriptionPlan? Plan { get; set; }
        public List<Transaction> Transactions { get; set; } = new();
        public List<Invoice> Invoices { get; set; } = new();
    }

    public class SubscriptionMetadata
    {
        public string Source { get; set; } = string.Empty;
        public string? PromoCode { get; set; }
        public string? ReferralCode { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
        public List<string> Tags { get; set; } = new();
    }

    public class SubscriptionFeatures
    {
        public int MaxServers { get; set; } = 1;
        public int MaxPlayers { get; set; } = 10;
        public int MaxStorage { get; set; } = 1024; // MB
        public int MaxPlugins { get; set; } = 5;
        public int MaxBackups { get; set; } = 3;
        public bool AdvancedAnalytics { get; set; } = false;
        public bool PrioritySupport { get; set; } = false;
        public bool CustomDomain { get; set; } = false;
        public bool ApiAccess { get; set; } = false;
        public bool WhiteLabel { get; set; } = false;
        public Dictionary<string, object> CustomFeatures { get; set; } = new();
    }

    public class SubscriptionPlan
    {
        public Guid Id { get; set; }
        public Guid CreatorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public string BillingCycle { get; set; } = string.Empty;
        public int BillingInterval { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public bool IsPublic { get; set; } = true;
        public int SortOrder { get; set; } = 0;
        public SubscriptionFeatures Features { get; set; } = new();
        public PlanLimits Limits { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? DeactivatedAt { get; set; }
        public PlanMetadata Metadata { get; set; } = new();

        // Navigation properties
        public User? Creator { get; set; }
        public List<Subscription> Subscriptions { get; set; } = new();
    }

    public class PlanLimits
    {
        public int MaxSubscriptions { get; set; } = -1; // -1 = unlimited
        public DateTime? ValidUntil { get; set; }
        public List<string> AllowedRegions { get; set; } = new();
        public List<string> RestrictedRegions { get; set; } = new();
        public Dictionary<string, object> CustomLimits { get; set; } = new();
    }

    public class PlanMetadata
    {
        public string Category { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public string? RecommendedFor { get; set; }
        public string? PopularityBadge { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class PaymentMethod
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string ProviderPaymentMethodId { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public PaymentMethodDetails Details { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? LastUsedAt { get; set; }

        // Navigation properties
        public User? User { get; set; }
        public List<Transaction> Transactions { get; set; } = new();
    }

    public class PaymentMethodDetails
    {
        public string? Last4 { get; set; }
        public string? Brand { get; set; }
        public string? Country { get; set; }
        public int? ExpiryMonth { get; set; }
        public int? ExpiryYear { get; set; }
        public string? HolderName { get; set; }
        public Dictionary<string, object> AdditionalData { get; set; } = new();
    }

    public class Transaction
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid? SubscriptionId { get; set; }
        public Guid? PaymentMethodId { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string? Description { get; set; }
        public string? Reference { get; set; }
        public string? ProviderTransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public DateTime? FailedAt { get; set; }
        public string? FailureReason { get; set; }
        public TransactionMetadata Metadata { get; set; } = new();

        // Navigation properties
        public User? User { get; set; }
        public Subscription? Subscription { get; set; }
        public PaymentMethod? PaymentMethod { get; set; }
        public List<TransactionItem> Items { get; set; } = new();
    }

    public class TransactionItem
    {
        public Guid Id { get; set; }
        public Guid TransactionId { get; set; }
        public string Type { get; set; } = string.Empty;
        public Guid? ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal? TaxAmount { get; set; }
        public decimal? DiscountAmount { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();

        // Navigation properties
        public Transaction? Transaction { get; set; }
    }

    public class TransactionMetadata
    {
        public string? InvoiceNumber { get; set; }
        public string? TaxId { get; set; }
        public BillingAddress? BillingAddress { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class BillingAddress
    {
        public string Name { get; set; } = string.Empty;
        public string Line1 { get; set; } = string.Empty;
        public string? Line2 { get; set; }
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class Invoice
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Guid? SubscriptionId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal Total { get; set; }
        public string Currency { get; set; } = "USD";
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? SentAt { get; set; }
        public BillingAddress? BillingAddress { get; set; }
        public InvoiceMetadata Metadata { get; set; } = new();

        // Navigation properties
        public User? User { get; set; }
        public Subscription? Subscription { get; set; }
        public List<InvoiceItem> Items { get; set; } = new();
    }

    public class InvoiceItem
    {
        public Guid Id { get; set; }
        public Guid InvoiceId { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; } = 1;
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime? PeriodStart { get; set; }
        public DateTime? PeriodEnd { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();

        // Navigation properties
        public Invoice? Invoice { get; set; }
    }

    public class InvoiceMetadata
    {
        public string? TaxId { get; set; }
        public string? Notes { get; set; }
        public string? Terms { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class MarketplaceItem
    {
        public Guid Id { get; set; }
        public Guid CreatorId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public bool IsActive { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public int Downloads { get; set; } = 0;
        public decimal Rating { get; set; } = 0;
        public int ReviewCount { get; set; } = 0;
        public List<string> Tags { get; set; } = new();
        public List<string> Screenshots { get; set; } = new();
        public MarketplaceItemMetadata Metadata { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        public User? Creator { get; set; }
        public List<MarketplaceSale> Sales { get; set; } = new();
    }

    public class MarketplaceItemMetadata
    {
        public string? Version { get; set; }
        public List<string> SupportedGames { get; set; } = new();
        public string? LicenseType { get; set; }
        public string? DocumentationUrl { get; set; }
        public string? SupportUrl { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class MarketplaceSale
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public Guid BuyerId { get; set; }
        public Guid CreatorId { get; set; }
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public decimal CreatorRevenue { get; set; }
        public decimal PlatformRevenue { get; set; }
        public decimal RevenueSharePercent { get; set; }
        public DateTime CreatedAt { get; set; }
        public SaleMetadata Metadata { get; set; } = new();

        // Navigation properties
        public MarketplaceItem? Item { get; set; }
        public User? Buyer { get; set; }
        public User? Creator { get; set; }
    }

    public class SaleMetadata
    {
        public string? TransactionId { get; set; }
        public string? LicenseKey { get; set; }
        public Dictionary<string, object> CustomData { get; set; } = new();
    }

    public class RevenueShare
    {
        public Guid Id { get; set; }
        public Guid SaleId { get; set; }
        public Guid CreatorId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public decimal Percentage { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? PayoutReference { get; set; }

        // Navigation properties
        public MarketplaceSale? Sale { get; set; }
        public User? Creator { get; set; }
    }

    // Request DTOs
    public class CreateSubscriptionRequest
    {
        public Guid PlanId { get; set; }
        public Guid? PaymentMethodId { get; set; }
        public string? DiscountCode { get; set; }
        public SubscriptionMetadata Metadata { get; set; } = new();
    }

    public class UpdateSubscriptionRequest
    {
        public Guid? PlanId { get; set; }
        public Guid? PaymentMethodId { get; set; }
        public SubscriptionMetadata? Metadata { get; set; }
    }

    public class CancelSubscriptionRequest
    {
        public string Reason { get; set; } = string.Empty;
        public bool ImmediateCancel { get; set; } = false;
    }

    public class UpgradeSubscriptionRequest
    {
        public Guid NewPlanId { get; set; }
        public bool ProrateBilling { get; set; } = true;
    }

    public class DowngradeSubscriptionRequest
    {
        public Guid NewPlanId { get; set; }
        public bool ProrateBilling { get; set; } = false;
    }

    public class SuspendSubscriptionRequest
    {
        public string Reason { get; set; } = string.Empty;
        public DateTime? ReactivateAt { get; set; }
    }

    public class CreateSubscriptionPlanRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Currency { get; set; } = "USD";
        public string BillingCycle { get; set; } = string.Empty;
        public int BillingInterval { get; set; } = 1;
        public bool IsPublic { get; set; } = true;
        public SubscriptionFeatures Features { get; set; } = new();
        public PlanLimits Limits { get; set; } = new();
        public PlanMetadata Metadata { get; set; } = new();
    }

    public class UpdateSubscriptionPlanRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public bool? IsPublic { get; set; }
        public SubscriptionFeatures? Features { get; set; }
        public PlanLimits? Limits { get; set; }
        public PlanMetadata? Metadata { get; set; }
    }

    public class AddPaymentMethodRequest
    {
        public string Type { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string ProviderPaymentMethodId { get; set; } = string.Empty;
        public bool SetAsDefault { get; set; } = false;
        public PaymentMethodDetails Details { get; set; } = new();
    }

    public class UpdatePaymentMethodRequest
    {
        public PaymentMethodDetails? Details { get; set; }
        public bool? IsDefault { get; set; }
    }

    public class ProcessPaymentRequest
    {
        public Guid? PaymentMethodId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string? Description { get; set; }
        public List<TransactionItem> Items { get; set; } = new();
        public TransactionMetadata Metadata { get; set; } = new();
    }

    public class ProcessSubscriptionPaymentRequest
    {
        public Guid? PaymentMethodId { get; set; }
        public bool SendInvoice { get; set; } = true;
    }

    public class ProcessRefundRequest
    {
        public decimal? Amount { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    // Response DTOs
    public class PaymentResult
    {
        public bool Success { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? TransactionId { get; set; }
        public string? ErrorMessage { get; set; }
        public Dictionary<string, object> Metadata { get; set; } = new();
    }

    public class RefundResult
    {
        public bool Success { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RefundId { get; set; }
        public decimal RefundAmount { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class PlanComparison
    {
        public List<SubscriptionPlan> Plans { get; set; } = new();
        public Dictionary<string, List<ComparisonFeature>> Features { get; set; } = new();
    }

    public class ComparisonFeature
    {
        public string Name { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public bool IsHighlight { get; set; } = false;
    }

    // Analytics Models
    public class RevenueAnalytics
    {
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRecurringRevenue { get; set; }
        public decimal AnnualRecurringRevenue { get; set; }
        public decimal AverageRevenuePerUser { get; set; }
        public int ActiveSubscriptions { get; set; }
        public int NewSubscriptions { get; set; }
        public int CancelledSubscriptions { get; set; }
        public decimal ChurnRate { get; set; }
        public decimal GrowthRate { get; set; }
        public List<RevenueDataPoint> RevenueHistory { get; set; } = new();
    }

    public class RevenueDataPoint
    {
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string Type { get; set; } = string.Empty;
    }

    public class RevenueMetric
    {
        public string Name { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal? PreviousValue { get; set; }
        public decimal? Change { get; set; }
        public string? ChangeType { get; set; }
    }

    public class MrrAnalysis
    {
        public decimal CurrentMrr { get; set; }
        public decimal PreviousMrr { get; set; }
        public decimal GrowthAmount { get; set; }
        public decimal GrowthRate { get; set; }
        public List<MrrComponent> Components { get; set; } = new();
    }

    public class MrrComponent
    {
        public string Type { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int Count { get; set; }
    }

    public class ChurnAnalysis
    {
        public decimal ChurnRate { get; set; }
        public decimal RevenueChurnRate { get; set; }
        public int ChurnedCustomers { get; set; }
        public decimal ChurnedRevenue { get; set; }
        public List<ChurnReason> ChurnReasons { get; set; } = new();
    }

    public class ChurnReason
    {
        public string Reason { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Percentage { get; set; }
    }

    public class RevenueInsight
    {
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Impact { get; set; } = string.Empty;
        public List<string> Recommendations { get; set; } = new();
    }

    public class RevenueForecast
    {
        public List<ForecastDataPoint> Predictions { get; set; } = new();
        public decimal ConfidenceScore { get; set; }
        public string ModelUsed { get; set; } = string.Empty;
    }

    public class ForecastDataPoint
    {
        public DateTime Date { get; set; }
        public decimal PredictedRevenue { get; set; }
        public decimal LowerBound { get; set; }
        public decimal UpperBound { get; set; }
    }

    public class CustomerLifetimeValue
    {
        public Guid UserId { get; set; }
        public decimal TotalValue { get; set; }
        public decimal PredictedValue { get; set; }
        public int MonthsActive { get; set; }
        public decimal AverageMonthlySpend { get; set; }
        public decimal ChurnProbability { get; set; }
    }

    // Filter Classes
    public class SubscriptionFilter
    {
        public string? Status { get; set; }
        public Guid? PlanId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class TransactionFilter
    {
        public string? Type { get; set; }
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class InvoiceFilter
    {
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class MarketplaceFilter
    {
        public string? Type { get; set; }
        public string? Category { get; set; }
        public Guid? CreatorId { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsFeatured { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public string? Search { get; set; }
        public List<string>? Tags { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    public class RevenueAnalyticsFilter
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Currency { get; set; }
        public string? Granularity { get; set; } = "daily";
    }

    public class RevenueMetricsFilter
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<string>? MetricNames { get; set; }
    }

    public class MrrAnalysisFilter
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Currency { get; set; }
    }

    public class ChurnAnalysisFilter
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Granularity { get; set; } = "monthly";
    }

    public class RevenueInsightsFilter
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<string>? InsightTypes { get; set; }
    }

    public class RevenueForecastFilter
    {
        public DateTime StartDate { get; set; }
        public int PredictionDays { get; set; } = 90;
        public string? Currency { get; set; }
    }

    public class ClvFilter
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MinMonthsActive { get; set; }
        public decimal? MinValue { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
        public int? Skip { get; set; }
        public int? Take { get; set; }
    }

    // Placeholder classes for additional complex types
    public class TaxCalculation { }
    public class TaxCalculationRequest { }
    public class GenerateInvoiceRequest { }
    public class SendInvoiceRequest { }
    public class CreateMarketplaceItemRequest { }
    public class UpdateMarketplaceItemRequest { }
    public class PurchaseMarketplaceItemRequest { }
    public class MarketplaceSalesFilter { }
    public class RevenueShareFilter { }
    public class ProcessRevenueSharePayoutRequest { }
    public class PricingRule { }
    public class CreatePricingRuleRequest { }
    public class UpdatePricingRuleRequest { }
    public class PricingRuleFilter { }
    public class DiscountCode { }
    public class CreateDiscountCodeRequest { }
    public class DiscountCodeFilter { }
    public class DiscountValidation { }
    public class ValidateDiscountRequest { }
    public class ApplyDiscountRequest { }
    public class FinancialReport { }
    public class FinancialReportRequest { }
    public class FinancialReportFilter { }
    public class TaxReport { }
    public class TaxReportRequest { }
    public class TaxReportFilter { }
    public class PayoutReport { }
    public class PayoutReportRequest { }
    public class PayoutReportFilter { }
    public class RevenueReconciliation { }
    public class RevenueReconciliationRequest { }
    public class WebhookEndpoint { }
    public class CreateWebhookEndpointRequest { }
    public class UpdateWebhookEndpointRequest { }
    public class WebhookPayload { }
    public class WebhookEvent { }
    public class WebhookEventFilter { }
    public class ComplianceEvent { }
    public class ComplianceEventFilter { }
    public class ComplianceReport { }
    public class ComplianceReportRequest { }
    public class AuditLog { }
    public class AuditLogFilter { }
    public class RecordComplianceEventRequest { }
    public class DataRetentionReport { }
    public class DataRetentionReportRequest { }
    public class ProcessDataRetentionRequest { }
}