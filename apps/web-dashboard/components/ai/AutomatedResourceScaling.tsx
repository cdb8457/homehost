'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Users,
  Clock,
  Settings,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar,
  DollarSign,
  Battery,
  Gauge,
  Server,
  Thermometer,
  Database,
  Globe,
  Shield,
  Timer,
  Award,
  Lightbulb,
  Wrench,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Minus,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  PieChart,
  LineChart,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ScalingRule {
  id: string;
  name: string;
  description: string;
  resourceType: 'cpu' | 'memory' | 'disk' | 'network' | 'instances';
  trigger: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number;
    duration: number; // minutes
    unit: string;
  };
  action: {
    type: 'scale_up' | 'scale_down' | 'maintain';
    amount: number;
    unit: 'percentage' | 'absolute' | 'instances';
    maxLimit?: number;
    minLimit?: number;
  };
  schedule?: {
    enabled: boolean;
    timeRanges: Array<{
      start: string;
      end: string;
      days: string[];
    }>;
  };
  enabled: boolean;
  priority: number;
  cooldown: number; // minutes
  createdAt: string;
  lastTriggered?: string;
  triggeredCount: number;
}

interface ScalingEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  serverId: string;
  timestamp: string;
  action: 'scale_up' | 'scale_down' | 'maintain';
  resourceType: string;
  trigger: {
    metric: string;
    value: number;
    threshold: number;
  };
  result: {
    success: boolean;
    oldValue: number;
    newValue: number;
    savings?: number;
    error?: string;
  };
  duration: number;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
}

interface ResourceMetrics {
  cpu: {
    current: number;
    average: number;
    peak: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  memory: {
    current: number;
    average: number;
    peak: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  disk: {
    current: number;
    average: number;
    peak: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  network: {
    current: number;
    average: number;
    peak: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
  };
  instances: {
    current: number;
    target: number;
    min: number;
    max: number;
  };
}

interface AutoScalingConfig {
  enabled: boolean;
  mode: 'conservative' | 'balanced' | 'aggressive';
  minInstances: number;
  maxInstances: number;
  targetUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
  healthCheckGracePeriod: number;
  terminationPolicy: 'oldest' | 'newest' | 'least_loaded';
  notifications: {
    enabled: boolean;
    channels: string[];
    events: string[];
  };
}

interface AutomatedResourceScalingProps {
  serverId: string;
  serverName: string;
}

export default function AutomatedResourceScaling({
  serverId,
  serverName
}: AutomatedResourceScalingProps) {
  const [scalingRules, setScalingRules] = useState<ScalingRule[]>([]);
  const [scalingEvents, setScalingEvents] = useState<ScalingEvent[]>([]);
  const [metrics, setMetrics] = useState<ResourceMetrics | null>(null);
  const [config, setConfig] = useState<AutoScalingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'events' | 'config'>('overview');
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<ScalingRule | null>(null);
  const [activeScaling, setActiveScaling] = useState<ScalingEvent | null>(null);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadScalingData();
    loadMetrics();
    
    // Set up real-time updates
    const metricsInterval = setInterval(loadMetrics, 30000);
    const eventsInterval = setInterval(loadScalingEvents, 10000);
    
    return () => {
      clearInterval(metricsInterval);
      clearInterval(eventsInterval);
    };
  }, [serverId]);

  const loadScalingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const mockRules = generateMockRules();
      const mockEvents = generateMockEvents();
      const mockConfig = generateMockConfig();

      setScalingRules(mockRules);
      setScalingEvents(mockEvents);
      setConfig(mockConfig);
    } catch (err) {
      setError('Failed to load scaling configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const mockMetrics = generateMockMetrics();
      setMetrics(mockMetrics);
    } catch (err) {
      // Silent fail for metrics
    }
  };

  const loadScalingEvents = async () => {
    try {
      // Check for active scaling events
      const activeEvent = scalingEvents.find(e => e.status === 'executing');
      setActiveScaling(activeEvent || null);
    } catch (err) {
      // Silent fail
    }
  };

