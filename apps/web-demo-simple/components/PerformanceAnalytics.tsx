'use client';

import { useState, useEffect } from 'react';
import { 
  ServerMetrics, 
  PerformanceReport, 
  PerformanceInsight, 
  Recommendation 
} from '@/types/server-monitoring';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Lightbulb,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Maximize,
  Minimize,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MoreHorizontal,
  Eye,
  EyeOff,
  Settings,
  Play,
  Pause,
  Square,
  RotateCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  X,
  Check,
  Star,
  Award,
  Crown,
  Medal,
  Trophy,
  Flame,
  Snowflake,
  Thermometer,
  Gauge,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Users,
  Gamepad2,
  Server,
  Database,
  Cloud,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Wifi,
  Signal,
  Battery,
  Power,
  Lock,
  Unlock,
  Shield,
  Key,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Home,
  Building,
  Search,
  Bell,
  BellOff,
  Bookmark,
  BookmarkPlus,
  Flag,
  Share2,
  Copy,
  ExternalLink,
  Upload,
  FileText,
  Folder,
  Archive,
  Layers,
  Grid,
  List,
  LayoutDashboard,
  LayoutGrid
} from 'lucide-react';

interface PerformanceAnalyticsProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
  timeRange: 'hour' | 'day' | 'week' | 'month';
  onTimeRangeChange: (range: 'hour' | 'day' | 'week' | 'month') => void;
}

interface MetricSeries {
  timestamp: Date;
  value: number;
  label?: string;
}

interface PerformanceMetrics {
  cpu: MetricSeries[];
  memory: MetricSeries[];
  disk: MetricSeries[];
  network: {
    inbound: MetricSeries[];
    outbound: MetricSeries[];
    latency: MetricSeries[];
  };
  game: {
    playerCount: MetricSeries[];
    tps: MetricSeries[];
    mspt: MetricSeries[];
  };
}

interface BenchmarkData {
  category: string;
  metric: string;
  current: number;
  average: number;
  best: number;
  percentile: number;
  trend: 'up' | 'down' | 'stable';
}

