import React, { useState, useEffect, useCallback } from 'react';
import './PluginMarketplace.css';

/**
 * PluginMarketplace Component - Epic 3: Plugin Ecosystem Foundation
 * 
 * App store-style plugin marketplace for the HomeHost desktop application.
 * Provides interfaces for browsing, installing, and managing plugins with
 * one-click installation, security validation, and automatic updates.
 */
const PluginMarketplace = () => {
  const [installedPlugins, setInstalledPlugins] = useState([]);
  const [availablePlugins, setAvailablePlugins] = useState([]);
  const [runningPlugins, setRunningPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState(null);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [installing, setInstalling] = useState(new Set());

  // Plugin categories
  const categories = [
    { id: 'all', name: 'All Plugins', icon: '🔌', count: 0 },
    { id: 'quality-of-life', name: 'Quality of Life', icon: '✨', count: 0, targetUser: 'alex' },
    { id: 'admin-tools', name: 'Admin Tools', icon: '🛠️', count: 0, targetUser: 'sam' },
    { id: 'community-features', name: 'Community', icon: '👥', count: 0, targetUser: 'both' },
    { id: 'security', name: 'Security', icon: '🔒', count: 0, targetUser: 'sam' },
    { id: 'monetization', name: 'Monetization', icon: '💰', count: 0, targetUser: 'sam' },
    { id: 'game-specific', name: 'Game Specific', icon: '🎮', count: 0, targetUser: 'both' }
  ];

  // Initialize component
  useEffect(() => {
    initializePluginMarketplace();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const handlers = {
      'plugin-installed': handlePluginInstalled,
      'plugin-uninstalled': handlePluginUninstalled,
      'plugin-started': handlePluginStarted,
      'plugin-stopped': handlePluginStopped,
      'plugin-update-available': handlePluginUpdateAvailable,
      'plugin-log': handlePluginLog
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

      // Load installed plugins
      const installed = await window.electronAPI.invoke('plugin-manager:get-installed');
      setInstalledPlugins(installed || []);

      // Load available plugins from marketplace
      const available = await window.electronAPI.invoke('plugin-manager:get-available');
      setAvailablePlugins(available || []);

      // Load running plugins
      const running = await window.electronAPI.invoke('plugin-manager:get-running');
      setRunningPlugins(running || []);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize plugin marketplace:', error);
      setIsLoading(false);
    }
  };

  const handlePluginInstalled = useCallback((data) => {
    setInstalledPlugins(prev => {
      const updated = [...prev];
      const index = updated.findIndex(p => p.id === data.pluginId);
      if (index >= 0) {
        updated[index] = data.installation;
      } else {
        updated.push(data.installation);
      }
      return updated;
    });
    setInstalling(prev => {
      const updated = new Set(prev);
      updated.delete(data.pluginId);
      return updated;
    });
  }, []);

  const handlePluginUninstalled = useCallback((data) => {
    setInstalledPlugins(prev => prev.filter(p => p.id !== data.pluginId));
    setRunningPlugins(prev => prev.filter(p => p.id !== data.pluginId));
  }, []);

  const handlePluginStarted = useCallback((data) => {
    setRunningPlugins(prev => {
      if (prev.find(p => p.id === data.pluginId)) return prev;
      return [...prev, data.plugin];
    });
  }, []);

  const handlePluginStopped = useCallback((data) => {
    setRunningPlugins(prev => prev.filter(p => p.id !== data.pluginId));
  }, []);

  const handlePluginUpdateAvailable = useCallback((data) => {
    console.log(`Update available for plugin: ${data.pluginId}`);
    // Handle update notification
  }, []);

  const handlePluginLog = useCallback((data) => {
    console.log(`[${data.pluginId}] ${data.level}: ${data.message}`);
  }, []);

  // Plugin Actions
  const installPlugin = async (pluginId, serverId = null) => {
    try {
      setInstalling(prev => new Set(prev).add(pluginId));
      
      await window.electronAPI.invoke('plugin-manager:install', { pluginId, serverId });
      
      // Refresh data
      await initializePluginMarketplace();
    } catch (error) {
      console.error('Failed to install plugin:', error);
      alert('Failed to install plugin: ' + error.message);
      setInstalling(prev => {
        const updated = new Set(prev);
        updated.delete(pluginId);
        return updated;
      });
    }
  };

  const uninstallPlugin = async (pluginId) => {
    try {
      if (!confirm('Are you sure you want to uninstall this plugin? This action cannot be undone.')) {
        return;
      }

      await window.electronAPI.invoke('plugin-manager:uninstall', { pluginId });
      
      // Refresh data
      await initializePluginMarketplace();
    } catch (error) {
      console.error('Failed to uninstall plugin:', error);
      alert('Failed to uninstall plugin: ' + error.message);
    }
  };

  const startPlugin = async (pluginId) => {
    try {
      await window.electronAPI.invoke('plugin-manager:start', { pluginId });
    } catch (error) {
      console.error('Failed to start plugin:', error);
      alert('Failed to start plugin: ' + error.message);
    }
  };

  const stopPlugin = async (pluginId) => {
    try {
      await window.electronAPI.invoke('plugin-manager:stop', { pluginId });
    } catch (error) {
      console.error('Failed to stop plugin:', error);
      alert('Failed to stop plugin: ' + error.message);
    }
  };

  // Filtering and Search
  const filteredPlugins = React.useMemo(() => {
    let plugins = activeTab === 'installed' ? installedPlugins : availablePlugins;

    // Apply search filter
    if (searchTerm) {
      plugins = plugins.filter(plugin =>
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.features?.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      plugins = plugins.filter(plugin => plugin.category === categoryFilter);
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      plugins = plugins.filter(plugin => {
        if (priceFilter === 'free') return plugin.price?.type === 'free';
        if (priceFilter === 'paid') return plugin.price?.type === 'paid';
        if (priceFilter === 'freemium') return plugin.price?.type === 'freemium';
        return true;
      });
    }

    return plugins;
  }, [activeTab, installedPlugins, availablePlugins, searchTerm, categoryFilter, priceFilter]);

  // Update category counts
  const categoriesWithCounts = React.useMemo(() => {
    return categories.map(category => ({
      ...category,
      count: category.id === 'all' 
        ? availablePlugins.length
        : availablePlugins.filter(p => p.category === category.id).length
    }));
  }, [availablePlugins]);

  // Utility Functions
  const isPluginInstalled = (pluginId) => {
    return installedPlugins.some(p => p.id === pluginId);
  };

  const isPluginRunning = (pluginId) => {
    return runningPlugins.some(p => p.id === pluginId);
  };

  const getPluginStatus = (plugin) => {
    if (installing.has(plugin.id)) return 'installing';
    if (isPluginRunning(plugin.id)) return 'running';
    if (isPluginInstalled(plugin.id)) return 'installed';
    return 'not-installed';
  };

  const formatPrice = (price) => {
    if (!price || price.type === 'free') return 'Free';
    if (price.type === 'freemium') return 'Freemium';
    return `$${price.amount}`;
  };

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : '🔌';
  };

  if (isLoading) {
    return (
      <div className="plugin-loading">
        <div className="loading-spinner"></div>
        <p>Loading Plugin Marketplace...</p>
      </div>
    );
  }

  return (
    <div className="plugin-marketplace">
      {/* Header */}
      <div className="plugin-header">
        <div className="header-title">
          <h1>🔌 Plugin Marketplace</h1>
          <p>Extend HomeHost with powerful plugins and tools</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{installedPlugins.length}</span>
            <span className="stat-label">Installed</span>
          </div>
          <div className="stat">
            <span className="stat-number">{runningPlugins.length}</span>
            <span className="stat-label">Running</span>
          </div>
          <div className="stat">
            <span className="stat-number">{availablePlugins.length}</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="plugin-tabs">
        <button 
          className={`tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('marketplace')}
        >
          🏪 Marketplace
        </button>
        <button 
          className={`tab ${activeTab === 'installed' ? 'active' : ''}`}
          onClick={() => setActiveTab('installed')}
        >
          📦 Installed ({installedPlugins.length})
        </button>
        <button 
          className={`tab ${activeTab === 'running' ? 'active' : ''}`}
          onClick={() => setActiveTab('running')}
        >
          ⚡ Running ({runningPlugins.length})
        </button>
        <button 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          📂 Categories
        </button>
      </div>

      <div className="plugin-content">
        {/* Search and Filters */}
        <div className="plugin-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              {categoriesWithCounts.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name} ({category.count})
                </option>
              ))}
            </select>
            
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="freemium">Freemium</option>
            </select>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'categories' ? (
          // Categories View
          <div className="categories-grid">
            {categoriesWithCounts.slice(1).map(category => (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => {
                  setCategoryFilter(category.id);
                  setActiveTab('marketplace');
                }}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.count} plugins available</p>
                  <div className="category-target">
                    {category.targetUser === 'alex' && <span className="user-badge alex">👤 Casual Users</span>}
                    {category.targetUser === 'sam' && <span className="user-badge sam">👑 Power Users</span>}
                    {category.targetUser === 'both' && <span className="user-badge both">👥 All Users</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Plugin Grid
          <div className="plugins-grid">
            {filteredPlugins.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔌</div>
                <h3>No plugins found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredPlugins.map(plugin => (
                <div key={plugin.id} className="plugin-card">
                  <div className="plugin-header">
                    <div className="plugin-icon">
                      {getCategoryIcon(plugin.category)}
                    </div>
                    <div className="plugin-info">
                      <h3>{plugin.name}</h3>
                      <p className="plugin-tagline">
                        {plugin.tagline || plugin.description}
                      </p>
                      <div className="plugin-meta">
                        <span className="developer">
                          {plugin.developer?.name || plugin.developer || 'Unknown'}
                          {plugin.developer?.verified && <span className="verified">✓</span>}
                        </span>
                        <span className="version">v{plugin.version}</span>
                      </div>
                    </div>
                    <div className="plugin-price">
                      {formatPrice(plugin.price)}
                    </div>
                  </div>

                  <div className="plugin-details">
                    {plugin.features && plugin.features.length > 0 && (
                      <div className="plugin-features">
                        {plugin.features.slice(0, 3).map((feature, index) => (
                          <span key={index} className="feature-tag">{feature}</span>
                        ))}
                        {plugin.features.length > 3 && (
                          <span className="feature-more">+{plugin.features.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="plugin-stats">
                      {plugin.rating && (
                        <div className="stat">
                          <span className="stat-icon">⭐</span>
                          <span>{plugin.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {plugin.downloadCount && (
                        <div className="stat">
                          <span className="stat-icon">📥</span>
                          <span>{plugin.downloadCount.toLocaleString()}</span>
                        </div>
                      )}
                      {plugin.supportedGames && (
                        <div className="stat">
                          <span className="stat-icon">🎮</span>
                          <span>
                            {plugin.supportedGames.includes('*') 
                              ? 'All Games' 
                              : `${plugin.supportedGames.length} games`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="plugin-actions">
                    {(() => {
                      const status = getPluginStatus(plugin);
                      
                      switch (status) {
                        case 'installing':
                          return (
                            <button className="action-btn installing" disabled>
                              <div className="spinner"></div>
                              Installing...
                            </button>
                          );
                        
                        case 'running':
                          return (
                            <div className="action-group">
                              <button 
                                className="action-btn stop"
                                onClick={() => stopPlugin(plugin.id)}
                              >
                                ⏹️ Stop
                              </button>
                              <button 
                                className="action-btn uninstall"
                                onClick={() => uninstallPlugin(plugin.id)}
                              >
                                🗑️ Uninstall
                              </button>
                            </div>
                          );
                        
                        case 'installed':
                          return (
                            <div className="action-group">
                              <button 
                                className="action-btn start"
                                onClick={() => startPlugin(plugin.id)}
                              >
                                ▶️ Start
                              </button>
                              <button 
                                className="action-btn uninstall"
                                onClick={() => uninstallPlugin(plugin.id)}
                              >
                                🗑️ Uninstall
                              </button>
                            </div>
                          );
                        
                        default:
                          return (
                            <button 
                              className="action-btn install"
                              onClick={() => installPlugin(plugin.id)}
                            >
                              📦 Install
                            </button>
                          );
                      }
                    })()}

                    <button 
                      className="action-btn details"
                      onClick={() => setSelectedPlugin(plugin)}
                    >
                      ℹ️ Details
                    </button>
                  </div>

                  {plugin.isFeatured && <div className="featured-badge">⭐ Featured</div>}
                  {plugin.isNew && <div className="new-badge">🆕 New</div>}
                  {plugin.isBuiltIn && <div className="builtin-badge">🏠 Built-in</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Plugin Details Modal */}
      {selectedPlugin && (
        <div className="modal-overlay">
          <div className="modal plugin-details-modal">
            <div className="modal-header">
              <div className="plugin-title">
                <span className="plugin-icon">{getCategoryIcon(selectedPlugin.category)}</span>
                <div>
                  <h2>{selectedPlugin.name}</h2>
                  <p>by {selectedPlugin.developer?.name || selectedPlugin.developer}</p>
                </div>
              </div>
              <button 
                className="close-btn"
                onClick={() => setSelectedPlugin(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="plugin-overview">
                <div className="overview-stats">
                  <div className="stat-item">
                    <span className="stat-label">Version</span>
                    <span className="stat-value">v{selectedPlugin.version}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Category</span>
                    <span className="stat-value">
                      {categories.find(c => c.id === selectedPlugin.category)?.name || selectedPlugin.category}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Price</span>
                    <span className="stat-value">{formatPrice(selectedPlugin.price)}</span>
                  </div>
                  {selectedPlugin.rating && (
                    <div className="stat-item">
                      <span className="stat-label">Rating</span>
                      <span className="stat-value">⭐ {selectedPlugin.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="plugin-description">
                  <h3>Description</h3>
                  <p>{selectedPlugin.description}</p>
                </div>

                {selectedPlugin.features && selectedPlugin.features.length > 0 && (
                  <div className="plugin-features-full">
                    <h3>Features</h3>
                    <ul>
                      {selectedPlugin.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedPlugin.supportedGames && (
                  <div className="supported-games">
                    <h3>Supported Games</h3>
                    <div className="games-list">
                      {selectedPlugin.supportedGames.includes('*') ? (
                        <span className="game-tag all-games">All Games</span>
                      ) : (
                        selectedPlugin.supportedGames.map((game, index) => (
                          <span key={index} className="game-tag">{game}</span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedPlugin(null)}
              >
                Close
              </button>
              {!isPluginInstalled(selectedPlugin.id) && (
                <button 
                  className="install-btn"
                  onClick={() => {
                    installPlugin(selectedPlugin.id);
                    setSelectedPlugin(null);
                  }}
                  disabled={installing.has(selectedPlugin.id)}
                >
                  {installing.has(selectedPlugin.id) ? 'Installing...' : '📦 Install Plugin'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PluginMarketplace;