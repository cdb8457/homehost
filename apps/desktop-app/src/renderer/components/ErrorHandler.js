const React = require('react');
const { useState, useEffect } = React;
const './ErrorHandler.css';

/**
 * ErrorHandler Component - User interface for error notifications and system health
 * 
 * Provides real-time error notifications, system health monitoring,
 * and user-friendly error recovery actions.
 */
function ErrorHandler() {
  const [notifications, setNotifications] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    lastCheck: null,
    issues: [],
    uptime: 0
  });
  const [errorHistory, setErrorHistory] = useState([]);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeErrorHandler();
    return () => {
      // Cleanup listeners on unmount
      window.electronAPI.removeAllListeners('error-notification');
      window.electronAPI.removeAllListeners('system-health-update');
      window.electronAPI.removeAllListeners('error-history-update');
    };
  }, []);

  const initializeErrorHandler = async () => {
    try {
      // Set up IPC listeners for error events
      window.electronAPI.on('error-notification', handleErrorNotification);
      window.electronAPI.on('system-health-update', handleSystemHealthUpdate);
      window.electronAPI.on('error-history-update', handleErrorHistoryUpdate);
      
      // Get initial system health
      const health = await window.electronAPI.invoke('error-handler-get-system-health');
      setSystemHealth(health);
      
      // Get initial error history
      const history = await window.electronAPI.invoke('error-handler-get-error-history', { limit: 50 });
      setErrorHistory(history);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize error handler UI:', error);
    }
  };

  const handleErrorNotification = (notification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev.slice(0, 4)]; // Keep last 5
      return newNotifications;
    });
    
    // Auto-dismiss non-critical notifications after 10 seconds
    if (notification.type !== 'error') {
      setTimeout(() => {
        dismissNotification(notification.errorId);
      }, 10000);
    }
  };

  const handleSystemHealthUpdate = (health) => {
    setSystemHealth(health);
  };

  const handleErrorHistoryUpdate = (history) => {
    setErrorHistory(history);
  };

  const dismissNotification = (errorId) => {
    setNotifications(prev => prev.filter(n => n.errorId !== errorId));
  };

  const handleNotificationAction = async (notification, action) => {
    try {
      switch (action) {
        case 'authenticate':
          // Trigger authentication flow
          await window.electronAPI.invoke('auth-service-authenticate-with-browser');
          break;
          
        case 'retry':
          // Retry the failed operation
          await window.electronAPI.invoke('error-handler-retry-operation', { errorId: notification.errorId });
          break;
          
        case 'restart':
          // Restart the application
          await window.electronAPI.invoke('app-restart');
          break;
          
        case 'view-details':
          // Show error details
          const errorDetails = await window.electronAPI.invoke('error-handler-get-error-details', { errorId: notification.errorId });
          setSelectedError(errorDetails);
          setShowErrorDetails(true);
          break;
      }
      
      // Dismiss notification after action
      dismissNotification(notification.errorId);
    } catch (error) {
      console.error('Failed to handle notification action:', error);
    }
  };

  const clearErrorHistory = async () => {
    try {
      await window.electronAPI.invoke('error-handler-clear-history');
      setErrorHistory([]);
    } catch (error) {
      console.error('Failed to clear error history:', error);
    }
  };

  const getHealthStatusClass = (status) => {
    switch (status) {
      case 'healthy': return 'health-status-healthy';
      case 'warning': return 'health-status-warning';
      case 'critical': return 'health-status-critical';
      default: return 'health-status-unknown';
    }
  };

  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'error': return 'notification-error';
      case 'warning': return 'notification-warning';
      case 'info': return 'notification-info';
      default: return 'notification-info';
    }
  };

  const formatUptime = (uptime) => {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isInitialized) {
    return (
      <div className="error-handler-loading">
        <div className="loading-spinner"></div>
        <p>Initializing error monitoring...</p>
      </div>
    );
  }

  return (
    <div className="error-handler">
      {/* Notification Toast Container */}
      <div className="notification-container">
        {notifications.map((notification) => (
          <div
            key={notification.errorId}
            className={`notification ${getNotificationTypeClass(notification.type)}`}
          >
            <div className="notification-header">
              <h4>{notification.title}</h4>
              <button
                className="notification-close"
                onClick={() => dismissNotification(notification.errorId)}
              >
                ×
              </button>
            </div>
            <p className="notification-message">{notification.message}</p>
            <div className="notification-actions">
              {notification.actions.map((action, index) => (
                <button
                  key={index}
                  className={`notification-action action-${action.action}`}
                  onClick={() => handleNotificationAction(notification, action.action)}
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className="notification-timestamp">
              {formatTimestamp(notification.timestamp)}
            </div>
          </div>
        ))}
      </div>

      {/* System Health Display */}
      <div className="system-health-widget">
        <div className="health-header">
          <div className={`health-indicator ${getHealthStatusClass(systemHealth.status)}`}></div>
          <h3>System Health</h3>
          <span className="uptime">Uptime: {formatUptime(systemHealth.uptime)}</span>
        </div>
        
        {systemHealth.issues.length > 0 && (
          <div className="health-issues">
            <h4>Active Issues ({systemHealth.issues.length})</h4>
            <ul>
              {systemHealth.issues.map((issue, index) => (
                <li key={index} className={`issue-${issue.severity}`}>
                  <span className="issue-type">{issue.type.replace('_', ' ')}</span>
                  <span className="issue-description">{issue.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="health-last-check">
          Last check: {systemHealth.lastCheck ? formatTimestamp(systemHealth.lastCheck) : 'Never'}
        </div>
      </div>

      {/* Error History Panel */}
      <div className="error-history-panel">
        <div className="error-history-header">
          <h3>Recent Errors</h3>
          <div className="error-history-actions">
            <button 
              className="clear-history-btn"
              onClick={clearErrorHistory}
              disabled={errorHistory.length === 0}
            >
              Clear History
            </button>
          </div>
        </div>
        
        {errorHistory.length === 0 ? (
          <div className="no-errors">
            <p>No recent errors - system running smoothly!</p>
          </div>
        ) : (
          <div className="error-list">
            {errorHistory.map((error, index) => (
              <div key={error.id} className={`error-item severity-${error.severity}`}>
                <div className="error-item-header">
                  <span className="error-category">{error.category.replace('_', ' ')}</span>
                  <span className="error-timestamp">{formatTimestamp(error.timestamp)}</span>
                </div>
                <div className="error-message">{error.error.message}</div>
                <div className="error-status">
                  {error.resolved ? (
                    <span className="status-resolved">✓ Resolved</span>
                  ) : error.recoveryAttempts > 0 ? (
                    <span className="status-recovery">⚡ Auto-recovery attempted</span>
                  ) : (
                    <span className="status-unresolved">⚠ Unresolved</span>
                  )}
                </div>
                <button
                  className="view-details-btn"
                  onClick={() => {
                    setSelectedError(error);
                    setShowErrorDetails(true);
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Details Modal */}
      {showErrorDetails && selectedError && (
        <div className="error-details-modal">
          <div className="modal-overlay" onClick={() => setShowErrorDetails(false)}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Error Details</h3>
              <button
                className="modal-close"
                onClick={() => setShowErrorDetails(false)}
              >
                ×
              </button>
            </div>
            
            <div className="error-details">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Error ID:</label>
                    <span>{selectedError.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{selectedError.category}</span>
                  </div>
                  <div className="detail-item">
                    <label>Severity:</label>
                    <span className={`severity-${selectedError.severity}`}>{selectedError.severity}</span>
                  </div>
                  <div className="detail-item">
                    <label>Timestamp:</label>
                    <span>{formatTimestamp(selectedError.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Error Message</h4>
                <div className="error-message-detail">{selectedError.error.message}</div>
              </div>
              
              {selectedError.error.stack && (
                <div className="detail-section">
                  <h4>Stack Trace</h4>
                  <pre className="stack-trace">{selectedError.error.stack}</pre>
                </div>
              )}
              
              {selectedError.context && Object.keys(selectedError.context).length > 0 && (
                <div className="detail-section">
                  <h4>Context</h4>
                  <pre className="context-data">{JSON.stringify(selectedError.context, null, 2)}</pre>
                </div>
              )}
              
              {selectedError.recoveryData && (
                <div className="detail-section">
                  <h4>Recovery Information</h4>
                  <div className="recovery-info">
                    <p><strong>Attempts:</strong> {selectedError.recoveryAttempts}</p>
                    {selectedError.recoveryAction && (
                      <p><strong>Action Taken:</strong> {selectedError.recoveryAction}</p>
                    )}
                    {selectedError.recoveryFailReason && (
                      <p><strong>Failure Reason:</strong> {selectedError.recoveryFailReason}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

module.exports = ErrorHandler;
