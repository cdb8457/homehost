import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = ({ systemInfo, servers, onServerAction }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [recommendations, setRecommendations] = useState({});
  const [allServerMetrics, setAllServerMetrics] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [monitoringStatus, setMonitoringStatus] = useState(null);

  useEffect(() => {
    if (systemInfo?.current) {
      setPerformanceData(systemInfo.current);
    }

    // Get game server recommendations
    getServerRecommendations();
    
    // Load server monitoring data
    loadMonitoringData();
    
    // Set up real-time monitoring listeners
    setupMonitoringListeners();
    
    return () => {
      // Clean up listeners
      window.electronAPI.removeAllListeners('server-metrics-updated');
      window.electronAPI.removeAllListeners('performance-alert');
      window.electronAPI.removeAllListeners('server-health-updated');
    };
  }, [systemInfo]);

  const loadMonitoringData = async () => {
    try {
      // Load all server metrics
      const metrics = await window.electronAPI.getAllServerMetrics();
      setAllServerMetrics(metrics);
      
      // Load monitoring status
      const status = await window.electronAPI.getMonitoringStatus();
      setMonitoringStatus(status);
      
      // Load recent alerts across all servers
      const recentAlerts = [];
      for (const server of servers) {
        if (server.status === 'running') {
          try {
            const serverAlerts = await window.electronAPI.getAlertHistory(server.id, 5);
            recentAlerts.push(...serverAlerts.map(alert => ({
              ...alert,
              serverName: server.name,
              serverId: server.id
            })));
          } catch (error) {
            console.warn(`Failed to load alerts for server ${server.id}:`, error);
          }
        }
      }
      
      // Sort alerts by timestamp and take most recent 10
      recentAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setAlerts(recentAlerts.slice(0, 10));
      
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    }
  };

  const setupMonitoringListeners = () => {
    // Listen for real-time metrics updates
    window.electronAPI.onServerMetricsUpdated((event, data) => {
      setAllServerMetrics(prev => ({
        ...prev,
        [data.serverId]: data.metrics
      }));
    });

    // Listen for performance alerts
    window.electronAPI.onPerformanceAlert((event, data) => {
      const alertWithServerInfo = {
        ...data.alert,
        serverName: servers.find(s => s.id === data.serverId)?.name || 'Unknown Server',
        serverId: data.serverId
      };
      
      setAlerts(prev => [alertWithServerInfo, ...prev.slice(0, 9)]);
    });

    // Listen for health updates
    window.electronAPI.onServerHealthUpdated((event, data) => {
      setAllServerMetrics(prev => ({
        ...prev,
        [data.serverId]: {
          ...prev[data.serverId],
          health: data.health
        }
      }));
    });
  };

  const getServerRecommendations = async () => {
    try {
      // This would call the SystemMonitor's getGameServerRecommendations method
      // For now, we'll simulate it based on system info
      if (systemInfo?.current?.memory) {
        const availableGB = systemInfo.current.memory.available / (1024 * 1024 * 1024);
        const cpuUsage = systemInfo.current.cpu.usage;

        setRecommendations({
          valheim: {
            recommended: availableGB >= 4 && cpuUsage < 70,
            maxPlayers: Math.min(20, Math.floor(availableGB * 2.5)),
            reason: availableGB < 4 ? 'Insufficient RAM' : cpuUsage > 70 ? 'High CPU usage' : 'Good to go!'
          },
          rust: {
            recommended: availableGB >= 8 && cpuUsage < 60,
            maxPlayers: Math.min(100, Math.floor(availableGB * 12.5)),
            reason: availableGB < 8 ? 'Insufficient RAM' : cpuUsage > 60 ? 'High CPU usage' : 'Good to go!'
          },
          cs2: {
            recommended: availableGB >= 2 && cpuUsage < 80,
            maxPlayers: Math.min(32, Math.floor(availableGB * 16)),
            reason: availableGB < 2 ? 'Insufficient RAM' : cpuUsage > 80 ? 'High CPU usage' : 'Good to go!'
          }
        });
      }
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    }
  };

  const runningServers = servers.filter(s => s.status === 'running');
  const stoppedServers = servers.filter(s => s.status === 'stopped');
  const totalPlayers = runningServers.reduce((sum, s) => sum + (s.currentPlayers || 0), 0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCpuBrand = (brand) => {
    if (!brand) return 'Unknown CPU';
    return brand.replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Monitor your game servers and system performance</p>
      </header>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="stat-card servers">
          <div className="stat-icon">🖥️</div>
          <div className="stat-content">
            <div className="stat-number">{runningServers.length}</div>
            <div className="stat-label">Running Servers</div>
            <div className="stat-detail">{servers.length} total</div>
          </div>
        </div>

        <div className="stat-card players">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{totalPlayers}</div>
            <div className="stat-label">Active Players</div>
            <div className="stat-detail">Across all servers</div>
          </div>
        </div>

        <div className="stat-card cpu">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-number">{performanceData?.cpu.usage.toFixed(1) || '0'}%</div>
            <div className="stat-label">CPU Usage</div>
            <div className="stat-detail">{systemInfo?.static?.cpu?.cores || 'N/A'} cores</div>
          </div>
        </div>

        <div className="stat-card memory">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <div className="stat-number">{performanceData?.memory.usagePercent.toFixed(1) || '0'}%</div>
            <div className="stat-label">RAM Usage</div>
            <div className="stat-detail">{formatBytes(systemInfo?.static?.memory?.total || 0)}</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* System Overview */}
        <div className="card system-overview">
          <div className="card-header">
            <h3 className="card-title">System Overview</h3>
          </div>
          
          {systemInfo ? (
            <div className="system-details">
              <div className="system-item">
                <span className="system-label">CPU</span>
                <span className="system-value">{formatCpuBrand(systemInfo.static?.cpu?.brand)}</span>
              </div>
              <div className="system-item">
                <span className="system-label">RAM</span>
                <span className="system-value">
                  {formatBytes(performanceData?.memory.used || 0)} / {formatBytes(systemInfo.static?.memory?.total || 0)}
                </span>
              </div>
              <div className="system-item">
                <span className="system-label">Platform</span>
                <span className="system-value">{systemInfo.static?.os?.platform} {systemInfo.static?.os?.arch}</span>
              </div>
              <div className="system-item">
                <span className="system-label">Hostname</span>
                <span className="system-value">{systemInfo.static?.os?.hostname}</span>
              </div>
              
              {performanceData?.disk && performanceData.disk.length > 0 && (
                <div className="system-item">
                  <span className="system-label">Storage</span>
                  <span className="system-value">
                    {formatBytes(performanceData.disk[0].available)} available
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="loading">Loading system information...</div>
          )}
        </div>

        {/* Server Monitoring Overview */}
        <div className="card server-monitoring">
          <div className="card-header">
            <h3 className="card-title">Server Monitoring</h3>
            <span className="monitoring-status">
              {monitoringStatus?.active ? '🟢 Active' : '🔴 Inactive'}
            </span>
          </div>
          
          {runningServers.length > 0 ? (
            <div className="monitoring-server-list">
              {runningServers.map(server => {
                const metrics = allServerMetrics[server.id];
                const health = metrics?.health;
                const current = metrics?.current;
                
                return (
                  <div key={server.id} className="monitoring-server-item">
                    <div className="server-overview">
                      <div className="server-basic-info">
                        <div className="server-name">{server.name}</div>
                        <div className="server-meta">
                          <span className="server-game">{server.gameName}</span>
                          <span className="server-port">:{server.port}</span>
                        </div>
                      </div>
                      
                      {health && (
                        <div className="health-indicator">
                          <div className={`health-circle mini ${health.status}`}>
                            <span className="health-score">{health.score}</span>
                          </div>
                          <span className={`health-text ${health.status}`}>
                            {health.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {current && (
                      <div className="server-metrics-preview">
                        <div className="metric-mini">
                          <span className="metric-label">CPU</span>
                          <span className="metric-value">{current.cpu?.toFixed(1) || '0'}%</span>
                          <div className="metric-bar-mini">
                            <div 
                              className="metric-fill-mini cpu"
                              style={{ width: `${Math.min(current.cpu || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="metric-mini">
                          <span className="metric-label">RAM</span>
                          <span className="metric-value">{current.memory?.toFixed(1) || '0'}%</span>
                          <div className="metric-bar-mini">
                            <div 
                              className="metric-fill-mini memory"
                              style={{ width: `${Math.min(current.memory || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="metric-mini">
                          <span className="metric-label">Uptime</span>
                          <span className="metric-value">
                            {Math.floor((current.uptime || 0) / 3600)}h {Math.floor(((current.uptime || 0) % 3600) / 60)}m
                          </span>
                        </div>
                        
                        <div className="metric-mini">
                          <span className="metric-label">Players</span>
                          <span className="metric-value">
                            {server.currentPlayers || 0}/{server.maxPlayers}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="server-actions-mini">
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => onServerAction('details', server.id)}
                      >
                        Details
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => onServerAction('stop', server.id)}
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <div className="empty-text">No servers to monitor</div>
              <div className="empty-subtext">Start a server to see real-time metrics</div>
            </div>
          )}
        </div>

        {/* Performance Monitor */}
        <div className="card performance-monitor">
          <div className="card-header">
            <h3 className="card-title">Performance Monitor</h3>
          </div>
          
          {performanceData ? (
            <div className="performance-metrics">
              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">CPU Usage</span>
                  <span className="metric-value">{performanceData.cpu.usage.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill cpu-usage"
                    style={{ width: `${Math.min(performanceData.cpu.usage, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="metric">
                <div className="metric-header">
                  <span className="metric-label">Memory Usage</span>
                  <span className="metric-value">{performanceData.memory.usagePercent.toFixed(1)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill memory-usage"
                    style={{ width: `${Math.min(performanceData.memory.usagePercent, 100)}%` }}
                  ></div>
                </div>
              </div>

              {performanceData.disk && performanceData.disk.length > 0 && (
                <div className="metric">
                  <div className="metric-header">
                    <span className="metric-label">Disk Usage</span>
                    <span className="metric-value">{performanceData.disk[0].usagePercent.toFixed(1)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill disk-usage"
                      style={{ width: `${Math.min(performanceData.disk[0].usagePercent, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="loading">Loading performance data...</div>
          )}
        </div>

        {/* Server Recommendations */}
        <div className="card recommendations">
          <div className="card-header">
            <h3 className="card-title">Server Recommendations</h3>
          </div>
          
          <div className="recommendation-list">
            {Object.entries(recommendations).map(([gameId, rec]) => (
              <div key={gameId} className={`recommendation-item ${rec.recommended ? 'recommended' : 'not-recommended'}`}>
                <div className="recommendation-info">
                  <div className="game-name">{gameId.charAt(0).toUpperCase() + gameId.slice(1)}</div>
                  <div className="recommendation-reason">{rec.reason}</div>
                </div>
                <div className="recommendation-stats">
                  <div className="max-players">Max: {rec.maxPlayers} players</div>
                  <div className={`recommendation-status ${rec.recommended ? 'good' : 'warning'}`}>
                    {rec.recommended ? '✅' : '⚠️'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="card alerts-panel">
          <div className="card-header">
            <h3 className="card-title">Performance Alerts</h3>
            <span className="alert-count">{alerts.length}</span>
          </div>
          
          <div className="alerts-list">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className={`alert-item ${alert.severity}`}>
                  <div className="alert-icon">
                    {alert.severity === 'high' && '🚨'}
                    {alert.severity === 'warning' && '⚠️'}
                    {alert.severity === 'info' && 'ℹ️'}
                  </div>
                  <div className="alert-content">
                    <div className="alert-message">{alert.message}</div>
                    <div className="alert-meta">
                      <span className="alert-server">{alert.serverName}</span>
                      <span className="alert-time">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="alert-type">
                    {alert.type?.toUpperCase()}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div className="empty-text">No active alerts</div>
                <div className="empty-subtext">All servers running smoothly</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card recent-activity">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          
          <div className="activity-list">
            {servers.length > 0 ? (
              servers.slice(0, 5).map(server => (
                <div key={server.id} className="activity-item">
                  <div className="activity-icon">
                    {server.status === 'running' ? '🟢' : '⚪'}
                  </div>
                  <div className="activity-content">
                    <div className="activity-text">
                      Server "{server.name}" is {server.status}
                    </div>
                    <div className="activity-time">
                      {server.lastStarted ? new Date(server.lastStarted).toLocaleString() : 'Never started'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-text">No recent activity</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;