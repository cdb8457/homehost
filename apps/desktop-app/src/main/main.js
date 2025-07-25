const { app, BrowserWindow, ipcMain, Menu, shell, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

// Import our custom modules
const GameServerManager = require('./services/GameServerManager');
const SteamService = require('./services/SteamService');
const SteamIntegration = require('./services/SteamIntegration');
const SystemMonitor = require('./services/SystemMonitor');
const CloudSync = require('./services/CloudSync');
const AuthenticationService = require('./services/AuthenticationService');
const SystemOptimization = require('./services/SystemOptimization');
const ServerMonitor = require('./services/ServerMonitor');
const SignalRService = require('./services/SignalRService');
const CommunityManager = require('./services/CommunityManager');
const PluginManager = require('./services/PluginManager');
const RevenueDashboard = require('./services/RevenueDashboard');
const PlayerEngagement = require('./services/PlayerEngagement');
const PluginMarketplaceRevenue = require('./services/PluginMarketplaceRevenue');
const CommunityGrowthAnalytics = require('./services/CommunityGrowthAnalytics');
const Web3Integration = require('./services/Web3Integration');
const ErrorHandler = require('./services/ErrorHandler');
const SecurityManager = require('./services/SecurityManager');
const SecurityAuditor = require('./services/SecurityAuditor');
const RateLimitingService = require('./services/RateLimitingService');
const PerformanceMonitor = require('./services/PerformanceMonitor');
const DeploymentService = require('./services/DeploymentService');
const HealthCheckService = require('./services/HealthCheckService');

// Initialize persistent storage
const store = new Store();

// Keep a global reference of the window object
let mainWindow;
let gameServerManager;
let steamService;
let steamIntegration;
let systemMonitor;
let cloudSync;
let authenticationService;
let systemOptimization;
let serverMonitor;
let signalRService;
let communityManager;
let pluginManager;
let revenueDashboard;
let playerEngagement;
let pluginMarketplaceRevenue;
let communityGrowthAnalytics;
let web3Integration;
let errorHandler;
let securityManager;
let securityAuditor;
let rateLimitingService;
let performanceMonitor;
let deploymentService;
let healthCheckService;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3012' 
    : `file://${path.join(__dirname, '../../build/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(async () => {
  createWindow();
  createMenu();
  
  // Initialize services
  try {
    // Initialize error handler first to catch initialization errors
    errorHandler = new ErrorHandler(store, console);
    
    // Initialize security manager with error handler
    securityManager = new SecurityManager(store, console);
    
    // Initialize security auditor with security manager
    securityAuditor = new SecurityAuditor(store, console, securityManager);
    
    // Initialize rate limiting service with security manager
    rateLimitingService = new RateLimitingService(securityManager, console);
    
    // Initialize performance monitor
    performanceMonitor = new PerformanceMonitor(store, console);
    
    // Initialize deployment service
    deploymentService = new DeploymentService(store, console);
    
    serverMonitor = new ServerMonitor();
    gameServerManager = new GameServerManager(store, serverMonitor);
    steamService = new SteamService(store);
    steamIntegration = new SteamIntegration(store, steamService);
    systemMonitor = new SystemMonitor();
    authenticationService = new AuthenticationService(store);
    cloudSync = new CloudSync(store, authenticationService);
    systemOptimization = new SystemOptimization(store);
    signalRService = new SignalRService(store, rateLimitingService);
    communityManager = new CommunityManager(store, cloudSync);
    pluginManager = new PluginManager(store, gameServerManager, communityManager);
    revenueDashboard = new RevenueDashboard(store, communityManager, pluginManager);
    
    // Initialize player engagement
    playerEngagement = new PlayerEngagement(store, revenueDashboard, communityManager);
    
    // Initialize plugin marketplace revenue
    pluginMarketplaceRevenue = new PluginMarketplaceRevenue(store, revenueDashboard, pluginManager);
    
    // Initialize community growth analytics
    communityGrowthAnalytics = new CommunityGrowthAnalytics(store, communityManager, serverMonitor, revenueDashboard);
    
    // Initialize Web3 integration
    web3Integration = new Web3Integration(store, communityManager, revenueDashboard);

    // Initialize health check service with all services
    healthCheckService = new HealthCheckService(store, console, {
      securityManager,
      performanceMonitor,
      signalRService,
      rateLimitingService,
      deploymentService
    });

    // Start system monitoring
    systemMonitor.startMonitoring();
    serverMonitor.startMonitoring();
    
    // Initialize authentication service
    await authenticationService.initialize();
    
    // Initialize community manager
    await communityManager.initialize();
    
    // Initialize plugin manager
    await pluginManager.initialize();
    
    // Initialize revenue dashboard
    await revenueDashboard.initialize();
    
    // Initialize player engagement
    await playerEngagement.initialize();
    
    // Initialize plugin marketplace revenue
    await pluginMarketplaceRevenue.initialize();
    
    // Initialize community growth analytics
    await communityGrowthAnalytics.initialize();
    
    // Initialize Web3 integration
    await web3Integration.initialize();
    
    // Start SignalR service for remote access
    await signalRService.startServer();
    
    // Set up SignalR event listeners
    setupSignalRListeners();
    
    // Initialize Steam if configured
    const steamPath = store.get('steamPath');
    if (steamPath) {
      await steamService.initialize(steamPath);
      await steamIntegration.initialize();
    }

    console.log('HomeHost Desktop services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    
    // Use error handler if available, otherwise fallback to dialog
    if (errorHandler) {
      await errorHandler.handleError(error, {
        service: 'main',
        operation: 'service_initialization',
        critical: true
      });
    } else {
      dialog.showErrorBox('Initialization Error', 
        `Failed to start HomeHost services: ${error.message}`);
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  // Stop all services before quitting
  if (systemMonitor) {
    systemMonitor.stopMonitoring();
  }
  
  if (gameServerManager) {
    gameServerManager.stopAllServers();
  }
  
  if (signalRService) {
    await signalRService.stopServer();
  }
  
  if (communityManager) {
    await communityManager.shutdown();
  }
  
  if (pluginManager) {
    await pluginManager.shutdown();
  }
  
  if (revenueDashboard) {
    await revenueDashboard.shutdown();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create application menu
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('open-settings');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Servers',
      submenu: [
        {
          label: 'Deploy New Server',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('deploy-server');
          }
        },
        {
          label: 'Stop All Servers',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            if (gameServerManager) {
              gameServerManager.stopAllServers();
            }
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About HomeHost',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About HomeHost',
              message: 'HomeHost Desktop',
              detail: 'Version 1.0.0\nGame server hosting made simple.'
            });
          }
        },
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://docs.homehost.io');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Setup SignalR event listeners
function setupSignalRListeners() {
  if (!signalRService) return;

  // Handle remote commands from web clients
  signalRService.on('remote-command', async (data) => {
    const { clientId, command, serverId, params, device } = data;
    
    try {
      let response = { success: false, error: 'Unknown command' };
      
      switch (command) {
        case 'start-server':
          if (gameServerManager) {
            const result = await gameServerManager.startServer(serverId);
            response = { success: true, data: result };
          }
          break;
          
        case 'stop-server':
          if (gameServerManager) {
            const result = await gameServerManager.stopServer(serverId);
            response = { success: true, data: result };
          }
          break;
          
        case 'get-servers':
          if (gameServerManager) {
            const servers = gameServerManager.getServers();
            response = { success: true, data: servers };
          }
          break;
          
        case 'get-server-logs':
          if (gameServerManager) {
            const logs = gameServerManager.getServerLogs(serverId, params?.limit || 100);
            response = { success: true, data: logs };
          }
          break;
          
        case 'send-server-command':
          if (gameServerManager) {
            const result = await gameServerManager.sendServerCommand(serverId, params?.command);
            response = { success: true, data: result };
          }
          break;
          
        case 'get-system-info':
          if (systemMonitor) {
            const systemInfo = await systemMonitor.getSystemInfo();
            response = { success: true, data: systemInfo };
          }
          break;
          
        case 'get-server-metrics':
          if (serverMonitor) {
            const metrics = serverMonitor.getServerMetrics(serverId);
            response = { success: true, data: metrics };
          }
          break;
          
        default:
          response = { success: false, error: `Unknown command: ${command}` };
      }
      
      signalRService.sendCommandResponse(clientId, {
        command,
        serverId,
        response,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Remote command error:', error);
      signalRService.sendCommandResponse(clientId, {
        command,
        serverId,
        response: { success: false, error: error.message },
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle status requests
  signalRService.on('status-requested', ({ socket }) => {
    if (gameServerManager && systemMonitor) {
      const servers = gameServerManager.getServers();
      systemMonitor.getSystemInfo().then(systemInfo => {
        signalRService.broadcastServerStatus(servers, systemInfo);
      });
    }
  });

  // Forward server monitoring events to SignalR clients
  if (serverMonitor) {
    serverMonitor.on('server-metrics-updated', (data) => {
      signalRService.broadcastServerMetrics(data.serverId, data.metrics);
    });

    serverMonitor.on('performance-alert', (data) => {
      signalRService.broadcastPerformanceAlert(data.serverId, data.alert);
    });
  }

  // Forward server logs to SignalR clients
  if (gameServerManager) {
    gameServerManager.on('server-log', (data) => {
      signalRService.broadcastServerLog(data.serverId, data.log);
    });
  }
  
  console.log('SignalR event listeners configured');
}

// IPC handlers for renderer process communication
ipcMain.handle('get-system-info', async () => {
  return systemMonitor ? await systemMonitor.getSystemInfo() : null;
});

ipcMain.handle('get-servers', async () => {
  return gameServerManager ? gameServerManager.getServers() : [];
});

ipcMain.handle('deploy-server', async (event, gameConfig) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.deployServer(gameConfig);
  } catch (error) {
    if (errorHandler) {
      await errorHandler.handleError(error, {
        service: 'GameServerManager',
        operation: 'deploy_server',
        context: { gameConfig }
      });
    }
    throw error;
  }
});

ipcMain.handle('stop-server', async (event, serverId) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.stopServer(serverId);
  } catch (error) {
    if (errorHandler) {
      await errorHandler.handleError(error, {
        service: 'GameServerManager',
        operation: 'stop_server',
        context: { serverId }
      });
    }
    throw error;
  }
});

ipcMain.handle('start-server', async (event, serverId) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.startServer(serverId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-steam-games', async () => {
  return steamIntegration ? steamIntegration.getGameLibrary() : [];
});

ipcMain.handle('install-steam-game', async (event, gameId, installPath) => {
  try {
    if (!steamIntegration) throw new Error('Steam integration not initialized');
    return await steamIntegration.installGame(gameId, installPath);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('uninstall-steam-game', async (event, gameId) => {
  try {
    if (!steamIntegration) throw new Error('Steam integration not initialized');
    return await steamIntegration.uninstallGame(gameId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('update-steam-game', async (event, gameId) => {
  try {
    if (!steamIntegration) throw new Error('Steam integration not initialized');
    return await steamIntegration.updateGame(gameId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-steam-downloads', async () => {
  if (!steamIntegration) return { queue: [], active: [] };
  return {
    queue: steamIntegration.getDownloadQueue(),
    active: steamIntegration.getActiveDownloads()
  };
});

ipcMain.handle('cancel-steam-download', async (event, gameId) => {
  try {
    if (!steamIntegration) throw new Error('Steam integration not initialized');
    return await steamIntegration.cancelDownload(gameId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('check-game-updates', async () => {
  try {
    if (!steamIntegration) throw new Error('Steam integration not initialized');
    return await steamIntegration.checkForUpdates();
  } catch (error) {
    throw error;
  }
});

// Additional Steam service handlers
ipcMain.handle('get-steamcmd-health', async () => {
  try {
    if (!steamService) throw new Error('Steam service not initialized');
    return await steamService.checkSteamCMDHealth();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-active-installs', async () => {
  try {
    if (!steamService) throw new Error('Steam service not initialized');
    return steamService.getActiveInstalls();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-install-progress', async (event, appId) => {
  try {
    if (!steamService) throw new Error('Steam service not initialized');
    return steamService.getInstallProgress(appId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cancel-installation', async (event, appId) => {
  try {
    if (!steamService) throw new Error('Steam service not initialized');
    return await steamService.cancelInstallation(appId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('download-steam-game-list', async () => {
  try {
    if (!steamService) throw new Error('Steam service not initialized');
    return await steamService.downloadGameList();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('configure-steam', async (event, steamPath) => {
  try {
    if (!steamService) throw new Error('Steam service not initialized');
    store.set('steamPath', steamPath);
    return await steamService.initialize(steamPath);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('sync-with-cloud', async (event, data) => {
  try {
    if (!cloudSync) throw new Error('Cloud sync service not initialized');
    return await cloudSync.syncData(data);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('select-file', async (event, filters = []) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: filters
  });
  return result.filePaths[0];
});

// Handle app updates and notifications
ipcMain.handle('show-notification', (event, { title, body }) => {
  const notification = new Notification({ title, body });
  notification.show();
});

// System Optimization IPC handlers
ipcMain.handle('get-system-specs', async () => {
  try {
    if (!systemOptimization) throw new Error('System optimization service not initialized');
    return await systemOptimization.getSystemSpecs();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-optimization-recommendations', async (event, gameId, targetPlayerCount) => {
  try {
    if (!systemOptimization) throw new Error('System optimization service not initialized');
    return await systemOptimization.getOptimizationRecommendations(gameId, targetPlayerCount);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('apply-optimizations', async (event, serverConfig, recommendations) => {
  try {
    if (!systemOptimization) throw new Error('System optimization service not initialized');
    return systemOptimization.applyOptimizations(serverConfig, recommendations);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-system-load', async () => {
  try {
    if (!systemOptimization) throw new Error('System optimization service not initialized');
    return await systemOptimization.getCurrentSystemLoad();
  } catch (error) {
    throw error;
  }
});

// Server Management IPC handlers
ipcMain.handle('get-server-logs', async (event, serverId, limit) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return gameServerManager.getServerLogs(serverId, limit);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('clear-server-logs', async (event, serverId) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return gameServerManager.clearServerLogs(serverId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-log-files', async (event, serverId) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.getLogFiles(serverId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('send-server-command', async (event, serverId, command) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.sendServerCommand(serverId, command);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-server-config', async (event, serverId) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.getServerConfig(serverId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('read-config-file', async (event, serverId, filePath) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.readConfigFile(serverId, filePath);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('write-config-file', async (event, serverId, filePath, content) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.writeConfigFile(serverId, filePath, content);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('create-server-backup', async (event, serverId, name) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.createServerBackup(serverId, name);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-server-backups', async (event, serverId) => {
  try {
    if (!gameServerManager) throw new Error('Game server manager not initialized');
    return await gameServerManager.getServerBackups(serverId);
  } catch (error) {
    throw error;
  }
});

// Server Monitoring IPC handlers
ipcMain.handle('get-server-metrics', async (event, serverId) => {
  try {
    if (!serverMonitor) throw new Error('Server monitor not initialized');
    return serverMonitor.getServerMetrics(serverId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-all-server-metrics', async () => {
  try {
    if (!serverMonitor) throw new Error('Server monitor not initialized');
    return serverMonitor.getAllServerMetrics();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-alert-history', async (event, serverId, limit) => {
  try {
    if (!serverMonitor) throw new Error('Server monitor not initialized');
    return serverMonitor.getAlertHistory(serverId, limit);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('update-alert-thresholds', async (event, thresholds) => {
  try {
    if (!serverMonitor) throw new Error('Server monitor not initialized');
    serverMonitor.updateAlertThresholds(thresholds);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-monitoring-status', async () => {
  try {
    if (!serverMonitor) throw new Error('Server monitor not initialized');
    return serverMonitor.getMonitoringStatus();
  } catch (error) {
    throw error;
  }
});

// SignalR/Remote Access IPC handlers
ipcMain.handle('get-signalr-status', async () => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    return signalRService.getStatus();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-connected-clients', async () => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    return signalRService.getConnectedClients();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-active-pairings', async () => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    return signalRService.getActiveParings();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('create-device-pairing', async (event, deviceInfo) => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    
    const pairingCode = signalRService.generatePairingCode();
    const pairingId = require('uuid').v4();
    
    signalRService.devicePairings.set(pairingId, {
      id: pairingId,
      deviceName: deviceInfo.deviceName || 'Unknown Device',
      deviceType: deviceInfo.deviceType || 'web',
      pairingCode,
      created: new Date(),
      expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      used: false
    });

    return {
      pairingId,
      pairingCode,
      expiresIn: 300000 // 5 minutes in milliseconds
    };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revoke-device-pairing', async (event, pairingId) => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    
    const deleted = signalRService.devicePairings.delete(pairingId);
    return { success: deleted };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('disconnect-client', async (event, clientId) => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    
    const socket = signalRService.io?.sockets.sockets.get(clientId);
    if (socket) {
      socket.disconnect(true);
      return { success: true };
    }
    
    return { success: false, error: 'Client not found' };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('get-device-info', async () => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    
    return {
      deviceId: signalRService.getDeviceId(),
      deviceName: signalRService.getDeviceName(),
      platform: process.platform,
      version: '1.0.0'
    };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('set-device-name', async (event, name) => {
  try {
    if (!signalRService) throw new Error('SignalR service not initialized');
    
    signalRService.setDeviceName(name);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

// Setup server monitor event forwarding to renderer
if (serverMonitor) {
  serverMonitor.on('server-metrics-updated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('server-metrics-updated', data);
    }
  });

  serverMonitor.on('performance-alert', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-alert', data);
    }
  });

  serverMonitor.on('server-health-updated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('server-health-updated', data);
    }
  });

  serverMonitor.on('server-health-critical', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('server-health-critical', data);
    }
  });

  serverMonitor.on('auto-restart-triggered', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auto-restart-triggered', data);
    }
  });
}

// Community Manager IPC handlers - Epic 2: Community Infrastructure
ipcMain.handle('community-manager:get-communities', async () => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return communityManager.getCommunities();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:create-community', async (event, communityData) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.createCommunity(communityData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:update-community', async (event, { communityId, updateData }) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.updateCommunity(communityId, updateData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:add-server', async (event, { serverId, communityId, serverData }) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.addServerToCommunity(serverId, communityId, serverData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:get-players', async () => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return communityManager.getPlayerDatabase();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:ban-player', async (event, { playerId, communityId, reason }) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.banPlayerFromCommunity(playerId, communityId, reason);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:update-reputation', async (event, { playerId, action, value }) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.updatePlayerReputation(playerId, action, value);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:get-social-activity', async () => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return communityManager.getSocialActivity();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:get-recommendations', async (event, userPreferences) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.getRecommendedCommunities(userPreferences);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:get-analytics', async (event, communityId) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return communityManager.getAnalytics(communityId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:get-insights', async (event, communityId) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.getCommunityInsights(communityId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:create-invitation', async (event, { communityId, ...invitationData }) => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return await communityManager.createInvitation(communityId, invitationData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-manager:get-invitations', async () => {
  try {
    if (!communityManager) throw new Error('Community manager not initialized');
    return communityManager.getInvitations();
  } catch (error) {
    throw error;
  }
});

// Setup community manager event forwarding to renderer
if (communityManager) {
  communityManager.on('community-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('community-created', data);
    }
  });

  communityManager.on('community-updated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('community-updated', data);
    }
  });

  communityManager.on('player-banned', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('player-banned', data);
    }
  });

  communityManager.on('social-activity', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('social-activity', data);
    }
  });

  communityManager.on('analytics-updated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('analytics-updated', data);
    }
  });

  communityManager.on('invitation-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('invitation-created', data);
    }
  });
}

// Plugin Manager IPC handlers - Epic 3: Plugin Ecosystem Foundation
ipcMain.handle('plugin-manager:get-installed', async () => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return pluginManager.getInstalledPlugins();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:get-available', async () => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return pluginManager.getAvailablePlugins();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:get-running', async () => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return pluginManager.getRunningPlugins();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:install', async (event, { pluginId, serverId }) => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return await pluginManager.installPlugin(pluginId, serverId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:uninstall', async (event, { pluginId }) => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return await pluginManager.uninstallPlugin(pluginId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:start', async (event, { pluginId }) => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return await pluginManager.startPlugin(pluginId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:stop', async (event, { pluginId }) => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return await pluginManager.stopPlugin(pluginId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:get-by-id', async (event, { pluginId }) => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return pluginManager.getPluginById(pluginId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-manager:get-by-category', async (event, { category }) => {
  try {
    if (!pluginManager) throw new Error('Plugin manager not initialized');
    return pluginManager.getPluginsByCategory(category);
  } catch (error) {
    throw error;
  }
});

// Setup plugin manager event forwarding to renderer
if (pluginManager) {
  pluginManager.on('plugin-installed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-installed', data);
    }
  });

  pluginManager.on('plugin-uninstalled', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-uninstalled', data);
    }
  });

  pluginManager.on('plugin-started', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-started', data);
    }
  });

  pluginManager.on('plugin-stopped', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-stopped', data);
    }
  });

  pluginManager.on('plugin-update-available', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-update-available', data);
    }
  });

  pluginManager.on('plugin-log', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-log', data);
    }
  });

  pluginManager.on('plugin-resource-warning', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-resource-warning', data);
    }
  });
}

// Revenue Dashboard IPC handlers - Epic 4: Monetization & Analytics
ipcMain.handle('revenue-dashboard:get-summary', async () => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return revenueDashboard.getDashboardSummary();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:get-streams', async () => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return revenueDashboard.getRevenueStreams();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:create-stream', async (event, streamData) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return await revenueDashboard.createRevenueStream(streamData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:update-stream', async (event, { streamId, updateData }) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return await revenueDashboard.updateRevenueStream(streamId, updateData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:get-transactions', async (event, { limit = 100 } = {}) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return revenueDashboard.getTransactions(limit);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:process-transaction', async (event, transactionData) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return await revenueDashboard.processTransaction(transactionData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:get-subscriptions', async () => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return revenueDashboard.getSubscriptions();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:create-subscription', async (event, subscriptionData) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return await revenueDashboard.createSubscription(subscriptionData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:cancel-subscription', async (event, { subscriptionId, reason }) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return await revenueDashboard.cancelSubscription(subscriptionId, reason);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:get-processors', async () => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return revenueDashboard.getActiveProcessors();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:configure-processor', async (event, { processorName, config }) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    return await revenueDashboard.configurePaymentProcessor(processorName, config);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('revenue-dashboard:generate-report', async (event, reportType) => {
  try {
    if (!revenueDashboard) throw new Error('Revenue dashboard not initialized');
    
    switch (reportType) {
      case 'daily':
        return await revenueDashboard.generateDailyReport();
      case 'monthly':
        return await revenueDashboard.generateMonthlyReport();
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  } catch (error) {
    throw error;
  }
});

// Setup revenue dashboard event forwarding to renderer
if (revenueDashboard) {
  revenueDashboard.on('transaction-completed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('transaction-completed', data);
    }
  });

  revenueDashboard.on('subscription-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('subscription-created', data);
    }
  });

  revenueDashboard.on('subscription-cancelled', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('subscription-cancelled', data);
    }
  });

  revenueDashboard.on('revenue-stream-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('revenue-stream-created', data);
    }
  });

  revenueDashboard.on('analytics-updated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('analytics-updated', data);
    }
  });

  revenueDashboard.on('daily-report-generated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('daily-report-generated', data);
    }
  });

  revenueDashboard.on('monthly-report-generated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('monthly-report-generated', data);
    }
  });
}

// Player Engagement IPC Handlers
ipcMain.handle('player-engagement:get-vip-members', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.getVipMembers();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:get-cosmetics', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.getCosmeticRewards();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:get-merchandise', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.getMerchandise();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:get-events', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.getEvents();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:get-donations', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.getDonations();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:get-vip-tiers', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.vipTiers;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:get-cosmetic-categories', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.cosmeticCategories;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:get-event-types', async () => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return playerEngagement.eventTypes;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:purchase-vip', async (event, purchaseData) => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return await playerEngagement.purchaseVipMembership(purchaseData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:purchase-cosmetic', async (event, purchaseData) => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return await playerEngagement.purchaseCosmetic(purchaseData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:create-event', async (event, eventData) => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return await playerEngagement.createEvent(eventData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:purchase-ticket', async (event, ticketData) => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return await playerEngagement.purchaseEventTicket(ticketData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('player-engagement:process-donation', async (event, donationData) => {
  try {
    if (!playerEngagement) throw new Error('Player engagement not initialized');
    return await playerEngagement.processDonation(donationData);
  } catch (error) {
    throw error;
  }
});

// Plugin Marketplace Revenue IPC Handlers
ipcMain.handle('plugin-marketplace:get-plugins', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getPlugins();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-developers', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getDevelopers();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-sales', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getSales();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-subscriptions', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getSubscriptions();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-analytics', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getAnalytics();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-payouts', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getPayouts();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-pricing-tiers', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getPricingTiers();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-supported-currencies', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getSupportedCurrencies();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-quality-incentives', async () => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return pluginMarketplaceRevenue.getQualityIncentives();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:register-plugin', async (event, pluginData) => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return await pluginMarketplaceRevenue.registerPlugin(pluginData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:approve-plugin', async (event, { pluginId, reviewNotes }) => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return await pluginMarketplaceRevenue.approvePlugin(pluginId, reviewNotes);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:reject-plugin', async (event, { pluginId, reason }) => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return await pluginMarketplaceRevenue.rejectPlugin(pluginId, reason);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:purchase-plugin', async (event, purchaseData) => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return await pluginMarketplaceRevenue.purchasePlugin(purchaseData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:register-developer', async (event, developerData) => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return await pluginMarketplaceRevenue.registerDeveloper(developerData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('plugin-marketplace:get-developer-dashboard', async (event, developerId) => {
  try {
    if (!pluginMarketplaceRevenue) throw new Error('Plugin marketplace not initialized');
    return await pluginMarketplaceRevenue.getDeveloperDashboard(developerId);
  } catch (error) {
    throw error;
  }
});

// Setup Player Engagement event forwarding
if (playerEngagement) {
  playerEngagement.on('vip-membership-purchased', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('vip-membership-purchased', data);
    }
  });

  playerEngagement.on('vip-membership-renewed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('vip-membership-renewed', data);
    }
  });

  playerEngagement.on('vip-membership-expired', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('vip-membership-expired', data);
    }
  });

  playerEngagement.on('cosmetic-purchased', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('cosmetic-purchased', data);
    }
  });

  playerEngagement.on('event-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('event-created', data);
    }
  });

  playerEngagement.on('event-ticket-purchased', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('event-ticket-purchased', data);
    }
  });

  playerEngagement.on('event-started', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('event-started', data);
    }
  });

  playerEngagement.on('event-completed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('event-completed', data);
    }
  });

  playerEngagement.on('donation-processed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('donation-processed', data);
    }
  });
}

// Setup Plugin Marketplace event forwarding
if (pluginMarketplaceRevenue) {
  pluginMarketplaceRevenue.on('marketplace-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('marketplace-initialized', data);
    }
  });

  pluginMarketplaceRevenue.on('plugin-registered', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-registered', data);
    }
  });

  pluginMarketplaceRevenue.on('plugin-approved', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-approved', data);
    }
  });

  pluginMarketplaceRevenue.on('plugin-rejected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-rejected', data);
    }
  });

  pluginMarketplaceRevenue.on('plugin-purchased', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-purchased', data);
    }
  });

  pluginMarketplaceRevenue.on('plugin-purchase-failed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('plugin-purchase-failed', data);
    }
  });

  pluginMarketplaceRevenue.on('developer-registered', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('developer-registered', data);
    }
  });

  pluginMarketplaceRevenue.on('subscription-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('subscription-created', data);
    }
  });

  pluginMarketplaceRevenue.on('subscription-renewed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('subscription-renewed', data);
    }
  });

  pluginMarketplaceRevenue.on('subscription-payment-failed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('subscription-payment-failed', data);
    }
  });

  pluginMarketplaceRevenue.on('developer-payout-processed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('developer-payout-processed', data);
    }
  });

  pluginMarketplaceRevenue.on('daily-analytics-generated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('daily-analytics-generated', data);
    }
  });

  pluginMarketplaceRevenue.on('weekly-payouts-processed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('weekly-payouts-processed', data);
    }
  });
}

// Community Growth Analytics IPC Handlers
ipcMain.handle('community-analytics:get-players', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getPlayers();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-sessions', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getSessions();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-events', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getEvents();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-experiments', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getExperiments();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-insights', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getInsights();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-benchmarks', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getBenchmarks();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-cohorts', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getCohorts();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-server-metrics', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.getServerUtilizationMetrics();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-lifecycle-stages', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getLifecycleStages();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-benchmark-categories', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getBenchmarkCategories();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:get-experiment-types', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return communityGrowthAnalytics.getExperimentTypes();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:track-player', async (event, { playerId, userData }) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.trackPlayer(playerId, userData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:track-action', async (event, { playerId, action, metadata }) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.trackPlayerAction({ playerId, action, metadata });
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:start-session', async (event, { playerId, serverId, sessionData }) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.trackSessionStart({ playerId, serverId, sessionData });
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:end-session', async (event, { sessionId, endData }) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.trackSessionEnd({ sessionId, endData });
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:create-experiment', async (event, experimentData) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.createExperiment(experimentData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:start-experiment', async (event, experimentId) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.startExperiment(experimentId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:stop-experiment', async (event, { experimentId, reason }) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.stopExperiment(experimentId, reason);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:generate-benchmark', async (event, category) => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.generateBenchmarkReport(category);
  } catch (error) {
    throw error;
  }
});

// Web3 Integration IPC Handlers
ipcMain.handle('getWalletProviders', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return web3Integration.getWalletProviders();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getConnectedWallets', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return web3Integration.getConnectedWallets();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getSupportedNetworks', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return web3Integration.getSupportedNetworks();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getTokenStandards', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return web3Integration.getTokenStandards();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getNFTCollections', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return web3Integration.getNFTCollections();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getSmartContractTemplates', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return web3Integration.getSmartContractTemplates();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getPartnershipPlatforms', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return web3Integration.getPartnershipPlatforms();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('connectWallet', async (event, providerId, method) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.connectWallet(providerId, method);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('disconnectWallet', async (event, walletId) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.disconnectWallet(walletId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deploySmartContract', async (event, templateId, params) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.deploySmartContract(templateId, params);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('mintNFT', async (event, collectionId, metadata) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.mintNFT(collectionId, metadata);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('runTokenSimulation', async (event, scenario) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.runTokenSimulation(scenario);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('createDID', async () => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.createDecentralizedIdentity();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('issueCredential', async (event, credentialData) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.issueVerifiableCredential(credentialData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('registerENS', async (event, domain) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.registerENSDomain(domain);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getWalletBalance', async (event, walletId, tokenAddress) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.getWalletBalance(walletId, tokenAddress);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('getTransactionHistory', async (event, walletId, limit) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.getTransactionHistory(walletId, limit);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('interactWithContract', async (event, contractAddress, method, params) => {
  try {
    if (!web3Integration) throw new Error('Web3 integration not initialized');
    return await web3Integration.interactWithContract(contractAddress, method, params);
  } catch (error) {
    throw error;
  }
});

// Authentication Service IPC Handlers
ipcMain.handle('auth:getStatus', async () => {
  try {
    if (!authenticationService) throw new Error('Authentication service not initialized');
    return authenticationService.getAuthStatus();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('auth:authenticateWithBrowser', async () => {
  try {
    if (!authenticationService) throw new Error('Authentication service not initialized');
    return await authenticationService.authenticateWithBrowser();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('auth:authenticateWithDeviceCode', async () => {
  try {
    if (!authenticationService) throw new Error('Authentication service not initialized');
    return await authenticationService.authenticateWithDeviceCode();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('auth:handleCallback', async (event, callbackUrl) => {
  try {
    if (!authenticationService) throw new Error('Authentication service not initialized');
    return await authenticationService.handleAuthCallback(callbackUrl);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('auth:logout', async () => {
  try {
    if (!authenticationService) throw new Error('Authentication service not initialized');
    return await authenticationService.logout();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('auth:refreshToken', async () => {
  try {
    if (!authenticationService) throw new Error('Authentication service not initialized');
    return await authenticationService.refreshAccessToken();
  } catch (error) {
    throw error;
  }
});

// Enhanced Cloud Sync IPC Handlers
ipcMain.handle('cloud:getConnectionStatus', async () => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return cloudSync.getConnectionStatus();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:testConnection', async () => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.testConnection();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:syncData', async (event, data) => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.syncData(data);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:downloadUserData', async () => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.downloadUserData();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:uploadUserProfile', async (event, profileData) => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.uploadUserProfile(profileData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:getCloudPlugins', async () => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.getCloudPlugins();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:downloadPlugin', async (event, pluginId) => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.downloadPlugin(pluginId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:syncCommunityData', async (event, communityData) => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.syncCommunityData(communityData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:getServerMetrics', async (event, serverId) => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.getServerMetrics(serverId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('cloud:reportServerStatus', async (event, serverId, status) => {
  try {
    if (!cloudSync) throw new Error('Cloud sync not initialized');
    return await cloudSync.reportServerStatus(serverId, status);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('community-analytics:generate-cohort-analysis', async () => {
  try {
    if (!communityGrowthAnalytics) throw new Error('Community analytics not initialized');
    return await communityGrowthAnalytics.generateCohortAnalysis();
  } catch (error) {
    throw error;
  }
});

// Setup Community Growth Analytics event forwarding
if (communityGrowthAnalytics) {
  communityGrowthAnalytics.on('analytics-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('analytics-initialized', data);
    }
  });

  communityGrowthAnalytics.on('player-registered', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('player-registered', data);
    }
  });

  communityGrowthAnalytics.on('lifecycle-transition', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('lifecycle-transition', data);
    }
  });

  communityGrowthAnalytics.on('engagement-score-changed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('engagement-score-changed', data);
    }
  });

  communityGrowthAnalytics.on('experiment-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('experiment-created', data);
    }
  });

  communityGrowthAnalytics.on('experiment-started', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('experiment-started', data);
    }
  });

  communityGrowthAnalytics.on('experiment-stopped', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('experiment-stopped', data);
    }
  });

  communityGrowthAnalytics.on('benchmark-report-generated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('benchmark-report-generated', data);
    }
  });

  communityGrowthAnalytics.on('insights-generated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('insights-generated', data);
    }
  });

  communityGrowthAnalytics.on('daily-insights-generated', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('daily-insights-generated', data);
    }
  });

  communityGrowthAnalytics.on('analytics-collected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('analytics-collected', data);
    }
  });
}

// Setup Authentication Service event forwarding
if (authenticationService) {
  authenticationService.on('auth-success', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auth-success', data);
    }
  });

  authenticationService.on('auth-restored', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auth-restored', data);
    }
  });

  authenticationService.on('auth-logout', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auth-logout', data);
    }
  });

  authenticationService.on('auth-expired', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auth-expired', data);
    }
  });

  authenticationService.on('auth-error', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auth-error', data);
    }
  });

  authenticationService.on('auth-browser-opened', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auth-browser-opened', data);
    }
  });

  authenticationService.on('device-code-required', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('device-code-required', data);
    }
  });

  authenticationService.on('device-code-expired', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('device-code-expired', data);
    }
  });

  authenticationService.on('token-refreshed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('token-refreshed', data);
    }
  });
}

// Setup Cloud Sync event forwarding
if (cloudSync) {
  cloudSync.on('sync-connected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('sync-connected', data);
    }
  });

  cloudSync.on('sync-disconnected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('sync-disconnected', data);
    }
  });

  cloudSync.on('sync-complete', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('sync-complete', data);
    }
  });

  cloudSync.on('sync-error', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('sync-error', data);
    }
  });

  cloudSync.on('sync-auth-error', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('sync-auth-error', data);
    }
  });

  cloudSync.on('sync-connection-failed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('sync-connection-failed', data);
    }
  });
}

// Setup Web3 Integration event forwarding
if (web3Integration) {
  web3Integration.on('web3-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('web3-initialized', data);
    }
  });

  web3Integration.on('wallet-connected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('wallet-connected', data);
    }
  });

  web3Integration.on('wallet-disconnected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('wallet-disconnected', data);
    }
  });

  web3Integration.on('wallet-connection-failed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('wallet-connection-failed', data);
    }
  });

  web3Integration.on('transaction-submitted', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('transaction-submitted', data);
    }
  });

  web3Integration.on('transaction-confirmed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('transaction-confirmed', data);
    }
  });

  web3Integration.on('transaction-failed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('transaction-failed', data);
    }
  });

  web3Integration.on('smart-contract-deployed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('smart-contract-deployed', data);
    }
  });

  web3Integration.on('smart-contract-interaction', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('smart-contract-interaction', data);
    }
  });

  web3Integration.on('nft-minted', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('nft-minted', data);
    }
  });

  web3Integration.on('nft-transferred', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('nft-transferred', data);
    }
  });

  web3Integration.on('token-simulation-completed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('token-simulation-completed', data);
    }
  });

  web3Integration.on('did-created', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('did-created', data);
    }
  });

  web3Integration.on('credential-issued', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('credential-issued', data);
    }
  });

  web3Integration.on('ens-domain-registered', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('ens-domain-registered', data);
    }
  });

  web3Integration.on('partnership-connected', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('partnership-connected', data);
    }
  });

  web3Integration.on('network-switched', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('network-switched', data);
    }
  });
}

// Error Handler IPC handlers
ipcMain.handle('error-handler-get-system-health', async () => {
  try {
    return errorHandler ? errorHandler.getSystemHealth() : null;
  } catch (error) {
    console.error('Error getting system health:', error);
    throw error;
  }
});

ipcMain.handle('error-handler-get-error-history', async (event, options = {}) => {
  try {
    return errorHandler ? errorHandler.getErrorHistory(options.category, options.limit) : [];
  } catch (error) {
    console.error('Error getting error history:', error);
    throw error;
  }
});

ipcMain.handle('error-handler-get-error-details', async (event, { errorId }) => {
  try {
    if (!errorHandler) return null;
    const history = errorHandler.getErrorHistory();
    return history.find(error => error.id === errorId) || null;
  } catch (error) {
    console.error('Error getting error details:', error);
    throw error;
  }
});

ipcMain.handle('error-handler-clear-history', async () => {
  try {
    if (errorHandler) {
      errorHandler.clearErrorHistory();
    }
    return { success: true };
  } catch (error) {
    console.error('Error clearing error history:', error);
    throw error;
  }
});

ipcMain.handle('error-handler-retry-operation', async (event, { errorId }) => {
  try {
    // This is a placeholder - actual retry logic would depend on the specific error
    console.log(`Retry operation requested for error: ${errorId}`);
    return { success: true, message: 'Retry initiated' };
  } catch (error) {
    console.error('Error retrying operation:', error);
    throw error;
  }
});

ipcMain.handle('app-restart', async () => {
  try {
    app.relaunch();
    app.exit();
  } catch (error) {
    console.error('Error restarting app:', error);
    throw error;
  }
});

// Setup Error Handler event forwarding
if (errorHandler) {
  errorHandler.on('user-notification', (notification) => {
    if (mainWindow) {
      mainWindow.webContents.send('error-notification', notification);
    }
  });

  errorHandler.on('health-check-completed', (healthResults) => {
    if (mainWindow) {
      mainWindow.webContents.send('system-health-update', errorHandler.getSystemHealth());
    }
  });

  errorHandler.on('error-handled', (errorEntry) => {
    if (mainWindow) {
      const history = errorHandler.getErrorHistory(null, 50);
      mainWindow.webContents.send('error-history-update', history);
    }
  });

  errorHandler.on('error-recovered', (errorEntry) => {
    if (mainWindow) {
      console.log(`Error automatically recovered: ${errorEntry.id} - ${errorEntry.recoveryAction}`);
    }
  });

  errorHandler.on('critical-error-pattern', (pattern) => {
    if (mainWindow) {
      mainWindow.webContents.send('error-notification', {
        type: 'error',
        title: 'Critical Error Pattern Detected',
        message: `Multiple ${pattern.category} errors detected. System may need attention.`,
        timestamp: new Date(),
        errorId: `critical-${Date.now()}`,
        actions: [
          { label: 'View Details', action: 'view-details' },
          { label: 'Restart App', action: 'restart' }
        ]
      });
    }
  });
}

// SignalR connection info handler
ipcMain.handle('signalr-get-connection-info', async () => {
  try {
    return signalRService ? signalRService.getStatus() : null;
  } catch (error) {
    console.error('Error getting SignalR connection info:', error);
    throw error;
  }
});

// Security Manager IPC handlers
ipcMain.handle('security:get-status', async () => {
  try {
    return securityManager ? securityManager.getSecurityStatus() : null;
  } catch (error) {
    console.error('Error getting security status:', error);
    throw error;
  }
});

ipcMain.handle('security:validate-input', async (event, { input, options = {} }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.validateInput(input, options);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:encrypt-data', async (event, { data }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.encrypt(data);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:decrypt-data', async (event, { encryptedData }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.decrypt(encryptedData);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:hash-password', async (event, { password }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return await securityManager.hashPassword(password);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:verify-password', async (event, { password, hash }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return await securityManager.verifyPassword(password, hash);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:generate-token', async (event, { length = 32 } = {}) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.generateSecureToken(length);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:create-hmac', async (event, { data }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.createHMACSignature(data);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:verify-hmac', async (event, { data, signature }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.verifyHMACSignature(data, signature);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:validate-file', async (event, { file }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.validateFileUpload(file);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:check-ip-blocked', async (event, { ip }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.isIPBlocked(ip);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:block-ip', async (event, { ip, duration }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    securityManager.blockIP(ip, duration);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:get-security-events', async (event, { limit = 100 } = {}) => {
  try {
    if (!securityManager) return [];
    return securityManager.securityEvents.slice(-limit);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:export-security-data', async () => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    return securityManager.exportSecurityData();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security:update-config', async (event, { config }) => {
  try {
    if (!securityManager) throw new Error('Security manager not initialized');
    securityManager.updateSecurityConfig(config);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

// Security Auditor IPC handlers
ipcMain.handle('security-audit:perform-audit', async (event, { options = {} } = {}) => {
  try {
    if (!securityAuditor) throw new Error('Security auditor not initialized');
    return await securityAuditor.performSecurityAudit(options);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security-audit:get-audit-history', async () => {
  try {
    if (!securityAuditor) throw new Error('Security auditor not initialized');
    return securityAuditor.getAuditHistory();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security-audit:get-latest-audit', async () => {
  try {
    if (!securityAuditor) throw new Error('Security auditor not initialized');
    return securityAuditor.getLatestAudit();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security-audit:export-audit', async (event, { auditId }) => {
  try {
    if (!securityAuditor) throw new Error('Security auditor not initialized');
    return securityAuditor.exportAuditResults(auditId);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security-audit:get-vulnerability-patterns', async () => {
  try {
    if (!securityAuditor) return new Map();
    return Array.from(securityAuditor.vulnerabilityPatterns.entries());
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('security-audit:get-compliance-standards', async () => {
  try {
    if (!securityAuditor) return new Map();
    return Array.from(securityAuditor.complianceStandards.entries());
  } catch (error) {
    throw error;
  }
});

// Additional Security Handlers for UI Components
ipcMain.handle('security:get-security-events', async (event, { limit = 50 } = {}) => {
  try {
    if (!securityManager) return [];
    return securityManager.getSecurityEvents(limit);
  } catch (error) {
    console.error('Failed to get security events:', error);
    return [];
  }
});

ipcMain.handle('security-audit:perform-audit', async (event, { options = {} } = {}) => {
  try {
    if (!securityAuditor) throw new Error('Security auditor not initialized');
    return await securityAuditor.performAudit(options);
  } catch (error) {
    console.error('Failed to perform security audit:', error);
    throw error;
  }
});

// Rate Limiting Service IPC handlers
ipcMain.handle('rate-limit:get-statistics', async () => {
  try {
    return rateLimitingService ? rateLimitingService.getStatistics() : null;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('rate-limit:get-configuration', async () => {
  try {
    return rateLimitingService ? rateLimitingService.getConfiguration() : null;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('rate-limit:update-configuration', async (event, { config }) => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    rateLimitingService.updateConfiguration(config);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('rate-limit:add-to-whitelist', async (event, { ip }) => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    rateLimitingService.addToWhitelist(ip);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('rate-limit:remove-from-whitelist', async (event, { ip }) => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    rateLimitingService.removeFromWhitelist(ip);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('rate-limit:unblock-ip', async (event, { ip }) => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    const wasBlocked = rateLimitingService.unblockIP(ip);
    return { success: true, wasBlocked };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('rate-limit:export-data', async () => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    return rateLimitingService.exportData();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('rate-limit:check-ip-status', async (event, { ip }) => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    return {
      blocked: rateLimitingService.isIPBlocked(ip),
      retryAfter: rateLimitingService.getBlockRetryAfter(ip)
    };
  } catch (error) {
    throw error;
  }
});

// Additional Rate Limiting Handlers for UI Components
ipcMain.handle('rate-limiting:get-statistics', async () => {
  try {
    return rateLimitingService ? rateLimitingService.getStatistics() : null;
  } catch (error) {
    console.error('Failed to get rate limiting statistics:', error);
    return null;
  }
});

ipcMain.handle('rate-limiting:get-configuration', async () => {
  try {
    return rateLimitingService ? rateLimitingService.getConfiguration() : null;
  } catch (error) {
    console.error('Failed to get rate limiting configuration:', error);
    return null;
  }
});

ipcMain.handle('rate-limiting:get-blocked-ips', async () => {
  try {
    return rateLimitingService ? rateLimitingService.getBlockedIPs() : [];
  } catch (error) {
    console.error('Failed to get blocked IPs:', error);
    return [];
  }
});

ipcMain.handle('rate-limiting:get-suspicious-activity', async () => {
  try {
    return rateLimitingService ? rateLimitingService.getSuspiciousActivity() : [];
  } catch (error) {
    console.error('Failed to get suspicious activity:', error);
    return [];
  }
});

ipcMain.handle('rate-limiting:unblock-ip', async (event, { ip }) => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    return rateLimitingService.unblockIP(ip);
  } catch (error) {
    console.error('Failed to unblock IP:', error);
    throw error;
  }
});

ipcMain.handle('rate-limiting:block-ip', async (event, { ip, duration, reason }) => {
  try {
    if (!rateLimitingService) throw new Error('Rate limiting service not initialized');
    return rateLimitingService.blockIP(ip, { duration, reason });
  } catch (error) {
    console.error('Failed to block IP:', error);
    throw error;
  }
});

// Performance Monitor IPC handlers
ipcMain.handle('performance:get-summary', async (event, { timeWindow = 3600000 } = {}) => {
  try {
    return performanceMonitor ? performanceMonitor.getPerformanceSummary(timeWindow) : null;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:get-configuration', async () => {
  try {
    return performanceMonitor ? performanceMonitor.getConfiguration() : null;
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:update-configuration', async (event, { config }) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    performanceMonitor.updateConfiguration(config);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:get-latest-metrics', async (event, { type }) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    return performanceMonitor.getLatestMetric(type);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:get-recent-metrics', async (event, { type, timeWindow = 3600000 }) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    return performanceMonitor.getRecentMetrics(type, timeWindow);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:get-alerts', async (event, { timeWindow = 86400000 } = {}) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    return performanceMonitor.getRecentAlerts(timeWindow);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:get-recommendations', async () => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    return performanceMonitor.getActiveRecommendations();
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:apply-optimization', async (event, { recommendationId, options = {} }) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    return await performanceMonitor.applyOptimization(recommendationId, options);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:start-measurement', async (event, { name }) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    const measurement = performanceMonitor.startMeasurement(name);
    
    // Return a measurement ID that can be used to end the measurement
    const measurementId = `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store the measurement end function temporarily
    if (!global.activeMeasurements) {
      global.activeMeasurements = new Map();
    }
    global.activeMeasurements.set(measurementId, measurement);
    
    return { measurementId };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:end-measurement', async (event, { measurementId }) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    if (!global.activeMeasurements || !global.activeMeasurements.has(measurementId)) {
      throw new Error('Measurement not found');
    }
    
    const measurement = global.activeMeasurements.get(measurementId);
    measurement.end();
    global.activeMeasurements.delete(measurementId);
    
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:record-custom-metric', async (event, { category, name, value, metadata = {} }) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    performanceMonitor.recordCustomMetric(category, name, value, metadata);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:export-data', async (event, { timeWindow = 86400000 } = {}) => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    return performanceMonitor.exportData(timeWindow);
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('performance:establish-baseline', async () => {
  try {
    if (!performanceMonitor) throw new Error('Performance monitor not initialized');
    performanceMonitor.establishBaseline();
    return { success: true };
  } catch (error) {
    throw error;
  }
});

