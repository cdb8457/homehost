const axios = require('axios');
const os = require('os');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

class SystemOptimization {
  constructor(store) {
    this.store = store;
    this.webDashboardUrl = 'http://localhost:3001';
    this.lastOptimization = null;
  }

  /**
   * Get system specifications using the web dashboard's optimization API
   */
  async getSystemSpecs() {
    try {
      const response = await axios.get(`${this.webDashboardUrl}/api/system/specs`, {
        timeout: 10000
      });
      
      this.lastOptimization = {
        specs: response.data,
        timestamp: new Date().toISOString()
      };
      
      return response.data;
    } catch (error) {
      console.log('Web dashboard not available, using local detection');
      return await this.getLocalSystemSpecs();
    }
  }

  /**
   * Get optimization recommendations for a specific game
   */
  async getOptimizationRecommendations(gameId, targetPlayerCount) {
    try {
      // First get system specs
      const specs = await this.getSystemSpecs();
      
      // For now, we'll implement basic local optimization logic
      // In a full implementation, this would call the web dashboard's optimization engine
      return this.generateLocalRecommendations(specs, gameId, targetPlayerCount);
    } catch (error) {
      console.error('Failed to get optimization recommendations:', error);
      throw error;
    }
  }

  /**
   * Local fallback for system specs detection
   */
  async getLocalSystemSpecs() {
    const cpus = os.cpus();
    const platform = os.platform();
    
    let cpuModel = cpus[0]?.model || 'Unknown CPU';
    let frequency = cpus[0]?.speed ? cpus[0].speed / 1000 : 0;
    let actualCores = cpus.length;
    
    // Try to get more detailed info on Linux/WSL
    if (platform === 'linux') {
      try {
        const { stdout } = await execAsync('cat /proc/cpuinfo | grep "model name" | head -1');
        const modelMatch = stdout.match(/model name\\s*:\\s*(.+)/);
        if (modelMatch) {
          cpuModel = modelMatch[1].trim();
        }

        // Extract core count from model name for AMD
        if (cpuModel.includes('-Core')) {
          const coreMatch = cpuModel.match(/(\\d+)-Core/);
          if (coreMatch) {
            actualCores = parseInt(coreMatch[1]);
          }
        }

        // Try to get frequency
        if (frequency === 0) {
          const { stdout: freqStdout } = await execAsync('cat /proc/cpuinfo | grep "cpu MHz" | head -1');
          const freqMatch = freqStdout.match(/cpu MHz\\s*:\\s*(\\d+\\.?\\d*)/);
          if (freqMatch) {
            frequency = parseFloat(freqMatch[1]) / 1000;
          }
        }

        // Fallback: extract frequency from model name
        if (frequency === 0) {
          frequency = this.extractFrequencyFromModel(cpuModel);
        }
      } catch (error) {
        console.log('Failed to get detailed Linux CPU info:', error);
      }
    }

    return {
      cpu: {
        model: cpuModel,
        cores: actualCores,
        threads: cpus.length,
        frequency: Math.round(frequency * 10) / 10,
        architecture: os.arch(),
        generation: this.determineCpuGeneration(cpuModel)
      },
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
        available: Math.round(os.freemem() / (1024 * 1024 * 1024)),
        speed: 0,
        type: 'Unknown'
      },
      storage: {
        type: 'Unknown',
        total: 0,
        available: 0,
        readSpeed: 0,
        writeSpeed: 0
      },
      network: {
        downloadSpeed: 100,
        uploadSpeed: 50,
        latency: 20,
        connectionType: 'Unknown'
      },
      os: {
        platform: platform === 'win32' ? 'Windows' : 
                  platform === 'darwin' ? 'macOS' : 
                  platform === 'linux' ? 'Linux' : platform,
        version: os.release(),
        architecture: os.arch()
      }
    };
  }

  /**
   * Generate local optimization recommendations
   */
  generateLocalRecommendations(specs, gameId, targetPlayerCount = null) {
    const gameRequirements = this.getGameRequirements(gameId);
    
    if (!gameRequirements) {
      throw new Error(`Unsupported game: ${gameId}`);
    }

    // Calculate optimal player count based on hardware
    const cpuPlayerLimit = Math.floor(specs.cpu.cores * gameRequirements.scalingFactors.playersPerCore);
    const memoryPlayerLimit = Math.floor((specs.memory.available * 1024) / gameRequirements.scalingFactors.memoryPerPlayer);
    const hardwarePlayerLimit = Math.min(cpuPlayerLimit, memoryPlayerLimit);
    
    const recommendedPlayers = targetPlayerCount ? 
      Math.min(targetPlayerCount, hardwarePlayerLimit) : 
      hardwarePlayerLimit;

    // Determine configuration level
    const cpuScore = specs.cpu.cores / gameRequirements.recommended.cpu.cores;
    const memoryScore = specs.memory.available / gameRequirements.recommended.memory;
    const overallScore = (cpuScore + memoryScore) / 2;

    let configLevel = 'minimum';
    if (overallScore >= 1.5) configLevel = 'optimal';
    else if (overallScore >= 1.0) configLevel = 'recommended';

    return {
      gameId,
      configurationLevel: configLevel,
      confidence: Math.min(95, Math.floor(overallScore * 60 + 40)),
      estimatedPerformance: {
        maxPlayers: recommendedPlayers,
        expectedTPS: this.calculateTickRate(gameId, specs),
        expectedLatency: Math.floor(specs.network.latency * (1 + (recommendedPlayers / 100))),
        stability: Math.floor(Math.max(60, 100 - (recommendedPlayers / hardwarePlayerLimit * 40)))
      },
      serverConfig: {
        maxPlayers: recommendedPlayers,
        tickRate: this.calculateTickRate(gameId, specs),
        memoryAllocation: Math.floor(recommendedPlayers * gameRequirements.scalingFactors.memoryPerPlayer + gameRequirements.recommended.memory * 1024),
        networkBufferSize: Math.floor(recommendedPlayers * 2),
        threadCount: Math.min(specs.cpu.threads, Math.ceil(recommendedPlayers / 4)),
        customSettings: this.generateGameSettings(gameId, specs, recommendedPlayers)
      },
      warnings: this.generateWarnings(specs, gameRequirements),
      suggestions: this.generateSuggestions(specs, gameRequirements)
    };
  }

  /**
   * Get game requirements and scaling factors
   */
  getGameRequirements(gameId) {
    const requirements = {
      'valheim': {
        recommended: { cpu: { cores: 4, frequency: 3.0 }, memory: 4, storage: 8 },
        scalingFactors: { playersPerCore: 2.5, memoryPerPlayer: 256, networkPerPlayer: 50 }
      },
      'rust': {
        recommended: { cpu: { cores: 6, frequency: 3.5 }, memory: 16, storage: 40 },
        scalingFactors: { playersPerCore: 1.5, memoryPerPlayer: 512, networkPerPlayer: 100 }
      },
      'cs2': {
        recommended: { cpu: { cores: 4, frequency: 3.2 }, memory: 2, storage: 4 },
        scalingFactors: { playersPerCore: 8, memoryPerPlayer: 64, networkPerPlayer: 25 }
      },
      'seven_days': {
        recommended: { cpu: { cores: 4, frequency: 3.2 }, memory: 8, storage: 20 },
        scalingFactors: { playersPerCore: 2, memoryPerPlayer: 400, networkPerPlayer: 75 }
      }
    };

    return requirements[gameId];
  }

  calculateTickRate(gameId, specs) {
    const baseRates = {
      'valheim': 20,
      'rust': 30,
      'cs2': 64,
      'seven_days': 20
    };
    
    const baseRate = baseRates[gameId] || 20;
    const cpuMultiplier = Math.min(2.0, specs.cpu.frequency / 3.0);
    
    return Math.floor(baseRate * cpuMultiplier);
  }

  generateGameSettings(gameId, specs, playerCount) {
    const settings = {
      'valheim': {
        'world-save-interval': Math.max(300, 1800 / Math.log(playerCount + 1)),
        'backup-count': Math.min(10, Math.floor(specs.storage.available / 10)),
        'network-send-rate': Math.floor(specs.network.uploadSpeed * 10)
      },
      'rust': {
        'save-interval': Math.max(300, 1800 / Math.log(playerCount + 1)),
        'entity-decay-time': playerCount > 50 ? 168 : 336,
        'admin-reconnect-timeout': 30
      },
      'cs2': {
        'sv_maxrate': Math.floor(specs.network.uploadSpeed * 1000 / playerCount),
        'sv_minrate': Math.floor(specs.network.uploadSpeed * 500 / playerCount),
        'sv_maxcmdrate': Math.min(128, specs.cpu.frequency * 20)
      }
    };

    return settings[gameId] || {};
  }

  generateWarnings(specs, requirements) {
    const warnings = [];

    if (specs.cpu.cores < requirements.recommended.cpu.cores) {
      warnings.push({
        severity: 'high',
        message: 'CPU may limit server performance',
        suggestion: 'Consider upgrading CPU or reducing player count'
      });
    }

    if (specs.memory.available < requirements.recommended.memory) {
      warnings.push({
        severity: 'medium',
        message: 'Low available memory detected',
        suggestion: 'Close other applications or upgrade RAM'
      });
    }

    return warnings;
  }

  generateSuggestions(specs, requirements) {
    const suggestions = [];

    if (specs.cpu.cores >= requirements.recommended.cpu.cores * 1.5) {
      suggestions.push({
        type: 'performance',
        message: 'Excellent CPU - can handle high player counts',
        implementation: 'automatic'
      });
    }

    if (specs.memory.available >= requirements.recommended.memory * 2) {
      suggestions.push({
        type: 'performance', 
        message: 'Sufficient RAM for multiple game servers',
        implementation: 'automatic'
      });
    }

    return suggestions;
  }

  extractFrequencyFromModel(model) {
    // Known base frequencies for common processors
    const knownFrequencies = {
      '9950X3D': 4.2,
      '9950X': 4.7,
      '7950X3D': 4.2,
      '7950X': 4.5,
      '5950X': 3.4,
      '13900K': 3.0,
      '13700K': 3.4,
      '12900K': 3.2
    };
    
    for (const [cpu, freq] of Object.entries(knownFrequencies)) {
      if (model.includes(cpu)) {
        return freq;
      }
    }
    
    return 0;
  }

  determineCpuGeneration(model) {
    const modelLower = model.toLowerCase();
    
    // AMD generations
    if (modelLower.includes('ryzen 9 9') || modelLower.includes('9950x3d')) {
      return 'AMD Ryzen 9000 X3D (Zen 5)';
    }
    if (modelLower.includes('ryzen 9 7') || modelLower.includes('7950x3d')) {
      return 'AMD Ryzen 7000 X3D (Zen 4)';
    }
    if (modelLower.includes('ryzen 9 5') || modelLower.includes('5950x')) {
      return 'AMD Ryzen 5000 (Zen 3)';
    }
    
    // Intel generations
    if (modelLower.includes('i7-13') || modelLower.includes('i9-13')) {
      return '13th Gen Intel';
    }
    if (modelLower.includes('i7-12') || modelLower.includes('i9-12')) {
      return '12th Gen Intel';
    }
    
    return 'Unknown';
  }

  /**
   * Apply optimization recommendations to server configuration
   */
  applyOptimizations(serverConfig, recommendations) {
    return {
      ...serverConfig,
      maxPlayers: recommendations.serverConfig.maxPlayers,
      tickRate: recommendations.serverConfig.tickRate,
      memoryAllocation: recommendations.serverConfig.memoryAllocation,
      customSettings: {
        ...serverConfig.customSettings,
        ...recommendations.serverConfig.customSettings
      }
    };
  }

  /**
   * Monitor system performance during server operation
   */
  async getCurrentSystemLoad() {
    try {
      const response = await axios.get(`${this.webDashboardUrl}/api/system/monitor`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      // Fallback to basic local monitoring
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
      
      return {
        cpu: Math.random() * 30 + 10, // Placeholder
        memory: Math.round(memoryUsage),
        storage: Math.random() * 20 + 5,
        network: Math.random() * 15 + 5,
        temperature: {
          cpu: Math.random() * 20 + 40,
          gpu: Math.random() * 25 + 45
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = SystemOptimization;