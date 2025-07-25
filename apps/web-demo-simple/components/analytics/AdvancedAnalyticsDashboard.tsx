'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  Target,
  Calendar,
  Clock,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Copy,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Grid3X3,
  List,
  Layers,
  Play,
  Pause,
  Square,
  RotateCcw,
  Zap,
  Brain,
  Star,
  Award,
  Crown,
  Fire,
  Sparkles,
  Lightbulb,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  BellOff,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  FileText,
  Folder,
  FolderOpen,
  File,
  Code,
  Terminal,
  Database,
  Server,
  Globe,
  Shield,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  MapPin,
  Navigation,
  Compass,
  Map,
  Route,
  Car,
  Truck,
  Plane,
  Ship,
  Train,
  Bike,
  Walk,
  Home,
  Building,
  Store,
  Factory,
  School,
  Hospital,
  Hotel,
  Restaurant,
  Coffee,
  ShoppingCart,
  CreditCard,
  Banknote,
  Coins,
  Wallet,
  Receipt,
  Calculator,
  PresentationChart,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Watch,
  Camera,
  Video,
  Headphones,
  Gamepad2
} from 'lucide-react';

interface AnalyticsWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'heatmap' | 'gauge' | 'funnel' | 'timeline';
  category: 'revenue' | 'users' | 'engagement' | 'performance' | 'growth' | 'retention';
  size: 'small' | 'medium' | 'large' | 'xl';
  position: { x: number; y: number; };
  data: any;
  config: WidgetConfig;
  enabled: boolean;
  refreshRate: number;
  lastUpdated: number;
}

interface WidgetConfig {
  colors: string[];
  displayOptions: {
    showLegend: boolean;
    showLabels: boolean;
    showGrid: boolean;
    showTooltips: boolean;
  };
  filters: AnalyticsFilter[];
  timeRange: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  groupBy: string[];
}

interface AnalyticsFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'range' | 'in' | 'not_in';
  value: any;
  enabled: boolean;
}

interface AnalyticsMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  format: 'number' | 'currency' | 'percentage' | 'duration';
  target?: number;
  benchmark?: number;
  lastUpdated: number;
}

interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
  category?: string;
  metadata?: Record<string, any>;
}

interface AnalyticsInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  data: {
    metric: string;
    change: number;
    timeframe: string;
    factors: string[];
  };
  recommendations: string[];
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  created: number;
  dismissed: boolean;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: AnalyticsWidget[];
  filters: AnalyticsFilter[];
  layout: 'grid' | 'flex' | 'custom';
  theme: 'light' | 'dark' | 'auto';
  public: boolean;
  owner: string;
  collaborators: string[];
  created: number;
  lastModified: number;
  views: number;
  starred: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: Partial<AnalyticsWidget>[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
    format: 'pdf' | 'excel' | 'csv';
  };
  created: number;
  lastUsed: number;
  popularity: number;
}

interface AdvancedAnalyticsDashboardProps {
  className?: string;
}

