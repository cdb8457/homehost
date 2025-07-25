'use client';

import { useState, useEffect } from 'react';
import { AIOptimizationEngine, ServerMetrics, OptimizationRecommendation, OptimizationFeature, ActiveOptimization } from '@/types/ai-optimization';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  MemoryStick, 
  HardDrive, 
  Network, 
  Users, 
  DollarSign, 
  Target, 
  Lightbulb, 
  Shield, 
  RefreshCw, 
  BarChart3, 
  Gauge, 
  Sparkles, 
  Bot, 
  Eye, 
  Wrench, 
  Rocket, 
  Award, 
  AlertCircle,
  Info,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AIOptimizationEngineProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator';
}

export default function AIOptimizationEngine({ 
  serverId, 
  serverName, 
  userRole = 'admin' 
}: AIOptimizationEngineProps) {
  const [engine, setEngine] = useState<AIOptimizationEngine | null>(null);
  const [metrics, setMetrics] = useState<ServerMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [activeOptimizations, setActiveOptimizations] = useState<ActiveOptimization[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIEngine();
    const interval = setInterval(loadAIEngine, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [serverId]);

  const loadAIEngine = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock AI engine data
    const mockEngine: AIOptimizationEngine = {
      id: 'ai-engine-1',
      serverId: serverId,
      status: 'active',
      enabledFeatures: [
        {
          id: 'resource_management',
          name: 'Intelligent Resource Management',
          type: 'resource_management',
          enabled: true,
          confidence: 0.89,
          impact: 'high',
          description: 'Automatically optimizes CPU, memory, and disk usage based on real-time demand',
          lastUsed: new Date(Date.now() - 300000) // 5 minutes ago
        },
        {
          id: 'predictive_scaling',
          name: 'Predictive Auto-Scaling',
          type: 'predictive_scaling',
          enabled: true,
          confidence: 0.76,
          impact: 'medium',
          description: 'Scales resources before peak periods based on historical patterns',
          lastUsed: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        {
          id: 'performance_tuning',
          name: 'Dynamic Performance Tuning',
          type: 'performance_tuning',
          enabled: true,
          confidence: 0.92,
          impact: 'high',
          description: 'Automatically adjusts server parameters for optimal game performance',
          lastUsed: new Date(Date.now() - 120000) // 2 minutes ago
        },
        {
          id: 'anomaly_detection',
          name: 'Anomaly Detection',
          type: 'anomaly_detection',
          enabled: true,
          confidence: 0.84,
          impact: 'medium',
          description: 'Detects unusual patterns and potential issues before they impact players',
          lastUsed: new Date(Date.now() - 600000) // 10 minutes ago
        }
      ],
      model: {
        id: 'homehost-ai-v2.1',
        name: 'HomeHost AI Optimization Model',
        version: '2.1.0',
        type: 'performance_prediction',
        accuracy: 89.2,
        trainingData: {
          samples: 2456789,
          lastTrained: new Date('2025-07-10'),
          features: ['cpu_usage', 'memory_usage', 'player_count', 'game_type', 'time_patterns']
        },
        status: 'trained'
      },
      lastOptimization: new Date(Date.now() - 120000),
      performanceGain: 34.2,
      costSavings: 127.45,
      recommendations: []
    };

    // Mock server metrics
    const mockMetrics: ServerMetrics = {
      timestamp: new Date(),
      serverId: serverId,
      cpu: {
        usage: 67.3,
        cores: 8,
        frequency: 3.2,
        temperature: 58
      },
      memory: {
        used: 6144,
        total: 16384,
        available: 10240,
        cached: 2048
      },
      disk: {
        used: 45.6,
        total: 500,
        readSpeed: 120,
        writeSpeed: 95,
        iops: 1250
      },
      network: {
        bytesIn: 15680000,
        bytesOut: 23450000,
        packetsIn: 12500,
        packetsOut: 18900,
        latency: 23,
        bandwidth: 1000
      },
      game: {
        playerCount: 24,
        maxPlayers: 50,
        tickRate: 20,
        avgResponseTime: 45,
        memoryUsage: 4096,
        worldSize: 1200
      }
    };

    // Mock recommendations
    const mockRecommendations: OptimizationRecommendation[] = [
      {
        id: 'rec-1',
        type: 'resource_adjustment',
        priority: 'high',
        title: 'Increase Memory Allocation',
        description: 'AI predicts memory usage will spike by 40% in the next 2 hours. Recommend increasing RAM allocation to prevent performance degradation.',
        expectedImpact: {
          performance: 25,
          cost: -8.50,
          implementation: 'automatic'
        },
        actions: [
          {
            id: 'action-1',
            type: 'scale_resources',
            description: 'Increase RAM from 16GB to 20GB',
            parameters: { memory: '20GB' },
            automated: true,
            reversible: true,
            riskLevel: 'low'
          }
        ],
        createdAt: new Date(Date.now() - 600000),
        status: 'pending'
      },
      {
        id: 'rec-2',
        type: 'configuration_change',
        priority: 'medium',
        title: 'Optimize Tick Rate',
        description: 'Based on current player count and activity patterns, reducing tick rate to 18 TPS would maintain quality while reducing CPU usage by 15%.',
        expectedImpact: {
          performance: 0,
          cost: 12.30,
          implementation: 'approval_required'
        },
        actions: [
          {
            id: 'action-2',
            type: 'adjust_settings',
            description: 'Reduce server tick rate from 20 to 18 TPS',
            parameters: { tickRate: 18 },
            automated: false,
            reversible: true,
            riskLevel: 'medium'
          }
        ],
        createdAt: new Date(Date.now() - 1200000),
        status: 'pending'
      },
      {
        id: 'rec-3',
        type: 'plugin_recommendation',
        priority: 'low',
        title: 'Install Performance Monitor Plugin',
        description: 'The Advanced Performance Monitor plugin would provide more detailed metrics for AI optimization.',
        expectedImpact: {
          performance: 5,
          cost: -4.99,
          implementation: 'manual'
        },
        actions: [
          {
            id: 'action-3',
            type: 'install_plugin',
            description: 'Install Advanced Performance Monitor v2.1',
            parameters: { pluginId: 'perf-monitor-pro' },
            automated: false,
            reversible: true,
            riskLevel: 'low'
          }
        ],
        createdAt: new Date(Date.now() - 1800000),
        status: 'pending'
      }
    ];

    // Mock active optimizations
    const mockActiveOptimizations: ActiveOptimization[] = [
      {
        id: 'opt-1',
        type: 'resource_scaling',
        description: 'Scaling CPU resources based on predicted load increase',
        startedAt: new Date(Date.now() - 180000),
        progress: 67,
        estimatedCompletion: new Date(Date.now() + 120000),
        currentStep: 'Applying new CPU allocation...',
        canCancel: true,
        logs: [
          '[14:32:15] Starting resource scaling optimization',
          '[14:32:16] Analyzing current resource usage patterns',
          '[14:32:18] Predicting resource requirements for next 2 hours',
          '[14:32:20] Calculated optimal CPU allocation: 4 → 6 cores',
          '[14:32:22] Initiating CPU scaling process',
          '[14:32:45] CPU scaling 67% complete...'
        ]
      }
    ];

    setEngine(mockEngine);
    setMetrics(mockMetrics);
    setRecommendations(mockRecommendations);
    setActiveOptimizations(mockActiveOptimizations);
    setLoading(false);
  };

  const handleToggleEngine = async (enabled: boolean) => {
    console.log(`${enabled ? 'Starting' : 'Stopping'} AI optimization engine`);
    
    setEngine(prev => prev ? {
      ...prev,
      status: enabled ? 'active' : 'paused'
    } : null);
  };

  const handleToggleFeature = async (featureId: string, enabled: boolean) => {
    console.log(`${enabled ? 'Enabling' : 'Disabling'} feature: ${featureId}`);
    
    setEngine(prev => prev ? {
      ...prev,
      enabledFeatures: prev.enabledFeatures.map(feature =>
        feature.id === featureId ? { ...feature, enabled } : feature
      )
    } : null);
  };

  const handleApplyRecommendation = async (recommendationId: string) => {
    console.log(`Applying recommendation: ${recommendationId}`);
    
    setRecommendations(prev => prev.map(rec =>
      rec.id === recommendationId ? { ...rec, status: 'approved' } : rec
    ));

    // Simulate implementation
    const newOptimization: ActiveOptimization = {
      id: `opt-${Date.now()}`,
      type: 'recommendation_implementation',
      description: 'Implementing AI recommendation',
      startedAt: new Date(),
      progress: 0,
      estimatedCompletion: new Date(Date.now() + 60000),
      currentStep: 'Preparing implementation...',
      canCancel: false,
      logs: [`[${new Date().toLocaleTimeString()}] Starting recommendation implementation`]
    };

    setActiveOptimizations(prev => [newOptimization, ...prev]);
  };

  const handleRejectRecommendation = async (recommendationId: string) => {
    console.log(`Rejecting recommendation: ${recommendationId}`);
    
    setRecommendations(prev => prev.map(rec =>
      rec.id === recommendationId ? { ...rec, status: 'rejected' } : rec
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'disabled': return 'text-gray-600 bg-gray-100';
      case 'learning': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number, unit: string = 'MB') => {
    if (unit === 'GB') return (bytes / 1024).toFixed(1);
    return bytes.toFixed(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-6 h-6 text-indigo-600" />
              AI Optimization Engine - {serverName}
            </h2>
            <p className="text-gray-600">
              Intelligent server optimization powered by machine learning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {showAdvanced ? 'Simple View' : 'Advanced View'}
            </button>
            <button
              onClick={() => handleToggleEngine(engine?.status !== 'active')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                engine?.status === 'active'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {engine?.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause AI
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Engine Status */}
        {engine && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  engine.status === 'active' ? 'bg-green-500' : 
                  engine.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
                <span className="font-semibold text-gray-900">
                  AI Engine {engine.status === 'active' ? 'Active' : 'Paused'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(engine.status)}`}>
                  {engine.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Last optimization: {engine.lastOptimization.toLocaleTimeString()}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Performance:</span>
                <span className="font-medium text-green-600">+{engine.performanceGain}%</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Cost Savings:</span>
                <span className="font-medium text-blue-600">{formatCurrency(engine.costSavings)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">Model:</span>
                <span className="font-medium text-purple-600">{engine.model.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-600" />
                <span className="text-gray-600">Accuracy:</span>
                <span className="font-medium text-orange-600">{engine.model.accuracy}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Server Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">CPU Usage</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.cpu.usage}%</div>
              <div className="text-sm text-blue-700">
                {metrics.cpu.cores} cores @ {metrics.cpu.frequency}GHz
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Temp: {metrics.cpu.temperature}°C
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MemoryStick className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">Memory</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatBytes(metrics.memory.used / 1024, 'GB')}GB
              </div>
              <div className="text-sm text-green-700">
                of {formatBytes(metrics.memory.total / 1024, 'GB')}GB total
              </div>
              <div className="text-xs text-green-600 mt-1">
                {Math.round((metrics.memory.used / metrics.memory.total) * 100)}% used
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Players</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{metrics.game.playerCount}</div>
              <div className="text-sm text-purple-700">
                of {metrics.game.maxPlayers} max
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {metrics.game.tickRate} TPS
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Performance</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{metrics.game.avgResponseTime}ms</div>
              <div className="text-sm text-orange-700">
                Response time
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {formatBytes(metrics.game.memoryUsage / 1024, 'GB')}GB game RAM
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Features */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Optimization Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {engine?.enabledFeatures.map((feature) => (
            <div key={feature.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{feature.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
                <label className="ml-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={feature.enabled}
                    onChange={(e) => handleToggleFeature(feature.id, e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Confidence:</span>
                    <span className={`font-medium ${getConfidenceColor(feature.confidence)}`}>
                      {(feature.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(feature.impact)}`}>
                      {feature.impact} impact
                    </span>
                  </div>
                </div>
                {feature.lastUsed && (
                  <div className="text-xs text-gray-500">
                    Last used: {feature.lastUsed.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Optimizations */}
      {activeOptimizations.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Active Optimizations
          </h3>
          <div className="space-y-4">
            {activeOptimizations.map((optimization) => (
              <div key={optimization.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{optimization.description}</h4>
                    <p className="text-sm text-gray-600 mt-1">{optimization.currentStep}</p>
                  </div>
                  {optimization.canCancel && (
                    <button className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                      Cancel
                    </button>
                  )}
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{optimization.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${optimization.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Started: {optimization.startedAt.toLocaleTimeString()}</span>
                  <span>ETA: {optimization.estimatedCompletion.toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Recommendations */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-600" />
          AI Recommendations
        </h3>
        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <div key={recommendation.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{recommendation.description}</p>
                </div>
                {recommendation.status === 'pending' && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleApplyRecommendation(recommendation.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleRejectRecommendation(recommendation.id)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Performance:</span>
                  <span className="font-medium text-green-600">+{recommendation.expectedImpact.performance}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-600">Cost Impact:</span>
                  <span className={`font-medium ${recommendation.expectedImpact.cost < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(recommendation.expectedImpact.cost)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-purple-600" />
                  <span className="text-gray-600">Implementation:</span>
                  <span className="font-medium text-purple-600">{recommendation.expectedImpact.implementation}</span>
                </div>
              </div>
            </div>
          ))}
          
          {recommendations.length === 0 && (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No recommendations at this time</h4>
              <p className="text-gray-600">
                The AI is continuously monitoring your server and will provide recommendations when optimization opportunities are detected.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}