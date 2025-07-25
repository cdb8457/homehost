'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  Users,
  DollarSign,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  Server,
  Database,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  RefreshCw,
  Settings,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
  Play,
  Pause,
  Square,
  RotateCcw,
  Calendar,
  Search,
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
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
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  FileText,
  Folder,
  File,
  Code,
  Terminal,
  Shield,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  Share2,
  Send,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Copy,
  ExternalLink,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Maximize,
  Minimize,
  Grid3X3,
  List,
  Layers,
  Gamepad2
} from 'lucide-react';

interface RealTimeMetric {
  id: string;
  name: string;
  category: 'revenue' | 'users' | 'engagement' | 'performance' | 'system' | 'marketing';
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  format: 'number' | 'currency' | 'percentage' | 'duration' | 'rate';
  target?: number;
  threshold: {
    warning: number;
    critical: number;
  };
  status: 'healthy' | 'warning' | 'critical';
  lastUpdated: number;
  updateFrequency: number; // seconds
  history: MetricDataPoint[];
}

interface MetricDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

interface LiveEvent {
  id: string;
  timestamp: number;
  type: 'user_action' | 'transaction' | 'system_event' | 'milestone' | 'alert';
  category: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  source: string;
  userId?: string;
  metadata: Record<string, any>;
  processed: boolean;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  components: HealthComponent[];
  uptime: number;
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
  };
  resources: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  alerts: SystemAlert[];
  lastCheck: number;
}

interface HealthComponent {
  name: string;
  status: 'healthy' | 'degraded' | 'critical' | 'maintenance';
  responseTime: number;
  uptime: number;
  lastError?: string;
  dependencies: string[];
}

interface SystemAlert {
  id: string;
  type: 'performance' | 'error' | 'capacity' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  component: string;
  created: number;
  acknowledged: boolean;
}

interface UserActivity {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  sessionCount: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: PageActivity[];
  topCountries: CountryActivity[];
  deviceBreakdown: DeviceActivity[];
  realTimeUsers: number;
}

interface PageActivity {
  page: string;
  views: number;
  uniqueViews: number;
  timeOnPage: number;
  exitRate: number;
}

interface CountryActivity {
  country: string;
  users: number;
  percentage: number;
  revenue: number;
}

interface DeviceActivity {
  device: string;
  users: number;
  percentage: number;
  conversionRate: number;
}

interface RevenueMetrics {
  total: number;
  hourly: number;
  daily: number;
  monthly: number;
  transactions: number;
  averageOrderValue: number;
  conversionRate: number;
  refunds: number;
  topProducts: ProductRevenue[];
  paymentMethods: PaymentMethodStats[];
  revenueByHour: MetricDataPoint[];
}

interface ProductRevenue {
  product: string;
  revenue: number;
  quantity: number;
  percentage: number;
}

interface PaymentMethodStats {
  method: string;
  transactions: number;
  revenue: number;
  percentage: number;
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'change_percent';
  threshold: number;
  timeWindow: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notifications: NotificationChannel[];
  cooldown: number;
  lastTriggered?: number;
}

interface NotificationChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms';
  target: string;
  enabled: boolean;
}

interface RealTimeBusinessMetricsProps {
  className?: string;
}

