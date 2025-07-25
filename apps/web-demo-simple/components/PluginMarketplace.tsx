'use client';

import { useState, useMemo } from 'react';
import { Plugin, PluginFilter } from '@/types/plugin';
import { MOCK_PLUGINS, PLUGIN_CATEGORIES } from '@/data/plugins';
import PluginCard from '@/components/ui/PluginCard';
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
  Bookmark
} from 'lucide-react';

interface PluginMarketplaceProps {
  userType?: 'alex' | 'sam' | 'both';
  showMyPlugins?: boolean;
}

export default function PluginMarketplace({ userType = 'both', showMyPlugins = false }: PluginMarketplaceProps) {
  const [filter, setFilter] = useState<PluginFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-plugins'>('discover');

  // Filter plugins based on user type and preferences
  const filteredPlugins = useMemo(() => {
    let plugins = [...MOCK_PLUGINS];

    // Filter by tab
    if (activeTab === 'my-plugins') {
      plugins = plugins.filter(p => 
        p.installationStatus === 'installed' || 
        p.installationStatus === 'update-available' ||
        p.installationStatus === 'installing'
      );
    }

    // Apply search filter
    if (searchTerm) {
      plugins = plugins.filter(plugin => 
        plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        plugin.developer.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      plugins = plugins.filter(plugin => plugin.category === selectedCategory);
    }

    // Apply price filter
    if (filter.price && filter.price !== 'all') {
      plugins = plugins.filter(plugin => {
        if (filter.price === 'free') return plugin.price.type === 'free';
        if (filter.price === 'paid') return plugin.price.type === 'paid' || plugin.price.type === 'freemium';
        return true;
      });
    }

    // Apply rating filter
    if (filter.rating) {
      plugins = plugins.filter(plugin => plugin.rating >= filter.rating!);
    }

    // Apply compatibility filter
    if (filter.compatibility && filter.compatibility.length > 0) {
      plugins = plugins.filter(plugin =>
        filter.compatibility!.some(game => plugin.supportedGames.includes(game))
      );
    }

    // Apply installation status filters
    if (filter.showInstalled) {
      plugins = plugins.filter(plugin => plugin.installationStatus === 'installed');
    }
    if (filter.showUpdates) {
      plugins = plugins.filter(plugin => plugin.installationStatus === 'update-available');
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'rating':
        plugins.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        plugins.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'newest':
        plugins.sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());
        break;
      case 'price-low':
        plugins.sort((a, b) => (a.price.amount || 0) - (b.price.amount || 0));
        break;
      case 'price-high':
        plugins.sort((a, b) => (b.price.amount || 0) - (a.price.amount || 0));
        break;
      default:
        // Relevance sort - featured first, then by rating and downloads
        plugins.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return (b.rating * Math.log(b.downloadCount + 1)) - (a.rating * Math.log(a.downloadCount + 1));
        });
    }

    return plugins;
  }, [searchTerm, filter, selectedCategory, activeTab]);

  const handleInstall = async (pluginId: string) => {
    const plugin = MOCK_PLUGINS.find(p => p.id === pluginId);
    if (!plugin) return;

    // Update plugin status to installing
    const updatedPlugins = MOCK_PLUGINS.map(p => 
      p.id === pluginId 
        ? { ...p, installationStatus: 'installing' as const, installProgress: 0 }
        : p
    );

    // Simulate installation progress
    for (let progress = 0; progress <= 100; progress += 20) {
      setTimeout(() => {
        // Update progress
      }, progress * 50);
    }

    // Complete installation
    setTimeout(() => {
      alert(`${plugin.name} installed successfully! 🎉`);
    }, 3000);
  };

  const handleViewDetails = (pluginId: string) => {
    const plugin = MOCK_PLUGINS.find(p => p.id === pluginId);
    alert(`Opening details for ${plugin?.name}`);
  };

  const handleConfigure = (pluginId: string) => {
    const plugin = MOCK_PLUGINS.find(p => p.id === pluginId);
    alert(`Opening configuration for ${plugin?.name}`);
  };

  const handleUninstall = (pluginId: string) => {
    const plugin = MOCK_PLUGINS.find(p => p.id === pluginId);
    if (confirm(`Are you sure you want to uninstall ${plugin?.name}?`)) {
      alert(`${plugin?.name} uninstalled successfully.`);
    }
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const hasActiveFilters = Object.keys(filter).length > 0 || searchTerm || selectedCategory !== 'all';

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'quality-of-life': return <Zap className="w-4 h-4" />;
      case 'admin-tools': return <Shield className="w-4 h-4" />;
      case 'community-features': return <Users className="w-4 h-4" />;
      case 'game-specific': return <Gamepad2 className="w-4 h-4" />;
      case 'security': return <Lock className="w-4 h-4" />;
      case 'monetization': return <DollarSign className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const featuredPlugins = MOCK_PLUGINS.filter(p => p.isFeatured);
  const alexPlugins = MOCK_PLUGINS.filter(p => p.category === 'quality-of-life');
  const samPlugins = MOCK_PLUGINS.filter(p => p.category === 'admin-tools' || p.category === 'monetization');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Plugin Marketplace
            </h1>
            <p className="text-xl sm:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Extend HomeHost with magical plugins. One-click installation, zero configuration required.
            </p>
            <div className="flex items-center justify-center gap-6 text-indigo-200">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                <span>170k+ downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>4.7 average rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Verified & secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 mb-8 max-w-md">
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'discover'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('my-plugins')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'my-plugins'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            My Plugins
          </button>
        </div>

        {activeTab === 'discover' && (
          <>
            {/* Smart Bundle Recommendations */}
            <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Recommended Plugin Bundles</h2>
                    <p className="text-sm text-gray-600">Curated collections that work perfectly together</p>
                  </div>
                </div>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">Save 30%</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Casual Host Starter Pack */}
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">🎮 Casual Host Starter Pack</h3>
                    <span className="text-sm text-green-600 font-medium">Most Popular</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Everything you need to host like a pro from day one</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Auto-Backup Guardian</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Smart Server Optimizer</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>One-Click Installer</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="line-through text-gray-400">$24.99</span>
                      <span className="ml-2 font-semibold text-green-600">$17.49</span>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                      Install Bundle
                    </button>
                  </div>
                </div>

                {/* Pro Community Builder */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">🏆 Pro Community Builder</h3>
                    <span className="text-sm text-blue-600 font-medium">Advanced</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Professional tools for serious community management</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Advanced Analytics Suite</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Community Management Hub</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>Revenue Analytics Pro</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="line-through text-gray-400">$79.99</span>
                      <span className="ml-2 font-semibold text-blue-600">$55.99</span>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Install Bundle
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Plugin Analytics */}
            <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Plugin Ecosystem Insights
                </h2>
                <span className="text-sm text-gray-500">Updated every 5 minutes</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Download className="w-5 h-5" />
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold">170,247</div>
                  <div className="text-sm opacity-90">Total Downloads</div>
                  <div className="text-xs opacity-75 mt-1">+12% this week</div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-5 h-5" />
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold">89%</div>
                  <div className="text-sm opacity-90">Success Rate</div>
                  <div className="text-xs opacity-75 mt-1">Last 24 hours</div>
                </div>
                
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-5 h-5" />
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold">4.7</div>
                  <div className="text-sm opacity-90">Average Rating</div>
                  <div className="text-xs opacity-75 mt-1">From 23k reviews</div>
                </div>
                
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5" />
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm opacity-90">Active Developers</div>
                  <div className="text-xs opacity-75 mt-1">Contributing daily</div>
                </div>
              </div>
              
              {/* Trending This Week */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  Trending This Week
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Smart Server Optimizer</div>
                      <div className="text-sm text-orange-600">+847% installs</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Auto-Backup Guardian</div>
                      <div className="text-sm text-blue-600">+423% installs</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Community Management Hub</div>
                      <div className="text-sm text-green-600">+312% installs</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer Spotlight */}
            <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  Developer Spotlight
                </h2>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1">
                  View All Developers
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      HH
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                        HomeHost Team
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </h3>
                      <p className="text-sm text-gray-600">Official Team</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Creating the essential tools that make hosting effortless</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">8 plugins</span>
                    <span className="text-yellow-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      4.8
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      CL
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-1">
                        Community Labs
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      </h3>
                      <p className="text-sm text-gray-600">Verified Developer</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Advanced tools for serious community administrators</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">12 plugins</span>
                    <span className="text-yellow-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      4.6
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                      AT
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">IndieDevAlex</h3>
                      <p className="text-sm text-gray-600">Rising Star</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Quality-of-life improvements that just work</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">5 plugins</span>
                    <span className="text-yellow-600 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      4.4
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Carousel */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Plugins</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPlugins.map((plugin) => (
                  <PluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onInstall={handleInstall}
                    onViewDetails={handleViewDetails}
                    onConfigure={handleConfigure}
                    onUninstall={handleUninstall}
                  />
                ))}
              </div>
            </div>

            {/* Alex's Recommendations */}
            {(userType === 'alex' || userType === 'both') && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Perfect for Casual Hosts</h2>
                    <p className="text-gray-600">Essential quality-of-life plugins that make hosting effortless</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {alexPlugins.slice(0, 4).map((plugin) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      onInstall={handleInstall}
                      onViewDetails={handleViewDetails}
                      onConfigure={handleConfigure}
                      onUninstall={handleUninstall}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sam's Power Tools */}
            {(userType === 'sam' || userType === 'both') && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Professional Admin Tools</h2>
                    <p className="text-gray-600">Advanced management and analytics for serious community builders</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {samPlugins.slice(0, 3).map((plugin) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      onInstall={handleInstall}
                      onViewDetails={handleViewDetails}
                      onConfigure={handleConfigure}
                      onUninstall={handleUninstall}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search plugins..."
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
                  <Grid className="w-4 h-4" />
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
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <select
                    value={filter.price || 'all'}
                    onChange={(e) => setFilter(prev => ({ ...prev, price: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free Only</option>
                    <option value="paid">Paid Only</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                  <select
                    value={filter.rating || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, rating: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                  </select>
                </div>

                {/* Game Compatibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Game</label>
                  <select
                    value={filter.compatibility?.[0] || ''}
                    onChange={(e) => setFilter(prev => ({ 
                      ...prev, 
                      compatibility: e.target.value ? [e.target.value] : undefined 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Games</option>
                    <option value="Valheim">Valheim</option>
                    <option value="Rust">Rust</option>
                    <option value="Counter-Strike 2">Counter-Strike 2</option>
                    <option value="MotorTown">MotorTown</option>
                    <option value="7 Days to Die">7 Days to Die</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={filter.sortBy || 'relevance'}
                    onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rated</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Additional Filters */}
              {activeTab === 'my-plugins' && (
                <div className="mt-4 flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filter.showUpdates || false}
                      onChange={(e) => setFilter(prev => ({ 
                        ...prev, 
                        showUpdates: e.target.checked || undefined 
                      }))}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Show updates only</span>
                  </label>
                </div>
              )}

              {hasActiveFilters && (
                <div className="mt-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
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
              <Star className="w-4 h-4" />
              All Categories
            </button>
            {PLUGIN_CATEGORIES.map((category) => (
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
                {category.name}
                <span className="text-xs opacity-75">({category.pluginCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'my-plugins' ? 'Installed Plugins' :
               selectedCategory === 'all' ? 'All Plugins' :
               PLUGIN_CATEGORIES.find(c => c.id === selectedCategory)?.name}
            </h2>
            <span className="text-sm text-gray-600">
              {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filteredPlugins.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No plugins found</h3>
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
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredPlugins.map((plugin) => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  onInstall={handleInstall}
                  onViewDetails={handleViewDetails}
                  onConfigure={handleConfigure}
                  onUninstall={handleUninstall}
                  showInstallationStatus={activeTab !== 'discover'}
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