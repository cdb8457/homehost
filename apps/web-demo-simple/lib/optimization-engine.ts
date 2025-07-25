import { 
  SystemSpecs, 
  GameServerRequirements, 
  OptimizationRecommendation,
  OptimizationWarning,
  OptimizationSuggestion,
  HardwareCompatibility,
  BenchmarkResult
} from '@/types/optimization';
import { 
  GAME_REQUIREMENTS, 
  PERFORMANCE_PROFILES,
  HARDWARE_COMPATIBILITY_MATRIX
} from './game-requirements';

export class OptimizationEngine {
  private systemSpecs: SystemSpecs | null = null;
  private benchmarkHistory: BenchmarkResult[] = [];

  /**
   * Analyzes system hardware and generates optimization recommendations
   */
  async analyzeSystem(specs: SystemSpecs): Promise<SystemSpecs> {
    this.systemSpecs = specs;
    
    // In a real implementation, this would gather system information
    // For now, we'll simulate some enhanced specs with analysis
    const enhancedSpecs: SystemSpecs = {
      ...specs,
      // Add computed fields based on analysis
      cpu: {
        ...specs.cpu,
        generation: this.determineCpuGeneration(specs.cpu.model),
      },
      memory: {
        ...specs.memory,
        // Calculate actual available memory accounting for OS overhead
        available: Math.max(0, specs.memory.total - this.calculateOsOverhead(specs.memory.total))
      }
    };

    return enhancedSpecs;
  }

  /**
   * Generates optimization recommendations for a specific game
   */
  generateRecommendations(gameId: string, targetPlayerCount?: number): OptimizationRecommendation {
    if (!this.systemSpecs) {
      throw new Error('System specs not analyzed. Call analyzeSystem() first.');
    }

    const gameRequirements = GAME_REQUIREMENTS[gameId];
    if (!gameRequirements) {
      throw new Error(`Game requirements not found for: ${gameId}`);
    }

    const compatibility = this.assessHardwareCompatibility(gameId);
    const configLevel = this.determineConfigurationLevel(gameRequirements, compatibility);
    const serverConfig = this.generateServerConfiguration(gameRequirements, configLevel, targetPlayerCount);
    const performance = this.estimatePerformance(gameRequirements, serverConfig);
    const warnings = this.generateWarnings(gameRequirements, compatibility);
    const suggestions = this.generateSuggestions(gameRequirements, compatibility, performance);

    return {
      configurationLevel: configLevel,
      confidence: this.calculateConfidence(compatibility, performance),
      estimatedPerformance: performance,
      serverConfig,
      warnings,
      suggestions
    };
  }

  /**
   * Assesses hardware compatibility for a specific game
   */
  assessHardwareCompatibility(gameId: string): HardwareCompatibility {
    if (!this.systemSpecs) {
      throw new Error('System specs not analyzed. Call analyzeSystem() first.');
    }

    const gameRequirements = GAME_REQUIREMENTS[gameId];
    const specs = this.systemSpecs;

    const cpuCompatibility = this.assessCpuCompatibility(specs.cpu, gameRequirements);
    const memoryCompatibility = this.assessMemoryCompatibility(specs.memory, gameRequirements);
    const storageCompatibility = this.assessStorageCompatibility(specs.storage, gameRequirements);
    const networkCompatibility = this.assessNetworkCompatibility(specs.network, gameRequirements);

    const overallCompatibility = this.calculateOverallCompatibility([
      cpuCompatibility,
      memoryCompatibility,
      storageCompatibility,
      networkCompatibility
    ]);

    return {
      gameId,
      systemSpecs: specs,
      compatibility: {
        overall: overallCompatibility,
        cpu: cpuCompatibility,
        memory: memoryCompatibility,
        storage: storageCompatibility,
        network: networkCompatibility
      },
      limitations: this.identifyLimitations(specs, gameRequirements),
      recommendations: this.generateCompatibilityRecommendations(specs, gameRequirements)
    };
  }

