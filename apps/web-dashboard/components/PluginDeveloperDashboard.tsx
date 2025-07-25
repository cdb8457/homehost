'use client';

import { useState, useEffect } from 'react';
import { Plugin, PluginDeveloper, PluginAnalytics } from '@/types/plugin';
import { 
  Code, 
  Upload, 
  BarChart3, 
  DollarSign, 
  Download, 
  Star, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  ExternalLink,
  Github,
  Globe,
  MessageSquare,
  Activity,
  Target,
  Award,
  Zap,
  Shield,
  RefreshCw,
  Calendar,
  PieChart,
  LineChart,
  BarChart2,
  Gamepad2,
  Server,
  Bell,
  Mail,
  Twitter,
  Youtube,
  Twitch,
  Discord
} from 'lucide-react';

interface PluginDeveloperDashboardProps {
  developerId: string;
  userRole: 'developer' | 'admin';
}

interface DeveloperStats {
  totalPlugins: number;
  activePlugins: number;
  totalDownloads: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  monthlyActiveUsers: number;
  growthRate: number;
}

interface PluginSubmission {
  id: string;
  name: string;
  version: string;
  status: 'draft' | 'pending_review' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewer?: string;
  feedback?: string;
  downloadUrl?: string;
}

export default function PluginDeveloperDashboard({ 
  developerId, 
  userRole = 'developer' 
}: PluginDeveloperDashboardProps) {
  const [developer, setDeveloper] = useState<PluginDeveloper | null>(null);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [submissions, setSubmissions] = useState<PluginSubmission[]>([]);
  const [analytics, setAnalytics] = useState<PluginAnalytics | null>(null);
  const [stats, setStats] = useState<DeveloperStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'plugins' | 'submissions' | 'analytics' | 'profile'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeveloperData();
  }, [developerId, selectedTimeRange]);

  const loadDeveloperData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock developer data
    const mockDeveloper: PluginDeveloper = {
      id: developerId,
      name: 'plugin-dev-studios',
      displayName: 'Plugin Dev Studios',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      website: 'https://plugindevstudios.com',
      bio: 'Creating innovative plugins for the HomeHost ecosystem since 2024. Focused on quality-of-life improvements and professional administration tools.',
      isVerified: true,
      isOfficial: false,
      pluginCount: 8,
      totalDownloads: 45237,
      averageRating: 4.6,
      joinedAt: new Date('2024-03-15'),
      lastActive: new Date(),
      socialLinks: {
        twitter: 'https://twitter.com/plugindevstudios',
        github: 'https://github.com/plugindevstudios',
        discord: 'https://discord.gg/plugindevstudios'
      },
      revenueShareTier: 'gold'
    };

    // Mock developer stats
    const mockStats: DeveloperStats = {
      totalPlugins: 8,
      activePlugins: 7,
      totalDownloads: 45237,
      totalRevenue: 12847.50,
      averageRating: 4.6,
      totalReviews: 423,
      monthlyActiveUsers: 2156,
      growthRate: 23.4
    };

    // Mock plugins
    const mockPlugins: Plugin[] = [
      {
        id: 'advanced-chat-manager',
        name: 'Advanced Chat Manager',
        tagline: 'Professional chat moderation and management',
        description: 'Complete chat management solution with advanced moderation tools.',
        longDescription: 'Full description...',
        icon: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=64',
        screenshots: ['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800'],
        developer: {
          id: developerId,
          name: 'Plugin Dev Studios',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64',
          verified: true,
          totalPlugins: 8,
          averageRating: 4.6
        },
        category: 'admin-tools',
        subcategory: 'Communication',
        isFeatured: true,
        isRecommended: true,
        isNew: false,
        price: {
          type: 'paid',
          amount: 19.99,
          currency: 'USD'
        },
        version: '2.1.4',
        lastUpdated: new Date('2025-07-10'),
        releaseDate: new Date('2024-03-15'),
        fileSize: '2.3 MB',
        requiredHomeHostVersion: '1.8.0',
        supportedGames: ['rust', 'valheim', 'minecraft'],
        platformRequirements: {
          operatingSystems: ['Windows', 'Linux']
        },
        rating: 4.9,
        reviewCount: 127,
        downloadCount: 15832,
        activeInstalls: 8934,
        features: ['Real-time spam detection', 'Custom moderation rules'],
        tags: ['chat', 'moderation', 'administration'],
        installationStatus: 'not-installed',
        dependencies: ['core-api']
      }
    ];

    // Mock submissions
    const mockSubmissions: PluginSubmission[] = [
      {
        id: 'sub-1',
        name: 'Advanced Chat Manager',
        version: '2.1.5',
        status: 'pending_review',
        submittedAt: new Date('2025-07-14'),
        downloadUrl: 'https://example.com/download'
      },
      {
        id: 'sub-2',
        name: 'Economy System Pro',
        version: '3.0.2',
        status: 'approved',
        submittedAt: new Date('2025-07-10'),
        reviewedAt: new Date('2025-07-12'),
        reviewer: 'HomeHost Team',
        feedback: 'Approved with minor suggestions for future updates.'
      },
      {
        id: 'sub-3',
        name: 'Performance Monitor',
        version: '1.0.0',
        status: 'rejected',
        submittedAt: new Date('2025-07-08'),
        reviewedAt: new Date('2025-07-09'),
        reviewer: 'Security Team',
        feedback: 'Plugin requires additional security review due to system-level access requirements.'
      }
    ];

    setDeveloper(mockDeveloper);
    setStats(mockStats);
    setPlugins(mockPlugins);
    setSubmissions(mockSubmissions);
    setLoading(false);
  };

  const handlePluginAction = async (pluginId: string, action: 'edit' | 'delete' | 'update' | 'analytics') => {
    console.log(`Performing ${action} on plugin ${pluginId}`);
    
    if (action === 'analytics') {
      setActiveTab('analytics');
      // Load plugin-specific analytics
    }
  };

  const handleNewPlugin = () => {
    console.log('Creating new plugin...');
    // Navigate to plugin creation wizard
  };

  const handleSubmissionAction = (submissionId: string, action: 'withdraw' | 'resubmit') => {
    console.log(`Performing ${action} on submission ${submissionId}`);
    
    setSubmissions(prev => prev.map(sub => 
      sub.id === submissionId 
        ? { ...sub, status: action === 'withdraw' ? 'draft' : 'pending_review' }
        : sub
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending_review': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getRevenueShareInfo = (tier: string) => {
    const tiers = {
      standard: { rate: 70, color: 'text-gray-600' },
      bronze: { rate: 72, color: 'text-orange-600' },
      silver: { rate: 75, color: 'text-gray-500' },
      gold: { rate: 80, color: 'text-yellow-600' },
      platinum: { rate: 85, color: 'text-purple-600' }
    };
    return tiers[tier as keyof typeof tiers] || tiers.standard;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={developer?.avatar}
                alt={developer?.displayName}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{developer?.displayName}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>@{developer?.name}</span>
                  {developer?.isVerified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                  )}
                  {developer?.isOfficial && (
                    <Shield className="w-4 h-4 text-purple-500" />
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleNewPlugin}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              New Plugin
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'plugins', label: 'My Plugins', icon: Package },
              { id: 'submissions', label: 'Submissions', icon: Upload },
              { id: 'analytics', label: 'Analytics', icon: LineChart },
              { id: 'profile', label: 'Profile', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {stats.activePlugins}/{stats.totalPlugins} active
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPlugins}</div>
                <div className="text-sm text-gray-600">Total Plugins</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalDownloads.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Downloads</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">+{stats.growthRate}%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">{stats.totalReviews} reviews</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
            </div>

            {/* Revenue Share Info */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Revenue Share Tier: {developer?.revenueShareTier.toUpperCase()}</h3>
                    <p className="text-sm text-gray-600">
                      You earn {getRevenueShareInfo(developer?.revenueShareTier || 'standard').rate}% of all sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">
                    {getRevenueShareInfo(developer?.revenueShareTier || 'standard').rate}%
                  </div>
                  <div className="text-sm text-gray-600">Your share</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-gray-900">This Month</div>
                  <div className="text-lg font-bold text-green-600">{formatCurrency(2847.50)}</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-gray-900">Next Payment</div>
                  <div className="text-lg font-bold text-blue-600">July 31, 2025</div>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="font-medium text-gray-900">Lifetime Earnings</div>
                  <div className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalRevenue)}</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Plugin approved</div>
                    <div className="text-sm text-gray-600">Economy System Pro v3.0.2 was approved for publication</div>
                  </div>
                  <div className="text-sm text-gray-500">2 hours ago</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">New submission</div>
                    <div className="text-sm text-gray-600">Advanced Chat Manager v2.1.5 submitted for review</div>
                  </div>
                  <div className="text-sm text-gray-500">1 day ago</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">New review</div>
                    <div className="text-sm text-gray-600">5-star review received for Performance Optimizer</div>
                  </div>
                  <div className="text-sm text-gray-500">3 days ago</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plugins' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Plugins</h2>
              <button
                onClick={handleNewPlugin}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                Create New Plugin
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plugins.map((plugin) => (
                <div key={plugin.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <div className="relative">
                    <img
                      src={plugin.screenshots[0]}
                      alt={plugin.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      {plugin.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                      <span className="text-sm font-medium text-green-600">
                        {plugin.price.type === 'free' ? 'Free' : `$${plugin.price.amount}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{plugin.tagline}</p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Downloads:</span> {plugin.downloadCount.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Version:</span> {plugin.version}
                      </div>
                      <div>
                        <span className="font-medium">Reviews:</span> {plugin.reviewCount}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span> {plugin.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePluginAction(plugin.id, 'edit')}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handlePluginAction(plugin.id, 'analytics')}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePluginAction(plugin.id, 'delete')}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Plugin Submissions</h2>
              <button
                onClick={() => console.log('New submission')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Upload className="w-4 h-4" />
                Submit Plugin
              </button>
            </div>

            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{submission.name}</h3>
                        <span className="text-sm text-gray-500">v{submission.version}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Submitted:</span> {submission.submittedAt.toLocaleDateString()}
                        </div>
                        {submission.reviewedAt && (
                          <div>
                            <span className="font-medium">Reviewed:</span> {submission.reviewedAt.toLocaleDateString()}
                          </div>
                        )}
                        {submission.reviewer && (
                          <div>
                            <span className="font-medium">Reviewer:</span> {submission.reviewer}
                          </div>
                        )}
                      </div>
                      
                      {submission.feedback && (
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          <div className="font-medium text-gray-900 mb-1">Feedback:</div>
                          <div className="text-gray-700">{submission.feedback}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {submission.status === 'pending_review' && (
                        <button
                          onClick={() => handleSubmissionAction(submission.id, 'withdraw')}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          Withdraw
                        </button>
                      )}
                      {submission.status === 'rejected' && (
                        <button
                          onClick={() => handleSubmissionAction(submission.id, 'resubmit')}
                          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Resubmit
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Coming Soon</h3>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics</h4>
                <p className="text-gray-600">
                  Detailed analytics including download trends, user engagement, and revenue insights will be available soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && developer && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-4">Developer Profile</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      defaultValue={developer.displayName}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      defaultValue={developer.website}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows={3}
                    defaultValue={developer.bio}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                    <input
                      type="url"
                      defaultValue={developer.socialLinks?.twitter}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <input
                      type="url"
                      defaultValue={developer.socialLinks?.github}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discord</label>
                    <input
                      type="url"
                      defaultValue={developer.socialLinks?.discord}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}