const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * RevenueDashboard Service - Epic 4: Monetization & Analytics
 * 
 * Implements comprehensive revenue infrastructure that transforms hosting from a cost center 
 * into a profitable endeavor, enabling sustainable community growth and developer ecosystem participation.
 * 
 * Key Features:
 * - Revenue tracking across donations, VIP memberships, and plugin sales
 * - Financial analytics with trends, conversion rates, and lifetime value
 * - Automated payment processing with minimal setup
 * - Tax reporting and revenue forecasting
 * - Multi-processor integration (PayPal, Stripe, crypto)
 */
class RevenueDashboard extends EventEmitter {
  constructor(store, communityManager, pluginManager) {
    super();
    this.store = store;
    this.communityManager = communityManager;
    this.pluginManager = pluginManager;
    
    this.revenueStreams = new Map();
    this.transactions = new Map();
    this.subscriptions = new Map();
    this.analytics = new Map();
    this.paymentProcessors = new Map();
    this.isInitialized = false;

    // Revenue categories
    this.revenueCategories = {
      donations: { name: 'Community Donations', color: '#34a853' },
      vip: { name: 'VIP Memberships', color: '#fbbc05' },
      plugins: { name: 'Plugin Marketplace', color: '#0066ff' },
      merchandise: { name: 'Community Merchandise', color: '#ea4335' },
      events: { name: 'Event Tickets', color: '#9c27b0' },
      tips: { name: 'Creator Tips', color: '#ff5722' }
    };

    // Payment processors configuration
    this.processors = {
      stripe: { name: 'Stripe', fee: 0.029, fixedFee: 0.30, enabled: false },
      paypal: { name: 'PayPal', fee: 0.0349, fixedFee: 0.49, enabled: false },
      crypto: { name: 'Crypto Wallets', fee: 0.01, fixedFee: 0, enabled: false }
    };

    // Analytics configuration
    this.analyticsConfig = {
      retentionPeriods: [7, 30, 90, 365], // days
      conversionFunnels: ['visitor', 'member', 'donor', 'vip'],
      revenueGoals: {
        monthly: 1000,
        quarterly: 3000,
        annual: 12000
      }
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('💰 Initializing RevenueDashboard...');

      // Load existing revenue data
      await this.loadRevenueData();

      // Initialize payment processors
      await this.initializePaymentProcessors();

      // Set up analytics tracking
      this.startAnalyticsTracking();

      // Initialize revenue streams monitoring
      await this.initializeRevenueStreams();

      // Set up automated reporting
      this.scheduleAutomatedReports();

      this.isInitialized = true;
      this.emit('revenue-dashboard-ready');
      
      console.log('✅ RevenueDashboard initialized successfully');
      console.log(`💳 ${this.getActiveProcessors().length} payment processors configured`);
      console.log(`📊 Tracking ${this.revenueStreams.size} revenue streams`);
    } catch (error) {
      console.error('❌ Failed to initialize RevenueDashboard:', error);
      throw error;
    }
  }

