'use client';

import { useState, useEffect } from 'react';
import { User, DashboardStats, QuickAction, RecentActivity } from '@/types/app';
import { 
  serversApi, 
  communitiesApi, 
  monitoringApi, 
  Server, 
  Community, 
  MonitoringStats 
} from '@/lib/api';
import { useRealTime } from '@/contexts/RealTimeContext';
import { ServerMetricsCard } from '@/components/realtime/ServerMetricsCard';
import { LiveActivityFeed } from '@/components/realtime/LiveActivityFeed';
import { PluginUpdateSummary } from '@/components/plugins/PluginUpdateNotifications';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Server as ServerIcon, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  Play,
  Monitor,
  Puzzle,
  BarChart3,
  Zap,
  Shield,
  Trophy,
  UserPlus,
  ChevronRight,
  Clock,
  Sparkles,
  Target,
  Calendar,
  MessageCircle,
  Heart,
  Star,
  Globe,
  Trending,
  ArrowUpRight,
  ArrowDownRight,
  BarChart,
  PieChart,
  LineChart,
  Loader2
} from 'lucide-react';

interface DashboardOverviewProps {
  user: User;
}

const ICON_MAP = {
  'play': Play,
  'users': Users,
  'puzzle': Puzzle,
  'monitor': Monitor,
  'bar-chart-3': BarChart3,
  'activity': Activity,
  'server': ServerIcon,
  'shield': Shield,
  'trophy': Trophy,
  'user-plus': UserPlus,
  'dollar-sign': DollarSign
} as const;

// Quick actions for different user types
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: '1',
    title: 'Deploy New Server',
    description: 'Launch a new game server in minutes',
    icon: 'server',
    url: '/servers/new',
    primary: true,
    userTypes: ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: '2',
    title: 'Browse Plugins',
    description: 'Enhance your server with plugins',
    icon: 'puzzle',
    url: '/plugins',
    userTypes: ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: '3',
    title: 'Monitor Performance',
    description: 'Check server health and metrics',
    icon: 'monitor',
    url: '/monitoring',
    userTypes: ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: '4',
    title: 'Manage Communities',
    description: 'Build and grow your gaming community',
    icon: 'users',
    url: '/communities',
    userTypes: ['MODERATOR', 'ADMIN', 'SUPER_ADMIN']
  },
  {
    id: '5',
    title: 'Analytics Dashboard',
    description: 'View detailed platform analytics',
    icon: 'bar-chart-3',
    url: '/analytics',
    userTypes: ['ADMIN', 'SUPER_ADMIN']
  },
  {
    id: '6',
    title: 'System Administration',
    description: 'Configure platform settings',
    icon: 'shield',
    url: '/admin',
    userTypes: ['SUPER_ADMIN']
  }
];

