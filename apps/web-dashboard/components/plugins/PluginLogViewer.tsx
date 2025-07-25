'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  FileText,
  Filter,
  Download,
  Search,
  RefreshCw,
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
  X,
  Calendar,
  Clock,
  Terminal,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  message: string;
  source: string;
  pluginId?: string;
  pluginName?: string;
}

interface LogSummary {
  total: number;
  levels: {
    ERROR: number;
    WARN: number;
    INFO: number;
    DEBUG: number;
  };
  lastEntry: LogEntry | null;
  recentErrors: LogEntry[];
  recentWarnings: LogEntry[];
}

interface PluginLogViewerProps {
  serverId: string;
  pluginId?: string;
  pluginName?: string;
  compact?: boolean;
  maxHeight?: string;
}

export default function PluginLogViewer({
  serverId,
  pluginId,
  pluginName,
  compact = false,
  maxHeight = '500px'
}: PluginLogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [showSummary, setShowSummary] = useState(true);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  
  const logContainerRef = useRef<HTMLDivElement>(null);
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  
  const apiClient = new ApiClient();

  useEffect(() => {
    loadLogs();
    if (pluginId) {
      loadSummary();
    }
  }, [serverId, pluginId, levelFilter]);

  useEffect(() => {
    if (autoRefresh) {
      autoRefreshInterval.current = setInterval(loadLogs, 5000);
    } else if (autoRefreshInterval.current) {
      clearInterval(autoRefreshInterval.current);
    }
    
    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [autoRefresh]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = pluginId 
        ? `/servers/${serverId}/plugins/${pluginId}/logs`
        : `/servers/${serverId}/logs`;

      const params = new URLSearchParams({
        limit: '100',
        offset: '0'
      });

      if (levelFilter !== 'ALL') {
        params.append('level', levelFilter);
      }

      const response = await apiClient.get<{
        logs: LogEntry[];
        total: number;
        offset: number;
        limit: number;
      }>(`${endpoint}?${params}`);

      if (response.success && response.data) {
        setLogs(response.data.logs);
      } else {
        setError(response.error?.message || 'Failed to load logs');
      }
    } catch (err) {
      setError('Failed to load plugin logs');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!pluginId) return;

    try {
      const response = await apiClient.get<LogSummary>(`/servers/${serverId}/plugins/${pluginId}/logs/summary`);
      
      if (response.success && response.data) {
        setSummary(response.data);
      }
    } catch (err) {
      // Summary is optional, fail silently
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'WARN':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'DEBUG':
        return <Bug className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-900 text-red-200 border-red-700';
      case 'WARN':
        return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'INFO':
        return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'DEBUG':
        return 'bg-gray-900 text-gray-200 border-gray-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const filteredLogs = logs.filter(log => {
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" text="Loading logs..." />
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

  return (
    <div className="space-y-4">
      {/* Summary */}
      {summary && showSummary && !compact && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Log Summary</h3>
            <button
              onClick={() => setShowSummary(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-red-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-200">Errors</span>
              </div>
              <span className="text-xl font-bold text-red-100">{summary.levels.ERROR}</span>
            </div>
            
            <div className="bg-yellow-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-200">Warnings</span>
              </div>
              <span className="text-xl font-bold text-yellow-100">{summary.levels.WARN}</span>
            </div>
            
            <div className="bg-blue-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-200">Info</span>
              </div>
              <span className="text-xl font-bold text-blue-100">{summary.levels.INFO}</span>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Bug className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-200">Debug</span>
              </div>
              <span className="text-xl font-bold text-gray-100">{summary.levels.DEBUG}</span>
            </div>
          </div>
          
          {summary.lastEntry && (
            <div className="text-sm text-gray-400">
              Last entry: {formatTimestamp(summary.lastEntry.timestamp)}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Levels</option>
            <option value="ERROR">Error</option>
            <option value="WARN">Warning</option>
            <option value="INFO">Info</option>
            <option value="DEBUG">Debug</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {autoRefresh ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            Auto-refresh
          </button>
        </div>
      </div>

      {/* Log Entries */}
      <div 
        ref={logContainerRef}
        className={`space-y-2 overflow-y-auto ${compact ? 'max-h-64' : ''}`}
        style={!compact ? { maxHeight } : {}}
      >
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogs.has(log.id);
          const logText = `[${formatTimestamp(log.timestamp)}] ${log.level}: ${log.message}`;
          
          return (
            <div
              key={log.id}
              className={`rounded-lg border p-3 ${getLevelColor(log.level)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getLevelIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium opacity-75">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      {log.pluginName && (
                        <>
                          <span className="text-xs opacity-50">•</span>
                          <span className="text-xs font-medium opacity-75">
                            {log.pluginName}
                          </span>
                        </>
                      )}
                    </div>
                    <p className={`text-sm ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {log.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyToClipboard(logText, log.id)}
                    className="p-1 hover:bg-black/20 rounded transition-colors"
                    title="Copy log entry"
                  >
                    {copied === log.id ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 opacity-60" />
                    )}
                  </button>
                  
                  {log.message.length > 100 && (
                    <button
                      onClick={() => toggleLogExpansion(log.id)}
                      className="p-1 hover:bg-black/20 rounded transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 opacity-60" />
                      ) : (
                        <ChevronDown className="w-4 h-4 opacity-60" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLogs.length === 0 && !loading && (
        <div className="text-center py-8">
          <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No logs found</h3>
          <p className="text-gray-500">
            {searchTerm || levelFilter !== 'ALL' 
              ? 'Try adjusting your search or filters'
              : 'No log entries available for this plugin'
            }
          </p>
        </div>
      )}
    </div>
  );
}

// Compact log summary component
export function PluginLogSummary({ 
  serverId, 
  pluginId, 
  onViewLogs 
}: { 
  serverId: string; 
  pluginId: string; 
  onViewLogs?: () => void; 
}) {
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  const apiClient = new ApiClient();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await apiClient.get<LogSummary>(`/servers/${serverId}/plugins/${pluginId}/logs/summary`);
        
        if (response.success && response.data) {
          setSummary(response.data);
        }
      } catch (err) {
        // Fail silently
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [serverId, pluginId]);

  if (loading || !summary) {
    return null;
  }

  const hasIssues = summary.levels.ERROR > 0 || summary.levels.WARN > 0;

  return (
    <button
      onClick={onViewLogs}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
        hasIssues 
          ? 'bg-red-900 hover:bg-red-800 text-red-200' 
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      <FileText className="w-4 h-4" />
      <span>Logs</span>
      {summary.levels.ERROR > 0 && (
        <span className="px-2 py-1 bg-red-700 text-red-200 text-xs rounded">
          {summary.levels.ERROR}
        </span>
      )}
      {summary.levels.WARN > 0 && (
        <span className="px-2 py-1 bg-yellow-700 text-yellow-200 text-xs rounded">
          {summary.levels.WARN}
        </span>
      )}
    </button>
  );
}