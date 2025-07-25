import React, { useState, useEffect } from 'react';
import './SteamManager.css';

const SteamManager = () => {
  const [steamHealth, setSteamHealth] = useState(null);
  const [activeInstalls, setActiveInstalls] = useState([]);
  const [gameLibrary, setGameLibrary] = useState([]);
  const [steamPath, setSteamPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSteamStatus();
    loadGameLibrary();
    
    // Update every 5 seconds for active installs
    const interval = setInterval(() => {
      loadActiveInstalls();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSteamStatus = async () => {
    try {
      const health = await window.electronAPI.getSteamCMDHealth();
      setSteamHealth(health);
      
      if (health.healthy) {
        loadActiveInstalls();
      }
    } catch (err) {
      console.error('Failed to load Steam status:', err);
      setError('Failed to check SteamCMD status');
    }
  };

  const loadActiveInstalls = async () => {
    try {
      const installs = await window.electronAPI.getActiveInstalls();
      setActiveInstalls(installs);
    } catch (err) {
      console.warn('Failed to load active installs:', err);
    }
  };

  const loadGameLibrary = async () => {
    try {
      const games = await window.electronAPI.getSteamGames();
      setGameLibrary(games);
    } catch (err) {
      console.error('Failed to load game library:', err);
    }
  };

  const configureSteam = async () => {
    try {
      setLoading(true);
      const selectedPath = await window.electronAPI.selectDirectory();
      
      if (selectedPath) {
        setSteamPath(selectedPath);
        await window.electronAPI.configureSteam(selectedPath);
        await loadSteamStatus();
        
        await window.electronAPI.showNotification({
          title: 'Steam Configuration',
          body: 'SteamCMD configured successfully!'
        });
      }
    } catch (err) {
      setError(`Failed to configure Steam: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const installGame = async (game) => {
    try {
      setLoading(true);
      
      // Select installation directory
      const installPath = await window.electronAPI.selectDirectory();
      if (!installPath) return;

      await window.electronAPI.installSteamGame(game.appId, installPath);
      
      await window.electronAPI.showNotification({
        title: 'Game Installation',
        body: `Started installing ${game.name}`
      });
      
      loadActiveInstalls();
      loadGameLibrary();
    } catch (err) {
      setError(`Failed to install ${game.name}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cancelInstallation = async (appId) => {
    try {
      await window.electronAPI.cancelInstallation(appId);
      loadActiveInstalls();
    } catch (err) {
      setError(`Failed to cancel installation: ${err.message}`);
    }
  };

  const uninstallGame = async (game) => {
    try {
      if (window.confirm(`Are you sure you want to uninstall ${game.name}?`)) {
        await window.electronAPI.uninstallSteamGame(game.id);
        loadGameLibrary();
        
        await window.electronAPI.showNotification({
          title: 'Game Uninstalled',
          body: `${game.name} has been uninstalled`
        });
      }
    } catch (err) {
      setError(`Failed to uninstall ${game.name}: ${err.message}`);
    }
  };

  const updateGame = async (game) => {
    try {
      await window.electronAPI.updateSteamGame(game.id);
      
      await window.electronAPI.showNotification({
        title: 'Game Update',
        body: `Started updating ${game.name}`
      });
      
      loadActiveInstalls();
    } catch (err) {
      setError(`Failed to update ${game.name}: ${err.message}`);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'downloading': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'cancelled': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="steam-manager">
      <div className="steam-header">
        <h2>🚂 Steam Integration</h2>
        <div className="steam-status">
          {steamHealth && (
            <div className={`status-indicator ${steamHealth.healthy ? 'healthy' : 'unhealthy'}`}>
              <span className="status-dot"></span>
              <span>{steamHealth.healthy ? 'SteamCMD Ready' : 'SteamCMD Not Available'}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {!steamHealth?.healthy && (
        <div className="steam-setup">
          <div className="setup-card">
            <h3>Setup SteamCMD</h3>
            <p>SteamCMD is required to automatically download and install game servers.</p>
            
            <div className="setup-actions">
              <button 
                className="btn btn-primary"
                onClick={configureSteam}
                disabled={loading}
              >
                {loading ? 'Configuring...' : 'Configure SteamCMD'}
              </button>
            </div>
            
            <div className="setup-help">
              <h4>Setup Instructions:</h4>
              <ol>
                <li>Create a folder for SteamCMD (e.g., C:\SteamCMD)</li>
                <li>Click "Configure SteamCMD" and select that folder</li>
                <li>HomeHost will automatically download and setup SteamCMD</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {steamHealth?.healthy && (
        <>
          {/* Active Downloads */}
          {activeInstalls.length > 0 && (
            <div className="active-downloads">
              <h3>📥 Active Downloads</h3>
              <div className="downloads-list">
                {activeInstalls.map((install, index) => (
                  <div key={index} className="download-item">
                    <div className="download-info">
                      <span className="download-name">App ID: {install.appId}</span>
                      <span className="download-path">{install.installPath}</span>
                    </div>
                    <div className="download-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${install.progress || 0}%`,
                            backgroundColor: getStatusColor(install.status)
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {install.progress || 0}% - {install.status}
                      </span>
                    </div>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => cancelInstallation(install.appId)}
                    >
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Library */}
          <div className="game-library">
            <h3>🎮 Game Library</h3>
            <div className="games-grid">
              {gameLibrary.map((game) => (
                <div key={game.id} className="game-item">
                  <div className="game-header">
                    <h4>{game.name}</h4>
                    <span className="game-id">App ID: {game.appId}</span>
                  </div>
                  
                  <div className="game-status">
                    <span className={`status-badge ${game.isInstalled ? 'installed' : 'not-installed'}`}>
                      {game.isInstalled ? '✅ Installed' : '⬇️ Not Installed'}
                    </span>
                  </div>

                  {game.isInstalled && (
                    <div className="game-details">
                      <div className="detail-item">
                        <span>Path: {game.installPath}</span>
                      </div>
                      {game.size && (
                        <div className="detail-item">
                          <span>Size: {formatBytes(game.size)}</span>
                        </div>
                      )}
                      {game.lastUpdated && (
                        <div className="detail-item">
                          <span>Updated: {new Date(game.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="game-actions">
                    {!game.isInstalled ? (
                      <button 
                        className="btn btn-primary"
                        onClick={() => installGame(game)}
                        disabled={loading}
                      >
                        Install
                      </button>
                    ) : (
                      <>
                        <button 
                          className="btn btn-secondary"
                          onClick={() => updateGame(game)}
                          disabled={loading}
                        >
                          Update
                        </button>
                        <button 
                          className="btn btn-danger"
                          onClick={() => uninstallGame(game)}
                          disabled={loading}
                        >
                          Uninstall
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Steam Information */}
          <div className="steam-info">
            <h3>ℹ️ Steam Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">SteamCMD Path:</span>
                <span className="info-value">{steamHealth.steamCmdPath}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value">{steamHealth.healthy ? 'Healthy' : 'Unhealthy'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Installed Games:</span>
                <span className="info-value">{gameLibrary.filter(g => g.isInstalled).length}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Available Games:</span>
                <span className="info-value">{gameLibrary.length}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SteamManager;