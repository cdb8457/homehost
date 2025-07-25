'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Users,
  MessageCircle,
  Calendar,
  Trophy,
  Star,
  Heart,
  Share2,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Activity,
  Award,
  Camera,
  Video,
  FileText,
  Map,
  Gamepad2,
  Crown,
  Shield,
  Eye,
  ThumbsUp,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Copy,
  Flag,
  UserPlus,
  UserMinus,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Sparkles,
  Zap,
  Target,
  Lightbulb
} from 'lucide-react';

interface CommunityData {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  onlineCount: number;
  servers: CommunityServer[];
  stats: CommunityStats;
  recentActivity: ActivityItem[];
  upcomingEvents: CommunityEvent[];
  featuredContent: FeaturedContent[];
  announcements: Announcement[];
  moderators: Moderator[];
  settings: CommunitySettings;
}

interface CommunityServer {
  id: string;
  name: string;
  gameType: string;
  playerCount: number;
  maxPlayers: number;
  status: 'online' | 'offline' | 'starting';
  version: string;
  joinUrl?: string;
  tags: string[];
}

interface CommunityStats {
  totalMembers: number;
  activeMembers: number;
  totalPosts: number;
  totalEvents: number;
  reputation: number;
  growthRate: number;
  engagementScore: number;
}

interface ActivityItem {
  id: string;
  type: 'join' | 'post' | 'achievement' | 'event' | 'server' | 'media';
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  metadata?: any;
  timestamp: string;
  likes: number;
  comments: number;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'tournament' | 'community' | 'building' | 'pvp' | 'creative';
  startTime: string;
  endTime: string;
  participants: number;
  maxParticipants: number;
  prizes: string[];
  status: 'upcoming' | 'live' | 'completed';
  featured: boolean;
}

interface FeaturedContent {
  id: string;
  type: 'screenshot' | 'video' | 'build' | 'story';
  title: string;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  likes: number;
  views: number;
  featured: boolean;
  timestamp: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'event';
  author: string;
  pinned: boolean;
  timestamp: string;
}

interface Moderator {
  id: string;
  username: string;
  avatar: string;
  role: 'owner' | 'admin' | 'moderator';
  permissions: string[];
  status: 'online' | 'offline' | 'away';
}

interface CommunitySettings {
  privacy: 'public' | 'private' | 'invite_only';
  joinApproval: boolean;
  contentModeration: 'strict' | 'moderate' | 'relaxed';
  allowUserEvents: boolean;
  allowMediaSharing: boolean;
  discordIntegration: boolean;
}

interface CommunityHubProps {
  communityId: string;
  isOwner?: boolean;
  isModerator?: boolean;
}