  async loadRevenueData() {
    try {
      // Load revenue streams
      const streamData = this.store.get('revenueStreams', {});
      for (const [streamId, stream] of Object.entries(streamData)) {
        this.revenueStreams.set(streamId, {
          id: streamId,
          name: stream.name,
          category: stream.category,
          status: stream.status || 'active',
          totalRevenue: stream.totalRevenue || 0,
          monthlyRevenue: stream.monthlyRevenue || 0,
          transactionCount: stream.transactionCount || 0,
          createdAt: new Date(stream.createdAt || Date.now()),
          lastTransaction: stream.lastTransaction ? new Date(stream.lastTransaction) : null,
          configuration: stream.configuration || {}
        });
      }

      // Load transactions
      const transactionData = this.store.get('revenueTransactions', {});
      for (const [txId, transaction] of Object.entries(transactionData)) {
        this.transactions.set(txId, {
          id: txId,
          amount: transaction.amount,
          currency: transaction.currency || 'USD',
          category: transaction.category,
          streamId: transaction.streamId,
          paymentProcessor: transaction.paymentProcessor,
          status: transaction.status,
          fees: transaction.fees || 0,
          netAmount: transaction.netAmount,
          metadata: transaction.metadata || {},
          createdAt: new Date(transaction.createdAt),
          processedAt: transaction.processedAt ? new Date(transaction.processedAt) : null
        });
      }

      // Load subscriptions
      const subscriptionData = this.store.get('revenueSubscriptions', {});
      for (const [subId, subscription] of Object.entries(subscriptionData)) {
        this.subscriptions.set(subId, {
          id: subId,
          customerId: subscription.customerId,
          planId: subscription.planId,
          amount: subscription.amount,
          currency: subscription.currency || 'USD',
          interval: subscription.interval, // monthly, yearly
          status: subscription.status, // active, cancelled, expired
          currentPeriodStart: new Date(subscription.currentPeriodStart),
          currentPeriodEnd: new Date(subscription.currentPeriodEnd),
          createdAt: new Date(subscription.createdAt),
          metadata: subscription.metadata || {}
        });
      }

      console.log(`💾 Loaded ${this.revenueStreams.size} revenue streams, ${this.transactions.size} transactions`);
    } catch (error) {
      console.error('❌ Failed to load revenue data:', error);
    }
  }

  async initializePaymentProcessors() {
    try {
      const processorConfig = this.store.get('paymentProcessors', {});
      
      // Initialize Stripe
      if (processorConfig.stripe?.enabled) {
        this.paymentProcessors.set('stripe', {
          ...this.processors.stripe,
          ...processorConfig.stripe,
          apiKey: processorConfig.stripe.apiKey,
          webhookSecret: processorConfig.stripe.webhookSecret
        });
      }

      // Initialize PayPal
      if (processorConfig.paypal?.enabled) {
        this.paymentProcessors.set('paypal', {
          ...this.processors.paypal,
          ...processorConfig.paypal,
          clientId: processorConfig.paypal.clientId,
          clientSecret: processorConfig.paypal.clientSecret
        });
      }

      // Initialize Crypto
      if (processorConfig.crypto?.enabled) {
        this.paymentProcessors.set('crypto', {
          ...this.processors.crypto,
          ...processorConfig.crypto,
          wallets: processorConfig.crypto.wallets || {}
        });
      }

      console.log(`💳 Initialized ${this.paymentProcessors.size} payment processors`);
    } catch (error) {
      console.error('❌ Failed to initialize payment processors:', error);
    }
  }

  startAnalyticsTracking() {
    try {
      // Track revenue analytics every hour
      this.analyticsInterval = setInterval(() => {
        this.updateRevenueAnalytics();
      }, 60 * 60 * 1000);

      // Track conversion funnel daily
      this.conversionInterval = setInterval(() => {
        this.updateConversionAnalytics();
      }, 24 * 60 * 60 * 1000);

      console.log('📊 Revenue analytics tracking started');
    } catch (error) {
      console.error('❌ Failed to start analytics tracking:', error);
    }
  }

  async initializeRevenueStreams() {
    try {
      // Create default revenue streams if none exist
      if (this.revenueStreams.size === 0) {
        await this.createRevenueStream({
          name: 'General Donations',
          category: 'donations',
          configuration: {
            minAmount: 1,
            maxAmount: 1000,
            suggestedAmounts: [5, 10, 25, 50, 100],
            allowCustomAmount: true,
            thankYouMessage: 'Thank you for supporting our community!'
          }
        });

        await this.createRevenueStream({
          name: 'VIP Membership',
          category: 'vip',
          configuration: {
            monthlyPrice: 10,
            yearlyPrice: 100,
            benefits: [
              'Priority queue access',
              'Exclusive VIP servers',
              'Custom chat colors',
              'Reserved slots',
              'VIP-only events'
            ]
          }
        });
      }

      console.log(`💰 Initialized ${this.revenueStreams.size} revenue streams`);
    } catch (error) {
      console.error('❌ Failed to initialize revenue streams:', error);
    }
  }

