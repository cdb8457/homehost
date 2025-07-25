'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Calendar,
  Target,
  Award,
  Heart,
  Star,
  Gamepad2,
  Map,
  Trophy,
  Shield,
  Zap,
  Brain,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Settings,
  Filter,
  Search,
  Download,
  ExternalLink,
  Timer,
  Globe,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Crystal,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  X,
  Edit,
  Save
} from 'lucide-react';

interface PlayerProfile {
  id: string;
  username: string;
  joinDate: string;
  lastSeen: string;
  totalPlaytime: number;
  sessionsCount: number;
  averageSessionLength: number;
  favoriteGameMode: string;
  favoriteServer: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  retentionScore: number;
  engagementScore: number;
  socialScore: number;
  achievements: Achievement[];
  behaviorTags: string[];
  predictedChurn: number;
  lifetimeValue: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
}

interface BehaviorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  players: number;
  characteristics: string[];
  recommendations: string[];
}

interface SessionAnalysis {
  totalSessions: number;
  averageLength: number;
  peakHours: string[];
  dailyPattern: Array<{
    hour: number;
    playerCount: number;
    avgSessionLength: number;
  }>;
  weeklyPattern: Array<{
    day: string;
    playerCount: number;
    avgSessionLength: number;
  }>;
  seasonalTrends: Array<{
    period: string;
    playerCount: number;
    retention: number;
  }>;
}

interface RetentionAnalysis {
  day1: number;
  day7: number;
  day30: number;
  day90: number;
  cohortAnalysis: Array<{
    cohort: string;
    size: number;
    day1: number;
    day7: number;
    day30: number;
    day90: number;
  }>;
  churnPrediction: Array<{
    playerId: string;
    username: string;
    churnProbability: number;
    riskFactors: string[];
    recommendations: string[];
  }>;
}

interface EngagementMetrics {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  stickiness: number;
  averageSessionsPerUser: number;
  bounceRate: number;
  conversionRate: number;
  featureAdoption: Array<{
    feature: string;
    adoptionRate: number;
    engagement: number;
    retention: number;
  }>;
}

