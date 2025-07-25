const http = require('http');
const url = require('url');
const { WebSocketServer } = require('ws');

const PORT = 3002;

// Mock data
const mockUsers = [
  {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    createdAt: new Date().toISOString()
  }
];

const mockServers = [
  {
    id: '1',
    name: 'Test Valheim Server',
    game: 'Valheim',
    status: 'RUNNING',
    playerCount: 3,
    maxPlayers: 10,
    region: 'US-East',
    uptime: '99.5%',
    createdAt: new Date().toISOString(),
    serverType: 'Standard',
    cpuUsage: 45
  },
  {
    id: '2',
    name: 'Minecraft Server',
    game: 'Minecraft',
    status: 'STOPPED',
    playerCount: 0,
    maxPlayers: 20,
    region: 'US-West',
    uptime: '98.2%',
    createdAt: new Date().toISOString(),
    serverType: 'Premium',
    cpuUsage: 0
  }
];

const mockCommunities = [
  {
    id: '1',
    name: 'Viking Legends',
    description: 'A friendly Valheim community for casual and hardcore players alike',
    game: 'Valheim',
    memberCount: 156,
    onlineMembers: 23,
    joinType: 'open',
    featured: true,
    verified: true,
    region: 'Global',
    tags: ['Casual', 'Friendly', 'PvE'],
    rating: 4.8,
    reviewCount: 42,
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Tactical Strike Force',
    description: 'Competitive CS2 community with daily scrimmages and tournaments',
    game: 'Counter-Strike 2',
    memberCount: 89,
    onlineMembers: 15,
    joinType: 'application',
    featured: false,
    verified: true,
    region: 'North America',
    tags: ['Competitive', 'Tournament', 'Skilled'],
    rating: 4.6,
    reviewCount: 28,
    createdAt: new Date().toISOString()
  }
];

const mockPlugins = [
  {
    id: '1',
    name: 'AutoBackup Pro',
    description: 'Automated backup solution with cloud storage support and scheduled backups',
    category: 'Administration',
    version: '2.1.0',
    author: 'BackupTech',
    price: 9.99,
    rating: 4.8,
    downloads: 15420,
    verified: true,
    gameTypes: ['Minecraft', 'Valheim', 'Rust'],
    tags: ['backup', 'automation', 'cloud'],
    featured: true,
    icon: '🔄',
    screenshots: ['https://example.com/screenshot1.jpg'],
    requirements: ['Server RAM: 1GB+', 'Disk Space: 500MB'],
    compatibility: ['1.19+', '1.18+'],
    lastUpdated: '2024-01-15',
    createdAt: new Date().toISOString(),
    dependencies: [],
    conflicts: ['3'], // Conflicts with PvP Arena Manager
    provides: ['backup-service']
  },
  {
    id: '2',
    name: 'AdvancedEconomy',
    description: 'Complete economy system with shops, auctions, and currency management',
    category: 'Economy',
    version: '3.2.1',
    author: 'EconDev',
    price: 14.99,
    rating: 4.6,
    downloads: 8930,
    verified: true,
    gameTypes: ['Minecraft'],
    tags: ['economy', 'shops', 'currency'],
    featured: false,
    icon: '💰',
    screenshots: ['https://example.com/screenshot2.jpg'],
    requirements: ['Server RAM: 2GB+', 'Database: MySQL/SQLite'],
    compatibility: ['1.19+'],
    lastUpdated: '2024-01-10',
    createdAt: new Date().toISOString(),
    dependencies: ['5'], // Requires Performance Monitor for metrics
    conflicts: [],
    provides: ['economy-api', 'currency-system']
  },
  {
    id: '3',
    name: 'PvP Arena Manager',
    description: 'Create and manage custom PvP arenas with ranking and tournament systems',
    category: 'PvP',
    version: '1.5.3',
    author: 'ArenaDevs',
    price: 12.50,
    rating: 4.7,
    downloads: 6750,
    verified: true,
    gameTypes: ['Minecraft', 'Rust'],
    tags: ['pvp', 'arena', 'tournament'],
    featured: true,
    icon: '⚔️',
    screenshots: ['https://example.com/screenshot3.jpg'],
    requirements: ['Server RAM: 1.5GB+', 'Disk Space: 200MB'],
    compatibility: ['1.18+', '1.19+'],
    lastUpdated: '2024-01-12',
    createdAt: new Date().toISOString(),
    dependencies: ['2'], // Requires AdvancedEconomy for rewards
    conflicts: ['1'], // Conflicts with AutoBackup Pro
    provides: ['pvp-api', 'arena-system']
  },
  {
    id: '4',
    name: 'Chat Moderator AI',
    description: 'AI-powered chat moderation with automatic spam detection and filtering',
    category: 'Moderation',
    version: '1.0.8',
    author: 'ModAI',
    price: 19.99,
    rating: 4.9,
    downloads: 3210,
    verified: true,
    gameTypes: ['Minecraft', 'Valheim', 'Rust'],
    tags: ['moderation', 'ai', 'chat'],
    featured: false,
    icon: '🤖',
    screenshots: ['https://example.com/screenshot4.jpg'],
    requirements: ['Server RAM: 2GB+', 'Internet Connection Required'],
    compatibility: ['All Versions'],
    lastUpdated: '2024-01-08',
    createdAt: new Date().toISOString(),
    dependencies: ['5'], // Requires Performance Monitor for resource monitoring
    conflicts: [],
    provides: ['moderation-api', 'ai-detection']
  },
  {
    id: '5',
    name: 'Performance Monitor',
    description: 'Real-time server performance monitoring with alerts and analytics',
    category: 'Monitoring',
    version: '2.0.2',
    author: 'PerfMonitor',
    price: 0,
    rating: 4.5,
    downloads: 21300,
    verified: true,
    gameTypes: ['Minecraft', 'Valheim', 'Rust', 'ARK'],
    tags: ['monitoring', 'performance', 'analytics'],
    featured: true,
    icon: '📊',
    screenshots: ['https://example.com/screenshot5.jpg'],
    requirements: ['Server RAM: 512MB+', 'Disk Space: 100MB'],
    compatibility: ['All Versions'],
    lastUpdated: '2024-01-14',
    createdAt: new Date().toISOString(),
    dependencies: [], // Base plugin with no dependencies
    conflicts: [],
    provides: ['monitoring-api', 'performance-metrics', 'alert-system']
  }
];