  /**
   * Optimizes configuration based on historical benchmark data
   */
  optimizeFromBenchmarks(gameId: string): OptimizationRecommendation | null {
    const relevantBenchmarks = this.benchmarkHistory.filter(b => b.gameId === gameId);
    
    if (relevantBenchmarks.length === 0) {
      return null;
    }

    // Find the best performing configuration
    const bestBenchmark = relevantBenchmarks.reduce((best, current) => {
      const currentScore = this.calculateBenchmarkScore(current);
      const bestScore = this.calculateBenchmarkScore(best);
      return currentScore > bestScore ? current : best;
    });

    // Generate recommendations based on the best benchmark
    const baseRecommendation = this.generateRecommendations(gameId);
    
    return {
      ...baseRecommendation,
      serverConfig: {
        ...baseRecommendation.serverConfig,
        ...bestBenchmark.configuration
      },
      confidence: Math.min(baseRecommendation.confidence + 15, 100), // Boost confidence with real data
      suggestions: [
        ...baseRecommendation.suggestions,
        {
          type: 'configuration',
          priority: 'high',
          title: 'Benchmark-Optimized Settings',
          description: `Configuration optimized based on ${relevantBenchmarks.length} benchmark runs`,
          expectedImprovement: `+${Math.round(bestBenchmark.userRating.performance * 20)}% performance`,
          implementation: 'automatic'
        }
      ]
    };
  }

  // Private helper methods

  private determineCpuGeneration(model: string): string {
    // Simple CPU generation detection based on model name
    if (model.includes('i7-13') || model.includes('i5-13') || model.includes('i3-13')) return '13th Gen Intel';
    if (model.includes('i7-12') || model.includes('i5-12') || model.includes('i3-12')) return '12th Gen Intel';
    if (model.includes('i7-11') || model.includes('i5-11') || model.includes('i3-11')) return '11th Gen Intel';
    if (model.includes('Ryzen 9 7') || model.includes('Ryzen 7 7') || model.includes('Ryzen 5 7')) return 'AMD Ryzen 7000';
    if (model.includes('Ryzen 9 5') || model.includes('Ryzen 7 5') || model.includes('Ryzen 5 5')) return 'AMD Ryzen 5000';
    return 'Unknown';
  }

  private calculateOsOverhead(totalMemory: number): number {
    // OS overhead estimation based on total memory
    if (totalMemory >= 32) return 4; // 4GB for high-memory systems
    if (totalMemory >= 16) return 3; // 3GB for medium-memory systems
    if (totalMemory >= 8) return 2;  // 2GB for low-memory systems
    return 1; // 1GB minimum
  }

  private assessCpuCompatibility(cpu: SystemSpecs['cpu'], requirements: GameServerRequirements): HardwareCompatibility['compatibility']['cpu'] {
    const optimalCores = requirements.optimal.cpu.cores;
    const optimalFreq = requirements.optimal.cpu.frequency;
    
    const coreScore = cpu.cores / optimalCores;
    const freqScore = cpu.frequency / optimalFreq;
    const overallScore = (coreScore + freqScore) / 2;

    if (overallScore >= 1.2) return 'excellent';
    if (overallScore >= 1.0) return 'good';
    if (overallScore >= 0.8) return 'fair';
    if (overallScore >= 0.5) return 'poor';
    return 'incompatible';
  }

  private assessMemoryCompatibility(memory: SystemSpecs['memory'], requirements: GameServerRequirements): HardwareCompatibility['compatibility']['memory'] {
    const optimalMemory = requirements.optimal.memory;
    const memoryScore = memory.available / optimalMemory;

    if (memoryScore >= 1.5) return 'excellent';
    if (memoryScore >= 1.0) return 'good';
    if (memoryScore >= 0.8) return 'fair';
    if (memoryScore >= 0.5) return 'poor';
    return 'incompatible';
  }

  private assessStorageCompatibility(storage: SystemSpecs['storage'], requirements: GameServerRequirements): HardwareCompatibility['compatibility']['storage'] {
    const storageScore = storage.available / requirements.optimal.storage;
    const typeScore = storage.type === 'NVMe' ? 1.2 : storage.type === 'SSD' ? 1.0 : 0.7;
    const overallScore = (storageScore + typeScore) / 2;

    if (overallScore >= 1.2) return 'excellent';
    if (overallScore >= 1.0) return 'good';
    if (overallScore >= 0.8) return 'fair';
    if (overallScore >= 0.5) return 'poor';
    return 'incompatible';
  }

  private assessNetworkCompatibility(network: SystemSpecs['network'], requirements: GameServerRequirements): HardwareCompatibility['compatibility']['network'] {
    const uploadScore = network.uploadSpeed / requirements.optimal.network.upload;
    const downloadScore = network.downloadSpeed / requirements.optimal.network.download;
    const overallScore = Math.min(uploadScore, downloadScore); // Network is only as strong as weakest link

    if (overallScore >= 1.2) return 'excellent';
    if (overallScore >= 1.0) return 'good';
    if (overallScore >= 0.8) return 'fair';
    if (overallScore >= 0.5) return 'poor';
    return 'incompatible';
  }

