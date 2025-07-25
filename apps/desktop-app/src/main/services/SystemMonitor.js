const si = require('systeminformation');
const { EventEmitter } = require('events');

class SystemMonitor extends EventEmitter {
  constructor() {
    super();
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.systemInfo = null;
    this.performanceHistory = [];
    this.maxHistorySize = 60; // Keep 60 data points (1 minute if 1 second intervals)
  }

  async startMonitoring(intervalMs = 5000) {
    if (this.isMonitoring) {
      console.log('System monitoring already running');
      return;
    }

    try {
      // Get static system information once
      this.systemInfo = await this.getStaticSystemInfo();
      
      console.log('Starting system monitoring...');
      this.isMonitoring = true;
      
      // Start periodic monitoring
      this.monitoringInterval = setInterval(async () => {
        try {
          const performance = await this.getCurrentPerformance();
          this.addPerformanceData(performance);
          this.emit('performance-update', performance);
        } catch (error) {
          console.error('Performance monitoring error:', error);
        }
      }, intervalMs);

      console.log('System monitoring started');
    } catch (error) {
      console.error('Failed to start system monitoring:', error);
      throw error;
    }
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    console.log('Stopping system monitoring...');
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('System monitoring stopped');
  }

  async getStaticSystemInfo() {
    try {
      const [system, cpu, mem, osInfo, graphics] = await Promise.all([
        si.system(),
        si.cpu(),
        si.mem(),
        si.osInfo(),
        si.graphics()
      ]);

      return {
        system: {
          manufacturer: system.manufacturer,
          model: system.model,
          version: system.version,
          uuid: system.uuid
        },
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          family: cpu.family,
          model: cpu.model,
          speed: cpu.speed,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          processors: cpu.processors,
          cache: cpu.cache
        },
        memory: {
          total: mem.total,
          type: 'Unknown' // si.memLayout() could provide this but is complex
        },
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch,
          hostname: osInfo.hostname
        },
        graphics: graphics.controllers.map(gpu => ({
          vendor: gpu.vendor,
          model: gpu.model,
          vram: gpu.vram,
          vramDynamic: gpu.vramDynamic
        }))
      };
    } catch (error) {
      console.error('Failed to get static system info:', error);
      throw error;
    }
  }

  async getCurrentPerformance() {
    try {
      const [cpuData, memData, networkData, fsData, processData] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.networkStats(),
        si.fsSize(),
        si.processes()
      ]);

      const timestamp = Date.now();

      return {
        timestamp,
        cpu: {
          usage: Math.round(cpuData.currentload * 100) / 100,
          userUsage: Math.round(cpuData.currentload_user * 100) / 100,
          systemUsage: Math.round(cpuData.currentload_system * 100) / 100,
          cores: cpuData.cpus ? cpuData.cpus.map(core => ({
            usage: Math.round(core.load * 100) / 100,
            userUsage: Math.round(core.load_user * 100) / 100,
            systemUsage: Math.round(core.load_system * 100) / 100
          })) : []
        },
        memory: {
          total: memData.total,
          free: memData.free,
          used: memData.used,
          active: memData.active,
          available: memData.available,
          usagePercent: Math.round((memData.used / memData.total) * 10000) / 100,
          swapTotal: memData.swaptotal,
          swapUsed: memData.swapused,
          swapFree: memData.swapfree
        },
        network: networkData.map(iface => ({
          iface: iface.iface,
          operstate: iface.operstate,
          rx_bytes: iface.rx_bytes,
          tx_bytes: iface.tx_bytes,
          rx_sec: iface.rx_sec,
          tx_sec: iface.tx_sec
        })),
        disk: fsData.map(fs => ({
          fs: fs.fs,
          type: fs.type,
          size: fs.size,
          used: fs.used,
          available: fs.available,
          usagePercent: Math.round(fs.use * 100) / 100,
          mount: fs.mount
        })),
        processes: {
          running: processData.running,
          blocked: processData.blocked,
          sleeping: processData.sleeping,
          total: processData.all,
          list: processData.list.slice(0, 10).map(proc => ({
            pid: proc.pid,
            name: proc.name,
            cpu: proc.cpu,
            mem: proc.mem,
            priority: proc.priority,
            state: proc.state
          }))
        }
      };
    } catch (error) {
      console.error('Failed to get current performance:', error);
      throw error;
    }
  }

  addPerformanceData(performance) {
    this.performanceHistory.push(performance);
    
    // Keep only the last N data points
    if (this.performanceHistory.length > this.maxHistorySize) {
      this.performanceHistory = this.performanceHistory.slice(-this.maxHistorySize);
    }
  }

  getPerformanceHistory(minutes = 5) {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    return this.performanceHistory.filter(data => data.timestamp >= cutoffTime);
  }

  async getSystemInfo() {
    if (!this.systemInfo) {
      this.systemInfo = await this.getStaticSystemInfo();
    }

    const currentPerf = this.performanceHistory.length > 0 
      ? this.performanceHistory[this.performanceHistory.length - 1]
      : await this.getCurrentPerformance();

    return {
      static: this.systemInfo,
      current: currentPerf,
      history: this.getPerformanceHistory(),
      monitoring: this.isMonitoring
    };
  }

  async getGameServerRecommendations() {
    try {
      const current = await this.getCurrentPerformance();
      const recommendations = {};

      // Basic recommendations based on current system performance
      const availableMemoryGB = current.memory.available / (1024 * 1024 * 1024);
      const cpuUsage = current.cpu.usage;

      // Valheim recommendations
      recommendations.valheim = {
        recommended: availableMemoryGB >= 4 && cpuUsage < 70,
        maxPlayers: Math.min(20, Math.floor(availableMemoryGB * 2.5)),
        reason: availableMemoryGB < 4 
          ? 'Insufficient RAM (4GB recommended)' 
          : cpuUsage > 70 
            ? 'High CPU usage detected'
            : 'System meets requirements'
      };

      // Rust recommendations
      recommendations.rust = {
        recommended: availableMemoryGB >= 8 && cpuUsage < 60,
        maxPlayers: Math.min(100, Math.floor(availableMemoryGB * 12.5)),
        reason: availableMemoryGB < 8 
          ? 'Insufficient RAM (8GB recommended)' 
          : cpuUsage > 60 
            ? 'High CPU usage detected'
            : 'System meets requirements'
      };

      // CS2 recommendations
      recommendations.cs2 = {
        recommended: availableMemoryGB >= 2 && cpuUsage < 80,
        maxPlayers: Math.min(32, Math.floor(availableMemoryGB * 16)),
        reason: availableMemoryGB < 2 
          ? 'Insufficient RAM (2GB recommended)' 
          : cpuUsage > 80 
            ? 'High CPU usage detected'
            : 'System meets requirements'
      };

      // 7 Days to Die recommendations
      recommendations.seven_days = {
        recommended: availableMemoryGB >= 6 && cpuUsage < 65,
        maxPlayers: Math.min(16, Math.floor(availableMemoryGB * 2.67)),
        reason: availableMemoryGB < 6 
          ? 'Insufficient RAM (6GB recommended)' 
          : cpuUsage > 65 
            ? 'High CPU usage detected'
            : 'System meets requirements'
      };

      return recommendations;
    } catch (error) {
      console.error('Failed to get game server recommendations:', error);
      throw error;
    }
  }

  async checkPortAvailability(port) {
    try {
      const netstat = await si.networkConnections();
      const portInUse = netstat.some(conn => 
        conn.localport === port.toString() && 
        (conn.state === 'LISTEN' || conn.state === 'ESTABLISHED')
      );
      
      return {
        port: port,
        available: !portInUse,
        reason: portInUse ? 'Port already in use' : 'Port available'
      };
    } catch (error) {
      console.error('Failed to check port availability:', error);
      return {
        port: port,
        available: true,
        reason: 'Unable to verify port status'
      };
    }
  }

  async getDiskSpaceForPath(path) {
    try {
      const fsSize = await si.fsSize();
      
      // Find the filesystem that contains this path
      const fs = fsSize.find(f => path.startsWith(f.mount)) || fsSize[0];
      
      return {
        path: path,
        filesystem: fs.fs,
        total: fs.size,
        used: fs.used,
        available: fs.available,
        usagePercent: fs.use
      };
    } catch (error) {
      console.error('Failed to get disk space:', error);
      throw error;
    }
  }
}

module.exports = SystemMonitor;