'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Activity,
  Zap,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
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
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Settings,
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
  Wifi,
  WifiOff,
  Network,
  Cpu,
  MemoryStick,
  HardDrive,
  Shield,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  MoreHorizontal,
  ExternalLink,
  Gamepad2,
  User,
  Map,
  MapPin,
  Navigation,
  Route
} from 'lucide-react';

interface CustomerProfile {
  id: string;
  userId: string;
  demographics: CustomerDemographics;
  behavioral: BehavioralMetrics;
  transactional: TransactionalData;
  engagement: EngagementMetrics;
  predictive: PredictiveScores;
  segments: CustomerSegment[];
  journey: CustomerJourneyStage[];
  riskFactors: RiskFactor[];
  opportunities: GrowthOpportunity[];
  lastUpdated: number;
}

interface CustomerDemographics {
  age?: number;
  ageGroup: 'gen_z' | 'millennial' | 'gen_x' | 'boomer';
  location: {
    country: string;
    region: string;
    timezone: string;
  };
  platform: 'mobile' | 'web' | 'desktop' | 'console';
  acquisitionChannel: string;
  acquisitionDate: number;
  deviceType: string;
  language: string;
}

interface BehavioralMetrics {
  sessionFrequency: number;
  averageSessionDuration: number;
  pagesPerSession: number;
  featureUsage: { [feature: string]: number };
  activityPatterns: ActivityPattern[];
  socialEngagement: SocialMetrics;
  contentPreferences: ContentPreference[];
  navigationPatterns: NavigationPath[];
}

interface ActivityPattern {
  type: 'daily' | 'weekly' | 'monthly';
  pattern: number[];
  peakHours: number[];
  consistency: number;
}

interface SocialMetrics {
  friendsCount: number;
  messagesPerDay: number;
  groupParticipation: number;
  sharingFrequency: number;
  influenceScore: number;
}

interface ContentPreference {
  category: string;
  engagement: number;
  timeSpent: number;
  completionRate: number;
}

interface NavigationPath {
  path: string[];
  frequency: number;
  conversionRate: number;
  dropoffPoints: string[];
}

interface TransactionalData {
  totalSpent: number;
  averageOrderValue: number;
  purchaseFrequency: number;
  firstPurchaseDate?: number;
  lastPurchaseDate?: number;
  paymentMethods: string[];
  transactionHistory: Transaction[];
  refundRate: number;
  loyaltyPoints: number;
}

interface Transaction {
  id: string;
  date: number;
  amount: number;
  category: string;
  items: TransactionItem[];
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
}

interface TransactionItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface EngagementMetrics {
  overallScore: number;
  loginFrequency: number;
  featureAdoption: number;
  contentConsumption: number;
  socialInteraction: number;
  supportInteraction: number;
  feedbackSubmission: number;
  loyaltyProgram: number;
}

interface PredictiveScores {
  churnProbability: number;
  lifetimeValue: number;
  nextPurchaseProbability: number;
  upsellPotential: number;
  referralLikelihood: number;
  engagementRisk: number;
  growthPotential: number;
  satisfaction: number;
  modelConfidence: number;
  lastPredicted: number;
}

interface CustomerSegment {
  id: string;
  name: string;
  type: 'behavioral' | 'demographic' | 'value' | 'lifecycle' | 'predictive';
  confidence: number;
  characteristics: string[];
  strategies: RecommendedStrategy[];
}

interface RecommendedStrategy {
  type: 'retention' | 'growth' | 'engagement' | 'monetization';
  action: string;
  expectedImpact: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeline: string;
}

interface CustomerJourneyStage {
  stage: 'awareness' | 'consideration' | 'purchase' | 'onboarding' | 'engagement' | 'loyalty' | 'advocacy' | 'churn_risk';
  entryDate: number;
  duration: number;
  actions: JourneyAction[];
  satisfaction: number;
  conversionRate: number;
  nextStage?: string;
  stageHealth: number;
}

interface JourneyAction {
  type: string;
  timestamp: number;
  outcome: 'positive' | 'negative' | 'neutral';
  impact: number;
}

