const { EventEmitter } = require('events');
const { exec } = require('child_process');
const { promisify } = require('util');
const os = require('os');

const execAsync = promisify(exec);

class ServerMonitor extends EventEmitter {
  constructor() {
    super();
    this.monitoringIntervals = new Map();
    this.serverMetrics = new Map();
    this.healthChecks = new Map();
    this.alertThresholds = {
      cpu: 80,        // CPU usage percentage
      memory: 85,     // Memory usage percentage
      diskSpace: 90,  // Disk usage percentage
      responseTime: 5000, // Max response time in ms
      restartCount: 3 // Max restarts per hour
    };
    this.alertHistory = new Map();
    this.isMonitoring = false;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Server monitoring started');
    this.emit('monitoring-started');
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    // Clear all monitoring intervals
    for (const [serverId, interval] of this.monitoringIntervals.entries()) {
      clearInterval(interval);
    }
    
    this.monitoringIntervals.clear();
    this.isMonitoring = false;
    console.log('Server monitoring stopped');
    this.emit('monitoring-stopped');
  }

  startServerMonitoring(serverId, process, serverConfig) {
    if (!this.isMonitoring) {
      this.startMonitoring();
    }

    // Stop existing monitoring for this server
    this.stopServerMonitoring(serverId);

    // Initialize metrics storage
    this.serverMetrics.set(serverId, {
      serverId,
      process,
      serverConfig,
      pid: process.pid,
      startTime: Date.now(),
      metrics: [],
      currentMetrics: {
        cpu: 0,
        memory: 0,
        uptime: 0,
        connections: 0,
        status: 'running'
      },
      health: {
        score: 100,
        issues: [],
        lastCheck: Date.now()
      },
      alerts: {
        cpu: false,
        memory: false,
        disk: false,
        unresponsive: false
      }
    });

    // Start monitoring interval
    const interval = setInterval(() => {
      this.collectServerMetrics(serverId);
    }, 5000); // Collect metrics every 5 seconds

    this.monitoringIntervals.set(serverId, interval);

    // Start health check interval
    const healthInterval = setInterval(() => {
      this.performHealthCheck(serverId);
    }, 30000); // Health check every 30 seconds

    this.healthChecks.set(serverId, healthInterval);

    console.log(`Started monitoring server ${serverId} (PID: ${process.pid})`);
    this.emit('server-monitoring-started', { serverId, pid: process.pid });
  }

  stopServerMonitoring(serverId) {
    const interval = this.monitoringIntervals.get(serverId);
    const healthInterval = this.healthChecks.get(serverId);

    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(serverId);
    }

    if (healthInterval) {
      clearInterval(healthInterval);
      this.healthChecks.delete(serverId);
    }

    // Keep metrics for historical data but mark as stopped
    const metrics = this.serverMetrics.get(serverId);
    if (metrics) {
      metrics.currentMetrics.status = 'stopped';
      this.emit('server-monitoring-stopped', { serverId });
    }

