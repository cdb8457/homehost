'use client';

import { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Badge, 
  CommunityPost, 
  ActivityFeedItem, 
  UserReputation, 
  Friendship 
} from '@/types/community';
import { 
  User, 
  Award, 
  Calendar, 
  Clock, 
  MapPin, 
  Link, 
  Shield, 
  Star, 
  TrendingUp, 
  Activity, 
  Users, 
  MessageCircle,
  Heart,
  Share2,
  UserPlus,
  MessageSquare,
  MoreHorizontal,
  Settings,
  Eye,
  EyeOff,
  Edit,
  Camera,
  Trophy,
  Target,
  Gamepad2,
  Zap,
  Crown,
  Medal,
  Flame,
  CheckCircle,
  Clock4,
  Gift,
  Music,
  Video,
  Image,
  FileText,
  Hash,
  AtSign,
  ExternalLink,
  Copy,
  Share,
  Flag,
  Ban,
  UserX,
  UserCheck,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  AlertCircle,
  Info,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Upload,
  Bookmark,
  BookmarkPlus,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Globe,
  Lock,
  Users2,
  Building,
  Sword,
  Hammer,
  Wrench,
  Lightbulb,
  Brain,
  Cpu,
  Server,
  Database,
  Code,
  Palette,
  Brush,
  Scissors,
  Layers,
  Grid,
  Box,
  Package,
  Truck,
  Plane,
  Rocket,
  Anchor,
  Compass,
  Map,
  Navigation,
  Route,
  Crosshair,
  Focus,
  Radar,
  Satellite,
  Radio,
  Wifi,
  Bluetooth,
  Usb,
  HardDrive,
  MemoryStick,
  Smartphone,
  Tablet,
  Monitor,
  Tv,
  Headphones,
  Mic,
  Speaker,
  Camera as CameraIcon,
  Printer,
  Scanner,
  Keyboard,
  Mouse,
  Gamepad,
  Joystick,
  Dices,
  Coins,
  Banknote,
  CreditCard,
  Wallet,
  ShoppingCart,
  Store,
  Tag,
  Ticket,
  Receipt,
  Calculator,
  PieChart,
  BarChart,
  LineChart,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronUp,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Filter,
  Contrast,
  Brightness,
  Saturation,
  Hue,
  Opacity,
  Blend,
  Eraser,
  Pipette,
  Bucket,
  Pen,
  Pencil,
  PenTool,
  Highlighter,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Indent,
  Outdent,
  Superscript,
  Subscript,
  Code2,
  Terminal,
  Command,
  Option,
  Shift,
  Control,
  Alt,
  Tab,
  Space,
  Enter,
  Backspace,
  Delete,
  Escape,
  CapsLock,
  NumLock,
  ScrollLock,
  PrintScreen,
  Pause as PauseIcon,
  Insert,
  Home,
  End,
  PageUp,
  PageDown,
  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
  F11,
  F12
} from 'lucide-react';

interface PlayerProfileProps {
  userId: string;
  currentUserId: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
  isPublic?: boolean;
}

interface PlayerStats {
  totalPlayTime: number;
  favoriteServer: string;
  totalBuilds: number;
  pvpWins: number;
  pvpLosses: number;
  eventsParticipated: number;
  achievementsUnlocked: number;
  friendsCount: number;
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
  reputationScore: number;
}

interface GameActivity {
  id: string;
  serverId: string;
  serverName: string;
  game: string;
  action: string;
  timestamp: Date;
  duration?: number;
  details?: string;
}

