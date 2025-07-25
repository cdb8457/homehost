export interface SystemSpecs {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    frequency: number; // GHz
    architecture: string;
    generation?: string;
  };
  memory: {
    total: number; // GB
    available: number; // GB
    speed: number; // MHz
    type: string; // DDR4, DDR5, etc.
  };
  storage: {
    type: 'HDD' | 'SSD' | 'NVMe';
    total: number; // GB
    available: number; // GB
    readSpeed: number; // MB/s
    writeSpeed: number; // MB/s
  };
  network: {
    downloadSpeed: number; // Mbps
    uploadSpeed: number; // Mbps
    latency: number; // ms
    connectionType: string;
  };
  gpu?: {
    model: string;
    vram: number; // GB
    compute: boolean;
  };
  os: {
    platform: string;
    version: string;
    architecture: string;
  };
}

export interface GameServerRequirements {
  gameId: string;
  gameName: string;
  minimum: {
    cpu: {
      cores: number;
      frequency: number;
    };
    memory: number; // GB
    storage: number; // GB
    network: {
      upload: number; // Mbps
      download: number; // Mbps
    };
  };
  recommended: {
    cpu: {
      cores: number;
      frequency: number;
    };
    memory: number; // GB
    storage: number; // GB
    network: {
      upload: number; // Mbps
      download: number; // Mbps
    };
  };
  optimal: {
    cpu: {
      cores: number;
      frequency: number;
    };
    memory: number; // GB
    storage: number; // GB
    network: {
      upload: number; // Mbps
      download: number; // Mbps
    };
  };
  scalingFactors: {
    playersPerCore: number;
    memoryPerPlayer: number; // MB
    networkPerPlayer: number; // Kbps
  };
}

export interface OptimizationRecommendation {
  configurationLevel: 'minimum' | 'recommended' | 'optimal' | 'custom';
  confidence: number; // 0-100%
  estimatedPerformance: {
    maxPlayers: number;
    expectedTPS: number; // Ticks per second
    expectedLatency: number; // ms
    stability: number; // 0-100%
  };
  serverConfig: {
    maxPlayers: number;
    tickRate: number;
    memoryAllocation: number; // MB
    networkBufferSize: number; // KB
    threadCount: number;
    customSettings: Record<string, any>;
  };
  warnings: OptimizationWarning[];
  suggestions: OptimizationSuggestion[];
}

export interface OptimizationWarning {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'hardware' | 'network' | 'software' | 'compatibility';
  message: string;
  impact: string;
  solution?: string;
}

export interface OptimizationSuggestion {
  type: 'hardware' | 'configuration' | 'network' | 'software';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImprovement: string;
  implementation: 'automatic' | 'manual' | 'hardware_upgrade';
}

export interface PerformanceProfile {
  profileId: string;
  name: string;
  description: string;
  gameOptimizations: {
    [gameId: string]: {
      configOverrides: Record<string, any>;
      performanceSettings: Record<string, any>;
      networkOptimizations: Record<string, any>;
    };
  };
  systemOptimizations: {
    processAffinity: number[];
    processPriority: 'low' | 'normal' | 'high' | 'realtime';
    memoryManagement: {
      preAllocation: boolean;
      garbageCollection: 'auto' | 'manual';
      swapFile: boolean;
    };
    networkOptimizations: {
      tcpWindowSize: number;
      nagleAlgorithm: boolean;
      qosSettings: Record<string, any>;
    };
  };
}

export interface BenchmarkResult {
  timestamp: string;
  gameId: string;
  configuration: OptimizationRecommendation['serverConfig'];
  results: {
    averagePlayerCount: number;
    peakPlayerCount: number;
    averageTPS: number;
    minimumTPS: number;
    averageLatency: number;
    peakLatency: number;
    uptime: number; // percentage
    crashCount: number;
    memoryUsage: {
      average: number;
      peak: number;
    };
    cpuUsage: {
      average: number;
      peak: number;
    };
  };
  userRating: {
    performance: number; // 1-5
    stability: number; // 1-5
    overall: number; // 1-5
  };
}

export interface HardwareCompatibility {
  gameId: string;
  systemSpecs: SystemSpecs;
  compatibility: {
    overall: 'excellent' | 'good' | 'fair' | 'poor' | 'incompatible';
    cpu: 'excellent' | 'good' | 'fair' | 'poor' | 'incompatible';
    memory: 'excellent' | 'good' | 'fair' | 'poor' | 'incompatible';
    storage: 'excellent' | 'good' | 'fair' | 'poor' | 'incompatible';
    network: 'excellent' | 'good' | 'fair' | 'poor' | 'incompatible';
  };
  limitations: string[];
  recommendations: string[];
}