const { EventEmitter } = require('events');
const crypto = require('crypto');
const { shell } = require('electron');

/**
 * AuthenticationService - Handles desktop app authentication with HomeHost cloud
 * 
 * Provides OAuth2/JWT authentication flow with secure token management,
 * automatic token refresh, and integration with the cloud API.
 */
class AuthenticationService extends EventEmitter {
  constructor(store) {
    super();
    this.store = store;
    this.authBaseUrl = 'https://auth.homehost.cloud';
    this.apiBaseUrl = 'https://api.homehost.cloud';
    
    // Authentication state
    this.isAuthenticated = false;
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // OAuth configuration
    this.clientId = 'homehost-desktop';
    this.redirectUri = 'http://localhost:8080/auth/callback';
    this.scopes = ['read', 'write', 'server:manage', 'community:manage'];
    
    // Token refresh timer
    this.refreshTimer = null;
    
    // Device authentication for headless flow
    this.deviceCode = null;
    this.deviceAuthPollInterval = null;
  }

  async initialize() {
    try {
      console.log('Initializing authentication service...');
      
      // Load saved authentication state
      await this.loadAuthState();
      
      // Verify saved tokens if they exist
      if (this.accessToken) {
        const isValid = await this.verifyToken();
        if (isValid) {
          this.isAuthenticated = true;
          this.startTokenRefreshTimer();
          console.log('Authentication restored from saved state');
          this.emit('auth-restored', { user: this.user });
        } else {
          // Try to refresh token
          if (this.refreshToken) {
            try {
              await this.refreshAccessToken();
              console.log('Authentication restored via token refresh');
              this.emit('auth-restored', { user: this.user });
            } catch (error) {
              console.log('Token refresh failed, authentication required');
              this.emit('auth-refresh-failed', { error: error.message });
              await this.clearAuthState();
            }
          } else {
            console.log('No refresh token available, clearing invalid state');
            await this.clearAuthState();
          }
        }
      } else {
        console.log('No saved authentication state found');
      }
      
      console.log('Authentication service initialized');
      return { success: true, authenticated: this.isAuthenticated };
    } catch (error) {
      console.error('Failed to initialize authentication service:', error);
      this.emit('auth-initialization-failed', { error: error.message });
      // Don't throw - allow app to continue without authentication
      return { success: false, authenticated: false, error: error.message };
    }
  }

