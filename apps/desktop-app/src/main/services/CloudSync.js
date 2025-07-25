const { EventEmitter } = require('events');
const https = require('https');
const { URL } = require('url');

class CloudSync extends EventEmitter {
  constructor(store, authenticationService) {
    super();
    this.store = store;
    this.authService = authenticationService;
    this.baseUrl = 'https://api.homehost.cloud';
    this.isConnected = false;
    this.syncInterval = null;
    this.lastSyncTime = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 5;
    
    // Bind authentication events
    this.setupAuthListeners();
  }

  setupAuthListeners() {
    if (this.authService) {
      this.authService.on('auth-success', () => {
        this.initialize();
      });
      
      this.authService.on('auth-restored', () => {
        this.initialize();
      });
      
      this.authService.on('auth-logout', () => {
        this.disconnect();
      });
      
      this.authService.on('auth-expired', () => {
        this.disconnect();
      });
      
      this.authService.on('token-refreshed', () => {
        // Token was refreshed, no action needed as we get it dynamically
        console.log('Auth token refreshed, continuing sync operations');
      });
    }
  }

  async initialize() {
    try {
      console.log('Initializing cloud sync...');
      
      // Check if user is authenticated
      if (!this.authService || !this.authService.isUserAuthenticated()) {
        console.log('User not authenticated, skipping cloud sync initialization');
        return { success: false, authenticated: false };
      }
      
      this.connectionAttempts++;
      
      // Test connection to cloud API with authentication
      const response = await this.makeAuthenticatedRequest('GET', '/health');
      if (response.status === 'ok') {
        this.isConnected = true;
        this.connectionAttempts = 0;
        this.retryAttempts = 0;
        
        console.log('Cloud sync initialized successfully');
        
        // Start periodic sync
        this.startPeriodicSync();
        
        // Initial sync
        await this.syncData();
        
        this.emit('sync-connected', { timestamp: new Date() });
        
        return { success: true, connected: true };
      }
      
      throw new Error('Cloud API health check failed');
    } catch (error) {
      console.error('Failed to initialize cloud sync:', error);
      this.isConnected = false;
      
      // Retry with exponential backoff
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        const retryDelay = this.retryDelay * Math.pow(2, this.connectionAttempts - 1);
        console.log(`Retrying cloud sync initialization in ${retryDelay}ms (attempt ${this.connectionAttempts}/${this.maxConnectionAttempts})`);
        
        setTimeout(() => {
          this.initialize();
        }, retryDelay);
        
        return { success: false, retrying: true, nextRetryIn: retryDelay };
      }
      
      this.emit('sync-connection-failed', { error, attempts: this.connectionAttempts });
      throw error;
    }
  }

  startPeriodicSync(intervalMs = 300000) { // 5 minutes default
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncData();
      } catch (error) {
        console.error('Periodic sync failed:', error);
        this.emit('sync-error', error);
      }
    }, intervalMs);

    console.log('Periodic cloud sync started');
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Periodic cloud sync stopped');
    }
  }

  async syncData(data = null) {
    if (!this.authService || !this.authService.isUserAuthenticated()) {
      throw new Error('User not authenticated');
    }

    if (!this.isConnected) {
      throw new Error('Cloud sync not connected');
    }

    try {
      const timestamp = new Date().toISOString();
      
      // Prepare sync payload
      const syncPayload = {
        timestamp,
        deviceId: this.getDeviceId(),
        userId: this.authService.getUser()?.id,
        data: data || this.prepareLocalData()
      };

      // Send data to cloud with retry logic
      const response = await this.makeAuthenticatedRequestWithRetry('POST', '/sync', syncPayload);
      
      if (response.success) {
        this.lastSyncTime = timestamp;
        this.store.set('lastCloudSync', timestamp);
        this.retryAttempts = 0;
        
        // Process any incoming data from cloud
        if (response.data) {
          await this.processCloudData(response.data);
        }

        this.emit('sync-complete', {
          timestamp,
          success: true,
          dataSize: JSON.stringify(syncPayload).length,
          serverTime: response.serverTime
        });

        console.log('Cloud sync completed successfully');
        return response;
      }

      throw new Error('Cloud sync request failed');
    } catch (error) {
      console.error('Cloud sync failed:', error);
      
      // Handle authentication errors
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('Authentication error during sync, attempting token refresh...');
        this.emit('sync-auth-error', error);
        
        try {
          await this.authService.refreshAccessToken();
          console.log('Token refreshed, retrying sync...');
          return await this.syncData(data); // Retry once after token refresh
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.authService.emit('auth-expired');
        }
      }
      
      this.emit('sync-error', error);
      throw error;
    }
  }

  prepareLocalData() {
    // Gather local data to sync with cloud
    const servers = this.store.get('servers', {});
    const settings = this.store.get('settings', {});
    const gameInstallations = this.store.get('gameInstallations', {});
    const plugins = this.store.get('plugins', []);

    return {
      servers: this.sanitizeServersForSync(servers),
      settings: this.sanitizeSettingsForSync(settings),
      gameInstallations,
      plugins,
      metadata: {
        platform: process.platform,
        version: '1.0.0',
        lastModified: new Date().toISOString()
      }
    };
  }

  sanitizeServersForSync(servers) {
    // Remove sensitive data before syncing
    const sanitized = {};
    
    // Handle null/undefined servers
    if (!servers || typeof servers !== 'object') {
      return sanitized;
    }
    
    for (const [id, server] of Object.entries(servers)) {
      sanitized[id] = {
        ...server,
        // Remove passwords and sensitive config
        password: server.password ? '[ENCRYPTED]' : '',
        configuration: {
          ...server.configuration,
          password: server.configuration?.password ? '[ENCRYPTED]' : ''
        }
      };
    }
    
    return sanitized;
  }

  sanitizeSettingsForSync(settings) {
    // Remove local paths and sensitive settings
    if (!settings || typeof settings !== 'object') {
      return {};
    }
    
    const sanitized = { ...settings };
    
    // Remove local file paths
    delete sanitized.steamPath;
    delete sanitized.gameInstallPaths;
    delete sanitized.cloudApiKey;
    
    return sanitized;
  }

  async processCloudData(cloudData) {
    if (!cloudData) return;

    try {
      // Process cloud servers (merge with local)
      if (cloudData.servers) {
        const localServers = this.store.get('servers', {});
        const mergedServers = this.mergeServers(localServers, cloudData.servers);
        this.store.set('servers', mergedServers);
      }

      // Process cloud settings
      if (cloudData.settings) {
        const localSettings = this.store.get('settings', {});
        const mergedSettings = { ...cloudData.settings, ...localSettings };
        this.store.set('settings', mergedSettings);
      }

      // Process plugins
      if (cloudData.plugins) {
        this.store.set('cloudPlugins', cloudData.plugins);
      }

      console.log('Cloud data processed successfully');
    } catch (error) {
      console.error('Failed to process cloud data:', error);
      throw error;
    }
  }

  mergeServers(localServers, cloudServers) {
    const merged = { ...localServers };

    for (const [id, cloudServer] of Object.entries(cloudServers)) {
      const localServer = merged[id];
      
      if (!localServer) {
        // New server from cloud
        merged[id] = {
          ...cloudServer,
          status: 'stopped', // Always start as stopped
          isFromCloud: true
        };
      } else {
        // Merge existing server (prefer local for sensitive data)
        merged[id] = {
          ...cloudServer,
          ...localServer,
          // Keep local passwords and paths
          password: localServer.password,
          installPath: localServer.installPath,
          status: localServer.status
        };
      }
    }

    return merged;
  }

  async downloadUserData() {
    if (!this.authService || !this.authService.isUserAuthenticated()) {
      throw new Error('User not authenticated');
    }

    if (!this.isConnected) {
      throw new Error('Cloud sync not connected');
    }

    try {
      const response = await this.makeAuthenticatedRequest('GET', '/user/data');
      return response.data;
    } catch (error) {
      console.error('Failed to download user data:', error);
      throw error;
    }
  }

  async uploadUserProfile(profileData) {
    if (!this.authService || !this.authService.isUserAuthenticated()) {
      throw new Error('User not authenticated');
    }

    if (!this.isConnected) {
      throw new Error('Cloud sync not connected');
    }

    try {
      const response = await this.makeAuthenticatedRequest('PUT', '/user/profile', profileData);
      return response;
    } catch (error) {
      console.error('Failed to upload user profile:', error);
      throw error;
    }
  }

  async getCloudPlugins() {
    if (!this.authService || !this.authService.isUserAuthenticated()) {
      throw new Error('User not authenticated');
    }

    if (!this.isConnected) {
      throw new Error('Cloud sync not connected');
    }

    try {
      const response = await this.makeAuthenticatedRequest('GET', '/plugins/available');
      return response.plugins || [];
    } catch (error) {
      console.error('Failed to get cloud plugins:', error);
      throw error;
    }
  }

  async downloadPlugin(pluginId) {
    if (!this.isConnected) {
      throw new Error('Cloud sync not connected');
    }

    if (!this.authService || !this.authService.isUserAuthenticated()) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await this.makeAuthenticatedRequest('GET', `/plugins/${pluginId}/download`);
      return response;
    } catch (error) {
      console.error('Failed to download plugin:', error);
      throw error;
    }
  }

  // Enhanced cloud API methods for community features
  async syncCommunityData(communityData) {
    try {
      const response = await this.makeAuthenticatedRequest('POST', '/communities/sync', communityData);
      return response;
    } catch (error) {
      console.error('Failed to sync community data:', error);
      throw error;
    }
  }

  async getServerMetrics(serverId) {
    try {
      const response = await this.makeAuthenticatedRequest('GET', `/servers/${serverId}/metrics`);
      return response.metrics;
    } catch (error) {
      console.error('Failed to get server metrics:', error);
      throw error;
    }
  }

  async reportServerStatus(serverId, status) {
    try {
      const response = await this.makeAuthenticatedRequest('POST', `/servers/${serverId}/status`, {
        status,
        timestamp: new Date().toISOString(),
        deviceId: this.getDeviceId()
      });
      return response;
    } catch (error) {
      console.error('Failed to report server status:', error);
      throw error;
    }
  }

  // Authenticated request methods
  makeAuthenticatedRequest(method, endpoint, data = null) {
    if (!this.authService || !this.authService.isUserAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const accessToken = this.authService.getAccessToken();
    return this.makeRequest(method, endpoint, data, {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'HomeHost-Desktop/1.0.0',
      'X-Device-ID': this.getDeviceId()
    });
  }

  async makeAuthenticatedRequestWithRetry(method, endpoint, data = null) {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.makeAuthenticatedRequest(method, endpoint, data);
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw error;
        }

        // Exponential backoff for retries
        const delay = this.retryDelay * Math.pow(2, attempt);
        console.log(`Request failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms...`);
        
        await this.sleep(delay);
      }
    }
  }

  makeRequest(method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HomeHost-Desktop/1.0.0',
          ...headers
        }
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = https.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              const errorMessage = parsedData.message || parsedData.error || 'Request failed';
              reject(new Error(`HTTP ${res.statusCode}: ${errorMessage}`));
            }
          } catch (error) {
            if (res.statusCode >= 200 && res.statusCode < 300 && responseData.trim() === '') {
              // Empty success response
              resolve({});
            } else {
              reject(new Error(`Invalid JSON response: ${error.message}`));
            }
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request failed: ${error.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getDeviceId() {
    let deviceId = this.store.get('deviceId');
    
    if (!deviceId) {
      // Generate UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const crypto = require('crypto');
      const bytes = crypto.randomBytes(16);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
      
      deviceId = [
        bytes.subarray(0, 4).toString('hex'),
        bytes.subarray(4, 6).toString('hex'),
        bytes.subarray(6, 8).toString('hex'),
        bytes.subarray(8, 10).toString('hex'),
        bytes.subarray(10, 16).toString('hex')
      ].join('-');
      
      this.store.set('deviceId', deviceId);
    }
    
    return deviceId;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      lastSync: this.lastSyncTime || this.store.get('lastCloudSync'),
      apiUrl: this.baseUrl,
      deviceId: this.getDeviceId()
    };
  }

  async testConnection() {
    try {
      const startTime = Date.now();
      const response = await this.makeAuthenticatedRequest('GET', '/health');
      const latency = Date.now() - startTime;
      return { success: true, latency, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  disconnect() {
    this.stopPeriodicSync();
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.retryAttempts = 0;
    console.log('Disconnected from cloud sync');
    this.emit('sync-disconnected', { timestamp: new Date() });
  }
}

module.exports = CloudSync;