  private calculateOverallCompatibility(compatibilities: HardwareCompatibility['compatibility']['cpu'][]): HardwareCompatibility['compatibility']['overall'] {
    const scoreMap = { excellent: 5, good: 4, fair: 3, poor: 2, incompatible: 1 };
    const averageScore = compatibilities.reduce((sum, comp) => sum + scoreMap[comp], 0) / compatibilities.length;

    if (averageScore >= 4.5) return 'excellent';
    if (averageScore >= 3.5) return 'good';
    if (averageScore >= 2.5) return 'fair';
    if (averageScore >= 1.5) return 'poor';
    return 'incompatible';
  }

  private determineConfigurationLevel(requirements: GameServerRequirements, compatibility: HardwareCompatibility): OptimizationRecommendation['configurationLevel'] {
    const overall = compatibility.compatibility.overall;
    
    if (overall === 'excellent') return 'optimal';
    if (overall === 'good') return 'recommended';
    if (overall === 'fair') return 'minimum';
    return 'custom';
  }

  private generateServerConfiguration(requirements: GameServerRequirements, level: OptimizationRecommendation['configurationLevel'], targetPlayerCount?: number): OptimizationRecommendation['serverConfig'] {
    const baseConfig = requirements[level === 'custom' ? 'minimum' : level];
    const specs = this.systemSpecs!;
    
    // Calculate optimal player count based on hardware
    const cpuPlayerLimit = Math.floor(specs.cpu.cores * requirements.scalingFactors.playersPerCore);
    const memoryPlayerLimit = Math.floor((specs.memory.available * 1024) / requirements.scalingFactors.memoryPerPlayer);
    const networkPlayerLimit = Math.floor(specs.network.uploadSpeed * 1000 / requirements.scalingFactors.networkPerPlayer);
    
    const hardwarePlayerLimit = Math.min(cpuPlayerLimit, memoryPlayerLimit, networkPlayerLimit);
    const maxPlayers = targetPlayerCount ? Math.min(targetPlayerCount, hardwarePlayerLimit) : hardwarePlayerLimit;

    return {
      maxPlayers,
      tickRate: this.calculateOptimalTickRate(requirements.gameId, specs),
      memoryAllocation: Math.floor(maxPlayers * requirements.scalingFactors.memoryPerPlayer + baseConfig.memory * 1024),
      networkBufferSize: Math.floor(maxPlayers * 2), // 2KB per player
      threadCount: Math.min(specs.cpu.threads, Math.ceil(maxPlayers / 4)),
      customSettings: this.generateGameSpecificSettings(requirements.gameId, specs, maxPlayers)
    };
  }

  private estimatePerformance(requirements: GameServerRequirements, config: OptimizationRecommendation['serverConfig']): OptimizationRecommendation['estimatedPerformance'] {
    const specs = this.systemSpecs!;
    
    // Performance calculations based on hardware utilization
    const cpuUtilization = (config.maxPlayers / requirements.scalingFactors.playersPerCore) / specs.cpu.cores;
    const memoryUtilization = config.memoryAllocation / (specs.memory.available * 1024);
    const networkUtilization = (config.maxPlayers * requirements.scalingFactors.networkPerPlayer) / (specs.network.uploadSpeed * 1000);

    const overallUtilization = Math.max(cpuUtilization, memoryUtilization, networkUtilization);
    
    return {
      maxPlayers: config.maxPlayers,
      expectedTPS: Math.floor(config.tickRate * Math.max(0.3, 1 - overallUtilization)),
      expectedLatency: Math.floor(specs.network.latency * (1 + overallUtilization)),
      stability: Math.floor(Math.max(50, 100 - (overallUtilization * 100)))
    };
  }

  private calculateOptimalTickRate(gameId: string, specs: SystemSpecs): number {
    // Game-specific tick rate optimization
    const baseTickRates: Record<string, number> = {
      'valheim': 20,
      'rust': 30,
      'cs2': 64,
      '7d2d': 20,
      'motortown': 30
    };

    const baseRate = baseTickRates[gameId] || 20;
    const cpuMultiplier = Math.min(2.0, specs.cpu.frequency / 3.0);
    
    return Math.floor(baseRate * cpuMultiplier);
  }

