'use client';

import { useState, useEffect } from 'react';
import { ServerInstance, PlayerSession, CommunityAnalytics, ServerManagementView } from '@/types/server';
import { MOCK_SERVERS, MOCK_PLAYERS, MOCK_ANALYTICS } from '@/data/servers';
import ServerCard from '@/components/ui/ServerCard';
import { 
  Activity,
  Users, 
  Server, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Play,
  Square,
  RotateCcw,
  Database,
  Download,
  Settings,
  BarChart3,
  UserCheck,
  Shield,
  Filter,
  RefreshCw,
  Grid3X3,
  List,
  CheckSquare,
  Square as SquareIcon,
  Zap,
  Clock,
  Sparkles,
  Wifi,
  HardDrive,
  Cpu
} from 'lucide-react';

export default function ServerManagementConsole() {
  const [servers, setServers] = useState<ServerInstance[]>(MOCK_SERVERS);
  const [players, setPlayers] = useState<PlayerSession[]>(MOCK_PLAYERS);
  const [analytics, setAnalytics] = useState<CommunityAnalytics>(MOCK_ANALYTICS);
  const [view, setView] = useState<ServerManagementView>({
    selectedServers: [],
    activeTab: 'overview',
    filterOptions: {},
    refreshInterval: 30000
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // In real app, this would fetch fresh data
    }, view.refreshInterval);

    return () => clearInterval(interval);
  }, [view.refreshInterval]);

  const handleServerAction = async (serverId: string, action: string) => {
    console.log(`Executing ${action} on server ${serverId}`);
    
    setServers(prev => prev.map(server => {
      if (server.id === serverId) {
        switch (action) {
          case 'start':
            return { ...server, status: 'starting' as const };
          case 'stop':
            return { ...server, status: 'stopping' as const };
          case 'restart':
            return { ...server, status: 'starting' as const };
          case 'backup':
            return { ...server, lastBackup: new Date() };
          default:
            return server;
        }
      }
      return server;
    }));

    // Simulate action completion
    setTimeout(() => {
      setServers(prev => prev.map(server => {
        if (server.id === serverId) {
          switch (action) {
            case 'start':
            case 'restart':
              return { 
                ...server, 
                status: 'online' as const,
                lastRestart: new Date(),
                uptime: '0m'
              };
            case 'stop':
              return { 
                ...server, 
                status: 'offline' as const,
                playerCount: 0,
                uptime: '0m'
              };
            default:
              return server;
          }
        }
        return server;
      }));
    }, 3000);
  };

  const handleBulkAction = (action: string) => {
    view.selectedServers.forEach(serverId => {
      handleServerAction(serverId, action);
    });
  };

  const handleServerSelection = (serverId: string, selected: boolean) => {
    setView(prev => ({
      ...prev,
      selectedServers: selected 
        ? [...prev.selectedServers, serverId]
        : prev.selectedServers.filter(id => id !== serverId)
    }));
  };

  const toggleSelectAll = () => {
    const allSelected = view.selectedServers.length === servers.length;
    setView(prev => ({
      ...prev,
      selectedServers: allSelected ? [] : servers.map(s => s.id)
    }));
  };

  const getServerStats = () => {
    const online = servers.filter(s => s.status === 'online').length;
    const offline = servers.filter(s => s.status === 'offline').length;
    const errors = servers.filter(s => s.status === 'error').length;
    const totalPlayers = servers.reduce((sum, s) => sum + s.playerCount, 0);
    const totalAlerts = servers.reduce((sum, s) => sum + s.alerts.length, 0);
    
    return { online, offline, errors, totalPlayers, totalAlerts };
  };

  const stats = getServerStats();

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Servers</p>
              <p className="text-2xl font-bold text-gray-900">{servers.length}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Server className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-green-600">{stats.online}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Players</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalPlayers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalAlerts}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${analytics.revenue?.total.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {view.selectedServers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {view.selectedServers.length} server{view.selectedServers.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkAction('start')}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Play className="w-4 h-4" />
                Start All
              </button>
              <button
                onClick={() => handleBulkAction('restart')}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restart All
              </button>
              <button
                onClick={() => handleBulkAction('backup')}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Database className="w-4 h-4" />
                Backup All
              </button>
              <button
                onClick={() => setView(prev => ({ ...prev, selectedServers: [] }))}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Server Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Your Servers</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              {view.selectedServers.length === servers.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <SquareIcon className="w-4 h-4" />
              )}
              Select All
            </button>
            <button
              onClick={() => setLastRefresh(new Date())}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <span className="text-xs text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {servers.map((server) => (
            <ServerCard
              key={server.id}
              server={server}
              onServerAction={handleServerAction}
              onViewDetails={(id) => console.log('View details for', id)}
              isSelected={view.selectedServers.includes(server.id)}
              onSelectionChange={handleServerSelection}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlayersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Players</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Player</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Server</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Session</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Reputation</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{player.playerName}</div>
                      <div className="text-sm text-gray-500">Total: {player.totalPlaytime}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{player.serverName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">{player.sessionDuration}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      player.role === 'admin' ? 'bg-red-100 text-red-800' :
                      player.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                      player.role === 'vip' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {player.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{player.reputation}%</div>
                      <div className={`w-2 h-2 rounded-full ${
                        player.reputation >= 90 ? 'bg-green-500' :
                        player.reputation >= 70 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {player.canKick && (
                        <button className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors">
                          Kick
                        </button>
                      )}
                      {player.canBan && (
                        <button className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors">
                          Ban
                        </button>
                      )}
                      {player.canPromote && (
                        <button className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                          Promote
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Daily Active Players</p>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.activePlayersDaily}</p>
          <p className="text-sm text-green-600">+{analytics.growth.playerGrowth}% this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Retention Rate</p>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.playerRetentionRate}%</p>
          <p className="text-sm text-gray-600">30-day retention</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Average Session</p>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.averageSessionTime}</p>
          <p className="text-sm text-gray-600">Per player session</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Server Uptime</p>
            <Activity className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{analytics.averageUptime}%</p>
          <p className="text-sm text-gray-600">Average uptime</p>
        </div>
      </div>

      {analytics.revenue && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${analytics.revenue.donations.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Donations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">${analytics.revenue.vipMemberships.toFixed(2)}</p>
              <p className="text-sm text-gray-600">VIP Memberships</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">${analytics.revenue.total.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xs text-green-600">+{analytics.revenue.growth}% growth</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Server Management Console</h1>
              <p className="text-gray-600">Monitor and manage all your gaming servers from one place</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Auto-refresh: {view.refreshInterval / 1000}s
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                stats.errors > 0 ? 'bg-red-50 text-red-700' :
                stats.totalAlerts > 0 ? 'bg-yellow-50 text-yellow-700' :
                'bg-green-50 text-green-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  stats.errors > 0 ? 'bg-red-500' :
                  stats.totalAlerts > 0 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <span className="text-sm font-medium">
                  {stats.errors > 0 ? 'Issues Detected' :
                   stats.totalAlerts > 0 ? 'Alerts Active' :
                   'All Systems Normal'}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
              { id: 'players', label: 'Players', icon: <Users className="w-4 h-4" /> },
              { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'plugins', label: 'Plugins', icon: <Settings className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(prev => ({ ...prev, activeTab: tab.id as any }))}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  view.activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view.activeTab === 'overview' && renderOverviewTab()}
        {view.activeTab === 'players' && renderPlayersTab()}
        {view.activeTab === 'analytics' && renderAnalyticsTab()}
        {view.activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Real-time Performance Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Real-Time Performance</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live monitoring</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Cpu className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">CPU Usage</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">45%</div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <div className="text-xs text-blue-700 mt-1">Optimal range</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <HardDrive className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Memory</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">67%</div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                  <div className="text-xs text-green-700 mt-1">6.7GB / 10GB</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Wifi className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Network</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">23MB/s</div>
                  <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                  <div className="text-xs text-purple-700 mt-1">↑12MB/s ↓11MB/s</div>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    <span className="text-xs text-yellow-600 font-medium">Load Avg</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">1.2</div>
                  <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">5min average</div>
                </div>
              </div>
            </div>
            
            {/* Server Health Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Individual Server Performance */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Health Overview</h3>
                <div className="space-y-4">
                  {servers.slice(0, 3).map((server) => (
                    <div key={server.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          server.status === 'online' ? 'bg-green-500' :
                          server.status === 'offline' ? 'bg-gray-400' :
                          'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{server.name}</div>
                          <div className="text-sm text-gray-500">{server.game}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {server.playerCount}/{server.maxPlayers}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.floor(Math.random() * 100)}% CPU
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Optimization Suggestions */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Optimization</h3>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Beta</span>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Memory Optimization</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Reduce memory usage by 23% with automatic garbage collection tuning
                    </p>
                    <button className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
                      Apply Optimization
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Network Tuning</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Optimize tick rate for better player experience during peak hours
                    </p>
                    <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                      Schedule Optimization
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">Load Balancing</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Distribute players more evenly across servers to prevent bottlenecks
                    </p>
                    <button className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors">
                      Enable Auto-Balance
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Live Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Real-time</span>
                </div>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-900">
                      Player joined: JohnDoe123 connected to Valheim Main
                    </div>
                    <div className="text-xs text-green-700">2 seconds ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-900">
                      Performance alert: CPU spike detected on CS2 Competitive
                    </div>
                    <div className="text-xs text-blue-700">15 seconds ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-purple-900">
                      Auto-backup completed: Rust Main World saved successfully
                    </div>
                    <div className="text-xs text-purple-700">32 seconds ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-orange-900">
                      Plugin updated: Smart Server Optimizer v2.1.3 installed
                    </div>
                    <div className="text-xs text-orange-700">1 minute ago</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-yellow-900">
                      Memory warning: Valheim Creative approaching 80% memory usage
                    </div>
                    <div className="text-xs text-yellow-700">2 minutes ago</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {view.activeTab === 'plugins' && (
          <div className="space-y-6">
            {/* Plugin Status Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Plugin Management</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Download className="w-4 h-4" />
                  Install New Plugin
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Active</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">12</div>
                  <div className="text-xs text-green-700">Plugins running</div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Download className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-blue-600 font-medium">Updates</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">3</div>
                  <div className="text-xs text-blue-700">Available updates</div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-purple-600 font-medium">Config</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">2</div>
                  <div className="text-xs text-purple-700">Need attention</div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-xs text-orange-600 font-medium">Issues</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">0</div>
                  <div className="text-xs text-orange-700">No issues</div>
                </div>
              </div>
            </div>
            
            {/* Plugin Health Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Plugin Health Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-900">Auto-Backup Guardian</div>
                        <div className="text-sm text-gray-500">Running smoothly</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">v2.1.0</div>
                      <div className="text-xs text-gray-500">All servers</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-900">Smart Server Optimizer</div>
                        <div className="text-sm text-gray-500">Update available</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">v1.5.2 → v1.6.0</div>
                      <div className="text-xs text-gray-500">3 servers</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-900">Advanced Analytics Suite</div>
                        <div className="text-sm text-gray-500">Configuration needed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">v3.0.1</div>
                      <div className="text-xs text-gray-500">1 server</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cross-Server Plugin Management */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cross-Server Management</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Bulk Plugin Operations</h4>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">Pro Feature</span>
                    </div>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-200">
                        <Download className="w-4 h-4" />
                        Update All Plugins
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-200">
                        <Settings className="w-4 h-4" />
                        Sync Configurations
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-200">
                        <Database className="w-4 h-4" />
                        Backup Plugin Data
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Plugin Marketplace</h4>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Integrated</span>
                    </div>
                    <div className="space-y-2">
                      <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-200">
                        <Sparkles className="w-4 h-4" />
                        Browse Recommendations
                      </button>
                      <button className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm border border-gray-200">
                        <TrendingUp className="w-4 h-4" />
                        View Trending Plugins
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}