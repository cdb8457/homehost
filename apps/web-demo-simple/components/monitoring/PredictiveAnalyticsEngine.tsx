'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Clock,
  Calendar,
  BarChart3,
  LineChart,
  PieChart,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Edit,
  Save,
  Copy,
  ExternalLink,
  Maximize,
  Minimize,
  Grid3X3,
  List,
  Layers,
  Server,
  Database,
  Network,
  Cpu,
  MemoryStick,
  HardDrive,
  Users,
  Globe,
  Shield,
  Fire,
  Sparkles,
  Lightbulb,
  Star,
  Award,
  Crown,
  Heart,
  ThumbsUp,
  MessageCircle,
  Bell,
  BellOff,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  FileText,
  Play,
  Pause,
  Square,
  RotateCcw,
  Gamepad2
} from 'lucide-react';

interface PredictionModel {
  id: string;
  name: string;
  type: 'performance' | 'capacity' | 'failure' | 'resource' | 'player_behavior' | 'security';
  algorithm: 'neural_network' | 'random_forest' | 'gradient_boosting' | 'arima' | 'lstm' | 'isolation_forest';
  status: 'training' | 'active' | 'inactive' | 'failed' | 'updating';
  accuracy: number;
  confidence: number;
  lastTrained: number;
  trainingData: {
    samples: number;
    features: number;
    timeRange: string;
    sources: string[];
  };
  performance: {
    precision: number;
    recall: number;
    f1Score: number;
    mae: number;
    rmse: number;
  };
  hyperparameters: Record<string, any>;
  version: string;
  deployedAt: number;
}

interface Prediction {
  id: string;
  modelId: string;
  serverId: string;
  serverName: string;
  type: 'performance_degradation' | 'capacity_shortage' | 'hardware_failure' | 'security_incident' | 'player_surge' | 'resource_exhaustion';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  probability: number;
  timeframe: {
    predictedAt: number;
    expectedAt: number;
    window: string;
  };
  impact: {
    severity: string;
    affectedSystems: string[];
    estimatedDowntime: number;
    playerImpact: number;
    revenueImpact: number;
  };
  factors: PredictionFactor[];
  recommendations: PredictionRecommendation[];
  historical: {
    similar: number;
    accuracy: number;
    falsePositives: number;
  };
  status: 'active' | 'resolved' | 'false_positive' | 'escalated';
  feedback?: 'accurate' | 'inaccurate' | 'partially_correct';
}

interface PredictionFactor {
  name: string;
  importance: number;
  value: number;
  threshold: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  contribution: number;
}

interface PredictionRecommendation {
  action: string;
  priority: 'low' | 'medium' | 'high';
  impact: string;
  effort: 'minimal' | 'moderate' | 'significant';
  automation: boolean;
  cost: number;
  timeline: string;
}

interface ModelTrainingJob {
  id: string;
  modelId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt: number;
  estimatedCompletion?: number;
  dataSize: number;
  epochs: number;
  currentEpoch: number;
  losses: { epoch: number; loss: number; validation: number; }[];
  metrics: Record<string, number>;
  logs: string[];
}

interface AnalyticsInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'correlation' | 'trend' | 'optimization';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: string;
  data: any;
  actionable: boolean;
  dismissed: boolean;
  createdAt: number;
}

interface PredictiveAnalyticsEngineProps {
  className?: string;
}