  private generateGameSpecificSettings(gameId: string, specs: SystemSpecs, playerCount: number): Record<string, any> {
    const settings: Record<string, Record<string, any>> = {
      'valheim': {
        'world-save-interval': Math.max(300, 1800 / Math.log(playerCount + 1)),
        'backup-count': Math.min(10, Math.floor(specs.storage.available / 10)),
        'network-send-rate': Math.floor(specs.network.uploadSpeed * 10)
      },
      'rust': {
        'save-interval': Math.max(300, 1800 / Math.log(playerCount + 1)),
        'entity-decay-time': playerCount > 50 ? 168 : 336, // Faster decay for high pop
        'admin-reconnect-timeout': 30,
        'max-receive-time': Math.floor(50 / Math.log(playerCount + 1))
      },
      'cs2': {
        'sv_maxrate': Math.floor(specs.network.uploadSpeed * 1000 / playerCount),
        'sv_minrate': Math.floor(specs.network.uploadSpeed * 500 / playerCount),
        'sv_maxcmdrate': Math.min(128, specs.cpu.frequency * 20),
        'sv_maxupdaterate': Math.min(128, specs.cpu.frequency * 20)
      },
      '7d2d': {
        'ServerMaxAllowedViewDistance': Math.floor(specs.memory.available / 2),
        'MaxSpawnedZombies': Math.floor(playerCount * 1.5),
        'MaxSpawnedAnimals': Math.floor(playerCount * 0.5),
        'LandClaimSize': playerCount > 20 ? 41 : 61
      },
      'motortown': {
        'max-view-distance': Math.floor(specs.memory.available * 10),
        'vehicle-spawn-limit': Math.floor(playerCount * 2),
        'physics-quality': specs.cpu.cores >= 6 ? 'high' : 'medium'
      }
    };

    return settings[gameId] || {};
  }

  private generateWarnings(requirements: GameServerRequirements, compatibility: HardwareCompatibility): OptimizationWarning[] {
    const warnings: OptimizationWarning[] = [];
    const specs = this.systemSpecs!;

    // CPU warnings
    if (compatibility.compatibility.cpu === 'poor' || compatibility.compatibility.cpu === 'incompatible') {
      warnings.push({
        severity: compatibility.compatibility.cpu === 'incompatible' ? 'critical' : 'high',
        category: 'hardware',
        message: `CPU may not meet minimum requirements for ${requirements.gameName}`,
        impact: 'Poor server performance, frequent lag, potential crashes',
        solution: 'Consider upgrading to a CPU with more cores or higher frequency'
      });
    }

    // Memory warnings
    if (compatibility.compatibility.memory === 'poor' || compatibility.compatibility.memory === 'incompatible') {
      warnings.push({
        severity: compatibility.compatibility.memory === 'incompatible' ? 'critical' : 'high',
        category: 'hardware',
        message: `Insufficient RAM for optimal ${requirements.gameName} server performance`,
        impact: 'Server may crash under load, frequent garbage collection pauses',
        solution: 'Upgrade RAM or reduce maximum player count'
      });
    }

    // Network warnings
    if (specs.network.uploadSpeed < requirements.recommended.network.upload) {
      warnings.push({
        severity: 'medium',
        category: 'network',
        message: 'Upload speed may limit player capacity',
        impact: 'Players may experience high latency or connection issues',
        solution: 'Upgrade internet plan or reduce maximum player count'
      });
    }

    // Storage warnings
    if (specs.storage.type === 'HDD') {
      warnings.push({
        severity: 'medium',
        category: 'hardware',
        message: 'HDD storage may cause performance issues',
        impact: 'Slow world saves, increased loading times, potential server freezes',
        solution: 'Upgrade to SSD or NVMe storage for better performance'
      });
    }

    return warnings;
  }

  private generateSuggestions(requirements: GameServerRequirements, compatibility: HardwareCompatibility, performance: OptimizationRecommendation['estimatedPerformance']): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const specs = this.systemSpecs!;

    // Performance suggestions
    if (performance.stability < 80) {
      suggestions.push({
        type: 'configuration',
        priority: 'high',
        title: 'Reduce Player Count',
        description: 'Current configuration may be unstable with high player counts',
        expectedImprovement: '+20% stability',
        implementation: 'automatic'
      });
    }