interface PlayerBehaviorAnalysisProps {
  serverId: string;
  serverName: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export default function PlayerBehaviorAnalysis({
  serverId,
  serverName,
  timeRange = '30d'
}: PlayerBehaviorAnalysisProps) {
  const [playerProfiles, setPlayerProfiles] = useState<PlayerProfile[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<BehaviorPattern[]>([]);
  const [sessionAnalysis, setSessionAnalysis] = useState<SessionAnalysis | null>(null);
  const [retentionAnalysis, setRetentionAnalysis] = useState<RetentionAnalysis | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'patterns' | 'retention' | 'engagement' | 'players'>('overview');
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');

  const apiClient = new ApiClient();

  useEffect(() => {
    loadPlayerBehaviorData();
  }, [serverId, selectedTimeRange]);

  const loadPlayerBehaviorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading player behavior data
      const mockProfiles = generateMockPlayerProfiles();
      const mockPatterns = generateMockBehaviorPatterns();
      const mockSessionAnalysis = generateMockSessionAnalysis();
      const mockRetentionAnalysis = generateMockRetentionAnalysis();
      const mockEngagementMetrics = generateMockEngagementMetrics();

      setPlayerProfiles(mockProfiles);
      setBehaviorPatterns(mockPatterns);
      setSessionAnalysis(mockSessionAnalysis);
      setRetentionAnalysis(mockRetentionAnalysis);
      setEngagementMetrics(mockEngagementMetrics);
    } catch (err) {
      setError('Failed to load player behavior analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPlayerProfiles = (): PlayerProfile[] => {
    const usernames = ['CraftMaster', 'RedstoneWiz', 'BuilderPro', 'PVPKing', 'MineExplorer', 'CreativeGenius', 'SurvivalHero', 'EnderSlayer'];
    const gameModes = ['Survival', 'Creative', 'Adventure', 'Hardcore'];
    const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
    
    return Array.from({ length: 8 }, (_, i) => ({
      id: `player-${i + 1}`,
      username: usernames[i],
      joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalPlaytime: Math.floor(Math.random() * 500) + 50,
      sessionsCount: Math.floor(Math.random() * 200) + 20,
      averageSessionLength: Math.floor(Math.random() * 180) + 30,
      favoriteGameMode: gameModes[Math.floor(Math.random() * gameModes.length)],
      favoriteServer: serverName,
      skillLevel: skillLevels[Math.floor(Math.random() * skillLevels.length)],
      retentionScore: Math.floor(Math.random() * 40) + 60,
      engagementScore: Math.floor(Math.random() * 40) + 60,
      socialScore: Math.floor(Math.random() * 40) + 50,
      achievements: generateMockAchievements(),
      behaviorTags: ['active', 'social', 'builder', 'explorer'].slice(0, Math.floor(Math.random() * 3) + 1),
      predictedChurn: Math.random() * 30,
      lifetimeValue: Math.floor(Math.random() * 500) + 100
    }));
  };

  const generateMockAchievements = (): Achievement[] => {
    const achievements = [
      { title: 'First Steps', description: 'Join the server', category: 'milestone', rarity: 'common' as const },
      { title: 'Builder', description: 'Place 1000 blocks', category: 'building', rarity: 'rare' as const },
      { title: 'Explorer', description: 'Travel 10km', category: 'exploration', rarity: 'epic' as const },
      { title: 'Social Butterfly', description: 'Chat with 50 players', category: 'social', rarity: 'legendary' as const }
    ];
    
    return achievements.slice(0, Math.floor(Math.random() * 3) + 1).map((ach, i) => ({
      id: `ach-${i}`,
      ...ach,
      unlockedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const generateMockBehaviorPatterns = (): BehaviorPattern[] => [
    {
      id: '1',
      name: 'Weekend Warriors',
      description: 'Players who primarily play during weekends with long sessions',
      frequency: 28,
      trend: 'increasing',
      players: 156,
      characteristics: ['High weekend activity', 'Long sessions (3+ hours)', 'Social gameplay'],
      recommendations: ['Schedule weekend events', 'Promote multiplayer features', 'Create weekend challenges']
    },
    {
      id: '2',
      name: 'Daily Grinders',
      description: 'Consistent daily players with moderate session lengths',
      frequency: 45,
      trend: 'stable',
      players: 234,
      characteristics: ['Daily login streaks', 'Consistent progress', 'Achievement focused'],
      recommendations: ['Daily login rewards', 'Progressive achievements', 'Streak bonuses']
    },
    {
      id: '3',
      name: 'Creative Builders',
      description: 'Players focused on building and creative expression',
      frequency: 32,
      trend: 'increasing',
      players: 189,
      characteristics: ['Creative mode preference', 'Long build sessions', 'Screenshot sharing'],
      recommendations: ['Building competitions', 'Creative tools', 'Community showcases']
    },
    {
      id: '4',
      name: 'Social Connectors',
      description: 'Highly social players who engage with community features',
      frequency: 22,
      trend: 'stable',
      players: 98,
      characteristics: ['High chat activity', 'Team participation', 'Event attendance'],
      recommendations: ['Social features', 'Team challenges', 'Community events']
    },
    {
      id: '5',
      name: 'Casual Explorers',
      description: 'Infrequent players who explore at their own pace',
      frequency: 18,
      trend: 'decreasing',
      players: 67,
      characteristics: ['Irregular sessions', 'Exploration focus', 'Solo gameplay'],
      recommendations: ['Self-paced content', 'Discovery rewards', 'Flexible progression']
    }
  ];

  const generateMockSessionAnalysis = (): SessionAnalysis => ({
    totalSessions: 2847,
    averageLength: 127,
    peakHours: ['19:00-21:00', '14:00-16:00'],
    dailyPattern: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      playerCount: Math.floor(Math.random() * 50) + (i >= 18 && i <= 22 ? 30 : 0),
      avgSessionLength: Math.floor(Math.random() * 60) + 60 + (i >= 19 && i <= 21 ? 30 : 0)
    })),
    weeklyPattern: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      day,
      playerCount: Math.floor(Math.random() * 30) + (day === 'Sat' || day === 'Sun' ? 20 : 0) + 40,
      avgSessionLength: Math.floor(Math.random() * 40) + (day === 'Sat' || day === 'Sun' ? 30 : 0) + 90
    })),
    seasonalTrends: [
      { period: 'Q1 2024', playerCount: 186, retention: 78 },
      { period: 'Q2 2024', playerCount: 234, retention: 82 },
      { period: 'Q3 2024', playerCount: 289, retention: 85 },
      { period: 'Q4 2024', playerCount: 312, retention: 87 }
    ]
  });

