'use client';

import { useState, useEffect } from 'react';
import { CommunityPlayer, PlayerAction } from '@/types/community';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Clock, 
  MapPin, 
  Users,
  Calendar,
  Gamepad2,
  Zap,
  Target,
  Award,
  BarChart3,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Server,
  Timer,
  Play,
  Pause,
  Square,
  MousePointer,
  MessageSquare,
  Hammer,
  Shield,
  Star
} from 'lucide-react';

interface PlayerActivityTrackerProps {
  communityId: string;
  playerId?: string; // If provided, show specific player activity
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

interface ActivitySession {
  id: string;
  playerId: string;
  serverId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  actionsPerformed: number;
  buildingBlocks: number;
  chatMessages: number;
  playerInteractions: number;
  isActive: boolean;
}

interface ActivityMetrics {
  totalPlayTime: number;
  averageSessionLength: number;
  mostActiveServer: string;
  mostActiveTimeOfDay: string;
  activityTrend: 'rising' | 'stable' | 'declining';
  weeklyPlayTime: number[];
  activityBreakdown: {
    building: number;
    pvp: number;
    exploration: number;
    social: number;
    admin: number;
  };
  achievements: {
    longestSession: number;
    mostActiveDay: Date;
    buildingMaster: boolean;
    socialButterfly: boolean;
    serverLoyalist: boolean;
  };
}

export default function PlayerActivityTracker({ 
  communityId, 
  playerId,
  userRole = 'admin' 
}: PlayerActivityTrackerProps) {
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [metrics, setMetrics] = useState<ActivityMetrics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [filterServer, setFilterServer] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivityData();
  }, [communityId, playerId, selectedTimeRange]);

  const loadActivityData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock activity sessions
    const mockSessions: ActivitySession[] = [
      {
        id: 'session-1',
        playerId: playerId || 'player-1',
        serverId: 'server-1',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        duration: 90,
        actionsPerformed: 145,
        buildingBlocks: 78,
        chatMessages: 23,
        playerInteractions: 12,
        isActive: false
      },
      {
        id: 'session-2',
        playerId: playerId || 'player-1',
        serverId: 'server-1',
        startTime: new Date(),
        duration: 45,
        actionsPerformed: 67,
        buildingBlocks: 34,
        chatMessages: 8,
        playerInteractions: 5,
        isActive: true
      },
      {
        id: 'session-3',
        playerId: playerId || 'player-1',
        serverId: 'server-2',
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        endTime: new Date(Date.now() - 22 * 60 * 60 * 1000),
        duration: 120,
        actionsPerformed: 203,
        buildingBlocks: 156,
        chatMessages: 31,
        playerInteractions: 16,
        isActive: false
      },
      {
        id: 'session-4',
        playerId: playerId || 'player-1',
        serverId: 'server-1',
        startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        duration: 180,
        actionsPerformed: 312,
        buildingBlocks: 245,
        chatMessages: 45,
        playerInteractions: 22,
        isActive: false
      }
    ];

    // Mock metrics
    const mockMetrics: ActivityMetrics = {
      totalPlayTime: 435, // minutes
      averageSessionLength: 108.75,
      mostActiveServer: 'server-1',
      mostActiveTimeOfDay: '8:00 PM - 10:00 PM',
      activityTrend: 'rising',
      weeklyPlayTime: [120, 95, 180, 0, 85, 145, 90], // Last 7 days
      activityBreakdown: {
        building: 45,
        pvp: 15,
        exploration: 20,
        social: 15,
        admin: 5
      },
      achievements: {
        longestSession: 180,
        mostActiveDay: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        buildingMaster: true,
        socialButterfly: false,
        serverLoyalist: true
      }
    };

    setSessions(mockSessions);
    setMetrics(mockMetrics);
    setLoading(false);
  };

  const filteredSessions = sessions.filter(session => {
    if (filterServer !== 'all' && session.serverId !== filterServer) return false;
    if (showActiveOnly && !session.isActive) return false;
    return true;
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'building': return <Hammer className="w-4 h-4 text-orange-600" />;
      case 'pvp': return <Shield className="w-4 h-4 text-red-600" />;
      case 'exploration': return <MapPin className="w-4 h-4 text-green-600" />;
      case 'social': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'admin': return <Star className="w-4 h-4 text-purple-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const canViewDetailedMetrics = userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              Player Activity Tracker
            </h2>
            <p className="text-gray-600">
              {playerId ? `Detailed activity analysis for ${playerId}` : 'Monitor player activity across all community servers'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadActivityData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            {canViewDetailedMetrics && (
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Time Range and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <select
              value={filterServer}
              onChange={(e) => setFilterServer(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Servers</option>
              <option value="server-1">Server 1</option>
              <option value="server-2">Server 2</option>
              <option value="server-3">Server 3</option>
            </select>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Active sessions only</span>
          </label>
        </div>
      </div>

      {/* Activity Metrics */}
      {metrics && canViewDetailedMetrics && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Activity Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Timer className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total Play Time</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{formatDuration(metrics.totalPlayTime)}</div>
              <div className="text-sm text-blue-700">This {selectedTimeRange}</div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Avg Session</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{formatDuration(metrics.averageSessionLength)}</div>
              <div className="text-sm text-green-700">Per session</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Favorite Server</span>
              </div>
              <div className="text-lg font-bold text-purple-600">{metrics.mostActiveServer}</div>
              <div className="text-sm text-purple-700">Most time spent</div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon(metrics.activityTrend)}
                <span className="font-medium text-orange-900">Trend</span>
              </div>
              <div className="text-lg font-bold text-orange-600 capitalize">{metrics.activityTrend}</div>
              <div className="text-sm text-orange-700">Activity pattern</div>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Activity Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(metrics.activityBreakdown).map(([activity, percentage]) => (
                <div key={activity} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getActivityIcon(activity)}
                  </div>
                  <div className="font-bold text-lg text-gray-900">{percentage}%</div>
                  <div className="text-sm text-gray-600 capitalize">{activity}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Weekly Activity Pattern</h4>
            <div className="flex items-end space-x-2 h-32">
              {metrics.weeklyPlayTime.map((minutes, index) => {
                const maxHeight = Math.max(...metrics.weeklyPlayTime);
                const height = maxHeight > 0 ? (minutes / maxHeight) * 100 : 0;
                const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-indigo-500 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${formatDuration(minutes)} on ${days[index]}`}
                    ></div>
                    <div className="text-xs text-gray-600 mt-1">{days[index]}</div>
                    <div className="text-xs text-gray-500">{formatDuration(minutes)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Activity Achievements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Timer className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">Longest Session</div>
                  <div className="text-sm text-gray-600">{formatDuration(metrics.achievements.longestSession)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Most Active Day</div>
                  <div className="text-sm text-gray-600">
                    {metrics.achievements.mostActiveDay.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-gray-900">Special Badges</div>
                  <div className="text-sm text-gray-600">
                    {[
                      metrics.achievements.buildingMaster && 'Building Master',
                      metrics.achievements.socialButterfly && 'Social Butterfly',
                      metrics.achievements.serverLoyalist && 'Server Loyalist'
                    ].filter(Boolean).join(', ') || 'None earned'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Sessions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Recent Activity Sessions
        </h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading activity data...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div key={session.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {session.isActive ? (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-600 font-medium">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-600">Completed</span>
                          </div>
                        )}
                      </div>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <Server className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-700">{session.serverId}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-gray-900">{formatDuration(session.duration)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">Actions:</span>
                        <span className="font-medium">{session.actionsPerformed}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Hammer className="w-4 h-4 text-orange-600" />
                        <span className="text-gray-600">Building:</span>
                        <span className="font-medium">{session.buildingBlocks}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Chat:</span>
                        <span className="font-medium">{session.chatMessages}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="text-gray-600">Interactions:</span>
                        <span className="font-medium">{session.playerInteractions}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500 ml-4">
                    <div>{session.startTime.toLocaleDateString()}</div>
                    <div>{session.startTime.toLocaleTimeString()}</div>
                    {session.endTime && (
                      <div>- {session.endTime.toLocaleTimeString()}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredSessions.length === 0 && (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No activity sessions found for the selected filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}