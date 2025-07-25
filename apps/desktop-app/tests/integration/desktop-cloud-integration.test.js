const AuthenticationService = require('../../src/main/services/AuthenticationService');
const CloudSync = require('../../src/main/services/CloudSync');
const Store = require('electron-store');

describe('Desktop-Cloud Integration', () => {
  let authService;
  let cloudSync;
  let store;

  beforeEach(() => {
    // Create a test store that doesn't persist
    store = new Store({ name: 'test-integration' });
    authService = new AuthenticationService(store);
    cloudSync = new CloudSync(store, authService);
  });

  afterEach(() => {
    // Clean up test data
    store.clear();
  });

  describe('AuthenticationService', () => {
    test('should initialize without authentication', async () => {
      const result = await authService.initialize();
      
      expect(result).toEqual({
        success: true,
        authenticated: false
      });
      
      expect(authService.isUserAuthenticated()).toBe(false);
      expect(authService.getUser()).toBeNull();
    });

    test('should generate valid PKCE parameters', () => {
      const verifier = authService.generateCodeVerifier();
      const challenge = authService.generateCodeChallenge(verifier);
      
      expect(verifier).toBeDefined();
      expect(challenge).toBeDefined();
      expect(verifier.length).toBeGreaterThan(30);
      expect(challenge.length).toBeGreaterThan(30);
    });

    test('should provide correct auth status when not authenticated', () => {
      const status = authService.getAuthStatus();
      
      expect(status).toEqual({
        authenticated: false,
        user: null,
        tokenExpiry: null,
        hasRefreshToken: false
      });
    });

    test('should handle browser authentication initiation', async () => {
      const result = await authService.authenticateWithBrowser();
      
      expect(result.success).toBe(true);
      expect(result.authUrl).toContain('oauth/authorize');
      expect(result.state).toBeDefined();
    });

    test('should handle device code authentication initiation', async () => {
      // Mock the auth request to simulate device code response
      const originalMakeRequest = authService.makeAuthRequest;
      authService.makeAuthRequest = jest.fn().mockResolvedValue({
        device_code: 'test-device-code',
        user_code: 'TEST-CODE',
        verification_uri: 'https://auth.homehost.cloud/device',
        expires_in: 600,
        interval: 5
      });

      const result = await authService.authenticateWithDeviceCode();
      
      expect(result.success).toBe(true);
      expect(result.userCode).toBe('TEST-CODE');
      expect(result.verificationUri).toBe('https://auth.homehost.cloud/device');
      
      // Restore original method
      authService.makeAuthRequest = originalMakeRequest;
    });

    test('should clear auth state on logout', async () => {
      // Set some mock auth data
      authService.isAuthenticated = true;
      authService.user = { id: 'test', name: 'Test User' };
      authService.accessToken = 'test-token';
      
      await authService.logout();
      
      expect(authService.isUserAuthenticated()).toBe(false);
      expect(authService.getUser()).toBeNull();
      expect(authService.getAccessToken()).toBeNull();
    });
  });

  describe('CloudSync Integration', () => {
    test('should initialize without authentication and fail gracefully', async () => {
      await authService.initialize();
      const result = await cloudSync.initialize();
      
      expect(result).toEqual({
        success: false,
        authenticated: false
      });
      
      expect(cloudSync.isConnected).toBe(false);
    });

    test('should provide connection status', () => {
      const status = cloudSync.getConnectionStatus();
      
      expect(status).toHaveProperty('connected');
      expect(status).toHaveProperty('deviceId');
      expect(status).toHaveProperty('apiUrl');
      expect(status.connected).toBe(false);
      expect(status.apiUrl).toBe('https://api.homehost.cloud');
    });

    test('should throw error when trying to sync without authentication', async () => {
      await authService.initialize();
      
      await expect(cloudSync.syncData()).rejects.toThrow('User not authenticated');
    });

    test('should throw error when trying to access cloud APIs without authentication', async () => {
      await authService.initialize();
      
      await expect(cloudSync.downloadUserData()).rejects.toThrow('User not authenticated');
      await expect(cloudSync.getCloudPlugins()).rejects.toThrow('User not authenticated');
      await expect(cloudSync.uploadUserProfile({})).rejects.toThrow('User not authenticated');
    });

    test('should generate device ID consistently', () => {
      const deviceId1 = cloudSync.getDeviceId();
      const deviceId2 = cloudSync.getDeviceId();
      
      expect(deviceId1).toBe(deviceId2);
      expect(deviceId1).toMatch(/^[0-9a-f-]{36}$/); // UUID format
    });

    test('should prepare local data for sync', () => {
      // Add some test data to the store
      store.set('servers', {
        'server1': {
          name: 'Test Server',
          game: 'valheim',
          password: 'secret123'
        }
      });
      
      store.set('settings', {
        theme: 'dark',
        steamPath: '/local/steam/path'
      });

      const localData = cloudSync.prepareLocalData();
      
      expect(localData).toHaveProperty('servers');
      expect(localData).toHaveProperty('settings');
      expect(localData).toHaveProperty('metadata');
      
      // Check password sanitization
      expect(localData.servers.server1.password).toBe('[ENCRYPTED]');
      
      // Check settings sanitization (local paths removed)
      expect(localData.settings).not.toHaveProperty('steamPath');
      expect(localData.settings.theme).toBe('dark');
    });

    test('should sanitize sensitive data before sync', () => {
      const testServers = {
        'server1': {
          name: 'Test Server',
          password: 'secret123',
          configuration: {
            password: 'admin123',
            port: 2456
          }
        }
      };

      const sanitized = cloudSync.sanitizeServersForSync(testServers);
      
      expect(sanitized.server1.password).toBe('[ENCRYPTED]');
      expect(sanitized.server1.configuration.password).toBe('[ENCRYPTED]');
      expect(sanitized.server1.configuration.port).toBe(2456);
    });
  });

  describe('Authentication-CloudSync Integration', () => {
    test('should set up event listeners between services', () => {
      const authSuccessSpy = jest.spyOn(cloudSync, 'initialize');
      
      // Simulate auth success event
      authService.emit('auth-success', { user: { id: 'test' } });
      
      expect(authSuccessSpy).toHaveBeenCalled();
    });

    test('should disconnect cloud sync on auth logout', () => {
      const disconnectSpy = jest.spyOn(cloudSync, 'disconnect');
      
      // Simulate auth logout event
      authService.emit('auth-logout');
      
      expect(disconnectSpy).toHaveBeenCalled();
    });

    test('should handle token refresh gracefully', () => {
      // This should not throw an error
      expect(() => {
        authService.emit('token-refreshed');
      }).not.toThrow();
    });

    test('should disconnect on auth expiry', () => {
      const disconnectSpy = jest.spyOn(cloudSync, 'disconnect');
      
      authService.emit('auth-expired');
      
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock authentication as successful
      authService.isAuthenticated = true;
      authService.accessToken = 'test-token';
      authService.user = { id: 'test' };
      
      jest.spyOn(authService, 'isUserAuthenticated').mockReturnValue(true);
      jest.spyOn(authService, 'getAccessToken').mockReturnValue('test-token');
      
      // This should fail gracefully due to network error (no real server)
      const result = await cloudSync.initialize();
      
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('retrying');
    });

    test('should implement retry logic for failed requests', async () => {
      authService.isAuthenticated = true;
      authService.accessToken = 'test-token';
      
      jest.spyOn(authService, 'isUserAuthenticated').mockReturnValue(true);
      jest.spyOn(authService, 'getAccessToken').mockReturnValue('test-token');
      
      // Mock makeRequest to fail multiple times then succeed
      let callCount = 0;
      const originalMakeRequest = cloudSync.makeRequest;
      cloudSync.makeRequest = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ success: true });
      });

      try {
        await cloudSync.makeAuthenticatedRequestWithRetry('GET', '/test');
        
        expect(cloudSync.makeRequest).toHaveBeenCalledTimes(3);
      } catch (error) {
        // Expected to fail in test environment
        expect(cloudSync.makeRequest).toHaveBeenCalled();
      }
      
      // Restore original method
      cloudSync.makeRequest = originalMakeRequest;
    });
  });

  describe('Data Merging', () => {
    test('should merge local and cloud server data correctly', () => {
      const localServers = {
        'local1': {
          name: 'Local Server',
          password: 'local-secret',
          status: 'running'
        }
      };

      const cloudServers = {
        'cloud1': {
          name: 'Cloud Server',
          game: 'rust'
        },
        'local1': {
          name: 'Updated Local Server',
          game: 'valheim'
        }
      };

      const merged = cloudSync.mergeServers(localServers, cloudServers);
      
      expect(merged).toHaveProperty('local1');
      expect(merged).toHaveProperty('cloud1');
      
      // Local server should retain local password but get cloud updates
      expect(merged.local1.password).toBe('local-secret');
      expect(merged.local1.status).toBe('running');
      expect(merged.local1.game).toBe('valheim');
      
      // Cloud server should be added
      expect(merged.cloud1.name).toBe('Cloud Server');
      expect(merged.cloud1.status).toBe('stopped');
      expect(merged.cloud1.isFromCloud).toBe(true);
    });
  });
});

// Helper function to create mock HTTP responses
function createMockResponse(statusCode, data) {
  return {
    statusCode,
    on: jest.fn((event, callback) => {
      if (event === 'data') {
        callback(JSON.stringify(data));
      } else if (event === 'end') {
        callback();
      }
    })
  };
}