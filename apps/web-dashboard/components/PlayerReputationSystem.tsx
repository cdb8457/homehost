'use client';

import { useState, useEffect } from 'react';
import { CommunityPlayer, PlayerAction } from '@/types/community';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle, 
  Users, 
  Activity, 
  Calendar, 
  Clock,
  Target,
  Shield,
  Zap,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Eye,
  BarChart3
} from 'lucide-react';

interface PlayerReputationSystemProps {
  playerId: string;
  communityId: string;
  canModerate?: boolean;
}

interface ReputationMetrics {
  overallScore: number;
  trend: 'rising' | 'falling' | 'stable';
  trendPercentage: number;
  rank: string;
  percentile: number;
  breakdown: {
    helpfulness: number;
    behavior: number;
    activity: number;
    leadership: number;
  };
  history: {
    date: Date;
    score: number;
    event: string;
  }[];
}

export default function PlayerReputationSystem({ 
  playerId, 
  communityId, 
  canModerate = false 
}: PlayerReputationSystemProps) {
  const [player, setPlayer] = useState<CommunityPlayer | null>(null);
  const [metrics, setMetrics] = useState<ReputationMetrics | null>(null);
  const [recentActions, setRecentActions] = useState<PlayerAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayerReputation();
  }, [playerId, communityId]);

  const loadPlayerReputation = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock player data
    const mockPlayer: CommunityPlayer = {
      id: playerId,
      steamId: '76561198001234567',
      username: 'ProGamer123',
      displayName: 'ProGamer123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      joinedAt: new Date('2024-01-15'),
      lastSeen: new Date(),
      isOnline: true,
      currentServerId: 'server-1',
      role: 'member',
      reputation: {
        score: 85,
        commendations: 12,
        warnings: 1,
        isBanned: false
      },
      activity: {
        totalPlayTime: 2400, // 40 hours
        favoriteServer: 'server-1',
        serverPlayTime: { 'server-1': 1800, 'server-2': 600 },
        lastActivity: {
          serverId: 'server-1',
          action: 'Building base',
          timestamp: new Date()
        }
      },
      permissions: ['chat', 'build'],
      notes: 'Active community member, good builder'
    };

    // Mock reputation metrics
    const mockMetrics: ReputationMetrics = {
      overallScore: 85,
      trend: 'rising',
      trendPercentage: 12.5,
      rank: 'Trusted Member',
      percentile: 78,
      breakdown: {
        helpfulness: 88,
        behavior: 92,
        activity: 75,
        leadership: 68
      },
      history: [
        { date: new Date('2024-07-10'), score: 82, event: 'Helped new player' },
        { date: new Date('2024-07-08'), score: 80, event: 'Commended by moderator' },
        { date: new Date('2024-07-05'), score: 78, event: 'Active participation' },
        { date: new Date('2024-07-01'), score: 75, event: 'Warning for minor rule violation' },
        { date: new Date('2024-06-28'), score: 80, event: 'Community event participation' },
        { date: new Date('2024-06-25'), score: 77, event: 'Reported griefing incident' },
        { date: new Date('2024-06-20'), score: 75, event: 'Initial community join' }
      ]
    };

    // Mock recent actions
    const mockActions: PlayerAction[] = [
      {
        id: 'action-1',
        playerId,
        serverId: 'server-1',
        action: 'commend',
        performedBy: 'moderator-1',
        reason: 'Helped new players with building techniques',
        timestamp: new Date('2024-07-10'),
        isActive: true
      },
      {
        id: 'action-2',
        playerId,
        serverId: 'server-1',
        action: 'warn',
        performedBy: 'moderator-2',
        reason: 'Minor chat rule violation',
        timestamp: new Date('2024-07-01'),
        isActive: true
      },
      {
        id: 'action-3',
        playerId,
        serverId: 'server-2',
        action: 'commend',
        performedBy: 'admin-1',
        reason: 'Excellent community participation',
        timestamp: new Date('2024-06-28'),
        isActive: true
      }
    ];

    setPlayer(mockPlayer);
    setMetrics(mockMetrics);
    setRecentActions(mockActions);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-100';
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Elite Member': return 'text-purple-700 bg-purple-100';
      case 'Trusted Member': return 'text-blue-700 bg-blue-100';
      case 'Active Member': return 'text-green-700 bg-green-100';
      case 'New Member': return 'text-gray-700 bg-gray-100';
      default: return 'text-red-700 bg-red-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'commend': return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'ban': return <Shield className="w-4 h-4 text-red-600" />;
      case 'promote': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!player || !metrics) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-center text-gray-600">
          Player reputation data not available
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={player.avatar}
            alt={player.displayName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{player.displayName}</h2>
            <p className="text-gray-600">Reputation Analysis</p>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
              <p className="text-sm text-gray-600">Community-wide reputation</p>
            </div>
            <Star className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-bold px-3 py-1 rounded-lg ${getScoreColor(metrics.overallScore)}`}>
              {metrics.overallScore}
            </span>
            <div className="flex items-center gap-1">
              {getTrendIcon(metrics.trend)}
              <span className={`text-sm font-medium ${
                metrics.trend === 'rising' ? 'text-green-600' : 
                metrics.trend === 'falling' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {metrics.trendPercentage > 0 ? '+' : ''}{metrics.trendPercentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Community Rank</h3>
              <p className="text-sm text-gray-600">Current standing</p>
            </div>
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className={`inline-block px-3 py-1 rounded-lg text-sm font-medium ${getRankColor(metrics.rank)}`}>
              {metrics.rank}
            </span>
            <p className="text-sm text-gray-600 mt-2">
              Top {100 - metrics.percentile}% of community
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recognition</h3>
              <p className="text-sm text-gray-600">Community feedback</p>
            </div>
            <Heart className="w-6 h-6 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Commendations</span>
              <span className="font-semibold text-green-600">{player.reputation.commendations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Warnings</span>
              <span className="font-semibold text-yellow-600">{player.reputation.warnings}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reputation Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Reputation Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.breakdown).map(([category, score]) => (
            <div key={category} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {category}
                </span>
                <span className={`text-sm font-bold px-2 py-1 rounded ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    score >= 80 ? 'bg-green-500' : 
                    score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Recent Moderation Actions
        </h3>
        <div className="space-y-3">
          {recentActions.map((action) => (
            <div key={action.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {getActionIcon(action.action)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">{action.action}</span>
                  <span className="text-sm text-gray-500">
                    by {action.performedBy}
                  </span>
                </div>
                {action.reason && (
                  <p className="text-sm text-gray-600">{action.reason}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(action.timestamp).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reputation History Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Reputation History
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-3">
            {metrics.history.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    entry.score > (metrics.history[index + 1]?.score || entry.score) 
                      ? 'bg-green-500' 
                      : entry.score < (metrics.history[index + 1]?.score || entry.score)
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">{entry.event}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(entry.score)}`}>
                    {entry.score}
                  </span>
                  <span className="text-xs text-gray-500">
                    {entry.date.toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Moderation Actions (if user can moderate) */}
      {canModerate && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Moderation Actions
          </h3>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <ThumbsUp className="w-4 h-4" />
              Commend Player
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
              <AlertTriangle className="w-4 h-4" />
              Issue Warning
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Eye className="w-4 h-4" />
              View Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}