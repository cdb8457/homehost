const Store = require('electron-store');
const path = require('path');
const fs = require('fs').promises;

// Import services for testing
const SecurityManager = require('../../src/main/services/SecurityManager');
const SecurityAuditor = require('../../src/main/services/SecurityAuditor');

describe('Security Integration Tests', () => {
  let store;
  let tempDir;
  let securityManager;
  let securityAuditor;

  beforeAll(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../../temp-security-tests');
    await fs.mkdir(tempDir, { recursive: true });

    // Initialize test store
    store = new Store({ 
      name: 'security-test-store',
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
    securityAuditor = new SecurityAuditor(store, console, securityManager);
  });

  describe('SecurityManager Functionality', () => {
    test('should initialize security manager successfully', async () => {
      expect(securityManager).toBeDefined();
      expect(securityManager.getSecurityStatus().isInitialized).toBe(true);
    });

    test('should validate input and detect threats', async () => {
      const maliciousInput = "<script>alert('xss')</script>";
      
      expect(() => {
        securityManager.validateInput(maliciousInput);
      }).toThrow('Security threat detected: xss');
    });

    test('should detect SQL injection attempts', async () => {
      const sqlInjection = "'; DROP TABLE users; --";
      
      expect(() => {
        securityManager.validateInput(sqlInjection);
      }).toThrow('Security threat detected: sql_injection');
    });

    test('should detect path traversal attempts', async () => {
      const pathTraversal = "../../etc/passwd";
      
      expect(() => {
        securityManager.validateInput(pathTraversal);
      }).toThrow('Security threat detected: path_traversal');
    });

    test('should encrypt and decrypt data successfully', async () => {
      const testData = { username: 'testuser', email: 'test@example.com' };
      
      const encrypted = securityManager.encrypt(testData);
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      
      const decrypted = securityManager.decrypt(encrypted);
      expect(decrypted).toEqual(testData);
    });

    test('should hash and verify passwords', async () => {
      const password = 'securePassword123!';
      
      const hash = await securityManager.hashPassword(password);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      
      const isValid = await securityManager.verifyPassword(password, hash);
      expect(isValid).toBe(true);
      
      const isInvalid = await securityManager.verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });

    test('should generate secure tokens', async () => {
      const token1 = securityManager.generateSecureToken();
      const token2 = securityManager.generateSecureToken();
      
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64); // 32 bytes in hex
    });

    test('should create and verify HMAC signatures', async () => {
      const data = { action: 'login', userId: '12345' };
      
      const signature = securityManager.createHMACSignature(data);
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      
      const isValid = securityManager.verifyHMACSignature(data, signature);
      expect(isValid).toBe(true);
      
      const isInvalid = securityManager.verifyHMACSignature({ ...data, userId: '54321' }, signature);
      expect(isInvalid).toBe(false);
    });

    test('should validate file uploads', async () => {
      const validFile = {
        name: 'server.exe',
        size: 1024 * 1024, // 1MB
        type: 'application/octet-stream'
      };
      
      expect(() => {
        securityManager.validateFileUpload(validFile);
      }).not.toThrow();
      
      const invalidExtension = {
        name: 'malware.bat',
        size: 1024,
        type: 'application/octet-stream'
      };
      
      expect(() => {
        securityManager.validateFileUpload(invalidExtension);
      }).toThrow('File type not allowed: .bat');
      
      const tooLarge = {
        name: 'huge.exe',
        size: 1024 * 1024 * 1024, // 1GB
        type: 'application/octet-stream'
      };
      
      expect(() => {
        securityManager.validateFileUpload(tooLarge);
      }).toThrow('File too large');
    });

    test('should manage IP blocking', async () => {
      const testIP = '192.168.1.100';
      
      expect(securityManager.isIPBlocked(testIP)).toBe(false);
      
      securityManager.blockIP(testIP, 5000); // 5 seconds
      expect(securityManager.isIPBlocked(testIP)).toBe(true);
      
      // Wait for block to expire
      await new Promise(resolve => setTimeout(resolve, 5100));
      expect(securityManager.isIPBlocked(testIP)).toBe(false);
    });

    test('should log security events', async () => {
      const testEvent = {
        type: 'test_event',
        severity: 'medium',
        details: { test: true }
      };
      
      securityManager.logSecurityEvent(testEvent);
      
      expect(securityManager.securityEvents.length).toBeGreaterThan(0);
      const lastEvent = securityManager.securityEvents[securityManager.securityEvents.length - 1];
      expect(lastEvent.type).toBe('test_event');
      expect(lastEvent.severity).toBe('medium');
    });

    test('should handle rate limiting violations', async () => {
      const testIP = '192.168.1.200';
      
      // Simulate rate limit exceeded
      securityManager.handleRateLimitExceeded(testIP, { max: 100, windowMs: 60000 });
      
      const events = securityManager.securityEvents.filter(e => e.type === 'rate_limit_exceeded');
      expect(events.length).toBeGreaterThan(0);
    });
  });

  describe('SecurityAuditor Functionality', () => {
    test('should initialize security auditor successfully', async () => {
      expect(securityAuditor).toBeDefined();
      expect(securityAuditor.vulnerabilityPatterns.size).toBeGreaterThan(0);
      expect(securityAuditor.complianceStandards.size).toBeGreaterThan(0);
    });

    test('should perform comprehensive security audit', async () => {
      const auditResult = await securityAuditor.performSecurityAudit();
      
      expect(auditResult).toBeDefined();
      expect(auditResult.id).toBeDefined();
      expect(auditResult.timestamp).toBeDefined();
      expect(auditResult.results).toBeDefined();
      expect(auditResult.summary).toBeDefined();
      expect(auditResult.recommendations).toBeDefined();
      
      // Check audit categories
      expect(auditResult.results.codeScanning).toBeDefined();
      expect(auditResult.results.dependencyAudit).toBeDefined();
      expect(auditResult.results.configurationAudit).toBeDefined();
      expect(auditResult.results.filePermissionAudit).toBeDefined();
      expect(auditResult.results.complianceCheck).toBeDefined();
      expect(auditResult.results.networkSecurityAudit).toBeDefined();
    });

    test('should detect vulnerabilities in code scanning', async () => {
      const codeResults = await securityAuditor.performCodeScanning();
      
      expect(codeResults).toBeDefined();
      expect(codeResults.filesScanned).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(codeResults.vulnerabilities)).toBe(true);
    });

    test('should perform dependency audit', async () => {
      const depResults = await securityAuditor.performDependencyAudit();
      
      expect(depResults).toBeDefined();
      expect(depResults.dependencies).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(depResults.vulnerabilities)).toBe(true);
      expect(Array.isArray(depResults.licenseIssues)).toBe(true);
    });

    test('should perform configuration audit', async () => {
      const configResults = await securityAuditor.performConfigurationAudit();
      
      expect(configResults).toBeDefined();
      expect(Array.isArray(configResults.configurations)).toBe(true);
      expect(Array.isArray(configResults.issues)).toBe(true);
    });

    test('should perform compliance check', async () => {
      const complianceResults = await securityAuditor.performComplianceCheck();
      
      expect(complianceResults).toBeDefined();
      expect(Array.isArray(complianceResults.standards)).toBe(true);
      expect(typeof complianceResults.overallScore).toBe('number');
      expect(complianceResults.overallScore).toBeGreaterThanOrEqual(0);
      expect(complianceResults.overallScore).toBeLessThanOrEqual(100);
    });

    test('should generate audit summary correctly', async () => {
      const mockResults = {
        codeScanning: {
          vulnerabilities: [
            { severity: 'critical' },
            { severity: 'high' },
            { severity: 'medium' }
          ]
        },
        configurationAudit: {
          issues: [
            { severity: 'high' },
            { severity: 'low' }
          ]
        }
      };
      
      const summary = securityAuditor.generateAuditSummary(mockResults);
      
      expect(summary.totalIssues).toBe(5);
      expect(summary.criticalIssues).toBe(1);
      expect(summary.highIssues).toBe(2);
      expect(summary.mediumIssues).toBe(1);
      expect(summary.lowIssues).toBe(1);
      expect(summary.overallRisk).toBe('critical'); // Has critical issues
    });

    test('should generate security recommendations', async () => {
      const mockResults = {
        codeScanning: {
          vulnerabilities: [
            { severity: 'critical' },
            { severity: 'critical' }
          ]
        },
        configurationAudit: {
          issues: [
            { severity: 'high' }
          ]
        },
        complianceCheck: {
          overallScore: 60 // Below 80%
        }
      };
      
      const recommendations = securityAuditor.generateRecommendations(mockResults);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      // Should have recommendations for critical code issues and compliance
      const categories = recommendations.map(r => r.category);
      expect(categories).toContain('code_security');
      expect(categories).toContain('compliance');
    });

    test('should export audit results', async () => {
      const auditResult = await securityAuditor.performSecurityAudit();
      const exportData = securityAuditor.exportAuditResults(auditResult.id);
      
      expect(exportData).toBeDefined();
      expect(exportData.export).toEqual(auditResult);
      expect(exportData.exportTime).toBeDefined();
      expect(exportData.format).toBe('json');
    });

    test('should maintain audit history', async () => {
      const audit1 = await securityAuditor.performSecurityAudit();
      const audit2 = await securityAuditor.performSecurityAudit();
      
      const history = securityAuditor.getAuditHistory();
      expect(history.length).toBe(2);
      expect(history[0].id).toBe(audit1.id);
      expect(history[1].id).toBe(audit2.id);
      
      const latest = securityAuditor.getLatestAudit();
      expect(latest.id).toBe(audit2.id);
    });

    test('should handle network security audit', async () => {
      const networkResults = await securityAuditor.performNetworkSecurityAudit();
      
      expect(networkResults).toBeDefined();
      expect(Array.isArray(networkResults.ports)).toBe(true);
      expect(Array.isArray(networkResults.services)).toBe(true);
      expect(Array.isArray(networkResults.issues)).toBe(true);
    });
  });

  describe('Security Integration', () => {
    test('should integrate security manager with auditor', async () => {
      // Test that security auditor can access security manager status
      const securityStatus = securityManager.getSecurityStatus();
      expect(securityStatus.isInitialized).toBe(true);
      
      // Perform audit that checks security manager configuration
      const auditResult = await securityAuditor.performSecurityAudit();
      const configAudit = auditResult.results.configurationAudit;
      
      expect(configAudit).toBeDefined();
      expect(configAudit.configurations.length).toBeGreaterThan(0);
      
      // Should find SecurityManager configuration
      const securityManagerConfig = configAudit.configurations.find(
        config => config.name === 'SecurityManager'
      );
      expect(securityManagerConfig).toBeDefined();
    });

    test('should handle critical security events', async () => {
      const criticalEvent = {
        type: 'threat_detected',
        threatType: 'sql_injection',
        severity: 'critical',
        ip: '192.168.1.250'
      };
      
      securityManager.logSecurityEvent(criticalEvent);
      
      // Should trigger critical event handling
      expect(securityManager.isIPBlocked('192.168.1.250')).toBe(true);
    });

    test('should validate security configuration', async () => {
      const config = securityManager.getSecurityStatus().config;
      
      // Validate essential security settings
      expect(config.rateLimiting.enabled).toBe(true);
      expect(config.encryption.algorithm).toBe('aes-256-gcm');
      expect(config.encryption.keyLength).toBe(32);
      expect(config.validation.allowedFileTypes).toContain('.exe');
      expect(config.validation.maxFileSize).toBeGreaterThan(0);
    });

    test('should perform compliance checks against security manager', async () => {
      const complianceResults = await securityAuditor.performComplianceCheck();
      
      expect(complianceResults.standards.length).toBeGreaterThan(0);
      
      // Check OWASP compliance
      const owaspStandard = complianceResults.standards.find(
        std => std.id === 'owasp_top10'
      );
      expect(owaspStandard).toBeDefined();
      expect(owaspStandard.checks.length).toBeGreaterThan(0);
    });

    test('should export complete security data', async () => {
      // Generate some security events
      securityManager.logSecurityEvent({
        type: 'test_event_1',
        severity: 'medium'
      });
      
      securityManager.logSecurityEvent({
        type: 'test_event_2',
        severity: 'low'
      });
      
      // Export security data
      const exportData = securityManager.exportSecurityData();
      
      expect(exportData).toBeDefined();
      expect(exportData.config).toBeDefined();
      expect(exportData.events.length).toBeGreaterThanOrEqual(2);
      expect(exportData.blockedIPs).toBeDefined();
      expect(exportData.failedAttempts).toBeDefined();
      expect(exportData.timestamp).toBeDefined();
    });

    test('should handle audit scheduling', (done) => {
      // Test that periodic audits can be scheduled
      // Note: In a real test, you'd mock the setInterval
      expect(securityAuditor.schedulePeriodicAudits).toBeDefined();
      done();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid encryption data', async () => {
      const invalidData = {
        encrypted: 'invalid',
        iv: 'invalid',
        tag: 'invalid'
      };
      
      expect(() => {
        securityManager.decrypt(invalidData);
      }).toThrow('Failed to decrypt data');
    });

    test('should handle audit failures gracefully', async () => {
      // Mock a failing audit scenario
      const originalMethod = securityAuditor.performCodeScanning;
      securityAuditor.performCodeScanning = jest.fn().mockRejectedValue(new Error('Scan failed'));
      
      const auditResult = await securityAuditor.performSecurityAudit();
      
      // Should still complete with error handling
      expect(auditResult).toBeDefined();
      expect(auditResult.results.codeScanning.error).toBeDefined();
      
      // Restore original method
      securityAuditor.performCodeScanning = originalMethod;
    });

    test('should handle missing files during audit', async () => {
      // Test audit on non-existent directory
      const originalGetSourceFiles = securityAuditor.getSourceFiles;
      securityAuditor.getSourceFiles = jest.fn().mockResolvedValue([]);
      
      const codeResults = await securityAuditor.performCodeScanning();
      
      expect(codeResults.filesScanned).toBe(0);
      expect(codeResults.vulnerabilities.length).toBe(0);
      
      // Restore original method
      securityAuditor.getSourceFiles = originalGetSourceFiles;
    });

    test('should handle invalid input validation', async () => {
      expect(() => {
        securityManager.validateInput(null);
      }).toThrow('Input must be a string');
      
      expect(() => {
        securityManager.validateInput(123);
      }).toThrow('Input must be a string');
      
      const tooLongInput = 'a'.repeat(20000);
      expect(() => {
        securityManager.validateInput(tooLongInput);
      }).toThrow('Input too long');
    });
  });
});