export function AdvancedAnalyticsDashboard({ className = '' }: AdvancedAnalyticsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [widgets, setWidgets] = useState<AnalyticsWidget[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<AnalyticsWidget | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboards' | 'widgets' | 'insights' | 'reports'>('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [showFilters, setShowFilters] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'view' | 'edit'>('view');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const draggedWidget = useRef<AnalyticsWidget | null>(null);

  const generateMockMetrics = useCallback((): AnalyticsMetric[] => {
    const metricConfigs = [
      { name: 'Total Revenue', category: 'Revenue', unit: '$', format: 'currency', value: 125000, target: 150000 },
      { name: 'Monthly Recurring Revenue', category: 'Revenue', unit: '$', format: 'currency', value: 45000, target: 50000 },
      { name: 'Average Revenue Per User', category: 'Revenue', unit: '$', format: 'currency', value: 23.50, target: 25.00 },
      { name: 'Active Users', category: 'Users', unit: '', format: 'number', value: 12500, target: 15000 },
      { name: 'New User Signups', category: 'Users', unit: '', format: 'number', value: 450, target: 500 },
      { name: 'Daily Active Users', category: 'Engagement', unit: '', format: 'number', value: 8500, target: 10000 },
      { name: 'Session Duration', category: 'Engagement', unit: 'min', format: 'duration', value: 28.5, target: 30.0 },
      { name: 'Conversion Rate', category: 'Growth', unit: '%', format: 'percentage', value: 3.2, target: 4.0 },
      { name: 'Customer Acquisition Cost', category: 'Growth', unit: '$', format: 'currency', value: 45.50, target: 40.00 },
      { name: 'Customer Lifetime Value', category: 'Revenue', unit: '$', format: 'currency', value: 285.00, target: 300.00 },
      { name: 'Churn Rate', category: 'Retention', unit: '%', format: 'percentage', value: 2.1, target: 2.0 },
      { name: 'Net Promoter Score', category: 'Engagement', unit: '', format: 'number', value: 67, target: 70 }
    ] as const;

    return metricConfigs.map((config, i) => {
      const previousValue = config.value * (0.85 + Math.random() * 0.3);
      const change = config.value - previousValue;
      const changePercent = (change / previousValue) * 100;

      return {
        id: `metric-${i + 1}`,
        name: config.name,
        category: config.category,
        value: config.value,
        previousValue,
        change,
        changePercent,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        unit: config.unit,
        format: config.format,
        target: config.target,
        benchmark: config.value * (0.9 + Math.random() * 0.2),
        lastUpdated: Date.now() - Math.random() * 60 * 60 * 1000
      };
    });
  }, []);

  const generateMockChartData = useCallback((type: string, days: number = 30): ChartDataPoint[] => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Array.from({ length: days }, (_, i) => {
      const timestamp = now - (days - i - 1) * oneDay;
      let value: number;
      
      switch (type) {
        case 'revenue':
          value = 3000 + Math.sin(i / 7) * 1000 + Math.random() * 500;
          break;
        case 'users':
          value = 800 + Math.sin(i / 5) * 200 + Math.random() * 100;
          break;
        case 'engagement':
          value = 25 + Math.sin(i / 10) * 5 + Math.random() * 3;
          break;
        default:
          value = 100 + Math.random() * 50;
      }

      return {
        timestamp,
        value: Math.max(0, value),
        label: new Date(timestamp).toLocaleDateString(),
        category: type
      };
    });
  }, []);

  const generateMockWidgets = useCallback((): AnalyticsWidget[] => {
    const widgetTypes = ['metric', 'chart', 'table', 'heatmap', 'gauge', 'funnel'] as const;
    const categories = ['revenue', 'users', 'engagement', 'performance', 'growth', 'retention'] as const;
    const sizes = ['small', 'medium', 'large', 'xl'] as const;

    return Array.from({ length: 12 }, (_, i) => ({
      id: `widget-${i + 1}`,
      title: [
        'Revenue Trends',
        'User Growth',
        'Engagement Metrics',
        'Performance KPIs',
        'Growth Funnel',
        'Retention Analysis',
        'Geographic Distribution',
        'Device Analytics',
        'Conversion Rates',
        'Customer Segments',
        'Revenue Forecast',
        'Churn Prediction'
      ][i],
      type: widgetTypes[i % widgetTypes.length],
      category: categories[i % categories.length],
      size: sizes[Math.floor(Math.random() * sizes.length)],
      position: { x: (i % 4) * 25, y: Math.floor(i / 4) * 33 },
      data: {
        chartData: generateMockChartData(categories[i % categories.length]),
        metrics: generateMockMetrics().slice(i, i + 3),
        summary: {
          total: 1000 + Math.random() * 9000,
          growth: (Math.random() - 0.5) * 20,
          trend: Math.random() > 0.5 ? 'positive' : 'negative'
        }
      },
      config: {
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        displayOptions: {
          showLegend: true,
          showLabels: true,
          showGrid: true,
          showTooltips: true
        },
        filters: [],
        timeRange: '30d',
        aggregation: 'sum',
        groupBy: ['date']
      },
      enabled: Math.random() > 0.1,
      refreshRate: [30, 60, 300, 900][Math.floor(Math.random() * 4)],
      lastUpdated: Date.now() - Math.random() * 60 * 60 * 1000
    }));
  }, [generateMockChartData, generateMockMetrics]);

  const generateMockInsights = useCallback((): AnalyticsInsight[] => {
    const types = ['trend', 'anomaly', 'correlation', 'opportunity', 'risk'] as const;
    const impacts = ['low', 'medium', 'high'] as const;
    const priorities = ['low', 'medium', 'high'] as const;

    return Array.from({ length: 8 }, (_, i) => ({
      id: `insight-${i + 1}`,
      type: types[i % types.length],
      title: [
        'Revenue growth accelerating in Q4',
        'Unusual spike in user signups detected',
        'Strong correlation between feature usage and retention',
        'Opportunity to increase mobile conversion rates',
        'Risk of churn increase in enterprise segment',
        'Weekend engagement patterns show improvement opportunity',
        'Geographic expansion showing promising ROI',
        'Pricing optimization could increase revenue by 15%'
      ][i],
      description: [
        'Revenue growth has increased by 25% compared to previous quarter, driven primarily by premium subscriptions.',
        'User signups show an unexpected 40% increase over the past week, significantly above normal patterns.',
        'Users who engage with advanced features show 3x higher retention rates after 30 days.',
        'Mobile users have 23% lower conversion rates, representing a significant opportunity for optimization.',
        'Enterprise customer churn rate has increased to 8%, above the healthy threshold of 5%.',
        'Weekend engagement drops by 35%, suggesting opportunity for targeted campaigns.',
        'New geographic markets showing 45% higher LTV compared to established regions.',
        'Price elasticity analysis suggests optimal pricing could increase revenue without significant churn.'
      ][i],
      confidence: 0.7 + Math.random() * 0.29,
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      category: ['Revenue', 'Users', 'Engagement', 'Growth', 'Risk'][Math.floor(Math.random() * 5)],
      data: {
        metric: ['revenue', 'signups', 'retention', 'conversion', 'churn'][Math.floor(Math.random() * 5)],
        change: (Math.random() - 0.3) * 50,
        timeframe: ['7 days', '30 days', '90 days'][Math.floor(Math.random() * 3)],
        factors: ['seasonality', 'marketing_campaign', 'product_changes', 'external_events'].slice(0, Math.floor(1 + Math.random() * 3))
      },
      recommendations: [
        'Increase marketing spend in high-performing channels',
        'Implement feature usage tracking',
        'A/B test pricing strategies',
        'Optimize mobile user experience',
        'Develop retention campaigns'
      ].slice(0, Math.floor(2 + Math.random() * 3)),
      actionable: Math.random() > 0.3,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      created: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      dismissed: Math.random() > 0.8
    }));
  }, []);

  const generateMockDashboards = useCallback((): Dashboard[] => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: `dashboard-${i + 1}`,
      name: [
        'Executive Overview',
        'Revenue Analytics',
        'User Acquisition',
        'Product Performance',
        'Customer Success',
        'Marketing ROI'
      ][i],
      description: [
        'High-level KPIs and trends for executive reporting',
        'Comprehensive revenue analysis and forecasting',
        'User acquisition metrics and channel performance',
        'Product usage analytics and feature adoption',
        'Customer health scores and retention metrics',
        'Marketing campaign performance and attribution'
      ][i],
      widgets: generateMockWidgets().slice(0, Math.floor(4 + Math.random() * 8)),
      filters: [],
      layout: ['grid', 'flex', 'custom'][Math.floor(Math.random() * 3)] as const,
      theme: 'light',
      public: Math.random() > 0.5,
      owner: ['Alice Johnson', 'Bob Smith', 'Carol Williams'][Math.floor(Math.random() * 3)],
      collaborators: ['team@company.com'],
      created: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      views: Math.floor(Math.random() * 1000),
      starred: Math.random() > 0.7
    }));
  }, [generateMockWidgets]);

  const generateMockTemplates = useCallback((): ReportTemplate[] => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `template-${i + 1}`,
      name: [
        'Daily Revenue Report',
        'Weekly User Growth',
        'Monthly Business Review',
        'Quarterly Performance',
        'Customer Health Score',
        'Marketing Attribution',
        'Product Analytics',
        'Financial Dashboard'
      ][i],
      description: [
        'Daily revenue metrics and trends',
        'Weekly user acquisition and growth metrics',
        'Comprehensive monthly business performance',
        'Quarterly KPIs and strategic metrics',
        'Customer health and retention analysis',
        'Marketing channel performance attribution',
        'Product usage and feature adoption metrics',
        'Financial KPIs and forecasting'
      ][i],
      category: ['Financial', 'Growth', 'Product', 'Marketing'][Math.floor(Math.random() * 4)],
      widgets: generateMockWidgets().slice(0, Math.floor(3 + Math.random() * 6)).map(w => ({
        title: w.title,
        type: w.type,
        category: w.category,
        size: w.size
      })),
      schedule: Math.random() > 0.5 ? {
        frequency: ['daily', 'weekly', 'monthly'][Math.floor(Math.random() * 3)] as const,
        time: '09:00',
        recipients: ['team@company.com', 'executives@company.com'],
        format: ['pdf', 'excel'][Math.floor(Math.random() * 2)] as const
      } : undefined,
      created: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
      lastUsed: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      popularity: Math.floor(Math.random() * 100)
    }));
  }, [generateMockWidgets]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWidgets = generateMockWidgets();
      const mockMetrics = generateMockMetrics();
      const mockInsights = generateMockInsights();
      const mockDashboards = generateMockDashboards();
      const mockTemplates = generateMockTemplates();

      setWidgets(mockWidgets);
      setMetrics(mockMetrics);
      setInsights(mockInsights);
      setDashboards(mockDashboards);
      setTemplates(mockTemplates);
      setActiveDashboard(mockDashboards[0]);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockWidgets, generateMockMetrics, generateMockInsights, generateMockDashboards, generateMockTemplates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadData();
      }, refreshInterval * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadData]);

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${value.toFixed(1)}${unit}`;
      default:
        return value.toLocaleString() + (unit ? ` ${unit}` : '');
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderWidget = (widget: AnalyticsWidget) => {
    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1',
      large: 'col-span-2 row-span-2',
      xl: 'col-span-4 row-span-2'
    };

    return (
      <div
        key={widget.id}
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${sizeClasses[widget.size]}`}
        onClick={() => setSelectedWidget(widget)}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">{widget.title}</h3>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-gray-500">{formatTimeAgo(widget.lastUpdated)}</span>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {widget.type === 'metric' && widget.data.metrics && (
          <div className="space-y-3">
            {widget.data.metrics.slice(0, 3).map((metric: AnalyticsMetric) => (
              <div key={metric.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.name}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatValue(metric.value, metric.format, metric.unit)}
                  </p>
                </div>
                <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                  {metric.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
                   metric.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
                   <Activity className="h-4 w-4" />}
                  <span className="text-sm font-medium">
                    {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {widget.type === 'chart' && (
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-500">
              <LineChart className="h-6 w-6" />
              <span className="text-sm">Chart Visualization</span>
            </div>
          </div>
        )}

        {widget.type === 'table' && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 font-medium">
              <span>Metric</span>
              <span>Value</span>
              <span>Change</span>
            </div>
            {widget.data.metrics?.slice(0, 3).map((metric: AnalyticsMetric, i: number) => (
              <div key={i} className="grid grid-cols-3 gap-2 text-sm">
                <span className="text-gray-900">{metric.name}</span>
                <span className="font-medium">{formatValue(metric.value, metric.format, metric.unit)}</span>
                <span className={getTrendColor(metric.trend)}>
                  {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {widget.type === 'gauge' && (
          <div className="flex items-center justify-center h-32">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-8 border-gray-200">
                <div className="w-full h-full rounded-full border-8 border-blue-500 border-t-transparent transform rotate-45"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">
                  {widget.data.summary?.total ? Math.round(widget.data.summary.total / 100) : 75}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics Dashboard</h2>
              <p className="text-sm text-gray-500">Comprehensive business intelligence and data visualization</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatValue(metrics.find(m => m.name === 'Total Revenue')?.value || 0, 'currency', '$')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Users</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(metrics.find(m => m.name === 'Active Users')?.value || 0).toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {(metrics.find(m => m.name === 'Conversion Rate')?.value || 0).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Growth Rate</p>
                <p className="text-2xl font-bold text-orange-900">
                  {((metrics.find(m => m.name === 'New User Signups')?.changePercent || 0)).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mt-6">
          {['overview', 'dashboards', 'widgets', 'insights', 'reports'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 auto-rows-fr">
              {widgets.slice(0, 8).map(renderWidget)}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
                  <Lightbulb className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {insights.slice(0, 4).map((insight) => (
                    <div key={insight.id} className="p-3 bg-white rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{insight.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{insight.category}</span>
                        <span className="text-xs text-blue-600">{(insight.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                  <Activity className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {metrics.slice(0, 6).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{metric.name}</p>
                        <p className="text-xs text-gray-500">{metric.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900">
                          {formatValue(metric.value, metric.format, metric.unit)}
                        </p>
                        <div className={`flex items-center justify-end space-x-1 ${getTrendColor(metric.trend)}`}>
                          {metric.trend === 'up' ? <ArrowUp className="h-3 w-3" /> :
                           metric.trend === 'down' ? <ArrowDown className="h-3 w-3" /> :
                           <Activity className="h-3 w-3" />}
                          <span className="text-xs">
                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Analytics Dashboards</h3>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                <Plus className="h-4 w-4 inline mr-1" />
                New Dashboard
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {dashboards.map((dashboard) => (
                <div key={dashboard.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{dashboard.name}</h4>
                        <p className="text-sm text-gray-500">{dashboard.owner}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {dashboard.starred && <Star className="h-4 w-4 text-yellow-500" />}
                      {dashboard.public && <Globe className="h-4 w-4 text-green-500" />}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 text-sm">{dashboard.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{dashboard.widgets.length} widgets</span>
                      <span>{dashboard.views} views</span>
                      <span>Modified {formatTimeAgo(dashboard.lastModified)}</span>
                    </div>
                    <button
                      onClick={() => setActiveDashboard(dashboard)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue with other tabs... */}
      </div>
    </div>
  );
}