export function PredictiveAnalyticsEngine({ className = '' }: PredictiveAnalyticsEngineProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<ModelTrainingJob[]>([]);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [selectedModel, setSelectedModel] = useState<PredictionModel | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'predictions' | 'training' | 'insights'>('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);

  const generateMockModels = useCallback((): PredictionModel[] => {
    const modelTypes = ['performance', 'capacity', 'failure', 'resource', 'player_behavior', 'security'] as const;
    const algorithms = ['neural_network', 'random_forest', 'gradient_boosting', 'arima', 'lstm', 'isolation_forest'] as const;
    const statuses = ['training', 'active', 'inactive', 'failed', 'updating'] as const;

    return Array.from({ length: 12 }, (_, i) => ({
      id: `model-${i + 1}`,
      name: `${modelTypes[i % modelTypes.length].charAt(0).toUpperCase() + modelTypes[i % modelTypes.length].slice(1)} Predictor ${i + 1}`,
      type: modelTypes[i % modelTypes.length],
      algorithm: algorithms[i % algorithms.length],
      status: statuses[i % statuses.length],
      accuracy: 0.75 + Math.random() * 0.24,
      confidence: 0.8 + Math.random() * 0.19,
      lastTrained: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      trainingData: {
        samples: Math.floor(10000 + Math.random() * 90000),
        features: Math.floor(20 + Math.random() * 80),
        timeRange: ['1 month', '3 months', '6 months', '1 year'][Math.floor(Math.random() * 4)],
        sources: ['server_metrics', 'player_data', 'system_logs', 'performance_data'].slice(0, Math.floor(2 + Math.random() * 3))
      },
      performance: {
        precision: 0.7 + Math.random() * 0.29,
        recall: 0.7 + Math.random() * 0.29,
        f1Score: 0.7 + Math.random() * 0.29,
        mae: Math.random() * 0.1,
        rmse: Math.random() * 0.15
      },
      hyperparameters: {
        learning_rate: 0.001 + Math.random() * 0.009,
        batch_size: [32, 64, 128, 256][Math.floor(Math.random() * 4)],
        epochs: Math.floor(50 + Math.random() * 150),
        regularization: Math.random() * 0.1
      },
      version: `v${Math.floor(1 + Math.random() * 5)}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      deployedAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    }));
  }, []);

  const generateMockPredictions = useCallback((): Prediction[] => {
    const types = ['performance_degradation', 'capacity_shortage', 'hardware_failure', 'security_incident', 'player_surge', 'resource_exhaustion'] as const;
    const severities = ['low', 'medium', 'high', 'critical'] as const;
    const statuses = ['active', 'resolved', 'false_positive', 'escalated'] as const;

    return Array.from({ length: 15 }, (_, i) => ({
      id: `prediction-${i + 1}`,
      modelId: `model-${Math.floor(Math.random() * 12) + 1}`,
      serverId: `server-${Math.floor(Math.random() * 10) + 1}`,
      serverName: `GameServer-${Math.floor(Math.random() * 10) + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      confidence: 0.6 + Math.random() * 0.39,
      probability: 0.3 + Math.random() * 0.69,
      timeframe: {
        predictedAt: Date.now() - Math.random() * 2 * 60 * 60 * 1000,
        expectedAt: Date.now() + Math.random() * 24 * 60 * 60 * 1000,
        window: ['1 hour', '6 hours', '12 hours', '24 hours'][Math.floor(Math.random() * 4)]
      },
      impact: {
        severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
        affectedSystems: ['Game Engine', 'Database', 'Network', 'Storage'].slice(0, Math.floor(1 + Math.random() * 3)),
        estimatedDowntime: Math.floor(Math.random() * 120),
        playerImpact: Math.floor(Math.random() * 1000),
        revenueImpact: Math.floor(Math.random() * 10000)
      },
      factors: Array.from({ length: Math.floor(3 + Math.random() * 5) }, (_, j) => ({
        name: ['CPU Usage', 'Memory Usage', 'Disk I/O', 'Network Latency', 'Player Count', 'Error Rate'][j % 6],
        importance: Math.random(),
        value: Math.random() * 100,
        threshold: 50 + Math.random() * 40,
        trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as const,
        contribution: Math.random()
      })),
      recommendations: Array.from({ length: Math.floor(2 + Math.random() * 4) }, (_, k) => ({
        action: [
          'Scale up server resources',
          'Restart affected services',
          'Apply configuration changes',
          'Enable load balancing',
          'Update security policies'
        ][k % 5],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as const,
        impact: ['Minor improvement', 'Moderate improvement', 'Significant improvement'][Math.floor(Math.random() * 3)],
        effort: ['minimal', 'moderate', 'significant'][Math.floor(Math.random() * 3)] as const,
        automation: Math.random() > 0.5,
        cost: Math.floor(Math.random() * 1000),
        timeline: ['Immediate', '1 hour', '6 hours', '24 hours'][Math.floor(Math.random() * 4)]
      })),
      historical: {
        similar: Math.floor(Math.random() * 20),
        accuracy: 0.7 + Math.random() * 0.29,
        falsePositives: Math.floor(Math.random() * 5)
      },
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }));
  }, []);

  const generateMockTrainingJobs = useCallback((): ModelTrainingJob[] => {
    const statuses = ['queued', 'running', 'completed', 'failed', 'cancelled'] as const;

    return Array.from({ length: 8 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const progress = status === 'completed' ? 100 : status === 'running' ? Math.floor(Math.random() * 90) + 10 : 0;
      const epochs = Math.floor(50 + Math.random() * 100);
      const currentEpoch = Math.floor((progress / 100) * epochs);

      return {
        id: `job-${i + 1}`,
        modelId: `model-${Math.floor(Math.random() * 12) + 1}`,
        status,
        progress,
        startedAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
        estimatedCompletion: status === 'running' ? Date.now() + Math.random() * 6 * 60 * 60 * 1000 : undefined,
        dataSize: Math.floor(100 + Math.random() * 900), // MB
        epochs,
        currentEpoch,
        losses: Array.from({ length: currentEpoch }, (_, j) => ({
          epoch: j + 1,
          loss: 1.0 - (j / epochs) * 0.8 + Math.random() * 0.1,
          validation: 1.1 - (j / epochs) * 0.75 + Math.random() * 0.15
        })),
        metrics: {
          accuracy: 0.5 + (currentEpoch / epochs) * 0.4 + Math.random() * 0.1,
          loss: 1.0 - (currentEpoch / epochs) * 0.8 + Math.random() * 0.1,
          val_accuracy: 0.45 + (currentEpoch / epochs) * 0.35 + Math.random() * 0.15,
          val_loss: 1.1 - (currentEpoch / epochs) * 0.75 + Math.random() * 0.15
        },
        logs: [
          'Initializing training environment...',
          'Loading training data...',
          'Preprocessing features...',
          'Starting model training...',
          `Epoch ${currentEpoch}/${epochs} completed`
        ].slice(0, status === 'running' ? 5 : 3)
      };
    });
  }, []);

  const generateMockInsights = useCallback((): AnalyticsInsight[] => {
    const types = ['pattern', 'anomaly', 'correlation', 'trend', 'optimization'] as const;
    const impacts = ['low', 'medium', 'high'] as const;

    return Array.from({ length: 10 }, (_, i) => ({
      id: `insight-${i + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      title: [
        'CPU usage spike pattern detected',
        'Memory leak correlation identified',
        'Player activity optimization opportunity',
        'Network latency trend analysis',
        'Storage optimization potential found',
        'Security anomaly pattern detected',
        'Performance degradation correlation',
        'Resource allocation inefficiency',
        'Player behavior pattern change',
        'System bottleneck identification'
      ][i],
      description: [
        'Recurring CPU usage spikes detected every 4 hours during peak gaming periods.',
        'Strong correlation between memory usage and player disconnections identified.',
        'Opportunity to optimize player matchmaking for 15% performance improvement.',
        'Network latency showing gradual increase over the past week.',
        'Storage compression could reduce disk usage by 30% without performance impact.',
        'Unusual login patterns detected that may indicate security concerns.',
        'Performance degradation strongly correlated with specific game events.',
        'Current resource allocation is suboptimal for current usage patterns.',
        'Player behavior patterns have shifted, requiring strategy adjustment.',
        'Database query bottleneck identified during peak hours.'
      ][i],
      confidence: 0.7 + Math.random() * 0.29,
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      category: ['Performance', 'Security', 'Optimization', 'Player Experience', 'Resource Management'][Math.floor(Math.random() * 5)],
      data: {
        metric: ['CPU', 'Memory', 'Network', 'Disk', 'Players'][Math.floor(Math.random() * 5)],
        change: (Math.random() - 0.5) * 100,
        timeframe: '7 days'
      },
      actionable: Math.random() > 0.3,
      dismissed: Math.random() > 0.8,
      createdAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000
    }));
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setModels(generateMockModels());
      setPredictions(generateMockPredictions());
      setTrainingJobs(generateMockTrainingJobs());
      setInsights(generateMockInsights());
    } catch (error) {
      console.error('Failed to load predictive analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockModels, generateMockPredictions, generateMockTrainingJobs, generateMockInsights]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadData();
      }, refreshInterval * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loadData]);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const formatTimeUntil = (timestamp: number) => {
    const diff = timestamp - Date.now();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (diff < 0) return 'Overdue';
    if (days > 0) return `in ${days}d`;
    if (hours > 0) return `in ${hours}h`;
    if (minutes > 0) return `in ${minutes}m`;
    return 'Imminent';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'running': return 'text-green-600 bg-green-50';
      case 'training': case 'queued': return 'text-blue-600 bg-blue-50';
      case 'inactive': case 'completed': return 'text-gray-600 bg-gray-50';
      case 'failed': case 'error': return 'text-red-600 bg-red-50';
      case 'updating': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const activeModels = models.filter(m => m.status === 'active').length;
  const activePredictions = predictions.filter(p => p.status === 'active').length;
  const criticalPredictions = predictions.filter(p => p.severity === 'critical').length;
  const avgAccuracy = models.length > 0 ? models.reduce((sum, m) => sum + m.accuracy, 0) / models.length : 0;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Predictive Analytics Engine</h2>
              <p className="text-sm text-gray-500">AI-powered predictive insights and forecasting</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded ${autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={loadData}
              className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Models</p>
                <p className="text-2xl font-bold text-blue-900">{activeModels}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Predictions</p>
                <p className="text-2xl font-bold text-green-900">{activePredictions}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-900">{criticalPredictions}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg Accuracy</p>
                <p className="text-2xl font-bold text-purple-900">{(avgAccuracy * 100).toFixed(1)}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mt-6">
          {['overview', 'models', 'predictions', 'training', 'insights'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Predictions</h3>
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {predictions.slice(0, 5).map((prediction) => (
                    <div key={prediction.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{prediction.serverName}</p>
                        <p className="text-xs text-gray-500">{prediction.type.replace('_', ' ')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(prediction.severity)}`}>
                          {prediction.severity}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{(prediction.confidence * 100).toFixed(0)}% confidence</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Model Performance</h3>
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {models.slice(0, 5).map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{model.name}</p>
                        <p className="text-xs text-gray-500">{model.algorithm}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(model.status)}`}>
                          {model.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{(model.accuracy * 100).toFixed(1)}% accuracy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                <Lightbulb className="h-5 w-5 text-gray-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {insights.slice(0, 4).map((insight) => (
                  <div key={insight.id} className="p-4 bg-white rounded border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900">{insight.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(insight.impact)}`}>
                        {insight.impact}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{insight.category}</span>
                      <span className="text-xs text-blue-600">{(insight.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Prediction Models</h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Plus className="h-4 w-4 inline mr-1" />
                  New Model
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Import
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {models.map((model) => (
                <div key={model.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getStatusColor(model.status)}`}>
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{model.name}</h4>
                        <p className="text-sm text-gray-500">{model.algorithm} • {model.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(model.status)}`}>
                        {model.status}
                      </span>
                      <button
                        onClick={() => setSelectedModel(model)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Accuracy</p>
                      <p className="font-semibold text-green-600">{(model.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="font-semibold text-blue-600">{(model.confidence * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Training Data</p>
                      <p className="font-semibold text-gray-900">{model.trainingData.samples.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Last Trained</p>
                      <p className="font-semibold text-gray-900">{formatTimeAgo(model.lastTrained)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>v{model.version}</span>
                      <span>{model.trainingData.features} features</span>
                      <span>{model.trainingData.timeRange} data</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="p-1 text-gray-400 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600">
                        <Play className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active Predictions</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Types</option>
                  <option>Performance</option>
                  <option>Capacity</option>
                  <option>Security</option>
                  <option>Hardware</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {predictions.map((prediction) => (
                <div key={prediction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getSeverityColor(prediction.severity)}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{prediction.serverName}</h4>
                        <p className="text-sm text-gray-500">{prediction.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(prediction.severity)}`}>
                        {prediction.severity}
                      </span>
                      <span className="text-sm text-gray-500">{formatTimeUntil(prediction.timeframe.expectedAt)}</span>
                      <button
                        onClick={() => setSelectedPrediction(prediction)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="font-semibold text-blue-600">{(prediction.confidence * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Probability</p>
                      <p className="font-semibold text-orange-600">{(prediction.probability * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Player Impact</p>
                      <p className="font-semibold text-red-600">{prediction.impact.playerImpact}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {prediction.factors.slice(0, 3).map((factor, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {factor.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                        Accept
                      </button>
                      <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">
                        Dismiss
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Training Jobs</h3>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                <Plus className="h-4 w-4 inline mr-1" />
                Start Training
              </button>
            </div>

            <div className="grid gap-4">
              {trainingJobs.map((job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getStatusColor(job.status)}`}>
                        <Zap className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Training Job #{job.id.split('-')[1]}</h4>
                        <p className="text-sm text-gray-500">Model: {job.modelId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      {job.status === 'running' && (
                        <span className="text-sm text-blue-600">{job.progress}%</span>
                      )}
                    </div>
                  </div>

                  {job.status === 'running' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Data Size</p>
                      <p className="font-semibold text-gray-900">{job.dataSize} MB</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Epochs</p>
                      <p className="font-semibold text-gray-900">{job.currentEpoch}/{job.epochs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Started</p>
                      <p className="font-semibold text-gray-900">{formatTimeAgo(job.startedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ETA</p>
                      <p className="font-semibold text-gray-900">
                        {job.estimatedCompletion ? formatTimeUntil(job.estimatedCompletion) : '-'}
                      </p>
                    </div>
                  </div>

                  {job.status === 'running' && (
                    <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Accuracy</p>
                        <p className="font-semibold text-green-600">{(job.metrics.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Loss</p>
                        <p className="font-semibold text-red-600">{job.metrics.loss.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Val Accuracy</p>
                        <p className="font-semibold text-blue-600">{(job.metrics.val_accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Val Loss</p>
                        <p className="font-semibold text-orange-600">{job.metrics.val_loss.toFixed(4)}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      {job.status === 'running' && (
                        <>
                          <button className="p-1 text-yellow-600 hover:text-yellow-700">
                            <Pause className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:text-red-700">
                            <Square className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {job.status === 'completed' && (
                        <button className="p-1 text-green-600 hover:text-green-700">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">AI-Generated Insights</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Types</option>
                  <option>Patterns</option>
                  <option>Anomalies</option>
                  <option>Correlations</option>
                  <option>Trends</option>
                  <option>Optimizations</option>
                </select>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 inline mr-1" />
                  Generate
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {insights.map((insight) => (
                <div key={insight.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getSeverityColor(insight.impact)}`}>
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-500">{insight.type} • {insight.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(insight.impact)}`}>
                        {insight.impact} impact
                      </span>
                      <span className="text-sm text-blue-600">{(insight.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{insight.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Generated {formatTimeAgo(insight.createdAt)}</span>
                      {insight.actionable && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          Actionable
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                        Act on This
                      </button>
                      <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">
                        Dismiss
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Model Details: {selectedModel.name}</h3>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Model Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Algorithm:</span>
                      <span className="font-medium">{selectedModel.algorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{selectedModel.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Version:</span>
                      <span className="font-medium">{selectedModel.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedModel.status)}`}>
                        {selectedModel.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Accuracy:</span>
                      <span className="font-medium text-green-600">{(selectedModel.accuracy * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Precision:</span>
                      <span className="font-medium">{(selectedModel.performance.precision * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recall:</span>
                      <span className="font-medium">{(selectedModel.performance.recall * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">F1 Score:</span>
                      <span className="font-medium">{(selectedModel.performance.f1Score * 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Training Data</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block">Samples</span>
                    <span className="font-medium">{selectedModel.trainingData.samples.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Features</span>
                    <span className="font-medium">{selectedModel.trainingData.features}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Time Range</span>
                    <span className="font-medium">{selectedModel.trainingData.timeRange}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Sources</span>
                    <span className="font-medium">{selectedModel.trainingData.sources.length}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Hyperparameters</h4>
                <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                  {Object.entries(selectedModel.hyperparameters).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-1">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-medium">{typeof value === 'number' ? value.toFixed(4) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPrediction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Prediction Details</h3>
                <button
                  onClick={() => setSelectedPrediction(null)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Prediction Overview</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 block text-sm">Server</span>
                      <span className="font-medium">{selectedPrediction.serverName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Type</span>
                      <span className="font-medium">{selectedPrediction.type.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Expected</span>
                      <span className="font-medium">{formatTimeUntil(selectedPrediction.timeframe.expectedAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Impact Assessment</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-500 block text-sm">Player Impact</span>
                      <span className="font-medium text-red-600">{selectedPrediction.impact.playerImpact} players</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Estimated Downtime</span>
                      <span className="font-medium">{selectedPrediction.impact.estimatedDowntime} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-sm">Revenue Impact</span>
                      <span className="font-medium text-red-600">${selectedPrediction.impact.revenueImpact}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contributing Factors</h4>
                <div className="space-y-2">
                  {selectedPrediction.factors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{factor.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({(factor.importance * 100).toFixed(0)}% importance)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{factor.value.toFixed(1)}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          factor.trend === 'increasing' ? 'bg-red-100 text-red-700' :
                          factor.trend === 'decreasing' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {factor.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                <div className="space-y-3">
                  {selectedPrediction.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{rec.action}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(rec.priority)}`}>
                            {rec.priority}
                          </span>
                          {rec.automation && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                              Automated
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{rec.impact}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Effort: {rec.effort}</span>
                        <span>Cost: ${rec.cost}</span>
                        <span>Timeline: {rec.timeline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}