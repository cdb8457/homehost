import React, { useState, useEffect, useCallback } from 'react';
import './PluginMarketplaceRevenue.css';

/**
 * PluginMarketplaceRevenue Component - Epic 4: Story 4.3: Plugin Marketplace Revenue System
 * 
 * Enables plugin developers to earn revenue through the marketplace with 70/30 revenue sharing,
 * subscription models, usage analytics, and quality incentives. Provides developer dashboard
 * with comprehensive earnings tracking and marketplace management tools.
 */
const PluginMarketplaceRevenue = () => {
  const [plugins, setPlugins] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [sales, setSales] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [pricingTiers, setPricingTiers] = useState({});
  const [supportedCurrencies, setSupportedCurrencies] = useState({});
  const [qualityIncentives, setQualityIncentives] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [selectedPlugin, setSelectedPlugin] = useState(null);

  // Initialize component
  useEffect(() => {
    initializePluginMarketplace();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const handlers = {
      'marketplace-initialized': handleMarketplaceInitialized,
      'plugin-registered': handlePluginRegistered,
      'plugin-approved': handlePluginApproved,
      'plugin-rejected': handlePluginRejected,
      'plugin-purchased': handlePluginPurchased,
      'plugin-purchase-failed': handlePluginPurchaseFailed,
      'developer-registered': handleDeveloperRegistered,
      'subscription-created': handleSubscriptionCreated,
      'subscription-renewed': handleSubscriptionRenewed,
      'subscription-payment-failed': handleSubscriptionPaymentFailed,
      'developer-payout-processed': handleDeveloperPayoutProcessed,
      'daily-analytics-generated': handleDailyAnalyticsGenerated,
      'weekly-payouts-processed': handleWeeklyPayoutsProcessed
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      window.electronAPI.on(event, handler);
    });

    return () => {
      Object.keys(handlers).forEach(event => {
        window.electronAPI.removeAllListeners(event);
      });
    };
  }, []);

  const initializePluginMarketplace = async () => {
    try {
      setIsLoading(true);

      // Load plugins
      const pluginList = await window.electronAPI.invoke('plugin-marketplace:get-plugins');
      setPlugins(pluginList || []);

      // Load developers
      const developerList = await window.electronAPI.invoke('plugin-marketplace:get-developers');
      setDevelopers(developerList || []);

      // Load sales
      const salesList = await window.electronAPI.invoke('plugin-marketplace:get-sales');
      setSales(salesList || []);

      // Load subscriptions
      const subscriptionList = await window.electronAPI.invoke('plugin-marketplace:get-subscriptions');
      setSubscriptions(subscriptionList || []);

      // Load analytics
      const analyticsList = await window.electronAPI.invoke('plugin-marketplace:get-analytics');
      setAnalytics(analyticsList || []);

      // Load payouts
      const payoutList = await window.electronAPI.invoke('plugin-marketplace:get-payouts');
      setPayouts(payoutList || []);

      // Load configuration data
      const tiers = await window.electronAPI.invoke('plugin-marketplace:get-pricing-tiers');
      setPricingTiers(tiers || {});

      const currencies = await window.electronAPI.invoke('plugin-marketplace:get-supported-currencies');
      setSupportedCurrencies(currencies || {});

      const incentives = await window.electronAPI.invoke('plugin-marketplace:get-quality-incentives');
      setQualityIncentives(incentives || {});

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize plugin marketplace:', error);
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleMarketplaceInitialized = useCallback((data) => {
    console.log('Marketplace initialized:', data);
  }, []);

  const handlePluginRegistered = useCallback((data) => {
    setPlugins(prev => [data.plugin, ...prev]);
  }, []);

  const handlePluginApproved = useCallback((data) => {
    setPlugins(prev => 
      prev.map(plugin => plugin.id === data.plugin.id ? data.plugin : plugin)
    );
  }, []);

  const handlePluginRejected = useCallback((data) => {
    setPlugins(prev => 
      prev.map(plugin => plugin.id === data.plugin.id ? data.plugin : plugin)
    );
  }, []);

  const handlePluginPurchased = useCallback((data) => {
    setSales(prev => [data.sale, ...prev]);
    setPlugins(prev => 
      prev.map(plugin => plugin.id === data.plugin.id ? data.plugin : plugin)
    );
  }, []);

  const handlePluginPurchaseFailed = useCallback((data) => {
    setSales(prev => [data.sale, ...prev]);
  }, []);

  const handleDeveloperRegistered = useCallback((data) => {
    setDevelopers(prev => [data.developer, ...prev]);
  }, []);

  const handleSubscriptionCreated = useCallback((data) => {
    setSubscriptions(prev => [data.subscription, ...prev]);
  }, []);

  const handleSubscriptionRenewed = useCallback((data) => {
    setSubscriptions(prev => 
      prev.map(sub => sub.id === data.subscription.id ? data.subscription : sub)
    );
  }, []);

  const handleSubscriptionPaymentFailed = useCallback((data) => {
    setSubscriptions(prev => 
      prev.map(sub => sub.id === data.subscription.id ? data.subscription : sub)
    );
  }, []);

  const handleDeveloperPayoutProcessed = useCallback((data) => {
    setPayouts(prev => [data.payout, ...prev]);
  }, []);

  const handleDailyAnalyticsGenerated = useCallback((data) => {
    console.log('Daily analytics generated:', data.report);
  }, []);

  const handleWeeklyPayoutsProcessed = useCallback((data) => {
    console.log('Weekly payouts processed:', data);
  }, []);

  // Plugin actions
  const registerPlugin = async (pluginData) => {
    try {
      const plugin = await window.electronAPI.invoke('plugin-marketplace:register-plugin', pluginData);
      console.log('Plugin registered:', plugin);
    } catch (error) {
      console.error('Failed to register plugin:', error);
      alert('Failed to register plugin: ' + error.message);
    }
  };

  const approvePlugin = async (pluginId, reviewNotes = '') => {
    try {
      const plugin = await window.electronAPI.invoke('plugin-marketplace:approve-plugin', {
        pluginId,
        reviewNotes
      });
      console.log('Plugin approved:', plugin);
    } catch (error) {
      console.error('Failed to approve plugin:', error);
      alert('Failed to approve plugin: ' + error.message);
    }
  };

  const rejectPlugin = async (pluginId, reason) => {
    try {
      const plugin = await window.electronAPI.invoke('plugin-marketplace:reject-plugin', {
        pluginId,
        reason
      });
      console.log('Plugin rejected:', plugin);
    } catch (error) {
      console.error('Failed to reject plugin:', error);
      alert('Failed to reject plugin: ' + error.message);
    }
  };

  const purchasePlugin = async (pluginId, paymentMethod = 'stripe') => {
    try {
      const sale = await window.electronAPI.invoke('plugin-marketplace:purchase-plugin', {
        pluginId,
        userId: 'demo-user-' + Date.now(),
        paymentMethod,
        currency: 'USD'
      });
      console.log('Plugin purchased:', sale);
    } catch (error) {
      console.error('Failed to purchase plugin:', error);
      alert('Failed to purchase plugin: ' + error.message);
    }
  };

  // Developer actions
  const registerDeveloper = async (developerData) => {
    try {
      const developer = await window.electronAPI.invoke('plugin-marketplace:register-developer', developerData);
      console.log('Developer registered:', developer);
    } catch (error) {
      console.error('Failed to register developer:', error);
      alert('Failed to register developer: ' + error.message);
    }
  };

  // Utility functions
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      approved: '#4caf50',
      rejected: '#f44336',
      suspended: '#9e9e9e',
      active: '#4caf50',
      completed: '#4caf50',
      failed: '#f44336',
      cancelled: '#9e9e9e'
    };
    return colors[status] || '#9e9e9e';
  };

  const getTierColor = (tier) => {
    const colors = {
      free: '#9e9e9e',
      basic: '#2196f3',
      premium: '#9c27b0',
      enterprise: '#ff9800'
    };
    return colors[tier] || '#9e9e9e';
  };

  const calculateTotalRevenue = () => {
    return sales
      .filter(sale => sale.status === 'completed')
      .reduce((total, sale) => total + sale.platformRevenue, 0);
  };

  const calculateDeveloperEarnings = () => {
    return sales
      .filter(sale => sale.status === 'completed')
      .reduce((total, sale) => total + sale.developerRevenue, 0);
  };

  if (isLoading) {
    return (
      <div className="marketplace-loading">
        <div className="loading-spinner"></div>
        <p>Loading Plugin Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="plugin-marketplace-revenue">
      {/* Header */}
      <div className="marketplace-header">
        <div className="header-title">
          <h1>🛒 Plugin Marketplace</h1>
          <p>Monetization platform for plugin developers with 70/30 revenue sharing</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{plugins.filter(p => p.status === 'approved').length}</span>
            <span className="stat-label">Active Plugins</span>
          </div>
          <div className="stat">
            <span className="stat-number">{developers.filter(d => d.status === 'active').length}</span>
            <span className="stat-label">Active Developers</span>
          </div>
          <div className="stat">
            <span className="stat-number">{formatCurrency(calculateTotalRevenue())}</span>
            <span className="stat-label">Platform Revenue</span>
          </div>
          <div className="stat">
            <span className="stat-number">{formatCurrency(calculateDeveloperEarnings())}</span>
            <span className="stat-label">Developer Earnings</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="marketplace-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'plugins' ? 'active' : ''}`}
          onClick={() => setActiveTab('plugins')}
        >
          🔌 Plugins
        </button>
        <button 
          className={`tab ${activeTab === 'developers' ? 'active' : ''}`}
          onClick={() => setActiveTab('developers')}
        >
          👨‍💻 Developers
        </button>
        <button 
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          💰 Sales & Revenue
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'payouts' ? 'active' : ''}`}
          onClick={() => setActiveTab('payouts')}
        >
          💸 Payouts
        </button>
      </div>

      <div className="marketplace-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Revenue Summary */}
            <div className="overview-section">
              <h3>Revenue Overview</h3>
              <div className="revenue-summary">
                <div className="revenue-card">
                  <div className="card-header">
                    <h4>Total Sales</h4>
                    <span className="card-value">{sales.filter(s => s.status === 'completed').length}</span>
                  </div>
                  <div className="card-details">
                    <div>Platform: {formatCurrency(calculateTotalRevenue())}</div>
                    <div>Developers: {formatCurrency(calculateDeveloperEarnings())}</div>
                  </div>
                </div>

                <div className="revenue-card">
                  <div className="card-header">
                    <h4>Active Subscriptions</h4>
                    <span className="card-value">{subscriptions.filter(s => s.status === 'active').length}</span>
                  </div>
                  <div className="card-details">
                    <div>Monthly Revenue: {formatCurrency(
                      subscriptions
                        .filter(s => s.status === 'active')
                        .reduce((sum, s) => sum + s.amount, 0)
                    )}</div>
                  </div>
                </div>

                <div className="revenue-card">
                  <div className="card-header">
                    <h4>Pending Payouts</h4>
                    <span className="card-value">{payouts.filter(p => p.status === 'pending').length}</span>
                  </div>
                  <div className="card-details">
                    <div>Amount: {formatCurrency(
                      payouts
                        .filter(p => p.status === 'pending')
                        .reduce((sum, p) => sum + p.amount, 0)
                    )}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Plugins */}
            <div className="overview-section">
              <h3>Top Performing Plugins</h3>
              <div className="top-plugins">
                {plugins
                  .filter(p => p.status === 'approved')
                  .sort((a, b) => b.totalRevenue - a.totalRevenue)
                  .slice(0, 5)
                  .map(plugin => (
                    <div key={plugin.id} className="plugin-card mini">
                      <div className="plugin-info">
                        <h4>{plugin.name}</h4>
                        <div className="plugin-stats">
                          <span>Downloads: {plugin.downloads}</span>
                          <span>Revenue: {formatCurrency(plugin.totalRevenue)}</span>
                          <span>Rating: ⭐ {plugin.averageRating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="overview-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button 
                  className="action-btn"
                  onClick={() => registerPlugin({
                    name: 'Test Plugin',
                    description: 'A sample plugin for testing',
                    version: '1.0.0',
                    developerId: 'dev-' + Date.now(),
                    price: 10,
                    pricingTier: 'basic',
                    category: 'utility',
                    tags: ['test', 'utility']
                  })}
                >
                  🔌 Register Test Plugin
                </button>
                <button 
                  className="action-btn"
                  onClick={() => registerDeveloper({
                    name: 'Test Developer',
                    email: 'test@example.com',
                    company: 'Test Company',
                    paymentInfo: { preferredCurrency: 'USD' }
                  })}
                >
                  👨‍💻 Register Test Developer
                </button>
                <button 
                  className="action-btn"
                  onClick={() => {
                    const approvedPlugins = plugins.filter(p => p.status === 'approved');
                    if (approvedPlugins.length > 0) {
                      purchasePlugin(approvedPlugins[0].id);
                    }
                  }}
                >
                  💰 Test Purchase
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plugins Tab */}
        {activeTab === 'plugins' && (
          <div className="plugins-tab">
            <div className="tab-header">
              <h3>Plugin Management</h3>
              <div className="plugin-stats">
                <span className="stat">Total: {plugins.length}</span>
                <span className="stat">Approved: {plugins.filter(p => p.status === 'approved').length}</span>
                <span className="stat">Pending: {plugins.filter(p => p.status === 'pending').length}</span>
                <span className="stat">Rejected: {plugins.filter(p => p.status === 'rejected').length}</span>
              </div>
            </div>

            <div className="plugins-grid">
              {plugins.map(plugin => (
                <div key={plugin.id} className="plugin-card">
                  <div className="plugin-header">
                    <div className="plugin-title">
                      <h4>{plugin.name}</h4>
                      <span className="plugin-version">v{plugin.version}</span>
                    </div>
                    <span 
                      className="plugin-status"
                      style={{ backgroundColor: getStatusColor(plugin.status) }}
                    >
                      {plugin.status}
                    </span>
                  </div>

                  <div className="plugin-details">
                    <p className="plugin-description">{plugin.description}</p>
                    
                    <div className="plugin-meta">
                      <div className="meta-row">
                        <span>Price: {formatCurrency(plugin.price)}</span>
                        <span 
                          className="pricing-tier"
                          style={{ color: getTierColor(plugin.pricingTier) }}
                        >
                          {plugin.pricingTier}
                        </span>
                      </div>
                      <div className="meta-row">
                        <span>Downloads: {plugin.downloads}</span>
                        <span>Revenue: {formatCurrency(plugin.totalRevenue)}</span>
                      </div>
                      <div className="meta-row">
                        <span>Rating: ⭐ {plugin.averageRating.toFixed(1)}</span>
                        <span>Reviews: {plugin.reviewCount}</span>
                      </div>
                    </div>

                    <div className="plugin-tags">
                      {plugin.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="plugin-actions">
                    {plugin.status === 'pending' && (
                      <>
                        <button 
                          className="approve-btn"
                          onClick={() => approvePlugin(plugin.id, 'Approved for marketplace')}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => rejectPlugin(plugin.id, 'Does not meet quality standards')}
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}
                    {plugin.status === 'approved' && (
                      <button 
                        className="purchase-btn"
                        onClick={() => purchasePlugin(plugin.id)}
                      >
                        💰 Test Purchase
                      </button>
                    )}
                    <button 
                      className="details-btn"
                      onClick={() => setSelectedPlugin(plugin)}
                    >
                      📋 Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Developers Tab */}
        {activeTab === 'developers' && (
          <div className="developers-tab">
            <div className="tab-header">
              <h3>Developer Management</h3>
              <div className="developer-stats">
                <span className="stat">Total: {developers.length}</span>
                <span className="stat">Active: {developers.filter(d => d.status === 'active').length}</span>
                <span className="stat">Total Earnings: {formatCurrency(
                  developers.reduce((sum, d) => sum + d.totalEarnings, 0)
                )}</span>
              </div>
            </div>

            <div className="developers-table">
              <div className="table-header">
                <div className="col-developer">Developer</div>
                <div className="col-plugins">Plugins</div>
                <div className="col-sales">Sales</div>
                <div className="col-earnings">Earnings</div>
                <div className="col-rating">Rating</div>
                <div className="col-status">Status</div>
                <div className="col-actions">Actions</div>
              </div>
              <div className="table-body">
                {developers.map(developer => (
                  <div key={developer.id} className="developer-row">
                    <div className="col-developer">
                      <div className="developer-info">
                        <strong>{developer.name}</strong>
                        <div className="developer-email">{developer.email}</div>
                        {developer.company && (
                          <div className="developer-company">{developer.company}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-plugins">{developer.pluginCount}</div>
                    <div className="col-sales">{developer.totalSales}</div>
                    <div className="col-earnings">{formatCurrency(developer.totalEarnings)}</div>
                    <div className="col-rating">⭐ {developer.averageRating.toFixed(1)}</div>
                    <div className="col-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(developer.status) }}
                      >
                        {developer.status}
                      </span>
                    </div>
                    <div className="col-actions">
                      <button 
                        className="dashboard-btn"
                        onClick={() => setSelectedDeveloper(developer)}
                      >
                        📊 Dashboard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div className="sales-tab">
            <div className="tab-header">
              <h3>Sales & Revenue Tracking</h3>
              <div className="sales-stats">
                <span className="stat">Total Sales: {sales.filter(s => s.status === 'completed').length}</span>
                <span className="stat">Failed: {sales.filter(s => s.status === 'failed').length}</span>
                <span className="stat">Platform Revenue: {formatCurrency(calculateTotalRevenue())}</span>
                <span className="stat">Developer Earnings: {formatCurrency(calculateDeveloperEarnings())}</span>
              </div>
            </div>

            <div className="sales-table">
              <div className="table-header">
                <div className="col-date">Date</div>
                <div className="col-plugin">Plugin</div>
                <div className="col-developer">Developer</div>
                <div className="col-amount">Amount</div>
                <div className="col-revenue">Revenue Split</div>
                <div className="col-method">Payment</div>
                <div className="col-status">Status</div>
              </div>
              <div className="table-body">
                {sales.slice(0, 50).map(sale => {
                  const plugin = plugins.find(p => p.id === sale.pluginId);
                  const developer = developers.find(d => d.id === sale.developerId);
                  
                  return (
                    <div key={sale.id} className="sale-row">
                      <div className="col-date">{formatDate(sale.createdAt)}</div>
                      <div className="col-plugin">{plugin?.name || 'Unknown'}</div>
                      <div className="col-developer">{developer?.name || 'Unknown'}</div>
                      <div className="col-amount">{formatCurrency(sale.amount, sale.currency)}</div>
                      <div className="col-revenue">
                        <div className="revenue-split">
                          <div>Dev: {formatCurrency(sale.developerRevenue, sale.currency)}</div>
                          <div>Platform: {formatCurrency(sale.platformRevenue, sale.currency)}</div>
                        </div>
                      </div>
                      <div className="col-method">{sale.paymentMethod}</div>
                      <div className="col-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(sale.status) }}
                        >
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="tab-header">
              <h3>Marketplace Analytics</h3>
            </div>

            {/* Pricing Tiers Overview */}
            <div className="analytics-section">
              <h4>Pricing Tiers Distribution</h4>
              <div className="pricing-tiers">
                {Object.entries(pricingTiers).map(([tierId, tier]) => {
                  const tierPlugins = plugins.filter(p => p.pricingTier === tierId);
                  const tierRevenue = sales
                    .filter(s => s.status === 'completed')
                    .filter(s => plugins.find(p => p.id === s.pluginId)?.pricingTier === tierId)
                    .reduce((sum, s) => sum + s.amount, 0);
                  
                  return (
                    <div key={tierId} className="tier-card">
                      <div className="tier-header">
                        <h5 style={{ color: getTierColor(tierId) }}>{tier.name}</h5>
                        <div className="tier-price">{formatCurrency(tier.price)}</div>
                      </div>
                      <div className="tier-stats">
                        <div>Plugins: {tierPlugins.length}</div>
                        <div>Revenue: {formatCurrency(tierRevenue)}</div>
                      </div>
                      <div className="tier-features">
                        {tier.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="feature">{feature}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality Incentives */}
            <div className="analytics-section">
              <h4>Quality Incentives System</h4>
              <div className="quality-incentives">
                <div className="incentive-category">
                  <h5>Rating Bonuses</h5>
                  {Object.entries(qualityIncentives.ratings || {}).map(([rating, bonus]) => (
                    <div key={rating} className="incentive-item">
                      <span>⭐ {rating}+</span>
                      <span>+{(bonus.revenueBonus * 100).toFixed(1)}% revenue</span>
                      <span>{bonus.visibilityBoost}x visibility</span>
                    </div>
                  ))}
                </div>
                <div className="incentive-category">
                  <h5>Download Milestones</h5>
                  {Object.entries(qualityIncentives.downloads || {}).map(([downloads, bonus]) => (
                    <div key={downloads} className="incentive-item">
                      <span>📥 {downloads}+ downloads</span>
                      <span>{bonus.badge} badge</span>
                      <span>+{(bonus.revenueBonus * 100).toFixed(1)}% revenue</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Currency Support */}
            <div className="analytics-section">
              <h4>Supported Currencies</h4>
              <div className="currencies-grid">
                {Object.entries(supportedCurrencies).map(([code, currency]) => (
                  <div key={code} className="currency-card">
                    <div className="currency-symbol">{currency.symbol}</div>
                    <div className="currency-info">
                      <div className="currency-code">{code}</div>
                      <div className="currency-name">{currency.name}</div>
                      <div className="exchange-rate">Rate: {currency.exchangeRate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="payouts-tab">
            <div className="tab-header">
              <h3>Developer Payouts</h3>
              <div className="payout-stats">
                <span className="stat">Pending: {payouts.filter(p => p.status === 'pending').length}</span>
                <span className="stat">Completed: {payouts.filter(p => p.status === 'completed').length}</span>
                <span className="stat">Total Paid: {formatCurrency(
                  payouts
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                )}</span>
              </div>
            </div>

            <div className="payouts-table">
              <div className="table-header">
                <div className="col-date">Date</div>
                <div className="col-developer">Developer</div>
                <div className="col-amount">Amount</div>
                <div className="col-currency">Currency</div>
                <div className="col-method">Method</div>
                <div className="col-fees">Fees</div>
                <div className="col-net">Net Amount</div>
                <div className="col-status">Status</div>
              </div>
              <div className="table-body">
                {payouts.map(payout => {
                  const developer = developers.find(d => d.id === payout.developerId);
                  
                  return (
                    <div key={payout.id} className="payout-row">
                      <div className="col-date">{formatDate(payout.createdAt)}</div>
                      <div className="col-developer">{developer?.name || 'Unknown'}</div>
                      <div className="col-amount">{formatCurrency(payout.amount, payout.currency)}</div>
                      <div className="col-currency">{payout.currency}</div>
                      <div className="col-method">{payout.paymentMethod}</div>
                      <div className="col-fees">{formatCurrency(payout.fees, payout.currency)}</div>
                      <div className="col-net">{formatCurrency(payout.netAmount, payout.currency)}</div>
                      <div className="col-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(payout.status) }}
                        >
                          {payout.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Developer Dashboard Modal */}
      {selectedDeveloper && (
        <div className="modal-overlay">
          <div className="modal developer-dashboard-modal">
            <div className="modal-header">
              <h2>Developer Dashboard - {selectedDeveloper.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedDeveloper(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="dashboard-overview">
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h4>Total Earnings</h4>
                    <div className="stat-value">{formatCurrency(selectedDeveloper.totalEarnings)}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Total Sales</h4>
                    <div className="stat-value">{selectedDeveloper.totalSales}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Plugins</h4>
                    <div className="stat-value">{selectedDeveloper.pluginCount}</div>
                  </div>
                  <div className="stat-card">
                    <h4>Average Rating</h4>
                    <div className="stat-value">⭐ {selectedDeveloper.averageRating.toFixed(1)}</div>
                  </div>
                </div>

                <div className="developer-plugins">
                  <h4>Developer's Plugins</h4>
                  <div className="plugins-list">
                    {plugins
                      .filter(p => p.developerId === selectedDeveloper.id)
                      .map(plugin => (
                        <div key={plugin.id} className="plugin-item">
                          <div className="plugin-name">{plugin.name}</div>
                          <div className="plugin-stats">
                            <span>Downloads: {plugin.downloads}</span>
                            <span>Revenue: {formatCurrency(plugin.totalRevenue)}</span>
                            <span>Rating: ⭐ {plugin.averageRating.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="recent-payouts">
                  <h4>Recent Payouts</h4>
                  <div className="payouts-list">
                    {payouts
                      .filter(p => p.developerId === selectedDeveloper.id)
                      .slice(0, 5)
                      .map(payout => (
                        <div key={payout.id} className="payout-item">
                          <div className="payout-date">{formatDate(payout.createdAt)}</div>
                          <div className="payout-amount">{formatCurrency(payout.amount, payout.currency)}</div>
                          <div className="payout-status" style={{ color: getStatusColor(payout.status) }}>
                            {payout.status}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedDeveloper(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="modal-overlay">
          <div className="modal plugin-details-modal">
            <div className="modal-header">
              <h2>{selectedPlugin.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedPlugin(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="plugin-overview">
                <div className="plugin-meta">
                  <div className="meta-item">
                    <span className="label">Version:</span>
                    <span className="value">{selectedPlugin.version}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Price:</span>
                    <span className="value">{formatCurrency(selectedPlugin.price)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Downloads:</span>
                    <span className="value">{selectedPlugin.downloads}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Revenue:</span>
                    <span className="value">{formatCurrency(selectedPlugin.totalRevenue)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Rating:</span>
                    <span className="value">⭐ {selectedPlugin.averageRating.toFixed(1)} ({selectedPlugin.reviewCount} reviews)</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Status:</span>
                    <span className="value" style={{ color: getStatusColor(selectedPlugin.status) }}>
                      {selectedPlugin.status}
                    </span>
                  </div>
                </div>

                <div className="plugin-description">
                  <h4>Description</h4>
                  <p>{selectedPlugin.description}</p>
                </div>

                <div className="plugin-features">
                  <h4>Features</h4>
                  <ul>
                    {selectedPlugin.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="plugin-tags">
                  <h4>Tags</h4>
                  <div className="tags-list">
                    {selectedPlugin.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedPlugin(null)}
              >
                Close
              </button>
              {selectedPlugin.status === 'approved' && (
                <button 
                  className="purchase-modal-btn"
                  onClick={() => {
                    purchasePlugin(selectedPlugin.id);
                    setSelectedPlugin(null);
                  }}
                >
                  💰 Purchase Plugin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PluginMarketplaceRevenue;