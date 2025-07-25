const { EventEmitter } = require('events');
const os = require('os');
const fs = require('fs').promises;
const path = require('path');

/**
 * HealthCheckService - Production health monitoring and status reporting
 * 
 * Provides comprehensive health checking for production deployments including
 * system health, service availability, and performance metrics.
 */
class HealthCheckService extends EventEmitter {
  constructor(store, logger, services = {}) {
    super();
    this.store = store;
    this.logger = logger;
    this.services = services; // Injected services for health checking
    
    // Health check configuration
    this.config = {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 10000, // 10 seconds
      
      // Health check categories
      checks: {
        system: {
          enabled: true,
          priority: 'critical',
          checks: ['cpu', 'memory', 'disk', 'uptime']
        },
        services: {
          enabled: true,
          priority: 'critical',
          checks: ['database', 'security', 'performance', 'signalr']
        },
        external: {
          enabled: true,
          priority: 'warning',
          checks: ['internet', 'apis']
        },
        application: {
          enabled: true,
          priority: 'critical',
          checks: ['startup', 'errors', 'features']
        }
      },
      
      // Thresholds for health checks
      thresholds: {
        cpu: { warning: 70, critical: 85 },
        memory: { warning: 80, critical: 90 },
        disk: { warning: 85, critical: 95 },
        eventLoop: { warning: 100, critical: 500 },
        responseTime: { warning: 1000, critical: 3000 },
        errorRate: { warning: 0.05, critical: 0.1 } // 5% warning, 10% critical
      },
      
      // Alert configuration
      alerts: {
        enabled: true,
        cooldown: 300000, // 5 minutes between similar alerts
        escalation: {
          warning: { retries: 3, interval: 60000 }, // 1 minute
          critical: { retries: 1, interval: 30000 }  // 30 seconds
        }
      }
    };
    
    // Health status tracking
    this.currentHealth = {
      overall: 'unknown',
      lastCheck: null,
      checks: {},
      alerts: [],
      uptime: process.uptime(),
      startTime: Date.now()
    };
    
    // Health history for trend analysis
    this.healthHistory = [];
    this.maxHistorySize = 1000;
    
    // Alert state tracking
    this.alertStates = new Map();
    this.lastAlerts = new Map();
    
    // Check timers
    this.checkTimer = null;
    
    this.initialize();
  }

  /**
   * Initialize health check service
   */
  initialize() {
    try {
      console.log('🏥 Initializing Health Check Service...');
      
      // Load configuration
      this.loadConfiguration();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('✅ Health Check Service initialized successfully');
      this.emit('health-service-initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Health Check Service:', error);
      throw error;
    }
  }

  /**
   * Load configuration from store
   */
  loadConfiguration() {
    if (this.store && typeof this.store.get === 'function') {
      const storedConfig = this.store.get('health.config');
      if (storedConfig) {
        this.config = { ...this.config, ...storedConfig };
      }
      
      // Save current config
      this.store.set('health.config', this.config);
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    if (!this.config.enabled) {
      console.log('ℹ️ Health monitoring is disabled');
      return;
    }

    // Perform initial health check
    this.performHealthCheck();
    
    // Set up periodic health checks
    this.checkTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.interval);
    
    console.log(`🔄 Health monitoring started (interval: ${this.config.interval}ms)`);
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
      console.log('⏹️ Health monitoring stopped');
    }
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    const checkStartTime = Date.now();
    const healthCheck = {
      timestamp: checkStartTime,
      overall: 'healthy',
      checks: {},
      duration: 0,
      alerts: []
    };

    try {
      // System health checks
      if (this.config.checks.system.enabled) {
        healthCheck.checks.system = await this.checkSystemHealth();
      }

      // Service health checks
      if (this.config.checks.services.enabled) {
        healthCheck.checks.services = await this.checkServicesHealth();
      }

      // External dependency checks
      if (this.config.checks.external.enabled) {
        healthCheck.checks.external = await this.checkExternalHealth();
      }

      // Application health checks
      if (this.config.checks.application.enabled) {
        healthCheck.checks.application = await this.checkApplicationHealth();
      }

      // Determine overall health status
      healthCheck.overall = this.calculateOverallHealth(healthCheck.checks);
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      healthCheck.overall = 'unhealthy';
      healthCheck.error = error.message;
    }

    healthCheck.duration = Date.now() - checkStartTime;
    