export function RealTimeBusinessMetrics({ className = '' }: RealTimeBusinessMetricsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'events' | 'health' | 'users' | 'revenue'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<RealTimeMetric | null>(null);
  const [isStreamingActive, setIsStreamingActive] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(5); // seconds
  const [showFilters, setShowFilters] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout>();
  const eventsRef = useRef<HTMLDivElement>(null);

  const generateMockMetric = useCallback((config: any, index: number): RealTimeMetric => {
    const previousValue = config.baseValue * (0.9 + Math.random() * 0.2);
    const value = config.baseValue * (0.95 + Math.random() * 0.1);
    const change = value - previousValue;
    const changePercent = (change / previousValue) * 100;

    const history = Array.from({ length: 60 }, (_, i) => ({
      timestamp: Date.now() - (60 - i) * 60 * 1000,
      value: config.baseValue * (0.9 + Math.random() * 0.2)
    }));

    return {
      id: `metric-${index + 1}`,
      name: config.name,
      category: config.category,
      value,
      previousValue,
      change,
      changePercent,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      unit: config.unit,
      format: config.format,
      target: config.target,
      threshold: config.threshold,
      status: value > config.threshold.critical ? 'critical' : 
              value > config.threshold.warning ? 'warning' : 'healthy',
      lastUpdated: Date.now(),
      updateFrequency: 5 + Math.random() * 10,
      history
    };
  }, []);

  const generateMockMetrics = useCallback((): RealTimeMetric[] => {
    const metricConfigs = [
      {
        name: 'Active Users',
        category: 'users',
        baseValue: 1250,
        unit: '',
        format: 'number',
        target: 1500,
        threshold: { warning: 800, critical: 500 }
      },
      {
        name: 'Revenue Per Hour',
        category: 'revenue',
        baseValue: 850,
        unit: '$',
        format: 'currency',
        target: 1000,
        threshold: { warning: 600, critical: 400 }
      },
      {
        name: 'Conversion Rate',
        category: 'engagement',
        baseValue: 3.2,
        unit: '%',
        format: 'percentage',
        target: 4.0,
        threshold: { warning: 2.5, critical: 1.5 }
      },
      {
        name: 'Page Load Time',
        category: 'performance',
        baseValue: 1.8,
        unit: 's',
        format: 'duration',
        target: 1.5,
        threshold: { warning: 3.0, critical: 5.0 }
      },
      {
        name: 'Server Response Time',
        category: 'system',
        baseValue: 120,
        unit: 'ms',
        format: 'duration',
        target: 100,
        threshold: { warning: 200, critical: 500 }
      },
      {
        name: 'Error Rate',
        category: 'system',
        baseValue: 0.5,
        unit: '%',
        format: 'percentage',
        target: 0.1,
        threshold: { warning: 1.0, critical: 2.0 }
      },
      {
        name: 'Session Duration',
        category: 'engagement',
        baseValue: 8.5,
        unit: 'min',
        format: 'duration',
        target: 10.0,
        threshold: { warning: 5.0, critical: 3.0 }
      },
      {
        name: 'New Signups',
        category: 'users',
        baseValue: 45,
        unit: '/hour',
        format: 'rate',
        target: 60,
        threshold: { warning: 30, critical: 15 }
      },
      {
        name: 'Bounce Rate',
        category: 'engagement',
        baseValue: 35,
        unit: '%',
        format: 'percentage',
        target: 25,
        threshold: { warning: 45, critical: 60 }
      },
      {
        name: 'Average Order Value',
        category: 'revenue',
        baseValue: 45,
        unit: '$',
        format: 'currency',
        target: 50,
        threshold: { warning: 35, critical: 25 }
      }
    ];

    return metricConfigs.map((config, i) => generateMockMetric(config, i));
  }, [generateMockMetric]);

  const generateMockEvents = useCallback((): LiveEvent[] => {
    const eventTypes = ['user_action', 'transaction', 'system_event', 'milestone', 'alert'] as const;
    const severities = ['info', 'warning', 'error', 'success'] as const;
    const categories = ['User', 'Revenue', 'System', 'Performance', 'Security'];

    return Array.from({ length: 50 }, (_, i) => ({
      id: `event-${i + 1}`,
      timestamp: Date.now() - Math.random() * 60 * 60 * 1000,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      title: [
        'New user registration',
        'Purchase completed',
        'Server response time spike',
        'Daily revenue target reached',
        'Security scan completed',
        'High CPU usage detected',
        'Payment failed',
        'Feature flag updated',
        'Cache cleared',
        'Backup completed',
        'User session started',
        'API rate limit exceeded',
        'Database connection restored',
        'Marketing campaign launched',
        'System maintenance scheduled'
      ][i % 15],
      description: `Event description for ${i + 1}`,
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: ['Web App', 'Mobile App', 'API', 'System', 'Admin'][Math.floor(Math.random() * 5)],
      userId: Math.random() > 0.5 ? `user-${Math.floor(Math.random() * 1000)}` : undefined,
      metadata: {
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (compatible)',
        value: Math.random() * 100
      },
      processed: Math.random() > 0.3
    }));
  }, []);

  const generateMockSystemHealth = useCallback((): SystemHealth => {
    const components = [
      'Web Server',
      'Database',
      'Cache',
      'Payment Gateway',
      'CDN',
      'Load Balancer',
      'API Gateway',
      'Authentication Service'
    ].map(name => ({
      name,
      status: ['healthy', 'degraded', 'critical', 'maintenance'][Math.floor(Math.random() * 4)] as const,
      responseTime: 50 + Math.random() * 200,
      uptime: 0.95 + Math.random() * 0.049,
      lastError: Math.random() > 0.8 ? 'Connection timeout' : undefined,
      dependencies: []
    }));

    return {
      overall: components.some(c => c.status === 'critical') ? 'critical' :
               components.some(c => c.status === 'degraded') ? 'degraded' : 'healthy',
      components,
      uptime: 0.998,
      performance: {
        responseTime: 125,
        throughput: 1250,
        errorRate: 0.2,
        availability: 99.9
      },
      resources: {
        cpu: 35 + Math.random() * 30,
        memory: 60 + Math.random() * 25,
        disk: 45 + Math.random() * 20,
        network: 25 + Math.random() * 15
      },
      alerts: Array.from({ length: 3 }, (_, i) => ({
        id: `alert-${i + 1}`,
        type: ['performance', 'error', 'capacity', 'security'][Math.floor(Math.random() * 4)] as const,
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as const,
        message: `System alert ${i + 1}`,
        component: components[Math.floor(Math.random() * components.length)].name,
        created: Date.now() - Math.random() * 60 * 60 * 1000,
        acknowledged: Math.random() > 0.5
      })),
      lastCheck: Date.now()
    };
  }, []);

  const generateMockUserActivity = useCallback((): UserActivity => {
    const totalUsers = 1250;
    const activeUsers = Math.floor(totalUsers * 0.8);
    
    return {
      totalUsers,
      activeUsers,
      newUsers: Math.floor(50 + Math.random() * 50),
      returningUsers: activeUsers - Math.floor(50 + Math.random() * 50),
      sessionCount: Math.floor(activeUsers * 1.5),
      averageSessionDuration: 8.5 + Math.random() * 5,
      bounceRate: 0.35 + Math.random() * 0.1,
      conversionRate: 0.032 + Math.random() * 0.01,
      topPages: [
        { page: '/home', views: 2500, uniqueViews: 1800, timeOnPage: 120, exitRate: 0.25 },
        { page: '/products', views: 1800, uniqueViews: 1200, timeOnPage: 180, exitRate: 0.35 },
        { page: '/checkout', views: 850, uniqueViews: 750, timeOnPage: 240, exitRate: 0.15 },
        { page: '/profile', views: 650, uniqueViews: 500, timeOnPage: 300, exitRate: 0.20 }
      ],
      topCountries: [
        { country: 'United States', users: 450, percentage: 36, revenue: 12500 },
        { country: 'Canada', users: 280, percentage: 22, revenue: 8200 },
        { country: 'United Kingdom', users: 220, percentage: 18, revenue: 6800 },
        { country: 'Germany', users: 180, percentage: 14, revenue: 5500 },
        { country: 'France', users: 120, percentage: 10, revenue: 3200 }
      ],
      deviceBreakdown: [
        { device: 'Desktop', users: 650, percentage: 52, conversionRate: 0.045 },
        { device: 'Mobile', users: 450, percentage: 36, conversionRate: 0.025 },
        { device: 'Tablet', users: 150, percentage: 12, conversionRate: 0.035 }
      ],
      realTimeUsers: Math.floor(200 + Math.random() * 100)
    };
  }, []);

  const generateMockRevenueMetrics = useCallback((): RevenueMetrics => {
    const hourlyRevenue = 850 + Math.random() * 200;
    
    return {
      total: 45000,
      hourly: hourlyRevenue,
      daily: hourlyRevenue * 24,
      monthly: hourlyRevenue * 24 * 30,
      transactions: Math.floor(25 + Math.random() * 15),
      averageOrderValue: 45 + Math.random() * 20,
      conversionRate: 0.032 + Math.random() * 0.01,
      refunds: Math.floor(Math.random() * 5),
      topProducts: [
        { product: 'Premium Subscription', revenue: 15000, quantity: 150, percentage: 35 },
        { product: 'Pro Plan', revenue: 12000, quantity: 200, percentage: 28 },
        { product: 'In-game Items', revenue: 8000, quantity: 400, percentage: 18 },
        { product: 'Basic Plan', revenue: 6000, quantity: 300, percentage: 14 },
        { product: 'Add-ons', revenue: 2000, quantity: 100, percentage: 5 }
      ],
      paymentMethods: [
        { method: 'Credit Card', transactions: 180, revenue: 25000, percentage: 58 },
        { method: 'PayPal', transactions: 95, revenue: 12000, percentage: 28 },
        { method: 'Bank Transfer', transactions: 35, revenue: 5500, percentage: 13 },
        { method: 'Other', transactions: 15, revenue: 500, percentage: 1 }
      ],
      revenueByHour: Array.from({ length: 24 }, (_, i) => ({
        timestamp: Date.now() - (24 - i) * 60 * 60 * 1000,
        value: 600 + Math.sin(i / 4) * 200 + Math.random() * 100
      }))
    };
  }, []);

  const generateMockAlertRules = useCallback((): AlertRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'High Error Rate',
        metric: 'error_rate',
        condition: 'greater_than',
        threshold: 2.0,
        timeWindow: 300,
        severity: 'critical',
        enabled: true,
        notifications: [
          { type: 'email', target: 'alerts@company.com', enabled: true },
          { type: 'slack', target: '#alerts', enabled: true }
        ],
        cooldown: 900,
        lastTriggered: Date.now() - 3600000
      },
      {
        id: 'rule-2',
        name: 'Low Active Users',
        metric: 'active_users',
        condition: 'less_than',
        threshold: 800,
        timeWindow: 600,
        severity: 'warning',
        enabled: true,
        notifications: [
          { type: 'email', target: 'team@company.com', enabled: true }
        ],
        cooldown: 1800
      }
    ];
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMetrics(generateMockMetrics());
      setEvents(generateMockEvents());
      setSystemHealth(generateMockSystemHealth());
      setUserActivity(generateMockUserActivity());
      setRevenueMetrics(generateMockRevenueMetrics());
      setAlertRules(generateMockAlertRules());
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockMetrics, generateMockEvents, generateMockSystemHealth, generateMockUserActivity, generateMockRevenueMetrics, generateMockAlertRules]);

  const updateMetrics = useCallback(() => {
    if (!isStreamingActive) return;

    setMetrics(prevMetrics => 
      prevMetrics.map(metric => {
        const newValue = metric.value * (0.98 + Math.random() * 0.04);
        const change = newValue - metric.value;
        const changePercent = (change / metric.value) * 100;
        
        return {
          ...metric,
          previousValue: metric.value,
          value: newValue,
          change,
          changePercent,
          trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          status: newValue > metric.threshold.critical ? 'critical' : 
                  newValue > metric.threshold.warning ? 'warning' : 'healthy',
          lastUpdated: Date.now(),
          history: [
            ...metric.history.slice(-59),
            { timestamp: Date.now(), value: newValue }
          ]
        };
      })
    );

    // Occasionally add new events
    if (Math.random() > 0.7) {
      const newEvent = generateMockEvents()[0];
      setEvents(prevEvents => [newEvent, ...prevEvents.slice(0, 49)]);
    }
  }, [isStreamingActive, generateMockEvents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (isStreamingActive) {
      updateIntervalRef.current = setInterval(updateMetrics, updateInterval * 1000);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [isStreamingActive, updateInterval, updateMetrics]);

  useEffect(() => {
    if (autoScroll && eventsRef.current) {
      eventsRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const formatValue = (value: number, format: string, unit: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        if (unit === 'ms') return `${value.toFixed(0)}ms`;
        if (unit === 's') return `${value.toFixed(1)}s`;
        if (unit === 'min') return `${value.toFixed(1)}min`;
        return `${value.toFixed(1)}${unit}`;
      case 'rate':
        return `${value.toFixed(0)}${unit}`;
      default:
        return value.toLocaleString() + (unit ? ` ${unit}` : '');
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      case 'degraded': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Real-Time Business Metrics</h2>
              <p className="text-sm text-gray-500">Live monitoring of key business and system metrics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Streaming:</span>
              <button
                onClick={() => setIsStreamingActive(!isStreamingActive)}
                className={`p-2 rounded ${isStreamingActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              >
                {isStreamingActive ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              </button>
            </div>
            <select 
              value={updateInterval}
              onChange={(e) => setUpdateInterval(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="1">1s</option>
              <option value="5">5s</option>
              <option value="10">10s</option>
              <option value="30">30s</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded ${showFilters ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">System Health</p>
                <p className="text-2xl font-bold text-green-900">
                  {systemHealth?.overall === 'healthy' ? '100%' : 
                   systemHealth?.overall === 'degraded' ? '85%' : '60%'}
                </p>
              </div>
              <div className={`p-2 rounded ${getStatusColor(systemHealth?.overall || 'healthy')}`}>
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Users</p>
                <p className="text-2xl font-bold text-blue-900">
                  {userActivity?.realTimeUsers.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Revenue/Hour</p>
                <p className="text-2xl font-bold text-purple-900">
                  ${revenueMetrics?.hourly.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Response Time</p>
                <p className="text-2xl font-bold text-orange-900">
                  {systemHealth?.performance.responseTime}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mt-6">
          {['overview', 'metrics', 'events', 'health', 'users', 'revenue'].map((tab) => (
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
            <div className="grid grid-cols-4 gap-4">
              {metrics.slice(0, 8).map((metric) => (
                <div key={metric.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-sm text-gray-900">{metric.name}</h3>
                    <div className={`p-1 rounded ${getStatusColor(metric.status)}`}>
                      <Activity className="h-3 w-3" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatValue(metric.value, metric.format, metric.unit)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Updated {formatTimeAgo(metric.lastUpdated)}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-1 ${getTrendColor(metric.trend)}`}>
                      {getTrendIcon(metric.trend)}
                      <span className="text-xs font-medium">
                        {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Live Events</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`p-1 rounded ${autoScroll ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <Bell className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div ref={eventsRef} className="space-y-2 max-h-64 overflow-y-auto">
                  {events.slice(0, 10).map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-2 bg-white rounded border">
                      <div className={`p-1 rounded ${getSeverityColor(event.severity)}`}>
                        <Activity className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.source} • {formatTimeAgo(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">System Components</h3>
                  <Server className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-2">
                  {systemHealth?.components.slice(0, 6).map((component) => (
                    <div key={component.name} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{component.name}</p>
                        <p className="text-xs text-gray-500">{component.responseTime.toFixed(0)}ms</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(component.status)}`}>
                        {component.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Real-Time Metrics</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Categories</option>
                  <option>Revenue</option>
                  <option>Users</option>
                  <option>Performance</option>
                  <option>System</option>
                </select>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Plus className="h-4 w-4 inline mr-1" />
                  Add Metric
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getStatusColor(metric.status)}`}>
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                        <p className="text-sm text-gray-500">{metric.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatValue(metric.value, metric.format, metric.unit)}
                        </p>
                        <div className={`flex items-center justify-end space-x-1 ${getTrendColor(metric.trend)}`}>
                          {getTrendIcon(metric.trend)}
                          <span className="text-sm font-medium">
                            {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedMetric(metric)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Current</p>
                      <p className="font-semibold text-gray-900">
                        {formatValue(metric.value, metric.format, metric.unit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Target</p>
                      <p className="font-semibold text-blue-600">
                        {metric.target ? formatValue(metric.target, metric.format, metric.unit) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Updated</p>
                      <p className="font-semibold text-gray-900">{formatTimeAgo(metric.lastUpdated)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Updates every {metric.updateFrequency.toFixed(0)}s</span>
                      <span>Warning: {formatValue(metric.threshold.warning, metric.format, metric.unit)}</span>
                      <span>Critical: {formatValue(metric.threshold.critical, metric.format, metric.unit)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <Bell className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
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