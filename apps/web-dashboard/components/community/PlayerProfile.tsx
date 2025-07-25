'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  User,
  Users,
  Trophy,
  Star,
  Heart,
  Shield,
  Crown,
  Calendar,
  Clock,
  MapPin,
  Globe,
  MessageCircle,
  UserPlus,
  UserMinus,
  Settings,
  Edit,
  Save,
  X,
  Camera,
  Award,
  Target,
  Gamepad2,
  Activity,
  TrendingUp,
  Eye,
  ThumbsUp,
  Share2,
  Flag,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Bell,
  BellOff,
  Lock,
  Unlock,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Link,
  Mail,
  Phone,
  Github,
  Twitter,
  Twitch,
  Youtube,
  Discord,
  Steam,
  Sparkles,
  Zap,
  Lightbulb,
  Brain,
  Rocket,
  Fire
} from 'lucide-react';

interface PlayerProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  joinDate: string;
  lastSeen: string;
  location?: string;
  timezone?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  badges: PlayerBadge[];
  achievements: PlayerAchievement[];
  stats: PlayerStats;
  gameHistory: GameSession[];
  socialLinks: SocialLink[];
  friends: Friend[];
  servers: PlayerServer[];
  reputation: PlayerReputation;
  preferences: PlayerPreferences;
  privacy: PrivacySettings;
}

interface PlayerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  category: 'achievement' | 'role' | 'event' | 'special';
}

interface PlayerAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  completedAt?: string;
  reward?: string;
  category: 'building' | 'pvp' | 'social' | 'exploration' | 'creative';
}

interface PlayerStats {
  totalPlaytime: number;
  serversJoined: number;
  friendsCount: number;
  postsCreated: number;
  likesReceived: number;
  eventsParticipated: number;
  tournamentsWon: number;
  buildsShared: number;
  reputation: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

interface GameSession {
  id: string;
  serverId: string;
  serverName: string;
  gameType: string;
  startTime: string;
  endTime?: string;
  duration: number;
  playerCount: number;
  achievements: string[];
  screenshot?: string;
}

interface SocialLink {
  platform: 'discord' | 'steam' | 'twitch' | 'youtube' | 'twitter' | 'github' | 'website';
  url: string;
  verified: boolean;
}

interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  mutualFriends: number;
  relationship: 'friend' | 'pending_sent' | 'pending_received' | 'blocked';
  since: string;
}

interface PlayerServer {
  id: string;
  name: string;
  gameType: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joinedAt: string;
  playtime: number;
  rank?: string;
}

interface PlayerReputation {
  overall: number;
  categories: {
    helpfulness: number;
    friendliness: number;
    skillLevel: number;
    leadership: number;
    creativity: number;
  };
  reviews: ReputationReview[];
  endorsements: Endorsement[];
}

interface ReputationReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  category: string;
  timestamp: string;
}

interface Endorsement {
  id: string;
  endorserId: string;
  endorserName: string;
  skill: string;
  timestamp: string;
}