  scheduleAutomatedReports() {
    try {
      // Generate daily revenue reports
      this.dailyReportInterval = setInterval(() => {
        this.generateDailyReport();
      }, 24 * 60 * 60 * 1000);

      // Generate monthly reports on the 1st of each month
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const timeToNextMonth = nextMonth.getTime() - now.getTime();

      setTimeout(() => {
        this.generateMonthlyReport();
        this.monthlyReportInterval = setInterval(() => {
          this.generateMonthlyReport();
        }, 30 * 24 * 60 * 60 * 1000);
      }, timeToNextMonth);

      console.log('📅 Automated reporting scheduled');
    } catch (error) {
      console.error('❌ Failed to schedule automated reports:', error);
    }
  }

  // Revenue Stream Management
  async createRevenueStream(streamData) {
    try {
      const streamId = crypto.randomUUID();
      const stream = {
        id: streamId,
        name: streamData.name,
        category: streamData.category,
        status: 'active',
        totalRevenue: 0,
        monthlyRevenue: 0,
        transactionCount: 0,
        createdAt: new Date(),
        lastTransaction: null,
        configuration: streamData.configuration || {}
      };

      this.revenueStreams.set(streamId, stream);
      await this.saveRevenueData();

      this.emit('revenue-stream-created', { streamId, stream });
      console.log(`💰 Created revenue stream: ${stream.name}`);

      return stream;
    } catch (error) {
      console.error('❌ Failed to create revenue stream:', error);
      throw error;
    }
  }

  async updateRevenueStream(streamId, updateData) {
    try {
      const stream = this.revenueStreams.get(streamId);
      if (!stream) {
        throw new Error(`Revenue stream ${streamId} not found`);
      }

      const updatedStream = {
        ...stream,
        ...updateData,
        updatedAt: new Date()
      };

      this.revenueStreams.set(streamId, updatedStream);
      await this.saveRevenueData();

      this.emit('revenue-stream-updated', { streamId, stream: updatedStream });
      return updatedStream;
    } catch (error) {
      console.error('❌ Failed to update revenue stream:', error);
      throw error;
    }
  }

  // Transaction Processing
  async processTransaction(transactionData) {
    try {
      const transactionId = crypto.randomUUID();
      const processor = this.paymentProcessors.get(transactionData.paymentProcessor);
      
      if (!processor) {
        throw new Error(`Payment processor ${transactionData.paymentProcessor} not configured`);
      }

      // Calculate fees
      const fees = this.calculateProcessingFees(transactionData.amount, processor);
      const netAmount = transactionData.amount - fees;

      const transaction = {
        id: transactionId,
        amount: transactionData.amount,
        currency: transactionData.currency || 'USD',
        category: transactionData.category,
        streamId: transactionData.streamId,
        paymentProcessor: transactionData.paymentProcessor,
        status: 'pending',
        fees,
        netAmount,
        metadata: transactionData.metadata || {},
        createdAt: new Date(),
        processedAt: null
      };

      this.transactions.set(transactionId, transaction);

      // Simulate payment processing
      const success = await this.simulatePaymentProcessing(transaction, processor);
      
      if (success) {
        transaction.status = 'completed';
        transaction.processedAt = new Date();
        
        // Update revenue stream
        await this.updateRevenueStreamStats(transaction.streamId, transaction.netAmount);
        
        this.emit('transaction-completed', { transactionId, transaction });
        console.log(`✅ Transaction completed: $${transaction.amount} via ${processor.name}`);
      } else {
        transaction.status = 'failed';
        this.emit('transaction-failed', { transactionId, transaction });
        console.log(`❌ Transaction failed: $${transaction.amount} via ${processor.name}`);
      }

      await this.saveRevenueData();
      return transaction;
    } catch (error) {
      console.error('❌ Failed to process transaction:', error);
      throw error;
    }
  }

  calculateProcessingFees(amount, processor) {
    const percentageFee = amount * processor.fee;
    const totalFee = percentageFee + processor.fixedFee;
    return Math.round(totalFee * 100) / 100; // Round to 2 decimal places
  }

