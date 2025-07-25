const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;
const { io } = require('socket.io-client');

// Import services for testing
const SignalRService = require('../../src/main/services/SignalRService');

describe('SignalR Real-Time Integration Tests', () => {
  let store;
  let tempDir;
  let signalRService;
  let testClient;
  let testPort;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-signalr-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'signalr-test-store',
      cwd: tempDir
    });

    // Find available port for testing
    testPort = 3457; // Different from default to avoid conflicts
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
    store.clear();
    
    // Initialize services
    signalRService = new SignalRService(store);
    signalRService.port = testPort;
  });

  afterEach(async () => {
    // Cleanup after each test
    if (testClient) {
      testClient.disconnect();
      testClient = null;
    }
    
    if (signalRService) {
      await signalRService.stopServer();
    }
  });

  describe('SignalR Server Startup and Connection', () => {
    test('should start SignalR server successfully', async () => {
      await expect(signalRService.startServer()).resolves.not.toThrow();
      
      expect(signalRService.getStatus().isRunning).toBe(true);
      expect(signalRService.getStatus().port).toBe(testPort);
    });

    test('should handle multiple startup attempts gracefully', async () => {
      await signalRService.startServer();
      
      // Second startup should not throw
      await expect(signalRService.startServer()).resolves.not.toThrow();
      
      expect(signalRService.getStatus().isRunning).toBe(true);
    });

    test('should provide health check endpoint', async () => {
      await signalRService.startServer();
      
      // Add fetch polyfill for Node.js
      global.fetch = require('node-fetch');
      
      const response = await fetch(`http://localhost:${testPort}/health`);
      expect(response.ok).toBe(true);
      
      const health = await response.json();
      expect(health).toHaveProperty('status', 'healthy');
      expect(health).toHaveProperty('connectedClients');
      expect(health).toHaveProperty('uptime');
    });

    test('should provide device info endpoint', async () => {
      await signalRService.startServer();
      
      global.fetch = require('node-fetch');
      
      const response = await fetch(`http://localhost:${testPort}/device-info`);
      expect(response.ok).toBe(true);
      
      const deviceInfo = await response.json();
      expect(deviceInfo).toHaveProperty('deviceId');
      expect(deviceInfo).toHaveProperty('deviceName');
      expect(deviceInfo).toHaveProperty('version');
      expect(deviceInfo).toHaveProperty('platform');
    });
  });

  describe('Client Authentication and Pairing', () => {
    beforeEach(async () => {
      await signalRService.startServer();
      global.fetch = require('node-fetch');
    });

    test('should handle device pairing flow', async () => {
      const pairingResponse = await fetch(`http://localhost:${testPort}/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: 'Test Device',
          deviceType: 'web_client'
        })
      });
      
      expect(pairingResponse.ok).toBe(true);
      
      const pairing = await pairingResponse.json();
      expect(pairing).toHaveProperty('pairingId');
      expect(pairing).toHaveProperty('pairingCode');
      expect(pairing).toHaveProperty('expiresIn');
      expect(pairing.pairingCode).toMatch(/^\\d{6}$/);
    });

    test('should authenticate client with valid pairing code', async () => {
      // Get pairing code
      const pairingResponse = await fetch(`http://localhost:${testPort}/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceName: 'Test Client',
          deviceType: 'web_client'
        })
      });
      
      const { pairingCode } = await pairingResponse.json();
      
      // Connect and authenticate
      testClient = io(`http://localhost:${testPort}`);
      
      const authPromise = new Promise((resolve, reject) => {
        testClient.once('auth-success', resolve);
        testClient.once('auth-failed', reject);
        
        testClient.emit('authenticate', {
          pairingCode,
          deviceInfo: { userAgent: 'Test Client' }
        });
      });
      
      const authResult = await authPromise;
      expect(authResult).toHaveProperty('clientId');
      expect(authResult).toHaveProperty('deviceId');
      expect(authResult).toHaveProperty('deviceName');
    });

    test('should reject authentication with invalid pairing code', async () => {
      testClient = io(`http://localhost:${testPort}`);
      
      const authPromise = new Promise((resolve, reject) => {
        testClient.once('auth-success', () => reject(new Error('Should not succeed')));
        testClient.once('auth-failed', resolve);
        
        testClient.emit('authenticate', {
          pairingCode: '000000', // Invalid code
          deviceInfo: { userAgent: 'Test Client' }
        });
      });
      
      const authError = await authPromise;
      expect(authError).toHaveProperty('error');
      expect(authError.error).toContain('Invalid pairing code');
    });
  });

  describe('Real-Time Server Status Broadcasting', () => {
    beforeEach(async () => {
      await signalRService.startServer();
      await authenticateTestClient();
    });

    test('should broadcast server status updates', async () => {
      const mockServers = [
        {
          id: 'test-server-1',
          name: 'Test Valheim Server',
          status: 'running',
          gameType: 'valheim',
          gameName: 'Valheim',
          port: 2456,
          currentPlayers: 3,
          maxPlayers: 10,
          lastStarted: new Date()
        }
      ];
      
      const mockSystemInfo = {
        current: {
          cpu: { usage: 45.2 },
          memory: { used: 8000000000, total: 16000000000 }
        }
      };
      
      const statusPromise = new Promise((resolve) => {
        testClient.once('server-status-update', resolve);
      });
      
      signalRService.broadcastServerStatus(mockServers, mockSystemInfo);
      
      const statusUpdate = await statusPromise;
      expect(statusUpdate).toHaveProperty('timestamp');
      expect(statusUpdate).toHaveProperty('servers');
      expect(statusUpdate).toHaveProperty('systemInfo');
      
      expect(statusUpdate.servers).toHaveLength(1);
      expect(statusUpdate.servers[0]).toMatchObject({
        id: 'test-server-1',
        name: 'Test Valheim Server',
        status: 'running',
        gameType: 'valheim',
        port: 2456,
        currentPlayers: 3,
        maxPlayers: 10
      });
    });

    test('should broadcast server metrics updates', async () => {
      const testServerId = 'test-server-1';
      const mockMetrics = {
        cpu: 65.4,
        memory: 78.2,
        disk: 45.1,
        network: { in: 5000, out: 3000 },
        uptime: 3600000
      };
      
      const metricsPromise = new Promise((resolve) => {
        testClient.once('server-metrics-update', resolve);
      });
      
      signalRService.broadcastServerMetrics(testServerId, mockMetrics);
      
      const metricsUpdate = await metricsPromise;
      expect(metricsUpdate).toHaveProperty('serverId', testServerId);
      expect(metricsUpdate).toHaveProperty('metrics', mockMetrics);
      expect(metricsUpdate).toHaveProperty('timestamp');
    });
  });

  describe('Server Log Streaming', () => {
    beforeEach(async () => {
      await signalRService.startServer();
      await authenticateTestClient();
    });

    test('should subscribe to server logs', async () => {
      const testServerId = 'test-server-1';
      
      // Subscribe to logs
      testClient.emit('subscribe-logs', { serverId: testServerId });
      
      // Wait a bit for subscription to be processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const mockLogEntry = {
        level: 'info',
        message: 'Test log message',
        timestamp: new Date()
      };
      
      const logPromise = new Promise((resolve) => {
        testClient.once('server-log', resolve);
      });
      
      signalRService.broadcastServerLog(testServerId, mockLogEntry);
      
      const logUpdate = await logPromise;
      expect(logUpdate).toHaveProperty('serverId', testServerId);
      expect(logUpdate).toHaveProperty('log', mockLogEntry);
      expect(logUpdate).toHaveProperty('timestamp');
    });
  });

  describe('Remote Command Execution', () => {
    beforeEach(async () => {
      await signalRService.startServer();
      await authenticateTestClient();
    });

    test('should handle server control commands', async () => {
      const testServerId = 'test-server-1';
      const testCommand = 'start-server';
      
      // Set up command response handler
      const commandPromise = new Promise((resolve) => {
        signalRService.once('remote-command', (data) => {
          expect(data).toHaveProperty('clientId');
          expect(data).toHaveProperty('command', testCommand);
          expect(data).toHaveProperty('serverId', testServerId);
          expect(data).toHaveProperty('device');
          
          // Simulate command response
          signalRService.sendCommandResponse(data.clientId, {
            command: testCommand,
            serverId: testServerId,
            response: { success: true, message: 'Server started' },
            timestamp: new Date().toISOString()
          });
          
          resolve(data);
        });
      });
      
      const responsePromise = new Promise((resolve) => {
        testClient.once('command-response', resolve);
      });
      
      // Send command
      testClient.emit('server-command', {
        command: testCommand,
        serverId: testServerId,
        params: {}
      });
      
      // Wait for command to be processed
      await commandPromise;
      
      // Check response
      const response = await responsePromise;
      expect(response).toHaveProperty('command', testCommand);
      expect(response).toHaveProperty('serverId', testServerId);
      expect(response).toHaveProperty('response');
      expect(response.response).toHaveProperty('success', true);
    });

    test('should reject commands from unauthenticated clients', async () => {
      // Connect without authentication
      const unauthClient = io(`http://localhost:${testPort}`);
      
      const errorPromise = new Promise((resolve) => {
        unauthClient.once('command-error', resolve);
      });
      
      unauthClient.emit('server-command', {
        command: 'start-server',
        serverId: 'test-server',
        params: {}
      });
      
      const error = await errorPromise;
      expect(error).toHaveProperty('error');
      expect(error.error).toContain('Not authenticated');
      
      unauthClient.disconnect();
    });
  });

  describe('Connection Management', () => {
    beforeEach(async () => {
      await signalRService.startServer();
    });

    test('should track connected clients', async () => {
      await authenticateTestClient();
      
      const clients = signalRService.getConnectedClients();
      expect(clients).toHaveLength(1);
      expect(clients[0]).toHaveProperty('deviceName');
      expect(clients[0]).toHaveProperty('deviceType');
      expect(clients[0]).toHaveProperty('connectedAt');
    });

    test('should handle client disconnection', async () => {
      await authenticateTestClient();
      
      let clientsBeforeDisconnect = signalRService.getConnectedClients();
      expect(clientsBeforeDisconnect).toHaveLength(1);
      
      const disconnectPromise = new Promise((resolve) => {
        signalRService.once('client-disconnected', resolve);
      });
      
      testClient.disconnect();
      
      const disconnectData = await disconnectPromise;
      expect(disconnectData).toHaveProperty('clientId');
      expect(disconnectData).toHaveProperty('device');
      
      const clientsAfterDisconnect = signalRService.getConnectedClients();
      expect(clientsAfterDisconnect).toHaveLength(0);
    });
  });

  // Helper function to authenticate test client
  async function authenticateTestClient() {
    global.fetch = require('node-fetch');
    
    // Get pairing code
    const pairingResponse = await fetch(`http://localhost:${testPort}/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceName: 'E2E Test Client',
        deviceType: 'test_client'
      })
    });
    
    const { pairingCode } = await pairingResponse.json();
    
    // Connect and authenticate
    testClient = io(`http://localhost:${testPort}`);
    
    return new Promise((resolve, reject) => {
      testClient.once('auth-success', resolve);
      testClient.once('auth-failed', reject);
      
      testClient.emit('authenticate', {
        pairingCode,
        deviceInfo: { userAgent: 'E2E Test Client' }
      });
    });
  }
});