// Simple JWT-like token (not secure, just for testing)
const generateToken = (user) => {
  return Buffer.from(JSON.stringify({
    userId: user.id,
    email: user.email,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  })).toString('base64');
};

const verifyToken = (token) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    if (decoded.exp > Date.now()) {
      return decoded;
    }
  } catch (e) {
    return null;
  }
  return null;
};

// Simple response helper
const sendResponse = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
};

// WebSocket server and clients management
let connectedClients = new Set();

// Plugin Management System
let serverPlugins = new Map(); // serverId -> pluginId[]
let pluginInstallations = new Map(); // installationId -> installation data
let pluginConfigurations = new Map(); // serverId_pluginId -> config data
let activeInstallations = new Map(); // installationId -> progress data

// Plugin update information
let pluginUpdates = new Map(); // pluginId -> update info

// Plugin logging system
let pluginLogs = new Map(); // serverId_pluginId -> log entries

// Plugin backup system
let pluginBackups = new Map(); // serverId -> backup entries

// Mock plugin installations for testing
const initializePluginData = () => {
  // Server 1 has some plugins installed
  serverPlugins.set('1', ['5', '1']); // Performance Monitor, AutoBackup Pro
  
  // Plugin configurations
  pluginConfigurations.set('1_5', {
    enabled: true,
    autoUpdate: true,
    config: {
      alertThreshold: 80,
      monitoringInterval: 60,
      enableEmailAlerts: true,
      alertEmail: 'admin@example.com'
    },
    lastConfigured: new Date().toISOString()
  });
  
  pluginConfigurations.set('1_1', {
    enabled: true,
    autoUpdate: false,
    config: {
      backupInterval: 3600,
      maxBackups: 10,
      compressionEnabled: true,
      cloudStorage: 'aws-s3'
    },
    lastConfigured: new Date().toISOString()
  });

  // Mock plugin updates
  pluginUpdates.set('1', {
    pluginId: '1',
    currentVersion: '2.1.0',
    latestVersion: '2.2.0',
    updateAvailable: true,
    updateDescription: 'Bug fixes and performance improvements',
    releaseDate: '2024-01-20',
    changelog: [
      'Fixed backup compression issue',
      'Improved cloud storage sync',
      'Added support for new storage providers'
    ],
    critical: false,
    autoUpdateEnabled: false
  });

  // Mock plugin logs
  const now = new Date();
  const generateLogEntry = (level, message, timestamp = now) => ({
    id: Date.now() + Math.random(),
    timestamp: timestamp.toISOString(),
    level,
    message,
    source: 'plugin'
  });

  // Performance Monitor logs
  pluginLogs.set('1_5', [
    generateLogEntry('INFO', 'Performance Monitor started successfully', new Date(now - 30 * 60 * 1000)),
    generateLogEntry('INFO', 'Monitoring interval set to 60 seconds', new Date(now - 29 * 60 * 1000)),
    generateLogEntry('DEBUG', 'CPU threshold check: 45% (threshold: 80%)', new Date(now - 25 * 60 * 1000)),
    generateLogEntry('INFO', 'Email alerts enabled for admin@example.com', new Date(now - 20 * 60 * 1000)),
    generateLogEntry('DEBUG', 'Memory usage check: 1.2GB', new Date(now - 15 * 60 * 1000)),
    generateLogEntry('WARN', 'CPU usage spike detected: 85%', new Date(now - 10 * 60 * 1000)),
    generateLogEntry('INFO', 'Alert email sent successfully', new Date(now - 9 * 60 * 1000)),
    generateLogEntry('DEBUG', 'Performance metrics collected', new Date(now - 5 * 60 * 1000)),
    generateLogEntry('INFO', 'All systems operating normally', new Date(now - 2 * 60 * 1000))
  ]);

  // AutoBackup Pro logs
  pluginLogs.set('1_1', [
    generateLogEntry('INFO', 'AutoBackup Pro initialized', new Date(now - 60 * 60 * 1000)),
    generateLogEntry('INFO', 'Backup schedule: every 3600 seconds', new Date(now - 59 * 60 * 1000)),
    generateLogEntry('INFO', 'Cloud storage configured: AWS S3', new Date(now - 58 * 60 * 1000)),
    generateLogEntry('INFO', 'Starting backup process', new Date(now - 45 * 60 * 1000)),
    generateLogEntry('DEBUG', 'Scanning world files...', new Date(now - 44 * 60 * 1000)),
    generateLogEntry('INFO', 'Backup completed: 2.3GB compressed to 1.1GB', new Date(now - 40 * 60 * 1000)),
    generateLogEntry('INFO', 'Backup uploaded to cloud storage', new Date(now - 35 * 60 * 1000)),
    generateLogEntry('DEBUG', 'Cleaning up old backups (keeping 10 most recent)', new Date(now - 30 * 60 * 1000)),
    generateLogEntry('INFO', 'Backup process completed successfully', new Date(now - 25 * 60 * 1000)),
    generateLogEntry('ERROR', 'Failed to connect to cloud storage', new Date(now - 5 * 60 * 1000)),
    generateLogEntry('WARN', 'Backup stored locally only', new Date(now - 4 * 60 * 1000))
  ]);
};

initializePluginData();

// Real-time data simulation functions
function simulateServerMetrics() {
  // Simulate changing server metrics
  mockServers.forEach(server => {
    if (server.status === 'RUNNING') {
      // Simulate player count changes
      const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      server.playerCount = Math.max(0, Math.min(server.maxPlayers, server.playerCount + change));
      
      // Simulate CPU usage changes
      server.cpuUsage = Math.max(10, Math.min(95, server.cpuUsage + (Math.random() * 10 - 5)));
      
      // Simulate memory usage
      server.memoryUsage = Math.max(20, Math.min(90, (server.memoryUsage || 40) + (Math.random() * 10 - 5)));
    }
  });

  // Broadcast updates to all connected clients
  broadcastToClients('server_metrics', {
    servers: mockServers,
    timestamp: new Date().toISOString()
  });
}

