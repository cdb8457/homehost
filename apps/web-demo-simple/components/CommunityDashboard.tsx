'use client';

import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  CommunityPost, 
  CommunityEvent, 
  ActivityFeedItem, 
  CommunitySettings 
} from '@/types/community';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Heart, 
  Share2, 
  Plus, 
  Bell, 
  Settings,
  Search,
  Filter,
  TrendingUp,
  Award,
  Star,
  MapPin,
  Clock,
  Eye,
  UserPlus,
  Gamepad2,
  Trophy,
  Camera,
  Video,
  FileText,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Zap,
  Shield,
  Hash,
  AtSign,
  Globe,
  Lock,
  Users2,
  Sparkles,
  BookOpen,
  Music,
  Gift,
  Target,
  Flame,
  ThumbsUp,
  MessageSquare,
  UserCheck,
  Crown,
  Medal,
  Flag,
  Volume2,
  Play,
  Pause,
  X,
  Edit,
  Send,
  Image,
  Paperclip,
  Smile,
  Upload,
  Download,
  Link,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Dot,
  Check,
  AlertCircle,
  Info,
  BarChart3,
  PieChart,
  Activity,
  Rss,
  Folder,
  FolderOpen,
  Archive,
  BookmarkPlus,
  Download as DownloadIcon,
  Share,
  Copy,
  Printer,
  Mail,
  Phone,
  MapPin as Location,
  Navigation,
  Compass,
  Home,
  Building,
  Server,
  Database,
  CloudDrizzle,
  Cpu,
  HardDrive,
  Network,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Microphone,
  Camera as CameraIcon,
  Webcam,
  Speaker,
  Bluetooth,
  Wifi,
  SignalHigh,
  Battery
} from 'lucide-react';

// Import our Epic 5 components
import CommunityHub from './CommunityHub';
import PlayerProfile from './PlayerProfile';
import SocialFeed from './SocialFeed';
import EventSystem from './EventSystem';

interface CommunityDashboardProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
  currentUserId: string;
}

interface NavigationTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  badge?: number;
  description: string;
}

interface CommunityStats {
  totalMembers: number;
  onlineMembers: number;
  postsToday: number;
  eventsThisWeek: number;
  activeNow: number;
  newMembersThisWeek: number;
  topContributors: Array<{
    id: string;
    name: string;
    avatar: string;
    posts: number;
    reputation: number;
  }>;
  popularEvents: Array<{
    id: string;
    title: string;
    participants: number;
    startTime: Date;
  }>;
  trendingTopics: Array<{
    tag: string;
    posts: number;
    growth: number;
  }>;
}

