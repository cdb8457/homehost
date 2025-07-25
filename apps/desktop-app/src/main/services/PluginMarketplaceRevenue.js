const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * PluginMarketplaceRevenue Service - Epic 4: Story 4.3: Plugin Marketplace Revenue System
 * 
 * Enables plugin developers to earn revenue through the marketplace with 70/30 revenue sharing,
 * subscription models, usage analytics, and quality incentives. Supports international
 * transactions and provides comprehensive developer tools.
 * 
 * Key Features:
 * - 70% developer / 30% platform revenue sharing
 * - Subscription model for recurring plugin revenue
 * - Usage analytics and performance metrics
 * - International payment processing with multi-currency support
 * - Developer dashboard with earnings and feedback tracking
 * - Quality incentives and marketplace visibility rewards
 * - Download metrics and user engagement analytics
 */
class PluginMarketplaceRevenue extends EventEmitter {
  constructor(store, revenueDashboard, pluginManager) {
    super();
    this.store = store;
    this.revenueDashboard = revenueDashboard;
    this.pluginManager = pluginManager;
    
    this.plugins = new Map();
    this.developers = new Map();
    this.sales = new Map();
    this.subscriptions = new Map();
    this.analytics = new Map();
    this.payouts = new Map();
    this.qualityMetrics = new Map();
    this.isInitialized = false;

    // Revenue sharing configuration
    this.revenueSharing = {
      developer: 0.70,    // 70% to developer
      platform: 0.30,    // 30% to platform
      processingFees: {   // Deducted before split
        stripe: { percentage: 0.029, fixed: 0.30 },
        paypal: { percentage: 0.034, fixed: 0.30 },
        crypto: { percentage: 0.015, fixed: 0.00 }
      }
    };

    // Plugin pricing tiers
    this.pricingTiers = {
      free: {
        id: 'free',
        price: 0,
        features: ['Basic functionality', 'Community support'],
        limits: { maxUsers: 100, updates: 'manual' }
      },
      basic: {
        id: 'basic',
        price: 5,
        features: ['Enhanced functionality', 'Email support', 'Auto updates'],
        limits: { maxUsers: 1000, updates: 'automatic' }
      },
      premium: {
        id: 'premium',
        price: 15,
        features: ['Full functionality', 'Priority support', 'Custom branding'],
        limits: { maxUsers: 10000, updates: 'automatic', customization: true }
      },
      enterprise: {
        id: 'enterprise',
        price: 50,
        features: ['Enterprise features', 'SLA support', 'White-label', 'API access'],
        limits: { maxUsers: 'unlimited', updates: 'automatic', customization: true, api: true }
      }
    };

    // Quality incentive system
    this.qualityIncentives = {
      ratings: {
        5.0: { visibilityBoost: 2.0, revenueBonus: 0.05 },
        4.5: { visibilityBoost: 1.5, revenueBonus: 0.03 },
        4.0: { visibilityBoost: 1.2, revenueBonus: 0.01 },
        3.5: { visibilityBoost: 1.0, revenueBonus: 0.00 },
        3.0: { visibilityBoost: 0.8, revenueBonus: 0.00 }
      },
      downloads: {
        10000: { badge: 'Popular', revenueBonus: 0.02 },
        1000: { badge: 'Rising', revenueBonus: 0.01 },
        100: { badge: 'New', revenueBonus: 0.00 }
      }
    };

    // Supported currencies
    this.supportedCurrencies = {
      USD: { symbol: '$', name: 'US Dollar', exchangeRate: 1.0 },
      EUR: { symbol: '€', name: 'Euro', exchangeRate: 0.85 },
      GBP: { symbol: '£', name: 'British Pound', exchangeRate: 0.75 },
      CAD: { symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 1.25 },
      AUD: { symbol: 'A$', name: 'Australian Dollar', exchangeRate: 1.45 },
      JPY: { symbol: '¥', name: 'Japanese Yen', exchangeRate: 110.0 },
      BTC: { symbol: '₿', name: 'Bitcoin', exchangeRate: 0.000025 },
      ETH: { symbol: 'Ξ', name: 'Ethereum', exchangeRate: 0.0004 }
    };
  }

