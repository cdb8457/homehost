'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Users,
  User,
  Activity,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Map,
  MapPin,
  Navigation,
  Route,
  Gamepad2,
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
  Eye,
  EyeOff,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Laptop,
  Watch,
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
  FileText,
  Folder,
  FolderOpen,
  File,
  Code,
  Terminal,
  Database,
  Server,
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
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface PlayerProfile {
  id: string;
  username: string;
  email: string;
  registrationDate: number;
  lastActive: number;
  status: 'active' | 'inactive' | 'churned' | 'at_risk';
  demographics: PlayerDemographics;
  gameStats: GameStatistics;
  engagement: EngagementMetrics;
  monetization: MonetizationData;
  behavior: BehaviorPatterns;
  preferences: PlayerPreferences;
  journey: PlayerJourney[];
  segments: string[];
  predictedValue: number;
  riskScore: number;
}

interface PlayerDemographics {
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  location: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
  language: string;
  acquisitionChannel: string;
  referralSource?: string;
}

interface GameStatistics {
  totalPlayTime: number;
  sessionsCount: number;
  averageSessionDuration: number;
  longestSession: number;
  gamesPlayed: number;
  gamesCompleted: number;
  completionRate: number;
  highScore: number;
  level: number;
  achievements: number;
  skillRating: number;
  lastGamePlayed: number;
}

interface EngagementMetrics {
  dau: boolean; // Daily Active User
  wau: boolean; // Weekly Active User
  mau: boolean; // Monthly Active User
  streak: number;
  longestStreak: number;
  socialInteractions: number;
  forumPosts: number;
  helpRequests: number;
  feedbackSubmissions: number;
  invitesSent: number;
  eventsAttended: number;
}

interface MonetizationData {
  totalSpend: number;
  averageTransactionValue: number;
  transactionCount: number;
  firstPurchaseDate?: number;
  lastPurchaseDate?: number;
  subscriptionStatus: 'none' | 'active' | 'expired' | 'cancelled';
  subscriptionTier?: string;
  purchaseCategories: Record<string, number>;
  paymentMethods: string[];
  refunds: number;
  lifetime_value: number;
}

interface BehaviorPatterns {
  playTimeDistribution: TimeDistribution;
  sessionPatterns: SessionPattern[];
  featureUsage: FeatureUsage[];
  navigationPaths: NavigationPath[];
  preferences: UserPreference[];
  anomalies: BehaviorAnomaly[];
  clusters: string[];
}

interface TimeDistribution {
  hourly: number[];
  daily: number[];
  weekly: number[];
  seasonal: Record<string, number>;
}

interface SessionPattern {
  type: 'short_burst' | 'long_session' | 'intermittent' | 'binge';
  frequency: number;
  averageDuration: number;
  commonTimes: string[];
  triggers: string[];
}

interface FeatureUsage {
  feature: string;
  usageCount: number;
  timeSpent: number;
  lastUsed: number;
  proficiency: number;
  satisfaction: number;
}

interface NavigationPath {
  path: string[];
  frequency: number;
  duration: number;
  conversionRate: number;
  dropOffPoints: string[];
}

interface BehaviorAnomaly {
  type: 'usage_spike' | 'usage_drop' | 'unusual_pattern' | 'spending_change';
  detected: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
}

interface UserPreference {
  category: string;
  preferences: Record<string, any>;
  confidence: number;
  lastUpdated: number;
}

interface PlayerPreferences {
  gameTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  themes: string[];
  socialLevel: 'solo' | 'small_group' | 'large_group' | 'competitive';
  communicationStyle: string[];
  notifications: Record<string, boolean>;
  privacy: Record<string, boolean>;
}

interface PlayerJourney {
  timestamp: number;
  event: string;
  category: 'registration' | 'gameplay' | 'social' | 'monetization' | 'support';
  details: Record<string, any>;
  satisfaction?: number;
  outcome: 'positive' | 'negative' | 'neutral';
}

