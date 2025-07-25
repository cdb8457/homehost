'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  Monitor,
  Network,
  Server,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  Wifi,
  WifiOff,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Download,
  Upload,
  Bell,
  BellOff,
  AlertCircle,
  Info,
  XCircle,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Filter,
  Search,
  Calendar,
  MapPin,
  Globe,
  Shield,
  Lock,
  Unlock,
  Edit,
  Save,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  Move,
  Grid3X3,
  List,
  Layers,
  Target,
  Award,
  Star,
  Heart,
  ThumbsUp,
  Flag,
  MessageCircle,
  Share2,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Mail,
  Phone,
  Camera,
  Video,
  FileText,
  Link,
  Gamepad2,
  Crown,
  Fire,
  Sparkles,
  Lightbulb,
  Brain,
  Rocket
} from 'lucide-react';

interface ServerMetrics {
  serverId: string;
  serverName: string;
  gameType: string;
  status: 'online' | 'offline' | 'starting' | 'stopping' | 'error' | 'maintenance';
  lastUpdate: string;
  uptime: number;
  performance: {
    cpu: {
      usage: number;
      cores: number;
      frequency: number;
      temperature?: number;
      load1m: number;
      load5m: number;
      load15m: number;
    };
    memory: {
      used: number;
      total: number;
      available: number;
      percentage: number;
      swap: {
        used: number;
        total: number;
      };
    };
    disk: {
      used: number;
      total: number;
      available: number;
      percentage: number;
      readRate: number;
      writeRate: number;
      iops: number;
    };
    network: {
      bytesIn: number;
      bytesOut: number;
      packetsIn: number;
      packetsOut: number;
      latency: number;
      bandwidth: {
        upload: number;
        download: number;
      };
    };
  };
  gameMetrics: {
    playerCount: number;
    maxPlayers: number;
    tps: number;
    tickTime: number;
    worldSize: number;
    entityCount: number;
    chunkCount: number;
    averagePing: number;
    connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  alerts: ServerAlert[];
  plugins: PluginMetrics[];
  processes: ProcessMetrics[];
  healthScore: number;
  predictedIssues: PredictedIssue[];
}

interface ServerAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'performance' | 'security' | 'capacity' | 'connectivity' | 'game';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  autoResolved: boolean;
  severity: number;
  source: string;
  actions: AlertAction[];
}

interface AlertAction {
  id: string;
  label: string;
  type: 'restart' | 'investigate' | 'ignore' | 'escalate' | 'auto_fix';
  dangerous: boolean;
}

interface PluginMetrics {
  pluginId: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'error' | 'disabled';
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    executionTime: number;
    errorRate: number;
  };
  lastUpdate: string;
}

interface ProcessMetrics {
  pid: number;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
  status: 'running' | 'stopped' | 'error';
  command: string;
}

interface PredictedIssue {
  id: string;
  type: 'resource_exhaustion' | 'performance_degradation' | 'failure_risk' | 'capacity_limit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  timeframe: string;
  description: string;
  recommendation: string;
  preventiveActions: string[];
}

interface MonitoringConfig {
  refreshInterval: number;
  alertThresholds: {
    cpu: number;
    memory: number;
    disk: number;
    latency: number;
  };
  autoRefresh: boolean;
  selectedMetrics: string[];
  dashboardLayout: 'grid' | 'list' | 'compact';
}