export default function CommunityDashboard({ 
  serverId, 
  serverName, 
  userRole, 
  currentUserId 
}: CommunityDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<CommunityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [notifications, setNotifications] = useState<number>(0);

  // Mock data initialization
  useEffect(() => {
    const initializeDashboard = () => {
      // Mock community stats
      const mockStats: CommunityStats = {
        totalMembers: 1247,
        onlineMembers: 89,
        postsToday: 23,
        eventsThisWeek: 5,
        activeNow: 34,
        newMembersThisWeek: 18,
        topContributors: [
          {
            id: '1',
            name: 'MinecraftMaster',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinecraftMaster',
            posts: 47,
            reputation: 892
          },
          {
            id: '2',
            name: 'BuilderPro',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BuilderPro',
            posts: 39,
            reputation: 756
          },
          {
            id: '3',
            name: 'PvPChampion',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PvPChampion',
            posts: 31,
            reputation: 634
          }
        ],
        popularEvents: [
          {
            id: '1',
            title: 'Weekly Building Contest',
            participants: 45,
            startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            title: 'PvP Tournament Finals',
            participants: 32,
            startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
          },
          {
            id: '3',
            title: 'Community Movie Night',
            participants: 78,
            startTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
          }
        ],
        trendingTopics: [
          { tag: 'redstone', posts: 15, growth: 23 },
          { tag: 'pvp', posts: 12, growth: 18 },
          { tag: 'builds', posts: 28, growth: 15 },
          { tag: 'mods', posts: 9, growth: 31 },
          { tag: 'events', posts: 19, growth: 12 }
        ]
      };

      // Mock settings
      const mockSettings: CommunitySettings = {
        serverId,
        features: {
          enableCommunityHub: true,
          enablePlayerProfiles: true,
          enableSocialFeed: true,
          enableEvents: true,
          enableTournaments: true,
          enableReputationSystem: true,
          enableContentSharing: true
        },
        moderation: {
          autoModeration: true,
          moderationLevel: 'moderated',
          contentFiltering: true,
          spamProtection: true,
          reportingEnabled: true
        },
        permissions: {
          whoCanPost: 'members',
          whoCanCreateEvents: 'moderators',
          whoCanInviteFriends: 'members'
        },
        appearance: {
          theme: 'dark',
          accentColor: '#3b82f6',
          showServerBranding: true
        },
        notifications: {
          newPosts: true,
          newComments: true,
          newEvents: true,
          friendRequests: true,
          mentions: true,
          achievements: true
        }
      };

      setStats(mockStats);
      setSettings(mockSettings);
      setNotifications(7);
      setLoading(false);
    };

    const timer = setTimeout(initializeDashboard, 800);
    return () => clearTimeout(timer);
  }, [serverId]);

  // Navigation tabs configuration
  const navigationTabs: NavigationTab[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="w-5 h-5" />,
      component: <OverviewTab stats={stats} />,
      description: 'Community overview and quick stats'
    },
    {
      id: 'hub',
      label: 'Community Hub',
      icon: <Users className="w-5 h-5" />,
      component: (
        <CommunityHub 
          serverId={serverId}
          serverName={serverName}
          userRole={userRole}
          currentUserId={currentUserId}
        />
      ),
      badge: stats?.postsToday || 0,
      description: 'Main community dashboard with activity feed'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: <UserCheck className="w-5 h-5" />,
      component: (
        <PlayerProfile 
          userId={currentUserId}
          serverId={serverId}
          isOwnProfile={true}
          viewerRole={userRole}
        />
      ),
      description: 'Your player profile and achievements'
    },
    {
      id: 'feed',
      label: 'Social Feed',
      icon: <Rss className="w-5 h-5" />,
      component: (
        <SocialFeed 
          serverId={serverId}
          currentUserId={currentUserId}
          userRole={userRole}
        />
      ),
      badge: stats?.postsToday || 0,
      description: 'Latest posts and community activity'
    },
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5" />,
      component: (
        <EventSystem 
          serverId={serverId}
          currentUserId={currentUserId}
          userRole={userRole}
        />
      ),
      badge: stats?.eventsThisWeek || 0,
      description: 'Community events and tournaments'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      component: <AnalyticsTab stats={stats} userRole={userRole} />,
      description: 'Community insights and statistics'
    }
  ];

  // Filter tabs based on user permissions
  const availableTabs = navigationTabs.filter(tab => {
    if (tab.id === 'analytics') {
      return ['owner', 'admin'].includes(userRole);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading community dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {serverName} Community
                </h1>
                <p className="text-gray-600">
                  {stats?.totalMembers} members • {stats?.onlineMembers} online now
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {notifications > 0 && (
                <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                </button>
              )}
              {['owner', 'admin'].includes(userRole) && (
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {availableTabs.find(tab => tab.id === activeTab)?.component}
        </div>
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ stats }: { stats: CommunityStats | null }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Members</p>
              <p className="text-3xl font-bold">{stats.totalMembers.toLocaleString()}</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Online Now</p>
              <p className="text-3xl font-bold">{stats.onlineMembers}</p>
            </div>
            <Activity className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Posts Today</p>
              <p className="text-3xl font-bold">{stats.postsToday}</p>
            </div>
            <MessageCircle className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Events This Week</p>
              <p className="text-3xl font-bold">{stats.eventsThisWeek}</p>
            </div>
            <Calendar className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {stats.topContributors.map((contributor, index) => (
              <div key={contributor.id} className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="w-10 h-10 rounded-full"
                  />
                  {index === 0 && (
                    <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{contributor.name}</p>
                  <p className="text-sm text-gray-500">
                    {contributor.posts} posts • {contributor.reputation} reputation
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Events */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {stats.popularEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {event.participants} participants
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {new Date(event.startTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Trending Topics</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.trendingTopics.map((topic) => (
            <div
              key={topic.tag}
              className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 border border-gray-200"
            >
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-900">{topic.tag}</span>
              <span className="text-sm text-gray-500">({topic.posts})</span>
              <div className="flex items-center text-green-600">
                <ArrowUp className="w-3 h-3" />
                <span className="text-xs">{topic.growth}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ 
  stats, 
  userRole 
}: { 
  stats: CommunityStats | null; 
  userRole: string;
}) {
  if (!['owner', 'admin'].includes(userRole)) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Analytics are only available to server owners and administrators.</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Community Analytics</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <DownloadIcon className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Growth Metrics</h4>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">New Members</span>
              <span className="font-semibold">{stats.newMembersThisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-green-600">+12.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Retention Rate</span>
              <span className="font-semibold">87.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Engagement</h4>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Active</span>
              <span className="font-semibold">{stats.activeNow}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Session</span>
              <span className="font-semibold">2.3h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Posts/Member</span>
              <span className="font-semibold">0.18</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Performance</h4>
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time</span>
              <span className="font-semibold text-green-600">2.1s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-semibold">99.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Satisfaction</span>
              <span className="font-semibold">4.7/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-medium text-gray-900 mb-4">Activity Timeline</h4>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-center">
            <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Analytics charts would be rendered here</p>
            <p className="text-sm text-gray-400">Integration with charting library needed</p>
          </div>
        </div>
      </div>
    </div>
  );
}