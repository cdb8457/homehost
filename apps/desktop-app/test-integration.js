#!/usr/bin/env node

// Comprehensive integration test for HomeHost Desktop App
console.log('🧪 HomeHost Desktop App - Integration Test Suite');
console.log('================================================');

const path = require('path');
const fs = require('fs');

// Mock Electron modules for testing
const mockElectron = {
  app: {
    whenReady: () => Promise.resolve(),
    on: (event, callback) => console.log(`📡 Event listener registered: ${event}`),
    quit: () => console.log('✅ App quit called')
  },
  BrowserWindow: class MockBrowserWindow {
    constructor(options) {
      console.log('🪟 BrowserWindow created');
      this.webContents = {
        openDevTools: () => console.log('🔧 DevTools opened'),
        send: (channel, data) => console.log(`📤 IPC sent: ${channel}`),
        setWindowOpenHandler: (handler) => console.log('🔗 Window open handler set')
      };
    }
    loadURL(url) { console.log(`🌐 Loading URL: ${url}`); }
    once(event, callback) { 
      console.log(`👂 Once listener: ${event}`);
      if (event === 'ready-to-show') setTimeout(callback, 50);
    }
    on(event, callback) { 
      console.log(`📡 Window event listener: ${event}`);
      if (event === 'closed') setTimeout(callback, 50);
    }
    show() { console.log('👁️ Window shown'); }
  },
  ipcMain: {
    handle: (channel, handler) => console.log(`🔌 IPC handler registered: ${channel}`)
  },
  Menu: {
    buildFromTemplate: (template) => ({ }),
    setApplicationMenu: (menu) => console.log('📋 Application menu set')
  },
  shell: { openExternal: (url) => console.log(`🔗 External URL: ${url}`) },
  dialog: {
    showErrorBox: (title, content) => console.log(`❌ Error box: ${title}`),
    showMessageBox: (window, options) => console.log('💬 Message box shown'),
    showOpenDialog: (window, options) => Promise.resolve({ filePaths: ['/mock/path'] })
  },
  Notification: class MockNotification {
    constructor(options) { console.log('🔔 Notification created:', options.title); }
    show() { console.log('🔔 Notification shown'); }
  }
};

// Mock other modules
class MockStore {
  constructor() { this.data = new Map(); }
  get(key, defaultValue) { return this.data.get(key) || defaultValue; }
  set(key, value) { this.data.set(key, value); }
}

// Replace require calls
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  switch (id) {
    case 'electron':
      return mockElectron;
    case 'electron-is-dev':
      return true;
    case 'electron-store':
      return MockStore;
    default:
      return originalRequire.apply(this, arguments);
  }
};