export function ServerMonitoringDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [servers, setServers] = useState<ServerMetrics[]>([]);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'alerts' | 'processes' | 'predictions'>('overview');
  const [config, setConfig] = useState<MonitoringConfig>({
    refreshInterval: 5000,
    alertThresholds: {
      cpu: 80,
      memory: 90,
      disk: 85,
      latency: 200
    },
    autoRefresh: true,
    selectedMetrics: ['cpu', 'memory', 'disk', 'network'],
    dashboardLayout: 'grid'
  });
  const [showConfig, setShowConfig] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d' | '30d'>('1h');
  const [filters, setFilters] = useState({
    status: 'all',
    gameType: 'all',
    alertLevel: 'all',
    searchQuery: ''
  });
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadServerMetrics();
    
    if (config.autoRefresh) {
      refreshIntervalRef.current = setInterval(loadServerMetrics, config.refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [config.autoRefresh, config.refreshInterval]);

  const loadServerMetrics = async () => {
    try {
      if (servers.length === 0) {
        setLoading(true);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setServers(generateMockServerMetrics());
      setError(null);
    } catch (err) {
      setError('Failed to load server metrics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockServerMetrics = (): ServerMetrics[] => {
    const gameTypes = ['Minecraft', 'Valheim', 'Rust', 'CS:GO 2', '7 Days to Die', 'Terraria', 'ARK'];
    const statuses = ['online', 'offline', 'starting', 'stopping', 'error', 'maintenance'];
    
    return Array.from({ length: 12 }, (_, i) => {
      const status = statuses[i % statuses.length] as any;
      const isOnline = status === 'online';
      
      return {
        serverId: `server-${i + 1}`,
        serverName: `${gameTypes[i % gameTypes.length]} Server ${i + 1}`,
        gameType: gameTypes[i % gameTypes.length],
        status,
        lastUpdate: new Date().toISOString(),
        uptime: isOnline ? Math.random() * 7 * 24 * 60 * 60 * 1000 : 0,
        performance: {
          cpu: {
            usage: isOnline ? Math.random() * 100 : 0,
            cores: 8,
            frequency: 3.2,
            temperature: isOnline ? 45 + Math.random() * 30 : 0,
            load1m: isOnline ? Math.random() * 4 : 0,
            load5m: isOnline ? Math.random() * 4 : 0,
            load15m: isOnline ? Math.random() * 4 : 0
          },
          memory: {
            used: isOnline ? Math.random() * 16 : 0,
            total: 16,
            available: isOnline ? 16 - Math.random() * 16 : 16,
            percentage: isOnline ? Math.random() * 100 : 0,
            swap: {
              used: isOnline ? Math.random() * 4 : 0,
              total: 4
            }
          },
          disk: {
            used: isOnline ? Math.random() * 500 : 0,
            total: 1000,
            available: isOnline ? 1000 - Math.random() * 500 : 1000,
            percentage: isOnline ? Math.random() * 100 : 0,
            readRate: isOnline ? Math.random() * 100 : 0,
            writeRate: isOnline ? Math.random() * 50 : 0,
            iops: isOnline ? Math.random() * 1000 : 0
          },
          network: {
            bytesIn: isOnline ? Math.random() * 1000000 : 0,
            bytesOut: isOnline ? Math.random() * 1000000 : 0,
            packetsIn: isOnline ? Math.random() * 10000 : 0,
            packetsOut: isOnline ? Math.random() * 10000 : 0,
            latency: isOnline ? Math.random() * 100 + 10 : 0,
            bandwidth: {
              upload: isOnline ? Math.random() * 100 : 0,
              download: isOnline ? Math.random() * 100 : 0
            }
          }
        },
        gameMetrics: {
          playerCount: isOnline ? Math.floor(Math.random() * 20) : 0,
          maxPlayers: 20,
          tps: isOnline ? 18 + Math.random() * 2 : 0,
          tickTime: isOnline ? Math.random() * 10 + 5 : 0,
          worldSize: isOnline ? Math.random() * 1000 + 500 : 0,
          entityCount: isOnline ? Math.floor(Math.random() * 10000) : 0,
          chunkCount: isOnline ? Math.floor(Math.random() * 5000) : 0,
          averagePing: isOnline ? Math.random() * 100 + 20 : 0,
          connectionQuality: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any
        },
        alerts: isOnline ? generateMockAlerts(i) : [],
        plugins: isOnline ? generateMockPlugins() : [],
        processes: isOnline ? generateMockProcesses() : [],
        healthScore: isOnline ? Math.floor(Math.random() * 30 + 70) : 0,
        predictedIssues: isOnline ? generateMockPredictions() : []
      };
    });
  };

  const generateMockAlerts = (serverIndex: number): ServerAlert[] => {
    if (Math.random() > 0.7) return [];
    
    const alerts = [
      {
        type: 'warning' as const,
        category: 'performance' as const,
        title: 'High CPU Usage',
        message: 'CPU usage has been above 85% for the last 10 minutes',
        source: 'System Monitor'
      },
      {
        type: 'critical' as const,
        category: 'capacity' as const,
        title: 'Low Disk Space',
        message: 'Available disk space is below 5GB',
        source: 'Disk Monitor'
      },
      {
        type: 'info' as const,
        category: 'game' as const,
        title: 'Player Count Peak',
        message: 'Server reached maximum player capacity',
        source: 'Game Engine'
      }
    ];

    return alerts.slice(0, Math.floor(Math.random() * 3) + 1).map((alert, i) => ({
      id: `alert-${serverIndex}-${i}`,
      ...alert,
      timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      acknowledged: Math.random() > 0.7,
      autoResolved: Math.random() > 0.8,
      severity: Math.floor(Math.random() * 10) + 1,
      actions: [
        {
          id: 'action-1',
          label: 'Restart Service',
          type: 'restart' as const,
          dangerous: true
        },
        {
          id: 'action-2',
          label: 'Investigate',
          type: 'investigate' as const,
          dangerous: false
        }
      ]
    }));
  };

  const generateMockPlugins = (): PluginMetrics[] => {
    const pluginNames = ['WorldEdit', 'EssentialsX', 'Vault', 'LuckPerms', 'DiscordSRV'];
    
    return pluginNames.map((name, i) => ({
      pluginId: `plugin-${i + 1}`,
      name,
      version: `1.${i + 1}.0`,
      status: ['active', 'inactive', 'error', 'disabled'][i % 4] as any,
      performance: {
        cpuUsage: Math.random() * 10,
        memoryUsage: Math.random() * 100,
        executionTime: Math.random() * 50,
        errorRate: Math.random() * 5
      },
      lastUpdate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const generateMockProcesses = (): ProcessMetrics[] => {
    const processNames = ['java', 'nginx', 'mysql', 'redis', 'node'];
    
    return processNames.map((name, i) => ({
      pid: 1000 + i,
      name,
      cpuUsage: Math.random() * 20,
      memoryUsage: Math.random() * 200,
      uptime: Math.random() * 7 * 24 * 60 * 60 * 1000,
      status: ['running', 'stopped', 'error'][i % 3] as any,
      command: `${name} -server -Xmx4G`
    }));
  };

  const generateMockPredictions = (): PredictedIssue[] => {
    if (Math.random() > 0.4) return [];
    
    return [
      {
        id: 'prediction-1',
        type: 'resource_exhaustion',
        severity: 'medium',
        confidence: 85,
        timeframe: '2-3 hours',
        description: 'Memory usage trending upward, may reach capacity soon',
        recommendation: 'Consider restarting service or increasing memory allocation',
        preventiveActions: ['Monitor memory usage', 'Schedule restart', 'Check for memory leaks']
      }
    ];
  };

  const handleServerAction = async (serverId: string, action: string) => {
    try {
      console.log(`Performing ${action} on server ${serverId}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update server status
      setServers(prev => 
        prev.map(server => 
          server.serverId === serverId
            ? { ...server, status: action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'maintenance' as any }
            : server
        )
      );
    } catch (err) {
      console.error('Failed to perform server action:', err);
    }
  };

  const handleAlertAction = async (serverId: string, alertId: string, actionId: string) => {
    try {
      console.log(`Performing action ${actionId} on alert ${alertId} for server ${serverId}`);
      
      // Update alert status
      setServers(prev => 
        prev.map(server => 
          server.serverId === serverId
            ? {
                ...server,
                alerts: server.alerts.map(alert =>
                  alert.id === alertId
                    ? { ...alert, acknowledged: true }
                    : alert
                )
              }
            : server
        )
      );
    } catch (err) {
      console.error('Failed to perform alert action:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'starting': return 'text-blue-600 bg-blue-100';
      case 'stopping': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'offline': return XCircle;
      case 'starting': return Clock;
      case 'stopping': return Clock;
      case 'error': return AlertTriangle;
      case 'maintenance': return Settings;
      default: return XCircle;
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatUptime = (uptime: number) => {
    const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
    const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const filteredServers = servers.filter(server => {
    if (filters.status !== 'all' && server.status !== filters.status) return false;
    if (filters.gameType !== 'all' && server.gameType !== filters.gameType) return false;
    if (filters.searchQuery && !server.serverName.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  const currentServer = selectedServer ? servers.find(s => s.serverId === selectedServer) : null;

  if (loading && servers.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Server Monitoring</h2>
          <p className="text-gray-600">Real-time monitoring and management of your game servers</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setConfig(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
            className={`inline-flex items-center px-3 py-2 rounded-lg border ${
              config.autoRefresh
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            {config.autoRefresh ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Auto Refresh
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Server className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Servers</p>
              <p className="text-2xl font-bold text-gray-900">{servers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-gray-900">
                {servers.filter(s => s.status === 'online').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Players</p>
              <p className="text-2xl font-bold text-gray-900">
                {servers.reduce((sum, s) => sum + s.gameMetrics.playerCount, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {servers.reduce((sum, s) => sum + s.alerts.filter(a => !a.acknowledged).length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search servers..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="starting">Starting</option>
            <option value="stopping">Stopping</option>
            <option value="error">Error</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select
            value={filters.gameType}
            onChange={(e) => setFilters(prev => ({ ...prev, gameType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Games</option>
            <option value="Minecraft">Minecraft</option>
            <option value="Valheim">Valheim</option>
            <option value="Rust">Rust</option>
            <option value="CS:GO 2">CS:GO 2</option>
            <option value="7 Days to Die">7 Days to Die</option>
            <option value="Terraria">Terraria</option>
            <option value="ARK">ARK</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setConfig(prev => ({ ...prev, dashboardLayout: 'grid' }))}
            className={`p-2 rounded-lg ${config.dashboardLayout === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setConfig(prev => ({ ...prev, dashboardLayout: 'list' }))}
            className={`p-2 rounded-lg ${config.dashboardLayout === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Server Grid/List */}
      {config.dashboardLayout === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map(server => {
            const StatusIcon = getStatusIcon(server.status);
            
            return (
              <div
                key={server.serverId}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedServer(server.serverId)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{server.serverName}</h3>
                    <p className="text-sm text-gray-600">{server.gameType}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {server.status}
                    </span>
                  </div>
                </div>

                {server.status === 'online' && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Players</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {server.gameMetrics.playerCount}/{server.gameMetrics.maxPlayers}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Health</p>
                        <p className={`text-lg font-semibold ${getHealthScoreColor(server.healthScore)}`}>
                          {server.healthScore}%
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">CPU</span>
                          <span className="font-medium">{server.performance.cpu.usage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              server.performance.cpu.usage > 80 ? 'bg-red-500' :
                              server.performance.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${server.performance.cpu.usage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Memory</span>
                          <span className="font-medium">{server.performance.memory.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              server.performance.memory.percentage > 90 ? 'bg-red-500' :
                              server.performance.memory.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${server.performance.memory.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Disk</span>
                          <span className="font-medium">{server.performance.disk.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              server.performance.disk.percentage > 85 ? 'bg-red-500' :
                              server.performance.disk.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${server.performance.disk.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {server.alerts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Active Alerts</span>
                          <span className="text-sm font-medium text-red-600">
                            {server.alerts.filter(a => !a.acknowledged).length}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {server.status !== 'online' && (
                  <div className="text-center py-8">
                    <StatusIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Server is {server.status}</p>
                    {server.status === 'offline' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServerAction(server.serverId, 'start');
                        }}
                        className="mt-2 inline-flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start Server
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Server
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Players
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Memory
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alerts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServers.map(server => {
                  const StatusIcon = getStatusIcon(server.status);
                  
                  return (
                    <tr key={server.serverId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{server.serverName}</div>
                          <div className="text-sm text-gray-500">{server.gameType}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(server.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {server.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {server.status === 'online' ? `${server.gameMetrics.playerCount}/${server.gameMetrics.maxPlayers}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {server.status === 'online' ? `${server.performance.cpu.usage.toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {server.status === 'online' ? `${server.performance.memory.percentage.toFixed(1)}%` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {server.status === 'online' ? (
                          <span className={`text-sm font-medium ${getHealthScoreColor(server.healthScore)}`}>
                            {server.healthScore}%
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {server.alerts.length > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {server.alerts.filter(a => !a.acknowledged).length} active
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedServer(server.serverId)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {server.status === 'offline' && (
                            <button
                              onClick={() => handleServerAction(server.serverId, 'start')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                          {server.status === 'online' && (
                            <button
                              onClick={() => handleServerAction(server.serverId, 'stop')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Square className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Server Detail Modal */}
      {currentServer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-xl font-semibold text-gray-900">{currentServer.serverName}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentServer.status)}`}>
                    {React.createElement(getStatusIcon(currentServer.status), { className: 'h-4 w-4 mr-1' })}
                    {currentServer.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedServer(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'overview', name: 'Overview', icon: Monitor },
                    { id: 'performance', name: 'Performance', icon: Activity },
                    { id: 'alerts', name: 'Alerts', icon: AlertTriangle },
                    { id: 'processes', name: 'Processes', icon: Cpu },
                    { id: 'predictions', name: 'Predictions', icon: TrendingUp }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && currentServer.status === 'online' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Server Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Game Type:</span>
                          <span className="font-medium">{currentServer.gameType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Uptime:</span>
                          <span className="font-medium">{formatUptime(currentServer.uptime)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Players:</span>
                          <span className="font-medium">
                            {currentServer.gameMetrics.playerCount}/{currentServer.gameMetrics.maxPlayers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">TPS:</span>
                          <span className="font-medium">{currentServer.gameMetrics.tps.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Ping:</span>
                          <span className="font-medium">{currentServer.gameMetrics.averagePing.toFixed(0)}ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Resource Usage</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">CPU Usage</span>
                            <span className="font-medium">{currentServer.performance.cpu.usage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                currentServer.performance.cpu.usage > 80 ? 'bg-red-500' :
                                currentServer.performance.cpu.usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${currentServer.performance.cpu.usage}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Memory</span>
                            <span className="font-medium">
                              {formatBytes(currentServer.performance.memory.used * 1024 * 1024 * 1024)} / 
                              {formatBytes(currentServer.performance.memory.total * 1024 * 1024 * 1024)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                currentServer.performance.memory.percentage > 90 ? 'bg-red-500' :
                                currentServer.performance.memory.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${currentServer.performance.memory.percentage}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Disk Space</span>
                            <span className="font-medium">
                              {formatBytes(currentServer.performance.disk.used * 1024 * 1024 * 1024)} / 
                              {formatBytes(currentServer.performance.disk.total * 1024 * 1024 * 1024)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                currentServer.performance.disk.percentage > 85 ? 'bg-red-500' :
                                currentServer.performance.disk.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${currentServer.performance.disk.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Health Score</h4>
                        <span className={`text-2xl font-bold ${getHealthScoreColor(currentServer.healthScore)}`}>
                          {currentServer.healthScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full transition-all duration-300 ${getHealthScoreColor(currentServer.healthScore).replace('text-', 'bg-')}`}
                          style={{ width: `${currentServer.healthScore}%` }}
                        />
                      </div>
                    </div>

                    {currentServer.alerts.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Recent Alerts</h4>
                        <div className="space-y-3">
                          {currentServer.alerts.slice(0, 3).map(alert => (
                            <div key={alert.id} className={`p-3 rounded-lg border ${
                              alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                              'bg-blue-50 border-blue-200'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                                  <p className="text-gray-600 text-xs mt-1">{alert.message}</p>
                                </div>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                  alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {alert.type}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentServer.predictedIssues.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Predicted Issues</h4>
                        <div className="space-y-3">
                          {currentServer.predictedIssues.map(issue => (
                            <div key={issue.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-medium text-gray-900 text-sm">{issue.description}</p>
                                <span className="text-xs text-orange-600 font-medium">
                                  {issue.confidence}% confidence
                                </span>
                              </div>
                              <p className="text-gray-600 text-xs">{issue.recommendation}</p>
                              <p className="text-orange-600 text-xs mt-1">Expected in {issue.timeframe}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="space-y-4">
                  {currentServer.alerts.length > 0 ? (
                    currentServer.alerts.map(alert => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${
                        alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                        alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="font-semibold text-gray-900">{alert.title}</h5>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                alert.type === 'critical' ? 'bg-red-100 text-red-800' :
                                alert.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {alert.type}
                              </span>
                              {alert.acknowledged && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Acknowledged
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{alert.message}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Source: {alert.source}</span>
                              <span>Severity: {alert.severity}/10</span>
                              <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {alert.actions.map(action => (
                            <button
                              key={action.id}
                              onClick={() => handleAlertAction(currentServer.serverId, alert.id, action.id)}
                              className={`px-3 py-1 rounded text-sm font-medium ${
                                action.dangerous
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-500">No active alerts</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}