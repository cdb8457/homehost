#!/usr/bin/env node

// Test script for SignalR service without Electron
const Store = require('electron-store');
const SignalRService = require('./src/main/services/SignalRService');

// Mock Electron store for testing
class MockStore {
  constructor() {
    this.data = new Map();
  }
  
  get(key, defaultValue) {
    return this.data.get(key) || defaultValue;
  }
  
  set(key, value) {
    this.data.set(key, value);
  }
}

async function testSignalRService() {
  console.log('🏡 HomeHost SignalR Service Test');
  console.log('================================');
  
  const store = new MockStore();
  const signalRService = new SignalRService(store);
  
  try {
    // Test server startup
    console.log('📡 Starting SignalR server...');
    await signalRService.startServer();
    console.log('✅ SignalR server started successfully!');
    
    // Test device info
    console.log('\n📱 Device Information:');
    console.log(`Device ID: ${signalRService.getDeviceId()}`);
    console.log(`Device Name: ${signalRService.getDeviceName()}`);
    
    // Test pairing code generation
    console.log('\n🔐 Testing Pairing Code Generation:');
    const pairingCode1 = signalRService.generatePairingCode();
    const pairingCode2 = signalRService.generatePairingCode();
    console.log(`Generated codes: ${pairingCode1}, ${pairingCode2}`);
    console.log(`Codes are unique: ${pairingCode1 !== pairingCode2 ? '✅' : '❌'}`);
    
    // Test status
    console.log('\n📊 Service Status:');
    const status = signalRService.getStatus();
    console.log(`Server running: ${status.isRunning ? '✅' : '❌'}`);
    console.log(`Port: ${status.port}`);
    console.log(`Connected clients: ${status.connectedClients}`);
    console.log(`Active pairings: ${status.activePairings}`);
    
    // Test creating device pairing
    console.log('\n👥 Creating Test Device Pairing:');
    const pairingId = require('uuid').v4();
    signalRService.devicePairings.set(pairingId, {
      id: pairingId,
      deviceName: 'Test Device',
      deviceType: 'web',
      pairingCode: '123456',
      created: new Date(),
      expires: new Date(Date.now() + 5 * 60 * 1000),
      used: false
    });
    
    const activePairings = signalRService.getActiveParings();
    console.log(`Active pairings: ${activePairings.length}`);
    console.log(`Test pairing created: ${activePairings.length > 0 ? '✅' : '❌'}`);
    
    // Test finding pairing by code
    const foundPairing = signalRService.findPairingByCode('123456');
    console.log(`Pairing found by code: ${foundPairing ? '✅' : '❌'}`);
    
    // Test event system
    console.log('\n🔄 Testing Event System:');
    let eventReceived = false;
    
    signalRService.on('test-event', (data) => {
      eventReceived = true;
      console.log(`Event received: ${JSON.stringify(data)}`);
    });
    
    signalRService.emit('test-event', { message: 'Test event data' });
    
    setTimeout(() => {
      console.log(`Event system working: ${eventReceived ? '✅' : '❌'}`);
      
      // Test server endpoints
      console.log('\n🌐 Testing HTTP Endpoints:');
      testEndpoints(status.port);
      
    }, 100);
    
  } catch (error) {
    console.error('❌ SignalR service test failed:', error);
  }
}

async function testEndpoints(port) {
  const axios = require('axios');
  const baseUrl = `http://localhost:${port}`;
  
  try {
    // Test health endpoint
    console.log('Testing /health endpoint...');
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log(`Health endpoint: ${healthResponse.status === 200 ? '✅' : '❌'}`);
    console.log(`Health data:`, healthResponse.data);
    
    // Test device info endpoint
    console.log('\nTesting /device-info endpoint...');
    const deviceResponse = await axios.get(`${baseUrl}/device-info`);
    console.log(`Device info endpoint: ${deviceResponse.status === 200 ? '✅' : '❌'}`);
    console.log(`Device data:`, deviceResponse.data);
    
    // Test pairing endpoint
    console.log('\nTesting /pair endpoint...');
    const pairResponse = await axios.post(`${baseUrl}/pair`, {
      deviceName: 'Test Client',
      deviceType: 'web'
    });
    console.log(`Pair endpoint: ${pairResponse.status === 200 ? '✅' : '❌'}`);
    console.log(`Pairing data:`, pairResponse.data);
    
    console.log('\n🎉 All HTTP endpoints working correctly!');
    
  } catch (error) {
    console.error('❌ HTTP endpoint test failed:', error.message);
  }
  
  // Give some time to inspect the results
  console.log('\n⏰ Server will continue running for testing...');
  console.log('📝 You can now test the web client by opening web-client.html');
  console.log(`🔗 Server URL: http://localhost:${port}`);
  console.log('🛑 Press Ctrl+C to stop the server');
}

// Start the test
testSignalRService().catch(console.error);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down test server...');
  process.exit(0);
});