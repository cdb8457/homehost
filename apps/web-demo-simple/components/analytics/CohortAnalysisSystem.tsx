'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Zap,
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Download,
  Upload,
  Save,
  Copy,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Share2,
  Send,
  Plus,
  Minus,
  X,
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
  FileText,
  Folder,
  FolderOpen,
  File,
  Code,
  Terminal,
  Database,
  Server,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Watch,
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
  Mail,
  Phone,
  Shield,
  Lock,
  Unlock,
  Key,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  ExternalLink,
  Gamepad2,
  DollarSign,
  User,
  Map,
  MapPin
} from 'lucide-react';

interface CohortDefinition {
  id: string;
  name: string;
  description: string;
  type: 'acquisition' | 'behavioral' | 'revenue' | 'engagement';
  criteria: CohortCriteria;
  timeframe: CohortTimeframe;
  metrics: CohortMetric[];
  segments: CohortSegment[];
  filters: CohortFilter[];
  isActive: boolean;
  createdBy: string;
  createdAt: number;
  lastAnalyzed: number;
}

interface CohortCriteria {
  event: string;
  conditions: ConditionRule[];
  dateRange: {
    type: 'relative' | 'absolute' | 'rolling';
    value: string;
    start?: number;
    end?: number;
  };
  aggregation: 'daily' | 'weekly' | 'monthly' | 'quarterly';
}

interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface CohortTimeframe {
  periodType: 'day' | 'week' | 'month' | 'quarter';
  periodCount: number;
  startDate: number;
  endDate: number;
}

interface CohortMetric {
  id: string;
  name: string;
  type: 'retention' | 'revenue' | 'engagement' | 'conversion' | 'ltv' | 'churn';
  calculation: 'rate' | 'count' | 'sum' | 'average' | 'median' | 'percentile';
  format: 'percentage' | 'currency' | 'number' | 'duration';
  target?: number;
  benchmark?: number;
}

interface CohortSegment {
  id: string;
  name: string;
  conditions: ConditionRule[];
  color: string;
  isActive: boolean;
}

interface CohortFilter {
  id: string;
  field: string;
  operator: string;
  value: any;
  isActive: boolean;
}

interface CohortAnalysis {
  cohortId: string;
  cohortSize: number;
  periods: CohortPeriod[];
  summary: CohortSummary;
  trends: CohortTrend[];
  insights: CohortInsight[];
  comparisons: CohortComparison[];
  recommendations: CohortRecommendation[];
}

interface CohortPeriod {
  period: number;
  date: number;
  userCount: number;
  retentionRate: number;
  cumulativeRetention: number;
  revenue: number;
  averageRevenue: number;
  engagementScore: number;
  conversionRate: number;
  churnRate: number;
  segments: { [segmentId: string]: CohortSegmentData };
}

interface CohortSegmentData {
  userCount: number;
  retentionRate: number;
  revenue: number;
  engagementScore: number;
}

interface CohortSummary {
  totalUsers: number;
  avgRetentionRate: number;
  peakRetentionPeriod: number;
  totalRevenue: number;
  avgRevenuePerUser: number;
  lifetimeValue: number;
  churnRate: number;
  healthScore: number;
}

interface CohortTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  significance: 'low' | 'medium' | 'high';
  periods: number[];
}

interface CohortInsight {
  id: string;
  type: 'retention_drop' | 'revenue_spike' | 'segment_anomaly' | 'seasonal_pattern' | 'benchmark_comparison';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  periods: number[];
  segments?: string[];
  recommendations: string[];
}

interface CohortComparison {
  id: string;
  name: string;
  baselineCohort: string;
  comparisonCohort: string;
  metrics: ComparisonMetric[];
  insights: string[];
}

interface ComparisonMetric {
  name: string;
  baseline: number;
  comparison: number;
  difference: number;
  percentChange: number;
  significance: 'low' | 'medium' | 'high';
}

interface CohortRecommendation {
  id: string;
  type: 'retention_improvement' | 'revenue_optimization' | 'engagement_boost' | 'churn_reduction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  actionItems: string[];
  metrics: string[];
}

interface CohortTemplate {
  id: string;
  name: string;
  description: string;
  category: 'gaming' | 'ecommerce' | 'saas' | 'mobile_app' | 'subscription';
  criteria: Partial<CohortCriteria>;
  metrics: CohortMetric[];
  isPopular: boolean;
}

