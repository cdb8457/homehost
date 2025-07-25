const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

/**
 * SecurityAuditor Service - Comprehensive security audit and vulnerability scanning
 * 
 * Performs automated security audits, vulnerability scans, compliance checks,
 * and generates detailed security reports for production readiness assessment.
 */
class SecurityAuditor extends EventEmitter {
  constructor(store, logger, securityManager) {
    super();
    this.store = store;
    this.logger = logger;
    this.securityManager = securityManager;
    
    // Audit configuration
    this.auditRules = {
      filePermissions: {
        critical: ['600', '644', '755'],
        warning: ['666', '777'],
        severity: 'high'
      },
      dependencies: {
        checkVulnerabilities: true,
        allowedLicenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC'],
        severity: 'medium'
      },
      configuration: {
        checkDefaults: true,
        requireSSL: true,
        enforceAuthentication: true,
        severity: 'high'
      },
      codeQuality: {
        checkSecrets: true,
        scanHardcodedCredentials: true,
        validateInputSanitization: true,
        severity: 'critical'
      }
    };
    
    // Vulnerability database
    this.vulnerabilityPatterns = new Map();
    this.complianceStandards = new Map();
    this.auditHistory = [];
    
    this.initializeAuditor();
  }

  /**
   * Initialize security auditor
   */
  async initializeAuditor() {
    try {
      console.log('🔍 Initializing Security Auditor...');
      
      // Load vulnerability patterns
      await this.loadVulnerabilityPatterns();
      
      // Load compliance standards
      await this.loadComplianceStandards();
      
      // Schedule periodic audits
      this.schedulePeriodicAudits();
      
      console.log('✅ Security Auditor initialized successfully');
      this.emit('auditor-initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Security Auditor:', error);
      throw error;
    }
  }

  /**
   * Load vulnerability patterns
   */
  async loadVulnerabilityPatterns() {
    // Common vulnerability patterns
    this.vulnerabilityPatterns.set('hardcoded_secrets', [
      {
        pattern: /(password|passwd|pwd)\s*[=:]\s*['""][^'""]{8,}['""]?/gi,
        description: 'Hardcoded password detected',
        severity: 'critical'
      },
      {
        pattern: /(api[_-]?key|apikey)\s*[=:]\s*['""][^'""]{20,}['""]?/gi,
        description: 'Hardcoded API key detected',
        severity: 'critical'
      },
      {
        pattern: /(secret|token)\s*[=:]\s*['""][^'""]{20,}['""]?/gi,
        description: 'Hardcoded secret/token detected',
        severity: 'high'
      },
      {
        pattern: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/gi,
        description: 'Private key in source code',
        severity: 'critical'
      }
    ]);

    this.vulnerabilityPatterns.set('insecure_functions', [
      {
        pattern: /eval\s*\(/gi,
        description: 'Use of eval() function - potential code injection',
        severity: 'high'
      },
      {
        pattern: /exec\s*\(/gi,
        description: 'Use of exec() function - potential command injection',
        severity: 'high'
      },
      {
        pattern: /\.innerHTML\s*=/gi,
        description: 'Direct innerHTML assignment - potential XSS',
        severity: 'medium'
      },
      {
        pattern: /document\.write\s*\(/gi,
        description: 'Use of document.write() - potential XSS',
        severity: 'medium'
      }
    ]);

    this.vulnerabilityPatterns.set('weak_crypto', [
      {
        pattern: /md5|sha1/gi,
        description: 'Weak cryptographic algorithm',
        severity: 'medium'
      },
      {
        pattern: /Math\.random\(\)/gi,
        description: 'Cryptographically weak random number generation',
        severity: 'low'
      },
      {
        pattern: /createCipher\(/gi,
        description: 'Deprecated cipher method - use createCipherGCM',
        severity: 'medium'
      }
    ]);

    console.log('🔍 Vulnerability patterns loaded');
  }

  /**
   * Load compliance standards
   */
  async loadComplianceStandards() {
    // OWASP Top 10 compliance checks
    this.complianceStandards.set('owasp_top10', {
      name: 'OWASP Top 10 2021',
      checks: [
        {
          id: 'A01_broken_access_control',
          name: 'Broken Access Control',
          description: 'Verify proper access controls are implemented',
          severity: 'critical'
        },
        {
          id: 'A02_cryptographic_failures',
          name: 'Cryptographic Failures',
          description: 'Check for weak cryptographic implementations',
          severity: 'high'
        },
        {
          id: 'A03_injection',
          name: 'Injection',
          description: 'Scan for injection vulnerabilities',
          severity: 'critical'
        },
        {
          id: 'A04_insecure_design',
          name: 'Insecure Design',
          description: 'Review architectural security patterns',
          severity: 'high'
        },
        {
          id: 'A05_security_misconfiguration',
          name: 'Security Misconfiguration',
          description: 'Check for insecure configurations',
          severity: 'high'
        }
      ]
    });

    // CIS Controls compliance
    this.complianceStandards.set('cis_controls', {
      name: 'CIS Controls v8',
      checks: [
        {
          id: 'cis_01_asset_inventory',
          name: 'Asset Inventory and Control',
          description: 'Maintain inventory of authorized software',
          severity: 'medium'
        },
        {
          id: 'cis_03_data_protection',
          name: 'Data Protection',
          description: 'Protect data at rest and in transit',
          severity: 'high'
        },
        {
          id: 'cis_06_access_control',
          name: 'Access Control Management',
          description: 'Implement proper access controls',
          severity: 'critical'
        }
      ]
    });

    console.log('📋 Compliance standards loaded');
  }

  /**
   * Perform comprehensive security audit
   */
  async performSecurityAudit(options = {}) {
    const auditId = crypto.randomUUID();
    const startTime = Date.now();
    
    console.log(`🔍 Starting security audit ${auditId}...`);
    
    try {
      const auditResults = {
        id: auditId,
        timestamp: new Date(),
        options: options,
        results: {
          codeScanning: await this.performCodeScanning(),
          dependencyAudit: await this.performDependencyAudit(),
          configurationAudit: await this.performConfigurationAudit(),
          filePermissionAudit: await this.performFilePermissionAudit(),
          complianceCheck: await this.performComplianceCheck(),
          networkSecurityAudit: await this.performNetworkSecurityAudit()
        },
        summary: {},
        recommendations: [],
        duration: 0
      };

      // Generate audit summary
      auditResults.summary = this.generateAuditSummary(auditResults.results);
      auditResults.recommendations = this.generateRecommendations(auditResults.results);
      auditResults.duration = Date.now() - startTime;

      // Store audit results
      this.auditHistory.push(auditResults);
      
      // Keep only last 10 audits
      if (this.auditHistory.length > 10) {
        this.auditHistory = this.auditHistory.slice(-10);
      }

      console.log(`✅ Security audit ${auditId} completed in ${auditResults.duration}ms`);
      this.emit('audit-completed', auditResults);
      
      return auditResults;
    } catch (error) {
      console.error(`❌ Security audit ${auditId} failed:`, error);
      throw error;
    }
  }

  /**
   * Perform code scanning for vulnerabilities
   */
  async performCodeScanning() {
    const results = {
      filesScanned: 0,
      vulnerabilities: [],
      startTime: Date.now()
    };

    try {
      const sourceDir = path.join(__dirname, '../..');
      const files = await this.getSourceFiles(sourceDir);
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf8');
          const fileVulns = await this.scanFileForVulnerabilities(file, content);
          results.vulnerabilities.push(...fileVulns);
          results.filesScanned++;
        } catch (error) {
          console.warn(`Failed to scan file ${file}:`, error.message);
        }
      }

      results.duration = Date.now() - results.startTime;
      console.log(`🔍 Code scanning completed: ${results.filesScanned} files, ${results.vulnerabilities.length} issues found`);
      
      return results;
    } catch (error) {
      console.error('Code scanning failed:', error);
      return { ...results, error: error.message };
    }
  }

  /**
   * Get source files for scanning
   */
  async getSourceFiles(dir, files = []) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and test directories
        if (!['node_modules', '.git', 'coverage', 'build'].includes(entry.name)) {
          await this.getSourceFiles(fullPath, files);
        }
      } else if (entry.isFile()) {
        // Include JS, TS, and other relevant files
        const ext = path.extname(entry.name).toLowerCase();
        if (['.js', '.ts', '.jsx', '.tsx', '.json', '.env'].includes(ext)) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  /**
   * Scan file for vulnerabilities
   */
  async scanFileForVulnerabilities(filePath, content) {
    const vulnerabilities = [];
    const lines = content.split('\n');
    
    for (const [category, patterns] of this.vulnerabilityPatterns.entries()) {
      for (const vuln of patterns) {
        const matches = content.matchAll(vuln.pattern);
        
        for (const match of matches) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          
          vulnerabilities.push({
            file: filePath,
            line: lineNumber,
            column: match.index - content.lastIndexOf('\n', match.index - 1) - 1,
            category: category,
            pattern: vuln.pattern.toString(),
            description: vuln.description,
            severity: vuln.severity,
            match: match[0],
            context: lines[lineNumber - 1]?.trim()
          });
        }
      }
    }
    
    return vulnerabilities;
  }

  /**
   * Perform dependency audit
   */
  async performDependencyAudit() {
    const results = {
      dependencies: 0,
      vulnerabilities: [],
      licenseIssues: [],
      outdated: [],
      startTime: Date.now()
    };

    try {
      // Read package.json
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      const allDeps = {
        ...packageJson.dependencies || {},
        ...packageJson.devDependencies || {}
      };

      results.dependencies = Object.keys(allDeps).length;

      // Check for known vulnerable packages (simplified check)
      const knownVulnerablePackages = [
        'node-serialize', 'marked', 'jquery', 'lodash', 'request'
      ];

      for (const [pkg, version] of Object.entries(allDeps)) {
        if (knownVulnerablePackages.includes(pkg)) {
          results.vulnerabilities.push({
            package: pkg,
            version: version,
            severity: 'medium',
            description: `Package ${pkg} has known vulnerabilities`
          });
        }
      }

      results.duration = Date.now() - results.startTime;
      console.log(`🔍 Dependency audit completed: ${results.dependencies} packages, ${results.vulnerabilities.length} issues found`);
      
      return results;
    } catch (error) {
      console.error('Dependency audit failed:', error);
      return { ...results, error: error.message };
    }
  }

  /**
   * Perform configuration audit
   */
  async performConfigurationAudit() {
    const results = {
      configurations: [],
      issues: [],
      startTime: Date.now()
    };

    try {
      // Check security manager configuration
      if (this.securityManager) {
        const secConfig = this.securityManager.getSecurityStatus();
        
        // Check rate limiting
        if (!secConfig.config.rateLimiting.enabled) {
          results.issues.push({
            type: 'configuration',
            severity: 'high',
            description: 'Rate limiting is disabled',
            recommendation: 'Enable rate limiting to prevent abuse'
          });
        }

        // Check encryption settings
        if (secConfig.config.encryption.algorithm !== 'aes-256-gcm') {
          results.issues.push({
            type: 'configuration',
            severity: 'medium',
            description: 'Non-standard encryption algorithm in use',
            recommendation: 'Use AES-256-GCM for optimal security'
          });
        }

        results.configurations.push({
          name: 'SecurityManager',
          status: 'configured',
          details: secConfig.config
        });
      } else {
        results.issues.push({
          type: 'configuration',
          severity: 'critical',
          description: 'Security Manager not initialized',
          recommendation: 'Initialize Security Manager for production deployment'
        });
      }

      // Check store encryption
      const storeConfig = this.store.get('security.config');
      if (!storeConfig) {
        results.issues.push({
          type: 'configuration',
          severity: 'medium',
          description: 'No security configuration found in store',
          recommendation: 'Configure security settings for production'
        });
      }

      results.duration = Date.now() - results.startTime;
      console.log(`🔍 Configuration audit completed: ${results.configurations.length} configs, ${results.issues.length} issues found`);
      
      return results;
    } catch (error) {
      console.error('Configuration audit failed:', error);
      return { ...results, error: error.message };
    }
  }

  /**
   * Perform file permission audit
   */
  async performFilePermissionAudit() {
    const results = {
      filesChecked: 0,
      issues: [],
      startTime: Date.now()
    };

    try {
      const sourceDir = path.join(__dirname, '../..');
      const files = await this.getSourceFiles(sourceDir);
      
      for (const file of files.slice(0, 50)) { // Limit to first 50 files for performance
        try {
          const stats = await fs.stat(file);
          const mode = (stats.mode & parseInt('777', 8)).toString(8);
          
          if (this.auditRules.filePermissions.warning.includes(mode)) {
            results.issues.push({
              file: file,
              permission: mode,
              severity: 'high',
              description: `Insecure file permissions: ${mode}`,
              recommendation: 'Change to more restrictive permissions (644 or 600)'
            });
          }
          
          results.filesChecked++;
        } catch (error) {
          // File might not exist or be accessible
        }
      }

      results.duration = Date.now() - results.startTime;
      console.log(`🔍 File permission audit completed: ${results.filesChecked} files, ${results.issues.length} issues found`);
      
      return results;
    } catch (error) {
      console.error('File permission audit failed:', error);
      return { ...results, error: error.message };
    }
  }

  /**
   * Perform compliance check
   */
  async performComplianceCheck() {
    const results = {
      standards: [],
      overallScore: 0,
      startTime: Date.now()
    };

    try {
      for (const [standardId, standard] of this.complianceStandards.entries()) {
        const standardResult = {
          id: standardId,
          name: standard.name,
          checks: [],
          score: 0,
          maxScore: standard.checks.length
        };

        for (const check of standard.checks) {
          const checkResult = await this.performComplianceCheckItem(check);
          standardResult.checks.push(checkResult);
          if (checkResult.passed) {
            standardResult.score++;
          }
        }

        standardResult.scorePercentage = (standardResult.score / standardResult.maxScore) * 100;
        results.standards.push(standardResult);
      }

      // Calculate overall compliance score
      const totalScore = results.standards.reduce((sum, std) => sum + std.score, 0);
      const maxScore = results.standards.reduce((sum, std) => sum + std.maxScore, 0);
      results.overallScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      results.duration = Date.now() - results.startTime;
      console.log(`🔍 Compliance check completed: ${results.overallScore.toFixed(1)}% overall score`);
      
      return results;
    } catch (error) {
      console.error('Compliance check failed:', error);
      return { ...results, error: error.message };
    }
  }

  /**
   * Perform individual compliance check
   */
  async performComplianceCheckItem(check) {
    const result = {
      id: check.id,
      name: check.name,
      description: check.description,
      severity: check.severity,
      passed: false,
      details: ''
    };

    try {
      switch (check.id) {
        case 'A01_broken_access_control':
          result.passed = this.securityManager && this.securityManager.getSecurityStatus().isInitialized;
          result.details = result.passed ? 'Security Manager initialized with access controls' : 'No access control system detected';
          break;

        case 'A02_cryptographic_failures':
          result.passed = this.securityManager && this.securityManager.config.encryption.algorithm === 'aes-256-gcm';
          result.details = result.passed ? 'Strong encryption algorithm configured' : 'Weak or no encryption detected';
          break;

        case 'A03_injection':
          result.passed = this.securityManager && this.securityManager.threatPatterns.has('sql_injection');
          result.details = result.passed ? 'Injection threat detection enabled' : 'No injection protection detected';
          break;

        case 'cis_03_data_protection':
          result.passed = this.store.get('security.masterKey') !== undefined;
          result.details = result.passed ? 'Data encryption keys configured' : 'No data protection keys found';
          break;

        default:
          result.passed = false;
          result.details = 'Check not implemented';
      }
    } catch (error) {
      result.passed = false;
      result.details = `Check failed: ${error.message}`;
    }

    return result;
  }

  /**
   * Perform network security audit
   */
  async performNetworkSecurityAudit() {
    const results = {
      ports: [],
      services: [],
      issues: [],
      startTime: Date.now()
    };

    try {
      // Check for open ports (basic check)
      const commonPorts = [22, 23, 25, 53, 80, 110, 443, 993, 995, 3456, 8080, 8443];
      
      for (const port of commonPorts.slice(0, 5)) { // Limit for performance
        try {
          const net = require('net');
          const socket = new net.Socket();
          
          const isOpen = await new Promise((resolve) => {
            socket.setTimeout(1000);
            socket.on('connect', () => {
              socket.destroy();
              resolve(true);
            });
            socket.on('timeout', () => {
              socket.destroy();
              resolve(false);
            });
            socket.on('error', () => {
              resolve(false);
            });
            socket.connect(port, 'localhost');
          });

          if (isOpen) {
            results.ports.push({
              port: port,
              status: 'open',
              service: this.getServiceForPort(port)
            });

            // Flag potentially risky open ports
            if ([22, 23, 3389].includes(port)) {
              results.issues.push({
                type: 'network',
                severity: 'medium',
                description: `Potentially risky service on port ${port}`,
                recommendation: 'Ensure proper access controls and monitoring'
              });
            }
          }
        } catch (error) {
          // Port check failed, continue
        }
      }

      results.duration = Date.now() - results.startTime;
      console.log(`🔍 Network security audit completed: ${results.ports.length} open ports, ${results.issues.length} issues found`);
      
      return results;
    } catch (error) {
      console.error('Network security audit failed:', error);
      return { ...results, error: error.message };
    }
  }

  /**
   * Get service name for port
   */
  getServiceForPort(port) {
    const services = {
      22: 'SSH',
      23: 'Telnet',
      25: 'SMTP',
      53: 'DNS',
      80: 'HTTP',
      110: 'POP3',
      443: 'HTTPS',
      993: 'IMAPS',
      995: 'POP3S',
      3456: 'HomeHost SignalR',
      8080: 'HTTP Alt',
      8443: 'HTTPS Alt'
    };
    return services[port] || 'Unknown';
  }

  /**
   * Generate audit summary
   */
  generateAuditSummary(results) {
    const summary = {
      totalIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      overallRisk: 'unknown',
      recommendations: 0
    };

    // Count issues from all audit results
    Object.values(results).forEach(result => {
      if (result.vulnerabilities) {
        result.vulnerabilities.forEach(vuln => {
          summary.totalIssues++;
          switch (vuln.severity) {
            case 'critical': summary.criticalIssues++; break;
            case 'high': summary.highIssues++; break;
            case 'medium': summary.mediumIssues++; break;
            case 'low': summary.lowIssues++; break;
          }
        });
      }
      if (result.issues) {
        result.issues.forEach(issue => {
          summary.totalIssues++;
          switch (issue.severity) {
            case 'critical': summary.criticalIssues++; break;
            case 'high': summary.highIssues++; break;
            case 'medium': summary.mediumIssues++; break;
            case 'low': summary.lowIssues++; break;
          }
        });
      }
    });

    // Determine overall risk level
    if (summary.criticalIssues > 0) {
      summary.overallRisk = 'critical';
    } else if (summary.highIssues > 3) {
      summary.overallRisk = 'high';
    } else if (summary.mediumIssues > 5) {
      summary.overallRisk = 'medium';
    } else {
      summary.overallRisk = 'low';
    }

    return summary;
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    // Code scanning recommendations
    if (results.codeScanning?.vulnerabilities?.length > 0) {
      const criticalCode = results.codeScanning.vulnerabilities.filter(v => v.severity === 'critical');
      if (criticalCode.length > 0) {
        recommendations.push({
          priority: 'critical',
          category: 'code_security',
          title: 'Fix Critical Code Vulnerabilities',
          description: `${criticalCode.length} critical vulnerabilities found in source code`,
          action: 'Review and fix hardcoded secrets, insecure functions, and other critical issues'
        });
      }
    }

    // Configuration recommendations
    if (results.configurationAudit?.issues?.length > 0) {
      const configIssues = results.configurationAudit.issues.filter(i => i.severity === 'high');
      if (configIssues.length > 0) {
        recommendations.push({
          priority: 'high',
          category: 'configuration',
          title: 'Fix Security Configuration Issues',
          description: `${configIssues.length} high-priority configuration issues found`,
          action: 'Enable security features like rate limiting and proper encryption'
        });
      }
    }

    // Compliance recommendations
    if (results.complianceCheck?.overallScore < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'compliance',
        title: 'Improve Security Compliance',
        description: `Compliance score: ${results.complianceCheck.overallScore.toFixed(1)}%`,
        action: 'Address compliance gaps to meet security standards'
      });
    }

    // Add general recommendations if no issues found
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        category: 'maintenance',
        title: 'Continue Security Best Practices',
        description: 'No major security issues detected',
        action: 'Maintain regular security audits and keep dependencies updated'
      });
    }

    return recommendations;
  }

  /**
   * Schedule periodic audits
   */
  schedulePeriodicAudits() {
    // Run audit every 24 hours
    setInterval(async () => {
      try {
        console.log('🕐 Running scheduled security audit...');
        await this.performSecurityAudit({ scheduled: true });
      } catch (error) {
        console.error('Scheduled audit failed:', error);
      }
    }, 24 * 60 * 60 * 1000);

    console.log('📅 Periodic security audits scheduled');
  }

  /**
   * Get audit history
   */
  getAuditHistory() {
    return this.auditHistory;
  }

  /**
   * Get latest audit results
   */
  getLatestAudit() {
    return this.auditHistory[this.auditHistory.length - 1] || null;
  }

  /**
   * Export audit results
   */
  exportAuditResults(auditId) {
    const audit = this.auditHistory.find(a => a.id === auditId);
    if (!audit) {
      throw new Error(`Audit ${auditId} not found`);
    }
    
    return {
      export: audit,
      exportTime: new Date(),
      format: 'json'
    };
  }
}

module.exports = SecurityAuditor;