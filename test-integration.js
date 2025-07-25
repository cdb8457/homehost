#!/usr/bin/env node

const http = require('http');

console.log('🧪 HomeHost Integration Test\n');

// Test the mock API server
function testAPI() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Backend API is running on port 3001');
          resolve(true);
        } else {
          console.log('❌ Backend API health check failed');
          resolve(false);
        }
      });
    });
    
    req.on('error', () => {
      console.log('❌ Backend API is not running on port 3001');
      console.log('   Run: node mock-server.js');
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      console.log('❌ Backend API timeout');
      resolve(false);
    });
  });
}

// Test the frontend server
function testFrontend() {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend is running on port 3000');
        resolve(true);
      } else {
        console.log('❌ Frontend responded with status:', res.statusCode);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('❌ Frontend is not running on port 3000');
      console.log('   Run: cd apps/web-dashboard && npm run dev');
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      console.log('❌ Frontend timeout');
      resolve(false);
    });
  });
}

// Test authentication flow
function testAuth() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'test@example.com',
      password: 'password'
    });

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.success) {
            console.log('✅ Authentication is working');
            console.log('   Test user token generated successfully');
            resolve(true);
          } else {
            console.log('❌ Authentication failed');
            resolve(false);
          }
        } catch (err) {
          console.log('❌ Authentication response parsing failed');
          resolve(false);
        }
      });
    });

    req.on('error', () => {
      console.log('❌ Authentication test failed');
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Testing HomeHost Platform Integration...\n');
  
  const apiResult = await testAPI();
  const frontendResult = await testFrontend();
  const authResult = await testAuth();
  
  console.log('\n📊 Test Results:');
  console.log(`Backend API: ${apiResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend: ${frontendResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authentication: ${authResult ? '✅ PASS' : '❌ FAIL'}`);
  
  if (apiResult && frontendResult && authResult) {
    console.log('\n🎉 All tests passed! HomeHost platform is ready for testing.');
    console.log('\n🚀 Open http://localhost:3000 in your browser');
    console.log('📧 Login with: test@example.com / password');
  } else {
    console.log('\n❌ Some tests failed. Check the setup:');
    console.log('   1. Start backend: node mock-server.js');
    console.log('   2. Start frontend: cd apps/web-dashboard && npm run dev');
    console.log('   3. Wait for both servers to fully start');
  }
}

runTests();