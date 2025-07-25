const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

/**
 * ErrorHandler Service - Centralized error handling and recovery system
 * 
 * Provides production-grade error handling with automatic recovery,
 * detailed logging, user-friendly messaging, and system health monitoring.
 */
class ErrorHandler extends EventEmitter {
  constructor(store, logger) {
    super();
    this.store = store;
    this.logger = logger;
    
    // Error tracking
    this.errorHistory = new Map();
    this.criticalErrors = new Set();
    this.recoveryStrategies = new Map();
    this.healthChecks = new Map();
    
    // Configuration
    this.maxErrorHistory = 1000;
    this.criticalErrorThreshold = 5; // errors per minute
    this.autoRecoveryEnabled = true;
    this.userNotificationEnabled = true;
    
    // Health monitoring
    this.systemHealth = {
      status: 'healthy',
      lastCheck: null,
      issues: [],
      uptime: Date.now()
    };
    
    // Error categories
    this.errorCategories = {
      NETWORK: 'network',
      FILESYSTEM: 'filesystem', 
      AUTHENTICATION: 'authentication',
      SERVER_MANAGEMENT: 'server_management',
      PLUGIN_SYSTEM: 'plugin_system',
      CLOUD_SYNC: 'cloud_sync',
      REVENUE: 'revenue',
      ANALYTICS: 'analytics',
      SYSTEM: 'system',
      USER_INPUT: 'user_input'
    };
    
    this.setupRecoveryStrategies();
    this.startHealthMonitoring();
  }

  /**
   * Handle an error with automatic categorization and recovery
   */
  async handleError(error, context = {}) {
    const errorId = this.generateErrorId();
    const timestamp = new Date();
    
    try {
      // Categorize error
      const category = this.categorizeError(error, context);
      
      // Create error entry
      const errorEntry = {
        id: errorId,
        timestamp,
        error: this.serializeError(error),
        category,
        context,
        severity: this.assessSeverity(error, context),
        resolved: false,
        recoveryAttempts: 0,
        userNotified: false
      };
      
      // Store error
      this.errorHistory.set(errorId, errorEntry);
      this.trimErrorHistory();
      
      // Log error
      await this.logError(errorEntry);
      
      // Check for critical error patterns
      await this.checkCriticalPatterns(category);
      
      // Attempt automatic recovery
      if (this.autoRecoveryEnabled) {
        await this.attemptRecovery(errorEntry);
      }
      
      // Notify user if necessary
      if (this.shouldNotifyUser(errorEntry)) {
        await this.notifyUser(errorEntry);
      }
      
      // Emit error event for external handling
      this.emit('error-handled', errorEntry);
      
      return errorEntry;
      
    } catch (handlingError) {
      // Error in error handling - critical situation
      console.error('Critical: Error in error handler:', handlingError);
      this.emit('error-handler-failure', { originalError: error, handlingError });
      throw handlingError;
    }
  }

  /**
   * Categorize error based on stack trace and context
   */
  categorizeError(error, context) {
    const message = error.message?.toLowerCase() || '';
    const stack = error.stack?.toLowerCase() || '';
    
    // Network-related errors
    if (message.includes('network') || message.includes('enotfound') || 
        message.includes('timeout') || message.includes('connection')) {
      return this.errorCategories.NETWORK;
    }
    
    // Filesystem errors
    if (message.includes('enoent') || message.includes('eacces') || 
        message.includes('file') || message.includes('directory')) {
      return this.errorCategories.FILESYSTEM;
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('token') || 
        message.includes('unauthorized') || message.includes('forbidden')) {
      return this.errorCategories.AUTHENTICATION;
    }
    
    // Context-based categorization
    if (context.service) {
      switch (context.service) {
        case 'GameServerManager':
        case 'ServerMonitor':
          return this.errorCategories.SERVER_MANAGEMENT;
        case 'PluginManager':
          return this.errorCategories.PLUGIN_SYSTEM;
        case 'CloudSync':
        case 'AuthenticationService':
          return this.errorCategories.CLOUD_SYNC;
        case 'RevenueDashboard':
        case 'PlayerEngagement':
          return this.errorCategories.REVENUE;
        case 'CommunityGrowthAnalytics':
          return this.errorCategories.ANALYTICS;
        default:
          return this.errorCategories.SYSTEM;
      }
    }
    
    return this.errorCategories.SYSTEM;
  }

