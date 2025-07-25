'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  User,
  Users,
  Trophy,
  Calendar,
  Camera,
  Video,
  FileText,
  Map,
  Gamepad2,
  Star,
  Award,
  Target,
  Activity,
  Clock,
  Pin,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Upload,
  Image,
  Send,
  Smile,
  AtSign,
  Hash,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Zap,
  Fire,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface FeedPost {
  id: string;
  type: 'text' | 'image' | 'video' | 'poll' | 'achievement' | 'event' | 'server_update' | 'build_showcase';
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    badges: string[];
    verified: boolean;
  };
  content: {
    text?: string;
    media?: MediaItem[];
    poll?: Poll;
    achievement?: Achievement;
    event?: Event;
    build?: BuildShowcase;
  };
  metadata: {
    serverId?: string;
    serverName?: string;
    gameType?: string;
    location?: string;
    tags?: string[];
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    reactions: Record<string, number>;
  };
  userInteraction: {
    liked: boolean;
    bookmarked: boolean;
    reaction?: string;
  };
  visibility: 'public' | 'friends' | 'server' | 'private';
  createdAt: string;
  editedAt?: string;
  pinned: boolean;
  trending: boolean;
}

interface MediaItem {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnail?: string;
  caption?: string;
  metadata?: {
    width: number;
    height: number;
    duration?: number;
    size: number;
  };
}

interface Poll {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  endsAt: string;
  totalVotes: number;
  userVoted: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

interface Achievement {
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  category: string;
}

interface Event {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  type: 'tournament' | 'community' | 'building' | 'pvp';
  participants: number;
  maxParticipants: number;
}

interface BuildShowcase {
  title: string;
  description: string;
  images: string[];
  buildTime: string;
  materials: string[];
  coordinates?: string;
}

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    avatar: string;
  };
  content: string;
  likes: number;
  replies: Comment[];
  createdAt: string;
  userLiked: boolean;
}

interface SocialFeedProps {
  feedType?: 'global' | 'friends' | 'server' | 'personal';
  serverId?: string;
  userId?: string;
  maxPosts?: number;
}

