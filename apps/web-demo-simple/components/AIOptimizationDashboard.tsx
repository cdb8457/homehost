'use client';

import { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Users, 
  Server, 
  Activity, 
  Target,
  Settings,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Sparkles,
  Bot,
  Wrench,
  Eye,
  BarChart3,
  Cpu,
  MemoryStick,
  Network,
  Gauge,
  RefreshCw,
  Bell,
  Award,
  ArrowUp,
  ArrowDown,
  Minus,
  Info,
  Play,
  Pause,
  Plus,
  X,
  Calendar,
  FileText,
  Download,
  Share2,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';

// Import our AI components
import AIOptimizationEngine from './AIOptimizationEngine';
import PredictiveAnalytics from './PredictiveAnalytics';
import AutoTuningSystem from './AutoTuningSystem';

interface AIOptimizationDashboardProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator';
}

interface DashboardStats {
  aiEnabled: boolean;
  performanceGain: number;
  costSavings: number;
  activeOptimizations: number;
  predictiveAlerts: number;
  autoTuningEnabled: boolean;
  lastOptimization: Date;
  systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  aiAccuracy: number;
}

interface RecentActivity {
  id: string;
  type: 'optimization' | 'prediction' | 'tuning' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error' | 'info';
  impact?: {
    performance: number;
    cost: number;
  };
}

export default function AIOptimizationDashboard({ 
  serverId, 
  serverName, 
  userRole = 'admin' 
}: AIOptimizationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'engine' | 'analytics' | 'tuning' | 'insights'>('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [expandedSections, setExpandedSections] = useState<string[]>(['stats', 'activity']);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [serverId, timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock dashboard statistics
    const mockStats: DashboardStats = {
      aiEnabled: true,
      performanceGain: 34.2,
      costSavings: 127.45,
      activeOptimizations: 3,
      predictiveAlerts: 2,
      autoTuningEnabled: true,
      lastOptimization: new Date(Date.now() - 5 * 60 * 1000),
      systemHealth: 'excellent',
      aiAccuracy: 89.2
    };

    // Mock recent activity
    const mockActivity: RecentActivity[] = [
      {
        id: 'act-1',
        type: 'optimization',
        title: 'CPU Scaling Complete',
        description: 'Successfully scaled CPU from 4 to 6 cores based on AI prediction',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'success',
        impact: {
          performance: 18.5,
          cost: -12.30
        }
      },
      {
        id: 'act-2',
        type: 'prediction',
        title: 'Memory Spike Predicted',
        description: 'AI predicts 40% memory increase in next 2 hours',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'warning',
        impact: {
          performance: 0,
          cost: 0
        }
      },
      {
        id: 'act-3',
        type: 'tuning',
        title: 'Auto-Tuning Optimization',
        description: 'Adjusted server tick rate from 18 to 20 TPS for better performance',
        timestamp: new Date(Date.now() - 35 * 60 * 1000),
        status: 'success',
        impact: {
          performance: 8.5,
          cost: -2.30
        }
      },
      {
        id: 'act-4',
        type: 'alert',
        title: 'Performance Alert',
        description: 'Detected unusual player activity pattern',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'info'
      },
      {
        id: 'act-5',
        type: 'optimization',
        title: 'Memory Optimization',
        description: 'Optimized garbage collection parameters',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'success',
        impact: {
          performance: 12.1,
          cost: 0
        }
      }
    ];

    setDashboardStats(mockStats);
    setRecentActivity(mockActivity);
    setLoading(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <X className="w-4 h-4" />;
      case 'info': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <Zap className="w-4 h-4" />;
      case 'prediction': return <Brain className="w-4 h-4" />;
      case 'tuning': return <Wrench className="w-4 h-4" />;
      case 'alert': return <Bell className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'engine':
        return (
          <AIOptimizationEngine 
            serverId={serverId}
            serverName={serverName}
            userRole={userRole}
          />
        );
      case 'analytics':
        return (
          <PredictiveAnalytics 
            serverId={serverId}
            serverName={serverName}
            timeRange={timeRange}
          />
        );
      case 'tuning':
        return (
          <AutoTuningSystem 
            serverId={serverId}
            serverName={serverName}
            userRole={userRole}
          />
        );
      case 'insights':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Insights</h3>
              <p className="text-gray-600">Advanced performance insights and recommendations coming soon...</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="relative">
                <Brain className="w-8 h-8 text-indigo-600" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
              </div>
              AI Optimization Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Intelligent server optimization powered by machine learning for <span className="font-semibold">{serverName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'engine', label: 'AI Engine', icon: Brain },
            { id: 'analytics', label: 'Predictive Analytics', icon: TrendingUp },
            { id: 'tuning', label: 'Auto-Tuning', icon: Wrench },
            { id: 'insights', label: 'Performance Insights', icon: Award }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && dashboardStats && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dashboardStats.aiEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium text-gray-600">AI Status</span>
                </div>
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {dashboardStats.aiEnabled ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardStats.aiAccuracy}% accuracy
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Performance</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(dashboardStats.systemHealth)}`}>
                  {dashboardStats.systemHealth}
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">
                +{dashboardStats.performanceGain}%
              </div>
              <div className="text-sm text-gray-600">
                Improvement
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Cost Savings</span>
                </div>
                <ArrowDown className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(dashboardStats.costSavings)}
              </div>
              <div className="text-sm text-gray-600">
                This month
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">{dashboardStats.activeOptimizations}</span>
                  <Activity className="w-3 h-3 text-gray-400" />
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-600 mb-1">
                {dashboardStats.activeOptimizations}
              </div>
              <div className="text-sm text-gray-600">
                Optimizations
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                System Status
              </h3>
              <button
                onClick={() => toggleSection('status')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.includes('status') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {expandedSections.includes('status') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-gray-900">AI Engine</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Status: <span className="font-medium text-green-600">Active</span></div>
                    <div>Last optimization: {dashboardStats.lastOptimization.toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">Predictive Analytics</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Active alerts: <span className="font-medium text-yellow-600">{dashboardStats.predictiveAlerts}</span></div>
                    <div>Forecasting: <span className="font-medium text-green-600">Running</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wrench className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-900">Auto-Tuning</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Status: <span className="font-medium text-green-600">Enabled</span></div>
                    <div>Mode: <span className="font-medium text-blue-600">Balanced</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Recent Activity
              </h3>
              <button
                onClick={() => toggleSection('activity')}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.includes('activity') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {expandedSections.includes('activity') && (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{activity.timestamp.toLocaleString()}</span>
                            {activity.impact && (
                              <>
                                <span className="text-green-600">+{activity.impact.performance}% performance</span>
                                <span className="text-blue-600">{formatCurrency(activity.impact.cost)} cost</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {getStatusIcon(activity.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Tab Content */}
      {activeTab !== 'overview' && renderTabContent()}
    </div>
  );
}