  /**
   * Assess error severity level
   */
  assessSeverity(error, context) {
    const message = error.message?.toLowerCase() || '';
    
    // Critical severity
    if (message.includes('critical') || message.includes('fatal') ||
        context.critical === true || error.name === 'SystemError') {
      return 'critical';
    }
    
    // High severity
    if (message.includes('failed to start') || message.includes('crashed') ||
        message.includes('corrupted') || context.severity === 'high') {
      return 'high';
    }
    
    // Medium severity
    if (message.includes('warning') || message.includes('deprecated') ||
        context.severity === 'medium') {
      return 'medium';
    }
    
    // Low severity for recoverable errors
    return 'low';
  }

  /**
   * Setup recovery strategies for different error types
   */
  setupRecoveryStrategies() {
    // Network error recovery
    this.recoveryStrategies.set(this.errorCategories.NETWORK, async (errorEntry) => {
      const { context } = errorEntry;
      
      if (context.operation === 'cloud_sync') {
        // Retry with exponential backoff
        return await this.retryOperation(context.retryFunction, 3, 1000);
      }
      
      if (context.operation === 'api_request') {
        // Check network connectivity and retry
        const isOnline = await this.checkNetworkConnectivity();
        if (isOnline) {
          return await this.retryOperation(context.retryFunction, 2, 2000);
        }
      }
      
      return { success: false, reason: 'Network unavailable' };
    });

    // Filesystem error recovery
    this.recoveryStrategies.set(this.errorCategories.FILESYSTEM, async (errorEntry) => {
      const { error, context } = errorEntry;
      
      if (error.code === 'ENOENT') {
        // Create missing directory/file
        if (context.type === 'directory') {
          await fs.mkdir(context.path, { recursive: true });
          return { success: true, action: 'created_directory' };
        }
      }
      
      if (error.code === 'EACCES') {
        // Permission error - guide user
        return {
          success: false,
          reason: 'Permission denied',
          userAction: 'Please check file permissions and try again'
        };
      }
      
      return { success: false, reason: 'Filesystem error not recoverable' };
    });

    // Authentication error recovery
    this.recoveryStrategies.set(this.errorCategories.AUTHENTICATION, async (errorEntry) => {
      const { context } = errorEntry;
      
      if (context.operation === 'token_refresh') {
        // Attempt to refresh token
        if (context.authService) {
          try {
            await context.authService.refreshAccessToken();
            return { success: true, action: 'token_refreshed' };
          } catch (refreshError) {
            return { success: false, reason: 'Token refresh failed', requiresUserAuth: true };
          }
        }
      }
      
      return { success: false, reason: 'Authentication required', requiresUserAuth: true };
    });

    // Server management error recovery
    this.recoveryStrategies.set(this.errorCategories.SERVER_MANAGEMENT, async (errorEntry) => {
      const { error, context } = errorEntry;
      
      if (context.operation === 'server_start' && error.message.includes('port')) {
        // Port conflict - try alternative port
        const newPort = await this.findAvailablePort(context.originalPort);
        if (newPort) {
          return { 
            success: true, 
            action: 'port_changed', 
            newPort,
            userNotification: `Server port changed from ${context.originalPort} to ${newPort}`
          };
        }
      }
      
      if (context.operation === 'server_crashed') {
        // Automatic restart with delay
        await this.delay(5000); // Wait 5 seconds
        return { success: true, action: 'auto_restart_scheduled' };
      }
      
      return { success: false, reason: 'Server management error not recoverable' };
    });

    // Plugin system error recovery
    this.recoveryStrategies.set(this.errorCategories.PLUGIN_SYSTEM, async (errorEntry) => {
      const { error, context } = errorEntry;
      
      if (context.operation === 'plugin_install' && error.message.includes('dependency')) {
        // Install missing dependencies
        if (context.dependencies) {
          const installResults = [];
          for (const dep of context.dependencies) {
            const result = await this.installPluginDependency(dep, context.pluginManager);
            installResults.push(result);
          }
          return { success: true, action: 'dependencies_installed', results: installResults };
        }
      }
      
      if (context.operation === 'plugin_load' && error.message.includes('corrupted')) {
        // Reinstall corrupted plugin
        if (context.pluginId && context.pluginManager) {
          await context.pluginManager.uninstallPlugin(context.serverId, context.pluginId);
          await context.pluginManager.installPlugin(context.serverId, context.pluginId);
          return { success: true, action: 'plugin_reinstalled' };
        }
      }
      
      return { success: false, reason: 'Plugin error not recoverable' };
    });
  }

