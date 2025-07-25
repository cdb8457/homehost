import React, { useState, useEffect, useCallback } from 'react';
import './RevenueDashboard.css';

/**
 * RevenueDashboard Component - Epic 4: Monetization & Analytics
 * 
 * Provides comprehensive revenue tracking and optimization interface for community administrators.
 * Enables financial sustainability through donations, VIP memberships, and marketplace earnings.
 */
const RevenueDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueStreams, setRevenueStreams] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [paymentProcessors, setPaymentProcessors] = useState([]);

  // Time range options
  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '365d', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  // Initialize component
  useEffect(() => {
    initializeRevenueDashboard();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const handlers = {
      'transaction-completed': handleTransactionCompleted,
      'subscription-created': handleSubscriptionCreated,
      'subscription-cancelled': handleSubscriptionCancelled,
      'revenue-stream-created': handleRevenueStreamCreated,
      'analytics-updated': handleAnalyticsUpdated,
      'daily-report-generated': handleDailyReport,
      'monthly-report-generated': handleMonthlyReport
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

  const initializeRevenueDashboard = async () => {
    try {
      setIsLoading(true);

      // Load dashboard summary
      const summary = await window.electronAPI.invoke('revenue-dashboard:get-summary');
      setDashboardData(summary);

      // Load revenue streams
      const streams = await window.electronAPI.invoke('revenue-dashboard:get-streams');
      setRevenueStreams(streams || []);

      // Load recent transactions
      const recentTx = await window.electronAPI.invoke('revenue-dashboard:get-transactions', { limit: 50 });
      setTransactions(recentTx || []);

      // Load subscriptions
      const subs = await window.electronAPI.invoke('revenue-dashboard:get-subscriptions');
      setSubscriptions(subs || []);

      // Load payment processors
      const processors = await window.electronAPI.invoke('revenue-dashboard:get-processors');
      setPaymentProcessors(processors || []);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize revenue dashboard:', error);
      setIsLoading(false);
    }
  };

  const handleTransactionCompleted = useCallback((data) => {
    setTransactions(prev => [data.transaction, ...prev.slice(0, 49)]);
    // Update dashboard summary
    initializeRevenueDashboard();
  }, []);

  const handleSubscriptionCreated = useCallback((data) => {
    setSubscriptions(prev => [data.subscription, ...prev]);
    initializeRevenueDashboard();
  }, []);

  const handleSubscriptionCancelled = useCallback((data) => {
    setSubscriptions(prev => 
      prev.map(sub => sub.id === data.subscriptionId ? data.subscription : sub)
    );
  }, []);

  const handleRevenueStreamCreated = useCallback((data) => {
    setRevenueStreams(prev => [...prev, data.stream]);
  }, []);

  const handleAnalyticsUpdated = useCallback((data) => {
    setAnalytics(data.analytics);
  }, []);

  const handleDailyReport = useCallback((report) => {
    console.log('Daily revenue report:', report);
    // Could show notification or update UI
  }, []);

  const handleMonthlyReport = useCallback((report) => {
    console.log('Monthly revenue report:', report);
    // Could show notification or update UI
  }, []);

  // Revenue stream actions
  const createRevenueStream = async (streamData) => {
    try {
      const stream = await window.electronAPI.invoke('revenue-dashboard:create-stream', streamData);
      console.log('Created revenue stream:', stream);
    } catch (error) {
      console.error('Failed to create revenue stream:', error);
      alert('Failed to create revenue stream: ' + error.message);
    }
  };

  const processTestTransaction = async (streamId, amount) => {
    try {
      const transaction = await window.electronAPI.invoke('revenue-dashboard:process-transaction', {
        streamId,
        amount: parseFloat(amount),
        currency: 'USD',
        category: 'donations',
        paymentProcessor: 'stripe',
        metadata: {
          customerId: 'test-customer-' + Date.now(),
          source: 'dashboard-test'
        }
      });
      
      console.log('Processed test transaction:', transaction);
    } catch (error) {
      console.error('Failed to process transaction:', error);
      alert('Failed to process transaction: ' + error.message);
    }
  };

  const createTestSubscription = async () => {
    try {
      const subscription = await window.electronAPI.invoke('revenue-dashboard:create-subscription', {
        customerId: 'test-customer-' + Date.now(),
        planId: 'vip-monthly',
        amount: 10,
        currency: 'USD',
        interval: 'monthly',
        metadata: {
          source: 'dashboard-test'
        }
      });
      
      console.log('Created test subscription:', subscription);
    } catch (error) {
      console.error('Failed to create subscription:', error);
      alert('Failed to create subscription: ' + error.message);
    }
  };

  // Utility functions
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getSubscriptionStatusColor = (status) => {
    switch (status) {
      case 'active': return '#34a853';
      case 'cancelled': return '#ea4335';
      case 'expired': return '#fbbc05';
      default: return '#9aa0a6';
    }
  };

  if (isLoading) {
    return (
      <div className="revenue-loading">
        <div className="loading-spinner"></div>
        <p>Loading Revenue Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="revenue-dashboard">
      {/* Header */}
      <div className="revenue-header">
        <div className="header-title">
          <h1>💰 Revenue Dashboard</h1>
          <p>Track and optimize your community's financial performance</p>
        </div>
        <div className="header-controls">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-select"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      {dashboardData && (
        <div className="revenue-summary">
          <div className="summary-card total-revenue">
            <div className="card-icon">💵</div>
            <div className="card-content">
              <h3>Total Revenue</h3>
              <div className="card-value">{formatCurrency(dashboardData.totalRevenue)}</div>
              <div className="card-change">
                {dashboardData.growthRate !== undefined && (
                  <span className={`change ${dashboardData.growthRate >= 0 ? 'positive' : 'negative'}`}>
                    {dashboardData.growthRate >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(dashboardData.growthRate))}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="summary-card monthly-revenue">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <h3>This Month</h3>
              <div className="card-value">{formatCurrency(dashboardData.monthlyRevenue)}</div>
              <div className="card-subtitle">
                {dashboardData.transactionCount} transactions
              </div>
            </div>
          </div>

          <div className="summary-card avg-transaction">
            <div className="card-icon">💳</div>
            <div className="card-content">
              <h3>Avg Transaction</h3>
              <div className="card-value">{formatCurrency(dashboardData.averageTransactionValue)}</div>
              <div className="card-subtitle">Per transaction</div>
            </div>
          </div>

          <div className="summary-card subscriptions">
            <div className="card-icon">🔄</div>
            <div className="card-content">
              <h3>Active Subscriptions</h3>
              <div className="card-value">{dashboardData.activeSubscriptions}</div>
              <div className="card-subtitle">Recurring revenue</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="revenue-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'streams' ? 'active' : ''}`}
          onClick={() => setActiveTab('streams')}
        >
          💰 Revenue Streams
        </button>
        <button 
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          📋 Transactions
        </button>
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          🔄 Subscriptions
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </div>

      <div className="revenue-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Revenue by Category Chart */}
            <div className="chart-section">
              <h3>Revenue by Category</h3>
              <div className="category-breakdown">
                {dashboardData?.revenueByCategory && Object.entries(dashboardData.revenueByCategory).map(([category, amount]) => (
                  <div key={category} className="category-item">
                    <div className="category-info">
                      <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      <span className="category-amount">{formatCurrency(amount)}</span>
                    </div>
                    <div className="category-bar">
                      <div 
                        className="category-fill"
                        style={{ 
                          width: `${(amount / dashboardData.totalRevenue) * 100}%`,
                          backgroundColor: getCategoryColor(category)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Revenue Streams */}
            <div className="top-streams-section">
              <h3>Top Revenue Streams</h3>
              <div className="streams-list">
                {dashboardData?.topRevenueStreams?.map(stream => (
                  <div key={stream.id} className="stream-item">
                    <div className="stream-icon">{getCategoryIcon(stream.category)}</div>
                    <div className="stream-info">
                      <div className="stream-name">{stream.name}</div>
                      <div className="stream-stats">
                        {formatCurrency(stream.totalRevenue)} • {stream.transactionCount} transactions
                      </div>
                    </div>
                    <div className="stream-trend">
                      <span className="trend-value">{formatCurrency(stream.monthlyRevenue)}</span>
                      <span className="trend-label">this month</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Processors Status */}
            <div className="processors-section">
              <h3>Payment Processors</h3>
              <div className="processors-grid">
                {paymentProcessors.map(processor => (
                  <div key={processor.name} className={`processor-card ${processor.enabled ? 'enabled' : 'disabled'}`}>
                    <div className="processor-icon">{getProcessorIcon(processor.name)}</div>
                    <div className="processor-info">
                      <div className="processor-name">{processor.name}</div>
                      <div className="processor-fee">{formatPercentage(processor.fee * 100)} + ${processor.fixedFee}</div>
                    </div>
                    <div className="processor-status">
                      {processor.enabled ? (
                        <span className="status-enabled">✅ Active</span>
                      ) : (
                        <span className="status-disabled">⚫ Disabled</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button 
                  className="action-btn"
                  onClick={() => createRevenueStream({
                    name: 'Test Donation Stream',
                    category: 'donations',
                    configuration: { minAmount: 5, maxAmount: 500 }
                  })}
                >
                  ➕ Add Revenue Stream
                </button>
                <button 
                  className="action-btn"
                  onClick={() => processTestTransaction(revenueStreams[0]?.id, '25.00')}
                  disabled={revenueStreams.length === 0}
                >
                  💳 Test Transaction
                </button>
                <button 
                  className="action-btn"
                  onClick={createTestSubscription}
                >
                  🔄 Test Subscription
                </button>
                <button 
                  className="action-btn"
                  onClick={() => window.electronAPI.invoke('revenue-dashboard:generate-report', 'monthly')}
                >
                  📊 Generate Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Streams Tab */}
        {activeTab === 'streams' && (
          <div className="streams-tab">
            <div className="tab-header">
              <h3>Revenue Streams</h3>
              <button 
                className="add-stream-btn"
                onClick={() => createRevenueStream({
                  name: 'New Revenue Stream',
                  category: 'donations',
                  configuration: {}
                })}
              >
                ➕ Add Stream
              </button>
            </div>

            <div className="streams-grid">
              {revenueStreams.map(stream => (
                <div key={stream.id} className="stream-card">
                  <div className="stream-header">
                    <div className="stream-icon">{getCategoryIcon(stream.category)}</div>
                    <div className="stream-title">
                      <h4>{stream.name}</h4>
                      <span className="stream-category">{stream.category}</span>
                    </div>
                    <div className="stream-status">
                      <span className={`status ${stream.status}`}>{stream.status}</span>
                    </div>
                  </div>

                  <div className="stream-stats">
                    <div className="stat">
                      <div className="stat-value">{formatCurrency(stream.totalRevenue)}</div>
                      <div className="stat-label">Total Revenue</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{formatCurrency(stream.monthlyRevenue)}</div>
                      <div className="stat-label">This Month</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{stream.transactionCount}</div>
                      <div className="stat-label">Transactions</div>
                    </div>
                  </div>

                  <div className="stream-actions">
                    <button 
                      className="action-btn small"
                      onClick={() => processTestTransaction(stream.id, '10.00')}
                    >
                      💳 Test Payment
                    </button>
                    <button className="action-btn small">
                      ⚙️ Configure
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <div className="tab-header">
              <h3>Recent Transactions</h3>
              <div className="transaction-filters">
                <select className="filter-select">
                  <option value="all">All Categories</option>
                  <option value="donations">Donations</option>
                  <option value="vip">VIP Memberships</option>
                  <option value="plugins">Plugin Sales</option>
                </select>
                <select className="filter-select">
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="transactions-table">
              <div className="table-header">
                <div className="col-date">Date</div>
                <div className="col-amount">Amount</div>
                <div className="col-category">Category</div>
                <div className="col-processor">Processor</div>
                <div className="col-status">Status</div>
                <div className="col-net">Net Amount</div>
              </div>

              <div className="table-body">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="transaction-row">
                    <div className="col-date">
                      {formatDate(transaction.createdAt)}
                    </div>
                    <div className="col-amount">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </div>
                    <div className="col-category">
                      <span className="category-badge">{transaction.category}</span>
                    </div>
                    <div className="col-processor">
                      {transaction.paymentProcessor}
                    </div>
                    <div className="col-status">
                      <span className={`status-badge ${transaction.status}`}>
                        {getTransactionStatusIcon(transaction.status)} {transaction.status}
                      </span>
                    </div>
                    <div className="col-net">
                      {formatCurrency(transaction.netAmount, transaction.currency)}
                      <div className="fees">
                        -{formatCurrency(transaction.fees, transaction.currency)} fees
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="subscriptions-tab">
            <div className="tab-header">
              <h3>Subscription Management</h3>
              <button 
                className="add-subscription-btn"
                onClick={createTestSubscription}
              >
                ➕ Create Test Subscription
              </button>
            </div>

            <div className="subscriptions-grid">
              {subscriptions.map(subscription => (
                <div key={subscription.id} className="subscription-card">
                  <div className="subscription-header">
                    <div className="subscription-info">
                      <h4>Customer: {subscription.customerId}</h4>
                      <span className="plan-id">{subscription.planId}</span>
                    </div>
                    <div 
                      className="subscription-status"
                      style={{ color: getSubscriptionStatusColor(subscription.status) }}
                    >
                      {subscription.status}
                    </div>
                  </div>

                  <div className="subscription-details">
                    <div className="detail">
                      <span className="label">Amount:</span>
                      <span className="value">{formatCurrency(subscription.amount)} / {subscription.interval}</span>
                    </div>
                    <div className="detail">
                      <span className="label">Current Period:</span>
                      <span className="value">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </span>
                    </div>
                    <div className="detail">
                      <span className="label">Created:</span>
                      <span className="value">{formatDate(subscription.createdAt)}</span>
                    </div>
                  </div>

                  <div className="subscription-actions">
                    {subscription.status === 'active' && (
                      <button 
                        className="cancel-subscription-btn"
                        onClick={() => window.electronAPI.invoke('revenue-dashboard:cancel-subscription', {
                          subscriptionId: subscription.id,
                          reason: 'admin_cancelled'
                        })}
                      >
                        🛑 Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Revenue Trends</h4>
                <div className="trend-chart">
                  <p>Revenue growth visualization would go here</p>
                  <div className="mock-chart">📈 Revenue trending upward</div>
                </div>
              </div>

              <div className="analytics-card">
                <h4>Conversion Funnel</h4>
                <div className="funnel-stats">
                  <div className="funnel-step">
                    <span className="step-label">Visitors</span>
                    <span className="step-value">1,000</span>
                  </div>
                  <div className="funnel-step">
                    <span className="step-label">Community Members</span>
                    <span className="step-value">500 (50%)</span>
                  </div>
                  <div className="funnel-step">
                    <span className="step-label">Donors</span>
                    <span className="step-value">50 (10%)</span>
                  </div>
                  <div className="funnel-step">
                    <span className="step-label">VIP Members</span>
                    <span className="step-value">25 (50%)</span>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h4>Customer Lifetime Value</h4>
                <div className="clv-stats">
                  <div className="clv-metric">
                    <span className="metric-value">{formatCurrency(240)}</span>
                    <span className="metric-label">Average CLV</span>
                  </div>
                  <div className="clv-breakdown">
                    <div>Average monthly: {formatCurrency(10)}</div>
                    <div>Average lifetime: 24 months</div>
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h4>Churn Analysis</h4>
                <div className="churn-stats">
                  <div className="churn-rate">
                    <span className="rate-value">5.2%</span>
                    <span className="rate-label">Monthly Churn Rate</span>
                  </div>
                  <div className="churn-reasons">
                    <div className="reason">
                      <span>User Requested:</span>
                      <span>60%</span>
                    </div>
                    <div className="reason">
                      <span>Payment Failed:</span>
                      <span>25%</span>
                    </div>
                    <div className="reason">
                      <span>Inactivity:</span>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="settings-section">
              <h3>Payment Processor Configuration</h3>
              <div className="processor-settings">
                {Object.entries({
                  stripe: { name: 'Stripe', icon: '💳' },
                  paypal: { name: 'PayPal', icon: '🅿️' },
                  crypto: { name: 'Crypto Wallets', icon: '₿' }
                }).map(([key, processor]) => (
                  <div key={key} className="processor-setting">
                    <div className="processor-info">
                      <span className="processor-icon">{processor.icon}</span>
                      <span className="processor-name">{processor.name}</span>
                    </div>
                    <div className="processor-controls">
                      <button className="config-btn">Configure</button>
                      <button className="test-btn">Test</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h3>Revenue Goals</h3>
              <div className="goals-settings">
                <div className="goal-setting">
                  <label>Monthly Revenue Goal</label>
                  <input type="number" defaultValue="1000" className="goal-input" />
                </div>
                <div className="goal-setting">
                  <label>Annual Revenue Goal</label>
                  <input type="number" defaultValue="12000" className="goal-input" />
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h3>Tax & Reporting</h3>
              <div className="tax-settings">
                <div className="tax-setting">
                  <label>Business Country</label>
                  <select className="tax-select">
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="DE">Germany</option>
                  </select>
                </div>
                <div className="tax-setting">
                  <label>Tax ID</label>
                  <input type="text" placeholder="Enter tax ID" className="tax-input" />
                </div>
                <button className="generate-report-btn">
                  📊 Generate Tax Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Helper functions
  function getCategoryColor(category) {
    const colors = {
      donations: '#34a853',
      vip: '#fbbc05',
      plugins: '#0066ff',
      merchandise: '#ea4335',
      events: '#9c27b0',
      tips: '#ff5722'
    };
    return colors[category] || '#9aa0a6';
  }

  function getCategoryIcon(category) {
    const icons = {
      donations: '💝',
      vip: '👑',
      plugins: '🔌',
      merchandise: '👕',
      events: '🎫',
      tips: '💡'
    };
    return icons[category] || '💰';
  }

  function getProcessorIcon(processor) {
    const icons = {
      stripe: '💳',
      paypal: '🅿️',
      crypto: '₿'
    };
    return icons[processor] || '💰';
  }
};

export default RevenueDashboard;