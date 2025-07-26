'use client';

import { useState, useMemo, useEffect } from 'react';
import { Community, CommunityFilter } from '@/types/community';
import { homeHostAPI } from '@/lib/homehost-api';
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
  Fire,
  Activity,
  PlayCircle,
  MapPin,
  Hash,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface CommunityBrowserLiveProps {
  showAdminView?: boolean;
  userRole?: 'alex' | 'sam';
}

export default function CommunityBrowserLive({ showAdminView = false, userRole = 'alex' }: CommunityBrowserLiveProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filter, setFilter] = useState<CommunityFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showSocialFeed, setShowSocialFeed] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load communities on mount and when filters change
  useEffect(() => {
    loadCommunities();
  }, [filter]);

  // Check authentication status
  useEffect(() => {
    setIsAuthenticated(homeHostAPI.isAuthenticated());
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      setError(null);

      let apiCommunities: Community[] = [];

      if (selectedCategory === 'trending') {
        apiCommunities = await homeHostAPI.getTrendingCommunities();
      } else if (selectedCategory === 'recommended' && isAuthenticated) {
        apiCommunities = await homeHostAPI.getRecommendedCommunities();
      } else if (searchTerm) {
        apiCommunities = await homeHostAPI.searchCommunities(searchTerm);
      } else {
        // Apply current filter
        const currentFilter = {
          ...filter,
          search: searchTerm || undefined,
        };
        apiCommunities = await homeHostAPI.getCommunities(currentFilter);
      }

      setCommunities(apiCommunities);
    } catch (err) {
      console.error('Failed to load communities:', err);
      setError(`Failed to load communities: ${err.message}`);
      
      // Fallback to empty array
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      await loadCommunities();
    }
  };

  const handleJoin = async (communityId: string, joinType: string) => {
    if (!isAuthenticated) {
      alert('Please log in to join communities');
      return;
    }

    try {
      switch (joinType) {
        case 'open':
          await homeHostAPI.joinCommunity(communityId);
          alert('Successfully joined the community!');
          // Refresh communities to update member count
          await loadCommunities();
          break;
        case 'application':
          alert('Application submitted! You\'ll hear back within 24 hours.');
          break;
        case 'invite_only':
          alert('This community is invite-only. Ask a member for an invitation!');
          break;
      }
    } catch (error) {
      console.error('Failed to join community:', error);
      alert(`Failed to join community: ${error.message}`);
    }
  };

  const handleViewDetails = (communityId: string) => {
    // Navigate to community details page
    window.location.href = `/communities/${communityId}`;
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
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'recommended': return <Sparkles className="w-4 h-4" />;
      case 'friends-playing': return <Users className="w-4 h-4" />;
      case 'new-member-friendly': return <Heart className="w-4 h-4" />;
      case 'competitive': return <Trophy className="w-4 h-4" />;
      case 'casual': return <Coffee className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const categories = [
    { id: 'all', title: 'All Communities' },
    { id: 'trending', title: 'Trending' },
    { id: 'recommended', title: 'Recommended' },
    { id: 'featured', title: 'Featured' },
  ];

  const handleQuickLogin = async () => {
    try {
      await homeHostAPI.login('alex@homehost.com', 'password123');
      setIsAuthenticated(true);
      alert('Logged in successfully!');
      await loadCommunities();
    } catch (error) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

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
                <span>Live API data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Status & Authentication */}
        <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : error ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : (
                  <Activity className="w-5 h-5 text-green-600" />
                )}
                <span className="font-medium">
                  {loading ? 'Loading...' : error ? 'API Error' : 'Connected to API'}
                </span>
              </div>
              
              {!isAuthenticated && (
                <button
                  onClick={handleQuickLogin}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Quick Login (Alex)
                </button>
              )}
              
              {isAuthenticated && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                  Authenticated
                </span>
              )}
            </div>
            
            <button
              onClick={loadCommunities}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          
          {error && (
            <div className="mt-2 p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>

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
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                    <option value="Valheim">Valheim</option>
                    <option value="MotorTown">MotorTown</option>
                    <option value="Counter-Strike 2">Counter-Strike 2</option>
                    <option value="Rust">Rust</option>
                    <option value="7 Days to Die">7 Days to Die</option>
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

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-3 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  loadCommunities();
                }}
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
              : categories.find(c => c.id === selectedCategory)?.title
            }
          </h2>
          <span className="text-sm text-gray-600">
            {loading ? 'Loading...' : `${communities.length} communit${communities.length !== 1 ? 'ies' : 'y'}`}
          </span>
        </div>

        {/* Community Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading communities from API...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load communities</h3>
            <p className="text-gray-600 mb-4">Check that the backend API is running</p>
            <button
              onClick={loadCommunities}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : communities.length === 0 ? (
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
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                onJoin={handleJoin}
                onViewDetails={handleViewDetails}
                showAdminView={showAdminView && userRole === 'sam'}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}