interface PlayerSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  playerCount: number;
  characteristics: SegmentCharacteristics;
  metrics: SegmentMetrics;
  trends: SegmentTrend[];
  recommendations: SegmentRecommendation[];
  created: number;
  lastUpdated: number;
}

interface SegmentCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: any;
  weight: number;
}

interface SegmentCharacteristics {
  averageAge: number;
  genderDistribution: Record<string, number>;
  topCountries: string[];
  averagePlayTime: number;
  averageSpend: number;
  churnRate: number;
  engagementScore: number;
}

interface SegmentMetrics {
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  monetization: {
    conversionRate: number;
    arpu: number;
    ltv: number;
  };
  engagement: {
    sessionFrequency: number;
    sessionDuration: number;
    featuresUsed: number;
  };
}

interface SegmentTrend {
  metric: string;
  change: number;
  period: string;
  significance: number;
}

interface SegmentRecommendation {
  type: 'engagement' | 'monetization' | 'retention' | 'acquisition';
  action: string;
  expectedImpact: number;
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
}

interface BehaviorInsight {
  id: string;
  type: 'pattern' | 'trend' | 'anomaly' | 'correlation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  affectedSegments: string[];
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

interface PlayerBehaviorAnalyticsProps {
  className?: string;
}

export function PlayerBehaviorAnalytics({ className = '' }: PlayerBehaviorAnalyticsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [segments, setSegments] = useState<PlayerSegment[]>([]);
  const [insights, setInsights] = useState<BehaviorInsight[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerProfile | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<PlayerSegment | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<BehaviorInsight | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'segments' | 'patterns' | 'insights' | 'journeys'>('overview');
  const [timeRange, setTimeRange] = useState('30d');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();

  const generateMockPlayerProfile = useCallback((index: number): PlayerProfile => {
    const registrationDate = Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000;
    const lastActive = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;
    const totalPlayTime = Math.floor(Math.random() * 500) * 60 * 60; // hours in seconds
    const sessionsCount = Math.floor(50 + Math.random() * 200);
    const totalSpend = Math.random() * 500;

    return {
      id: `player-${index + 1}`,
      username: `Player${String(index + 1).padStart(4, '0')}`,
      email: `player${index + 1}@example.com`,
      registrationDate,
      lastActive,
      status: ['active', 'inactive', 'churned', 'at_risk'][Math.floor(Math.random() * 4)] as const,
      demographics: {
        age: 18 + Math.floor(Math.random() * 50),
        gender: ['male', 'female', 'other'][Math.floor(Math.random() * 3)] as const,
        location: {
          country: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan'][Math.floor(Math.random() * 6)],
          region: 'Region ' + (index % 10 + 1),
          city: 'City ' + (index % 20 + 1),
          timezone: 'UTC-' + (Math.floor(Math.random() * 12))
        },
        language: ['en', 'es', 'fr', 'de', 'ja'][Math.floor(Math.random() * 5)],
        acquisitionChannel: ['organic', 'social', 'paid_ads', 'referral', 'influencer'][Math.floor(Math.random() * 5)],
        referralSource: Math.random() > 0.7 ? 'friend_referral' : undefined
      },
      gameStats: {
        totalPlayTime,
        sessionsCount,
        averageSessionDuration: totalPlayTime / sessionsCount,
        longestSession: Math.floor(Math.random() * 4 * 60 * 60), // up to 4 hours
        gamesPlayed: Math.floor(10 + Math.random() * 100),
        gamesCompleted: Math.floor(Math.random() * 50),
        completionRate: 0.3 + Math.random() * 0.6,
        highScore: Math.floor(Math.random() * 100000),
        level: Math.floor(1 + Math.random() * 50),
        achievements: Math.floor(Math.random() * 20),
        skillRating: Math.floor(1000 + Math.random() * 2000),
        lastGamePlayed: lastActive
      },
      engagement: {
        dau: Math.random() > 0.7,
        wau: Math.random() > 0.5,
        mau: Math.random() > 0.3,
        streak: Math.floor(Math.random() * 30),
        longestStreak: Math.floor(Math.random() * 100),
        socialInteractions: Math.floor(Math.random() * 50),
        forumPosts: Math.floor(Math.random() * 20),
        helpRequests: Math.floor(Math.random() * 5),
        feedbackSubmissions: Math.floor(Math.random() * 3),
        invitesSent: Math.floor(Math.random() * 10),
        eventsAttended: Math.floor(Math.random() * 15)
      },
      monetization: {
        totalSpend,
        averageTransactionValue: totalSpend > 0 ? totalSpend / (1 + Math.floor(Math.random() * 10)) : 0,
        transactionCount: totalSpend > 0 ? 1 + Math.floor(Math.random() * 10) : 0,
        firstPurchaseDate: totalSpend > 0 ? registrationDate + Math.random() * 30 * 24 * 60 * 60 * 1000 : undefined,
        lastPurchaseDate: totalSpend > 0 ? lastActive - Math.random() * 30 * 24 * 60 * 60 * 1000 : undefined,
        subscriptionStatus: ['none', 'active', 'expired', 'cancelled'][Math.floor(Math.random() * 4)] as const,
        subscriptionTier: Math.random() > 0.5 ? ['basic', 'premium', 'pro'][Math.floor(Math.random() * 3)] : undefined,
        purchaseCategories: {
          'in_game_items': Math.random() * 100,
          'cosmetics': Math.random() * 50,
          'power_ups': Math.random() * 30
        },
        paymentMethods: ['credit_card', 'paypal', 'google_pay'].slice(0, Math.floor(1 + Math.random() * 3)),
        refunds: Math.floor(Math.random() * 2),
        lifetime_value: totalSpend * (1.5 + Math.random())
      },
      behavior: {
        playTimeDistribution: {
          hourly: Array.from({ length: 24 }, () => Math.random()),
          daily: Array.from({ length: 7 }, () => Math.random()),
          weekly: Array.from({ length: 52 }, () => Math.random()),
          seasonal: {
            spring: Math.random(),
            summer: Math.random(),
            fall: Math.random(),
            winter: Math.random()
          }
        },
        sessionPatterns: [
          {
            type: ['short_burst', 'long_session', 'intermittent', 'binge'][Math.floor(Math.random() * 4)] as const,
            frequency: Math.random(),
            averageDuration: 1800 + Math.random() * 3600,
            commonTimes: ['morning', 'afternoon', 'evening'],
            triggers: ['notification', 'boredom', 'social']
          }
        ],
        featureUsage: [
          {
            feature: 'multiplayer',
            usageCount: Math.floor(Math.random() * 100),
            timeSpent: Math.random() * 10000,
            lastUsed: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
            proficiency: Math.random(),
            satisfaction: Math.random()
          }
        ],
        navigationPaths: [
          {
            path: ['home', 'game_select', 'game', 'results'],
            frequency: Math.floor(Math.random() * 50),
            duration: Math.random() * 1800,
            conversionRate: Math.random(),
            dropOffPoints: ['game_select']
          }
        ],
        preferences: [
          {
            category: 'gameplay',
            preferences: { difficulty: 'medium', theme: 'fantasy' },
            confidence: Math.random(),
            lastUpdated: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          }
        ],
        anomalies: Math.random() > 0.8 ? [
          {
            type: ['usage_spike', 'usage_drop', 'unusual_pattern', 'spending_change'][Math.floor(Math.random() * 4)] as const,
            detected: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as const,
            description: 'Unusual behavior detected',
            impact: 'Potential churn risk'
          }
        ] : [],
        clusters: ['casual_gamer', 'competitive_player', 'social_user'].slice(0, Math.floor(1 + Math.random() * 3))
      },
      preferences: {
        gameTypes: ['strategy', 'action', 'puzzle', 'rpg'].slice(0, Math.floor(1 + Math.random() * 4)),
        difficulty: ['easy', 'medium', 'hard', 'expert'][Math.floor(Math.random() * 4)] as const,
        themes: ['fantasy', 'sci-fi', 'historical'].slice(0, Math.floor(1 + Math.random() * 3)),
        socialLevel: ['solo', 'small_group', 'large_group', 'competitive'][Math.floor(Math.random() * 4)] as const,
        communicationStyle: ['text', 'voice', 'emotes'],
        notifications: {
          game_updates: Math.random() > 0.5,
          social_activity: Math.random() > 0.5,
          promotions: Math.random() > 0.5
        },
        privacy: {
          show_profile: Math.random() > 0.5,
          show_activity: Math.random() > 0.5,
          allow_contact: Math.random() > 0.5
        }
      },
      journey: Array.from({ length: Math.floor(5 + Math.random() * 15) }, (_, j) => ({
        timestamp: registrationDate + j * 7 * 24 * 60 * 60 * 1000,
        event: ['registration', 'first_game', 'first_purchase', 'achievement_unlock', 'social_interaction'][Math.floor(Math.random() * 5)],
        category: ['registration', 'gameplay', 'social', 'monetization', 'support'][Math.floor(Math.random() * 5)] as const,
        details: { description: `Event ${j + 1}` },
        satisfaction: Math.random() * 5 + 1,
        outcome: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as const
      })),
      segments: ['new_users', 'power_users', 'at_risk'].slice(0, Math.floor(1 + Math.random() * 3)),
      predictedValue: Math.random() * 1000,
      riskScore: Math.random()
    };
  }, []);

  const generateMockSegments = useCallback((): PlayerSegment[] => {
    const segmentNames = [
      'New Users',
      'Power Users',
      'Casual Players',
      'Competitive Players',
      'Social Gamers',
      'High Spenders',
      'At Risk',
      'Dormant Users'
    ];

    return segmentNames.map((name, i) => ({
      id: `segment-${i + 1}`,
      name,
      description: `${name} segment based on behavior analysis`,
      criteria: [
        {
          field: 'registration_date',
          operator: 'greater_than',
          value: Date.now() - 30 * 24 * 60 * 60 * 1000,
          weight: 1.0
        }
      ],
      playerCount: Math.floor(100 + Math.random() * 1000),
      characteristics: {
        averageAge: 25 + Math.random() * 20,
        genderDistribution: {
          male: 0.4 + Math.random() * 0.2,
          female: 0.4 + Math.random() * 0.2,
          other: 0.1 + Math.random() * 0.1
        },
        topCountries: ['United States', 'Canada', 'United Kingdom'],
        averagePlayTime: Math.floor(10 + Math.random() * 100),
        averageSpend: Math.random() * 200,
        churnRate: 0.05 + Math.random() * 0.15,
        engagementScore: Math.random() * 100
      },
      metrics: {
        retention: {
          day1: 0.7 + Math.random() * 0.25,
          day7: 0.4 + Math.random() * 0.3,
          day30: 0.2 + Math.random() * 0.3
        },
        monetization: {
          conversionRate: 0.02 + Math.random() * 0.08,
          arpu: Math.random() * 50,
          ltv: Math.random() * 300
        },
        engagement: {
          sessionFrequency: 1 + Math.random() * 5,
          sessionDuration: 1800 + Math.random() * 3600,
          featuresUsed: Math.floor(3 + Math.random() * 10)
        }
      },
      trends: [
        {
          metric: 'engagement',
          change: (Math.random() - 0.5) * 20,
          period: '30 days',
          significance: Math.random()
        }
      ],
      recommendations: [
        {
          type: ['engagement', 'monetization', 'retention', 'acquisition'][Math.floor(Math.random() * 4)] as const,
          action: 'Implement targeted campaign',
          expectedImpact: Math.random() * 20,
          effort: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as const,
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as const
        }
      ],
      created: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
      lastUpdated: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    }));
  }, []);

  const generateMockInsights = useCallback((): BehaviorInsight[] => {
    const insightTypes = ['pattern', 'trend', 'anomaly', 'correlation', 'prediction'] as const;
    const impacts = ['low', 'medium', 'high'] as const;
    const priorities = ['low', 'medium', 'high'] as const;

    return Array.from({ length: 10 }, (_, i) => ({
      id: `insight-${i + 1}`,
      type: insightTypes[i % insightTypes.length],
      title: [
        'Evening gaming sessions have highest conversion rates',
        'Players who complete tutorial show 3x better retention',
        'Unusual spike in weekend activity detected',
        'Social features correlate with increased spending',
        'New user churn rate predicted to increase 15%',
        'Mobile players prefer shorter game sessions',
        'Competitive mode drives long-term engagement',
        'Friday releases show better adoption rates',
        'Cross-platform players have higher LTV',
        'Push notifications increase daily engagement by 25%'
      ][i],
      description: [
        'Players who start sessions between 6-9 PM show 40% higher conversion rates',
        'Tutorial completion is a strong predictor of 30-day retention',
        'Weekend activity has increased 60% above normal levels this month',
        'Players who use social features spend 2.5x more than solo players',
        'Predictive models suggest churn rate will increase due to seasonal factors',
        'Mobile sessions average 12 minutes vs 45 minutes on desktop',
        'Competitive mode players show 85% higher 90-day retention',
        'Game releases on Friday see 30% better first-week adoption',
        'Players who play on multiple platforms have 40% higher lifetime value',
        'Well-timed push notifications can increase daily active users significantly'
      ][i],
      confidence: 0.7 + Math.random() * 0.25,
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      category: ['Engagement', 'Monetization', 'Retention', 'User Experience', 'Product'][Math.floor(Math.random() * 5)],
      affectedSegments: ['new_users', 'power_users', 'casual_players'].slice(0, Math.floor(1 + Math.random() * 3)),
      data: {
        metric: ['engagement', 'conversion', 'retention', 'session_duration'][Math.floor(Math.random() * 4)],
        change: (Math.random() - 0.3) * 50,
        timeframe: ['7 days', '30 days', '90 days'][Math.floor(Math.random() * 3)],
        factors: ['time_of_day', 'platform', 'social_activity', 'game_mode'].slice(0, Math.floor(1 + Math.random() * 4))
      },
      recommendations: [
        'Optimize notification timing for peak conversion windows',
        'Enhance tutorial completion tracking and incentives',
        'Develop targeted campaigns for high-value segments',
        'Implement cross-platform feature improvements'
      ].slice(0, Math.floor(2 + Math.random() * 3)),
      actionable: Math.random() > 0.3,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      created: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
      dismissed: Math.random() > 0.8
    }));
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPlayers = Array.from({ length: 50 }, (_, i) => generateMockPlayerProfile(i));
      const mockSegments = generateMockSegments();
      const mockInsights = generateMockInsights();

      setPlayers(mockPlayers);
      setSegments(mockSegments);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load player behavior data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockPlayerProfile, generateMockSegments, generateMockInsights]);

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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-yellow-600 bg-yellow-50';
      case 'at_risk': return 'text-orange-600 bg-orange-50';
      case 'churned': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
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

  const activeUsers = players.filter(p => p.status === 'active').length;
  const averagePlayTime = players.length > 0 ? 
    players.reduce((sum, p) => sum + p.gameStats.totalPlayTime, 0) / players.length : 0;
  const averageSpend = players.length > 0 ?
    players.reduce((sum, p) => sum + p.monetization.totalSpend, 0) / players.length : 0;
  const churnRate = players.length > 0 ?
    (players.filter(p => p.status === 'churned').length / players.length) * 100 : 0;

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
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Player Behavior Analytics</h2>
              <p className="text-sm text-gray-500">Deep insights into player behavior patterns and engagement</p>
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
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">All Segments</option>
              <option value="new_users">New Users</option>
              <option value="power_users">Power Users</option>
              <option value="casual_players">Casual Players</option>
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
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Users</p>
                <p className="text-2xl font-bold text-blue-900">{activeUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Avg Play Time</p>
                <p className="text-2xl font-bold text-green-900">{formatDuration(averagePlayTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Spend</p>
                <p className="text-2xl font-bold text-purple-900">${averageSpend.toFixed(0)}</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Churn Rate</p>
                <p className="text-2xl font-bold text-red-900">{churnRate.toFixed(1)}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mt-6">
          {['overview', 'players', 'segments', 'patterns', 'insights', 'journeys'].map((tab) => (
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
                  <h3 className="text-lg font-semibold text-gray-900">Player Segments</h3>
                  <Users className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {segments.slice(0, 5).map((segment) => (
                    <div key={segment.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{segment.name}</p>
                        <p className="text-xs text-gray-500">Engagement: {segment.characteristics.engagementScore.toFixed(0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-gray-900">{segment.playerCount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">players</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Behavior Insights</h3>
                  <Brain className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {insights.slice(0, 5).map((insight) => (
                    <div key={insight.id} className="p-3 bg-white rounded border">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
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

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Players</h3>
                  <Star className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-2">
                  {players
                    .filter(p => p.status === 'active')
                    .sort((a, b) => b.gameStats.totalPlayTime - a.gameStats.totalPlayTime)
                    .slice(0, 5)
                    .map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{player.username}</p>
                          <p className="text-xs text-gray-500">Level {player.gameStats.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDuration(player.gameStats.totalPlayTime)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">At-Risk Players</h3>
                  <AlertTriangle className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-2">
                  {players
                    .filter(p => p.status === 'at_risk')
                    .slice(0, 5)
                    .map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{player.username}</p>
                          <p className="text-xs text-gray-500">Risk: {(player.riskScore * 100).toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Last active: {formatTimeAgo(player.lastActive)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Contributors</h3>
                  <Target className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-2">
                  {players
                    .filter(p => p.monetization.totalSpend > 0)
                    .sort((a, b) => b.monetization.totalSpend - a.monetization.totalSpend)
                    .slice(0, 5)
                    .map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-white rounded">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{player.username}</p>
                          <p className="text-xs text-gray-500">
                            LTV: ${player.monetization.lifetime_value.toFixed(0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">
                            ${player.monetization.totalSpend.toFixed(0)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Player Profiles</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="pl-10 pr-4 py-1 border border-gray-300 rounded text-sm w-64"
                  />
                </div>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>At Risk</option>
                  <option>Churned</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {players.slice(0, 10).map((player) => (
                <div key={player.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{player.username}</h4>
                        <p className="text-sm text-gray-500">
                          Level {player.gameStats.level} • {player.demographics.location.country}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(player.status)}`}>
                        {player.status}
                      </span>
                      <button
                        onClick={() => setSelectedPlayer(player)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Play Time</p>
                      <p className="font-semibold text-gray-900">{formatDuration(player.gameStats.totalPlayTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Spend</p>
                      <p className="font-semibold text-green-600">${player.monetization.totalSpend.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sessions</p>
                      <p className="font-semibold text-gray-900">{player.gameStats.sessionsCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Active</p>
                      <p className="font-semibold text-gray-900">{formatTimeAgo(player.lastActive)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Achievements: {player.gameStats.achievements}</span>
                      <span>Completion: {(player.gameStats.completionRate * 100).toFixed(0)}%</span>
                      <span>Segments: {player.segments.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <MessageCircle className="h-4 w-4" />
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

        {/* Continue with other tabs - segments, patterns, insights, journeys */}
      </div>
    </div>
  );
}