interface RiskFactor {
  type: 'churn' | 'engagement_drop' | 'payment_issues' | 'support_escalation' | 'feature_abandonment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  impact: string;
  indicators: string[];
  timeframe: string;
  mitigationActions: string[];
}

interface GrowthOpportunity {
  type: 'upsell' | 'cross_sell' | 'feature_adoption' | 'engagement_increase' | 'referral' | 'loyalty_upgrade';
  potential: number;
  confidence: number;
  timeframe: string;
  requiredActions: string[];
  expectedOutcome: string;
  businessImpact: string;
}

interface PredictiveModel {
  id: string;
  name: string;
  type: 'churn' | 'ltv' | 'next_purchase' | 'upsell' | 'engagement' | 'satisfaction';
  algorithm: 'logistic_regression' | 'random_forest' | 'gradient_boosting' | 'neural_network' | 'ensemble';
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  features: ModelFeature[];
  lastTrained: number;
  version: string;
  isActive: boolean;
}

interface ModelFeature {
  name: string;
  importance: number;
  type: 'categorical' | 'numerical' | 'binary' | 'temporal';
  description: string;
}

interface PredictiveInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedCustomers: number;
  timeframe: string;
  confidence: number;
  impact: string;
  recommendations: string[];
  models: string[];
  metrics: InsightMetric[];
}

