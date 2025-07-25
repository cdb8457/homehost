'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  Settings,
  Target,
  BarChart3,
  LineChart,
  Clock,
  Calendar,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Users,
  Server,
  Database,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Edit,
  Save,
  Copy,
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
  Maximize,
  Minimize,
  Grid3X3,
  List,
  Layers,
  Fire,
  Sparkles,
  Lightbulb,
  Brain,
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
  Gamepad2
} from 'lucide-react';

interface ScalingPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'reactive' | 'predictive' | 'scheduled' | 'manual';
  target: {
    service: string;
    minInstances: number;
    maxInstances: number;
    desiredInstances: number;
  };
  triggers: ScalingTrigger[];
  actions: ScalingAction[];
  constraints: ScalingConstraint[];
  cooldown: {
    scaleUp: number;
    scaleDown: number;
  };
  statistics: {
    totalScaleEvents: number;
    successfulScales: number;
    failedScales: number;
    averageScaleTime: number;
    lastTriggered: number;
  };
  schedule?: ScheduleConfig;
  created: number;
  lastModified: number;
}

interface ScalingTrigger {
  id: string;
  metric: string;
  operator: 'greater_than' | 'less_than' | 'equal_to' | 'not_equal_to';
  threshold: number;
  duration: number;
  aggregation: 'average' | 'sum' | 'min' | 'max' | 'count';
  enabled: boolean;
  weight: number;
}

interface ScalingAction {
  id: string;
  type: 'scale_up' | 'scale_down' | 'scale_to' | 'notification' | 'custom';
  value: number;
  percentage?: number;
  notification?: {
    channels: string[];
    message: string;
  };
  customScript?: string;
  enabled: boolean;
  order: number;
}

interface ScalingConstraint {
  id: string;
  type: 'time_window' | 'resource_limit' | 'cost_limit' | 'dependency' | 'custom';
  value: any;
  enabled: boolean;
  description: string;
}

interface ScheduleConfig {
  timezone: string;
  rules: ScheduleRule[];
}

interface ScheduleRule {
  id: string;
  name: string;
  schedule: string; // cron expression
  action: 'scale_up' | 'scale_down' | 'scale_to';
  value: number;
  enabled: boolean;
}

interface ScalingEvent {
  id: string;
  policyId: string;
  policyName: string;
  serverId: string;
  serverName: string;
  type: 'scale_up' | 'scale_down' | 'scale_to';
  trigger: string;
  triggerValue: number;
  action: string;
  fromInstances: number;
  toInstances: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  startedAt: number;
  completedAt?: number;
  duration?: number;
  error?: string;
  metrics: {
    cpu: number;
    memory: number;
    network: number;
    players: number;
  };
  cost: number;
  efficiency: number;
}

interface ServerGroup {
  id: string;
  name: string;
  type: 'game_server' | 'database' | 'web_server' | 'cache' | 'load_balancer';
  region: string;
  currentInstances: number;
  targetInstances: number;
  minInstances: number;
  maxInstances: number;
  status: 'healthy' | 'scaling' | 'unhealthy' | 'maintenance';
  instances: ServerInstance[];
  policies: string[]; // policy IDs
  metrics: {
    avgCpu: number;
    avgMemory: number;
    avgNetwork: number;
    totalPlayers: number;
    requestsPerSecond: number;
  };
  costs: {
    hourly: number;
    daily: number;
    monthly: number;
  };
  lastScaled: number;
}

interface ServerInstance {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'starting' | 'stopping' | 'stopped' | 'error';
  launched: number;
  metrics: {
    cpu: number;
    memory: number;
    network: number;
    players: number;
  };
  cost: number;
  health: 'healthy' | 'degraded' | 'unhealthy';
}