function simulateActivityFeed() {
  const activities = [
    'Player joined Test Valheim Server',
    'Plugin AutoBackup Pro completed backup',
    'Server performance optimized automatically',
    'New community member joined Viking Legends',
    'Player achieved new milestone in Minecraft Server'
  ];
  
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  
  broadcastToClients('activity_update', {
    activity: {
      id: Date.now().toString(),
      message: randomActivity,
      timestamp: new Date().toISOString(),
      type: 'info'
    }
  });
}

function broadcastToClients(type, data) {
  const message = JSON.stringify({ type, data });
  connectedClients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// Alias for broadcastToClients
function broadcast(message) {
  broadcastToClients(message.type, message.data);
}

// Simulate plugin installation progress
function simulatePluginInstallation(installationId, pluginId, serverId, pluginName) {
  const steps = [
    { step: 'downloading', message: 'Downloading plugin files...', progress: 10 },
    { step: 'extracting', message: 'Extracting plugin archive...', progress: 30 },
    { step: 'validating', message: 'Validating plugin integrity...', progress: 50 },
    { step: 'installing', message: 'Installing plugin dependencies...', progress: 70 },
    { step: 'configuring', message: 'Configuring plugin settings...', progress: 85 },
    { step: 'starting', message: 'Starting plugin services...', progress: 95 },
    { step: 'completed', message: 'Plugin installation completed!', progress: 100 }
  ];

  let currentStep = 0;
  
  const progressInterval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(progressInterval);
      
      // Mark installation as complete
      activeInstallations.delete(installationId);
      
      // Add to server plugins
      const currentPlugins = serverPlugins.get(serverId) || [];
      if (!currentPlugins.includes(pluginId)) {
        currentPlugins.push(pluginId);
        serverPlugins.set(serverId, currentPlugins);
        
        // Create default configuration
        const configKey = `${serverId}_${pluginId}`;
        pluginConfigurations.set(configKey, {
          enabled: true,
          autoUpdate: true,
          config: {},
          lastConfigured: new Date().toISOString()
        });
      }
      
      // Broadcast completion
      broadcastToClients('plugin_installation_complete', {
        installationId,
        pluginId,
        serverId,
        pluginName,
        status: 'completed',
        timestamp: new Date().toISOString()
      });
      
      return;
    }
    
    const step = steps[currentStep];
    const progressData = {
      installationId,
      pluginId,
      serverId,
      pluginName,
      ...step,
      timestamp: new Date().toISOString()
    };
    
    // Update active installation
    activeInstallations.set(installationId, progressData);
    
    // Broadcast progress update
    broadcastToClients('plugin_installation_progress', progressData);
    
    currentStep++;
  }, 1000); // Update every second
}

// Plugin dependency resolution functions
function getPluginDependencies(pluginId) {
  const plugin = mockPlugins.find(p => p.id === pluginId);
  return plugin ? plugin.dependencies || [] : [];
}

function getPluginConflicts(pluginId) {
  const plugin = mockPlugins.find(p => p.id === pluginId);
  return plugin ? plugin.conflicts || [] : [];
}

function checkDependencyConflicts(serverId, pluginId) {
  const installedPlugins = serverPlugins.get(serverId) || [];
  const pluginConflicts = getPluginConflicts(pluginId);
  
  const conflicts = [];
  
  // Check for direct conflicts
  for (const conflictId of pluginConflicts) {
    if (installedPlugins.includes(conflictId)) {
      const conflictPlugin = mockPlugins.find(p => p.id === conflictId);
      conflicts.push({
        type: 'conflict',
        pluginId: conflictId,
        pluginName: conflictPlugin?.name || 'Unknown Plugin',
        reason: 'This plugin conflicts with the plugin you are trying to install'
      });
    }
  }
  
  // Check for reverse conflicts (other plugins that conflict with this one)
  for (const installedId of installedPlugins) {
    const installedConflicts = getPluginConflicts(installedId);
    if (installedConflicts.includes(pluginId)) {
      const installedPlugin = mockPlugins.find(p => p.id === installedId);
      conflicts.push({
        type: 'reverse_conflict',
        pluginId: installedId,
        pluginName: installedPlugin?.name || 'Unknown Plugin',
        reason: 'An installed plugin conflicts with the plugin you are trying to install'
      });
    }
  }
  
  return conflicts;
}

function resolveDependencies(serverId, pluginId, visited = new Set()) {
  // Prevent circular dependencies
  if (visited.has(pluginId)) {
    return { success: false, error: 'Circular dependency detected', chain: Array.from(visited) };
  }
  
  visited.add(pluginId);
  
  const installedPlugins = serverPlugins.get(serverId) || [];
  const dependencies = getPluginDependencies(pluginId);
  const missingDependencies = [];
  const dependencyChain = [];
  
  for (const depId of dependencies) {
    const depPlugin = mockPlugins.find(p => p.id === depId);
    if (!depPlugin) {
      missingDependencies.push({
        pluginId: depId,
        pluginName: 'Unknown Plugin',
        reason: 'Required plugin not found in marketplace'
      });
      continue;
    }
    
    if (!installedPlugins.includes(depId)) {
      // Check if this dependency has its own dependencies
      const depResult = resolveDependencies(serverId, depId, new Set(visited));
      if (!depResult.success) {
        return depResult;
      }
      
      // Add dependency chain
      dependencyChain.push(...depResult.chain);
      dependencyChain.push({
        pluginId: depId,
        pluginName: depPlugin.name,
        version: depPlugin.version,
        reason: `Required by ${mockPlugins.find(p => p.id === pluginId)?.name || 'Unknown Plugin'}`
      });
    }
  }
  
  return {
    success: missingDependencies.length === 0,
    missingDependencies,
    chain: dependencyChain
  };
}

