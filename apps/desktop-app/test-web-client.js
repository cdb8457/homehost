#!/usr/bin/env node

// Test script to simulate a web client connecting to SignalR
const axios = require('axios');
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3456';

async function testWebClient() {
  console.log('🌐 HomeHost Web Client Test');
  console.log('===========================');
  
  try {
    // Step 1: Create a pairing code
    console.log('📝 Step 1: Creating pairing code...');
    const pairResponse = await axios.post(`${SERVER_URL}/pair`, {
      deviceName: 'Test Web Client',
      deviceType: 'web'
    });
    
    const { pairingCode, pairingId } = pairResponse.data;
    console.log(`✅ Pairing code created: ${pairingCode}`);
    console.log(`   Pairing ID: ${pairingId}`);
    
    // Step 2: Connect to SignalR with Socket.IO
    console.log('\n🔌 Step 2: Connecting to SignalR server...');
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });
    
    return new Promise((resolve, reject) => {
      let isConnected = false;
      let isAuthenticated = false;
      
      // Connection events
      socket.on('connect', () => {
        console.log('✅ Connected to SignalR server');
        isConnected = true;
        
        // Step 3: Authenticate with pairing code
        console.log('\n🔐 Step 3: Authenticating with pairing code...');
        socket.emit('authenticate', {
          pairingCode: pairingCode,
          deviceInfo: {
            userAgent: 'Test-Client/1.0',
            platform: 'node.js',
            language: 'en-US'
          }
        });
      });
      
      socket.on('auth-success', (data) => {
        console.log('✅ Authentication successful!');
        console.log(`   Connected to device: ${data.deviceName}`);
        console.log(`   Device ID: ${data.deviceId}`);
        isAuthenticated = true;
        
        // Step 4: Test remote commands
        testRemoteCommands(socket);
        
        // Step 5: Test real-time events
        testRealTimeEvents(socket);
        
        // Complete test after delay
        setTimeout(() => {
          console.log('\n🎉 All web client tests completed successfully!');
          socket.disconnect();
          resolve();
        }, 2000);
      });
      
      socket.on('auth-failed', (data) => {
        console.error('❌ Authentication failed:', data.error);
        reject(new Error(data.error));
      });
      
      socket.on('disconnect', () => {
        console.log('📴 Disconnected from SignalR server');
      });
      
      socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error.message);
        reject(error);
      });
      
      // Timeout for connection
      setTimeout(() => {
        if (!isConnected) {
          reject(new Error('Connection timeout'));
        } else if (!isAuthenticated) {
          reject(new Error('Authentication timeout'));
        }
      }, 5000);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

function testRemoteCommands(socket) {
  console.log('\n📡 Step 4: Testing remote commands...');
  
  // Test get-servers command
  socket.emit('server-command', {
    command: 'get-servers'
  });
  
  // Test get-system-info command
  socket.emit('server-command', {
    command: 'get-system-info'
  });
  
  // Listen for command responses
  socket.on('command-response', (response) => {
    console.log(`✅ Command response received: ${response.command}`);
    if (response.response.success) {
      console.log(`   Status: Success`);
      if (response.response.data) {
        if (response.command === 'get-servers') {
          console.log(`   Found ${response.response.data.length} servers`);
        } else if (response.command === 'get-system-info') {
          console.log(`   System info received (platform: ${response.response.data?.static?.os?.platform})`);
        }
      }
    } else {
      console.log(`   Error: ${response.response.error}`);
    }
  });
}

function testRealTimeEvents(socket) {
  console.log('\n📊 Step 5: Testing real-time events...');
  
  // Listen for real-time events
  socket.on('server-status-update', (data) => {
    console.log('✅ Real-time server status update received');
    console.log(`   Servers: ${data.servers.length}`);
    console.log(`   System CPU: ${data.systemInfo?.cpu?.usage?.toFixed(1) || 'N/A'}%`);
  });
  
  socket.on('server-metrics-update', (data) => {
    console.log('✅ Real-time metrics update received');
    console.log(`   Server ID: ${data.serverId}`);
    console.log(`   Timestamp: ${data.timestamp}`);
  });
  
  socket.on('performance-alert', (data) => {
    console.log('⚠️ Performance alert received');
    console.log(`   Server ID: ${data.serverId}`);
    console.log(`   Alert: ${data.alert.message}`);
  });
  
  socket.on('server-log', (data) => {
    console.log('📝 Server log received');
    console.log(`   Server ID: ${data.serverId}`);
    console.log(`   Log: ${data.log.message}`);
  });
  
  // Request server status to trigger events
  socket.emit('get-server-status');
}

// Run the test
if (require.main === module) {
  testWebClient()
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testWebClient };