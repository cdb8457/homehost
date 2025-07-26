'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { communitiesApi, Community } from '@/lib/api';
import CommunityCard from '@/components/ui/CommunityCard';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star,
  Users,
  TrendingUp,
  Heart,
  Trophy,
  Coffee,
  ChevronDown,
  X,
  Gamepad2,
  Globe,
  UserPlus,
  SlidersHorizontal,
  ArrowUpDown,
  Bell,
  MessageCircle,
  Calendar,
  Clock,
  Zap,
  UserCheck,
  Sparkles,
  Flame,
  Activity,
  PlayCircle,
  MapPin,
  Hash,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Plus
} from 'lucide-react';

interface CommunityFilter {
  games?: string[];
  memberCount?: 'small' | 'medium' | 'large' | 'massive';
  joinType?: 'open' | 'application' | 'invite_only';
  region?: string;
  activity?: 'very_active' | 'active' | 'moderate' | 'quiet';
  showFriendsOnly?: boolean;
  sortBy?: 'relevance' | 'members' | 'activity' | 'rating' | 'newest';
}

const COMMUNITY_CATEGORIES = [
  {
    id: 'featured',
    title: 'Featured',
    communities: []
  },
  {
    id: 'trending',
    title: 'Trending',
    communities: []
  },
  {
    id: 'friends-playing',
    title: 'Friends Playing',
    communities: []
  },
  {
    id: 'new-member-friendly',
    title: 'New Member Friendly',
    communities: []
  },
  {
    id: 'competitive',
    title: 'Competitive',
    communities: []
  },
  {
    id: 'casual',
    title: 'Casual',
    communities: []
  }
];

interface CommunityBrowserProps {
  showAdminView?: boolean;
}

