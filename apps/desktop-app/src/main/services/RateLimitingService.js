const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * RateLimitingService - Advanced rate limiting and DDoS protection
 * 
 * Provides comprehensive protection against abuse with configurable rules,
 * sliding window algorithms, and intelligent threat detection.
 */
class RateLimitingService extends EventEmitter {
  constructor(securityManager, logger) {
    super();
    this.securityManager = securityManager;
    this.logger = logger;
    
    // Rate limiting configuration
    this.config = {
      // Default rate limits
      global: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 1000,
        burstLimit: 50, // Max requests in burst window
        burstWindowMs: 60 * 1000 // 1 minute burst window
      },
      
      // Endpoint-specific limits
      endpoints: {
        '/pair': {
          windowMs: 5 * 60 * 1000, // 5 minutes
          maxRequests: 10,
          burstLimit: 3,
          burstWindowMs: 30 * 1000
        },
        '/health': {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 60,
          burstLimit: 10,
          burstWindowMs: 10 * 1000
        },
        'websocket-connection': {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 5, // Max 5 connections per minute
          burstLimit: 2,
          burstWindowMs: 10 * 1000
        },
        'websocket-message': {
          windowMs: 60 * 1000, // 1 minute
          maxRequests: 120, // 2 messages per second
          burstLimit: 20,
          burstWindowMs: 10 * 1000
        }
      },
      
      // DDoS protection thresholds
      ddosProtection: {
        enabled: true,
        suspiciousThreshold: 500, // Requests per minute that trigger investigation
        attackThreshold: 1000, // Requests per minute that trigger immediate blocking
        blockDuration: 60 * 60 * 1000, // 1 hour
        whitelistEnabled: true,
        adaptiveThresholds: true
      },
      
      // Progressive penalties
      penalties: {
        enabled: true,
        escalationFactor: 2,
        maxPenaltyDuration: 24 * 60 * 60 * 1000, // 24 hours
        decayRate: 0.1 // How quickly penalties decay
      }
    };
    
    // In-memory storage for rate limiting data
    this.requestCounts = new Map(); // IP -> { endpoint -> { count, resetTime, history } }
    this.penaltyScores = new Map(); // IP -> { score, lastPenalty, decayTime }
    this.blockedIPs = new Map(); // IP -> { blockedUntil, reason, attempts }
    this.whitelist = new Set(); // Whitelisted IPs
    this.suspiciousIPs = new Map(); // IP -> { firstSeen, requestCount, patterns }
    
    // Statistics and monitoring
    this.stats = {
      totalRequests: 0,
      blockedRequests: 0,
      ddosAttacks: 0,
      lastReset: Date.now()
    };
    