  const generateMockRetentionAnalysis = (): RetentionAnalysis => ({
    day1: 87,
    day7: 65,
    day30: 42,
    day90: 28,
    cohortAnalysis: [
      { cohort: 'Jan 2024', size: 156, day1: 89, day7: 67, day30: 45, day90: 32 },
      { cohort: 'Feb 2024', size: 189, day1: 85, day7: 63, day30: 41, day90: 29 },
      { cohort: 'Mar 2024', size: 234, day1: 87, day7: 65, day30: 43, day90: 31 },
      { cohort: 'Apr 2024', size: 267, day1: 88, day7: 66, day30: 44, day90: 30 }
    ],
    churnPrediction: [
      {
        playerId: 'player-5',
        username: 'MineExplorer',
        churnProbability: 78,
        riskFactors: ['Declining session frequency', 'No recent achievements', 'Reduced social interaction'],
        recommendations: ['Send re-engagement campaign', 'Offer achievement boost', 'Invite to community event']
      },
      {
        playerId: 'player-8',
        username: 'EnderSlayer',
        churnProbability: 65,
        riskFactors: ['Long absence periods', 'Repetitive gameplay patterns'],
        recommendations: ['Introduce new content', 'Suggest different game modes', 'Provide progression guidance']
      }
    ]
  });

  const generateMockEngagementMetrics = (): EngagementMetrics => ({
    dailyActiveUsers: 234,
    weeklyActiveUsers: 567,
    monthlyActiveUsers: 1234,
    stickiness: 41.3,
    averageSessionsPerUser: 8.7,
    bounceRate: 12.5,
    conversionRate: 23.8,
    featureAdoption: [
      { feature: 'Chat System', adoptionRate: 89, engagement: 78, retention: 85 },
      { feature: 'Guild System', adoptionRate: 67, engagement: 82, retention: 91 },
      { feature: 'Achievement System', adoptionRate: 76, engagement: 69, retention: 79 },
      { feature: 'Trading System', adoptionRate: 45, engagement: 88, retention: 93 },
      { feature: 'Custom Builds', adoptionRate: 58, engagement: 91, retention: 87 }
    ]
  });

