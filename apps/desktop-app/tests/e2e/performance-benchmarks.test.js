const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;
const { performance } = require('perf_hooks');

// Import services for performance testing
const GameServerManager = require('../../src/main/services/GameServerManager');
const PluginManager = require('../../src/main/services/PluginManager');
const CommunityManager = require('../../src/main/services/CommunityManager');
const RevenueDashboard = require('../../src/main/services/RevenueDashboard');
const CommunityGrowthAnalytics = require('../../src/main/services/CommunityGrowthAnalytics');

describe('Performance Benchmarks & Load Tests', () => {
  let store;
  let tempDir;
  let services = {};
  let performanceMetrics = {};

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-performance-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'performance-test-store',
      cwd: tempDir
    });

    // Initialize performance tracking
    performanceMetrics = {
      initialization: {},
      serverDeployment: {},
      pluginOperations: {},
      dataProcessing: {},
      memoryUsage: {}
    };
  });

  afterAll(async () => {
    // Output performance summary
    console.log('\n=== PERFORMANCE BENCHMARK RESULTS ===');
    console.log(JSON.stringify(performanceMetrics, null, 2));

    // Clean up temporary files
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error.message);
    }
  });

  beforeEach(async () => {
    store.clear();
    await initializeServices();
  });

  async function initializeServices() {
    const serverMonitor = createMockServerMonitor();

    services.gameServerManager = new GameServerManager(store, serverMonitor);
    services.communityManager = new CommunityManager(store, null);
    services.pluginManager = new PluginManager(store, services.gameServerManager, services.communityManager);
    services.revenueDashboard = new RevenueDashboard(store, services.communityManager, services.pluginManager);
    services.communityGrowthAnalytics = new CommunityGrowthAnalytics(store, services.communityManager, serverMonitor, services.revenueDashboard);

    // Initialize services with timing
    const initStart = performance.now();
    await services.communityManager.initialize();
    await services.pluginManager.initialize();
    await services.revenueDashboard.initialize();
    await services.communityGrowthAnalytics.initialize();
    const initEnd = performance.now();

    performanceMetrics.initialization.totalTime = initEnd - initStart;
    performanceMetrics.initialization.serviceCount = Object.keys(services).length;
  }

  function createMockServerMonitor() {
    return {
      startMonitoring: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        network: { in: Math.random() * 10000, out: Math.random() * 10000 }
      }),
      on: jest.fn(),
      emit: jest.fn()
    };
  }

  function measureMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024, // MB
      external: usage.external / 1024 / 1024, // MB
      rss: usage.rss / 1024 / 1024 // MB
    };
  }

  describe('Service Initialization Performance', () => {
    test('should initialize all services within performance targets', async () => {
      const benchmark = new PerformanceBenchmark('Service Initialization');

      benchmark.start();
      
      // Re-initialize to test cold start performance
      store.clear();
      await initializeServices();

      benchmark.end();

      // Performance targets
      expect(benchmark.duration).toBeLessThan(5000); // 5 seconds
      expect(performanceMetrics.initialization.totalTime).toBeLessThan(3000); // 3 seconds

      performanceMetrics.initialization.benchmark = benchmark.getResults();
    });

    test('should handle concurrent service initialization efficiently', async () => {
      const benchmark = new PerformanceBenchmark('Concurrent Initialization');
      store.clear();

      benchmark.start();

      // Initialize services concurrently
      const serverMonitor = createMockServerMonitor();
      const gameServerManager = new GameServerManager(store, serverMonitor);
      const communityManager = new CommunityManager(store, null);
      const pluginManager = new PluginManager(store, gameServerManager, communityManager);
      const revenueDashboard = new RevenueDashboard(store, communityManager, pluginManager);

      await Promise.all([
        communityManager.initialize(),
        pluginManager.initialize(),
        revenueDashboard.initialize()
      ]);

      benchmark.end();

      // Concurrent initialization should be faster than sequential
      expect(benchmark.duration).toBeLessThan(performanceMetrics.initialization.totalTime);
      
      performanceMetrics.initialization.concurrent = benchmark.getResults();
    });
  });

  describe('Server Deployment Performance', () => {
    test('should deploy single server within performance targets', async () => {
      const benchmark = new PerformanceBenchmark('Single Server Deployment');

      const serverConfig = {
        name: 'Performance Test Server',
        game: 'valheim',
        port: 2456
      };

      benchmark.start();
      const result = await services.gameServerManager.deployServer(serverConfig);
      benchmark.end();

      expect(result.success).toBe(true);
      expect(benchmark.duration).toBeLessThan(10000); // 10 seconds

      performanceMetrics.serverDeployment.single = benchmark.getResults();
    });

    test('should handle concurrent server deployments efficiently', async () => {
      const benchmark = new PerformanceBenchmark('Concurrent Server Deployment');
      const serverCount = 5;
      const deploymentPromises = [];

      benchmark.start();

      for (let i = 0; i < serverCount; i++) {
        const config = {
          name: `Concurrent Server ${i + 1}`,
          game: 'valheim',
          port: 2460 + i
        };
        deploymentPromises.push(services.gameServerManager.deployServer(config));
      }

      const results = await Promise.all(deploymentPromises);
      benchmark.end();

      // All deployments should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should complete within reasonable time
      expect(benchmark.duration).toBeLessThan(30000); // 30 seconds

      performanceMetrics.serverDeployment.concurrent = {
        ...benchmark.getResults(),
        serverCount,
        averageTimePerServer: benchmark.duration / serverCount
      };
    });

    test('should scale server deployment performance linearly', async () => {
      const scalingResults = [];

      for (const serverCount of [1, 3, 5]) {
        const benchmark = new PerformanceBenchmark(`${serverCount} Server Deployment`);
        const deploymentPromises = [];

        benchmark.start();

        for (let i = 0; i < serverCount; i++) {
          const config = {
            name: `Scale Test Server ${i + 1}`,
            game: 'rust',
            port: 28000 + i
          };
          deploymentPromises.push(services.gameServerManager.deployServer(config));
        }

        await Promise.all(deploymentPromises);
        benchmark.end();

        scalingResults.push({
          serverCount,
          totalTime: benchmark.duration,
          averageTime: benchmark.duration / serverCount
        });
      }

      // Verify linear scaling (average time shouldn't increase dramatically)
      const firstAverage = scalingResults[0].averageTime;
      const lastAverage = scalingResults[scalingResults.length - 1].averageTime;
      expect(lastAverage).toBeLessThan(firstAverage * 2); // No more than 2x slower

      performanceMetrics.serverDeployment.scaling = scalingResults;
    });
  });

  describe('Plugin Operations Performance', () => {
    let serverId;

    beforeEach(async () => {
      const result = await services.gameServerManager.deployServer({
        name: 'Plugin Performance Server',
        game: 'valheim',
        port: 2470
      });
      serverId = result.serverId;
    });

    test('should install plugins within performance targets', async () => {
      const benchmark = new PerformanceBenchmark('Plugin Installation');
      const pluginsToInstall = ['auto-backup', 'player-stats', 'chat-enhancement'];

      benchmark.start();

      for (const pluginId of pluginsToInstall) {
        const result = await services.pluginManager.installPlugin(serverId, pluginId);
        expect(result.success).toBe(true);
      }

      benchmark.end();

      expect(benchmark.duration).toBeLessThan(15000); // 15 seconds

      performanceMetrics.pluginOperations.installation = {
        ...benchmark.getResults(),
        pluginCount: pluginsToInstall.length,
        averageTimePerPlugin: benchmark.duration / pluginsToInstall.length
      };
    });

    test('should handle plugin configuration updates efficiently', async () => {
      // Install plugin first
      await services.pluginManager.installPlugin(serverId, 'player-stats');

      const benchmark = new PerformanceBenchmark('Plugin Configuration');
      const configUpdates = 50;

      benchmark.start();

      for (let i = 0; i < configUpdates; i++) {
        const config = {
          trackDeaths: i % 2 === 0,
          trackBuilding: i % 3 === 0,
          sessionTimeout: 1800 + i,
          updateInterval: `${10 + i}s`
        };
        
        await services.pluginManager.configurePlugin(serverId, 'player-stats', config);
      }

      benchmark.end();

      expect(benchmark.duration).toBeLessThan(5000); // 5 seconds

      performanceMetrics.pluginOperations.configuration = {
        ...benchmark.getResults(),
        updateCount: configUpdates,
        averageTimePerUpdate: benchmark.duration / configUpdates
      };
    });

    test('should query plugin data efficiently', async () => {
      // Install multiple plugins
      const plugins = ['auto-backup', 'player-stats', 'performance-monitor'];
      for (const pluginId of plugins) {
        await services.pluginManager.installPlugin(serverId, pluginId);
      }

      const benchmark = new PerformanceBenchmark('Plugin Data Queries');
      const queryCount = 100;

      benchmark.start();

      for (let i = 0; i < queryCount; i++) {
        services.pluginManager.getServerPlugins(serverId);
        services.pluginManager.getAvailablePlugins();
        services.pluginManager.getPluginConfiguration(serverId, plugins[i % plugins.length]);
      }

      benchmark.end();

      expect(benchmark.duration).toBeLessThan(1000); // 1 second

      performanceMetrics.pluginOperations.queries = {
        ...benchmark.getResults(),
        queryCount,
        averageTimePerQuery: benchmark.duration / queryCount
      };
    });
  });

  describe('Data Processing Performance', () => {
    test('should process analytics data efficiently', async () => {
      const benchmark = new PerformanceBenchmark('Analytics Data Processing');
      const playerCount = 100;
      const eventsPerPlayer = 50;

      benchmark.start();

      // Create community
      const communityResult = await services.communityManager.createCommunity({
        name: 'Performance Analytics Community'
      });

      // Generate test data
      for (let playerId = 0; playerId < playerCount; playerId++) {
        await services.communityGrowthAnalytics.trackPlayer(`perf-player-${playerId}`, {
          communityId: communityResult.communityId,
          joinDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          totalSessions: Math.floor(Math.random() * 100),
          totalPlayTime: Math.floor(Math.random() * 100 * 3600) // Random hours
        });

        // Generate events for this player
        for (let eventId = 0; eventId < eventsPerPlayer; eventId++) {
          await services.communityGrowthAnalytics.trackPlayerAction({
            playerId: `perf-player-${playerId}`,
            action: ['login', 'logout', 'chat', 'build', 'pvp'][eventId % 5],
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
            metadata: { eventId }
          });
        }
      }

      // Process analytics
      const metrics = services.communityGrowthAnalytics.getCommunityMetrics(communityResult.communityId);
      const insights = services.communityGrowthAnalytics.generateInsights(communityResult.communityId);

      benchmark.end();

      expect(metrics.totalPlayers).toBe(playerCount);
      expect(benchmark.duration).toBeLessThan(30000); // 30 seconds

      performanceMetrics.dataProcessing.analytics = {
        ...benchmark.getResults(),
        playerCount,
        eventsPerPlayer,
        totalEvents: playerCount * eventsPerPlayer,
        eventsPerSecond: (playerCount * eventsPerPlayer) / (benchmark.duration / 1000)
      };
    });

    test('should handle revenue calculations efficiently', async () => {
      const benchmark = new PerformanceBenchmark('Revenue Processing');
      const transactionCount = 500;

      benchmark.start();

      // Process many transactions
      for (let i = 0; i < transactionCount; i++) {
        await services.revenueDashboard.processTransaction({
          type: ['donation', 'vip_purchase', 'merchandise'][i % 3],
          amount: Math.random() * 50 + 5, // $5-$55
          currency: 'USD',
          playerId: `revenue-test-player-${i % 50}`, // 50 unique players
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }

      // Generate revenue reports
      const dailyReport = services.revenueDashboard.generateDailyReport();
      const monthlyReport = services.revenueDashboard.generateMonthlyReport();

      benchmark.end();

      expect(dailyReport.totalTransactions).toBeGreaterThan(0);
      expect(monthlyReport.totalRevenue).toBeGreaterThan(0);
      expect(benchmark.duration).toBeLessThan(10000); // 10 seconds

      performanceMetrics.dataProcessing.revenue = {
        ...benchmark.getResults(),
        transactionCount,
        transactionsPerSecond: transactionCount / (benchmark.duration / 1000)
      };
    });
  });

  describe('Memory Usage & Resource Management', () => {
    test('should maintain efficient memory usage under load', async () => {
      const initialMemory = measureMemoryUsage();
      const benchmark = new PerformanceBenchmark('Memory Usage Under Load');

      benchmark.start();

      // Create memory-intensive workload
      const communities = [];
      const servers = [];

      // Create 10 communities with 5 servers each
      for (let i = 0; i < 10; i++) {
        const communityResult = await services.communityManager.createCommunity({
          name: `Memory Test Community ${i}`,
          description: 'Testing memory usage patterns'
        });
        communities.push(communityResult.communityId);

        for (let j = 0; j < 5; j++) {
          const serverResult = await services.gameServerManager.deployServer({
            name: `Memory Test Server ${i}-${j}`,
            game: 'valheim',
            port: 3000 + (i * 5) + j
          });
          servers.push(serverResult.serverId);

          await services.communityManager.addServerToCommunity(
            communityResult.communityId,
            serverResult.serverId
          );

          // Install plugins on each server
          await services.pluginManager.installPlugin(serverResult.serverId, 'auto-backup');
          await services.pluginManager.installPlugin(serverResult.serverId, 'player-stats');
        }
      }

      // Generate analytics data
      for (let playerId = 0; playerId < 100; playerId++) {
        const communityId = communities[playerId % communities.length];
        await services.communityGrowthAnalytics.trackPlayer(`memory-test-player-${playerId}`, {
          communityId,
          sessionDuration: 3600,
          actionsCount: 100
        });
      }

      const finalMemory = measureMemoryUsage();
      benchmark.end();

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 200MB for this workload)
      expect(memoryIncrease).toBeLessThan(200);

      performanceMetrics.memoryUsage.underLoad = {
        ...benchmark.getResults(),
        initialMemory,
        finalMemory,
        memoryIncrease,
        objectsCreated: {
          communities: communities.length,
          servers: servers.length,
          players: 100
        }
      };
    });

    test('should efficiently garbage collect after operations', async () => {
      const benchmark = new PerformanceBenchmark('Garbage Collection Efficiency');

      benchmark.start();

      // Create and destroy many objects
      for (let cycle = 0; cycle < 5; cycle++) {
        const tempCommunities = [];
        
        // Create objects
        for (let i = 0; i < 20; i++) {
          const result = await services.communityManager.createCommunity({
            name: `GC Test Community ${cycle}-${i}`
          });
          tempCommunities.push(result.communityId);
        }

        // Use objects
        for (const communityId of tempCommunities) {
          services.communityManager.getCommunity(communityId);
          await services.communityGrowthAnalytics.getCommunityMetrics(communityId);
        }

        // Delete objects
        for (const communityId of tempCommunities) {
          await services.communityManager.deleteCommunity(communityId);
        }

        // Force garbage collection
        if (global.gc) {
          global.gc();
        }
      }

      benchmark.end();

      const finalMemory = measureMemoryUsage();

      performanceMetrics.memoryUsage.garbageCollection = {
        ...benchmark.getResults(),
        finalMemory,
        cyclesCompleted: 5
      };
    });
  });

  describe('Stress Testing', () => {
    test('should handle high concurrent load', async () => {
      const benchmark = new PerformanceBenchmark('High Concurrent Load');
      const concurrentOperations = 50;

      benchmark.start();

      const operations = [];

      // Mix of different operations running concurrently
      for (let i = 0; i < concurrentOperations; i++) {
        const operationType = i % 4;
        
        switch (operationType) {
          case 0: // Server deployment
            operations.push(services.gameServerManager.deployServer({
              name: `Stress Test Server ${i}`,
              game: 'valheim',
              port: 4000 + i
            }));
            break;
            
          case 1: // Community creation
            operations.push(services.communityManager.createCommunity({
              name: `Stress Test Community ${i}`
            }));
            break;
            
          case 2: // Analytics tracking
            operations.push(services.communityGrowthAnalytics.trackPlayer(`stress-player-${i}`, {
              sessionDuration: 1800,
              actionsCount: 50
            }));
            break;
            
          case 3: // Revenue processing
            operations.push(services.revenueDashboard.processTransaction({
              type: 'donation',
              amount: 10.00,
              currency: 'USD',
              playerId: `stress-player-${i}`
            }));
            break;
        }
      }

      const results = await Promise.allSettled(operations);
      benchmark.end();

      // Most operations should succeed
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThan(concurrentOperations * 0.8); // 80% success rate

      performanceMetrics.stressTesting = {
        ...benchmark.getResults(),
        concurrentOperations,
        successCount,
        successRate: successCount / concurrentOperations
      };
    }, 60000);
  });
});

// Helper class for performance benchmarking
class PerformanceBenchmark {
  constructor(name) {
    this.name = name;
    this.startTime = null;
    this.endTime = null;
    this.duration = null;
  }

  start() {
    this.startTime = performance.now();
  }

  end() {
    this.endTime = performance.now();
    this.duration = this.endTime - this.startTime;
    console.log(`[${this.name}] Completed in ${this.duration.toFixed(2)}ms`);
  }

  getResults() {
    return {
      name: this.name,
      duration: this.duration,
      startTime: this.startTime,
      endTime: this.endTime
    };
  }
}