// Create server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Handle preflight requests
  if (method === 'OPTIONS') {
    sendResponse(res, 200, {});
    return;
  }

  // Health check
  if (path === '/health') {
    sendResponse(res, 200, { status: 'OK', timestamp: new Date().toISOString() });
    return;
  }

  // Handle POST requests
  if (method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let requestBody = {};
      try {
        requestBody = JSON.parse(body);
      } catch (e) {
        sendResponse(res, 400, { success: false, error: { message: 'Invalid JSON' } });
        return;
      }

      // Login endpoint
      if (path === '/api/auth/login') {
        const { email, password } = requestBody;
        if (email === 'test@example.com' && password === 'password') {
          const user = mockUsers[0];
          const token = generateToken(user);
          sendResponse(res, 200, {
            success: true,
            data: {
              user,
              tokens: {
                accessToken: token,
                refreshToken: token + '_refresh'
              }
            }
          });
        } else {
          sendResponse(res, 401, {
            success: false,
            error: { message: 'Invalid email or password' }
          });
        }
        return;
      }

      // Register endpoint
      if (path === '/api/auth/register') {
        const { email, username, password, firstName, lastName } = requestBody;
        const newUser = {
          id: String(mockUsers.length + 1),
          username,
          email,
          firstName,
          lastName,
          role: 'USER',
          createdAt: new Date().toISOString()
        };
        mockUsers.push(newUser);
        const token = generateToken(newUser);
        sendResponse(res, 200, {
          success: true,
          data: {
            user: newUser,
            tokens: {
              accessToken: token,
              refreshToken: token + '_refresh'
            }
          }
        });
        return;
      }

      // Server actions
      if (path.startsWith('/api/servers/') && path.endsWith('/start')) {
        const serverId = path.split('/')[3];
        const server = mockServers.find(s => s.id === serverId);
        if (server) {
          server.status = 'RUNNING';
          sendResponse(res, 200, { success: true, data: { server } });
        } else {
          sendResponse(res, 404, { success: false, error: { message: 'Server not found' } });
        }
        return;
      }

      if (path.startsWith('/api/servers/') && path.endsWith('/stop')) {
        const serverId = path.split('/')[3];
        const server = mockServers.find(s => s.id === serverId);
        if (server) {
          server.status = 'STOPPED';
          server.playerCount = 0;
          sendResponse(res, 200, { success: true, data: { server } });
        } else {
          sendResponse(res, 404, { success: false, error: { message: 'Server not found' } });
        }
        return;
      }

      // Community join
      if (path.startsWith('/api/communities/') && path.endsWith('/join')) {
        const communityId = path.split('/')[3];
        const community = mockCommunities.find(c => c.id === communityId);
        if (community) {
          sendResponse(res, 200, {
            success: true,
            data: { message: `Successfully joined ${community.name}` }
          });
        } else {
          sendResponse(res, 404, {
            success: false,
            error: { message: 'Community not found' }
          });
        }
        return;
      }

      // Plugin installation
      if (path.startsWith('/api/plugins/') && path.endsWith('/install')) {
        const pluginId = path.split('/')[3];
        const plugin = mockPlugins.find(p => p.id === pluginId);
        const { serverId, skipDependencyCheck } = requestBody;
        
        if (plugin) {
          // Check if plugin is already installed
          const currentPlugins = serverPlugins.get(serverId) || [];
          if (currentPlugins.includes(pluginId)) {
            sendResponse(res, 400, {
              success: false,
              error: { message: 'Plugin is already installed on this server' }
            });
            return;
          }
          
          // Check dependencies and conflicts unless explicitly skipped
          if (!skipDependencyCheck) {
            const dependencyResult = resolveDependencies(serverId, pluginId);
            const conflicts = checkDependencyConflicts(serverId, pluginId);
            
            if (!dependencyResult.success) {
              sendResponse(res, 400, {
                success: false,
                error: { 
                  message: 'Dependency resolution failed',
                  details: {
                    dependencies: dependencyResult,
                    conflicts: conflicts
                  }
                }
              });
              return;
            }
            
            if (conflicts.length > 0) {
              sendResponse(res, 400, {
                success: false,
                error: { 
                  message: 'Plugin conflicts detected',
                  details: {
                    dependencies: dependencyResult,
                    conflicts: conflicts
                  }
                }
              });
              return;
            }
          }
          
          // Generate installation ID
          const installationId = `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Start installation process
          setTimeout(() => {
            simulatePluginInstallation(installationId, pluginId, serverId, plugin.name);
          }, 100);
          
          // Broadcast installation started
          broadcastToClients('plugin_installation_started', {
            installationId,
            pluginId,
            serverId,
            pluginName: plugin.name,
            status: 'started',
            timestamp: new Date().toISOString()
          });
          
          sendResponse(res, 200, {
            success: true,
            data: { 
              message: `Starting installation of ${plugin.name}`,
              installation: {
                installationId,
                pluginId,
                serverId,
                status: 'installing',
                startedAt: new Date().toISOString()
              }
            }
          });
        } else {
          sendResponse(res, 404, {
            success: false,
            error: { message: 'Plugin not found' }
          });
        }
        return;
      }

      // Plugin uninstallation
      if (path.startsWith('/api/plugins/') && path.endsWith('/uninstall')) {
        const pluginId = path.split('/')[3];
        const plugin = mockPlugins.find(p => p.id === pluginId);
        const { serverId } = requestBody;
        
        if (plugin) {
          // Remove from server plugins
          const currentPlugins = serverPlugins.get(serverId) || [];
          const updatedPlugins = currentPlugins.filter(id => id !== pluginId);
          serverPlugins.set(serverId, updatedPlugins);
          
          // Remove configuration
          pluginConfigurations.delete(`${serverId}_${pluginId}`);
          
          sendResponse(res, 200, {
            success: true,
            data: { 
              message: `Successfully uninstalled ${plugin.name}`,
              installation: {
                pluginId,
                serverId,
                status: 'uninstalled',
                uninstalledAt: new Date().toISOString()
              }
            }
          });
        } else {
          sendResponse(res, 404, {
            success: false,
            error: { message: 'Plugin not found' }
          });
        }
        return;
      }

      // Plugin configuration update
      if (path.startsWith('/api/servers/') && path.includes('/plugins/') && path.endsWith('/configure')) {
        const pathParts = path.split('/');
        const serverId = pathParts[3];
        const pluginId = pathParts[5];
        const { config, enabled, autoUpdate } = requestBody;
        
        const configKey = `${serverId}_${pluginId}`;
        const existingConfig = pluginConfigurations.get(configKey);
        
        if (existingConfig) {
          const updatedConfig = {
            ...existingConfig,
            enabled: enabled !== undefined ? enabled : existingConfig.enabled,
            autoUpdate: autoUpdate !== undefined ? autoUpdate : existingConfig.autoUpdate,
            config: config ? { ...existingConfig.config, ...config } : existingConfig.config,
            lastConfigured: new Date().toISOString()
          };
          
          pluginConfigurations.set(configKey, updatedConfig);
          
          sendResponse(res, 200, {
            success: true,
            data: { 
              message: 'Plugin configuration updated successfully',
              configuration: updatedConfig
            }
          });
        } else {
          sendResponse(res, 404, {
            success: false,
            error: { message: 'Plugin configuration not found' }
          });
        }
        return;
      }

      // Plugin toggle (enable/disable)
      if (path.startsWith('/api/servers/') && path.includes('/plugins/') && path.endsWith('/toggle')) {
        const pathParts = path.split('/');
        const serverId = pathParts[3];
        const pluginId = pathParts[5];
        
        const configKey = `${serverId}_${pluginId}`;
        const existingConfig = pluginConfigurations.get(configKey);
        
        if (existingConfig) {
          const updatedConfig = {
            ...existingConfig,
            enabled: !existingConfig.enabled,
            lastConfigured: new Date().toISOString()
          };
          
          pluginConfigurations.set(configKey, updatedConfig);
          
          sendResponse(res, 200, {
            success: true,
            data: { 
              message: `Plugin ${updatedConfig.enabled ? 'enabled' : 'disabled'} successfully`,
              configuration: updatedConfig
            }
          });
        } else {
          sendResponse(res, 404, {
            success: false,
            error: { message: 'Plugin configuration not found' }
          });
        }
        return;
      }

      // Plugin update
      if (path.startsWith('/api/plugins/') && path.endsWith('/update')) {
        const pluginId = path.split('/')[3];
        const plugin = mockPlugins.find(p => p.id === pluginId);
        const update = pluginUpdates.get(pluginId);
        const { serverId } = requestBody;
        
        if (plugin && update) {
          // Simulate update process
          const updateId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Update plugin version in mock data
          plugin.version = update.latestVersion;
          plugin.lastUpdated = new Date().toISOString();
          
          // Remove from updates list
          pluginUpdates.delete(pluginId);
          
          // Broadcast update completion
          setTimeout(() => {
            broadcastToClients('plugin_update_complete', {
              updateId,
              pluginId,
              serverId,
              pluginName: plugin.name,
              oldVersion: update.currentVersion,
              newVersion: update.latestVersion,
              status: 'completed',
              timestamp: new Date().toISOString()
            });
          }, 3000);
          
          sendResponse(res, 200, {
            success: true,
            data: { 
              message: `Plugin ${plugin.name} updated successfully`,
              update: {
                updateId,
                pluginId,
                serverId,
                oldVersion: update.currentVersion,
                newVersion: update.latestVersion,
                status: 'updating',
                startedAt: new Date().toISOString()
              }
            }
          });
        } else {
          sendResponse(res, 404, {
            success: false,
            error: { message: 'Plugin or update not found' }
          });
        }
        return;
      }
    });
    return;
  }

  // Handle GET requests
  if (method === 'GET') {
    // Get current user
    if (path === '/api/auth/me') {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);
        if (decoded) {
          const user = mockUsers.find(u => u.id === decoded.userId);
          sendResponse(res, 200, { success: true, data: { user } });
          return;
        }
      }
      sendResponse(res, 401, { success: false, error: { message: 'Unauthorized' } });
      return;
    }

    // Get user servers
    if (path === '/api/servers') {
      sendResponse(res, 200, {
        success: true,
        data: {
          ownedServers: mockServers,
          memberServers: []
        }
      });
      return;
    }

    // Get public communities
    if (path === '/api/communities/public') {
      sendResponse(res, 200, {
        success: true,
        data: {
          communities: mockCommunities
        }
      });
      return;
    }

    // Get user communities
    if (path === '/api/communities/user') {
      sendResponse(res, 200, {
        success: true,
        data: {
          ownedCommunities: [mockCommunities[0]],
          memberCommunities: [mockCommunities[1]]
        }
      });
      return;
    }

    // Get monitoring stats
    if (path === '/api/monitoring/overview') {
      sendResponse(res, 200, {
        success: true,
        data: {
          activeServers: mockServers.filter(s => s.status === 'RUNNING').length,
          totalPlayers: mockServers.reduce((sum, s) => sum + s.playerCount, 0),
          uptime: '99.2%',
          revenue: 1250.00
        }
      });
      return;
    }

    // Get plugins
    if (path === '/api/plugins') {
      const { query } = parsedUrl;
      let plugins = [...mockPlugins];

      // Apply filters based on query parameters
      if (query.category && query.category !== 'all') {
        plugins = plugins.filter(p => p.category.toLowerCase() === query.category.toLowerCase());
      }

      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        plugins = plugins.filter(p =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.author.toLowerCase().includes(searchTerm) ||
          p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      if (query.price && query.price !== 'all') {
        if (query.price === 'free') {
          plugins = plugins.filter(p => p.price === 0);
        } else if (query.price === 'paid') {
          plugins = plugins.filter(p => p.price > 0);
        }
      }

      if (query.verified === 'true') {
        plugins = plugins.filter(p => p.verified);
      }

      if (query.featured === 'true') {
        plugins = plugins.filter(p => p.featured);
      }

      // Sort plugins
      const sortBy = query.sort || 'featured';
      switch (sortBy) {
        case 'downloads':
          plugins.sort((a, b) => b.downloads - a.downloads);
          break;
        case 'rating':
          plugins.sort((a, b) => b.rating - a.rating);
          break;
        case 'price':
          plugins.sort((a, b) => a.price - b.price);
          break;
        case 'name':
          plugins.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
          plugins.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
          break;
        default: // featured
          plugins.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return b.downloads - a.downloads;
          });
      }

      sendResponse(res, 200, {
        success: true,
        data: { plugins }
      });
      return;
    }

    // Get plugin by ID
    if (path.startsWith('/api/plugins/') && path.split('/').length === 4) {
      const pluginId = path.split('/')[3];
      const plugin = mockPlugins.find(p => p.id === pluginId);
      
      if (plugin) {
        sendResponse(res, 200, {
          success: true,
          data: { plugin }
        });
      } else {
        sendResponse(res, 404, {
          success: false,
          error: { message: 'Plugin not found' }
        });
      }
      return;
    }

    // Get plugin categories
    if (path === '/api/plugins/categories') {
      const categories = [...new Set(mockPlugins.map(p => p.category))];
      sendResponse(res, 200, {
        success: true,
        data: { categories }
      });
      return;
    }

    // Get installed plugins for a server
    if (path.startsWith('/api/servers/') && path.endsWith('/plugins')) {
      const serverId = path.split('/')[3];
      const installedPluginIds = serverPlugins.get(serverId) || [];
      
      const installedPlugins = installedPluginIds.map(pluginId => {
        const plugin = mockPlugins.find(p => p.id === pluginId);
        const configKey = `${serverId}_${pluginId}`;
        const config = pluginConfigurations.get(configKey);
        
        return {
          ...plugin,
          installationStatus: 'installed',
          configuration: config || null,
          serverId
        };
      }).filter(Boolean);

      sendResponse(res, 200, {
        success: true,
        data: { plugins: installedPlugins }
      });
      return;
    }

    // Get plugin status/health for a specific server
    if (path.startsWith('/api/servers/') && path.includes('/plugins/') && path.endsWith('/status')) {
      const pathParts = path.split('/');
      const serverId = pathParts[3];
      const pluginId = pathParts[5];
      
      const configKey = `${serverId}_${pluginId}`;
      const config = pluginConfigurations.get(configKey);
      const plugin = mockPlugins.find(p => p.id === pluginId);
      
      if (config && plugin) {
        // Simulate plugin health metrics
        const healthMetrics = {
          status: config.enabled ? 'running' : 'stopped',
          uptime: config.enabled ? Math.floor(Math.random() * 86400) : 0, // Random uptime in seconds
          memoryUsage: config.enabled ? Math.floor(Math.random() * 100) + 50 : 0, // MB
          cpuUsage: config.enabled ? Math.floor(Math.random() * 20) + 5 : 0, // %
          lastRestart: config.lastConfigured,
          errorCount: Math.floor(Math.random() * 3), // Random error count
          warningCount: Math.floor(Math.random() * 5),
          performance: config.enabled ? (Math.random() * 40 + 60).toFixed(1) : '0' // Performance score
        };

        sendResponse(res, 200, {
          success: true,
          data: { 
            plugin: plugin.name,
            health: healthMetrics,
            configuration: config
          }
        });
      } else {
        sendResponse(res, 404, {
          success: false,
          error: { message: 'Plugin not found or not installed on this server' }
        });
      }
      return;
    }

    // Get plugin configuration for a specific server
    if (path.startsWith('/api/servers/') && path.includes('/plugins/') && path.endsWith('/config')) {
      const pathParts = path.split('/');
      const serverId = pathParts[3];
      const pluginId = pathParts[5];
      
      const configKey = `${serverId}_${pluginId}`;
      const config = pluginConfigurations.get(configKey);
      
      if (config) {
        sendResponse(res, 200, {
          success: true,
          data: { configuration: config }
        });
      } else {
        sendResponse(res, 404, {
          success: false,
          error: { message: 'Plugin configuration not found' }
        });
      }
      return;
    }

    // Get active plugin installations
    if (path === '/api/plugins/installations/active') {
      const installations = Array.from(activeInstallations.values());
      sendResponse(res, 200, {
        success: true,
        data: { installations }
      });
      return;
    }

    // Get active installations for a specific server
    if (path.startsWith('/api/servers/') && path.endsWith('/plugins/installations')) {
      const serverId = path.split('/')[3];
      const installations = Array.from(activeInstallations.values())
        .filter(installation => installation.serverId === serverId);
      
      sendResponse(res, 200, {
        success: true,
        data: { installations }
      });
      return;
    }

    // Get plugin updates
    if (path === '/api/plugins/updates') {
      const updates = Array.from(pluginUpdates.values());
      sendResponse(res, 200, {
        success: true,
        data: { updates }
      });
      return;
    }

    // Get updates for a specific plugin
    if (path.startsWith('/api/plugins/') && path.endsWith('/updates')) {
      const pluginId = path.split('/')[3];
      const update = pluginUpdates.get(pluginId);
      
      if (update) {
        sendResponse(res, 200, {
          success: true,
          data: { update }
        });
      } else {
        sendResponse(res, 200, {
          success: true,
          data: { update: null }
        });
      }
      return;
    }

    // Check plugin dependencies for a server
    if (path.startsWith('/api/servers/') && path.includes('/plugins/') && path.endsWith('/dependencies')) {
      const pathParts = path.split('/');
      const serverId = pathParts[3];
      const pluginId = pathParts[5];
      
      const plugin = mockPlugins.find(p => p.id === pluginId);
      if (!plugin) {
        sendResponse(res, 404, {
          success: false,
          error: { message: 'Plugin not found' }
        });
        return;
      }
      
      const dependencyResult = resolveDependencies(serverId, pluginId);
      const conflicts = checkDependencyConflicts(serverId, pluginId);
      
      sendResponse(res, 200, {
        success: true,
        data: {
          plugin: {
            id: pluginId,
            name: plugin.name
          },
          dependencies: dependencyResult,
          conflicts: conflicts,
          canInstall: dependencyResult.success && conflicts.length === 0
        }
      });
      return;
    }

    // Get dependency tree for a plugin
    if (path.startsWith('/api/plugins/') && path.endsWith('/dependencies')) {
      const pluginId = path.split('/')[3];
      const plugin = mockPlugins.find(p => p.id === pluginId);
      
      if (!plugin) {
        sendResponse(res, 404, {
          success: false,
          error: { message: 'Plugin not found' }
        });
        return;
      }
      
      const buildDependencyTree = (id, visited = new Set()) => {
        if (visited.has(id)) return null; // Circular dependency
        visited.add(id);
        
        const p = mockPlugins.find(plugin => plugin.id === id);
        if (!p) return null;
        
        const dependencies = (p.dependencies || []).map(depId => {
          const depTree = buildDependencyTree(depId, new Set(visited));
          return depTree;
        }).filter(Boolean);
        
        return {
          id: p.id,
          name: p.name,
          version: p.version,
          dependencies: dependencies,
          conflicts: p.conflicts || [],
          provides: p.provides || []
        };
      };
      
      const dependencyTree = buildDependencyTree(pluginId);
      
      sendResponse(res, 200, {
        success: true,
        data: { dependencyTree }
      });
      return;
    }

    // Get plugin logs
    if (path.startsWith('/api/servers/') && path.includes('/plugins/') && path.endsWith('/logs')) {
      const pathParts = path.split('/');
      const serverId = pathParts[3];
      const pluginId = pathParts[5];
      const { query } = parsedUrl;
      
      const logKey = `${serverId}_${pluginId}`;
      let logs = pluginLogs.get(logKey) || [];
      
      // Apply filters
      if (query.level) {
        logs = logs.filter(log => log.level === query.level.toUpperCase());
      }
      
      if (query.since) {
        const sinceDate = new Date(query.since);
        logs = logs.filter(log => new Date(log.timestamp) > sinceDate);
      }
      
      // Apply pagination
      const limit = parseInt(query.limit) || 100;
      const offset = parseInt(query.offset) || 0;
      const paginatedLogs = logs.slice(offset, offset + limit);
      
      // Sort by timestamp (newest first)
      paginatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      sendResponse(res, 200, {
        success: true,
        data: {
          logs: paginatedLogs,
          total: logs.length,
          offset: offset,
          limit: limit
        }
      });
      return;
    }

    // Get log summary for a plugin
    if (path.startsWith('/api/servers/') && path.includes('/plugins/') && path.endsWith('/logs/summary')) {
      const pathParts = path.split('/');
      const serverId = pathParts[3];
      const pluginId = pathParts[5];
      
      const logKey = `${serverId}_${pluginId}`;
      const logs = pluginLogs.get(logKey) || [];
      
      const summary = {
        total: logs.length,
        levels: {
          ERROR: logs.filter(log => log.level === 'ERROR').length,
          WARN: logs.filter(log => log.level === 'WARN').length,
          INFO: logs.filter(log => log.level === 'INFO').length,
          DEBUG: logs.filter(log => log.level === 'DEBUG').length
        },
        lastEntry: logs.length > 0 ? logs[logs.length - 1] : null,
        recentErrors: logs.filter(log => log.level === 'ERROR').slice(-5),
        recentWarnings: logs.filter(log => log.level === 'WARN').slice(-5)
      };
      
      sendResponse(res, 200, {
        success: true,
        data: summary
      });
      return;
    }

    // Get logs for all plugins on a server
    if (path.startsWith('/api/servers/') && path.endsWith('/logs')) {
      const serverId = path.split('/')[3];
      const { query } = parsedUrl;
      
      const serverPluginIds = serverPlugins.get(serverId) || [];
      const allLogs = [];
      
      // Collect logs from all plugins on this server
      for (const pluginId of serverPluginIds) {
        const logKey = `${serverId}_${pluginId}`;
        const logs = pluginLogs.get(logKey) || [];
        const plugin = mockPlugins.find(p => p.id === pluginId);
        
        const enrichedLogs = logs.map(log => ({
          ...log,
          pluginId,
          pluginName: plugin?.name || 'Unknown Plugin'
        }));
        
        allLogs.push(...enrichedLogs);
      }
      
      // Apply filters
      let filteredLogs = allLogs;
      
      if (query.level) {
        filteredLogs = filteredLogs.filter(log => log.level === query.level.toUpperCase());
      }
      
      if (query.plugin) {
        filteredLogs = filteredLogs.filter(log => log.pluginId === query.plugin);
      }
      
      if (query.since) {
        const sinceDate = new Date(query.since);
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) > sinceDate);
      }
      
      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Apply pagination
      const limit = parseInt(query.limit) || 100;
      const offset = parseInt(query.offset) || 0;
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);
      
      sendResponse(res, 200, {
        success: true,
        data: {
          logs: paginatedLogs,
          total: filteredLogs.length,
          offset: offset,
          limit: limit
        }
      });
      return;
    }
  }

  // Plugin backup endpoints
  if (method === 'GET' && path.startsWith('/api/servers/') && path.includes('/backups')) {
    const pathParts = path.split('/');
    const serverId = pathParts[3];
    
    // Get all backups for a server
    const serverBackups = pluginBackups.get(serverId) || [];
    
    sendResponse(res, 200, {
      success: true,
      data: {
        backups: serverBackups,
        total: serverBackups.length
      }
    });
    return;
  }

  if (method === 'POST' && path.startsWith('/api/servers/') && path.includes('/backups')) {
    const pathParts = path.split('/');
    const serverId = pathParts[3];
    
    const { name, description, type, pluginIds, includeConfigurations, includeData } = requestBody;
    
    // Create new backup
    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const server = mockServers.find(s => s.id === serverId);
    
    if (server) {
      const pluginNames = pluginIds?.map(id => {
        const plugin = mockPlugins.find(p => p.id === id);
        return plugin?.name || 'Unknown Plugin';
      }) || [];
      
      const newBackup = {
        id: backupId,
        name: name || `Backup ${new Date().toLocaleDateString()}`,
        description: description || 'Manual backup',
        type: type || 'full',
        serverId,
        serverName: server.name,
        pluginIds: pluginIds || [],
        pluginNames,
        size: Math.floor(Math.random() * 200 * 1024 * 1024) + 10 * 1024 * 1024, // 10MB-200MB
        createdAt: new Date().toISOString(),
        createdBy: 'admin',
        status: 'completed',
        metadata: {
          pluginCount: pluginIds?.length || 0,
          configurationCount: includeConfigurations ? (pluginIds?.length || 0) * 3 : 0,
          dataSize: includeData ? Math.floor(Math.random() * 100 * 1024 * 1024) : 0,
          checksum: `sha256:${Math.random().toString(36).substr(2, 16)}`,
          version: '1.0.0'
        }
      };
      
      const serverBackups = pluginBackups.get(serverId) || [];
      serverBackups.push(newBackup);
      pluginBackups.set(serverId, serverBackups);
      
      // Broadcast backup created
      broadcast({
        type: 'backup_created',
        data: {
          backup: newBackup,
          serverId,
          timestamp: new Date().toISOString()
        }
      });
      
      sendResponse(res, 201, {
        success: true,
        data: {
          message: 'Backup created successfully',
          backup: newBackup
        }
      });
    } else {
      sendResponse(res, 404, {
        success: false,
        error: { message: 'Server not found' }
      });
    }
    return;
  }

  if (method === 'POST' && path.startsWith('/api/servers/') && path.includes('/backups/') && path.endsWith('/restore')) {
    const pathParts = path.split('/');
    const serverId = pathParts[3];
    const backupId = pathParts[5];
    
    const { restoreConfigurations, restoreData, overwriteExisting } = requestBody;
    
    const serverBackups = pluginBackups.get(serverId) || [];
    const backup = serverBackups.find(b => b.id === backupId);
    
    if (backup) {
      // Simulate restore process
      const restoreId = `restore_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Broadcast restore started
      broadcast({
        type: 'backup_restore_started',
        data: {
          restoreId,
          backupId,
          serverId,
          backup,
          options: { restoreConfigurations, restoreData, overwriteExisting },
          timestamp: new Date().toISOString()
        }
      });
      
      // Simulate restore completion after 8 seconds
      setTimeout(() => {
        broadcast({
          type: 'backup_restore_completed',
          data: {
            restoreId,
            backupId,
            serverId,
            success: true,
            timestamp: new Date().toISOString()
          }
        });
      }, 8000);
      
      sendResponse(res, 200, {
        success: true,
        data: {
          message: 'Backup restore started',
          restoreId,
          backup
        }
      });
    } else {
      sendResponse(res, 404, {
        success: false,
        error: { message: 'Backup not found' }
      });
    }
    return;
  }

  if (method === 'DELETE' && path.startsWith('/api/servers/') && path.includes('/backups/')) {
    const pathParts = path.split('/');
    const serverId = pathParts[3];
    const backupId = pathParts[5];
    
    const serverBackups = pluginBackups.get(serverId) || [];
    const backupIndex = serverBackups.findIndex(b => b.id === backupId);
    
    if (backupIndex !== -1) {
      const deletedBackup = serverBackups.splice(backupIndex, 1)[0];
      pluginBackups.set(serverId, serverBackups);
      
      // Broadcast backup deleted
      broadcast({
        type: 'backup_deleted',
        data: {
          backupId,
          serverId,
          backup: deletedBackup,
          timestamp: new Date().toISOString()
        }
      });
      
      sendResponse(res, 200, {
        success: true,
        data: {
          message: 'Backup deleted successfully',
          backup: deletedBackup
        }
      });
    } else {
      sendResponse(res, 404, {
        success: false,
        error: { message: 'Backup not found' }
      });
    }
    return;
  }

  if (method === 'GET' && path.startsWith('/api/servers/') && path.includes('/backups/') && path.endsWith('/download')) {
    const pathParts = path.split('/');
    const serverId = pathParts[3];
    const backupId = pathParts[5];
    
    const serverBackups = pluginBackups.get(serverId) || [];
    const backup = serverBackups.find(b => b.id === backupId);
    
    if (backup) {
      // Return download URL or file stream
      sendResponse(res, 200, {
        success: true,
        data: {
          downloadUrl: `/api/downloads/backup/${backupId}`,
          filename: `${backup.name}.backup`,
          size: backup.size,
          expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
        }
      });
    } else {
      sendResponse(res, 404, {
        success: false,
        error: { message: 'Backup not found' }
      });
    }
    return;
  }

  // 404 for unknown routes
  sendResponse(res, 404, { success: false, error: { message: 'Not found' } });
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  console.log('🔌 New WebSocket connection established');
  connectedClients.add(ws);

  // Send initial data to new client
  ws.send(JSON.stringify({
    type: 'connection_established',
    data: {
      message: 'Connected to HomeHost real-time server',
      timestamp: new Date().toISOString()
    }
  }));

  // Send current server metrics
  ws.send(JSON.stringify({
    type: 'server_metrics',
    data: {
      servers: mockServers,
      timestamp: new Date().toISOString()
    }
  }));

  ws.on('close', () => {
    console.log('🔌 WebSocket connection closed');
    connectedClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('🔌 WebSocket error:', error);
    connectedClients.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Simple HomeHost API Server running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
  console.log('');
  console.log('📋 Test Credentials:');
  console.log('   Email: test@example.com');
  console.log('   Password: password');
  console.log('');
  console.log('🔗 Endpoints:');
  console.log('   Health: http://localhost:3002/health');
  console.log('   Login: POST http://localhost:3002/api/auth/login');
  console.log('   Servers: GET http://localhost:3002/api/servers');
  console.log('   Communities: GET http://localhost:3002/api/communities/public');
  console.log('   WebSocket: ws://localhost:3002');
});

// Start real-time data simulation
setInterval(simulateServerMetrics, 5000); // Update server metrics every 5 seconds
setInterval(simulateActivityFeed, 15000); // Add activity every 15 seconds

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});