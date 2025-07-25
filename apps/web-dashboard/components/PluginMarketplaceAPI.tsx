'use client';

import { useState, useEffect, useMemo } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';
import { pluginsApi } from '@/lib/api/plugins';
import PluginInstallationProgress from './plugins/PluginInstallationProgress';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Zap,
  Shield,
  Users,
  Gamepad2,
  Lock,
  DollarSign,
  Grid,
  List,
  ChevronRight,
  Download,
  CheckCircle,
  Clock,
  Crown,
  SlidersHorizontal,
  X,
  Sparkles,
  Package,
  BarChart3,
  Award,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Target,
  Activity,
  Lightbulb,
  Bookmark,
  Loader2
} from 'lucide-react';

interface SimplePlugin {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  price: number;
  rating: number;
  downloads: number;
  verified: boolean;
  gameTypes: string[];
  tags: string[];
  featured: boolean;
  icon?: string;
  screenshots?: string[];
  requirements?: string[];
  compatibility?: string[];
  lastUpdated: string;
  createdAt: string;
}

interface PluginMarketplaceProps {
  userType?: 'alex' | 'sam' | 'both';
  showMyPlugins?: boolean;
}

export default function PluginMarketplaceAPI({ userType = 'both', showMyPlugins = false }: PluginMarketplaceProps) {
  const [plugins, setPlugins] = useState<SimplePlugin[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'downloads' | 'rating' | 'price' | 'name' | 'newest'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-plugins'>('discover');

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesResponse = await pluginsApi.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data.categories);
        }
      } catch (err) {
        // Categories loading is non-critical, fail silently
      }
    };

    loadCategories();
  }, []);

  // Load plugins when filters change
  useEffect(() => {
    const loadPlugins = async () => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = {
          search: searchTerm || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          price: priceFilter !== 'all' ? priceFilter : undefined,
          sort: sortBy
        };

        const pluginsResponse = await pluginsApi.getPlugins(searchParams);

        if (pluginsResponse.success && pluginsResponse.data) {
          setPlugins(pluginsResponse.data.plugins);
        } else {
          setError(pluginsResponse.error?.message || 'Failed to load plugins');
        }
      } catch (err) {
        setError('Failed to load marketplace data');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(loadPlugins, searchTerm ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory, priceFilter, sortBy]);

  const [installingPlugins, setInstallingPlugins] = useState<Set<string>>(new Set());

  const handleInstall = async (pluginId: string) => {
    try {
      setInstallingPlugins(prev => new Set(prev).add(pluginId));
      
      // For demo purposes, we'll assume first server ID = '1'
      const response = await pluginsApi.installPlugin(pluginId, { serverId: '1' });
      if (response.success) {
        // Installation started, progress will be tracked via WebSocket
        // Keep the plugin in installing state until completion
      } else {
        alert(`Failed to install plugin: ${response.error?.message}`);
        setInstallingPlugins(prev => {
          const newSet = new Set(prev);
          newSet.delete(pluginId);
          return newSet;
        });
      }
    } catch (err) {
      alert('Failed to install plugin. Please try again.');
      setInstallingPlugins(prev => {
        const newSet = new Set(prev);
        newSet.delete(pluginId);
        return newSet;
      });
    }
  };

  const handleInstallationComplete = (pluginId: string, serverId: string) => {
    setInstallingPlugins(prev => {
      const newSet = new Set(prev);
      newSet.delete(pluginId);
      return newSet;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'administration': return <Shield className="w-4 h-4" />;
      case 'economy': return <DollarSign className="w-4 h-4" />;
      case 'pvp': return <Target className="w-4 h-4" />;
      case 'moderation': return <Users className="w-4 h-4" />;
      case 'monitoring': return <Activity className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading marketplace..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="text-red-500 mb-4">
          <span className="text-lg font-medium">Failed to load marketplace</span>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Real-time Installation Progress */}
      <PluginInstallationProgress 
        serverId="1" 
        onInstallationComplete={handleInstallationComplete}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Plugin Marketplace</h1>
          <p className="text-gray-400">Discover and install plugins to enhance your servers</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'discover'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Discover
        </button>
        <button
          onClick={() => setActiveTab('my-plugins')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-plugins'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          My Plugins
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search plugins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as 'all' | 'free' | 'paid')}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="featured">Featured</option>
                <option value="downloads">Most Downloads</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span>{plugins.length} plugins found</span>
        <span>•</span>
        <span>{plugins.filter(p => p.featured).length} featured</span>
        <span>•</span>
        <span>{plugins.filter(p => p.price === 0).length} free</span>
      </div>

      {/* Plugin Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl">
                  {plugin.icon || '🔌'}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{plugin.name}</h3>
                  <p className="text-sm text-gray-400">by {plugin.author}</p>
                </div>
              </div>
              {plugin.verified && (
                <CheckCircle className="w-5 h-5 text-blue-500" />
              )}
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{plugin.description}</p>

            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-300">{plugin.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">{plugin.downloads.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                {getCategoryIcon(plugin.category)}
                <span className="text-gray-400">{plugin.category}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-white">{formatPrice(plugin.price)}</span>
                {plugin.featured && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
              <button
                onClick={() => handleInstall(plugin.id)}
                disabled={installingPlugins.has(plugin.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                {installingPlugins.has(plugin.id) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {installingPlugins.has(plugin.id) ? 'Installing...' : 'Install'}
              </button>
            </div>

            {plugin.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {plugin.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {plugins.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No plugins found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
}