    console.log(`Stopped monitoring server ${serverId}`);
  }

  async collectServerMetrics(serverId) {
    try {
      const serverData = this.serverMetrics.get(serverId);
      if (!serverData || !serverData.process) return;

      const pid = serverData.process.pid;
      const platform = os.platform();

      let metrics = {
        timestamp: Date.now(),
        cpu: 0,
        memory: 0,
        uptime: Math.floor((Date.now() - serverData.startTime) / 1000),
        connections: 0,
        diskIO: { read: 0, write: 0 },
        networkIO: { rx: 0, tx: 0 }
      };

      // Platform-specific process monitoring
      if (platform === 'win32') {
        metrics = await this.getWindowsProcessMetrics(pid, metrics);
      } else {
        metrics = await this.getUnixProcessMetrics(pid, metrics);
      }

      // Store current metrics
      serverData.currentMetrics = {
        ...serverData.currentMetrics,
        cpu: Math.round(metrics.cpu * 10) / 10,
        memory: Math.round(metrics.memory * 10) / 10,
        uptime: metrics.uptime,
        connections: metrics.connections,
        status: 'running'
      };

      // Add to metrics history (keep last 100 entries)
      serverData.metrics.push(metrics);
      if (serverData.metrics.length > 100) {
        serverData.metrics.shift();
      }

      // Check for alerts
      this.checkPerformanceAlerts(serverId, metrics);

      // Emit metrics update
      this.emit('server-metrics-updated', {
        serverId,
        metrics: serverData.currentMetrics,
        history: serverData.metrics.slice(-20) // Last 20 entries
      });

    } catch (error) {
      console.error(`Failed to collect metrics for server ${serverId}:`, error);
      
      // Mark server as potentially crashed
      const serverData = this.serverMetrics.get(serverId);
      if (serverData) {
        serverData.currentMetrics.status = 'error';
        this.emit('server-error', { serverId, error: error.message });
      }
    }
  }

  async getWindowsProcessMetrics(pid, baseMetrics) {
    try {
      // Get process info using PowerShell
      const psCommand = `Get-Process -Id ${pid} | Select-Object CPU,WorkingSet,PagedMemorySize,NonpagedSystemMemorySize`;
      const { stdout } = await execAsync(`powershell -command "${psCommand}"`);
      
      const lines = stdout.trim().split('\n');
      if (lines.length > 2) {
        const dataLine = lines[2].trim().split(/\s+/);
        
        baseMetrics.cpu = parseFloat(dataLine[0]) || 0;
        baseMetrics.memory = parseInt(dataLine[1]) / (1024 * 1024); // Convert to MB
      }

      // Get network connections
      try {
        const netstatCommand = `netstat -ano | findstr ${pid}`;
        const { stdout: netstat } = await execAsync(netstatCommand);
        baseMetrics.connections = netstat.split('\n').length - 1;
      } catch (error) {
        // Netstat failed, keep default value
      }

    } catch (error) {
      console.warn(`Windows process metrics failed for PID ${pid}:`, error.message);
    }

    return baseMetrics;
  }

  async getUnixProcessMetrics(pid, baseMetrics) {
    try {
      // Get CPU and memory from ps
      const psCommand = `ps -p ${pid} -o %cpu,%mem,etime --no-headers`;
      const { stdout } = await execAsync(psCommand);
      
      const values = stdout.trim().split(/\s+/);
      if (values.length >= 2) {
        baseMetrics.cpu = parseFloat(values[0]) || 0;
        baseMetrics.memory = parseFloat(values[1]) || 0;
      }

      // Get network connections
      try {
        const netstatCommand = `netstat -tulpn 2>/dev/null | grep ${pid} | wc -l`;
        const { stdout: connections } = await execAsync(netstatCommand);
        baseMetrics.connections = parseInt(connections.trim()) || 0;
      } catch (error) {
        // Netstat failed, keep default value
      }

      // Get disk I/O if available
      try {
        const ioCommand = `cat /proc/${pid}/io 2>/dev/null`;
        const { stdout: ioStats } = await execAsync(ioCommand);
        
        const ioLines = ioStats.split('\n');
        for (const line of ioLines) {
          if (line.startsWith('read_bytes:')) {
            baseMetrics.diskIO.read = parseInt(line.split(':')[1].trim()) || 0;
          } else if (line.startsWith('write_bytes:')) {
            baseMetrics.diskIO.write = parseInt(line.split(':')[1].trim()) || 0;
          }
        }
      } catch (error) {
        // IO stats not available
      }

    } catch (error) {
      console.warn(`Unix process metrics failed for PID ${pid}:`, error.message);
    }

    return baseMetrics;
  }

  checkPerformanceAlerts(serverId, metrics) {
    const serverData = this.serverMetrics.get(serverId);
    if (!serverData) return;

    const alerts = serverData.alerts;
    const newAlerts = [];

    // CPU alert
    if (metrics.cpu > this.alertThresholds.cpu && !alerts.cpu) {
      alerts.cpu = true;
      newAlerts.push({
        type: 'cpu',
        severity: 'warning',
        message: `High CPU usage: ${metrics.cpu.toFixed(1)}%`,
        threshold: this.alertThresholds.cpu,
        value: metrics.cpu
      });
    } else if (metrics.cpu <= this.alertThresholds.cpu * 0.8 && alerts.cpu) {
      alerts.cpu = false;
      this.emit('alert-resolved', { serverId, type: 'cpu' });
    }

    // Memory alert
    if (metrics.memory > this.alertThresholds.memory && !alerts.memory) {
      alerts.memory = true;
      newAlerts.push({
        type: 'memory',
        severity: 'warning',
        message: `High memory usage: ${metrics.memory.toFixed(1)}%`,
        threshold: this.alertThresholds.memory,
        value: metrics.memory
      });
    } else if (metrics.memory <= this.alertThresholds.memory * 0.8 && alerts.memory) {
      alerts.memory = false;
      this.emit('alert-resolved', { serverId, type: 'memory' });
    }

    // Emit new alerts
    for (const alert of newAlerts) {
      this.emit('performance-alert', {
        serverId,
        alert,
        timestamp: Date.now(),
        serverName: serverData.serverConfig?.name || 'Unknown'
      });

      // Store alert history
      if (!this.alertHistory.has(serverId)) {
        this.alertHistory.set(serverId, []);
      }
      
      const history = this.alertHistory.get(serverId);
      history.push({
        ...alert,
        timestamp: Date.now(),
        resolved: false
      });

      // Keep only last 50 alerts per server
      if (history.length > 50) {
        history.shift();
      }
    }
  }

  async performHealthCheck(serverId) {
    try {
      const serverData = this.serverMetrics.get(serverId);
      if (!serverData) return;

      const health = {
        score: 100,
        issues: [],
        lastCheck: Date.now(),
        status: 'healthy'
      };

      const currentMetrics = serverData.currentMetrics;

      // Check if process is still running
      try {
        process.kill(serverData.pid, 0); // Signal 0 checks if process exists
      } catch (error) {
        health.score = 0;
        health.status = 'crashed';
        health.issues.push({
          type: 'process',
          severity: 'critical',
          message: 'Server process has crashed',
          suggestion: 'Restart the server'
        });

        this.emit('server-health-critical', {
          serverId,
          health,
          serverName: serverData.serverConfig?.name || 'Unknown'
        });

        serverData.health = health;
        return;
      }

      // Performance health checks
      if (currentMetrics.cpu > 90) {
        health.score -= 30;
        health.issues.push({
          type: 'performance',
          severity: 'high',
          message: 'Critical CPU usage detected',
          suggestion: 'Check for server optimization or reduce player count'
        });
      } else if (currentMetrics.cpu > 80) {
        health.score -= 15;
        health.issues.push({
          type: 'performance',
          severity: 'medium',
          message: 'High CPU usage detected',
          suggestion: 'Monitor server performance'
        });
      }

      if (currentMetrics.memory > 95) {
        health.score -= 25;
        health.issues.push({
          type: 'memory',
          severity: 'high',
          message: 'Critical memory usage detected',
          suggestion: 'Restart server or increase memory allocation'
        });
      } else if (currentMetrics.memory > 85) {
        health.score -= 10;
        health.issues.push({
          type: 'memory',
          severity: 'medium',
          message: 'High memory usage detected',
          suggestion: 'Monitor memory usage'
        });
      }

      // Determine overall status
      if (health.score >= 80) {
        health.status = 'healthy';
      } else if (health.score >= 60) {
        health.status = 'warning';
      } else if (health.score >= 30) {
        health.status = 'degraded';
      } else {
        health.status = 'critical';
      }

      serverData.health = health;

      this.emit('server-health-updated', {
        serverId,
        health,
        serverName: serverData.serverConfig?.name || 'Unknown'
      });

      // Trigger auto-restart if configured and health is critical
      if (health.status === 'critical' && serverData.serverConfig?.autoRestart) {
        this.triggerAutoRestart(serverId);
      }

    } catch (error) {
      console.error(`Health check failed for server ${serverId}:`, error);
    }
  }

  async triggerAutoRestart(serverId) {
    try {
      const serverData = this.serverMetrics.get(serverId);
      if (!serverData) return;

      // Check restart frequency (max 3 restarts per hour)
      const oneHour = 60 * 60 * 1000;
      const recentRestarts = this.getRecentRestarts(serverId, oneHour);
      
      if (recentRestarts >= this.alertThresholds.restartCount) {
        this.emit('auto-restart-blocked', {
          serverId,
          reason: 'Too many recent restarts',
          count: recentRestarts
        });
        return;
      }

      this.emit('auto-restart-triggered', {
        serverId,
        reason: 'Health check failure',
        serverName: serverData.serverConfig?.name || 'Unknown'
      });

      // Record restart attempt
      this.recordRestart(serverId);

    } catch (error) {
      console.error(`Auto-restart failed for server ${serverId}:`, error);
    }
  }

  getRecentRestarts(serverId, timeWindow) {
    const alertHistory = this.alertHistory.get(serverId) || [];
    const cutoff = Date.now() - timeWindow;
    
    return alertHistory.filter(alert => 
      alert.type === 'restart' && alert.timestamp > cutoff
    ).length;
  }

  recordRestart(serverId) {
    if (!this.alertHistory.has(serverId)) {
      this.alertHistory.set(serverId, []);
    }
    
    const history = this.alertHistory.get(serverId);
    history.push({
      type: 'restart',
      timestamp: Date.now(),
      severity: 'info',
      message: 'Auto-restart triggered by health check'
    });
  }

  getServerMetrics(serverId) {
    const serverData = this.serverMetrics.get(serverId);
    if (!serverData) return null;

    return {
      current: serverData.currentMetrics,
      history: serverData.metrics.slice(-20),
      health: serverData.health,
      alerts: serverData.alerts
    };
  }

  getAllServerMetrics() {
    const allMetrics = {};
    
    for (const [serverId, serverData] of this.serverMetrics.entries()) {
      allMetrics[serverId] = {
        current: serverData.currentMetrics,
        health: serverData.health,
        alerts: serverData.alerts
      };
    }
    
    return allMetrics;
  }

  getAlertHistory(serverId, limit = 20) {
    const history = this.alertHistory.get(serverId) || [];
    return history.slice(-limit).reverse(); // Most recent first
  }

  updateAlertThresholds(newThresholds) {
    this.alertThresholds = {
      ...this.alertThresholds,
      ...newThresholds
    };
    
    this.emit('thresholds-updated', this.alertThresholds);
    console.log('Alert thresholds updated:', this.alertThresholds);
  }

  clearServerData(serverId) {
    this.stopServerMonitoring(serverId);
    this.serverMetrics.delete(serverId);
    this.alertHistory.delete(serverId);
  }

  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      activeServers: this.monitoringIntervals.size,
      totalAlerts: Array.from(this.alertHistory.values())
        .reduce((total, alerts) => total + alerts.length, 0),
      thresholds: this.alertThresholds
    };
  }
}

module.exports = ServerMonitor;