  const handleTogglePlayerExpanded = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-400 bg-green-900';
      case 'intermediate': return 'text-blue-400 bg-blue-900';
      case 'advanced': return 'text-purple-400 bg-purple-900';
      case 'expert': return 'text-orange-400 bg-orange-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredPlayers = playerProfiles.filter(player => {
    const matchesSearch = player.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = skillFilter === 'all' || player.skillLevel === skillFilter;
    return matchesSearch && matchesSkill;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Analyzing player behavior..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Player Behavior Analysis
          </h2>
          <p className="text-gray-400">AI-powered insights into player behavior patterns for {serverName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button
            onClick={loadPlayerBehaviorData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'patterns', label: 'Behavior Patterns', icon: Brain },
          { id: 'retention', label: 'Retention Analysis', icon: Heart },
          { id: 'engagement', label: 'Engagement', icon: Zap },
          { id: 'players', label: 'Player Profiles', icon: Users }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {engagementMetrics && [
              { label: 'Daily Active Users', value: engagementMetrics.dailyActiveUsers, icon: Users, color: 'blue' },
              { label: 'Weekly Active Users', value: engagementMetrics.weeklyActiveUsers, icon: Calendar, color: 'green' },
              { label: 'Monthly Active Users', value: engagementMetrics.monthlyActiveUsers, icon: TrendingUp, color: 'purple' },
              { label: 'User Stickiness', value: `${engagementMetrics.stickiness.toFixed(1)}%`, icon: Target, color: 'orange' }
            ].map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-400">{metric.label}</h3>
                    <IconComponent className={`w-5 h-5 text-${metric.color}-500`} />
                  </div>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                </div>
              );
            })}
          </div>

          {/* Session Analysis Chart */}
          {sessionAnalysis && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Daily Activity Pattern
              </h3>
              <div className="grid grid-cols-12 gap-1 mb-4">
                {sessionAnalysis.dailyPattern.map((hour) => (
                  <div key={hour.hour} className="text-center">
                    <div 
                      className="bg-blue-600 rounded mb-1 mx-auto"
                      style={{ 
                        height: `${Math.max(4, (hour.playerCount / 80) * 60)}px`,
                        width: '20px'
                      }}
                    />
                    <div className="text-xs text-gray-400">{hour.hour}:00</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div>Peak: {sessionAnalysis.peakHours.join(', ')}</div>
                <div>Avg Session: {sessionAnalysis.averageLength}min</div>
                <div>Total Sessions: {sessionAnalysis.totalSessions.toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Retention Overview */}
          {retentionAnalysis && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Player Retention
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Day 1', value: retentionAnalysis.day1 },
                  { label: 'Day 7', value: retentionAnalysis.day7 },
                  { label: 'Day 30', value: retentionAnalysis.day30 },
                  { label: 'Day 90', value: retentionAnalysis.day90 }
                ].map((retention) => (
                  <div key={retention.label} className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">{retention.value}%</div>
                    <div className="text-sm text-gray-400">{retention.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'patterns' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Behavior Patterns</h3>
              <p className="text-gray-400">Identified player behavior patterns and recommendations</p>
            </div>
          </div>

          {behaviorPatterns.map((pattern) => (
            <div key={pattern.id} className="bg-gray-800 rounded-lg border border-gray-700">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <div>
                      <h4 className="font-semibold text-white">{pattern.name}</h4>
                      <p className="text-sm text-gray-300">{pattern.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {getTrendIcon(pattern.trend)}
                        <span className="text-sm text-gray-400">{pattern.frequency}% frequency</span>
                      </div>
                      <div className="text-white font-medium">{pattern.players} players</div>
                    </div>
                    {selectedPattern === pattern.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {selectedPattern === pattern.id && (
                <div className="px-4 pb-4 border-t border-gray-700">
                  <div className="pt-4 space-y-4">
                    {/* Characteristics */}
                    <div>
                      <h5 className="font-medium text-white mb-2">Characteristics</h5>
                      <div className="space-y-1">
                        {pattern.characteristics.map((char, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            {char}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h5 className="font-medium text-white mb-2">Recommendations</h5>
                      <div className="space-y-2">
                        {pattern.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-700 rounded text-sm">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-300">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'retention' && retentionAnalysis && (
        <div className="space-y-6">
          {/* Cohort Analysis */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Cohort Retention Analysis
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2">Cohort</th>
                    <th className="text-center text-gray-400 py-2">Size</th>
                    <th className="text-center text-gray-400 py-2">Day 1</th>
                    <th className="text-center text-gray-400 py-2">Day 7</th>
                    <th className="text-center text-gray-400 py-2">Day 30</th>
                    <th className="text-center text-gray-400 py-2">Day 90</th>
                  </tr>
                </thead>
                <tbody>
                  {retentionAnalysis.cohortAnalysis.map((cohort) => (
                    <tr key={cohort.cohort} className="border-b border-gray-700">
                      <td className="text-white py-2 font-medium">{cohort.cohort}</td>
                      <td className="text-center text-gray-300 py-2">{cohort.size}</td>
                      <td className="text-center py-2">
                        <span className={getScoreColor(cohort.day1)}>{cohort.day1}%</span>
                      </td>
                      <td className="text-center py-2">
                        <span className={getScoreColor(cohort.day7)}>{cohort.day7}%</span>
                      </td>
                      <td className="text-center py-2">
                        <span className={getScoreColor(cohort.day30)}>{cohort.day30}%</span>
                      </td>
                      <td className="text-center py-2">
                        <span className={getScoreColor(cohort.day90)}>{cohort.day90}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Churn Prediction */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Churn Risk Prediction
            </h3>
            
            <div className="space-y-4">
              {retentionAnalysis.churnPrediction.map((prediction) => (
                <div key={prediction.playerId} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-400" />
                      <div>
                        <h4 className="font-medium text-white">{prediction.username}</h4>
                        <p className="text-sm text-gray-400">Player ID: {prediction.playerId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-red-400 font-bold text-lg">{prediction.churnProbability.toFixed(0)}%</div>
                      <div className="text-xs text-gray-400">Churn Risk</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-1">Risk Factors</h5>
                      <div className="flex flex-wrap gap-1">
                        {prediction.riskFactors.map((factor, index) => (
                          <span key={index} className="px-2 py-1 bg-red-900 text-red-200 text-xs rounded">
                            {factor}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-1">Recommendations</h5>
                      <div className="space-y-1">
                        {prediction.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                            <Lightbulb className="w-3 h-3 text-yellow-400" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'engagement' && engagementMetrics && (
        <div className="space-y-6">
          {/* Engagement Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Sessions per User', value: engagementMetrics.averageSessionsPerUser.toFixed(1), icon: Activity },
              { label: 'Bounce Rate', value: `${engagementMetrics.bounceRate.toFixed(1)}%`, icon: TrendingDown },
              { label: 'Conversion Rate', value: `${engagementMetrics.conversionRate.toFixed(1)}%`, icon: Target }
            ].map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-400">{metric.label}</h3>
                    <IconComponent className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                </div>
              );
            })}
          </div>

          {/* Feature Adoption */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Feature Adoption & Engagement
            </h3>
            
            <div className="space-y-4">
              {engagementMetrics.featureAdoption.map((feature) => (
                <div key={feature.feature} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-white">{feature.feature}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className={getScoreColor(feature.adoptionRate)}>{feature.adoptionRate}%</div>
                        <div className="text-gray-400">Adoption</div>
                      </div>
                      <div className="text-center">
                        <div className={getScoreColor(feature.engagement)}>{feature.engagement}%</div>
                        <div className="text-gray-400">Engagement</div>
                      </div>
                      <div className="text-center">
                        <div className={getScoreColor(feature.retention)}>{feature.retention}%</div>
                        <div className="text-gray-400">Retention</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Adoption Rate</span>
                      <span className="text-white">{feature.adoptionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${feature.adoptionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'players' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Skill Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          {/* Player Profiles */}
          <div className="space-y-4">
            {filteredPlayers.map((player) => {
              const isExpanded = expandedPlayers.has(player.id);
              
              return (
                <div key={player.id} className="bg-gray-800 rounded-lg border border-gray-700">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => handleTogglePlayerExpanded(player.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-white">{player.username}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(player.skillLevel)}`}>
                              {player.skillLevel}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {player.totalPlaytime}h playtime • {player.sessionsCount} sessions
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Retention:</span>
                            <span className={getScoreColor(player.retentionScore)}>{player.retentionScore}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">Engagement:</span>
                            <span className={getScoreColor(player.engagementScore)}>{player.engagementScore}%</span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700">
                      <div className="pt-4 space-y-4">
                        {/* Player Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-white">{player.averageSessionLength}min</div>
                            <div className="text-xs text-gray-400">Avg Session</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-white">{player.socialScore}%</div>
                            <div className="text-xs text-gray-400">Social Score</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-white">${player.lifetimeValue}</div>
                            <div className="text-xs text-gray-400">LTV</div>
                          </div>
                          <div className="bg-gray-700 rounded-lg p-3 text-center">
                            <div className="text-lg font-bold text-red-400">{player.predictedChurn.toFixed(0)}%</div>
                            <div className="text-xs text-gray-400">Churn Risk</div>
                          </div>
                        </div>

                        {/* Player Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-white mb-2">Player Info</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Joined:</span>
                                <span className="text-white">{new Date(player.joinDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Last Seen:</span>
                                <span className="text-white">{new Date(player.lastSeen).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Favorite Mode:</span>
                                <span className="text-white">{player.favoriteGameMode}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-white mb-2">Achievements</h5>
                            <div className="space-y-1">
                              {player.achievements.slice(0, 3).map((achievement) => (
                                <div key={achievement.id} className="flex items-center gap-2 text-sm">
                                  <Trophy className={`w-4 h-4 ${getRarityColor(achievement.rarity)}`} />
                                  <span className="text-gray-300">{achievement.title}</span>
                                </div>
                              ))}
                              {player.achievements.length > 3 && (
                                <div className="text-xs text-gray-400">+{player.achievements.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Behavior Tags */}
                        {player.behaviorTags.length > 0 && (
                          <div>
                            <h5 className="font-medium text-white mb-2">Behavior Tags</h5>
                            <div className="flex flex-wrap gap-2">
                              {player.behaviorTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No players found</h3>
              <p className="text-gray-500">
                {searchTerm || skillFilter !== 'all' 
                  ? 'No players match your current filters.'
                  : 'No player data available yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}