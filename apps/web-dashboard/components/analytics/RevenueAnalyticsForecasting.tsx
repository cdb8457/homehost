'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Calendar,
  Clock,
  Brain,
  Zap,
  Activity,
  Users,
  CreditCard,
  Banknote,
  Coins,
  Wallet,
  Receipt,
  Calculator,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
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
  Play,
  Pause,
  Square,
  RotateCcw,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
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
  File,
  Database,
  Server,
  Globe,
  Shield,
  Gamepad2
} from 'lucide-react';

interface RevenueStream {
  id: string;
  name: string;
  type: 'subscription' | 'one_time' | 'usage_based' | 'commission' | 'advertising' | 'freemium';
  category: 'primary' | 'secondary' | 'experimental';
  currentRevenue: number;
  previousRevenue: number;
  growth: number;
  growthPercent: number;
  forecast: RevenueForecast;
  metrics: RevenueMetrics;
  pricing: PricingModel;
  segments: RevenueSegment[];
  trends: TrendData[];
  lastUpdated: number;
}

interface RevenueForecast {
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  predictions: ForecastPrediction[];
  accuracy: number;
  confidence: number;
  methodology: 'linear' | 'exponential' | 'arima' | 'lstm' | 'ensemble';
  scenarios: ForecastScenario[];
  assumptions: string[];
  lastGenerated: number;
}

interface ForecastPrediction {
  date: number;
  value: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
  factors: string[];
}

interface ForecastScenario {
  name: string;
  type: 'optimistic' | 'realistic' | 'pessimistic' | 'custom';
  multiplier: number;
  assumptions: string[];
  predictions: ForecastPrediction[];
}

interface RevenueMetrics {
  arr: number; // Annual Recurring Revenue
  mrr: number; // Monthly Recurring Revenue
  arpu: number; // Average Revenue Per User
  ltv: number; // Lifetime Value
  cac: number; // Customer Acquisition Cost
  ltvCacRatio: number;
  churnRate: number;
  expansionRate: number;
  contractionRate: number;
  netRevenueRetention: number;
  grossRevenueRetention: number;
}

interface PricingModel {
  structure: 'flat_rate' | 'tiered' | 'usage_based' | 'freemium' | 'hybrid';
  tiers: PricingTier[];
  discounts: PricingDiscount[];
  optimization: PricingOptimization;
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: Record<string, number>;
  popularity: number;
  conversionRate: number;
  revenue: number;
}

interface PricingDiscount {
  type: 'volume' | 'loyalty' | 'promotional' | 'seasonal';
  amount: number;
  conditions: string[];
  impact: number;
  active: boolean;
}

interface PricingOptimization {
  currentPrice: number;
  optimalPrice: number;
  elasticity: number;
  recommendedChange: number;
  expectedRevenueLift: number;
  confidenceLevel: number;
  testRecommendation: string;
}

interface RevenueSegment {
  id: string;
  name: string;
  criteria: string[];
  userCount: number;
  revenue: number;
  arpu: number;
  growth: number;
  churn: number;
  ltv: number;
  characteristics: Record<string, any>;
}

interface TrendData {
  date: number;
  revenue: number;
  users: number;
  arpu: number;
  transactions: number;
  conversionRate: number;
}

interface RevenueGoal {
  id: string;
  name: string;
  type: 'revenue' | 'growth' | 'arpu' | 'ltv' | 'retention';
  target: number;
  current: number;
  progress: number;
  deadline: number;
  milestones: GoalMilestone[];
  owner: string;
  status: 'on_track' | 'at_risk' | 'behind' | 'completed';
}

interface GoalMilestone {
  date: number;
  target: number;
  actual?: number;
  description: string;
  achieved: boolean;
}

interface RevenueAlert {
  id: string;
  type: 'goal_deviation' | 'churn_spike' | 'growth_slowdown' | 'pricing_opportunity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  actual: number;
  impact: number;
  recommendations: string[];
  created: number;
  acknowledged: boolean;
}

interface RevenueInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'correlation';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  data: {
    metric: string;
    change: number;
    timeframe: string;
    segments: string[];
  };
  recommendations: RevenueRecommendation[];
  priority: 'low' | 'medium' | 'high';
  created: number;
  actionTaken: boolean;
}

interface RevenueRecommendation {
  action: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  requirements: string[];
  risks: string[];
}

interface RevenueAnalyticsForecastingProps {
  className?: string;
}

