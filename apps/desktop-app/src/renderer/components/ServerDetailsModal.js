import React, { useState, useEffect, useRef } from 'react';
import './ServerDetailsModal.css';

const ServerDetailsModal = ({ server, onClose, onServerAction }) => {
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);
  const [configFiles, setConfigFiles] = useState([]);
  const [backups, setBackups] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [consoleCommand, setConsoleCommand] = useState('');
  const [backupName, setBackupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [thresholds, setThresholds] = useState({
    cpu: 80,
    memory: 85,
    diskSpace: 90,
    responseTime: 5000,
    restartCount: 3
  });
  
  const logsEndRef = useRef(null);
  const logUpdateInterval = useRef(null);

  useEffect(() => {
    if (server) {
      loadServerData();
      startLogUpdates();
      setupMetricsListener();
    }
    
    return () => {
      if (logUpdateInterval.current) {
        clearInterval(logUpdateInterval.current);
      }
      
      // Remove event listeners
      window.electronAPI.removeAllListeners('server-metrics-updated');
      window.electronAPI.removeAllListeners('performance-alert');
      window.electronAPI.removeAllListeners('server-health-updated');
    };
  }, [server]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const loadServerData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadLogs(),
        loadConfigFiles(),
        loadBackups(),
        loadMetrics(),
        loadAlertHistory()
      ]);
    } catch (err) {
      setError(`Failed to load server data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const serverMetrics = await window.electronAPI.getServerMetrics(server.id);
      setMetrics(serverMetrics);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    }
  };

  const loadAlertHistory = async () => {
    try {
      const alerts = await window.electronAPI.getAlertHistory(server.id, 50);
      setAlertHistory(alerts);
    } catch (err) {
      console.error('Failed to load alert history:', err);
    }
  };

  const setupMetricsListener = () => {
    // Listen for real-time metrics updates
    window.electronAPI.onServerMetricsUpdated((event, data) => {
      if (data.serverId === server.id) {
        setMetrics(prev => ({
          ...prev,
          current: data.metrics,
          history: data.history
        }));
      }
    });

    // Listen for performance alerts
    window.electronAPI.onPerformanceAlert((event, data) => {
      if (data.serverId === server.id) {
        setAlertHistory(prev => [data.alert, ...prev.slice(0, 49)]);
      }
    });

    // Listen for health updates
    window.electronAPI.onServerHealthUpdated((event, data) => {
      if (data.serverId === server.id) {
        setMetrics(prev => ({
          ...prev,
          health: data.health
        }));
      }
    });
  };

  const loadLogs = async () => {
    try {
      const serverLogs = await window.electronAPI.getServerLogs(server.id, 500);
      setLogs(serverLogs);
    } catch (err) {
      console.error('Failed to load logs:', err);
    }
  };

  const loadConfigFiles = async () => {
    try {
      const configs = await window.electronAPI.getServerConfig(server.id);
      setConfigFiles(configs);
    } catch (err) {
      console.error('Failed to load config files:', err);
    }
  };

  const loadBackups = async () => {
    try {
      const serverBackups = await window.electronAPI.getServerBackups(server.id);
      setBackups(serverBackups);
    } catch (err) {
      console.error('Failed to load backups:', err);
    }
  };

  const startLogUpdates = () => {
    if (logUpdateInterval.current) {
      clearInterval(logUpdateInterval.current);
    }
    
    logUpdateInterval.current = setInterval(() => {
      if (activeTab === 'logs') {
        loadLogs();
      }
    }, 2000);
  };

  const handleClearLogs = async () => {
    try {
      await window.electronAPI.clearServerLogs(server.id);
      setLogs([]);
      
      await window.electronAPI.showNotification({
        title: 'Logs Cleared',
        body: `Cleared logs for ${server.name}`
      });
    } catch (err) {
      setError(`Failed to clear logs: ${err.message}`);
    }
  };

  const handleSendCommand = async () => {
    if (!consoleCommand.trim()) return;
    
    try {
      await window.electronAPI.sendServerCommand(server.id, consoleCommand);
      setConsoleCommand('');
      
      // Add a local log entry for immediate feedback
      const commandLog = {
        timestamp: new Date().toISOString(),
        type: 'system',
        message: `Command sent: ${consoleCommand}`,
        id: Date.now()
      };
      setLogs(prev => [...prev, commandLog]);
    } catch (err) {
      setError(`Failed to send command: ${err.message}`);
    }
  };

  const handleReadConfigFile = async (file) => {
    try {
      setLoading(true);
      const result = await window.electronAPI.readConfigFile(server.id, file.path);
      setSelectedFile(file);
      setFileContent(result.content);
    } catch (err) {
      setError(`Failed to read config file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfigFile = async () => {
    if (!selectedFile) return;
    
    try {
      setLoading(true);
      await window.electronAPI.writeConfigFile(server.id, selectedFile.path, fileContent);
      
      await window.electronAPI.showNotification({
        title: 'Config Saved',
        body: `Updated ${selectedFile.name}`
      });
      
      // Refresh config files list
      await loadConfigFiles();
    } catch (err) {
      setError(`Failed to save config file: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      setError('Please enter a backup name');
      return;
    }
    
    try {
      setLoading(true);
      const backup = await window.electronAPI.createServerBackup(server.id, backupName);
      setBackupName('');
      
      await window.electronAPI.showNotification({
        title: 'Backup Created',
        body: `Created backup: ${backup.name}`
      });
      
      await loadBackups();
    } catch (err) {
      setError(`Failed to create backup: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'stdout': return '#4CAF50';
      case 'stderr': return '#F44336';
      case 'system': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const tabs = [
    { id: 'logs', label: 'Live Logs', icon: '📜' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'console', label: 'Console', icon: '💻' },
    { id: 'config', label: 'Configuration', icon: '⚙️' },
    { id: 'backups', label: 'Backups', icon: '💾' },
    { id: 'info', label: 'Server Info', icon: 'ℹ️' }
  ];

  return (
    <div className="modal-overlay">
      <div className="server-details-modal">
        <div className="modal-header">
          <div className="server-title">
            <h2>{server.name}</h2>
            <span className={`status-badge ${server.status}`}>
              {server.status.toUpperCase()}
            </span>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-banner">
            <span>❌ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <div className="modal-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="modal-content">
          {/* Live Logs Tab */}
          {activeTab === 'logs' && (
            <div className="logs-tab">
              <div className="logs-header">
                <div className="logs-controls">
                  <label className="auto-scroll-toggle">
                    <input
                      type="checkbox"
                      checked={autoScroll}
                      onChange={(e) => setAutoScroll(e.target.checked)}
                    />
                    Auto-scroll
                  </label>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleClearLogs}
                  >
                    Clear Logs
                  </button>
                </div>
                <div className="logs-info">
                  {logs.length} log entries
                </div>
              </div>
              
              <div className="logs-container">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`log-entry ${log.type}`}
                    style={{ borderLeftColor: getLogTypeColor(log.type) }}
                  >
                    <span className="log-timestamp">
                      {formatTimestamp(log.timestamp)}
                    </span>
                    <span className="log-type">[{log.type.toUpperCase()}]</span>
                    <span className="log-message">{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="performance-tab">
              {server.status === 'running' && metrics ? (
                <>
                  {/* Current Metrics */}
                  <div className="metrics-overview">
                    <h3>📊 Real-time Performance</h3>
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-label">CPU Usage</span>
                          <span className={`metric-value ${metrics.current?.cpu > thresholds.cpu ? 'alert' : ''}`}>
                            {metrics.current?.cpu?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill cpu"
                            style={{ width: `${Math.min(metrics.current?.cpu || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-label">Memory Usage</span>
                          <span className={`metric-value ${metrics.current?.memory > thresholds.memory ? 'alert' : ''}`}>
                            {metrics.current?.memory?.toFixed(1) || 0}%
                          </span>
                        </div>
                        <div className="metric-bar">
                          <div 
                            className="metric-fill memory"
                            style={{ width: `${Math.min(metrics.current?.memory || 0, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-label">Uptime</span>
                          <span className="metric-value">
                            {Math.floor((metrics.current?.uptime || 0) / 3600)}h {Math.floor(((metrics.current?.uptime || 0) % 3600) / 60)}m
                          </span>
                        </div>
                      </div>

                      <div className="metric-card">
                        <div className="metric-header">
                          <span className="metric-label">Connections</span>
                          <span className="metric-value">
                            {metrics.current?.connections || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Health Status */}
                  {metrics.health && (
                    <div className="health-status">
                      <h3>🏥 Server Health</h3>
                      <div className="health-overview">
                        <div className="health-score">
                          <div className={`health-circle ${metrics.health.status}`}>
                            <span className="health-number">{metrics.health.score}</span>
                          </div>
                          <div className="health-info">
                            <span className="health-label">Health Score</span>
                            <span className={`health-status-text ${metrics.health.status}`}>
                              {metrics.health.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {metrics.health.issues.length > 0 && (
                          <div className="health-issues">
                            <h4>Current Issues:</h4>
                            {metrics.health.issues.map((issue, index) => (
                              <div key={index} className={`health-issue ${issue.severity}`}>
                                <span className="issue-type">[{issue.type.toUpperCase()}]</span>
                                <span className="issue-message">{issue.message}</span>
                                {issue.suggestion && (
                                  <div className="issue-suggestion">💡 {issue.suggestion}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Performance History Chart */}
                  {metrics.history && metrics.history.length > 0 && (
                    <div className="performance-history">
                      <h3>📈 Performance History</h3>
                      <div className="chart-container">
                        <div className="chart-legend">
                          <div className="legend-item">
                            <span className="legend-color cpu"></span>
                            <span>CPU Usage</span>
                          </div>
                          <div className="legend-item">
                            <span className="legend-color memory"></span>
                            <span>Memory Usage</span>
                          </div>
                        </div>
                        <div className="simple-chart">
                          {metrics.history.slice(-20).map((point, index) => (
                            <div key={index} className="chart-bar">
                              <div 
                                className="bar cpu"
                                style={{ height: `${Math.min(point.cpu || 0, 100)}%` }}
                                title={`CPU: ${point.cpu?.toFixed(1)}%`}
                              ></div>
                              <div 
                                className="bar memory"
                                style={{ height: `${Math.min(point.memory || 0, 100)}%` }}
                                title={`Memory: ${point.memory?.toFixed(1)}%`}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Alerts */}
                  {Object.values(metrics.alerts || {}).some(alert => alert) && (
                    <div className="active-alerts">
                      <h3>🚨 Active Alerts</h3>
                      <div className="alerts-list">
                        {metrics.alerts?.cpu && (
                          <div className="alert-item warning">
                            <span className="alert-icon">⚠️</span>
                            <span className="alert-text">High CPU usage detected</span>
                          </div>
                        )}
                        {metrics.alerts?.memory && (
                          <div className="alert-item warning">
                            <span className="alert-icon">⚠️</span>
                            <span className="alert-text">High memory usage detected</span>
                          </div>
                        )}
                        {metrics.alerts?.disk && (
                          <div className="alert-item warning">
                            <span className="alert-icon">⚠️</span>
                            <span className="alert-text">High disk usage detected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alert History */}
                  {alertHistory.length > 0 && (
                    <div className="alert-history">
                      <h3>📋 Recent Alerts</h3>
                      <div className="alerts-timeline">
                        {alertHistory.slice(0, 10).map((alert, index) => (
                          <div key={index} className={`timeline-item ${alert.severity}`}>
                            <div className="timeline-time">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                            <div className="timeline-content">
                              <span className="timeline-type">[{alert.type?.toUpperCase()}]</span>
                              <span className="timeline-message">{alert.message}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="performance-unavailable">
                  <h3>📊 Performance Monitoring</h3>
                  {server.status !== 'running' ? (
                    <div className="unavailable-message">
                      <p>⚠️ Performance monitoring is only available when the server is running.</p>
                      <p>Start the server to see real-time metrics and health data.</p>
                    </div>
                  ) : (
                    <div className="unavailable-message">
                      <p>⏳ Loading performance data...</p>
                      <p>Metrics will appear shortly after the server starts.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Console Tab */}
          {activeTab === 'console' && (
            <div className="console-tab">
              <div className="console-info">
                <h3>Server Console</h3>
                <p>Send commands directly to the running server process.</p>
              </div>
              
              <div className="console-input">
                <input
                  type="text"
                  value={consoleCommand}
                  onChange={(e) => setConsoleCommand(e.target.value)}
                  placeholder="Enter server command..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
                  disabled={server.status !== 'running'}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleSendCommand}
                  disabled={server.status !== 'running' || !consoleCommand.trim()}
                >
                  Send
                </button>
              </div>
              
              {server.status !== 'running' && (
                <div className="console-warning">
                  ⚠️ Server must be running to send commands
                </div>
              )}
              
              <div className="command-examples">
                <h4>Common Commands:</h4>
                <div className="command-list">
                  {server.gameType === 'valheim' && (
                    <>
                      <button onClick={() => setConsoleCommand('help')}>help</button>
                      <button onClick={() => setConsoleCommand('players')}>players</button>
                      <button onClick={() => setConsoleCommand('kick [player]')}>kick [player]</button>
                    </>
                  )}
                  {server.gameType === 'rust' && (
                    <>
                      <button onClick={() => setConsoleCommand('status')}>status</button>
                      <button onClick={() => setConsoleCommand('players')}>players</button>
                      <button onClick={() => setConsoleCommand('save')}>save</button>
                    </>
                  )}
                  {server.gameType === 'cs2' && (
                    <>
                      <button onClick={() => setConsoleCommand('status')}>status</button>
                      <button onClick={() => setConsoleCommand('maps *')}>maps *</button>
                      <button onClick={() => setConsoleCommand('changelevel de_dust2')}>changelevel de_dust2</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'config' && (
            <div className="config-tab">
              <div className="config-sidebar">
                <h3>Configuration Files</h3>
                <div className="config-files-list">
                  {configFiles.map((file, index) => (
                    <div 
                      key={index}
                      className={`config-file-item ${selectedFile?.path === file.path ? 'selected' : ''}`}
                      onClick={() => handleReadConfigFile(file)}
                    >
                      <div className="file-name">{file.name}</div>
                      <div className="file-description">{file.description}</div>
                      <div className="file-meta">
                        {formatBytes(file.size)} • {new Date(file.modified).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="config-editor">
                {selectedFile ? (
                  <>
                    <div className="editor-header">
                      <h4>Editing: {selectedFile.name}</h4>
                      <button 
                        className="btn btn-primary"
                        onClick={handleSaveConfigFile}
                        disabled={loading || !selectedFile.editable}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                    
                    <textarea
                      className="config-textarea"
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      disabled={!selectedFile.editable}
                      placeholder="Loading file content..."
                    />
                    
                    {!selectedFile.editable && (
                      <div className="read-only-notice">
                        📖 This file is read-only
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-file-selected">
                    <h4>No file selected</h4>
                    <p>Select a configuration file from the list to view or edit it.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Backups Tab */}
          {activeTab === 'backups' && (
            <div className="backups-tab">
              <div className="backup-controls">
                <h3>Server Backups</h3>
                <div className="create-backup">
                  <input
                    type="text"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    placeholder="Backup name (optional)"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={handleCreateBackup}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Backup'}
                  </button>
                </div>
              </div>
              
              <div className="backups-list">
                {backups.map((backup, index) => (
                  <div key={index} className="backup-item">
                    <div className="backup-info">
                      <h4>{backup.name}</h4>
                      <div className="backup-meta">
                        <span>Created: {new Date(backup.created).toLocaleString()}</span>
                        <span>Size: {formatBytes(backup.size)}</span>
                      </div>
                    </div>
                    <div className="backup-actions">
                      <button className="btn btn-secondary">Restore</button>
                      <button className="btn btn-danger">Delete</button>
                    </div>
                  </div>
                ))}
                
                {backups.length === 0 && (
                  <div className="no-backups">
                    <h4>No backups found</h4>
                    <p>Create your first backup to preserve your server data.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Server Info Tab */}
          {activeTab === 'info' && (
            <div className="info-tab">
              <div className="server-info-grid">
                <div className="info-section">
                  <h3>Basic Information</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="info-label">Server Name:</span>
                      <span className="info-value">{server.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Game Type:</span>
                      <span className="info-value">{server.gameName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Status:</span>
                      <span className={`info-value status-${server.status}`}>
                        {server.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Port:</span>
                      <span className="info-value">{server.port}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Max Players:</span>
                      <span className="info-value">{server.maxPlayers}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Current Players:</span>
                      <span className="info-value">{server.currentPlayers || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h3>Server Details</h3>
                  <div className="info-items">
                    <div className="info-item">
                      <span className="info-label">Install Path:</span>
                      <span className="info-value mono">{server.installPath}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Created:</span>
                      <span className="info-value">
                        {new Date(server.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {server.lastStarted && (
                      <div className="info-item">
                        <span className="info-label">Last Started:</span>
                        <span className="info-value">
                          {new Date(server.lastStarted).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {server.worldName && (
                      <div className="info-item">
                        <span className="info-label">World Name:</span>
                        <span className="info-value">{server.worldName}</span>
                      </div>
                    )}
                    {server.map && (
                      <div className="info-item">
                        <span className="info-label">Map:</span>
                        <span className="info-value">{server.map}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="server-actions">
                <h3>Server Actions</h3>
                <div className="action-buttons">
                  {server.status === 'stopped' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => onServerAction('start', server.id)}
                    >
                      Start Server
                    </button>
                  )}
                  {server.status === 'running' && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => onServerAction('stop', server.id)}
                    >
                      Stop Server
                    </button>
                  )}
                  <button className="btn btn-secondary">
                    Restart Server
                  </button>
                  <button className="btn btn-warning">
                    Delete Server
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerDetailsModal;