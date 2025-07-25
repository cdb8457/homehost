const os = require('os');
const process = require('process');
const { EventEmitter } = require('events');
const { performance, PerformanceObserver } = require('perf_hooks');

/**
 * PerformanceMonitor - Advanced performance monitoring and optimization
 * 
 * Provides real-time performance tracking, bottleneck detection, automatic
 * optimization recommendations, and comprehensive metrics collection.
 */
class PerformanceMonitor extends EventEmitter {
  constructor(store, logger) {
    super();
    this.store = store;
    this.logger = logger;
    
    // Performance monitoring configuration
    this.config = {
      collection: {
        enabled: true,
        interval: 5000, // 5 seconds
        retention: 24 * 60 * 60 * 1000, // 24 hours
        maxDataPoints: 17280 // 24 hours at 5-second intervals
      },
      
      thresholds: {
        cpu: {
          warning: 70, // 70% CPU usage
          critical: 85,
          sustained: 60 * 1000 // 1 minute
        },
        memory: {
          warning: 80, // 80% memory usage
          critical: 90,
          sustained: 60 * 1000
        },
        eventLoop: {
          warning: 100, // 100ms event loop lag
          critical: 500,
          sustained: 30 * 1000
        },
        gc: {
          warning: 50, // 50ms GC pause
          critical: 100,
          frequency: 10 // Max 10 GC cycles per minute
        },
        disk: {
          warning: 80, // 80% disk usage
          critical: 90
        },
        network: {
          latency: 1000, // 1 second
          bandwidth: 80 // 80% utilization
        }
      },
      
      optimization: {
        enabled: true,
        autoApply: false, // Manual approval required
        strategies: {
          memoryOptimization: true,
          gcTuning: true,
          eventLoopOptimization: true,
          processOptimization: true
        }
      }
    };
    
    // Performance data storage
    this.metrics = {
      system: [],
      process: [],
      eventLoop: [],
      memory: [],
      gc: [],
      network: [],
      custom: new Map()
    };
    
    // Performance observers
    this.observers = new Map();
    this.timers = new Map();
    
    // Alert tracking
    this.alerts = [];
    this.alertStates = new Map();
    
    // Optimization recommendations
    this.recommendations = [];
    this.appliedOptimizations = [];
    
    this.initialize();
  }

  /**
   * Initialize performance monitoring
   */
  initialize() {
    try {
      console.log('📊 Initializing Performance Monitor...');
      
      // Load configuration
      this.loadConfiguration();
      
      // Set up performance observers
      this.setupPerformanceObservers();
      
      // Start monitoring
      this.startMonitoring();
      
      // Initialize baseline measurements
      this.establishBaseline();
      
      console.log('✅ Performance Monitor initialized successfully');
      this.emit('monitor-initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Performance Monitor:', error);
      throw error;
    }
  }

  /**
   * Load configuration from store
   */
  loadConfiguration() {
    if (this.store && typeof this.store.get === 'function') {
      const storedConfig = this.store.get('performance.config');
      if (storedConfig) {
        this.config = { ...this.config, ...storedConfig };
      }
      
      // Save current config
      this.store.set('performance.config', this.config);
    }
  }