export default function PerformanceAnalytics({ 
  serverId, 
  serverName, 
  userRole, 
  timeRange, 
  onTimeRangeChange 
}: PerformanceAnalyticsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [expandedInsights, setExpandedInsights] = useState<Set<string>>(new Set());

  // Generate mock time-series data
  const generateMetricSeries = (baseValue: number, variance: number, points: number): MetricSeries[] => {
    const now = new Date();
    const interval = timeRange === 'hour' ? 60000 : // 1 minute
                    timeRange === 'day' ? 3600000 : // 1 hour
                    timeRange === 'week' ? 86400000 : // 1 day
                    2592000000; // 30 days for month

    return Array.from({ length: points }, (_, i) => ({
      timestamp: new Date(now.getTime() - (points - 1 - i) * interval),
      value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance))
    }));
  };

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      const dataPoints = timeRange === 'hour' ? 60 :
                         timeRange === 'day' ? 24 :
                         timeRange === 'week' ? 7 : 30;

      // Mock performance metrics
      const mockMetrics: PerformanceMetrics = {
        cpu: generateMetricSeries(65, 30, dataPoints),
        memory: generateMetricSeries(45, 20, dataPoints),
        disk: generateMetricSeries(30, 15, dataPoints),
        network: {
          inbound: generateMetricSeries(25, 40, dataPoints),
          outbound: generateMetricSeries(15, 25, dataPoints),
          latency: generateMetricSeries(35, 30, dataPoints)
        },
        game: {
          playerCount: generateMetricSeries(47, 25, dataPoints),
          tps: generateMetricSeries(85, 15, dataPoints),
          mspt: generateMetricSeries(25, 20, dataPoints)
        }
      };

      // Mock performance insights
      const mockInsights: PerformanceInsight[] = [
        {
          type: 'trend',
          title: 'CPU Usage Trending Upward',
          description: 'CPU usage has increased by 15% over the last 24 hours, reaching peaks of 85% during prime time.',
          severity: 'warning',
          confidence: 87,
          data: {
            current: 72.3,
            previous: 58.1,
            change: 14.2,
            peakTime: '8:00 PM - 11:00 PM'
          },
          actionable: true
        },
        {
          type: 'anomaly',
          title: 'Memory Usage Spike Detected',
          description: 'Unusual memory consumption pattern detected around 3:30 AM, possibly due to automated backup process.',
          severity: 'info',
          confidence: 94,
          data: {
            anomalyTime: '3:32 AM',
            normalRange: '35-50%',
            spikeValue: '78%',
            duration: '23 minutes'
          },
          actionable: false
        },
        {
          type: 'prediction',
          title: 'Disk Space Forecast',
          description: 'Based on current growth patterns, disk space will reach 80% capacity in approximately 18 days.',
          severity: 'warning',
          confidence: 76,
          data: {
            currentUsage: '52%',
            projectedDate: '2024-02-15',
            growthRate: '1.2GB/day',
            recommendedAction: 'Schedule cleanup or upgrade storage'
          },
          actionable: true
        },
        {
          type: 'correlation',
          title: 'Player Count vs Performance',
          description: 'Strong correlation detected between player count and server TPS. Performance degrades when player count exceeds 70.',
          severity: 'info',
          confidence: 91,
          data: {
            correlationCoefficient: 0.78,
            threshold: 70,
            impactPerPlayer: '0.2 TPS decrease',
            recommendation: 'Consider load balancing'
          },
          actionable: true
        }
      ];

      // Mock recommendations
      const mockRecommendations: Recommendation[] = [
        {
          id: '1',
          type: 'performance',
          priority: 'high',
          title: 'Optimize JVM Garbage Collection',
          description: 'Current GC settings are causing performance hiccups. Switching to G1GC with optimized heap settings could improve TPS by 15-20%.',
          impact: '+3.2 TPS average, -35% GC pause time',
          effort: 'medium',
          estimatedBenefit: '15-20% performance improvement',
          implementation: {
            steps: [
              'Update server startup script with G1GC flags',
              'Set -XX:MaxGCPauseMillis=200 for reduced pause times',
              'Adjust heap size to 75% of available RAM',
              'Monitor performance for 24 hours',
              'Fine-tune based on metrics'
            ],
            automatable: true,
            riskLevel: 'low'
          },
          links: {
            documentation: 'https://docs.oracle.com/en/java/javase/17/gctuning/',
            tutorial: 'https://homehost.com/guides/gc-optimization'
          }
        },
        {
          id: '2',
          type: 'capacity',
          priority: 'medium',
          title: 'Increase RAM Allocation',
          description: 'Memory usage consistently above 80% during peak hours. Additional RAM allocation would prevent memory pressure.',
          impact: 'Reduced memory pressure, improved stability',
          effort: 'low',
          estimatedBenefit: 'Eliminate memory-related lag spikes',
          implementation: {
            steps: [
              'Increase server RAM allocation from 8GB to 12GB',
              'Update max heap size in startup script',
              'Monitor memory usage patterns',
              'Adjust allocation based on utilization'
            ],
            automatable: false,
            riskLevel: 'low'
          },
          links: {
            documentation: 'https://homehost.com/docs/memory-management'
          }
        },
        {
          id: '3',
          type: 'security',
          priority: 'critical',
          title: 'Enable Automatic Backups',
          description: 'No automated backup system detected. Regular backups are essential for data protection and disaster recovery.',
          impact: 'Data protection, quick recovery capability',
          effort: 'low',
          estimatedBenefit: 'Complete data protection against loss',
          implementation: {
            steps: [
              'Configure automated daily backups',
              'Set up backup rotation (7 daily, 4 weekly, 12 monthly)',
              'Test backup restoration process',
              'Monitor backup success and storage usage'
            ],
            automatable: true,
            riskLevel: 'low'
          },
          links: {
            documentation: 'https://homehost.com/docs/backup-configuration',
            tutorial: 'https://homehost.com/guides/backup-setup'
          }
        }
      ];

      // Mock benchmark data
      const mockBenchmarks: BenchmarkData[] = [
        {
          category: 'Performance',
          metric: 'Average TPS',
          current: 19.2,
          average: 18.5,
          best: 20.0,
          percentile: 73,
          trend: 'up'
        },
        {
          category: 'Performance',
          metric: 'Server Response Time',
          current: 23,
          average: 28,
          best: 15,
          percentile: 82,
          trend: 'up'
        },
        {
          category: 'Resource',
          metric: 'CPU Efficiency',
          current: 67,
          average: 71,
          best: 85,
          percentile: 45,
          trend: 'down'
        },
        {
          category: 'Resource',
          metric: 'Memory Usage',
          current: 52,
          average: 48,
          best: 35,
          percentile: 38,
          trend: 'stable'
        }
      ];

      setMetrics(mockMetrics);
      setInsights(mockInsights);
      setRecommendations(mockRecommendations);
      setBenchmarks(mockBenchmarks);
      setLoading(false);
    };

    const timer = setTimeout(initializeData, 1000);
    return () => clearTimeout(timer);
  }, [timeRange, serverId]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time data updates
      if (metrics) {
        setMetrics(prev => {
          if (!prev) return prev;
          
          // Add new data point and remove oldest for real-time effect
          const newTimestamp = new Date();
          return {
            ...prev,
            cpu: [
              ...prev.cpu.slice(1),
              {
                timestamp: newTimestamp,
                value: Math.max(0, Math.min(100, prev.cpu[prev.cpu.length - 1].value + (Math.random() - 0.5) * 10))
              }
            ]
          };
        });
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, metrics]);

  const toggleInsightExpansion = (index: number) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(index.toString())) {
      newExpanded.delete(index.toString());
    } else {
      newExpanded.add(index.toString());
    }
    setExpandedInsights(newExpanded);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeRange = (range: string) => {
    switch (range) {
      case 'hour': return 'Last Hour';
      case 'day': return 'Last 24 Hours';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      default: return range;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading performance analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
            <p className="text-gray-600">{serverName} - {formatTimeRange(timeRange)}</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['hour', 'day', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => onTimeRangeChange(range as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range === 'hour' ? '1H' : range === 'day' ? '24H' : range === 'week' ? '7D' : '30D'}
                </button>
              ))}
            </div>
            
            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              {autoRefresh ? <RefreshCw className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            {/* Export Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Chart Tabs">
            {[
              { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'cpu', label: 'CPU', icon: <Cpu className="w-4 h-4" /> },
              { id: 'memory', label: 'Memory', icon: <Memory className="w-4 h-4" /> },
              { id: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
              { id: 'game', label: 'Game Performance', icon: <Gamepad2 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                className={`
                  relative py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                  ${activeChart === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeChart === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Chart Content */}
        <div className="p-6">
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {activeChart === 'overview' ? 'Performance Overview' :
                 activeChart === 'cpu' ? 'CPU Usage Trends' :
                 activeChart === 'memory' ? 'Memory Usage Patterns' :
                 activeChart === 'network' ? 'Network Traffic Analysis' :
                 'Game Performance Metrics'}
              </h3>
              <p className="text-gray-500">Interactive charts would be rendered here</p>
              <p className="text-sm text-gray-400 mt-1">
                Showing {metrics ? `${metrics.cpu.length} data points` : 'no data'} for {formatTimeRange(timeRange)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
            <span className="text-sm text-gray-500">{insights.length} insights found</span>
          </div>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleInsightExpansion(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(insight.severity)}`}>
                        {insight.type === 'trend' && <TrendingUp className="w-4 h-4" />}
                        {insight.type === 'anomaly' && <AlertTriangle className="w-4 h-4" />}
                        {insight.type === 'prediction' && <Target className="w-4 h-4" />}
                        {insight.type === 'correlation' && <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{insight.title}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(insight.severity)}`}>
                            {insight.severity}
                          </span>
                          <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                        </div>
                        <p className="text-gray-600 mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {insight.actionable && (
                        <Lightbulb className="w-4 h-4 text-yellow-500" title="Actionable insight" />
                      )}
                      {expandedInsights.has(index.toString()) ? 
                        <ChevronUp className="w-4 h-4 text-gray-400" /> : 
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>
                </div>
                
                {expandedInsights.has(index.toString()) && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Additional Details</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries(insight.data).map(([key, value]) => (
                          <div key={key}>
                            <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                            <span className="font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
            <span className="text-sm text-gray-500">{recommendations.length} recommendations</span>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{rec.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                      <span className="text-xs text-gray-500">{rec.effort} effort</span>
                    </div>
                    <p className="text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {rec.implementation.automatable && (
                      <Zap className="w-4 h-4 text-blue-500" title="Can be automated" />
                    )}
                    <span className={`w-2 h-2 rounded-full ${
                      rec.implementation.riskLevel === 'low' ? 'bg-green-500' :
                      rec.implementation.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} title={`${rec.implementation.riskLevel} risk`} />
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">Expected Impact:</div>
                    <div className="text-gray-600">{rec.impact}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Type: {rec.type}</span>
                    <span>Benefit: {rec.estimatedBenefit}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {rec.links.documentation && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Performance Benchmarks</h3>
            <span className="text-sm text-gray-500">vs similar servers</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benchmarks.map((benchmark, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{benchmark.metric}</h4>
                    <span className="text-sm text-gray-500">{benchmark.category}</span>
                  </div>
                  {getTrendIcon(benchmark.trend)}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Your Server</span>
                    <span className="font-medium">{benchmark.current}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average</span>
                    <span>{benchmark.average}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Best</span>
                    <span className="text-green-600">{benchmark.best}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Percentile</span>
                    <span className={`font-medium ${
                      benchmark.percentile >= 75 ? 'text-green-600' :
                      benchmark.percentile >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {benchmark.percentile}th
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}