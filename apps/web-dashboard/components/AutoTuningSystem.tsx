'use client';

import { useState, useEffect } from 'react';
import { AutoTuningSystem, OptimizationEvent, ActiveOptimization, ServerMetrics } from '@/types/ai-optimization';
import { 
  Wrench, 
  Zap, 
  Target, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  ArrowUp, 
  ArrowDown, 
  BarChart3, 
  Cpu, 
  MemoryStick, 
  Network, 
  Users, 
  Gamepad2, 
  Shield, 
  RefreshCw, 
  Bot, 
  Sparkles, 
  Award, 
  Info, 
  Gauge, 
  Sliders, 
  MoreVertical,
  Edit,
  Save,
  X,
  Plus,
  Minus
} from 'lucide-react';

interface AutoTuningSystemProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator';
}

interface TuningParameter {
  id: string;
  name: string;
  category: 'performance' | 'resources' | 'game_specific' | 'network';
  currentValue: number | string;
  recommendedValue: number | string;
  minValue: number;
  maxValue: number;
  unit: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  autoTunable: boolean;
  lastChanged: Date;
}

export default function AutoTuningSystem({ 
  serverId, 
  serverName, 
  userRole = 'admin' 
}: AutoTuningSystemProps) {
  const [tuningSystem, setTuningSystem] = useState<AutoTuningSystem | null>(null);
  const [tuningParameters, setTuningParameters] = useState<TuningParameter[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'performance' | 'resources' | 'game_specific' | 'network'>('all');
  const [editingParameter, setEditingParameter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutoTuningSystem();
  }, [serverId]);

  const loadAutoTuningSystem = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock auto-tuning system data
    const mockTuningSystem: AutoTuningSystem = {
      serverId: serverId,
      enabled: true,
      mode: 'balanced',
      parameters: {
        maxCpuUsage: 80,
        maxMemoryUsage: 85,
        targetLatency: 50,
        minPlayerQuality: 7
      },
      optimizationHistory: [
        {
          id: 'event-1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'setting_adjusted',
          action: 'Increased server tick rate from 18 to 20 TPS',
          parameters: { tickRate: 20 },
          result: {
            success: true,
            performanceChange: 8.5,
            costChange: -2.30,
          },
          automated: true
        },
        {
          id: 'event-2',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          type: 'resource_scaled',
          action: 'Scaled CPU cores from 4 to 6',
          parameters: { cpuCores: 6 },
          result: {
            success: true,
            performanceChange: 15.2,
            costChange: -8.50,
          },
          automated: true
        },
        {
          id: 'event-3',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          type: 'configuration_changed',
          action: 'Optimized memory allocation for world chunks',
          parameters: { chunkMemory: 2048 },
          result: {
            success: true,
            performanceChange: 12.1,
            costChange: 0,
          },
          automated: true
        },
        {
          id: 'event-4',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          type: 'setting_adjusted',
          action: 'Adjusted network buffer size',
          parameters: { networkBuffer: 1024 },
          result: {
            success: false,
            performanceChange: -2.3,
            costChange: 0,
            error: 'Setting caused increased latency'
          },
          automated: true,
          reversedAt: new Date(Date.now() - 7.5 * 60 * 60 * 1000)
        }
      ],
      currentOptimizations: [
        {
          id: 'opt-1',
          type: 'performance_tuning',
          description: 'Optimizing garbage collection parameters',
          startedAt: new Date(Date.now() - 5 * 60 * 1000),
          progress: 78,
          estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000),
          currentStep: 'Applying GC optimization settings',
          canCancel: true,
          logs: [
            '[15:32:15] Starting GC optimization',
            '[15:32:16] Analyzing current GC patterns',
            '[15:32:18] Calculating optimal GC settings',
            '[15:32:20] Applying new GC parameters',
            '[15:32:22] Testing GC performance (78% complete)'
          ]
        }
      ]
    };

    // Mock tuning parameters
    const mockParameters: TuningParameter[] = [
      {
        id: 'tick_rate',
        name: 'Server Tick Rate',
        category: 'performance',
        currentValue: 20,
        recommendedValue: 22,
        minValue: 10,
        maxValue: 30,
        unit: 'TPS',
        description: 'How many times per second the server updates game state',
        impact: 'high',
        riskLevel: 'medium',
        autoTunable: true,
        lastChanged: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 'memory_heap',
        name: 'Java Heap Size',
        category: 'resources',
        currentValue: 8192,
        recommendedValue: 10240,
        minValue: 2048,
        maxValue: 16384,
        unit: 'MB',
        description: 'Amount of memory allocated to Java virtual machine',
        impact: 'high',
        riskLevel: 'low',
        autoTunable: true,
        lastChanged: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: 'chunk_render_distance',
        name: 'Chunk Render Distance',
        category: 'game_specific',
        currentValue: 12,
        recommendedValue: 10,
        minValue: 4,
        maxValue: 20,
        unit: 'chunks',
        description: 'How far players can see in the game world',
        impact: 'medium',
        riskLevel: 'low',
        autoTunable: true,
        lastChanged: new Date(Date.now() - 6 * 60 * 60 * 1000)
      },
      {
        id: 'network_buffer',
        name: 'Network Buffer Size',
        category: 'network',
        currentValue: 1024,
        recommendedValue: 1536,
        minValue: 512,
        maxValue: 4096,
        unit: 'KB',
        description: 'Size of network buffer for player connections',
        impact: 'medium',
        riskLevel: 'medium',
        autoTunable: true,
        lastChanged: new Date(Date.now() - 8 * 60 * 60 * 1000)
      },
      {
        id: 'gc_threads',
        name: 'Garbage Collection Threads',
        category: 'performance',
        currentValue: 4,
        recommendedValue: 6,
        minValue: 1,
        maxValue: 8,
        unit: 'threads',
        description: 'Number of threads used for garbage collection',
        impact: 'medium',
        riskLevel: 'medium',
        autoTunable: true,
        lastChanged: new Date(Date.now() - 10 * 60 * 60 * 1000)
      },
      {
        id: 'max_players',
        name: 'Maximum Players',
        category: 'game_specific',
        currentValue: 50,
        recommendedValue: 45,
        minValue: 10,
        maxValue: 100,
        unit: 'players',
        description: 'Maximum number of concurrent players',
        impact: 'high',
        riskLevel: 'high',
        autoTunable: false,
        lastChanged: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ];

    setTuningSystem(mockTuningSystem);
    setTuningParameters(mockParameters);
    setLoading(false);
  };

  const handleToggleSystem = async (enabled: boolean) => {
    console.log(`${enabled ? 'Enabling' : 'Disabling'} auto-tuning system`);
    
    setTuningSystem(prev => prev ? { ...prev, enabled } : null);
  };

  const handleModeChange = async (mode: 'conservative' | 'balanced' | 'aggressive') => {
    console.log(`Changing auto-tuning mode to: ${mode}`);
    
    setTuningSystem(prev => prev ? { ...prev, mode } : null);
  };

  const handleParameterChange = async (parameterId: string, value: number) => {
    console.log(`Updating parameter ${parameterId} to ${value}`);
    
    setTuningParameters(prev => prev.map(param =>
      param.id === parameterId 
        ? { ...param, currentValue: value, lastChanged: new Date() }
        : param
    ));

    // Create optimization event
    const newEvent: OptimizationEvent = {
      id: `event-${Date.now()}`,
      timestamp: new Date(),
      type: 'setting_adjusted',
      action: `Updated ${tuningParameters.find(p => p.id === parameterId)?.name} to ${value}`,
      parameters: { [parameterId]: value },
      result: {
        success: true,
        performanceChange: Math.random() * 10 - 5, // Random performance change
        costChange: Math.random() * 5 - 2.5, // Random cost change
      },
      automated: false
    };

    setTuningSystem(prev => prev ? {
      ...prev,
      optimizationHistory: [newEvent, ...prev.optimizationHistory]
    } : null);
  };

  const handleApplyRecommendation = async (parameterId: string) => {
    const parameter = tuningParameters.find(p => p.id === parameterId);
    if (!parameter) return;

    console.log(`Applying recommendation for ${parameterId}`);
    
    await handleParameterChange(parameterId, parameter.recommendedValue as number);
  };

  const handleRevertChange = async (eventId: string) => {
    console.log(`Reverting optimization event: ${eventId}`);
    
    setTuningSystem(prev => prev ? {
      ...prev,
      optimizationHistory: prev.optimizationHistory.map(event =>
        event.id === eventId 
          ? { ...event, reversedAt: new Date() }
          : event
      )
    } : null);
  };

  const handleCancelOptimization = async (optimizationId: string) => {
    console.log(`Canceling optimization: ${optimizationId}`);
    
    setTuningSystem(prev => prev ? {
      ...prev,
      currentOptimizations: prev.currentOptimizations.filter(opt => opt.id !== optimizationId)
    } : null);
  };

  const filteredParameters = tuningParameters.filter(param => 
    selectedCategory === 'all' || param.category === selectedCategory
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'conservative': return 'text-green-600 bg-green-100';
      case 'balanced': return 'text-blue-600 bg-blue-100';
      case 'aggressive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatValue = (value: number | string, unit: string) => {
    return `${value} ${unit}`;
  };

  const getPerformanceIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
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
              <Wrench className="w-6 h-6 text-indigo-600" />
              Auto-Tuning System - {serverName}
            </h2>
            <p className="text-gray-600">
              Intelligent performance optimization with automated parameter tuning
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleSystem(!tuningSystem?.enabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                tuningSystem?.enabled
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {tuningSystem?.enabled ? (
                <>
                  <Pause className="w-4 h-4" />
                  Disable
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Enable
                </>
              )}
            </button>
          </div>
        </div>

        {/* System Status */}
        {tuningSystem && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  tuningSystem.enabled ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="font-semibold text-gray-900">
                  Auto-Tuning {tuningSystem.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(tuningSystem.mode)}`}>
                  {tuningSystem.mode} mode
                </span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={tuningSystem.mode}
                  onChange={(e) => handleModeChange(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Max CPU:</span>
                <span className="font-medium">{tuningSystem.parameters.maxCpuUsage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <MemoryStick className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Max Memory:</span>
                <span className="font-medium">{tuningSystem.parameters.maxMemoryUsage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">Target Latency:</span>
                <span className="font-medium">{tuningSystem.parameters.targetLatency}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-gray-600">Min Quality:</span>
                <span className="font-medium">{tuningSystem.parameters.minPlayerQuality}/10</span>
              </div>
            </div>
          </div>
        )}

        {/* Active Optimizations */}
        {tuningSystem && tuningSystem.currentOptimizations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Active Optimizations
            </h3>
            <div className="space-y-3">
              {tuningSystem.currentOptimizations.map((optimization) => (
                <div key={optimization.id} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{optimization.description}</h4>
                      <p className="text-sm text-gray-600 mt-1">{optimization.currentStep}</p>
                    </div>
                    {optimization.canCancel && (
                      <button
                        onClick={() => handleCancelOptimization(optimization.id)}
                        className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
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
      </div>

      {/* Parameter Categories */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tuning Parameters</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {['performance', 'resources', 'game_specific', 'network'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as any)}
                className={`px-3 py-1 rounded-full text-sm transition-colors capitalize ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredParameters.map((parameter) => (
            <div key={parameter.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{parameter.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(parameter.impact)}`}>
                      {parameter.impact}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(parameter.riskLevel)}`}>
                      {parameter.riskLevel} risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{parameter.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {parameter.autoTunable && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Bot className="w-3 h-3" />
                      Auto
                    </div>
                  )}
                  <button
                    onClick={() => setEditingParameter(editingParameter === parameter.id ? null : parameter.id)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Value</div>
                  {editingParameter === parameter.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={parameter.currentValue as number}
                        min={parameter.minValue}
                        max={parameter.maxValue}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        onBlur={(e) => handleParameterChange(parameter.id, Number(e.target.value))}
                      />
                      <span className="text-sm text-gray-600">{parameter.unit}</span>
                    </div>
                  ) : (
                    <div className="font-medium text-gray-900">
                      {formatValue(parameter.currentValue, parameter.unit)}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">AI Recommended</div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-indigo-600">
                      {formatValue(parameter.recommendedValue, parameter.unit)}
                    </span>
                    {parameter.currentValue !== parameter.recommendedValue && (
                      <button
                        onClick={() => handleApplyRecommendation(parameter.id)}
                        className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs hover:bg-indigo-200"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Range: {parameter.minValue} - {parameter.maxValue} {parameter.unit}</span>
                <span>Updated: {parameter.lastChanged.toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization History */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Optimization History
        </h3>
        <div className="space-y-3">
          {tuningSystem?.optimizationHistory.slice(0, 10).map((event) => (
            <div key={event.id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium text-gray-900">{event.action}</span>
                    {event.automated && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        Automated
                      </span>
                    )}
                    {event.result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      {getPerformanceIcon(event.result.performanceChange)}
                      <span>Performance: {event.result.performanceChange > 0 ? '+' : ''}{event.result.performanceChange.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Cost: {formatCurrency(event.result.costChange)}</span>
                    </div>
                  </div>
                  
                  {event.result.error && (
                    <div className="text-sm text-red-600 mb-2">
                      Error: {event.result.error}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    {event.timestamp.toLocaleString()}
                    {event.reversedAt && (
                      <span className="ml-2 text-yellow-600">
                        (Reverted at {event.reversedAt.toLocaleTimeString()})
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {event.result.success && !event.reversedAt && (
                    <button
                      onClick={() => handleRevertChange(event.id)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                    >
                      Revert
                    </button>
                  )}
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}