export default function CommunityHub({
  communityId,
  isOwner = false,
  isModerator = false
}: CommunityHubProps) {
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'servers' | 'events' | 'content' | 'members' | 'settings'>('overview');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isJoined, setIsJoined] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadCommunityData();
  }, [communityId]);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading community data
      const mockCommunity = generateMockCommunityData();
      setCommunity(mockCommunity);
    } catch (err) {
      setError('Failed to load community data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockCommunityData = (): CommunityData => ({
    id: communityId,
    name: 'Epic Gaming Community',
    description: 'A thriving community of gamers passionate about multiplayer adventures, building amazing worlds, and competitive tournaments. Join us for daily events, friendly competition, and unforgettable gaming experiences!',
    memberCount: 1247,
    onlineCount: 89,
    servers: [
      {
        id: '1',
        name: 'Survival World Alpha',
        gameType: 'Minecraft',
        playerCount: 24,
        maxPlayers: 50,
        status: 'online',
        version: '1.20.4',
        joinUrl: 'mc.epicgaming.com:25565',
        tags: ['survival', 'economy', 'events']
      },
      {
        id: '2',
        name: 'Creative Builds',
        gameType: 'Minecraft',
        playerCount: 12,
        maxPlayers: 30,
        status: 'online',
        version: '1.20.4',
        joinUrl: 'creative.epicgaming.com:25566',
        tags: ['creative', 'building', 'showcase']
      },
      {
        id: '3',
        name: 'PvP Arena',
        gameType: 'Minecraft',
        playerCount: 18,
        maxPlayers: 40,
        status: 'online',
        version: '1.20.4',
        joinUrl: 'pvp.epicgaming.com:25567',
        tags: ['pvp', 'competitive', 'tournaments']
      }
    ],
    stats: {
      totalMembers: 1247,
      activeMembers: 89,
      totalPosts: 3492,
      totalEvents: 156,
      reputation: 98,
      growthRate: 12.5,
      engagementScore: 87
    },
    recentActivity: [
      {
        id: '1',
        type: 'achievement',
        userId: '1',
        username: 'BuildMaster42',
        userAvatar: '/api/placeholder/32/32',
        content: 'Completed the Mega Castle project and earned the Master Builder achievement!',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        likes: 23,
        comments: 5
      },
      {
        id: '2',
        type: 'event',
        userId: '2',
        username: 'CommunityMod',
        userAvatar: '/api/placeholder/32/32',
        content: 'Started the Weekly Building Contest - Theme: Medieval Castles',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes: 45,
        comments: 12
      },
      {
        id: '3',
        type: 'media',
        userId: '3',
        username: 'ScreenshotPro',
        userAvatar: '/api/placeholder/32/32',
        content: 'Shared an amazing sunset view from the mountaintop base',
        metadata: { mediaType: 'screenshot', likes: 67 },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 67,
        comments: 8
      },
      {
        id: '4',
        type: 'join',
        userId: '4',
        username: 'NewPlayer123',
        userAvatar: '/api/placeholder/32/32',
        content: 'Joined the community! Welcome to Epic Gaming!',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        comments: 3
      }
    ],
    upcomingEvents: [
      {
        id: '1',
        title: 'Weekly Building Contest',
        description: 'Show off your best medieval castle builds',
        type: 'building',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        participants: 34,
        maxParticipants: 100,
        prizes: ['Champion Title', 'VIP Status', 'Custom Plot'],
        status: 'upcoming',
        featured: true
      },
      {
        id: '2',
        title: 'PvP Tournament',
        description: 'Competitive 1v1 battles for the ultimate champion',
        type: 'pvp',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        participants: 28,
        maxParticipants: 64,
        prizes: ['$100 Prize Pool', 'Champion Rank', 'Special Badge'],
        status: 'upcoming',
        featured: false
      }
    ],
    featuredContent: [
      {
        id: '1',
        type: 'build',
        title: 'Magnificent Dragon Cathedral',
        author: 'DragonBuilder',
        authorAvatar: '/api/placeholder/32/32',
        thumbnail: '/api/placeholder/300/200',
        likes: 234,
        views: 1567,
        featured: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'video',
        title: 'Epic PvP Highlights Montage',
        author: 'PvPMaster',
        authorAvatar: '/api/placeholder/32/32',
        thumbnail: '/api/placeholder/300/200',
        likes: 156,
        views: 2341,
        featured: true,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    announcements: [
      {
        id: '1',
        title: 'Server Update 1.20.4',
        content: 'Our servers have been updated to the latest version with new features and optimizations!',
        type: 'info',
        author: 'ServerAdmin',
        pinned: true,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Monthly Event Winners',
        content: 'Congratulations to all the winners of last month\'s building contest!',
        type: 'success',
        author: 'EventMod',
        pinned: false,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    moderators: [
      {
        id: '1',
        username: 'CommunityOwner',
        avatar: '/api/placeholder/32/32',
        role: 'owner',
        permissions: ['all'],
        status: 'online'
      },
      {
        id: '2',
        username: 'HeadModerator',
        avatar: '/api/placeholder/32/32',
        role: 'admin',
        permissions: ['moderate', 'events', 'content'],
        status: 'online'
      },
      {
        id: '3',
        username: 'EventMod',
        avatar: '/api/placeholder/32/32',
        role: 'moderator',
        permissions: ['events', 'content'],
        status: 'away'
      }
    ],
    settings: {
      privacy: 'public',
      joinApproval: false,
      contentModeration: 'moderate',
      allowUserEvents: true,
      allowMediaSharing: true,
      discordIntegration: true
    }
  });

  const handleJoinCommunity = async () => {
    setIsJoined(true);
    // API call would go here
  };

  const handleLeaveCommunity = async () => {
    setIsJoined(false);
    // API call would go here
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    // API call to create post would go here
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const handleLikeActivity = async (activityId: string) => {
    if (!community) return;

    setCommunity(prev => ({
      ...prev!,
      recentActivity: prev!.recentActivity.map(activity =>
        activity.id === activityId
          ? { ...activity, likes: activity.likes + 1 }
          : activity
      )
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'join': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'post': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'event': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'server': return <Gamepad2 className="w-5 h-5 text-orange-500" />;
      case 'media': return <Camera className="w-5 h-5 text-pink-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'event': return <Calendar className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-gray-400';
      case 'starting': return 'text-yellow-400';
      case 'away': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading community..." />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to load community</h3>
        <p className="text-gray-400 mb-4">{error || 'Community not found'}</p>
        <button
          onClick={loadCommunityData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div 
          className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative"
          style={{ backgroundImage: 'url(/api/placeholder/1200/128)', backgroundSize: 'cover' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
        
        <div className="p-6 -mt-16 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-700 rounded-lg border-4 border-gray-800 flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-white mb-1">{community.name}</h1>
                <p className="text-gray-300 mb-2 max-w-2xl">{community.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{community.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>{community.onlineCount} online</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gamepad2 className="w-4 h-4" />
                    <span>{community.servers.length} servers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>{community.stats.reputation}% reputation</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              {!isJoined ? (
                <button
                  onClick={handleJoinCommunity}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Join Community
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Invite
                  </button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                  {(isOwner || isModerator) && (
                    <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'servers', label: 'Servers', icon: Gamepad2 },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'content', label: 'Content', icon: Camera },
          { id: 'members', label: 'Members', icon: Users },
          ...(isOwner || isModerator ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Community Feed</h3>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Post
                </button>
              </div>

              {/* Activity Feed */}
              <div className="space-y-4">
                {community.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-3 p-4 bg-gray-700 rounded-lg">
                    <img
                      src={activity.userAvatar}
                      alt={activity.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getActivityIcon(activity.type)}
                        <span className="font-medium text-white">{activity.username}</span>
                        <span className="text-sm text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                      </div>
                      <p className="text-gray-300 mb-2">{activity.content}</p>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLikeActivity(activity.id)}
                          className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Heart className="w-4 h-4" />
                          {activity.likes}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          {activity.comments}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 transition-colors">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Content */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Featured Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {community.featuredContent.map((content) => (
                  <div key={content.id} className="bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-medium text-white mb-1">{content.title}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={content.authorAvatar}
                          alt={content.author}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="text-sm text-gray-400">{content.author}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {content.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {content.views}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Members</span>
                  <span className="text-white font-medium">{community.stats.totalMembers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Members</span>
                  <span className="text-white font-medium">{community.stats.activeMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Posts</span>
                  <span className="text-white font-medium">{community.stats.totalPosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Events Hosted</span>
                  <span className="text-white font-medium">{community.stats.totalEvents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Growth Rate</span>
                  <span className="text-green-400 font-medium">+{community.stats.growthRate}%</span>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Announcements</h3>
              <div className="space-y-3">
                {community.announcements.map((announcement) => (
                  <div key={announcement.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      {getAnnouncementIcon(announcement.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">{announcement.title}</h4>
                        <p className="text-sm text-gray-300 mb-2">{announcement.content}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{announcement.author}</span>
                          <span>{formatTimeAgo(announcement.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {community.upcomingEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white">{event.title}</h4>
                      {event.featured && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{event.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{new Date(event.startTime).toLocaleDateString()}</span>
                      <span>{event.participants}/{event.maxParticipants} participants</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Online Moderators */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Moderators</h3>
              <div className="space-y-3">
                {community.moderators.map((mod) => (
                  <div key={mod.id} className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={mod.avatar}
                        alt={mod.username}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(mod.status)} bg-current`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{mod.username}</span>
                        {mod.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" />}
                        {mod.role === 'admin' && <Shield className="w-4 h-4 text-blue-500" />}
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{mod.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'servers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {community.servers.map((server) => (
            <div key={server.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  server.status === 'online' ? 'bg-green-500' :
                  server.status === 'starting' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Game</span>
                  <span className="text-white">{server.gameType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Players</span>
                  <span className="text-white">{server.playerCount}/{server.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <span className="text-white">{server.version}</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {server.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {server.joinUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={server.joinUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                      <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's happening in the community?"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none h-32 focus:outline-none focus:border-blue-500"
            />
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-white rounded">
                  <Camera className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white rounded">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white rounded">
                  <FileText className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}