  async initialize() {
    try {
      console.log('Initializing PluginMarketplaceRevenue service...');
      
      // Load existing data
      await this.loadPluginData();
      await this.loadDeveloperData();
      await this.loadSalesData();
      await this.loadAnalyticsData();
      
      // Set up revenue tracking
      this.setupRevenueTracking();
      
      // Start analytics collection
      this.startAnalyticsCollection();
      
      // Set up payout scheduler
      this.setupPayoutScheduler();
      
      this.isInitialized = true;
      console.log('PluginMarketplaceRevenue service initialized successfully');
      
      this.emit('marketplace-initialized', {
        pluginCount: this.plugins.size,
        developerCount: this.developers.size,
        salesCount: this.sales.size
      });
      
    } catch (error) {
      console.error('Failed to initialize PluginMarketplaceRevenue:', error);
      throw error;
    }
  }

  async loadPluginData() {
    const pluginData = this.store.get('marketplacePlugins', {});
    for (const [id, plugin] of Object.entries(pluginData)) {
      this.plugins.set(id, plugin);
    }
  }

  async loadDeveloperData() {
    const developerData = this.store.get('marketplaceDevelopers', {});
    for (const [id, developer] of Object.entries(developerData)) {
      this.developers.set(id, developer);
    }
  }

  async loadSalesData() {
    const salesData = this.store.get('marketplaceSales', {});
    for (const [id, sale] of Object.entries(salesData)) {
      this.sales.set(id, sale);
    }
  }

  async loadAnalyticsData() {
    const analyticsData = this.store.get('marketplaceAnalytics', {});
    for (const [id, analytics] of Object.entries(analyticsData)) {
      this.analytics.set(id, analytics);
    }
  }

  setupRevenueTracking() {
    // Set up revenue stream for plugin marketplace
    if (this.revenueDashboard) {
      this.revenueDashboard.createRevenueStream({
        id: 'plugin-marketplace',
        name: 'Plugin Marketplace',
        category: 'plugins',
        description: 'Revenue from plugin sales and subscriptions',
        configuration: {
          revenueSharing: this.revenueSharing,
          currencies: this.supportedCurrencies
        }
      }).catch(error => {
        console.error('Failed to create plugin marketplace revenue stream:', error);
      });
    }
  }

