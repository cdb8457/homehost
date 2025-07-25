// Production Configuration for HomeHost Desktop
// This file contains optimized settings for production deployment

module.exports = {
  // Security Configuration
  security: {
    // Security manager settings
    manager: {
      encryptionAlgorithm: 'aes-256-gcm',
      keyLength: 32,
      saltRounds: 12,
      sessionTimeout: 3600000, // 1 hour
      maxLoginAttempts: 5,
      lockoutDuration: 900000 // 15 minutes
    },
    
    // Security auditor settings
    auditor: {
      enabled: true,
      scheduledAudits: true,
      auditInterval: 86400000, // 24 hours
      comprehensiveAuditInterval: 604800000, // 7 days
      retainAuditHistory: 30, // days
      criticalIssueNotification: true
    },
    
    // Input validation settings
    validation: {
      maxInputLength: 10000,
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['.txt', '.json', '.csv', '.log'],
      sanitizeInput: true,
      strictValidation: true
    }
  },

  // Rate Limiting Configuration
  rateLimiting: {
    global: {
      enabled: true,
      maxRequests: 1000,
      windowMs: 900000, // 15 minutes
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    },
    
    endpoints: {
      '/api/auth/login': {
        maxRequests: 5,
        windowMs: 900000, // 15 minutes
        burstLimit: 10,
        enabled: true
      },
      '/api/auth/register': {
        maxRequests: 3,
        windowMs: 3600000, // 1 hour
        burstLimit: 5,
        enabled: true
      },
      '/api/deploy': {
        maxRequests: 10,
        windowMs: 3600000, // 1 hour
        burstLimit: 15,
        enabled: true
      },
      '/api/data': {
        maxRequests: 500,
        windowMs: 900000, // 15 minutes
        burstLimit: 750,
        enabled: true
      }
    },
    
    ddosProtection: {
      enabled: true,
      threshold: 100, // requests per minute
      blockDuration: 3600000, // 1 hour
      suspiciousActivityThreshold: 50
    }
  },

  // Performance Monitoring Configuration
  performance: {
    monitoring: {
      enabled: true,
      interval: 5000, // 5 seconds
      retainMetrics: 86400000, // 24 hours
      detailedMetrics: true
    },
    
    thresholds: {
      cpu: {
        warning: 70,
        critical: 85
      },
      memory: {
        warning: 75,
        critical: 90
      },
      eventLoop: {
        warning: 50, // ms
        critical: 100 // ms
      },
      disk: {
        warning: 80,
        critical: 95
      }
    },
    
    optimization: {
      autoOptimization: false, // Manual approval required in production
      garbageCollection: {
        enabled: true,
        interval: 300000 // 5 minutes
      },
      memoryLeakDetection: true,
      performanceAlerts: true
    }
  },

  // Health Check Configuration
  healthChecks: {
    enabled: true,
    interval: 30000, // 30 seconds
    timeout: 10000, // 10 seconds
    retainHistory: 1000, // number of checks
    
    checks: {
      system: true,
      database: true,
      services: true,
      disk: true,
      network: true,
      memory: true,
      cpu: true
    },
    
    thresholds: {
      cpu: {
        warning: 70,
        critical: 85
      },
      memory: {
        warning: 75,
        critical: 90
      },
      disk: {
        warning: 80,
        critical: 95
      },
      responseTime: {
        warning: 1000, // ms
        critical: 3000 // ms
      }
    },
    
    alerts: {
      enabled: true,
      email: false, // Configure email settings separately
      webhook: false, // Configure webhook settings separately
      logToFile: true
    }
  },

  // Deployment Configuration
  deployment: {
    environments: {
      development: {
        name: 'development',
        buildScript: 'npm run build:dev',
        outputDir: 'dist',
        deploymentPath: '/opt/homehost/dev',
        healthCheckUrl: 'http://localhost:3000/health',
        backupEnabled: false,
        autoRestart: true,
        approvalRequired: false
      },
      staging: {
        name: 'staging',
        buildScript: 'npm run build:staging',
        outputDir: 'dist',
        deploymentPath: '/opt/homehost/staging',
        healthCheckUrl: 'https://staging.homehost.com/health',
        backupEnabled: true,
        autoRestart: true,
        approvalRequired: true
      },
      production: {
        name: 'production',
        buildScript: 'npm run build:prod',
        outputDir: 'dist',
        deploymentPath: '/opt/homehost/prod',
        healthCheckUrl: 'https://api.homehost.com/health',
        backupEnabled: true,
        autoRestart: true,
        approvalRequired: true
      }
    },
    
    build: {
      timeout: 1800000, // 30 minutes
      maxRetries: 3,
      cleanBuild: true,
      runTests: true,
      compressionEnabled: true
    },
    
    rollback: {
      enabled: true,
      keepVersions: 5,
      autoRollbackOnFailure: false, // Manual approval in production
      rollbackTimeout: 600000 // 10 minutes
    }
  },

  // Logging Configuration
  logging: {
    level: 'info', // error, warn, info, debug
    enableConsole: false,
    enableFile: true,
    logDirectory: './logs',
    maxFileSize: 10485760, // 10MB
    maxFiles: 10,
    datePattern: 'YYYY-MM-DD',
    
    categories: {
      security: {
        level: 'debug',
        separate: true,
        retention: 90 // days
      },
      performance: {
        level: 'info',
        separate: true,
        retention: 30 // days
      },
      deployment: {
        level: 'info',
        separate: true,
        retention: 60 // days
      },
      health: {
        level: 'warn',
        separate: true,
        retention: 30 // days
      }
    }
  },

  // Application Settings
  application: {
    autoStart: false,
    minimizeToTray: true,
    notifications: true,
    updateCheck: true,
    telemetry: false, // Privacy-focused
    crashReporting: true,
    
    ui: {
      theme: 'dark',
      animations: true,
      autoRefresh: true,
      refreshInterval: 30000 // 30 seconds
    }
  },

  // Database Configuration (if applicable)
  database: {
    connectionPool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 30000
    },
    
    backup: {
      enabled: true,
      interval: 86400000, // 24 hours
      retention: 7, // days
      compression: true
    }
  },

  // Network Configuration
  network: {
    timeout: 30000, // 30 seconds
    retries: 3,
    keepAlive: true,
    compression: true,
    
    cors: {
      enabled: true,
      origins: ['https://homehost.com', 'https://api.homehost.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  }
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  module.exports.logging.level = 'debug';
  module.exports.logging.enableConsole = true;
  module.exports.performance.monitoring.interval = 10000; // 10 seconds
  module.exports.healthChecks.interval = 60000; // 1 minute
  module.exports.application.telemetry = true; // For development insights
}

// Export configuration validator
module.exports.validate = function(config) {
  const required = [
    'security.manager.encryptionAlgorithm',
    'rateLimiting.global.enabled',
    'performance.monitoring.enabled',
    'healthChecks.enabled',
    'deployment.environments'
  ];
  
  for (const path of required) {
    const keys = path.split('.');
    let current = config;
    
    for (const key of keys) {
      if (current[key] === undefined) {
        throw new Error(`Missing required configuration: ${path}`);
      }
      current = current[key];
    }
  }
  
  return true;
};