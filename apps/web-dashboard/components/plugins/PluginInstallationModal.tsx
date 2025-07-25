'use client';

import { useState } from 'react';
import { pluginsApi } from '@/lib/api/plugins';
import PluginDependencyViewer from './PluginDependencyViewer';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  X,
  Download,
  AlertTriangle,
  CheckCircle,
  Package,
  Shield,
  DollarSign,
  Star,
  Users,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  price: number;
  rating: number;
  downloads: number;
  verified: boolean;
  icon?: string;
  tags: string[];
  category: string;
  gameTypes: string[];
  requirements?: string[];
  screenshots?: string[];
  lastUpdated: string;
}

interface PluginInstallationModalProps {
  isOpen: boolean;
  onClose: () => void;
  plugin: Plugin;
  serverId: string;
  onInstallSuccess?: () => void;
}

export default function PluginInstallationModal({
  isOpen,
  onClose,
  plugin,
  serverId,
  onInstallSuccess
}: PluginInstallationModalProps) {
  const [currentStep, setCurrentStep] = useState<'overview' | 'dependencies' | 'installing'>('overview');
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dependencyError, setDependencyError] = useState<any>(null);

  const handleInstall = async (skipDependencyCheck = false) => {
    try {
      setInstalling(true);
      setError(null);
      setDependencyError(null);

      const response = await pluginsApi.installPlugin(plugin.id, { 
        serverId, 
        skipDependencyCheck 
      });

      if (response.success) {
        setCurrentStep('installing');
        onInstallSuccess?.();
        // Modal will stay open to show installation progress
      } else {
        if (response.error?.details) {
          setDependencyError(response.error.details);
          setCurrentStep('dependencies');
        } else {
          setError(response.error?.message || 'Installation failed');
        }
      }
    } catch (err) {
      setError('Failed to install plugin');
    } finally {
      setInstalling(false);
    }
  };

  const handleInstallDependency = async (dependencyId: string) => {
    try {
      const response = await pluginsApi.installPlugin(dependencyId, { serverId });
      if (response.success) {
        // Refresh dependency view
        window.location.reload();
      }
    } catch (err) {
      setError('Failed to install dependency');
    }
  };

  const handleResolveConflict = async (conflictId: string, action: 'remove' | 'disable') => {
    try {
      if (action === 'remove') {
        // Call uninstall API
        const response = await pluginsApi.uninstallPlugin(conflictId, { serverId });
        if (response.success) {
          // Refresh dependency view
          window.location.reload();
        }
      } else {
        // Call disable API
        setError('Disable functionality not implemented yet');
      }
    } catch (err) {
      setError('Failed to resolve conflict');
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'administration': return <Shield className="w-4 h-4" />;
      case 'economy': return <DollarSign className="w-4 h-4" />;
      case 'pvp': return <Users className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                {plugin.icon || '🔌'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{plugin.name}</h3>
                <p className="text-gray-400">by {plugin.author} • v{plugin.version}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setCurrentStep('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCurrentStep('dependencies')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === 'dependencies'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Dependencies
            </button>
            {currentStep === 'installing' && (
              <div className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                Installing...
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Dependency Error */}
          {dependencyError && (
            <div className="mb-6 p-4 bg-yellow-900 border border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-300 font-medium">Dependency Issues Detected</span>
              </div>
              <p className="text-yellow-200 text-sm mb-3">
                This plugin has unresolved dependencies or conflicts. Please review and resolve them before installation.
              </p>
              <button
                onClick={() => setCurrentStep('dependencies')}
                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
              >
                Review Dependencies
              </button>
            </div>
          )}

          {/* Content */}
          <div className="space-y-6">
            {currentStep === 'overview' && (
              <div className="space-y-6">
                {/* Plugin Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Description</h4>
                      <p className="text-gray-300">{plugin.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Requirements</h4>
                      <ul className="space-y-1 text-sm text-gray-300">
                        {plugin.requirements?.map((req, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm font-medium text-white">Rating</span>
                        </div>
                        <span className="text-lg font-bold text-white">{plugin.rating.toFixed(1)}</span>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Download className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-white">Downloads</span>
                        </div>
                        <span className="text-lg font-bold text-white">{plugin.downloads.toLocaleString()}</span>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(plugin.category)}
                          <span className="text-sm font-medium text-white">Category</span>
                        </div>
                        <span className="text-sm text-gray-300">{plugin.category}</span>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-white">Updated</span>
                        </div>
                        <span className="text-sm text-gray-300">
                          {new Date(plugin.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {plugin.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'dependencies' && (
              <PluginDependencyViewer
                pluginId={plugin.id}
                serverId={serverId}
                onInstallDependency={handleInstallDependency}
                onResolveConflict={handleResolveConflict}
              />
            )}

            {currentStep === 'installing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <h3 className="text-lg font-semibold text-white mt-4">Installing {plugin.name}</h3>
                <p className="text-gray-400 mt-2">
                  Installation progress will be shown in the plugin management dashboard
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {currentStep !== 'installing' && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-white">
                  {formatPrice(plugin.price)}
                </div>
                {plugin.verified && (
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Verified
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                {currentStep === 'dependencies' && dependencyError && (
                  <button
                    onClick={() => handleInstall(true)}
                    disabled={installing}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {installing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    Force Install
                  </button>
                )}
                
                <button
                  onClick={() => handleInstall()}
                  disabled={installing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {installing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Install Plugin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}