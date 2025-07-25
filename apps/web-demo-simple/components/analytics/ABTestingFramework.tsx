'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Beaker,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Clock,
  Calendar,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download,
  Upload,
  Save,
  Copy,
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
  Code,
  Database,
  Server,
  Globe,
  User,
  DollarSign,
  Brain,
  Zap,
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
  Gamepad2
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  type: 'classic' | 'multivariate' | 'multi_armed_bandit' | 'feature_flag';
  category: 'ui_ux' | 'content' | 'pricing' | 'algorithm' | 'feature' | 'onboarding';
  variants: TestVariant[];
  metrics: TestMetric[];
  targeting: AudienceTargeting;
  configuration: TestConfiguration;
  timeline: TestTimeline;
  results: TestResults;
  analysis: StatisticalAnalysis;
  permissions: TestPermissions;
  tags: string[];
  created: number;
  lastModified: number;
  owner: string;
  collaborators: string[];
  archived: boolean;
}

interface TestVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficAllocation: number; // percentage
  configuration: VariantConfiguration;
  status: 'active' | 'inactive' | 'winner' | 'loser';
  participants: number;
  conversionRate: number;
  revenue: number;
  metrics: VariantMetrics;
  screenshots?: string[];
  codeChanges?: CodeChange[];
}

interface VariantConfiguration {
  type: 'code' | 'visual' | 'content' | 'algorithm';
  changes: ConfigurationChange[];
  featureFlags: Record<string, boolean>;
  parameters: Record<string, any>;
}

interface ConfigurationChange {
  id: string;
  type: 'element' | 'style' | 'content' | 'behavior' | 'parameter';
  target: string;
  property: string;
  value: any;
  originalValue?: any;
}

interface CodeChange {
  file: string;
  function: string;
  lines: string;
  diff: string;
  language: string;
}

interface VariantMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  engagementTime: number;
  bounceRate: number;
  retentionRate: number;
  customMetrics: Record<string, number>;
}

interface TestMetric {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'guardrail';
  category: 'conversion' | 'engagement' | 'revenue' | 'retention' | 'performance' | 'custom';
  formula: string;
  unit: string;
  direction: 'increase' | 'decrease' | 'neutral';
  target?: number;
  significance: number; // p-value threshold
  minimumDetectableEffect: number; // percentage
  currentValue?: number;
  baselineValue?: number;
  isStatSignificant?: boolean;
}

interface AudienceTargeting {
  criteria: TargetingCriteria[];
  sampleSize: number;
  estimatedReach: number;
  includeNewUsers: boolean;
  includeReturningUsers: boolean;
  geographicRegions: string[];
  deviceTypes: string[];
  browserTypes: string[];
  userSegments: string[];
  customFilters: CustomFilter[];
}

interface TargetingCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface CustomFilter {
  id: string;
  name: string;
  query: string;
  estimatedUsers: number;
}

interface TestConfiguration {
  duration: number; // days
  confidenceLevel: number; // percentage
  minimumSampleSize: number;
  maximumSampleSize?: number;
  trafficSplit: 'equal' | 'weighted' | 'adaptive';
  rampUpStrategy: 'immediate' | 'gradual' | 'scheduled';
  rampUpDuration?: number; // hours
  exclusionRules: ExclusionRule[];
  qualityAssurance: QAConfiguration;
  monitoring: MonitoringConfiguration;
}

interface ExclusionRule {
  condition: string;
  reason: string;
  enabled: boolean;
}

interface QAConfiguration {
  preflightChecks: boolean;
  crossBrowserTesting: boolean;
  performanceMonitoring: boolean;
  errorTracking: boolean;
  rollbackTriggers: RollbackTrigger[];
}

interface RollbackTrigger {
  metric: string;
  threshold: number;
  operator: 'greater_than' | 'less_than';
  timeWindow: number; // minutes
  enabled: boolean;
}

interface MonitoringConfiguration {
  realTimeAlerts: boolean;
  alertChannels: string[];
  checkInterval: number; // minutes
  reportingFrequency: 'hourly' | 'daily' | 'weekly';
  customDashboard: boolean;
}

interface TestTimeline {
  plannedStart: number;
  actualStart?: number;
  plannedEnd: number;
  actualEnd?: number;
  phases: TestPhase[];
  milestones: TestMilestone[];
}

interface TestPhase {
  name: string;
  start: number;
  end: number;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface TestMilestone {
  name: string;
  date: number;
  description: string;
  completed: boolean;
  completedDate?: number;
}

interface TestResults {
  summary: ResultsSummary;
  variantPerformance: VariantPerformance[];
  timeSeriesData: TimeSeriesPoint[];
  segmentAnalysis: SegmentAnalysis[];
  insights: TestInsight[];
  recommendations: TestRecommendation[];
  lastUpdated: number;
}

interface ResultsSummary {
  status: 'inconclusive' | 'significant' | 'winner_found' | 'no_difference';
  winner?: string;
  confidence: number;
  participants: number;
  duration: number; // actual duration in days
  primaryMetricLift: number; // percentage
  revenueImpact: number;
  statisticalPower: number;
}

interface VariantPerformance {
  variantId: string;
  metrics: Record<string, MetricResult>;
  conversionFunnel: FunnelStep[];
  userJourney: JourneyStep[];
}

interface MetricResult {
  value: number;
  baseline: number;
  lift: number; // percentage
  confidence: number;
  pValue: number;
  isSignificant: boolean;
  sampleSize: number;
}

interface FunnelStep {
  step: string;
  count: number;
  rate: number;
  dropOff: number;
}

interface JourneyStep {
  action: string;
  count: number;
  avgTime: number;
  nextSteps: string[];
}

interface TimeSeriesPoint {
  timestamp: number;
  variantId: string;
  metric: string;
  value: number;
  cumulativeValue: number;
}

interface SegmentAnalysis {
  segment: string;
  participants: number;
  winner?: string;
  metrics: Record<string, MetricResult>;
  insights: string[];
}

interface StatisticalAnalysis {
  methodology: 'frequentist' | 'bayesian' | 'sequential';
  powerAnalysis: PowerAnalysis;
  effectSize: EffectSize;
  confidence: ConfidenceInterval;
  pValueAdjustment: 'none' | 'bonferroni' | 'holm' | 'benjamini_hochberg';
  multipleComparisons: boolean;
  assumptions: AssumptionCheck[];
}

interface PowerAnalysis {
  observedPower: number;
  requiredSampleSize: number;
  currentSampleSize: number;
  timeToSignificance?: number; // hours
}

interface EffectSize {
  cohensD?: number;
  hedgesG?: number;
  glassD?: number;
  interpretation: 'negligible' | 'small' | 'medium' | 'large';
}

interface ConfidenceInterval {
  lower: number;
  upper: number;
  level: number; // percentage
  interpretation: string;
}

interface AssumptionCheck {
  assumption: string;
  test: string;
  result: 'passed' | 'failed' | 'warning';
  pValue?: number;
  recommendation?: string;
}

interface TestInsight {
  id: string;
  type: 'performance' | 'segment' | 'temporal' | 'technical' | 'business';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  data: any;
  actionable: boolean;
}

interface TestRecommendation {
  id: string;
  type: 'decision' | 'optimization' | 'followup' | 'methodology';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  expectedImpact: number;
  timeframe: string;
  requirements: string[];
}

interface TestPermissions {
  viewers: string[];
  editors: string[];
  analysts: string[];
  approvers: string[];
  public: boolean;
}

interface TestTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  defaultConfiguration: Partial<ABTest>;
  estimatedDuration: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  requiredMetrics: string[];
  bestPractices: string[];
  commonPitfalls: string[];
  successCriteria: string[];
  tags: string[];
  popularity: number;
  usageCount: number;
  created: number;
}

interface ExperimentPlatform {
  features: PlatformFeature[];
  integrations: Integration[];
  capabilities: PlatformCapability[];
  limitations: string[];
  pricing: PricingTier[];
}

interface PlatformFeature {
  name: string;
  description: string;
  category: string;
  availability: 'free' | 'paid' | 'enterprise';
  maturity: 'beta' | 'stable' | 'deprecated';
}