    // Update current health status
    this.currentHealth = {
      ...healthCheck,
      uptime: process.uptime(),
      startTime: this.currentHealth.startTime
    };

    // Add to history
    this.addToHistory(healthCheck);
    
    // Process alerts
    await this.processHealthAlerts(healthCheck);
    
    // Emit health check event
    this.emit('health-check-completed', healthCheck);
    
    if (healthCheck.overall !== 'healthy') {
      console.warn(`⚠️ Health check completed with status: ${healthCheck.overall}`);
    }
  }

  /**
   * Check system health (CPU, memory, disk, etc.)
   */
  async checkSystemHealth() {
    const systemChecks = {};

    try {
      // CPU usage
      const cpuUsage = await this.getCPUUsage();
      systemChecks.cpu = {
        status: this.getStatusFromThreshold(cpuUsage, this.config.thresholds.cpu),
        value: cpuUsage,
        unit: '%',
        message: `CPU usage: ${cpuUsage.toFixed(1)}%`
      };

      // Memory usage
      const memoryUsage = await this.getMemoryUsage();
      systemChecks.memory = {
        status: this.getStatusFromThreshold(memoryUsage.percentage, this.config.thresholds.memory),
        value: memoryUsage.percentage,
        unit: '%',
        message: `Memory usage: ${memoryUsage.percentage.toFixed(1)}% (${this.formatBytes(memoryUsage.used)}/${this.formatBytes(memoryUsage.total)})`,
        details: memoryUsage
      };

      // Disk usage
      const diskUsage = await this.getDiskUsage();
      systemChecks.disk = {
        status: this.getStatusFromThreshold(diskUsage.percentage, this.config.thresholds.disk),
        value: diskUsage.percentage,
        unit: '%',
        message: `Disk usage: ${diskUsage.percentage.toFixed(1)}% (${diskUsage.used}/${diskUsage.total})`,
        details: diskUsage
      };

      // System uptime
      const uptime = process.uptime();
      systemChecks.uptime = {
        status: 'healthy',
        value: uptime,
        unit: 'seconds',
        message: `System uptime: ${this.formatDuration(uptime * 1000)}`
      };

      // Load average (Unix-like systems)
      if (os.platform() !== 'win32') {
        const loadAvg = os.loadavg();
        const loadStatus = loadAvg[0] > os.cpus().length ? 'warning' : 'healthy';
        systemChecks.load = {
          status: loadStatus,
          value: loadAvg[0],
          message: `Load average: ${loadAvg.map(l => l.toFixed(2)).join(', ')}`,
          details: { '1min': loadAvg[0], '5min': loadAvg[1], '15min': loadAvg[2] }
        };
      }

    } catch (error) {
      console.error('❌ System health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }

    return {
      status: this.getWorstStatus(Object.values(systemChecks).map(c => c.status)),
      checks: systemChecks
    };
  }

  /**
   * Check services health
   */
  async checkServicesHealth() {
    const serviceChecks = {};

    try {
      // Database health
      if (this.services.database) {
        serviceChecks.database = await this.checkDatabaseHealth();
      }

      // Security service health
      if (this.services.securityManager) {
        serviceChecks.security = await this.checkSecurityHealth();
      }

      // Performance monitor health
      if (this.services.performanceMonitor) {
        serviceChecks.performance = await this.checkPerformanceHealth();
      }

      // SignalR service health
      if (this.services.signalRService) {
        serviceChecks.signalr = await this.checkSignalRHealth();
      }

      // Rate limiting service health
      if (this.services.rateLimitingService) {
        serviceChecks.rateLimiting = await this.checkRateLimitingHealth();
      }

    } catch (error) {
      console.error('❌ Services health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }

    return {
      status: this.getWorstStatus(Object.values(serviceChecks).map(c => c.status)),
      checks: serviceChecks
    };
  }

  /**
   * Check external dependencies health
   */
  async checkExternalHealth() {
    const externalChecks = {};

    try {
      // Internet connectivity
      externalChecks.internet = await this.checkInternetConnectivity();

      // External API health (if any)
      // Add specific external API checks here

    } catch (error) {
      console.error('❌ External health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }

    return {
      status: this.getWorstStatus(Object.values(externalChecks).map(c => c.status)),
      checks: externalChecks
    };
  }

  /**
   * Check application-specific health
   */
  async checkApplicationHealth() {
    const appChecks = {};

    try {
      // Application startup status
      appChecks.startup = {
        status: 'healthy',
        message: 'Application started successfully',
        value: process.uptime(),
        unit: 'seconds'
      };

      // Error rate monitoring
      const errorRate = await this.getErrorRate();
      appChecks.errors = {
        status: this.getStatusFromThreshold(errorRate, this.config.thresholds.errorRate),
        value: errorRate,
        unit: 'rate',
        message: `Error rate: ${(errorRate * 100).toFixed(2)}%`
      };

      // Feature availability
      appChecks.features = await this.checkFeatureAvailability();

    } catch (error) {
      console.error('❌ Application health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }

    return {
      status: this.getWorstStatus(Object.values(appChecks).map(c => c.status)),
      checks: appChecks
    };
  }

  /**
   * Check database health
   */
  async checkDatabaseHealth() {
    try {
      // Simple connection test
      const startTime = Date.now();
      
      // If database service is available, test connection
      if (this.services.database && typeof this.services.database.healthCheck === 'function') {
        await this.services.database.healthCheck();
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: responseTime < 1000 ? 'healthy' : 'warning',
        value: responseTime,
        unit: 'ms',
        message: `Database connection: ${responseTime}ms`
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`
      };
    }
  }

  /**
   * Check security service health
   */
  async checkSecurityHealth() {
    try {
      if (this.services.securityManager) {
        const securityStatus = this.services.securityManager.getSecurityStatus();
        
        return {
          status: securityStatus.overallStatus === 'secure' ? 'healthy' : 'warning',
          message: `Security status: ${securityStatus.overallStatus}`,
          details: {
            threatLevel: securityStatus.threatLevel,
            activeThreats: securityStatus.activeThreats,
            blockedIPs: securityStatus.blockedIPs
          }
        };
      }
      
      return {
        status: 'warning',
        message: 'Security service not available'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Security check failed: ${error.message}`
      };
    }
  }

  /**
   * Check performance monitor health
   */
  async checkPerformanceHealth() {
    try {
      if (this.services.performanceMonitor) {
        const perfSummary = this.services.performanceMonitor.getPerformanceSummary(60000); // Last minute
        const activeAlerts = perfSummary.alerts.filter(a => !a.resolved);
        
        const status = activeAlerts.some(a => a.severity === 'critical') ? 'unhealthy' :
                      activeAlerts.some(a => a.severity === 'warning') ? 'warning' : 'healthy';
        
        return {
          status: status,
          message: `Performance monitoring: ${activeAlerts.length} active alerts`,
          details: {
            activeAlerts: activeAlerts.length,
            criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
            warningAlerts: activeAlerts.filter(a => a.severity === 'warning').length
          }
        };
      }
      
      return {
        status: 'warning',
        message: 'Performance monitor not available'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Performance check failed: ${error.message}`
      };
    }
  }

  /**
   * Check SignalR service health
   */
  async checkSignalRHealth() {
    try {
      if (this.services.signalRService) {
        const signalRStatus = this.services.signalRService.getStatus();
        
        return {
          status: signalRStatus.isRunning ? 'healthy' : 'unhealthy',
          message: `SignalR service: ${signalRStatus.isRunning ? 'running' : 'stopped'}`,
          details: {
            isRunning: signalRStatus.isRunning,
            connectedClients: signalRStatus.connectedClients,
            port: signalRStatus.port,
            uptime: signalRStatus.uptime
          }
        };
      }
      
      return {
        status: 'warning',
        message: 'SignalR service not available'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `SignalR check failed: ${error.message}`
      };
    }
  }

  /**
   * Check rate limiting service health
   */
  async checkRateLimitingHealth() {
    try {
      if (this.services.rateLimitingService) {
        const stats = this.services.rateLimitingService.getStatistics();
        
        const blockRate = stats.totalRequests > 0 ? stats.blockedRequests / stats.totalRequests : 0;
        const status = blockRate > 0.5 ? 'warning' : 'healthy'; // More than 50% blocked is concerning
        
        return {
          status: status,
          message: `Rate limiting: ${stats.blockedRequests}/${stats.totalRequests} blocked`,
          details: {
            totalRequests: stats.totalRequests,
            blockedRequests: stats.blockedRequests,
            blockedIPs: stats.blockedIPs,
            ddosAttacks: stats.ddosAttacks,
            blockRate: blockRate
          }
        };
      }
      
      return {
        status: 'warning',
        message: 'Rate limiting service not available'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Rate limiting check failed: ${error.message}`
      };
    }
  }

  /**
   * Check internet connectivity
   */
  async checkInternetConnectivity() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      // Ping a reliable external server
      const pingCommand = os.platform() === 'win32' ? 
        'ping -n 1 8.8.8.8' : 'ping -c 1 8.8.8.8';
      
      const startTime = Date.now();
      await execAsync(pingCommand);
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        value: responseTime,
        unit: 'ms',
        message: `Internet connectivity: ${responseTime}ms`
      };
    } catch (error) {
      return {
        status: 'warning',
        message: 'Internet connectivity check failed'
      };
    }
  }

  /**
   * Check feature availability
   */
  async checkFeatureAvailability() {
    try {
      // Check critical application features
      const features = {
        gameServerManagement: true, // Add actual checks
        steamIntegration: true,
        cloudSync: true,
        webInterface: true
      };
      
      const unavailableFeatures = Object.entries(features)
        .filter(([_, available]) => !available)
        .map(([feature]) => feature);
      
      const status = unavailableFeatures.length === 0 ? 'healthy' :
                    unavailableFeatures.length <= 2 ? 'warning' : 'unhealthy';
      
      return {
        status: status,
        message: `Features: ${Object.keys(features).length - unavailableFeatures.length}/${Object.keys(features).length} available`,
        details: {
          available: Object.keys(features).length - unavailableFeatures.length,
          total: Object.keys(features).length,
          unavailable: unavailableFeatures
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Feature check failed: ${error.message}`
      };
    }
  }

  /**
   * Get CPU usage percentage
   */
  async getCPUUsage() {
    return new Promise((resolve) => {
      const startUsage = process.cpuUsage();
      const startTime = Date.now();
      
      setTimeout(() => {
        const endUsage = process.cpuUsage(startUsage);
        const endTime = Date.now();
        
        const totalUsage = (endUsage.user + endUsage.system) / 1000; // Convert to milliseconds
        const totalTime = endTime - startTime;
        const cpuPercent = (totalUsage / totalTime) * 100;
        
        resolve(Math.min(100, Math.max(0, cpuPercent)));
      }, 100);
    });
  }

  /**
   * Get memory usage information
   */
  async getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    return {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      percentage: (usedMem / totalMem) * 100
    };
  }

  /**
   * Get disk usage information
   */
  async getDiskUsage() {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const command = os.platform() === 'win32' ? 
        'wmic logicaldisk get size,freespace,caption' :
        'df -h /';
      
      const { stdout } = await execAsync(command);
      
      if (os.platform() === 'win32') {
        // Parse Windows output
        const lines = stdout.split('\n').filter(line => line.trim());
        if (lines.length > 1) {
          const parts = lines[1].trim().split(/\s+/);
          if (parts.length >= 3) {
            const total = parseInt(parts[2]);
            const free = parseInt(parts[1]);
            const used = total - free;
            return {
              total: this.formatBytes(total),
              free: this.formatBytes(free),
              used: this.formatBytes(used),
              percentage: (used / total) * 100
            };
          }
        }
      } else {
        // Parse Unix output
        const lines = stdout.split('\n');
        if (lines.length > 1) {
          const parts = lines[1].split(/\s+/);
          if (parts.length >= 5) {
            const usageStr = parts[4];
            const percentage = parseInt(usageStr.replace('%', ''));
            return {
              total: parts[1],
              used: parts[2],
              free: parts[3],
              percentage: percentage
            };
          }
        }
      }
      
      return { total: '0B', used: '0B', free: '0B', percentage: 0 };
    } catch (error) {
      console.warn('⚠️ Failed to get disk usage:', error.message);
      return { total: 'unknown', used: 'unknown', free: 'unknown', percentage: 0 };
    }
  }

  /**
   * Get application error rate
   */
  async getErrorRate() {
    // In a real implementation, this would check error logs or metrics
    // For now, return a low error rate
    return 0.01; // 1% error rate
  }

  /**
   * Calculate overall health status from individual checks
   */
  calculateOverallHealth(checks) {
    const statuses = [];
    
    // Collect all status values
    Object.values(checks).forEach(category => {
      if (category.status) {
        statuses.push(category.status);
      }
      if (category.checks) {
        Object.values(category.checks).forEach(check => {
          if (check.status) {
            statuses.push(check.status);
          }
        });
      }
    });
    
    return this.getWorstStatus(statuses);
  }

  /**
   * Get the worst status from a list of statuses
   */
  getWorstStatus(statuses) {
    if (statuses.includes('unhealthy')) return 'unhealthy';
    if (statuses.includes('warning')) return 'warning';
    if (statuses.includes('healthy')) return 'healthy';
    return 'unknown';
  }

  /**
   * Get status based on threshold comparison
   */
  getStatusFromThreshold(value, threshold) {
    if (value >= threshold.critical) return 'unhealthy';
    if (value >= threshold.warning) return 'warning';
    return 'healthy';
  }

  /**
   * Add health check to history
   */
  addToHistory(healthCheck) {
    this.healthHistory.push(healthCheck);
    
    // Limit history size
    if (this.healthHistory.length > this.maxHistorySize) {
      this.healthHistory = this.healthHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Process health alerts
   */
  async processHealthAlerts(healthCheck) {
    if (!this.config.alerts.enabled) return;

    const alerts = this.extractAlertsFromHealthCheck(healthCheck);
    
    for (const alert of alerts) {
      await this.processAlert(alert);
    }
  }

  /**
   * Extract alerts from health check results
   */
  extractAlertsFromHealthCheck(healthCheck) {
    const alerts = [];
    
    const processChecks = (checks, category = '') => {
      Object.entries(checks).forEach(([key, check]) => {
        if (check.status === 'warning' || check.status === 'unhealthy') {
          alerts.push({
            id: `${category}_${key}`,
            category: category,
            check: key,
            severity: check.status === 'unhealthy' ? 'critical' : 'warning',
            message: check.message || `${key} health check failed`,
            timestamp: healthCheck.timestamp,
            value: check.value,
            details: check.details
          });
        }
        
        if (check.checks) {
          processChecks(check.checks, `${category}_${key}`);
        }
      });
    };
    
    if (healthCheck.checks) {
      Object.entries(healthCheck.checks).forEach(([category, categoryChecks]) => {
        if (categoryChecks.checks) {
          processChecks(categoryChecks.checks, category);
        }
      });
    }
    
    return alerts;
  }

  /**
   * Process individual alert
   */
  async processAlert(alert) {
    const alertKey = alert.id;
    const now = Date.now();
    
    // Check cooldown
    const lastAlert = this.lastAlerts.get(alertKey);
    if (lastAlert && (now - lastAlert) < this.config.alerts.cooldown) {
      return; // Still in cooldown period
    }
    
    // Update alert tracking
    this.lastAlerts.set(alertKey, now);
    this.currentHealth.alerts.push(alert);
    
    // Emit alert event
    this.emit('health-alert', alert);
    
    console.warn(`⚠️ Health Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)}${units[unitIndex]}`;
  }

  /**
   * Format duration to human readable format
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Get current health status
   */
  getCurrentHealth() {
    return { ...this.currentHealth };
  }

  /**
   * Get health history
   */
  getHealthHistory(limit = 100) {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Get health summary for specific time period
   */
  getHealthSummary(timeWindow = 60 * 60 * 1000) { // Default 1 hour
    const since = Date.now() - timeWindow;
    const relevantChecks = this.healthHistory.filter(check => check.timestamp >= since);
    
    if (relevantChecks.length === 0) {
      return null;
    }
    
    const healthyCount = relevantChecks.filter(c => c.overall === 'healthy').length;
    const warningCount = relevantChecks.filter(c => c.overall === 'warning').length;
    const unhealthyCount = relevantChecks.filter(c => c.overall === 'unhealthy').length;
    
    return {
      timeWindow: timeWindow,
      totalChecks: relevantChecks.length,
      healthyPercentage: (healthyCount / relevantChecks.length) * 100,
      warningPercentage: (warningCount / relevantChecks.length) * 100,
      unhealthyPercentage: (unhealthyCount / relevantChecks.length) * 100,
      currentStatus: this.currentHealth.overall,
      lastCheck: this.currentHealth.lastCheck,
      uptime: this.formatDuration((Date.now() - this.currentHealth.startTime))
    };
  }

  /**
   * Get configuration
   */
  getConfiguration() {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfiguration(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.store && typeof this.store.set === 'function') {
      this.store.set('health.config', this.config);
    }
    
    this.emit('config-updated', this.config);
    console.log('🔧 Health check configuration updated');
  }

  /**
   * Export health data
   */
  exportData() {
    return {
      config: this.config,
      currentHealth: this.currentHealth,
      healthHistory: this.healthHistory,
      summary: this.getHealthSummary(),
      timestamp: new Date()
    };
  }
}

module.exports = HealthCheckService;