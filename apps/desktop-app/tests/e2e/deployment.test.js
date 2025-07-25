const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;

// Import services for testing
const DeploymentService = require('../../src/main/services/DeploymentService');
const HealthCheckService = require('../../src/main/services/HealthCheckService');

describe('Deployment Automation Tests', () => {
  let store;
  let tempDir;
  let deploymentService;
  let healthCheckService;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-deployment-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'deployment-test-store',
      cwd: tempDir
    });
  });

  afterAll(async () => {
    // Clean up temporary files
    try {
      await fs.rm(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error.message);
    }
  });

  beforeEach(async () => {
    store.clear();
    
    // Initialize services
    deploymentService = new DeploymentService(store, console);
    healthCheckService = new HealthCheckService(store, console, {});
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Deployment Service', () => {
    test('should initialize deployment service successfully', () => {
      expect(deploymentService).toBeDefined();
      expect(deploymentService.config).toBeDefined();
      expect(deploymentService.config.environments).toBeDefined();
      expect(deploymentService.stats).toBeDefined();
    });

    test('should have default environments configured', () => {
      const config = deploymentService.getConfiguration();
      expect(config.environments.development).toBeDefined();
      expect(config.environments.staging).toBeDefined();
      expect(config.environments.production).toBeDefined();
    });

    test('should generate unique deployment IDs', () => {
      const id1 = deploymentService.generateDeploymentId();
      const id2 = deploymentService.generateDeploymentId();
      
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^deploy_/);
      expect(id2).toMatch(/^deploy_/);
    });

    test('should increment build numbers', () => {
      const build1 = deploymentService.generateBuildNumber();
      const build2 = deploymentService.generateBuildNumber();
      
      expect(build2).toBe(build1 + 1);
    });

    test('should validate unknown environment', async () => {
      await expect(deploymentService.deploy('unknown-env'))
        .rejects.toThrow('Unknown environment: unknown-env');
    });

    test('should get environment status', () => {
      const status = deploymentService.getEnvironmentStatus('development');
      expect(status).toBeDefined();
      expect(status.environment).toBe('development');
      expect(status.isDeploying).toBe(false);
    });

    test('should track deployment statistics', () => {
      const stats = deploymentService.getStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalDeployments).toBe('number');
      expect(typeof stats.successfulDeployments).toBe('number');
      expect(typeof stats.failedDeployments).toBe('number');
      expect(typeof stats.rollbacks).toBe('number');
    });

    test('should export deployment data', () => {
      const data = deploymentService.exportData();
      expect(data).toBeDefined();
      expect(data.config).toBeDefined();
      expect(data.statistics).toBeDefined();
      expect(data.deploymentHistory).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    test('should update configuration', () => {
      const originalTimeout = deploymentService.config.build.timeout;
      const newConfig = {
        build: {
          timeout: 600000
        }
      };

      deploymentService.updateConfiguration(newConfig);
      const updatedConfig = deploymentService.getConfiguration();
      
      expect(updatedConfig.build.timeout).toBe(600000);
      expect(updatedConfig.build.timeout).not.toBe(originalTimeout);
    });
  });

  describe('Health Check Service', () => {
    test('should initialize health check service successfully', () => {
      expect(healthCheckService).toBeDefined();
      expect(healthCheckService.config).toBeDefined();
      expect(healthCheckService.currentHealth).toBeDefined();
    });

    test('should have default health check configuration', () => {
      const config = healthCheckService.getConfiguration();
      expect(config.enabled).toBe(true);
      expect(config.interval).toBeDefined();
      expect(config.checks).toBeDefined();
      expect(config.thresholds).toBeDefined();
    });

    test('should get current health status', () => {
      const health = healthCheckService.getCurrentHealth();
      expect(health).toBeDefined();
      expect(health.overall).toBeDefined();
      expect(health.uptime).toBeDefined();
      expect(health.startTime).toBeDefined();
    });

    test('should perform health check', async () => {
      await healthCheckService.performHealthCheck();
      const health = healthCheckService.getCurrentHealth();
      
      expect(health.lastCheck).toBeDefined();
      expect(health.checks).toBeDefined();
    }, 10000); // 10 second timeout for health check

    test('should get health history', () => {
      const history = healthCheckService.getHealthHistory(10);
      expect(Array.isArray(history)).toBe(true);
    });

    test('should calculate health summary', () => {
      // Add a mock health check to history first
      healthCheckService.addToHistory({
        timestamp: Date.now(),
        overall: 'healthy',
        checks: {},
        duration: 100
      });

      const summary = healthCheckService.getHealthSummary(60000); // Last minute
      expect(summary).toBeDefined();
      if (summary) {
        expect(summary.totalChecks).toBeGreaterThan(0);
        expect(summary.currentStatus).toBeDefined();
      }
    });

    test('should format bytes correctly', () => {
      const formatted1 = healthCheckService.formatBytes(1024);
      const formatted2 = healthCheckService.formatBytes(1048576);
      const formatted3 = healthCheckService.formatBytes(1073741824);
      
      expect(formatted1).toBe('1.0KB');
      expect(formatted2).toBe('1.0MB');
      expect(formatted3).toBe('1.0GB');
    });

    test('should format duration correctly', () => {
      const duration1 = healthCheckService.formatDuration(5000); // 5 seconds
      const duration2 = healthCheckService.formatDuration(65000); // 1 minute 5 seconds
      const duration3 = healthCheckService.formatDuration(3665000); // 1 hour 1 minute 5 seconds
      
      expect(duration1).toBe('5s');
      expect(duration2).toBe('1m 5s');
      expect(duration3).toBe('1h 1m');
    });

    test('should update health configuration', () => {
      const originalInterval = healthCheckService.config.interval;
      const newConfig = {
        interval: 60000 // 1 minute
      };

      healthCheckService.updateConfiguration(newConfig);
      const updatedConfig = healthCheckService.getConfiguration();
      
      expect(updatedConfig.interval).toBe(60000);
      expect(updatedConfig.interval).not.toBe(originalInterval);
    });

    test('should export health data', () => {
      const data = healthCheckService.exportData();
      expect(data).toBeDefined();
      expect(data.config).toBeDefined();
      expect(data.currentHealth).toBeDefined();
      expect(data.healthHistory).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    test('should determine worst status correctly', () => {
      expect(healthCheckService.getWorstStatus(['healthy', 'healthy'])).toBe('healthy');
      expect(healthCheckService.getWorstStatus(['healthy', 'warning'])).toBe('warning');
      expect(healthCheckService.getWorstStatus(['warning', 'unhealthy'])).toBe('unhealthy');
      expect(healthCheckService.getWorstStatus(['healthy', 'warning', 'unhealthy'])).toBe('unhealthy');
      expect(healthCheckService.getWorstStatus([])).toBe('unknown');
    });

    test('should get status from threshold correctly', () => {
      const threshold = { warning: 70, critical: 85 };
      
      expect(healthCheckService.getStatusFromThreshold(50, threshold)).toBe('healthy');
      expect(healthCheckService.getStatusFromThreshold(75, threshold)).toBe('warning');
      expect(healthCheckService.getStatusFromThreshold(90, threshold)).toBe('unhealthy');
    });
  });

  describe('Integration Tests', () => {
    test('should handle deployment events', (done) => {
      const events = [];
      
      deploymentService.on('deployment-service-initialized', (data) => {
        events.push({ type: 'initialized', data });
      });

      deploymentService.on('config-updated', (config) => {
        events.push({ type: 'config-updated', config });
        
        // Check that we received events
        expect(events.length).toBeGreaterThan(0);
        expect(events.some(e => e.type === 'config-updated')).toBe(true);
        done();
      });

      // Trigger config update to test events
      deploymentService.updateConfiguration({ test: true });
    });

    test('should handle health check events', (done) => {
      const events = [];
      
      healthCheckService.on('health-service-initialized', (data) => {
        events.push({ type: 'initialized', data });
      });

      healthCheckService.on('config-updated', (config) => {
        events.push({ type: 'config-updated', config });
        
        // Check that we received events
        expect(events.length).toBeGreaterThan(0);
        expect(events.some(e => e.type === 'config-updated')).toBe(true);
        done();
      });

      // Trigger config update to test events
      healthCheckService.updateConfiguration({ test: true });
    });

    test('should validate deployment configuration environments', () => {
      const config = deploymentService.getConfiguration();
      
      // Check that all required environments exist
      expect(config.environments.development).toBeDefined();
      expect(config.environments.staging).toBeDefined();
      expect(config.environments.production).toBeDefined();
      
      // Check that each environment has required properties
      Object.values(config.environments).forEach(env => {
        expect(env.name).toBeDefined();
        expect(env.buildScript).toBeDefined();
        expect(env.outputDir).toBeDefined();
        expect(env.deploymentPath).toBeDefined();
        expect(env.healthCheckUrl).toBeDefined();
        expect(typeof env.backupEnabled).toBe('boolean');
        expect(typeof env.autoRestart).toBe('boolean');
      });
    });

    test('should validate health check configuration', () => {
      const config = healthCheckService.getConfiguration();
      
      // Check required configuration sections
      expect(config.enabled).toBeDefined();
      expect(config.interval).toBeDefined();
      expect(config.checks).toBeDefined();
      expect(config.thresholds).toBeDefined();
      expect(config.alerts).toBeDefined();
      
      // Check threshold structure
      expect(config.thresholds.cpu).toBeDefined();
      expect(config.thresholds.memory).toBeDefined();
      expect(config.thresholds.disk).toBeDefined();
      expect(config.thresholds.eventLoop).toBeDefined();
      
      // Check that thresholds have warning and critical values
      Object.values(config.thresholds).forEach(threshold => {
        if (threshold.warning !== undefined && threshold.critical !== undefined) {
          expect(threshold.warning).toBeLessThan(threshold.critical);
        }
      });
    });

    test('should integrate deployment and health services', () => {
      // Test that services can work together
      const deploymentConfig = deploymentService.getConfiguration();
      const healthConfig = healthCheckService.getConfiguration();
      
      expect(deploymentConfig).toBeDefined();
      expect(healthConfig).toBeDefined();
      
      // Both services should be independently functional
      expect(deploymentService.getStatistics()).toBeDefined();
      expect(healthCheckService.getCurrentHealth()).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle missing store gracefully', () => {
      expect(() => {
        new DeploymentService(null, console);
      }).not.toThrow();
      
      expect(() => {
        new HealthCheckService(null, console, {});
      }).not.toThrow();
    });

    test('should handle invalid configurations', () => {
      expect(() => {
        deploymentService.updateConfiguration({ invalid: 'config' });
      }).not.toThrow();
      
      expect(() => {
        healthCheckService.updateConfiguration({ invalid: 'config' });
      }).not.toThrow();
    });

    test('should handle deployment errors gracefully', async () => {
      // Mock a deployment that will fail due to invalid build script
      deploymentService.config.environments.test = {
        name: 'test',
        buildScript: 'invalid-command-that-does-not-exist',
        outputDir: 'build',
        deploymentPath: '/invalid/path',
        healthCheckUrl: 'http://localhost:9999',
        backupEnabled: false,
        autoRestart: true
      };

      await expect(deploymentService.deploy('test', { skipTests: true }))
        .rejects.toThrow();
    });
  });
});