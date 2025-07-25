'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Zap,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Database,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Shield,
  Sparkles,
  Lightbulb,
  Wand2,
  Server,
  Globe,
  Battery,
  Thermometer,
  Wifi,
  HardwareIcon,
  MemoryStick,
  Wrench,
  Save,
  Undo,
  AlertCircle,
  CheckSquare,
  X,
  Eye,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  Timer,
  Award,
  Star
} from 'lucide-react';

interface OptimizationProfile {
  id: string;
  name: string;
  description: string;
  type: 'performance' | 'efficiency' | 'balanced' | 'gaming' | 'custom';
  settings: {
    cpuOptimization: number;
    memoryOptimization: number;
    networkOptimization: number;
    diskOptimization: number;
    priorityBalancing: number;
    powerManagement: number;
  };
  expectedImpact: {
    performance: number;
    efficiency: number;
    cost: number;
    stability: number;
  };
  requirements: string[];
  tags: string[];
  isActive: boolean;
  isRecommended: boolean;
  createdAt: string;
}

interface OptimizationResult {
  id: string;
  profileId: string;
  serverId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  metrics: {
    before: ServerMetrics;
    after?: ServerMetrics;
    improvement: {
      performance: number;
      efficiency: number;
      cost: number;
      stability: number;
    };
  };
  steps: OptimizationStep[];
  logs: string[];
  error?: string;
}

interface OptimizationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  impact: 'low' | 'medium' | 'high';
  duration: number;
  details?: string;
}

interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  throughput: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
  temperature: number;
  powerConsumption: number;
  playerCount: number;
  satisfaction: number;
}

interface SmartServerOptimizationProps {
  serverId: string;
  serverName: string;
  onOptimizationComplete?: (result: OptimizationResult) => void;
}