// ===== DEPLOYMENT SERVICE IPC HANDLERS =====
ipcMain.handle('deployment:deploy', async (event, { environment, options = {} }) => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const deployment = await deploymentService.deploy(environment, options);
    return { success: true, deployment };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:rollback', async (event, { environment, options = {} }) => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const rollback = await deploymentService.rollback(environment, options);
    return { success: true, rollback };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:get-status', async (event, { deploymentId }) => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const status = deploymentService.getDeploymentStatus(deploymentId);
    return { success: true, status };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:get-environment-status', async (event, { environment }) => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const status = deploymentService.getEnvironmentStatus(environment);
    return { success: true, status };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:get-statistics', async () => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const statistics = deploymentService.getStatistics();
    return { success: true, statistics };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:get-configuration', async () => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const configuration = deploymentService.getConfiguration();
    return { success: true, configuration };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:update-configuration', async (event, { config }) => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    deploymentService.updateConfiguration(config);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:create-backup', async (event, { environment }) => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const backup = await deploymentService.createBackup(environment);
    return { success: true, backup };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('deployment:export-data', async () => {
  try {
    if (!deploymentService) {
      throw new Error('Deployment service not available');
    }
    
    const data = deploymentService.exportData();
    return { success: true, data };
  } catch (error) {
    throw error;
  }
});

// Additional Deployment Handlers for UI Components
ipcMain.handle('deployment:get-deployment-history', async (event, { limit = 20 } = {}) => {
  try {
    if (!deploymentService) return [];
    return deploymentService.getDeploymentHistory(limit);
  } catch (error) {
    console.error('Failed to get deployment history:', error);
    return [];
  }
});

ipcMain.handle('deployment:get-active-deployments', async () => {
  try {
    if (!deploymentService) return [];
    return deploymentService.getActiveDeployments();
  } catch (error) {
    console.error('Failed to get active deployments:', error);
    return [];
  }
});

ipcMain.handle('deployment:cancel', async (event, { deploymentId }) => {
  try {
    if (!deploymentService) throw new Error('Deployment service not initialized');
    return await deploymentService.cancelDeployment(deploymentId);
  } catch (error) {
    console.error('Failed to cancel deployment:', error);
    throw error;
  }
});

// ===== HEALTH CHECK SERVICE IPC HANDLERS =====
ipcMain.handle('health:get-current-status', async () => {
  try {
    if (!healthCheckService) {
      throw new Error('Health check service not available');
    }
    
    const status = healthCheckService.getCurrentHealth();
    return { success: true, status };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('health:get-history', async (event, { limit = 100 } = {}) => {
  try {
    if (!healthCheckService) {
      throw new Error('Health check service not available');
    }
    
    const history = healthCheckService.getHealthHistory(limit);
    return { success: true, history };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('health:get-summary', async (event, { timeWindow = 3600000 } = {}) => {
  try {
    if (!healthCheckService) {
      throw new Error('Health check service not available');
    }
    
    const summary = healthCheckService.getHealthSummary(timeWindow);
    return { success: true, summary };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('health:perform-check', async () => {
  try {
    if (!healthCheckService) {
      throw new Error('Health check service not available');
    }
    
    await healthCheckService.performHealthCheck();
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('health:get-configuration', async () => {
  try {
    if (!healthCheckService) {
      throw new Error('Health check service not available');
    }
    
    const configuration = healthCheckService.getConfiguration();
    return { success: true, configuration };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('health:update-configuration', async (event, { config }) => {
  try {
    if (!healthCheckService) {
      throw new Error('Health check service not available');
    }
    
    healthCheckService.updateConfiguration(config);
    return { success: true };
  } catch (error) {
    throw error;
  }
});

ipcMain.handle('health:export-data', async () => {
  try {
    if (!healthCheckService) {
      throw new Error('Health check service not available');
    }
    
    const data = healthCheckService.exportData();
    return { success: true, data };
  } catch (error) {
    throw error;
  }
});

// Additional Health Handlers for UI Components
ipcMain.handle('health:get-current-health', async () => {
  try {
    return healthCheckService ? healthCheckService.getCurrentHealth() : null;
  } catch (error) {
    console.error('Failed to get current health:', error);
    return null;
  }
});

ipcMain.handle('health:get-health-history', async (event, { limit = 100, timeWindow } = {}) => {
  try {
    return healthCheckService ? healthCheckService.getHealthHistory(limit) : [];
  } catch (error) {
    console.error('Failed to get health history:', error);
    return [];
  }
});

ipcMain.handle('health:get-health-summary', async (event, { timeWindow = 3600000 } = {}) => {
  try {
    return healthCheckService ? healthCheckService.getHealthSummary(timeWindow) : null;
  } catch (error) {
    console.error('Failed to get health summary:', error);
    return null;
  }
});

ipcMain.handle('health:get-service-statuses', async () => {
  try {
    if (!healthCheckService) return {};
    const currentHealth = healthCheckService.getCurrentHealth();
    return currentHealth?.checks || {};
  } catch (error) {
    console.error('Failed to get service statuses:', error);
    return {};
  }
});

ipcMain.handle('health:get-health-alerts', async (event, { timeWindow = 86400000 } = {}) => {
  try {
    if (!healthCheckService) return [];
    // For now, return empty array - can be enhanced to return actual alerts
    return [];
  } catch (error) {
    console.error('Failed to get health alerts:', error);
    return [];
  }
});

ipcMain.handle('health:perform-health-check', async () => {
  try {
    if (!healthCheckService) throw new Error('Health check service not initialized');
    return await healthCheckService.performHealthCheck();
  } catch (error) {
    console.error('Failed to perform health check:', error);
    throw error;
  }
});

// Setup Security Manager event forwarding
if (securityManager) {
  securityManager.on('security-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('security-initialized', data);
    }
  });

  securityManager.on('security-event', (event) => {
    if (mainWindow) {
      mainWindow.webContents.send('security-event', event);
    }
  });

  securityManager.on('critical-security-alert', (event) => {
    if (mainWindow) {
      mainWindow.webContents.send('critical-security-alert', event);
    }
  });

  securityManager.on('security-report', (report) => {
    if (mainWindow) {
      mainWindow.webContents.send('security-report', report);
    }
  });

  securityManager.on('security-config-updated', (config) => {
    if (mainWindow) {
      mainWindow.webContents.send('security-config-updated', config);
    }
  });
}

// Setup Security Auditor event forwarding
if (securityAuditor) {
  securityAuditor.on('auditor-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('auditor-initialized', data);
    }
  });

  securityAuditor.on('audit-completed', (results) => {
    if (mainWindow) {
      mainWindow.webContents.send('audit-completed', results);
    }
  });
}

// Setup Rate Limiting Service event forwarding
if (rateLimitingService) {
  rateLimitingService.on('rate-limiter-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('rate-limiter-initialized', data);
    }
  });

  rateLimitingService.on('suspicious-activity', (event) => {
    if (mainWindow) {
      mainWindow.webContents.send('rate-limit-suspicious-activity', event);
    }
  });

  rateLimitingService.on('ddos-attack', (event) => {
    if (mainWindow) {
      mainWindow.webContents.send('rate-limit-ddos-attack', event);
    }
  });

  rateLimitingService.on('ip-blocked', (event) => {
    if (mainWindow) {
      mainWindow.webContents.send('rate-limit-ip-blocked', event);
    }
  });

  rateLimitingService.on('ip-unblocked', (event) => {
    if (mainWindow) {
      mainWindow.webContents.send('rate-limit-ip-unblocked', event);
    }
  });

  rateLimitingService.on('config-updated', (config) => {
    if (mainWindow) {
      mainWindow.webContents.send('rate-limit-config-updated', config);
    }
  });
}

// Setup Performance Monitor event forwarding
if (performanceMonitor) {
  performanceMonitor.on('monitor-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-monitor-initialized', data);
    }
  });

  performanceMonitor.on('system-metrics', (metrics) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-system-metrics', metrics);
    }
  });

  performanceMonitor.on('process-metrics', (metrics) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-process-metrics', metrics);
    }
  });

  performanceMonitor.on('memory-metrics', (metrics) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-memory-metrics', metrics);
    }
  });

  performanceMonitor.on('eventloop-metrics', (metrics) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-eventloop-metrics', metrics);
    }
  });

  performanceMonitor.on('gc-metrics', (metrics) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-gc-metrics', metrics);
    }
  });

  performanceMonitor.on('function-metrics', (metrics) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-function-metrics', metrics);
    }
  });

  performanceMonitor.on('custom-metric', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-custom-metric', data);
    }
  });

  performanceMonitor.on('performance-alert', (alert) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-alert', alert);
    }
  });

  performanceMonitor.on('alert-cleared', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-alert-cleared', data);
    }
  });

  performanceMonitor.on('optimization-recommendation', (recommendation) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-optimization-recommendation', recommendation);
    }
  });

  performanceMonitor.on('optimization-applied', (optimization) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-optimization-applied', optimization);
    }
  });

  performanceMonitor.on('baseline-established', (baseline) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-baseline-established', baseline);
    }
  });

  performanceMonitor.on('config-updated', (config) => {
    if (mainWindow) {
      mainWindow.webContents.send('performance-config-updated', config);
    }
  });
}