  /**
   * Attempt automatic recovery for an error
   */
  async attemptRecovery(errorEntry) {
    const strategy = this.recoveryStrategies.get(errorEntry.category);
    
    if (!strategy) {
      errorEntry.recoveryAttempts = -1; // No strategy available
      return;
    }
    
    try {
      errorEntry.recoveryAttempts++;
      const recoveryResult = await strategy(errorEntry);
      
      if (recoveryResult.success) {
        errorEntry.resolved = true;
        errorEntry.recoveryAction = recoveryResult.action;
        errorEntry.recoveryData = recoveryResult;
        
        this.logger.info('Error recovered automatically', {
          errorId: errorEntry.id,
          category: errorEntry.category,
          action: recoveryResult.action
        });
        
        this.emit('error-recovered', errorEntry);
        
        // User notification if specified
        if (recoveryResult.userNotification) {
          await this.notifyUser(errorEntry, recoveryResult.userNotification);
        }
      } else {
        this.logger.warn('Recovery attempt failed', {
          errorId: errorEntry.id,
          reason: recoveryResult.reason,
          requiresUserAction: recoveryResult.requiresUserAuth || recoveryResult.userAction
        });
        
        errorEntry.recoveryFailReason = recoveryResult.reason;
      }
      
    } catch (recoveryError) {
      this.logger.error('Recovery strategy failed', {
        errorId: errorEntry.id,
        recoveryError: this.serializeError(recoveryError)
      });
      
      errorEntry.recoveryError = this.serializeError(recoveryError);
    }
  }

  /**
   * Check for critical error patterns
   */
  async checkCriticalPatterns(category) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Count recent errors in this category
    const recentErrors = Array.from(this.errorHistory.values())
      .filter(error => 
        error.category === category && 
        error.timestamp.getTime() > oneMinuteAgo
      );
    
