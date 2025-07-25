'use client';

import { useState } from 'react';
import { Plugin } from '@/types/plugin';
import { 
  Download, 
  CheckCircle, 
  Loader2, 
  Star, 
  Shield, 
  DollarSign,
  Eye,
  MoreVertical,
  Settings,
  Trash2,
  RefreshCw,
  Clock,
  Users,
  Zap,
  Crown,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface PluginCardProps {
  plugin: Plugin;
  onInstall: (pluginId: string) => void;
  onViewDetails: (pluginId: string) => void;
  onConfigure?: (pluginId: string) => void;
  onUninstall?: (pluginId: string) => void;
  showInstallationStatus?: boolean;
  className?: string;
}

export default function PluginCard({ 
  plugin, 
  onInstall, 
  onViewDetails,
  onConfigure,
  onUninstall,
  showInstallationStatus = true,
  className = '' 
}: PluginCardProps) {
  const [showActions, setShowActions] = useState(false);
  
  const getInstallButtonConfig = () => {
    if (!showInstallationStatus) {
      return {
        text: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        style: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        disabled: false,
        action: () => onViewDetails(plugin.id)
      };
    }

    switch (plugin.installationStatus) {
      case 'installed':
        return {
          text: 'Installed',
          icon: <CheckCircle className="w-4 h-4" />,
          style: 'bg-green-600 text-white cursor-default',
          disabled: true,
          action: () => {}
        };
      case 'installing':
        return {
          text: `Installing ${plugin.installProgress || 0}%`,
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          style: 'bg-blue-600 text-white cursor-not-allowed',
          disabled: true,
          action: () => {}
        };
      case 'update-available':
        return {
          text: 'Update Available',
          icon: <RefreshCw className="w-4 h-4" />,
          style: 'bg-orange-600 hover:bg-orange-700 text-white',
          disabled: false,
          action: () => onInstall(plugin.id)
        };
      case 'error':
        return {
          text: 'Retry Install',
          icon: <RefreshCw className="w-4 h-4" />,
          style: 'bg-red-600 hover:bg-red-700 text-white',
          disabled: false,
          action: () => onInstall(plugin.id)
        };
      default:
        return {
          text: plugin.price.type === 'free' ? 'Install Free' : 
                plugin.price.type === 'freemium' ? 'Try Free' :
                `Install $${plugin.price.amount}`,
          icon: <Download className="w-4 h-4" />,
          style: plugin.price.type === 'free' 
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white',
          disabled: false,
          action: () => onInstall(plugin.id)
        };
    }
  };

  const getCategoryColor = () => {
    switch (plugin.category) {
      case 'quality-of-life': return 'bg-green-100 text-green-800 border-green-200';
      case 'admin-tools': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'community-features': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'game-specific': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'security': return 'bg-red-100 text-red-800 border-red-200';
      case 'monetization': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const installConfig = getInstallButtonConfig();

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1 ${className}`}>
      {/* Header with badges */}
      <div className="relative p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Plugin Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {plugin.name.charAt(0)}
          </div>
          
          {/* Plugin Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{plugin.name}</h3>
                <p className="text-sm text-indigo-600 font-medium mb-1">{plugin.tagline}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>by {plugin.developer.displayName}</span>
                  {plugin.developer.verified && (
                    <Shield className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>
              
              {/* Actions Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {showActions && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-32">
                    <button
                      onClick={() => {
                        onViewDetails(plugin.id);
                        setShowActions(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    
                    {plugin.installationStatus === 'installed' && onConfigure && (
                      <button
                        onClick={() => {
                          onConfigure(plugin.id);
                          setShowActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                    )}
                    
                    {plugin.installationStatus === 'installed' && onUninstall && (
                      <button
                        onClick={() => {
                          onUninstall(plugin.id);
                          setShowActions(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Uninstall
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-3">
          {plugin.isFeatured && (
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
              <Crown className="w-3 h-3" />
              Featured
            </span>
          )}
          {plugin.isNew && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
              <Zap className="w-3 h-3" />
              New
            </span>
          )}
          {plugin.isRecommended && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
              Recommended
            </span>
          )}
          <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getCategoryColor()}`}>
            {plugin.category.replace('-', ' ')}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-600 line-clamp-2">{plugin.description}</p>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">{plugin.rating}</span>
            </div>
            <div className="text-xs text-gray-500">{plugin.reviewCount} reviews</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Download className="w-3 h-3 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">
                {plugin.downloadCount > 1000 
                  ? `${Math.floor(plugin.downloadCount / 1000)}k` 
                  : plugin.downloadCount}
              </span>
            </div>
            <div className="text-xs text-gray-500">downloads</div>
          </div>
          
          <div>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">
                {plugin.activeInstalls > 1000 
                  ? `${Math.floor(plugin.activeInstalls / 1000)}k` 
                  : plugin.activeInstalls}
              </span>
            </div>
            <div className="text-xs text-gray-500">active</div>
          </div>
        </div>
      </div>

      {/* Game Compatibility */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-700">Compatible with:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {plugin.supportedGames.slice(0, 3).map((game) => (
            <span key={game} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              {game}
            </span>
          ))}
          {plugin.supportedGames.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
              +{plugin.supportedGames.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Price and Install */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            {plugin.price.type === 'free' ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : plugin.price.type === 'freemium' ? (
              <div>
                <span className="text-lg font-bold text-blue-600">Freemium</span>
                {plugin.price.trialDays && (
                  <div className="text-xs text-gray-500">{plugin.price.trialDays} day trial</div>
                )}
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-gray-900">
                  ${plugin.price.amount}
                </span>
                <div className="text-xs text-gray-500">one-time</div>
              </div>
            )}
          </div>
          
          {plugin.revenueShare && (
            <div className="text-xs text-gray-500">
              ${plugin.revenueShare.monthlyRevenue?.toFixed(0)}/mo
            </div>
          )}
        </div>

        <button
          onClick={installConfig.action}
          disabled={installConfig.disabled}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${installConfig.style}`}
        >
          {installConfig.icon}
          {installConfig.text}
        </button>

        {/* Installation Progress */}
        {plugin.installationStatus === 'installing' && plugin.installProgress !== undefined && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${plugin.installProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Updated {new Date(plugin.lastUpdated).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>v{plugin.version}</span>
            <span>•</span>
            <span>{plugin.fileSize}</span>
          </div>
        </div>
      </div>
    </div>
  );
}