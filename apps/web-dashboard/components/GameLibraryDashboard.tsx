'use client';

import { useState, useMemo, useEffect } from 'react';
import { Game, GameFilter, DeploymentState } from '@/types/game';
import SimpleGameCard from '@/components/ui/SimpleGameCard';
// import { httpClient } from '@/lib/http-client';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  TrendingUp, 
  Heart, 
  Zap,
  Users,
  Star,
  ChevronDown,
  X
} from 'lucide-react';

export default function GameLibraryDashboard() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<GameFilter>({});
  const [deploymentStates, setDeploymentStates] = useState<DeploymentState[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch games from API (with fallback to mock data)
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // Use mock data for demonstration (API not available)
        const mockGames: Game[] = [
            {
              id: 'valheim',
              title: 'Valheim',
              description: 'A brutal exploration and survival game for 1-10 players, set in a procedurally-generated purgatory inspired by viking culture.',
              artwork: '',
              difficulty: 'Easy' as const,
              maxPlayers: 10,
              recommendedPlayers: '2-10',
              setupTime: '5 min',
              popularityScore: 95,
              communityServerCount: 1247,
              isTrending: true,
              isPopularWithFriends: true,
              tags: ['Survival', 'Open World', 'Viking', 'Co-op'],
              steamId: '892970',
              requirements: {
                ram: '4GB',
                storage: '1GB',
                network: 'Broadband'
              }
            },
            {
              id: 'rust',
              title: 'Rust',
              description: 'The only aim in Rust is to survive. Everything wants you to die - the island\'s wildlife and other inhabitants, the environment, other survivors.',
              artwork: '',
              difficulty: 'Hard' as const,
              maxPlayers: 200,
              recommendedPlayers: '10-200',
              setupTime: '15 min',
              popularityScore: 88,
              communityServerCount: 892,
              isTrending: false,
              isPopularWithFriends: true,
              tags: ['Survival', 'PvP', 'Building', 'Multiplayer'],
              steamId: '252490',
              requirements: {
                ram: '8GB',
                storage: '20GB',
                network: 'Broadband'
              }
            },
            {
              id: 'cs2',
              title: 'Counter-Strike 2',
              description: 'The legendary competitive shooter is back with updated gameplay and enhanced graphics.',
              artwork: '',
              difficulty: 'Medium' as const,
              maxPlayers: 32,
              recommendedPlayers: '10-32',
              setupTime: '8 min',
              popularityScore: 92,
              communityServerCount: 2156,
              isTrending: true,
              isPopularWithFriends: false,
              tags: ['FPS', 'Competitive', 'Team-based', 'Tactical'],
              steamId: '730',
              requirements: {
                ram: '4GB',
                storage: '85GB',
                network: 'Broadband'
              }
            }
        ];
        
        setGames(mockGames);
        
        setError(null);
      } catch (err) {
        console.error('Failed to load games:', err);
        setError('Failed to load games. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [searchTerm, filter.difficulty]);

  const filteredGames = useMemo(() => {
    let filteredGames = [...games];

    // Apply player count filter (search is handled by API)
    if (filter.playerCount) {
      filteredGames = filteredGames.filter(game => {
        const maxPlayers = game.maxPlayers;
        switch (filter.playerCount) {
          case 'Small': return maxPlayers <= 10;
          case 'Medium': return maxPlayers > 10 && maxPlayers <= 50;
          case 'Large': return maxPlayers > 50;
          default: return true;
        }
      });
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'popularity':
        filteredGames.sort((a, b) => b.popularityScore - a.popularityScore);
        break;
      case 'difficulty':
        filteredGames.sort((a, b) => {
          const diffOrder = { Easy: 1, Medium: 2, Hard: 3 };
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        });
        break;
      case 'trending':
        filteredGames.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
        break;
      case 'alphabetical':
        filteredGames.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        filteredGames.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    return filteredGames;
  }, [games, filter]);

  const handleDeploy = async (gameId: string) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    // Simple deployment simulation for demo
    alert(`Deploying ${game.title} server! This is a demo - no actual server will be created.`);
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.keys(filter).length > 0 || searchTerm;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Deploy Your First Server
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Friends playing in minutes. No technical knowledge required. Just pick a game and click deploy.
            </p>
            <div className="flex items-center justify-center gap-6 text-indigo-200">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                <span>One-click setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Auto-optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>10k+ happy hosts</span>
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
                placeholder="Search games..."
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
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={filter.difficulty || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, difficulty: e.target.value as any || undefined }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                {/* Player Count Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Player Count</label>
                  <select
                    value={filter.playerCount || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, playerCount: e.target.value as any || undefined }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Sizes</option>
                    <option value="Small">Small (2-10)</option>
                    <option value="Medium">Medium (10-50)</option>
                    <option value="Large">Large (50+)</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filter.sortBy || 'popularity'}
                    onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as any || 'popularity' }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="difficulty">Difficulty</option>
                    <option value="trending">Trending</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter({ sortBy: 'trending' })}
              className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Trending Now
            </button>
            <button
              onClick={() => setFilter({ sortBy: 'popularity' })}
              className="flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-800 rounded-full hover:bg-pink-200 transition-colors"
            >
              <Heart className="w-4 h-4" />
              Popular with Friends
            </button>
            <button
              onClick={() => setFilter({ difficulty: 'Easy' })}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Easy Setup
            </button>
          </div>
        </div>

        {/* Game Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {hasActiveFilters ? 'Filtered Results' : 'All Games'}
            </h2>
            {!loading && (
              <span className="text-sm text-gray-600">
                {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading games...</h3>
              <p className="text-gray-600">Fetching the latest game library</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-4">
                <X className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load games</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No games found</h3>
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
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredGames.map((game) => (
                <SimpleGameCard
                  key={game.id}
                  game={game}
                  onDeploy={handleDeploy}
                  deploymentState={deploymentStates.find(state => state.gameId === game.id)}
                  className={viewMode === 'list' ? 'flex-row' : ''}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}