export default function PlayerProfile({ 
  userId, 
  currentUserId, 
  userRole, 
  isPublic = false 
}: PlayerProfileProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<CommunityPost[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [gameActivity, setGameActivity] = useState<GameActivity[]>([]);
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'activity' | 'stats' | 'badges'>('overview');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: '',
    socialLinks: {
      discord: '',
      twitter: '',
      twitch: '',
      youtube: '',
      steam: ''
    }
  });

  useEffect(() => {
    loadPlayerProfile();
    setIsOwner(userId === currentUserId);
  }, [userId, currentUserId]);

  const loadPlayerProfile = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock user profile data
    const mockUserProfile: UserProfile = {
      id: 'profile-' + userId,
      userId: userId,
      displayName: userId === currentUserId ? 'Alex Johnson' : 'BuildMaster_Pro',
      bio: userId === currentUserId 
        ? 'Server administrator and community builder. Love helping new players and organizing events!'
        : 'Master builder and architect. Specialized in medieval and fantasy builds. Always looking for new building challenges!',
      avatarUrl: '/api/placeholder/128/128',
      bannerUrl: '/api/placeholder/800/200',
      location: userId === currentUserId ? 'Seattle, WA' : 'Toronto, Canada',
      socialLinks: {
        discord: userId === currentUserId ? 'AlexJ#1234' : 'BuildMaster#5678',
        twitter: userId === currentUserId ? '@alexj_gaming' : '@buildmaster_pro',
        twitch: userId === currentUserId ? 'alexj_streams' : 'buildmaster_live',
        youtube: userId === currentUserId ? 'AlexJohnsonGaming' : 'BuildMasterPro',
        steam: userId === currentUserId ? 'alexjohnson_steam' : 'buildmaster_steam'
      },
      stats: {
        totalPlayTime: userId === currentUserId ? 145680 : 89450,
        serversJoined: userId === currentUserId ? 12 : 5,
        friendsCount: userId === currentUserId ? 48 : 34,
        postsCount: userId === currentUserId ? 234 : 156,
        achievementsCount: userId === currentUserId ? 67 : 45,
        reputationScore: userId === currentUserId ? 892 : 654
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
          name: userId === currentUserId ? 'Community Leader' : 'Master Builder',
          description: userId === currentUserId 
            ? 'Recognized for outstanding community contributions' 
            : 'Built 100+ amazing structures',
          iconUrl: '/api/placeholder/32/32',
          category: 'special',
          rarity: 'legendary',
          earnedAt: new Date('2024-01-15')
        },
        {
          id: 'badge-2',
          name: userId === currentUserId ? 'Event Organizer' : 'Creative Genius',
          description: userId === currentUserId 
            ? 'Organized 10+ successful community events' 
            : 'Won 5 building contests',
          iconUrl: '/api/placeholder/32/32',
          category: 'achievement',
          rarity: 'epic',
          earnedAt: new Date('2024-03-22')
        },
        {
          id: 'badge-3',
          name: 'Early Adopter',
          description: 'Joined the server in its first month',
          iconUrl: '/api/placeholder/32/32',
          category: 'milestone',
          rarity: 'rare',
          earnedAt: new Date('2023-08-20')
        },
        {
          id: 'badge-4',
          name: 'Social Butterfly',
          description: 'Made 25+ friends in the community',
          iconUrl: '/api/placeholder/32/32',
          category: 'milestone',
          rarity: 'common',
          earnedAt: new Date('2024-02-10')
        }
      ],
      joinedAt: new Date('2023-08-15'),
      lastActive: new Date(Date.now() - 15 * 60 * 1000)
    };

    // Mock player stats
    const mockPlayerStats: PlayerStats = {
      totalPlayTime: userId === currentUserId ? 145680 : 89450,
      favoriteServer: 'Creative Building Server',
      totalBuilds: userId === currentUserId ? 45 : 127,
      pvpWins: userId === currentUserId ? 23 : 8,
      pvpLosses: userId === currentUserId ? 12 : 5,
      eventsParticipated: userId === currentUserId ? 18 : 12,
      achievementsUnlocked: userId === currentUserId ? 67 : 45,
      friendsCount: userId === currentUserId ? 48 : 34,
      postsCount: userId === currentUserId ? 234 : 156,
      commentsCount: userId === currentUserId ? 456 : 289,
      likesReceived: userId === currentUserId ? 1245 : 892,
      reputationScore: userId === currentUserId ? 892 : 654
    };

    // Mock recent posts
    const mockRecentPosts: CommunityPost[] = [
      {
        id: 'post-1',
        authorId: userId,
        serverId: 'server-1',
        content: userId === currentUserId 
          ? 'Exciting news! We\'re planning a server-wide building contest next month. Theme will be "Futuristic Cities". Start planning your builds!'
          : 'Just finished my latest project - a massive underground dwarven city! Took me 3 weeks but totally worth it. Check out the screenshots!',
        mediaUrls: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        postType: 'image',
        visibility: 'public',
        tags: userId === currentUserId ? ['announcement', 'contest', 'building'] : ['building', 'dwarven', 'underground'],
        likes: { count: userId === currentUserId ? 45 : 67, userHasLiked: false },
        comments: { count: userId === currentUserId ? 12 : 23, recent: [] },
        shares: { count: userId === currentUserId ? 8 : 15, userHasShared: false },
        author: mockUserProfile,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    // Mock game activity
    const mockGameActivity: GameActivity[] = [
      {
        id: 'activity-1',
        serverId: 'server-1',
        serverName: 'Creative Building Server',
        game: 'Minecraft',
        action: 'Completed Build',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: 180,
        details: 'Medieval Castle Build - 3 hours'
      },
      {
        id: 'activity-2',
        serverId: 'server-1',
        serverName: 'Creative Building Server',
        game: 'Minecraft',
        action: 'Joined Server',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        duration: 240,
        details: 'Played for 4 hours'
      },
      {
        id: 'activity-3',
        serverId: 'server-2',
        serverName: 'PvP Arena',
        game: 'Minecraft',
        action: 'Won Match',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        details: 'Defeated 3 opponents in tournament'
      }
    ];

    // Mock reputation data
    const mockReputation: UserReputation = {
      id: 'rep-1',
      userId: userId,
      serverId: 'server-1',
      reputationScore: userId === currentUserId ? 892 : 654,
      positiveRatings: userId === currentUserId ? 156 : 98,
      negativeRatings: userId === currentUserId ? 8 : 4,
      categories: {
        helpfulness: userId === currentUserId ? 4.8 : 4.6,
        friendliness: userId === currentUserId ? 4.9 : 4.7,
        skillLevel: userId === currentUserId ? 4.5 : 4.9,
        reliability: userId === currentUserId ? 4.7 : 4.8,
        leadership: userId === currentUserId ? 4.8 : 4.3
      },
      recentFeedback: [],
      rank: userId === currentUserId ? 'Community Leader' : 'Master Builder',
      percentile: userId === currentUserId ? 95 : 89,
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000)
    };

    // Mock friendship status
    const mockFriendship: Friendship | null = userId === currentUserId ? null : {
      id: 'friendship-1',
      requesterId: currentUserId,
      addresseeId: userId,
      status: 'accepted',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };

    setUserProfile(mockUserProfile);
    setPlayerStats(mockPlayerStats);
    setRecentPosts(mockRecentPosts);
    setGameActivity(mockGameActivity);
    setReputation(mockReputation);
    setFriendship(mockFriendship);
    
    // Set edit form values
    setEditForm({
      displayName: mockUserProfile.displayName,
      bio: mockUserProfile.bio || '',
      location: mockUserProfile.location || '',
      socialLinks: { ...mockUserProfile.socialLinks }
    });
    
    setLoading(false);
  };

  const handleSendFriendRequest = async () => {
    console.log('Sending friend request to:', userId);
    // Simulate API call
    setFriendship({
      id: 'friendship-new',
      requesterId: currentUserId,
      addresseeId: userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  };

  const handleSendMessage = async () => {
    console.log('Opening message dialog for:', userId);
    // This would open a message dialog
  };

  const handleUpdateProfile = async () => {
    console.log('Updating profile:', editForm);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        displayName: editForm.displayName,
        bio: editForm.bio,
        location: editForm.location,
        socialLinks: { ...editForm.socialLinks }
      });
    }
    setIsEditing(false);
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h ${minutes % 60}m`;
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
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic': return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      case 'rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
      case 'common': return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getBadgeIcon = (category: string) => {
    switch (category) {
      case 'achievement': return <Trophy className="w-4 h-4" />;
      case 'milestone': return <Target className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'special': return <Crown className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getReputationColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOnlineStatus = () => {
    if (!userProfile) return 'offline';
    const timeSinceActive = Date.now() - userProfile.lastActive.getTime();
    if (timeSinceActive < 5 * 60 * 1000) return 'online';
    if (timeSinceActive < 30 * 60 * 1000) return 'away';
    return 'offline';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h3>
        <p className="text-gray-600">This user profile could not be loaded.</p>
      </div>
    );
  }

  const onlineStatus = getOnlineStatus();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {/* Banner */}
        {userProfile.bannerUrl && (
          <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            <img 
              src={userProfile.bannerUrl} 
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          </div>
        )}

        {/* Profile Info */}
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img 
                src={userProfile.avatarUrl} 
                alt={userProfile.displayName}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
              <div className={`absolute bottom-1 right-1 w-6 h-6 ${getStatusColor(onlineStatus)} rounded-full border-2 border-white`}></div>
            </div>

            {/* User Details */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {userProfile.displayName}
                    {userProfile.badges.some(b => b.category === 'special') && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 ${getStatusColor(onlineStatus)} rounded-full`}></div>
                      {getStatusText(onlineStatus)}
                    </span>
                    {userProfile.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {userProfile.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Joined {userProfile.joinedAt.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Last active {formatTimeAgo(userProfile.lastActive)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {isOwner ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      {friendship?.status === 'accepted' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                          <UserCheck className="w-4 h-4" />
                          Friends
                        </div>
                      ) : friendship?.status === 'pending' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                          <Clock className="w-4 h-4" />
                          Pending
                        </div>
                      ) : (
                        <button
                          onClick={handleSendFriendRequest}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Friend
                        </button>
                      )}
                      <button
                        onClick={handleSendMessage}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </button>
                    </>
                  )}
                  <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bio */}
              {userProfile.bio && (
                <p className="text-gray-700 mb-4">{userProfile.bio}</p>
              )}

              {/* Social Links */}
              {Object.entries(userProfile.socialLinks).some(([_, value]) => value) && (
                <div className="flex items-center gap-3 mb-4">
                  {userProfile.socialLinks.discord && (
                    <a href="#" className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                      <MessageCircle className="w-4 h-4" />
                      {userProfile.socialLinks.discord}
                    </a>
                  )}
                  {userProfile.socialLinks.twitter && (
                    <a href="#" className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                      <AtSign className="w-4 h-4" />
                      {userProfile.socialLinks.twitter}
                    </a>
                  )}
                  {userProfile.socialLinks.twitch && (
                    <a href="#" className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                      <Video className="w-4 h-4" />
                      {userProfile.socialLinks.twitch}
                    </a>
                  )}
                  {userProfile.socialLinks.youtube && (
                    <a href="#" className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                      <Play className="w-4 h-4" />
                      {userProfile.socialLinks.youtube}
                    </a>
                  )}
                  {userProfile.socialLinks.steam && (
                    <a href="#" className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600">
                      <Gamepad2 className="w-4 h-4" />
                      {userProfile.socialLinks.steam}
                    </a>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{userProfile.stats.friendsCount}</div>
                  <div className="text-sm text-gray-600">Friends</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userProfile.stats.postsCount}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{userProfile.stats.achievementsCount}</div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{userProfile.stats.reputationScore}</div>
                  <div className="text-sm text-gray-600">Reputation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({...editForm, displayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Discord username"
                      value={editForm.socialLinks.discord}
                      onChange={(e) => setEditForm({...editForm, socialLinks: {...editForm.socialLinks, discord: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Twitter handle"
                      value={editForm.socialLinks.twitter}
                      onChange={(e) => setEditForm({...editForm, socialLinks: {...editForm.socialLinks, twitter: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Twitch channel"
                      value={editForm.socialLinks.twitch}
                      onChange={(e) => setEditForm({...editForm, socialLinks: {...editForm.socialLinks, twitch: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="YouTube channel"
                      value={editForm.socialLinks.youtube}
                      onChange={(e) => setEditForm({...editForm, socialLinks: {...editForm.socialLinks, youtube: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Steam profile"
                      value={editForm.socialLinks.steam}
                      onChange={(e) => setEditForm({...editForm, socialLinks: {...editForm.socialLinks, steam: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tabs */}
      <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'posts', label: 'Posts', icon: MessageCircle },
          { id: 'activity', label: 'Activity', icon: Activity },
          { id: 'stats', label: 'Stats', icon: TrendingUp },
          { id: 'badges', label: 'Badges', icon: Award }
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

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Recent Posts */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
                {recentPosts.length > 0 ? (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <p className="text-gray-700 mb-2">{post.content}</p>
                        {post.mediaUrls.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            {post.mediaUrls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Post media ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.likes.count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {post.comments.count}
                          </span>
                          <span>{formatTimeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No posts yet</p>
                )}
              </div>

              {/* Game Activity */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Game Activity</h3>
                <div className="space-y-3">
                  {gameActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{activity.action}</span>
                          <span className="text-sm text-gray-500">• {activity.serverName}</span>
                        </div>
                        <div className="text-sm text-gray-600">{activity.details}</div>
                        <div className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Posts</h3>
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Full post history coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Feed</h3>
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Detailed activity feed coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'stats' && playerStats && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Game Time</h4>
                  <div className="text-2xl font-bold text-indigo-600">{formatPlayTime(playerStats.totalPlayTime)}</div>
                  <div className="text-sm text-gray-600">Total playtime</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Builds</h4>
                  <div className="text-2xl font-bold text-green-600">{playerStats.totalBuilds}</div>
                  <div className="text-sm text-gray-600">Structures built</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">PvP Record</h4>
                  <div className="text-2xl font-bold text-purple-600">{playerStats.pvpWins}W / {playerStats.pvpLosses}L</div>
                  <div className="text-sm text-gray-600">Win rate: {Math.round((playerStats.pvpWins / (playerStats.pvpWins + playerStats.pvpLosses)) * 100)}%</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Events</h4>
                  <div className="text-2xl font-bold text-yellow-600">{playerStats.eventsParticipated}</div>
                  <div className="text-sm text-gray-600">Events participated</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges & Achievements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProfile.badges.map((badge) => (
                  <div key={badge.id} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRarityColor(badge.rarity)}`}>
                        {getBadgeIcon(badge.category)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{badge.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(badge.rarity)}`}>
                            {badge.rarity}
                          </span>
                          <span className="text-xs text-gray-500">{badge.category}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                    <div className="text-xs text-gray-500">
                      Earned on {badge.earnedAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Reputation */}
          {reputation && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Reputation
              </h3>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">{reputation.reputationScore}</div>
                <div className="text-sm text-gray-600">{reputation.rank}</div>
                <div className="text-xs text-gray-500">Top {reputation.percentile}% of players</div>
              </div>
              <div className="space-y-2">
                {Object.entries(reputation.categories).map(([category, score]) => (
                  <div key={category} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                    <span className={`text-sm font-medium ${getReputationColor(score)}`}>
                      {score.toFixed(1)}/5.0
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Badges */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Badges</h3>
            <div className="space-y-3">
              {userProfile.badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRarityColor(badge.rarity)}`}>
                    {getBadgeIcon(badge.category)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                <MessageSquare className="w-4 h-4" />
                View All Posts
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                <Activity className="w-4 h-4" />
                View Activity
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                <Users className="w-4 h-4" />
                Mutual Friends
              </button>
              <button className="w-full flex items-center gap-2 p-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                <Share2 className="w-4 h-4" />
                Share Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}