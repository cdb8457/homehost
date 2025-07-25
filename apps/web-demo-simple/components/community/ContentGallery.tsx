'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Image,
  Video,
  Camera,
  Upload,
  Download,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  Star,
  Bookmark,
  Flag,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Fullscreen,
  Grid3X3,
  List,
  Filter,
  Search,
  Calendar,
  Clock,
  User,
  Users,
  Trophy,
  Award,
  Target,
  Gamepad2,
  MapPin,
  Globe,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Crop,
  Palette,
  Layers,
  FileText,
  FolderPlus,
  Folder,
  Tag,
  Hash,
  AtSign,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Info,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Sparkles,
  Zap,
  Fire,
  Crown,
  Shield,
  Lightbulb
} from 'lucide-react';

interface MediaItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video' | 'audio' | 'model_3d' | 'screenshot' | 'build_timelapse' | 'tutorial';
  url: string;
  thumbnailUrl: string;
  fileSize: number;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  format: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  uploadedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
    role: 'member' | 'moderator' | 'admin' | 'owner';
  };
  metadata: {
    serverId?: string;
    serverName?: string;
    gameType?: string;
    buildType?: string;
    coordinates?: string;
    software?: string;
    tools?: string[];
    tags: string[];
    category: 'builds' | 'tutorials' | 'screenshots' | 'pvp' | 'events' | 'memes' | 'art' | 'other';
  };
  engagement: {
    views: number;
    likes: number;
    comments: number;
    downloads: number;
    shares: number;
    favorites: number;
    rating: number;
    ratingCount: number;
  };
  userInteraction: {
    liked: boolean;
    favorited: boolean;
    downloaded: boolean;
    rated?: number;
  };
  visibility: 'public' | 'community_only' | 'friends_only' | 'private';
  downloadable: boolean;
  featured: boolean;
  moderated: boolean;
  reported: boolean;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  itemCount: number;
  visibility: 'public' | 'community_only' | 'friends_only' | 'private';
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  tags: string[];
  collaborative: boolean;
  contributors: string[];
  featured: boolean;
}

interface Comment {
  id: string;
  mediaId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  edited: boolean;
  likes: number;
  userLiked: boolean;
  replies: Comment[];
  pinned: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  mediaId?: string;
}

