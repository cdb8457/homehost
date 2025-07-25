'use client';

import { useState, useEffect } from 'react';
import { pluginManagementApi, PluginConfiguration } from '@/lib/api/plugin-management';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  X,
  Settings,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Info,
  Toggle,
  Zap,
  Shield,
  Clock,
  Mail,
  Database,
  Loader2
} from 'lucide-react';

interface PluginConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverId: string;
  pluginId: string;
  pluginName: string;
  pluginIcon?: string;
  onConfigurationUpdated?: (config: PluginConfiguration) => void;
}

interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'email' | 'password';
  description?: string;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  required?: boolean;
}

// Predefined configuration schemas for different plugin types
const PLUGIN_CONFIG_SCHEMAS: Record<string, ConfigField[]> = {
  '5': [ // Performance Monitor
    {
      key: 'alertThreshold',
      label: 'Alert Threshold (%)',
      type: 'number',
      description: 'CPU usage percentage that triggers alerts',
      defaultValue: 80,
      min: 50,
      max: 95,
      required: true
    },
    {
      key: 'monitoringInterval',
      label: 'Monitoring Interval (seconds)',
      type: 'number',
      description: 'How often to check server performance',
      defaultValue: 60,
      min: 30,
      max: 300,
      required: true
    },
    {
      key: 'enableEmailAlerts',
      label: 'Enable Email Alerts',
      type: 'boolean',
      description: 'Send email notifications when alerts are triggered',
      defaultValue: true
    },
    {
      key: 'alertEmail',
      label: 'Alert Email Address',
      type: 'email',
      description: 'Email address to receive alerts',
      defaultValue: 'admin@example.com',
      required: true
    }
  ],
  '1': [ // AutoBackup Pro
    {
      key: 'backupInterval',
      label: 'Backup Interval (seconds)',
      type: 'number',
      description: 'How often to create automatic backups',
      defaultValue: 3600,
      min: 1800,
      max: 86400,
      required: true
    },
    {
      key: 'maxBackups',
      label: 'Maximum Backups',
      type: 'number',
      description: 'Maximum number of backups to keep',
      defaultValue: 10,
      min: 3,
      max: 50,
      required: true
    },
    {
      key: 'compressionEnabled',
      label: 'Enable Compression',
      type: 'boolean',
      description: 'Compress backup files to save storage space',
      defaultValue: true
    },
    {
      key: 'cloudStorage',
      label: 'Cloud Storage Provider',
      type: 'select',
      description: 'Cloud storage service for backup uploads',
      defaultValue: 'aws-s3',
      options: [
        { value: 'aws-s3', label: 'Amazon S3' },
        { value: 'google-cloud', label: 'Google Cloud Storage' },
        { value: 'azure-blob', label: 'Azure Blob Storage' },
        { value: 'none', label: 'Local Storage Only' }
      ],
      required: true
    }
  ]
};

export default function PluginConfigurationModal({
  isOpen,
  onClose,
  serverId,
  pluginId,
  pluginName,
  pluginIcon,
  onConfigurationUpdated
}: PluginConfigurationModalProps) {
  const [configuration, setConfiguration] = useState<PluginConfiguration | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const configSchema = PLUGIN_CONFIG_SCHEMAS[pluginId] || [];

  useEffect(() => {
    if (isOpen) {
      loadConfiguration();
    }
  }, [isOpen, serverId, pluginId]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await pluginManagementApi.getPluginConfiguration(serverId, pluginId);
      
      if (response.success && response.data) {
        setConfiguration(response.data.configuration);
        setConfigValues(response.data.configuration.config || {});
      } else {
        setError(response.error?.message || 'Failed to load configuration');
      }
    } catch (err) {
      setError('Failed to load plugin configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfigValues(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleEnabled = async () => {
    try {
      setSaving(true);
      const response = await pluginManagementApi.togglePlugin(serverId, pluginId);
      
      if (response.success && response.data) {
        setConfiguration(prev => prev ? {
          ...prev,
          enabled: response.data!.configuration.enabled
        } : response.data.configuration);
        onConfigurationUpdated?.(response.data.configuration);
      }
    } catch (err) {
      setError('Failed to toggle plugin state');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await pluginManagementApi.updatePluginConfiguration(
        serverId,
        pluginId,
        {
          config: configValues,
          autoUpdate: configuration?.autoUpdate
        }
      );

      if (response.success && response.data) {
        setConfiguration(response.data.configuration);
        setHasUnsavedChanges(false);
        onConfigurationUpdated?.(response.data.configuration);
      } else {
        setError(response.error?.message || 'Failed to save configuration');
      }
    } catch (err) {
      setError('Failed to save plugin configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (configuration) {
      setConfigValues(configuration.config || {});
      setHasUnsavedChanges(false);
    }
  };

  const renderConfigField = (field: ConfigField) => {
    const value = configValues[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'boolean':
        return (
          <div key={field.key} className="space-y-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={value || false}
                onChange={(e) => handleConfigChange(field.key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-white">{field.label}</span>
                {field.description && (
                  <p className="text-xs text-gray-400">{field.description}</p>
                )}
              </div>
            </label>
          </div>
        );

      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <select
              value={value || ''}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {field.description && (
              <p className="text-xs text-gray-400">{field.description}</p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value || ''}
              min={field.min}
              max={field.max}
              onChange={(e) => handleConfigChange(field.key, parseInt(e.target.value) || field.defaultValue)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            {field.description && (
              <p className="text-xs text-gray-400">{field.description}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={field.key} className="space-y-2">
            <label className="block text-sm font-medium text-white">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={value || ''}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
            {field.description && (
              <p className="text-xs text-gray-400">{field.description}</p>
            )}
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center text-lg">
                {pluginIcon || '🔌'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Configure {pluginName}</h3>
                <p className="text-sm text-gray-400">Manage plugin settings and behavior</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading configuration..." />
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-900 border border-red-700 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </div>
          ) : configuration ? (
            <div className="space-y-6">
              {/* Plugin Status */}
              <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${configuration.enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <span className="text-white font-medium">
                    Plugin {configuration.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button
                  onClick={handleToggleEnabled}
                  disabled={saving}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-sm font-medium transition-colors ${
                    configuration.enabled
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {configuration.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              {/* Auto-update Setting */}
              <div className="p-4 bg-gray-700 rounded-lg">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={configuration.autoUpdate}
                    onChange={(e) => {
                      setConfiguration(prev => prev ? { ...prev, autoUpdate: e.target.checked } : null);
                      setHasUnsavedChanges(true);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-white">Auto-update Plugin</span>
                    <p className="text-xs text-gray-400">Automatically update to new versions when available</p>
                  </div>
                </label>
              </div>

              {/* Configuration Fields */}
              {configSchema.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-white">Configuration Settings</h4>
                  {configSchema.map(renderConfigField)}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No configuration options available for this plugin.</p>
                </div>
              )}

              {/* Plugin Info */}
              <div className="p-4 bg-blue-900 border border-blue-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium mb-1">Plugin Information</p>
                    <p className="text-blue-200">
                      Last configured: {new Date(configuration.lastConfigured).toLocaleString()}
                    </p>
                    <p className="text-blue-200">
                      Auto-updates: {configuration.autoUpdate ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Footer */}
          {configuration && !loading && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="flex items-center gap-1 text-yellow-400 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Unsaved changes
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges || saving}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}