export default function SmartServerOptimization({
  serverId,
  serverName,
  onOptimizationComplete
}: SmartServerOptimizationProps) {
  const [profiles, setProfiles] = useState<OptimizationProfile[]>([]);
  const [activeOptimization, setActiveOptimization] = useState<OptimizationResult | null>(null);
  const [optimizationHistory, setOptimizationHistory] = useState<OptimizationResult[]>([]);
  const [currentMetrics, setCurrentMetrics] = useState<ServerMetrics | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<OptimizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoOptimization, setAutoOptimization] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<OptimizationResult | null>(null);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadOptimizationData();
    loadCurrentMetrics();
    
    // Set up real-time updates
    const interval = setInterval(loadCurrentMetrics, 30000);
    return () => clearInterval(interval);
  }, [serverId]);

  const loadOptimizationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock optimization profiles
      const mockProfiles = generateMockProfiles();
      setProfiles(mockProfiles);
      
      // Mock optimization history
      const mockHistory = generateMockHistory();
      setOptimizationHistory(mockHistory);
      
      // Set recommended profile as selected
      const recommended = mockProfiles.find(p => p.isRecommended);
      if (recommended) {
        setSelectedProfile(recommended);
      }
    } catch (err) {
      setError('Failed to load optimization data');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMetrics = async () => {
    try {
      const mockMetrics = generateMockMetrics();
      setCurrentMetrics(mockMetrics);
    } catch (err) {
      // Silent fail for metrics
    }
  };

  const generateMockProfiles = (): OptimizationProfile[] => [
    {
      id: '1',
      name: 'Gaming Performance',
      description: 'Optimized for maximum gaming performance and low latency',
      type: 'gaming',
      settings: {
        cpuOptimization: 90,
        memoryOptimization: 85,
        networkOptimization: 95,
        diskOptimization: 70,
        priorityBalancing: 80,
        powerManagement: 60
      },
      expectedImpact: {
        performance: 35,
        efficiency: 15,
        cost: -10,
        stability: 90
      },
      requirements: ['CPU: 4+ cores', 'RAM: 8GB+', 'SSD storage'],
      tags: ['performance', 'gaming', 'low-latency'],
      isActive: false,
      isRecommended: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Efficiency Focused',
      description: 'Balanced approach prioritizing resource efficiency and cost savings',
      type: 'efficiency',
      settings: {
        cpuOptimization: 60,
        memoryOptimization: 70,
        networkOptimization: 65,
        diskOptimization: 80,
        priorityBalancing: 75,
        powerManagement: 90
      },
      expectedImpact: {
        performance: 20,
        efficiency: 40,
        cost: 25,
        stability: 85
      },
      requirements: ['Any configuration'],
      tags: ['efficiency', 'cost-saving', 'balanced'],
      isActive: false,
      isRecommended: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'High Availability',
      description: 'Maximum stability and uptime with redundancy focus',
      type: 'balanced',
      settings: {
        cpuOptimization: 70,
        memoryOptimization: 80,
        networkOptimization: 75,
        diskOptimization: 85,
        priorityBalancing: 90,
        powerManagement: 70
      },
      expectedImpact: {
        performance: 25,
        efficiency: 30,
        cost: 5,
        stability: 95
      },
      requirements: ['Redundant systems', 'UPS recommended'],
      tags: ['stability', 'uptime', 'enterprise'],
      isActive: false,
      isRecommended: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Custom Profile',
      description: 'User-defined optimization settings',
      type: 'custom',
      settings: {
        cpuOptimization: 75,
        memoryOptimization: 75,
        networkOptimization: 75,
        diskOptimization: 75,
        priorityBalancing: 75,
        powerManagement: 75
      },
      expectedImpact: {
        performance: 28,
        efficiency: 28,
        cost: 10,
        stability: 88
      },
      requirements: ['Custom configuration'],
      tags: ['custom', 'flexible'],
      isActive: false,
      isRecommended: false,
      createdAt: new Date().toISOString()
    }
  ];

  const generateMockHistory = (): OptimizationResult[] => [
    {
      id: '1',
      profileId: '1',
      serverId,
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      progress: 100,
      metrics: {
        before: {
          cpuUsage: 75,
          memoryUsage: 68,
          diskUsage: 82,
          networkLatency: 45,
          throughput: 850,
          responseTime: 120,
          errorRate: 0.8,
          uptime: 94.2,
          temperature: 68,
          powerConsumption: 145,
          playerCount: 45,
          satisfaction: 3.8
        },
        after: {
          cpuUsage: 52,
          memoryUsage: 61,
          diskUsage: 79,
          networkLatency: 28,
          throughput: 1200,
          responseTime: 85,
          errorRate: 0.3,
          uptime: 98.7,
          temperature: 62,
          powerConsumption: 125,
          playerCount: 45,
          satisfaction: 4.5
        },
        improvement: {
          performance: 32,
          efficiency: 18,
          cost: 15,
          stability: 22
        }
      },
      steps: [
        {
          id: '1',
          name: 'CPU Optimization',
          description: 'Optimize CPU scheduling and priority management',
          status: 'completed',
          progress: 100,
          impact: 'high',
          duration: 300,
          details: 'Applied intelligent CPU scheduling algorithms'
        },
        {
          id: '2',
          name: 'Memory Management',
          description: 'Optimize memory allocation and caching',
          status: 'completed',
          progress: 100,
          impact: 'medium',
          duration: 240,
          details: 'Configured smart memory caching and garbage collection'
        },
        {
          id: '3',
          name: 'Network Tuning',
          description: 'Optimize network settings for low latency',
          status: 'completed',
          progress: 100,
          impact: 'high',
          duration: 180,
          details: 'Applied network buffer optimization and packet prioritization'
        }
      ],
      logs: [
        'Starting optimization with Gaming Performance profile',
        'Analyzing current system state...',
        'Applying CPU optimization settings...',
        'Configuring memory management...',
        'Optimizing network parameters...',
        'Optimization completed successfully'
      ]
    }
  ];

  const generateMockMetrics = (): ServerMetrics => ({
    cpuUsage: Math.random() * 30 + 40, // 40-70%
    memoryUsage: Math.random() * 25 + 55, // 55-80%
    diskUsage: Math.random() * 20 + 70, // 70-90%
    networkLatency: Math.random() * 20 + 25, // 25-45ms
    throughput: Math.random() * 400 + 800, // 800-1200 MB/s
    responseTime: Math.random() * 50 + 80, // 80-130ms
    errorRate: Math.random() * 0.5 + 0.2, // 0.2-0.7%
    uptime: Math.random() * 5 + 95, // 95-100%
    temperature: Math.random() * 15 + 55, // 55-70°C
    powerConsumption: Math.random() * 40 + 120, // 120-160W
    playerCount: Math.floor(Math.random() * 20) + 35, // 35-55 players
    satisfaction: Math.random() * 1.5 + 3.5 // 3.5-5.0
  });

  const handleStartOptimization = async (profileId: string) => {
    try {
      setError(null);
      
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      const optimizationSteps: OptimizationStep[] = [
        {
          id: '1',
          name: 'System Analysis',
          description: 'Analyzing current system state and requirements',
          status: 'pending',
          progress: 0,
          impact: 'low',
          duration: 30
        },
        {
          id: '2',
          name: 'CPU Optimization',
          description: 'Optimizing CPU scheduling and process priorities',
          status: 'pending',
          progress: 0,
          impact: 'high',
          duration: 120
        },
        {
          id: '3',
          name: 'Memory Management',
          description: 'Configuring memory allocation and caching strategies',
          status: 'pending',
          progress: 0,
          impact: 'medium',
          duration: 90
        },
        {
          id: '4',
          name: 'Network Tuning',
          description: 'Optimizing network settings for better performance',
          status: 'pending',
          progress: 0,
          impact: 'high',
          duration: 60
        },
        {
          id: '5',
          name: 'Disk Optimization',
          description: 'Optimizing disk I/O and storage efficiency',
          status: 'pending',
          progress: 0,
          impact: 'medium',
          duration: 75
        },
        {
          id: '6',
          name: 'Final Validation',
          description: 'Validating optimization results and system stability',
          status: 'pending',
          progress: 0,
          impact: 'low',
          duration: 45
        }
      ];

      const newOptimization: OptimizationResult = {
        id: Date.now().toString(),
        profileId,
        serverId,
        startedAt: new Date().toISOString(),
        status: 'running',
        progress: 0,
        metrics: {
          before: currentMetrics!,
          improvement: {
            performance: 0,
            efficiency: 0,
            cost: 0,
            stability: 0
          }
        },
        steps: optimizationSteps,
        logs: ['Starting optimization process...']
      };

      setActiveOptimization(newOptimization);
      
      // Simulate optimization process
      simulateOptimization(newOptimization);
      
    } catch (err) {
      setError('Failed to start optimization');
    }
  };

  const simulateOptimization = async (optimization: OptimizationResult) => {
    const totalSteps = optimization.steps.length;
    let currentStep = 0;

    for (const step of optimization.steps) {
      // Update step status to running
      step.status = 'running';
      step.startedAt = new Date().toISOString();
      
      setActiveOptimization(prev => ({
        ...prev!,
        steps: [...optimization.steps],
        logs: [...prev!.logs, `Starting ${step.name}...`]
      }));

      // Simulate step progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, step.duration * 10 / 100));
        
        step.progress = progress;
        const overallProgress = ((currentStep * 100) + progress) / totalSteps;
        
        setActiveOptimization(prev => ({
          ...prev!,
          progress: Math.round(overallProgress),
          steps: [...optimization.steps]
        }));
      }

      // Complete step
      step.status = 'completed';
      step.completedAt = new Date().toISOString();
      
      setActiveOptimization(prev => ({
        ...prev!,
        steps: [...optimization.steps],
        logs: [...prev!.logs, `${step.name} completed successfully`]
      }));

      currentStep++;
    }

    // Complete optimization
    const completedOptimization: OptimizationResult = {
      ...optimization,
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString(),
      metrics: {
        ...optimization.metrics,
        after: {
          cpuUsage: optimization.metrics.before.cpuUsage * 0.7,
          memoryUsage: optimization.metrics.before.memoryUsage * 0.85,
          diskUsage: optimization.metrics.before.diskUsage * 0.9,
          networkLatency: optimization.metrics.before.networkLatency * 0.6,
          throughput: optimization.metrics.before.throughput * 1.4,
          responseTime: optimization.metrics.before.responseTime * 0.7,
          errorRate: optimization.metrics.before.errorRate * 0.4,
          uptime: Math.min(99.9, optimization.metrics.before.uptime * 1.05),
          temperature: optimization.metrics.before.temperature * 0.9,
          powerConsumption: optimization.metrics.before.powerConsumption * 0.85,
          playerCount: optimization.metrics.before.playerCount,
          satisfaction: Math.min(5.0, optimization.metrics.before.satisfaction * 1.2)
        },
        improvement: {
          performance: 32,
          efficiency: 18,
          cost: 15,
          stability: 22
        }
      },
      logs: [...optimization.logs, 'Optimization completed successfully!']
    };

    setActiveOptimization(completedOptimization);
    setOptimizationHistory(prev => [completedOptimization, ...prev]);
    
    // Update current metrics
    setCurrentMetrics(completedOptimization.metrics.after!);
    
    // Call completion callback
    onOptimizationComplete?.(completedOptimization);

    // Clear active optimization after 5 seconds
    setTimeout(() => {
      setActiveOptimization(null);
    }, 5000);
  };

  const handleCancelOptimization = () => {
    if (activeOptimization) {
      setActiveOptimization({
        ...activeOptimization,
        status: 'cancelled',
        completedAt: new Date().toISOString()
      });
      
      setTimeout(() => {
        setActiveOptimization(null);
      }, 2000);
    }
  };

  const getProfileIcon = (type: string) => {
    switch (type) {
      case 'gaming': return <Target className="w-5 h-5 text-red-500" />;
      case 'efficiency': return <Battery className="w-5 h-5 text-green-500" />;
      case 'balanced': return <Shield className="w-5 h-5 text-blue-500" />;
      case 'performance': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'custom': return <Settings className="w-5 h-5 text-purple-500" />;
      default: return <Server className="w-5 h-5 text-gray-500" />;
    }
  };

  const getMetricColor = (value: number, type: string) => {
    if (type === 'usage') {
      if (value > 80) return 'text-red-500';
      if (value > 60) return 'text-yellow-500';
      return 'text-green-500';
    } else if (type === 'latency') {
      if (value > 100) return 'text-red-500';
      if (value > 50) return 'text-yellow-500';
      return 'text-green-500';
    } else if (type === 'positive') {
      if (value > 4) return 'text-green-500';
      if (value > 3) return 'text-yellow-500';
      return 'text-red-500';
    }
    return 'text-gray-300';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading optimization system..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-500" />
            Smart Server Optimization
          </h2>
          <p className="text-gray-400">AI-powered optimization for {serverName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={autoOptimization}
              onChange={(e) => setAutoOptimization(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            Auto-optimize
          </label>
          
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Create Profile
          </button>
        </div>
      </div>

      {/* Current Metrics */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">CPU Usage</h3>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(currentMetrics.cpuUsage, 'usage')}`}>
              {currentMetrics.cpuUsage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Current load</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Memory Usage</h3>
              <HardDrive className="w-4 h-4 text-green-400" />
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(currentMetrics.memoryUsage, 'usage')}`}>
              {currentMetrics.memoryUsage.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">RAM utilization</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Response Time</h3>
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(currentMetrics.responseTime, 'latency')}`}>
              {currentMetrics.responseTime.toFixed(0)}ms
            </p>
            <p className="text-xs text-gray-500">Average response</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-300">Player Satisfaction</h3>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <p className={`text-2xl font-bold ${getMetricColor(currentMetrics.satisfaction, 'positive')}`}>
              {currentMetrics.satisfaction.toFixed(1)}/5
            </p>
            <p className="text-xs text-gray-500">{currentMetrics.playerCount} players</p>
          </div>
        </div>
      )}

      {/* Active Optimization */}
      {activeOptimization && (
        <div className="bg-blue-900 border border-blue-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-pulse">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Optimization in Progress
                </h3>
                <p className="text-blue-200">
                  {activeOptimization.progress}% complete
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm text-blue-200">Status</div>
                <div className="text-blue-100 font-medium capitalize">
                  {activeOptimization.status}
                </div>
              </div>
              
              <button
                onClick={handleCancelOptimization}
                className="p-2 text-blue-300 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${activeOptimization.progress}%` }}
              />
            </div>
          </div>

          {/* Current Steps */}
          <div className="space-y-2">
            {activeOptimization.steps.map((step) => (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-2 rounded ${
                  step.status === 'running' ? 'bg-blue-800' : 
                  step.status === 'completed' ? 'bg-green-900' : 
                  'bg-gray-800'
                }`}
              >
                <div className="flex-shrink-0">
                  {step.status === 'running' ? (
                    <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                  ) : step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">{step.name}</div>
                  <div className="text-sm text-gray-300">{step.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-300">{step.progress}%</div>
                  <div className="text-xs text-gray-400">{formatDuration(step.duration)}</div>
                </div>
              </div>
            ))}
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

      {/* Optimization Profiles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Optimization Profiles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <div 
              key={profile.id}
              className={`bg-gray-800 rounded-lg p-6 border transition-all cursor-pointer ${
                selectedProfile?.id === profile.id 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedProfile(profile)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getProfileIcon(profile.type)}
                  <div>
                    <h4 className="font-semibold text-white">{profile.name}</h4>
                    <p className="text-sm text-gray-400">{profile.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {profile.isRecommended && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                  {profile.isActive && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Expected Impact */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-green-400 font-semibold">+{profile.expectedImpact.performance}%</div>
                  <div className="text-xs text-gray-400">Performance</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-semibold">+{profile.expectedImpact.efficiency}%</div>
                  <div className="text-xs text-gray-400">Efficiency</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {profile.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartOptimization(profile.id);
                }}
                disabled={!!activeOptimization}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wand2 className="w-4 h-4" />
                Apply Optimization
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Optimization History</h3>
        
        {optimizationHistory.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No optimization history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {optimizationHistory.map((result) => (
              <div key={result.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      result.status === 'completed' ? 'bg-green-500' :
                      result.status === 'failed' ? 'bg-red-500' :
                      result.status === 'cancelled' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium text-white">
                        {profiles.find(p => p.id === result.profileId)?.name || 'Unknown Profile'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(result.startedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">
                        +{result.metrics.improvement.performance}%
                      </div>
                      <div className="text-xs text-gray-400">Performance</div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedResult(result);
                        setShowResultsModal(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Creation Modal */}
      {showProfileModal && (
        <ProfileCreationModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onCreateProfile={(profile) => {
            setProfiles(prev => [...prev, profile]);
            setShowProfileModal(false);
          }}
        />
      )}

      {/* Results Details Modal */}
      {showResultsModal && selectedResult && (
        <OptimizationResultsModal
          isOpen={showResultsModal}
          onClose={() => {
            setShowResultsModal(false);
            setSelectedResult(null);
          }}
          result={selectedResult}
        />
      )}
    </div>
  );
}

// Profile Creation Modal Component
function ProfileCreationModal({ 
  isOpen, 
  onClose, 
  onCreateProfile 
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateProfile: (profile: OptimizationProfile) => void;
}) {
  const [profileName, setProfileName] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [settings, setSettings] = useState({
    cpuOptimization: 75,
    memoryOptimization: 75,
    networkOptimization: 75,
    diskOptimization: 75,
    priorityBalancing: 75,
    powerManagement: 75
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileName.trim()) {
      alert('Please enter a profile name');
      return;
    }

    const newProfile: OptimizationProfile = {
      id: Date.now().toString(),
      name: profileName.trim(),
      description: profileDescription.trim(),
      type: 'custom',
      settings,
      expectedImpact: {
        performance: Math.round((settings.cpuOptimization + settings.memoryOptimization + settings.networkOptimization) / 10),
        efficiency: Math.round((settings.diskOptimization + settings.powerManagement) / 8),
        cost: Math.round((settings.powerManagement - 50) / 2),
        stability: Math.round((settings.priorityBalancing + settings.memoryOptimization) / 8)
      },
      requirements: ['Custom configuration'],
      tags: ['custom', 'user-defined'],
      isActive: false,
      isRecommended: false,
      createdAt: new Date().toISOString()
    };

    onCreateProfile(newProfile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Create Custom Profile</h3>
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
                  Profile Name
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Enter profile name..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  placeholder="Brief description..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Optimization Settings</h4>
              
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <span className="text-sm text-gray-400">{value}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      [key]: parseInt(e.target.value)
                    }))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              ))}
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
                Create Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Optimization Results Modal Component
function OptimizationResultsModal({ 
  isOpen, 
  onClose, 
  result 
}: {
  isOpen: boolean;
  onClose: () => void;
  result: OptimizationResult;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Optimization Results</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-green-400 font-bold text-2xl">+{result.metrics.improvement.performance}%</div>
                <div className="text-sm text-gray-400">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold text-2xl">+{result.metrics.improvement.efficiency}%</div>
                <div className="text-sm text-gray-400">Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-2xl">+{result.metrics.improvement.cost}%</div>
                <div className="text-sm text-gray-400">Cost Savings</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold text-2xl">+{result.metrics.improvement.stability}%</div>
                <div className="text-sm text-gray-400">Stability</div>
              </div>
            </div>

            {/* Before/After Comparison */}
            {result.metrics.after && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-4">Before vs After</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-300 mb-2">Before</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>CPU Usage:</span>
                        <span>{result.metrics.before.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage:</span>
                        <span>{result.metrics.before.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span>{result.metrics.before.responseTime.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-300 mb-2">After</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>CPU Usage:</span>
                        <span className="text-green-400">{result.metrics.after.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Usage:</span>
                        <span className="text-green-400">{result.metrics.after.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Response Time:</span>
                        <span className="text-green-400">{result.metrics.after.responseTime.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-4">Optimization Steps</h4>
              <div className="space-y-2">
                {result.steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white">{step.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">{step.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}