export function ContentGallery() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gallery' | 'collections' | 'uploads' | 'favorites'>('gallery');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
    author: 'all',
    timeRange: 'all',
    quality: 'all',
    tags: [] as string[],
    searchQuery: ''
  });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'trending' | 'rating'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadContent();
  }, [activeTab, filters, sortBy]);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (activeTab === 'gallery') {
        setMediaItems(generateMockMediaItems());
      } else if (activeTab === 'collections') {
        setCollections(generateMockCollections());
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const generateMockMediaItems = (): MediaItem[] => {
    const categories = ['builds', 'tutorials', 'screenshots', 'pvp', 'events', 'memes', 'art'];
    const types = ['image', 'video', 'screenshot', 'build_timelapse', 'tutorial'];
    const gameTypes = ['Minecraft', 'Terraria', 'Valheim', 'Space Engineers', 'No Man\'s Sky'];
    
    return Array.from({ length: 50 }, (_, i) => ({
      id: `media-${i + 1}`,
      title: [
        'Epic Castle Build',
        'PvP Montage',
        'Tutorial: Advanced Redstone',
        'Sunset Screenshot',
        'Base Tour 2024',
        'Funny Moments Compilation',
        'Pixel Art Creation',
        'Server Event Highlights',
        'Build Timelapse',
        'Combat Tips & Tricks'
      ][i % 10],
      description: 'An amazing piece of content showcasing creativity and skill in our gaming community.',
      type: types[i % types.length] as any,
      url: `https://example.com/media/${i + 1}`,
      thumbnailUrl: `https://picsum.photos/400/300?random=${i + 1}`,
      fileSize: Math.floor(Math.random() * 50) + 5,
      dimensions: {
        width: 1920,
        height: 1080
      },
      duration: Math.floor(Math.random() * 300) + 30,
      format: ['jpg', 'png', 'mp4', 'webm', 'gif'][i % 5],
      quality: ['low', 'medium', 'high', 'ultra'][i % 4] as any,
      uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        id: `user-${(i % 10) + 1}`,
        username: ['BuildMaster', 'PvPro', 'RedstoneWiz', 'ScreenshotKing', 'CreativeGenius'][i % 5],
        displayName: ['Build Master', 'PvP Pro', 'Redstone Wizard', 'Screenshot King', 'Creative Genius'][i % 5],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        verified: i % 7 === 0,
        role: ['member', 'moderator', 'admin', 'owner'][i % 4] as any
      },
      metadata: {
        serverId: `server-${(i % 5) + 1}`,
        serverName: ['Creative World', 'PvP Arena', 'Survival Plus', 'Modded Adventures', 'Mini Games'][i % 5],
        gameType: gameTypes[i % gameTypes.length],
        buildType: ['Castle', 'Modern House', 'Pixel Art', 'Redstone Machine', 'Landscape'][i % 5],
        coordinates: `${Math.floor(Math.random() * 1000)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 1000)}`,
        software: ['In-Game', 'OBS Studio', 'Bandicam', 'NVIDIA Shadowplay'][i % 4],
        tools: ['WorldEdit', 'Litematica', 'JEI', 'Optifine'].slice(0, Math.floor(Math.random() * 4) + 1),
        tags: ['epic', 'creative', 'tutorial', 'pvp', 'redstone', 'pixel-art'].slice(0, Math.floor(Math.random() * 4) + 1),
        category: categories[i % categories.length] as any
      },
      engagement: {
        views: Math.floor(Math.random() * 10000) + 100,
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 50) + 1,
        downloads: Math.floor(Math.random() * 200) + 5,
        shares: Math.floor(Math.random() * 100) + 1,
        favorites: Math.floor(Math.random() * 100) + 5,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        ratingCount: Math.floor(Math.random() * 100) + 10
      },
      userInteraction: {
        liked: Math.random() > 0.7,
        favorited: Math.random() > 0.8,
        downloaded: Math.random() > 0.9,
        rated: Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : undefined
      },
      visibility: ['public', 'community_only', 'friends_only'][i % 3] as any,
      downloadable: Math.random() > 0.3,
      featured: Math.random() > 0.9,
      moderated: true,
      reported: Math.random() > 0.95
    }));
  };

  const generateMockCollections = (): Collection[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: `collection-${i + 1}`,
      name: [
        'Best Builds 2024',
        'PvP Highlights',
        'Tutorial Series',
        'Server Screenshots',
        'Epic Moments',
        'Creative Showcase',
        'Redstone Contraptions',
        'Pixel Art Gallery',
        'Event Memories',
        'Community Favorites'
      ][i % 10],
      description: 'A curated collection of amazing content from our community.',
      coverImage: `https://picsum.photos/600/400?random=${i + 100}`,
      itemCount: Math.floor(Math.random() * 50) + 5,
      visibility: ['public', 'community_only', 'friends_only'][i % 3] as any,
      author: {
        id: `user-${(i % 8) + 1}`,
        username: ['Curator', 'Collector', 'Organizer', 'Archivist'][i % 4],
        displayName: ['Content Curator', 'Media Collector', 'Gallery Organizer', 'Community Archivist'][i % 4],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 50}`
      },
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['curated', 'community', 'showcase', 'featured'].slice(0, Math.floor(Math.random() * 3) + 1),
      collaborative: Math.random() > 0.5,
      contributors: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => `user-${j + 1}`),
      featured: Math.random() > 0.8
    }));
  };

  const handleFileUpload = (files: FileList) => {
    const newUploads: UploadProgress[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newUploads]);

    // Simulate upload progress
    newUploads.forEach((upload, index) => {
      const interval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === upload.file
              ? { ...item, progress: Math.min(item.progress + Math.random() * 30, 100) }
              : item
          )
        );
      }, 500);

      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === upload.file
              ? { ...item, progress: 100, status: 'completed', mediaId: `media-new-${Date.now()}-${index}` }
              : item
          )
        );
      }, 3000 + Math.random() * 2000);
    });
  };

  const handleLike = async (mediaId: string) => {
    setMediaItems(prev => 
      prev.map(item => 
        item.id === mediaId
          ? {
              ...item,
              userInteraction: { ...item.userInteraction, liked: !item.userInteraction.liked },
              engagement: { 
                ...item.engagement, 
                likes: item.userInteraction.liked ? item.engagement.likes - 1 : item.engagement.likes + 1 
              }
            }
          : item
      )
    );
  };

  const handleFavorite = async (mediaId: string) => {
    setMediaItems(prev => 
      prev.map(item => 
        item.id === mediaId
          ? {
              ...item,
              userInteraction: { ...item.userInteraction, favorited: !item.userInteraction.favorited },
              engagement: { 
                ...item.engagement, 
                favorites: item.userInteraction.favorited ? item.engagement.favorites - 1 : item.engagement.favorites + 1 
              }
            }
          : item
      )
    );
  };

  const filteredMedia = mediaItems.filter(item => {
    if (filters.category !== 'all' && item.metadata.category !== filters.category) return false;
    if (filters.type !== 'all' && item.type !== filters.type) return false;
    if (filters.searchQuery && !item.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    if (filters.tags.length > 0 && !filters.tags.some(tag => item.metadata.tags.includes(tag))) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'oldest':
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      case 'popular':
        return b.engagement.views - a.engagement.views;
      case 'trending':
        return (b.engagement.likes + b.engagement.comments) - (a.engagement.likes + a.engagement.comments);
      case 'rating':
        return b.engagement.rating - a.engagement.rating;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Gallery</h2>
          <p className="text-gray-600">Share and discover amazing content from the community</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </button>
          <button
            onClick={() => setShowCreateCollection(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Create Collection
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'gallery', name: 'Gallery', icon: Grid3X3 },
            { id: 'collections', name: 'Collections', icon: Folder },
            { id: 'uploads', name: 'My Uploads', icon: Upload },
            { id: 'favorites', name: 'Favorites', icon: Heart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Popular</option>
            <option value="trending">Trending</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="builds">Builds</option>
                <option value="tutorials">Tutorials</option>
                <option value="screenshots">Screenshots</option>
                <option value="pvp">PvP</option>
                <option value="events">Events</option>
                <option value="memes">Memes</option>
                <option value="art">Art</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="screenshot">Screenshots</option>
                <option value="build_timelapse">Timelapses</option>
                <option value="tutorial">Tutorials</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
              <select
                value={filters.timeRange}
                onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={filters.quality}
                onChange={(e) => setFilters(prev => ({ ...prev, quality: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Qualities</option>
                <option value="ultra">Ultra</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      {activeTab === 'gallery' && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {filteredMedia.map(media => (
            <div
              key={media.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                viewMode === 'list' ? 'flex' : ''
              }`}
              onClick={() => setSelectedMedia(media)}
            >
              <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'aspect-video'}`}>
                <img
                  src={media.thumbnailUrl}
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
                {media.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                )}
                {media.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {Math.floor(media.duration / 60)}:{String(media.duration % 60).padStart(2, '0')}
                  </div>
                )}
                {media.featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {media.author.verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500 bg-white rounded-full" />
                  )}
                  {media.quality === 'ultra' && (
                    <div className="bg-purple-500 text-white text-xs px-1 py-0.5 rounded">4K</div>
                  )}
                </div>
              </div>
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">{media.title}</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={media.author.avatar}
                    alt={media.author.displayName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">{media.author.displayName}</span>
                  {media.author.role !== 'member' && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {media.author.role}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{media.engagement.views.toLocaleString()} views</span>
                  <span>{new Date(media.uploadedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(media.id);
                      }}
                      className={`flex items-center space-x-1 text-sm ${
                        media.userInteraction.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${media.userInteraction.liked ? 'fill-current' : ''}`} />
                      <span>{media.engagement.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500">
                      <MessageCircle className="h-4 w-4" />
                      <span>{media.engagement.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-500">
                      <Eye className="h-4 w-4" />
                      <span>{media.engagement.views}</span>
                    </button>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavorite(media.id);
                    }}
                    className={`${
                      media.userInteraction.favorited ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${media.userInteraction.favorited ? 'fill-current' : ''}`} />
                  </button>
                </div>
                {media.metadata.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {media.metadata.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        #{tag}
                      </span>
                    ))}
                    {media.metadata.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{media.metadata.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <div key={collection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div className="aspect-video">
                <img
                  src={collection.coverImage}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                  {collection.featured && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{collection.description}</p>
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={collection.author.avatar}
                    alt={collection.author.displayName}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm text-gray-600">{collection.author.displayName}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{collection.itemCount} items</span>
                  <span>{new Date(collection.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {collection.collaborative && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        Collaborative
                      </span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {collection.visibility}
                    </span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Upload Content</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-gray-500 mb-4">Support for images, videos, and audio files up to 100MB</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Choose Files
                  </button>
                </div>

                {/* Upload Progress */}
                {uploadProgress.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Upload Progress</h4>
                    {uploadProgress.map((upload, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{upload.file.name}</span>
                          <span className="text-sm text-gray-500">{upload.status}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                        {upload.error && (
                          <p className="text-sm text-red-600 mt-2">{upload.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">{selectedMedia.title}</h3>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
                    {selectedMedia.type === 'video' ? (
                      <video
                        src={selectedMedia.url}
                        poster={selectedMedia.thumbnailUrl}
                        controls
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={selectedMedia.thumbnailUrl}
                        alt={selectedMedia.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(selectedMedia.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                          selectedMedia.userInteraction.liked
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${selectedMedia.userInteraction.liked ? 'fill-current' : ''}`} />
                        <span>{selectedMedia.engagement.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-100 hover:text-blue-600">
                        <MessageCircle className="h-4 w-4" />
                        <span>{selectedMedia.engagement.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-green-100 hover:text-green-600">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      {selectedMedia.downloadable && (
                        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-purple-100 hover:text-purple-600">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => handleFavorite(selectedMedia.id)}
                      className={`p-2 rounded-lg ${
                        selectedMedia.userInteraction.favorited
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-600'
                      }`}
                    >
                      <Star className={`h-5 w-5 ${selectedMedia.userInteraction.favorited ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">{selectedMedia.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.metadata.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Author Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={selectedMedia.author.avatar}
                        alt={selectedMedia.author.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{selectedMedia.author.displayName}</h4>
                          {selectedMedia.author.verified && (
                            <CheckCircle className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">@{selectedMedia.author.username}</span>
                      </div>
                    </div>
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Follow
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Statistics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Views:</span>
                        <span className="font-medium">{selectedMedia.engagement.views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Downloads:</span>
                        <span className="font-medium">{selectedMedia.engagement.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">{selectedMedia.engagement.rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">File Size:</span>
                        <span className="font-medium">{selectedMedia.fileSize}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">{selectedMedia.format.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uploaded:</span>
                        <span className="font-medium">{new Date(selectedMedia.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  {selectedMedia.metadata.serverId && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Server Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Server:</span>
                          <span className="font-medium">{selectedMedia.metadata.serverName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Game:</span>
                          <span className="font-medium">{selectedMedia.metadata.gameType}</span>
                        </div>
                        {selectedMedia.metadata.coordinates && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="font-medium">{selectedMedia.metadata.coordinates}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}