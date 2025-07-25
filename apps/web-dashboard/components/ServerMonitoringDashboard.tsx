'use client';

import { useState, useEffect } from 'react';
import { 
  ServerMetrics, 
  Alert, 
  PerformanceReport, 
  AutomationRule,
  MonitoringDashboard as DashboardType 
} from '@/types/server-monitoring';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Cpu, 
  Memory, 
  HardDrive, 
  Network, 
  Users, 
  Gamepad2,
  Zap,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Monitor,
  Shield,
  Settings,
  Bell,
  BellOff,
  RefreshCw,
  Download,
  Upload,
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize,
  Minimize,
  Filter,
  Search,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle2,
  X,
  Flame,
  Snowflake,
  Thermometer,
  Gauge,
  Radio,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero,
  Battery,
  BatteryLow,
  Power,
  PowerOff,
  Database,
  Cloud,
  CloudOff,
  Folder,
  FolderOpen,
  FileText,
  Archive,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  Crown,
  Award,
  Target,
  Crosshair,
  Layers,
  Grid,
  List,
  LayoutDashboard,
  LayoutGrid,
  Columns,
  Rows,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Home,
  Building,
  Globe,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Headphones,
  Microphone,
  Camera,
  Video,
  Speaker,
  Volume2,
  VolumeX,
  Music,
  Image,
  Film,
  FileAudio,
  FileVideo,
  FileImage
} from 'lucide-react';

interface ServerMonitoringDashboardProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

interface ServerStatus {
  status: 'online' | 'offline' | 'starting' | 'stopping' | 'error';
  uptime: number;
  lastRestart: Date;
  version: string;
  playerCount: number;
  maxPlayers: number;
  tps: number;
  mspt: number;
}

interface QuickMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    inbound: number;
    outbound: number;
    latency: number;
  };
}

interface AlertSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  recent: Alert[];
}

