import React, { useState, useEffect, useRef } from 'react';
import './PerformanceDashboard.css';

/**
 * PerformanceDashboard Component - Comprehensive performance monitoring and optimization
 * 
 * Provides real-time performance metrics, system monitoring, optimization recommendations,
 * and historical performance analysis for production deployment.
 */
const PerformanceDashboard = ({ isVisible = true, onClose }) => {
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [processMetrics, setProcessMetrics] = useState(null);
  const [memoryMetrics, setMemoryMetrics] = useState(null);
  const [eventLoopMetrics, setEventLoopMetrics] = useState(null);
  const [performanceAlerts, setPerformanceAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [appliedOptimizations, setAppliedOptimizations] = useState([]);
  const [performanceConfig, setPerformanceConfig] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState({
    cpu: [],
    memory: [],
    eventLoop: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const intervalRef = useRef(null);
  const chartRefs = useRef({});

  useEffect(() => {
    if (isVisible) {
      loadPerformanceData();
      startRealTimeUpdates();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible, selectedTimeRange]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);

      const timeWindow = getTimeWindowMs(selectedTimeRange);

      // Load performance summary
      const summary = await window.electronAPI.invoke('performance:get-summary', { timeWindow });
      setPerformanceSummary(summary);

      // Load latest metrics
      const [system, process, memory, eventLoop] = await Promise.all([
        window.electronAPI.invoke('performance:get-latest-metrics', { type: 'system' }),
        window.electronAPI.invoke('performance:get-latest-metrics', { type: 'process' }),
        window.electronAPI.invoke('performance:get-latest-metrics', { type: 'memory' }),
        window.electronAPI.invoke('performance:get-latest-metrics', { type: 'eventLoop' })
      ]);

      setSystemMetrics(system);
      setProcessMetrics(process);
      setMemoryMetrics(memory);
      setEventLoopMetrics(eventLoop);

      // Load recent metrics for charts
      const [cpuHistory, memoryHistory, eventLoopHistory] = await Promise.all([
        window.electronAPI.invoke('performance:get-recent-metrics', { type: 'system', timeWindow }),
        window.electronAPI.invoke('performance:get-recent-metrics', { type: 'memory', timeWindow }),
        window.electronAPI.invoke('performance:get-recent-metrics', { type: 'eventLoop', timeWindow })
      ]);

      setMetricsHistory({
        cpu: cpuHistory.map(m => ({ time: m.timestamp, value: m.cpu?.usage || 0 })),
        memory: memoryHistory.map(m => ({ time: m.timestamp, value: m.heap?.usage || 0 })),
        eventLoop: eventLoopHistory.map(m => ({ time: m.timestamp, value: m.lag || 0 }))
      });

      // Load alerts and recommendations
      const [alerts, recs] = await Promise.all([
        window.electronAPI.invoke('performance:get-alerts', { timeWindow }),
        window.electronAPI.invoke('performance:get-recommendations')
      ]);

      setPerformanceAlerts(alerts);
      setRecommendations(recs);

      // Load configuration
      const config = await window.electronAPI.invoke('performance:get-configuration');
      setPerformanceConfig(config);

    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRealTimeUpdates = () => {
    intervalRef.current = setInterval(async () => {
      try {
        // Update latest metrics
        const [system, process, memory, eventLoop] = await Promise.all([
          window.electronAPI.invoke('performance:get-latest-metrics', { type: 'system' }),
          window.electronAPI.invoke('performance:get-latest-metrics', { type: 'process' }),
          window.electronAPI.invoke('performance:get-latest-metrics', { type: 'memory' }),
          window.electronAPI.invoke('performance:get-latest-metrics', { type: 'eventLoop' })
        ]);

        setSystemMetrics(system);
        setProcessMetrics(process);
        setMemoryMetrics(memory);
        setEventLoopMetrics(eventLoop);

        // Update metrics history
        const now = Date.now();
        setMetricsHistory(prev => ({
          cpu: [...prev.cpu.slice(-50), { time: now, value: system?.cpu?.usage || 0 }],
          memory: [...prev.memory.slice(-50), { time: now, value: memory?.heap?.usage || 0 }],
          eventLoop: [...prev.eventLoop.slice(-50), { time: now, value: eventLoop?.lag || 0 }]
        }));

        // Update alerts
        const alerts = await window.electronAPI.invoke('performance:get-alerts', { 
          timeWindow: getTimeWindowMs(selectedTimeRange) 
        });
        setPerformanceAlerts(alerts);

      } catch (error) {
        console.error('Failed to update performance data:', error);
      }
    }, 5000); // Update every 5 seconds
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

  const applyOptimization = async (recommendationId) => {
    try {
      await window.electronAPI.invoke('performance:apply-optimization', { 
        recommendationId,
        options: {} 
      });
      
      // Refresh recommendations
      const recs = await window.electronAPI.invoke('performance:get-recommendations');
      setRecommendations(recs);
      
      // Update applied optimizations list
      const applied = recs.filter(r => r.applied);
      setAppliedOptimizations(applied);
      
    } catch (error) {
      console.error('Failed to apply optimization:', error);
    }
  };

  const establishBaseline = async () => {
    try {
      await window.electronAPI.invoke('performance:establish-baseline');
      console.log('Performance baseline established');
    } catch (error) {
      console.error('Failed to establish baseline:', error);
    }
  };

  const exportPerformanceData = async () => {
    try {
      const exportData = await window.electronAPI.invoke('performance:export-data', {
        timeWindow: getTimeWindowMs(selectedTimeRange)
      });
      
      // Create download link
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `performance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export performance data:', error);
    }
  };

  const formatMetricValue = (value, unit = '') => {
    if (typeof value !== 'number') return 'N/A';
    
    switch (unit) {
      case 'bytes':
        return formatBytes(value);
      case 'ms':
        return `${value.toFixed(1)}ms`;
      case '%':
        return `${value.toFixed(1)}%`;
      default:
        return value.toFixed(1) + unit;
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

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStatusColor = (value, thresholds) => {
    if (!thresholds) return '#22c55e';
    if (value >= thresholds.critical) return '#ef4444';
    if (value >= thresholds.warning) return '#f59e0b';
    return '#22c55e';
  };

  const renderMiniChart = (data, color = '#3b82f6') => {
    if (!data || data.length === 0) return null;

    const width = 120;
    const height = 40;
    const padding = 4;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.value - minValue) / range) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="mini-chart">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>
    );
  };

  const renderOverviewTab = () => (
    <div className="performance-overview">
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
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <h3>CPU Usage</h3>
            <div className="metric-chart">
              {renderMiniChart(metricsHistory.cpu, getStatusColor(
                systemMetrics?.cpu?.usage || 0, 
                performanceConfig?.thresholds?.cpu
              ))}
            </div>
          </div>
          <div className="metric-value">
            <span 
              className="value"
              style={{ 
                color: getStatusColor(
                  systemMetrics?.cpu?.usage || 0, 
                  performanceConfig?.thresholds?.cpu
                ) 
              }}
            >
              {formatMetricValue(systemMetrics?.cpu?.usage, '%')}
            </span>
            <span className="metric-label">Current Usage</span>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Cores: {systemMetrics?.cpu?.cores}</span>
            </div>
            <div className="detail-item">
              <span>Load Avg: {systemMetrics?.cpu?.loadAverage?.[0]?.toFixed(2) || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Memory Usage</h3>
            <div className="metric-chart">
              {renderMiniChart(metricsHistory.memory, getStatusColor(
                memoryMetrics?.heap?.usage || 0, 
                performanceConfig?.thresholds?.memory
              ))}
            </div>
          </div>
          <div className="metric-value">
            <span 
              className="value"
              style={{ 
                color: getStatusColor(
                  memoryMetrics?.heap?.usage || 0, 
                  performanceConfig?.thresholds?.memory
                ) 
              }}
            >
              {formatMetricValue(memoryMetrics?.heap?.usage, '%')}
            </span>
            <span className="metric-label">Heap Usage</span>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Used: {formatBytes(memoryMetrics?.heap?.used || 0)}</span>
            </div>
            <div className="detail-item">
              <span>Total: {formatBytes(memoryMetrics?.heap?.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>Event Loop</h3>
            <div className="metric-chart">
              {renderMiniChart(metricsHistory.eventLoop, getStatusColor(
                eventLoopMetrics?.lag || 0, 
                performanceConfig?.thresholds?.eventLoop
              ))}
            </div>
          </div>
          <div className="metric-value">
            <span 
              className="value"
              style={{ 
                color: getStatusColor(
                  eventLoopMetrics?.lag || 0, 
                  performanceConfig?.thresholds?.eventLoop
                ) 
              }}
            >
              {formatMetricValue(eventLoopMetrics?.lag, 'ms')}
            </span>
            <span className="metric-label">Current Lag</span>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Utilization: {formatMetricValue(eventLoopMetrics?.utilization, '%')}</span>
            </div>
            <div className="detail-item">
              <span>Status: {(eventLoopMetrics?.lag || 0) < 50 ? 'Healthy' : 'Degraded'}</span>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <h3>System Info</h3>
            <div className="system-status">
              <div className={`status-indicator ${performanceAlerts.filter(a => a.severity === 'critical').length === 0 ? 'healthy' : 'warning'}`}>
                {performanceAlerts.filter(a => a.severity === 'critical').length === 0 ? 'Healthy' : 'Issues'}
              </div>
            </div>
          </div>
          <div className="metric-value">
            <span className="value">{formatMetricValue(processMetrics?.process?.uptime || 0, 's')}</span>
            <span className="metric-label">Uptime</span>
          </div>
          <div className="metric-details">
            <div className="detail-item">
              <span>Platform: {systemMetrics?.system?.platform || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <span>PID: {processMetrics?.process?.pid || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {performanceAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>Performance Alerts</h3>
          <div className="alerts-list">
            {performanceAlerts.slice(0, 5).map((alert, index) => (
              <div key={index} className={`alert-item ${alert.severity}`}>
                <div className="alert-header">
                  <span className="alert-title">{alert.title || alert.key}</span>
                  <span className={`alert-severity ${alert.severity}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-time">{formatTimestamp(alert.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>Optimization Recommendations</h3>
          <div className="recommendations-list">
            {recommendations.filter(r => !r.applied).slice(0, 3).map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.severity}`}>
                <div className="recommendation-header">
                  <span className="recommendation-title">{rec.title}</span>
                  <span className={`recommendation-priority ${rec.severity}`}>
                    {rec.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="recommendation-description">{rec.description}</div>
                <div className="recommendation-actions">
                  <button 
                    className="apply-button"
                    onClick={() => applyOptimization(rec.id)}
                  >
                    Apply Optimization
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMetricsTab = () => (
    <div className="detailed-metrics">
      <div className="metrics-controls">
        <button onClick={establishBaseline} className="baseline-button">
          Establish Baseline
        </button>
        <button onClick={exportPerformanceData} className="export-button">
          Export Data
        </button>
      </div>

      <div className="detailed-metrics-grid">
        <div className="metrics-section">
          <h3>System Metrics</h3>
          <div className="metrics-table">
            <div className="metric-row">
              <span className="metric-name">CPU Usage</span>
              <span className="metric-value">{formatMetricValue(systemMetrics?.cpu?.usage, '%')}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">CPU Cores</span>
              <span className="metric-value">{systemMetrics?.cpu?.cores}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Load Average (1m)</span>
              <span className="metric-value">{systemMetrics?.cpu?.loadAverage?.[0]?.toFixed(2) || 'N/A'}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Total Memory</span>
              <span className="metric-value">{formatBytes(systemMetrics?.memory?.total || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Free Memory</span>
              <span className="metric-value">{formatBytes(systemMetrics?.memory?.free || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Memory Usage</span>
              <span className="metric-value">{formatMetricValue(systemMetrics?.memory?.usage, '%')}</span>
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <h3>Process Metrics</h3>
          <div className="metrics-table">
            <div className="metric-row">
              <span className="metric-name">Heap Used</span>
              <span className="metric-value">{formatBytes(processMetrics?.memory?.heapUsed || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Heap Total</span>
              <span className="metric-value">{formatBytes(processMetrics?.memory?.heapTotal || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">RSS</span>
              <span className="metric-value">{formatBytes(processMetrics?.memory?.rss || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">External</span>
              <span className="metric-value">{formatBytes(processMetrics?.memory?.external || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">CPU User Time</span>
              <span className="metric-value">{formatMetricValue(processMetrics?.cpu?.user || 0, 'μs')}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">CPU System Time</span>
              <span className="metric-value">{formatMetricValue(processMetrics?.cpu?.system || 0, 'μs')}</span>
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <h3>Event Loop Metrics</h3>
          <div className="metrics-table">
            <div className="metric-row">
              <span className="metric-name">Current Lag</span>
              <span className="metric-value">{formatMetricValue(eventLoopMetrics?.lag, 'ms')}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Utilization</span>
              <span className="metric-value">{formatMetricValue(eventLoopMetrics?.utilization, '%')}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Status</span>
              <span className="metric-value">
                {(eventLoopMetrics?.lag || 0) < 50 ? 'Healthy' : 'Degraded'}
              </span>
            </div>
          </div>
        </div>

        <div className="metrics-section">
          <h3>Memory Details</h3>
          <div className="metrics-table">
            <div className="metric-row">
              <span className="metric-name">Heap Usage</span>
              <span className="metric-value">{formatMetricValue(memoryMetrics?.heap?.usage, '%')}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">V8 Heap Size</span>
              <span className="metric-value">{formatBytes(memoryMetrics?.v8?.totalHeapSize || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">V8 Used Heap</span>
              <span className="metric-value">{formatBytes(memoryMetrics?.v8?.usedHeapSize || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">V8 Heap Limit</span>
              <span className="metric-value">{formatBytes(memoryMetrics?.v8?.heapSizeLimit || 0)}</span>
            </div>
            <div className="metric-row">
              <span className="metric-name">Malloced Memory</span>
              <span className="metric-value">{formatBytes(memoryMetrics?.v8?.mallocedMemory || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOptimizationsTab = () => (
    <div className="optimizations-manager">
      <div className="optimizations-header">
        <h3>Performance Optimizations</h3>
        <div className="optimization-stats">
          <span className="stat-item">
            <span className="stat-value">{recommendations.filter(r => !r.applied).length}</span>
            <span className="stat-label">Available</span>
          </span>
          <span className="stat-item">
            <span className="stat-value">{recommendations.filter(r => r.applied).length}</span>
            <span className="stat-label">Applied</span>
          </span>
        </div>
      </div>

      <div className="recommendations-detailed">
        <h4>Available Recommendations</h4>
        <div className="recommendations-list detailed">
          {recommendations.filter(r => !r.applied).map((rec, index) => (
            <div key={index} className={`recommendation-item-detailed ${rec.severity}`}>
              <div className="recommendation-main">
                <div className="recommendation-header">
                  <span className="recommendation-title">{rec.title}</span>
                  <span className={`recommendation-priority ${rec.severity}`}>
                    {rec.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="recommendation-description">{rec.description}</div>
                {rec.suggestions && rec.suggestions.length > 0 && (
                  <div className="recommendation-suggestions">
                    <strong>Suggestions:</strong>
                    <ul>
                      {rec.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {rec.estimatedImpact && (
                  <div className="recommendation-impact">
                    <strong>Estimated Impact:</strong> {rec.estimatedImpact}
                  </div>
                )}
              </div>
              <div className="recommendation-actions">
                <button 
                  className="apply-button"
                  onClick={() => applyOptimization(rec.id)}
                >
                  Apply Optimization
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="applied-optimizations">
        <h4>Applied Optimizations</h4>
        <div className="applied-list">
          {recommendations.filter(r => r.applied).map((opt, index) => (
            <div key={index} className="applied-item">
              <div className="applied-header">
                <span className="applied-title">{opt.title}</span>
                <span className="applied-time">{formatTimestamp(opt.appliedAt)}</span>
              </div>
              <div className="applied-description">{opt.description}</div>
              <div className="applied-result">
                <strong>Result:</strong> {opt.result?.action || 'Applied successfully'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div className="performance-dashboard">
      <div className="performance-dashboard-header">
        <h2>Performance Dashboard</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="performance-dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Detailed Metrics
        </button>
        <button 
          className={`tab-button ${activeTab === 'optimizations' ? 'active' : ''}`}
          onClick={() => setActiveTab('optimizations')}
        >
          Optimizations
        </button>
      </div>

      <div className="performance-dashboard-content">
        {isLoading ? (
          <div className="loading">Loading performance data...</div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'metrics' && renderMetricsTab()}
            {activeTab === 'optimizations' && renderOptimizationsTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;