  const generateMockRules = (): ScalingRule[] => [
    {
      id: '1',
      name: 'CPU Scale Up',
      description: 'Scale up when CPU usage exceeds 80% for 5 minutes',
      resourceType: 'cpu',
      trigger: {
        metric: 'cpu_usage',
        operator: '>',
        threshold: 80,
        duration: 5,
        unit: '%'
      },
      action: {
        type: 'scale_up',
        amount: 25,
        unit: 'percentage',
        maxLimit: 16
      },
      enabled: true,
      priority: 1,
      cooldown: 10,
      createdAt: new Date().toISOString(),
      lastTriggered: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      triggeredCount: 5
    },
    {
      id: '2',
      name: 'CPU Scale Down',
      description: 'Scale down when CPU usage drops below 30% for 15 minutes',
      resourceType: 'cpu',
      trigger: {
        metric: 'cpu_usage',
        operator: '<',
        threshold: 30,
        duration: 15,
        unit: '%'
      },
      action: {
        type: 'scale_down',
        amount: 20,
        unit: 'percentage',
        minLimit: 2
      },
      enabled: true,
      priority: 2,
      cooldown: 15,
      createdAt: new Date().toISOString(),
      lastTriggered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      triggeredCount: 3
    },
    {
      id: '3',
      name: 'Memory Emergency Scale',
      description: 'Emergency scaling when memory usage exceeds 95%',
      resourceType: 'memory',
      trigger: {
        metric: 'memory_usage',
        operator: '>',
        threshold: 95,
        duration: 1,
        unit: '%'
      },
      action: {
        type: 'scale_up',
        amount: 50,
        unit: 'percentage',
        maxLimit: 32
      },
      enabled: true,
      priority: 0, // Highest priority
      cooldown: 5,
      createdAt: new Date().toISOString(),
      triggeredCount: 1
    },
    {
      id: '4',
      name: 'Peak Hour Scaling',
      description: 'Proactive scaling during peak gaming hours',
      resourceType: 'instances',
      trigger: {
        metric: 'player_count',
        operator: '>',
        threshold: 40,
        duration: 2,
        unit: 'players'
      },
      action: {
        type: 'scale_up',
        amount: 2,
        unit: 'instances',
        maxLimit: 8
      },
      schedule: {
        enabled: true,
        timeRanges: [
          {
            start: '18:00',
            end: '23:00',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          }
        ]
      },
      enabled: true,
      priority: 3,
      cooldown: 20,
      createdAt: new Date().toISOString(),
      lastTriggered: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      triggeredCount: 8
    }
  ];

  const generateMockEvents = (): ScalingEvent[] => [
    {
      id: '1',
      ruleId: '1',
      ruleName: 'CPU Scale Up',
      serverId,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      action: 'scale_up',
      resourceType: 'cpu',
      trigger: {
        metric: 'cpu_usage',
        value: 85.4,
        threshold: 80
      },
      result: {
        success: true,
        oldValue: 4,
        newValue: 5,
        savings: -25
      },
      duration: 180,
      status: 'completed'
    },
    {
      id: '2',
      ruleId: '2',
      ruleName: 'CPU Scale Down',
      serverId,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: 'scale_down',
      resourceType: 'cpu',
      trigger: {
        metric: 'cpu_usage',
        value: 25.2,
        threshold: 30
      },
      result: {
        success: true,
        oldValue: 6,
        newValue: 5,
        savings: 35
      },
      duration: 120,
      status: 'completed'
    },
    {
      id: '3',
      ruleId: '4',
      ruleName: 'Peak Hour Scaling',
      serverId,
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      action: 'scale_up',
      resourceType: 'instances',
      trigger: {
        metric: 'player_count',
        value: 42,
        threshold: 40
      },
      result: {
        success: false,
        oldValue: 3,
        newValue: 3,
        error: 'Maximum instance limit reached'
      },
      duration: 60,
      status: 'failed'
    }
  ];

  const generateMockConfig = (): AutoScalingConfig => ({
    enabled: true,
    mode: 'balanced',
    minInstances: 2,
    maxInstances: 8,
    targetUtilization: 70,
    scaleUpCooldown: 300,
    scaleDownCooldown: 600,
    healthCheckGracePeriod: 180,
    terminationPolicy: 'least_loaded',
    notifications: {
      enabled: true,
      channels: ['email', 'webhook'],
      events: ['scale_up', 'scale_down', 'scale_failed']
    }
  });