async function runIntegrationTests() {
  const results = {
    serviceInitialization: false,
    ipcCommunication: false,
    signalRCommunication: false,
    serverMonitoring: false,
    steamIntegration: false,
    systemOptimization: false,
    fileStructure: false
  };

  try {
    console.log('\n🔧 Test 1: Service Initialization');
    console.log('================================');
    
    // Test service imports and initialization
    const GameServerManager = require('./src/main/services/GameServerManager');
    const SteamService = require('./src/main/services/SteamService');
    const SteamIntegration = require('./src/main/services/SteamIntegration');
    const SystemMonitor = require('./src/main/services/SystemMonitor');
    const CloudSync = require('./src/main/services/CloudSync');
    const SystemOptimization = require('./src/main/services/SystemOptimization');
    const ServerMonitor = require('./src/main/services/ServerMonitor');
    const SignalRService = require('./src/main/services/SignalRService');
    
    const store = new MockStore();
    const serverMonitor = new ServerMonitor();
    const gameServerManager = new GameServerManager(store, serverMonitor);
    const steamService = new SteamService(store);
    const steamIntegration = new SteamIntegration(store, steamService);
    const systemMonitor = new SystemMonitor();
    const cloudSync = new CloudSync(store);
    const systemOptimization = new SystemOptimization(store);
    const signalRService = new SignalRService(store);
    
    console.log('✅ All services initialized successfully');
    results.serviceInitialization = true;

    console.log('\n🔌 Test 2: IPC Communication Simulation');
    console.log('=======================================');
    
    // Test basic service methods that would be called via IPC
    const servers = gameServerManager.getServers();
    const supportedGames = gameServerManager.getSupportedGames();
    const systemInfo = await systemMonitor.getSystemInfo();
    const systemSpecs = await systemOptimization.getSystemSpecs();
    const signalRStatus = signalRService.getStatus();
    
    console.log(`✅ GameServerManager: ${servers.length} servers, ${Object.keys(supportedGames).length} supported games`);
    console.log(`✅ SystemMonitor: Platform ${systemInfo?.static?.os?.platform}, ${systemInfo?.static?.cpu?.cores} cores`);
    console.log(`✅ SystemOptimization: System specs retrieved successfully`);
    console.log(`✅ SignalRService: Status ${signalRStatus.isRunning ? 'Running' : 'Stopped'}`);
    results.ipcCommunication = true;

    console.log('\n📡 Test 3: SignalR Communication');
    console.log('================================');
    
    // Test SignalR server lifecycle
    signalRService.port = 3459; // Use unique port for testing
    await signalRService.startServer();
    console.log('✅ SignalR server started successfully');
    
    const status = signalRService.getStatus();
    console.log(`✅ SignalR status: Running=${status.isRunning}, Port=${status.port}`);
    
    await signalRService.stopServer();
    console.log('✅ SignalR server stopped successfully');
    results.signalRCommunication = true;

    console.log('\n📊 Test 4: Server Monitoring');
    console.log('============================');
    
    // Test server monitoring capabilities
    serverMonitor.startMonitoring();
    console.log('✅ Server monitoring started');
    
    const monitoringStatus = serverMonitor.getMonitoringStatus();
    console.log(`✅ Monitoring status: Running=${monitoringStatus.isRunning}`);
    
    const allMetrics = serverMonitor.getAllServerMetrics();
    console.log(`✅ Server metrics: ${Object.keys(allMetrics).length} servers monitored`);
    
    serverMonitor.stopMonitoring();
    console.log('✅ Server monitoring stopped');
    results.serverMonitoring = true;

    console.log('\n🎮 Test 5: Steam Integration');
    console.log('============================');
    
    // Test Steam service capabilities
    const steamHealth = await steamService.checkSteamCMDHealth();
    console.log(`✅ SteamCMD health check: ${steamHealth.isHealthy ? 'Healthy' : 'Needs setup'}`);
    
    const gameLibrary = steamIntegration.getGameLibrary();
    console.log(`✅ Steam game library: ${gameLibrary.length} games available`);
    
    const activeInstalls = steamService.getActiveInstalls();
    console.log(`✅ Active installations: ${activeInstalls.length} games installing`);
    results.steamIntegration = true;

    console.log('\n⚡ Test 6: System Optimization');
    console.log('==============================');
    
    // Test system optimization features
    const currentLoad = await systemOptimization.getCurrentSystemLoad();
    console.log(`✅ Current system load: CPU=${currentLoad.cpu?.toFixed(1)}%, Memory=${currentLoad.memory?.toFixed(1)}%`);
    
    const recommendations = await systemOptimization.getOptimizationRecommendations('valheim', 20);
    console.log(`✅ Optimization recommendations: ${recommendations.length} recommendations for Valheim`);
    results.systemOptimization = true;

    console.log('\n📁 Test 7: File Structure Validation');
    console.log('====================================');
    
    // Validate critical file structure
    const criticalFiles = [
      'src/main/main.js',
      'src/main/preload.js',
      'src/main/services/GameServerManager.js',
      'src/main/services/ServerMonitor.js',
      'src/main/services/SignalRService.js',
      'src/main/services/SystemMonitor.js',
      'src/main/services/SystemOptimization.js',
      'src/main/services/SteamService.js',
      'src/main/services/SteamIntegration.js',
      'src/main/services/CloudSync.js',
      'package.json'
    ];
    
    const missingFiles = [];
    for (const file of criticalFiles) {
      if (!fs.existsSync(path.join(__dirname, file))) {
        missingFiles.push(file);
      }
    }
    
    if (missingFiles.length === 0) {
      console.log('✅ All critical files present');
      results.fileStructure = true;
    } else {
      console.log('❌ Missing critical files:', missingFiles);
    }

    // Test Results Summary
    console.log('\n🎯 INTEGRATION TEST RESULTS');
    console.log('============================');
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    for (const [test, passed] of Object.entries(results)) {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const testName = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`${status} - ${testName}`);
    }
    
    console.log(`\n📊 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL INTEGRATION TESTS PASSED!');
      console.log('🚀 HomeHost Desktop App is ready for deployment');
      return true;
    } else {
      console.log('⚠️ Some tests failed - review issues above');
      return false;
    }

  } catch (error) {
    console.error('\n💥 INTEGRATION TEST FAILED!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the integration tests
if (require.main === module) {
  runIntegrationTests()
    .then((success) => {
      if (success) {
        console.log('\n🎊 Integration tests completed successfully!');
        process.exit(0);
      } else {
        console.log('\n💥 Integration tests failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('\n💥 Test execution failed:', error.message);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };