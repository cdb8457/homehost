import React, { useState, useEffect } from 'react';
import './Authentication.css';

const Authentication = ({ onAuthSuccess }) => {
  const [authStatus, setAuthStatus] = useState({
    authenticated: false,
    user: null,
    loading: true
  });
  const [authMethod, setAuthMethod] = useState('browser'); // 'browser' or 'device'
  const [deviceCode, setDeviceCode] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAuth();
    setupEventListeners();
    
    return () => {
      window.electronAPI.removeAllListeners('auth-success');
      window.electronAPI.removeAllListeners('auth-restored');
      window.electronAPI.removeAllListeners('auth-error');
      window.electronAPI.removeAllListeners('auth-logout');
      window.electronAPI.removeAllListeners('device-code-required');
      window.electronAPI.removeAllListeners('device-code-expired');
    };
  }, []);

  const initializeAuth = async () => {
    try {
      const status = await window.electronAPI.authGetStatus();
      setAuthStatus({
        authenticated: status.authenticated,
        user: status.user,
        loading: false
      });
      
      if (status.authenticated && onAuthSuccess) {
        onAuthSuccess(status.user);
      }
    } catch (error) {
      console.error('Failed to get auth status:', error);
      setAuthStatus({ authenticated: false, user: null, loading: false });
    }
  };

  const setupEventListeners = () => {
    window.electronAPI.onAuthSuccess((data) => {
      setAuthStatus({
        authenticated: true,
        user: data.user,
        loading: false
      });
      setIsAuthenticating(false);
      setError(null);
      setDeviceCode(null);
      
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
    });

    window.electronAPI.onAuthRestored((data) => {
      setAuthStatus({
        authenticated: true,
        user: data.user,
        loading: false
      });
      
      if (onAuthSuccess) {
        onAuthSuccess(data.user);
      }
    });

    window.electronAPI.onAuthError((error) => {
      setError(error.message || 'Authentication failed');
      setIsAuthenticating(false);
      setDeviceCode(null);
    });

    window.electronAPI.onAuthLogout(() => {
      setAuthStatus({
        authenticated: false,
        user: null,
        loading: false
      });
      setError(null);
      setDeviceCode(null);
    });

    window.electronAPI.onDeviceCodeRequired((data) => {
      setDeviceCode(data);
      setError(null);
    });

    window.electronAPI.onDeviceCodeExpired(() => {
      setDeviceCode(null);
      setIsAuthenticating(false);
      setError('Device code expired. Please try again.');
    });
  };

  const handleBrowserAuth = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const result = await window.electronAPI.authAuthenticateWithBrowser();
      
      if (result.success) {
        // Browser will open, wait for callback
        console.log('Browser authentication initiated');
      } else {
        throw new Error(result.message || 'Failed to start browser authentication');
      }
    } catch (error) {
      setError(error.message);
      setIsAuthenticating(false);
    }
  };

  const handleDeviceCodeAuth = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const result = await window.electronAPI.authAuthenticateWithDeviceCode();
      
      if (result.success) {
        // Device code flow started, wait for device-code-required event
        console.log('Device code authentication initiated');
      } else {
        throw new Error(result.message || 'Failed to start device code authentication');
      }
    } catch (error) {
      setError(error.message);
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await window.electronAPI.authLogout();
    } catch (error) {
      setError(error.message);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  if (authStatus.loading) {
    return (
      <div className="authentication loading">
        <div className="loading-spinner"></div>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  if (authStatus.authenticated) {
    return (
      <div className="authentication authenticated">
        <div className="auth-success">
          <div className="user-info">
            <div className="user-avatar">
              {authStatus.user?.avatar ? (
                <img src={authStatus.user.avatar} alt={authStatus.user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {authStatus.user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="user-details">
              <h3>Welcome, {authStatus.user?.name || 'User'}!</h3>
              <p>{authStatus.user?.email}</p>
              <div className="auth-badge">
                <span className="status-indicator authenticated"></span>
                Authenticated
              </div>
            </div>
          </div>
          <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="authentication">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Sign in to HomeHost</h2>
          <p>Connect to the cloud to sync your servers, join communities, and access the plugin marketplace.</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {deviceCode && (
          <div className="device-code-instructions">
            <h3>Device Authentication Required</h3>
            <div className="device-code-steps">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <p>Go to this URL on any device:</p>
                  <div className="code-display">
                    <code>{deviceCode.verificationUri}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(deviceCode.verificationUri)}
                      title="Copy URL"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <p>Enter this code:</p>
                  <div className="code-display user-code">
                    <code>{deviceCode.userCode}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(deviceCode.userCode)}
                      title="Copy code"
                    >
                      📋
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="device-code-status">
              <div className="loading-spinner small"></div>
              <p>Waiting for authentication... Code expires in {Math.ceil(deviceCode.expiresIn / 60)} minutes</p>
            </div>
          </div>
        )}

        {!deviceCode && (
          <div className="auth-methods">
            <div className="auth-method-selector">
              <label>
                <input
                  type="radio"
                  name="authMethod"
                  value="browser"
                  checked={authMethod === 'browser'}
                  onChange={(e) => setAuthMethod(e.target.value)}
                />
                <span className="radio-label">
                  <span className="method-icon">🌐</span>
                  <span className="method-details">
                    <strong>Browser Authentication</strong>
                    <small>Opens your default browser for secure sign-in</small>
                  </span>
                </span>
              </label>
              
              <label>
                <input
                  type="radio"
                  name="authMethod"
                  value="device"
                  checked={authMethod === 'device'}
                  onChange={(e) => setAuthMethod(e.target.value)}
                />
                <span className="radio-label">
                  <span className="method-icon">📱</span>
                  <span className="method-details">
                    <strong>Device Code</strong>
                    <small>Use any device to sign in with a code</small>
                  </span>
                </span>
              </label>
            </div>

            <div className="auth-actions">
              {authMethod === 'browser' ? (
                <button
                  className="btn btn-primary auth-btn"
                  onClick={handleBrowserAuth}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Opening Browser...' : 'Sign in with Browser'}
                </button>
              ) : (
                <button
                  className="btn btn-primary auth-btn"
                  onClick={handleDeviceCodeAuth}
                  disabled={isAuthenticating}
                >
                  {isAuthenticating ? 'Generating Code...' : 'Get Device Code'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="auth-footer">
          <div className="benefits">
            <h4>Why sign in?</h4>
            <ul>
              <li>🔄 Sync servers across devices</li>
              <li>🏘️ Join gaming communities</li>
              <li>🔌 Access plugin marketplace</li>
              <li>📊 View analytics and insights</li>
              <li>💰 Enable monetization features</li>
            </ul>
          </div>
          
          <div className="privacy-note">
            <p>
              <small>
                Your data is encrypted and secure. We never share your information.
                <a href="#" className="privacy-link">Privacy Policy</a>
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;