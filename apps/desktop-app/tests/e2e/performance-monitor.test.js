const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;

// Import services for testing
const PerformanceMonitor = require('../../src/main/services/PerformanceMonitor');

describe('Performance Monitor Tests', () => {
  let store;
  let tempDir;
  let performanceMonitor;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-performance-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'performance-test-store',
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
    
    // Initialize performance monitor
    performanceMonitor = new PerformanceMonitor(store, console);
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  afterEach(() => {
    if (performanceMonitor) {
      performanceMonitor.stopMonitoring();
    }
  });

  describe('Initialization and Configuration', () => {
    test('should initialize performance monitor successfully', () => {
      expect(performanceMonitor).toBeDefined();
      expect(performanceMonitor.config).toBeDefined();
      expect(performanceMonitor.metrics).toBeDefined();
      expect(performanceMonitor.alerts).toBeDefined();
      expect(performanceMonitor.recommendations).toBeDefined();
    });

    test('should load default configuration', () => {
      const config = performanceMonitor.getConfiguration();
      expect(config.collection.enabled).toBe(true);
      expect(config.collection.interval).toBe(5000);
      expect(config.thresholds.cpu.warning).toBe(70);
      expect(config.thresholds.memory.warning).toBe(80);
      expect(config.optimization.enabled).toBe(true);
    });

    test('should update configuration correctly', () => {
      const newConfig = {
        collection: {
          enabled: false,
          interval: 10000
        },
        thresholds: {
          cpu: { warning: 60, critical: 80 }
        }
      };

      performanceMonitor.updateConfiguration(newConfig);
      const config = performanceMonitor.getConfiguration();
      
      expect(config.collection.enabled).toBe(false);
      expect(config.collection.interval).toBe(10000);
      expect(config.thresholds.cpu.warning).toBe(60);
      expect(config.thresholds.cpu.critical).toBe(80);
    });

    test('should establish baseline metrics', () => {
      const baseline = store.get('performance.baseline');
      expect(baseline).toBeDefined();
      expect(baseline.timestamp).toBeDefined();
    });
  });

  describe('Metrics Collection', () => {
    test('should collect system metrics', () => {
      performanceMonitor.collectSystemMetrics();
      
      const systemMetrics = performanceMonitor.getLatestMetric('system');
      expect(systemMetrics).toBeDefined();
      expect(systemMetrics.timestamp).toBeDefined();
      expect(systemMetrics.cpu).toBeDefined();
      expect(systemMetrics.memory).toBeDefined();
      expect(systemMetrics.system).toBeDefined();
      
      expect(typeof systemMetrics.cpu.usage).toBe('number');
      expect(typeof systemMetrics.memory.total).toBe('number');
      expect(typeof systemMetrics.memory.free).toBe('number');
      expect(typeof systemMetrics.memory.usage).toBe('number');
    });

    test('should collect process metrics', () => {
      performanceMonitor.collectProcessMetrics();
      
      const processMetrics = performanceMonitor.getLatestMetric('process');
      expect(processMetrics).toBeDefined();
      expect(processMetrics.memory).toBeDefined();
      expect(processMetrics.cpu).toBeDefined();
      expect(processMetrics.resources).toBeDefined();
      expect(processMetrics.process).toBeDefined();
      
      expect(typeof processMetrics.memory.heapUsed).toBe('number');
      expect(typeof processMetrics.memory.heapTotal).toBe('number');
      expect(typeof processMetrics.process.pid).toBe('number');
    });

    test('should collect event loop metrics', async () => {
      const eventLoopPromise = new Promise((resolve) => {
        performanceMonitor.once('eventloop-metrics', (metrics) => {
          resolve(metrics);
        });
      });

      performanceMonitor.collectEventLoopMetrics();
      
      const eventLoopMetrics = await eventLoopPromise;
      expect(eventLoopMetrics).toBeDefined();
      expect(eventLoopMetrics.timestamp).toBeDefined();
      expect(typeof eventLoopMetrics.lag).toBe('number');
      expect(eventLoopMetrics.lag).toBeGreaterThanOrEqual(0);
    });

    test('should collect memory metrics', () => {
      performanceMonitor.collectMemoryMetrics();
      
      const memoryMetrics = performanceMonitor.getLatestMetric('memory');
      expect(memoryMetrics).toBeDefined();
      expect(memoryMetrics.heap).toBeDefined();
      expect(memoryMetrics.process).toBeDefined();
      expect(memoryMetrics.system).toBeDefined();
      
      expect(typeof memoryMetrics.heap.used).toBe('number');
      expect(typeof memoryMetrics.heap.total).toBe('number');
      expect(typeof memoryMetrics.heap.usage).toBe('number');
    });

    test('should limit stored data points', () => {
      const maxDataPoints = performanceMonitor.config.collection.maxDataPoints;
      
      // Add more metrics than the limit
      for (let i = 0; i < maxDataPoints + 100; i++) {
        performanceMonitor.addMetric('system', {
          timestamp: Date.now() + i,
          test: true
        });
      }
      
      expect(performanceMonitor.metrics.system.length).toBeLessThanOrEqual(maxDataPoints);
    });

    test('should get recent metrics within time window', () => {
      const now = Date.now();
      
      // Add metrics with different timestamps
      performanceMonitor.addMetric('system', { timestamp: now - 10000, old: true });
      performanceMonitor.addMetric('system', { timestamp: now - 5000, recent: true });
      performanceMonitor.addMetric('system', { timestamp: now, current: true });
      
      const recentMetrics = performanceMonitor.getRecentMetrics('system', 7000);
      expect(recentMetrics.length).toBe(2); // Should include recent and current
      expect(recentMetrics.some(m => m.recent)).toBe(true);
      expect(recentMetrics.some(m => m.current)).toBe(true);
      expect(recentMetrics.some(m => m.old)).toBe(false);
    });
  });

  describe('Performance Alerts', () => {
    test('should trigger CPU alerts', () => {
      const alertEvents = [];
      performanceMonitor.on('performance-alert', (alert) => {
        alertEvents.push(alert);
      });

      // Mock high CPU usage
      performanceMonitor.addMetric('system', {
        timestamp: Date.now(),
        cpu: { usage: 90 } // Above critical threshold (85)
      });

      performanceMonitor.checkCPUAlerts();
      
      expect(alertEvents.length).toBeGreaterThan(0);
      expect(alertEvents[0].key).toBe('cpu_usage');
      expect(alertEvents[0].severity).toBe('critical');
    });

    test('should trigger memory alerts', () => {
      const alertEvents = [];
      performanceMonitor.on('performance-alert', (alert) => {
        alertEvents.push(alert);
      });

      // Mock high memory usage
      performanceMonitor.addMetric('memory', {
        timestamp: Date.now(),
        system: { usage: 95 }, // Above critical threshold
        heap: { usage: 70 }
      });

      performanceMonitor.checkMemoryAlerts();
      
      expect(alertEvents.length).toBeGreaterThan(0);
      expect(alertEvents[0].key).toBe('memory_usage');
      expect(alertEvents[0].severity).toBe('critical');
    });

    test('should trigger event loop lag alerts', () => {
      const alertEvents = [];
      performanceMonitor.on('performance-alert', (alert) => {
        alertEvents.push(alert);
      });

      // Mock high event loop lag
      performanceMonitor.addMetric('eventLoop', {
        timestamp: Date.now(),
        lag: 600 // Above critical threshold
      });

      performanceMonitor.checkEventLoopAlerts();
      
      expect(alertEvents.length).toBeGreaterThan(0);
      expect(alertEvents[0].key).toBe('event_loop_lag');
      expect(alertEvents[0].severity).toBe('critical');
    });

    test('should clear alerts when conditions improve', () => {
      // First trigger an alert
      performanceMonitor.addMetric('system', {
        timestamp: Date.now(),
        cpu: { usage: 85 }
      });
      performanceMonitor.checkCPUAlerts();
      
      expect(performanceMonitor.alertStates.has('cpu_usage')).toBe(true);

      // Then improve conditions
      performanceMonitor.addMetric('system', {
        timestamp: Date.now(),
        cpu: { usage: 50 } // Below warning threshold
      });
      performanceMonitor.checkCPUAlerts();
      
      expect(performanceMonitor.alertStates.has('cpu_usage')).toBe(false);
    });

    test('should prevent alert spam with cooldown', () => {
      const alertEvents = [];
      performanceMonitor.on('performance-alert', (alert) => {
        alertEvents.push(alert);
      });

      // Trigger multiple alerts quickly
      for (let i = 0; i < 5; i++) {
        performanceMonitor.triggerAlert('test_alert', 'warning', 'Test Alert', 'Test message');
      }
      
      // Should only get one alert due to cooldown
      expect(alertEvents.length).toBe(1);
    });

    test('should track alert history', () => {
      performanceMonitor.triggerAlert('test_alert', 'warning', 'Test Alert', 'Test message');
      
      expect(performanceMonitor.alerts.length).toBe(1);
      expect(performanceMonitor.alerts[0].key).toBe('test_alert');
      expect(performanceMonitor.alerts[0].title).toBe('Test Alert');
      expect(performanceMonitor.alerts[0].resolved).toBe(false);
    });
  });

  describe('Optimization Recommendations', () => {
    test('should generate CPU optimization recommendations', () => {
      const alert = {
        key: 'cpu_usage',
        severity: 'critical',
        data: { cpuUsage: 90 }
      };

      performanceMonitor.generateOptimizationRecommendations(alert);
      
      const recommendations = performanceMonitor.getActiveRecommendations();
      expect(recommendations.length).toBeGreaterThan(0);
      
      const cpuRec = recommendations.find(r => r.type === 'cpu_optimization');
      expect(cpuRec).toBeDefined();
      expect(cpuRec.suggestions).toBeDefined();
      expect(cpuRec.suggestions.length).toBeGreaterThan(0);
    });

    test('should generate memory optimization recommendations', () => {
      const alert = {
        key: 'memory_usage',
        severity: 'warning',
        data: { memoryUsage: 85 }
      };

      performanceMonitor.generateOptimizationRecommendations(alert);
      
      const recommendations = performanceMonitor.getActiveRecommendations();
      const memoryRec = recommendations.find(r => r.type === 'memory_optimization');
      
      expect(memoryRec).toBeDefined();
      expect(memoryRec.estimatedImpact).toBe('high');
      expect(memoryRec.difficulty).toBe('medium');
    });

    test('should add recommendation with proper structure', () => {
      const recommendation = {
        type: 'test_optimization',
        severity: 'medium',
        title: 'Test Optimization',
        description: 'Test description',
        suggestions: ['Test suggestion 1', 'Test suggestion 2']
      };

      performanceMonitor.addRecommendation(recommendation);
      
      const added = performanceMonitor.recommendations[0];
      expect(added.id).toBeDefined();
      expect(added.timestamp).toBeDefined();
      expect(added.applied).toBe(false);
      expect(added.suggestions.length).toBe(2);
    });

    test('should limit recommendation history', () => {
      // Add more recommendations than the limit
      for (let i = 0; i < 60; i++) {
        performanceMonitor.addRecommendation({
          type: 'test_optimization',
          title: `Test ${i}`,
          description: 'Test',
          suggestions: []
        });
      }
      
      expect(performanceMonitor.recommendations.length).toBe(50); // Should be limited to 50
    });
  });

  describe('Optimization Application', () => {
    test('should apply GC optimization', async () => {
      const recommendation = {
        type: 'gc_optimization',
        title: 'GC Optimization',
        description: 'Test GC optimization',
        suggestions: []
      };

      performanceMonitor.addRecommendation(recommendation);
      const recId = performanceMonitor.recommendations[0].id;
      
      const result = await performanceMonitor.applyOptimization(recId);
      
      expect(result).toBeDefined();
      expect(result.type).toBe('gc_optimization');
      expect(result.action).toBe('forced_gc');
      
      const appliedRec = performanceMonitor.recommendations.find(r => r.id === recId);
      expect(appliedRec.applied).toBe(true);
      expect(appliedRec.appliedAt).toBeDefined();
    });

    test('should apply memory optimization', async () => {
      const recommendation = {
        type: 'memory_optimization',
        title: 'Memory Optimization',
        description: 'Test memory optimization',
        suggestions: []
      };

      performanceMonitor.addRecommendation(recommendation);
      const recId = performanceMonitor.recommendations[0].id;
      
      const result = await performanceMonitor.applyOptimization(recId);
      
      expect(result.type).toBe('memory_optimization');
      expect(result.action).toBe('cache_optimization');
    });

    test('should apply event loop optimization', async () => {
      const recommendation = {
        type: 'event_loop_optimization',
        title: 'Event Loop Optimization',
        description: 'Test event loop optimization',
        suggestions: []
      };

      performanceMonitor.addRecommendation(recommendation);
      const recId = performanceMonitor.recommendations[0].id;
      
      const result = await performanceMonitor.applyOptimization(recId);
      
      expect(result.type).toBe('event_loop_optimization');
      expect(result.action).toBe('guidance_provided');
    });

    test('should prevent double application of optimization', async () => {
      const recommendation = {
        type: 'gc_optimization',
        title: 'GC Optimization',
        description: 'Test',
        suggestions: []
      };

      performanceMonitor.addRecommendation(recommendation);
      const recId = performanceMonitor.recommendations[0].id;
      
      await performanceMonitor.applyOptimization(recId);
      
      // Try to apply again
      await expect(performanceMonitor.applyOptimization(recId))
        .rejects.toThrow('Recommendation already applied');
    });

    test('should track applied optimizations', async () => {
      const recommendation = {
        type: 'gc_optimization',
        title: 'GC Optimization',
        description: 'Test',
        suggestions: []
      };

      performanceMonitor.addRecommendation(recommendation);
      const recId = performanceMonitor.recommendations[0].id;
      
      await performanceMonitor.applyOptimization(recId, { testOption: true });
      
      expect(performanceMonitor.appliedOptimizations.length).toBe(1);
      expect(performanceMonitor.appliedOptimizations[0].options.testOption).toBe(true);
    });
  });

  describe('Custom Metrics and Measurements', () => {
    test('should start and end custom measurements', () => {
      const measurement = performanceMonitor.startMeasurement('test-operation');
      expect(measurement).toBeDefined();
      expect(typeof measurement.end).toBe('function');
      
      // End measurement
      measurement.end();
      
      // Should not throw
      expect(true).toBe(true);
    });

    test('should record custom metrics', () => {
      const metricEvents = [];
      performanceMonitor.on('custom-metric', (event) => {
        metricEvents.push(event);
      });

      performanceMonitor.recordCustomMetric('database', 'query-time', 150, {
        query: 'SELECT * FROM users',
        rows: 100
      });
      
      expect(metricEvents.length).toBe(1);
      expect(metricEvents[0].category).toBe('database');
      expect(metricEvents[0].metric.name).toBe('query-time');
      expect(metricEvents[0].metric.value).toBe(150);
      expect(metricEvents[0].metric.metadata.query).toBe('SELECT * FROM users');
      
      // Check storage
      const customMetrics = performanceMonitor.metrics.custom.get('database');
      expect(customMetrics.length).toBe(1);
      expect(customMetrics[0].name).toBe('query-time');
    });

    test('should limit custom metric storage', () => {
      // Add many function metrics to test cleanup
      for (let i = 0; i < 1100; i++) {
        performanceMonitor.recordFunctionMetrics({
          name: `function-${i}`,
          duration: Math.random() * 100,
          startTime: Date.now(),
          entryType: 'function'
        });
      }
      
      const functions = performanceMonitor.metrics.custom.get('functions');
      expect(functions.length).toBeLessThanOrEqual(600); // Should be limited (actual cleanup happens at 1000, keeping 500)
    });
  });

  describe('Performance Summary and Reporting', () => {
    test('should generate performance summary', () => {
      // Add some test data
      const now = Date.now();
      performanceMonitor.addMetric('system', {
        timestamp: now,
        cpu: { usage: 50 },
        memory: { usage: 60 }
      });
      performanceMonitor.addMetric('eventLoop', {
        timestamp: now,
        lag: 20
      });

      const summary = performanceMonitor.getPerformanceSummary(60 * 60 * 1000);
      
      expect(summary).toBeDefined();
      expect(summary.timestamp).toBeDefined();
      expect(summary.timeWindow).toBe(60 * 60 * 1000);
      expect(summary.system).toBeDefined();
      expect(summary.eventLoop).toBeDefined();
      expect(summary.alerts).toBeDefined();
      expect(summary.recommendations).toBeDefined();
    });

    test('should summarize metrics correctly', () => {
      const now = Date.now();
      
      // Add test metrics
      for (let i = 0; i < 5; i++) {
        performanceMonitor.addMetric('system', {
          timestamp: now - (i * 1000),
          cpu: { usage: 50 + i * 5 },
          memory: { usage: 60 + i * 2 }
        });
      }

      const summary = performanceMonitor.summarizeMetrics('system', now - 10000);
      
      expect(summary.count).toBe(5);
      expect(summary.cpu.min).toBe(50);
      expect(summary.cpu.max).toBe(70);
      expect(summary.cpu.avg).toBe(60);
      expect(summary.memory.min).toBe(60);
      expect(summary.memory.max).toBe(68);
    });

    test('should export complete performance data', () => {
      // Add some test data
      performanceMonitor.addMetric('system', { timestamp: Date.now(), test: true });
      performanceMonitor.triggerAlert('test', 'warning', 'Test Alert', 'Test');
      performanceMonitor.addRecommendation({
        type: 'test',
        title: 'Test',
        description: 'Test',
        suggestions: []
      });

      const exportData = performanceMonitor.exportData();
      
      expect(exportData).toBeDefined();
      expect(exportData.config).toBeDefined();
      expect(exportData.metrics).toBeDefined();
      expect(exportData.alerts).toBeDefined();
      expect(exportData.recommendations).toBeDefined();
      expect(exportData.summary).toBeDefined();
      expect(exportData.exportTimestamp).toBeDefined();
      
      expect(exportData.metrics.system.length).toBeGreaterThan(0);
      expect(exportData.alerts.length).toBeGreaterThan(0);
      expect(exportData.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Data Cleanup and Maintenance', () => {
    test('should clean up old data', () => {
      const oldTime = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      const recentTime = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago
      
      // Add old and recent data
      performanceMonitor.addMetric('system', { timestamp: oldTime, old: true });
      performanceMonitor.addMetric('system', { timestamp: recentTime, recent: true });
      
      // Add old alert
      performanceMonitor.alerts.push({
        timestamp: oldTime,
        old: true
      });
      performanceMonitor.alerts.push({
        timestamp: recentTime,
        recent: true
      });

      const oldLength = performanceMonitor.metrics.system.length;
      const oldAlertLength = performanceMonitor.alerts.length;
      
      performanceMonitor.cleanupOldData();
      
      expect(performanceMonitor.metrics.system.length).toBeLessThanOrEqual(oldLength);
      expect(performanceMonitor.alerts.length).toBeLessThanOrEqual(oldAlertLength);
      
      // Recent data should still be there
      const recentSystemMetrics = performanceMonitor.metrics.system.filter(m => m.recent);
      expect(recentSystemMetrics.length).toBeGreaterThan(0);
      
      const recentAlerts = performanceMonitor.alerts.filter(a => a.recent);
      expect(recentAlerts.length).toBeGreaterThan(0);
    });

    test('should stop monitoring cleanly', () => {
      expect(performanceMonitor.timers.size).toBeGreaterThan(0);
      expect(performanceMonitor.observers.size).toBeGreaterThan(0);
      
      performanceMonitor.stopMonitoring();
      
      expect(performanceMonitor.timers.size).toBe(0);
      expect(performanceMonitor.observers.size).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing store gracefully', () => {
      expect(() => {
        new PerformanceMonitor(null, console);
      }).not.toThrow();
    });

    test('should handle invalid configuration updates', () => {
      expect(() => {
        performanceMonitor.updateConfiguration({ invalid: 'config' });
      }).not.toThrow();
      
      // Original config should still be accessible
      const config = performanceMonitor.getConfiguration();
      expect(config.collection).toBeDefined();
    });

    test('should handle missing V8 heap statistics', () => {
      // Mock V8 module to throw error
      const originalRequire = require;
      require = jest.fn((module) => {
        if (module === 'v8') {
          throw new Error('V8 not available');
        }
        return originalRequire(module);
      });

      expect(() => {
        performanceMonitor.getV8HeapStatistics();
      }).not.toThrow();

      // Restore require
      require = originalRequire;
    });

    test('should handle invalid recommendation application', async () => {
      await expect(performanceMonitor.applyOptimization('invalid-id'))
        .rejects.toThrow('Recommendation not found');
    });

    test('should handle unknown optimization type', async () => {
      const recommendation = {
        type: 'unknown_optimization',
        title: 'Unknown',
        description: 'Test',
        suggestions: []
      };

      performanceMonitor.addRecommendation(recommendation);
      const recId = performanceMonitor.recommendations[0].id;
      
      await expect(performanceMonitor.applyOptimization(recId))
        .rejects.toThrow('Unknown optimization type');
    });
  });

  describe('Integration and Events', () => {
    test('should emit initialization event', async () => {
      const testStore = new Store({ 
        name: 'test-init-store',
        cwd: tempDir
      });
      testStore.clear();
      
      const initPromise = new Promise((resolve) => {
        const testMonitor = new PerformanceMonitor(testStore, console);
        testMonitor.once('monitor-initialized', () => {
          testMonitor.stopMonitoring();
          resolve(true);
        });
      });
      
      const result = await initPromise;
      expect(result).toBe(true);
    });

    test('should emit metric collection events', (done) => {
      let eventCount = 0;
      const expectedEvents = ['system-metrics', 'process-metrics', 'memory-metrics'];
      
      expectedEvents.forEach(eventType => {
        performanceMonitor.once(eventType, () => {
          eventCount++;
          if (eventCount === expectedEvents.length) {
            done();
          }
        });
      });

      // Trigger metric collection
      performanceMonitor.collectSystemMetrics();
      performanceMonitor.collectProcessMetrics();
      performanceMonitor.collectMemoryMetrics();
    });

    test('should emit optimization events', async () => {
      const events = [];
      
      performanceMonitor.on('optimization-recommendation', (rec) => {
        events.push({ type: 'recommendation', data: rec });
      });
      
      performanceMonitor.on('optimization-applied', (rec) => {
        events.push({ type: 'applied', data: rec });
      });

      // Add and apply recommendation
      performanceMonitor.addRecommendation({
        type: 'gc_optimization',
        title: 'Test',
        description: 'Test',
        suggestions: []
      });
      
      const recId = performanceMonitor.recommendations[0].id;
      await performanceMonitor.applyOptimization(recId);
      
      expect(events.length).toBe(2);
      expect(events[0].type).toBe('recommendation');
      expect(events[1].type).toBe('applied');
    });

    test('should emit configuration update events', (done) => {
      performanceMonitor.once('config-updated', (config) => {
        expect(config).toBeDefined();
        expect(config.test).toBe(true);
        done();
      });

      performanceMonitor.updateConfiguration({ test: true });
    });
  });
});