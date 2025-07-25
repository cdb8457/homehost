'use client';

import { useState } from 'react';
import { ServerInstance } from '@/types/server';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Database, 
  Download,
  Users, 
  Cpu, 
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Eye,
  MoreVertical,
  Shield,
  Activity,
  Zap
} from 'lucide-react';

interface ServerCardProps {
  server: ServerInstance;
  onServerAction: (serverId: string, action: string) => void;
  onViewDetails: (serverId: string) => void;
  isSelected?: boolean;
  onSelectionChange?: (serverId: string, selected: boolean) => void;
  className?: string;
}

export default function ServerCard({ 
  server, 
  onServerAction, 
  onViewDetails,
  isSelected = false,
  onSelectionChange,
  className = '' 
}: ServerCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const getStatusConfig = () => {
    switch (server.status) {
      case 'online':
        return {
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          text: 'Online'
        };
      case 'offline':
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <Square className="w-4 h-4 text-gray-600" />,
          text: 'Offline'
        };
      case 'starting':
        return {
          color: 'bg-blue-500 animate-pulse',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: <Play className="w-4 h-4 text-blue-600" />,
          text: 'Starting'
        };
      case 'stopping':
        return {
          color: 'bg-orange-500 animate-pulse',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          icon: <Square className="w-4 h-4 text-orange-600" />,
          text: 'Stopping'
        };
      case 'error':
        return {
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          text: 'Error'
        };
      case 'maintenance':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: <Settings className="w-4 h-4 text-yellow-600" />,
          text: 'Maintenance'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: <XCircle className="w-4 h-4 text-gray-600" />,
          text: 'Unknown'
        };
    }
  };

  const getPerformanceColor = (value: number, metric: string) => {
    switch (metric) {
      case 'cpu':
      case 'memory':
      case 'disk':
        if (value > 80) return 'text-red-600';
        if (value > 60) return 'text-yellow-600';
        return 'text-green-600';
      case 'latency':
        if (value > 100) return 'text-red-600';
        if (value > 50) return 'text-yellow-600';
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getActionButtons = () => {
    switch (server.status) {
      case 'online':
        return [
          { action: 'restart', icon: <RotateCcw className="w-4 h-4" />, text: 'Restart' },
          { action: 'stop', icon: <Square className="w-4 h-4" />, text: 'Stop' },
          { action: 'backup', icon: <Database className="w-4 h-4" />, text: 'Backup' }
        ];
      case 'offline':
      case 'error':
        return [
          { action: 'start', icon: <Play className="w-4 h-4" />, text: 'Start' },
          { action: 'backup', icon: <Database className="w-4 h-4" />, text: 'Backup' }
        ];
      case 'maintenance':
        return [
          { action: 'start', icon: <Play className="w-4 h-4" />, text: 'Start' }
        ];
      default:
        return [];
    }
  };

  const statusConfig = getStatusConfig();
  const actionButtons = getActionButtons();

  return (
    <div className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
      isSelected ? 'border-indigo-300 ring-2 ring-indigo-100' : statusConfig.borderColor
    } ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            {onSelectionChange && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectionChange(server.id, e.target.checked)}
                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900">{server.name}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                  {server.game}
                </span>
              </div>
              <p className="text-sm text-gray-600">{server.communityName}</p>
            </div>
          </div>
          
          {/* Status and Actions */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
              <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                {statusConfig.text}
              </span>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-32">
                  {actionButtons.map((button) => (
                    <button
                      key={button.action}
                      onClick={() => {
                        onServerAction(server.id, button.action);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {button.icon}
                      {button.text}
                    </button>
                  ))}
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      onViewDetails(server.id);
                      setShowActions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Count and Version */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {server.playerCount}/{server.maxPlayers}
              </span>
              <span className="text-xs text-gray-500">players</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className="text-xs text-gray-600">v{server.version}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Uptime: {server.uptime}</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Cpu className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">CPU</span>
            </div>
            <div className={`text-sm font-semibold ${getPerformanceColor(server.performance.cpu, 'cpu')}`}>
              {server.performance.cpu}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">RAM</span>
            </div>
            <div className={`text-sm font-semibold ${getPerformanceColor(server.performance.memory, 'memory')}`}>
              {server.performance.memory}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wifi className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Ping</span>
            </div>
            <div className={`text-sm font-semibold ${getPerformanceColor(server.performance.networkLatency, 'latency')}`}>
              {server.performance.networkLatency}ms
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Tick</span>
            </div>
            <div className="text-sm font-semibold text-gray-900">
              {server.performance.tickRate}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {server.alerts.length > 0 && (
          <div className="mb-4">
            {server.alerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className={`flex items-start gap-2 p-3 rounded-lg mb-2 ${
                alert.severity === 'critical' ? 'bg-red-50 border border-red-200' :
                alert.severity === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                  alert.severity === 'critical' ? 'text-red-600' :
                  alert.severity === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${
                    alert.severity === 'critical' ? 'text-red-800' :
                    alert.severity === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {alert.title}
                  </div>
                  <div className={`text-xs ${
                    alert.severity === 'critical' ? 'text-red-600' :
                    alert.severity === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {alert.message}
                  </div>
                  {alert.suggestedAction && (
                    <div className="text-xs text-gray-600 mt-1">
                      💡 {alert.suggestedAction}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {server.alerts.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{server.alerts.length - 2} more alerts
              </div>
            )}
          </div>
        )}

        {/* Quick Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span>{server.region}</span>
            <span>{server.config.map}</span>
            <span>{server.config.gameMode}</span>
          </div>
          <span>Last backup: {new Date(server.lastBackup).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}