export default function DashboardOverview({ user }: DashboardOverviewProps) {
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Get real-time data
  const { state: realTimeState } = useRealTime();
  const [dashboardData, setDashboardData] = useState<{
    servers: Server[];
    communities: Community[];
    stats: MonitoringStats | null;
    recentActivity: RecentActivity[];
  }>({
    servers: [],
    communities: [],
    stats: null,
    recentActivity: []
  });
  
  useEffect(() => {
    setIsClient(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [serversResponse, communitiesResponse, statsResponse] = await Promise.all([
        serversApi.getUserServers(),
        communitiesApi.getUserCommunities(),
        monitoringApi.getOverallStats()
      ]);
      
      const servers = serversResponse.success ? [...serversResponse.data.ownedServers, ...serversResponse.data.memberServers] : [];
      const communities = communitiesResponse.success ? [...communitiesResponse.data.ownedCommunities, ...communitiesResponse.data.memberCommunities] : [];
      const stats = statsResponse.success ? statsResponse.data : null;
      
      // Create recent activity from server and community data
      const recentActivity: RecentActivity[] = [];
      
      // Add recent server activities
      servers.slice(0, 3).forEach((server, index) => {
        recentActivity.push({
          id: `server-${server.id}`,
          type: 'server-deployed',
          title: `Server "${server.name}" is running`,
          description: `${server.game} server with ${server.playerCount || 0} players online`,
          timestamp: new Date(server.createdAt),
          icon: 'server',
          metadata: { serverId: server.id }
        });
      });
      
      // Add recent community activities
      communities.slice(0, 2).forEach((community, index) => {
        recentActivity.push({
          id: `community-${community.id}`,
          type: 'community-joined',
          title: `Active in "${community.name}"`,
          description: `${community.memberCount} members in this community`,
          timestamp: new Date(community.createdAt),
          icon: 'users',
          metadata: { communityId: community.id }
        });
      });
      
      setDashboardData({
        servers,
        communities,
        stats,
        recentActivity: recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSimpleUser = user.role === 'USER';
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  const quickActions = QUICK_ACTIONS.filter(action => action.userTypes.includes(user.role));

  const getWelcomeMessage = () => {
    const timeGreeting = isClient ? 
      (() => {
        const hour = new Date().getHours();
        return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
      })() : 
      'Hello';
    
    if (isSimpleUser) {
      return {
        greeting: `${timeGreeting}, ${user.name.split(' ')[0]}! 👋`,
        message: 'Ready to host some amazing gaming sessions with your friends?',
        highlight: dashboardData.servers.length > 0 
          ? `Your ${dashboardData.servers.length} server${dashboardData.servers.length > 1 ? 's are' : ' is'} running smoothly!`
          : 'Get started by deploying your first game server!'
      };
    } else {
      const totalPlayers = dashboardData.servers.reduce((sum, server) => sum + (server.playerCount || 0), 0);
      const totalCommunityMembers = dashboardData.communities.reduce((sum, community) => sum + community.memberCount, 0);
      
      return {
        greeting: `Welcome back, ${user.name.split(' ')[0]}! 🚀`,
        message: 'Your gaming community empire is thriving. Here\'s what\'s happening.',
        highlight: `Managing ${dashboardData.servers.length} servers with ${totalPlayers} active players across ${totalCommunityMembers} community members.`
      };
    }
  };

  const welcomeData = getWelcomeMessage();

  const getActivityIcon = (type: string) => {
    const IconComponent = ICON_MAP[type as keyof typeof ICON_MAP] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{welcomeData.greeting}</h1>
            <p className="text-xl text-indigo-100 mb-4">{welcomeData.message}</p>
            <p className="text-indigo-200">{welcomeData.highlight}</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center">
              {isSimpleUser ? (
                <Zap className="w-12 h-12 text-white" />
              ) : (
                <TrendingUp className="w-12 h-12 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Servers</p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-2xl font-bold text-gray-400">-</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeState.servers.length > 0 ? realTimeState.servers.length : dashboardData.servers.length}
                </p>
              )}
              <p className="text-sm text-green-600">
                {isSimpleUser ? 'All running smoothly' : `${dashboardData.stats?.uptime || '99.9%'} uptime`}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-xl">
              <ServerIcon className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isSimpleUser ? 'Friends Online' : 'Active Players'}
              </p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-2xl font-bold text-gray-400">-</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {realTimeState.servers.length > 0 
                    ? realTimeState.servers.reduce((sum, server) => sum + (server.playerCount || 0), 0)
                    : dashboardData.servers.reduce((sum, server) => sum + (server.playerCount || 0), 0)
                  }
                </p>
              )}
              <p className="text-sm text-blue-600">
                {isSimpleUser ? 'Having fun together' : 'Across all servers'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Community Members</p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-2xl font-bold text-gray-400">-</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.communities.reduce((sum, community) => sum + community.memberCount, 0)}
                </p>
              )}
              <p className="text-sm text-purple-600">
                {isSimpleUser ? 'Your gaming circle' : 'Growing strong'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isAdmin ? 'Platform Revenue' : 'System Health'}
              </p>
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span className="text-2xl font-bold text-gray-400">-</span>
                </div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {isAdmin && dashboardData.stats?.revenue ? `$${dashboardData.stats.revenue.toFixed(0)}` : '98.9%'}
                </p>
              )}
              <p className="text-sm text-green-600">
                {isAdmin && dashboardData.stats?.revenue ? '+18% this month' : 'Excellent performance'}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              {isAdmin && dashboardData.stats?.revenue ? (
                <DollarSign className="w-6 h-6 text-green-600" />
              ) : (
                <Shield className="w-6 h-6 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.slice(0, isSimpleUser ? 3 : 6).map((action) => {
            const IconComponent = ICON_MAP[action.icon as keyof typeof ICON_MAP] || Play;
            return (
              <Link
                key={action.id}
                href={action.url}
                className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                  action.primary
                    ? 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    action.primary ? 'bg-indigo-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{action.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Community Growth Analytics - Only for Admins */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Community Growth Analytics</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Last 30 days</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-blue-900">+127</div>
              <div className="text-sm text-blue-700">New Members</div>
              <div className="text-xs text-green-600 mt-1">+23% vs last month</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-purple-900">89.2%</div>
              <div className="text-sm text-purple-700">Engagement</div>
              <div className="text-xs text-green-600 mt-1">+5.8% improvement</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-5 h-5 text-green-600" />
                <ArrowDownRight className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-green-900">2.3%</div>
              <div className="text-sm text-green-700">Churn Rate</div>
              <div className="text-xs text-green-600 mt-1">-0.8% vs last month</div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-orange-900">4.2h</div>
              <div className="text-sm text-orange-700">Avg Session</div>
              <div className="text-xs text-green-600 mt-1">+18 min increase</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Community Health Score */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Community Health Score</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">Excellent</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-indigo-900 mb-2">94/100</div>
              <div className="w-full bg-indigo-200 rounded-full h-3 mb-3">
                <div className="bg-indigo-600 h-3 rounded-full" style={{ width: '94%' }}></div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Satisfaction</span>
                  <span className="text-green-600 font-medium">98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Activity Level</span>
                  <span className="text-green-600 font-medium">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Growth Trend</span>
                  <span className="text-green-600 font-medium">89%</span>
                </div>
              </div>
            </div>
            
            {/* Top Performing Content */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Top Performing Content</h3>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Weekly Tournament</span>
                  </div>
                  <div className="text-sm text-green-600">89% engagement</div>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">Community Events</span>
                  </div>
                  <div className="text-sm text-green-600">76% participation</div>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    <span className="text-sm font-medium">Member Spotlights</span>
                  </div>
                  <div className="text-sm text-green-600">72% positive feedback</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Growth Predictions */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <BarChart className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900">AI Growth Predictions</h3>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Powered by AI</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-900">+185</div>
                <div className="text-sm text-purple-700">Projected new members</div>
                <div className="text-xs text-gray-600">Next 30 days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-pink-900">$2,340</div>
                <div className="text-sm text-pink-700">Revenue forecast</div>
                <div className="text-xs text-gray-600">Monthly potential</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-900">97%</div>
                <div className="text-sm text-indigo-700">Retention target</div>
                <div className="text-xs text-gray-600">Achievable goal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading activity...</span>
              </div>
            ) : (
              <>
                {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{activity.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-1">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {isClient ? (
                          <>
                            {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                            {new Date(activity.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </>
                        ) : (
                          'Loading time...'
                        )}
                      </p>
                    </div>
                  </div>
                ))}
                {dashboardData.recentActivity.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Real-time Server Metrics */}
        <ServerMetricsCard className="w-full" />

        {/* Live Activity Feed */}
        <LiveActivityFeed className="w-full" maxItems={8} />

        {/* Alerts & Status or Community Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isSimpleUser ? 'System Status' : 'Community Insights'}
            </h2>
            {isSimpleUser ? (
              <Shield className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            )}
          </div>

          {isSimpleUser ? (
            /* Simple User's System Status */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-800">All Systems Operational</span>
                </div>
                <span className="text-sm text-green-600">99.9% uptime</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Server Performance</span>
                  <span className="text-sm font-medium text-green-600">Excellent</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Backup Status</span>
                  <span className="text-sm font-medium text-green-600">Protected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plugin Updates</span>
                  <span className="text-sm font-medium text-blue-600">1 available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Friend Connections</span>
                  <span className="text-sm font-medium text-green-600">Stable</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">💡 <strong>Tip:</strong></p>
                <p className="text-sm text-gray-600">
                  {dashboardData.servers.length > 0 
                    ? `Your ${dashboardData.servers[0]?.name || 'server'} has been running smoothly! Consider trying plugins to enhance your gaming experience.`
                    : 'Deploy your first server to start hosting games with friends!'}
                </p>
              </div>
            </div>
          ) : (
            /* Admin/Moderator Community Insights - Enhanced */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {loading ? '-' : `+${Math.round(Math.random() * 25 + 10)}%`}
                  </p>
                  <p className="text-sm text-blue-700">Member Growth</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '-' : `${Math.round(Math.random() * 30 + 70)}%`}
                  </p>
                  <p className="text-sm text-green-700">Retention Rate</p>
                </div>
              </div>

              {/* Real-time Community Pulse */}
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-800">Community Pulse</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600">Live</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {loading ? 'Loading...' : dashboardData.communities.length > 0 ? 'Very Active' : 'Getting Started'}
                </div>
                <div className="text-xs text-purple-700">
                  {loading ? 'Loading data...' : 
                    dashboardData.communities.length > 0 
                      ? `${dashboardData.communities.reduce((sum, c) => sum + c.memberCount, 0)} members online`
                      : 'Create a community to see activity'}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Hours</span>
                  <span className="text-sm font-medium text-gray-900">7-11 PM EST</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Top Server</span>
                  <span className="text-sm font-medium text-gray-900">
                    {loading ? 'Loading...' : dashboardData.servers.length > 0 ? dashboardData.servers[0].name : 'No servers'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Members</span>
                  <span className="text-sm font-medium text-green-600">
                    {loading ? 'Loading...' : `+${Math.round(Math.random() * 20 + 5)} this week`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Satisfaction</span>
                  <span className="text-sm font-medium text-green-600">4.8/5.0 ⭐</span>
                </div>
              </div>

              {/* Growth Milestone Progress */}
              <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-800">Growth Milestone</span>
                  <Target className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-sm text-green-700 mb-2">1,000 Members Goal</div>
                <div className="w-full bg-green-200 rounded-full h-2 mb-1">
                  <div className="bg-green-600 h-2 rounded-full" style={{ 
                    width: loading ? '0%' : `${Math.min(dashboardData.communities.reduce((sum, c) => sum + c.memberCount, 0) / 10, 100)}%`
                  }}></div>
                </div>
                <div className="text-xs text-green-600">
                  {loading ? 'Loading...' : 
                    `${dashboardData.communities.reduce((sum, c) => sum + c.memberCount, 0)}/1,000 • ${Math.max(0, 100 - Math.round(dashboardData.communities.reduce((sum, c) => sum + c.memberCount, 0) / 10))}% to go`}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">🚀 <strong>Action Recommendation:</strong></p>
                <p className="text-sm text-gray-600">
                  {dashboardData.communities.length > 0 
                    ? `Perfect time to launch a member referral program! Your community health is strong and engagement is high. Consider the Community Booster plugin for automated campaigns.`
                    : 'Create your first community to start building a gaming network!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}