export default function SocialFeed({
  feedType = 'global',
  serverId,
  userId,
  maxPosts = 20
}: SocialFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const apiClient = new ApiClient();
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeedPosts();
  }, [feedType, serverId, userId]);

  const loadFeedPosts = async (refresh = true) => {
    try {
      if (refresh) {
        setLoading(true);
        setError(null);
      }

      // Simulate loading feed posts
      const mockPosts = generateMockFeedPosts();
      setPosts(refresh ? mockPosts : prev => [...prev, ...mockPosts]);
      setHasMore(mockPosts.length === maxPosts);
    } catch (err) {
      setError('Failed to load feed posts');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const generateMockFeedPosts = (): FeedPost[] => [
    {
      id: '1',
      type: 'build_showcase',
      author: {
        id: 'user1',
        username: 'MasterBuilder',
        displayName: 'Master Builder',
        avatar: '/api/placeholder/40/40',
        badges: ['builder', 'verified'],
        verified: true
      },
      content: {
        text: 'Just finished my latest project - a massive medieval castle with working drawbridge! Took me 3 weeks but totally worth it. What do you think?',
        media: [
          {
            type: 'image',
            url: '/api/placeholder/600/400',
            caption: 'The main castle view',
            metadata: { width: 1920, height: 1080, size: 2500000 }
          },
          {
            type: 'image',
            url: '/api/placeholder/600/400',
            caption: 'Interior throne room',
            metadata: { width: 1920, height: 1080, size: 2200000 }
          }
        ],
        build: {
          title: 'Medieval Castle Complex',
          description: 'A fully functional medieval castle with towers, walls, and interior rooms',
          images: ['/api/placeholder/300/200', '/api/placeholder/300/200'],
          buildTime: '3 weeks',
          materials: ['Stone Bricks', 'Oak Wood', 'Iron Blocks', 'Glass'],
          coordinates: 'X: 1250, Z: -890'
        }
      },
      metadata: {
        serverId: 'server1',
        serverName: 'Creative Builders',
        gameType: 'Minecraft',
        tags: ['medieval', 'castle', 'creative', 'showcase']
      },
      engagement: {
        likes: 234,
        comments: 45,
        shares: 12,
        views: 1567,
        reactions: { heart: 180, fire: 34, wow: 20 }
      },
      userInteraction: {
        liked: false,
        bookmarked: false
      },
      visibility: 'public',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      pinned: false,
      trending: true
    },
    {
      id: '2',
      type: 'achievement',
      author: {
        id: 'user2',
        username: 'PvPWarrior',
        displayName: 'PvP Warrior',
        avatar: '/api/placeholder/40/40',
        badges: ['pvp', 'champion'],
        verified: false
      },
      content: {
        text: 'Finally reached 100 PvP victories! The grind was real but the Champion badge makes it all worth it 🏆',
        achievement: {
          title: 'PvP Champion',
          description: 'Win 100 PvP battles',
          icon: '⚔️',
          rarity: 'epic',
          earnedAt: new Date().toISOString(),
          category: 'Combat'
        }
      },
      metadata: {
        serverId: 'server2',
        serverName: 'PvP Arena',
        gameType: 'Minecraft',
        tags: ['pvp', 'achievement', 'champion']
      },
      engagement: {
        likes: 156,
        comments: 23,
        shares: 8,
        views: 890,
        reactions: { fire: 89, clap: 45, trophy: 22 }
      },
      userInteraction: {
        liked: true,
        bookmarked: false,
        reaction: 'fire'
      },
      visibility: 'public',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      pinned: false,
      trending: false
    },
    {
      id: '3',
      type: 'event',
      author: {
        id: 'user3',
        username: 'EventHost',
        displayName: 'Community Event Host',
        avatar: '/api/placeholder/40/40',
        badges: ['moderator', 'event_organizer'],
        verified: true
      },
      content: {
        text: '🎉 Announcing our biggest building competition yet! Theme: "Futuristic Cities" - show us your vision of the future!',
        event: {
          title: 'Futuristic Cities Building Competition',
          description: 'Create the most innovative futuristic city design',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'building',
          participants: 67,
          maxParticipants: 200
        }
      },
      metadata: {
        serverId: 'server1',
        serverName: 'Creative Builders',
        gameType: 'Minecraft',
        tags: ['event', 'competition', 'building', 'futuristic']
      },
      engagement: {
        likes: 89,
        comments: 34,
        shares: 15,
        views: 567,
        reactions: { heart: 45, excited: 32, thinking: 12 }
      },
      userInteraction: {
        liked: false,
        bookmarked: true
      },
      visibility: 'public',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      pinned: true,
      trending: false
    },
    {
      id: '4',
      type: 'poll',
      author: {
        id: 'user4',
        username: 'CommunityManager',
        displayName: 'Community Manager',
        avatar: '/api/placeholder/40/40',
        badges: ['admin', 'community'],
        verified: true
      },
      content: {
        text: 'What type of event would you like to see next month? Your vote helps us plan better community activities!',
        poll: {
          question: 'Next month\'s community event theme?',
          options: [
            { id: '1', text: 'PvP Tournament', votes: 45, percentage: 35 },
            { id: '2', text: 'Building Contest', votes: 52, percentage: 40 },
            { id: '3', text: 'Treasure Hunt', votes: 23, percentage: 18 },
            { id: '4', text: 'Roleplay Event', votes: 9, percentage: 7 }
          ],
          allowMultiple: false,
          endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalVotes: 129,
          userVoted: false
        }
      },
      metadata: {
        serverId: 'server1',
        serverName: 'Creative Builders',
        gameType: 'Minecraft',
        tags: ['poll', 'community', 'events']
      },
      engagement: {
        likes: 67,
        comments: 18,
        shares: 5,
        views: 234,
        reactions: { thinking: 34, heart: 23, thumbsup: 10 }
      },
      userInteraction: {
        liked: false,
        bookmarked: false
      },
      visibility: 'public',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      pinned: false,
      trending: false
    },
    {
      id: '5',
      type: 'text',
      author: {
        id: 'user5',
        username: 'NewPlayer',
        displayName: 'Excited Newcomer',
        avatar: '/api/placeholder/40/40',
        badges: ['newcomer'],
        verified: false
      },
      content: {
        text: 'Just joined this amazing community! 😍 Everyone has been so welcoming and helpful. Can\'t wait to start building and making new friends! Any tips for a beginner?'
      },
      metadata: {
        serverId: 'server1',
        serverName: 'Creative Builders',
        gameType: 'Minecraft',
        tags: ['introduction', 'newcomer', 'help']
      },
      engagement: {
        likes: 23,
        comments: 12,
        shares: 2,
        views: 156,
        reactions: { heart: 15, welcome: 8 }
      },
      userInteraction: {
        liked: false,
        bookmarked: false
      },
      visibility: 'public',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      pinned: false,
      trending: false
    }
  ];

  const handleLikePost = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const wasLiked = post.userInteraction.liked;
        return {
          ...post,
          engagement: {
            ...post.engagement,
            likes: wasLiked ? post.engagement.likes - 1 : post.engagement.likes + 1
          },
          userInteraction: {
            ...post.userInteraction,
            liked: !wasLiked
          }
        };
      }
      return post;
    }));
  };

  const handleBookmarkPost = async (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          userInteraction: {
            ...post.userInteraction,
            bookmarked: !post.userInteraction.bookmarked
          }
        };
      }
      return post;
    }));
  };

  const handleSharePost = async (postId: string) => {
    // Copy post link to clipboard
    await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          engagement: {
            ...post.engagement,
            shares: post.engagement.shares + 1
          }
        };
      }
      return post;
    }));
  };

  const handleVotePoll = async (postId: string, optionId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.content.poll) {
        const poll = post.content.poll;
        if (poll.userVoted) return post;

        const updatedOptions = poll.options.map(option => {
          if (option.id === optionId) {
            return { ...option, votes: option.votes + 1 };
          }
          return option;
        });

        const totalVotes = updatedOptions.reduce((sum, option) => sum + option.votes, 0);
        const optionsWithPercentage = updatedOptions.map(option => ({
          ...option,
          percentage: Math.round((option.votes / totalVotes) * 100)
        }));

        return {
          ...post,
          content: {
            ...post.content,
            poll: {
              ...poll,
              options: optionsWithPercentage,
              totalVotes,
              userVoted: true
            }
          }
        };
      }
      return post;
    }));
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    const newPost: FeedPost = {
      id: Date.now().toString(),
      type: 'text',
      author: {
        id: 'current_user',
        username: 'CurrentUser',
        displayName: 'You',
        avatar: '/api/placeholder/40/40',
        badges: [],
        verified: false
      },
      content: {
        text: newPostContent
      },
      metadata: {
        tags: []
      },
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
        views: 0,
        reactions: {}
      },
      userInteraction: {
        liked: false,
        bookmarked: false
      },
      visibility: 'public',
      createdAt: new Date().toISOString(),
      pinned: false,
      trending: false
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setShowCreatePost(false);
  };

  const togglePostExpansion = (postId: string) => {
    setExpandedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleCommentsExpansion = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'image': return <Camera className="w-4 h-4 text-green-500" />;
      case 'video': return <Video className="w-4 h-4 text-red-500" />;
      case 'poll': return <Target className="w-4 h-4 text-purple-500" />;
      case 'achievement': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'event': return <Calendar className="w-4 h-4 text-pink-500" />;
      case 'server_update': return <Gamepad2 className="w-4 h-4 text-orange-500" />;
      case 'build_showcase': return <Award className="w-4 h-4 text-cyan-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'builder': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'pvp': return <Trophy className="w-4 h-4 text-red-500" />;
      case 'moderator': return <Star className="w-4 h-4 text-purple-500" />;
      case 'admin': return <Star className="w-4 h-4 text-red-500" />;
      default: return null;
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

  const filteredPosts = posts.filter(post => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'trending') return post.trending;
    if (selectedFilter === 'pinned') return post.pinned;
    return post.type === selectedFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading social feed..." />
      </div>
    );
  }

  return (
    <div className="space-y-6" ref={feedRef}>
      {/* Feed Controls */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Social Feed</h2>
            {feedType === 'global' && <Globe className="w-5 h-5 text-blue-400" />}
            {feedType === 'friends' && <Users className="w-5 h-5 text-green-400" />}
            {feedType === 'server' && <Gamepad2 className="w-5 h-5 text-purple-400" />}
            {feedType === 'personal' && <User className="w-5 h-5 text-orange-400" />}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
            <button
              onClick={() => loadFeedPosts(true)}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'all', label: 'All Posts', icon: Activity },
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'pinned', label: 'Pinned', icon: Pin },
            { id: 'build_showcase', label: 'Builds', icon: Award },
            { id: 'achievement', label: 'Achievements', icon: Trophy },
            { id: 'event', label: 'Events', icon: Calendar },
            { id: 'poll', label: 'Polls', icon: Target }
          ].map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <IconComponent className="w-3 h-3" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPosts.has(post.id);
          const commentsExpanded = expandedComments.has(post.id);
          
          return (
            <div key={post.id} className="bg-gray-800 rounded-lg border border-gray-700">
              {/* Post Header */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.username}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{post.author.displayName}</h3>
                        <span className="text-gray-400">@{post.author.username}</span>
                        {post.author.badges.map((badge) => getBadgeIcon(badge)).filter(Boolean)}
                        {post.pinned && <Pin className="w-4 h-4 text-yellow-500" />}
                        {post.trending && <Fire className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        {getPostTypeIcon(post.type)}
                        <span>{formatTimeAgo(post.createdAt)}</span>
                        {post.metadata.serverName && (
                          <>
                            <span>•</span>
                            <span>{post.metadata.serverName}</span>
                          </>
                        )}
                        {post.editedAt && (
                          <>
                            <span>•</span>
                            <span>edited</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button className="p-1 text-gray-400 hover:text-white rounded">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-4">
                {/* Text Content */}
                {post.content.text && (
                  <p className="text-gray-300 mb-4 whitespace-pre-wrap">{post.content.text}</p>
                )}

                {/* Media Content */}
                {post.content.media && post.content.media.length > 0 && (
                  <div className="mb-4">
                    {post.content.media.length === 1 ? (
                      <div className="rounded-lg overflow-hidden">
                        {post.content.media[0].type === 'image' ? (
                          <img
                            src={post.content.media[0].url}
                            alt={post.content.media[0].caption || 'Post image'}
                            className="w-full max-h-96 object-cover"
                          />
                        ) : (
                          <video
                            src={post.content.media[0].url}
                            poster={post.content.media[0].thumbnail}
                            controls
                            className="w-full max-h-96"
                          />
                        )}
                        {post.content.media[0].caption && (
                          <p className="text-sm text-gray-400 mt-2">{post.content.media[0].caption}</p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {post.content.media.slice(0, 4).map((media, index) => (
                          <div key={index} className="rounded-lg overflow-hidden relative">
                            <img
                              src={media.url}
                              alt={media.caption || `Post image ${index + 1}`}
                              className="w-full h-32 object-cover"
                            />
                            {index === 3 && post.content.media!.length > 4 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-medium">+{post.content.media!.length - 4}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Poll Content */}
                {post.content.poll && (
                  <div className="mb-4 p-4 bg-gray-700 rounded-lg">
                    <h4 className="font-medium text-white mb-3">{post.content.poll.question}</h4>
                    <div className="space-y-2">
                      {post.content.poll.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => !post.content.poll!.userVoted && handleVotePoll(post.id, option.id)}
                          disabled={post.content.poll!.userVoted}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            post.content.poll!.userVoted
                              ? 'bg-gray-600 cursor-default'
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white">{option.text}</span>
                            <span className="text-gray-300">{option.percentage}%</span>
                          </div>
                          {post.content.poll!.userVoted && (
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                      {post.content.poll.totalVotes} votes • Ends {new Date(post.content.poll.endsAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Achievement Content */}
                {post.content.achievement && (
                  <div className="mb-4 p-4 bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg border border-yellow-600">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{post.content.achievement.icon}</div>
                      <div>
                        <h4 className="font-bold text-yellow-200">{post.content.achievement.title}</h4>
                        <p className="text-yellow-300">{post.content.achievement.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            post.content.achievement.rarity === 'legendary' ? 'bg-orange-800 text-orange-200' :
                            post.content.achievement.rarity === 'epic' ? 'bg-purple-800 text-purple-200' :
                            post.content.achievement.rarity === 'rare' ? 'bg-blue-800 text-blue-200' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {post.content.achievement.rarity}
                          </span>
                          <span className="text-yellow-400 text-xs">{post.content.achievement.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Content */}
                {post.content.event && (
                  <div className="mb-4 p-4 bg-purple-900 bg-opacity-50 rounded-lg border border-purple-600">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-6 h-6 text-purple-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-bold text-purple-200">{post.content.event.title}</h4>
                        <p className="text-purple-300 mb-2">{post.content.event.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-purple-400">Start:</span>
                            <div className="text-white">{new Date(post.content.event.startTime).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-purple-400">Participants:</span>
                            <div className="text-white">{post.content.event.participants}/{post.content.event.maxParticipants}</div>
                          </div>
                        </div>
                        <button className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                          Join Event
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Build Showcase Content */}
                {post.content.build && (
                  <div className="mb-4 p-4 bg-cyan-900 bg-opacity-50 rounded-lg border border-cyan-600">
                    <h4 className="font-bold text-cyan-200 mb-2">{post.content.build.title}</h4>
                    <p className="text-cyan-300 mb-3">{post.content.build.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-cyan-400">Build Time:</span>
                        <div className="text-white">{post.content.build.buildTime}</div>
                      </div>
                      <div>
                        <span className="text-cyan-400">Location:</span>
                        <div className="text-white">{post.content.build.coordinates}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-cyan-400 text-sm">Materials:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.content.build.materials.map((material, index) => (
                          <span key={index} className="px-2 py-1 bg-cyan-800 text-cyan-200 text-xs rounded">
                            {material}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post.metadata.tags && post.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {post.metadata.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-blue-900 text-blue-200 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-2 transition-colors ${
                        post.userInteraction.liked
                          ? 'text-red-400 hover:text-red-300'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.userInteraction.liked ? 'fill-current' : ''}`} />
                      <span>{post.engagement.likes}</span>
                    </button>
                    
                    <button
                      onClick={() => toggleCommentsExpansion(post.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.engagement.comments}</span>
                    </button>
                    
                    <button
                      onClick={() => handleSharePost(post.id)}
                      className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>{post.engagement.shares}</span>
                    </button>
                    
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye className="w-5 h-5" />
                      <span>{post.engagement.views}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBookmarkPost(post.id)}
                      className={`p-2 rounded transition-colors ${
                        post.userInteraction.bookmarked
                          ? 'text-yellow-400 hover:text-yellow-300'
                          : 'text-gray-400 hover:text-yellow-400'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${post.userInteraction.bookmarked ? 'fill-current' : ''}`} />
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-red-400 rounded transition-colors">
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {commentsExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="space-y-3">
                      {/* Comment Input */}
                      <div className="flex gap-3">
                        <img
                          src="/api/placeholder/32/32"
                          alt="Your avatar"
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Sample Comments */}
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <img
                            src="/api/placeholder/32/32"
                            alt="Commenter"
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-700 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">CommentUser</span>
                                <span className="text-xs text-gray-400">5m ago</span>
                              </div>
                              <p className="text-gray-300">This is amazing! Great work on the build!</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                              <button className="hover:text-red-400 transition-colors">Like</button>
                              <button className="hover:text-blue-400 transition-colors">Reply</button>
                              <span>5 likes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => loadFeedPosts(false)}
            disabled={loadingMore}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading...
              </div>
            ) : (
              'Load More Posts'
            )}
          </button>
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
              placeholder="What's happening?"
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
                  <Target className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-white rounded">
                  <Smile className="w-5 h-5" />
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