'use client';

import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  CommunityPost, 
  CommunityEvent, 
  ActivityFeedItem, 
  Friendship, 
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
  Info
} from 'lucide-react';

interface CommunityHubProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
  currentUserId: string;
}

interface QuickStats {
  totalMembers: number;
  onlineMembers: number;
  postsToday: number;
  eventsThisWeek: number;
  newMembersThisWeek: number;
  activeNow: number;
  topStreamer?: {
    name: string;
    viewers: number;
    game: string;
  };
}

interface CommunityInsights {
  mostActiveUsers: UserProfile[];
  popularPosts: CommunityPost[];
  upcomingEvents: CommunityEvent[];
  trendingTopics: string[];
  communityGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export default function CommunityHub({ 
  serverId, 
  serverName, 
  userRole, 
  currentUserId 
}: CommunityHubProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'members' | 'insights'>('feed');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CommunityEvent[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [insights, setInsights] = useState<CommunityInsights | null>(null);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'poll'>('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'posts' | 'events' | 'achievements'>('all');

  useEffect(() => {
    loadCommunityData();
    const interval = setInterval(loadCommunityData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [serverId]);

  const loadCommunityData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock user profile
    const mockUserProfile: UserProfile = {
      id: 'profile-1',
      userId: currentUserId,
      displayName: 'Alex Johnson',
      bio: 'Server administrator and community builder. Love helping new players!',
      avatarUrl: '/api/placeholder/64/64',
      bannerUrl: '/api/placeholder/400/200',
      location: 'Seattle, WA',
      socialLinks: {
        discord: 'AlexJ#1234',
        twitter: '@alexj_gaming',
        twitch: 'alexj_streams',
        steam: 'alexjohnson_steam'
      },
      stats: {
        totalPlayTime: 145680, // 2428 hours
        serversJoined: 12,
        friendsCount: 48,
        postsCount: 234,
        achievementsCount: 67,
        reputationScore: 892
      },
      preferences: {
        showOnlineStatus: true,
        allowFriendRequests: true,
        showGameActivity: true,
        emailNotifications: true,
        pushNotifications: true
      },
      badges: [
        {
          id: 'badge-1',
          name: 'Community Leader',
          description: 'Recognized for outstanding community contributions',
          iconUrl: '/api/placeholder/32/32',
          category: 'special',
          rarity: 'legendary',
          earnedAt: new Date('2024-01-15')
        },
        {
          id: 'badge-2',
          name: 'Event Organizer',
          description: 'Organized 10+ successful community events',
          iconUrl: '/api/placeholder/32/32',
          category: 'achievement',
          rarity: 'epic',
          earnedAt: new Date('2024-03-22')
        }
      ],
      joinedAt: new Date('2023-08-15'),
      lastActive: new Date()
    };

    // Mock quick stats
    const mockQuickStats: QuickStats = {
      totalMembers: 1247,
      onlineMembers: 89,
      postsToday: 23,
      eventsThisWeek: 3,
      newMembersThisWeek: 12,
      activeNow: 45,
      topStreamer: {
        name: 'BuildMaster_Pro',
        viewers: 127,
        game: 'Minecraft'
      }
    };

    // Mock community posts
    const mockPosts: CommunityPost[] = [
      {
        id: 'post-1',
        authorId: 'user-1',
        serverId: serverId,
        content: 'Just finished building an amazing castle on the server! Check out these screenshots from our latest building contest. The attention to detail is incredible! 🏰✨',
        mediaUrls: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        postType: 'image',
        visibility: 'public',
        tags: ['building', 'contest', 'castle', 'medieval'],
        likes: { count: 47, userHasLiked: false },
        comments: { count: 12, recent: [] },
        shares: { count: 8, userHasShared: false },
        author: {
          id: 'user-1',
          userId: 'user-1',
          displayName: 'BuildMaster_Pro',
          avatarUrl: '/api/placeholder/40/40',
          bannerUrl: '/api/placeholder/400/200',
          location: 'Canada',
          socialLinks: {},
          stats: {
            totalPlayTime: 89450,
            serversJoined: 5,
            friendsCount: 34,
            postsCount: 156,
            achievementsCount: 45,
            reputationScore: 654
          },
          preferences: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showGameActivity: true,
            emailNotifications: true,
            pushNotifications: true
          },
          badges: [],
          joinedAt: new Date('2023-11-10'),
          lastActive: new Date(Date.now() - 15 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'post-2',
        authorId: 'user-2',
        serverId: serverId,
        content: 'Who wants to join our upcoming PvP tournament this weekend? Registration is now open! 🏆 First place gets 1000 server credits and a custom title. Let\'s see who\'s the ultimate warrior!',
        mediaUrls: [],
        postType: 'event',
        visibility: 'public',
        tags: ['pvp', 'tournament', 'competition', 'weekend'],
        likes: { count: 32, userHasLiked: true },
        comments: { count: 18, recent: [] },
        shares: { count: 15, userHasShared: false },
        author: {
          id: 'user-2',
          userId: 'user-2',
          displayName: 'PvP_Champion',
          avatarUrl: '/api/placeholder/40/40',
          bannerUrl: '/api/placeholder/400/200',
          location: 'USA',
          socialLinks: {},
          stats: {
            totalPlayTime: 156780,
            serversJoined: 8,
            friendsCount: 67,
            postsCount: 89,
            achievementsCount: 78,
            reputationScore: 1023
          },
          preferences: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showGameActivity: true,
            emailNotifications: true,
            pushNotifications: true
          },
          badges: [],
          joinedAt: new Date('2023-09-05'),
          lastActive: new Date(Date.now() - 30 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 'post-3',
        authorId: 'user-3',
        serverId: serverId,
        content: 'New to the server and loving the community already! Special thanks to @AlexJ for the warm welcome and @BuildMaster_Pro for showing me around. This place feels like home! 💙',
        mediaUrls: [],
        postType: 'text',
        visibility: 'public',
        tags: ['welcome', 'new-member', 'thanks', 'community'],
        likes: { count: 28, userHasLiked: false },
        comments: { count: 7, recent: [] },
        shares: { count: 3, userHasShared: false },
        author: {
          id: 'user-3',
          userId: 'user-3',
          displayName: 'NewPlayer_Sarah',
          avatarUrl: '/api/placeholder/40/40',
          bannerUrl: '/api/placeholder/400/200',
          location: 'UK',
          socialLinks: {},
          stats: {
            totalPlayTime: 1250,
            serversJoined: 2,
            friendsCount: 8,
            postsCount: 5,
            achievementsCount: 12,
            reputationScore: 45
          },
          preferences: {
            showOnlineStatus: true,
            allowFriendRequests: true,
            showGameActivity: true,
            emailNotifications: true,
            pushNotifications: true
          },
          badges: [],
          joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          lastActive: new Date(Date.now() - 5 * 60 * 1000)
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    ];

    // Mock upcoming events
    const mockEvents: CommunityEvent[] = [
      {
        id: 'event-1',
        serverId: serverId,
        creatorId: 'user-2',
        title: 'Weekly PvP Tournament',
        description: 'Join us for our weekly PvP tournament! Fight your way to the top and claim victory!',
        eventType: 'tournament',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        location: 'server',
        maxParticipants: 32,
        registrationRequired: true,
        registrationDeadline: new Date(Date.now() + 1.5 * 24 * 60 * 60 * 1000),
        prizes: [
          { position: 1, reward: '1000 Server Credits', value: 1000, currency: 'credits', description: 'First place prize' },
          { position: 2, reward: '500 Server Credits', value: 500, currency: 'credits', description: 'Second place prize' },
          { position: 3, reward: '250 Server Credits', value: 250, currency: 'credits', description: 'Third place prize' }
        ],
        requirements: { gameMode: 'PvP', equipment: ['Diamond gear or better'] },
        rules: 'No cheating, no griefing, respect all players',
        status: 'registration_open',
        participants: [],
        spectators: [],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 'event-2',
        serverId: serverId,
        creatorId: 'user-1',
        title: 'Community Building Contest',
        description: 'Show off your building skills in our monthly contest! Theme: Medieval Architecture',
        eventType: 'building',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'server',
        registrationRequired: false,
        prizes: [
          { position: 1, reward: 'Builder Badge', value: 1, currency: 'badge', description: 'Special recognition badge' }
        ],
        requirements: {},
        rules: 'Original builds only, no copying existing designs',
        status: 'upcoming',
        participants: [],
        spectators: [],
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    ];

    // Mock activity feed
    const mockActivityFeed: ActivityFeedItem[] = [
      {
        id: 'activity-1',
        userId: 'user-1',
        activityType: 'achievement',
        title: 'BuildMaster_Pro earned an achievement',
        description: 'Completed "Master Builder" - Build 100 structures',
        metadata: { achievementId: 'achievement-1' },
        visibility: 'public',
        imageUrl: '/api/placeholder/32/32',
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 'activity-2',
        userId: 'user-3',
        activityType: 'server_join',
        title: 'NewPlayer_Sarah joined the server',
        description: 'Welcome to our amazing community!',
        metadata: { serverId: serverId },
        visibility: 'public',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'activity-3',
        userId: 'user-2',
        activityType: 'event',
        title: 'PvP_Champion created an event',
        description: 'Weekly PvP Tournament - Registration now open!',
        metadata: { eventId: 'event-1' },
        visibility: 'public',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    // Mock insights
    const mockInsights: CommunityInsights = {
      mostActiveUsers: [mockUserProfile],
      popularPosts: mockPosts.slice(0, 2),
      upcomingEvents: mockEvents,
      trendingTopics: ['#building', '#pvp', '#tournament', '#newplayers', '#medieval'],
      communityGrowth: {
        daily: 5.2,
        weekly: 12.8,
        monthly: 35.6
      }
    };

    setUserProfile(mockUserProfile);
    setQuickStats(mockQuickStats);
    setCommunityPosts(mockPosts);
    setUpcomingEvents(mockEvents);
    setActivityFeed(mockActivityFeed);
    setInsights(mockInsights);
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorId: currentUserId,
      serverId: serverId,
      content: newPostContent,
      mediaUrls: [],
      postType: postType,
      visibility: 'public',
      tags: [],
      likes: { count: 0, userHasLiked: false },
      comments: { count: 0, recent: [] },
      shares: { count: 0, userHasShared: false },
      author: userProfile,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setCommunityPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const handleLikePost = (postId: string) => {
    setCommunityPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            likes: {
              count: post.likes.userHasLiked ? post.likes.count - 1 : post.likes.count + 1,
              userHasLiked: !post.likes.userHasLiked
            }
          }
        : post
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'common': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'tournament': return <Trophy className="w-4 h-4" />;
      case 'building': return <Users className="w-4 h-4" />;
      case 'pvp': return <Target className="w-4 h-4" />;
      case 'social': return <Users2 className="w-4 h-4" />;
      case 'educational': return <BookOpen className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'image': return <Camera className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'poll': return <BarChart3 className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="relative">
                <Users className="w-8 h-8 text-indigo-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              Community Hub
            </h1>
            <p className="text-gray-600 mt-1">
              Connect, share, and build together in the <span className="font-semibold">{serverName}</span> community
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Bell className="w-4 h-4" />
              Notifications
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {quickStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Members</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{quickStats.totalMembers.toLocaleString()}</div>
              <div className="text-sm text-green-600">+{quickStats.newMembersThisWeek} this week</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Online</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{quickStats.onlineMembers}</div>
              <div className="text-sm text-gray-500">{quickStats.activeNow} active now</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Posts Today</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{quickStats.postsToday}</div>
              <div className="text-sm text-gray-500">+{Math.round(quickStats.postsToday * 0.3)} from yesterday</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Events</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{quickStats.eventsThisWeek}</div>
              <div className="text-sm text-gray-500">This week</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Growth</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">+12.8%</div>
              <div className="text-sm text-gray-500">Weekly</div>
            </div>

            {quickStats.topStreamer && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Live</span>
                </div>
                <div className="text-lg font-bold text-gray-900">{quickStats.topStreamer.name}</div>
                <div className="text-sm text-gray-500">{quickStats.topStreamer.viewers} viewers</div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-sm">
          {[
            { id: 'feed', label: 'Community Feed', icon: MessageCircle },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'insights', label: 'Insights', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Modal */}
            {showCreatePost && (
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {userProfile?.avatarUrl && (
                      <img 
                        src={userProfile.avatarUrl} 
                        alt={userProfile.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="font-medium text-gray-900">{userProfile?.displayName}</span>
                  </div>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                        <Image className="w-4 h-4" />
                        Photo
                      </button>
                      <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">
                        <Video className="w-4 h-4" />
                        Video
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                      disabled={!newPostContent.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts */}
            {communityPosts.map((post) => (
              <div key={post.id} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-start gap-3 mb-4">
                  {post.author?.avatarUrl && (
                    <img 
                      src={post.author.avatarUrl} 
                      alt={post.author.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{post.author?.displayName}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                      <div className="flex items-center gap-1">
                        {getPostTypeIcon(post.postType)}
                        <span className="text-xs text-gray-500 capitalize">{post.postType}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{post.content}</p>
                    
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Media */}
                    {post.mediaUrls.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {post.mediaUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post media ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-3 border-t">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                          post.likes.userHasLiked
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.likes.userHasLiked ? 'fill-current' : ''}`} />
                        {post.likes.count}
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments.count}
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
                        <Share2 className="w-4 h-4" />
                        {post.shares.count}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            {userProfile && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="text-center mb-4">
                  {userProfile.avatarUrl && (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt={userProfile.displayName}
                      className="w-16 h-16 rounded-full mx-auto mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900">{userProfile.displayName}</h3>
                  <p className="text-sm text-gray-600">{userProfile.bio}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{userProfile.stats.friendsCount}</div>
                    <div className="text-gray-600">Friends</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{userProfile.stats.postsCount}</div>
                    <div className="text-gray-600">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{userProfile.stats.achievementsCount}</div>
                    <div className="text-gray-600">Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{userProfile.stats.reputationScore}</div>
                    <div className="text-gray-600">Reputation</div>
                  </div>
                </div>

                {/* Badges */}
                {userProfile.badges.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {userProfile.badges.slice(0, 3).map((badge) => (
                        <div
                          key={badge.id}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}
                          title={badge.description}
                        >
                          {badge.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Upcoming Events
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {getEventTypeIcon(event.eventType)}
                        <span className="font-medium text-gray-900">{event.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{event.description}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {event.startTime.toLocaleDateString()} at {event.startTime.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            {insights && (
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  {insights.trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 cursor-pointer">
                      <Hash className="w-3 h-3" />
                      {topic}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other tabs would be implemented here */}
      {activeTab === 'events' && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Events System</h3>
          <p className="text-gray-600">Advanced event management system coming soon...</p>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Member Directory</h3>
          <p className="text-gray-600">Member profiles and social features coming soon...</p>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Insights</h3>
          <p className="text-gray-600">Advanced analytics and community insights coming soon...</p>
        </div>
      )}
    </div>
  );
}