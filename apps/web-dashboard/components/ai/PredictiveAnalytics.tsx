'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Calendar,
  Users,
  Cpu,
  HardDrive,
  Network,
  DollarSign,
  Zap,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Crystal,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Bell,
  Shield,
  Battery,
  Server,
  Globe,
  Thermometer,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Star,
  Lightbulb,
  Wrench,
  Award,
  Filter,
  Search,
  Calendar as CalendarIcon,
  Timer,
  Sparkles
} from 'lucide-react';

interface PredictionModel {
  id: string;
  name: string;
  type: 'performance' | 'capacity' | 'cost' | 'player_behavior' | 'maintenance' | 'security';
  description: string;
  accuracy: number;
  confidence: number;
  lastUpdated: string;
  dataPoints: number;
  predictionHorizon: string;
  status: 'active' | 'training' | 'calibrating' | 'inactive';
}

interface Prediction {
  id: string;
  modelId: string;
  serverId: string;
  type: 'performance' | 'capacity' | 'cost' | 'player_behavior' | 'maintenance' | 'security';
  title: string;
  description: string;
  prediction: any;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  recommendedActions: RecommendedAction[];
  createdAt: string;
  validUntil: string;
  tags: string[];
}

interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  cost: number;
  savings: number;
  timeline: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface TrendAnalysis {
  metric: string;
  current: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  change: number;
  prediction: {
    nextWeek: number;
    nextMonth: number;
    nextQuarter: number;
  };
  confidence: number;
  factors: string[];
}

