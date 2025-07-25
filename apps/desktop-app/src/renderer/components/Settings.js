import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ systemInfo, onSystemInfoUpdate, onOpenMonitor }) => {
  const [settings, setSettings] = useState({
    steamPath: '',
    defaultInstallPath: '',
    autoStart: false,
    notifications: true,
    cloudSync: false,
    apiKey: '',
    theme: 'dark'
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real implementation, this would load from electron-store
      // For now, we'll use placeholder data
      setSettings({
        steamPath: 'C:\\SteamCMD',
        defaultInstallPath: 'C:\\GameServers',
        autoStart: true,
        notifications: true,
        cloudSync: false,
        apiKey: '',
        theme: 'dark'
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      // In a real implementation, this would save to electron-store
      console.log('Saving settings:', settings);
      
      // Configure Steam if path is provided
      if (settings.steamPath) {
        await window.electronAPI.configureSteam(settings.steamPath);
      }
      
      // Show success notification
      await window.electronAPI.showNotification({
        title: 'Settings Saved',
        body: 'Your settings have been saved successfully.'
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const selectSteamPath = async () => {
    try {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        setSettings(prev => ({ ...prev, steamPath: path }));
      }
    } catch (error) {
      console.error('Failed to select Steam path:', error);
    }
  };

  const selectInstallPath = async () => {
    try {
      const path = await window.electronAPI.selectDirectory();
      if (path) {
        setSettings(prev => ({ ...prev, defaultInstallPath: path }));
      }
    } catch (error) {
      console.error('Failed to select install path:', error);
    }
  };

  const testCloudConnection = async () => {
    if (!settings.apiKey) {
      setConnectionStatus({ success: false, message: 'API key is required' });
      return;
    }

    setIsTestingConnection(true);
    try {
      // Simulate cloud connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would test the actual cloud connection
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      setConnectionStatus({
        success,
        message: success 
          ? 'Successfully connected to HomeHost Cloud' 
          : 'Failed to connect. Please check your API key.'
      });
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Connection test failed: ' + error.message
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="settings">
      <header className="settings-header">
        <h1>Settings</h1>
        <p>Configure HomeHost Desktop to your preferences</p>
      </header>

      <div className="settings-grid">
        {/* System Information */}
        <div className="settings-section">
          <h2>System Information</h2>
          
          {systemInfo ? (
            <div className="system-info-grid">
              <div className="info-card">
                <h4>Computer</h4>
                <div className="info-item">
                  <span>Hostname:</span>
                  <span>{systemInfo.static?.os?.hostname || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span>Platform:</span>
                  <span>{systemInfo.static?.os?.platform} {systemInfo.static?.os?.arch}</span>
                </div>
                <div className="info-item">
                  <span>OS:</span>
                  <span>{systemInfo.static?.os?.distro} {systemInfo.static?.os?.release}</span>
                </div>
              </div>

              <div className="info-card">
                <h4>Processor</h4>
                <div className="info-item">
                  <span>CPU:</span>
                  <span>{systemInfo.static?.cpu?.brand || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <span>Cores:</span>
                  <span>{systemInfo.static?.cpu?.cores || 'N/A'} cores ({systemInfo.static?.cpu?.physicalCores || 'N/A'} physical)</span>
                </div>
                <div className="info-item">
                  <span>Speed:</span>
                  <span>{systemInfo.static?.cpu?.speed || 'Unknown'} GHz</span>
                </div>
              </div>

              <div className="info-card">
                <h4>Memory</h4>
                <div className="info-item">
                  <span>Total RAM:</span>
                  <span>{formatBytes(systemInfo.static?.memory?.total || 0)}</span>
                </div>
                <div className="info-item">
                  <span>Available:</span>
                  <span>{formatBytes(systemInfo.current?.memory?.available || 0)}</span>
                </div>
                <div className="info-item">
                  <span>Usage:</span>
                  <span>{systemInfo.current?.memory?.usagePercent?.toFixed(1) || '0'}%</span>
                </div>
              </div>

              {systemInfo.static?.graphics && systemInfo.static.graphics.length > 0 && (
                <div className="info-card">
                  <h4>Graphics</h4>
                  {systemInfo.static.graphics.map((gpu, index) => (
                    <div key={index}>
                      <div className="info-item">
                        <span>GPU {index + 1}:</span>
                        <span>{gpu.model || 'Unknown'}</span>
                      </div>
                      {gpu.vram && (
                        <div className="info-item">
                          <span>VRAM:</span>
                          <span>{formatBytes(gpu.vram)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="loading">Loading system information...</div>
          )}
        </div>

        {/* Steam Configuration */}
        <div className="settings-section">
          <h2>Steam Configuration</h2>
          
          <div className="form-group">
            <label className="form-label">SteamCMD Path</label>
            <p className="form-description">
              Path to your SteamCMD installation. This is used to download and manage game servers.
            </p>
            <div className="path-selector">
              <input
                type="text"
                className="form-input"
                value={settings.steamPath}
                onChange={(e) => setSettings(prev => ({ ...prev, steamPath: e.target.value }))}
                placeholder="Select SteamCMD directory"
              />
              <button className="btn btn-secondary" onClick={selectSteamPath}>
                Browse
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Default Installation Path</label>
            <p className="form-description">
              Default directory where game servers will be installed.
            </p>
            <div className="path-selector">
              <input
                type="text"
                className="form-input"
                value={settings.defaultInstallPath}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultInstallPath: e.target.value }))}
                placeholder="Select default installation directory"
              />
              <button className="btn btn-secondary" onClick={selectInstallPath}>
                Browse
              </button>
            </div>
          </div>
        </div>

        {/* Application Settings */}
        <div className="settings-section">
          <h2>Application Settings</h2>
          
          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.autoStart}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoStart: e.target.checked }))}
                />
                <span className="checkbox-custom"></span>
                <div className="checkbox-content">
                  <span className="checkbox-title">Auto-start servers</span>
                  <span className="checkbox-description">Automatically start servers when the application launches</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                />
                <span className="checkbox-custom"></span>
                <div className="checkbox-content">
                  <span className="checkbox-title">Show notifications</span>
                  <span className="checkbox-description">Display system notifications for server events</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Theme</label>
            <select
              className="form-select"
              value={settings.theme}
              onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="settings-section">
          <h2>Cloud Sync</h2>
          
          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.cloudSync}
                  onChange={(e) => setSettings(prev => ({ ...prev, cloudSync: e.target.checked }))}
                />
                <span className="checkbox-custom"></span>
                <div className="checkbox-content">
                  <span className="checkbox-title">Enable cloud synchronization</span>
                  <span className="checkbox-description">Sync your server configurations across devices</span>
                </div>
              </label>
            </div>
          </div>

          {settings.cloudSync && (
            <div className="cloud-config">
              <div className="form-group">
                <label className="form-label">API Key</label>
                <p className="form-description">
                  Your HomeHost Cloud API key. You can get this from your account dashboard.
                </p>
                <input
                  type="password"
                  className="form-input"
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your API key"
                />
              </div>

              <div className="connection-test">
                <button 
                  className="btn btn-secondary"
                  onClick={testCloudConnection}
                  disabled={isTestingConnection || !settings.apiKey}
                >
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </button>
                
                {connectionStatus && (
                  <div className={`connection-status ${connectionStatus.success ? 'success' : 'error'}`}>
                    {connectionStatus.success ? '✅' : '❌'} {connectionStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Production Monitoring */}
        <div className="settings-section">
          <h2>Production Monitoring</h2>
          <p className="section-description">
            Access advanced monitoring and management dashboards for production deployment.
          </p>
          
          <div className="monitoring-grid">
            <div className="monitoring-card" onClick={() => onOpenMonitor?.('security')}>
              <div className="monitoring-icon">🛡️</div>
              <div className="monitoring-content">
                <h3>Security Monitor</h3>
                <p>Real-time security monitoring, threat detection, and audit results</p>
              </div>
              <div className="monitoring-arrow">→</div>
            </div>

            <div className="monitoring-card" onClick={() => onOpenMonitor?.('performance')}>
              <div className="monitoring-icon">📊</div>
              <div className="monitoring-content">
                <h3>Performance Dashboard</h3>
                <p>System performance metrics, optimization recommendations</p>
              </div>
              <div className="monitoring-arrow">→</div>
            </div>

            <div className="monitoring-card" onClick={() => onOpenMonitor?.('deployment')}>
              <div className="monitoring-icon">🚀</div>
              <div className="monitoring-content">
                <h3>Deployment Manager</h3>
                <p>Multi-environment deployment pipeline and rollback controls</p>
              </div>
              <div className="monitoring-arrow">→</div>
            </div>

            <div className="monitoring-card" onClick={() => onOpenMonitor?.('health')}>
              <div className="monitoring-icon">💚</div>
              <div className="monitoring-content">
                <h3>Health Monitor</h3>
                <p>System health checks, service status, and uptime monitoring</p>
              </div>
              <div className="monitoring-arrow">→</div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <h2>About HomeHost Desktop</h2>
          
          <div className="about-info">
            <div className="about-item">
              <span className="about-label">Version:</span>
              <span className="about-value">1.0.0</span>
            </div>
            <div className="about-item">
              <span className="about-label">Build:</span>
              <span className="about-value">Desktop-MVP-001</span>
            </div>
            <div className="about-item">
              <span className="about-label">Platform:</span>
              <span className="about-value">{window.appInfo?.platform || 'Unknown'}</span>
            </div>
            <div className="about-item">
              <span className="about-label">Architecture:</span>
              <span className="about-value">{window.appInfo?.arch || 'Unknown'}</span>
            </div>
          </div>

          <div className="about-links">
            <button className="btn btn-secondary" onClick={() => console.log('Open documentation')}>
              Documentation
            </button>
            <button className="btn btn-secondary" onClick={() => console.log('Open support')}>
              Support
            </button>
            <button className="btn btn-secondary" onClick={() => console.log('Check for updates')}>
              Check for Updates
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-footer">
        <button className="btn btn-primary btn-large" onClick={saveSettings}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;