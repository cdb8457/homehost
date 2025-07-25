using Microsoft.EntityFrameworkCore;
using HomeHost.CloudApi.Models;
using HomeHost.CloudApi.Data;
using System.Text.Json;

namespace HomeHost.CloudApi.Services
{
    public class RevenueService : IRevenueService
    {
        private readonly HomeHostContext _context;
        private readonly ILogger<RevenueService> _logger;

        public RevenueService(
            HomeHostContext context,
            ILogger<RevenueService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Subscription Management
        public async Task<Subscription> CreateSubscriptionAsync(Guid userId, CreateSubscriptionRequest request)
        {
            var plan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == request.PlanId);

            if (plan == null)
            {
                throw new ArgumentException("Invalid subscription plan");
            }

            var subscription = new Subscription
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PlanId = request.PlanId,
                Status = "Active",
                StartDate = DateTime.UtcNow,
                NextBillingDate = CalculateNextBillingDate(DateTime.UtcNow, plan.BillingCycle, plan.BillingInterval),
                Amount = plan.Price,
                Currency = plan.Currency,
                BillingCycle = plan.BillingCycle,
                BillingInterval = plan.BillingInterval,
                Features = plan.Features,
                Metadata = request.Metadata,
                CreatedAt = DateTime.UtcNow
            };

            _context.Subscriptions.Add(subscription);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} created for user {UserId}", 
                subscription.Id, userId);

            return subscription;
        }

        public async Task<List<Subscription>> GetSubscriptionsAsync(SubscriptionFilter? filter = null)
        {
            var query = _context.Subscriptions
                .Include(s => s.User)
                .Include(s => s.Plan)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(s => s.Status == filter.Status);

                if (filter.PlanId.HasValue)
                    query = query.Where(s => s.PlanId == filter.PlanId.Value);

                if (filter.StartDate.HasValue)
                    query = query.Where(s => s.StartDate >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(s => s.EndDate <= filter.EndDate.Value);

                // Apply sorting
                if (!string.IsNullOrEmpty(filter.SortBy))
                {
                    switch (filter.SortBy.ToLower())
                    {
                        case "created":
                            query = filter.SortDirection?.ToLower() == "desc" 
                                ? query.OrderByDescending(s => s.CreatedAt)
                                : query.OrderBy(s => s.CreatedAt);
                            break;
                        case "amount":
                            query = filter.SortDirection?.ToLower() == "desc" 
                                ? query.OrderByDescending(s => s.Amount)
                                : query.OrderBy(s => s.Amount);
                            break;
                        default:
                            query = query.OrderByDescending(s => s.CreatedAt);
                            break;
                    }
                }
                else
                {
                    query = query.OrderByDescending(s => s.CreatedAt);
                }

                // Apply pagination
                if (filter.Skip.HasValue)
                    query = query.Skip(filter.Skip.Value);

                if (filter.Take.HasValue)
                    query = query.Take(filter.Take.Value);
            }
            else
            {
                query = query.OrderByDescending(s => s.CreatedAt);
            }

            return await query.ToListAsync();
        }

        public async Task<Subscription> GetSubscriptionAsync(Guid subscriptionId)
        {
            var subscription = await _context.Subscriptions
                .Include(s => s.User)
                .Include(s => s.Plan)
                .Include(s => s.Transactions)
                .Include(s => s.Invoices)
                .FirstOrDefaultAsync(s => s.Id == subscriptionId);

            if (subscription == null)
            {
                throw new KeyNotFoundException($"Subscription {subscriptionId} not found");
            }

            return subscription;
        }

        public async Task<List<Subscription>> GetUserSubscriptionsAsync(Guid userId)
        {
            return await _context.Subscriptions
                .Include(s => s.Plan)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<Subscription> UpdateSubscriptionAsync(Guid subscriptionId, Guid userId, UpdateSubscriptionRequest request)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            if (subscription.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to update this subscription");
            }

            if (request.PlanId.HasValue && request.PlanId != subscription.PlanId)
            {
                var newPlan = await _context.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.Id == request.PlanId.Value);

                if (newPlan == null)
                {
                    throw new ArgumentException("Invalid subscription plan");
                }

                subscription.PlanId = request.PlanId.Value;
                subscription.Amount = newPlan.Price;
                subscription.Currency = newPlan.Currency;
                subscription.BillingCycle = newPlan.BillingCycle;
                subscription.BillingInterval = newPlan.BillingInterval;
                subscription.Features = newPlan.Features;
            }

            if (request.PaymentMethodId.HasValue)
            {
                // Update payment method logic would go here
            }

            if (request.Metadata != null)
            {
                subscription.Metadata = request.Metadata;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} updated by user {UserId}", 
                subscriptionId, userId);

            return subscription;
        }

        public async Task<bool> CancelSubscriptionAsync(Guid subscriptionId, Guid userId, CancelSubscriptionRequest request)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            if (subscription.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to cancel this subscription");
            }

            subscription.Status = "Cancelled";
            subscription.CancelledAt = DateTime.UtcNow;
            subscription.CancellationReason = request.Reason;

            if (request.ImmediateCancel)
            {
                subscription.EndDate = DateTime.UtcNow;
            }
            else
            {
                subscription.EndDate = subscription.NextBillingDate;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} cancelled by user {UserId}", 
                subscriptionId, userId);

            return true;
        }

        public async Task<bool> RenewSubscriptionAsync(Guid subscriptionId, Guid userId)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            if (subscription.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to renew this subscription");
            }

            subscription.Status = "Active";
            subscription.NextBillingDate = CalculateNextBillingDate(
                subscription.NextBillingDate, 
                subscription.BillingCycle, 
                subscription.BillingInterval);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} renewed by user {UserId}", 
                subscriptionId, userId);

            return true;
        }

        public async Task<bool> UpgradeSubscriptionAsync(Guid subscriptionId, Guid userId, UpgradeSubscriptionRequest request)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            if (subscription.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to upgrade this subscription");
            }

            var newPlan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == request.NewPlanId);

            if (newPlan == null)
            {
                throw new ArgumentException("Invalid subscription plan");
            }

            if (newPlan.Price <= subscription.Amount)
            {
                throw new ArgumentException("New plan must be more expensive than current plan");
            }

            subscription.PlanId = request.NewPlanId;
            subscription.Amount = newPlan.Price;
            subscription.Currency = newPlan.Currency;
            subscription.BillingCycle = newPlan.BillingCycle;
            subscription.BillingInterval = newPlan.BillingInterval;
            subscription.Features = newPlan.Features;

            if (request.ProrateBilling)
            {
                // Calculate prorated amount for immediate charge
                var prorationAmount = CalculateProrationAmount(subscription, newPlan);
                // Process prorated payment (implementation would go here)
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} upgraded by user {UserId}", 
                subscriptionId, userId);

            return true;
        }

        public async Task<bool> DowngradeSubscriptionAsync(Guid subscriptionId, Guid userId, DowngradeSubscriptionRequest request)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            if (subscription.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to downgrade this subscription");
            }

            var newPlan = await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == request.NewPlanId);

            if (newPlan == null)
            {
                throw new ArgumentException("Invalid subscription plan");
            }

            if (newPlan.Price >= subscription.Amount)
            {
                throw new ArgumentException("New plan must be less expensive than current plan");
            }

            subscription.PlanId = request.NewPlanId;
            subscription.Amount = newPlan.Price;
            subscription.Currency = newPlan.Currency;
            subscription.BillingCycle = newPlan.BillingCycle;
            subscription.BillingInterval = newPlan.BillingInterval;
            subscription.Features = newPlan.Features;

            if (request.ProrateBilling)
            {
                // Calculate prorated credit for next billing cycle
                var prorationCredit = CalculateProrationCredit(subscription, newPlan);
                // Apply credit to next billing cycle (implementation would go here)
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} downgraded by user {UserId}", 
                subscriptionId, userId);

            return true;
        }

        public async Task<bool> SuspendSubscriptionAsync(Guid subscriptionId, Guid userId, SuspendSubscriptionRequest request)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            if (subscription.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to suspend this subscription");
            }

            subscription.Status = "Suspended";
            subscription.CancellationReason = request.Reason;

            if (request.ReactivateAt.HasValue)
            {
                subscription.NextBillingDate = request.ReactivateAt.Value;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} suspended by user {UserId}", 
                subscriptionId, userId);

            return true;
        }

        public async Task<bool> ReactivateSubscriptionAsync(Guid subscriptionId, Guid userId)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            if (subscription.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to reactivate this subscription");
            }

            subscription.Status = "Active";
            subscription.CancellationReason = null;
            subscription.NextBillingDate = CalculateNextBillingDate(
                DateTime.UtcNow, 
                subscription.BillingCycle, 
                subscription.BillingInterval);

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription {SubscriptionId} reactivated by user {UserId}", 
                subscriptionId, userId);

            return true;
        }

        // Subscription Plans
        public async Task<SubscriptionPlan> CreateSubscriptionPlanAsync(Guid creatorId, CreateSubscriptionPlanRequest request)
        {
            var plan = new SubscriptionPlan
            {
                Id = Guid.NewGuid(),
                CreatorId = creatorId,
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                Currency = request.Currency,
                BillingCycle = request.BillingCycle,
                BillingInterval = request.BillingInterval,
                IsPublic = request.IsPublic,
                Features = request.Features,
                Limits = request.Limits,
                Metadata = request.Metadata,
                CreatedAt = DateTime.UtcNow
            };

            _context.SubscriptionPlans.Add(plan);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription plan {PlanId} created by user {UserId}", 
                plan.Id, creatorId);

            return plan;
        }

        public async Task<List<SubscriptionPlan>> GetSubscriptionPlansAsync(bool includeInactive = false)
        {
            var query = _context.SubscriptionPlans
                .Include(p => p.Creator)
                .AsQueryable();

            if (!includeInactive)
            {
                query = query.Where(p => p.IsActive);
            }

            return await query
                .OrderBy(p => p.SortOrder)
                .ThenBy(p => p.Price)
                .ToListAsync();
        }

        public async Task<SubscriptionPlan> GetSubscriptionPlanAsync(Guid planId)
        {
            var plan = await _context.SubscriptionPlans
                .Include(p => p.Creator)
                .FirstOrDefaultAsync(p => p.Id == planId);

            if (plan == null)
            {
                throw new KeyNotFoundException($"Subscription plan {planId} not found");
            }

            return plan;
        }

        public async Task<SubscriptionPlan> UpdateSubscriptionPlanAsync(Guid planId, Guid userId, UpdateSubscriptionPlanRequest request)
        {
            var plan = await GetSubscriptionPlanAsync(planId);

            if (plan.CreatorId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to update this plan");
            }

            if (!string.IsNullOrEmpty(request.Name))
                plan.Name = request.Name;

            if (!string.IsNullOrEmpty(request.Description))
                plan.Description = request.Description;

            if (request.Price.HasValue)
                plan.Price = request.Price.Value;

            if (request.IsPublic.HasValue)
                plan.IsPublic = request.IsPublic.Value;

            if (request.Features != null)
                plan.Features = request.Features;

            if (request.Limits != null)
                plan.Limits = request.Limits;

            if (request.Metadata != null)
                plan.Metadata = request.Metadata;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription plan {PlanId} updated by user {UserId}", 
                planId, userId);

            return plan;
        }

        public async Task<bool> DeactivateSubscriptionPlanAsync(Guid planId, Guid userId)
        {
            var plan = await GetSubscriptionPlanAsync(planId);

            if (plan.CreatorId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to deactivate this plan");
            }

            plan.IsActive = false;
            plan.DeactivatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Subscription plan {PlanId} deactivated by user {UserId}", 
                planId, userId);

            return true;
        }

        public async Task<List<SubscriptionPlan>> GetRecommendedPlansAsync(Guid userId)
        {
            // Simple recommendation logic - would be enhanced with ML in production
            var userSubscriptions = await _context.Subscriptions
                .Where(s => s.UserId == userId)
                .ToListAsync();

            var currentPlan = userSubscriptions
                .OrderByDescending(s => s.CreatedAt)
                .FirstOrDefault()?.PlanId;

            var plans = await GetSubscriptionPlansAsync();

            if (currentPlan.HasValue)
            {
                var current = plans.FirstOrDefault(p => p.Id == currentPlan.Value);
                if (current != null)
                {
                    // Recommend plans with similar or higher features
                    return plans.Where(p => p.Price >= current.Price).ToList();
                }
            }

            return plans.Take(3).ToList();
        }

        public async Task<PlanComparison> ComparePlansAsync(List<Guid> planIds)
        {
            var plans = await _context.SubscriptionPlans
                .Where(p => planIds.Contains(p.Id))
                .ToListAsync();

            var comparison = new PlanComparison
            {
                Plans = plans,
                Features = new Dictionary<string, List<ComparisonFeature>>()
            };

            // Build feature comparison matrix
            foreach (var plan in plans)
            {
                var features = new List<ComparisonFeature>
                {
                    new() { Name = "Max Servers", Value = plan.Features.MaxServers.ToString() },
                    new() { Name = "Max Players", Value = plan.Features.MaxPlayers.ToString() },
                    new() { Name = "Storage", Value = $"{plan.Features.MaxStorage} MB" },
                    new() { Name = "Plugins", Value = plan.Features.MaxPlugins.ToString() },
                    new() { Name = "Backups", Value = plan.Features.MaxBackups.ToString() },
                    new() { Name = "Analytics", Value = plan.Features.AdvancedAnalytics ? "Yes" : "No" },
                    new() { Name = "Priority Support", Value = plan.Features.PrioritySupport ? "Yes" : "No" }
                };

                comparison.Features[plan.Id.ToString()] = features;
            }

            return comparison;
        }

        // Payment Processing
        public async Task<PaymentMethod> AddPaymentMethodAsync(Guid userId, AddPaymentMethodRequest request)
        {
            var paymentMethod = new PaymentMethod
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Type = request.Type,
                Provider = request.Provider,
                ProviderPaymentMethodId = request.ProviderPaymentMethodId,
                IsDefault = request.SetAsDefault,
                Details = request.Details,
                CreatedAt = DateTime.UtcNow
            };

            if (request.SetAsDefault)
            {
                // Set all other payment methods as non-default
                var existingMethods = await _context.PaymentMethods
                    .Where(pm => pm.UserId == userId)
                    .ToListAsync();

                foreach (var method in existingMethods)
                {
                    method.IsDefault = false;
                }
            }

            _context.PaymentMethods.Add(paymentMethod);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment method {PaymentMethodId} added for user {UserId}", 
                paymentMethod.Id, userId);

            return paymentMethod;
        }

        public async Task<List<PaymentMethod>> GetPaymentMethodsAsync(Guid userId)
        {
            return await _context.PaymentMethods
                .Where(pm => pm.UserId == userId && pm.IsActive)
                .OrderByDescending(pm => pm.IsDefault)
                .ThenByDescending(pm => pm.CreatedAt)
                .ToListAsync();
        }

        public async Task<PaymentMethod> GetPaymentMethodAsync(Guid paymentMethodId)
        {
            var paymentMethod = await _context.PaymentMethods
                .FirstOrDefaultAsync(pm => pm.Id == paymentMethodId);

            if (paymentMethod == null)
            {
                throw new KeyNotFoundException($"Payment method {paymentMethodId} not found");
            }

            return paymentMethod;
        }

        public async Task<bool> UpdatePaymentMethodAsync(Guid paymentMethodId, Guid userId, UpdatePaymentMethodRequest request)
        {
            var paymentMethod = await GetPaymentMethodAsync(paymentMethodId);

            if (paymentMethod.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to update this payment method");
            }

            if (request.Details != null)
                paymentMethod.Details = request.Details;

            if (request.IsDefault.HasValue && request.IsDefault.Value)
            {
                // Set all other payment methods as non-default
                var existingMethods = await _context.PaymentMethods
                    .Where(pm => pm.UserId == userId)
                    .ToListAsync();

                foreach (var method in existingMethods)
                {
                    method.IsDefault = false;
                }

                paymentMethod.IsDefault = true;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment method {PaymentMethodId} updated by user {UserId}", 
                paymentMethodId, userId);

            return true;
        }

        public async Task<bool> DeletePaymentMethodAsync(Guid paymentMethodId, Guid userId)
        {
            var paymentMethod = await GetPaymentMethodAsync(paymentMethodId);

            if (paymentMethod.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to delete this payment method");
            }

            paymentMethod.IsActive = false;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment method {PaymentMethodId} deleted by user {UserId}", 
                paymentMethodId, userId);

            return true;
        }

        public async Task<bool> SetDefaultPaymentMethodAsync(Guid paymentMethodId, Guid userId)
        {
            var paymentMethod = await GetPaymentMethodAsync(paymentMethodId);

            if (paymentMethod.UserId != userId)
            {
                throw new UnauthorizedAccessException("User is not authorized to set this payment method as default");
            }

            // Set all other payment methods as non-default
            var existingMethods = await _context.PaymentMethods
                .Where(pm => pm.UserId == userId)
                .ToListAsync();

            foreach (var method in existingMethods)
            {
                method.IsDefault = false;
            }

            paymentMethod.IsDefault = true;
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment method {PaymentMethodId} set as default by user {UserId}", 
                paymentMethodId, userId);

            return true;
        }

        public async Task<PaymentResult> ProcessPaymentAsync(Guid userId, ProcessPaymentRequest request)
        {
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PaymentMethodId = request.PaymentMethodId,
                Type = "Payment",
                Status = "Pending",
                Amount = request.Amount,
                Currency = request.Currency,
                Description = request.Description,
                Metadata = request.Metadata,
                CreatedAt = DateTime.UtcNow
            };

            // Add transaction items
            foreach (var item in request.Items)
            {
                transaction.Items.Add(new TransactionItem
                {
                    Id = Guid.NewGuid(),
                    TransactionId = transaction.Id,
                    Type = item.Type,
                    ItemId = item.ItemId,
                    ItemName = item.ItemName,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice,
                    TaxAmount = item.TaxAmount,
                    DiscountAmount = item.DiscountAmount,
                    Metadata = item.Metadata
                });
            }

            _context.Transactions.Add(transaction);

            try
            {
                // Process payment with external payment provider
                var paymentResult = await ProcessPaymentWithProvider(transaction, request.PaymentMethodId);

                transaction.Status = paymentResult.Success ? "Completed" : "Failed";
                transaction.ProcessedAt = paymentResult.Success ? DateTime.UtcNow : null;
                transaction.FailedAt = paymentResult.Success ? null : DateTime.UtcNow;
                transaction.FailureReason = paymentResult.ErrorMessage;
                transaction.ProviderTransactionId = paymentResult.TransactionId;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {TransactionId} processed for user {UserId} with result: {Status}", 
                    transaction.Id, userId, transaction.Status);

                return paymentResult;
            }
            catch (Exception ex)
            {
                transaction.Status = "Failed";
                transaction.FailedAt = DateTime.UtcNow;
                transaction.FailureReason = ex.Message;

                await _context.SaveChangesAsync();

                _logger.LogError(ex, "Payment processing failed for user {UserId}", userId);

                return new PaymentResult
                {
                    Success = false,
                    Status = "Failed",
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<PaymentResult> ProcessSubscriptionPaymentAsync(Guid subscriptionId, ProcessSubscriptionPaymentRequest request)
        {
            var subscription = await GetSubscriptionAsync(subscriptionId);

            var paymentRequest = new ProcessPaymentRequest
            {
                PaymentMethodId = request.PaymentMethodId,
                Amount = subscription.Amount,
                Currency = subscription.Currency,
                Description = $"Subscription payment for {subscription.Plan?.Name}",
                Items = new List<TransactionItem>
                {
                    new()
                    {
                        Type = "Subscription",
                        ItemId = subscription.Id,
                        ItemName = subscription.Plan?.Name ?? "Subscription",
                        Quantity = 1,
                        UnitPrice = subscription.Amount,
                        TotalPrice = subscription.Amount
                    }
                }
            };

            var result = await ProcessPaymentAsync(subscription.UserId, paymentRequest);

            if (result.Success)
            {
                subscription.NextBillingDate = CalculateNextBillingDate(
                    subscription.NextBillingDate, 
                    subscription.BillingCycle, 
                    subscription.BillingInterval);

                if (request.SendInvoice)
                {
                    // Generate and send invoice
                    await GenerateInvoiceAsync(subscription.Id, new GenerateInvoiceRequest());
                }

                await _context.SaveChangesAsync();
            }

            return result;
        }

        public async Task<RefundResult> ProcessRefundAsync(Guid paymentId, Guid userId, ProcessRefundRequest request)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == paymentId && t.UserId == userId);

            if (transaction == null)
            {
                throw new KeyNotFoundException("Transaction not found");
            }

            if (transaction.Status != "Completed")
            {
                throw new InvalidOperationException("Can only refund completed transactions");
            }

            var refundAmount = request.Amount ?? transaction.Amount;

            try
            {
                // Process refund with external payment provider
                var refundResult = await ProcessRefundWithProvider(transaction, refundAmount, request.Reason);

                // Create refund transaction
                var refundTransaction = new Transaction
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    PaymentMethodId = transaction.PaymentMethodId,
                    Type = "Refund",
                    Status = refundResult.Success ? "Completed" : "Failed",
                    Amount = -refundAmount,
                    Currency = transaction.Currency,
                    Description = $"Refund for transaction {transaction.Id}",
                    Reference = transaction.Id.ToString(),
                    ProviderTransactionId = refundResult.RefundId,
                    CreatedAt = DateTime.UtcNow,
                    ProcessedAt = refundResult.Success ? DateTime.UtcNow : null,
                    FailedAt = refundResult.Success ? null : DateTime.UtcNow,
                    FailureReason = refundResult.ErrorMessage
                };

                _context.Transactions.Add(refundTransaction);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Refund {RefundId} processed for user {UserId} with result: {Status}", 
                    refundTransaction.Id, userId, refundTransaction.Status);

                return refundResult;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Refund processing failed for user {UserId}", userId);

                return new RefundResult
                {
                    Success = false,
                    Status = "Failed",
                    ErrorMessage = ex.Message
                };
            }
        }

        // Transactions & Billing
        public async Task<List<Transaction>> GetTransactionsAsync(Guid userId, TransactionFilter? filter = null)
        {
            var query = _context.Transactions
                .Include(t => t.PaymentMethod)
                .Include(t => t.Items)
                .Where(t => t.UserId == userId)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Type))
                    query = query.Where(t => t.Type == filter.Type);

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(t => t.Status == filter.Status);

                if (filter.StartDate.HasValue)
                    query = query.Where(t => t.CreatedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(t => t.CreatedAt <= filter.EndDate.Value);

                if (filter.MinAmount.HasValue)
                    query = query.Where(t => t.Amount >= filter.MinAmount.Value);

                if (filter.MaxAmount.HasValue)
                    query = query.Where(t => t.Amount <= filter.MaxAmount.Value);

                // Apply sorting
                if (!string.IsNullOrEmpty(filter.SortBy))
                {
                    switch (filter.SortBy.ToLower())
                    {
                        case "amount":
                            query = filter.SortDirection?.ToLower() == "desc" 
                                ? query.OrderByDescending(t => t.Amount)
                                : query.OrderBy(t => t.Amount);
                            break;
                        case "date":
                            query = filter.SortDirection?.ToLower() == "desc" 
                                ? query.OrderByDescending(t => t.CreatedAt)
                                : query.OrderBy(t => t.CreatedAt);
                            break;
                        default:
                            query = query.OrderByDescending(t => t.CreatedAt);
                            break;
                    }
                }
                else
                {
                    query = query.OrderByDescending(t => t.CreatedAt);
                }

                // Apply pagination
                if (filter.Skip.HasValue)
                    query = query.Skip(filter.Skip.Value);

                if (filter.Take.HasValue)
                    query = query.Take(filter.Take.Value);
            }
            else
            {
                query = query.OrderByDescending(t => t.CreatedAt);
            }

            return await query.ToListAsync();
        }

        public async Task<Transaction> GetTransactionAsync(Guid transactionId)
        {
            var transaction = await _context.Transactions
                .Include(t => t.User)
                .Include(t => t.PaymentMethod)
                .Include(t => t.Items)
                .FirstOrDefaultAsync(t => t.Id == transactionId);

            if (transaction == null)
            {
                throw new KeyNotFoundException($"Transaction {transactionId} not found");
            }

            return transaction;
        }

        public async Task<List<Transaction>> GetAllTransactionsAsync(TransactionFilter? filter = null)
        {
            var query = _context.Transactions
                .Include(t => t.User)
                .Include(t => t.PaymentMethod)
                .Include(t => t.Items)
                .AsQueryable();

            if (filter != null)
            {
                if (!string.IsNullOrEmpty(filter.Type))
                    query = query.Where(t => t.Type == filter.Type);

                if (!string.IsNullOrEmpty(filter.Status))
                    query = query.Where(t => t.Status == filter.Status);

                if (filter.StartDate.HasValue)
                    query = query.Where(t => t.CreatedAt >= filter.StartDate.Value);

                if (filter.EndDate.HasValue)
                    query = query.Where(t => t.CreatedAt <= filter.EndDate.Value);

                if (filter.MinAmount.HasValue)
                    query = query.Where(t => t.Amount >= filter.MinAmount.Value);

                if (filter.MaxAmount.HasValue)
                    query = query.Where(t => t.Amount <= filter.MaxAmount.Value);

                // Apply sorting and pagination (same as GetTransactionsAsync)
                query = ApplySortingAndPagination(query, filter);
            }
            else
            {
                query = query.OrderByDescending(t => t.CreatedAt);
            }

            return await query.ToListAsync();
        }

        // Revenue Analytics
        public async Task<RevenueAnalytics> GetRevenueAnalyticsAsync(RevenueAnalyticsFilter filter)
        {
            var transactions = await _context.Transactions
                .Where(t => t.Status == "Completed" && 
                           t.CreatedAt >= filter.StartDate && 
                           t.CreatedAt <= filter.EndDate)
                .ToListAsync();

            var subscriptions = await _context.Subscriptions
                .Where(s => s.CreatedAt >= filter.StartDate && 
                           s.CreatedAt <= filter.EndDate)
                .ToListAsync();

            var totalRevenue = transactions.Sum(t => t.Amount);
            var activeSubscriptions = subscriptions.Count(s => s.Status == "Active");
            var newSubscriptions = subscriptions.Count(s => s.CreatedAt >= filter.StartDate);
            var cancelledSubscriptions = subscriptions.Count(s => s.Status == "Cancelled" && 
                                                                s.CancelledAt >= filter.StartDate);

            var mrr = CalculateMrr(subscriptions.Where(s => s.Status == "Active").ToList());
            var arr = mrr * 12;

            var revenueHistory = GenerateRevenueHistory(transactions, filter);

            return new RevenueAnalytics
            {
                TotalRevenue = totalRevenue,
                MonthlyRecurringRevenue = mrr,
                AnnualRecurringRevenue = arr,
                AverageRevenuePerUser = activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0,
                ActiveSubscriptions = activeSubscriptions,
                NewSubscriptions = newSubscriptions,
                CancelledSubscriptions = cancelledSubscriptions,
                ChurnRate = activeSubscriptions > 0 ? (decimal)cancelledSubscriptions / activeSubscriptions : 0,
                GrowthRate = CalculateGrowthRate(revenueHistory),
                RevenueHistory = revenueHistory
            };
        }

        // Private helper methods
        private DateTime CalculateNextBillingDate(DateTime currentDate, string billingCycle, int interval)
        {
            return billingCycle.ToLower() switch
            {
                "daily" => currentDate.AddDays(interval),
                "weekly" => currentDate.AddDays(7 * interval),
                "monthly" => currentDate.AddMonths(interval),
                "yearly" => currentDate.AddYears(interval),
                _ => currentDate.AddMonths(interval)
            };
        }

        private decimal CalculateProrationAmount(Subscription subscription, SubscriptionPlan newPlan)
        {
            var daysInCycle = (subscription.NextBillingDate - subscription.StartDate).Days;
            var daysRemaining = (subscription.NextBillingDate - DateTime.UtcNow).Days;
            
            if (daysInCycle <= 0) return 0;
            
            var currentDailyRate = subscription.Amount / daysInCycle;
            var newDailyRate = newPlan.Price / daysInCycle;
            
            return (newDailyRate - currentDailyRate) * daysRemaining;
        }

        private decimal CalculateProrationCredit(Subscription subscription, SubscriptionPlan newPlan)
        {
            var daysInCycle = (subscription.NextBillingDate - subscription.StartDate).Days;
            var daysRemaining = (subscription.NextBillingDate - DateTime.UtcNow).Days;
            
            if (daysInCycle <= 0) return 0;
            
            var currentDailyRate = subscription.Amount / daysInCycle;
            var newDailyRate = newPlan.Price / daysInCycle;
            
            return (currentDailyRate - newDailyRate) * daysRemaining;
        }

        private async Task<PaymentResult> ProcessPaymentWithProvider(Transaction transaction, Guid? paymentMethodId)
        {
            // This would integrate with actual payment providers like Stripe, PayPal, etc.
            // For demo purposes, we'll simulate a successful payment
            await Task.Delay(1000); // Simulate API call delay

            return new PaymentResult
            {
                Success = true,
                Status = "Completed",
                TransactionId = Guid.NewGuid().ToString(),
                Metadata = new Dictionary<string, object>
                {
                    ["provider"] = "stripe",
                    ["processedAt"] = DateTime.UtcNow
                }
            };
        }

        private async Task<RefundResult> ProcessRefundWithProvider(Transaction transaction, decimal amount, string reason)
        {
            // This would integrate with actual payment providers for refunds
            await Task.Delay(1000); // Simulate API call delay

            return new RefundResult
            {
                Success = true,
                Status = "Completed",
                RefundId = Guid.NewGuid().ToString(),
                RefundAmount = amount
            };
        }

        private decimal CalculateMrr(List<Subscription> activeSubscriptions)
        {
            return activeSubscriptions.Sum(s => s.BillingCycle.ToLower() switch
            {
                "monthly" => s.Amount,
                "yearly" => s.Amount / 12,
                "weekly" => s.Amount * 4.33m,
                "daily" => s.Amount * 30,
                _ => s.Amount
            });
        }

        private List<RevenueDataPoint> GenerateRevenueHistory(List<Transaction> transactions, RevenueAnalyticsFilter filter)
        {
            var history = new List<RevenueDataPoint>();
            var current = filter.StartDate.Date;

            while (current <= filter.EndDate.Date)
            {
                var dailyRevenue = transactions
                    .Where(t => t.CreatedAt.Date == current)
                    .Sum(t => t.Amount);

                history.Add(new RevenueDataPoint
                {
                    Date = current,
                    Amount = dailyRevenue,
                    Currency = filter.Currency ?? "USD",
                    Type = "Daily"
                });

                current = current.AddDays(1);
            }

            return history;
        }

        private decimal CalculateGrowthRate(List<RevenueDataPoint> history)
        {
            if (history.Count < 2) return 0;

            var firstPeriod = history.Take(history.Count / 2).Sum(h => h.Amount);
            var secondPeriod = history.Skip(history.Count / 2).Sum(h => h.Amount);

            if (firstPeriod == 0) return 0;

            return (secondPeriod - firstPeriod) / firstPeriod * 100;
        }

        private IQueryable<Transaction> ApplySortingAndPagination(IQueryable<Transaction> query, TransactionFilter filter)
        {
            // Apply sorting
            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                switch (filter.SortBy.ToLower())
                {
                    case "amount":
                        query = filter.SortDirection?.ToLower() == "desc" 
                            ? query.OrderByDescending(t => t.Amount)
                            : query.OrderBy(t => t.Amount);
                        break;
                    case "date":
                        query = filter.SortDirection?.ToLower() == "desc" 
                            ? query.OrderByDescending(t => t.CreatedAt)
                            : query.OrderBy(t => t.CreatedAt);
                        break;
                    default:
                        query = query.OrderByDescending(t => t.CreatedAt);
                        break;
                }
            }
            else
            {
                query = query.OrderByDescending(t => t.CreatedAt);
            }

            // Apply pagination
            if (filter.Skip.HasValue)
                query = query.Skip(filter.Skip.Value);

            if (filter.Take.HasValue)
                query = query.Take(filter.Take.Value);

            return query;
        }

        // Placeholder implementations for remaining interface methods
        public async Task<Invoice> GenerateInvoiceAsync(Guid subscriptionId, GenerateInvoiceRequest request) => new();
        public async Task<List<Invoice>> GetInvoicesAsync(Guid userId, InvoiceFilter? filter = null) => new();
        public async Task<Invoice> GetInvoiceAsync(Guid invoiceId) => new();
        public async Task<bool> SendInvoiceAsync(Guid invoiceId, SendInvoiceRequest request) => true;
        public async Task<bool> MarkInvoiceAsPaidAsync(Guid invoiceId, Guid userId) => true;
        public async Task<TaxCalculation> CalculateTaxAsync(Guid userId, TaxCalculationRequest request) => new();
        public async Task<List<RevenueMetric>> GetRevenueMetricsAsync(RevenueMetricsFilter filter) => new();
        public async Task<MrrAnalysis> GetMrrAnalysisAsync(MrrAnalysisFilter filter) => new();
        public async Task<ChurnAnalysis> GetChurnAnalysisAsync(ChurnAnalysisFilter filter) => new();
        public async Task<List<RevenueInsight>> GetRevenueInsightsAsync(RevenueInsightsFilter filter) => new();
        public async Task<RevenueForecast> GetRevenueForecastAsync(RevenueForecastFilter filter) => new();
        public async Task<CustomerLifetimeValue> CalculateCustomerLifetimeValueAsync(Guid userId) => new();
        public async Task<List<CustomerLifetimeValue>> GetCustomerLifetimeValuesAsync(ClvFilter filter) => new();
        public async Task<MarketplaceItem> CreateMarketplaceItemAsync(Guid creatorId, CreateMarketplaceItemRequest request) => new();
        public async Task<List<MarketplaceItem>> GetMarketplaceItemsAsync(MarketplaceFilter? filter = null) => new();
        public async Task<MarketplaceItem> GetMarketplaceItemAsync(Guid itemId) => new();
        public async Task<MarketplaceItem> UpdateMarketplaceItemAsync(Guid itemId, Guid userId, UpdateMarketplaceItemRequest request) => new();
        public async Task<bool> DeleteMarketplaceItemAsync(Guid itemId, Guid userId) => true;
        public async Task<MarketplaceSale> PurchaseMarketplaceItemAsync(Guid itemId, Guid userId, PurchaseMarketplaceItemRequest request) => new();
        public async Task<List<MarketplaceSale>> GetMarketplaceSalesAsync(Guid creatorId, MarketplaceSalesFilter? filter = null) => new();
        public async Task<RevenueShare> CalculateRevenueShareAsync(Guid saleId) => new();
        public async Task<List<RevenueShare>> GetRevenueSharesAsync(Guid creatorId, RevenueShareFilter? filter = null) => new();
        public async Task<bool> ProcessRevenueSharePayoutAsync(Guid creatorId, ProcessRevenueSharePayoutRequest request) => true;
        public async Task<PricingRule> CreatePricingRuleAsync(Guid creatorId, CreatePricingRuleRequest request) => new();
        public async Task<List<PricingRule>> GetPricingRulesAsync(PricingRuleFilter? filter = null) => new();
        public async Task<PricingRule> GetPricingRuleAsync(Guid ruleId) => new();
        public async Task<PricingRule> UpdatePricingRuleAsync(Guid ruleId, Guid userId, UpdatePricingRuleRequest request) => new();
        public async Task<bool> DeletePricingRuleAsync(Guid ruleId, Guid userId) => true;
        public async Task<DiscountCode> CreateDiscountCodeAsync(Guid creatorId, CreateDiscountCodeRequest request) => new();
        public async Task<List<DiscountCode>> GetDiscountCodesAsync(Guid creatorId, DiscountCodeFilter? filter = null) => new();
        public async Task<DiscountCode> GetDiscountCodeAsync(Guid discountId) => new();
        public async Task<DiscountValidation> ValidateDiscountCodeAsync(string code, Guid userId, ValidateDiscountRequest request) => new();
        public async Task<bool> ApplyDiscountCodeAsync(Guid discountId, Guid userId, ApplyDiscountRequest request) => true;
        public async Task<bool> DeactivateDiscountCodeAsync(Guid discountId, Guid userId) => true;
        public async Task<FinancialReport> GenerateFinancialReportAsync(FinancialReportRequest request) => new();
        public async Task<List<FinancialReport>> GetFinancialReportsAsync(FinancialReportFilter? filter = null) => new();
        public async Task<TaxReport> GenerateTaxReportAsync(TaxReportRequest request) => new();
        public async Task<List<TaxReport>> GetTaxReportsAsync(TaxReportFilter? filter = null) => new();
        public async Task<PayoutReport> GeneratePayoutReportAsync(PayoutReportRequest request) => new();
        public async Task<List<PayoutReport>> GetPayoutReportsAsync(PayoutReportFilter? filter = null) => new();
        public async Task<RevenueReconciliation> ReconcileRevenueAsync(RevenueReconciliationRequest request) => new();
        public async Task<WebhookEndpoint> CreateWebhookEndpointAsync(Guid userId, CreateWebhookEndpointRequest request) => new();
        public async Task<List<WebhookEndpoint>> GetWebhookEndpointsAsync(Guid userId) => new();
        public async Task<WebhookEndpoint> GetWebhookEndpointAsync(Guid endpointId) => new();
        public async Task<bool> UpdateWebhookEndpointAsync(Guid endpointId, Guid userId, UpdateWebhookEndpointRequest request) => true;
        public async Task<bool> DeleteWebhookEndpointAsync(Guid endpointId, Guid userId) => true;
        public async Task<bool> SendWebhookAsync(Guid endpointId, WebhookPayload payload) => true;
        public async Task<List<WebhookEvent>> GetWebhookEventsAsync(Guid endpointId, WebhookEventFilter? filter = null) => new();
        public async Task<bool> RetryWebhookAsync(Guid eventId, Guid userId) => true;
        public async Task<List<ComplianceEvent>> GetComplianceEventsAsync(ComplianceEventFilter? filter = null) => new();
        public async Task<ComplianceReport> GenerateComplianceReportAsync(ComplianceReportRequest request) => new();
        public async Task<List<AuditLog>> GetRevenueAuditLogsAsync(AuditLogFilter? filter = null) => new();
        public async Task<bool> RecordComplianceEventAsync(RecordComplianceEventRequest request) => true;
        public async Task<DataRetentionReport> GetDataRetentionReportAsync(DataRetentionReportRequest request) => new();
        public async Task<bool> ProcessDataRetentionAsync(ProcessDataRetentionRequest request) => true;
    }
}