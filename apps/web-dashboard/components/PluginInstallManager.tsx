'use client';

import { useState, useEffect } from 'react';
import { Plugin, PluginInstallation, PluginConfiguration } from '@/types/plugin';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw, 
  Trash2, 
  Upload,
  Package,
  Shield,
  Zap,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Globe,
  Server,
  Users,
  Eye,
  Edit,
  MoreVertical,
  FileText,
  ExternalLink,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  Terminal,
  Code,
  Bug,
  Wrench
} from 'lucide-react';

interface PluginInstallManagerProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator';
}

interface InstallationTask {
  id: string;
  pluginId: string;
  pluginName: string;
  action: 'install' | 'update' | 'uninstall' | 'configure';
  status: 'pending' | 'downloading' | 'installing' | 'configuring' | 'completed' | 'failed';
  progress: number;
  message: string;
  startTime: Date;
  endTime?: Date;
  logs: string[];
  error?: string;
}

interface ServerStatus {
  isOnline: boolean;
  playerCount: number;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  pluginsLoaded: number;
  lastRestart: Date;
}

export default function PluginInstallManager({ 
  serverId, 
  serverName, 
  userRole = 'admin' 
}: PluginInstallManagerProps) {
  const [installations, setInstallations] = useState<PluginInstallation[]>([]);
  const [tasks, setTasks] = useState<InstallationTask[]>([]);
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [activeTab, setActiveTab] = useState<'installed' | 'tasks' | 'system'>('installed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServerData();
    const interval = setInterval(loadServerData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [serverId]);

  const loadServerData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock server status
    const mockStatus: ServerStatus = {
      isOnline: true,
      playerCount: 12,
      uptime: 7200000, // 2 hours
      cpuUsage: 45,
      memoryUsage: 68,
      diskUsage: 23,
      pluginsLoaded: 8,
      lastRestart: new Date(Date.now() - 7200000)
    };

    // Mock installations
    const mockInstallations: PluginInstallation[] = [
      {
        id: 'install-1',
        pluginId: 'advanced-chat-manager',
        serverId: serverId,
        userId: 'user-1',
        version: '2.1.4',
        status: 'active',
        configurationJson: {
          enableSpamFilter: true,
          maxMessageLength: 200,
          allowPrivateMessages: true,
          logLevel: 'info'
        },
        installedAt: new Date('2025-07-10'),
        lastUpdated: new Date('2025-07-10'),
        autoUpdate: true
      },
      {
        id: 'install-2',
        pluginId: 'economy-system-pro',
        serverId: serverId,
        userId: 'user-1',
        version: '2.9.3',
        status: 'active',
        configurationJson: {
          startingBalance: 1000,
          enableAuctions: true,
          taxRate: 0.05
        },
        installedAt: new Date('2025-07-08'),
        lastUpdated: new Date('2025-07-08'),
        autoUpdate: false
      },
      {
        id: 'install-3',
        pluginId: 'performance-optimizer',
        serverId: serverId,
        userId: 'user-1',
        version: '1.3.8',
        status: 'active',
        configurationJson: {
          autoOptimize: true,
          maxMemoryUsage: 80,
          enableCaching: true
        },
        installedAt: new Date('2025-07-05'),
        lastUpdated: new Date('2025-07-05'),
        autoUpdate: true,
        errorMessage: 'Update available: v1.4.2'
      },
      {
        id: 'install-4',
        pluginId: 'backup-guardian',
        serverId: serverId,
        userId: 'user-1',
        version: '1.0.5',
        status: 'disabled',
        configurationJson: {
          backupInterval: 3600,
          maxBackups: 10,
          compression: true
        },
        installedAt: new Date('2025-07-03'),
        lastUpdated: new Date('2025-07-03'),
        autoUpdate: true,
        errorMessage: 'Plugin disabled due to configuration error'
      }
    ];

    // Mock active tasks
    const mockTasks: InstallationTask[] = [
      {
        id: 'task-1',
        pluginId: 'performance-optimizer',
        pluginName: 'Performance Optimizer',
        action: 'update',
        status: 'downloading',
        progress: 67,
        message: 'Downloading update v1.4.2...',
        startTime: new Date(Date.now() - 30000),
        logs: [
          '[10:15:23] Starting update process...',
          '[10:15:24] Backing up current configuration...',
          '[10:15:25] Downloading v1.4.2 from repository...',
          '[10:15:26] Download progress: 67%'
        ]
      }
    ];

    setServerStatus(mockStatus);
    setInstallations(mockInstallations);
    setTasks(mockTasks);
    setLoading(false);
  };

  const handlePluginAction = async (pluginId: string, action: 'start' | 'stop' | 'restart' | 'configure' | 'update' | 'uninstall') => {
    console.log(`Performing ${action} on plugin ${pluginId}`);
    
    if (action === 'configure') {
      setSelectedPlugin(pluginId);
      setShowConfiguration(true);
      return;
    }

    // Create new task
    const newTask: InstallationTask = {
      id: `task-${Date.now()}`,
      pluginId,
      pluginName: installations.find(i => i.pluginId === pluginId)?.pluginId || pluginId,
      action: action as any,
      status: 'pending',
      progress: 0,
      message: `Preparing to ${action} plugin...`,
      startTime: new Date(),
      logs: [`[${new Date().toLocaleTimeString()}] Starting ${action} process...`]
    };

    setTasks(prev => [newTask, ...prev]);

    // Simulate task progress
    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'downloading', progress: 25, message: 'Downloading plugin files...' }
          : task
      ));
    }, 1000);

    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'installing', progress: 75, message: 'Installing plugin...' }
          : task
      ));
    }, 2000);

    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === newTask.id 
          ? { ...task, status: 'completed', progress: 100, message: 'Plugin action completed successfully!', endTime: new Date() }
          : task
      ));
    }, 3000);
  };

  const handleServerAction = async (action: 'restart' | 'reload_plugins' | 'backup') => {
    console.log(`Performing server ${action}`);
    
    if (action === 'restart') {
      setServerStatus(prev => prev ? { ...prev, isOnline: false } : null);
      
      setTimeout(() => {
        setServerStatus(prev => prev ? { 
          ...prev, 
          isOnline: true, 
          uptime: 0, 
          lastRestart: new Date(),
          pluginsLoaded: installations.filter(i => i.status === 'active').length
        } : null);
      }, 5000);
    }
  };

  const formatUptime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'disabled': return 'text-gray-600 bg-gray-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'updating': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
    }
  };

  const runningTasks = tasks.filter(t => !['completed', 'failed'].includes(t.status));
  const completedTasks = tasks.filter(t => ['completed', 'failed'].includes(t.status));

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              Plugin Manager - {serverName}
            </h2>
            <p className="text-gray-600">
              Manage and configure plugins for this server
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleServerAction('reload_plugins')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Plugins
            </button>
            <button
              onClick={() => handleServerAction('restart')}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Play className="w-4 h-4" />
              Restart Server
            </button>
          </div>
        </div>

        {/* Server Status */}
        {serverStatus && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Server Status</h3>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${serverStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {serverStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Players:</span>
                <span className="font-medium">{serverStatus.playerCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{formatUptime(serverStatus.uptime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-600" />
                <span className="text-gray-600">CPU:</span>
                <span className="font-medium">{serverStatus.cpuUsage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">Memory:</span>
                <span className="font-medium">{serverStatus.memoryUsage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-indigo-600" />
                <span className="text-gray-600">Disk:</span>
                <span className="font-medium">{serverStatus.diskUsage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span className="text-gray-600">Plugins:</span>
                <span className="font-medium">{serverStatus.pluginsLoaded}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'installed', label: 'Installed Plugins', count: installations.length },
              { id: 'tasks', label: 'Tasks', count: runningTasks.length },
              { id: 'system', label: 'System Info', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          {installations.map((installation) => (
            <div key={installation.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{installation.pluginId}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(installation.status)}`}>
                      {installation.status}
                    </span>
                    <span className="text-sm text-gray-500">v{installation.version}</span>
                    {installation.autoUpdate && (
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        Auto-update
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Installed:</span> {installation.installedAt.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {installation.lastUpdated.toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">User:</span> {installation.userId}
                    </div>
                    <div>
                      <span className="font-medium">Config:</span> {Object.keys(installation.configurationJson).length} settings
                    </div>
                  </div>
                  
                  {installation.errorMessage && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      {installation.errorMessage}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handlePluginAction(installation.pluginId, 'configure')}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Configure"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  {installation.status === 'active' ? (
                    <button
                      onClick={() => handlePluginAction(installation.pluginId, 'stop')}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Stop"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePluginAction(installation.pluginId, 'start')}
                      className="p-2 text-gray-400 hover:text-green-600"
                      title="Start"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handlePluginAction(installation.pluginId, 'restart')}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title="Restart"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handlePluginAction(installation.pluginId, 'update')}
                    className="p-2 text-gray-400 hover:text-orange-600"
                    title="Update"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handlePluginAction(installation.pluginId, 'uninstall')}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Uninstall"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {installations.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No plugins installed</h3>
              <p className="text-gray-600">
                Visit the Plugin Marketplace to discover and install plugins for your server.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Running Tasks */}
          {runningTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Active Tasks</h3>
              <div className="space-y-3">
                {runningTasks.map((task) => (
                  <div key={task.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getTaskStatusIcon(task.status)}
                        <span className="font-medium text-gray-900">{task.pluginName}</span>
                        <span className="text-sm text-gray-600">({task.action})</span>
                      </div>
                      <span className={`text-sm font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>{task.message}</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Started: {task.startTime.toLocaleTimeString()}</span>
                      <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <Terminal className="w-4 h-4" />
                        View Logs
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Recent Tasks</h3>
              <div className="space-y-3">
                {completedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTaskStatusIcon(task.status)}
                        <span className="font-medium text-gray-900">{task.pluginName}</span>
                        <span className="text-sm text-gray-600">({task.action})</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          {task.endTime?.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks running</h3>
              <p className="text-gray-600">
                Plugin installation and management tasks will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">System Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Server ID:</span>
                  <span className="font-medium">{serverId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">HomeHost Version:</span>
                  <span className="font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plugin API Version:</span>
                  <span className="font-medium">v1.8.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Restart:</span>
                  <span className="font-medium">{serverStatus?.lastRestart.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Plugin Directory</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Plugins:</span>
                  <span className="font-medium">{installations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active:</span>
                  <span className="font-medium text-green-600">{installations.filter(i => i.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disabled:</span>
                  <span className="font-medium text-gray-600">{installations.filter(i => i.status === 'disabled').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto-update:</span>
                  <span className="font-medium">{installations.filter(i => i.autoUpdate).length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Plugin Logs</h3>
            <div className="bg-black rounded-lg p-3 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
              <div>[{new Date().toLocaleTimeString()}] Plugin system initialized</div>
              <div>[{new Date().toLocaleTimeString()}] Loading 8 plugins...</div>
              <div>[{new Date().toLocaleTimeString()}] ✓ Advanced Chat Manager v2.1.4 loaded</div>
              <div>[{new Date().toLocaleTimeString()}] ✓ Economy System Pro v2.9.3 loaded</div>
              <div>[{new Date().toLocaleTimeString()}] ✓ Performance Optimizer v1.3.8 loaded</div>
              <div>[{new Date().toLocaleTimeString()}] ⚠ Backup Guardian v1.0.5 disabled (config error)</div>
              <div>[{new Date().toLocaleTimeString()}] All plugins loaded successfully</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}