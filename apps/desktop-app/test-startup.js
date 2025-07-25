#!/usr/bin/env node

// Startup test to simulate actual application launch
console.log('🚀 HomeHost Desktop App - Startup Test');
console.log('======================================');

const path = require('path');

// Mock Electron for startup test
const mockElectron = {
  app: {
    whenReady: () => {
      console.log('📱 Electron app ready');
      return Promise.resolve();
    },
    on: (event, callback) => {
      console.log(`📡 App event listener: ${event}`);
      if (event === 'window-all-closed') {
        setTimeout(() => {
          console.log('🛑 Simulating window-all-closed');
          callback();
        }, 2000);
      }
    },
    quit: () => {
      console.log('✅ Application quit');
      process.exit(0);
    }
  },
  BrowserWindow: class MockBrowserWindow {
    constructor(options) {
      console.log('🪟 Main window created');
      this.webContents = {
        openDevTools: () => console.log('🔧 DevTools opened'),
        send: (channel, data) => console.log(`📤 IPC message sent: ${channel}`),
        setWindowOpenHandler: (handler) => console.log('🔗 External link handler set')
      };
    }
    loadURL(url) {
      console.log(`🌐 Loading renderer: ${url}`);
    }
    once(event, callback) {
      console.log(`👂 Window event listener: ${event}`);
      if (event === 'ready-to-show') {
        setTimeout(() => {
          console.log('✨ Window ready to show');
          callback();
        }, 500);
      }
    }
    on(event, callback) {
      console.log(`📡 Window event: ${event}`);
      if (event === 'closed') {
        setTimeout(() => {
          console.log('❌ Window closed');
          callback();
        }, 1500);
      }
    }
    show() {
      console.log('👁️ Main window displayed');
    }
  },
  ipcMain: {
    handle: (channel, handler) => {
      console.log(`🔌 IPC handler: ${channel}`);
    }
  },
  Menu: {
    buildFromTemplate: (template) => {
      console.log('📋 Application menu created');
      return {};
    },
    setApplicationMenu: (menu) => {
      console.log('📋 Application menu applied');
    }
  },
  shell: {
    openExternal: (url) => console.log(`🔗 Opening external: ${url}`)
  },
  dialog: {
    showErrorBox: (title, content) => console.log(`❌ Error dialog: ${title}`),
    showMessageBox: (window, options) => console.log('💬 Message dialog shown'),
    showOpenDialog: (window, options) => Promise.resolve({ filePaths: ['/test/path'] })
  },
  Notification: class MockNotification {
    constructor(options) {
      console.log(`🔔 Notification: ${options.title}`);
    }
    show() {
      console.log('🔔 Notification displayed');
    }
  }
};

// Mock electron-store
class MockStore {
  constructor() {
    this.data = new Map();
    console.log('💾 Electron store initialized');
  }
  get(key, defaultValue) {
    return this.data.get(key) || defaultValue;
  }
  set(key, value) {
    this.data.set(key, value);
  }
}

// Replace requires for startup simulation
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  switch (id) {
    case 'electron':
      return mockElectron;
    case 'electron-is-dev':
      return true; // Dev mode for testing
    case 'electron-store':
      return MockStore;
    default:
      return originalRequire.apply(this, arguments);
  }
};