interface Integration {
  name: string;
  type: 'analytics' | 'tracking' | 'deployment' | 'notification';
  status: 'active' | 'available' | 'planned';
  configuration: Record<string, any>;
}

interface PlatformCapability {
  name: string;
  description: string;
  limits: Record<string, number>;
  performance: Record<string, any>;
}

interface PricingTier {
  name: string;
  monthlyPrice: number;
  features: string[];
  limits: Record<string, number>;
  support: string;
}

interface ABTestingFrameworkProps {
  className?: string;
}

export function ABTestingFramework({ className = '' }: ABTestingFrameworkProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'running' | 'results' | 'templates' | 'platform'>('overview');
  const [creationStep, setCreationStep] = useState<'setup' | 'variants' | 'metrics' | 'targeting' | 'review'>('setup');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('created');

  const generateMockTests = useCallback((): ABTest[] => {
    const testTypes = ['classic', 'multivariate', 'multi_armed_bandit', 'feature_flag'] as const;
    const categories = ['ui_ux', 'content', 'pricing', 'algorithm', 'feature', 'onboarding'] as const;
    const statuses = ['draft', 'running', 'paused', 'completed', 'archived'] as const;

    return Array.from({ length: 15 }, (_, i) => {
      const startDate = Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000;
      const duration = 7 + Math.random() * 21; // 7-28 days
      const participants = Math.floor(1000 + Math.random() * 10000);
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: `test-${i + 1}`,
        name: [
          'Homepage Hero Section Redesign',
          'Checkout Button Color Optimization',
          'Pricing Page Layout Test',
          'Onboarding Flow Simplification',
          'Product Recommendation Algorithm',
          'Email Subject Line Variants',
          'Mobile Navigation Menu',
          'Landing Page Call-to-Action',
          'User Registration Form',
          'Payment Method Selection',
          'Search Results Ranking',
          'Dashboard Widget Layout',
          'Notification Frequency Test',
          'Social Proof Elements',
          'Feature Discovery Modal'
        ][i],
        description: `A/B test ${i + 1} designed to optimize user experience and conversion rates`,
        hypothesis: `By changing the ${['design', 'copy', 'layout', 'flow', 'algorithm'][i % 5]}, we expect to see a ${5 + Math.random() * 15}% increase in ${['conversion', 'engagement', 'retention', 'revenue'][i % 4]}`,
        status,
        type: testTypes[i % testTypes.length],
        category: categories[i % categories.length],
        variants: Array.from({ length: 2 + Math.floor(Math.random() * 2) }, (_, j) => ({
          id: `variant-${j + 1}`,
          name: j === 0 ? 'Control' : `Variant ${String.fromCharCode(65 + j)}`,
          description: j === 0 ? 'Original version' : `Alternative version ${j}`,
          isControl: j === 0,
          trafficAllocation: j === 0 ? 50 : 50 / (Math.floor(Math.random() * 2) + 1),
          configuration: {
            type: ['code', 'visual', 'content', 'algorithm'][Math.floor(Math.random() * 4)] as const,
            changes: [],
            featureFlags: {},
            parameters: {}
          },
          status: ['active', 'inactive'][Math.floor(Math.random() * 2)] as const,
          participants: Math.floor(participants * (j === 0 ? 0.5 : 0.5 / (Math.floor(Math.random() * 2) + 1))),
          conversionRate: 0.02 + Math.random() * 0.08,
          revenue: Math.floor(Math.random() * 10000),
          metrics: {
            impressions: Math.floor(participants * (1 + Math.random())),
            clicks: Math.floor(participants * 0.1 * (1 + Math.random())),
            conversions: Math.floor(participants * 0.03 * (1 + Math.random())),
            revenue: Math.floor(Math.random() * 5000),
            engagementTime: 120 + Math.random() * 300,
            bounceRate: 0.3 + Math.random() * 0.4,
            retentionRate: 0.6 + Math.random() * 0.3,
            customMetrics: {}
          }
        })),
        metrics: [
          {
            id: 'primary-1',
            name: 'Conversion Rate',
            type: 'primary',
            category: 'conversion',
            formula: 'conversions / impressions',
            unit: '%',
            direction: 'increase',
            target: 5.0,
            significance: 0.05,
            minimumDetectableEffect: 10,
            currentValue: 3.2 + Math.random() * 2,
            baselineValue: 3.2,
            isStatSignificant: Math.random() > 0.5
          },
          {
            id: 'secondary-1',
            name: 'Revenue per User',
            type: 'secondary',
            category: 'revenue',
            formula: 'revenue / participants',
            unit: '$',
            direction: 'increase',
            significance: 0.05,
            minimumDetectableEffect: 15,
            currentValue: 12.50 + Math.random() * 5,
            baselineValue: 12.50
          }
        ],
        targeting: {
          criteria: [],
          sampleSize: participants,
          estimatedReach: Math.floor(participants * 1.2),
          includeNewUsers: true,
          includeReturningUsers: true,
          geographicRegions: ['US', 'CA', 'UK'],
          deviceTypes: ['desktop', 'mobile', 'tablet'],
          browserTypes: ['chrome', 'firefox', 'safari'],
          userSegments: ['new_users', 'active_users'],
          customFilters: []
        },
        configuration: {
          duration,
          confidenceLevel: 95,
          minimumSampleSize: 1000,
          trafficSplit: 'equal',
          rampUpStrategy: 'immediate',
          exclusionRules: [],
          qualityAssurance: {
            preflightChecks: true,
            crossBrowserTesting: true,
            performanceMonitoring: true,
            errorTracking: true,
            rollbackTriggers: []
          },
          monitoring: {
            realTimeAlerts: true,
            alertChannels: ['email', 'slack'],
            checkInterval: 15,
            reportingFrequency: 'daily',
            customDashboard: false
          }
        },
        timeline: {
          plannedStart: startDate,
          actualStart: status !== 'draft' ? startDate + Math.random() * 24 * 60 * 60 * 1000 : undefined,
          plannedEnd: startDate + duration * 24 * 60 * 60 * 1000,
          actualEnd: status === 'completed' ? startDate + (duration + Math.random() * 3) * 24 * 60 * 60 * 1000 : undefined,
          phases: [
            {
              name: 'Preparation',
              start: startDate - 2 * 24 * 60 * 60 * 1000,
              end: startDate,
              description: 'Test setup and QA',
              status: status !== 'draft' ? 'completed' : 'pending'
            },
            {
              name: 'Execution',
              start: startDate,
              end: startDate + duration * 24 * 60 * 60 * 1000,
              description: 'Active testing phase',
              status: status === 'running' ? 'active' : status === 'completed' ? 'completed' : 'pending'
            }
          ],
          milestones: []
        },
        results: {
          summary: {
            status: ['inconclusive', 'significant', 'winner_found', 'no_difference'][Math.floor(Math.random() * 4)] as const,
            winner: Math.random() > 0.5 ? 'variant-2' : undefined,
            confidence: 80 + Math.random() * 15,
            participants,
            duration: status === 'completed' ? duration : Math.random() * duration,
            primaryMetricLift: (Math.random() - 0.3) * 30,
            revenueImpact: Math.floor((Math.random() - 0.2) * 10000),
            statisticalPower: 0.7 + Math.random() * 0.25
          },
          variantPerformance: [],
          timeSeriesData: [],
          segmentAnalysis: [],
          insights: [],
          recommendations: [],
          lastUpdated: Date.now() - Math.random() * 60 * 60 * 1000
        },
        analysis: {
          methodology: 'frequentist',
          powerAnalysis: {
            observedPower: 0.8 + Math.random() * 0.15,
            requiredSampleSize: 1000 + Math.floor(Math.random() * 2000),
            currentSampleSize: participants,
            timeToSignificance: status === 'running' ? 24 + Math.random() * 72 : undefined
          },
          effectSize: {
            cohensD: Math.random() * 0.8,
            interpretation: ['negligible', 'small', 'medium', 'large'][Math.floor(Math.random() * 4)] as const
          },
          confidence: {
            lower: -0.05 + Math.random() * 0.1,
            upper: 0.05 + Math.random() * 0.1,
            level: 95,
            interpretation: 'Confidence interval interpretation'
          },
          pValueAdjustment: 'none',
          multipleComparisons: false,
          assumptions: []
        },
        permissions: {
          viewers: ['team@company.com'],
          editors: ['admin@company.com'],
          analysts: ['analyst@company.com'],
          approvers: ['manager@company.com'],
          public: false
        },
        tags: ['optimization', 'conversion', 'ui'].slice(0, Math.floor(1 + Math.random() * 3)),
        created: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
        lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        owner: 'user@company.com',
        collaborators: ['collaborator@company.com'],
        archived: false
      };
    });
  }, []);

  const generateMockTemplates = useCallback((): TestTemplate[] => {
    return [
      {
        id: 'template-1',
        name: 'Landing Page Optimization',
        description: 'Comprehensive template for testing landing page elements and layouts',
        category: 'Conversion Optimization',
        type: 'classic',
        defaultConfiguration: {
          type: 'classic',
          category: 'ui_ux',
          metrics: [
            {
              id: 'conversion-rate',
              name: 'Conversion Rate',
              type: 'primary',
              category: 'conversion',
              formula: 'conversions / visitors',
              unit: '%',
              direction: 'increase',
              significance: 0.05,
              minimumDetectableEffect: 10
            }
          ]
        },
        estimatedDuration: 14,
        complexity: 'beginner',
        requiredMetrics: ['page_views', 'conversions', 'bounce_rate'],
        bestPractices: [
          'Test one element at a time',
          'Run for at least 2 weeks',
          'Ensure statistical significance'
        ],
        commonPitfalls: [
          'Testing too many variables',
          'Stopping test too early',
          'Not accounting for seasonality'
        ],
        successCriteria: [
          'Minimum 1000 participants per variant',
          '95% confidence level',
          'At least 10% improvement'
        ],
        tags: ['landing-page', 'conversion', 'beginner'],
        popularity: 95,
        usageCount: 1250,
        created: Date.now() - 60 * 24 * 60 * 60 * 1000
      },
      {
        id: 'template-2',
        name: 'Email Campaign Testing',
        description: 'Template for testing email subject lines, content, and send times',
        category: 'Marketing',
        type: 'multivariate',
        defaultConfiguration: {
          type: 'multivariate',
          category: 'content'
        },
        estimatedDuration: 7,
        complexity: 'intermediate',
        requiredMetrics: ['open_rate', 'click_rate', 'conversion_rate'],
        bestPractices: [
          'Test subject line and content separately',
          'Consider time zones for send times',
          'Use representative sample sizes'
        ],
        commonPitfalls: [
          'Testing during holidays',
          'Not segmenting audience properly',
          'Ignoring email deliverability'
        ],
        successCriteria: [
          'Minimum 5000 email recipients',
          '90% confidence level',
          'Measurable impact on CTR'
        ],
        tags: ['email', 'marketing', 'multivariate'],
        popularity: 82,
        usageCount: 650,
        created: Date.now() - 45 * 24 * 60 * 60 * 1000
      },
      {
        id: 'template-3',
        name: 'Pricing Strategy Test',
        description: 'Advanced template for testing different pricing models and strategies',
        category: 'Revenue Optimization',
        type: 'multi_armed_bandit',
        defaultConfiguration: {
          type: 'multi_armed_bandit',
          category: 'pricing'
        },
        estimatedDuration: 21,
        complexity: 'advanced',
        requiredMetrics: ['revenue_per_user', 'conversion_rate', 'ltv'],
        bestPractices: [
          'Consider price elasticity',
          'Test psychological pricing',
          'Monitor customer satisfaction'
        ],
        commonPitfalls: [
          'Not considering competitive response',
          'Testing extreme price changes',
          'Ignoring customer segments'
        ],
        successCriteria: [
          'Minimum 2000 transactions',
          '99% confidence level',
          'Positive revenue impact'
        ],
        tags: ['pricing', 'revenue', 'advanced'],
        popularity: 68,
        usageCount: 280,
        created: Date.now() - 30 * 24 * 60 * 60 * 1000
      }
    ];
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTests(generateMockTests());
      setTemplates(generateMockTemplates());
    } catch (error) {
      console.error('Failed to load A/B testing data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockTests, generateMockTemplates]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredTests = tests.filter(test => {
    if (filterStatus !== 'all' && test.status !== filterStatus) return false;
    if (filterCategory !== 'all' && test.category !== filterCategory) return false;
    return true;
  });

  const sortedTests = [...filteredTests].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        return a.status.localeCompare(b.status);
      case 'created':
        return b.created - a.created;
      case 'participants':
        return b.targeting.sampleSize - a.targeting.sampleSize;
      default:
        return b.created - a.created;
    }
  });

  const createNewTest = useCallback(() => {
    setIsCreating(true);
    setCreationStep('setup');
    setActiveTab('overview');
  }, []);

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

  const formatDuration = (days: number) => {
    if (days < 1) return `${Math.floor(days * 24)}h`;
    if (days < 7) return `${Math.floor(days)}d`;
    if (days < 30) return `${Math.floor(days / 7)}w`;
    return `${Math.floor(days / 30)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
      case 'archived': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ui_ux': return 'bg-blue-100 text-blue-800';
      case 'content': return 'bg-green-100 text-green-800';
      case 'pricing': return 'bg-purple-100 text-purple-800';
      case 'algorithm': return 'bg-orange-100 text-orange-800';
      case 'feature': return 'bg-teal-100 text-teal-800';
      case 'onboarding': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultsColor = (status: string) => {
    switch (status) {
      case 'winner_found': return 'text-green-600';
      case 'significant': return 'text-blue-600';
      case 'inconclusive': return 'text-yellow-600';
      case 'no_difference': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const runningTests = tests.filter(t => t.status === 'running').length;
  const completedTests = tests.filter(t => t.status === 'completed').length;
  const totalParticipants = tests.reduce((sum, t) => sum + t.targeting.sampleSize, 0);
  const avgLift = tests
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + Math.abs(t.results.summary.primaryMetricLift), 0) / completedTests || 0;

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
            <div className="p-2 bg-orange-100 rounded-lg">
              <Beaker className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">A/B Testing Framework</h2>
              <p className="text-sm text-gray-500">Design, run, and analyze experiments to optimize user experience</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isCreating && (
              <button
                onClick={createNewTest}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Test</span>
              </button>
            )}
            {isCreating && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Step {
                  creationStep === 'setup' ? '1' :
                  creationStep === 'variants' ? '2' :
                  creationStep === 'metrics' ? '3' :
                  creationStep === 'targeting' ? '4' : '5'
                } of 5</span>
                <button
                  onClick={() => setIsCreating(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Running Tests</p>
                <p className="text-2xl font-bold text-green-900">{runningTests}</p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Completed Tests</p>
                <p className="text-2xl font-bold text-blue-900">{completedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Participants</p>
                <p className="text-2xl font-bold text-purple-900">{totalParticipants.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Lift</p>
                <p className="text-2xl font-bold text-orange-900">{avgLift.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {!isCreating && (
          <div className="flex space-x-1 mt-6">
            {['overview', 'running', 'results', 'templates', 'platform'].map((tab) => (
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
        )}
      </div>

      <div className="p-6">
        {isCreating ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Create New A/B Test</h3>
              <div className="flex items-center space-x-1">
                {['setup', 'variants', 'metrics', 'targeting', 'review'].map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setCreationStep(step as any)}
                    className={`px-3 py-1 text-sm rounded ${
                      creationStep === step
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {index + 1}. {step.charAt(0).toUpperCase() + step.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {creationStep === 'setup' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Test Setup</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="Enter test name..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>Classic A/B Test</option>
                          <option>Multivariate Test</option>
                          <option>Multi-Armed Bandit</option>
                          <option>Feature Flag</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option>UI/UX</option>
                        <option>Content</option>
                        <option>Pricing</option>
                        <option>Algorithm</option>
                        <option>Feature</option>
                        <option>Onboarding</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hypothesis</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="By changing [what], we expect to see [expected outcome] because [reasoning]..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={2}
                        placeholder="Detailed description of the test..."
                      />
                    </div>
                  </div>
                )}

                {creationStep === 'variants' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Test Variants</h4>
                      <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                        <Plus className="h-4 w-4 inline mr-1" />
                        Add Variant
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {['Control', 'Variant A'].map((variant, index) => (
                        <div key={variant} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">{variant}</h5>
                            <div className="flex items-center space-x-2">
                              {index === 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  Control
                                </span>
                              )}
                              {index > 0 && (
                                <button className="p-1 text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                defaultValue={variant}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Traffic Split</label>
                              <input
                                type="number"
                                defaultValue={50}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              rows={2}
                              placeholder={index === 0 ? "Original version" : "Description of changes..."}
                            />
                          </div>

                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Configuration Type</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                              <option>Visual Editor</option>
                              <option>Code Changes</option>
                              <option>Content Changes</option>
                              <option>Algorithm Parameters</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {creationStep === 'metrics' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Success Metrics</h4>
                      <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                        <Plus className="h-4 w-4 inline mr-1" />
                        Add Metric
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Primary Metric</h5>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                            Primary
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
                            <input
                              type="text"
                              defaultValue="Conversion Rate"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                              <option>Conversion</option>
                              <option>Engagement</option>
                              <option>Revenue</option>
                              <option>Retention</option>
                              <option>Performance</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                              <option>Increase</option>
                              <option>Decrease</option>
                              <option>Neutral</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Min Effect Size</label>
                            <input
                              type="number"
                              defaultValue="10"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="%"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Significance</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                              <option>95%</option>
                              <option>90%</option>
                              <option>99%</option>
                            </select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Formula</label>
                          <input
                            type="text"
                            defaultValue="conversions / visitors"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="metric calculation formula"
                          />
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Secondary Metric</h5>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              Secondary
                            </span>
                            <button className="p-1 text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
                            <input
                              type="text"
                              defaultValue="Revenue per User"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                              <option>Revenue</option>
                              <option>Conversion</option>
                              <option>Engagement</option>
                              <option>Retention</option>
                              <option>Performance</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {creationStep === 'targeting' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Audience Targeting</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sample Size</label>
                        <input
                          type="number"
                          defaultValue="5000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Duration</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option>1 week</option>
                          <option>2 weeks</option>
                          <option>3 weeks</option>
                          <option>4 weeks</option>
                          <option>Custom</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User Types</label>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">New Users</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Returning Users</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Geographic Regions</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia'].map((region) => (
                          <label key={region} className="flex items-center space-x-2">
                            <input type="checkbox" defaultChecked={['United States', 'Canada'].includes(region)} className="rounded" />
                            <span className="text-sm">{region}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Device Types</label>
                      <div className="flex items-center space-x-6">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Desktop</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Mobile</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">Tablet</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Custom Filters</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="Add custom targeting criteria (e.g., user_tier = 'premium' AND signup_date > '2024-01-01')"
                      />
                    </div>
                  </div>
                )}

                {creationStep === 'review' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Review & Launch</h4>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Test Summary</h5>
                          <div className="bg-gray-50 p-3 rounded">
                            <div className="space-y-2 text-sm">
                              <div><span className="font-medium">Name:</span> Homepage Hero Redesign</div>
                              <div><span className="font-medium">Type:</span> Classic A/B Test</div>
                              <div><span className="font-medium">Duration:</span> 2 weeks</div>
                              <div><span className="font-medium">Sample Size:</span> 5,000 users</div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Variants</h5>
                          <div className="space-y-2">
                            <div className="bg-gray-50 p-2 rounded text-sm">
                              <span className="font-medium">Control (50%):</span> Original homepage
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-sm">
                              <span className="font-medium">Variant A (50%):</span> New hero design
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Success Metrics</h5>
                          <div className="space-y-2">
                            <div className="bg-gray-50 p-2 rounded text-sm">
                              <span className="font-medium">Primary:</span> Conversion Rate (10% MDE)
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-sm">
                              <span className="font-medium">Secondary:</span> Revenue per User
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Pre-Launch Checklist</h5>
                          <div className="space-y-2">
                            {[
                              'Test implementation verified',
                              'QA testing completed',
                              'Tracking events configured',
                              'Success metrics defined',
                              'Rollback plan ready'
                            ].map((item, index) => (
                              <label key={index} className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm">{item}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex space-x-3">
                        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                          Save as Draft
                        </button>
                        <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                          Launch Test
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Panel */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Progress</h4>
                
                <div className="space-y-3">
                  {[
                    { step: 'Setup', completed: creationStep !== 'setup' },
                    { step: 'Variants', completed: ['metrics', 'targeting', 'review'].includes(creationStep) },
                    { step: 'Metrics', completed: ['targeting', 'review'].includes(creationStep) },
                    { step: 'Targeting', completed: creationStep === 'review' },
                    { step: 'Review', completed: false }
                  ].map((item, index) => (
                    <div key={item.step} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        item.completed 
                          ? 'bg-green-100 text-green-700' 
                          : creationStep === item.step.toLowerCase()
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                      </div>
                      <span className={`text-sm ${
                        item.completed ? 'text-green-700' : 
                        creationStep === item.step.toLowerCase() ? 'text-orange-700 font-medium' : 'text-gray-500'
                      }`}>
                        {item.step}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Estimated Timeline</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Setup: 1-2 days</div>
                    <div>Testing: 14 days</div>
                    <div>Analysis: 2-3 days</div>
                    <div className="font-medium text-gray-900">Total: ~3 weeks</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Statistical Power</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sample Size:</span>
                      <span className="font-medium">5,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Power:</span>
                      <span className="font-medium text-green-600">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium">95%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Tests</h3>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search tests..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-64"
                      />
                    </div>
                    <select 
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Status</option>
                      <option value="running">Running</option>
                      <option value="completed">Completed</option>
                      <option value="draft">Draft</option>
                      <option value="paused">Paused</option>
                    </select>
                    <select 
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Categories</option>
                      <option value="ui_ux">UI/UX</option>
                      <option value="content">Content</option>
                      <option value="pricing">Pricing</option>
                      <option value="feature">Feature</option>
                    </select>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="created">Created Date</option>
                      <option value="name">Name</option>
                      <option value="status">Status</option>
                      <option value="participants">Participants</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4">
                  {sortedTests.map((test) => (
                    <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded">
                            <Beaker className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{test.name}</h4>
                            <p className="text-sm text-gray-500">{test.type} • {test.variants.length} variants</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(test.category)}`}>
                            {test.category.replace('_', '/')}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(test.status)}`}>
                            {test.status}
                          </span>
                          <button
                            onClick={() => setSelectedTest(test)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 text-sm">{test.description}</p>

                      <div className="grid grid-cols-4 gap-4 mb-3">
                        <div>
                          <span className="text-xs text-gray-500">Participants</span>
                          <p className="font-semibold text-gray-900">{test.targeting.sampleSize.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Duration</span>
                          <p className="font-semibold text-gray-900">{formatDuration(test.configuration.duration)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Primary Metric</span>
                          <p className="font-semibold text-gray-900">{test.metrics.find(m => m.type === 'primary')?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Results</span>
                          <p className={`font-semibold ${getResultsColor(test.results.summary.status)}`}>
                            {test.status === 'completed' ? 
                              (test.results.summary.winner ? 'Winner Found' : 'Inconclusive') :
                              test.status === 'running' ? `${test.results.summary.confidence.toFixed(0)}% conf` : 'Pending'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Owner: {test.owner.split('@')[0]}</span>
                          <span>Created: {formatTimeAgo(test.created)}</span>
                          <span>Modified: {formatTimeAgo(test.lastModified)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600">
                            <Copy className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-purple-600">
                            <Edit className="h-4 w-4" />
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

            {activeTab === 'templates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Test Templates</h3>
                  <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                    <Plus className="h-4 w-4 inline mr-1" />
                    Create Template
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{template.popularity}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(template.category)}`}>
                            {template.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${getComplexityColor(template.complexity)}`}>
                            {template.complexity}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>~{template.estimatedDuration} days</span>
                          <span>{template.usageCount} uses</span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {template.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Created {formatTimeAgo(template.created)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedTemplate(template)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                            Use Template
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
        )}
      </div>
    </div>
  );
}