// Setup Deployment Service event forwarding
if (deploymentService) {
  deploymentService.on('deployment-service-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-service-initialized', data);
    }
  });

  deploymentService.on('deployment-started', (deployment) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-started', deployment);
    }
  });

  deploymentService.on('deployment-step-started', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-step-started', data);
    }
  });

  deploymentService.on('deployment-step-completed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-step-completed', data);
    }
  });

  deploymentService.on('deployment-step-failed', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-step-failed', data);
    }
  });

  deploymentService.on('deployment-success', (deployment) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-success', deployment);
    }
  });

  deploymentService.on('deployment-failed', (deployment) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-failed', deployment);
    }
  });

  deploymentService.on('rollback-success', (rollback) => {
    if (mainWindow) {
      mainWindow.webContents.send('rollback-success', rollback);
    }
  });

  deploymentService.on('rollback-failed', (rollback) => {
    if (mainWindow) {
      mainWindow.webContents.send('rollback-failed', rollback);
    }
  });

  deploymentService.on('backup-created', (backup) => {
    if (mainWindow) {
      mainWindow.webContents.send('backup-created', backup);
    }
  });

  deploymentService.on('config-updated', (config) => {
    if (mainWindow) {
      mainWindow.webContents.send('deployment-config-updated', config);
    }
  });
}

// Setup Health Check Service event forwarding
if (healthCheckService) {
  healthCheckService.on('health-service-initialized', (data) => {
    if (mainWindow) {
      mainWindow.webContents.send('health-service-initialized', data);
    }
  });

  healthCheckService.on('health-check-completed', (healthCheck) => {
    if (mainWindow) {
      mainWindow.webContents.send('health-check-completed', healthCheck);
    }
  });

  healthCheckService.on('health-alert', (alert) => {
    if (mainWindow) {
      mainWindow.webContents.send('health-alert', alert);
    }
  });

  healthCheckService.on('config-updated', (config) => {
    if (mainWindow) {
      mainWindow.webContents.send('health-config-updated', config);
    }
  });
}

console.log('HomeHost Desktop main process initialized');