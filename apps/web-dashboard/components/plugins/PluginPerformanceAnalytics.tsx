'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
  Target,
  Gauge
} from 'lucide-react';

interface PluginPerformanceData {
  pluginId: string;
  pluginName: string;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIO: number;
    uptime: number;
    errorRate: number;
    responseTime: number;
    throughput: number;
  };
  trends: {
    cpuTrend: 'up' | 'down' | 'stable';
    memoryTrend: 'up' | 'down' | 'stable';
    performanceTrend: 'up' | 'down' | 'stable';
  };
  history: Array<{
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    responseTime: number;
    errorCount: number;
  }>;
  health: {
    status: 'excellent' | 'good' | 'warning' | 'critical';
    score: number;
    issues: string[];
    recommendations: string[];
  };
}

interface PluginPerformanceAnalyticsProps {
  serverId: string;
  pluginId?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d';
}

export default function PluginPerformanceAnalytics({
  serverId,
  pluginId,
  timeRange = '24h'
}: PluginPerformanceAnalyticsProps) {
  const [performanceData, setPerformanceData] = useState<PluginPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'cpu' | 'memory' | 'response' | 'errors'>('cpu');
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadPerformanceData();
  }, [serverId, pluginId, selectedTimeRange]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Since we don't have a real analytics endpoint, we'll simulate the data
      const mockData = generateMockPerformanceData();
      setPerformanceData(mockData);
    } catch (err) {
      setError('Failed to load performance analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPerformanceData = (): PluginPerformanceData[] => {
    const plugins = [
      { id: '1', name: 'AutoBackup Pro' },
      { id: '5', name: 'Performance Monitor' }
    ];

    return plugins.map(plugin => ({
      pluginId: plugin.id,
      pluginName: plugin.name,
      metrics: {
        cpuUsage: Math.random() * 15 + 5, // 5-20%
        memoryUsage: Math.random() * 200 + 50, // 50-250MB
        diskUsage: Math.random() * 100 + 20, // 20-120MB
        networkIO: Math.random() * 1000 + 100, // 100-1100 KB/s
        uptime: Math.random() * 99 + 90, // 90-99%
        errorRate: Math.random() * 0.5, // 0-0.5%
        responseTime: Math.random() * 100 + 50, // 50-150ms
        throughput: Math.random() * 1000 + 500 // 500-1500 req/min
      },
      trends: {
        cpuTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        memoryTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        performanceTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
      },
      history: generateHistoryData(),
      health: {
        status: ['excellent', 'good', 'warning', 'critical'][Math.floor(Math.random() * 4)] as any,
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        issues: plugin.id === '1' ? ['High memory usage during backup operations'] : [],
        recommendations: [
          'Consider optimizing database queries',
          'Enable compression for better performance',
          'Schedule maintenance during low-traffic periods'
        ]
      }
    }));
  };

  const generateHistoryData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        cpuUsage: Math.random() * 20 + 5,
        memoryUsage: Math.random() * 200 + 50,
        responseTime: Math.random() * 100 + 50,
        errorCount: Math.floor(Math.random() * 5)
      });
    }
    
    return data;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-500 bg-green-900';
      case 'good':
        return 'text-blue-500 bg-blue-900';
      case 'warning':
        return 'text-yellow-500 bg-yellow-900';
      case 'critical':
        return 'text-red-500 bg-red-900';
      default:
        return 'text-gray-500 bg-gray-900';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(1)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" text="Loading performance analytics..." />
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

  const aggregatedMetrics = performanceData.reduce(
    (acc, plugin) => ({
      avgCpuUsage: acc.avgCpuUsage + plugin.metrics.cpuUsage / performanceData.length,
      avgMemoryUsage: acc.avgMemoryUsage + plugin.metrics.memoryUsage / performanceData.length,
      avgResponseTime: acc.avgResponseTime + plugin.metrics.responseTime / performanceData.length,
      totalErrors: acc.totalErrors + plugin.metrics.errorRate * 100,
      avgUptime: acc.avgUptime + plugin.metrics.uptime / performanceData.length
    }),
    { avgCpuUsage: 0, avgMemoryUsage: 0, avgResponseTime: 0, totalErrors: 0, avgUptime: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="cpu">CPU Usage</option>
            <option value="memory">Memory Usage</option>
            <option value="response">Response Time</option>
            <option value="errors">Error Rate</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadPerformanceData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Average CPU Usage</h3>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{aggregatedMetrics.avgCpuUsage.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">Across all plugins</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Average Memory</h3>
            <HardDrive className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{formatBytes(aggregatedMetrics.avgMemoryUsage * 1024 * 1024)}</p>
          <p className="text-xs text-gray-500">Memory consumption</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">Response Time</h3>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">{aggregatedMetrics.avgResponseTime.toFixed(0)}ms</p>
          <p className="text-xs text-gray-500">Average response time</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-300">System Uptime</h3>
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">{aggregatedMetrics.avgUptime.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">Overall availability</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-blue-500" />
            Performance Trends
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Performance chart visualization</p>
              <p className="text-sm text-gray-500">Chart component would be rendered here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-500" />
            Resource Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Resource usage distribution</p>
              <p className="text-sm text-gray-500">Pie chart component would be rendered here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Plugin Performance Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Plugin Performance Details</h3>
        
        {performanceData.map((plugin) => (
          <div key={plugin.pluginId} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{plugin.pluginName}</h4>
                  <p className="text-sm text-gray-400">Performance Analysis</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(plugin.health.status)}`}>
                {plugin.health.status} ({plugin.health.score})
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  {getTrendIcon(plugin.trends.cpuTrend)}
                </div>
                <p className="text-lg font-bold text-white">{plugin.metrics.cpuUsage.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">CPU Usage</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <HardDrive className="w-4 h-4 text-green-400" />
                  {getTrendIcon(plugin.trends.memoryTrend)}
                </div>
                <p className="text-lg font-bold text-white">{formatBytes(plugin.metrics.memoryUsage * 1024 * 1024)}</p>
                <p className="text-xs text-gray-500">Memory</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  {getTrendIcon(plugin.trends.performanceTrend)}
                </div>
                <p className="text-lg font-bold text-white">{plugin.metrics.responseTime.toFixed(0)}ms</p>
                <p className="text-xs text-gray-500">Response Time</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-lg font-bold text-white">{plugin.metrics.errorRate.toFixed(2)}%</p>
                <p className="text-xs text-gray-500">Error Rate</p>
              </div>
            </div>
            
            {/* Issues and Recommendations */}
            {(plugin.health.issues.length > 0 || plugin.health.recommendations.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {plugin.health.issues.length > 0 && (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                    <h5 className="font-medium text-red-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Issues
                    </h5>
                    <ul className="space-y-1 text-sm text-red-200">
                      {plugin.health.issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {plugin.health.recommendations.length > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                    <h5 className="font-medium text-blue-300 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Recommendations
                    </h5>
                    <ul className="space-y-1 text-sm text-blue-200">
                      {plugin.health.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact performance widget
export function PluginPerformanceWidget({ 
  serverId, 
  pluginId, 
  pluginName 
}: { 
  serverId: string; 
  pluginId: string; 
  pluginName: string; 
}) {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading performance data
    setTimeout(() => {
      setMetrics({
        cpuUsage: Math.random() * 15 + 5,
        memoryUsage: Math.random() * 200 + 50,
        health: ['excellent', 'good', 'warning', 'critical'][Math.floor(Math.random() * 4)]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-gray-400">Loading performance...</span>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-white text-sm">{pluginName}</h4>
        <div className={`px-2 py-1 rounded text-xs ${
          metrics.health === 'excellent' ? 'bg-green-900 text-green-300' :
          metrics.health === 'good' ? 'bg-blue-900 text-blue-300' :
          metrics.health === 'warning' ? 'bg-yellow-900 text-yellow-300' :
          'bg-red-900 text-red-300'
        }`}>
          {metrics.health}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-blue-400" />
          <span className="text-gray-300">{metrics.cpuUsage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3 text-green-400" />
          <span className="text-gray-300">{metrics.memoryUsage.toFixed(0)}MB</span>
        </div>
      </div>
    </div>
  );
}