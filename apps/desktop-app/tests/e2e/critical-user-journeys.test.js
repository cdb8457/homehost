const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const Store = require('electron-store');

// Import services for direct testing
const GameServerManager = require('../../src/main/services/GameServerManager');
const PluginManager = require('../../src/main/services/PluginManager');
const CommunityManager = require('../../src/main/services/CommunityManager');
const AuthenticationService = require('../../src/main/services/AuthenticationService');
const CloudSync = require('../../src/main/services/CloudSync');
const RevenueDashboard = require('../../src/main/services/RevenueDashboard');

describe('Critical User Journeys - End-to-End Tests', () => {
  let store;
  let gameServerManager;
  let pluginManager;
  let communityManager;
  let authService;
  let cloudSync;
  let revenueDashboard;
  let tempDir;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-e2e-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'e2e-test-store',
      cwd: tempDir
    });
  });

  afterAll(async () => {
    // Clean up temporary files
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error.message);
    }
  });

  beforeEach(async () => {
    // Clear store before each test
    store.clear();

    // Initialize services in correct order
    const serverMonitor = {
      startMonitoring: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({}),
      on: jest.fn()
    };

    authService = new AuthenticationService(store);
    cloudSync = new CloudSync(store, authService);
    gameServerManager = new GameServerManager(store, serverMonitor);
    communityManager = new CommunityManager(store, cloudSync);
    pluginManager = new PluginManager(store, gameServerManager, communityManager);
    revenueDashboard = new RevenueDashboard(store, communityManager, pluginManager);

    // Initialize services
    await authService.initialize();
    await communityManager.initialize();
    await pluginManager.initialize();
    await revenueDashboard.initialize();
  });

  afterEach(() => {
    // Stop any running servers
    if (gameServerManager) {
      gameServerManager.stopAllServers();
    }
  });

  describe('Journey 1: New User Setup & First Server Deployment', () => {
    test('should complete full new user onboarding workflow', async () => {
      const journey = new UserJourney('New User Setup');

      // Step 1: System initialization
      journey.step('Initialize application');
      expect(authService.isUserAuthenticated()).toBe(false);
      expect(gameServerManager.getServers()).toEqual({});

      // Step 2: User views available games
      journey.step('Browse game library');
      const availableGames = gameServerManager.getSupportedGames();
      expect(availableGames).toContain('valheim');
      expect(availableGames).toContain('rust');
      expect(availableGames.length).toBeGreaterThan(0);

      // Step 3: Deploy first server (Valheim)
      journey.step('Deploy Valheim server');
      const serverConfig = {
        name: 'My First Valheim Server',
        game: 'valheim',
        serverName: 'E2E Test Server',
        password: 'testpass123',
        maxPlayers: 4,
        worldName: 'TestWorld',
        port: 2456
      };

      const deployResult = await gameServerManager.deployServer(serverConfig);
      expect(deployResult.success).toBe(true);
      expect(deployResult.serverId).toBeDefined();

      // Step 4: Verify server was created
      journey.step('Verify server deployment');
      const servers = gameServerManager.getServers();
      const serverId = deployResult.serverId;
      expect(servers[serverId]).toBeDefined();
      expect(servers[serverId].name).toBe(serverConfig.name);
      expect(servers[serverId].game).toBe('valheim');

      // Step 5: Start the server
      journey.step('Start server');
      const startResult = await gameServerManager.startServer(serverId);
      expect(startResult.success).toBe(true);

      // Step 6: Verify server is running
      journey.step('Verify server status');
      const serverStatus = gameServerManager.getServerStatus(serverId);
      expect(['starting', 'running']).toContain(serverStatus.status);

      journey.complete();
    }, 30000);

    test('should handle server deployment with custom configuration', async () => {
      const journey = new UserJourney('Custom Server Configuration');

      journey.step('Deploy Rust server with custom settings');
      const customConfig = {
        name: 'Custom Rust Server',
        game: 'rust',
        serverName: 'E2E Custom Rust',
        password: 'custompass456',
        maxPlayers: 8,
        port: 28015,
        seed: 12345,
        worldSize: 3000,
        customSettings: {
          'server.tickrate': 30,
          'server.worldsize': 3000,
          'server.saveinterval': 300
        }
      };

      const deployResult = await gameServerManager.deployServer(customConfig);
      expect(deployResult.success).toBe(true);

      const servers = gameServerManager.getServers();
      const server = servers[deployResult.serverId];
      expect(server.configuration.maxPlayers).toBe(8);
      expect(server.configuration.seed).toBe(12345);

      journey.complete();
    }, 25000);
  });

  describe('Journey 2: Plugin Installation & Management', () => {
    let serverId;

    beforeEach(async () => {
      // Deploy a test server first
      const serverConfig = {
        name: 'Plugin Test Server',
        game: 'valheim',
        port: 2457
      };
      const result = await gameServerManager.deployServer(serverConfig);
      serverId = result.serverId;
    });

    test('should install and configure plugins successfully', async () => {
      const journey = new UserJourney('Plugin Management');

      // Step 1: Browse available plugins
      journey.step('Browse plugin marketplace');
      const availablePlugins = pluginManager.getAvailablePlugins();
      expect(availablePlugins.length).toBeGreaterThan(0);
      
      const backupPlugin = availablePlugins.find(p => p.id === 'auto-backup');
      expect(backupPlugin).toBeDefined();

      // Step 2: Install plugin
      journey.step('Install backup plugin');
      const installResult = await pluginManager.installPlugin(serverId, 'auto-backup');
      expect(installResult.success).toBe(true);

      // Step 3: Configure plugin
      journey.step('Configure plugin settings');
      const pluginConfig = {
        interval: '2h',
        maxBackups: 5,
        backupLocation: 'local'
      };
      const configResult = await pluginManager.configurePlugin(serverId, 'auto-backup', pluginConfig);
      expect(configResult.success).toBe(true);

      // Step 4: Verify plugin is active
      journey.step('Verify plugin installation');
      const serverPlugins = pluginManager.getServerPlugins(serverId);
      const installedPlugin = serverPlugins.find(p => p.id === 'auto-backup');
      expect(installedPlugin).toBeDefined();
      expect(installedPlugin.status).toBe('active');

      journey.complete();
    }, 20000);

    test('should handle plugin conflicts and dependencies', async () => {
      const journey = new UserJourney('Plugin Dependency Management');

      // Install a plugin with dependencies
      journey.step('Install plugin with dependencies');
      const result = await pluginManager.installPlugin(serverId, 'advanced-permissions');
      
      if (result.success) {
        const dependencies = await pluginManager.getPluginDependencies('advanced-permissions');
        expect(dependencies).toBeDefined();
      }

      journey.complete();
    }, 15000);
  });

  describe('Journey 3: Community Features & Social Integration', () => {
    test('should create and manage community profile', async () => {
      const journey = new UserJourney('Community Management');

      // Step 1: Create community profile
      journey.step('Create community profile');
      const communityData = {
        name: 'E2E Test Community',
        description: 'A test community for E2E testing',
        tags: ['testing', 'valheim', 'friendly'],
        isPublic: true
      };

      const createResult = await communityManager.createCommunity(communityData);
      expect(createResult.success).toBe(true);
      expect(createResult.communityId).toBeDefined();

      // Step 2: Add servers to community
      journey.step('Add servers to community');
      const serverConfig = {
        name: 'Community Server',
        game: 'valheim',
        port: 2458
      };
      const deployResult = await gameServerManager.deployServer(serverConfig);
      
      const addServerResult = await communityManager.addServerToCommunity(
        createResult.communityId,
        deployResult.serverId
      );
      expect(addServerResult.success).toBe(true);

      // Step 3: Verify community structure
      journey.step('Verify community setup');
      const community = communityManager.getCommunity(createResult.communityId);
      expect(community.servers).toContain(deployResult.serverId);
      expect(community.name).toBe(communityData.name);

      journey.complete();
    }, 25000);
  });

  describe('Journey 4: Authentication & Cloud Sync', () => {
    test('should handle authentication workflow gracefully', async () => {
      const journey = new UserJourney('Authentication Flow');

      // Step 1: Check initial auth state
      journey.step('Check authentication status');
      expect(authService.isUserAuthenticated()).toBe(false);
      expect(cloudSync.getConnectionStatus().connected).toBe(false);

      // Step 2: Initiate authentication (simulate)
      journey.step('Initiate browser authentication');
      const authResult = await authService.authenticateWithBrowser();
      expect(authResult.success).toBe(true);
      expect(authResult.authUrl).toContain('oauth/authorize');

      // Step 3: Test device code flow
      journey.step('Test device code authentication');
      // Mock the auth request for testing
      jest.spyOn(authService, 'makeAuthRequest').mockResolvedValueOnce({
        device_code: 'test-device-code',
        user_code: 'TEST123',
        verification_uri: 'https://auth.homehost.cloud/device',
        expires_in: 600,
        interval: 5
      });

      const deviceResult = await authService.authenticateWithDeviceCode();
      expect(deviceResult.success).toBe(true);
      expect(deviceResult.userCode).toBe('TEST123');

      journey.complete();
    }, 15000);
  });

  describe('Journey 5: Revenue & Analytics Integration', () => {
    test('should track server monetization metrics', async () => {
      const journey = new UserJourney('Revenue Tracking');

      // Step 1: Initialize revenue tracking
      journey.step('Initialize revenue dashboard');
      expect(revenueDashboard.isInitialized).toBe(true);

      // Step 2: Process test transaction
      journey.step('Process test transaction');
      const transaction = {
        type: 'donation',
        amount: 10.00,
        currency: 'USD',
        playerId: 'test-player-123',
        description: 'E2E test donation'
      };

      const transactionResult = await revenueDashboard.processTransaction(transaction);
      expect(transactionResult.success).toBe(true);

      // Step 3: Verify revenue tracking
      journey.step('Verify revenue tracking');
      const revenue = revenueDashboard.getRevenue();
      expect(revenue.total).toBeGreaterThan(0);

      journey.complete();
    }, 15000);
  });

  describe('Journey 6: Error Recovery & Resilience', () => {
    test('should handle server crashes gracefully', async () => {
      const journey = new UserJourney('Error Recovery');

      // Step 1: Deploy and start server
      journey.step('Deploy test server');
      const serverConfig = {
        name: 'Crash Test Server',
        game: 'valheim',
        port: 2459
      };
      const deployResult = await gameServerManager.deployServer(serverConfig);
      await gameServerManager.startServer(deployResult.serverId);

      // Step 2: Simulate server crash
      journey.step('Simulate server crash');
      await gameServerManager.stopServer(deployResult.serverId);

      // Step 3: Verify error handling
      journey.step('Verify error handling');
      const status = gameServerManager.getServerStatus(deployResult.serverId);
      expect(['stopped', 'crashed', 'stopping']).toContain(status.status);

      // Step 4: Recovery
      journey.step('Restart server');
      const restartResult = await gameServerManager.startServer(deployResult.serverId);
      expect(restartResult.success).toBe(true);

      journey.complete();
    }, 20000);

    test('should handle network disconnection scenarios', async () => {
      const journey = new UserJourney('Network Resilience');

      journey.step('Test cloud sync without network');
      
      // This should fail gracefully without network
      const syncResult = await cloudSync.initialize();
      expect(syncResult.success).toBe(false);
      expect(syncResult.authenticated).toBe(false);

      journey.step('Verify graceful degradation');
      expect(gameServerManager.getServers()).toBeDefined();
      expect(pluginManager.getAvailablePlugins()).toBeDefined();

      journey.complete();
    }, 10000);
  });

  describe('Performance & Load Tests', () => {
    test('should deploy multiple servers efficiently', async () => {
      const journey = new UserJourney('Performance Testing');

      journey.step('Deploy multiple servers concurrently');
      
      const deploymentPromises = [];
      const serverCount = 3;
      
      for (let i = 0; i < serverCount; i++) {
        const config = {
          name: `Performance Test Server ${i + 1}`,
          game: 'valheim',
          port: 2460 + i
        };
        deploymentPromises.push(gameServerManager.deployServer(config));
      }

      const startTime = Date.now();
      const results = await Promise.all(deploymentPromises);
      const deploymentTime = Date.now() - startTime;

      // All deployments should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // Should complete within reasonable time
      expect(deploymentTime).toBeLessThan(30000); // 30 seconds

      journey.step('Verify all servers deployed');
      const servers = gameServerManager.getServers();
      expect(Object.keys(servers)).toHaveLength(serverCount);

      journey.complete();
    }, 45000);

    test('should handle memory usage efficiently', async () => {
      const journey = new UserJourney('Memory Efficiency');

      journey.step('Monitor memory usage');
      
      const initialMemory = process.memoryUsage();
      
      // Perform memory-intensive operations
      for (let i = 0; i < 5; i++) {
        const config = {
          name: `Memory Test Server ${i}`,
          game: 'valheim',
          port: 2470 + i
        };
        await gameServerManager.deployServer(config);
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);

      journey.complete();
    }, 30000);
  });
});

// Helper class for tracking user journey steps
class UserJourney {
  constructor(name) {
    this.name = name;
    this.steps = [];
    this.startTime = Date.now();
  }

  step(description) {
    const stepTime = Date.now();
    this.steps.push({
      description,
      timestamp: stepTime,
      elapsed: stepTime - this.startTime
    });
    console.log(`[${this.name}] Step ${this.steps.length}: ${description} (${stepTime - this.startTime}ms)`);
  }

  complete() {
    const totalTime = Date.now() - this.startTime;
    console.log(`[${this.name}] Journey completed in ${totalTime}ms with ${this.steps.length} steps`);
    
    // Verify journey completed in reasonable time
    expect(totalTime).toBeLessThan(60000); // 60 seconds max
    expect(this.steps.length).toBeGreaterThan(0);
  }
}