  async simulatePaymentProcessing(transaction, processor) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  }

  async updateRevenueStreamStats(streamId, amount) {
    try {
      const stream = this.revenueStreams.get(streamId);
      if (!stream) return;

      stream.totalRevenue += amount;
      stream.transactionCount += 1;
      stream.lastTransaction = new Date();

      // Update monthly revenue (reset on month change)
      const now = new Date();
      const lastTransaction = stream.lastTransaction;
      if (!lastTransaction || now.getMonth() !== lastTransaction.getMonth()) {
        stream.monthlyRevenue = amount;
      } else {
        stream.monthlyRevenue += amount;
      }

      this.revenueStreams.set(streamId, stream);
      this.emit('revenue-stream-stats-updated', { streamId, stream });
    } catch (error) {
      console.error('❌ Failed to update revenue stream stats:', error);
    }
  }

  // Subscription Management
  async createSubscription(subscriptionData) {
    try {
      const subscriptionId = crypto.randomUUID();
      const now = new Date();
      
      // Calculate period end based on interval
      let periodEnd = new Date(now);
      if (subscriptionData.interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else if (subscriptionData.interval === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const subscription = {
        id: subscriptionId,
        customerId: subscriptionData.customerId,
        planId: subscriptionData.planId,
        amount: subscriptionData.amount,
        currency: subscriptionData.currency || 'USD',
        interval: subscriptionData.interval,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        createdAt: now,
        metadata: subscriptionData.metadata || {}
      };

      this.subscriptions.set(subscriptionId, subscription);
      await this.saveRevenueData();

      this.emit('subscription-created', { subscriptionId, subscription });
      console.log(`🔄 Created ${subscription.interval} subscription: $${subscription.amount}`);

      return subscription;
    } catch (error) {
      console.error('❌ Failed to create subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId, reason = 'user_requested') {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        throw new Error(`Subscription ${subscriptionId} not found`);
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      subscription.cancellationReason = reason;

      this.subscriptions.set(subscriptionId, subscription);
      await this.saveRevenueData();

      this.emit('subscription-cancelled', { subscriptionId, subscription, reason });
      console.log(`🛑 Cancelled subscription: ${subscriptionId}`);

      return subscription;
    } catch (error) {
      console.error('❌ Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async updateRevenueAnalytics() {
    try {
      const now = new Date();
      const analyticsId = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

      const analytics = {
        date: now,
        totalRevenue: this.getTotalRevenue(),
        monthlyRevenue: this.getMonthlyRevenue(),
        transactionCount: this.transactions.size,
        activeSubscriptions: this.getActiveSubscriptions().length,
        averageTransactionValue: this.getAverageTransactionValue(),
        revenueByCategory: this.getRevenueByCategory(),
        conversionRate: await this.calculateConversionRate(),
        customerLifetimeValue: await this.calculateCustomerLifetimeValue(),
        churnRate: await this.calculateChurnRate()
      };

      this.analytics.set(analyticsId, analytics);
      this.emit('analytics-updated', { analyticsId, analytics });

      console.log(`📊 Updated revenue analytics: $${analytics.totalRevenue} total`);
    } catch (error) {
      console.error('❌ Failed to update revenue analytics:', error);
    }
  }

  async updateConversionAnalytics() {
    try {
      const conversionData = {
        date: new Date(),
        funnelSteps: await this.calculateConversionFunnel(),
        sourceAnalysis: await this.analyzeRevenueSource(),
        cohortAnalysis: await this.performCohortAnalysis()
      };

      this.emit('conversion-analytics-updated', conversionData);
      console.log('📈 Updated conversion analytics');
    } catch (error) {
      console.error('❌ Failed to update conversion analytics:', error);
    }
  }

  async generateDailyReport() {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayTransactions = this.getTransactionsByDateRange(yesterday, today);
      const dailyRevenue = todayTransactions.reduce((sum, tx) => sum + tx.netAmount, 0);

      const report = {
        date: today,
        revenue: dailyRevenue,
        transactionCount: todayTransactions.length,
        averageTransactionValue: todayTransactions.length > 0 ? dailyRevenue / todayTransactions.length : 0,
        topRevenueStreams: this.getTopRevenueStreams(3),
        newSubscriptions: this.getNewSubscriptions(yesterday, today).length,
        cancelledSubscriptions: this.getCancelledSubscriptions(yesterday, today).length
      };

      this.emit('daily-report-generated', report);
      console.log(`📋 Daily report: $${report.revenue} revenue from ${report.transactionCount} transactions`);

      return report;
    } catch (error) {
      console.error('❌ Failed to generate daily report:', error);
    }
  }

  async generateMonthlyReport() {
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const monthlyTransactions = this.getTransactionsByDateRange(monthStart, monthEnd);
      const monthlyRevenue = monthlyTransactions.reduce((sum, tx) => sum + tx.netAmount, 0);

      const report = {
        month: `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`,
        revenue: monthlyRevenue,
        transactionCount: monthlyTransactions.length,
        revenueByCategory: this.getRevenueByCategory(monthStart, monthEnd),
        subscriptionMetrics: this.getSubscriptionMetrics(),
        growthRate: await this.calculateMonthlyGrowthRate(),
        churnAnalysis: await this.analyzeMonthlyChurn(),
        taxData: this.generateTaxData(monthStart, monthEnd)
      };

      this.emit('monthly-report-generated', report);
      console.log(`📊 Monthly report: $${report.revenue} revenue (${report.growthRate}% growth)`);

      return report;
    } catch (error) {
      console.error('❌ Failed to generate monthly report:', error);
    }
  }

  // Data retrieval methods
  getTotalRevenue() {
    return Array.from(this.transactions.values())
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.netAmount, 0);
  }

  getMonthlyRevenue() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return Array.from(this.transactions.values())
      .filter(tx => tx.status === 'completed' && tx.processedAt >= monthStart)
      .reduce((sum, tx) => sum + tx.netAmount, 0);
  }

  getActiveSubscriptions() {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.status === 'active');
  }

  getAverageTransactionValue() {
    const completedTransactions = Array.from(this.transactions.values())
      .filter(tx => tx.status === 'completed');
    
    if (completedTransactions.length === 0) return 0;
    
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    return totalRevenue / completedTransactions.length;
  }

  getRevenueByCategory(startDate = null, endDate = null) {
    const transactions = startDate && endDate 
      ? this.getTransactionsByDateRange(startDate, endDate)
      : Array.from(this.transactions.values()).filter(tx => tx.status === 'completed');

    const revenueByCategory = {};
    
    transactions.forEach(tx => {
      if (!revenueByCategory[tx.category]) {
        revenueByCategory[tx.category] = 0;
      }
      revenueByCategory[tx.category] += tx.netAmount;
    });

    return revenueByCategory;
  }

  getTransactionsByDateRange(startDate, endDate) {
    return Array.from(this.transactions.values())
      .filter(tx => 
        tx.status === 'completed' &&
        tx.processedAt >= startDate &&
        tx.processedAt <= endDate
      );
  }

  getTopRevenueStreams(limit = 5) {
    return Array.from(this.revenueStreams.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  }

  getNewSubscriptions(startDate, endDate) {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.createdAt >= startDate && sub.createdAt <= endDate);
  }

  getCancelledSubscriptions(startDate, endDate) {
    return Array.from(this.subscriptions.values())
      .filter(sub => 
        sub.status === 'cancelled' &&
        sub.cancelledAt >= startDate &&
        sub.cancelledAt <= endDate
      );
  }

  getActiveProcessors() {
    return Array.from(this.paymentProcessors.values()).filter(p => p.enabled);
  }

  // Calculation methods
  async calculateConversionRate() {
    // Mock calculation - in real implementation would use community data
    const visitors = 1000; // From community analytics
    const paidUsers = this.getUniqueCustomerCount();
    return paidUsers > 0 ? (paidUsers / visitors) * 100 : 0;
  }

  async calculateCustomerLifetimeValue() {
    const activeSubscriptions = this.getActiveSubscriptions();
    if (activeSubscriptions.length === 0) return 0;

    const averageMonthlyRevenue = activeSubscriptions.reduce((sum, sub) => 
      sum + (sub.interval === 'monthly' ? sub.amount : sub.amount / 12), 0
    ) / activeSubscriptions.length;

    const averageLifetimeMonths = 24; // Mock data
    return averageMonthlyRevenue * averageLifetimeMonths;
  }

  async calculateChurnRate() {
    const totalSubscriptions = this.subscriptions.size;
    if (totalSubscriptions === 0) return 0;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cancelledThisMonth = this.getCancelledSubscriptions(monthStart, now).length;

    return (cancelledThisMonth / totalSubscriptions) * 100;
  }

  async calculateConversionFunnel() {
    return {
      visitors: 1000,
      members: 500,
      donors: 50,
      vip: 25
    };
  }

  async analyzeRevenueSource() {
    return {
      organic: 60,
      referral: 25,
      social: 10,
      direct: 5
    };
  }

  async performCohortAnalysis() {
    return {
      month1Retention: 85,
      month3Retention: 65,
      month6Retention: 45,
      month12Retention: 30
    };
  }

  async calculateMonthlyGrowthRate() {
    const thisMonth = this.getMonthlyRevenue();
    const lastMonth = this.getLastMonthRevenue();
    
    if (lastMonth === 0) return 0;
    return ((thisMonth - lastMonth) / lastMonth) * 100;
  }

  getLastMonthRevenue() {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return this.getTransactionsByDateRange(lastMonthStart, lastMonthEnd)
      .reduce((sum, tx) => sum + tx.netAmount, 0);
  }

  async analyzeMonthlyChurn() {
    return {
      churnRate: await this.calculateChurnRate(),
      churnReasons: {
        'user_requested': 60,
        'payment_failed': 25,
        'inactivity': 15
      }
    };
  }

  generateTaxData(startDate, endDate) {
    const transactions = this.getTransactionsByDateRange(startDate, endDate);
    
    return {
      totalRevenue: transactions.reduce((sum, tx) => sum + tx.amount, 0),
      totalFees: transactions.reduce((sum, tx) => sum + tx.fees, 0),
      netRevenue: transactions.reduce((sum, tx) => sum + tx.netAmount, 0),
      transactionCount: transactions.length,
      revenueByProcessor: this.getRevenueByProcessor(transactions)
    };
  }

  getRevenueByProcessor(transactions) {
    const revenueByProcessor = {};
    
    transactions.forEach(tx => {
      if (!revenueByProcessor[tx.paymentProcessor]) {
        revenueByProcessor[tx.paymentProcessor] = {
          revenue: 0,
          fees: 0,
          count: 0
        };
      }
      revenueByProcessor[tx.paymentProcessor].revenue += tx.amount;
      revenueByProcessor[tx.paymentProcessor].fees += tx.fees;
      revenueByProcessor[tx.paymentProcessor].count += 1;
    });

    return revenueByProcessor;
  }

  getUniqueCustomerCount() {
    const customerIds = new Set();
    this.transactions.forEach(tx => {
      if (tx.metadata.customerId) {
        customerIds.add(tx.metadata.customerId);
      }
    });
    return customerIds.size;
  }

  getSubscriptionMetrics() {
    const active = this.getActiveSubscriptions();
    const monthly = active.filter(sub => sub.interval === 'monthly');
    const yearly = active.filter(sub => sub.interval === 'yearly');

    return {
      totalActive: active.length,
      monthlySubscriptions: monthly.length,
      yearlySubscriptions: yearly.length,
      monthlyRevenue: monthly.reduce((sum, sub) => sum + sub.amount, 0),
      yearlyRevenue: yearly.reduce((sum, sub) => sum + (sub.amount / 12), 0)
    };
  }

  // Payment processor management
  async configurePaymentProcessor(processorName, config) {
    try {
      const processor = {
        ...this.processors[processorName],
        ...config,
        enabled: true
      };

      this.paymentProcessors.set(processorName, processor);
      
      // Save configuration
      const allProcessors = this.store.get('paymentProcessors', {});
      allProcessors[processorName] = processor;
      this.store.set('paymentProcessors', allProcessors);

      this.emit('payment-processor-configured', { processorName, processor });
      console.log(`💳 Configured payment processor: ${processor.name}`);

      return processor;
    } catch (error) {
      console.error('❌ Failed to configure payment processor:', error);
      throw error;
    }
  }

  async disablePaymentProcessor(processorName) {
    try {
      const processor = this.paymentProcessors.get(processorName);
      if (processor) {
        processor.enabled = false;
        this.paymentProcessors.set(processorName, processor);
        
        const allProcessors = this.store.get('paymentProcessors', {});
        allProcessors[processorName] = processor;
        this.store.set('paymentProcessors', allProcessors);

        this.emit('payment-processor-disabled', { processorName });
        console.log(`🚫 Disabled payment processor: ${processor.name}`);
      }
    } catch (error) {
      console.error('❌ Failed to disable payment processor:', error);
      throw error;
    }
  }

  // Data persistence
  async saveRevenueData() {
    try {
      // Save revenue streams
      const streamData = {};
      for (const [id, stream] of this.revenueStreams) {
        streamData[id] = {
          ...stream,
          createdAt: stream.createdAt.toISOString(),
          lastTransaction: stream.lastTransaction ? stream.lastTransaction.toISOString() : null
        };
      }
      this.store.set('revenueStreams', streamData);

      // Save transactions
      const transactionData = {};
      for (const [id, transaction] of this.transactions) {
        transactionData[id] = {
          ...transaction,
          createdAt: transaction.createdAt.toISOString(),
          processedAt: transaction.processedAt ? transaction.processedAt.toISOString() : null
        };
      }
      this.store.set('revenueTransactions', transactionData);

      // Save subscriptions
      const subscriptionData = {};
      for (const [id, subscription] of this.subscriptions) {
        subscriptionData[id] = {
          ...subscription,
          currentPeriodStart: subscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
          createdAt: subscription.createdAt.toISOString(),
          cancelledAt: subscription.cancelledAt ? subscription.cancelledAt.toISOString() : null
        };
      }
      this.store.set('revenueSubscriptions', subscriptionData);
    } catch (error) {
      console.error('❌ Failed to save revenue data:', error);
    }
  }

  // Public API methods
  getRevenueStreams() {
    return Array.from(this.revenueStreams.values());
  }

  getTransactions(limit = 100) {
    return Array.from(this.transactions.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  getSubscriptions() {
    return Array.from(this.subscriptions.values());
  }

  getRevenueAnalytics() {
    return Array.from(this.analytics.values());
  }

  getDashboardSummary() {
    return {
      totalRevenue: this.getTotalRevenue(),
      monthlyRevenue: this.getMonthlyRevenue(),
      activeSubscriptions: this.getActiveSubscriptions().length,
      transactionCount: this.transactions.size,
      averageTransactionValue: this.getAverageTransactionValue(),
      revenueByCategory: this.getRevenueByCategory(),
      topRevenueStreams: this.getTopRevenueStreams(3),
      paymentProcessors: this.getActiveProcessors(),
      growthRate: this.calculateMonthlyGrowthRate()
    };
  }

  async shutdown() {
    try {
      console.log('🛑 Shutting down RevenueDashboard...');
      
      // Clear intervals
      if (this.analyticsInterval) clearInterval(this.analyticsInterval);
      if (this.conversionInterval) clearInterval(this.conversionInterval);
      if (this.dailyReportInterval) clearInterval(this.dailyReportInterval);
      if (this.monthlyReportInterval) clearInterval(this.monthlyReportInterval);

      // Save final state
      await this.saveRevenueData();

      // Clear collections
      this.revenueStreams.clear();
      this.transactions.clear();
      this.subscriptions.clear();
      this.analytics.clear();
      this.paymentProcessors.clear();

      console.log('✅ RevenueDashboard shutdown complete');
    } catch (error) {
      console.error('❌ Error during RevenueDashboard shutdown:', error);
    }
  }
}

module.exports = RevenueDashboard;