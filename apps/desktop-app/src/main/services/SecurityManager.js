const crypto = require('crypto');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const { EventEmitter } = require('events');

/**
 * SecurityManager Service - Comprehensive security hardening and monitoring
 * 
 * Provides enterprise-grade security features including input validation,
 * rate limiting, encryption, access control, audit logging, and threat detection.
 */
class SecurityManager extends EventEmitter {
  constructor(store, logger) {
    super();
    this.store = store;
    this.logger = logger;
    
    // Security configuration
    this.config = {
      rateLimiting: {
        enabled: true,
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100, // per window
        blockDuration: 60 * 60 * 1000 // 1 hour block
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
        tagLength: 16,
        saltRounds: 12
      },
      authentication: {
        maxLoginAttempts: 5,
        lockoutDuration: 30 * 60 * 1000, // 30 minutes
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        tokenRotationInterval: 60 * 60 * 1000 // 1 hour
      },
      validation: {
        maxInputLength: 10000,
        allowedFileTypes: ['.exe', '.jar', '.zip', '.tar.gz'],
        maxFileSize: 500 * 1024 * 1024, // 500MB
        sanitizationRules: {
          stripHtml: true,
          normalizeWhitespace: true,
          preventXSS: true
        }
      }
    };
    
    // Security state tracking
    this.blockedIPs = new Map();
    this.failedAttempts = new Map();
    this.activeSessions = new Map();
    this.securityEvents = [];
    this.threatPatterns = new Map();
    
    // Security keys
    this.masterKey = this.getOrCreateMasterKey();
    this.hmacSecret = this.getOrCreateHMACSecret();
    
    this.initializeSecurity();
  }

  /**
   * Initialize security subsystems
   */
  async initializeSecurity() {
    try {
      console.log('🔒 Initializing Security Manager...');
      
      // Load security configuration
      await this.loadSecurityConfig();
      
      // Initialize threat detection patterns
      this.initializeThreatDetection();
      
      // Start security monitoring
      this.startSecurityMonitoring();
      
      // Initialize rate limiting
      this.initializeRateLimiting();
      
      console.log('✅ Security Manager initialized successfully');
      this.emit('security-initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Security Manager:', error);
      throw error;
    }
  }

  /**
   * Get or create master encryption key
   */
  getOrCreateMasterKey() {
    let masterKey = this.store.get('security.masterKey');
    if (!masterKey) {
      masterKey = crypto.randomBytes(32).toString('hex');
      this.store.set('security.masterKey', masterKey);
      console.log('🔑 Generated new master encryption key');
    }
    return Buffer.from(masterKey, 'hex');
  }

  /**
   * Get or create HMAC secret
   */
  getOrCreateHMACSecret() {
    let hmacSecret = this.store.get('security.hmacSecret');
    if (!hmacSecret) {
      hmacSecret = crypto.randomBytes(64).toString('hex');
      this.store.set('security.hmacSecret', hmacSecret);
      console.log('🔑 Generated new HMAC secret');
    }
    return hmacSecret;
  }

  /**
   * Load security configuration from store
   */
  async loadSecurityConfig() {
    const storedConfig = this.store.get('security.config');
    if (storedConfig) {
      this.config = { ...this.config, ...storedConfig };
    }
    
    // Save current config to store
    this.store.set('security.config', this.config);
  }

