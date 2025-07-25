const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;

// Import all Epic services for integration testing
const GameServerManager = require('../../src/main/services/GameServerManager');
const PluginManager = require('../../src/main/services/PluginManager');
const CommunityManager = require('../../src/main/services/CommunityManager');
const AuthenticationService = require('../../src/main/services/AuthenticationService');
const CloudSync = require('../../src/main/services/CloudSync');
const RevenueDashboard = require('../../src/main/services/RevenueDashboard');
const PlayerEngagement = require('../../src/main/services/PlayerEngagement');
const PluginMarketplaceRevenue = require('../../src/main/services/PluginMarketplaceRevenue');
const CommunityGrowthAnalytics = require('../../src/main/services/CommunityGrowthAnalytics');
const Web3Integration = require('../../src/main/services/Web3Integration');

describe('Cross-System Integration Tests - Epic 1-4 Feature Interaction', () => {
  let store;
  let tempDir;
  let services = {};

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-integration-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'integration-test-store',
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
    // Clear store and initialize all services
    store.clear();
    await initializeAllServices();
  });

  async function initializeAllServices() {
    const serverMonitor = createMockServerMonitor();

    // Epic 1: Foundation & Game Intelligence
    services.gameServerManager = new GameServerManager(store, serverMonitor);

    // Epic 2: Community Infrastructure  
    services.authService = new AuthenticationService(store);
    services.cloudSync = new CloudSync(store, services.authService);
    services.communityManager = new CommunityManager(store, services.cloudSync);

    // Epic 3: Plugin Ecosystem Foundation
    services.pluginManager = new PluginManager(store, services.gameServerManager, services.communityManager);

    // Epic 4: Monetization & Analytics
    services.revenueDashboard = new RevenueDashboard(store, services.communityManager, services.pluginManager);
    services.playerEngagement = new PlayerEngagement(store, services.revenueDashboard, services.communityManager);
    services.pluginMarketplaceRevenue = new PluginMarketplaceRevenue(store, services.revenueDashboard, services.pluginManager);
    services.communityGrowthAnalytics = new CommunityGrowthAnalytics(store, services.communityManager, serverMonitor, services.revenueDashboard);
    services.web3Integration = new Web3Integration(store, services.communityManager, services.revenueDashboard);

    // Initialize services in dependency order
    await services.authService.initialize();
    await services.communityManager.initialize();
    await services.pluginManager.initialize();
    await services.revenueDashboard.initialize();
    await services.playerEngagement.initialize();
    await services.pluginMarketplaceRevenue.initialize();
    await services.communityGrowthAnalytics.initialize();
    await services.web3Integration.initialize();
  }

  function createMockServerMonitor() {
    return {
      startMonitoring: jest.fn(),
      getMetrics: jest.fn().mockReturnValue({
        cpu: 25.5,
        memory: 45.2,
        disk: 15.8,
        network: { in: 1024, out: 2048 }
      }),
      on: jest.fn(),
      emit: jest.fn()
    };
  }

  describe('Epic 1 → Epic 2 Integration: Server-Community Bridge', () => {
    test('should integrate server deployment with community management', async () => {
      // Deploy a server (Epic 1)
      const serverConfig = {
        name: 'Community Integration Server',
        game: 'valheim',
        port: 2456
      };
      const deployResult = await services.gameServerManager.deployServer(serverConfig);
      expect(deployResult.success).toBe(true);

      // Create community (Epic 2)
      const communityData = {
        name: 'Integration Test Community',
        description: 'Testing server-community integration',
        isPublic: true
      };
      const communityResult = await services.communityManager.createCommunity(communityData);
      expect(communityResult.success).toBe(true);

      // Link server to community
      const linkResult = await services.communityManager.addServerToCommunity(
        communityResult.communityId,
        deployResult.serverId
      );
      expect(linkResult.success).toBe(true);

      // Verify integration
      const community = services.communityManager.getCommunity(communityResult.communityId);
      expect(community.servers).toContain(deployResult.serverId);

      const servers = services.gameServerManager.getServers();
      expect(servers[deployResult.serverId].communityId).toBe(communityResult.communityId);
    });

    test('should sync server status with community features', async () => {
      // Deploy and start server
      const serverConfig = { name: 'Status Sync Server', game: 'rust', port: 28015 };
      const deployResult = await services.gameServerManager.deployServer(serverConfig);
      
      // Create community
      const communityResult = await services.communityManager.createCommunity({
        name: 'Status Sync Community'
      });
      
      // Link them
      await services.communityManager.addServerToCommunity(
        communityResult.communityId,
        deployResult.serverId
      );

      // Start server
      await services.gameServerManager.startServer(deployResult.serverId);

      // Verify community reflects server status
      const communityStatus = services.communityManager.getCommunityServerStatus(communityResult.communityId);
      expect(communityStatus.activeServers).toBeGreaterThan(0);
    });
  });

  describe('Epic 2 → Epic 3 Integration: Community-Plugin Ecosystem', () => {
    test('should integrate plugin marketplace with community features', async () => {
      // Create community first
      const communityResult = await services.communityManager.createCommunity({
        name: 'Plugin Test Community',
        description: 'Testing plugin integration'
      });

      // Deploy server for the community
      const serverConfig = { name: 'Plugin Test Server', game: 'valheim', port: 2457 };
      const deployResult = await services.gameServerManager.deployServer(serverConfig);
      
      await services.communityManager.addServerToCommunity(
        communityResult.communityId,
        deployResult.serverId
      );

      // Install plugin on community server
      const pluginInstallResult = await services.pluginManager.installPlugin(
        deployResult.serverId,
        'auto-backup'
      );
      expect(pluginInstallResult.success).toBe(true);

      // Verify plugin appears in community plugin list
      const communityPlugins = services.communityManager.getCommunityPlugins(communityResult.communityId);
      expect(communityPlugins.some(p => p.id === 'auto-backup')).toBe(true);

      // Verify plugin manager tracks community association
      const serverPlugins = services.pluginManager.getServerPlugins(deployResult.serverId);
      const installedPlugin = serverPlugins.find(p => p.id === 'auto-backup');
      expect(installedPlugin.communityId).toBe(communityResult.communityId);
    });

    test('should share plugin configurations across community servers', async () => {
      // Setup community with multiple servers
      const communityResult = await services.communityManager.createCommunity({
        name: 'Multi-Server Community'
      });

      const server1 = await services.gameServerManager.deployServer({
        name: 'Server 1', game: 'valheim', port: 2458
      });
      const server2 = await services.gameServerManager.deployServer({
        name: 'Server 2', game: 'valheim', port: 2459
      });

      await services.communityManager.addServerToCommunity(communityResult.communityId, server1.serverId);
      await services.communityManager.addServerToCommunity(communityResult.communityId, server2.serverId);

      // Install and configure plugin on first server
      await services.pluginManager.installPlugin(server1.serverId, 'player-stats');
      const pluginConfig = { trackDeaths: true, trackBuilding: true };
      await services.pluginManager.configurePlugin(server1.serverId, 'player-stats', pluginConfig);

      // Apply community plugin template to second server
      const templateResult = await services.communityManager.applyCommunityPluginTemplate(
        communityResult.communityId,
        server2.serverId,
        'player-stats'
      );
      expect(templateResult.success).toBe(true);

      // Verify configuration was copied
      const server2Config = services.pluginManager.getPluginConfiguration(server2.serverId, 'player-stats');
      expect(server2Config.trackDeaths).toBe(true);
      expect(server2Config.trackBuilding).toBe(true);
    });
  });

  describe('Epic 3 → Epic 4 Integration: Plugin Marketplace Revenue', () => {
    test('should integrate plugin sales with revenue tracking', async () => {
      // Initialize plugin marketplace revenue
      expect(services.pluginMarketplaceRevenue.isInitialized).toBe(true);

      // Register a developer
      const developerData = {
        name: 'Test Developer',
        email: 'test@example.com',
        paymentMethod: 'paypal',
        paymentDetails: 'test@paypal.com'
      };
      const devResult = await services.pluginMarketplaceRevenue.registerDeveloper(developerData);
      expect(devResult.success).toBe(true);

      // Submit a plugin for sale
      const pluginData = {
        name: 'Premium Test Plugin',
        description: 'A test plugin for revenue integration',
        version: '1.0.0',
        price: 9.99,
        developerId: devResult.developerId,
        category: 'enhancement'
      };
      const pluginResult = await services.pluginMarketplaceRevenue.submitPlugin(pluginData);
      expect(pluginResult.success).toBe(true);

      // Simulate plugin purchase
      const purchaseData = {
        pluginId: pluginResult.pluginId,
        buyerId: 'test-user-123',
        price: 9.99,
        paymentMethod: 'stripe'
      };
      const purchaseResult = await services.pluginMarketplaceRevenue.purchasePlugin(purchaseData);
      expect(purchaseResult.success).toBe(true);

      // Verify revenue tracking integration
      const revenue = services.revenueDashboard.getRevenue();
      expect(revenue.total).toBeGreaterThan(0);

      // Verify marketplace revenue tracking
      const marketplaceRevenue = services.pluginMarketplaceRevenue.getRevenue();
      expect(marketplaceRevenue.totalSales).toBeGreaterThan(0);
      expect(marketplaceRevenue.developerEarnings).toBeGreaterThan(0);
    });

    test('should track plugin performance metrics across systems', async () => {
      // Deploy server and install plugin
      const serverConfig = { name: 'Metrics Test Server', game: 'rust', port: 28016 };
      const deployResult = await services.gameServerManager.deployServer(serverConfig);
      
      const pluginInstallResult = await services.pluginManager.installPlugin(
        deployResult.serverId,
        'performance-monitor'
      );
      expect(pluginInstallResult.success).toBe(true);

      // Simulate plugin usage tracking
      await services.communityGrowthAnalytics.trackPluginUsage(
        deployResult.serverId,
        'performance-monitor',
        { activeSessions: 5, dataPoints: 100 }
      );

      // Verify metrics are captured in analytics
      const pluginMetrics = services.communityGrowthAnalytics.getPluginMetrics('performance-monitor');
      expect(pluginMetrics.totalUsage).toBeGreaterThan(0);

      // Verify marketplace tracks popularity
      const popularityData = services.pluginMarketplaceRevenue.getPluginPopularity('performance-monitor');
      expect(popularityData.activeInstalls).toBeGreaterThan(0);
    });
  });

  describe('Epic 4 → Epic 1 Integration: Analytics-Driven Server Optimization', () => {
    test('should use analytics data to optimize server configurations', async () => {
      // Deploy server
      const serverConfig = { name: 'Analytics Server', game: 'valheim', port: 2460 };
      const deployResult = await services.gameServerManager.deployServer(serverConfig);

      // Create community and track analytics
      const communityResult = await services.communityManager.createCommunity({
        name: 'Analytics Community'
      });
      await services.communityManager.addServerToCommunity(
        communityResult.communityId,
        deployResult.serverId
      );

      // Simulate player activity tracking
      for (let i = 0; i < 10; i++) {
        await services.communityGrowthAnalytics.trackPlayer(`player-${i}`, {
          serverId: deployResult.serverId,
          sessionDuration: 3600 + (i * 300), // 1-2.5 hours
          actionsPerMinute: 5 + i
        });
      }

      // Generate analytics insights
      const insights = services.communityGrowthAnalytics.generateOptimizationInsights(deployResult.serverId);
      expect(insights.recommendations).toBeDefined();
      expect(insights.recommendations.length).toBeGreaterThan(0);

      // Apply optimization recommendations
      const optimizationResult = await services.gameServerManager.applyOptimizations(
        deployResult.serverId,
        insights.recommendations
      );
      expect(optimizationResult.applied).toBeGreaterThan(0);

      // Verify server configuration was updated
      const updatedServer = services.gameServerManager.getServer(deployResult.serverId);
      expect(updatedServer.configuration.optimizationLevel).toBeDefined();
    });
  });

  describe('Full System Integration: Complete Workflow', () => {
    test('should execute complete HomeHost workflow across all epics', async () => {
      const workflow = new SystemWorkflow('Complete Integration Test');

      // Epic 1: Deploy game server
      workflow.step('Deploy initial server');
      const serverConfig = {
        name: 'Full Integration Server',
        game: 'valheim',
        serverName: 'Integration Test World',
        password: 'test123',
        maxPlayers: 8,
        port: 2461
      };
      const deployResult = await services.gameServerManager.deployServer(serverConfig);
      expect(deployResult.success).toBe(true);
      const serverId = deployResult.serverId;

      // Epic 2: Create community and social features
      workflow.step('Create community profile');
      const communityData = {
        name: 'Full Integration Community',
        description: 'Testing complete HomeHost workflow',
        tags: ['integration', 'testing', 'valheim'],
        isPublic: true
      };
      const communityResult = await services.communityManager.createCommunity(communityData);
      expect(communityResult.success).toBe(true);
      
      await services.communityManager.addServerToCommunity(communityResult.communityId, serverId);

      // Epic 3: Install and configure plugins
      workflow.step('Install essential plugins');
      const pluginsToInstall = ['auto-backup', 'player-stats', 'chat-enhancement'];
      
      for (const pluginId of pluginsToInstall) {
        const installResult = await services.pluginManager.installPlugin(serverId, pluginId);
        if (installResult.success) {
          workflow.step(`Configured ${pluginId} plugin`);
        }
      }

      // Epic 4: Enable monetization features
      workflow.step('Setup revenue tracking');
      const donationResult = await services.revenueDashboard.processTransaction({
        type: 'donation',
        amount: 25.00,
        currency: 'USD',
        playerId: 'integration-test-player',
        serverId: serverId
      });
      expect(donationResult.success).toBe(true);

      workflow.step('Configure player engagement');
      const vipTier = await services.playerEngagement.createVipTier({
        name: 'Integration Supporter',
        price: 10.00,
        benefits: ['priority_queue', 'extra_storage'],
        serverId: serverId
      });
      expect(vipTier.success).toBe(true);

      workflow.step('Track community growth');
      // Simulate multiple player sessions
      for (let i = 0; i < 5; i++) {
        await services.communityGrowthAnalytics.trackPlayer(`integration-player-${i}`, {
          serverId: serverId,
          communityId: communityResult.communityId,
          sessionStart: new Date(Date.now() - (i * 3600000)),
          sessionDuration: 1800 + (i * 600)
        });
      }

      workflow.step('Initialize Web3 features');
      const web3Status = services.web3Integration.getStatus();
      expect(web3Status.initialized).toBe(true);

      // Verify complete integration
      workflow.step('Verify cross-system data consistency');
      
      // Check server is properly integrated across all systems
      const server = services.gameServerManager.getServer(serverId);
      expect(server.communityId).toBe(communityResult.communityId);
      
      const community = services.communityManager.getCommunity(communityResult.communityId);
      expect(community.servers).toContain(serverId);
      
      const revenue = services.revenueDashboard.getRevenue();
      expect(revenue.total).toBeGreaterThan(0);
      
      const analytics = services.communityGrowthAnalytics.getCommunityMetrics(communityResult.communityId);
      expect(analytics.totalPlayers).toBeGreaterThan(0);

      workflow.complete();
    }, 60000);
  });

  describe('Data Consistency & Event Propagation', () => {
    test('should maintain data consistency across service boundaries', async () => {
      // Deploy server
      const deployResult = await services.gameServerManager.deployServer({
        name: 'Consistency Test Server',
        game: 'rust',
        port: 28017
      });

      // Create community
      const communityResult = await services.communityManager.createCommunity({
        name: 'Consistency Test Community'
      });

      // Link server to community
      await services.communityManager.addServerToCommunity(
        communityResult.communityId,
        deployResult.serverId
      );

      // Install plugin
      await services.pluginManager.installPlugin(deployResult.serverId, 'player-tracker');

      // Verify data consistency across services
      const server = services.gameServerManager.getServer(deployResult.serverId);
      const community = services.communityManager.getCommunity(communityResult.communityId);
      const serverPlugins = services.pluginManager.getServerPlugins(deployResult.serverId);

      // Server knows about community
      expect(server.communityId).toBe(communityResult.communityId);
      
      // Community knows about server
      expect(community.servers).toContain(deployResult.serverId);
      
      // Plugins know about both
      const pluginData = serverPlugins.find(p => p.id === 'player-tracker');
      expect(pluginData.serverId).toBe(deployResult.serverId);
      expect(pluginData.communityId).toBe(communityResult.communityId);
    });

    test('should propagate events correctly between services', async () => {
      const eventLog = [];
      
      // Set up event listeners
      services.gameServerManager.on('server-deployed', (data) => {
        eventLog.push({ service: 'gameServer', event: 'server-deployed', data });
      });
      
      services.communityManager.on('server-added', (data) => {
        eventLog.push({ service: 'community', event: 'server-added', data });
      });
      
      services.pluginManager.on('plugin-installed', (data) => {
        eventLog.push({ service: 'plugin', event: 'plugin-installed', data });
      });

      // Perform actions that should trigger events
      const deployResult = await services.gameServerManager.deployServer({
        name: 'Event Test Server',
        game: 'valheim',
        port: 2462
      });

      const communityResult = await services.communityManager.createCommunity({
        name: 'Event Test Community'
      });

      await services.communityManager.addServerToCommunity(
        communityResult.communityId,
        deployResult.serverId
      );

      await services.pluginManager.installPlugin(deployResult.serverId, 'event-test-plugin');

      // Verify events were triggered
      expect(eventLog.length).toBeGreaterThan(0);
      
      const serverEvent = eventLog.find(e => e.event === 'server-deployed');
      expect(serverEvent).toBeDefined();
      expect(serverEvent.data.serverId).toBe(deployResult.serverId);
    });
  });
});

// Helper class for tracking system workflow steps
class SystemWorkflow {
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
    console.log(`[${this.name}] Workflow completed in ${totalTime}ms with ${this.steps.length} steps`);
    
    // Verify workflow completed successfully
    expect(totalTime).toBeLessThan(120000); // 2 minutes max
    expect(this.steps.length).toBeGreaterThan(5); // Meaningful workflow
  }
}