'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { pluginManagementApi } from '@/lib/api/plugin-management';
import {
  Download,
  Package,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Play,
  FileArchive,
  ShieldCheck,
  Settings,
  Zap,
  Clock
} from 'lucide-react';

interface InstallationProgress {
  installationId: string;
  pluginId: string;
  serverId: string;
  pluginName: string;
  step: string;
  message: string;
  progress: number;
  timestamp: string;
}

interface PluginInstallationProgressProps {
  serverId?: string;
  onInstallationComplete?: (pluginId: string, serverId: string) => void;
}

export default function PluginInstallationProgress({
  serverId,
  onInstallationComplete
}: PluginInstallationProgressProps) {
  const [installations, setInstallations] = useState<InstallationProgress[]>([]);
  const [completedInstallations, setCompletedInstallations] = useState<Set<string>>(new Set());

  // WebSocket connection for real-time updates
  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'plugin_installation_started') {
      const data = message.data;
      setInstallations(prev => {
        const existing = prev.find(i => i.installationId === data.installationId);
        if (existing) return prev;
        
        return [...prev, {
          installationId: data.installationId,
          pluginId: data.pluginId,
          serverId: data.serverId,
          pluginName: data.pluginName,
          step: 'starting',
          message: 'Starting installation...',
          progress: 0,
          timestamp: data.timestamp
        }];
      });
    } else if (message.type === 'plugin_installation_progress') {
      const data = message.data;
      setInstallations(prev => prev.map(installation =>
        installation.installationId === data.installationId
          ? { ...installation, ...data }
          : installation
      ));
    } else if (message.type === 'plugin_installation_complete') {
      const data = message.data;
      setInstallations(prev => prev.filter(i => i.installationId !== data.installationId));
      setCompletedInstallations(prev => new Set(prev).add(data.installationId));
      
      // Show completion notification for a few seconds
      setTimeout(() => {
        setCompletedInstallations(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.installationId);
          return newSet;
        });
      }, 5000);
      
      // Notify parent component
      onInstallationComplete?.(data.pluginId, data.serverId);
    }
  });

  // Filter installations by server if serverId is provided
  const filteredInstallations = serverId 
    ? installations.filter(i => i.serverId === serverId)
    : installations;

  const getStepIcon = (step: string, progress: number) => {
    switch (step) {
      case 'downloading':
        return <Download className="w-4 h-4 text-blue-500" />;
      case 'extracting':
        return <FileArchive className="w-4 h-4 text-yellow-500" />;
      case 'validating':
        return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'installing':
        return <Package className="w-4 h-4 text-purple-500" />;
      case 'configuring':
        return <Settings className="w-4 h-4 text-indigo-500" />;
      case 'starting':
        return <Zap className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (filteredInstallations.length === 0 && completedInstallations.size === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Active Installations */}
      {filteredInstallations.map((installation) => (
        <div
          key={installation.installationId}
          className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                {getStepIcon(installation.step, installation.progress)}
              </div>
              <div>
                <h4 className="font-medium text-white">Installing {installation.pluginName}</h4>
                <p className="text-sm text-gray-400">Server: {installation.serverId}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white">{installation.progress}%</div>
              <div className="text-xs text-gray-400">
                {new Date(installation.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-300">{installation.message}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(installation.progress)}`}
                style={{ width: `${installation.progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Step: {installation.step}</span>
            <span>ID: {installation.installationId.slice(-8)}</span>
          </div>
        </div>
      ))}

      {/* Completed Installations (temporary notifications) */}
      {Array.from(completedInstallations).map((installationId) => (
        <div
          key={installationId}
          className="bg-green-900 border border-green-700 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <h4 className="font-medium text-green-100">Installation Complete!</h4>
                <p className="text-sm text-green-300">Plugin has been successfully installed</p>
              </div>
            </div>
            <button
              onClick={() => setCompletedInstallations(prev => {
                const newSet = new Set(prev);
                newSet.delete(installationId);
                return newSet;
              })}
              className="text-green-400 hover:text-green-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Connection Status */}
      {!isConnected && (filteredInstallations.length > 0 || completedInstallations.size > 0) && (
        <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-yellow-200">
              Real-time connection lost. Progress updates may be delayed.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for use in small spaces
export function PluginInstallationProgressCompact({
  serverId,
  onInstallationComplete
}: PluginInstallationProgressProps) {
  const [installations, setInstallations] = useState<InstallationProgress[]>([]);

  useWebSocket((message) => {
    if (message.type === 'plugin_installation_started') {
      const data = message.data;
      if (!serverId || data.serverId === serverId) {
        setInstallations(prev => {
          const existing = prev.find(i => i.installationId === data.installationId);
          if (existing) return prev;
          
          return [...prev, {
            installationId: data.installationId,
            pluginId: data.pluginId,
            serverId: data.serverId,
            pluginName: data.pluginName,
            step: 'starting',
            message: 'Starting installation...',
            progress: 0,
            timestamp: data.timestamp
          }];
        });
      }
    } else if (message.type === 'plugin_installation_progress') {
      const data = message.data;
      if (!serverId || data.serverId === serverId) {
        setInstallations(prev => prev.map(installation =>
          installation.installationId === data.installationId
            ? { ...installation, ...data }
            : installation
        ));
      }
    } else if (message.type === 'plugin_installation_complete') {
      const data = message.data;
      if (!serverId || data.serverId === serverId) {
        setInstallations(prev => prev.filter(i => i.installationId !== data.installationId));
        onInstallationComplete?.(data.pluginId, data.serverId);
      }
    }
  });

  const filteredInstallations = serverId 
    ? installations.filter(i => i.serverId === serverId)
    : installations;

  if (filteredInstallations.length === 0) return null;

  return (
    <div className="space-y-2">
      {filteredInstallations.map((installation) => (
        <div
          key={installation.installationId}
          className="bg-gray-800 border border-gray-700 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                {getStepIcon(installation.step, installation.progress)}
              </div>
              <span className="text-sm font-medium text-white">
                {installation.pluginName}
              </span>
            </div>
            <span className="text-xs text-gray-400">{installation.progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-300 ${getProgressColor(installation.progress)}`}
              style={{ width: `${installation.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function getStepIcon(step: string, progress: number) {
  switch (step) {
    case 'downloading':
      return <Download className="w-3 h-3 text-blue-500" />;
    case 'extracting':
      return <FileArchive className="w-3 h-3 text-yellow-500" />;
    case 'validating':
      return <ShieldCheck className="w-3 h-3 text-green-500" />;
    case 'installing':
      return <Package className="w-3 h-3 text-purple-500" />;
    case 'configuring':
      return <Settings className="w-3 h-3 text-indigo-500" />;
    case 'starting':
      return <Zap className="w-3 h-3 text-green-500" />;
    case 'completed':
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    default:
      return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
  }
}

function getProgressColor(progress: number) {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 80) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  return 'bg-gray-500';
}