'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  Shield,
  Zap,
  Link,
  AlertCircle,
  Info,
  Download,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

interface DependencyNode {
  id: string;
  name: string;
  version: string;
  dependencies: DependencyNode[];
  conflicts: string[];
  provides: string[];
}

interface DependencyCheck {
  plugin: {
    id: string;
    name: string;
  };
  dependencies: {
    success: boolean;
    missingDependencies: Array<{
      pluginId: string;
      pluginName: string;
      reason: string;
    }>;
    chain: Array<{
      pluginId: string;
      pluginName: string;
      version: string;
      reason: string;
    }>;
  };
  conflicts: Array<{
    type: string;
    pluginId: string;
    pluginName: string;
    reason: string;
  }>;
  canInstall: boolean;
}

interface PluginDependencyViewerProps {
  pluginId: string;
  serverId: string;
  onInstallDependency?: (pluginId: string) => void;
  onResolveConflict?: (pluginId: string, action: 'remove' | 'disable') => void;
}

export default function PluginDependencyViewer({
  pluginId,
  serverId,
  onInstallDependency,
  onResolveConflict
}: PluginDependencyViewerProps) {
  const [dependencyTree, setDependencyTree] = useState<DependencyNode | null>(null);
  const [dependencyCheck, setDependencyCheck] = useState<DependencyCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showFullTree, setShowFullTree] = useState(false);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadDependencyInfo();
  }, [pluginId, serverId]);

  const loadDependencyInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      const [treeResponse, checkResponse] = await Promise.all([
        apiClient.get<{ dependencyTree: DependencyNode }>(`/plugins/${pluginId}/dependencies`),
        apiClient.get<DependencyCheck>(`/servers/${serverId}/plugins/${pluginId}/dependencies`)
      ]);

      if (treeResponse.success && treeResponse.data) {
        setDependencyTree(treeResponse.data.dependencyTree);
      }

      if (checkResponse.success && checkResponse.data) {
        setDependencyCheck(checkResponse.data);
      }

      if (!treeResponse.success && !checkResponse.success) {
        setError('Failed to load dependency information');
      }
    } catch (err) {
      setError('Failed to load dependency information');
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderDependencyNode = (node: DependencyNode, depth: number = 0) => {
    const hasChildren = node.dependencies.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const indent = depth * 20;

    return (
      <div key={node.id} className="space-y-2">
        <div 
          className="flex items-center gap-2 p-3 bg-gray-700 rounded-lg"
          style={{ marginLeft: `${indent}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleNode(node.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          
          <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
            <Package className="w-4 h-4 text-gray-300" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-white">{node.name}</h4>
            <p className="text-sm text-gray-400">v{node.version}</p>
          </div>
          
          {node.provides.length > 0 && (
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300">
                Provides: {node.provides.join(', ')}
              </span>
            </div>
          )}
          
          {node.conflicts.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-300">
                Conflicts: {node.conflicts.length}
              </span>
            </div>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-2">
            {node.dependencies.map(dep => renderDependencyNode(dep, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getStatusIcon = (canInstall: boolean, hasConflicts: boolean, hasMissingDeps: boolean) => {
    if (canInstall) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (hasConflicts) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    } else if (hasMissingDeps) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusMessage = (canInstall: boolean, hasConflicts: boolean, hasMissingDeps: boolean) => {
    if (canInstall) {
      return 'Ready to install';
    } else if (hasConflicts) {
      return 'Conflicts detected';
    } else if (hasMissingDeps) {
      return 'Missing dependencies';
    } else {
      return 'Cannot install';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" text="Loading dependency information..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-300">{error}</span>
        </div>
      </div>
    );
  }

  const hasConflicts = dependencyCheck?.conflicts.length > 0;
  const hasMissingDeps = dependencyCheck?.dependencies.missingDependencies.length > 0;

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <div className={`p-4 rounded-lg border ${
        dependencyCheck?.canInstall 
          ? 'bg-green-900 border-green-700'
          : hasConflicts 
            ? 'bg-red-900 border-red-700'
            : 'bg-yellow-900 border-yellow-700'
      }`}>
        <div className="flex items-center gap-3">
          {getStatusIcon(dependencyCheck?.canInstall || false, hasConflicts, hasMissingDeps)}
          <div>
            <h3 className="font-semibold text-white">
              {getStatusMessage(dependencyCheck?.canInstall || false, hasConflicts, hasMissingDeps)}
            </h3>
            <p className="text-sm text-gray-300">
              {dependencyCheck?.canInstall 
                ? 'All dependencies are satisfied and no conflicts detected'
                : hasConflicts 
                  ? `${dependencyCheck?.conflicts.length} conflicts need to be resolved`
                  : `${dependencyCheck?.dependencies.missingDependencies.length} dependencies need to be installed`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Missing Dependencies */}
      {hasMissingDeps && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Missing Dependencies
          </h3>
          <div className="space-y-3">
            {dependencyCheck?.dependencies.missingDependencies.map((dep, index) => (
              <div key={index} className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-yellow-100">{dep.pluginName}</h4>
                    <p className="text-sm text-yellow-300">{dep.reason}</p>
                  </div>
                  <button
                    onClick={() => onInstallDependency?.(dep.pluginId)}
                    className="flex items-center gap-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependency Chain */}
      {dependencyCheck?.dependencies.chain.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Installation Chain
          </h3>
          <div className="space-y-2">
            {dependencyCheck.dependencies.chain.map((dep, index) => (
              <div key={index} className="bg-blue-900 border border-blue-700 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-100">{dep.pluginName}</h4>
                    <p className="text-sm text-blue-300">{dep.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conflicts */}
      {hasConflicts && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Conflicts
          </h3>
          <div className="space-y-3">
            {dependencyCheck?.conflicts.map((conflict, index) => (
              <div key={index} className="bg-red-900 border border-red-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-red-100">{conflict.pluginName}</h4>
                    <p className="text-sm text-red-300">{conflict.reason}</p>
                    <p className="text-xs text-red-400 mt-1">
                      Type: {conflict.type === 'reverse_conflict' ? 'Reverse Conflict' : 'Direct Conflict'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onResolveConflict?.(conflict.pluginId, 'disable')}
                      className="flex items-center gap-1 px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs transition-colors"
                    >
                      <EyeOff className="w-3 h-3" />
                      Disable
                    </button>
                    <button
                      onClick={() => onResolveConflict?.(conflict.pluginId, 'remove')}
                      className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependency Tree */}
      {dependencyTree && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Link className="w-5 h-5 text-purple-500" />
              Dependency Tree
            </h3>
            <button
              onClick={() => setShowFullTree(!showFullTree)}
              className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
            >
              {showFullTree ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showFullTree ? 'Collapse' : 'Expand All'}
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4">
            {showFullTree ? (
              <div className="space-y-2">
                {renderDependencyNode(dependencyTree)}
              </div>
            ) : (
              <div className="space-y-2">
                {renderDependencyNode(dependencyTree, 0)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline display
export function PluginDependencyIndicator({ 
  pluginId, 
  serverId, 
  onShowDetails 
}: { 
  pluginId: string; 
  serverId: string; 
  onShowDetails?: () => void; 
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'conflicts' | 'missing'>('loading');
  const [count, setCount] = useState({ conflicts: 0, missing: 0 });
  
  const apiClient = new ApiClient();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiClient.get<DependencyCheck>(`/servers/${serverId}/plugins/${pluginId}/dependencies`);
        
        if (response.success && response.data) {
          const { canInstall, conflicts, dependencies } = response.data;
          
          if (canInstall) {
            setStatus('ready');
          } else if (conflicts.length > 0) {
            setStatus('conflicts');
            setCount(prev => ({ ...prev, conflicts: conflicts.length }));
          } else if (dependencies.missingDependencies.length > 0) {
            setStatus('missing');
            setCount(prev => ({ ...prev, missing: dependencies.missingDependencies.length }));
          }
        }
      } catch (err) {
        setStatus('ready'); // Assume ready on error
      }
    };

    checkStatus();
  }, [pluginId, serverId]);

  const getIndicator = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner size="sm" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'conflicts':
        return (
          <div className="flex items-center gap-1">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-400">{count.conflicts}</span>
          </div>
        );
      case 'missing':
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-yellow-400">{count.missing}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onShowDetails}
      className="flex items-center gap-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
      title="View dependency details"
    >
      {getIndicator()}
      <span className="text-xs text-gray-300">
        {status === 'ready' && 'Ready'}
        {status === 'conflicts' && 'Conflicts'}
        {status === 'missing' && 'Missing Deps'}
        {status === 'loading' && 'Checking...'}
      </span>
    </button>
  );
}