  startAnalyticsCollection() {
    // Collect plugin usage analytics every hour
    setInterval(() => {
      this.collectUsageAnalytics();
    }, 60 * 60 * 1000); // 1 hour

    // Generate daily analytics reports
    setInterval(() => {
      this.generateDailyAnalytics();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  setupPayoutScheduler() {
    // Process payouts weekly (every Sunday at midnight)
    setInterval(() => {
      const now = new Date();
      if (now.getDay() === 0 && now.getHours() === 0) {
        this.processWeeklyPayouts();
      }
    }, 60 * 60 * 1000); // Check every hour
  }

  // Plugin Management
  async registerPlugin(pluginData) {
    const pluginId = crypto.randomUUID();
    const now = new Date();

    const plugin = {
      id: pluginId,
      ...pluginData,
      developerId: pluginData.developerId,
      version: pluginData.version || '1.0.0',
      price: pluginData.price || 0,
      pricingTier: pluginData.pricingTier || 'free',
      currency: pluginData.currency || 'USD',
      status: 'pending', // pending, approved, rejected, suspended
      downloads: 0,
      totalRevenue: 0,
      averageRating: 0,
      reviewCount: 0,
      lastUpdated: now,
      createdAt: now,
      tags: pluginData.tags || [],
      category: pluginData.category || 'general',
      screenshots: pluginData.screenshots || [],
      documentation: pluginData.documentation || '',
      supportEmail: pluginData.supportEmail || '',
      homepage: pluginData.homepage || '',
      repository: pluginData.repository || '',
      license: pluginData.license || 'MIT',
      dependencies: pluginData.dependencies || [],
      compatibility: pluginData.compatibility || [],
      features: pluginData.features || [],
      changelog: [{
        version: pluginData.version || '1.0.0',
        date: now,
        changes: ['Initial release']
      }]
    };

    this.plugins.set(pluginId, plugin);
    await this.savePluginData();

    // Initialize analytics for this plugin
    this.analytics.set(pluginId, {
      pluginId,
      downloads: [],
      usage: [],
      revenue: [],
      ratings: [],
      reviews: []
    });

    this.emit('plugin-registered', { plugin });
    return plugin;
  }

  async approvePlugin(pluginId, reviewNotes = '') {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.status = 'approved';
    plugin.approvedAt = new Date();
    plugin.reviewNotes = reviewNotes;

    await this.savePluginData();
    this.emit('plugin-approved', { plugin });
    return plugin;
  }

  async rejectPlugin(pluginId, reason) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    plugin.status = 'rejected';
    plugin.rejectedAt = new Date();
    plugin.rejectionReason = reason;

    await this.savePluginData();
    this.emit('plugin-rejected', { plugin, reason });
    return plugin;
  }

  // Developer Management
  async registerDeveloper(developerData) {
    const developerId = crypto.randomUUID();
    const now = new Date();

    const developer = {
      id: developerId,
      ...developerData,
      name: developerData.name,
      email: developerData.email,
      company: developerData.company || '',
      website: developerData.website || '',
      bio: developerData.bio || '',
      avatar: developerData.avatar || '',
      location: developerData.location || '',
      taxInfo: {
        country: developerData.taxInfo?.country || '',
        taxId: developerData.taxInfo?.taxId || '',
        vatNumber: developerData.taxInfo?.vatNumber || '',
        businessType: developerData.taxInfo?.businessType || 'individual'
      },
      paymentInfo: {
        preferredCurrency: developerData.paymentInfo?.preferredCurrency || 'USD',
        stripeAccountId: developerData.paymentInfo?.stripeAccountId || '',
        paypalEmail: developerData.paymentInfo?.paypalEmail || '',
        cryptoWallet: developerData.paymentInfo?.cryptoWallet || ''
      },
      totalEarnings: 0,
      totalSales: 0,
      pluginCount: 0,
      averageRating: 0,
      status: 'active', // active, suspended, banned
      createdAt: now,
      lastLoginAt: now,
      achievements: [],
      qualityScore: 0
    };

    this.developers.set(developerId, developer);
    await this.saveDeveloperData();

    this.emit('developer-registered', { developer });
    return developer;
  }

  async updateDeveloper(developerId, updates) {
    const developer = this.developers.get(developerId);
    if (!developer) {
      throw new Error(`Developer ${developerId} not found`);
    }

    Object.assign(developer, updates);
    developer.updatedAt = new Date();

    await this.saveDeveloperData();
    this.emit('developer-updated', { developer });
    return developer;
  }

  // Sales and Purchases
  async purchasePlugin(purchaseData) {
    const { pluginId, userId, paymentMethod, currency = 'USD' } = purchaseData;
    
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (plugin.status !== 'approved') {
      throw new Error(`Plugin ${pluginId} is not available for purchase`);
    }

    const saleId = crypto.randomUUID();
    const now = new Date();

    // Calculate pricing in requested currency
    const basePrice = plugin.price;
    const exchangeRate = this.supportedCurrencies[currency]?.exchangeRate || 1.0;
    const localPrice = basePrice * exchangeRate;

    // Calculate processing fees
    const processingFees = this.calculateProcessingFees(localPrice, paymentMethod);
    const netAmount = localPrice - processingFees;

    // Calculate revenue split
    const developerRevenue = netAmount * this.revenueSharing.developer;
    const platformRevenue = netAmount * this.revenueSharing.platform;

    // Apply quality bonuses
    const qualityBonus = this.calculateQualityBonus(plugin);
    const finalDeveloperRevenue = developerRevenue * (1 + qualityBonus);
    const finalPlatformRevenue = platformRevenue * (1 - qualityBonus);

    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.05; // 95% success rate

    const sale = {
      id: saleId,
      pluginId,
      developerId: plugin.developerId,
      userId,
      amount: localPrice,
      currency,
      exchangeRate,
      processingFees,
      netAmount,
      developerRevenue: finalDeveloperRevenue,
      platformRevenue: finalPlatformRevenue,
      qualityBonus,
      paymentMethod,
      status: paymentSuccess ? 'completed' : 'failed',
      transactionId: `txn_${crypto.randomBytes(16).toString('hex')}`,
      processedAt: now,
      createdAt: now,
      metadata: {
        userAgent: purchaseData.userAgent || '',
        ipAddress: purchaseData.ipAddress || '',
        referrer: purchaseData.referrer || ''
      }
    };

    this.sales.set(saleId, sale);
    await this.saveSalesData();

    if (paymentSuccess) {
      // Update plugin stats
      plugin.downloads++;
      plugin.totalRevenue += finalDeveloperRevenue;
      plugin.lastPurchase = now;

      // Update developer stats
      const developer = this.developers.get(plugin.developerId);
      if (developer) {
        developer.totalEarnings += finalDeveloperRevenue;
        developer.totalSales++;
        developer.lastSaleAt = now;
      }

      // Process revenue through RevenueDashboard
      if (this.revenueDashboard) {
        await this.revenueDashboard.processTransaction({
          streamId: 'plugin-marketplace',
          amount: finalPlatformRevenue,
          currency,
          category: 'plugins',
          paymentProcessor: paymentMethod,
          metadata: {
            pluginId,
            developerId: plugin.developerId,
            saleId
          }
        });
      }

      // Track analytics
      this.trackPurchaseAnalytics(sale);

      this.emit('plugin-purchased', { sale, plugin });
    } else {
      this.emit('plugin-purchase-failed', { sale, plugin });
    }

    await this.savePluginData();
    await this.saveDeveloperData();

    return sale;
  }

  // Subscription Management
  async createSubscription(subscriptionData) {
    const { pluginId, userId, plan, paymentMethod, currency = 'USD' } = subscriptionData;
    
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const subscriptionId = crypto.randomUUID();
    const now = new Date();

    // Calculate pricing
    const tier = this.pricingTiers[plan];
    if (!tier) {
      throw new Error(`Invalid pricing tier: ${plan}`);
    }

    const exchangeRate = this.supportedCurrencies[currency]?.exchangeRate || 1.0;
    const localPrice = tier.price * exchangeRate;

    const subscription = {
      id: subscriptionId,
      pluginId,
      developerId: plugin.developerId,
      userId,
      plan,
      amount: localPrice,
      currency,
      exchangeRate,
      paymentMethod,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      createdAt: now,
      features: tier.features,
      limits: tier.limits,
      billingCycle: 'monthly',
      renewals: 0,
      totalPaid: 0,
      lastBilledAt: null,
      nextBillingAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    };

    this.subscriptions.set(subscriptionId, subscription);
    await this.saveSubscriptionData();

    this.emit('subscription-created', { subscription, plugin });
    return subscription;
  }

  async renewSubscription(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    const now = new Date();
    
    // Process payment
    const sale = await this.purchasePlugin({
      pluginId: subscription.pluginId,
      userId: subscription.userId,
      paymentMethod: subscription.paymentMethod,
      currency: subscription.currency
    });

    if (sale.status === 'completed') {
      subscription.currentPeriodStart = subscription.currentPeriodEnd;
      subscription.currentPeriodEnd = new Date(subscription.currentPeriodEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
      subscription.renewals++;
      subscription.totalPaid += subscription.amount;
      subscription.lastBilledAt = now;
      subscription.nextBillingAt = subscription.currentPeriodEnd;

      await this.saveSubscriptionData();
      this.emit('subscription-renewed', { subscription, sale });
    } else {
      subscription.status = 'payment_failed';
      this.emit('subscription-payment-failed', { subscription, sale });
    }

    return subscription;
  }

  // Analytics and Reporting
  async collectUsageAnalytics() {
    for (const [pluginId, plugin] of this.plugins.entries()) {
      if (plugin.status === 'approved') {
        const analytics = this.analytics.get(pluginId) || {
          pluginId,
          downloads: [],
          usage: [],
          revenue: [],
          ratings: [],
          reviews: []
        };

        // Simulate usage data
        const hourlyUsage = {
          timestamp: new Date(),
          activeUsers: Math.floor(Math.random() * plugin.downloads * 0.1),
          sessions: Math.floor(Math.random() * plugin.downloads * 0.2),
          crashes: Math.floor(Math.random() * 5),
          performance: {
            averageLoadTime: Math.random() * 2000 + 500,
            memoryUsage: Math.random() * 100 + 50,
            cpuUsage: Math.random() * 50 + 10
          }
        };

        analytics.usage.push(hourlyUsage);

        // Keep only last 30 days of hourly data
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        analytics.usage = analytics.usage.filter(u => u.timestamp > thirtyDaysAgo);

        this.analytics.set(pluginId, analytics);
      }
    }

    await this.saveAnalyticsData();
  }

  async generateDailyAnalytics() {
    const now = new Date();
    const dailyReport = {
      date: now,
      pluginSales: 0,
      totalRevenue: 0,
      newDownloads: 0,
      activePlugins: 0,
      topPerformers: [],
      qualityMetrics: {},
      developerEarnings: 0
    };

    // Calculate daily metrics
    for (const [saleId, sale] of this.sales.entries()) {
      const saleDate = new Date(sale.createdAt);
      if (saleDate.toDateString() === now.toDateString()) {
        dailyReport.pluginSales++;
        dailyReport.totalRevenue += sale.amount;
        dailyReport.developerEarnings += sale.developerRevenue;
      }
    }

    // Find top performing plugins
    const pluginPerformance = Array.from(this.plugins.values())
      .filter(p => p.status === 'approved')
      .map(p => ({
        id: p.id,
        name: p.name,
        downloads: p.downloads,
        revenue: p.totalRevenue,
        rating: p.averageRating
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    dailyReport.topPerformers = pluginPerformance;
    dailyReport.activePlugins = this.plugins.size;

    this.emit('daily-analytics-generated', { report: dailyReport });
    return dailyReport;
  }

  async getDeveloperDashboard(developerId) {
    const developer = this.developers.get(developerId);
    if (!developer) {
      throw new Error(`Developer ${developerId} not found`);
    }

    const developerPlugins = Array.from(this.plugins.values())
      .filter(p => p.developerId === developerId);

    const developerSales = Array.from(this.sales.values())
      .filter(s => s.developerId === developerId);

    const totalDownloads = developerPlugins.reduce((sum, p) => sum + p.downloads, 0);
    const totalRevenue = developerSales.reduce((sum, s) => sum + s.developerRevenue, 0);
    const averageRating = developerPlugins.length > 0 
      ? developerPlugins.reduce((sum, p) => sum + p.averageRating, 0) / developerPlugins.length 
      : 0;

    // Recent sales (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSales = developerSales.filter(s => new Date(s.createdAt) > thirtyDaysAgo);

    // Monthly earnings
    const monthlyEarnings = this.calculateMonthlyEarnings(developerId);

    return {
      developer,
      summary: {
        totalPlugins: developerPlugins.length,
        totalDownloads,
        totalRevenue,
        averageRating,
        qualityScore: developer.qualityScore,
        achievements: developer.achievements
      },
      plugins: developerPlugins,
      recentSales: recentSales.slice(0, 10),
      monthlyEarnings,
      analytics: this.getDeveloperAnalytics(developerId),
      payoutHistory: this.getDeveloperPayouts(developerId)
    };
  }

  calculateMonthlyEarnings(developerId) {
    const sales = Array.from(this.sales.values())
      .filter(s => s.developerId === developerId && s.status === 'completed');

    const monthlyData = {};
    
    sales.forEach(sale => {
      const month = new Date(sale.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, sales: 0 };
      }
      monthlyData[month].revenue += sale.developerRevenue;
      monthlyData[month].sales++;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  getDeveloperAnalytics(developerId) {
    const developerPlugins = Array.from(this.plugins.values())
      .filter(p => p.developerId === developerId);

    const analytics = {};
    
    developerPlugins.forEach(plugin => {
      const pluginAnalytics = this.analytics.get(plugin.id);
      if (pluginAnalytics) {
        analytics[plugin.id] = {
          pluginName: plugin.name,
          usage: pluginAnalytics.usage.slice(-24), // Last 24 hours
          downloads: pluginAnalytics.downloads.slice(-30), // Last 30 days
          ratings: pluginAnalytics.ratings
        };
      }
    });

    return analytics;
  }

  getDeveloperPayouts(developerId) {
    return Array.from(this.payouts.values())
      .filter(p => p.developerId === developerId)
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));
  }

  // Payout Processing
  async processWeeklyPayouts() {
    console.log('Processing weekly developer payouts...');
    
    const developers = Array.from(this.developers.values())
      .filter(d => d.status === 'active');

    for (const developer of developers) {
      await this.processDeveloperPayout(developer.id);
    }

    this.emit('weekly-payouts-processed', {
      developersProcessed: developers.length,
      processedAt: new Date()
    });
  }

  async processDeveloperPayout(developerId) {
    const developer = this.developers.get(developerId);
    if (!developer) {
      throw new Error(`Developer ${developerId} not found`);
    }

    // Calculate pending earnings (last week)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const pendingSales = Array.from(this.sales.values())
      .filter(s => s.developerId === developerId && 
                  s.status === 'completed' && 
                  new Date(s.createdAt) > oneWeekAgo);

    const pendingEarnings = pendingSales.reduce((sum, s) => sum + s.developerRevenue, 0);

    // Minimum payout threshold
    const minimumPayout = 10; // $10 minimum
    
    if (pendingEarnings < minimumPayout) {
      console.log(`Developer ${developerId} earnings ${pendingEarnings} below minimum ${minimumPayout}`);
      return null;
    }

    const payoutId = crypto.randomUUID();
    const now = new Date();

    const payout = {
      id: payoutId,
      developerId,
      amount: pendingEarnings,
      currency: developer.paymentInfo.preferredCurrency,
      paymentMethod: this.getPreferredPaymentMethod(developer),
      status: 'pending',
      salesIncluded: pendingSales.map(s => s.id),
      fees: this.calculatePayoutFees(pendingEarnings, developer.paymentInfo.preferredCurrency),
      netAmount: pendingEarnings - this.calculatePayoutFees(pendingEarnings, developer.paymentInfo.preferredCurrency),
      createdAt: now,
      processedAt: null,
      failureReason: null
    };

    // Simulate payout processing
    const payoutSuccess = Math.random() > 0.02; // 98% success rate

    if (payoutSuccess) {
      payout.status = 'completed';
      payout.processedAt = now;
      payout.transactionId = `payout_${crypto.randomBytes(16).toString('hex')}`;
    } else {
      payout.status = 'failed';
      payout.failureReason = 'Payment processor error';
    }

    this.payouts.set(payoutId, payout);
    await this.savePayoutData();

    this.emit('developer-payout-processed', { payout, developer });
    return payout;
  }

  getPreferredPaymentMethod(developer) {
    if (developer.paymentInfo.stripeAccountId) return 'stripe';
    if (developer.paymentInfo.paypalEmail) return 'paypal';
    if (developer.paymentInfo.cryptoWallet) return 'crypto';
    return 'bank_transfer';
  }

  calculatePayoutFees(amount, currency) {
    const feeRates = {
      stripe: 0.005, // 0.5%
      paypal: 0.01,  // 1%
      crypto: 0.002, // 0.2%
      bank_transfer: 2.5 // $2.50 flat fee
    };
    
    if (currency === 'USD') {
      return amount * 0.005; // 0.5% for USD
    }
    
    return amount * 0.01; // 1% for other currencies
  }

  // Utility Functions
  calculateProcessingFees(amount, processor) {
    const fees = this.revenueSharing.processingFees[processor];
    if (!fees) {
      throw new Error(`Unsupported payment processor: ${processor}`);
    }
    
    return (amount * fees.percentage) + fees.fixed;
  }

  calculateQualityBonus(plugin) {
    let bonus = 0;
    
    // Rating bonus
    if (plugin.averageRating >= 4.5) {
      bonus += this.qualityIncentives.ratings[4.5].revenueBonus;
    } else if (plugin.averageRating >= 4.0) {
      bonus += this.qualityIncentives.ratings[4.0].revenueBonus;
    }
    
    // Download milestone bonus
    if (plugin.downloads >= 10000) {
      bonus += this.qualityIncentives.downloads[10000].revenueBonus;
    } else if (plugin.downloads >= 1000) {
      bonus += this.qualityIncentives.downloads[1000].revenueBonus;
    }
    
    return Math.min(bonus, 0.1); // Max 10% bonus
  }

  trackPurchaseAnalytics(sale) {
    const analytics = this.analytics.get(sale.pluginId);
    if (analytics) {
      analytics.downloads.push({
        timestamp: sale.createdAt,
        userId: sale.userId,
        amount: sale.amount,
        currency: sale.currency,
        paymentMethod: sale.paymentMethod,
        referrer: sale.metadata.referrer
      });
      
      analytics.revenue.push({
        timestamp: sale.createdAt,
        amount: sale.developerRevenue,
        currency: sale.currency,
        qualityBonus: sale.qualityBonus
      });
    }
  }

  // Data Persistence
  async savePluginData() {
    const pluginData = {};
    for (const [id, plugin] of this.plugins.entries()) {
      pluginData[id] = plugin;
    }
    this.store.set('marketplacePlugins', pluginData);
  }

  async saveDeveloperData() {
    const developerData = {};
    for (const [id, developer] of this.developers.entries()) {
      developerData[id] = developer;
    }
    this.store.set('marketplaceDevelopers', developerData);
  }

  async saveSalesData() {
    const salesData = {};
    for (const [id, sale] of this.sales.entries()) {
      salesData[id] = sale;
    }
    this.store.set('marketplaceSales', salesData);
  }

  async saveSubscriptionData() {
    const subscriptionData = {};
    for (const [id, subscription] of this.subscriptions.entries()) {
      subscriptionData[id] = subscription;
    }
    this.store.set('marketplaceSubscriptions', subscriptionData);
  }

  async saveAnalyticsData() {
    const analyticsData = {};
    for (const [id, analytics] of this.analytics.entries()) {
      analyticsData[id] = analytics;
    }
    this.store.set('marketplaceAnalytics', analyticsData);
  }

  async savePayoutData() {
    const payoutData = {};
    for (const [id, payout] of this.payouts.entries()) {
      payoutData[id] = payout;
    }
    this.store.set('marketplacePayouts', payoutData);
  }

  // Getters
  getPlugins() {
    return Array.from(this.plugins.values());
  }

  getDevelopers() {
    return Array.from(this.developers.values());
  }

  getSales() {
    return Array.from(this.sales.values());
  }

  getSubscriptions() {
    return Array.from(this.subscriptions.values());
  }

  getAnalytics() {
    return Array.from(this.analytics.values());
  }

  getPayouts() {
    return Array.from(this.payouts.values());
  }

  getPricingTiers() {
    return this.pricingTiers;
  }

  getSupportedCurrencies() {
    return this.supportedCurrencies;
  }

  getQualityIncentives() {
    return this.qualityIncentives;
  }

  async shutdown() {
    console.log('Shutting down PluginMarketplaceRevenue service...');
    
    // Save all data
    await this.savePluginData();
    await this.saveDeveloperData();
    await this.saveSalesData();
    await this.saveSubscriptionData();
    await this.saveAnalyticsData();
    await this.savePayoutData();
    
    // Clear all data
    this.plugins.clear();
    this.developers.clear();
    this.sales.clear();
    this.subscriptions.clear();
    this.analytics.clear();
    this.payouts.clear();
    
    this.isInitialized = false;
    console.log('PluginMarketplaceRevenue service shut down successfully');
  }
}

module.exports = PluginMarketplaceRevenue;