    this.initialize();
  }

  /**
   * Initialize rate limiting service
   */
  initialize() {
    try {
      console.log('🚦 Initializing Rate Limiting Service...');
      
      // Load configuration from security manager
      this.loadConfiguration();
      
      // Start cleanup intervals
      this.startCleanupTasks();
      
      // Initialize default whitelist
      this.initializeWhitelist();
      
      console.log('✅ Rate Limiting Service initialized successfully');
      this.emit('rate-limiter-initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Rate Limiting Service:', error);
      throw error;
    }
  }

  /**
   * Load configuration from security manager
   */
  loadConfiguration() {
    if (this.securityManager) {
      const securityConfig = this.securityManager.getSecurityStatus().config;
      if (securityConfig.rateLimiting) {
        // Merge with existing config
        this.config.global = { ...this.config.global, ...securityConfig.rateLimiting };
      }
    }
  }

  /**
   * Initialize default whitelist
   */
  initializeWhitelist() {
    // Add localhost and common development IPs to whitelist
    const defaultWhitelist = [
      '127.0.0.1',
      '::1',
      'localhost'
    ];
    
    defaultWhitelist.forEach(ip => this.whitelist.add(ip));
    console.log(`🤍 Whitelisted ${defaultWhitelist.length} default IPs`);
  }

  /**
   * Check if request should be rate limited
   */
  checkRateLimit(ip, endpoint = 'global', userAgent = '') {
    this.stats.totalRequests++;
    
    // Skip rate limiting for whitelisted IPs
    if (this.whitelist.has(ip)) {
      return { allowed: true, remaining: Infinity };
    }
    
    // Check if IP is blocked
    if (this.isIPBlocked(ip)) {
      this.stats.blockedRequests++;
      return {
        allowed: false,
        reason: 'IP_BLOCKED',
        retryAfter: this.getBlockRetryAfter(ip)
      };
    }
    
    // Get rate limit configuration for endpoint
    const limits = this.config.endpoints[endpoint] || this.config.global;
    
    // Check both normal and burst limits
    const normalLimit = this.checkNormalRateLimit(ip, endpoint, limits);
    const burstLimit = this.checkBurstRateLimit(ip, endpoint, limits);
    
    // Use the more restrictive limit
    const result = normalLimit.allowed && burstLimit.allowed ? 
      { allowed: true, remaining: Math.min(normalLimit.remaining, burstLimit.remaining) } :
      { allowed: false, reason: 'RATE_LIMIT_EXCEEDED', retryAfter: Math.max(normalLimit.retryAfter || 0, burstLimit.retryAfter || 0) };
    
    // Track suspicious activity
    if (!result.allowed) {
      this.trackSuspiciousActivity(ip, endpoint, userAgent);
      this.stats.blockedRequests++;
    }
    
    // Apply penalties for repeated violations
    if (!result.allowed) {
      this.applyPenalty(ip, endpoint);
    }
    
    return result;
  }

  /**
   * Check normal rate limit using sliding window
   */
  checkNormalRateLimit(ip, endpoint, limits) {
    const now = Date.now();
    const windowStart = now - limits.windowMs;
    
    // Initialize IP tracking if needed
    if (!this.requestCounts.has(ip)) {
      this.requestCounts.set(ip, {});
    }
    
    const ipData = this.requestCounts.get(ip);
    
    // Initialize endpoint tracking if needed
    if (!ipData[endpoint]) {
      ipData[endpoint] = {
        count: 0,
        resetTime: now + limits.windowMs,
        history: []
      };
    }
    
    const endpointData = ipData[endpoint];
    
    // Clean old entries from history
    endpointData.history = endpointData.history.filter(timestamp => timestamp > windowStart);
    
    // Reset counter if window has passed
    if (now >= endpointData.resetTime) {
      endpointData.count = 0;
      endpointData.resetTime = now + limits.windowMs;
      endpointData.history = [];
    }
    
    // Check if limit is exceeded
    if (endpointData.history.length >= limits.maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil((endpointData.resetTime - now) / 1000)
      };
    }
    
    // Add current request to history
    endpointData.history.push(now);
    endpointData.count++;
    
    return {
      allowed: true,
      remaining: limits.maxRequests - endpointData.history.length
    };
  }

  /**
   * Check burst rate limit
   */
  checkBurstRateLimit(ip, endpoint, limits) {
    if (!limits.burstLimit || !limits.burstWindowMs) {
      return { allowed: true, remaining: Infinity };
    }
    
    const now = Date.now();
    const burstWindowStart = now - limits.burstWindowMs;
    
    const ipData = this.requestCounts.get(ip);
    const endpointData = ipData[endpoint];
    
    // Count requests in burst window
    const burstRequests = endpointData.history.filter(timestamp => timestamp > burstWindowStart);
    
    if (burstRequests.length >= limits.burstLimit) {
      return {
        allowed: false,
        retryAfter: Math.ceil(limits.burstWindowMs / 1000)
      };
    }
    
    return {
      allowed: true,
      remaining: limits.burstLimit - burstRequests.length
    };
  }

  /**
   * Track suspicious activity for DDoS detection
   */
  trackSuspiciousActivity(ip, endpoint, userAgent) {
    const now = Date.now();
    
    if (!this.suspiciousIPs.has(ip)) {
      this.suspiciousIPs.set(ip, {
        firstSeen: now,
        requestCount: 0,
        patterns: {
          endpoints: new Set(),
          userAgents: new Set(),
          rapidRequests: 0
        }
      });
    }
    
    const suspiciousData = this.suspiciousIPs.get(ip);
    suspiciousData.requestCount++;
    suspiciousData.patterns.endpoints.add(endpoint);
    suspiciousData.patterns.userAgents.add(userAgent);
    
    // Check for rapid requests (potential bot behavior)
    const recentRequests = this.getRecentRequestCount(ip, 60 * 1000); // Last minute
    if (recentRequests > this.config.ddosProtection.suspiciousThreshold) {
      suspiciousData.patterns.rapidRequests++;
      this.handleSuspiciousActivity(ip, suspiciousData);
    }
    
    // Check for DDoS attack patterns
    if (recentRequests > this.config.ddosProtection.attackThreshold) {
      this.handleDDoSAttack(ip, suspiciousData);
    }
  }

  /**
   * Get recent request count for IP
   */
  getRecentRequestCount(ip, timeWindow) {
    const now = Date.now();
    const windowStart = now - timeWindow;
    
    const ipData = this.requestCounts.get(ip);
    if (!ipData) return 0;
    
    let totalRequests = 0;
    for (const endpoint in ipData) {
      const endpointData = ipData[endpoint];
      totalRequests += endpointData.history.filter(timestamp => timestamp > windowStart).length;
    }
    
    return totalRequests;
  }

  /**
   * Handle suspicious activity
   */
  handleSuspiciousActivity(ip, suspiciousData) {
    const event = {
      type: 'suspicious_activity',
      ip: ip,
      timestamp: new Date(),
      severity: 'warning',
      details: {
        requestCount: suspiciousData.requestCount,
        duration: Date.now() - suspiciousData.firstSeen,
        patterns: {
          endpointCount: suspiciousData.patterns.endpoints.size,
          userAgentCount: suspiciousData.patterns.userAgents.size,
          rapidRequests: suspiciousData.patterns.rapidRequests
        }
      }
    };
    
    if (this.securityManager) {
      this.securityManager.logSecurityEvent(event);
    }
    
    this.emit('suspicious-activity', event);
    console.warn(`⚠️ Suspicious activity detected from IP ${ip}`);
  }

  /**
   * Handle DDoS attack
   */
  handleDDoSAttack(ip, suspiciousData) {
    this.stats.ddosAttacks++;
    
    // Block IP immediately
    this.blockIP(ip, this.config.ddosProtection.blockDuration, 'DDoS_ATTACK');
    
    const event = {
      type: 'ddos_attack',
      ip: ip,
      timestamp: new Date(),
      severity: 'critical',
      details: {
        requestCount: suspiciousData.requestCount,
        attackDuration: Date.now() - suspiciousData.firstSeen,
        patterns: suspiciousData.patterns,
        blocked: true,
        blockDuration: this.config.ddosProtection.blockDuration
      }
    };
    
    if (this.securityManager) {
      this.securityManager.logSecurityEvent(event);
    }
    
    this.emit('ddos-attack', event);
    console.error(`🚨 DDoS attack detected and blocked from IP ${ip}`);
  }

  /**
   * Apply progressive penalties
   */
  applyPenalty(ip, endpoint) {
    if (!this.config.penalties.enabled) return;
    
    if (!this.penaltyScores.has(ip)) {
      this.penaltyScores.set(ip, {
        score: 0,
        lastPenalty: 0,
        decayTime: Date.now()
      });
    }
    
    const penalty = this.penaltyScores.get(ip);
    const now = Date.now();
    
    // Apply decay to existing penalty
    const timeSinceDecay = now - penalty.decayTime;
    const decayAmount = timeSinceDecay * this.config.penalties.decayRate / (60 * 60 * 1000); // Per hour
    penalty.score = Math.max(0, penalty.score - decayAmount);
    penalty.decayTime = now;
    
    // Increase penalty score
    penalty.score += 1;
    penalty.lastPenalty = now;
    
    // Apply progressive blocking based on penalty score
    if (penalty.score >= 5) {
      const blockDuration = Math.min(
        penalty.score * this.config.penalties.escalationFactor * 60 * 1000,
        this.config.penalties.maxPenaltyDuration
      );
      
      this.blockIP(ip, blockDuration, 'PROGRESSIVE_PENALTY');
      
      console.log(`📈 Progressive penalty applied to IP ${ip}: ${blockDuration / 1000}s block (score: ${penalty.score})`);
    }
  }

  /**
   * Block IP address
   */
  blockIP(ip, duration, reason = 'RATE_LIMIT_VIOLATION') {
    const now = Date.now();
    const blockedUntil = now + duration;
    
    // Update existing block or create new one
    if (this.blockedIPs.has(ip)) {
      const existing = this.blockedIPs.get(ip);
      existing.blockedUntil = Math.max(existing.blockedUntil, blockedUntil);
      existing.attempts++;
      existing.lastAttempt = now;
    } else {
      this.blockedIPs.set(ip, {
        blockedUntil: blockedUntil,
        reason: reason,
        attempts: 1,
        firstBlocked: now,
        lastAttempt: now
      });
    }
    
    // Also block in security manager if available
    if (this.securityManager) {
      this.securityManager.blockIP(ip, duration);
    }
    
    this.emit('ip-blocked', { ip, duration, reason });
    console.log(`🚫 Blocked IP ${ip} for ${duration / 1000}s (reason: ${reason})`);
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip) {
    const now = Date.now();
    const blockInfo = this.blockedIPs.get(ip);
    
    if (!blockInfo) return false;
    
    if (now >= blockInfo.blockedUntil) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  /**
   * Get retry after time for blocked IP
   */
  getBlockRetryAfter(ip) {
    const blockInfo = this.blockedIPs.get(ip);
    if (!blockInfo) return 0;
    
    return Math.ceil((blockInfo.blockedUntil - Date.now()) / 1000);
  }

  /**
   * Create rate limiting middleware for HTTP endpoints
   */
  createHTTPMiddleware(endpoint) {
    return (req, res, next) => {
      const ip = this.getClientIP(req);
      const userAgent = req.get('User-Agent') || '';
      
      const result = this.checkRateLimit(ip, endpoint, userAgent);
      
      if (!result.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          reason: result.reason,
          retryAfter: result.retryAfter
        });
        return;
      }
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Remaining': result.remaining,
        'X-RateLimit-Reset': new Date(Date.now() + (this.config.global.windowMs)).toISOString()
      });
      
      next();
    };
  }

  /**
   * Create rate limiting middleware for WebSocket connections
   */
  createWebSocketMiddleware() {
    return (socket, next) => {
      const ip = this.getSocketIP(socket);
      const userAgent = socket.handshake.headers['user-agent'] || '';
      
      const result = this.checkRateLimit(ip, 'websocket-connection', userAgent);
      
      if (!result.allowed) {
        const error = new Error('Rate limit exceeded');
        error.data = {
          reason: result.reason,
          retryAfter: result.retryAfter
        };
        return next(error);
      }
      
      // Set up per-message rate limiting
      this.setupMessageRateLimiting(socket, ip);
      
      next();
    };
  }

  /**
   * Set up per-message rate limiting for WebSocket
   */
  setupMessageRateLimiting(socket, ip) {
    const originalEmit = socket.emit.bind(socket);
    
    socket.emit = (event, ...args) => {
      // Skip rate limiting for internal events
      if (event.startsWith('__internal')) {
        return originalEmit(event, ...args);
      }
      
      const result = this.checkRateLimit(ip, 'websocket-message');
      
      if (!result.allowed) {
        socket.emit('rate-limit-exceeded', {
          reason: result.reason,
          retryAfter: result.retryAfter
        });
        return false;
      }
      
      return originalEmit(event, ...args);
    };
  }

  /**
   * Get client IP from request
   */
  getClientIP(req) {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  }

  /**
   * Get client IP from socket
   */
  getSocketIP(socket) {
    return socket.handshake.address ||
           socket.conn.remoteAddress ||
           socket.request.connection.remoteAddress ||
           '127.0.0.1';
  }

  /**
   * Start cleanup tasks
   */
  startCleanupTasks() {
    // Clean expired blocks every 5 minutes
    setInterval(() => {
      this.cleanupExpiredBlocks();
    }, 5 * 60 * 1000);
    
    // Clean old request data every 30 minutes
    setInterval(() => {
      this.cleanupOldRequestData();
    }, 30 * 60 * 1000);
    
    // Clean suspicious IP data every hour
    setInterval(() => {
      this.cleanupSuspiciousIPs();
    }, 60 * 60 * 1000);
    
    // Reset statistics daily
    setInterval(() => {
      this.resetDailyStats();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Clean up expired blocks
   */
  cleanupExpiredBlocks() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [ip, blockInfo] of this.blockedIPs.entries()) {
      if (now >= blockInfo.blockedUntil) {
        this.blockedIPs.delete(ip);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired IP blocks`);
    }
  }

  /**
   * Clean up old request data
   */
  cleanupOldRequestData() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleaned = 0;
    
    for (const [ip, ipData] of this.requestCounts.entries()) {
      for (const endpoint in ipData) {
        const endpointData = ipData[endpoint];
        const oldSize = endpointData.history.length;
        endpointData.history = endpointData.history.filter(timestamp => now - timestamp < maxAge);
        cleaned += oldSize - endpointData.history.length;
        
        // Remove endpoint data if no recent requests
        if (endpointData.history.length === 0 && now - endpointData.resetTime > maxAge) {
          delete ipData[endpoint];
        }
      }
      
      // Remove IP data if no endpoints
      if (Object.keys(ipData).length === 0) {
        this.requestCounts.delete(ip);
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} old request records`);
    }
  }

  /**
   * Clean up suspicious IP data
   */
  cleanupSuspiciousIPs() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    let cleaned = 0;
    
    for (const [ip, suspiciousData] of this.suspiciousIPs.entries()) {
      if (now - suspiciousData.firstSeen > maxAge) {
        this.suspiciousIPs.delete(ip);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} suspicious IP records`);
    }
  }

  /**
   * Reset daily statistics
   */
  resetDailyStats() {
    console.log(`📊 Daily stats - Requests: ${this.stats.totalRequests}, Blocked: ${this.stats.blockedRequests}, DDoS: ${this.stats.ddosAttacks}`);
    
    this.stats.totalRequests = 0;
    this.stats.blockedRequests = 0;
    this.stats.ddosAttacks = 0;
    this.stats.lastReset = Date.now();
  }

  /**
   * Add IP to whitelist
   */
  addToWhitelist(ip) {
    this.whitelist.add(ip);
    console.log(`🤍 Added ${ip} to whitelist`);
  }

  /**
   * Remove IP from whitelist
   */
  removeFromWhitelist(ip) {
    this.whitelist.delete(ip);
    console.log(`❌ Removed ${ip} from whitelist`);
  }

  /**
   * Unblock IP
   */
  unblockIP(ip) {
    const wasBlocked = this.blockedIPs.has(ip);
    this.blockedIPs.delete(ip);
    
    if (wasBlocked) {
      console.log(`✅ Unblocked IP ${ip}`);
      this.emit('ip-unblocked', { ip });
    }
    
    return wasBlocked;
  }

  /**
   * Get current statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      whitelistedIPs: this.whitelist.size,
      activeConnections: this.requestCounts.size
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
    this.emit('config-updated', this.config);
    console.log('🔧 Rate limiting configuration updated');
  }

  /**
   * Export rate limiting data
   */
  exportData() {
    return {
      config: this.config,
      statistics: this.getStatistics(),
      blockedIPs: Array.from(this.blockedIPs.entries()),
      whitelist: Array.from(this.whitelist),
      suspiciousIPs: Array.from(this.suspiciousIPs.entries()),
      timestamp: new Date()
    };
  }
}

module.exports = RateLimitingService;