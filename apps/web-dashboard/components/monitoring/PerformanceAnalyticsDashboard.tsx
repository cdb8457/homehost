'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Users,
  Server,
  Clock,
  Target,
  Award,
  Zap,
  Brain,
  Eye,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Maximize,
  Minimize,
  Grid3X3,
  List,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Copy,
  ExternalLink,
  Share2,
  Bookmark,
  Flag,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Fire,
  Star,
  Crown,
  Shield,
  Globe,
  Database,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Play,
  Pause,
  Square,
  RotateCcw,
  Hash,
  AtSign,
  Tag,
  Link,
  FileText,
  Camera,
  Video,
  Mic,
  Mail,
  Phone,
  Bell,
  BellOff,
  Heart,
  ThumbsUp,
  MessageCircle,
  Gamepad2
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  unit: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  baseline: number;
  threshold: {
    warning: number;
    critical: number;
  };
  historicalData: DataPoint[];
  prediction: PredictionData;
}

interface DataPoint {
  timestamp: number;
  value: number;
  label?: string;
  anomaly?: boolean;
}

interface PredictionData {
  nextHour: number;
  next24Hours: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  factors: string[];
}

interface PerformanceReport {
  id: string;
  serverId: string;
  serverName: string;
  period: string;
  generatedAt: string;
  summary: {
    overallScore: number;
    availability: number;
    reliability: number;
    efficiency: number;
    userSatisfaction: number;
  };
  metrics: PerformanceMetric[];
  insights: PerformanceInsight[];
  recommendations: Recommendation[];
  comparisons: ServerComparison[];
}

interface PerformanceInsight {
  id: string;
  type: 'optimization' | 'bottleneck' | 'trend' | 'anomaly' | 'capacity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  timeframe: string;
  affectedMetrics: string[];
  relatedEvents: string[];
}

interface Recommendation {
  id: string;
  category: 'performance' | 'capacity' | 'cost' | 'reliability' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  cost: 'low' | 'medium' | 'high';
  timeline: string;
  prerequisites: string[];
  steps: string[];
  metrics: string[];
}

interface ServerComparison {
  serverId: string;
  serverName: string;
  metric: string;
  value: number;
  rank: number;
  percentile: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface Benchmark {
  id: string;
  name: string;
  category: string;
  description: string;
  metrics: BenchmarkMetric[];
  results: BenchmarkResult[];
  industry: IndustryBenchmark[];
}

interface BenchmarkMetric {
  name: string;
  unit: string;
  target: number;
  weight: number;
}

interface BenchmarkResult {
  serverId: string;
  serverName: string;
  score: number;
  rank: number;
  results: { metric: string; value: number; score: number }[];
}

interface IndustryBenchmark {
  percentile: number;
  value: number;
  description: string;
}

interface AnalyticsConfig {
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d' | '90d';
  refreshInterval: number;
  autoRefresh: boolean;
  selectedMetrics: string[];
  comparisonMode: 'servers' | 'timeperiods' | 'benchmarks';
  chartType: 'line' | 'area' | 'bar' | 'scatter';
  aggregation: 'avg' | 'min' | 'max' | 'sum' | 'p95' | 'p99';
  anomalyDetection: boolean;
  predictiveAnalysis: boolean;
}

export function PerformanceAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [selectedReport, setSelectedReport] = useState<PerformanceReport | null>(null);
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [config, setConfig] = useState<AnalyticsConfig>({
    timeRange: '24h',
    refreshInterval: 60000,
    autoRefresh: true,
    selectedMetrics: ['cpu', 'memory', 'disk', 'network', 'players'],
    comparisonMode: 'servers',
    chartType: 'line',
    aggregation: 'avg',
    anomalyDetection: true,
    predictiveAnalysis: true
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'comparisons' | 'benchmarks' | 'insights'>('overview');
  const [showConfig, setShowConfig] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString()
  });
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAnalyticsData();
    