const CohortAnalysisSystem: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cohorts' | 'analysis' | 'insights' | 'comparisons' | 'templates'>('cohorts');
  const [cohorts, setCohorts] = useState<CohortDefinition[]>([]);
  const [selectedCohort, setSelectedCohort] = useState<CohortDefinition | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<CohortAnalysis | null>(null);
  const [templates, setTemplates] = useState<CohortTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showInsightDetails, setShowInsightDetails] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'heatmap' | 'chart'>('table');
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('retention');
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockCohorts = useCallback((): CohortDefinition[] => {
    const cohortTypes = ['acquisition', 'behavioral', 'revenue', 'engagement'] as const;
    const eventTypes = ['first_login', 'first_purchase', 'level_complete', 'subscription_start', 'tutorial_complete'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `cohort_${i + 1}`,
      name: `${eventTypes[i % eventTypes.length].replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Cohort ${i + 1}`,
      description: `Analysis of users who performed ${eventTypes[i % eventTypes.length].replace('_', ' ')} in their journey`,
      type: cohortTypes[i % cohortTypes.length],
      criteria: {
        event: eventTypes[i % eventTypes.length],
        conditions: [
          {
            field: 'platform',
            operator: 'in',
            value: ['mobile', 'web', 'desktop']
          }
        ],
        dateRange: {
          type: 'relative',
          value: '90d'
        },
        aggregation: 'weekly'
      },
      timeframe: {
        periodType: 'week',
        periodCount: 12,
        startDate: Date.now() - (90 * 24 * 60 * 60 * 1000),
        endDate: Date.now()
      },
      metrics: [
        {
          id: 'retention',
          name: 'Retention Rate',
          type: 'retention',
          calculation: 'rate',
          format: 'percentage',
          target: 25 + Math.random() * 50,
          benchmark: 30
        },
        {
          id: 'revenue',
          name: 'Revenue per User',
          type: 'revenue',
          calculation: 'average',
          format: 'currency'
        }
      ],
      segments: [
        {
          id: 'high_value',
          name: 'High Value',
          conditions: [
            {
              field: 'total_spent',
              operator: 'greater_than',
              value: 100
            }
          ],
          color: '#10B981',
          isActive: true
        },
        {
          id: 'casual',
          name: 'Casual Players',
          conditions: [
            {
              field: 'sessions_per_week',
              operator: 'less_than',
              value: 3
            }
          ],
          color: '#F59E0B',
          isActive: true
        }
      ],
      filters: [],
      isActive: Math.random() > 0.2,
      createdBy: `analyst_${Math.floor(Math.random() * 5) + 1}`,
      createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      lastAnalyzed: Date.now() - Math.random() * 24 * 60 * 60 * 1000
    }));
  }, []);

  const generateMockAnalysis = useCallback((cohort: CohortDefinition): CohortAnalysis => {
    const periods = Array.from({ length: cohort.timeframe.periodCount }, (_, i) => {
      const baseRetention = 100 - (i * 8) - Math.random() * 15;
      const retentionRate = Math.max(5, baseRetention);
      const userCount = Math.floor((1000 - i * 50) * (retentionRate / 100));
      
      return {
        period: i,
        date: cohort.timeframe.startDate + (i * 7 * 24 * 60 * 60 * 1000),
        userCount,
        retentionRate,
        cumulativeRetention: Math.max(5, 100 - (i * 12)),
        revenue: userCount * (5 + Math.random() * 15),
        averageRevenue: 5 + Math.random() * 15,
        engagementScore: 60 + Math.random() * 30,
        conversionRate: 2 + Math.random() * 8,
        churnRate: Math.min(95, i * 8 + Math.random() * 10),
        segments: {
          high_value: {
            userCount: Math.floor(userCount * 0.2),
            retentionRate: retentionRate * 1.5,
            revenue: userCount * 0.2 * 25,
            engagementScore: 80 + Math.random() * 15
          },
          casual: {
            userCount: Math.floor(userCount * 0.6),
            retentionRate: retentionRate * 0.8,
            revenue: userCount * 0.6 * 3,
            engagementScore: 40 + Math.random() * 20
          }
        }
      };
    });

    const totalUsers = 1000;
    const avgRetentionRate = periods.reduce((sum, p) => sum + p.retentionRate, 0) / periods.length;
    const totalRevenue = periods.reduce((sum, p) => sum + p.revenue, 0);

    const insights: CohortInsight[] = [
      {
        id: 'retention_drop',
        type: 'retention_drop',
        severity: 'high',
        title: 'Significant Retention Drop After Week 3',
        description: 'There is a notable 35% drop in retention between week 2 and week 4, indicating potential onboarding issues.',
        impact: 'Potential loss of 350 users per cohort',
        confidence: 85,
        periods: [2, 3, 4],
        recommendations: [
          'Implement additional onboarding checkpoints',
          'Add personalized content recommendations',
          'Introduce social features to increase engagement'
        ]
      },
      {
        id: 'segment_performance',
        type: 'segment_anomaly',
        severity: 'medium',
        title: 'High-Value Segment Outperforming',
        description: 'High-value users show 50% better retention compared to casual players.',
        impact: 'Opportunity to convert casual users to high-value segment',
        confidence: 92,
        periods: [0, 1, 2, 3, 4, 5],
        segments: ['high_value', 'casual'],
        recommendations: [
          'Create upgrade incentives for casual players',
          'Implement loyalty programs',
          'Offer personalized premium features'
        ]
      }
    ];

    return {
      cohortId: cohort.id,
      cohortSize: totalUsers,
      periods,
      summary: {
        totalUsers,
        avgRetentionRate,
        peakRetentionPeriod: 0,
        totalRevenue,
        avgRevenuePerUser: totalRevenue / totalUsers,
        lifetimeValue: totalRevenue / totalUsers * 2.5,
        churnRate: 100 - avgRetentionRate,
        healthScore: Math.min(100, avgRetentionRate + (totalRevenue / totalUsers))
      },
      trends: [
        {
          metric: 'retention',
          direction: 'down',
          change: -15.5,
          significance: 'high',
          periods: [0, 1, 2, 3, 4, 5]
        }
      ],
      insights,
      comparisons: [],
      recommendations: [
        {
          id: 'onboarding_improvement',
          type: 'retention_improvement',
          priority: 'high',
          title: 'Enhance Onboarding Experience',
          description: 'Implement progressive onboarding with personalized guidance',
          expectedImpact: '+25% retention in first 4 weeks',
          effort: 'medium',
          timeline: '6-8 weeks',
          actionItems: [
            'Design interactive tutorial system',
            'Create personalized content recommendations',
            'Implement progress tracking'
          ],
          metrics: ['retention_rate', 'engagement_score']
        }
      ]
    };
  }, []);

  const generateMockTemplates = useCallback((): CohortTemplate[] => {
    return [
      {
        id: 'gaming_new_players',
        name: 'New Player Retention',
        description: 'Track retention of players who completed their first game session',
        category: 'gaming',
        criteria: {
          event: 'first_game_complete',
          aggregation: 'daily'
        },
        metrics: [
          {
            id: 'retention',
            name: 'Day 1, 7, 30 Retention',
            type: 'retention',
            calculation: 'rate',
            format: 'percentage'
          }
        ],
        isPopular: true
      },
      {
        id: 'revenue_first_purchase',
        name: 'First Purchase Cohort',
        description: 'Analyze behavior of users after their first purchase',
        category: 'gaming',
        criteria: {
          event: 'first_purchase',
          aggregation: 'weekly'
        },
        metrics: [
          {
            id: 'ltv',
            name: 'Lifetime Value',
            type: 'ltv',
            calculation: 'sum',
            format: 'currency'
          }
        ],
        isPopular: true
      }
    ];
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockCohorts = generateMockCohorts();
        const mockTemplates = generateMockTemplates();
        
        setCohorts(mockCohorts);
        setTemplates(mockTemplates);
        
        if (mockCohorts.length > 0) {
          setSelectedCohort(mockCohorts[0]);
          setCurrentAnalysis(generateMockAnalysis(mockCohorts[0]));
        }
      } catch (error) {
        console.error('Error loading cohort data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockCohorts, generateMockTemplates, generateMockAnalysis]);

  useEffect(() => {
    if (refreshInterval) {
      intervalRef.current = setInterval(() => {
        if (selectedCohort) {
          setCurrentAnalysis(generateMockAnalysis(selectedCohort));
        }
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, selectedCohort, generateMockAnalysis]);

  const handleCohortSelect = (cohort: CohortDefinition) => {
    setSelectedCohort(cohort);
    setCurrentAnalysis(generateMockAnalysis(cohort));
  };

  const handleRefresh = () => {
    if (selectedCohort) {
      setCurrentAnalysis(generateMockAnalysis(selectedCohort));
    }
  };

  const renderCohortTable = () => {
    if (!currentAnalysis) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Period</th>
              <th className="border border-gray-200 px-4 py-2 text-right">Size</th>
              {currentAnalysis.periods.map((_, index) => (
                <th key={index} className="border border-gray-200 px-3 py-2 text-center min-w-[60px]">
                  {index}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentAnalysis.periods.map((period, periodIndex) => (
              <tr key={periodIndex} className={periodIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-200 px-4 py-2">
                  {new Date(period.date).toLocaleDateString()}
                </td>
                <td className="border border-gray-200 px-4 py-2 text-right font-medium">
                  {period.userCount.toLocaleString()}
                </td>
                {currentAnalysis.periods.map((_, cellIndex) => {
                  if (cellIndex < periodIndex) {
                    return <td key={cellIndex} className="border border-gray-200 px-3 py-2"></td>;
                  }
                  
                  const cellPeriod = currentAnalysis.periods[cellIndex];
                  const retentionRate = cellIndex === periodIndex ? 100 : 
                    Math.max(5, period.retentionRate - ((cellIndex - periodIndex) * 8));
                  
                  const getColor = (rate: number) => {
                    if (rate >= 60) return 'bg-green-500';
                    if (rate >= 40) return 'bg-yellow-500';
                    if (rate >= 20) return 'bg-orange-500';
                    return 'bg-red-500';
                  };
                  
                  return (
                    <td key={cellIndex} className="border border-gray-200 px-3 py-2 text-center">
                      <div className={`${getColor(retentionRate)} text-white px-2 py-1 rounded text-xs font-medium`}>
                        {retentionRate.toFixed(1)}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInsights = () => {
    if (!currentAnalysis?.insights) return null;

    return (
      <div className="space-y-4">
        {currentAnalysis.insights.map((insight) => (
          <div key={insight.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  insight.severity === 'critical' ? 'bg-red-100 text-red-600' :
                  insight.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                  insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-sm text-gray-500">
                    Confidence: {insight.confidence}% | Impact: {insight.impact}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                insight.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {insight.severity.toUpperCase()}
              </span>
            </div>
            
            <p className="text-gray-700 mb-4">{insight.description}</p>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recommendations:</h4>
              <ul className="space-y-2">
                {insight.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cohort Analysis System</h1>
          <p className="text-gray-600 mt-2">Advanced user retention and behavioral cohort analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>From Template</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Cohort</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'cohorts', name: 'Cohorts', icon: Users },
              { id: 'analysis', name: 'Analysis', icon: BarChart3 },
              { id: 'insights', name: 'Insights', icon: Brain },
              { id: 'comparisons', name: 'Comparisons', icon: Target },
              { id: 'templates', name: 'Templates', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'cohorts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search cohorts..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">All Types</option>
                    <option value="acquisition">Acquisition</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="revenue">Revenue</option>
                    <option value="engagement">Engagement</option>
                  </select>
                </div>
                <button
                  onClick={handleRefresh}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cohorts.map((cohort) => (
                  <div
                    key={cohort.id}
                    onClick={() => handleCohortSelect(cohort)}
                    className={`bg-white border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                      selectedCohort?.id === cohort.id
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{cohort.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{cohort.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        cohort.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cohort.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium capitalize">{cohort.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Periods:</span>
                        <span className="font-medium">{cohort.timeframe.periodCount} {cohort.timeframe.periodType}s</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Analysis:</span>
                        <span className="font-medium">
                          {new Date(cohort.lastAnalyzed).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {cohort.metrics.length} metrics
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          {cohort.segments.length} segments
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && selectedCohort && currentAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCohort.name}</h2>
                  <p className="text-gray-600">{selectedCohort.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="table">Table View</option>
                    <option value="heatmap">Heatmap</option>
                    <option value="chart">Chart View</option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Users</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {currentAnalysis.summary.totalUsers.toLocaleString()}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Avg Retention</p>
                      <p className="text-2xl font-bold text-green-900">
                        {currentAnalysis.summary.avgRetentionRate.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Lifetime Value</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ${currentAnalysis.summary.lifetimeValue.toFixed(0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Health Score</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {currentAnalysis.summary.healthScore.toFixed(0)}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-500" />
                  </div>
                </div>
              </div>

              {viewMode === 'table' && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Retention Cohort Table</h3>
                    <p className="text-gray-600">Retention rates by period for each cohort</p>
                  </div>
                  <div className="p-4">
                    {renderCohortTable()}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insights' && currentAnalysis && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Cohort Insights</h2>
                  <p className="text-gray-600">AI-powered insights and recommendations</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Brain className="w-4 h-4" />
                  <span>Generate New Insights</span>
                </button>
              </div>

              {renderInsights()}
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Cohort Templates</h2>
                  <p className="text-gray-600">Pre-built cohort configurations for common use cases</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Plus className="w-4 h-4" />
                  <span>Create Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                      </div>
                      {template.isPopular && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Popular
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium capitalize">{template.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Metrics:</span>
                        <span className="font-medium">{template.metrics.length} included</span>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Use Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CohortAnalysisSystem;