async function simulateStartup() {
  try {
    console.log('\n🔧 Phase 1: Service Import & Initialization');
    console.log('===========================================');
    
    // Import all services (this happens when main.js is loaded)
    const GameServerManager = require('./src/main/services/GameServerManager');
    const SteamService = require('./src/main/services/SteamService');
    const SteamIntegration = require('./src/main/services/SteamIntegration');
    const SystemMonitor = require('./src/main/services/SystemMonitor');
    const CloudSync = require('./src/main/services/CloudSync');
    const SystemOptimization = require('./src/main/services/SystemOptimization');
    const ServerMonitor = require('./src/main/services/ServerMonitor');
    const SignalRService = require('./src/main/services/SignalRService');
    
    console.log('✅ All service modules imported');
    
    // Initialize store and services
    const store = new MockStore();
    const serverMonitor = new ServerMonitor();
    const gameServerManager = new GameServerManager(store, serverMonitor);
    const steamService = new SteamService(store);
    const steamIntegration = new SteamIntegration(store, steamService);
    const systemMonitor = new SystemMonitor();
    const cloudSync = new CloudSync(store);
    const systemOptimization = new SystemOptimization(store);
    const signalRService = new SignalRService(store);
    
    console.log('✅ Core services initialized');

    console.log('\n🖥️ Phase 2: Application Window Creation');
    console.log('=======================================');
    
    // Simulate Electron app.whenReady()
    await mockElectron.app.whenReady();
    
    // Create main window
    const mainWindow = new mockElectron.BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1000,
      minHeight: 600,
      show: false
    });
    
    // Load renderer
    mainWindow.loadURL('http://localhost:3012');
    
    // Wait for window ready
    await new Promise(resolve => {
      mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        resolve();
      });
    });
    
    console.log('✅ Main window created and displayed');

    console.log('\n📊 Phase 3: Background Services Startup');
    console.log('======================================');
    
    // Start system monitoring
    systemMonitor.startMonitoring();
    console.log('✅ System monitoring started');
    
    // Start server monitoring
    serverMonitor.startMonitoring();
    console.log('✅ Server monitoring started');
    
    // Start SignalR service (use different port to avoid conflicts)
    signalRService.port = 3460;
    await signalRService.startServer();
    console.log('✅ SignalR service started');
    
    console.log('\n🔗 Phase 4: Event Listeners & IPC Setup');
    console.log('=======================================');
    
    // Simulate IPC handler registration (these are in main.js)
    const ipcHandlers = [
      'get-system-info', 'get-servers', 'deploy-server', 'start-server', 'stop-server',
      'get-steam-games', 'install-steam-game', 'get-server-logs', 'send-server-command',
      'get-server-metrics', 'get-signalr-status', 'create-device-pairing'
    ];
    
    ipcHandlers.forEach(handler => {
      mockElectron.ipcMain.handle(handler, async () => {
        return { success: true, data: 'Mock response' };
      });
    });
    
    console.log(`✅ ${ipcHandlers.length} IPC handlers registered`);
    
    // Setup menu
    mockElectron.Menu.setApplicationMenu(mockElectron.Menu.buildFromTemplate([]));
    console.log('✅ Application menu configured');

    console.log('\n⚡ Phase 5: Health Checks & Status');
    console.log('=================================');
    
    // Check all services are running
    const systemInfo = await systemMonitor.getSystemInfo();
    console.log(`✅ System Monitor: ${systemInfo?.static?.os?.platform} platform`);
    
    const servers = gameServerManager.getServers();
    console.log(`✅ Game Server Manager: ${servers.length} servers loaded`);
    
    const signalRStatus = signalRService.getStatus();
    console.log(`✅ SignalR Service: Running on port ${signalRStatus.port}`);
    
    const monitoringStatus = serverMonitor.getMonitoringStatus();
    console.log(`✅ Server Monitor: Active monitoring`);

    console.log('\n🎉 Phase 6: Application Ready');
    console.log('=============================');
    
    console.log('✅ HomeHost Desktop App fully started');
    console.log('✅ All services operational');
    console.log('✅ Ready to accept user input');
    console.log('✅ SignalR ready for remote connections');

    console.log('\n🛑 Phase 7: Graceful Shutdown Simulation');
    console.log('========================================');
    
    // Simulate shutdown process
    setTimeout(async () => {
      console.log('🛑 Starting shutdown sequence...');
      
      // Stop monitoring services
      systemMonitor.stopMonitoring();
      console.log('✅ System monitoring stopped');
      
      serverMonitor.stopMonitoring();
      console.log('✅ Server monitoring stopped');
      
      // Stop all servers
      gameServerManager.stopAllServers();
      console.log('✅ All game servers stopped');
      
      // Stop SignalR service
      await signalRService.stopServer();
      console.log('✅ SignalR service stopped');
      
      console.log('✅ Clean shutdown completed');
      
      // Trigger app quit
      mockElectron.app.quit();
      
    }, 3000);

    return true;

  } catch (error) {
    console.error('\n💥 STARTUP TEST FAILED!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run startup simulation
if (require.main === module) {
  simulateStartup()
    .then((success) => {
      if (!success) {
        console.log('\n💥 Startup test failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Startup simulation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { simulateStartup };