// E2E Test Setup Configuration
const path = require('path');
const fs = require('fs').promises;

// Mock Electron APIs for testing
global.mockElectron = {
  app: {
    getPath: jest.fn((name) => {
      switch (name) {
        case 'userData':
          return path.join(__dirname, '../temp-test-data');
        case 'temp':
          return path.join(__dirname, '../temp');
        default:
          return '/mock/path';
      }
    }),
    getName: jest.fn(() => 'HomeHost Test'),
    getVersion: jest.fn(() => '1.0.0-test')
  },
  shell: {
    openExternal: jest.fn().mockResolvedValue(undefined)
  },
  dialog: {
    showOpenDialog: jest.fn().mockResolvedValue({ 
      canceled: false, 
      filePaths: ['/mock/selected/path'] 
    }),
    showSaveDialog: jest.fn().mockResolvedValue({ 
      canceled: false, 
      filePath: '/mock/save/path' 
    }),
    showMessageBox: jest.fn().mockResolvedValue({ response: 0 })
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn(),
    removeAllListeners: jest.fn()
  },
  BrowserWindow: jest.fn(() => ({
    loadURL: jest.fn(),
    webContents: {
      send: jest.fn(),
      openDevTools: jest.fn()
    },
    show: jest.fn(),
    hide: jest.fn(),
    close: jest.fn(),
    on: jest.fn()
  }))
};

// Setup global test environment
beforeAll(async () => {
  // Create temporary directories for testing
  const tempDirs = [
    path.join(__dirname, '../temp-test-data'),
    path.join(__dirname, '../temp'),
    path.join(__dirname, '../temp-e2e-tests'),
    path.join(__dirname, '../temp-integration-tests'),
    path.join(__dirname, '../temp-performance-tests')
  ];

  for (const dir of tempDirs) {
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.HOMEHOST_TEST = 'true';

  // Mock network calls to prevent real API calls during testing
  setupNetworkMocks();

  console.log('E2E Test environment initialized');
});

afterAll(async () => {
  // Clean up temporary test data
  const tempDirs = [
    path.join(__dirname, '../temp-test-data'),
    path.join(__dirname, '../temp'),
    path.join(__dirname, '../temp-e2e-tests'),
    path.join(__dirname, '../temp-integration-tests'),
    path.join(__dirname, '../temp-performance-tests')
  ];

  for (const dir of tempDirs) {
    try {
      await fs.rmdir(dir, { recursive: true });
    } catch (error) {
      // Directory might not exist or be in use
      console.warn(`Could not clean up ${dir}:`, error.message);
    }
  }

  console.log('E2E Test environment cleaned up');
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
  
  // Reset console to capture logs
  global.testLogs = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    global.testLogs.push({ level: 'log', args });
    originalLog(...args);
  };

  console.error = (...args) => {
    global.testLogs.push({ level: 'error', args });
    originalError(...args);
  };

  console.warn = (...args) => {
    global.testLogs.push({ level: 'warn', args });
    originalWarn(...args);
  };
});

afterEach(() => {
  // Restore console
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  // Check for unexpected errors in logs
  const errorLogs = global.testLogs?.filter(log => log.level === 'error') || [];
  if (errorLogs.length > 0) {
    console.warn(`Test generated ${errorLogs.length} error logs:`, errorLogs);
  }
});

// Setup network mocks to prevent real API calls
function setupNetworkMocks() {
  // Mock https module
  const https = require('https');
  const originalRequest = https.request;

  https.request = jest.fn((options, callback) => {
    // Create a mock response based on the URL
    const mockResponse = createMockResponse(options);
    
    // Simulate async response
    setTimeout(() => {
      if (callback) callback(mockResponse);
    }, 10);

    // Return mock request object
    return {
      on: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      setTimeout: jest.fn(),
      destroy: jest.fn()
    };
  });

  // Store original for restoration if needed
  https.originalRequest = originalRequest;
}

function createMockResponse(options) {
  const url = `${options.hostname}${options.path}`;
  
  // Mock different API responses based on URL
  let mockData = { error: 'Not Found' };
  let statusCode = 404;

  if (url.includes('auth.homehost.cloud')) {
    if (options.path.includes('/oauth/device')) {
      mockData = {
        device_code: 'mock-device-code',
        user_code: 'MOCK123',
        verification_uri: 'https://auth.homehost.cloud/device',
        expires_in: 600,
        interval: 5
      };
      statusCode = 200;
    } else if (options.path.includes('/oauth/token')) {
      mockData = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        token_type: 'Bearer'
      };
      statusCode = 200;
    }
  } else if (url.includes('api.homehost.cloud')) {
    if (options.path.includes('/health')) {
      mockData = { status: 'ok', timestamp: new Date().toISOString() };
      statusCode = 200;
    } else if (options.path.includes('/user')) {
      mockData = {
        user: {
          id: 'mock-user-123',
          name: 'Test User',
          email: 'test@example.com'
        }
      };
      statusCode = 200;
    }
  }

  return {
    statusCode,
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        callback(JSON.stringify(mockData));
      } else if (event === 'end') {
        callback();
      }
    })
  };
}

// Global test utilities
global.testUtils = {
  // Create a mock server configuration
  createMockServerConfig: (overrides = {}) => ({
    name: 'Test Server',
    game: 'valheim',
    port: 2456,
    maxPlayers: 4,
    password: 'testpass',
    ...overrides
  }),

  // Create mock community data
  createMockCommunityData: (overrides = {}) => ({
    name: 'Test Community',
    description: 'A test community',
    tags: ['test', 'gaming'],
    isPublic: true,
    ...overrides
  }),

  // Create mock user data
  createMockUserData: (overrides = {}) => ({
    id: 'test-user-123',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Assert performance benchmark
  assertPerformance: (actualTime, expectedMaxTime, operationName) => {
    if (actualTime > expectedMaxTime) {
      console.warn(
        `Performance warning: ${operationName} took ${actualTime}ms, expected <${expectedMaxTime}ms`
      );
    }
    expect(actualTime).toBeLessThan(expectedMaxTime * 1.5); // Allow 50% buffer
  },

  // Clean up test data
  cleanupTestData: async (store) => {
    if (store && typeof store.clear === 'function') {
      store.clear();
    }
  }
};

// Add custom matchers for E2E testing
expect.extend({
  toBeValidServerId(received) {
    const isValid = typeof received === 'string' && received.length > 0;
    return {
      message: () => `expected ${received} to be a valid server ID`,
      pass: isValid
    };
  },

  toBeValidCommunityId(received) {
    const isValid = typeof received === 'string' && received.length > 0;
    return {
      message: () => `expected ${received} to be a valid community ID`,
      pass: isValid
    };
  },

  toHaveValidTimestamp(received) {
    const timestamp = new Date(received);
    const isValid = timestamp instanceof Date && !isNaN(timestamp);
    return {
      message: () => `expected ${received} to be a valid timestamp`,
      pass: isValid
    };
  },

  toCompleteWithinTime(received, expectedTime) {
    const completedInTime = received <= expectedTime;
    return {
      message: () => 
        `expected operation to complete within ${expectedTime}ms, but took ${received}ms`,
      pass: completedInTime
    };
  }
});

// Export utilities for use in tests
module.exports = {
  mockElectron: global.mockElectron,
  testUtils: global.testUtils,
  setupNetworkMocks
};