  // OAuth2 Browser-based Authentication Flow
  async authenticateWithBrowser() {
    try {
      const state = crypto.randomBytes(32).toString('hex');
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = this.generateCodeChallenge(codeVerifier);
      
      // Store PKCE parameters
      this.store.set('oauth_state', state);
      this.store.set('oauth_code_verifier', codeVerifier);
      
      // Build authorization URL
      const authUrl = new URL('/oauth/authorize', this.authBaseUrl);
      authUrl.searchParams.set('client_id', this.clientId);
      authUrl.searchParams.set('redirect_uri', this.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', this.scopes.join(' '));
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('code_challenge', codeChallenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');
      
      console.log('Opening browser for authentication...');
      await shell.openExternal(authUrl.toString());
      
      this.emit('auth-browser-opened', { url: authUrl.toString() });
      
      return {
        success: true,
        authUrl: authUrl.toString(),
        state,
        message: 'Browser authentication initiated'
      };
    } catch (error) {
      console.error('Browser authentication failed:', error);
      throw error;
    }
  }

  // Device Code Flow for Headless Authentication
  async authenticateWithDeviceCode() {
    try {
      console.log('Starting device code authentication...');
      
      // Request device code
      const deviceResponse = await this.makeAuthRequest('POST', '/oauth/device', {
        client_id: this.clientId,
        scope: this.scopes.join(' ')
      });
      
      this.deviceCode = deviceResponse.device_code;
      const userCode = deviceResponse.user_code;
      const verificationUri = deviceResponse.verification_uri;
      const expiresIn = deviceResponse.expires_in;
      const interval = deviceResponse.interval || 5;
      
      console.log(`Device authentication required:`);
      console.log(`1. Go to: ${verificationUri}`);
      console.log(`2. Enter code: ${userCode}`);
      console.log(`3. Code expires in ${expiresIn} seconds`);
      
      this.emit('device-code-required', {
        userCode,
        verificationUri,
        expiresIn
      });
      
      // Start polling for completion
      this.startDeviceCodePolling(interval, expiresIn);
      
      return {
        success: true,
        userCode,
        verificationUri,
        expiresIn,
        message: 'Device code authentication initiated'
      };
    } catch (error) {
      console.error('Device code authentication failed:', error);
      throw error;
    }
  }

  startDeviceCodePolling(interval, expiresIn) {
    const startTime = Date.now();
    const expiryTime = startTime + (expiresIn * 1000);
    
    this.deviceAuthPollInterval = setInterval(async () => {
      if (Date.now() > expiryTime) {
        clearInterval(this.deviceAuthPollInterval);
        this.emit('device-code-expired');
        return;
      }
      
      try {
        const tokenResponse = await this.makeAuthRequest('POST', '/oauth/token', {
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: this.deviceCode,
          client_id: this.clientId
        });
        
        // Success! We got tokens
        await this.handleTokenResponse(tokenResponse);
        clearInterval(this.deviceAuthPollInterval);
        
        console.log('Device code authentication completed');
        this.emit('auth-success', { user: this.user, method: 'device_code' });
        
      } catch (error) {
        if (error.message.includes('authorization_pending')) {
          // Still waiting for user to complete authentication
          return;
        } else if (error.message.includes('slow_down')) {
          // Increase polling interval
          clearInterval(this.deviceAuthPollInterval);
          this.startDeviceCodePolling(interval + 5, expiresIn);
          return;
        } else {
          // Other error, stop polling
          clearInterval(this.deviceAuthPollInterval);
          console.error('Device code polling failed:', error);
          this.emit('auth-error', error);
        }
      }
    }, interval * 1000);
  }

  // Handle OAuth callback (called from renderer process)
  async handleAuthCallback(callbackUrl) {
    try {
      const url = new URL(callbackUrl);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      
      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }
      
      if (!code || !state) {
        throw new Error('Missing authorization code or state');
      }
      
      // Verify state parameter
      const storedState = this.store.get('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }
      
      // Exchange code for tokens
      const codeVerifier = this.store.get('oauth_code_verifier');
      const tokenResponse = await this.makeAuthRequest('POST', '/oauth/token', {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        code_verifier: codeVerifier
      });
      
      await this.handleTokenResponse(tokenResponse);
      
      // Clean up OAuth state
      this.store.delete('oauth_state');
      this.store.delete('oauth_code_verifier');
      
      console.log('OAuth authentication completed');
      this.emit('auth-success', { user: this.user, method: 'oauth' });
      
      return { success: true, user: this.user };
    } catch (error) {
      console.error('OAuth callback failed:', error);
      this.emit('auth-error', error);
      throw error;
    }
  }

  async handleTokenResponse(tokenResponse) {
    this.accessToken = tokenResponse.access_token;
    this.refreshToken = tokenResponse.refresh_token;
    this.tokenExpiry = new Date(Date.now() + (tokenResponse.expires_in * 1000));
    
    // Get user info
    this.user = await this.fetchUserInfo();
    
    // Save authentication state
    await this.saveAuthState();
    
    this.isAuthenticated = true;
    this.startTokenRefreshTimer();
  }

  async fetchUserInfo() {
    try {
      const response = await this.makeApiRequest('GET', '/user/profile');
      return response.user;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw error;
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const tokenResponse = await this.makeAuthRequest('POST', '/oauth/token', {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: this.clientId
      });
      
      this.accessToken = tokenResponse.access_token;
      this.tokenExpiry = new Date(Date.now() + (tokenResponse.expires_in * 1000));
      
      // Update refresh token if provided
      if (tokenResponse.refresh_token) {
        this.refreshToken = tokenResponse.refresh_token;
      }
      
      await this.saveAuthState();
      
      console.log('Access token refreshed');
      this.emit('token-refreshed');
      
      return { success: true };
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearAuthState();
      this.emit('auth-expired');
      throw error;
    }
  }

  startTokenRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    if (!this.tokenExpiry) return;
    
    // Refresh token 5 minutes before expiry
    const refreshTime = this.tokenExpiry.getTime() - Date.now() - (5 * 60 * 1000);
    
    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(async () => {
        try {
          await this.refreshAccessToken();
          this.startTokenRefreshTimer(); // Schedule next refresh
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      }, refreshTime);
    }
  }

  async verifyToken() {
    if (!this.accessToken) return false;
    
    try {
      const response = await this.makeApiRequest('GET', '/auth/verify');
      return response.valid === true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  async logout() {
    try {
      if (this.accessToken) {
        // Revoke tokens on server
        try {
          await this.makeApiRequest('POST', '/auth/logout');
        } catch (error) {
          console.warn('Server logout failed, continuing local logout:', error);
        }
      }
      
      await this.clearAuthState();
      
      console.log('User logged out');
      this.emit('auth-logout');
      
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  async clearAuthState() {
    this.isAuthenticated = false;
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    
    if (this.deviceAuthPollInterval) {
      clearInterval(this.deviceAuthPollInterval);
      this.deviceAuthPollInterval = null;
    }
    
    // Clear stored auth data
    this.store.delete('auth_access_token');
    this.store.delete('auth_refresh_token');
    this.store.delete('auth_token_expiry');
    this.store.delete('auth_user');
  }

  async saveAuthState() {
    if (this.accessToken) {
      this.store.set('auth_access_token', this.accessToken);
    }
    if (this.refreshToken) {
      this.store.set('auth_refresh_token', this.refreshToken);
    }
    if (this.tokenExpiry) {
      this.store.set('auth_token_expiry', this.tokenExpiry.toISOString());
    }
    if (this.user) {
      this.store.set('auth_user', this.user);
    }
  }

  async loadAuthState() {
    this.accessToken = this.store.get('auth_access_token');
    this.refreshToken = this.store.get('auth_refresh_token');
    this.user = this.store.get('auth_user');
    
    const expiryString = this.store.get('auth_token_expiry');
    if (expiryString) {
      this.tokenExpiry = new Date(expiryString);
    }
  }

  // API request helpers
  makeApiRequest(method, endpoint, data = null) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    
    return this.makeRequest(this.apiBaseUrl, method, endpoint, data, {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'HomeHost-Desktop/1.0.0'
    });
  }

  makeAuthRequest(method, endpoint, data = null) {
    return this.makeRequest(this.authBaseUrl, method, endpoint, data, {
      'Content-Type': 'application/json',
      'User-Agent': 'HomeHost-Desktop/1.0.0'
    });
  }

  makeRequest(baseUrl, method, endpoint, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const { URL } = require('url');
      
      const url = new URL(endpoint, baseUrl);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: method,
        headers: headers
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
              reject(new Error(`HTTP ${res.statusCode}: ${parsedData.message || parsedData.error || 'Request failed'}`));
            }
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${error.message}`));
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

  // PKCE helper methods
  generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url');
  }

  generateCodeChallenge(verifier) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  // Public getters
  getUser() {
    return this.user || null;
  }

  getAccessToken() {
    return this.accessToken;
  }

  isUserAuthenticated() {
    return this.isAuthenticated && this.accessToken && this.user;
  }

  getAuthStatus() {
    return {
      authenticated: this.isAuthenticated,
      user: this.user,
      tokenExpiry: this.tokenExpiry,
      hasRefreshToken: !!this.refreshToken
    };
  }
}

module.exports = AuthenticationService;