    // Hardware upgrade suggestions
    if (compatibility.compatibility.cpu === 'fair' || compatibility.compatibility.cpu === 'poor') {
      suggestions.push({
        type: 'hardware',
        priority: 'medium',
        title: 'CPU Upgrade Recommended',
        description: `Upgrading to a ${requirements.optimal.cpu.cores}-core CPU at ${requirements.optimal.cpu.frequency}GHz would improve performance`,
        expectedImprovement: '+40% player capacity',
        implementation: 'hardware_upgrade'
      });
    }

    // Network optimization suggestions
    if (specs.network.uploadSpeed < requirements.optimal.network.upload) {
      suggestions.push({
        type: 'network',
        priority: 'medium',
        title: 'Network Optimization',
        description: 'Configure QoS settings to prioritize game server traffic',
        expectedImprovement: '+15% network performance',
        implementation: 'manual'
      });
    }

    // Game-specific suggestions
    if (requirements.gameId === 'rust' && specs.storage.type !== 'SSD') {
      suggestions.push({
        type: 'hardware',
        priority: 'high',
        title: 'SSD Highly Recommended for Rust',
        description: 'Rust servers benefit significantly from SSD storage due to frequent world saves',
        expectedImprovement: '+60% save performance',
        implementation: 'hardware_upgrade'
      });
    }

    return suggestions;
  }

  private calculateConfidence(compatibility: HardwareCompatibility, performance: OptimizationRecommendation['estimatedPerformance']): number {
    const compatibilityScore = this.getCompatibilityScore(compatibility.compatibility.overall);
    const stabilityScore = performance.stability;
    const benchmarkBonus = this.benchmarkHistory.length > 0 ? 10 : 0;
    
    return Math.min(100, Math.floor((compatibilityScore + stabilityScore) / 2 + benchmarkBonus));
  }

  private getCompatibilityScore(overall: HardwareCompatibility['compatibility']['overall']): number {
    const scoreMap = { excellent: 95, good: 85, fair: 70, poor: 50, incompatible: 25 };
    return scoreMap[overall];
  }

  private identifyLimitations(specs: SystemSpecs, requirements: GameServerRequirements): string[] {
    const limitations: string[] = [];
    
    if (specs.cpu.cores < requirements.recommended.cpu.cores) {
      limitations.push(`CPU core count limits maximum player capacity to ~${Math.floor(specs.cpu.cores * requirements.scalingFactors.playersPerCore)} players`);
    }
    
    if (specs.memory.available < requirements.recommended.memory) {
      limitations.push(`Available RAM limits server to basic configuration`);
    }
    
    if (specs.network.uploadSpeed < requirements.recommended.network.upload) {
      limitations.push(`Upload speed may cause latency issues with ${Math.floor(specs.network.uploadSpeed * 1000 / requirements.scalingFactors.networkPerPlayer)}+ players`);
    }
    
    return limitations;
  }

  private generateCompatibilityRecommendations(specs: SystemSpecs, requirements: GameServerRequirements): string[] {
    const recommendations: string[] = [];
    
    if (specs.cpu.cores >= requirements.optimal.cpu.cores) {
      recommendations.push('CPU is excellent for this game - can handle high player counts');
    }
    
    if (specs.memory.available >= requirements.optimal.memory) {
      recommendations.push('RAM is sufficient for optimal performance');
    }
    
    if (specs.storage.type === 'NVMe') {
      recommendations.push('NVMe storage will provide excellent world save performance');
    }
    
    return recommendations;
  }

  private calculateBenchmarkScore(benchmark: BenchmarkResult): number {
    const performanceScore = benchmark.userRating.performance * 20;
    const stabilityScore = benchmark.userRating.stability * 20;
    const uptimeScore = benchmark.results.uptime;
    
    return (performanceScore + stabilityScore + uptimeScore) / 3;
  }

  // Public methods for managing benchmarks
  addBenchmarkResult(result: BenchmarkResult): void {
    this.benchmarkHistory.push(result);
    
    // Keep only the last 50 benchmarks per game
    const gameResults = this.benchmarkHistory.filter(b => b.gameId === result.gameId);
    if (gameResults.length > 50) {
      const oldestIndex = this.benchmarkHistory.findIndex(b => b.gameId === result.gameId);
      this.benchmarkHistory.splice(oldestIndex, 1);
    }
  }

  getBenchmarkHistory(gameId?: string): BenchmarkResult[] {
    return gameId 
      ? this.benchmarkHistory.filter(b => b.gameId === gameId)
      : this.benchmarkHistory;
  }
}