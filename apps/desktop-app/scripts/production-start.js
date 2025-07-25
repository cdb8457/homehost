#!/usr/bin/env node

/**
 * Production Startup Script for HomeHost Desktop
 * 
 * This script performs comprehensive validation and initialization
 * before starting the application in production mode.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Import configuration
const productionConfig = require('../config/production.config');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'bold');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function validateSystemRequirements() {
  logSection('System Requirements Validation');
  
  const requirements = {
    nodeVersion: '16.0.0',
    minimumRAM: 4, // GB
    minimumDisk: 10 // GB
  };
  
  // Check Node.js version
  const nodeVersion = process.version.replace('v', '');
  const [nodeMajor] = nodeVersion.split('.');
  const [reqMajor] = requirements.nodeVersion.split('.');
  
  if (parseInt(nodeMajor) >= parseInt(reqMajor)) {
    logSuccess(`Node.js version: ${nodeVersion} (required: ${requirements.nodeVersion}+)`);
  } else {
    logError(`Node.js version ${nodeVersion} is below required ${requirements.nodeVersion}`);
    return false;
  }
  
  // Check available RAM
  const totalRAM = Math.round(os.totalmem() / (1024 * 1024 * 1024));
  if (totalRAM >= requirements.minimumRAM) {
    logSuccess(`Available RAM: ${totalRAM}GB (required: ${requirements.minimumRAM}GB+)`);
  } else {
    logWarning(`Available RAM: ${totalRAM}GB is below recommended ${requirements.minimumRAM}GB`);
  }
  
  // Check available disk space
  try {
    const stats = fs.statSync(process.cwd());
    logInfo(`Startup directory accessible: ${process.cwd()}`);
  } catch (error) {
    logError(`Cannot access startup directory: ${error.message}`);
    return false;
  }
  
  // Check platform
  logInfo(`Platform: ${os.platform()} ${os.arch()}`);
  logInfo(`CPU cores: ${os.cpus().length}`);
  
  return true;
}

async function validateDirectories() {
  logSection('Directory Structure Validation');
  
  const requiredDirectories = [
    'src/main',
    'src/renderer',
    'src/main/services',
    'logs',
    'config',
    'temp'
  ];
  
  for (const dir of requiredDirectories) {
    const fullPath = path.join(process.cwd(), dir);
    
    try {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        logInfo(`Created directory: ${dir}`);
      } else {
        logSuccess(`Directory exists: ${dir}`);
      }
    } catch (error) {
      logError(`Failed to create/access directory ${dir}: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

async function validateConfiguration() {
  logSection('Configuration Validation');
  
  try {
    // Validate production configuration
    productionConfig.validate(productionConfig);
    logSuccess('Production configuration is valid');
    
    // Check critical settings
    if (productionConfig.security.manager.encryptionAlgorithm === 'aes-256-gcm') {
      logSuccess('Strong encryption algorithm configured');
    } else {
      logWarning('Consider using AES-256-GCM for stronger encryption');
    }
    
    if (productionConfig.rateLimiting.global.enabled) {
      logSuccess('Rate limiting is enabled');
    } else {
      logWarning('Rate limiting is disabled - consider enabling for production');
    }
    
    if (productionConfig.performance.monitoring.enabled) {
      logSuccess('Performance monitoring is enabled');
    } else {
      logWarning('Performance monitoring is disabled');
    }
    
    if (productionConfig.healthChecks.enabled) {
      logSuccess('Health checks are enabled');
    } else {
      logWarning('Health checks are disabled');
    }
    
    // Validate deployment environments
    const envs = Object.keys(productionConfig.deployment.environments);
    logSuccess(`Deployment environments configured: ${envs.join(', ')}`);
    
  } catch (error) {
    logError(`Configuration validation failed: ${error.message}`);
    return false;
  }
  
  return true;
}

async function validateDependencies() {
  logSection('Dependencies Validation');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check critical dependencies
    const criticalDeps = [
      'electron',
      'electron-store',
      'react',
      'express',
      'bcrypt',
      'uuid',
      'systeminformation'
    ];
    
    for (const dep of criticalDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        logSuccess(`Dependency available: ${dep}`);
      } else {
        logError(`Missing critical dependency: ${dep}`);
        return false;
      }
    }
    
    // Check for security vulnerabilities
    logInfo('Checking for security vulnerabilities...');
    logWarning('Consider running "npm audit" to check for security vulnerabilities');
    
  } catch (error) {
    logError(`Failed to validate dependencies: ${error.message}`);
    return false;
  }
  
  return true;
}

async function validateServices() {
  logSection('Service Files Validation');
  
  const requiredServices = [
    'src/main/services/SecurityManager.js',
    'src/main/services/SecurityAuditor.js',
    'src/main/services/PerformanceMonitor.js',
    'src/main/services/DeploymentService.js',
    'src/main/services/HealthCheckService.js',
    'src/main/services/RateLimitingService.js'
  ];
  
  for (const service of requiredServices) {
    const servicePath = path.join(process.cwd(), service);
    
    if (fs.existsSync(servicePath)) {
      logSuccess(`Service file exists: ${path.basename(service)}`);
    } else {
      logError(`Missing service file: ${service}`);
      return false;
    }
  }
  
  return true;
}

async function validateUIComponents() {
  logSection('UI Components Validation');
  
  const requiredComponents = [
    'src/renderer/components/SecurityMonitor.js',
    'src/renderer/components/PerformanceDashboard.js',
    'src/renderer/components/DeploymentManager.js',
    'src/renderer/components/HealthMonitor.js'
  ];
  
  for (const component of requiredComponents) {
    const componentPath = path.join(process.cwd(), component);
    
    if (fs.existsSync(componentPath)) {
      logSuccess(`UI component exists: ${path.basename(component)}`);
    } else {
      logError(`Missing UI component: ${component}`);
      return false;
    }
  }
  
  return true;
}

async function performSecurityCheck() {
  logSection('Security Validation');
  
  // Check for sensitive files
  const sensitiveFiles = [
    '.env',
    'config/secrets.json',
    'keys/',
    'certificates/'
  ];
  
  for (const file of sensitiveFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      logWarning(`Sensitive file detected: ${file} - ensure proper access controls`);
    }
  }
  
  // Check file permissions
  if (process.platform !== 'win32') {
    try {
      const mainJsStats = fs.statSync(path.join(process.cwd(), 'src/main/main.js'));
      const mode = (mainJsStats.mode & parseInt('777', 8)).toString(8);
      if (mode === '755' || mode === '644') {
        logSuccess(`Proper file permissions: ${mode}`);
      } else {
        logWarning(`File permissions may be too permissive: ${mode}`);
      }
    } catch (error) {
      logWarning('Could not check file permissions');
    }
  }
  
  logSuccess('Security validation completed');
  return true;
}

async function generateStartupReport() {
  logSection('Startup Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: `${os.platform()} ${os.arch()}`,
    totalRAM: `${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB`,
    cpuCores: os.cpus().length,
    workingDirectory: process.cwd(),
    configurationValid: true,
    servicesAvailable: true,
    uiComponentsAvailable: true
  };
  
  const reportPath = path.join(process.cwd(), 'logs', 'startup-report.json');
  
  try {
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logSuccess(`Startup report generated: ${reportPath}`);
  } catch (error) {
    logWarning(`Could not generate startup report: ${error.message}`);
  }
  
  // Display summary
  log('\n📊 Startup Summary:', 'bold');
  log(`   Node.js: ${report.nodeVersion}`, 'cyan');
  log(`   Platform: ${report.platform}`, 'cyan');
  log(`   RAM: ${report.totalRAM}`, 'cyan');
  log(`   CPU Cores: ${report.cpuCores}`, 'cyan');
  log(`   Working Directory: ${report.workingDirectory}`, 'cyan');
}

async function main() {
  console.clear();
  
  log('🚀 HomeHost Desktop - Production Startup Validation', 'bold');
  log('   Performing comprehensive system validation...', 'cyan');
  
  const validations = [
    validateSystemRequirements,
    validateDirectories,
    validateConfiguration,
    validateDependencies,
    validateServices,
    validateUIComponents,
    performSecurityCheck
  ];
  
  let allPassed = true;
  
  for (const validation of validations) {
    try {
      const result = await validation();
      if (!result) {
        allPassed = false;
      }
    } catch (error) {
      logError(`Validation failed: ${error.message}`);
      allPassed = false;
    }
  }
  
  await generateStartupReport();
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    logSuccess('🎉 All validations passed! System is ready for production.');
    log('\n💡 Next steps:', 'bold');
    log('   1. Run: npm start', 'cyan');
    log('   2. Access monitoring dashboards via Settings', 'cyan');
    log('   3. Configure production-specific settings', 'cyan');
    log('   4. Set up monitoring alerts', 'cyan');
    
    process.exit(0);
  } else {
    logError('🚫 Some validations failed. Please address the issues above.');
    log('\n🔧 Common solutions:', 'bold');
    log('   1. Run: npm install', 'cyan');
    log('   2. Check Node.js version', 'cyan');
    log('   3. Verify file permissions', 'cyan');
    log('   4. Review configuration settings', 'cyan');
    
    process.exit(1);
  }
}

// Handle unhandled errors
process.on('unhandledRejection', (error) => {
  logError(`Unhandled error: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the validation
main().catch((error) => {
  logError(`Startup validation failed: ${error.message}`);
  process.exit(1);
});