export function RevenueAnalyticsForecasting({ className = '' }: RevenueAnalyticsForecastingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [goals, setGoals] = useState<RevenueGoal[]>([]);
  const [alerts, setAlerts] = useState<RevenueAlert[]>([]);
  const [insights, setInsights] = useState<RevenueInsight[]>([]);
  const [selectedStream, setSelectedStream] = useState<RevenueStream | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<RevenueGoal | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'forecasting' | 'goals' | 'insights' | 'pricing'>('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [forecastPeriod, setForecastPeriod] = useState('monthly');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const generateMockTrendData = useCallback((days: number = 30): TrendData[] => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return Array.from({ length: days }, (_, i) => {
      const date = now - (days - i - 1) * oneDay;
      const baseRevenue = 10000 + Math.sin(i / 7) * 2000 + i * 50;
      const baseUsers = 500 + Math.sin(i / 5) * 100 + i * 2;
      
      return {
        date,
        revenue: Math.max(0, baseRevenue + (Math.random() - 0.5) * 1000),
        users: Math.max(0, Math.floor(baseUsers + (Math.random() - 0.5) * 50)),
        arpu: (baseRevenue / baseUsers),
        transactions: Math.floor((baseUsers * 0.3) + (Math.random() - 0.5) * 50),
        conversionRate: 0.02 + Math.random() * 0.03
      };
    });
  }, []);

  const generateMockForecast = useCallback((baseValue: number, periods: number = 12): ForecastPrediction[] => {
    const now = Date.now();
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    
    return Array.from({ length: periods }, (_, i) => {
      const date = now + i * oneMonth;
      const growth = 1 + (0.05 + Math.random() * 0.1); // 5-15% growth
      const value = baseValue * Math.pow(growth, i / 12);
      const variance = value * 0.1; // 10% variance
      
      return {
        date,
        value: Math.max(0, value + (Math.random() - 0.5) * variance),
        lowerBound: Math.max(0, value - variance),
        upperBound: value + variance,
        confidence: 0.7 + Math.random() * 0.25,
        factors: ['seasonal_trends', 'marketing_campaigns', 'product_updates'].slice(0, Math.floor(1 + Math.random() * 3))
      };
    });
  }, []);

  const generateMockRevenueStreams = useCallback((): RevenueStream[] => {
    const streamTypes = ['subscription', 'one_time', 'usage_based', 'commission', 'advertising', 'freemium'] as const;
    const categories = ['primary', 'secondary', 'experimental'] as const;
    
    const streamConfigs = [
      { name: 'Premium Subscriptions', type: 'subscription', category: 'primary', baseRevenue: 85000 },
      { name: 'Pro Subscriptions', type: 'subscription', category: 'primary', baseRevenue: 45000 },
      { name: 'One-time Purchases', type: 'one_time', category: 'secondary', baseRevenue: 25000 },
      { name: 'Usage-based Billing', type: 'usage_based', category: 'secondary', baseRevenue: 18000 },
      { name: 'Partner Commissions', type: 'commission', category: 'secondary', baseRevenue: 12000 },
      { name: 'Advertising Revenue', type: 'advertising', category: 'experimental', baseRevenue: 8000 }
    ];

    return streamConfigs.map((config, i) => {
      const currentRevenue = config.baseRevenue * (0.9 + Math.random() * 0.2);
      const previousRevenue = currentRevenue * (0.85 + Math.random() * 0.3);
      const growth = currentRevenue - previousRevenue;
      const growthPercent = (growth / previousRevenue) * 100;

      return {
        id: `stream-${i + 1}`,
        name: config.name,
        type: config.type,
        category: config.category,
        currentRevenue,
        previousRevenue,
        growth,
        growthPercent,
        forecast: {
          period: 'monthly',
          predictions: generateMockForecast(currentRevenue),
          accuracy: 0.8 + Math.random() * 0.15,
          confidence: 0.75 + Math.random() * 0.2,
          methodology: ['linear', 'exponential', 'arima', 'lstm', 'ensemble'][Math.floor(Math.random() * 5)] as const,
          scenarios: [
            {
              name: 'Optimistic',
              type: 'optimistic',
              multiplier: 1.2,
              assumptions: ['Increased marketing spend', 'Product improvements'],
              predictions: generateMockForecast(currentRevenue * 1.2)
            },
            {
              name: 'Realistic',
              type: 'realistic',
              multiplier: 1.0,
              assumptions: ['Current trends continue', 'No major changes'],
              predictions: generateMockForecast(currentRevenue)
            },
            {
              name: 'Pessimistic',
              type: 'pessimistic',
              multiplier: 0.8,
              assumptions: ['Economic downturn', 'Increased competition'],
              predictions: generateMockForecast(currentRevenue * 0.8)
            }
          ],
          assumptions: ['Historical trends continue', 'No major market disruptions'],
          lastGenerated: Date.now() - Math.random() * 24 * 60 * 60 * 1000
        },
        metrics: {
          arr: currentRevenue * 12,
          mrr: currentRevenue,
          arpu: 45 + Math.random() * 25,
          ltv: 450 + Math.random() * 200,
          cac: 35 + Math.random() * 15,
          ltvCacRatio: 8 + Math.random() * 4,
          churnRate: 0.02 + Math.random() * 0.03,
          expansionRate: 0.15 + Math.random() * 0.1,
          contractionRate: 0.05 + Math.random() * 0.03,
          netRevenueRetention: 1.1 + Math.random() * 0.2,
          grossRevenueRetention: 0.95 + Math.random() * 0.04
        },
        pricing: {
          structure: ['flat_rate', 'tiered', 'usage_based', 'freemium', 'hybrid'][Math.floor(Math.random() * 5)] as const,
          tiers: Array.from({ length: 3 }, (_, j) => ({
            id: `tier-${j + 1}`,
            name: ['Basic', 'Pro', 'Enterprise'][j],
            price: [29, 99, 299][j],
            features: [`Feature Set ${j + 1}`],
            limits: { users: [10, 100, 1000][j], storage: [10, 100, 1000][j] },
            popularity: [0.6, 0.3, 0.1][j],
            conversionRate: [0.05, 0.03, 0.02][j],
            revenue: currentRevenue * [0.3, 0.5, 0.2][j]
          })),
          discounts: [],
          optimization: {
            currentPrice: 99,
            optimalPrice: 109,
            elasticity: -0.8,
            recommendedChange: 10,
            expectedRevenueLift: 0.08,
            confidenceLevel: 0.85,
            testRecommendation: 'A/B test 10% price increase'
          }
        },
        segments: Array.from({ length: 3 }, (_, k) => ({
          id: `segment-${k + 1}`,
          name: ['Enterprise', 'SMB', 'Individual'][k],
          criteria: [`Segment criteria ${k + 1}`],
          userCount: Math.floor(100 + Math.random() * 500),
          revenue: currentRevenue * [0.5, 0.3, 0.2][k],
          arpu: [150, 75, 25][k],
          growth: (Math.random() - 0.5) * 20,
          churn: 0.01 + Math.random() * 0.04,
          ltv: [800, 400, 150][k],
          characteristics: { size: ['Large', 'Medium', 'Small'][k] }
        })),
        trends: generateMockTrendData(),
        lastUpdated: Date.now() - Math.random() * 60 * 60 * 1000
      };
    });
  }, [generateMockForecast, generateMockTrendData]);

  const generateMockGoals = useCallback((): RevenueGoal[] => {
    const goalTypes = ['revenue', 'growth', 'arpu', 'ltv', 'retention'] as const;
    const statuses = ['on_track', 'at_risk', 'behind', 'completed'] as const;

    return Array.from({ length: 6 }, (_, i) => {
      const target = 100000 + Math.random() * 400000;
      const current = target * (0.4 + Math.random() * 0.6);
      const progress = (current / target) * 100;

      return {
        id: `goal-${i + 1}`,
        name: [
          'Q4 Revenue Target',
          'Annual Growth Goal',
          'ARPU Improvement',
          'Customer LTV Increase',
          'Retention Rate Goal',
          'New Market Revenue'
        ][i],
        type: goalTypes[i % goalTypes.length],
        target,
        current,
        progress,
        deadline: Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000,
        milestones: Array.from({ length: 4 }, (_, j) => ({
          date: Date.now() + j * 30 * 24 * 60 * 60 * 1000,
          target: target * (j + 1) / 4,
          actual: j < 2 ? target * (j + 1) / 4 * (0.9 + Math.random() * 0.2) : undefined,
          description: `Milestone ${j + 1}`,
          achieved: j < 2 && Math.random() > 0.3
        })),
        owner: ['Alice Johnson', 'Bob Smith', 'Carol Williams'][Math.floor(Math.random() * 3)],
        status: statuses[Math.floor(Math.random() * statuses.length)]
      };
    });
  }, []);

  const generateMockAlerts = useCallback((): RevenueAlert[] => {
    const alertTypes = ['goal_deviation', 'churn_spike', 'growth_slowdown', 'pricing_opportunity'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;

    return Array.from({ length: 5 }, (_, i) => ({
      id: `alert-${i + 1}`,
      type: alertTypes[i % alertTypes.length],
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: [
        'Q4 revenue target at risk',
        'Churn rate spike detected',
        'Growth rate below expectations',
        'Pricing optimization opportunity',
        'Customer acquisition cost increasing'
      ][i],
      description: [
        'Current revenue trajectory suggests Q4 target may be missed by 15%',
        'Monthly churn rate has increased to 4.2%, above the 3% threshold',
        'Month-over-month growth has slowed to 2.1% from 5.8%',
        'Price elasticity analysis suggests 12% revenue lift with optimal pricing',
        'Customer acquisition cost has increased 25% while LTV remains stable'
      ][i],
      metric: ['revenue', 'churn_rate', 'growth_rate', 'pricing', 'cac'][i],
      threshold: 100 + Math.random() * 200,
      actual: 80 + Math.random() * 150,
      impact: Math.floor(1000 + Math.random() * 9000),
      recommendations: [
        'Increase marketing spend in high-performing channels',
        'Implement customer retention campaign',
        'Review and optimize pricing strategy',
        'Focus on high-value customer segments'
      ].slice(0, Math.floor(2 + Math.random() * 3)),
      created: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      acknowledged: Math.random() > 0.5
    }));
  }, []);

  const generateMockInsights = useCallback((): RevenueInsight[] => {
    const insightTypes = ['trend', 'anomaly', 'opportunity', 'risk', 'correlation'] as const;
    const impacts = ['low', 'medium', 'high'] as const;
    const priorities = ['low', 'medium', 'high'] as const;

    return Array.from({ length: 8 }, (_, i) => ({
      id: `insight-${i + 1}`,
      type: insightTypes[i % insightTypes.length],
      title: [
        'Enterprise segment driving 60% of revenue growth',
        'Weekend conversion rates 35% higher than weekdays',
        'Annual subscriptions show 3x higher retention',
        'Mobile users have lower average transaction value',
        'Customer support interaction correlates with higher LTV',
        'Seasonal revenue patterns suggest Q1 opportunity',
        'Free trial length optimization could increase conversions',
        'Geographic expansion ROI exceeds projections'
      ][i],
      description: [
        'Enterprise customers are contributing disproportionately to revenue growth, suggesting focus opportunity',
        'Conversion rates during weekends consistently outperform weekdays by 35%',
        'Customers on annual plans show 3x better retention than monthly subscribers',
        'Mobile users generate 40% lower transaction values, indicating UX optimization need',
        'Customers who interact with support within first month show 25% higher LTV',
        'Historical data shows Q1 typically sees 20% revenue increase, plan accordingly',
        'Optimal free trial length appears to be 14 days instead of current 7 days',
        'New geographic markets are exceeding revenue projections by 45%'
      ][i],
      confidence: 0.7 + Math.random() * 0.25,
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      category: ['Revenue', 'Conversion', 'Retention', 'UX', 'Support', 'Seasonality', 'Pricing', 'Expansion'][i],
      data: {
        metric: ['revenue', 'conversion_rate', 'retention', 'arpu'][Math.floor(Math.random() * 4)],
        change: (Math.random() - 0.3) * 50,
        timeframe: ['7 days', '30 days', '90 days'][Math.floor(Math.random() * 3)],
        segments: ['Enterprise', 'SMB', 'Individual'].slice(0, Math.floor(1 + Math.random() * 3))
      },
      recommendations: [
        {
          action: 'Focus marketing on enterprise segment',
          expectedImpact: 15,
          effort: 'medium',
          timeline: '30 days',
          requirements: ['Marketing budget reallocation', 'Sales team training'],
          risks: ['Neglecting other segments']
        },
        {
          action: 'Optimize weekend conversion flows',
          expectedImpact: 8,
          effort: 'low',
          timeline: '14 days',
          requirements: ['A/B testing setup', 'Analytics tracking'],
          risks: ['Limited weekend traffic']
        }
      ].slice(0, Math.floor(1 + Math.random() * 2)),
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      created: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
      actionTaken: Math.random() > 0.7
    }));
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRevenueStreams(generateMockRevenueStreams());
      setGoals(generateMockGoals());
      setAlerts(generateMockAlerts());
      setInsights(generateMockInsights());
    } catch (error) {
      console.error('Failed to load revenue analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockRevenueStreams, generateMockGoals, generateMockAlerts, generateMockInsights]);

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor(diff / (60 * 1000));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track': case 'completed': return 'text-green-600 bg-green-50';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50';
      case 'behind': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const totalRevenue = revenueStreams.reduce((sum, stream) => sum + stream.currentRevenue, 0);
  const totalGrowth = revenueStreams.reduce((sum, stream) => sum + stream.growth, 0);
  const avgGrowthPercent = revenueStreams.length > 0 ? 
    revenueStreams.reduce((sum, stream) => sum + stream.growthPercent, 0) / revenueStreams.length : 0;
  const avgArpu = revenueStreams.length > 0 ?
    revenueStreams.reduce((sum, stream) => sum + stream.metrics.arpu, 0) / revenueStreams.length : 0;

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
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Revenue Analytics & Forecasting</h2>
              <p className="text-sm text-gray-500">Comprehensive revenue analysis, forecasting, and optimization</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <select 
              value={forecastPeriod}
              onChange={(e) => setForecastPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="daily">Daily Forecast</option>
              <option value="weekly">Weekly Forecast</option>
              <option value="monthly">Monthly Forecast</option>
              <option value="quarterly">Quarterly Forecast</option>
            </select>
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
                <p className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Growth Rate</p>
                <p className="text-2xl font-bold text-blue-900">{formatPercentage(avgGrowthPercent)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg ARPU</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(avgArpu)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Monthly Growth</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(totalGrowth)}</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mt-6">
          {['overview', 'streams', 'forecasting', 'goals', 'insights', 'pricing'].map((tab) => (
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
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Streams</h3>
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {revenueStreams.slice(0, 4).map((stream) => (
                    <div key={stream.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{stream.name}</p>
                        <p className="text-xs text-gray-500">{stream.type} • {stream.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900">{formatCurrency(stream.currentRevenue)}</p>
                        <div className={`flex items-center justify-end space-x-1 ${getTrendColor(stream.growthPercent)}`}>
                          {stream.growthPercent > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          <span className="text-xs">{formatPercentage(Math.abs(stream.growthPercent))}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Goals</h3>
                  <Target className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {goals.slice(0, 4).map((goal) => (
                    <div key={goal.id} className="p-3 bg-white rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm text-gray-900">{goal.name}</p>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">Progress</span>
                        <span className="text-xs text-gray-900">{goal.progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(goal.progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{formatCurrency(goal.current)}</span>
                        <span>{formatCurrency(goal.target)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Alerts</h3>
                  <AlertTriangle className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {alerts.slice(0, 4).map((alert) => (
                    <div key={alert.id} className="p-3 bg-white rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{alert.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Impact: {formatCurrency(alert.impact)}</span>
                        <span className="text-xs text-gray-500">{formatTimeAgo(alert.created)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Insights</h3>
                  <Lightbulb className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {insights.slice(0, 4).map((insight) => (
                    <div key={insight.id} className="p-3 bg-white rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(insight.impact)}`}>
                          {insight.impact} impact
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{insight.category}</span>
                        <span className="text-xs text-blue-600">{(insight.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Streams</h3>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                <Plus className="h-4 w-4 inline mr-1" />
                Add Stream
              </button>
            </div>

            <div className="grid gap-4">
              {revenueStreams.map((stream) => (
                <div key={stream.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{stream.name}</h4>
                        <p className="text-sm text-gray-500">{stream.type} • {stream.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(stream.currentRevenue)}</span>
                      <button
                        onClick={() => setSelectedStream(stream)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Growth</p>
                      <div className={`flex items-center space-x-1 ${getTrendColor(stream.growthPercent)}`}>
                        {stream.growthPercent > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="font-semibold">{formatPercentage(Math.abs(stream.growthPercent))}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ARPU</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(stream.metrics.arpu)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">LTV</p>
                      <p className="font-semibold text-gray-900">{formatCurrency(stream.metrics.ltv)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Churn Rate</p>
                      <p className="font-semibold text-gray-900">{formatPercentage(stream.metrics.churnRate * 100)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>MRR: {formatCurrency(stream.metrics.mrr)}</span>
                      <span>NRR: {formatPercentage((stream.metrics.netRevenueRetention - 1) * 100)}</span>
                      <span>Updated: {formatTimeAgo(stream.lastUpdated)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <TrendingUp className="h-4 w-4" />
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

        {/* Continue with other tabs - forecasting, goals, insights, pricing */}
      </div>
    </div>
  );
}