interface ScalingRecommendation {
  id: string;
  serverGroupId: string;
  type: 'optimize_capacity' | 'reduce_costs' | 'improve_performance' | 'policy_adjustment';
  title: string;
  description: string;
  confidence: number;
  impact: {
    performance: number;
    cost: number;
    reliability: number;
  };
  actions: {
    action: string;
    value: any;
    expectedOutcome: string;
  }[];
  estimatedSavings: number;
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high';
  validUntil: number;
  applied: boolean;
}

interface AutoScalingManagementProps {
  className?: string;
}

export function AutoScalingManagement({ className = '' }: AutoScalingManagementProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [policies, setPolicies] = useState<ScalingPolicy[]>([]);
  const [events, setEvents] = useState<ScalingEvent[]>([]);
  const [serverGroups, setServerGroups] = useState<ServerGroup[]>([]);
  const [recommendations, setRecommendations] = useState<ScalingRecommendation[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<ScalingPolicy | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ScalingEvent | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ServerGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'groups' | 'events' | 'recommendations'>('overview');
  const [timeRange, setTimeRange] = useState('24h');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket | null>(null);

  const generateMockPolicies = useCallback((): ScalingPolicy[] => {
    const types = ['reactive', 'predictive', 'scheduled', 'manual'] as const;
    const priorities = ['low', 'medium', 'high', 'critical'] as const;
    const services = ['GameServer', 'DatabaseCluster', 'WebFrontend', 'CacheLayer', 'LoadBalancer'];

    return Array.from({ length: 8 }, (_, i) => ({
      id: `policy-${i + 1}`,
      name: `${services[i % services.length]} Auto-Scale Policy`,
      description: `Automatic scaling policy for ${services[i % services.length]} based on ${types[i % types.length]} triggers`,
      enabled: Math.random() > 0.2,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      type: types[i % types.length],
      target: {
        service: services[i % services.length],
        minInstances: Math.floor(1 + Math.random() * 3),
        maxInstances: Math.floor(10 + Math.random() * 20),
        desiredInstances: Math.floor(3 + Math.random() * 7)
      },
      triggers: Array.from({ length: Math.floor(2 + Math.random() * 4) }, (_, j) => ({
        id: `trigger-${j + 1}`,
        metric: ['cpu_usage', 'memory_usage', 'network_io', 'player_count', 'request_rate'][j % 5],
        operator: ['greater_than', 'less_than'][Math.floor(Math.random() * 2)] as const,
        threshold: 50 + Math.random() * 40,
        duration: Math.floor(60 + Math.random() * 300), // seconds
        aggregation: ['average', 'sum', 'min', 'max'][Math.floor(Math.random() * 4)] as const,
        enabled: Math.random() > 0.2,
        weight: Math.random()
      })),
      actions: Array.from({ length: Math.floor(1 + Math.random() * 3) }, (_, k) => ({
        id: `action-${k + 1}`,
        type: ['scale_up', 'scale_down', 'notification'][k % 3] as const,
        value: Math.floor(1 + Math.random() * 3),
        percentage: Math.random() > 0.5 ? Math.floor(10 + Math.random() * 40) : undefined,
        notification: k % 3 === 2 ? {
          channels: ['email', 'slack', 'webhook'],
          message: 'Scaling event triggered'
        } : undefined,
        enabled: Math.random() > 0.1,
        order: k + 1
      })),
      constraints: Array.from({ length: Math.floor(1 + Math.random() * 3) }, (_, l) => ({
        id: `constraint-${l + 1}`,
        type: ['time_window', 'cost_limit', 'resource_limit'][l % 3] as const,
        value: l % 3 === 0 ? '09:00-17:00' : l % 3 === 1 ? 1000 : 50,
        enabled: Math.random() > 0.3,
        description: 'Constraint description'
      })),
      cooldown: {
        scaleUp: Math.floor(60 + Math.random() * 240),
        scaleDown: Math.floor(300 + Math.random() * 600)
      },
      statistics: {
        totalScaleEvents: Math.floor(Math.random() * 100),
        successfulScales: Math.floor(Math.random() * 90),
        failedScales: Math.floor(Math.random() * 10),
        averageScaleTime: Math.floor(30 + Math.random() * 120),
        lastTriggered: Date.now() - Math.random() * 24 * 60 * 60 * 1000
      },
      schedule: types[i % types.length] === 'scheduled' ? {
        timezone: 'UTC',
        rules: [{
          id: 'schedule-1',
          name: 'Peak Hours Scale Up',
          schedule: '0 8 * * 1-5',
          action: 'scale_up',
          value: 2,
          enabled: true
        }]
      } : undefined,
      created: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      lastModified: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
    }));
  }, []);

  const generateMockEvents = useCallback((): ScalingEvent[] => {
    const types = ['scale_up', 'scale_down', 'scale_to'] as const;
    const statuses = ['pending', 'in_progress', 'completed', 'failed', 'cancelled'] as const;
    const triggers = ['CPU High', 'Memory High', 'Player Count High', 'Network Congestion', 'Schedule'];

    return Array.from({ length: 20 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const startedAt = Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000;
      const duration = status === 'completed' ? Math.floor(30 + Math.random() * 300) : undefined;
      const completedAt = duration ? startedAt + duration * 1000 : undefined;

      return {
        id: `event-${i + 1}`,
        policyId: `policy-${Math.floor(Math.random() * 8) + 1}`,
        policyName: `Auto-Scale Policy ${Math.floor(Math.random() * 8) + 1}`,
        serverId: `server-group-${Math.floor(Math.random() * 5) + 1}`,
        serverName: `ServerGroup-${Math.floor(Math.random() * 5) + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        trigger: triggers[Math.floor(Math.random() * triggers.length)],
        triggerValue: 50 + Math.random() * 40,
        action: 'Scale instances',
        fromInstances: Math.floor(1 + Math.random() * 10),
        toInstances: Math.floor(1 + Math.random() * 15),
        status,
        startedAt,
        completedAt,
        duration,
        error: status === 'failed' ? 'Insufficient capacity in region' : undefined,
        metrics: {
          cpu: 20 + Math.random() * 80,
          memory: 30 + Math.random() * 60,
          network: 10 + Math.random() * 50,
          players: Math.floor(Math.random() * 1000)
        },
        cost: Math.floor(Math.random() * 500),
        efficiency: 0.6 + Math.random() * 0.39
      };
    });
  }, []);

  const generateMockServerGroups = useCallback((): ServerGroup[] => {
    const types = ['game_server', 'database', 'web_server', 'cache', 'load_balancer'] as const;
    const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'];
    const statuses = ['healthy', 'scaling', 'unhealthy', 'maintenance'] as const;

    return Array.from({ length: 6 }, (_, i) => {
      const currentInstances = Math.floor(2 + Math.random() * 8);
      const instances = Array.from({ length: currentInstances }, (_, j) => ({
        id: `instance-${i}-${j + 1}`,
        name: `Instance-${i}-${j + 1}`,
        type: types[i % types.length],
        status: ['running', 'starting', 'stopping', 'stopped', 'error'][Math.floor(Math.random() * 5)] as const,
        launched: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
        metrics: {
          cpu: 20 + Math.random() * 60,
          memory: 30 + Math.random() * 50,
          network: 10 + Math.random() * 40,
          players: Math.floor(Math.random() * 100)
        },
        cost: Math.floor(50 + Math.random() * 200),
        health: ['healthy', 'degraded', 'unhealthy'][Math.floor(Math.random() * 3)] as const
      }));

      return {
        id: `server-group-${i + 1}`,
        name: `${types[i % types.length]}-cluster-${i + 1}`,
        type: types[i % types.length],
        region: regions[i % regions.length],
        currentInstances,
        targetInstances: currentInstances + Math.floor((Math.random() - 0.5) * 4),
        minInstances: Math.floor(1 + Math.random() * 2),
        maxInstances: Math.floor(10 + Math.random() * 15),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        instances,
        policies: [`policy-${i + 1}`, `policy-${(i + 1) % 8 + 1}`],
        metrics: {
          avgCpu: instances.reduce((sum, inst) => sum + inst.metrics.cpu, 0) / instances.length,
          avgMemory: instances.reduce((sum, inst) => sum + inst.metrics.memory, 0) / instances.length,
          avgNetwork: instances.reduce((sum, inst) => sum + inst.metrics.network, 0) / instances.length,
          totalPlayers: instances.reduce((sum, inst) => sum + inst.metrics.players, 0),
          requestsPerSecond: Math.floor(100 + Math.random() * 900)
        },
        costs: {
          hourly: instances.reduce((sum, inst) => sum + inst.cost, 0),
          daily: instances.reduce((sum, inst) => sum + inst.cost, 0) * 24,
          monthly: instances.reduce((sum, inst) => sum + inst.cost, 0) * 24 * 30
        },
        lastScaled: Date.now() - Math.random() * 24 * 60 * 60 * 1000
      };
    });
  }, []);

  const generateMockRecommendations = useCallback((): ScalingRecommendation[] => {
    const types = ['optimize_capacity', 'reduce_costs', 'improve_performance', 'policy_adjustment'] as const;
    const efforts = ['low', 'medium', 'high'] as const;
    const priorities = ['low', 'medium', 'high'] as const;

    return Array.from({ length: 8 }, (_, i) => ({
      id: `recommendation-${i + 1}`,
      serverGroupId: `server-group-${Math.floor(Math.random() * 6) + 1}`,
      type: types[i % types.length],
      title: [
        'Optimize instance capacity during off-peak hours',
        'Reduce costs by adjusting scaling policies',
        'Improve performance with predictive scaling',
        'Adjust policy triggers for better efficiency',
        'Consolidate low-utilization instances',
        'Enable scheduled scaling for predictable workloads',
        'Fine-tune cooldown periods',
        'Implement cost-aware scaling constraints'
      ][i],
      description: [
        'Analysis shows 30% over-provisioning during night hours. Consider scheduled scale-down.',
        'Current scaling policies are too aggressive, leading to unnecessary costs.',
        'Enable predictive scaling to anticipate demand spikes and reduce response time.',
        'Trigger thresholds are causing frequent unnecessary scaling events.',
        'Multiple instances with <20% utilization could be consolidated.',
        'Workload patterns are predictable - scheduled scaling would be more efficient.',
        'Current cooldown periods are too short, causing oscillation.',
        'Add cost limits to prevent excessive scaling during unexpected spikes.'
      ][i],
      confidence: 0.7 + Math.random() * 0.29,
      impact: {
        performance: (Math.random() - 0.5) * 40,
        cost: (Math.random() - 0.2) * -30,
        reliability: Math.random() * 20
      },
      actions: [
        {
          action: 'Modify scaling policy',
          value: 'Reduce max instances from 15 to 10',
          expectedOutcome: '25% cost reduction'
        },
        {
          action: 'Update schedule',
          value: 'Add scale-down at 22:00',
          expectedOutcome: 'Improved efficiency'
        }
      ],
      estimatedSavings: Math.floor(100 + Math.random() * 1000),
      effort: efforts[Math.floor(Math.random() * efforts.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      validUntil: Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000,
      applied: Math.random() > 0.8
    }));
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPolicies(generateMockPolicies());
      setEvents(generateMockEvents());
      setServerGroups(generateMockServerGroups());
      setRecommendations(generateMockRecommendations());
    } catch (error) {
      console.error('Failed to load auto-scaling data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [generateMockPolicies, generateMockEvents, generateMockServerGroups, generateMockRecommendations]);

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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': case 'running': return 'text-green-600 bg-green-50';
      case 'scaling': case 'in_progress': case 'starting': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'unhealthy': case 'failed': case 'error': return 'text-red-600 bg-red-50';
      case 'maintenance': case 'stopped': case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const enabledPolicies = policies.filter(p => p.enabled).length;
  const totalScalingEvents = events.length;
  const activeScalingEvents = events.filter(e => e.status === 'in_progress').length;
  const totalInstances = serverGroups.reduce((sum, group) => sum + group.currentInstances, 0);
  const totalCostPerHour = serverGroups.reduce((sum, group) => sum + group.costs.hourly, 0);

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
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Auto-Scaling Management</h2>
              <p className="text-sm text-gray-500">Intelligent auto-scaling policies and resource optimization</p>
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

        <div className="grid grid-cols-5 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Policies</p>
                <p className="text-2xl font-bold text-green-900">{enabledPolicies}</p>
              </div>
              <Settings className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Instances</p>
                <p className="text-2xl font-bold text-blue-900">{totalInstances}</p>
              </div>
              <Server className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Scaling Events</p>
                <p className="text-2xl font-bold text-yellow-900">{totalScalingEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Scaling</p>
                <p className="text-2xl font-bold text-orange-900">{activeScalingEvents}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Cost/Hour</p>
                <p className="text-2xl font-bold text-purple-900">${totalCostPerHour}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="flex space-x-1 mt-6">
          {['overview', 'policies', 'groups', 'events', 'recommendations'].map((tab) => (
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
                  <h3 className="text-lg font-semibold text-gray-900">Recent Scaling Events</h3>
                  <Activity className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {events.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{event.serverName}</p>
                        <p className="text-xs text-gray-500">{event.type} • {event.trigger}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{event.fromInstances} → {event.toInstances}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Server Groups</h3>
                  <Server className="h-5 w-5 text-gray-600" />
                </div>
                <div className="space-y-3">
                  {serverGroups.slice(0, 5).map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-sm text-gray-900">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.type} • {group.region}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(group.status)}`}>
                          {group.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{group.currentInstances} instances</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
                <Lightbulb className="h-5 w-5 text-gray-600" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((recommendation) => (
                  <div key={recommendation.id} className="p-4 bg-white rounded border">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900">{recommendation.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{recommendation.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600">${recommendation.estimatedSavings}/month savings</span>
                      <span className="text-xs text-blue-600">{(recommendation.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Scaling Policies</h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Plus className="h-4 w-4 inline mr-1" />
                  New Policy
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  <Upload className="h-4 w-4 inline mr-1" />
                  Import
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {policies.map((policy) => (
                <div key={policy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${policy.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{policy.name}</h4>
                        <p className="text-sm text-gray-500">{policy.type} • {policy.target.service}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(policy.priority)}`}>
                        {policy.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${policy.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {policy.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        onClick={() => setSelectedPolicy(policy)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Min/Max Instances</p>
                      <p className="font-semibold text-gray-900">{policy.target.minInstances} - {policy.target.maxInstances}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Current/Target</p>
                      <p className="font-semibold text-blue-600">{policy.target.desiredInstances}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Events</p>
                      <p className="font-semibold text-green-600">{policy.statistics.totalScaleEvents}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Success Rate</p>
                      <p className="font-semibold text-purple-600">
                        {policy.statistics.totalScaleEvents > 0 
                          ? ((policy.statistics.successfulScales / policy.statistics.totalScaleEvents) * 100).toFixed(0)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{policy.triggers.length} triggers</span>
                      <span>{policy.actions.length} actions</span>
                      <span>Last: {formatTimeAgo(policy.statistics.lastTriggered)}</span>
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

        {activeTab === 'groups' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Server Groups</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Regions</option>
                  <option>us-east-1</option>
                  <option>us-west-2</option>
                  <option>eu-west-1</option>
                </select>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Types</option>
                  <option>Game Server</option>
                  <option>Database</option>
                  <option>Web Server</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {serverGroups.map((group) => (
                <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getStatusColor(group.status)}`}>
                        <Server className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{group.name}</h4>
                        <p className="text-sm text-gray-500">{group.type} • {group.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(group.status)}`}>
                        {group.status}
                      </span>
                      <button
                        onClick={() => setSelectedGroup(group)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Instances</p>
                      <p className="font-semibold text-blue-600">{group.currentInstances} / {group.targetInstances}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CPU</p>
                      <p className="font-semibold text-orange-600">{group.metrics.avgCpu.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Memory</p>
                      <p className="font-semibold text-purple-600">{group.metrics.avgMemory.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Players</p>
                      <p className="font-semibold text-green-600">{group.metrics.totalPlayers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cost/Hour</p>
                      <p className="font-semibold text-red-600">${group.costs.hourly}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{group.policies.length} policies</span>
                      <span>Min: {group.minInstances}</span>
                      <span>Max: {group.maxInstances}</span>
                      <span>Last scaled: {formatTimeAgo(group.lastScaled)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200">
                        Scale Now
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

        {activeTab === 'events' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Scaling Events</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>In Progress</option>
                  <option>Failed</option>
                </select>
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Types</option>
                  <option>Scale Up</option>
                  <option>Scale Down</option>
                  <option>Scale To</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getStatusColor(event.status)}`}>
                        {event.type === 'scale_up' ? <TrendingUp className="h-5 w-5" /> :
                         event.type === 'scale_down' ? <TrendingDown className="h-5 w-5" /> :
                         <Target className="h-5 w-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.serverName}</h4>
                        <p className="text-sm text-gray-500">{event.type} • {event.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(event.startedAt)}</span>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Instances Change</p>
                      <p className="font-semibold text-blue-600">{event.fromInstances} → {event.toInstances}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Trigger Value</p>
                      <p className="font-semibold text-orange-600">{event.triggerValue.toFixed(1)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold text-purple-600">
                        {event.duration ? formatDuration(event.duration) : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Efficiency</p>
                      <p className="font-semibold text-green-600">{(event.efficiency * 100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {event.error && (
                    <div className="mb-3 p-2 bg-red-50 rounded text-sm text-red-700">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      {event.error}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Cost: ${event.cost}</span>
                      <span>CPU: {event.metrics.cpu.toFixed(0)}%</span>
                      <span>Memory: {event.metrics.memory.toFixed(0)}%</span>
                      <span>Players: {event.metrics.players}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {event.status === 'in_progress' && (
                        <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">
                          Cancel
                        </button>
                      )}
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

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Optimization Recommendations</h3>
              <div className="flex items-center space-x-2">
                <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                  <option>All Types</option>
                  <option>Cost Optimization</option>
                  <option>Performance</option>
                  <option>Capacity</option>
                  <option>Policy</option>
                </select>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 inline mr-1" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded ${getPriorityColor(recommendation.priority)}`}>
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                        <p className="text-sm text-gray-500">{recommendation.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(recommendation.priority)}`}>
                        {recommendation.priority}
                      </span>
                      <span className="text-sm text-blue-600">{(recommendation.confidence * 100).toFixed(0)}% confidence</span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{recommendation.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Performance Impact</p>
                      <p className={`font-semibold ${recommendation.impact.performance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {recommendation.impact.performance > 0 ? '+' : ''}{recommendation.impact.performance.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cost Impact</p>
                      <p className={`font-semibold ${recommendation.impact.cost < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {recommendation.impact.cost > 0 ? '+' : ''}{recommendation.impact.cost.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Estimated Savings</p>
                      <p className="font-semibold text-green-600">${recommendation.estimatedSavings}/month</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <h5 className="font-medium text-sm text-gray-900 mb-2">Recommended Actions:</h5>
                    <div className="space-y-1">
                      {recommendation.actions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                          <span>{action.action}: {action.value}</span>
                          <span className="text-green-600">{action.expectedOutcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Effort: {recommendation.effort}</span>
                      <span>Valid until: {new Date(recommendation.validUntil).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!recommendation.applied && (
                        <button className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                          Apply
                        </button>
                      )}
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

      {/* Modals would go here - similar structure to other components */}
    </div>
  );
}