import React, { useState, useEffect, useRef } from 'react';
import './HealthMonitor.css';

/**
 * HealthMonitor Component - Comprehensive health monitoring dashboard
 * 
 * Provides real-time system health monitoring, service status tracking,
 * health alerts, and historical health analytics for production systems.
 */
const HealthMonitor = ({ isVisible = true, onClose }) => {
  const [healthConfig, setHealthConfig] = useState(null);
  const [currentHealth, setCurrentHealth] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [healthSummary, setHealthSummary] = useState(null);
  const [serviceStatuses, setServiceStatuses] = useState({});
  const [healthAlerts, setHealthAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [healthChecksInProgress, setHealthChecksInProgress] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      loadHealthData();
      startRealTimeUpdates();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, selectedTimeRange]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);

      // Load health configuration
      const config = await window.electronAPI.invoke('health:get-configuration');
      setHealthConfig(config);

      // Load current health status
      const health = await window.electronAPI.invoke('health:get-current-health');
      setCurrentHealth(health);

      // Load health history based on time range
      const timeWindow = getTimeWindowMs(selectedTimeRange);
      const history = await window.electronAPI.invoke('health:get-health-history', { 
        limit: 100, 
        timeWindow 
      });
      setHealthHistory(history);

      // Load health summary
      const summary = await window.electronAPI.invoke('health:get-health-summary', { timeWindow });
      setHealthSummary(summary);

      // Load service statuses
      const services = await window.electronAPI.invoke('health:get-service-statuses');
      setServiceStatuses(services);

      // Load health alerts
      const alerts = await window.electronAPI.invoke('health:get-health-alerts', { timeWindow });
      setHealthAlerts(alerts);

    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(async () => {
      try {
        // Update current health
        const health = await window.electronAPI.invoke('health:get-current-health');
        setCurrentHealth(health);

        // Update service statuses
        const services = await window.electronAPI.invoke('health:get-service-statuses');
        setServiceStatuses(services);

        // Update recent health history (last few entries)
        const recentHistory = await window.electronAPI.invoke('health:get-health-history', { 
          limit: 10 
        });
        setHealthHistory(prev => {
          const combined = [...recentHistory, ...prev];
          const unique = combined.filter((item, index, self) => 
            index === self.findIndex(h => h.timestamp === item.timestamp)
          );
          return unique.slice(0, 100); // Keep last 100 entries
        });

      } catch (error) {
        console.error('Failed to update health data:', error);
      }
    }, 10000); // Update every 10 seconds
  };

  const getTimeWindowMs = (range) => {
    switch (range) {
      case '5m': return 5 * 60 * 1000;
      case '15m': return 15 * 60 * 1000;
      case '1h': return 60 * 60 * 1000;
      case '6h': return 6 * 60 * 60 * 1000;
      case '24h': return 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000;
    }
  };

  const performHealthCheck = async () => {
    try {
      setHealthChecksInProgress(true);
      await window.electronAPI.invoke('health:perform-health-check');
      
      // Refresh data after health check
      await loadHealthData();
      
    } catch (error) {
      console.error('Failed to perform health check:', error);
    } finally {
      setHealthChecksInProgress(false);
    }
  };

  const exportHealthData = async () => {
    try {
      const exportData = await window.electronAPI.invoke('health:export-data', {
        timeWindow: getTimeWindowMs(selectedTimeRange)
      });
      
      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export health data:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatBytes = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)}${units[unitIndex]}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
      case 'running':
      case 'active':
        return '#22c55e';
      case 'warning':
      case 'degraded':
        return '#f59e0b';
      case 'unhealthy':
      case 'failed':
      case 'stopped':
        return '#ef4444';
      case 'unknown':
      case 'checking':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getHealthPercentage = (status) => {
    switch (status) {
      case 'healthy': return 100;
      case 'warning': return 70;
      case 'unhealthy': return 30;
      default: return 0;
    }
  };

  const renderOverviewTab = () => (
    <div className="health-overview">
      <div className="time-range-selector">
        <label>Time Range:</label>
        <select 
          value={selectedTimeRange} 
          onChange={(e) => setSelectedTimeRange(e.target.value)}
        >
          <option value="5m">Last 5 minutes</option>
          <option value="15m">Last 15 minutes</option>
          <option value="1h">Last hour</option>
          <option value="6h">Last 6 hours</option>
          <option value="24h">Last 24 hours</option>
        </select>
        <button 
          className="health-check-button"
          onClick={performHealthCheck}
          disabled={healthChecksInProgress}
        >
          {healthChecksInProgress ? 'Checking...' : 'Run Health Check'}
        </button>
      </div>

      <div className="health-cards-grid">
        <div className="health-card overall">
          <div className="health-card-header">
            <h3>Overall Health</h3>
            <div 
              className={`health-status ${currentHealth?.overall || 'unknown'}`}
              style={{ color: getStatusColor(currentHealth?.overall) }}
            >
              {currentHealth?.overall?.toUpperCase() || 'UNKNOWN'}
            </div>
          </div>
          <div className="health-card-content">
            <div className="health-percentage">
              <div className="percentage-circle">
                <svg viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="var(--border-color)" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke={getStatusColor(currentHealth?.overall)}
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * getHealthPercentage(currentHealth?.overall)) / 100}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="percentage-text">
                  {getHealthPercentage(currentHealth?.overall)}%
                </span>
              </div>
            </div>
            <div className="health-info">
              <div className="info-item">
                <span className="info-label">Uptime:</span>
                <span className="info-value">
                  {currentHealth?.uptime ? formatDuration(currentHealth.uptime) : 'N/A'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Last Check:</span>
                <span className="info-value">
                  {currentHealth?.lastCheck ? formatTimestamp(currentHealth.lastCheck) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="health-card system">
          <div className="health-card-header">
            <h3>System Resources</h3>
          </div>
          <div className="health-card-content">
            {currentHealth?.checks?.system && (
              <div className="resource-metrics">
                <div className="metric-item">
                  <span className="metric-label">CPU Usage</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${currentHealth.checks.system.cpu?.usage || 0}%`,
                        backgroundColor: getStatusColor(currentHealth.checks.system.cpu?.status)
                      }}
                    ></div>
                  </div>
                  <span className="metric-value">
                    {(currentHealth.checks.system.cpu?.usage || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Memory Usage</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${currentHealth.checks.system.memory?.usage || 0}%`,
                        backgroundColor: getStatusColor(currentHealth.checks.system.memory?.status)
                      }}
                    ></div>
                  </div>
                  <span className="metric-value">
                    {(currentHealth.checks.system.memory?.usage || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="metric-item">
                  <span className="metric-label">Disk Usage</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ 
                        width: `${currentHealth.checks.system.disk?.usage || 0}%`,
                        backgroundColor: getStatusColor(currentHealth.checks.system.disk?.status)
                      }}
                    ></div>
                  </div>
                  <span className="metric-value">
                    {(currentHealth.checks.system.disk?.usage || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="health-card services">
          <div className="health-card-header">
            <h3>Services Status</h3>
          </div>
          <div className="health-card-content">
            <div className="services-list">
              {Object.entries(serviceStatuses).map(([serviceName, status]) => (
                <div key={serviceName} className="service-item">
                  <div 
                    className="service-indicator"
                    style={{ backgroundColor: getStatusColor(status.status) }}
                  ></div>
                  <div className="service-info">
                    <span className="service-name">{serviceName}</span>
                    <span 
                      className="service-status"
                      style={{ color: getStatusColor(status.status) }}
                    >
                      {status.status?.toUpperCase()}
                    </span>
                  </div>
                  {status.lastCheck && (
                    <span className="service-time">
                      {formatTimestamp(status.lastCheck)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="health-card statistics">
          <div className="health-card-header">
            <h3>Health Statistics</h3>
          </div>
          <div className="health-card-content">
            {healthSummary && (
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{healthSummary.totalChecks}</span>
                  <span className="stat-label">Total Checks</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value healthy">{healthSummary.healthyChecks}</span>
                  <span className="stat-label">Healthy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value warning">{healthSummary.warningChecks}</span>
                  <span className="stat-label">Warnings</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value unhealthy">{healthSummary.unhealthyChecks}</span>
                  <span className="stat-label">Unhealthy</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{healthSummary.averageResponseTime?.toFixed(0)}ms</span>
                  <span className="stat-label">Avg Response</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{(healthSummary.uptime || 0).toFixed(1)}%</span>
                  <span className="stat-label">Uptime</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {healthAlerts.length > 0 && (
        <div className="health-alerts-section">
          <h3>Health Alerts</h3>
          <div className="alerts-list">
            {healthAlerts.slice(0, 5).map((alert, index) => (
              <div key={index} className={`alert-item ${alert.severity}`}>
                <div className="alert-header">
                  <span className="alert-title">{alert.title || alert.service}</span>
                  <span className={`alert-severity ${alert.severity}`}>
                    {alert.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{formatTimestamp(alert.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="health-history">
      <div className="history-controls">
        <button 
          className="export-button"
          onClick={exportHealthData}
        >
          Export Data
        </button>
      </div>

      <div className="history-chart">
        <h3>Health Trend</h3>
        <div className="chart-container">
          {healthHistory.length > 0 ? (
            <div className="simple-chart">
              {healthHistory.slice(-50).map((entry, index) => (
                <div 
                  key={index}
                  className="chart-bar"
                  style={{ 
                    height: `${getHealthPercentage(entry.overall)}%`,
                    backgroundColor: getStatusColor(entry.overall)
                  }}
                  title={`${entry.overall} - ${formatTimestamp(entry.timestamp)}`}
                ></div>
              ))}
            </div>
          ) : (
            <div className="no-data">No health history data available</div>
          )}
        </div>
      </div>

      <div className="history-list">
        <h3>Health Check History</h3>
        <div className="history-entries">
          {healthHistory.map((entry, index) => (
            <div key={index} className={`history-item ${entry.overall}`}>
              <div className="history-header">
                <div className="history-time">{formatTimestamp(entry.timestamp)}</div>
                <div 
                  className={`history-status ${entry.overall}`}
                  style={{ color: getStatusColor(entry.overall) }}
                >
                  {entry.overall?.toUpperCase()}
                </div>
              </div>
              <div className="history-details">
                <div className="detail-item">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{entry.duration}ms</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Checks:</span>
                  <span className="detail-value">
                    {Object.keys(entry.checks || {}).length} services
                  </span>
                </div>
              </div>
              {entry.checks && Object.entries(entry.checks).map(([checkName, result]) => (
                <div key={checkName} className="check-result">
                  <span className="check-name">{checkName}</span>
                  <span 
                    className="check-status"
                    style={{ color: getStatusColor(result.status) }}
                  >
                    {result.status?.toUpperCase()}
                  </span>
                  {result.responseTime && (
                    <span className="check-time">{result.responseTime}ms</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConfigTab = () => (
    <div className="health-config">
      <div className="config-section">
        <h3>Health Check Configuration</h3>
        {healthConfig && (
          <div className="config-grid">
            <div className="config-group">
              <h4>General Settings</h4>
              <div className="config-item">
                <span className="config-label">Enabled:</span>
                <span className="config-value">{healthConfig.enabled ? 'Yes' : 'No'}</span>
              </div>
              <div className="config-item">
                <span className="config-label">Check Interval:</span>
                <span className="config-value">{healthConfig.interval / 1000}s</span>
              </div>
              <div className="config-item">
                <span className="config-label">Timeout:</span>
                <span className="config-value">{healthConfig.timeout / 1000}s</span>
              </div>
            </div>

            <div className="config-group">
              <h4>Thresholds</h4>
              {healthConfig.thresholds && Object.entries(healthConfig.thresholds).map(([key, threshold]) => (
                <div key={key} className="threshold-item">
                  <span className="threshold-name">{key.toUpperCase()}</span>
                  <div className="threshold-values">
                    <span className="threshold-warning">Warning: {threshold.warning}%</span>
                    <span className="threshold-critical">Critical: {threshold.critical}%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="config-group">
              <h4>Enabled Checks</h4>
              {healthConfig.checks && Object.entries(healthConfig.checks).map(([checkName, enabled]) => (
                <div key={checkName} className="check-config-item">
                  <span className="check-config-name">{checkName}</span>
                  <span className={`check-config-status ${enabled ? 'enabled' : 'disabled'}`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              ))}
            </div>

            <div className="config-group">
              <h4>Alert Settings</h4>
              {healthConfig.alerts && (
                <>
                  <div className="config-item">
                    <span className="config-label">Alerts Enabled:</span>
                    <span className="config-value">{healthConfig.alerts.enabled ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="config-item">
                    <span className="config-label">Email Notifications:</span>
                    <span className="config-value">{healthConfig.alerts.email ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="config-item">
                    <span className="config-label">Webhook Notifications:</span>
                    <span className="config-value">{healthConfig.alerts.webhook ? 'Yes' : 'No'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="health-monitor">
      <div className="health-monitor-header">
        <h2>Health Monitor</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="health-monitor-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`tab-button ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
      </div>

      <div className="health-monitor-content">
        {isLoading ? (
          <div className="loading">Loading health data...</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'history' && renderHistoryTab()}
            {activeTab === 'config' && renderConfigTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default HealthMonitor;