export default function CommunityBrowser({ showAdminView = false }: CommunityBrowserProps) {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<CommunityFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSocialFeed, setShowSocialFeed] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await communitiesApi.getPublicCommunities();
      
      if (response.success) {
        setCommunities(response.data.communities);
      } else {
        setError(response.error?.message || 'Failed to load communities');
      }
    } catch (err) {
      setError('Failed to load communities');
      console.error('Error loading communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommunities = useMemo(() => {
    let filteredList = [...communities];

    // Apply search filter
    if (searchTerm) {
      filteredList = filteredList.filter(community => 
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (community.tags && community.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        community.game.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      switch (selectedCategory) {
        case 'featured':
          filteredList = filteredList.filter(community => community.featured);
          break;
        case 'trending':
          filteredList = filteredList.sort((a, b) => b.memberCount - a.memberCount).slice(0, 20);
          break;
        case 'new-member-friendly':
          filteredList = filteredList.filter(community => community.joinType === 'open');
          break;
        case 'competitive':
          filteredList = filteredList.filter(community => 
            community.description.toLowerCase().includes('competitive') ||
            community.description.toLowerCase().includes('tournament') ||
            community.description.toLowerCase().includes('esports')
          );
          break;
        case 'casual':
          filteredList = filteredList.filter(community => 
            community.description.toLowerCase().includes('casual') ||
            community.description.toLowerCase().includes('friendly') ||
            community.description.toLowerCase().includes('fun')
          );
          break;
      }
    }

    // Apply game filter
    if (filter.games && filter.games.length > 0) {
      filteredList = filteredList.filter(community =>
        filter.games!.some(game => community.game === game)
      );
    }

    // Apply member count filter
    if (filter.memberCount) {
      filteredList = filteredList.filter(community => {
        const count = community.memberCount;
        switch (filter.memberCount) {
          case 'small': return count <= 100;
          case 'medium': return count > 100 && count <= 500;
          case 'large': return count > 500 && count <= 1000;
          case 'massive': return count > 1000;
          default: return true;
        }
      });
    }

    // Apply join type filter
    if (filter.joinType) {
      filteredList = filteredList.filter(community => community.joinType === filter.joinType);
    }

    // Apply region filter
    if (filter.region) {
      filteredList = filteredList.filter(community => community.region === filter.region);
    }

    // Apply activity filter
    if (filter.activity) {
      filteredList = filteredList.filter(community => {
        const activityRatio = (community.onlineMembers || 0) / community.memberCount;
        switch (filter.activity) {
          case 'very_active': return activityRatio > 0.2;
          case 'active': return activityRatio > 0.1 && activityRatio <= 0.2;
          case 'moderate': return activityRatio > 0.05 && activityRatio <= 0.1;
          case 'quiet': return activityRatio <= 0.05;
          default: return true;
        }
      });
    }

    // Apply friends filter (simplified for now)
    if (filter.showFriendsOnly) {
      filteredList = filteredList.filter(community => community.memberCount > 50);
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'members':
        filteredList.sort((a, b) => b.memberCount - a.memberCount);
        break;
      case 'activity':
        filteredList.sort((a, b) => ((b.onlineMembers || 0) / b.memberCount) - ((a.onlineMembers || 0) / a.memberCount));
        break;
      case 'newest':
        filteredList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Default relevance sort - featured first, then by member count
        filteredList.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.memberCount - a.memberCount;
        });
    }

    return filteredList;
  }, [searchTerm, filter, selectedCategory, communities]);

  const handleJoin = async (communityId: string, joinType: string) => {
    if (!isAuthenticated()) {
      alert('Please sign in to join communities');
      return;
    }

    const community = communities.find(c => c.id === communityId);
    if (!community) return;

    try {
      setJoinLoading(communityId);
      
      const response = await communitiesApi.joinCommunity(communityId);
      
      if (response.success) {
        alert(`Successfully joined ${community.name}!`);
        // Refresh communities to update join status
        await loadCommunities();
      } else {
        switch (joinType) {
          case 'open':
            alert(response.error?.message || `Failed to join ${community.name}`);
            break;
          case 'application':
            alert(`Application submitted to ${community.name}! You'll hear back within 24 hours.`);
            break;
          case 'invite_only':
            alert(`${community.name} is invite-only. Ask a member for an invitation!`);
            break;
        }
      }
    } catch (error) {
      alert(`Error joining ${community.name}`);
      console.error('Join error:', error);
    } finally {
      setJoinLoading(null);
    }
  };

  const handleViewDetails = (communityId: string) => {
    window.location.href = `/app/communities/${communityId}`;
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = Object.keys(filter).length > 0 || searchTerm || selectedCategory !== 'all';

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'featured': return <Star className="w-4 h-4" />;
      case 'friends-playing': return <Users className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'new-member-friendly': return <Heart className="w-4 h-4" />;
      case 'competitive': return <Trophy className="w-4 h-4" />;
      case 'casual': return <Coffee className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading communities...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCommunities}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Discover Gaming Communities
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Find your tribe. Join servers through communities, not IP addresses. Connect with friends and discover new gaming experiences.
            </p>
            <div className="flex items-center justify-center gap-6 text-indigo-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Social discovery</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>Friends & recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>Verified communities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Games Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Games</label>
                  <select
                    value={filter.games?.[0] || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      games: e.target.value ? [e.target.value] : undefined 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Games</option>
                    {/* Dynamic game options based on available communities */}
                    {Array.from(new Set(communities.map(c => c.game))).map(game => (
                      <option key={game} value={game}>{game}</option>
                    ))}
                  </select>
                </div>

                {/* Community Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Community Size</label>
                  <select
                    value={filter.memberCount || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      memberCount: e.target.value as any || undefined 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Sizes</option>
                    <option value="small">Small (≤100)</option>
                    <option value="medium">Medium (100-500)</option>
                    <option value="large">Large (500-1K)</option>
                    <option value="massive">Massive (1K+)</option>
                  </select>
                </div>

                {/* Join Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Join Type</label>
                  <select
                    value={filter.joinType || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      joinType: e.target.value as any || undefined 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Types</option>
                    <option value="open">Open</option>
                    <option value="application">Application Required</option>
                    <option value="invite_only">Invite Only</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filter.sortBy || 'relevance'}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      sortBy: e.target.value as any || 'relevance' 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="members">Most Members</option>
                    <option value="activity">Most Active</option>
                    <option value="rating">Highest Rated</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filter.showFriendsOnly || false}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      showFriendsOnly: e.target.checked || undefined 
                    }))}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">Show only communities with friends</span>
                </label>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Social Activity Feed Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSocialFeed(!showSocialFeed)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showSocialFeed
                  ? 'bg-pink-100 text-pink-700 border border-pink-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Social Activity</span>
              {showSocialFeed && <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">Live</span>}
            </button>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showRecommendations
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Recommendations</span>
            </button>
          </div>
        </div>

        {/* Social Activity Feed */}
        {showSocialFeed && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-pink-600" />
                Friend Activity
              </h3>
              <span className="text-sm text-gray-500">Last 24 hours</span>
            </div>
            <div className="space-y-4">
              {/* Mock social activities */}
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    <span className="font-semibold">Alex Johnson</span> joined <span className="font-semibold">Viking Legends</span>
                  </p>
                  <p className="text-xs text-green-700">2 hours ago</p>
                </div>
                <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                  Join too
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    <span className="font-semibold">Sarah Chen</span> started playing in <span className="font-semibold">Motorsport Elite</span>
                  </p>
                  <p className="text-xs text-blue-700">45 minutes ago</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Join game
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    <span className="font-semibold">Mike Wilson</span> rated <span className="font-semibold">Tactical Strike Force</span> 5 stars
                  </p>
                  <p className="text-xs text-yellow-700">1 hour ago</p>
                </div>
                <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                  Check out
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">
                    <span className="font-semibold">The Casual Collective</span> is hosting a game night
                  </p>
                  <p className="text-xs text-purple-700">Starting in 30 minutes</p>
                </div>
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Join event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Smart Recommendations */}
        {showRecommendations && (
          <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Recommended for You
              </h3>
              <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                AI-Powered
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Gaming style match */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Perfect Match</h4>
                    <p className="text-sm text-purple-600">95% compatibility</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Based on your preference for <span className="font-medium">co-op survival games</span> and <span className="font-medium">friendly communities</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Viking Legends
                  </span>
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    Casual Collective
                  </span>
                </div>
              </div>

              {/* Friend recommendations */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Friend Hotspots</h4>
                    <p className="text-sm text-green-600">Where your friends are</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">8 friends</span> are active in these communities right now
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Tactical Strike (5)
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Viking Legends (3)
                  </span>
                </div>
              </div>

              {/* Trending in your area */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Fire className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Trending Nearby</h4>
                    <p className="text-sm text-orange-600">In North America</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">+250% growth</span> in your region this week
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Zombie Apocalypse
                  </span>
                </div>
              </div>

              {/* New player friendly */}
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Welcoming Communities</h4>
                    <p className="text-sm text-pink-600">New member friendly</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Communities with <span className="font-medium">excellent onboarding</span> and <span className="font-medium">mentorship programs</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                    4.9★ rated
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    Instant join
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Events Bar */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Live Events Happening Now</h3>
                <p className="text-sm text-blue-100">Join the action across communities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{Math.floor(Math.random() * 5) + 1}</div>
                <div className="text-xs text-blue-100">Tournaments</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{Math.floor(Math.random() * 15) + 5}</div>
                <div className="text-xs text-blue-100">Events</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{communities.reduce((sum, c) => sum + (c.onlineMembers || 0), 0)}</div>
                <div className="text-xs text-blue-100">Playing</div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 whitespace-nowrap">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">CS2 Tournament Finals</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Live</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 whitespace-nowrap">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Valheim Raid Night</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">30 min</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 whitespace-nowrap">
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Casual Game Night</span>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Starting</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-3 pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              All Communities
            </button>
            {COMMUNITY_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {getCategoryIcon(category.id)}
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' 
              ? (hasActiveFilters ? 'Filtered Results' : 'All Communities')
              : COMMUNITY_CATEGORIES.find(c => c.id === selectedCategory)?.title
            }
          </h2>
          <span className="text-sm text-gray-600">
            {filteredCommunities.length} communit{filteredCommunities.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {/* Community Grid */}
        {filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={handleJoin}
                onViewDetails={handleViewDetails}
                showAdminView={showAdminView && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN')}
                className={viewMode === 'list' ? 'flex-row' : ''}
                joinLoading={joinLoading === community.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}