    if (config.autoRefresh) {
      const interval = setInterval(loadAnalyticsData, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [config.timeRange, config.autoRefresh, config.refreshInterval]);

  const loadAnalyticsData = async () => {
    try {
      if (reports.length === 0) {
        setLoading(true);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReports(generateMockReports());
      setBenchmarks(generateMockBenchmarks());
      
      if (!selectedReport && reports.length > 0) {
        setSelectedReport(reports[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockReports = (): PerformanceReport[] => {
    const servers = ['Minecraft Main', 'Valheim Creative', 'Rust PvP', 'CS:GO Casual', 'ARK Survival'];
    
    return servers.map((serverName, i) => ({
      id: `report-${i + 1}`,
      serverId: `server-${i + 1}`,
      serverName,
      period: config.timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        overallScore: 75 + Math.random() * 20,
        availability: 95 + Math.random() * 5,
        reliability: 85 + Math.random() * 10,
        efficiency: 70 + Math.random() * 25,
        userSatisfaction: 80 + Math.random() * 15
      },
      metrics: generateMockMetrics(),
      insights: generateMockInsights(),
      recommendations: generateMockRecommendations(),
      comparisons: generateMockComparisons(servers, i)
    }));
  };

  const generateMockMetrics = (): PerformanceMetric[] => {
    const metricDefinitions = [
      { id: 'cpu', name: 'CPU Usage', unit: '%', baseline: 50, warning: 70, critical: 90 },
      { id: 'memory', name: 'Memory Usage', unit: '%', baseline: 60, warning: 80, critical: 95 },
      { id: 'disk', name: 'Disk Usage', unit: '%', baseline: 40, warning: 85, critical: 95 },
      { id: 'network', name: 'Network Latency', unit: 'ms', baseline: 50, warning: 100, critical: 200 },
      { id: 'players', name: 'Player Count', unit: 'players', baseline: 10, warning: 18, critical: 20 },
      { id: 'tps', name: 'Ticks Per Second', unit: 'TPS', baseline: 20, warning: 15, critical: 10 },
      { id: 'response_time', name: 'Response Time', unit: 'ms', baseline: 100, warning: 500, critical: 1000 },
      { id: 'error_rate', name: 'Error Rate', unit: '%', baseline: 0.1, warning: 1, critical: 5 }
    ];

    return metricDefinitions.map(def => {
      const currentValue = def.baseline + (Math.random() - 0.5) * def.baseline * 0.5;
      const previousValue = currentValue + (Math.random() - 0.5) * 10;
      const change = currentValue - previousValue;
      const changePercent = previousValue !== 0 ? (change / previousValue) * 100 : 0;
      
      // Generate historical data
      const historicalData: DataPoint[] = [];
      const points = config.timeRange === '1h' ? 60 : config.timeRange === '6h' ? 72 : config.timeRange === '24h' ? 96 : 168;
      const interval = config.timeRange === '1h' ? 60000 : config.timeRange === '6h' ? 300000 : config.timeRange === '24h' ? 900000 : 3600000;
      
      for (let i = points; i >= 0; i--) {
        const timestamp = Date.now() - (i * interval);
        const baseValue = def.baseline + Math.sin(i / 10) * def.baseline * 0.2;
        const noise = (Math.random() - 0.5) * def.baseline * 0.1;
        const value = Math.max(0, baseValue + noise);
        const anomaly = Math.random() > 0.95; // 5% chance of anomaly
        
        historicalData.push({
          timestamp,
          value: anomaly ? value * (1.5 + Math.random()) : value,
          anomaly
        });
      }
      
      return {
        id: def.id,
        name: def.name,
        unit: def.unit,
        currentValue,
        previousValue,
        change,
        changePercent,
        trend: changePercent > 1 ? 'up' : changePercent < -1 ? 'down' : 'stable',
        baseline: def.baseline,
        threshold: {
          warning: def.warning,
          critical: def.critical
        },
        historicalData,
        prediction: {
          nextHour: currentValue + (Math.random() - 0.5) * 5,
          next24Hours: currentValue + (Math.random() - 0.5) * 15,
          confidence: 70 + Math.random() * 25,
          trend: Math.random() > 0.5 ? 'increasing' : Math.random() > 0.5 ? 'decreasing' : 'stable',
          factors: ['increased player activity', 'resource contention', 'background processes'].slice(0, Math.floor(Math.random() * 3) + 1)
        }
      };
    });
  };

  const generateMockInsights = (): PerformanceInsight[] => {
    const insights = [
      {
        type: 'bottleneck' as const,
        severity: 'warning' as const,
        title: 'Memory bottleneck detected',
        description: 'Memory usage has consistently exceeded 80% during peak hours',
        impact: 'Potential performance degradation and increased latency',
        affectedMetrics: ['memory', 'response_time'],
        timeframe: 'Last 6 hours'
      },
      {
        type: 'trend' as const,
        severity: 'info' as const,
        title: 'Increasing player activity trend',
        description: 'Player count has shown a steady 15% increase over the past week',
        impact: 'May require capacity planning for continued growth',
        affectedMetrics: ['players', 'cpu', 'network'],
        timeframe: 'Last 7 days'
      },
      {
        type: 'optimization' as const,
        severity: 'info' as const,
        title: 'CPU optimization opportunity',
        description: 'CPU usage patterns suggest inefficient resource allocation',
        impact: 'Potential 20% performance improvement with optimization',
        affectedMetrics: ['cpu', 'tps'],
        timeframe: 'Ongoing'
      }
    ];

    return insights.slice(0, Math.floor(Math.random() * 3) + 1).map((insight, i) => ({
      id: `insight-${i + 1}`,
      ...insight,
      confidence: 70 + Math.random() * 25,
      relatedEvents: [`event-${i + 1}`, `event-${i + 2}`]
    }));
  };

  const generateMockRecommendations = (): Recommendation[] => {
    const recommendations = [
      {
        category: 'performance' as const,
        priority: 'high' as const,
        title: 'Increase memory allocation',
        description: 'Add 4GB RAM to prevent memory bottlenecks during peak usage',
        expectedImpact: '25% reduction in response time, improved stability',
        effort: 'low' as const,
        cost: 'medium' as const,
        timeline: '1-2 days',
        steps: ['Schedule maintenance window', 'Add memory modules', 'Restart server', 'Monitor performance']
      },
      {
        category: 'capacity' as const,
        priority: 'medium' as const,
        title: 'Implement auto-scaling',
        description: 'Configure automatic resource scaling based on player demand',
        expectedImpact: 'Improved resource efficiency and cost optimization',
        effort: 'high' as const,
        cost: 'low' as const,
        timeline: '1-2 weeks',
        steps: ['Design scaling policies', 'Implement monitoring triggers', 'Test scaling behavior', 'Deploy to production']
      },
      {
        category: 'optimization' as const,
        priority: 'low' as const,
        title: 'Optimize database queries',
        description: 'Review and optimize slow database queries affecting performance',
        expectedImpact: '15% improvement in response time',
        effort: 'medium' as const,
        cost: 'low' as const,
        timeline: '3-5 days',
        steps: ['Identify slow queries', 'Analyze execution plans', 'Implement optimizations', 'Monitor improvements']
      }
    ];

    return recommendations.slice(0, Math.floor(Math.random() * 3) + 1).map((rec, i) => ({
      id: `recommendation-${i + 1}`,
      ...rec,
      prerequisites: ['server_access', 'maintenance_window'],
      metrics: ['cpu', 'memory', 'response_time']
    }));
  };

  const generateMockComparisons = (servers: string[], currentIndex: number): ServerComparison[] => {
    const metrics = ['cpu', 'memory', 'players', 'tps'];
    
    return metrics.map(metric => ({
      serverId: `server-${currentIndex + 1}`,
      serverName: servers[currentIndex],
      metric,
      value: 50 + Math.random() * 40,
      rank: Math.floor(Math.random() * servers.length) + 1,
      percentile: Math.floor(Math.random() * 100),
      trend: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)] as any
    }));
  };

  const generateMockBenchmarks = (): Benchmark[] => {
    return [
      {
        id: 'benchmark-1',
        name: 'Gaming Server Performance',
        category: 'Performance',
        description: 'Standard benchmark for gaming server performance metrics',
        metrics: [
          { name: 'CPU Usage', unit: '%', target: 60, weight: 0.3 },
          { name: 'Memory Usage', unit: '%', target: 70, weight: 0.25 },
          { name: 'Response Time', unit: 'ms', target: 100, weight: 0.25 },
          { name: 'TPS', unit: 'TPS', target: 18, weight: 0.2 }
        ],
        results: reports.map((report, i) => ({
          serverId: report.serverId,
          serverName: report.serverName,
          score: 70 + Math.random() * 25,
          rank: i + 1,
          results: report.metrics.slice(0, 4).map(metric => ({
            metric: metric.name,
            value: metric.currentValue,
            score: Math.min(100, (metric.baseline / metric.currentValue) * 100)
          }))
        })),
        industry: [
          { percentile: 90, value: 85, description: 'Top 10% of gaming servers' },
          { percentile: 75, value: 75, description: 'Above average performance' },
          { percentile: 50, value: 65, description: 'Average performance' },
          { percentile: 25, value: 55, description: 'Below average performance' }
        ]
      }
    ];
  };

  const getMetricColor = (metric: PerformanceMetric) => {
    if (metric.currentValue >= metric.threshold.critical) return 'text-red-600';
    if (metric.currentValue >= metric.threshold.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string, changePercent: number) => {
    if (trend === 'stable') return 'text-gray-500';
    if (Math.abs(changePercent) > 20) return 'text-red-500';
    return trend === 'up' ? 'text-green-500' : 'text-blue-500';
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'ms') return `${value.toFixed(0)}ms`;
    if (unit === 'TPS') return `${value.toFixed(1)} TPS`;
    return `${value.toFixed(1)} ${unit}`;
  };

  const generateChart = (metric: PerformanceMetric) => {
    if (!chartRef.current) return null;

    const width = 300;
    const height = 100;
    const data = metric.historicalData.slice(-50); // Last 50 points
    
    if (data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((point, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((point.value - minValue) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
        <defs>
          <linearGradient id={`gradient-${metric.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={getMetricColor(metric).includes('red') ? '#ef4444' : getMetricColor(metric).includes('yellow') ? '#f59e0b' : '#10b981'} stopOpacity={0.3} />
            <stop offset="100%" stopColor={getMetricColor(metric).includes('red') ? '#ef4444' : getMetricColor(metric).includes('yellow') ? '#f59e0b' : '#10b981'} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={getMetricColor(metric).includes('red') ? '#ef4444' : getMetricColor(metric).includes('yellow') ? '#f59e0b' : '#10b981'}
          strokeWidth="2"
          points={points}
        />
        <polygon
          fill={`url(#gradient-${metric.id})`}
          points={`0,${height} ${points} ${width},${height}`}
        />
        {/* Anomaly markers */}
        {data.map((point, i) => {
          if (!point.anomaly) return null;
          const x = (i / (data.length - 1)) * width;
          const y = height - ((point.value - minValue) / range) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#ef4444"
              className="opacity-75"
            />
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
          <p className="text-gray-600">Advanced insights and predictive analysis for server performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={config.timeRange}
            onChange={(e) => setConfig(prev => ({ ...prev, timeRange: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={() => setConfig(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }))}
            className={`inline-flex items-center px-3 py-2 rounded-lg border ${
              config.autoRefresh
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-gray-100 text-gray-700 border-gray-300'
            }`}
          >
            {config.autoRefresh ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Auto Refresh
          </button>
          <button
            onClick={() => setShowConfig(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </button>
        </div>
      </div>

      {/* Server Selector */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Server Selection</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {reports.map(report => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report)}
              className={`p-3 rounded-lg border text-left transition-colors ${
                selectedReport?.id === report.id
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium">{report.serverName}</div>
              <div className="text-sm text-gray-600">Score: {report.summary.overallScore.toFixed(0)}</div>
              <div className="text-xs text-gray-500">{report.period}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'detailed', name: 'Detailed Metrics', icon: LineChart },
            { id: 'comparisons', name: 'Comparisons', icon: TrendingUp },
            { id: 'benchmarks', name: 'Benchmarks', icon: Target },
            { id: 'insights', name: 'AI Insights', icon: Brain }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && selectedReport && (
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Score</span>
                <Award className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{selectedReport.summary.overallScore.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Out of 100</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Availability</span>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{selectedReport.summary.availability.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Uptime</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Reliability</span>
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{selectedReport.summary.reliability.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Stability Score</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Efficiency</span>
                <Zap className="h-4 w-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{selectedReport.summary.efficiency.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Resource Usage</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">User Satisfaction</span>
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{selectedReport.summary.userSatisfaction.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Player Experience</div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedReport.metrics.filter(m => config.selectedMetrics.includes(m.id)).map(metric => {
              const TrendIcon = getTrendIcon(metric.trend);
              const trendColor = getTrendColor(metric.trend, metric.changePercent);
              
              return (
                <div key={metric.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{metric.name}</h4>
                    <div className={`flex items-center space-x-1 ${trendColor}`}>
                      <TrendIcon className="h-4 w-4" />
                      <span className="text-sm">{Math.abs(metric.changePercent).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className={`text-2xl font-bold ${getMetricColor(metric)}`}>
                      {formatValue(metric.currentValue, metric.unit)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Baseline: {formatValue(metric.baseline, metric.unit)}
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mb-3" ref={chartRef}>
                    {generateChart(metric)}
                  </div>

                  {/* Prediction */}
                  {config.predictiveAnalysis && (
                    <div className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <Brain className="h-3 w-3" />
                        <span className="font-medium">Prediction</span>
                      </div>
                      <div>Next hour: {formatValue(metric.prediction.nextHour, metric.unit)}</div>
                      <div>Confidence: {metric.prediction.confidence.toFixed(0)}%</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent Insights */}
          {selectedReport.insights.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Insights</h3>
              <div className="space-y-4">
                {selectedReport.insights.map(insight => (
                  <div key={insight.id} className={`p-4 rounded-lg border ${
                    insight.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    insight.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{insight.description}</p>
                        <p className="text-sm text-gray-600 mb-2">{insight.impact}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Confidence: {insight.confidence.toFixed(0)}%</span>
                          <span>Timeframe: {insight.timeframe}</span>
                          <span>Type: {insight.type}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        insight.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {insight.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {selectedReport.recommendations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-4">
                {selectedReport.recommendations.map(rec => (
                  <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.priority}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {rec.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                        <p className="text-sm text-green-700 font-medium mb-2">{rec.expectedImpact}</p>
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Effort:</span> {rec.effort}
                          </div>
                          <div>
                            <span className="font-medium">Cost:</span> {rec.cost}
                          </div>
                          <div>
                            <span className="font-medium">Timeline:</span> {rec.timeline}
                          </div>
                        </div>
                      </div>
                      <button className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Analytics Configuration</h3>
                <button
                  onClick={() => setShowConfig(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metrics to Display
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['cpu', 'memory', 'disk', 'network', 'players', 'tps', 'response_time', 'error_rate'].map(metric => (
                      <label key={metric} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={config.selectedMetrics.includes(metric)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig(prev => ({ ...prev, selectedMetrics: [...prev.selectedMetrics, metric] }));
                            } else {
                              setConfig(prev => ({ ...prev, selectedMetrics: prev.selectedMetrics.filter(m => m !== metric) }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{metric.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chart Type
                    </label>
                    <select
                      value={config.chartType}
                      onChange={(e) => setConfig(prev => ({ ...prev, chartType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="line">Line Chart</option>
                      <option value="area">Area Chart</option>
                      <option value="bar">Bar Chart</option>
                      <option value="scatter">Scatter Plot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aggregation
                    </label>
                    <select
                      value={config.aggregation}
                      onChange={(e) => setConfig(prev => ({ ...prev, aggregation: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="avg">Average</option>
                      <option value="min">Minimum</option>
                      <option value="max">Maximum</option>
                      <option value="sum">Sum</option>
                      <option value="p95">95th Percentile</option>
                      <option value="p99">99th Percentile</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.anomalyDetection}
                        onChange={(e) => setConfig(prev => ({ ...prev, anomalyDetection: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Anomaly Detection</span>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={config.predictiveAnalysis}
                        onChange={(e) => setConfig(prev => ({ ...prev, predictiveAnalysis: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Predictive Analysis</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval (seconds)
                  </label>
                  <input
                    type="number"
                    value={config.refreshInterval / 1000}
                    onChange={(e) => setConfig(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) * 1000 || 60000 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowConfig(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}