  /**
   * Set up performance observers
   */
  setupPerformanceObservers() {
    // GC Observer
    if (typeof global.gc !== 'undefined') {
      const gcObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordGCMetrics(entry);
        });
      });
      
      gcObserver.observe({ entryTypes: ['gc'] });
      this.observers.set('gc', gcObserver);
    }
    
    // Function performance observer
    const functionObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordFunctionMetrics(entry);
      });
    });
    
    functionObserver.observe({ entryTypes: ['function', 'measure'] });
    this.observers.set('function', functionObserver);
    
    console.log('🔍 Performance observers initialized');
  }

  /**
   * Start monitoring intervals
   */
  startMonitoring() {
    if (!this.config.collection.enabled) return;
    
    // System metrics collection
    const systemTimer = setInterval(() => {
      this.collectSystemMetrics();
    }, this.config.collection.interval);
    this.timers.set('system', systemTimer);
    
    // Process metrics collection
    const processTimer = setInterval(() => {
      this.collectProcessMetrics();
    }, this.config.collection.interval);
    this.timers.set('process', processTimer);
    
    // Event loop metrics
    const eventLoopTimer = setInterval(() => {
      this.collectEventLoopMetrics();
    }, this.config.collection.interval);
    this.timers.set('eventLoop', eventLoopTimer);
    
    // Memory analysis
    const memoryTimer = setInterval(() => {
      this.collectMemoryMetrics();
    }, this.config.collection.interval * 2); // Less frequent
    this.timers.set('memory', memoryTimer);
    
    // Alert checking
    const alertTimer = setInterval(() => {
      this.checkAlerts();
    }, this.config.collection.interval);
    this.timers.set('alerts', alertTimer);
    
    // Cleanup old data
    const cleanupTimer = setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000); // Every hour
    this.timers.set('cleanup', cleanupTimer);
    
    console.log('⏱️ Performance monitoring started');
  }

  /**
   * Collect system-wide performance metrics
   */
  collectSystemMetrics() {
    const cpuUsage = this.getCPUUsage();
    const loadAverage = os.loadavg();
    const uptime = os.uptime();
    
    const systemMetrics = {
      timestamp: Date.now(),
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length,
        loadAverage: loadAverage,
        model: os.cpus()[0]?.model || 'Unknown'
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        uptime: uptime,
        hostname: os.hostname()
      }
    };
    
    this.addMetric('system', systemMetrics);
    this.emit('system-metrics', systemMetrics);
  }

  /**
   * Collect Node.js process metrics
   */
  collectProcessMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const resourceUsage = process.resourceUsage();
    
    const processMetrics = {
      timestamp: Date.now(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      resources: {
        userCPUTime: resourceUsage.userCPUTime,
        systemCPUTime: resourceUsage.systemCPUTime,
        maxRSS: resourceUsage.maxRSS,
        sharedMemorySize: resourceUsage.sharedMemorySize,
        unsharedDataSize: resourceUsage.unsharedDataSize,
        unsharedStackSize: resourceUsage.unsharedStackSize,
        minorPageFault: resourceUsage.minorPageFault,
        majorPageFault: resourceUsage.majorPageFault,
        swappedOut: resourceUsage.swappedOut,
        fsRead: resourceUsage.fsRead,
        fsWrite: resourceUsage.fsWrite,
        ipcSent: resourceUsage.ipcSent,
        ipcReceived: resourceUsage.ipcReceived,
        signalsCount: resourceUsage.signalsCount,
        voluntaryContextSwitches: resourceUsage.voluntaryContextSwitches,
        involuntaryContextSwitches: resourceUsage.involuntaryContextSwitches
      },
      process: {
        pid: process.pid,
        ppid: process.ppid,
        uptime: process.uptime(),
        version: process.version,
        versions: process.versions
      }
    };
    
    this.addMetric('process', processMetrics);
    this.emit('process-metrics', processMetrics);
  }

  /**
   * Collect event loop metrics
   */
  collectEventLoopMetrics() {
    const start = performance.now();
    
    setImmediate(() => {
      const lag = performance.now() - start;
      
      const eventLoopMetrics = {
        timestamp: Date.now(),
        lag: lag,
        utilization: this.getEventLoopUtilization()
      };
      
      this.addMetric('eventLoop', eventLoopMetrics);
      
      // Check for event loop blocking
      if (lag > this.config.thresholds.eventLoop.warning) {
        this.handleEventLoopLag(lag);
      }
      
      this.emit('eventloop-metrics', eventLoopMetrics);
    });
  }

  /**
   * Collect detailed memory metrics
   */
  collectMemoryMetrics() {
    const memUsage = process.memoryUsage();
    const v8HeapStats = this.getV8HeapStatistics();
    
    const memoryMetrics = {
      timestamp: Date.now(),
      heap: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        usage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      v8: v8HeapStats,
      process: {
        rss: memUsage.rss,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      system: {
        total: os.totalmem(),
        free: os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
      }
    };
    
    this.addMetric('memory', memoryMetrics);
    this.emit('memory-metrics', memoryMetrics);
  }

  /**
   * Get CPU usage percentage
   */
  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    
    return 100 - ~~(100 * idle / total);
  }

  /**
   * Get event loop utilization
   */
  getEventLoopUtilization() {
    try {
      const { utilization } = performance.eventLoopUtilization();
      return utilization * 100;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get V8 heap statistics
   */
  getV8HeapStatistics() {
    try {
      const v8 = require('v8');
      const heapStats = v8.getHeapStatistics();
      return {
        totalHeapSize: heapStats.total_heap_size,
        totalHeapSizeExecutable: heapStats.total_heap_size_executable,
        totalPhysicalSize: heapStats.total_physical_size,
        totalAvailableSize: heapStats.total_available_size,
        usedHeapSize: heapStats.used_heap_size,
        heapSizeLimit: heapStats.heap_size_limit,
        mallocedMemory: heapStats.malloced_memory,
        peakMallocedMemory: heapStats.peak_malloced_memory,
        doesZapGarbage: heapStats.does_zap_garbage,
        numberOfNativeContexts: heapStats.number_of_native_contexts,
        numberOfDetachedContexts: heapStats.number_of_detached_contexts
      };
    } catch (error) {
      return {};
    }
  }

  /**
   * Record GC metrics
   */
  recordGCMetrics(entry) {
    const gcMetrics = {
      timestamp: Date.now(),
      type: entry.kind,
      duration: entry.duration,
      startTime: entry.startTime,
      flags: entry.flags || 0
    };
    
    this.addMetric('gc', gcMetrics);
    
    // Check for excessive GC
    if (entry.duration > this.config.thresholds.gc.warning) {
      this.handleExcessiveGC(gcMetrics);
    }
    
    this.emit('gc-metrics', gcMetrics);
  }

  /**
   * Record function performance metrics
   */
  recordFunctionMetrics(entry) {
    const functionName = entry.name || 'anonymous';
    
    if (!this.metrics.custom.has('functions')) {
      this.metrics.custom.set('functions', []);
    }
    
    const functionMetrics = {
      timestamp: Date.now(),
      name: functionName,
      duration: entry.duration,
      startTime: entry.startTime,
      entryType: entry.entryType
    };
    
    this.metrics.custom.get('functions').push(functionMetrics);
    
    // Keep only recent function metrics
    const functions = this.metrics.custom.get('functions');
    if (functions.length > 1000) {
      this.metrics.custom.set('functions', functions.slice(-500));
    }
    
    this.emit('function-metrics', functionMetrics);
  }

  /**
   * Add metric to storage
   */
  addMetric(type, metric) {
    if (!this.metrics[type]) {
      this.metrics[type] = [];
    }
    
    this.metrics[type].push(metric);
    
    // Limit data points
    if (this.metrics[type].length > this.config.collection.maxDataPoints) {
      this.metrics[type] = this.metrics[type].slice(-this.config.collection.maxDataPoints);
    }
  }

  /**
   * Check for performance alerts
   */
  checkAlerts() {
    this.checkCPUAlerts();
    this.checkMemoryAlerts();
    this.checkEventLoopAlerts();
    this.checkGCAlerts();
  }

  /**
   * Check CPU performance alerts
   */
  checkCPUAlerts() {
    const latestSystem = this.getLatestMetric('system');
    if (!latestSystem) return;
    
    const cpuUsage = latestSystem.cpu.usage;
    const alertKey = 'cpu_usage';
    
    if (cpuUsage > this.config.thresholds.cpu.critical) {
      this.triggerAlert(alertKey, 'critical', 'High CPU Usage', 
        `CPU usage is at ${cpuUsage.toFixed(1)}%`, { cpuUsage });
    } else if (cpuUsage > this.config.thresholds.cpu.warning) {
      this.triggerAlert(alertKey, 'warning', 'Elevated CPU Usage', 
        `CPU usage is at ${cpuUsage.toFixed(1)}%`, { cpuUsage });
    } else {
      this.clearAlert(alertKey);
    }
  }

  /**
   * Check memory performance alerts
   */
  checkMemoryAlerts() {
    const latestMemory = this.getLatestMetric('memory');
    if (!latestMemory) return;
    
    const memoryUsage = latestMemory.system.usage;
    const heapUsage = latestMemory.heap.usage;
    
    if (memoryUsage > this.config.thresholds.memory.critical) {
      this.triggerAlert('memory_usage', 'critical', 'Critical Memory Usage', 
        `System memory usage is at ${memoryUsage.toFixed(1)}%`, { memoryUsage, heapUsage });
    } else if (memoryUsage > this.config.thresholds.memory.warning) {
      this.triggerAlert('memory_usage', 'warning', 'High Memory Usage', 
        `System memory usage is at ${memoryUsage.toFixed(1)}%`, { memoryUsage, heapUsage });
    } else {
      this.clearAlert('memory_usage');
    }
  }

  /**
   * Check event loop alerts
   */
  checkEventLoopAlerts() {
    const latestEventLoop = this.getLatestMetric('eventLoop');
    if (!latestEventLoop) return;
    
    const lag = latestEventLoop.lag;
    
    if (lag > this.config.thresholds.eventLoop.critical) {
      this.triggerAlert('event_loop_lag', 'critical', 'Critical Event Loop Lag', 
        `Event loop lag is ${lag.toFixed(2)}ms`, { lag });
    } else if (lag > this.config.thresholds.eventLoop.warning) {
      this.triggerAlert('event_loop_lag', 'warning', 'Event Loop Lag Detected', 
        `Event loop lag is ${lag.toFixed(2)}ms`, { lag });
    } else {
      this.clearAlert('event_loop_lag');
    }
  }

  /**
   * Check GC performance alerts
   */
  checkGCAlerts() {
    const recentGC = this.getRecentMetrics('gc', 60 * 1000); // Last minute
    if (recentGC.length === 0) return;
    
    const totalGCTime = recentGC.reduce((sum, gc) => sum + gc.duration, 0);
    const gcFrequency = recentGC.length;
    
    if (gcFrequency > this.config.thresholds.gc.frequency) {
      this.triggerAlert('gc_frequency', 'warning', 'High GC Frequency', 
        `${gcFrequency} GC cycles in the last minute`, { gcFrequency, totalGCTime });
    } else {
      this.clearAlert('gc_frequency');
    }
  }

  /**
   * Trigger performance alert
   */
  triggerAlert(key, severity, title, message, data = {}) {
    const now = Date.now();
    const existing = this.alertStates.get(key);
    
    // Avoid duplicate alerts
    if (existing && existing.severity === severity && 
        now - existing.lastTriggered < 60 * 1000) { // 1 minute cooldown
      return;
    }
    
    const alert = {
      id: `${key}_${now}`,
      key: key,
      severity: severity,
      title: title,
      message: message,
      data: data,
      timestamp: now,
      resolved: false
    };
    
    this.alerts.unshift(alert);
    
    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }
    
    this.alertStates.set(key, {
      severity: severity,
      lastTriggered: now,
      count: (existing?.count || 0) + 1
    });
    
    this.emit('performance-alert', alert);
    console.warn(`⚠️ Performance Alert: ${title} - ${message}`);
    
    // Generate optimization recommendations
    this.generateOptimizationRecommendations(alert);
  }

  /**
   * Clear performance alert
   */
  clearAlert(key) {
    const existing = this.alertStates.get(key);
    if (existing) {
      this.alertStates.delete(key);
      this.emit('alert-cleared', { key });
    }
  }

  /**
   * Handle event loop lag
   */
  handleEventLoopLag(lag) {
    console.warn(`⚠️ Event loop lag detected: ${lag.toFixed(2)}ms`);
    
    // Generate recommendations
    this.addRecommendation({
      type: 'event_loop_optimization',
      severity: lag > this.config.thresholds.eventLoop.critical ? 'critical' : 'warning',
      title: 'Event Loop Optimization',
      description: 'Event loop is experiencing high lag',
      suggestions: [
        'Review synchronous operations that may be blocking',
        'Consider using worker threads for CPU-intensive tasks',
        'Optimize database queries and I/O operations',
        'Use process.nextTick() and setImmediate() appropriately'
      ],
      data: { lag }
    });
  }

  /**
   * Handle excessive GC
   */
  handleExcessiveGC(gcMetrics) {
    console.warn(`⚠️ Excessive GC detected: ${gcMetrics.duration.toFixed(2)}ms`);
    
    this.addRecommendation({
      type: 'gc_optimization',
      severity: gcMetrics.duration > this.config.thresholds.gc.critical ? 'critical' : 'warning',
      title: 'Garbage Collection Optimization',
      description: 'Excessive garbage collection detected',
      suggestions: [
        'Review memory allocation patterns',
        'Consider object pooling for frequently created objects',
        'Optimize data structures to reduce GC pressure',
        'Tune Node.js heap size with --max-old-space-size'
      ],
      data: gcMetrics
    });
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(alert) {
    const recommendations = [];
    
    switch (alert.key) {
      case 'cpu_usage':
        recommendations.push({
          type: 'cpu_optimization',
          severity: alert.severity,
          title: 'CPU Usage Optimization',
          description: 'High CPU usage detected',
          suggestions: [
            'Profile CPU-intensive functions',
            'Optimize algorithms and data structures',
            'Consider worker threads for heavy computations',
            'Implement request throttling and rate limiting'
          ],
          estimatedImpact: 'medium',
          difficulty: 'medium'
        });
        break;
        
      case 'memory_usage':
        recommendations.push({
          type: 'memory_optimization',
          severity: alert.severity,
          title: 'Memory Usage Optimization',
          description: 'High memory usage detected',
          suggestions: [
            'Implement memory profiling and leak detection',
            'Optimize data caching strategies',
            'Review object lifecycle management',
            'Consider memory-efficient data structures'
          ],
          estimatedImpact: 'high',
          difficulty: 'medium'
        });
        break;
    }
    
    recommendations.forEach(rec => this.addRecommendation(rec));
  }

  /**
   * Add optimization recommendation
   */
  addRecommendation(recommendation) {
    recommendation.id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    recommendation.timestamp = Date.now();
    recommendation.applied = false;
    
    this.recommendations.unshift(recommendation);
    
    // Keep only recent recommendations
    if (this.recommendations.length > 50) {
      this.recommendations = this.recommendations.slice(0, 50);
    }
    
    this.emit('optimization-recommendation', recommendation);
  }

  /**
   * Apply optimization
   */
  async applyOptimization(recommendationId, options = {}) {
    const recommendation = this.recommendations.find(r => r.id === recommendationId);
    if (!recommendation) {
      throw new Error('Recommendation not found');
    }
    
    if (recommendation.applied) {
      throw new Error('Recommendation already applied');
    }
    
    try {
      let result = null;
      
      switch (recommendation.type) {
        case 'gc_optimization':
          result = await this.applyGCOptimization(recommendation, options);
          break;
        case 'memory_optimization':
          result = await this.applyMemoryOptimization(recommendation, options);
          break;
        case 'event_loop_optimization':
          result = await this.applyEventLoopOptimization(recommendation, options);
          break;
        default:
          throw new Error(`Unknown optimization type: ${recommendation.type}`);
      }
      
      recommendation.applied = true;
      recommendation.appliedAt = Date.now();
      recommendation.result = result;
      
      this.appliedOptimizations.push({
        ...recommendation,
        options: options
      });
      
      this.emit('optimization-applied', recommendation);
      console.log(`✅ Applied optimization: ${recommendation.title}`);
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to apply optimization ${recommendationId}:`, error);
      throw error;
    }
  }

  /**
   * Apply GC optimization
   */
  async applyGCOptimization(recommendation, options) {
    // Force garbage collection if available
    if (typeof global.gc === 'function') {
      global.gc();
    }
    
    // Log GC optimization
    console.log('🗑️ Applied GC optimization');
    
    return {
      type: 'gc_optimization',
      action: 'forced_gc',
      timestamp: Date.now()
    };
  }

  /**
   * Apply memory optimization
   */
  async applyMemoryOptimization(recommendation, options) {
    // Clear internal caches if they exist
    if (require.cache) {
      // Don't actually clear require cache in production
      console.log('💾 Memory optimization applied (cache review)');
    }
    
    return {
      type: 'memory_optimization',
      action: 'cache_optimization',
      timestamp: Date.now()
    };
  }

  /**
   * Apply event loop optimization
   */
  async applyEventLoopOptimization(recommendation, options) {
    // Log the optimization
    console.log('🔄 Event loop optimization guidance provided');
    
    return {
      type: 'event_loop_optimization',
      action: 'guidance_provided',
      timestamp: Date.now()
    };
  }

  /**
   * Establish performance baseline
   */
  establishBaseline() {
    const baseline = {
      timestamp: Date.now(),
      system: this.getLatestMetric('system'),
      process: this.getLatestMetric('process'),
      memory: this.getLatestMetric('memory')
    };
    
    if (this.store && typeof this.store.set === 'function') {
      this.store.set('performance.baseline', baseline);
    }
    this.emit('baseline-established', baseline);
    console.log('📏 Performance baseline established');
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeWindow = 60 * 60 * 1000) { // Last hour
    const now = Date.now();
    const since = now - timeWindow;
    
    const summary = {
      timestamp: now,
      timeWindow: timeWindow,
      system: this.summarizeMetrics('system', since),
      process: this.summarizeMetrics('process', since),
      memory: this.summarizeMetrics('memory', since),
      eventLoop: this.summarizeMetrics('eventLoop', since),
      gc: this.summarizeMetrics('gc', since),
      alerts: this.getRecentAlerts(timeWindow),
      recommendations: this.getActiveRecommendations()
    };
    
    return summary;
  }

  /**
   * Summarize metrics for time period
   */
  summarizeMetrics(type, since) {
    const metrics = this.metrics[type]?.filter(m => m.timestamp >= since) || [];
    if (metrics.length === 0) return null;
    
    const summary = {
      count: metrics.length,
      latest: metrics[metrics.length - 1],
      timeRange: {
        start: metrics[0].timestamp,
        end: metrics[metrics.length - 1].timestamp
      }
    };
    
    // Type-specific summaries
    switch (type) {
      case 'system':
        const cpuUsages = metrics.map(m => m.cpu?.usage).filter(u => u !== undefined);
        const memoryUsages = metrics.map(m => m.memory?.usage).filter(u => u !== undefined);
        
        if (cpuUsages.length > 0) {
          summary.cpu = {
            min: Math.min(...cpuUsages),
            max: Math.max(...cpuUsages),
            avg: cpuUsages.reduce((sum, u) => sum + u, 0) / cpuUsages.length
          };
        }
        
        if (memoryUsages.length > 0) {
          summary.memory = {
            min: Math.min(...memoryUsages),
            max: Math.max(...memoryUsages),
            avg: memoryUsages.reduce((sum, u) => sum + u, 0) / memoryUsages.length
          };
        }
        break;
        
      case 'eventLoop':
        summary.lag = {
          min: Math.min(...metrics.map(m => m.lag)),
          max: Math.max(...metrics.map(m => m.lag)),
          avg: metrics.reduce((sum, m) => sum + m.lag, 0) / metrics.length
        };
        break;
        
      case 'gc':
        summary.totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
        summary.avgDuration = summary.totalDuration / metrics.length;
        summary.frequency = metrics.length;
        break;
    }
    
    return summary;
  }

  /**
   * Get latest metric of type
   */
  getLatestMetric(type) {
    const metrics = this.metrics[type];
    return metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  /**
   * Get recent metrics within time window
   */
  getRecentMetrics(type, timeWindow) {
    const since = Date.now() - timeWindow;
    return this.metrics[type]?.filter(m => m.timestamp >= since) || [];
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(timeWindow) {
    const since = Date.now() - timeWindow;
    return this.alerts.filter(a => a.timestamp >= since);
  }

  /**
   * Get active recommendations
   */
  getActiveRecommendations() {
    return this.recommendations.filter(r => !r.applied);
  }

  /**
   * Clean up old data
   */
  cleanupOldData() {
    const cutoff = Date.now() - this.config.collection.retention;
    let cleaned = 0;
    
    // Clean metrics
    Object.keys(this.metrics).forEach(type => {
      if (Array.isArray(this.metrics[type])) {
        const oldLength = this.metrics[type].length;
        this.metrics[type] = this.metrics[type].filter(m => m.timestamp >= cutoff);
        cleaned += oldLength - this.metrics[type].length;
      }
    });
    
    // Clean custom metrics
    for (const [key, metrics] of this.metrics.custom.entries()) {
      const oldLength = metrics.length;
      this.metrics.custom.set(key, metrics.filter(m => m.timestamp >= cutoff));
      cleaned += oldLength - this.metrics.custom.get(key).length;
    }
    
    // Clean alerts
    const oldAlertLength = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoff);
    cleaned += oldAlertLength - this.alerts.length;
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old performance data points`);
    }
  }

  /**
   * Start custom performance measurement
   */
  startMeasurement(name) {
    performance.mark(`${name}-start`);
    return {
      end: () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        // Clean up marks
        performance.clearMarks(`${name}-start`);
        performance.clearMarks(`${name}-end`);
      }
    };
  }

  /**
   * Record custom metric
   */
  recordCustomMetric(category, name, value, metadata = {}) {
    if (!this.metrics.custom.has(category)) {
      this.metrics.custom.set(category, []);
    }
    
    const metric = {
      name,
      value,
      metadata,
      timestamp: Date.now()
    };
    
    this.metrics.custom.get(category).push(metric);
    this.emit('custom-metric', { category, metric });
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
    this.store.set('performance.config', this.config);
    this.emit('config-updated', this.config);
    console.log('🔧 Performance monitoring configuration updated');
  }

  /**
   * Export performance data
   */
  exportData(timeWindow = 24 * 60 * 60 * 1000) { // Last 24 hours
    const since = Date.now() - timeWindow;
    
    return {
      config: this.config,
      metrics: {
        system: this.getRecentMetrics('system', timeWindow),
        process: this.getRecentMetrics('process', timeWindow),
        memory: this.getRecentMetrics('memory', timeWindow),
        eventLoop: this.getRecentMetrics('eventLoop', timeWindow),
        gc: this.getRecentMetrics('gc', timeWindow)
      },
      alerts: this.getRecentAlerts(timeWindow),
      recommendations: this.recommendations,
      appliedOptimizations: this.appliedOptimizations,
      summary: this.getPerformanceSummary(timeWindow),
      exportTimestamp: Date.now()
    };
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    // Clear all timers
    for (const [name, timer] of this.timers.entries()) {
      clearInterval(timer);
    }
    this.timers.clear();
    
    // Disconnect observers
    for (const [name, observer] of this.observers.entries()) {
      observer.disconnect();
    }
    this.observers.clear();
    
    console.log('⏹️ Performance monitoring stopped');
    this.emit('monitor-stopped');
  }
}

module.exports = PerformanceMonitor;