  const generateMockMetrics = (): ResourceMetrics => ({
    cpu: {
      current: Math.random() * 30 + 50, // 50-80%
      average: Math.random() * 20 + 45, // 45-65%
      peak: Math.random() * 15 + 80, // 80-95%
      target: 70,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
    },
    memory: {
      current: Math.random() * 25 + 60, // 60-85%
      average: Math.random() * 20 + 55, // 55-75%
      peak: Math.random() * 10 + 85, // 85-95%
      target: 75,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
    },
    disk: {
      current: Math.random() * 15 + 70, // 70-85%
      average: Math.random() * 10 + 68, // 68-78%
      peak: Math.random() * 5 + 88, // 88-93%
      target: 80,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
    },
    network: {
      current: Math.random() * 20 + 40, // 40-60%
      average: Math.random() * 15 + 35, // 35-50%
      peak: Math.random() * 20 + 65, // 65-85%
      target: 60,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any
    },
    instances: {
      current: 3,
      target: 3,
      min: 2,
      max: 8
    }
  });

  const handleToggleRule = async (ruleId: string) => {
    try {
      setScalingRules(prev => prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      ));
    } catch (err) {
      setError('Failed to toggle scaling rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this scaling rule?')) return;
    
    try {
      setScalingRules(prev => prev.filter(rule => rule.id !== ruleId));
    } catch (err) {
      setError('Failed to delete scaling rule');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'cpu': return <Cpu className="w-4 h-4 text-blue-500" />;
      case 'memory': return <HardDrive className="w-4 h-4 text-green-500" />;
      case 'disk': return <Database className="w-4 h-4 text-purple-500" />;
      case 'network': return <Network className="w-4 h-4 text-orange-500" />;
      case 'instances': return <Server className="w-4 h-4 text-yellow-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'scale_up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'scale_down': return <ArrowDown className="w-4 h-4 text-blue-500" />;
      case 'maintain': return <ArrowRight className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-900';
      case 'failed': return 'text-red-500 bg-red-900';
      case 'executing': return 'text-blue-500 bg-blue-900';
      case 'pending': return 'text-yellow-500 bg-yellow-900';
      case 'cancelled': return 'text-gray-500 bg-gray-900';
      default: return 'text-gray-500 bg-gray-900';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading auto-scaling configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Automated Resource Scaling
          </h2>
          <p className="text-gray-400">Intelligent auto-scaling for {serverName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {config && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              config.enabled ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
            }`}>
              {config.enabled ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-sm font-medium">
                Auto-scaling {config.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          )}
          
          <button
            onClick={() => setShowRuleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Active Scaling */}
      {activeScaling && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Scaling Operation in Progress</h3>
                <p className="text-sm text-blue-200">
                  {activeScaling.ruleName} - {activeScaling.action.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Status</div>
              <div className="text-blue-100 font-medium capitalize">{activeScaling.status}</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
          { id: 'rules', label: 'Scaling Rules', icon: <Settings className="w-4 h-4" /> },
          { id: 'events', label: 'Events', icon: <Activity className="w-4 h-4" /> },
          { id: 'config', label: 'Configuration', icon: <Wrench className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Resource Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(metrics).filter(([key]) => key !== 'instances').map(([resource, data]) => (
                <div key={resource} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource)}
                      <h3 className="text-sm font-medium text-gray-300 capitalize">{resource}</h3>
                    </div>
                    {getTrendIcon(data.trend)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Current:</span>
                      <span className={`text-sm font-medium ${
                        data.current > data.target ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {data.current.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Target:</span>
                      <span className="text-sm text-gray-300">{data.target}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Peak:</span>
                      <span className="text-sm text-gray-300">{data.peak.toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          data.current > data.target ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, data.current)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instance Information */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Server className="w-5 h-5 text-yellow-500" />
                Instance Scaling
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{metrics.instances.current}</div>
                  <div className="text-sm text-gray-400">Current Instances</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{metrics.instances.target}</div>
                  <div className="text-sm text-gray-400">Target Instances</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{metrics.instances.min}</div>
                  <div className="text-sm text-gray-400">Minimum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{metrics.instances.max}</div>
                  <div className="text-sm text-gray-400">Maximum</div>
                </div>
              </div>
            </div>

            {/* Recent Events Summary */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Scaling Activity</h3>
              
              <div className="space-y-3">
                {scalingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActionIcon(event.action)}
                      <div>
                        <div className="font-medium text-white">{event.ruleName}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-300">
                          {event.result.oldValue} → {event.result.newValue}
                        </div>
                        {event.result.savings && (
                          <div className={`text-xs ${event.result.savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {event.result.savings > 0 ? '+' : ''}${event.result.savings}
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Scaling Rules</h3>
              <div className="text-sm text-gray-400">
                {scalingRules.filter(r => r.enabled).length} of {scalingRules.length} rules enabled
              </div>
            </div>
            
            <div className="space-y-3">
              {scalingRules.map((rule) => (
                <div key={rule.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getResourceIcon(rule.resourceType)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{rule.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            rule.enabled ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span className="text-xs text-gray-400">Priority: {rule.priority}</span>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">{rule.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Trigger:</span>
                            <div className="text-white">
                              {rule.trigger.metric} {rule.trigger.operator} {rule.trigger.threshold}{rule.trigger.unit}
                            </div>
                            <div className="text-xs text-gray-400">for {rule.trigger.duration}min</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Action:</span>
                            <div className="text-white capitalize">
                              {rule.action.type.replace('_', ' ')} by {rule.action.amount}
                              {rule.action.unit === 'percentage' ? '%' : ` ${rule.action.unit}`}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Cooldown:</span>
                            <div className="text-white">{rule.cooldown} minutes</div>
                            {rule.triggeredCount > 0 && (
                              <div className="text-xs text-gray-400">
                                Triggered {rule.triggeredCount} times
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {rule.schedule?.enabled && (
                          <div className="mt-2 text-xs text-blue-400">
                            Scheduled: {rule.schedule.timeRanges[0]?.start} - {rule.schedule.timeRanges[0]?.end}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.enabled 
                            ? 'text-green-400 hover:bg-green-900' 
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {rule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => {
                          setEditingRule(rule);
                          setShowRuleModal(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-red-400 hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Scaling Events</h3>
              <div className="text-sm text-gray-400">
                {scalingEvents.length} total events
              </div>
            </div>
            
            <div className="space-y-3">
              {scalingEvents.map((event) => (
                <div key={event.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getActionIcon(event.action)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{event.ruleName}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-300 mb-2">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Trigger:</span>
                            <div className="text-white">
                              {event.trigger.metric}: {event.trigger.value.toFixed(1)} > {event.trigger.threshold}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Result:</span>
                            <div className="text-white">
                              {event.result.oldValue} → {event.result.newValue}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Duration:</span>
                            <div className="text-white">{formatDuration(event.duration)}</div>
                            {event.result.savings && (
                              <div className={`text-xs ${event.result.savings > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {event.result.savings > 0 ? 'Saved' : 'Cost'} ${Math.abs(event.result.savings)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {event.result.error && (
                          <div className="mt-2 text-sm text-red-400">
                            Error: {event.result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && config && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Auto-Scaling Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scaling Mode
                    </label>
                    <select
                      value={config.mode}
                      onChange={(e) => setConfig(prev => prev ? {...prev, mode: e.target.value as any} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="conservative">Conservative</option>
                      <option value="balanced">Balanced</option>
                      <option value="aggressive">Aggressive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Utilization (%)
                    </label>
                    <input
                      type="number"
                      value={config.targetUtilization}
                      onChange={(e) => setConfig(prev => prev ? {...prev, targetUtilization: parseInt(e.target.value)} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      min="50"
                      max="90"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Min Instances
                      </label>
                      <input
                        type="number"
                        value={config.minInstances}
                        onChange={(e) => setConfig(prev => prev ? {...prev, minInstances: parseInt(e.target.value)} : null)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Instances
                      </label>
                      <input
                        type="number"
                        value={config.maxInstances}
                        onChange={(e) => setConfig(prev => prev ? {...prev, maxInstances: parseInt(e.target.value)} : null)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Scale Up Cooldown (s)
                      </label>
                      <input
                        type="number"
                        value={config.scaleUpCooldown}
                        onChange={(e) => setConfig(prev => prev ? {...prev, scaleUpCooldown: parseInt(e.target.value)} : null)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Scale Down Cooldown (s)
                      </label>
                      <input
                        type="number"
                        value={config.scaleDownCooldown}
                        onChange={(e) => setConfig(prev => prev ? {...prev, scaleDownCooldown: parseInt(e.target.value)} : null)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        min="60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Termination Policy
                    </label>
                    <select
                      value={config.terminationPolicy}
                      onChange={(e) => setConfig(prev => prev ? {...prev, terminationPolicy: e.target.value as any} : null)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="oldest">Oldest Instance</option>
                      <option value="newest">Newest Instance</option>
                      <option value="least_loaded">Least Loaded</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.notifications.enabled}
                        onChange={(e) => setConfig(prev => prev ? {
                          ...prev, 
                          notifications: {...prev.notifications, enabled: e.target.checked}
                        } : null)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-300">Enable Notifications</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    // Save configuration
                    alert('Configuration saved!');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rule Creation/Edit Modal */}
      {showRuleModal && (
        <ScalingRuleModal
          isOpen={showRuleModal}
          onClose={() => {
            setShowRuleModal(false);
            setEditingRule(null);
          }}
          onSave={(rule) => {
            if (editingRule) {
              setScalingRules(prev => prev.map(r => r.id === rule.id ? rule : r));
            } else {
              setScalingRules(prev => [...prev, { ...rule, id: Date.now().toString() }]);
            }
            setShowRuleModal(false);
            setEditingRule(null);
          }}
          rule={editingRule}
        />
      )}
    </div>
  );
}

// Scaling Rule Modal Component
function ScalingRuleModal({ 
  isOpen, 
  onClose, 
  onSave, 
  rule 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: ScalingRule) => void;
  rule?: ScalingRule | null;
}) {
  const [formData, setFormData] = useState<Partial<ScalingRule>>(
    rule || {
      name: '',
      description: '',
      resourceType: 'cpu',
      trigger: {
        metric: 'cpu_usage',
        operator: '>',
        threshold: 80,
        duration: 5,
        unit: '%'
      },
      action: {
        type: 'scale_up',
        amount: 25,
        unit: 'percentage'
      },
      enabled: true,
      priority: 1,
      cooldown: 10
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      alert('Please enter a rule name');
      return;
    }

    const newRule: ScalingRule = {
      ...formData,
      id: rule?.id || Date.now().toString(),
      createdAt: rule?.createdAt || new Date().toISOString(),
      triggeredCount: rule?.triggeredCount || 0
    } as ScalingRule;

    onSave(newRule);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {rule ? 'Edit Scaling Rule' : 'Create Scaling Rule'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter rule name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resource Type
                </label>
                <select
                  value={formData.resourceType || 'cpu'}
                  onChange={(e) => setFormData(prev => ({ ...prev, resourceType: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="cpu">CPU</option>
                  <option value="memory">Memory</option>
                  <option value="disk">Disk</option>
                  <option value="network">Network</option>
                  <option value="instances">Instances</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Describe what this rule does..."
                rows={3}
              />
            </div>

            {/* Trigger Configuration */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Trigger Conditions</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Metric
                  </label>
                  <input
                    type="text"
                    value={formData.trigger?.metric || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger!, metric: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operator
                  </label>
                  <select
                    value={formData.trigger?.operator || '>'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger!, operator: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value=">">Greater than</option>
                    <option value="<">Less than</option>
                    <option value=">=">Greater than or equal</option>
                    <option value="<=">Less than or equal</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.trigger?.threshold || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger!, threshold: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    value={formData.trigger?.duration || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      trigger: { ...prev.trigger!, duration: parseInt(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Configuration */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Action Configuration</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Action Type
                  </label>
                  <select
                    value={formData.action?.type || 'scale_up'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action!, type: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="scale_up">Scale Up</option>
                    <option value="scale_down">Scale Down</option>
                    <option value="maintain">Maintain</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.action?.amount || 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action!, amount: parseFloat(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={formData.action?.unit || 'percentage'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      action: { ...prev.action!, unit: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="absolute">Absolute</option>
                    <option value="instances">Instances</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="0"
                  max="10"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cooldown (min)
                </label>
                <input
                  type="number"
                  value={formData.cooldown || 10}
                  onChange={(e) => setFormData(prev => ({ ...prev, cooldown: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1"
                />
              </div>
              
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.enabled || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-300">Enable Rule</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {rule ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}