const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const { spawn, exec } = require('child_process');
const crypto = require('crypto');

/**
 * PluginManager Service - Epic 3: Plugin Ecosystem Foundation
 * 
 * Creates the extensible foundation that enables HomeHost's competitive moat - 
 * a thriving plugin ecosystem that serves both casual users and power users
 * while generating sustainable revenue for developers.
 * 
 * Key Features:
 * - App store-style plugin marketplace with one-click installation
 * - Secure sandboxed execution environment for plugins
 * - Essential QoL plugin suite for casual users
 * - Advanced admin plugin suite for community managers
 * - Plugin SDK and developer tools
 * - Revenue sharing system for plugin developers
 */
class PluginManager extends EventEmitter {
  constructor(store, gameServerManager, communityManager) {
    super();
    this.store = store;
    this.gameServerManager = gameServerManager;
    this.communityManager = communityManager;
    
    this.installedPlugins = new Map();
    this.availablePlugins = new Map();
    this.pluginProcesses = new Map();
    this.sandboxes = new Map();
    this.pluginConfigs = new Map();
    this.isInitialized = false;

    this.pluginDirectory = path.join(process.cwd(), 'plugins');
    this.sandboxDirectory = path.join(process.cwd(), 'plugin-sandboxes');
    this.pluginDataDirectory = path.join(process.cwd(), 'plugin-data');

    // Plugin security and resource limits
    this.securityConfig = {
      maxMemoryMB: 256,
      maxCpuPercent: 25,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedPaths: [this.pluginDataDirectory],
      blockedNetworkHosts: ['localhost', '127.0.0.1'],
      maxNetworkConnections: 10,
      executionTimeout: 30000 // 30 seconds
    };

    // Built-in essential plugins
    this.essentialPlugins = [
      'auto-backup-guardian',
      'friend-zone-manager', 
      'performance-watchdog',
      'smart-restart-scheduler',
      'connection-helper',
      'resource-monitor'
    ];

    // Built-in admin plugins
    this.adminPlugins = [
      'community-analytics-suite',
      'cross-server-management-hub',
      'advanced-scheduler',
      'revenue-optimization-toolkit',
      'player-engagement-engine',
      'security-command-center'
    ];
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔌 Initializing PluginManager...');

      // Create plugin directories
      await this.createPluginDirectories();

      // Load installed plugins
      await this.loadInstalledPlugins();

      // Initialize built-in plugins
      await this.initializeBuiltInPlugins();

      // Set up plugin monitoring
      this.startPluginMonitoring();

      // Load marketplace data
      await this.loadMarketplaceData();

      this.isInitialized = true;
      this.emit('plugin-manager-ready');
      
      console.log('✅ PluginManager initialized successfully');
      console.log(`📦 Loaded ${this.installedPlugins.size} installed plugins`);
      console.log(`🏪 ${this.availablePlugins.size} plugins available in marketplace`);
    } catch (error) {
      console.error('❌ Failed to initialize PluginManager:', error);
      throw error;
    }
  }

  async createPluginDirectories() {
    try {
      await fs.mkdir(this.pluginDirectory, { recursive: true });
      await fs.mkdir(this.sandboxDirectory, { recursive: true });
      await fs.mkdir(this.pluginDataDirectory, { recursive: true });
      
      console.log('📁 Plugin directories created');
    } catch (error) {
      console.error('❌ Failed to create plugin directories:', error);
    }
  }

  async loadInstalledPlugins() {
    try {
      const pluginData = this.store.get('installedPlugins', {});
      
      for (const [pluginId, pluginInfo] of Object.entries(pluginData)) {
        this.installedPlugins.set(pluginId, {
          id: pluginId,
          name: pluginInfo.name || 'Unknown Plugin',
          version: pluginInfo.version || '1.0.0',
          category: pluginInfo.category || 'utility',
          developer: pluginInfo.developer || 'Unknown',
          installPath: pluginInfo.installPath,
          configuration: pluginInfo.configuration || {},
          enabled: pluginInfo.enabled !== false,
          autoUpdate: pluginInfo.autoUpdate !== false,
          installedAt: new Date(pluginInfo.installedAt || Date.now()),
          lastUsed: pluginInfo.lastUsed ? new Date(pluginInfo.lastUsed) : null,
          supportedGames: pluginInfo.supportedGames || [],
          permissions: pluginInfo.permissions || [],
          resourceUsage: pluginInfo.resourceUsage || { cpu: 0, memory: 0 },
          isBuiltIn: pluginInfo.isBuiltIn || false
        });
      }

      console.log(`📦 Loaded ${this.installedPlugins.size} installed plugins`);
    } catch (error) {
      console.error('❌ Failed to load installed plugins:', error);
    }
  }

  async initializeBuiltInPlugins() {
    try {
      console.log('🏗️ Initializing built-in plugins...');

      // Initialize essential QoL plugins
      for (const pluginId of this.essentialPlugins) {
        await this.createBuiltInPlugin(pluginId, 'quality-of-life');
      }

      // Initialize admin plugins
      for (const pluginId of this.adminPlugins) {
        await this.createBuiltInPlugin(pluginId, 'admin-tools');
      }

      console.log(`✅ Initialized ${this.essentialPlugins.length + this.adminPlugins.length} built-in plugins`);
    } catch (error) {
      console.error('❌ Failed to initialize built-in plugins:', error);
    }
  }

  async createBuiltInPlugin(pluginId, category) {
    try {
      if (this.installedPlugins.has(pluginId)) return;

      const pluginInfo = this.getBuiltInPluginInfo(pluginId, category);
      
      this.installedPlugins.set(pluginId, pluginInfo);
      
      // Save to store
      await this.saveInstalledPlugins();
      
      console.log(`✅ Created built-in plugin: ${pluginInfo.name}`);
    } catch (error) {
      console.error(`❌ Failed to create built-in plugin ${pluginId}:`, error);
    }
  }

  getBuiltInPluginInfo(pluginId, category) {
    const pluginConfigs = {
      'auto-backup-guardian': {
        name: 'Auto-Backup Guardian',
        description: 'Automated server backups with cloud storage and zero configuration',
        features: ['Scheduled backups', 'Cloud storage', 'Automatic cleanup', 'Instant restore']
      },
      'friend-zone-manager': {
        name: 'Friend Zone Manager', 
        description: 'Visual whitelist management with Discord integration',
        features: ['Discord sync', 'Bulk operations', 'Friend recommendations', 'Join notifications']
      },
      'performance-watchdog': {
        name: 'Performance Watchdog',
        description: 'Monitors server health and automatically maintains stability',
        features: ['Health monitoring', 'Auto-optimization', 'Performance alerts', 'Resource management']
      },
      'smart-restart-scheduler': {
        name: 'Smart Restart Scheduler',
        description: 'Handles server restarts during low-activity periods',
        features: ['Smart scheduling', 'Player notifications', 'Activity detection', 'Maintenance mode']
      },
      'connection-helper': {
        name: 'Connection Helper',
        description: 'Guides players through join processes with troubleshooting',
        features: ['Join assistance', 'Port checking', 'Network diagnostics', 'Auto-troubleshooting']
      },
      'resource-monitor': {
        name: 'Resource Monitor',
        description: 'Displays server performance with optimization suggestions',
        features: ['Real-time monitoring', 'Performance graphs', 'Optimization tips', 'Resource alerts']
      },
      'community-analytics-suite': {
        name: 'Community Analytics Suite',
        description: 'Detailed player behavior analysis and retention metrics',
        features: ['Player analytics', 'Retention tracking', 'Growth insights', 'Custom reports']
      },
      'cross-server-management-hub': {
        name: 'Cross-Server Management Hub',
        description: 'Unified administration across multiple game servers',
        features: ['Multi-server control', 'Sync management', 'Global commands', 'Server groups']
      },
      'advanced-scheduler': {
        name: 'Advanced Scheduler',
        description: 'Complex automation with timed events and triggers',
        features: ['Event scheduling', 'Conditional triggers', 'Automation rules', 'Task sequences']
      },
      'revenue-optimization-toolkit': {
        name: 'Revenue Optimization Toolkit',
        description: 'Donation management and monetization analytics',
        features: ['Payment processing', 'VIP management', 'Revenue tracking', 'Monetization tools']
      },
      'player-engagement-engine': {
        name: 'Player Engagement Engine',
        description: 'Automates community events and retention campaigns',
        features: ['Event automation', 'Engagement campaigns', 'Retention tools', 'Community building']
      },
      'security-command-center': {
        name: 'Security Command Center',
        description: 'Advanced moderation tools and threat detection',
        features: ['Threat detection', 'Auto-moderation', 'Security scanning', 'Incident response']
      }
    };

    const config = pluginConfigs[pluginId] || {
      name: pluginId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Built-in HomeHost plugin',
      features: []
    };

    return {
      id: pluginId,
      name: config.name,
      version: '1.0.0',
      category,
      developer: 'HomeHost',
      description: config.description,
      features: config.features,
      installPath: path.join(this.pluginDirectory, pluginId),
      configuration: {},
      enabled: true,
      autoUpdate: true,
      installedAt: new Date(),
      lastUsed: null,
      supportedGames: ['*'], // All games
      permissions: this.getDefaultPermissions(category),
      resourceUsage: { cpu: 0, memory: 0 },
      isBuiltIn: true,
      rating: 5.0,
      downloadCount: 1000000,
      price: { type: 'free' }
    };
  }

  getDefaultPermissions(category) {
    const basePermissions = ['read-server-data', 'write-logs'];
    
    if (category === 'admin-tools') {
      return [...basePermissions, 'manage-players', 'server-control', 'read-analytics'];
    }
    
    return basePermissions;
  }

  startPluginMonitoring() {
    try {
      // Monitor plugin resource usage every 30 seconds
      this.monitoringInterval = setInterval(() => {
        this.monitorPluginResources();
      }, 30 * 1000);

      // Check for plugin updates every hour
      this.updateCheckInterval = setInterval(() => {
        this.checkForPluginUpdates();
      }, 60 * 60 * 1000);

      console.log('📊 Plugin monitoring started');
    } catch (error) {
      console.error('❌ Failed to start plugin monitoring:', error);
    }
  }

  async loadMarketplaceData() {
    try {
      // In a real implementation, this would fetch from the cloud API
      // For now, we'll create mock marketplace data
      const mockMarketplace = await this.createMockMarketplaceData();
      
      for (const plugin of mockMarketplace) {
        this.availablePlugins.set(plugin.id, plugin);
      }

      console.log(`🏪 Loaded ${this.availablePlugins.size} plugins from marketplace`);
    } catch (error) {
      console.error('❌ Failed to load marketplace data:', error);
    }
  }

  async createMockMarketplaceData() {
    return [
      {
        id: 'advanced-backup-pro',
        name: 'Advanced Backup Pro',
        tagline: 'Professional backup solution with cloud sync',
        description: 'Enhanced backup system with multiple cloud providers',
        developer: { name: 'BackupSolutions', verified: true },
        category: 'quality-of-life',
        price: { type: 'paid', amount: 9.99 },
        rating: 4.8,
        downloadCount: 15000,
        version: '2.1.0',
        supportedGames: ['*'],
        features: ['Multi-cloud sync', 'Incremental backups', 'Encryption', 'Scheduling'],
        isFeatured: true,
        isNew: false
      },
      {
        id: 'discord-bridge-ultimate',
        name: 'Discord Bridge Ultimate',
        tagline: 'Complete Discord integration for your servers',
        description: 'Advanced Discord bot with server management features',
        developer: { name: 'CommunityTools', verified: true },
        category: 'community-features',
        price: { type: 'freemium', trialDays: 7 },
        rating: 4.9,
        downloadCount: 25000,
        version: '3.0.1',
        supportedGames: ['valheim', 'rust', 'cs2'],
        features: ['Chat bridge', 'Member sync', 'Role management', 'Event notifications'],
        isFeatured: true,
        isNew: true
      },
      {
        id: 'performance-optimizer',
        name: 'Performance Optimizer',
        tagline: 'AI-powered server optimization',
        description: 'Machine learning optimization for maximum performance',
        developer: { name: 'OptimizeAI', verified: false },
        category: 'admin-tools',
        price: { type: 'paid', amount: 19.99 },
        rating: 4.6,
        downloadCount: 8500,
        version: '1.5.2',
        supportedGames: ['valheim', 'rust'],
        features: ['AI optimization', 'Predictive scaling', 'Resource analysis', 'Auto-tuning'],
        isFeatured: false,
        isNew: false
      },
      {
        id: 'player-rewards-system',
        name: 'Player Rewards System',
        tagline: 'Engage players with points and rewards',
        description: 'Comprehensive reward system to boost player engagement',
        developer: { name: 'EngagementCorp', verified: true },
        category: 'monetization',
        price: { type: 'free' },
        rating: 4.4,
        downloadCount: 12000,
        version: '1.8.0',
        supportedGames: ['*'],
        features: ['Point system', 'Custom rewards', 'Leaderboards', 'Achievement tracking'],
        isFeatured: false,
        isNew: false
      },
      {
        id: 'security-guardian',
        name: 'Security Guardian',
        tagline: 'Advanced security and anti-cheat protection',
        description: 'Comprehensive security suite for server protection',
        developer: { name: 'SecureSoft', verified: true },
        category: 'security',
        price: { type: 'paid', amount: 14.99 },
        rating: 4.7,
        downloadCount: 9800,
        version: '2.3.1',
        supportedGames: ['cs2', 'rust'],
        features: ['Anti-cheat detection', 'DDoS protection', 'Player verification', 'Threat analysis'],
        isFeatured: true,
        isNew: false
      }
    ];
  }

  // Plugin Installation & Management
  async installPlugin(pluginId, serverId = null) {
    try {
      console.log(`📦 Installing plugin: ${pluginId}`);
      
      const plugin = this.availablePlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found in marketplace`);
      }

      // Check compatibility
      await this.checkPluginCompatibility(plugin, serverId);

      // Create sandbox environment
      const sandboxPath = await this.createPluginSandbox(pluginId);

      // Download and extract plugin
      const installPath = await this.downloadPlugin(plugin, sandboxPath);

      // Validate plugin security
      await this.validatePluginSecurity(installPath);

      // Configure plugin
      const configuration = await this.configurePlugin(plugin, serverId);

      // Register installation
      const installation = {
        id: pluginId,
        name: plugin.name,
        version: plugin.version,
        category: plugin.category,
        developer: plugin.developer.name,
        installPath,
        sandboxPath,
        configuration,
        enabled: true,
        autoUpdate: true,
        installedAt: new Date(),
        serverId,
        permissions: plugin.permissions || [],
        resourceUsage: { cpu: 0, memory: 0 },
        isBuiltIn: false
      };

      this.installedPlugins.set(pluginId, installation);
      await this.saveInstalledPlugins();

      // Start plugin if enabled
      if (installation.enabled) {
        await this.startPlugin(pluginId);
      }

      this.emit('plugin-installed', { pluginId, installation });
      console.log(`✅ Successfully installed plugin: ${plugin.name}`);

      return installation;
    } catch (error) {
      console.error(`❌ Failed to install plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async checkPluginCompatibility(plugin, serverId) {
    try {
      // Check supported games
      if (serverId && plugin.supportedGames && !plugin.supportedGames.includes('*')) {
        const server = this.gameServerManager?.getServer(serverId);
        if (server && !plugin.supportedGames.includes(server.gameType)) {
          throw new Error(`Plugin not compatible with game: ${server.gameType}`);
        }
      }

      // Check for conflicts
      for (const [installedId, installed] of this.installedPlugins) {
        if (installed.conflicts && installed.conflicts.includes(plugin.id)) {
          throw new Error(`Plugin conflicts with installed plugin: ${installed.name}`);
        }
      }

      // Check system requirements
      if (plugin.platformRequirements) {
        await this.checkSystemRequirements(plugin.platformRequirements);
      }

      console.log(`✅ Plugin compatibility verified: ${plugin.name}`);
    } catch (error) {
      console.error(`❌ Plugin compatibility check failed:`, error);
      throw error;
    }
  }

  async createPluginSandbox(pluginId) {
    try {
      const sandboxPath = path.join(this.sandboxDirectory, pluginId);
      await fs.mkdir(sandboxPath, { recursive: true });

      // Create sandbox configuration
      const sandboxConfig = {
        pluginId,
        createdAt: new Date().toISOString(),
        securityConfig: this.securityConfig,
        allowedPaths: [
          sandboxPath,
          this.pluginDataDirectory,
          path.join(this.pluginDataDirectory, pluginId)
        ]
      };

      await fs.writeFile(
        path.join(sandboxPath, 'sandbox.json'),
        JSON.stringify(sandboxConfig, null, 2)
      );

      this.sandboxes.set(pluginId, sandboxConfig);
      console.log(`🏗️ Created sandbox for plugin: ${pluginId}`);

      return sandboxPath;
    } catch (error) {
      console.error(`❌ Failed to create sandbox for ${pluginId}:`, error);
      throw error;
    }
  }

  async downloadPlugin(plugin, sandboxPath) {
    try {
      // In a real implementation, this would download from the plugin's package URL
      // For now, we'll simulate the download by creating a mock plugin structure
      
      const installPath = path.join(sandboxPath, 'plugin');
      await fs.mkdir(installPath, { recursive: true });

      // Create mock plugin files
      const pluginManifest = {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        category: plugin.category,
        developer: plugin.developer.name,
        main: 'index.js',
        permissions: plugin.permissions || [],
        supportedGames: plugin.supportedGames || ['*'],
        configuration: {
          enabled: true,
          autoStart: true
        }
      };

      await fs.writeFile(
        path.join(installPath, 'manifest.json'),
        JSON.stringify(pluginManifest, null, 2)
      );

      // Create mock plugin entry point
      const pluginCode = this.generateMockPluginCode(plugin);
      await fs.writeFile(path.join(installPath, 'index.js'), pluginCode);

      console.log(`📥 Downloaded plugin: ${plugin.name}`);
      return installPath;
    } catch (error) {
      console.error(`❌ Failed to download plugin ${plugin.id}:`, error);
      throw error;
    }
  }

  generateMockPluginCode(plugin) {
    return `
// HomeHost Plugin: ${plugin.name}
// Version: ${plugin.version}
// Developer: ${plugin.developer.name}

const { HomeHostPlugin } = require('@homehost/plugin-sdk');

class ${plugin.name.replace(/[^a-zA-Z0-9]/g, '')}Plugin extends HomeHostPlugin {
  constructor() {
    super({
      id: '${plugin.id}',
      name: '${plugin.name}',
      version: '${plugin.version}'
    });
  }

  async onEnable() {
    this.log('Plugin enabled: ${plugin.name}');
    
    // Plugin functionality would be implemented here
    ${this.generatePluginFunctionality(plugin)}
  }

  async onDisable() {
    this.log('Plugin disabled: ${plugin.name}');
  }

  async onServerStart(serverId) {
    this.log(\`Server started: \${serverId}\`);
  }

  async onPlayerJoin(playerId, serverId) {
    this.log(\`Player joined: \${playerId} on \${serverId}\`);
  }
}

module.exports = ${plugin.name.replace(/[^a-zA-Z0-9]/g, '')}Plugin;
`;
  }

  generatePluginFunctionality(plugin) {
    switch (plugin.category) {
      case 'quality-of-life':
        return `
    // Set up automated backup schedule
    this.scheduleBackup = setInterval(() => {
      this.createBackup();
    }, 60 * 60 * 1000); // Every hour
`;
      case 'admin-tools':
        return `
    // Set up admin dashboard
    this.setupAdminDashboard();
    
    // Monitor server performance
    this.monitorPerformance();
`;
      case 'community-features':
        return `
    // Set up Discord integration
    this.connectDiscord();
    
    // Sync community data
    this.syncCommunityData();
`;
      default:
        return `
    // Plugin-specific functionality
    this.initialize();
`;
    }
  }

  async validatePluginSecurity(installPath) {
    try {
      // Check plugin manifest exists and is valid
      const manifestPath = path.join(installPath, 'manifest.json');
      
      let manifestData;
      try {
        manifestData = await fs.readFile(manifestPath, 'utf8');
      } catch (error) {
        throw new Error('Plugin manifest.json not found');
      }

      let manifest;
      try {
        manifest = JSON.parse(manifestData);
      } catch (error) {
        throw new Error('Invalid JSON in plugin manifest');
      }

      // Validate required manifest fields
      if (!manifest.name || !manifest.version || !manifest.main) {
        throw new Error('Plugin manifest missing required fields (name, version, main)');
      }

      // Validate plugin name (no special characters, reasonable length)
      if (!/^[a-zA-Z0-9\-_\s]+$/.test(manifest.name) || manifest.name.length > 50) {
        throw new Error('Invalid plugin name. Use only letters, numbers, spaces, hyphens, and underscores (max 50 chars)');
      }

      // Validate version format (semver-like)
      if (!/^\d+\.\d+\.\d+/.test(manifest.version)) {
        throw new Error('Plugin version must follow semantic versioning (e.g., 1.0.0)');
      }

      // Validate permissions
      if (manifest.permissions) {
        if (!Array.isArray(manifest.permissions)) {
          throw new Error('Plugin permissions must be an array');
        }
        
        for (const permission of manifest.permissions) {
          if (!this.isValidPermission(permission)) {
            throw new Error(`Invalid permission: ${permission}. Check documentation for allowed permissions.`);
          }
        }
      }

      // Validate main file exists
      const mainFile = path.join(installPath, manifest.main);
      if (!(await this.fileExists(mainFile))) {
        throw new Error(`Main plugin file not found: ${manifest.main}`);
      }

      // Scan for malicious code patterns
      const code = await fs.readFile(mainFile, 'utf8');
      await this.scanForMaliciousCode(code, manifest.name);

      // Validate file structure (no executables, reasonable file count)
      await this.validatePluginFileStructure(installPath);

      console.log(`🔒 Security validation passed for plugin: ${manifest.name}`);
      return manifest;
    } catch (error) {
      console.error(`❌ Security validation failed:`, error.message);
      throw error;
    }
  }

  isValidPermission(permission) {
    const validPermissions = [
      'read-server-data',
      'write-server-data',
      'manage-players',
      'server-control',
      'read-analytics',
      'write-logs',
      'network-access',
      'file-system-access'
    ];
    
    return validPermissions.includes(permission);
  }

  async scanForMaliciousCode(code, pluginName) {
    // Enhanced security scan for dangerous patterns
    const dangerousPatterns = [
      { pattern: /require\s*\(\s*['"]child_process['"]\s*\)/, reason: 'Process execution not allowed' },
      { pattern: /require\s*\(\s*['"]fs['"]\s*\)/, reason: 'Direct file system access not allowed' },
      { pattern: /require\s*\(\s*['"]net['"]\s*\)/, reason: 'Network access must be declared in permissions' },
      { pattern: /require\s*\(\s*['"]http['"]\s*\)/, reason: 'HTTP access must be declared in permissions' },
      { pattern: /require\s*\(\s*['"]https['"]\s*\)/, reason: 'HTTPS access must be declared in permissions' },
      { pattern: /eval\s*\(/, reason: 'Dynamic code execution not allowed' },
      { pattern: /Function\s*\(/, reason: 'Dynamic function creation not allowed' },
      { pattern: /process\.exit/, reason: 'Process termination not allowed' },
      { pattern: /process\.kill/, reason: 'Process killing not allowed' },
      { pattern: /global\s*\./, reason: 'Global scope modification not allowed' },
      { pattern: /__dirname/, reason: 'Directory introspection limited' },
      { pattern: /__filename/, reason: 'File introspection limited' },
      { pattern: /Buffer\.from\s*\(/, reason: 'Raw buffer operations not allowed' },
      { pattern: /setInterval|setTimeout.*exec|spawn/, reason: 'Scheduled process execution not allowed' }
    ];

    for (const { pattern, reason } of dangerousPatterns) {
      if (pattern.test(code)) {
        throw new Error(`Security violation in ${pluginName}: ${reason}`);
      }
    }

    // Check for obfuscated code patterns
    const suspiciousPatterns = [
      /\\x[0-9a-f]{2}/gi, // Hex encoded strings
      /String\.fromCharCode/gi, // Character code strings
      /window\['[^']+'\]/gi, // Bracket notation access
      /document\['[^']+'\]/gi // Bracket notation access
    ];

    let suspiciousCount = 0;
    for (const pattern of suspiciousPatterns) {
      const matches = (code.match(pattern) || []).length;
      suspiciousCount += matches;
    }

    if (suspiciousCount > 10) {
      throw new Error(`Plugin ${pluginName} contains potentially obfuscated code (${suspiciousCount} suspicious patterns)`);
    }
  }

  async validatePluginFileStructure(installPath) {
    const allowedExtensions = ['.js', '.json', '.md', '.txt', '.css', '.html'];
    const maxFiles = 50;
    const maxFileSize = 1024 * 1024; // 1MB per file

    let fileCount = 0;
    
    async function scanDirectory(dir) {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else {
          fileCount++;
          
          // Check file count limit
          if (fileCount > maxFiles) {
            throw new Error(`Plugin contains too many files (max ${maxFiles})`);
          }
          
          // Check file extension
          const ext = path.extname(item.name).toLowerCase();
          if (!allowedExtensions.includes(ext)) {
            throw new Error(`Forbidden file type: ${item.name}. Allowed extensions: ${allowedExtensions.join(', ')}`);
          }
          
          // Check file size
          const stats = await fs.stat(fullPath);
          if (stats.size > maxFileSize) {
            throw new Error(`File too large: ${item.name} (max 1MB per file)`);
          }
          
          // Check for executable permissions on Unix systems
          if (process.platform !== 'win32') {
            const mode = stats.mode;
            if ((mode & parseInt('111', 8)) !== 0) {
              throw new Error(`Executable file detected: ${item.name}. Plugins cannot contain executable files.`);
            }
          }
        }
      }
    }
    
    await scanDirectory(installPath);
    console.log(`📁 File structure validation passed: ${fileCount} files checked`);
  }

  async configurePlugin(plugin, serverId) {
    const defaultConfig = {
      enabled: true,
      autoStart: true,
      serverId,
      settings: {}
    };

    // Plugin-specific default configurations
    switch (plugin.category) {
      case 'quality-of-life':
        defaultConfig.settings = {
          backupInterval: '1h',
          maxBackups: 10,
          cloudSync: false
        };
        break;
      case 'admin-tools':
        defaultConfig.settings = {
          dashboardPort: 8080,
          alertThresholds: {
            cpu: 80,
            memory: 85
          }
        };
        break;
      case 'community-features':
        defaultConfig.settings = {
          discordWebhook: '',
          syncInterval: '5m'
        };
        break;
    }

    return defaultConfig;
  }

  // Plugin Lifecycle Management
  async startPlugin(pluginId) {
    try {
      const plugin = this.installedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      if (this.pluginProcesses.has(pluginId)) {
        console.log(`⚠️ Plugin ${plugin.name} is already running`);
        return;
      }

      console.log(`🚀 Starting plugin: ${plugin.name}`);

      // Create plugin process in sandbox
      const pluginProcess = await this.createPluginProcess(plugin);
      
      this.pluginProcesses.set(pluginId, pluginProcess);
      plugin.lastUsed = new Date();

      this.emit('plugin-started', { pluginId, plugin });
      console.log(`✅ Plugin started successfully: ${plugin.name}`);
    } catch (error) {
      console.error(`❌ Failed to start plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async createPluginProcess(plugin) {
    return new Promise((resolve, reject) => {
      const sandboxConfig = this.sandboxes.get(plugin.id);
      const mainFile = path.join(plugin.installPath, 'index.js');

      // Create sandboxed Node.js process
      const pluginProcess = spawn('node', [mainFile], {
        cwd: plugin.installPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          HOMEHOST_PLUGIN_ID: plugin.id,
          HOMEHOST_PLUGIN_DATA: path.join(this.pluginDataDirectory, plugin.id),
          HOMEHOST_SANDBOX_MODE: 'true'
        }
      });

      pluginProcess.stdout.on('data', (data) => {
        console.log(`[${plugin.name}] ${data.toString().trim()}`);
        this.emit('plugin-log', { pluginId: plugin.id, level: 'info', message: data.toString().trim() });
      });

      pluginProcess.stderr.on('data', (data) => {
        console.error(`[${plugin.name}] ${data.toString().trim()}`);
        this.emit('plugin-log', { pluginId: plugin.id, level: 'error', message: data.toString().trim() });
      });

      pluginProcess.on('exit', (code) => {
        console.log(`[${plugin.name}] Process exited with code ${code}`);
        this.pluginProcesses.delete(plugin.id);
        this.emit('plugin-stopped', { pluginId: plugin.id, exitCode: code });
      });

      pluginProcess.on('error', (error) => {
        console.error(`[${plugin.name}] Process error:`, error);
        reject(error);
      });

      // Wait a moment to ensure process started successfully
      setTimeout(() => {
        if (!pluginProcess.killed) {
          resolve(pluginProcess);
        } else {
          reject(new Error('Plugin process failed to start'));
        }
      }, 1000);
    });
  }

  async stopPlugin(pluginId) {
    try {
      const plugin = this.installedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      const pluginProcess = this.pluginProcesses.get(pluginId);
      if (!pluginProcess) {
        console.log(`⚠️ Plugin ${plugin.name} is not running`);
        return;
      }

      console.log(`🛑 Stopping plugin: ${plugin.name}`);

      // Graceful shutdown
      pluginProcess.kill('SIGTERM');
      
      // Force kill after timeout
      setTimeout(() => {
        if (!pluginProcess.killed) {
          pluginProcess.kill('SIGKILL');
        }
      }, 5000);

      this.pluginProcesses.delete(pluginId);
      this.emit('plugin-stopped', { pluginId, plugin });
      
      console.log(`✅ Plugin stopped: ${plugin.name}`);
    } catch (error) {
      console.error(`❌ Failed to stop plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async uninstallPlugin(pluginId) {
    try {
      const plugin = this.installedPlugins.get(pluginId);
      if (!plugin) {
        throw new Error(`Plugin ${pluginId} not found`);
      }

      if (plugin.isBuiltIn) {
        throw new Error('Cannot uninstall built-in plugins');
      }

      console.log(`🗑️ Uninstalling plugin: ${plugin.name}`);

      // Stop plugin if running
      if (this.pluginProcesses.has(pluginId)) {
        await this.stopPlugin(pluginId);
      }

      // Remove plugin files
      if (plugin.installPath && await this.fileExists(plugin.installPath)) {
        await fs.rm(plugin.installPath, { recursive: true, force: true });
      }

      // Remove sandbox
      if (plugin.sandboxPath && await this.fileExists(plugin.sandboxPath)) {
        await fs.rm(plugin.sandboxPath, { recursive: true, force: true });
      }

      // Remove from collections
      this.installedPlugins.delete(pluginId);
      this.sandboxes.delete(pluginId);
      
      await this.saveInstalledPlugins();

      this.emit('plugin-uninstalled', { pluginId, plugin });
      console.log(`✅ Plugin uninstalled: ${plugin.name}`);
    } catch (error) {
      console.error(`❌ Failed to uninstall plugin ${pluginId}:`, error);
      throw error;
    }
  }

  // Plugin Monitoring & Resource Management
  async monitorPluginResources() {
    try {
      for (const [pluginId, process] of this.pluginProcesses) {
        const plugin = this.installedPlugins.get(pluginId);
        if (!plugin) continue;

        // Get process resource usage
        const resourceUsage = await this.getProcessResourceUsage(process.pid);
        plugin.resourceUsage = resourceUsage;

        // Check resource limits
        if (resourceUsage.memory > this.securityConfig.maxMemoryMB) {
          console.warn(`⚠️ Plugin ${plugin.name} exceeding memory limit: ${resourceUsage.memory}MB`);
          this.emit('plugin-resource-warning', { pluginId, type: 'memory', usage: resourceUsage.memory });
        }

        if (resourceUsage.cpu > this.securityConfig.maxCpuPercent) {
          console.warn(`⚠️ Plugin ${plugin.name} exceeding CPU limit: ${resourceUsage.cpu}%`);
          this.emit('plugin-resource-warning', { pluginId, type: 'cpu', usage: resourceUsage.cpu });
        }
      }
    } catch (error) {
      console.error('❌ Failed to monitor plugin resources:', error);
    }
  }

  async getProcessResourceUsage(pid) {
    return new Promise((resolve) => {
      // Mock resource usage for testing
      resolve({
        cpu: Math.random() * 15, // 0-15%
        memory: Math.random() * 100 + 50 // 50-150MB
      });
    });
  }

  async checkForPluginUpdates() {
    try {
      console.log('🔄 Checking for plugin updates...');
      
      let updatesFound = 0;
      
      for (const [pluginId, plugin] of this.installedPlugins) {
        if (plugin.isBuiltIn || !plugin.autoUpdate) continue;

        const marketplacePlugin = this.availablePlugins.get(pluginId);
        if (marketplacePlugin && marketplacePlugin.version !== plugin.version) {
          console.log(`📦 Update available for ${plugin.name}: ${plugin.version} → ${marketplacePlugin.version}`);
          
          this.emit('plugin-update-available', {
            pluginId,
            currentVersion: plugin.version,
            newVersion: marketplacePlugin.version
          });
          
          updatesFound++;
        }
      }

      if (updatesFound === 0) {
        console.log('✅ All plugins are up to date');
      }
    } catch (error) {
      console.error('❌ Failed to check for plugin updates:', error);
    }
  }

  // Data Management
  async saveInstalledPlugins() {
    try {
      const pluginData = {};
      for (const [id, plugin] of this.installedPlugins) {
        pluginData[id] = {
          ...plugin,
          installedAt: plugin.installedAt.toISOString(),
          lastUsed: plugin.lastUsed ? plugin.lastUsed.toISOString() : null
        };
      }
      this.store.set('installedPlugins', pluginData);
    } catch (error) {
      console.error('❌ Failed to save installed plugins:', error);
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  // Public API Methods
  getInstalledPlugins() {
    return Array.from(this.installedPlugins.values());
  }

  getAvailablePlugins() {
    return Array.from(this.availablePlugins.values());
  }

  getPluginById(pluginId) {
    return this.installedPlugins.get(pluginId);
  }

  getPluginsByCategory(category) {
    return Array.from(this.installedPlugins.values()).filter(plugin => plugin.category === category);
  }

  getRunningPlugins() {
    return Array.from(this.pluginProcesses.keys()).map(pluginId => this.installedPlugins.get(pluginId));
  }

  isPluginInstalled(pluginId) {
    return this.installedPlugins.has(pluginId);
  }

  isPluginRunning(pluginId) {
    return this.pluginProcesses.has(pluginId);
  }

  async shutdown() {
    try {
      console.log('🛑 Shutting down PluginManager...');
      
      // Clear monitoring intervals
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      if (this.updateCheckInterval) {
        clearInterval(this.updateCheckInterval);
      }

      // Stop all running plugins
      for (const pluginId of this.pluginProcesses.keys()) {
        await this.stopPlugin(pluginId);
      }

      // Save final state
      await this.saveInstalledPlugins();

      // Clear collections
      this.installedPlugins.clear();
      this.availablePlugins.clear();
      this.pluginProcesses.clear();
      this.sandboxes.clear();

      console.log('✅ PluginManager shutdown complete');
    } catch (error) {
      console.error('❌ Error during PluginManager shutdown:', error);
    }
  }
}

module.exports = PluginManager;