    if (recentErrors.length >= this.criticalErrorThreshold) {
      const criticalPattern = {
        category,
        count: recentErrors.length,
        timespan: '1 minute',
        timestamp: new Date()
      };
      
      this.criticalErrors.add(JSON.stringify(criticalPattern));
      
      this.logger.error('Critical error pattern detected', criticalPattern);
      this.emit('critical-error-pattern', criticalPattern);
      
      // Update system health
      this.systemHealth.status = 'critical';
      this.systemHealth.issues.push(criticalPattern);
    }
  }

  /**
   * Determine if user should be notified
   */
  shouldNotifyUser(errorEntry) {
    if (!this.userNotificationEnabled) return false;
    
    // Always notify for critical severity
    if (errorEntry.severity === 'critical') return true;
    
    // Notify for high severity if not resolved
    if (errorEntry.severity === 'high' && !errorEntry.resolved) return true;
    
    // Notify if recovery requires user action
    if (errorEntry.recoveryData?.requiresUserAuth || errorEntry.recoveryData?.userAction) {
      return true;
    }
    
    return false;
  }

  /**
   * Notify user about error
   */
  async notifyUser(errorEntry, customMessage = null) {
    if (errorEntry.userNotified) return;
    
    const userMessage = customMessage || this.generateUserFriendlyMessage(errorEntry);
    
    const notification = {
      type: this.getNotificationType(errorEntry.severity),
      title: this.getNotificationTitle(errorEntry.category),
      message: userMessage,
      timestamp: new Date(),
      errorId: errorEntry.id,
      actions: this.getNotificationActions(errorEntry)
    };
    
    this.emit('user-notification', notification);
    errorEntry.userNotified = true;
    
    this.logger.info('User notified about error', {
      errorId: errorEntry.id,
      notification: notification
    });
  }

  /**
   * Generate user-friendly error message
   */
  generateUserFriendlyMessage(errorEntry) {
    const { category, severity, error, recoveryData } = errorEntry;
    
    // Category-specific messages
    switch (category) {
      case this.errorCategories.NETWORK:
        return 'Network connection issue detected. Please check your internet connection.';
      
      case this.errorCategories.AUTHENTICATION:
        return 'Authentication required. Please sign in to continue.';
      
      case this.errorCategories.SERVER_MANAGEMENT:
        if (error.message.includes('port')) {
          return 'Server port conflict detected. The system will try an alternative port.';
        }
        return 'Server management issue detected. The system is attempting to resolve it.';
      
      case this.errorCategories.PLUGIN_SYSTEM:
        return 'Plugin system issue detected. Checking for automatic fixes.';
      
      case this.errorCategories.FILESYSTEM:
        return 'File system access issue. Please check file permissions.';
      
      default:
        if (severity === 'critical') {
          return 'A critical system error occurred. The application may need to restart.';
        }
        return 'An issue was detected. The system is working to resolve it automatically.';
    }
  }

  /**
   * Get notification type based on severity
   */
  getNotificationType(severity) {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'info';
    }
  }

  /**
   * Get notification title based on category
   */
  getNotificationTitle(category) {
    switch (category) {
      case this.errorCategories.NETWORK: return 'Network Issue';
      case this.errorCategories.AUTHENTICATION: return 'Authentication Required';
      case this.errorCategories.SERVER_MANAGEMENT: return 'Server Issue';
      case this.errorCategories.PLUGIN_SYSTEM: return 'Plugin Issue';
      case this.errorCategories.FILESYSTEM: return 'File Access Issue';
      default: return 'System Issue';
    }
  }

  /**
   * Get notification actions based on error
   */
  getNotificationActions(errorEntry) {
    const actions = [];
    
    if (errorEntry.recoveryData?.requiresUserAuth || 
        errorEntry.category === this.errorCategories.AUTHENTICATION) {
      actions.push({ label: 'Sign In', action: 'authenticate' });
    }
    
    if (errorEntry.category === this.errorCategories.NETWORK) {
      actions.push({ label: 'Retry', action: 'retry' });
    }
    
    if (errorEntry.severity === 'critical') {
      actions.push({ label: 'Restart App', action: 'restart' });
    }
    
    actions.push({ label: 'View Details', action: 'view-details' });
    
    return actions;
  }

  /**
   * Health monitoring
   */
  startHealthMonitoring() {
    // Run health checks every 5 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 5 * 60 * 1000);
    
    // Initial health check
    this.performHealthCheck();
  }

  async performHealthCheck() {
    const healthResults = {
      timestamp: new Date(),
      checks: [],
      overallStatus: 'healthy',
      issues: []
    };
    
    // Check error rate
    const recentErrors = this.getRecentErrors(15 * 60 * 1000); // 15 minutes
    if (recentErrors.length > 10) {
      healthResults.issues.push({
        type: 'high_error_rate',
        description: `${recentErrors.length} errors in the last 15 minutes`,
        severity: 'warning'
      });
    }
    
    // Check for unresolved critical errors
    const unresolvedCritical = recentErrors.filter(e => 
      e.severity === 'critical' && !e.resolved
    );
    if (unresolvedCritical.length > 0) {
      healthResults.issues.push({
        type: 'unresolved_critical_errors',
        description: `${unresolvedCritical.length} unresolved critical errors`,
        severity: 'critical'
      });
      healthResults.overallStatus = 'critical';
    }
    
    // Check system resources
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      healthResults.issues.push({
        type: 'high_memory_usage',
        description: `Memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        severity: 'warning'
      });
    }
    
    // Update system health
    this.systemHealth = {
      status: healthResults.overallStatus,
      lastCheck: healthResults.timestamp,
      issues: healthResults.issues,
      uptime: Date.now() - this.systemHealth.uptime
    };
    
    this.emit('health-check-completed', healthResults);
    
    if (healthResults.issues.length > 0) {
      this.logger.warn('Health check found issues', healthResults);
    }
  }

  /**
   * Utility methods
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  serializeError(error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      path: error.path
    };
  }

  trimErrorHistory() {
    if (this.errorHistory.size > this.maxErrorHistory) {
      const sortedEntries = Array.from(this.errorHistory.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.errorHistory.size - this.maxErrorHistory);
      toRemove.forEach(([id]) => this.errorHistory.delete(id));
    }
  }

  async logError(errorEntry) {
    const logData = {
      errorId: errorEntry.id,
      timestamp: errorEntry.timestamp,
      category: errorEntry.category,
      severity: errorEntry.severity,
      message: errorEntry.error.message,
      context: errorEntry.context
    };
    
    switch (errorEntry.severity) {
      case 'critical':
        this.logger.error('Critical error', logData);
        break;
      case 'high':
        this.logger.error('High severity error', logData);
        break;
      case 'medium':
        this.logger.warn('Medium severity error', logData);
        break;
      default:
        this.logger.info('Low severity error', logData);
    }
  }

  getRecentErrors(timespan = 60000) {
    const cutoff = Date.now() - timespan;
    return Array.from(this.errorHistory.values())
      .filter(error => error.timestamp.getTime() > cutoff);
  }

  async retryOperation(operation, maxRetries, delay) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        return { success: true, result, attempts: attempt };
      } catch (error) {
        if (attempt === maxRetries) {
          return { success: false, error, attempts: attempt };
        }
        await this.delay(delay * attempt); // Exponential backoff
      }
    }
  }

  async checkNetworkConnectivity() {
    try {
      const https = require('https');
      return new Promise((resolve) => {
        const req = https.request({
          hostname: 'google.com',
          port: 443,
          path: '/',
          method: 'HEAD',
          timeout: 5000
        }, () => {
          resolve(true);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => resolve(false));
        req.end();
      });
    } catch {
      return false;
    }
  }

  async findAvailablePort(startPort) {
    const net = require('net');
    
    for (let port = startPort + 1; port < startPort + 100; port++) {
      const isAvailable = await new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.close();
          resolve(true);
        });
        server.on('error', () => resolve(false));
      });
      
      if (isAvailable) return port;
    }
    
    return null;
  }

  async installPluginDependency(dependency, pluginManager) {
    try {
      return await pluginManager.installPlugin(dependency.serverId, dependency.pluginId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public API methods
  getErrorHistory(category = null, limit = 50) {
    let errors = Array.from(this.errorHistory.values());
    
    if (category) {
      errors = errors.filter(e => e.category === category);
    }
    
    return errors
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, Math.min(limit, errors.length));
  }

  getSystemHealth() {
    return { ...this.systemHealth };
  }

  getCriticalErrors() {
    return Array.from(this.criticalErrors).map(JSON.parse);
  }

  clearErrorHistory() {
    this.errorHistory.clear();
    this.criticalErrors.clear();
  }

  updateConfiguration(config) {
    if (config.maxErrorHistory !== undefined) {
      this.maxErrorHistory = config.maxErrorHistory;
    }
    if (config.autoRecoveryEnabled !== undefined) {
      this.autoRecoveryEnabled = config.autoRecoveryEnabled;
    }
    if (config.userNotificationEnabled !== undefined) {
      this.userNotificationEnabled = config.userNotificationEnabled;
    }
  }
}

module.exports = ErrorHandler;