  /**
   * Initialize threat detection patterns
   */
  initializeThreatDetection() {
    // SQL Injection patterns
    this.threatPatterns.set('sql_injection', [
      /('|(\\')|(;)|(--)|(\s+(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\s+)/i,
      /(INFORMATION_SCHEMA|SYS\.TABLES|DUAL|WAITFOR|DELAY)/i
    ]);
    
    // XSS patterns
    this.threatPatterns.set('xss', [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi
    ]);
    
    // Path traversal patterns
    this.threatPatterns.set('path_traversal', [
      /\.\.\//g,
      /\.\.\\\\g,
      /%2e%2e%2f/gi,
      /%252e%252e%252f/gi
    ]);
    
    // Command injection patterns
    this.threatPatterns.set('command_injection', [
      /(\||&|;|`|\$\(|\${)/g,
      /(nc|netcat|telnet|wget|curl)\s/gi,
      /(rm|del|format|mkfs)\s/gi
    ]);
    
    console.log('🛡️ Threat detection patterns initialized');
  }

  /**
   * Initialize rate limiting middleware
   */
  initializeRateLimiting() {
    if (!this.config.rateLimiting.enabled) return;
    
    this.rateLimiter = rateLimit({
      windowMs: this.config.rateLimiting.windowMs,
      max: this.config.rateLimiting.maxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res, next, options) => {
        this.handleRateLimitExceeded(req.ip, options);
        res.status(options.statusCode).json({
          error: options.message,
          retryAfter: Math.ceil(options.windowMs / 1000)
        });
      }
    });
    
    console.log('⚡ Rate limiting initialized');
  }

  /**
   * Handle rate limit exceeded
   */
  handleRateLimitExceeded(ip, options) {
    const event = {
      type: 'rate_limit_exceeded',
      ip: ip,
      timestamp: new Date(),
      severity: 'warning',
      details: { limit: options.max, window: options.windowMs }
    };
    
    this.logSecurityEvent(event);
    
    // Block IP temporarily if excessive rate limiting
    const attempts = this.failedAttempts.get(ip) || 0;
    this.failedAttempts.set(ip, attempts + 1);
    
    if (attempts >= 3) { // Block after 3 rate limit violations
      this.blockIP(ip, this.config.rateLimiting.blockDuration);
    }
  }

  /**
   * Block IP address
   */
  blockIP(ip, duration = 3600000) { // Default 1 hour
    const blockInfo = {
      ip: ip,
      blockedAt: new Date(),
      expiresAt: new Date(Date.now() + duration),
      reason: 'Excessive rate limiting violations'
    };
    
    this.blockedIPs.set(ip, blockInfo);
    
    const event = {
      type: 'ip_blocked',
      ip: ip,
      timestamp: new Date(),
      severity: 'high',
      details: blockInfo
    };
    
    this.logSecurityEvent(event);
    console.log(`🚫 Blocked IP ${ip} for ${duration / 1000} seconds`);
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip) {
    const blockInfo = this.blockedIPs.get(ip);
    if (!blockInfo) return false;
    
    if (new Date() > blockInfo.expiresAt) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }

  /**
   * Validate and sanitize input
   */
  validateInput(input, options = {}) {
    const opts = { ...this.config.validation, ...options };
    
    // Type validation
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    // Length validation
    if (input.length > opts.maxInputLength) {
      throw new Error(`Input too long (max ${opts.maxInputLength} characters)`);
    }
    
    // Threat detection
    this.detectThreats(input);
    
    // Sanitization
    let sanitized = input;
    
    if (opts.sanitizationRules.stripHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    if (opts.sanitizationRules.normalizeWhitespace) {
      sanitized = sanitized.replace(/\\s+/g, ' ').trim();
    }
    
    if (opts.sanitizationRules.preventXSS) {
      sanitized = validator.escape(sanitized);
    }
    
    return sanitized;
  }

  /**
   * Detect security threats in input
   */
  detectThreats(input) {
    for (const [threatType, patterns] of this.threatPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          const event = {
            type: 'threat_detected',
            threatType: threatType,
            timestamp: new Date(),
            severity: 'critical',
            details: { input: input.substring(0, 200), pattern: pattern.toString() }
          };
          
          this.logSecurityEvent(event);
          throw new Error(`Security threat detected: ${threatType}`);
        }
      }
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data) {
    try {
      const iv = crypto.randomBytes(this.config.encryption.ivLength);
      const cipher = crypto.createCipherGCM(this.config.encryption.algorithm, this.masterKey, iv);
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    try {
      const { encrypted, iv, tag } = encryptedData;
      const decipher = crypto.createDecipherGCM(
        this.config.encryption.algorithm,
        this.masterKey,
        Buffer.from(iv, 'hex')
      );
      
      decipher.setAuthTag(Buffer.from(tag, 'hex'));
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash password securely
   */
  async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(this.config.encryption.saltRounds);
      const hash = await bcrypt.hash(password, salt);
      return hash;
    } catch (error) {
      console.error('Password hashing failed:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password hash
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Generate secure token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Create HMAC signature
   */
  createHMACSignature(data) {
    const hmac = crypto.createHmac('sha256', this.hmacSecret);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
  }

  /**
   * Verify HMAC signature
   */
  verifyHMACSignature(data, signature) {
    const expectedSignature = this.createHMACSignature(data);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Validate file upload security
   */
  validateFileUpload(file) {
    const { name, size, type } = file;
    
    // File extension validation
    const ext = name.toLowerCase().substring(name.lastIndexOf('.'));
    if (!this.config.validation.allowedFileTypes.includes(ext)) {
      throw new Error(`File type not allowed: ${ext}`);
    }
    
    // File size validation
    if (size > this.config.validation.maxFileSize) {
      throw new Error(`File too large: ${size} bytes (max ${this.config.validation.maxFileSize})`);
    }
    
    // MIME type validation
    const allowedMimeTypes = {
      '.exe': ['application/x-msdownload', 'application/octet-stream'],
      '.jar': ['application/java-archive'],
      '.zip': ['application/zip'],
      '.tar.gz': ['application/gzip']
    };
    
    const expectedMimeTypes = allowedMimeTypes[ext];
    if (expectedMimeTypes && !expectedMimeTypes.includes(type)) {
      console.warn(`MIME type mismatch: expected ${expectedMimeTypes.join('|')}, got ${type}`);
    }
    
    return true;
  }

  /**
   * Create security headers middleware
   */
  getSecurityHeadersMiddleware() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "wss:", "ws:"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    });
  }

  /**
   * Log security event
   */
  logSecurityEvent(event) {
    const logEntry = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: event.timestamp || new Date()
    };
    
    this.securityEvents.push(logEntry);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
    
    // Log to system logger
    this.logger.warn('Security Event', logEntry);
    
    // Emit event for real-time monitoring
    this.emit('security-event', logEntry);
    
    // Handle critical events
    if (event.severity === 'critical') {
      this.handleCriticalSecurityEvent(logEntry);
    }
  }

  /**
   * Handle critical security events
   */
  handleCriticalSecurityEvent(event) {
    console.error('🚨 CRITICAL SECURITY EVENT:', event);
    
    // Auto-block IP for threat detection
    if (event.type === 'threat_detected' && event.ip) {
      this.blockIP(event.ip, 24 * 60 * 60 * 1000); // 24 hour block
    }
    
    // Emit critical alert
    this.emit('critical-security-alert', event);
  }

  /**
   * Start security monitoring
   */
  startSecurityMonitoring() {
    // Clean up expired blocks every 5 minutes
    setInterval(() => {
      this.cleanupExpiredBlocks();
    }, 5 * 60 * 1000);
    
    // Reset failed attempts every hour
    setInterval(() => {
      this.failedAttempts.clear();
    }, 60 * 60 * 1000);
    
    // Generate security report every 6 hours
    setInterval(() => {
      this.generateSecurityReport();
    }, 6 * 60 * 60 * 1000);
    
    console.log('👁️ Security monitoring started');
  }

  /**
   * Clean up expired IP blocks
   */
  cleanupExpiredBlocks() {
    const now = new Date();
    let cleaned = 0;
    
    for (const [ip, blockInfo] of this.blockedIPs.entries()) {
      if (now > blockInfo.expiresAt) {
        this.blockedIPs.delete(ip);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired IP blocks`);
    }
  }

  /**
   * Generate security report
   */
  generateSecurityReport() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentEvents = this.securityEvents.filter(event => 
      new Date(event.timestamp) > last24Hours
    );
    
    const report = {
      timestamp: now,
      period: '24 hours',
      summary: {
        totalEvents: recentEvents.length,
        criticalEvents: recentEvents.filter(e => e.severity === 'critical').length,
        blockedIPs: this.blockedIPs.size,
        threatTypes: this.getThreatTypeCounts(recentEvents)
      },
      recommendations: this.generateSecurityRecommendations(recentEvents)
    };
    
    console.log('📊 Security Report Generated:', JSON.stringify(report, null, 2));
    this.emit('security-report', report);
    
    return report;
  }

  /**
   * Get threat type counts
   */
  getThreatTypeCounts(events) {
    const counts = {};
    events.forEach(event => {
      if (event.threatType) {
        counts[event.threatType] = (counts[event.threatType] || 0) + 1;
      }
    });
    return counts;
  }

  /**
   * Generate security recommendations
   */
  generateSecurityRecommendations(recentEvents) {
    const recommendations = [];
    
    const criticalCount = recentEvents.filter(e => e.severity === 'critical').length;
    if (criticalCount > 10) {
      recommendations.push('High number of critical security events detected. Consider implementing additional security measures.');
    }
    
    const rateLimitCount = recentEvents.filter(e => e.type === 'rate_limit_exceeded').length;
    if (rateLimitCount > 50) {
      recommendations.push('Excessive rate limiting violations. Consider reducing rate limits or implementing additional DDoS protection.');
    }
    
    if (this.blockedIPs.size > 20) {
      recommendations.push('Large number of blocked IPs. Monitor for potential coordinated attacks.');
    }
    
    return recommendations;
  }

  /**
   * Get security status
   */
  getSecurityStatus() {
    return {
      isInitialized: true,
      config: this.config,
      statistics: {
        blockedIPs: this.blockedIPs.size,
        failedAttempts: this.failedAttempts.size,
        securityEvents: this.securityEvents.length,
        threatPatterns: this.threatPatterns.size
      },
      lastReport: this.lastSecurityReport,
      uptime: Date.now() - this.startTime || Date.now()
    };
  }

  /**
   * Update security configuration
   */
  updateSecurityConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.store.set('security.config', this.config);
    
    this.emit('security-config-updated', this.config);
    console.log('🔧 Security configuration updated');
  }

  /**
   * Export security data for analysis
   */
  exportSecurityData() {
    return {
      config: this.config,
      events: this.securityEvents,
      blockedIPs: Array.from(this.blockedIPs.entries()),
      failedAttempts: Array.from(this.failedAttempts.entries()),
      timestamp: new Date()
    };
  }
}

module.exports = SecurityManager;