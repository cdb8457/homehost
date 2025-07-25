import { GameServerRequirements } from '@/types/optimization';

export const GAME_REQUIREMENTS: Record<string, GameServerRequirements> = {
  valheim: {
    gameId: 'valheim',
    gameName: 'Valheim',
    minimum: {
      cpu: {
        cores: 2,
        frequency: 2.5
      },
      memory: 2,
      storage: 4,
      network: {
        upload: 1,
        download: 5
      }
    },
    recommended: {
      cpu: {
        cores: 4,
        frequency: 3.0
      },
      memory: 4,
      storage: 8,
      network: {
        upload: 2,
        download: 10
      }
    },
    optimal: {
      cpu: {
        cores: 6,
        frequency: 3.5
      },
      memory: 8,
      storage: 16,
      network: {
        upload: 5,
        download: 25
      }
    },
    scalingFactors: {
      playersPerCore: 2.5,
      memoryPerPlayer: 256,
      networkPerPlayer: 50
    }
  },
  rust: {
    gameId: 'rust',
    gameName: 'Rust',
    minimum: {
      cpu: {
        cores: 4,
        frequency: 3.0
      },
      memory: 8,
      storage: 20,
      network: {
        upload: 2,
        download: 10
      }
    },
    recommended: {
      cpu: {
        cores: 6,
        frequency: 3.5
      },
      memory: 16,
      storage: 40,
      network: {
        upload: 5,
        download: 25
      }
    },
    optimal: {
      cpu: {
        cores: 8,
        frequency: 4.0
      },
      memory: 32,
      storage: 80,
      network: {
        upload: 10,
        download: 50
      }
    },
    scalingFactors: {
      playersPerCore: 1.5,
      memoryPerPlayer: 512,
      networkPerPlayer: 100
    }
  },
  cs2: {
    gameId: 'cs2',
    gameName: 'Counter-Strike 2',
    minimum: {
      cpu: {
        cores: 2,
        frequency: 2.8
      },
      memory: 1,
      storage: 2,
      network: {
        upload: 1,
        download: 5
      }
    },
    recommended: {
      cpu: {
        cores: 4,
        frequency: 3.2
      },
      memory: 2,
      storage: 4,
      network: {
        upload: 2,
        download: 10
      }
    },
    optimal: {
      cpu: {
        cores: 4,
        frequency: 3.8
      },
      memory: 4,
      storage: 8,
      network: {
        upload: 3,
        download: 15
      }
    },
    scalingFactors: {
      playersPerCore: 8,
      memoryPerPlayer: 64,
      networkPerPlayer: 25
    }
  },
  '7d2d': {
    gameId: '7d2d',
    gameName: '7 Days to Die',
    minimum: {
      cpu: {
        cores: 3,
        frequency: 2.8
      },
      memory: 6,
      storage: 12,
      network: {
        upload: 2,
        download: 8
      }
    },
    recommended: {
      cpu: {
        cores: 4,
        frequency: 3.2
      },
      memory: 8,
      storage: 20,
      network: {
        upload: 3,
        download: 15
      }
    },
    optimal: {
      cpu: {
        cores: 6,
        frequency: 3.8
      },
      memory: 16,
      storage: 40,
      network: {
        upload: 5,
        download: 25
      }
    },
    scalingFactors: {
      playersPerCore: 2,
      memoryPerPlayer: 400,
      networkPerPlayer: 75
    }
  },
  motortown: {
    gameId: 'motortown',
    gameName: 'MotorTown',
    minimum: {
      cpu: {
        cores: 2,
        frequency: 2.5
      },
      memory: 3,
      storage: 6,
      network: {
        upload: 1,
        download: 5
      }
    },
    recommended: {
      cpu: {
        cores: 4,
        frequency: 3.0
      },
      memory: 6,
      storage: 12,
      network: {
        upload: 2,
        download: 10
      }
    },
    optimal: {
      cpu: {
        cores: 6,
        frequency: 3.5
      },
      memory: 12,
      storage: 24,
      network: {
        upload: 4,
        download: 20
      }
    },
    scalingFactors: {
      playersPerCore: 3,
      memoryPerPlayer: 200,
      networkPerPlayer: 40
    }
  }
};

export const PERFORMANCE_PROFILES = {
  conservative: {
    profileId: 'conservative',
    name: 'Conservative',
    description: 'Prioritizes stability and system resources for other applications',
    cpuUsageLimit: 0.7,
    memoryUsageLimit: 0.6,
    networkUsageLimit: 0.8,
    playerCountMultiplier: 0.8
  },
  balanced: {
    profileId: 'balanced',
    name: 'Balanced',
    description: 'Optimal balance between performance and system stability',
    cpuUsageLimit: 0.85,
    memoryUsageLimit: 0.75,
    networkUsageLimit: 0.9,
    playerCountMultiplier: 1.0
  },
  performance: {
    profileId: 'performance',
    name: 'Performance',
    description: 'Maximizes server performance and player capacity',
    cpuUsageLimit: 0.95,
    memoryUsageLimit: 0.9,
    networkUsageLimit: 1.0,
    playerCountMultiplier: 1.2
  },
  enterprise: {
    profileId: 'enterprise',
    name: 'Enterprise',
    description: 'Enterprise-grade reliability with advanced monitoring',
    cpuUsageLimit: 0.8,
    memoryUsageLimit: 0.7,
    networkUsageLimit: 0.85,
    playerCountMultiplier: 0.9,
    features: ['advanced_monitoring', 'auto_scaling', 'backup_redundancy']
  }
};

export const HARDWARE_COMPATIBILITY_MATRIX = {
  cpu: {
    excellent: {
      minCores: 8,
      minFrequency: 3.5,
      architectures: ['x64', 'arm64']
    },
    good: {
      minCores: 4,
      minFrequency: 3.0,
      architectures: ['x64']
    },
    fair: {
      minCores: 2,
      minFrequency: 2.5,
      architectures: ['x64']
    },
    poor: {
      minCores: 1,
      minFrequency: 2.0,
      architectures: ['x64']
    }
  },
  memory: {
    excellent: { minGB: 32 },
    good: { minGB: 16 },
    fair: { minGB: 8 },
    poor: { minGB: 4 }
  },
  storage: {
    excellent: { type: 'NVMe', minGB: 500 },
    good: { type: 'SSD', minGB: 250 },
    fair: { type: 'SSD', minGB: 100 },
    poor: { type: 'HDD', minGB: 100 }
  },
  network: {
    excellent: { minUpload: 100, minDownload: 500 },
    good: { minUpload: 50, minDownload: 250 },
    fair: { minUpload: 25, minDownload: 100 },
    poor: { minUpload: 10, minDownload: 50 }
  }
};