export default function ServerMonitoringDashboard({ 
  serverId, 
  serverName, 
  userRole 
}: ServerMonitoringDashboardProps) {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [metrics, setMetrics] = useState<QuickMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      // Mock server status
      const mockStatus: ServerStatus = {
        status: 'online',
        uptime: 86400 * 3 + 3600 * 2 + 1800, // 3 days, 2 hours, 30 minutes
        lastRestart: new Date(Date.now() - 86400 * 3 * 1000),
        version: '1.20.1',
        playerCount: 47,
        maxPlayers: 100,
        tps: 19.8,
        mspt: 12.3
      };

      // Mock quick metrics
      const mockMetrics: QuickMetrics = {
        cpu: {
          usage: 67.2,
          cores: 8,
          temperature: 72
        },
        memory: {
          used: 6442450944, // ~6GB
          total: 17179869184, // 16GB
          percentage: 37.5
        },
        disk: {
          used: 53687091200, // ~50GB
          total: 107374182400, // 100GB
          percentage: 50.0
        },
        network: {
          inbound: 1048576, // 1MB/s
          outbound: 524288, // 512KB/s
          latency: 23
        }
      };

      // Mock alert summary
      const mockAlerts: AlertSummary = {
        critical: 0,
        high: 1,
        medium: 3,
        low: 5,
        recent: [
          {
            id: '1',
            serverId,
            ruleId: 'cpu-high',
            severity: 'high',
            status: 'active',
            title: 'High CPU Usage',
            description: 'CPU usage has been above 75% for 10 minutes',
            metric: 'cpu.usage',
            threshold: 75,
            currentValue: 82.1,
            triggeredAt: new Date(Date.now() - 600000),
            escalationLevel: 1,
            notifications: [],
            tags: ['performance', 'cpu'],
            metadata: {}
          },
          {
            id: '2',
            serverId,
            ruleId: 'memory-medium',
            severity: 'medium',
            status: 'acknowledged',
            title: 'Memory Usage Warning',
            description: 'Memory usage approaching 80%',
            metric: 'memory.percentage',
            threshold: 80,
            currentValue: 85.3,
            triggeredAt: new Date(Date.now() - 1800000),
            acknowledgedAt: new Date(Date.now() - 900000),
            acknowledgedBy: 'admin',
            escalationLevel: 0,
            notifications: [],
            tags: ['performance', 'memory'],
            metadata: {}
          }
        ]
      };

      setServerStatus(mockStatus);
      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setLoading(false);
    };

    initializeData();
  }, [serverId]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate metric updates
      if (metrics) {
        setMetrics(prev => ({
          ...prev!,
          cpu: {
            ...prev!.cpu,
            usage: Math.max(20, Math.min(95, prev!.cpu.usage + (Math.random() - 0.5) * 5))
          },
          memory: {
            ...prev!.memory,
            percentage: Math.max(20, Math.min(90, prev!.memory.percentage + (Math.random() - 0.5) * 2))
          },
          network: {
            ...prev!.network,
            latency: Math.max(10, Math.min(100, prev!.network.latency + (Math.random() - 0.5) * 10))
          }
        }));
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, metrics]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-red-600 bg-red-100';
      case 'starting': return 'text-yellow-600 bg-yellow-100';
      case 'stopping': return 'text-orange-600 bg-orange-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetricColor = (percentage: number, reversed = false) => {
    if (reversed) {
      if (percentage >= 80) return 'text-red-500';
      if (percentage >= 60) return 'text-yellow-500';
      return 'text-green-500';
    } else {
      if (percentage <= 20) return 'text-red-500';
      if (percentage <= 40) return 'text-yellow-500';
      return 'text-green-500';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading server monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Server className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {serverName} Monitoring
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(serverStatus?.status || 'offline')}`}>
                    {serverStatus?.status?.toUpperCase()}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Uptime: {formatUptime(serverStatus?.uptime || 0)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    Version: {serverStatus?.version}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-2 rounded-lg transition-colors ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
                >
                  {autoRefresh ? <RefreshCw className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1"
                >
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              </div>
              {['owner', 'admin'].includes(userRole) && (
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Server Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Server Status</h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Players</span>
              <span className="font-semibold">
                {serverStatus?.playerCount}/{serverStatus?.maxPlayers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">TPS</span>
              <span className={`font-semibold ${getMetricColor(serverStatus?.tps || 0, false)}`}>
                {serverStatus?.tps?.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">MSPT</span>
              <span className={`font-semibold ${getMetricColor(50 - (serverStatus?.mspt || 0), false)}`}>
                {serverStatus?.mspt?.toFixed(1)}ms
              </span>
            </div>
          </div>
        </div>

        {/* CPU Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">CPU Usage</h3>
            <Cpu className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {metrics?.cpu.usage.toFixed(1)}%
              </span>
              <div className="text-right">
                <div className="text-xs text-gray-500">{metrics?.cpu.cores} cores</div>
                {metrics?.cpu.temperature && (
                  <div className="text-xs text-gray-500">{metrics.cpu.temperature}°C</div>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  (metrics?.cpu.usage || 0) > 80 ? 'bg-red-500' :
                  (metrics?.cpu.usage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${metrics?.cpu.usage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Memory Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Memory Usage</h3>
            <Memory className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {metrics?.memory.percentage.toFixed(1)}%
              </span>
              <div className="text-right text-xs text-gray-500">
                {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  (metrics?.memory.percentage || 0) > 80 ? 'bg-red-500' :
                  (metrics?.memory.percentage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${metrics?.memory.percentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Network Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Network</h3>
            <Network className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Latency</span>
              <span className={`font-semibold ${
                (metrics?.network.latency || 0) < 50 ? 'text-green-500' :
                (metrics?.network.latency || 0) < 100 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {metrics?.network.latency}ms
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">In</span>
              <span className="font-semibold text-blue-600">
                {formatBytes(metrics?.network.inbound || 0)}/s
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Out</span>
              <span className="font-semibold text-purple-600">
                {formatBytes(metrics?.network.outbound || 0)}/s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && (alerts.critical > 0 || alerts.high > 0 || alerts.medium > 0) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
              <div className="flex items-center space-x-2">
                {alerts.critical > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    {alerts.critical} Critical
                  </span>
                )}
                {alerts.high > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                    {alerts.high} High
                  </span>
                )}
                {alerts.medium > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    {alerts.medium} Medium
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              {alerts.recent.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getAlertIcon(alert.severity)}
                    <div>
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          {new Date(alert.triggeredAt).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          Current: {alert.currentValue} | Threshold: {alert.threshold}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {alert.status === 'acknowledged' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
              { id: 'performance', label: 'Performance', icon: <BarChart3 className="w-5 h-5" /> },
              { id: 'resources', label: 'Resources', icon: <Gauge className="w-5 h-5" /> },
              { id: 'alerts', label: 'Alerts', icon: <Bell className="w-5 h-5" /> },
              { id: 'logs', label: 'Logs', icon: <FileText className="w-5 h-5" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab metrics={metrics} serverStatus={serverStatus} />}
          {activeTab === 'performance' && <PerformanceTab />}
          {activeTab === 'resources' && <ResourcesTab metrics={metrics} />}
          {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
          {activeTab === 'logs' && <LogsTab />}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ metrics, serverStatus }: { metrics: QuickMetrics | null; serverStatus: ServerStatus | null }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Server Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Server Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-green-600">{serverStatus?.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Version</span>
              <span className="font-medium">{serverStatus?.version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Restart</span>
              <span className="font-medium">{serverStatus?.lastRestart.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Players Online</span>
              <span className="font-medium">{serverStatus?.playerCount}/{serverStatus?.maxPlayers}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
              <Play className="w-4 h-4" />
              <span>Start</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>
            <button className="flex items-center justify-center space-x-2 p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
              <Archive className="w-4 h-4" />
              <span>Backup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resource Usage Chart Placeholder */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage (Last 24h)</h3>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance charts would be rendered here</p>
            <p className="text-sm text-gray-400">Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Analytics</h3>
        <p className="text-gray-500">Detailed performance metrics and analytics will be displayed here.</p>
      </div>
    </div>
  );
}

function ResourcesTab({ metrics }: { metrics: QuickMetrics | null }) {
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">CPU Details</h3>
            <Cpu className="w-6 h-6 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Usage</span>
              <span className="font-medium">{metrics.cpu.usage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cores</span>
              <span className="font-medium">{metrics.cpu.cores}</span>
            </div>
            {metrics.cpu.temperature && (
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature</span>
                <span className="font-medium">{metrics.cpu.temperature}°C</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Memory Details</h3>
            <Memory className="w-6 h-6 text-purple-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Used</span>
              <span className="font-medium">{(metrics.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-medium">{(metrics.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage</span>
              <span className="font-medium">{metrics.memory.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Storage Details</h3>
            <HardDrive className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Used</span>
              <span className="font-medium">{(metrics.disk.used / 1024 / 1024 / 1024).toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-medium">{(metrics.disk.total / 1024 / 1024 / 1024).toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage</span>
              <span className="font-medium">{metrics.disk.percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertsTab({ alerts }: { alerts: AlertSummary | null }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Alert Management</h3>
        <p className="text-gray-500">
          {alerts ? `${alerts.critical + alerts.high + alerts.medium + alerts.low} total alerts` : 'No alerts configured'}
        </p>
      </div>
    </div>
  );
}

function LogsTab() {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Server Logs</h3>
        <p className="text-gray-500">Real-time server logs and historical log analysis will be displayed here.</p>
      </div>
    </div>
  );
}