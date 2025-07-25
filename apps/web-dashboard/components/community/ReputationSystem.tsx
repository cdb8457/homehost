'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Star,
  TrendingUp,
  TrendingDown,
  Award,
  Trophy,
  Target,
  Shield,
  Crown,
  Heart,
  ThumbsUp,
  ThumbsDown,
  User,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  Download,
  Upload,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  BellOff,
  Flag,
  Bookmark,
  Edit,
  Save,
  X,
  ExternalLink,
  Copy,
  Mail,
  Phone,
  Globe,
  MapPin,
  Camera,
  Video,
  Image,
  FileText,
  Link,
  Hash,
  AtSign,
  Gamepad2,
  Zap,
  Fire,
  Sparkles,
  Lightbulb,
  Brain,
  Rocket,
  Diamond,
  Gem,
  Medal,
  Coins,
  DollarSign,
  Gift,
  Ticket,
  Package,
  Box
} from 'lucide-react';

interface ReputationUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  joinDate: string;
  lastActive: string;
  reputation: {
    score: number;
    rank: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Legendary';
    level: number;
    progress: number;
    nextLevelThreshold: number;
  };
  badges: ReputationBadge[];
  stats: {
    totalVotes: number;
    upvotes: number;
    downvotes: number;
    postsCreated: number;
    commentsCreated: number;
    helpfulAnswers: number;
    contentShared: number;
    eventsHosted: number;
    moderationActions: number;
    communityContributions: number;
  };
  achievements: Achievement[];
  recentActivity: ReputationActivity[];
  trustScore: number;
  endorsements: Endorsement[];
}

interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'contributor' | 'helper' | 'creator' | 'moderator' | 'community' | 'special';
  earnedAt: string;
  points: number;
  requirements: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  progress: number;
  maxProgress: number;
  reputationBonus: number;
  category: string;
}

interface ReputationActivity {
  id: string;
  type: 'vote_received' | 'badge_earned' | 'achievement_unlocked' | 'content_featured' | 'milestone_reached' | 'endorsement_received';
  action: string;
  points: number;
  timestamp: string;
  source?: {
    type: 'post' | 'comment' | 'content' | 'user' | 'system';
    id: string;
    title: string;
  };
  giver?: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
}

interface Endorsement {
  id: string;
  fromUser: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    reputation: number;
  };
  skill: string;
  comment: string;
  timestamp: string;
  verified: boolean;
}

interface ReputationLeaderboard {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all_time';
  users: {
    rank: number;
    user: ReputationUser;
    points: number;
    change: number;
  }[];
}

interface ReputationStats {
  overview: {
    totalUsers: number;
    averageReputation: number;
    totalPointsAwarded: number;
    activeUsers: number;
  };
  distribution: {
    Bronze: number;
    Silver: number;
    Gold: number;
    Platinum: number;
    Diamond: number;
    Legendary: number;
  };
  topCategories: {
    category: string;
    points: number;
    users: number;
  }[];
  recentTrends: {
    date: string;
    pointsAwarded: number;
    activeUsers: number;
  }[];
}

