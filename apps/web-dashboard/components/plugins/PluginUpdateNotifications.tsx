'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { ApiClient } from '@/lib/api-client';
import {
  Download,
  ArrowUp,
  AlertCircle,
  CheckCircle,
  X,
  Clock,
  FileText,
  Shield,
  Zap,
  Loader2,
  Bell,
  Package
} from 'lucide-react';

interface PluginUpdate {
  pluginId: string;
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  updateDescription: string;
  releaseDate: string;
  changelog: string[];
  critical: boolean;
  autoUpdateEnabled: boolean;
}

interface PluginUpdateNotificationsProps {
  serverId?: string;
  compact?: boolean;
}

export default function PluginUpdateNotifications({
  serverId,
  compact = false
}: PluginUpdateNotificationsProps) {
  const [updates, setUpdates] = useState<PluginUpdate[]>([]);
  const [updatingPlugins, setUpdatingPlugins] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [showChangelog, setShowChangelog] = useState<string | null>(null);
  
  const apiClient = new ApiClient();

  // WebSocket connection for real-time update notifications
  const { isConnected } = useWebSocket((message) => {
    if (message.type === 'plugin_update_complete') {
      const data = message.data;
      setUpdatingPlugins(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.pluginId);
        return newSet;
      });
      
      // Remove from available updates
      setUpdates(prev => prev.filter(update => update.pluginId !== data.pluginId));
      
      // Show completion notification
      // Could add a toast notification here
    }
  });

  useEffect(() => {
    loadUpdates();
  }, []);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ updates: PluginUpdate[] }>('/plugins/updates');
      
      if (response.success && response.data) {
        setUpdates(response.data.updates.filter(update => update.updateAvailable));
      } else {
        setError(response.error?.message || 'Failed to load updates');
      }
    } catch (err) {
      setError('Failed to load plugin updates');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlugin = async (pluginId: string) => {
    try {
      setUpdatingPlugins(prev => new Set(prev).add(pluginId));
      
      const response = await apiClient.post(`/plugins/${pluginId}/update`, {
        serverId: serverId || '1'
      });
      
      if (!response.success) {
        setError(response.error?.message || 'Failed to update plugin');
        setUpdatingPlugins(prev => {
          const newSet = new Set(prev);
          newSet.delete(pluginId);
          return newSet;
        });
      }
    } catch (err) {
      setError('Failed to update plugin');
      setUpdatingPlugins(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginId);
        return newSet;
      });
    }
  };

  const handleDismiss = (pluginId: string) => {
    setDismissed(prev => new Set(prev).add(pluginId));
  };

  const visibleUpdates = updates.filter(update => !dismissed.has(update.pluginId));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  if (visibleUpdates.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {visibleUpdates.map((update) => (
          <div
            key={update.pluginId}
            className={`bg-gray-800 border rounded-lg p-3 ${
              update.critical ? 'border-red-500' : 'border-blue-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  update.critical ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <span className="text-sm font-medium text-white">
                  Plugin Update Available
                </span>
                {update.critical && (
                  <Shield className="w-3 h-3 text-red-400" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleUpdatePlugin(update.pluginId)}
                  disabled={updatingPlugins.has(update.pluginId)}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                >
                  {updatingPlugins.has(update.pluginId) ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    'Update'
                  )}
                </button>
                <button
                  onClick={() => handleDismiss(update.pluginId)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleUpdates.map((update) => (
        <div
          key={update.pluginId}
          className={`bg-gray-800 border rounded-lg p-6 ${
            update.critical 
              ? 'border-red-500 bg-red-900/20' 
              : 'border-blue-500 bg-blue-900/20'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                update.critical ? 'bg-red-700' : 'bg-blue-700'
              }`}>
                {update.critical ? (
                  <Shield className="w-5 h-5 text-red-300" />
                ) : (
                  <ArrowUp className="w-5 h-5 text-blue-300" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  {update.critical ? 'Critical Update Available' : 'Update Available'}
                </h3>
                <p className="text-sm text-gray-300 mb-2">
                  {update.updateDescription}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>
                    {update.currentVersion} → {update.latestVersion}
                  </span>
                  <span>•</span>
                  <span>
                    Released: {new Date(update.releaseDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(update.pluginId)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Changelog */}
          {update.changelog.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setShowChangelog(
                  showChangelog === update.pluginId ? null : update.pluginId
                )}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {showChangelog === update.pluginId ? 'Hide' : 'Show'} Changelog
              </button>
              
              {showChangelog === update.pluginId && (
                <div className="mt-2 p-3 bg-gray-700 rounded-lg">
                  <ul className="space-y-1 text-sm text-gray-300">
                    {update.changelog.map((change, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {update.critical && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Critical security update</span>
                </div>
              )}
              {update.autoUpdateEnabled && (
                <div className="flex items-center gap-1 text-gray-400 text-sm">
                  <Zap className="w-4 h-4" />
                  <span>Auto-update enabled</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdatePlugin(update.pluginId)}
                disabled={updatingPlugins.has(update.pluginId)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                  update.critical
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {updatingPlugins.has(update.pluginId) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Update Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Summary component for dashboard
export function PluginUpdateSummary({ serverId }: { serverId?: string }) {
  const [updateCount, setUpdateCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const apiClient = new ApiClient();

  useEffect(() => {
    loadUpdateSummary();
  }, []);

  const loadUpdateSummary = async () => {
    try {
      const response = await apiClient.get<{ updates: PluginUpdate[] }>('/plugins/updates');
      
      if (response.success && response.data) {
        const availableUpdates = response.data.updates.filter(update => update.updateAvailable);
        setUpdateCount(availableUpdates.length);
        setCriticalCount(availableUpdates.filter(update => update.critical).length);
      }
    } catch (err) {
      // Fail silently for summary
    } finally {
      setLoading(false);
    }
  };

  if (loading || updateCount === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            criticalCount > 0 ? 'bg-red-700' : 'bg-blue-700'
          }`}>
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {updateCount} Plugin Update{updateCount > 1 ? 's' : ''} Available
            </h3>
            <p className="text-sm text-gray-400">
              {criticalCount > 0 && `${criticalCount} critical • `}
              {updateCount - criticalCount} regular updates
            </p>
          </div>
        </div>
        <ArrowUp className="w-5 h-5 text-blue-400" />
      </div>
    </div>
  );
}