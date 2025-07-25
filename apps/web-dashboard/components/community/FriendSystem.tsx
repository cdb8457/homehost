'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  MessageCircle,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Settings,
  Bell,
  BellOff,
  Star,
  Heart,
  Activity,
  Clock,
  Calendar,
  Globe,
  MapPin,
  Gamepad2,
  Trophy,
  Award,
  Target,
  Shield,
  Crown,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Edit,
  Save,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Trash2,
  Block,
  Flag,
  RefreshCw,
  Plus,
  Minus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Fire,
  Volume2,
  VolumeX,
  Camera,
  Video
} from 'lucide-react';

interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy' | 'invisible';
  lastSeen: string;
  mutualFriends: number;
  relationship: 'friend' | 'pending_sent' | 'pending_received' | 'blocked' | 'none';
  friendSince: string;
  favorited: boolean;
  notifications: boolean;
  gameStatus?: {
    game: string;
    server: string;
    activity: string;
  };
  profile: {
    bio: string;
    level: number;
    reputation: number;
    badges: string[];
    servers: string[];
    achievements: number;
  };
  privacy: {
    showOnlineStatus: boolean;
    showGameActivity: boolean;
    allowMessages: boolean;
  };
}

interface FriendRequest {
  id: string;
  fromUser: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  toUser: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  message?: string;
  createdAt: string;
  mutualFriends: number;
}

interface FriendGroup {
  id: string;
  name: string;
  color: string;
  friends: string[];
  createdAt: string;
}

interface FriendActivity {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string;
  type: 'online' | 'offline' | 'game_start' | 'game_end' | 'achievement' | 'server_join' | 'status_change';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface FriendSystemProps {
  currentUserId: string;
  onMessageFriend?: (friendId: string) => void;
  onViewProfile?: (friendId: string) => void;
}

export default function FriendSystem({
  currentUserId,
  onMessageFriend,
  onViewProfile
}: FriendSystemProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendGroups, setFriendGroups] = useState<FriendGroup[]>([]);
  const [friendActivity, setFriendActivity] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'friends' | 'requests' | 'activity' | 'groups' | 'suggestions'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [addFriendInput, setAddFriendInput] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const apiClient = new ApiClient();

  useEffect(() => {
    loadFriendData();
  }, [currentUserId]);

  const loadFriendData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading friend data
      const mockFriends = generateMockFriends();
      const mockRequests = generateMockFriendRequests();
      const mockGroups = generateMockFriendGroups();
      const mockActivity = generateMockFriendActivity();

      setFriends(mockFriends);
      setFriendRequests(mockRequests);
      setFriendGroups(mockGroups);
      setFriendActivity(mockActivity);
    } catch (err) {
      setError('Failed to load friend data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockFriends = (): Friend[] => [
    {
      id: '1',
      username: 'BuildMaster42',
      displayName: 'Build Master',
      avatar: '/api/placeholder/48/48',
      status: 'online',
      lastSeen: new Date().toISOString(),
      mutualFriends: 12,
      relationship: 'friend',
      friendSince: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
      favorited: true,
      notifications: true,
      gameStatus: {
        game: 'Minecraft',
        server: 'Creative Builders',
        activity: 'Building a castle'
      },
      profile: {
        bio: 'Master builder with 5+ years experience',
        level: 42,
        reputation: 95,
        badges: ['master_builder', 'verified', 'community_leader'],
        servers: ['Creative Builders', 'Survival World'],
        achievements: 67
      },
      privacy: {
        showOnlineStatus: true,
        showGameActivity: true,
        allowMessages: true
      }
    },
    {
      id: '2',
      username: 'PvPWarrior',
      displayName: 'PvP Warrior',
      avatar: '/api/placeholder/48/48',
      status: 'away',
      lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      mutualFriends: 8,
      relationship: 'friend',
      friendSince: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      favorited: false,
      notifications: true,
      gameStatus: {
        game: 'Minecraft',
        server: 'PvP Arena',
        activity: 'In combat'
      },
      profile: {
        bio: 'Competitive PvP player and tournament champion',
        level: 38,
        reputation: 88,
        badges: ['pvp_champion', 'tournament_winner'],
        servers: ['PvP Arena', 'Combat Training'],
        achievements: 45
      },
      privacy: {
        showOnlineStatus: true,
        showGameActivity: true,
        allowMessages: true
      }
    },
    {
      id: '3',
      username: 'CreativeGenius',
      displayName: 'Creative Genius',
      avatar: '/api/placeholder/48/48',
      status: 'busy',
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      mutualFriends: 15,
      relationship: 'friend',
      friendSince: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
      favorited: true,
      notifications: false,
      gameStatus: {
        game: 'Minecraft',
        server: 'Art Gallery',
        activity: 'Creating pixel art'
      },
      profile: {
        bio: 'Digital artist and creative builder',
        level: 35,
        reputation: 92,
        badges: ['artist', 'creative_master'],
        servers: ['Art Gallery', 'Creative Builds'],
        achievements: 52
      },
      privacy: {
        showOnlineStatus: true,
        showGameActivity: true,
        allowMessages: true
      }
    },
    {
      id: '4',
      username: 'SurvivalExpert',
      displayName: 'Survival Expert',
      avatar: '/api/placeholder/48/48',
      status: 'offline',
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      mutualFriends: 6,
      relationship: 'friend',
      friendSince: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      favorited: false,
      notifications: true,
      profile: {
        bio: 'Hardcore survival player and guide creator',
        level: 41,
        reputation: 89,
        badges: ['survival_master', 'guide_creator'],
        servers: ['Hardcore Survival', 'Wilderness'],
        achievements: 59
      },
      privacy: {
        showOnlineStatus: true,
        showGameActivity: false,
        allowMessages: true
      }
    },
    {
      id: '5',
      username: 'NewPlayer123',
      displayName: 'Excited Newcomer',
      avatar: '/api/placeholder/48/48',
      status: 'online',
      lastSeen: new Date().toISOString(),
      mutualFriends: 2,
      relationship: 'friend',
      friendSince: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      favorited: false,
      notifications: true,
      gameStatus: {
        game: 'Minecraft',
        server: 'Beginner Friendly',
        activity: 'Learning to build'
      },
      profile: {
        bio: 'New to the community, excited to learn!',
        level: 5,
        reputation: 78,
        badges: ['newcomer'],
        servers: ['Beginner Friendly'],
        achievements: 8
      },
      privacy: {
        showOnlineStatus: true,
        showGameActivity: true,
        allowMessages: true
      }
    }
  ];

  const generateMockFriendRequests = (): FriendRequest[] => [
    {
      id: '1',
      fromUser: {
        id: 'user6',
        username: 'AmazingBuilder',
        displayName: 'Amazing Builder',
        avatar: '/api/placeholder/48/48'
      },
      toUser: {
        id: currentUserId,
        username: 'CurrentUser',
        displayName: 'You',
        avatar: '/api/placeholder/48/48'
      },
      message: 'Hey! I saw your builds on the server and they\'re incredible. Would love to be friends and maybe collaborate!',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      mutualFriends: 3
    },
    {
      id: '2',
      fromUser: {
        id: 'user7',
        username: 'FriendlyPlayer',
        displayName: 'Friendly Player',
        avatar: '/api/placeholder/48/48'
      },
      toUser: {
        id: currentUserId,
        username: 'CurrentUser',
        displayName: 'You',
        avatar: '/api/placeholder/48/48'
      },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      mutualFriends: 1
    }
  ];

  const generateMockFriendGroups = (): FriendGroup[] => [
    {
      id: '1',
      name: 'Best Friends',
      color: '#FF6B6B',
      friends: ['1', '3'],
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      name: 'PvP Squad',
      color: '#4ECDC4',
      friends: ['2'],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      name: 'Building Team',
      color: '#45B7D1',
      friends: ['1', '3'],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const generateMockFriendActivity = (): FriendActivity[] => [
    {
      id: '1',
      friendId: '1',
      friendName: 'Build Master',
      friendAvatar: '/api/placeholder/32/32',
      type: 'achievement',
      content: 'Earned the "Master Architect" achievement',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      friendId: '2',
      friendName: 'PvP Warrior',
      friendAvatar: '/api/placeholder/32/32',
      type: 'game_start',
      content: 'Started playing on PvP Arena',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      friendId: '5',
      friendName: 'Excited Newcomer',
      friendAvatar: '/api/placeholder/32/32',
      type: 'online',
      content: 'Came online',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
  ];

  const handleAcceptFriendRequest = async (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    // Remove from requests and add to friends
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    
    const newFriend: Friend = {
      id: request.fromUser.id,
      username: request.fromUser.username,
      displayName: request.fromUser.displayName,
      avatar: request.fromUser.avatar,
      status: 'offline',
      lastSeen: new Date().toISOString(),
      mutualFriends: request.mutualFriends,
      relationship: 'friend',
      friendSince: new Date().toISOString(),
      favorited: false,
      notifications: true,
      profile: {
        bio: '',
        level: 1,
        reputation: 50,
        badges: [],
        servers: [],
        achievements: 0
      },
      privacy: {
        showOnlineStatus: true,
        showGameActivity: true,
        allowMessages: true
      }
    };

    setFriends(prev => [newFriend, ...prev]);
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
  };

  const handleRemoveFriend = async (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
  };

  const handleBlockFriend = async (friendId: string) => {
    setFriends(prev => prev.map(friend => 
      friend.id === friendId 
        ? { ...friend, relationship: 'blocked' }
        : friend
    ));
  };

  const handleToggleFavorite = async (friendId: string) => {
    setFriends(prev => prev.map(friend => 
      friend.id === friendId 
        ? { ...friend, favorited: !friend.favorited }
        : friend
    ));
  };

  const handleToggleNotifications = async (friendId: string) => {
    setFriends(prev => prev.map(friend => 
      friend.id === friendId 
        ? { ...friend, notifications: !friend.notifications }
        : friend
    ));
  };

  const handleSendFriendRequest = async () => {
    if (!addFriendInput.trim()) return;

    // Simulate sending friend request
    console.log('Sending friend request to:', addFriendInput);
    setAddFriendInput('');
    setShowAddFriend(false);
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedFriends.size === 0) return;

    const newGroup: FriendGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      friends: Array.from(selectedFriends),
      createdAt: new Date().toISOString()
    };

    setFriendGroups(prev => [newGroup, ...prev]);
    setNewGroupName('');
    setSelectedFriends(new Set());
    setShowCreateGroup(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      case 'invisible': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'online': return <Activity className="w-4 h-4 text-green-500" />;
      case 'offline': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'game_start': return <Gamepad2 className="w-4 h-4 text-blue-500" />;
      case 'game_end': return <Gamepad2 className="w-4 h-4 text-gray-500" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'server_join': return <Users className="w-4 h-4 text-purple-500" />;
      case 'status_change': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
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

  const filteredFriends = friends.filter(friend => {
    const matchesSearch = friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         friend.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || friend.status === statusFilter;
    const matchesGroup = selectedGroup === 'all' || 
                        friendGroups.find(g => g.id === selectedGroup)?.friends.includes(friend.id);
    
    return matchesSearch && matchesStatus && matchesGroup;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading friends..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Friends & Connections
          </h2>
          <p className="text-gray-400">Manage your gaming friendships and social connections</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddFriend(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Friend
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <Users className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'friends', label: 'Friends', icon: Users, count: friends.length },
          { id: 'requests', label: 'Requests', icon: UserPlus, count: friendRequests.length },
          { id: 'activity', label: 'Activity', icon: Activity, count: friendActivity.length },
          { id: 'groups', label: 'Groups', icon: Star, count: friendGroups.length },
          { id: 'suggestions', label: 'Suggestions', icon: Sparkles, count: 5 }
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
              {tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {selectedTab === 'friends' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
            
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Groups</option>
              {friendGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
            </select>
          </div>

          {/* Friends List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.displayName}
                          className="w-12 h-12 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(friend.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-white flex items-center gap-1">
                          {friend.displayName}
                          {friend.favorited && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </h3>
                        <p className="text-sm text-gray-400">@{friend.username}</p>
                      </div>
                    </div>
                    
                    <button className="p-1 text-gray-400 hover:text-white rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Game Status */}
                  {friend.gameStatus && friend.privacy.showGameActivity && (
                    <div className="mb-3 p-2 bg-gray-700 rounded text-sm">
                      <div className="flex items-center gap-2 text-green-400">
                        <Gamepad2 className="w-4 h-4" />
                        <span>{friend.gameStatus.game}</span>
                      </div>
                      <div className="text-gray-300">{friend.gameStatus.activity}</div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="text-center">
                      <div className="text-white font-medium">{friend.profile.level}</div>
                      <div className="text-gray-400">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-medium">{friend.profile.reputation}</div>
                      <div className="text-gray-400">Rep</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onMessageFriend?.(friend.id)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                    >
                      Message
                    </button>
                    <button
                      onClick={() => onViewProfile?.(friend.id)}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm transition-colors"
                    >
                      Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={friend.avatar}
                          alt={friend.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(friend.status)}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{friend.displayName}</h3>
                          <span className="text-gray-400 text-sm">@{friend.username}</span>
                          {friend.favorited && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        
                        {friend.gameStatus && friend.privacy.showGameActivity ? (
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Gamepad2 className="w-3 h-3" />
                            <span>{friend.gameStatus.activity} on {friend.gameStatus.server}</span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">
                            Last seen {formatTimeAgo(friend.lastSeen)}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="text-center">
                          <div className="text-white font-medium">{friend.profile.level}</div>
                          <div>Level</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-medium">{friend.mutualFriends}</div>
                          <div>Mutual</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(friend.id)}
                        className={`p-2 rounded transition-colors ${
                          friend.favorited 
                            ? 'text-yellow-500 hover:text-yellow-400' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${friend.favorited ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => onMessageFriend?.(friend.id)}
                        className="p-2 text-gray-400 hover:text-blue-400 rounded transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 text-gray-400 hover:text-white rounded transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredFriends.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No friends found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || selectedGroup !== 'all'
                  ? 'No friends match your current filters.'
                  : 'Start building your gaming network by adding friends!'}
              </p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'requests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Friend Requests</h3>
            <span className="text-gray-400">{friendRequests.length} pending</span>
          </div>

          {friendRequests.length > 0 ? (
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div key={request.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <img
                        src={request.fromUser.avatar}
                        alt={request.fromUser.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium text-white">{request.fromUser.displayName}</h3>
                        <p className="text-sm text-gray-400">@{request.fromUser.username}</p>
                        <p className="text-sm text-gray-400">{request.mutualFriends} mutual friends</p>
                        {request.message && (
                          <p className="text-sm text-gray-300 mt-2 bg-gray-700 p-2 rounded">
                            "{request.message}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(request.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptFriendRequest(request.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineFriendRequest(request.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        <UserX className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No pending requests</h3>
              <p className="text-gray-500">You're all caught up with friend requests!</p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'activity' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Friend Activity</h3>
          
          {friendActivity.length > 0 ? (
            <div className="space-y-3">
              {friendActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <img
                    src={activity.friendAvatar}
                    alt={activity.friendName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <span className="text-white font-medium">{activity.friendName}</span>
                      <span className="text-gray-300">{activity.content}</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No recent activity</h3>
              <p className="text-gray-500">Your friends haven't been active recently.</p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Friend Groups</h3>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Group
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendGroups.map((group) => (
              <div key={group.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <h4 className="font-medium text-white">{group.name}</h4>
                </div>
                
                <div className="flex -space-x-2 mb-3">
                  {group.friends.slice(0, 5).map((friendId) => {
                    const friend = friends.find(f => f.id === friendId);
                    return friend ? (
                      <img
                        key={friendId}
                        src={friend.avatar}
                        alt={friend.displayName}
                        className="w-8 h-8 rounded-full border-2 border-gray-800"
                        title={friend.displayName}
                      />
                    ) : null;
                  })}
                  {group.friends.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-white">
                      +{group.friends.length - 5}
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-400">
                  {group.friends.length} friends • Created {formatTimeAgo(group.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Add Friend</h3>
              <button
                onClick={() => setShowAddFriend(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Enter username or email"
              value={addFriendInput}
              onChange={(e) => setAddFriendInput(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
            />
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddFriend(false)}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendFriendRequest}
                disabled={!addFriendInput.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Create Friend Group</h3>
              <button
                onClick={() => setShowCreateGroup(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
            />
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Select Friends</h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded">
                    <input
                      type="checkbox"
                      checked={selectedFriends.has(friend.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedFriends);
                        if (e.target.checked) {
                          newSelected.add(friend.id);
                        } else {
                          newSelected.delete(friend.id);
                        }
                        setSelectedFriends(newSelected);
                      }}
                      className="rounded"
                    />
                    <img
                      src={friend.avatar}
                      alt={friend.displayName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white">{friend.displayName}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedFriends.size === 0}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}