interface PredictiveAnalyticsProps {
  serverId: string;
  serverName: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export default function PredictiveAnalytics({
  serverId,
  serverName,
  timeRange = '30d'
}: PredictiveAnalyticsProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedPredictions, setExpandedPredictions] = useState<Set<string>>(new Set());
  const [showModels, setShowModels] = useState(false);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadPredictiveData();
  }, [serverId, selectedTimeRange]);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading predictive data
      const mockPredictions = generateMockPredictions();
      const mockModels = generateMockModels();
      const mockTrends = generateMockTrends();

      setPredictions(mockPredictions);
      setModels(mockModels);
      setTrends(mockTrends);
    } catch (err) {
      setError('Failed to load predictive analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateMockModels = (): PredictionModel[] => [
    {
      id: '1',
      name: 'Performance Forecasting',
      type: 'performance',
      description: 'Predicts server performance trends and bottlenecks',
      accuracy: 94.2,
      confidence: 87.5,
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      dataPoints: 15420,
      predictionHorizon: '30 days',
      status: 'active'
    },
    {
      id: '2',
      name: 'Capacity Planning',
      type: 'capacity',
      description: 'Forecasts resource needs and scaling requirements',
      accuracy: 91.8,
      confidence: 89.2,
      lastUpdated: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      dataPoints: 8920,
      predictionHorizon: '90 days',
      status: 'active'
    },
    {
      id: '3',
      name: 'Player Behavior Analysis',
      type: 'player_behavior',
      description: 'Predicts player activity patterns and retention',
      accuracy: 88.7,
      confidence: 82.3,
      lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      dataPoints: 25680,
      predictionHorizon: '60 days',
      status: 'active'
    },
    {
      id: '4',
      name: 'Cost Optimization',
      type: 'cost',
      description: 'Forecasts operational costs and optimization opportunities',
      accuracy: 92.5,
      confidence: 90.1,
      lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      dataPoints: 5240,
      predictionHorizon: '120 days',
      status: 'active'
    },
    {
      id: '5',
      name: 'Maintenance Predictor',
      type: 'maintenance',
      description: 'Predicts maintenance needs and failure risks',
      accuracy: 89.3,
      confidence: 85.7,
      lastUpdated: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      dataPoints: 3680,
      predictionHorizon: '45 days',
      status: 'training'
    }
  ];

  const generateMockPredictions = (): Prediction[] => [
    {
      id: '1',
      modelId: '1',
      serverId,
      type: 'performance',
      title: 'CPU Usage Spike Expected',
      description: 'CPU usage is predicted to increase by 35% during the upcoming weekend event',
      prediction: {
        metric: 'cpu_usage',
        currentValue: 65,
        predictedValue: 88,
        peakTime: '2024-01-27 20:00',
        duration: '4 hours'
      },
      confidence: 87.5,
      timeframe: 'Next 7 days',
      impact: 'high',
      probability: 85,
      recommendedActions: [
        {
          id: '1',
          title: 'Scale CPU Resources',
          description: 'Temporarily increase CPU allocation during peak hours',
          impact: 'Prevent performance degradation',
          effort: 'low',
          cost: 25,
          savings: 150,
          timeline: '30 minutes',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Enable Auto-Scaling',
          description: 'Configure automatic resource scaling for future events',
          impact: 'Automated handling of traffic spikes',
          effort: 'medium',
          cost: 50,
          savings: 300,
          timeline: '2 hours',
          priority: 'medium'
        }
      ],
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['performance', 'cpu', 'weekend', 'scaling']
    },
    {
      id: '2',
      modelId: '2',
      serverId,
      type: 'capacity',
      title: 'Storage Capacity Alert',
      description: 'Current storage usage trends indicate capacity will reach 90% within 15 days',
      prediction: {
        metric: 'storage_usage',
        currentValue: 72,
        predictedValue: 90,
        timeline: '15 days',
        growthRate: '1.2% per day'
      },
      confidence: 92.1,
      timeframe: 'Next 30 days',
      impact: 'medium',
      probability: 78,
      recommendedActions: [
        {
          id: '1',
          title: 'Archive Old Data',
          description: 'Implement automated data archiving for files older than 90 days',
          impact: 'Free up 20-30% storage space',
          effort: 'low',
          cost: 0,
          savings: 80,
          timeline: '1 hour',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Add Storage Capacity',
          description: 'Provision additional storage before reaching critical levels',
          impact: 'Prevent storage bottlenecks',
          effort: 'low',
          cost: 120,
          savings: 0,
          timeline: '1 day',
          priority: 'medium'
        }
      ],
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['capacity', 'storage', 'planning', 'growth']
    },
    {
      id: '3',
      modelId: '3',
      serverId,
      type: 'player_behavior',
      title: 'Player Activity Surge Predicted',
      description: 'Analysis indicates 40% increase in player activity during upcoming holiday period',
      prediction: {
        metric: 'player_count',
        currentAverage: 45,
        predictedPeak: 63,
        peakPeriod: 'Dec 25 - Jan 2',
        activityIncrease: 40
      },
      confidence: 84.3,
      timeframe: 'Next 14 days',
      impact: 'medium',
      probability: 82,
      recommendedActions: [
        {
          id: '1',
          title: 'Prepare for Higher Load',
          description: 'Pre-configure server settings for increased player capacity',
          impact: 'Smooth gameplay during peak times',
          effort: 'medium',
          cost: 75,
          savings: 200,
          timeline: '4 hours',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Schedule Events',
          description: 'Plan special in-game events to capitalize on increased activity',
          impact: 'Improved player engagement and retention',
          effort: 'high',
          cost: 100,
          savings: 400,
          timeline: '1 week',
          priority: 'medium'
        }
      ],
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['players', 'activity', 'holidays', 'engagement']
    },
    {
      id: '4',
      modelId: '4',
      serverId,
      type: 'cost',
      title: 'Cost Optimization Opportunity',
      description: 'Switching to efficient compute instances during low-usage hours could save 25% monthly',
      prediction: {
        metric: 'monthly_cost',
        currentCost: 320,
        optimizedCost: 240,
        savings: 80,
        lowUsageHours: ['02:00-07:00', '10:00-14:00']
      },
      confidence: 90.7,
      timeframe: 'Ongoing',
      impact: 'low',
      probability: 95,
      recommendedActions: [
        {
          id: '1',
          title: 'Implement Smart Scaling',
          description: 'Auto-scale resources based on usage patterns',
          impact: '25% cost reduction with same performance',
          effort: 'medium',
          cost: 0,
          savings: 80,
          timeline: '3 hours',
          priority: 'high'
        }
      ],
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['cost', 'optimization', 'scaling', 'efficiency']
    },
    {
      id: '5',
      modelId: '5',
      serverId,
      type: 'maintenance',
      title: 'Predictive Maintenance Alert',
      description: 'SSD wear patterns indicate potential failure risk within 45 days',
      prediction: {
        metric: 'disk_health',
        currentHealth: 78,
        predictedHealth: 65,
        riskLevel: 'medium',
        estimatedLifespan: '45 days'
      },
      confidence: 76.8,
      timeframe: 'Next 45 days',
      impact: 'critical',
      probability: 65,
      recommendedActions: [
        {
          id: '1',
          title: 'Schedule Disk Replacement',
          description: 'Proactively replace SSD before failure occurs',
          impact: 'Prevent data loss and downtime',
          effort: 'high',
          cost: 200,
          savings: 1000,
          timeline: '2 days',
          priority: 'critical'
        },
        {
          id: '2',
          title: 'Backup Critical Data',
          description: 'Ensure all critical data is backed up immediately',
          impact: 'Data protection against disk failure',
          effort: 'low',
          cost: 0,
          savings: 500,
          timeline: '2 hours',
          priority: 'critical'
        }
      ],
      createdAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['maintenance', 'hardware', 'risk', 'prevention']
    }
  ];

  const generateMockTrends = (): TrendAnalysis[] => [
    {
      metric: 'CPU Usage',
      current: 65.2,
      trend: 'increasing',
      change: 12.5,
      prediction: {
        nextWeek: 72.8,
        nextMonth: 78.4,
        nextQuarter: 82.1
      },
      confidence: 87.3,
      factors: ['Increased player activity', 'New plugin installations', 'Seasonal events']
    },
    {
      metric: 'Memory Usage',
      current: 58.7,
      trend: 'stable',
      change: 2.1,
      prediction: {
        nextWeek: 59.5,
        nextMonth: 61.2,
        nextQuarter: 63.8
      },
      confidence: 91.5,
      factors: ['Stable player base', 'Optimized memory management']
    },
    {
      metric: 'Player Count',
      current: 45,
      trend: 'increasing',
      change: 18.2,
      prediction: {
        nextWeek: 52,
        nextMonth: 58,
        nextQuarter: 67
      },
      confidence: 84.7,
      factors: ['Holiday season', 'New content updates', 'Community growth']
    },
    {
      metric: 'Response Time',
      current: 85.4,
      trend: 'decreasing',
      change: -8.3,
      prediction: {
        nextWeek: 82.1,
        nextMonth: 78.9,
        nextQuarter: 75.2
      },
      confidence: 89.2,
      factors: ['Recent optimizations', 'Network improvements', 'Caching enhancements']
    }
  ];

  const handleToggleExpanded = (predictionId: string) => {
    setExpandedPredictions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(predictionId)) {
        newSet.delete(predictionId);
      } else {
        newSet.add(predictionId);
      }
      return newSet;
    });
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'performance': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'capacity': return <HardDrive className="w-5 h-5 text-blue-500" />;
      case 'cost': return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'player_behavior': return <Users className="w-5 h-5 text-purple-500" />;
      case 'maintenance': return <Wrench className="w-5 h-5 text-red-500" />;
      case 'security': return <Shield className="w-5 h-5 text-orange-500" />;
      default: return <Crystal className="w-5 h-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-500 bg-red-900';
      case 'high': return 'text-orange-500 bg-orange-900';
      case 'medium': return 'text-yellow-500 bg-yellow-900';
      case 'low': return 'text-green-500 bg-green-900';
      default: return 'text-gray-500 bg-gray-900';
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className={`w-4 h-4 ${change > 10 ? 'text-red-500' : 'text-yellow-500'}`} />;
      case 'decreasing':
        return <TrendingDown className={`w-4 h-4 ${change < -10 ? 'text-green-500' : 'text-blue-500'}`} />;
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-500" />;
      case 'volatile':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-900';
      case 'training': return 'text-blue-500 bg-blue-900';
      case 'calibrating': return 'text-yellow-500 bg-yellow-900';
      case 'inactive': return 'text-gray-500 bg-gray-900';
      default: return 'text-gray-500 bg-gray-900';
    }
  };

  const filteredPredictions = predictions.filter(prediction => {
    return selectedCategory === 'all' || prediction.type === selectedCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading predictive analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crystal className="w-6 h-6 text-purple-500" />
            Predictive Analytics
          </h2>
          <p className="text-gray-400">AI-powered insights and forecasts for {serverName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          
          <button
            onClick={() => setShowModels(!showModels)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Brain className="w-4 h-4" />
            Models
          </button>
          
          <button
            onClick={loadPredictiveData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Prediction Models */}
      {showModels && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-500" />
            AI Prediction Models
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <div key={model.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{model.name}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getModelStatusColor(model.status)}`}>
                    {model.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 mb-3">{model.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Accuracy:</span>
                    <span className="text-green-400 font-medium">{model.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className="text-blue-400 font-medium">{model.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data Points:</span>
                    <span className="text-white">{model.dataPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Horizon:</span>
                    <span className="text-white">{model.predictionHorizon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Analysis */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-green-500" />
          Trend Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trends.map((trend, index) => (
            <div key={index} className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{trend.metric}</h4>
                {getTrendIcon(trend.trend, trend.change)}
              </div>
              
              <div className="text-2xl font-bold text-white mb-1">
                {trend.metric.includes('Time') ? `${trend.current.toFixed(0)}ms` : 
                 trend.metric.includes('Count') ? trend.current.toString() :
                 `${trend.current.toFixed(1)}%`}
              </div>
              
              <div className={`text-sm mb-3 ${
                trend.change > 0 ? (trend.metric.includes('Time') ? 'text-red-400' : 'text-green-400') :
                trend.change < 0 ? (trend.metric.includes('Time') ? 'text-green-400' : 'text-red-400') :
                'text-gray-400'
              }`}>
                {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}% {trend.trend}
              </div>
              
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex justify-between">
                  <span>Next Week:</span>
                  <span className="text-white">
                    {trend.metric.includes('Time') ? `${trend.prediction.nextWeek.toFixed(0)}ms` :
                     trend.metric.includes('Count') ? trend.prediction.nextWeek.toString() :
                     `${trend.prediction.nextWeek.toFixed(1)}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Next Month:</span>
                  <span className="text-white">
                    {trend.metric.includes('Time') ? `${trend.prediction.nextMonth.toFixed(0)}ms` :
                     trend.metric.includes('Count') ? trend.prediction.nextMonth.toString() :
                     `${trend.prediction.nextMonth.toFixed(1)}%`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Confidence:</span>
                  <span className="text-blue-400">{trend.confidence.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Predictions
        </button>
        {['performance', 'capacity', 'cost', 'player_behavior', 'maintenance'].map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Predictions */}
      <div className="space-y-4">
        {filteredPredictions.map((prediction) => {
          const isExpanded = expandedPredictions.has(prediction.id);
          
          return (
            <div key={prediction.id} className="bg-gray-800 rounded-lg border border-gray-700">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => handleToggleExpanded(prediction.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getPredictionIcon(prediction.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{prediction.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(prediction.impact)}`}>
                          {prediction.impact}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{prediction.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{prediction.timeframe}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>{prediction.probability}% probability</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Brain className="w-4 h-4" />
                          <span>{prediction.confidence.toFixed(1)}% confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">Actions</div>
                      <div className="text-white font-medium">{prediction.recommendedActions.length}</div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-700">
                  <div className="pt-4 space-y-4">
                    {/* Prediction Details */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-white mb-3">Prediction Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {Object.entries(prediction.prediction).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-white font-medium">
                              {typeof value === 'number' ? value.toFixed(1) : value}
                              {key.includes('Value') || key.includes('usage') ? '%' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Actions */}
                    <div>
                      <h4 className="font-medium text-white mb-3">Recommended Actions</h4>
                      <div className="space-y-3">
                        {prediction.recommendedActions.map((action) => (
                          <div key={action.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h5 className="font-medium text-white">{action.title}</h5>
                                <p className="text-sm text-gray-300">{action.description}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(action.priority)}`}>
                                {action.priority}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-gray-400">Impact:</span>
                                <div className="text-white">{action.impact}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Effort:</span>
                                <div className="text-white capitalize">{action.effort}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Cost:</span>
                                <div className="text-red-400">${action.cost}</div>
                              </div>
                              <div>
                                <span className="text-gray-400">Savings:</span>
                                <div className="text-green-400">${action.savings}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-sm text-gray-400">Timeline: {action.timeline}</span>
                              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                                Execute Action
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    {prediction.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {prediction.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredPredictions.length === 0 && (
        <div className="text-center py-12">
          <Crystal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No predictions available</h3>
          <p className="text-gray-500">
            {predictions.length === 0 
              ? 'AI models are analyzing your data. Predictions will appear shortly.'
              : 'No predictions match your current filter.'
            }
          </p>
        </div>
      )}
    </div>
  );
}