interface InsightMetric {
  name: string;
  current: number;
  predicted: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface CampaignRecommendation {
  id: string;
  name: string;
  type: 'retention' | 'acquisition' | 'growth' | 'engagement' | 'winback';
  targetSegment: string;
  estimatedReach: number;
  expectedConversion: number;
  projectedROI: number;
  budget: number;
  timeline: string;
  channels: string[];
  content: CampaignContent;
  kpis: string[];
}

interface CampaignContent {
  subject: string;
  message: string;
  callToAction: string;
  personalization: PersonalizationElement[];
}

interface PersonalizationElement {
  field: string;
  value: string;
  type: 'static' | 'dynamic' | 'conditional';
}

const PredictiveCustomerAnalytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'models' | 'insights' | 'campaigns' | 'segments'>('overview');
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecommendation[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showInsightDetails, setShowInsightDetails] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [riskLevel, setRiskLevel] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateMockCustomers = useCallback((): CustomerProfile[] => {
    const ageGroups = ['gen_z', 'millennial', 'gen_x', 'boomer'] as const;
    const platforms = ['mobile', 'web', 'desktop', 'console'] as const;
    const countries = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'BR'];
    const channels = ['organic', 'paid_search', 'social', 'email', 'referral', 'direct'];
    
    return Array.from({ length: 50 }, (_, i) => {
      const churnProb = Math.random();
      const ltv = 50 + Math.random() * 500;
      const engagementScore = 20 + Math.random() * 80;
      
      return {
        id: `customer_${i + 1}`,
        userId: `user_${i + 1}`,
        demographics: {
          ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
          location: {
            country: countries[Math.floor(Math.random() * countries.length)],
            region: `Region ${Math.floor(Math.random() * 10) + 1}`,
            timezone: 'UTC-5'
          },
          platform: platforms[Math.floor(Math.random() * platforms.length)],
          acquisitionChannel: channels[Math.floor(Math.random() * channels.length)],
          acquisitionDate: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          deviceType: 'smartphone',
          language: 'en'
        },
        behavioral: {
          sessionFrequency: 2 + Math.random() * 8,
          averageSessionDuration: 300 + Math.random() * 1200,
          pagesPerSession: 3 + Math.random() * 10,
          featureUsage: {
            'game_mode_classic': Math.random() * 100,
            'multiplayer': Math.random() * 100,
            'achievements': Math.random() * 100,
            'social_features': Math.random() * 100
          },
          activityPatterns: [
            {
              type: 'daily',
              pattern: Array.from({ length: 24 }, () => Math.random() * 100),
              peakHours: [18, 19, 20, 21],
              consistency: 60 + Math.random() * 40
            }
          ],
          socialEngagement: {
            friendsCount: Math.floor(Math.random() * 100),
            messagesPerDay: Math.random() * 20,
            groupParticipation: Math.random() * 10,
            sharingFrequency: Math.random() * 5,
            influenceScore: Math.random() * 100
          },
          contentPreferences: [
            {
              category: 'action',
              engagement: Math.random() * 100,
              timeSpent: Math.random() * 1000,
              completionRate: Math.random() * 100
            }
          ],
          navigationPatterns: [
            {
              path: ['home', 'games', 'profile'],
              frequency: Math.random() * 50,
              conversionRate: Math.random() * 100,
              dropoffPoints: ['settings']
            }
          ]
        },
        transactional: {
          totalSpent: Math.random() * 1000,
          averageOrderValue: 10 + Math.random() * 50,
          purchaseFrequency: Math.random() * 10,
          firstPurchaseDate: Date.now() - Math.random() * 300 * 24 * 60 * 60 * 1000,
          lastPurchaseDate: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          paymentMethods: ['credit_card', 'paypal'],
          transactionHistory: [],
          refundRate: Math.random() * 5,
          loyaltyPoints: Math.floor(Math.random() * 1000)
        },
        engagement: {
          overallScore: engagementScore,
          loginFrequency: Math.random() * 100,
          featureAdoption: Math.random() * 100,
          contentConsumption: Math.random() * 100,
          socialInteraction: Math.random() * 100,
          supportInteraction: Math.random() * 20,
          feedbackSubmission: Math.random() * 10,
          loyaltyProgram: Math.random() * 100
        },
        predictive: {
          churnProbability: churnProb,
          lifetimeValue: ltv,
          nextPurchaseProbability: Math.random(),
          upsellPotential: Math.random(),
          referralLikelihood: Math.random(),
          engagementRisk: 1 - (engagementScore / 100),
          growthPotential: Math.random(),
          satisfaction: 60 + Math.random() * 40,
          modelConfidence: 75 + Math.random() * 25,
          lastPredicted: Date.now() - Math.random() * 24 * 60 * 60 * 1000
        },
        segments: [
          {
            id: 'high_value',
            name: ltv > 300 ? 'High Value' : ltv > 150 ? 'Medium Value' : 'Low Value',
            type: 'value',
            confidence: 85 + Math.random() * 15,
            characteristics: ['regular_purchaser', 'high_engagement'],
            strategies: [
              {
                type: 'retention',
                action: 'Personalized offers',
                expectedImpact: '+15% retention',
                priority: 'high',
                timeline: '2 weeks'
              }
            ]
          }
        ],
        journey: [
          {
            stage: 'engagement',
            entryDate: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
            duration: Math.random() * 60,
            actions: [],
            satisfaction: 60 + Math.random() * 40,
            conversionRate: Math.random() * 100,
            stageHealth: engagementScore
          }
        ],
        riskFactors: churnProb > 0.7 ? [
          {
            type: 'churn',
            severity: 'high',
            probability: churnProb,
            impact: 'Loss of $' + ltv.toFixed(0) + ' LTV',
            indicators: ['declining_engagement', 'reduced_session_frequency'],
            timeframe: '30 days',
            mitigationActions: ['Send retention campaign', 'Offer premium trial']
          }
        ] : [],
        opportunities: [
          {
            type: 'upsell',
            potential: Math.random() * 100,
            confidence: 70 + Math.random() * 30,
            timeframe: '60 days',
            requiredActions: ['Targeted messaging', 'Feature demonstration'],
            expectedOutcome: '+$' + (Math.random() * 50).toFixed(0) + ' revenue',
            businessImpact: 'Increased ARPU'
          }
        ],
        lastUpdated: Date.now() - Math.random() * 24 * 60 * 60 * 1000
      };
    });
  }, []);

  const generateMockModels = useCallback((): PredictiveModel[] => {
    const algorithms = ['logistic_regression', 'random_forest', 'gradient_boosting', 'neural_network', 'ensemble'] as const;
    const types = ['churn', 'ltv', 'next_purchase', 'upsell', 'engagement', 'satisfaction'] as const;
    
    return types.map((type, i) => ({
      id: `model_${type}`,
      name: `${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Prediction`,
      type,
      algorithm: algorithms[i % algorithms.length],
      accuracy: 75 + Math.random() * 20,
      precision: 70 + Math.random() * 25,
      recall: 65 + Math.random() * 30,
      f1Score: 70 + Math.random() * 25,
      features: [
        {
          name: 'session_frequency',
          importance: Math.random(),
          type: 'numerical',
          description: 'Average sessions per week'
        },
        {
          name: 'total_spent',
          importance: Math.random(),
          type: 'numerical',
          description: 'Total amount spent'
        },
        {
          name: 'platform',
          importance: Math.random(),
          type: 'categorical',
          description: 'Primary platform used'
        }
      ].sort((a, b) => b.importance - a.importance),
      lastTrained: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      version: `v${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 10)}`,
      isActive: Math.random() > 0.2
    }));
  }, []);

  const generateMockInsights = useCallback((): PredictiveInsight[] => {
    const types = ['trend', 'anomaly', 'opportunity', 'risk', 'pattern'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `insight_${i + 1}`,
      type: types[i % types.length],
      severity: severities[Math.floor(Math.random() * severities.length)],
      title: [
        'Churn Risk Spike in Mobile Users',
        'High-Value Segment Growth Opportunity',
        'Engagement Pattern Anomaly Detected',
        'Revenue Forecasting Trend Shift',
        'Feature Adoption Correlation Found',
        'Seasonal Behavior Pattern Identified',
        'Cross-Selling Opportunity in Premium Users',
        'Support Interaction Impact on Retention'
      ][i],
      description: `Detailed analysis reveals significant insights that could impact business metrics and customer satisfaction. This requires immediate attention and strategic planning.`,
      affectedCustomers: Math.floor(Math.random() * 1000) + 100,
      timeframe: ['7 days', '14 days', '30 days', '60 days'][Math.floor(Math.random() * 4)],
      confidence: 70 + Math.random() * 30,
      impact: `${['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)]} business impact expected`,
      recommendations: [
        'Implement targeted retention campaign',
        'Adjust feature recommendations',
        'Optimize pricing strategy',
        'Enhance customer support processes'
      ],
      models: ['churn', 'ltv', 'engagement'],
      metrics: [
        {
          name: 'Churn Rate',
          current: 5 + Math.random() * 10,
          predicted: 3 + Math.random() * 8,
          change: -2 + Math.random() * 4,
          trend: Math.random() > 0.5 ? 'up' : 'down'
        }
      ]
    }));
  }, []);

  const generateMockCampaigns = useCallback((): CampaignRecommendation[] => {
    const types = ['retention', 'acquisition', 'growth', 'engagement', 'winback'] as const;
    const channels = ['email', 'push', 'in_app', 'sms', 'social'];
    
    return Array.from({ length: 6 }, (_, i) => ({
      id: `campaign_${i + 1}`,
      name: [
        'High-Risk Churn Prevention',
        'Premium Feature Upsell',
        'New User Onboarding',
        'Seasonal Engagement Boost',
        'Win-Back Inactive Users',
        'Loyalty Program Launch'
      ][i],
      type: types[i % types.length],
      targetSegment: ['High Value', 'At Risk', 'New Users', 'Casual Players', 'Inactive', 'Loyal Users'][i],
      estimatedReach: Math.floor(Math.random() * 5000) + 1000,
      expectedConversion: 5 + Math.random() * 20,
      projectedROI: 150 + Math.random() * 300,
      budget: Math.floor(Math.random() * 10000) + 2000,
      timeline: ['1 week', '2 weeks', '1 month', '6 weeks'][Math.floor(Math.random() * 4)],
      channels: channels.slice(0, Math.floor(Math.random() * 3) + 1),
      content: {
        subject: 'Personalized offer just for you!',
        message: 'Based on your gaming preferences, we have a special offer that we think you\'ll love.',
        callToAction: 'Claim Your Offer',
        personalization: [
          {
            field: 'user_name',
            value: 'dynamic',
            type: 'dynamic'
          }
        ]
      },
      kpis: ['conversion_rate', 'engagement_rate', 'revenue_per_recipient']
    }));
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const mockCustomers = generateMockCustomers();
        const mockModels = generateMockModels();
        const mockInsights = generateMockInsights();
        const mockCampaigns = generateMockCampaigns();
        
        setCustomers(mockCustomers);
        setModels(mockModels);
        setInsights(mockInsights);
        setCampaigns(mockCampaigns);
        
        if (mockCustomers.length > 0) {
          setSelectedCustomer(mockCustomers[0]);
        }
      } catch (error) {
        console.error('Error loading predictive analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [generateMockCustomers, generateMockModels, generateMockInsights, generateMockCampaigns]);

  useEffect(() => {
    if (refreshInterval) {
      intervalRef.current = setInterval(() => {
        const newInsights = generateMockInsights();
        setInsights(newInsights);
      }, refreshInterval * 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshInterval, generateMockInsights]);

  const getChurnRiskColor = (probability: number) => {
    if (probability >= 0.8) return 'text-red-600 bg-red-50';
    if (probability >= 0.6) return 'text-orange-600 bg-orange-50';
    if (probability >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getChurnRiskLabel = (probability: number) => {
    if (probability >= 0.8) return 'Critical';
    if (probability >= 0.6) return 'High';
    if (probability >= 0.4) return 'Medium';
    return 'Low';
  };

  const renderCustomerDetails = () => {
    if (!selectedCustomer) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Churn Risk</h3>
              <AlertTriangle className={`w-5 h-5 ${selectedCustomer.predictive.churnProbability > 0.6 ? 'text-red-500' : 'text-green-500'}`} />
            </div>
            <div className="space-y-3">
              <div className={`px-3 py-2 rounded-lg text-center font-medium ${getChurnRiskColor(selectedCustomer.predictive.churnProbability)}`}>
                {getChurnRiskLabel(selectedCustomer.predictive.churnProbability)} Risk
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {(selectedCustomer.predictive.churnProbability * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                Confidence: {selectedCustomer.predictive.modelConfidence.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lifetime Value</h3>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-gray-900">
                ${selectedCustomer.predictive.lifetimeValue.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">
                Current Spent: ${selectedCustomer.transactional.totalSpent.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">
                Potential: ${(selectedCustomer.predictive.lifetimeValue - selectedCustomer.transactional.totalSpent).toFixed(0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Engagement Score</h3>
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-gray-900">
                {selectedCustomer.engagement.overallScore.toFixed(0)}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${selectedCustomer.engagement.overallScore}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Risk Level: {selectedCustomer.predictive.engagementRisk > 0.6 ? 'High' : selectedCustomer.predictive.engagementRisk > 0.3 ? 'Medium' : 'Low'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Behavioral Insights</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Session Frequency</span>
                  <span className="text-sm text-gray-900">{selectedCustomer.behavioral.sessionFrequency.toFixed(1)}/week</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (selectedCustomer.behavioral.sessionFrequency / 10) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Avg Session Duration</span>
                  <span className="text-sm text-gray-900">{Math.floor(selectedCustomer.behavioral.averageSessionDuration / 60)}m</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (selectedCustomer.behavioral.averageSessionDuration / 1800) * 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Social Engagement</span>
                  <span className="text-sm text-gray-900">{selectedCustomer.behavioral.socialEngagement.influenceScore.toFixed(0)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${selectedCustomer.behavioral.socialEngagement.influenceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Growth Opportunities</h3>
            </div>
            <div className="p-4 space-y-4">
              {selectedCustomer.opportunities.map((opportunity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {opportunity.type.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-green-600 font-medium">
                      {opportunity.confidence.toFixed(0)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{opportunity.expectedOutcome}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Timeline: {opportunity.timeframe}</span>
                    <span>Impact: {opportunity.businessImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedCustomer.riskFactors.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Risk Factors</h3>
            </div>
            <div className="p-4 space-y-4">
              {selectedCustomer.riskFactors.map((risk, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  risk.severity === 'critical' ? 'border-red-300 bg-red-50' :
                  risk.severity === 'high' ? 'border-orange-300 bg-orange-50' :
                  risk.severity === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                  'border-blue-300 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {risk.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      risk.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      risk.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {risk.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{risk.impact}</p>
                  <div className="text-xs text-gray-600">
                    <p>Probability: {(risk.probability * 100).toFixed(1)}%</p>
                    <p>Timeframe: {risk.timeframe}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
          <h1 className="text-3xl font-bold text-gray-900">Predictive Customer Analytics</h1>
          <p className="text-gray-600 mt-2">AI-powered customer insights and predictive modeling</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Train Models</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'customers', name: 'Customers', icon: Users },
              { id: 'models', name: 'Models', icon: Brain },
              { id: 'insights', name: 'Insights', icon: Lightbulb },
              { id: 'campaigns', name: 'Campaigns', icon: Target },
              { id: 'segments', name: 'Segments', icon: Layers }
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Customers</p>
                      <p className="text-3xl font-bold">{customers.length.toLocaleString()}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">High Churn Risk</p>
                      <p className="text-3xl font-bold">
                        {customers.filter(c => c.predictive.churnProbability > 0.7).length}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Avg LTV</p>
                      <p className="text-3xl font-bold">
                        ${(customers.reduce((sum, c) => sum + c.predictive.lifetimeValue, 0) / customers.length).toFixed(0)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Active Models</p>
                      <p className="text-3xl font-bold">
                        {models.filter(m => m.isActive).length}
                      </p>
                    </div>
                    <Brain className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Churn Risk Distribution</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {[
                        { label: 'Low Risk (0-40%)', count: customers.filter(c => c.predictive.churnProbability < 0.4).length, color: 'bg-green-500' },
                        { label: 'Medium Risk (40-60%)', count: customers.filter(c => c.predictive.churnProbability >= 0.4 && c.predictive.churnProbability < 0.6).length, color: 'bg-yellow-500' },
                        { label: 'High Risk (60-80%)', count: customers.filter(c => c.predictive.churnProbability >= 0.6 && c.predictive.churnProbability < 0.8).length, color: 'bg-orange-500' },
                        { label: 'Critical Risk (80%+)', count: customers.filter(c => c.predictive.churnProbability >= 0.8).length, color: 'bg-red-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded ${item.color}`}></div>
                            <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Model Performance</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {models.filter(m => m.isActive).map((model) => (
                        <div key={model.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{model.name}</p>
                            <p className="text-sm text-gray-500">{model.algorithm.replace('_', ' ')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{model.accuracy.toFixed(1)}%</p>
                            <p className="text-xs text-gray-500">Accuracy</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select 
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Risk Levels</option>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                    <option value="critical">Critical Risk</option>
                  </select>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900">
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Churn Risk</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LTV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {customers.slice(0, 10).map((customer) => (
                            <tr 
                              key={customer.id}
                              onClick={() => setSelectedCustomer(customer)}
                              className={`cursor-pointer hover:bg-gray-50 ${
                                selectedCustomer?.id === customer.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{customer.userId}</div>
                                  <div className="text-sm text-gray-500">{customer.demographics.platform}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getChurnRiskColor(customer.predictive.churnProbability)}`}>
                                  {getChurnRiskLabel(customer.predictive.churnProbability)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                ${customer.predictive.lifetimeValue.toFixed(0)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full" 
                                      style={{ width: `${customer.engagement.overallScore}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-600">{customer.engagement.overallScore.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  {selectedCustomer ? (
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                        <p className="text-sm text-gray-600">{selectedCustomer.userId}</p>
                      </div>
                      <div className="p-4">
                        {renderCustomerDetails()}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                      <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Select a customer to view details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Predictive Insights</h2>
                  <p className="text-gray-600">AI-generated insights and recommendations</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <Brain className="w-4 h-4" />
                  <span>Generate Insights</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights.map((insight) => (
                  <div key={insight.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          insight.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          insight.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                          <p className="text-sm text-gray-500">
                            {insight.affectedCustomers.toLocaleString()} customers affected
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
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Confidence:</span>
                        <span className="font-medium">{insight.confidence.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Timeframe:</span>
                        <span className="font-medium">{insight.timeframe}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Impact:</span>
                        <span className="font-medium">{insight.impact}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {insight.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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

export default PredictiveCustomerAnalytics;