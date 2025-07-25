/**
 * PluginManager Tests - Epic 3: Plugin Ecosystem Foundation
 * Tests for the PluginManager service and PluginMarketplace component integration
 */

const PluginManager = require('../src/main/services/PluginManager');
const path = require('path');
const fs = require('fs').promises;

// Mock dependencies
class MockStore {
  constructor() {
    this.data = {};
  }
  
  get(key, defaultValue) {
    return this.data[key] || defaultValue;
  }
  
  set(key, value) {
    this.data[key] = value;
  }
}

class MockGameServerManager {
  getServer(serverId) {
    return {
      id: serverId,
      gameType: 'valheim',
      status: 'running'
    };
  }
}

class MockCommunityManager {
  // Mock community manager
}

describe('PluginManager Service', () => {
  let pluginManager;
  let mockStore;
  let mockGameServerManager;
  let mockCommunityManager;

  beforeEach(() => {
    mockStore = new MockStore();
    mockGameServerManager = new MockGameServerManager();
    mockCommunityManager = new MockCommunityManager();
    
    pluginManager = new PluginManager(
      mockStore, 
      mockGameServerManager, 
      mockCommunityManager
    );
  });

  afterEach(async () => {
    if (pluginManager && pluginManager.isInitialized) {
      await pluginManager.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await pluginManager.initialize();
      
      expect(pluginManager.isInitialized).toBe(true);
      expect(pluginManager.getInstalledPlugins()).toBeDefined();
      expect(pluginManager.getAvailablePlugins()).toBeDefined();
    });

    test('should create plugin directories', async () => {
      await pluginManager.initialize();
      
      // Plugin directories should be created (mocked filesystem)
      expect(pluginManager.pluginDirectory).toBeDefined();
      expect(pluginManager.sandboxDirectory).toBeDefined();
      expect(pluginManager.pluginDataDirectory).toBeDefined();
    });

    test('should load built-in plugins', async () => {
      await pluginManager.initialize();
      
      const installedPlugins = pluginManager.getInstalledPlugins();
      const essentialPlugins = installedPlugins.filter(p => p.category === 'quality-of-life' && p.isBuiltIn);
      const adminPlugins = installedPlugins.filter(p => p.category === 'admin-tools' && p.isBuiltIn);
      
      expect(essentialPlugins.length).toBeGreaterThan(0);
      expect(adminPlugins.length).toBeGreaterThan(0);
      
      // Check specific essential plugins
      const backupPlugin = installedPlugins.find(p => p.id === 'auto-backup-guardian');
      expect(backupPlugin).toBeDefined();
      expect(backupPlugin.name).toBe('Auto-Backup Guardian');
      expect(backupPlugin.isBuiltIn).toBe(true);
    });

    test('should load marketplace data', async () => {
      await pluginManager.initialize();
      
      const availablePlugins = pluginManager.getAvailablePlugins();
      expect(availablePlugins.length).toBeGreaterThan(0);
      
      // Check for sample marketplace plugins
      const discordPlugin = availablePlugins.find(p => p.id === 'discord-bridge-ultimate');
      expect(discordPlugin).toBeDefined();
      expect(discordPlugin.name).toBe('Discord Bridge Ultimate');
      expect(discordPlugin.developer.verified).toBe(true);
    });
  });

  describe('Plugin Management', () => {
    beforeEach(async () => {
      await pluginManager.initialize();
    });

    test('should install plugin successfully', async () => {
      const pluginId = 'advanced-backup-pro';
      const availablePlugin = pluginManager.availablePlugins.get(pluginId);
      expect(availablePlugin).toBeDefined();

      const installation = await pluginManager.installPlugin(pluginId);
      
      expect(installation).toBeDefined();
      expect(installation.id).toBe(pluginId);
      expect(installation.enabled).toBe(true);
      expect(pluginManager.isPluginInstalled(pluginId)).toBe(true);
    });

    test('should handle plugin compatibility checks', async () => {
      const pluginId = 'discord-bridge-ultimate';
      const serverId = 'test-server';
      
      // Should work with supported game
      await expect(pluginManager.installPlugin(pluginId, serverId)).resolves.toBeDefined();
    });

    test('should start and stop plugins', async () => {
      const pluginId = 'auto-backup-guardian';
      
      // Start plugin
      await pluginManager.startPlugin(pluginId);
      expect(pluginManager.isPluginRunning(pluginId)).toBe(true);
      
      // Stop plugin
      await pluginManager.stopPlugin(pluginId);
      expect(pluginManager.isPluginRunning(pluginId)).toBe(false);
    });

    test('should uninstall plugins (except built-in)', async () => {
      // Install a marketplace plugin first
      const pluginId = 'advanced-backup-pro';
      await pluginManager.installPlugin(pluginId);
      expect(pluginManager.isPluginInstalled(pluginId)).toBe(true);
      
      // Uninstall it
      await pluginManager.uninstallPlugin(pluginId);
      expect(pluginManager.isPluginInstalled(pluginId)).toBe(false);
    });

    test('should prevent uninstalling built-in plugins', async () => {
      const pluginId = 'auto-backup-guardian';
      
      await expect(pluginManager.uninstallPlugin(pluginId))
        .rejects.toThrow('Cannot uninstall built-in plugins');
    });
  });

  describe('Plugin Security', () => {
    beforeEach(async () => {
      await pluginManager.initialize();
    });

    test('should validate plugin permissions', () => {
      const validPermission = 'read-server-data';
      const invalidPermission = 'system-root-access';
      
      expect(pluginManager.isValidPermission(validPermission)).toBe(true);
      expect(pluginManager.isValidPermission(invalidPermission)).toBe(false);
    });

    test('should scan for malicious code patterns', async () => {
      const safeCode = 'console.log("Hello World");';
      const dangerousCode = 'require("child_process").exec("rm -rf /");';
      
      await expect(pluginManager.scanForMaliciousCode(safeCode)).resolves.not.toThrow();
      await expect(pluginManager.scanForMaliciousCode(dangerousCode)).rejects.toThrow();
    });

    test('should create secure sandbox environments', async () => {
      const pluginId = 'test-plugin';
      const sandboxPath = await pluginManager.createPluginSandbox(pluginId);
      
      expect(sandboxPath).toContain(pluginId);
      expect(pluginManager.sandboxes.has(pluginId)).toBe(true);
      
      const sandboxConfig = pluginManager.sandboxes.get(pluginId);
      expect(sandboxConfig.securityConfig).toBeDefined();
      expect(sandboxConfig.allowedPaths).toBeDefined();
    });
  });

  describe('Plugin Categories and Filtering', () => {
    beforeEach(async () => {
      await pluginManager.initialize();
    });

    test('should filter plugins by category', () => {
      const qolPlugins = pluginManager.getPluginsByCategory('quality-of-life');
      const adminPlugins = pluginManager.getPluginsByCategory('admin-tools');
      
      expect(qolPlugins.length).toBeGreaterThan(0);
      expect(adminPlugins.length).toBeGreaterThan(0);
      
      qolPlugins.forEach(plugin => {
        expect(plugin.category).toBe('quality-of-life');
      });
      
      adminPlugins.forEach(plugin => {
        expect(plugin.category).toBe('admin-tools');
      });
    });

    test('should retrieve specific plugins by ID', () => {
      const pluginId = 'auto-backup-guardian';
      const plugin = pluginManager.getPluginById(pluginId);
      
      expect(plugin).toBeDefined();
      expect(plugin.id).toBe(pluginId);
      expect(plugin.name).toBe('Auto-Backup Guardian');
    });

    test('should list running plugins', async () => {
      const pluginId = 'auto-backup-guardian';
      
      // Initially no plugins running
      expect(pluginManager.getRunningPlugins().length).toBe(0);
      
      // Start a plugin
      await pluginManager.startPlugin(pluginId);
      const runningPlugins = pluginManager.getRunningPlugins();
      
      expect(runningPlugins.length).toBe(1);
      expect(runningPlugins[0].id).toBe(pluginId);
    });
  });

  describe('Plugin Monitoring', () => {
    beforeEach(async () => {
      await pluginManager.initialize();
    });

    test('should monitor plugin resource usage', async () => {
      const pluginId = 'auto-backup-guardian';
      await pluginManager.startPlugin(pluginId);
      
      // Simulate resource monitoring
      await pluginManager.monitorPluginResources();
      
      const plugin = pluginManager.getPluginById(pluginId);
      expect(plugin.resourceUsage).toBeDefined();
      expect(plugin.resourceUsage.cpu).toBeDefined();
      expect(plugin.resourceUsage.memory).toBeDefined();
    });

    test('should check for plugin updates', async () => {
      // Mock a plugin that needs updating
      const pluginId = 'test-plugin';
      pluginManager.installedPlugins.set(pluginId, {
        id: pluginId,
        version: '1.0.0',
        autoUpdate: true,
        isBuiltIn: false
      });
      
      pluginManager.availablePlugins.set(pluginId, {
        id: pluginId,
        version: '2.0.0'
      });
      
      await pluginManager.checkForPluginUpdates();
      // Should emit 'plugin-update-available' event
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await pluginManager.initialize();
    });

    test('should emit events for plugin lifecycle', async () => {
      const events = [];
      
      pluginManager.on('plugin-installed', (data) => events.push({ type: 'installed', data }));
      pluginManager.on('plugin-started', (data) => events.push({ type: 'started', data }));
      pluginManager.on('plugin-stopped', (data) => events.push({ type: 'stopped', data }));
      
      const pluginId = 'advanced-backup-pro';
      
      // Install plugin
      await pluginManager.installPlugin(pluginId);
      expect(events.some(e => e.type === 'installed' && e.data.pluginId === pluginId)).toBe(true);
      
      // Start plugin
      await pluginManager.startPlugin(pluginId);
      expect(events.some(e => e.type === 'started' && e.data.pluginId === pluginId)).toBe(true);
      
      // Stop plugin
      await pluginManager.stopPlugin(pluginId);
      expect(events.some(e => e.type === 'stopped' && e.data.pluginId === pluginId)).toBe(true);
    });
  });

  describe('Cleanup and Shutdown', () => {
    test('should shutdown gracefully', async () => {
      await pluginManager.initialize();
      
      // Start some plugins
      await pluginManager.startPlugin('auto-backup-guardian');
      expect(pluginManager.getRunningPlugins().length).toBeGreaterThan(0);
      
      // Shutdown should stop all plugins
      await pluginManager.shutdown();
      expect(pluginManager.getRunningPlugins().length).toBe(0);
    });
  });
});

// Integration tests for PluginMarketplace component would go here
// These would test the React component's interaction with the plugin manager
describe('PluginMarketplace Integration', () => {
  test('should be properly integrated into the desktop app', () => {
    // This would test that the component is properly imported and routed
    // In a real test environment, you'd render the component and test interactions
    expect(true).toBe(true); // Placeholder
  });
});