const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;

// Import services for testing
const SecurityManager = require('../../src/main/services/SecurityManager');
const RateLimitingService = require('../../src/main/services/RateLimitingService');

describe('Rate Limiting and DDoS Protection Tests', () => {
  let store;
  let tempDir;
  let securityManager;
  let rateLimitingService;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-rate-limit-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'rate-limit-test-store',
      cwd: tempDir
    });
  });

  afterAll(async () => {
    // Clean up temporary files
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to clean up temp directory:', error.message);
    }
  });

  beforeEach(async () => {
    store.clear();
    
    // Initialize services
    securityManager = new SecurityManager(store, console);
    rateLimitingService = new RateLimitingService(securityManager, console);
    
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Basic Rate Limiting', () => {
    test('should initialize rate limiting service successfully', () => {
      expect(rateLimitingService).toBeDefined();
      expect(rateLimitingService.config).toBeDefined();
      expect(rateLimitingService.stats).toBeDefined();
    });

    test('should allow requests within rate limits', () => {
      const ip = '192.168.1.100';
      const endpoint = 'test-endpoint';
      
      // Configure low limits for testing
      rateLimitingService.config.endpoints[endpoint] = {
        windowMs: 60 * 1000,
        maxRequests: 5,
        burstLimit: 2,
        burstWindowMs: 10 * 1000
      };
      
      // Should allow first few requests
      for (let i = 0; i < 3; i++) {
        const result = rateLimitingService.checkRateLimit(ip, endpoint);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBeGreaterThanOrEqual(0);
      }
    });

    test('should block requests exceeding rate limits', () => {
      const ip = '192.168.1.101';
      const endpoint = 'test-endpoint';
      
      // Configure very low limits for testing
      rateLimitingService.config.endpoints[endpoint] = {
        windowMs: 60 * 1000,
        maxRequests: 2,
        burstLimit: 1,
        burstWindowMs: 10 * 1000
      };
      
      // First request should be allowed
      let result = rateLimitingService.checkRateLimit(ip, endpoint);
      expect(result.allowed).toBe(true);
      
      // Second request should trigger burst limit
      result = rateLimitingService.checkRateLimit(ip, endpoint);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('RATE_LIMIT_EXCEEDED');
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('should handle sliding window correctly', async () => {
      const ip = '192.168.1.102';
      const endpoint = 'test-endpoint';
      
      rateLimitingService.config.endpoints[endpoint] = {
        windowMs: 100, // Very short window for testing
        maxRequests: 2,
        burstLimit: 10, // High burst limit to test normal limit
        burstWindowMs: 10 * 1000
      };
      
      // Use up the limit
      let result1 = rateLimitingService.checkRateLimit(ip, endpoint);
      let result2 = rateLimitingService.checkRateLimit(ip, endpoint);
      let result3 = rateLimitingService.checkRateLimit(ip, endpoint);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(false);
      
      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be allowed again
      const result4 = rateLimitingService.checkRateLimit(ip, endpoint);
      expect(result4.allowed).toBe(true);
    });

    test('should handle burst rate limiting', () => {
      const ip = '192.168.1.103';
      const endpoint = 'test-endpoint';
      
      rateLimitingService.config.endpoints[endpoint] = {
        windowMs: 60 * 1000,
        maxRequests: 10, // High normal limit
        burstLimit: 2, // Low burst limit
        burstWindowMs: 10 * 1000
      };
      
      // First two requests should be allowed
      let result1 = rateLimitingService.checkRateLimit(ip, endpoint);
      let result2 = rateLimitingService.checkRateLimit(ip, endpoint);
      
      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      
      // Third request should be blocked by burst limit
      let result3 = rateLimitingService.checkRateLimit(ip, endpoint);
      expect(result3.allowed).toBe(false);
      expect(result3.reason).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should whitelist IPs correctly', () => {
      const ip = '192.168.1.200';
      const endpoint = 'test-endpoint';
      
      // Configure very restrictive limits
      rateLimitingService.config.endpoints[endpoint] = {
        windowMs: 60 * 1000,
        maxRequests: 1,
        burstLimit: 1,
        burstWindowMs: 10 * 1000
      };
      
      // Add IP to whitelist
      rateLimitingService.addToWhitelist(ip);
      
      // Should allow unlimited requests for whitelisted IP
      for (let i = 0; i < 10; i++) {
        const result = rateLimitingService.checkRateLimit(ip, endpoint);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(Infinity);
      }
    });
  });

  describe('DDoS Protection', () => {
    test('should detect suspicious activity', () => {
      const ip = '192.168.1.300';
      
      // Mock high request count
      rateLimitingService.config.ddosProtection.suspiciousThreshold = 5;
      
      const suspiciousEvents = [];
      rateLimitingService.on('suspicious-activity', (event) => {
        suspiciousEvents.push(event);
      });
      
      // Generate requests to trigger suspicious activity detection
      for (let i = 0; i < 10; i++) {
        rateLimitingService.trackSuspiciousActivity(ip, 'test', 'test-agent');
      }
      
      expect(suspiciousEvents.length).toBeGreaterThan(0);
      expect(suspiciousEvents[0].ip).toBe(ip);
      expect(suspiciousEvents[0].type).toBe('suspicious_activity');
    });

    test('should detect and block DDoS attacks', () => {
      const ip = '192.168.1.400';
      
      // Configure low thresholds for testing
      rateLimitingService.config.ddosProtection.attackThreshold = 3;
      rateLimitingService.config.ddosProtection.suspiciousThreshold = 2;
      
      const ddosEvents = [];
      rateLimitingService.on('ddos-attack', (event) => {
        ddosEvents.push(event);
      });
      
      // Mock requests to simulate DDoS
      const now = Date.now();
      const ipData = {
        test: {
          count: 0,
          resetTime: now + 60000,
          history: []
        }
      };
      
      // Add many recent requests to simulate attack
      for (let i = 0; i < 5; i++) {
        ipData.test.history.push(now - (i * 1000));
      }
      
      rateLimitingService.requestCounts.set(ip, ipData);
      
      // Trigger DDoS detection
      rateLimitingService.trackSuspiciousActivity(ip, 'test', 'bot-agent');
      
      expect(ddosEvents.length).toBeGreaterThan(0);
      expect(ddosEvents[0].ip).toBe(ip);
      expect(ddosEvents[0].type).toBe('ddos_attack');
      expect(rateLimitingService.isIPBlocked(ip)).toBe(true);
    });

    test('should apply progressive penalties', () => {
      const ip = '192.168.1.500';
      
      // Enable penalties
      rateLimitingService.config.penalties.enabled = true;
      rateLimitingService.config.penalties.escalationFactor = 2;
      
      // Apply multiple penalties
      for (let i = 0; i < 6; i++) {
        rateLimitingService.applyPenalty(ip, 'test');
      }
      
      // IP should be blocked due to high penalty score
      expect(rateLimitingService.isIPBlocked(ip)).toBe(true);
      
      const penalty = rateLimitingService.penaltyScores.get(ip);
      expect(penalty.score).toBeGreaterThanOrEqual(6);
    });

    test('should decay penalties over time', async () => {
      const ip = '192.168.1.600';
      
      rateLimitingService.config.penalties.enabled = true;
      rateLimitingService.config.penalties.decayRate = 10; // Fast decay for testing
      
      // Apply penalty
      rateLimitingService.applyPenalty(ip, 'test');
      const initialScore = rateLimitingService.penaltyScores.get(ip).score;
      
      // Wait and apply another penalty (should trigger decay)
      await new Promise(resolve => setTimeout(resolve, 50));
      rateLimitingService.applyPenalty(ip, 'test');
      
      const finalScore = rateLimitingService.penaltyScores.get(ip).score;
      expect(finalScore).toBeLessThan(initialScore + 1); // Should be less due to decay
    });
  });

  describe('IP Management', () => {
    test('should block and unblock IPs', () => {
      const ip = '192.168.1.700';
      const duration = 1000; // 1 second
      
      expect(rateLimitingService.isIPBlocked(ip)).toBe(false);
      
      rateLimitingService.blockIP(ip, duration, 'TEST_BLOCK');
      expect(rateLimitingService.isIPBlocked(ip)).toBe(true);
      
      const retryAfter = rateLimitingService.getBlockRetryAfter(ip);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(Math.ceil(duration / 1000));
      
      const wasBlocked = rateLimitingService.unblockIP(ip);
      expect(wasBlocked).toBe(true);
      expect(rateLimitingService.isIPBlocked(ip)).toBe(false);
    });

    test('should handle expired blocks', async () => {
      const ip = '192.168.1.800';
      const duration = 100; // Very short duration
      
      rateLimitingService.blockIP(ip, duration, 'TEST_BLOCK');
      expect(rateLimitingService.isIPBlocked(ip)).toBe(true);
      
      // Wait for block to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(rateLimitingService.isIPBlocked(ip)).toBe(false);
    });

    test('should manage whitelist correctly', () => {
      const ip = '192.168.1.900';
      
      expect(rateLimitingService.whitelist.has(ip)).toBe(false);
      
      rateLimitingService.addToWhitelist(ip);
      expect(rateLimitingService.whitelist.has(ip)).toBe(true);
      
      rateLimitingService.removeFromWhitelist(ip);
      expect(rateLimitingService.whitelist.has(ip)).toBe(false);
    });

    test('should handle multiple blocks for same IP', () => {
      const ip = '192.168.1.1000';
      
      rateLimitingService.blockIP(ip, 1000, 'FIRST_BLOCK');
      rateLimitingService.blockIP(ip, 2000, 'SECOND_BLOCK');
      
      const blockInfo = rateLimitingService.blockedIPs.get(ip);
      expect(blockInfo.attempts).toBe(2);
      expect(blockInfo.blockedUntil).toBeGreaterThan(Date.now() + 1000);
    });
  });

  describe('HTTP and WebSocket Middleware', () => {
    test('should create HTTP middleware', () => {
      const middleware = rateLimitingService.createHTTPMiddleware('test-endpoint');
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(3); // req, res, next
    });

    test('should create WebSocket middleware', () => {
      const middleware = rateLimitingService.createWebSocketMiddleware();
      expect(typeof middleware).toBe('function');
      expect(middleware.length).toBe(2); // socket, next
    });

    test('should extract client IP from request', () => {
      const mockReq = {
        ip: '192.168.1.123',
        connection: { remoteAddress: '192.168.1.124' },
        socket: { remoteAddress: '192.168.1.125' }
      };
      
      const ip = rateLimitingService.getClientIP(mockReq);
      expect(ip).toBe('192.168.1.123'); // Should prefer req.ip
    });

    test('should extract client IP from socket', () => {
      const mockSocket = {
        handshake: { address: '192.168.1.126' },
        conn: { remoteAddress: '192.168.1.127' }
      };
      
      const ip = rateLimitingService.getSocketIP(mockSocket);
      expect(ip).toBe('192.168.1.126'); // Should prefer handshake.address
    });

    test('should handle missing IP gracefully', () => {
      const mockReq = {};
      const ip = rateLimitingService.getClientIP(mockReq);
      expect(ip).toBe('127.0.0.1'); // Should default to localhost
    });
  });

  describe('Configuration and Statistics', () => {
    test('should get and update configuration', () => {
      const originalConfig = rateLimitingService.getConfiguration();
      expect(originalConfig).toBeDefined();
      expect(originalConfig.global).toBeDefined();
      
      const newConfig = {
        global: {
          ...originalConfig.global,
          maxRequests: 500
        }
      };
      
      rateLimitingService.updateConfiguration(newConfig);
      const updatedConfig = rateLimitingService.getConfiguration();
      expect(updatedConfig.global.maxRequests).toBe(500);
    });

    test('should track statistics correctly', () => {
      const stats = rateLimitingService.getStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalRequests).toBe('number');
      expect(typeof stats.blockedRequests).toBe('number');
      expect(typeof stats.ddosAttacks).toBe('number');
      expect(typeof stats.blockedIPs).toBe('number');
      expect(typeof stats.suspiciousIPs).toBe('number');
    });

    test('should export complete data', () => {
      const ip = '192.168.1.1100';
      
      // Generate some data
      rateLimitingService.checkRateLimit(ip, 'test');
      rateLimitingService.addToWhitelist('192.168.1.1101');
      rateLimitingService.blockIP('192.168.1.1102', 5000, 'TEST');
      
      const exportData = rateLimitingService.exportData();
      
      expect(exportData).toBeDefined();
      expect(exportData.config).toBeDefined();
      expect(exportData.statistics).toBeDefined();
      expect(exportData.blockedIPs).toBeDefined();
      expect(exportData.whitelist).toBeDefined();
      expect(exportData.timestamp).toBeDefined();
      
      expect(Array.isArray(exportData.blockedIPs)).toBe(true);
      expect(Array.isArray(exportData.whitelist)).toBe(true);
      expect(exportData.whitelist.length).toBeGreaterThan(0); // Should include default whitelist
    });
  });

  describe('Cleanup and Maintenance', () => {
    test('should clean up expired blocks', async () => {
      const ip = '192.168.1.1200';
      
      // Block IP with very short duration
      rateLimitingService.blockIP(ip, 50, 'TEST');
      expect(rateLimitingService.isIPBlocked(ip)).toBe(true);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Trigger cleanup
      rateLimitingService.cleanupExpiredBlocks();
      
      expect(rateLimitingService.blockedIPs.has(ip)).toBe(false);
    });

    test('should clean up old request data', () => {
      const ip = '192.168.1.1300';
      
      // Add old request data
      const oldTime = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      rateLimitingService.requestCounts.set(ip, {
        test: {
          count: 1,
          resetTime: oldTime,
          history: [oldTime]
        }
      });
      
      rateLimitingService.cleanupOldRequestData();
      
      // Should be cleaned up
      expect(rateLimitingService.requestCounts.has(ip)).toBe(false);
    });

    test('should clean up suspicious IP data', () => {
      const ip = '192.168.1.1400';
      
      // Add old suspicious data
      const oldTime = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      rateLimitingService.suspiciousIPs.set(ip, {
        firstSeen: oldTime,
        requestCount: 10,
        patterns: { endpoints: new Set(), userAgents: new Set(), rapidRequests: 5 }
      });
      
      rateLimitingService.cleanupSuspiciousIPs();
      
      // Should be cleaned up
      expect(rateLimitingService.suspiciousIPs.has(ip)).toBe(false);
    });

    test('should reset daily statistics', () => {
      // Generate some statistics
      rateLimitingService.stats.totalRequests = 100;
      rateLimitingService.stats.blockedRequests = 10;
      rateLimitingService.stats.ddosAttacks = 2;
      
      rateLimitingService.resetDailyStats();
      
      expect(rateLimitingService.stats.totalRequests).toBe(0);
      expect(rateLimitingService.stats.blockedRequests).toBe(0);
      expect(rateLimitingService.stats.ddosAttacks).toBe(0);
      expect(rateLimitingService.stats.lastReset).toBeCloseTo(Date.now(), -2);
    });
  });

  describe('Integration with SecurityManager', () => {
    test('should integrate with security manager for IP blocking', () => {
      const ip = '192.168.1.1500';
      
      // Mock security manager method
      const originalBlockIP = securityManager.blockIP;
      securityManager.blockIP = jest.fn();
      
      rateLimitingService.blockIP(ip, 5000, 'INTEGRATION_TEST');
      
      expect(securityManager.blockIP).toHaveBeenCalledWith(ip, 5000);
      
      // Restore original method
      securityManager.blockIP = originalBlockIP;
    });

    test('should log security events through security manager', () => {
      const ip = '192.168.1.1600';
      
      // Mock security manager method
      const originalLogEvent = securityManager.logSecurityEvent;
      securityManager.logSecurityEvent = jest.fn();
      
      rateLimitingService.trackSuspiciousActivity(ip, 'test', 'test-agent');
      
      expect(securityManager.logSecurityEvent).toHaveBeenCalled();
      
      // Restore original method
      securityManager.logSecurityEvent = originalLogEvent;
    });

    test('should load configuration from security manager', () => {
      const originalConfig = rateLimitingService.config;
      
      // Mock security manager configuration
      securityManager.getSecurityStatus = jest.fn().mockReturnValue({
        config: {
          rateLimiting: {
            windowMs: 30 * 60 * 1000,
            maxRequests: 200
          }
        }
      });
      
      rateLimitingService.loadConfiguration();
      
      expect(rateLimitingService.config.global.windowMs).toBe(30 * 60 * 1000);
      expect(rateLimitingService.config.global.maxRequests).toBe(200);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing security manager gracefully', () => {
      const rateLimitingServiceNoSec = new RateLimitingService(null, console);
      expect(rateLimitingServiceNoSec).toBeDefined();
      
      // Should not throw when calling methods that use security manager
      expect(() => {
        rateLimitingServiceNoSec.blockIP('192.168.1.1700', 1000, 'TEST');
      }).not.toThrow();
    });

    test('should handle invalid IP addresses', () => {
      const invalidIPs = ['', null, undefined, 'not-an-ip'];
      
      invalidIPs.forEach(ip => {
        expect(() => {
          rateLimitingService.checkRateLimit(ip, 'test');
        }).not.toThrow();
      });
    });

    test('should handle concurrent requests from same IP', () => {
      const ip = '192.168.1.1800';
      
      // Configure restrictive limits
      rateLimitingService.config.endpoints.test = {
        windowMs: 60 * 1000,
        maxRequests: 3,
        burstLimit: 2,
        burstWindowMs: 10 * 1000
      };
      
      // Simulate concurrent requests
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(rateLimitingService.checkRateLimit(ip, 'test'));
      }
      
      // Some should be allowed, some blocked
      const allowed = results.filter(r => r.allowed).length;
      const blocked = results.filter(r => !r.allowed).length;
      
      expect(allowed).toBeGreaterThan(0);
      expect(blocked).toBeGreaterThan(0);
      expect(allowed + blocked).toBe(5);
    });
  });
});