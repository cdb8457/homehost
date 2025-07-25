// AI Optimization Types

export interface AIOptimizationEngine {
  id: string;
  serverId: string;
  status: 'active' | 'paused' | 'disabled' | 'learning';
  enabledFeatures: OptimizationFeature[];
  model: AIModel;
  lastOptimization: Date;
  performanceGain: number; // percentage improvement
  costSavings: number; // dollars saved
  recommendations: OptimizationRecommendation[];
}

export interface OptimizationFeature {
  id: string;
  name: string;
  type: 'resource_management' | 'predictive_scaling' | 'performance_tuning' | 'anomaly_detection';
  enabled: boolean;
  confidence: number; // 0-1 confidence score
  impact: 'low' | 'medium' | 'high';
  description: string;
  lastUsed?: Date;
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'performance_prediction' | 'resource_optimization' | 'anomaly_detection' | 'player_behavior';
  accuracy: number; // percentage
  trainingData: {
    samples: number;
    lastTrained: Date;
    features: string[];
  };
  status: 'trained' | 'training' | 'outdated' | 'failed';
}

export interface ServerMetrics {
  timestamp: Date;
  serverId: string;
  cpu: {
    usage: number; // percentage
    cores: number;
    frequency: number; // GHz
    temperature?: number; // Celsius
  };
  memory: {
    used: number; // MB
    total: number; // MB
    available: number; // MB
    cached: number; // MB
  };
  disk: {
    used: number; // GB
    total: number; // GB
    readSpeed: number; // MB/s
    writeSpeed: number; // MB/s
    iops: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    latency: number; // ms
    bandwidth: number; // Mbps
  };
  game: {
    playerCount: number;
    maxPlayers: number;
    tickRate: number; // ticks per second
    avgResponseTime: number; // ms
    memoryUsage: number; // MB
    worldSize: number; // MB
  };
}

export interface PredictiveAnalytics {
  serverId: string;
  predictions: {
    playerCount: TimeSeries;
    resourceUsage: ResourcePrediction;
    performance: PerformancePrediction;
    costs: CostPrediction;
  };
  trends: {
    direction: 'rising' | 'falling' | 'stable';
    confidence: number;
    changeRate: number; // percentage per day
  };
  alerts: PredictiveAlert[];
  recommendations: string[];
}

export interface TimeSeries {
  dataPoints: {
    timestamp: Date;
    value: number;
    confidence: number;
  }[];
  forecast: {
    next24h: number;
    next7days: number;
    next30days: number;
  };
}

export interface ResourcePrediction {
  cpu: {
    predicted: number; // percentage
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  memory: {
    predicted: number; // MB
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  disk: {
    predicted: number; // GB
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  scalingRecommendation?: {
    action: 'scale_up' | 'scale_down' | 'maintain';
    reason: string;
    confidence: number;
  };
}

export interface PerformancePrediction {
  expectedFPS: number;
  expectedLatency: number; // ms
  expectedUptime: number; // percentage
  bottleneckPrediction?: {
    type: 'cpu' | 'memory' | 'disk' | 'network';
    severity: 'low' | 'medium' | 'high';
    eta: Date; // estimated time of bottleneck
    mitigation: string;
  };
}

export interface CostPrediction {
  currentMonthlyCost: number;
  predictedMonthlyCost: number;
  optimizationSavings: number;
  recommendations: {
    action: string;
    savingsAmount: number;
    impact: string;
  }[];
}

export interface PredictiveAlert {
  id: string;
  type: 'performance_degradation' | 'resource_exhaustion' | 'anomaly_detected' | 'maintenance_needed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  prediction: {
    likelihood: number; // 0-1
    timeframe: string; // "in 2 hours", "within 24 hours"
    impact: string;
  };
  recommendations: string[];
  createdAt: Date;
  resolvedAt?: Date;
}

export interface OptimizationRecommendation {
  id: string;
  type: 'resource_adjustment' | 'configuration_change' | 'plugin_recommendation' | 'hardware_upgrade';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: {
    performance: number; // percentage improvement
    cost: number; // dollar savings
    implementation: 'automatic' | 'manual' | 'approval_required';
  };
  actions: OptimizationAction[];
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
}

export interface OptimizationAction {
  id: string;
  type: 'scale_resources' | 'adjust_settings' | 'install_plugin' | 'restart_service';
  description: string;
  parameters: Record<string, any>;
  automated: boolean;
  reversible: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AutoTuningSystem {
  serverId: string;
  enabled: boolean;
  mode: 'conservative' | 'balanced' | 'aggressive';
  parameters: {
    maxCpuUsage: number; // percentage
    maxMemoryUsage: number; // percentage
    targetLatency: number; // ms
    minPlayerQuality: number; // 0-10 scale
  };
  optimizationHistory: OptimizationEvent[];
  currentOptimizations: ActiveOptimization[];
}

export interface OptimizationEvent {
  id: string;
  timestamp: Date;
  type: 'resource_scaled' | 'setting_adjusted' | 'plugin_installed' | 'configuration_changed';
  action: string;
  parameters: Record<string, any>;
  result: {
    success: boolean;
    performanceChange: number; // percentage
    costChange: number; // dollars
    error?: string;
  };
  automated: boolean;
  reversedAt?: Date;
}

export interface ActiveOptimization {
  id: string;
  type: string;
  description: string;
  startedAt: Date;
  progress: number; // 0-100
  estimatedCompletion: Date;
  currentStep: string;
  canCancel: boolean;
  logs: string[];
}

export interface PerformanceInsights {
  serverId: string;
  overallScore: number; // 0-100
  insights: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  benchmarks: {
    category: string;
    yourScore: number;
    industryAverage: number;
    topPerformers: number;
  }[];
  improvementPlan: {
    quickWins: OptimizationRecommendation[];
    longTermGoals: OptimizationRecommendation[];
    riskMitigation: OptimizationRecommendation[];
  };
}

export interface AnomalyDetection {
  serverId: string;
  anomalies: Anomaly[];
  patterns: DetectedPattern[];
  alerts: AnomalyAlert[];
  sensitivity: 'low' | 'medium' | 'high';
  learningMode: boolean;
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  type: 'performance' | 'resource' | 'behavior' | 'error';
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number; // standard deviations
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  possibleCauses: string[];
  resolved: boolean;
  resolvedAt?: Date;
}

export interface DetectedPattern {
  id: string;
  type: 'periodic' | 'trend' | 'seasonal' | 'correlation';
  description: string;
  confidence: number; // 0-1
  metrics: string[];
  period?: string; // for periodic patterns
  correlation?: number; // for correlation patterns
  significance: 'low' | 'medium' | 'high';
}

export interface AnomalyAlert {
  id: string;
  anomalyId: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  suggestedActions: string[];
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface AIOptimizationSettings {
  serverId: string;
  aiEnabled: boolean;
  features: {
    resourceManagement: boolean;
    predictiveScaling: boolean;
    performanceTuning: boolean;
    anomalyDetection: boolean;
    costOptimization: boolean;
  };
  aggressiveness: 'conservative' | 'balanced' | 'aggressive';
  notifications: {
    email: boolean;
    push: boolean;
    slack: boolean;
    webhook?: string;
  };
  constraints: {
    maxCostIncrease: number; // percentage
    maintenanceWindows: {
      start: string; // HH:MM
      end: string; // HH:MM
      timezone: string;
    }[];
    blockedActions: string[];
  };
}