export function ReputationSystem() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'badges' | 'achievements' | 'activity' | 'settings'>('overview');
  const [currentUser, setCurrentUser] = useState<ReputationUser | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReputationLeaderboard | null>(null);
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all_time'>('weekly');
  const [reputationStats, setReputationStats] = useState<ReputationStats | null>(null);
  const [selectedUser, setSelectedUser] = useState<ReputationUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<ReputationBadge | null>(null);
  const [filters, setFilters] = useState({
    tier: 'all',
    category: 'all',
    timeRange: 'all',
    searchQuery: ''
  });
  const [sortBy, setSortBy] = useState<'reputation' | 'level' | 'recent' | 'badges'>('reputation');

  useEffect(() => {
    loadReputationData();
  }, [activeTab, leaderboardTimeframe, filters, sortBy]);

  const loadReputationData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentUser(generateMockCurrentUser());
      setLeaderboard(generateMockLeaderboard());
      setReputationStats(generateMockStats());
      
      setError(null);
    } catch (err) {
      setError('Failed to load reputation data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockCurrentUser = (): ReputationUser => {
    return {
      id: 'current-user',
      username: 'player123',
      displayName: 'Player 123',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current',
      joinDate: '2023-06-15T00:00:00Z',
      lastActive: new Date().toISOString(),
      reputation: {
        score: 2847,
        rank: 42,
        tier: 'Gold',
        level: 18,
        progress: 647,
        nextLevelThreshold: 850
      },
      badges: [
        {
          id: 'helpful-answerer',
          name: 'Helpful Answerer',
          description: 'Provided 50+ helpful answers to community questions',
          icon: 'lightbulb',
          rarity: 'rare',
          category: 'helper',
          earnedAt: '2024-01-15T00:00:00Z',
          points: 100,
          requirements: 'Answer 50 questions with positive feedback'
        },
        {
          id: 'content-creator',
          name: 'Content Creator',
          description: 'Created 25+ high-quality posts',
          icon: 'camera',
          rarity: 'epic',
          category: 'creator',
          earnedAt: '2024-02-01T00:00:00Z',
          points: 200,
          requirements: 'Create 25 posts with 10+ upvotes each'
        }
      ],
      stats: {
        totalVotes: 1245,
        upvotes: 1156,
        downvotes: 89,
        postsCreated: 47,
        commentsCreated: 234,
        helpfulAnswers: 78,
        contentShared: 156,
        eventsHosted: 3,
        moderationActions: 12,
        communityContributions: 89
      },
      achievements: [
        {
          id: 'first-post',
          title: 'First Steps',
          description: 'Created your first post',
          icon: 'edit',
          rarity: 'common',
          unlockedAt: '2023-06-16T00:00:00Z',
          progress: 1,
          maxProgress: 1,
          reputationBonus: 10,
          category: 'milestone'
        }
      ],
      recentActivity: [
        {
          id: 'activity-1',
          type: 'vote_received',
          action: 'Received upvote on "Epic Castle Build"',
          points: 5,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: {
            type: 'post',
            id: 'post-123',
            title: 'Epic Castle Build'
          },
          giver: {
            id: 'user-456',
            username: 'builder_pro',
            displayName: 'Builder Pro',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=456'
          }
        }
      ],
      trustScore: 87,
      endorsements: [
        {
          id: 'endorsement-1',
          fromUser: {
            id: 'user-789',
            username: 'expert_player',
            displayName: 'Expert Player',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=789',
            reputation: 3456
          },
          skill: 'Building',
          comment: 'Amazing building skills and great tutorials!',
          timestamp: '2024-01-20T00:00:00Z',
          verified: true
        }
      ]
    };
  };

  const generateMockLeaderboard = (): ReputationLeaderboard => {
    const users = Array.from({ length: 100 }, (_, i) => {
      const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Legendary'];
      const tier = tiers[Math.min(Math.floor(i / 15), 5)] as any;
      
      return {
        rank: i + 1,
        user: {
          id: `user-${i + 1}`,
          username: `player${i + 1}`,
          displayName: `Player ${i + 1}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`,
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          reputation: {
            score: Math.floor((100 - i) * 50 + Math.random() * 1000),
            rank: i + 1,
            tier,
            level: Math.floor(Math.random() * 50) + 1,
            progress: Math.floor(Math.random() * 1000),
            nextLevelThreshold: 1000
          },
          badges: [],
          stats: {
            totalVotes: Math.floor(Math.random() * 1000),
            upvotes: Math.floor(Math.random() * 900),
            downvotes: Math.floor(Math.random() * 100),
            postsCreated: Math.floor(Math.random() * 100),
            commentsCreated: Math.floor(Math.random() * 500),
            helpfulAnswers: Math.floor(Math.random() * 200),
            contentShared: Math.floor(Math.random() * 300),
            eventsHosted: Math.floor(Math.random() * 10),
            moderationActions: Math.floor(Math.random() * 50),
            communityContributions: Math.floor(Math.random() * 150)
          },
          achievements: [],
          recentActivity: [],
          trustScore: Math.floor(Math.random() * 100),
          endorsements: []
        } as ReputationUser,
        points: Math.floor((100 - i) * 50 + Math.random() * 1000),
        change: Math.floor(Math.random() * 200) - 100
      };
    });

    return {
      timeframe: leaderboardTimeframe,
      users
    };
  };

  const generateMockStats = (): ReputationStats => {
    return {
      overview: {
        totalUsers: 12847,
        averageReputation: 1234,
        totalPointsAwarded: 2456789,
        activeUsers: 8934
      },
      distribution: {
        Bronze: 4567,
        Silver: 3456,
        Gold: 2345,
        Platinum: 1234,
        Diamond: 567,
        Legendary: 89
      },
      topCategories: [
        { category: 'Content Creation', points: 567890, users: 3456 },
        { category: 'Community Help', points: 456789, users: 2890 },
        { category: 'Moderation', points: 234567, users: 567 },
        { category: 'Event Hosting', points: 123456, users: 234 },
        { category: 'Tutorial Creation', points: 98765, users: 456 }
      ],
      recentTrends: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pointsAwarded: Math.floor(Math.random() * 5000) + 1000,
        activeUsers: Math.floor(Math.random() * 2000) + 500
      }))
    };
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Bronze': return Medal;
      case 'Silver': return Award;
      case 'Gold': return Trophy;
      case 'Platinum': return Star;
      case 'Diamond': return Diamond;
      case 'Legendary': return Crown;
      default: return Medal;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'text-orange-600';
      case 'Silver': return 'text-gray-600';
      case 'Gold': return 'text-yellow-600';
      case 'Platinum': return 'text-blue-600';
      case 'Diamond': return 'text-purple-600';
      case 'Legendary': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Reputation System</h2>
          <p className="text-gray-600">Track contributions, earn badges, and build your community standing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Eye className="h-4 w-4 mr-2" />
            View Profile
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            Share Progress
          </button>
        </div>
      </div>

      {/* Current User Overview */}
      {currentUser && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.displayName}
                className="w-16 h-16 rounded-full border-4 border-white/20"
              />
              <div>
                <h3 className="text-xl font-bold">{currentUser.displayName}</h3>
                <p className="text-blue-100">@{currentUser.username}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    {React.createElement(getTierIcon(currentUser.reputation.tier), {
                      className: `h-5 w-5 ${getTierColor(currentUser.reputation.tier)} bg-white rounded p-1`
                    })}
                    <span className="font-semibold">{currentUser.reputation.tier}</span>
                  </div>
                  <div className="text-sm">
                    Level {currentUser.reputation.level}
                  </div>
                  <div className="text-sm">
                    Rank #{currentUser.reputation.rank}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{currentUser.reputation.score.toLocaleString()}</div>
              <div className="text-blue-100">Reputation Points</div>
              <div className="text-sm mt-2">
                Trust Score: {currentUser.trustScore}%
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progress to Level {currentUser.reputation.level + 1}</span>
              <span className="text-sm">{currentUser.reputation.progress}/{currentUser.reputation.nextLevelThreshold}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentUser.reputation.progress / currentUser.reputation.nextLevelThreshold) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
            { id: 'badges', name: 'Badges', icon: Award },
            { id: 'achievements', name: 'Achievements', icon: Target },
            { id: 'activity', name: 'Activity', icon: Activity },
            { id: 'settings', name: 'Settings', icon: Settings }
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

      {/* Content Area */}
      {activeTab === 'overview' && currentUser && reputationStats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <ThumbsUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Upvotes Received</p>
                  <p className="text-2xl font-bold text-gray-900">{currentUser.stats.upvotes.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Posts Created</p>
                  <p className="text-2xl font-bold text-gray-900">{currentUser.stats.postsCreated}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <Lightbulb className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Helpful Answers</p>
                  <p className="text-2xl font-bold text-gray-900">{currentUser.stats.helpfulAnswers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                  <p className="text-2xl font-bold text-gray-900">{currentUser.badges.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Badges and Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Badges</h3>
              <div className="space-y-3">
                {currentUser.badges.slice(0, 3).map(badge => (
                  <div key={badge.id} className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      badge.rarity === 'legendary' ? 'bg-red-100' :
                      badge.rarity === 'epic' ? 'bg-purple-100' :
                      badge.rarity === 'rare' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {badge.icon === 'lightbulb' ? (
                        <Lightbulb className={`h-5 w-5 ${
                          badge.rarity === 'legendary' ? 'text-red-600' :
                          badge.rarity === 'epic' ? 'text-purple-600' :
                          badge.rarity === 'rare' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      ) : (
                        <Camera className={`h-5 w-5 ${
                          badge.rarity === 'legendary' ? 'text-red-600' :
                          badge.rarity === 'epic' ? 'text-purple-600' :
                          badge.rarity === 'rare' ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{badge.name}</p>
                      <p className="text-sm text-gray-500">{badge.description}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      +{badge.points} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {currentUser.recentActivity.slice(0, 3).map(activity => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                        <span className="text-xs font-medium text-green-600">
                          +{activity.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {Object.entries(reputationStats.distribution).map(([tier, count]) => {
                const Icon = getTierIcon(tier);
                const percentage = (count / reputationStats.overview.totalUsers) * 100;
                
                return (
                  <div key={tier} className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      tier === 'Bronze' ? 'bg-orange-100' :
                      tier === 'Silver' ? 'bg-gray-100' :
                      tier === 'Gold' ? 'bg-yellow-100' :
                      tier === 'Platinum' ? 'bg-blue-100' :
                      tier === 'Diamond' ? 'bg-purple-100' : 'bg-red-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${getTierColor(tier)}`} />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{tier}</p>
                    <p className="text-xs text-gray-500">{count.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && leaderboard && (
        <div className="space-y-6">
          {/* Timeframe Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
              <select
                value={leaderboardTimeframe}
                onChange={(e) => setLeaderboardTimeframe(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="all_time">All Time</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-end justify-center space-x-8">
              {leaderboard.users.slice(0, 3).map((entry, index) => (
                <div key={entry.user.id} className={`text-center ${index === 0 ? 'order-2' : index === 1 ? 'order-1' : 'order-3'}`}>
                  <div className={`relative ${index === 0 ? 'mb-4' : 'mb-2'}`}>
                    <img
                      src={entry.user.avatar}
                      alt={entry.user.displayName}
                      className={`mx-auto rounded-full border-4 ${
                        index === 0 ? 'w-20 h-20 border-yellow-400' :
                        index === 1 ? 'w-16 h-16 border-gray-400' :
                        'w-16 h-16 border-orange-400'
                      }`}
                    />
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-500' :
                      'bg-orange-500'
                    }`}>
                      {entry.rank}
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{entry.user.displayName}</p>
                  <p className="text-sm text-gray-500">@{entry.user.username}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{entry.points.toLocaleString()}</p>
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    {React.createElement(getTierIcon(entry.user.reputation.tier), {
                      className: `h-4 w-4 ${getTierColor(entry.user.reputation.tier)}`
                    })}
                    <span className="text-sm text-gray-600">{entry.user.reputation.tier}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.users.slice(0, 20).map(entry => (
                    <tr key={entry.user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-lg font-bold ${
                            entry.rank <= 3 ? 'text-yellow-600' :
                            entry.rank <= 10 ? 'text-blue-600' :
                            'text-gray-900'
                          }`}>
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={entry.user.avatar}
                            alt={entry.user.displayName}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.user.displayName}
                            </div>
                            <div className="text-sm text-gray-500">
                              @{entry.user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {React.createElement(getTierIcon(entry.user.reputation.tier), {
                            className: `h-5 w-5 ${getTierColor(entry.user.reputation.tier)}`
                          })}
                          <span className="text-sm font-medium">{entry.user.reputation.tier}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.points.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center space-x-1 text-sm ${
                          entry.change > 0 ? 'text-green-600' :
                          entry.change < 0 ? 'text-red-600' :
                          'text-gray-500'
                        }`}>
                          {entry.change > 0 ? (
                            <ArrowUp className="h-4 w-4" />
                          ) : entry.change < 0 ? (
                            <ArrowDown className="h-4 w-4" />
                          ) : (
                            <ArrowUpDown className="h-4 w-4" />
                          )}
                          <span>{Math.abs(entry.change)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Level {entry.user.reputation.level}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}