interface PlayerPreferences {
  publicProfile: boolean;
  showOnlineStatus: boolean;
  showPlaytime: boolean;
  allowFriendRequests: boolean;
  allowMessages: boolean;
  theme: 'dark' | 'light' | 'auto';
  notifications: {
    friendRequests: boolean;
    messages: boolean;
    events: boolean;
    achievements: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  friendListVisibility: 'public' | 'friends' | 'private';
  activityVisibility: 'public' | 'friends' | 'private';
  statsVisibility: 'public' | 'friends' | 'private';
}

interface PlayerProfileProps {
  playerId: string;
  isOwnProfile?: boolean;
  onFriendRequest?: (playerId: string) => void;
  onMessage?: (playerId: string) => void;
}

export default function PlayerProfile({
  playerId,
  isOwnProfile = false,
  onFriendRequest,
  onMessage
}: PlayerProfileProps) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'stats' | 'friends' | 'servers' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<PlayerProfile>>({});
  const [showReputationModal, setShowReputationModal] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadPlayerProfile();
  }, [playerId]);

  const loadPlayerProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading player profile
      const mockProfile = generateMockPlayerProfile();
      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (err) {
      setError('Failed to load player profile');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPlayerProfile = (): PlayerProfile => ({
    id: playerId,
    username: 'EpicGamer2024',
    displayName: 'Epic Gamer',
    bio: 'Passionate gamer and builder with 5+ years of experience. Love creating amazing worlds and helping new players. Always looking for new adventures and challenging builds!',
    avatar: '/api/placeholder/128/128',
    banner: '/api/placeholder/800/200',
    joinDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    location: 'San Francisco, CA',
    timezone: 'PST',
    status: 'online',
    badges: [
      {
        id: '1',
        name: 'Master Builder',
        description: 'Created 100+ amazing builds',
        icon: '🏗️',
        rarity: 'legendary',
        earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'achievement'
      },
      {
        id: '2',
        name: 'Community Leader',
        description: 'Active community moderator',
        icon: '👑',
        rarity: 'epic',
        earnedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'role'
      },
      {
        id: '3',
        name: 'Event Champion',
        description: 'Won 5+ community events',
        icon: '🏆',
        rarity: 'rare',
        earnedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'event'
      }
    ],
    achievements: [
      {
        id: '1',
        title: 'First Build',
        description: 'Complete your first building project',
        icon: '🏠',
        progress: 1,
        maxProgress: 1,
        completed: true,
        completedAt: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString(),
        reward: 'Builder Badge',
        category: 'building'
      },
      {
        id: '2',
        title: 'Social Butterfly',
        description: 'Make 25 friends in the community',
        icon: '🦋',
        progress: 18,
        maxProgress: 25,
        completed: false,
        category: 'social'
      },
      {
        id: '3',
        title: 'PvP Warrior',
        description: 'Win 50 PvP battles',
        icon: '⚔️',
        progress: 42,
        maxProgress: 50,
        completed: false,
        category: 'pvp'
      }
    ],
    stats: {
      totalPlaytime: 1247,
      serversJoined: 23,
      friendsCount: 156,
      postsCreated: 89,
      likesReceived: 1432,
      eventsParticipated: 34,
      tournamentsWon: 8,
      buildsShared: 67,
      reputation: 94,
      level: 42,
      experience: 15670,
      nextLevelExp: 18000
    },
    gameHistory: [
      {
        id: '1',
        serverId: 'server1',
        serverName: 'Epic Survival World',
        gameType: 'Minecraft',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        duration: 90,
        playerCount: 24,
        achievements: ['Built a castle', 'Helped new player'],
        screenshot: '/api/placeholder/300/200'
      }
    ],
    socialLinks: [
      { platform: 'discord', url: 'https://discord.gg/epicgamer', verified: true },
      { platform: 'steam', url: 'https://steamcommunity.com/id/epicgamer', verified: true },
      { platform: 'twitch', url: 'https://twitch.tv/epicgamer', verified: false },
      { platform: 'youtube', url: 'https://youtube.com/@epicgamer', verified: false }
    ],
    friends: Array.from({ length: 12 }, (_, i) => ({
      id: `friend-${i}`,
      username: `Friend${i + 1}`,
      avatar: '/api/placeholder/32/32',
      status: ['online', 'offline', 'away'][Math.floor(Math.random() * 3)] as any,
      mutualFriends: Math.floor(Math.random() * 20),
      relationship: 'friend' as const,
      since: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })),
    servers: [
      {
        id: '1',
        name: 'Epic Gaming Community',
        gameType: 'Minecraft',
        role: 'moderator',
        joinedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        playtime: 567,
        rank: 'Diamond'
      },
      {
        id: '2',
        name: 'Creative Builders',
        gameType: 'Minecraft',
        role: 'member',
        joinedAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        playtime: 234,
        rank: 'Gold'
      }
    ],
    reputation: {
      overall: 94,
      categories: {
        helpfulness: 96,
        friendliness: 92,
        skillLevel: 88,
        leadership: 95,
        creativity: 99
      },
      reviews: [
        {
          id: '1',
          reviewerId: 'user1',
          reviewerName: 'PlayerOne',
          rating: 5,
          comment: 'Amazing builder and very helpful to newcomers!',
          category: 'helpfulness',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      endorsements: [
        {
          id: '1',
          endorserId: 'user2',
          endorserName: 'BuilderPro',
          skill: 'Creative Building',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    preferences: {
      publicProfile: true,
      showOnlineStatus: true,
      showPlaytime: true,
      allowFriendRequests: true,
      allowMessages: true,
      theme: 'dark',
      notifications: {
        friendRequests: true,
        messages: true,
        events: true,
        achievements: true
      }
    },
    privacy: {
      profileVisibility: 'public',
      friendListVisibility: 'friends',
      activityVisibility: 'public',
      statsVisibility: 'public'
    }
  });

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      // API call to save profile would go here
      setProfile({ ...profile, ...editedProfile });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const handleFriendAction = async (action: 'add' | 'remove' | 'block') => {
    // API call for friend actions would go here
    if (action === 'add' && onFriendRequest) {
      onFriendRequest(playerId);
    }
  };

  const getBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-orange-400 bg-orange-900';
      case 'epic': return 'text-purple-400 bg-purple-900';
      case 'rare': return 'text-blue-400 bg-blue-900';
      case 'common': return 'text-gray-400 bg-gray-700';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'discord': return <Discord className="w-4 h-4" />;
      case 'steam': return <Steam className="w-4 h-4" />;
      case 'twitch': return <Twitch className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ${minutes % 60}m`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
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
        <LoadingSpinner size="lg" text="Loading player profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to load profile</h3>
        <p className="text-gray-400 mb-4">{error || 'Profile not found'}</p>
        <button
          onClick={loadPlayerProfile}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div 
          className="h-40 bg-gradient-to-r from-blue-600 to-purple-600 relative"
          style={{ backgroundImage: `url(${profile.banner})`, backgroundSize: 'cover' }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          {isOwnProfile && (
            <button className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-opacity">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="p-6 -mt-20 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full border-4 border-gray-800"
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-gray-800 ${getStatusColor(profile.status)}`} />
                {isOwnProfile && (
                  <button className="absolute -bottom-2 -right-2 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="mt-8">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedProfile.displayName || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      className="text-2xl font-bold bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                    />
                    <input
                      type="text"
                      value={editedProfile.username || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
                      className="text-gray-400 bg-gray-700 border border-gray-600 rounded px-2 py-1"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{profile.displayName}</h1>
                    <p className="text-gray-400 mb-2">@{profile.username}</p>
                  </div>
                )}
                
                {isEditing ? (
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full max-w-2xl mt-2 p-2 bg-gray-700 border border-gray-600 rounded text-white resize-none h-20"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-300 max-w-2xl">{profile.bio}</p>
                )}
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Last seen {formatTimeAgo(profile.lastSeen)}</span>
                  </div>
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-8">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={() => handleFriendAction('add')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </button>
                  <button
                    onClick={() => onMessage?.(playerId)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{profile.stats.level}</div>
          <div className="text-sm text-gray-400">Level</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{profile.stats.reputation}</div>
          <div className="text-sm text-gray-400">Reputation</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{formatPlaytime(profile.stats.totalPlaytime)}</div>
          <div className="text-sm text-gray-400">Playtime</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{profile.stats.friendsCount}</div>
          <div className="text-sm text-gray-400">Friends</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{profile.stats.tournamentsWon}</div>
          <div className="text-sm text-gray-400">Tournaments</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">{profile.stats.buildsShared}</div>
          <div className="text-sm text-gray-400">Builds</div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Badges & Achievements</h3>
        <div className="flex flex-wrap gap-3">
          {profile.badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getBadgeColor(badge.rarity)}`}
              title={badge.description}
            >
              <span className="text-lg">{badge.icon}</span>
              <span className="font-medium">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'stats', label: 'Statistics', icon: Activity },
          { id: 'friends', label: 'Friends', icon: Users },
          { id: 'servers', label: 'Servers', icon: Gamepad2 },
          ...(isOwnProfile ? [{ id: 'settings', label: 'Settings', icon: Settings }] : [])
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
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {profile.gameHistory.map((session) => (
                  <div key={session.id} className="flex gap-4 p-4 bg-gray-700 rounded-lg">
                    {session.screenshot && (
                      <img
                        src={session.screenshot}
                        alt="Game session"
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{session.serverName}</h4>
                      <p className="text-sm text-gray-400">{session.gameType}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>Duration: {formatPlaytime(session.duration)}</span>
                        <span>Players: {session.playerCount}</span>
                        <span>{formatTimeAgo(session.startTime)}</span>
                      </div>
                      {session.achievements.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {session.achievements.map((achievement, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-900 text-yellow-200 text-xs rounded">
                              {achievement}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Social Links */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
              <div className="space-y-3">
                {profile.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded transition-colors"
                  >
                    {getSocialIcon(link.platform)}
                    <span className="text-white capitalize">{link.platform}</span>
                    {link.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Reputation */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reputation</h3>
              <div className="space-y-3">
                {Object.entries(profile.reputation.categories).map(([category, score]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-gray-300 capitalize">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className="text-white font-medium w-8 text-right">{score}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowReputationModal(true)}
                className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Reviews
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`bg-gray-800 rounded-lg p-4 border-2 ${
                achievement.completed ? 'border-green-600' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{achievement.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                  
                  {achievement.completed ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Completed</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{achievement.progress}/{achievement.maxProgress}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'friends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {profile.friends.map((friend) => (
            <div key={friend.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(friend.status)}`} />
                </div>
                <div>
                  <h4 className="font-medium text-white">{friend.username}</h4>
                  <p className="text-sm text-gray-400">{friend.mutualFriends} mutual</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                  Message
                </button>
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors">
                  Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'servers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.servers.map((server) => (
            <div key={server.id} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  server.role === 'owner' ? 'bg-yellow-900 text-yellow-200' :
                  server.role === 'admin' ? 'bg-red-900 text-red-200' :
                  server.role === 'moderator' ? 'bg-blue-900 text-blue-200' :
                  'bg-gray-700 text-gray-300'
                }`}>
                  {server.role}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Game</span>
                  <span className="text-white">{server.gameType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Joined</span>
                  <span className="text-white">{new Date(server.joinedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Playtime</span>
                  <span className="text-white">{formatPlaytime(server.playtime)}</span>
                </div>
                {server.rank && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank</span>
                    <span className="text-white">{server.rank}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}