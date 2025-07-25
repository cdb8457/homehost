'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Server,
  AlertTriangle,
  CheckCircle,
  Star,
  Download,
  Activity,
  PieChart,
  BarChart3,
  Globe,
  Shield,
  DollarSign,
  Target,
  Clock,
  Zap,
  Settings,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Award,
  Gauge,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';

interface EcosystemStats {
  totalPlugins: number;
  activePlugins: number;
  totalServers: number;
  serversWithPlugins: number;
  totalInstallations: number;
  averagePluginsPerServer: number;
  healthyPlugins: number;
  pluginsWithIssues: number;
  totalDownloads: number;
  popularPlugins: Array<{
    id: string;
    name: string;
    installations: number;
    rating: number;
    category: string;
    icon?: string;
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  serverBreakdown: Array<{
    serverId: string;
    serverName: string;
    pluginCount: number;
    activePlugins: number;
    healthScore: number;
    issues: number;
  }>;
  trends: {
    installationsToday: number;
    installationsWeek: number;
    installationsMonth: number;
    newPluginsWeek: number;
    updatedPluginsWeek: number;
  };
  performance: {
    averageCpuUsage: number;
    averageMemoryUsage: number;
    averageUptime: number;
    totalErrors: number;
    averageResponseTime: number;
  };
}

interface PluginEcosystemOverviewProps {
  refreshInterval?: number;
}

export default function PluginEcosystemOverview({ 
  refreshInterval = 30000 
}: PluginEcosystemOverviewProps) {
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const apiClient = new ApiClient();

  useEffect(() => {
    loadEcosystemStats();
    
    const interval = setInterval(loadEcosystemStats, refreshInterval);
    return () => clearInterval(interval);
  }, [timeRange, refreshInterval]);

  const loadEcosystemStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Since we don't have real endpoints, we'll simulate the data
      const mockStats = generateMockEcosystemStats();
      setStats(mockStats);
    } catch (err) {
      setError('Failed to load ecosystem statistics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockEcosystemStats = (): EcosystemStats => ({
    totalPlugins: 24,
    activePlugins: 18,
    totalServers: 5,
    serversWithPlugins: 3,
    totalInstallations: 42,
    averagePluginsPerServer: 8.4,
    healthyPlugins: 15,
    pluginsWithIssues: 3,
    totalDownloads: 125420,
    popularPlugins: [
      { id: '1', name: 'AutoBackup Pro', installations: 15, rating: 4.8, category: 'Administration', icon: '🔄' },
      { id: '5', name: 'Performance Monitor', installations: 12, rating: 4.6, category: 'Monitoring', icon: '📊' },
      { id: '3', name: 'Anti-Griefing Shield', installations: 8, rating: 4.7, category: 'Security', icon: '🛡️' },
      { id: '2', name: 'Economy Manager', installations: 7, rating: 4.5, category: 'Economy', icon: '💰' },
      { id: '4', name: 'PvP Arena', installations: 6, rating: 4.4, category: 'PvP', icon: '⚔️' }
    ],
    categoryBreakdown: [
      { category: 'Administration', count: 8, percentage: 33.3 },
      { category: 'Monitoring', count: 5, percentage: 20.8 },
      { category: 'Security', count: 4, percentage: 16.7 },
      { category: 'Economy', count: 3, percentage: 12.5 },
      { category: 'PvP', count: 2, percentage: 8.3 },
      { category: 'Other', count: 2, percentage: 8.3 }
    ],
    serverBreakdown: [
      { serverId: '1', serverName: 'Test Valheim Server', pluginCount: 12, activePlugins: 10, healthScore: 92, issues: 1 },
      { serverId: '2', serverName: 'Minecraft Server', pluginCount: 8, activePlugins: 6, healthScore: 88, issues: 2 },
      { serverId: '3', serverName: 'Rust Server', pluginCount: 15, activePlugins: 12, healthScore: 85, issues: 3 },
      { serverId: '4', serverName: 'CS2 Server', pluginCount: 5, activePlugins: 5, healthScore: 96, issues: 0 },
      { serverId: '5', serverName: 'Terraria Server', pluginCount: 2, activePlugins: 2, healthScore: 100, issues: 0 }
    ],
    trends: {
      installationsToday: 8,
      installationsWeek: 34,
      installationsMonth: 142,
      newPluginsWeek: 3,
      updatedPluginsWeek: 7
    },
    performance: {
      averageCpuUsage: 12.5,
      averageMemoryUsage: 156.8,
      averageUptime: 97.2,
      totalErrors: 23,
      averageResponseTime: 85.6
    }
  });

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-900';
    if (score >= 70) return 'bg-yellow-900';
    return 'bg-red-900';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'administration': return <Shield className="w-4 h-4" />;
      case 'economy': return <DollarSign className="w-4 h-4" />;
      case 'pvp': return <Target className="w-4 h-4" />;
      case 'monitoring': return <Activity className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading ecosystem overview..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to load ecosystem overview</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={loadEcosystemStats}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Plugin Ecosystem Overview</h1>
          <p className="text-gray-400">Comprehensive insights across all servers and plugins</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <button
            onClick={loadEcosystemStats}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Total Plugins</h3>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalPlugins}</p>
          <p className="text-xs text-gray-500">{stats.activePlugins} active</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Total Installations</h3>
            <Download className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.totalInstallations}</p>
          <p className="text-xs text-gray-500">Across {stats.serversWithPlugins} servers</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Health Score</h3>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {Math.round((stats.healthyPlugins / stats.totalPlugins) * 100)}%
          </p>
          <p className="text-xs text-gray-500">{stats.healthyPlugins} healthy plugins</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Avg Performance</h3>
            <Gauge className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.performance.averageUptime.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">Average uptime</p>
        </div>
      </div>

      {/* Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Installation Trends
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Today</span>
              <span className="text-white font-semibold">{stats.trends.installationsToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">This Week</span>
              <span className="text-white font-semibold">{stats.trends.installationsWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">This Month</span>
              <span className="text-white font-semibold">{stats.trends.installationsMonth}</span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">New Plugins (Week)</span>
                <span className="text-green-400 font-semibold">{stats.trends.newPluginsWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Updated Plugins (Week)</span>
                <span className="text-blue-400 font-semibold">{stats.trends.updatedPluginsWeek}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Average CPU Usage</span>
              </div>
              <span className="text-white font-semibold">{stats.performance.averageCpuUsage.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Average Memory</span>
              </div>
              <span className="text-white font-semibold">{stats.performance.averageMemoryUsage.toFixed(1)}MB</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Response Time</span>
              </div>
              <span className="text-white font-semibold">{stats.performance.averageResponseTime.toFixed(0)}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-gray-300">Total Errors</span>
              </div>
              <span className="text-red-400 font-semibold">{stats.performance.totalErrors}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Plugins */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Most Popular Plugins
        </h3>
        <div className="space-y-3">
          {stats.popularPlugins.map((plugin, index) => (
            <div key={plugin.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-sm">
                  {plugin.icon || '🔌'}
                </div>
                <div>
                  <h4 className="font-medium text-white">{plugin.name}</h4>
                  <p className="text-sm text-gray-400">{plugin.category}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{plugin.installations}</span>
                  <span className="text-gray-400 text-sm">installations</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500" />
                  <span className="text-sm text-gray-300">{plugin.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" />
            Plugin Categories
          </h3>
          <div className="space-y-3">
            {stats.categoryBreakdown.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category.category)}
                  <span className="text-gray-300">{category.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{category.count}</span>
                  <span className="text-gray-400 text-sm">({category.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            Server Breakdown
          </h3>
          <div className="space-y-3">
            {stats.serverBreakdown.map((server) => (
              <div key={server.serverId} className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{server.serverName}</h4>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getHealthBgColor(server.healthScore)}`}>
                    <span className={getHealthColor(server.healthScore)}>
                      {server.healthScore}% Health
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-white font-semibold">{server.pluginCount}</div>
                    <div className="text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold">{server.activePlugins}</div>
                    <div className="text-gray-400">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-400 font-semibold">{server.issues}</div>
                    <div className="text-gray-400">Issues</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <Package className="w-5 h-5 text-white" />
            <div className="text-left">
              <div className="font-medium text-white">Browse Marketplace</div>
              <div className="text-sm text-blue-100">Discover new plugins</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-white" />
            <div className="text-left">
              <div className="font-medium text-white">Bulk Management</div>
              <div className="text-sm text-green-100">Manage multiple plugins</div>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
            <BarChart3 className="w-5 h-5 text-white" />
            <div className="text-left">
              <div className="font-medium text-white">Analytics</div>
              <div className="text-sm text-purple-100">Detailed insights</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}