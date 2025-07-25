const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;

/**
 * ErrorManager - Centralized error handling and reporting for HomeHost
 * 
 * Provides consistent error handling, logging, user notifications,
 * and automatic error recovery across all services.
 */
class ErrorManager extends EventEmitter {
  constructor(store) {
    super();
    this.store = store;
    this.errorQueue = [];
    this.errorStats = {
      totalErrors: 0,
      criticalErrors: 0,
      warningsCount: 0,
      lastErrorTime: null,
      topErrorTypes: {}
    };
    
    // Error handling configuration
    this.config = {
      maxErrorQueueSize: 100,
      autoReportCritical: true,
      showUserNotifications: true,
      logToFile: true,
      retryAttempts: 3,
      retryDelay: 1000 // ms
    };
  }

  async initialize() {
    try {
      console.log('Initializing ErrorManager...');
      
      // Load error handling preferences
      const savedConfig = this.store.get('errorManager.config', {});
      this.config = { ...this.config, ...savedConfig };
      
      // Load error statistics
      this.errorStats = this.store.get('errorManager.stats', this.errorStats);
      
      // Set up uncaught exception handlers
      this.setupGlobalErrorHandlers();
      
      console.log('ErrorManager initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize ErrorManager:', error);
      throw error;
    }
  }

  setupGlobalErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.handleCriticalError('uncaught_exception', error, {
        fatal: true,
        context: 'Global process exception'
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleError('unhandled_rejection', reason, {
        severity: 'high',
        context: 'Unhandled promise rejection',
        promise: promise
      });
    });
  }

  /**
   * Handle errors with categorization and appropriate response
   */
  handleError(type, error, context = {}) {
    const errorInfo = this.categorizeError(type, error, context);
    
    // Add to error queue
    this.errorQueue.push(errorInfo);
    if (this.errorQueue.length > this.config.maxErrorQueueSize) {
      this.errorQueue.shift(); // Remove oldest error
    }
    
    // Update statistics
    this.updateErrorStats(errorInfo);
    
    // Log the error
    this.logError(errorInfo);
    
    // Emit event for other services to handle
    this.emit('error-logged', errorInfo);
    
    // Handle based on severity
    switch (errorInfo.severity) {
      case 'critical':
        this.handleCriticalError(type, error, context);
        break;
      case 'high':
        this.handleHighSeverityError(errorInfo);
        break;
      case 'medium':
        this.handleMediumSeverityError(errorInfo);
        break;
      case 'low':
        this.handleLowSeverityError(errorInfo);
        break;
    }
    
    return errorInfo;
  }

  categorizeError(type, error, context) {
    const timestamp = new Date();
    const errorInfo = {
      id: this.generateErrorId(),
      type,
      message: error?.message || error?.toString() || 'Unknown error',
      stack: error?.stack,
      timestamp,
      context,
      severity: this.determineSeverity(type, error, context),
      service: context.service || 'unknown',
      retryable: this.isRetryable(type, error),
      userVisible: this.shouldShowToUser(type, error, context)
    };

    // Add recovery suggestions
    errorInfo.suggestions = this.getRecoverySuggestions(errorInfo);
    
    return errorInfo;
  }

  determineSeverity(type, error, context) {
    // Critical errors that can crash the app
    const criticalTypes = [
      'uncaught_exception',
      'database_corruption',
      'auth_system_failure',
      'core_service_crash'
    ];
    
    // High severity errors that break major functionality
    const highSeverityTypes = [
      'steam_service_failure',
      'plugin_security_violation',
      'server_deployment_failure',
      'authentication_failure'
    ];
    
    // Medium severity errors that impact user experience
    const mediumSeverityTypes = [
      'network_timeout',
      'file_permission_error',
      'configuration_error',
      'plugin_compatibility_error'
    ];

    if (criticalTypes.includes(type) || context.fatal) {
      return 'critical';
    } else if (highSeverityTypes.includes(type) || error?.severity === 'high') {
      return 'high';
    } else if (mediumSeverityTypes.includes(type) || error?.severity === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  isRetryable(type, error) {
    const retryableTypes = [
      'network_timeout',
      'temporary_file_lock',
      'rate_limit_exceeded',
      'service_temporarily_unavailable'
    ];
    
    const nonRetryableTypes = [
      'authentication_invalid',
      'permission_denied',
      'file_not_found',
      'validation_error',
      'plugin_security_violation'
    ];
    
    if (nonRetryableTypes.includes(type)) return false;
    if (retryableTypes.includes(type)) return true;
    
    // Check error message for retry indicators
    const message = error?.message?.toLowerCase() || '';
    if (message.includes('timeout') || message.includes('temporary')) return true;
    if (message.includes('invalid') || message.includes('denied')) return false;
    
    return false; // Default to non-retryable for safety
  }

  shouldShowToUser(type, error, context) {
    // Don't show internal errors or debug info to users
    const internalTypes = [
      'debug_warning',
      'performance_metric',
      'internal_state_change'
    ];
    
    if (internalTypes.includes(type) || context.internal) return false;
    
    // Show user-facing errors
    const userFacingTypes = [
      'server_deployment_failure',
      'authentication_failure',
      'steam_login_required',
      'plugin_installation_failed'
    ];
    
    return userFacingTypes.includes(type) || context.userVisible;
  }

  getRecoverySuggestions(errorInfo) {
    const suggestions = [];
    
    switch (errorInfo.type) {
      case 'steam_service_failure':
        suggestions.push('Check Steam is running and you are logged in');
        suggestions.push('Verify SteamCMD installation');
        suggestions.push('Restart Steam and try again');
        break;
        
      case 'authentication_failure':
        suggestions.push('Check your internet connection');
        suggestions.push('Verify your credentials are correct');
        suggestions.push('Try logging out and back in');
        break;
        
      case 'server_deployment_failure':
        suggestions.push('Check available disk space');
        suggestions.push('Verify folder permissions');
        suggestions.push('Try deploying to a different location');
        break;
        
      case 'plugin_installation_failed':
        suggestions.push('Check the plugin is compatible with your game version');
        suggestions.push('Verify the plugin file is not corrupted');
        suggestions.push('Try restarting the application');
        break;
        
      case 'network_timeout':
        suggestions.push('Check your internet connection');
        suggestions.push('Try again in a few moments');
        suggestions.push('Verify firewall settings');
        break;
        
      default:
        suggestions.push('Try restarting the application');
        suggestions.push('Check the application logs for more details');
        break;
    }
    
    return suggestions;
  }

  handleCriticalError(type, error, context) {
    console.error(`🚨 CRITICAL ERROR [${type}]:`, error);
    
    this.errorStats.criticalErrors++;
    
    // Emit critical error event
    this.emit('critical-error', { type, error, context });
    
    // Save current state before potential crash
    this.saveEmergencyState();
    
    // Show critical error dialog to user
    if (context.userVisible !== false) {
      this.showCriticalErrorDialog(type, error);
    }
    
    // Attempt graceful shutdown if fatal
    if (context.fatal) {
      this.initiateGracefulShutdown(error);
    }
  }

  handleHighSeverityError(errorInfo) {
    console.error(`⚠️ HIGH SEVERITY ERROR [${errorInfo.type}]:`, errorInfo.message);
    
    // Attempt automatic recovery if possible
    if (errorInfo.retryable) {
      this.scheduleRetry(errorInfo);
    }
    
    // Notify user if appropriate
    if (errorInfo.userVisible && this.config.showUserNotifications) {
      this.showErrorNotification(errorInfo);
    }
    
    this.emit('high-severity-error', errorInfo);
  }

  handleMediumSeverityError(errorInfo) {
    console.warn(`⚠️ MEDIUM SEVERITY ERROR [${errorInfo.type}]:`, errorInfo.message);
    
    // Log for monitoring but don't interrupt user flow
    this.emit('medium-severity-error', errorInfo);
    
    // Show subtle notification if user-facing
    if (errorInfo.userVisible) {
      this.showSubtleNotification(errorInfo);
    }
  }

  handleLowSeverityError(errorInfo) {
    console.info(`ℹ️ LOW SEVERITY ERROR [${errorInfo.type}]:`, errorInfo.message);
    
    // Just log for debugging purposes
    this.emit('low-severity-error', errorInfo);
  }

  async scheduleRetry(errorInfo, attempt = 1) {
    if (attempt > this.config.retryAttempts) {
      console.error(`❌ Retry limit exceeded for error: ${errorInfo.type}`);
      this.emit('retry-failed', errorInfo);
      return;
    }
    
    const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
    
    console.log(`🔄 Scheduling retry ${attempt}/${this.config.retryAttempts} for ${errorInfo.type} in ${delay}ms`);
    
    setTimeout(() => {
      this.emit('retry-attempt', { errorInfo, attempt });
    }, delay);
  }

  async logError(errorInfo) {
    if (!this.config.logToFile) return;
    
    try {
      const logEntry = {
        ...errorInfo,
        appVersion: process.env.npm_package_version || 'unknown'
      };
      
      // Add to persistent log
      const errorLog = this.store.get('errorManager.log', []);
      errorLog.push(logEntry);
      
      // Keep only last 1000 errors
      if (errorLog.length > 1000) {
        errorLog.splice(0, errorLog.length - 1000);
      }
      
      this.store.set('errorManager.log', errorLog);
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  updateErrorStats(errorInfo) {
    this.errorStats.totalErrors++;
    this.errorStats.lastErrorTime = errorInfo.timestamp;
    
    if (errorInfo.severity === 'critical') {
      this.errorStats.criticalErrors++;
    }
    
    if (errorInfo.severity === 'low') {
      this.errorStats.warningsCount++;
    }
    
    // Track error types
    if (!this.errorStats.topErrorTypes[errorInfo.type]) {
      this.errorStats.topErrorTypes[errorInfo.type] = 0;
    }
    this.errorStats.topErrorTypes[errorInfo.type]++;
    
    // Save stats
    this.store.set('errorManager.stats', this.errorStats);
  }

  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  saveEmergencyState() {
    try {
      const emergencyState = {
        timestamp: new Date(),
        recentErrors: this.errorQueue.slice(-10),
        stats: this.errorStats
      };
      
      this.store.set('errorManager.emergencyState', emergencyState);
    } catch (error) {
      console.error('Failed to save emergency state:', error);
    }
  }

  showCriticalErrorDialog(type, error) {
    // This would show a user dialog in the real implementation
    this.emit('show-critical-dialog', {
      title: 'Critical Error Occurred',
      message: `A critical error has occurred: ${error.message || error}`,
      type,
      suggestions: this.getRecoverySuggestions({ type, error })
    });
  }

  showErrorNotification(errorInfo) {
    this.emit('show-notification', {
      type: 'error',
      title: 'Error Occurred',
      message: errorInfo.message,
      suggestions: errorInfo.suggestions,
      duration: 8000
    });
  }

  showSubtleNotification(errorInfo) {
    this.emit('show-notification', {
      type: 'warning',
      title: 'Warning',
      message: errorInfo.message,
      duration: 5000
    });
  }

  initiateGracefulShutdown(error) {
    console.log('🛑 Initiating graceful shutdown due to critical error...');
    this.emit('graceful-shutdown-requested', error);
  }

  // Public API methods
  getErrorStats() {
    return { ...this.errorStats };
  }

  getRecentErrors(limit = 10) {
    return this.errorQueue.slice(-limit);
  }

  clearErrorHistory() {
    this.errorQueue = [];
    this.store.delete('errorManager.log');
    this.emit('error-history-cleared');
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.store.set('errorManager.config', this.config);
  }
}

module.exports = ErrorManager;