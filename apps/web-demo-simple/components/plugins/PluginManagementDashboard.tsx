'use client';

import { useState, useEffect } from 'react';
import { pluginManagementApi, InstalledPlugin, PluginHealth } from '@/lib/api/plugin-management';
import { LoadingSpinner } from '../LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary';
import PluginConfigurationModal from './PluginConfigurationModal';
import PluginInstallationProgress from './PluginInstallationProgress';
import PluginUpdateNotifications from './PluginUpdateNotifications';
import PluginLogViewer, { PluginLogSummary } from './PluginLogViewer';
import {
  Settings,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Activity,
  Clock,
  Cpu,
  HardDrive,
  BarChart3,
  Zap,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  Download,
  Upload,
  Power,
  Shield,
  DollarSign,
  Target,
  Users,
  Package,
  Star,
  Loader2,
  Eye,
  AlertCircle,
  TrendingUp,
  XCircle,
  X
} from 'lucide-react';

interface PluginManagementDashboardProps {
  serverId: string;
  serverName?: string;
}

interface PluginWithHealth extends InstalledPlugin {
  health?: PluginHealth | null;
  loading?: boolean;
  error?: string | null;
}

export default function PluginManagementDashboard({ 
  serverId, 
  serverName = 'Server' 
}: PluginManagementDashboardProps) {
  const [plugins, setPlugins] = useState<PluginWithHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlugins, setSelectedPlugins] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<Set<string>>(new Set());
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [selectedPluginForConfig, setSelectedPluginForConfig] = useState<PluginWithHealth | null>(null);
  const [logViewerOpen, setLogViewerOpen] = useState(false);
  const [selectedPluginForLogs, setSelectedPluginForLogs] = useState<PluginWithHealth | null>(null);

  const loadPluginsAndHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get installed plugins
      const pluginsResponse = await pluginManagementApi.getInstalledPlugins(serverId);
      
      if (!pluginsResponse.success || !pluginsResponse.data) {
        setError(pluginsResponse.error?.message || 'Failed to load plugins');
        return;
      }

      const installedPlugins = pluginsResponse.data.plugins;
      setPlugins(installedPlugins.map(plugin => ({ ...plugin, loading: true })));

      // Load health data for each plugin
      const healthPromises = installedPlugins.map(async (plugin) => {
        try {
          const healthResponse = await pluginManagementApi.getPluginStatus(serverId, plugin.id);
          return {
            pluginId: plugin.id,
            health: healthResponse.success ? healthResponse.data?.health : null,
            error: healthResponse.success ? null : healthResponse.error?.message
          };
        } catch (err) {
          return {
            pluginId: plugin.id,
            health: null,
            error: 'Failed to load health data'
          };
        }
      });

      const healthResults = await Promise.allSettled(healthPromises);
      
      // Update plugins with health data
      setPlugins(installedPlugins.map((plugin, index) => {
        const healthResult = healthResults[index];
        const healthData = healthResult.status === 'fulfilled' ? healthResult.value : null;
        
        return {
          ...plugin,
          health: healthData?.health || null,
          loading: false,
          error: healthData?.error || null
        };
      }));
      
    } catch (err) {
      setError('Failed to load plugin management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPluginsAndHealth();
  }, [serverId]);

  const handleTogglePlugin = async (pluginId: string) => {
    try {
      setActionLoading(prev => new Set(prev).add(pluginId));
      
      const response = await pluginManagementApi.togglePlugin(serverId, pluginId);
      
      if (response.success) {
        // Update local state
        setPlugins(prev => prev.map(plugin => 
          plugin.id === pluginId 
            ? { 
                ...plugin, 
                configuration: { 
                  ...plugin.configuration!, 
                  enabled: response.data!.configuration.enabled 
                } 
              }
            : plugin
        ));
        
        // Refresh health data for this plugin
        const healthResponse = await pluginManagementApi.getPluginStatus(serverId, pluginId);
        if (healthResponse.success) {
          setPlugins(prev => prev.map(plugin =>
            plugin.id === pluginId
              ? { ...plugin, health: healthResponse.data?.health }
              : plugin
          ));
        }
      }
    } catch (err) {
      alert('Failed to toggle plugin. Please try again.');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginId);
        return newSet;
      });
    }
  };

  const handleUninstallPlugin = async (pluginId: string) => {
    if (!confirm('Are you sure you want to uninstall this plugin?')) return;
    
    try {
      setActionLoading(prev => new Set(prev).add(pluginId));
      
      const response = await pluginManagementApi.uninstallPlugin(serverId, pluginId);
      
      if (response.success) {
        setPlugins(prev => prev.filter(plugin => plugin.id !== pluginId));
        alert('Plugin uninstalled successfully');
      }
    } catch (err) {
      alert('Failed to uninstall plugin. Please try again.');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginId);
        return newSet;
      });
    }
  };

  const handleBulkAction = async (action: 'enable' | 'disable' | 'uninstall') => {
    const selectedIds = Array.from(selectedPlugins);
    
    if (selectedIds.length === 0) {
      alert('Please select plugins first');
      return;
    }

    if (action === 'uninstall' && !confirm(`Are you sure you want to uninstall ${selectedIds.length} plugins?`)) {
      return;
    }

    try {
      selectedIds.forEach(id => {
        setActionLoading(prev => new Set(prev).add(id));
      });

      if (action === 'uninstall') {
        await pluginManagementApi.bulkUninstallPlugins(serverId, selectedIds);
        setPlugins(prev => prev.filter(plugin => !selectedIds.includes(plugin.id)));
      } else {
        await pluginManagementApi.bulkTogglePlugins(serverId, selectedIds, action === 'enable');
        setPlugins(prev => prev.map(plugin => 
          selectedIds.includes(plugin.id)
            ? { 
                ...plugin, 
                configuration: { 
                  ...plugin.configuration!, 
                  enabled: action === 'enable' 
                } 
              }
            : plugin
        ));
      }
      
      setSelectedPlugins(new Set());
      alert(`Bulk ${action} completed successfully`);
    } catch (err) {
      alert(`Failed to ${action} plugins. Please try again.`);
    } finally {
      selectedIds.forEach(id => {
        setActionLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      });
    }
  };

  const handleConfigurePlugin = (plugin: PluginWithHealth) => {
    setSelectedPluginForConfig(plugin);
    setConfigModalOpen(true);
  };

  const handleConfigurationUpdated = (config: any) => {
    setPlugins(prev => prev.map(plugin =>
      plugin.id === selectedPluginForConfig?.id
        ? { ...plugin, configuration: config }
        : plugin
    ));
  };

  const handleInstallationComplete = (pluginId: string, serverIdParam: string) => {
    if (serverIdParam === serverId) {
      // Refresh plugin list to include the newly installed plugin
      loadPluginsAndHealth();
    }
  };

  const handleViewLogs = (plugin: PluginWithHealth) => {
    setSelectedPluginForLogs(plugin);
    setLogViewerOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'administration': return <Shield className="w-4 h-4" />;
      case 'economy': return <DollarSign className="w-4 h-4" />;
      case 'pvp': return <Target className="w-4 h-4" />;
      case 'moderation': return <Users className="w-4 h-4" />;
      case 'monitoring': return <Activity className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (health: PluginHealth | null | undefined, enabled: boolean) => {
    if (!enabled) return <Pause className="w-4 h-4 text-gray-500" />;
    if (!health) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    
    switch (health.status) {
      case 'running': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'stopped': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Filter plugins
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = !searchTerm || 
      plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      plugin.category.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(plugins.map(p => p.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading plugin management..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to load plugin management</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadPluginsAndHealth}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Real-time Installation Progress */}
        <PluginInstallationProgress 
          serverId={serverId} 
          onInstallationComplete={handleInstallationComplete}
        />
        
        {/* Plugin Update Notifications */}
        <PluginUpdateNotifications serverId={serverId} />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Plugin Management</h1>
            <p className="text-gray-400">Manage plugins for {serverName}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={loadPluginsAndHealth}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">{plugins.length}</p>
                <p className="text-gray-400 text-sm">Total Plugins</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {plugins.filter(p => p.configuration?.enabled && p.health?.status === 'running').length}
                </p>
                <p className="text-gray-400 text-sm">Running</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {plugins.filter(p => p.health?.errorCount > 0).length}
                </p>
                <p className="text-gray-400 text-sm">With Errors</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {plugins.filter(p => p.health?.performance && parseFloat(p.health.performance) > 80).length}
                </p>
                <p className="text-gray-400 text-sm">High Performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search plugins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedPlugins.size > 0 && (
          <div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg">
            <span className="text-white">{selectedPlugins.size} plugins selected</span>
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => handleBulkAction('enable')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={() => handleBulkAction('disable')}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
              >
                Disable All
              </button>
              <button
                onClick={() => handleBulkAction('uninstall')}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
              >
                Uninstall All
              </button>
            </div>
          </div>
        )}

        {/* Plugin List */}
        <div className="space-y-4">
          {filteredPlugins.map((plugin) => (
            <div key={plugin.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selectedPlugins.has(plugin.id)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedPlugins);
                    if (e.target.checked) {
                      newSelected.add(plugin.id);
                    } else {
                      newSelected.delete(plugin.id);
                    }
                    setSelectedPlugins(newSelected);
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                  {plugin.icon || '🔌'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{plugin.name}</h3>
                        {getStatusIcon(plugin.health, plugin.configuration?.enabled || false)}
                        {plugin.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      </div>
                      <p className="text-gray-400 text-sm">by {plugin.author} • v{plugin.version}</p>
                      <p className="text-gray-300 mt-1">{plugin.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConfigurePlugin(plugin)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                      
                      <PluginLogSummary
                        serverId={serverId}
                        pluginId={plugin.id}
                        onViewLogs={() => handleViewLogs(plugin)}
                      />
                      
                      <button
                        onClick={() => handleTogglePlugin(plugin.id)}
                        disabled={actionLoading.has(plugin.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                          plugin.configuration?.enabled
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {actionLoading.has(plugin.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : plugin.configuration?.enabled ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        {plugin.configuration?.enabled ? 'Disable' : 'Enable'}
                      </button>
                      
                      <button
                        onClick={() => handleUninstallPlugin(plugin.id)}
                        disabled={actionLoading.has(plugin.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading.has(plugin.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Uninstall
                      </button>
                    </div>
                  </div>
                  
                  {/* Health Metrics */}
                  {plugin.health && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          Uptime: {formatUptime(plugin.health.uptime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          CPU: {plugin.health.cpuUsage}%
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          Memory: {plugin.health.memoryUsage}MB
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          Performance: {plugin.health.performance}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Error/Warning counts */}
                  {plugin.health && (plugin.health.errorCount > 0 || plugin.health.warningCount > 0) && (
                    <div className="mt-2 flex items-center gap-4">
                      {plugin.health.errorCount > 0 && (
                        <span className="flex items-center gap-1 text-red-400 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          {plugin.health.errorCount} errors
                        </span>
                      )}
                      {plugin.health.warningCount > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {plugin.health.warningCount} warnings
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Plugin tags */}
                  {plugin.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {plugin.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlugins.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No plugins found</h3>
            <p className="text-gray-500">
              {plugins.length === 0 
                ? 'No plugins are currently installed on this server'
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        )}

        {/* Plugin Configuration Modal */}
        {selectedPluginForConfig && (
          <PluginConfigurationModal
            isOpen={configModalOpen}
            onClose={() => {
              setConfigModalOpen(false);
              setSelectedPluginForConfig(null);
            }}
            serverId={serverId}
            pluginId={selectedPluginForConfig.id}
            pluginName={selectedPluginForConfig.name}
            pluginIcon={selectedPluginForConfig.icon}
            onConfigurationUpdated={handleConfigurationUpdated}
          />
        )}

        {/* Plugin Log Viewer Modal */}
        {selectedPluginForLogs && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={() => setLogViewerOpen(false)} />

              <div className="inline-block w-full max-w-4xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-lg">
                      {selectedPluginForLogs.icon || '🔌'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {selectedPluginForLogs.name} - Logs
                      </h3>
                      <p className="text-gray-400">Real-time plugin logs and debugging information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLogViewerOpen(false);
                      setSelectedPluginForLogs(null);
                    }}
                    className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <PluginLogViewer
                  serverId={serverId}
                  pluginId={selectedPluginForLogs.id}
                  pluginName={selectedPluginForLogs.name}
                  maxHeight="600px"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}