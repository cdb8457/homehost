const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const crypto = require('crypto');

const execAsync = promisify(exec);

/**
 * DeploymentService - Automated deployment pipeline with environment management
 * 
 * Provides comprehensive deployment automation including build processes,
 * environment configuration, health checks, and rollback capabilities.
 */
class DeploymentService extends EventEmitter {
  constructor(store, logger) {
    super();
    this.store = store;
    this.logger = logger;
    
    // Deployment configuration
    this.config = {
      environments: {
        development: {
          name: 'development',
          buildScript: 'npm run build',
          outputDir: 'build',
          healthCheckUrl: 'http://localhost:3456/health',
          deploymentPath: './dist/dev',
          backupEnabled: false,
          autoRestart: true
        },
        staging: {
          name: 'staging',
          buildScript: 'npm run build',
          outputDir: 'build',
          healthCheckUrl: 'http://staging.homehost.local:3456/health',
          deploymentPath: './dist/staging',
          backupEnabled: true,
          autoRestart: true,
          requireApproval: false
        },
        production: {
          name: 'production',
          buildScript: 'npm run build',
          outputDir: 'build',
          healthCheckUrl: 'http://production.homehost.local:3456/health',
          deploymentPath: './dist/production',
          backupEnabled: true,
          autoRestart: true,
          requireApproval: true,
          rollbackStrategy: 'automatic',
          maxRollbackAttempts: 3
        }
      },
      
      // Build configuration
      build: {
        timeout: 15 * 60 * 1000, // 15 minutes
        retryAttempts: 2,
        cleanBefore: true,
        runTests: true,
        testScript: 'npm test -- --coverage --watchAll=false',
        lintScript: 'npm run lint',
        typecheckScript: 'npm run typecheck'
      },
      
      // Health check configuration
      healthCheck: {
        timeout: 30 * 1000, // 30 seconds
        retryAttempts: 5,
        retryDelay: 5000, // 5 seconds
        endpoints: [
          '/health',
          '/api/status',
          '/security/status'
        ]
      },
      
      // Backup configuration
      backup: {
        enabled: true,
        retentionDays: 30,
        compressionEnabled: true,
        incrementalBackups: true
      },
      
      // Monitoring configuration
      monitoring: {
        enabled: true,
        alertOnFailure: true,
        slackWebhook: null,
        emailNotifications: true
      }
    };
    
    // Deployment state tracking
    this.deployments = new Map(); // deploymentId -> deployment info
    this.activeDeployments = new Set();
    this.deploymentHistory = [];
    this.backups = new Map(); // environment -> backups[]
    
    // Deployment statistics
    this.stats = {
      totalDeployments: 0,
      successfulDeployments: 0,
      failedDeployments: 0,
      rollbacks: 0,
      averageDeploymentTime: 0,
      lastDeployment: null
    };
    
    this.initialize();
  }

  /**
   * Initialize deployment service
   */
  initialize() {
    try {
      console.log('🚀 Initializing Deployment Service...');
      
      // Load configuration
      this.loadConfiguration();
      
      // Ensure deployment directories exist
      this.ensureDeploymentDirectories();
      
      // Load deployment history
      this.loadDeploymentHistory();
      
      console.log('✅ Deployment Service initialized successfully');
      this.emit('deployment-service-initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Deployment Service:', error);
      throw error;
    }
  }

  /**
   * Load configuration from store
   */
  loadConfiguration() {
    if (this.store && typeof this.store.get === 'function') {
      const storedConfig = this.store.get('deployment.config');
      if (storedConfig) {
        this.config = { ...this.config, ...storedConfig };
      }
      
      // Save current config
      this.store.set('deployment.config', this.config);
    }
  }

  /**
   * Ensure deployment directories exist
   */
  async ensureDeploymentDirectories() {
    for (const env of Object.values(this.config.environments)) {
      try {
        await fs.mkdir(env.deploymentPath, { recursive: true });
        console.log(`📁 Created deployment directory: ${env.deploymentPath}`);
      } catch (error) {
        console.warn(`⚠️ Failed to create deployment directory ${env.deploymentPath}:`, error.message);
      }
    }
  }

  /**
   * Load deployment history from store
   */
  loadDeploymentHistory() {
    if (this.store && typeof this.store.get === 'function') {
      const history = this.store.get('deployment.history', []);
      this.deploymentHistory = history;
      
      // Calculate statistics
      this.calculateStatistics();
    }
  }

  /**
   * Calculate deployment statistics
   */
  calculateStatistics() {
    const deployments = this.deploymentHistory;
    
    this.stats.totalDeployments = deployments.length;
    this.stats.successfulDeployments = deployments.filter(d => d.status === 'success').length;
    this.stats.failedDeployments = deployments.filter(d => d.status === 'failed').length;
    this.stats.rollbacks = deployments.filter(d => d.type === 'rollback').length;
    
    if (deployments.length > 0) {
      const completedDeployments = deployments.filter(d => d.endTime && d.startTime);
      if (completedDeployments.length > 0) {
        const totalTime = completedDeployments.reduce((sum, d) => sum + (d.endTime - d.startTime), 0);
        this.stats.averageDeploymentTime = totalTime / completedDeployments.length;
      }
      
      this.stats.lastDeployment = deployments[deployments.length - 1];
    }
  }

  /**
   * Deploy to environment
   */
  async deploy(environment, options = {}) {
    const envConfig = this.config.environments[environment];
    if (!envConfig) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    const deploymentId = this.generateDeploymentId();
    const deployment = {
      id: deploymentId,
      environment: environment,
      type: 'deployment',
      status: 'in_progress',
      startTime: Date.now(),
      endTime: null,
      steps: [],
      metadata: {
        version: options.version || 'latest',
        branch: options.branch || 'main',
        commit: options.commit || null,
        triggeredBy: options.triggeredBy || 'manual',
        buildNumber: this.generateBuildNumber()
      }
    };

    this.deployments.set(deploymentId, deployment);
    this.activeDeployments.add(deploymentId);
    this.stats.totalDeployments++;

    console.log(`🚀 Starting deployment ${deploymentId} to ${environment}`);
    this.emit('deployment-started', deployment);

    try {
      // Step 1: Pre-deployment validation
      await this.executeDeploymentStep(deployment, 'pre-validation', async () => {
        await this.validatePreDeployment(envConfig, options);
      });

      // Step 2: Create backup (if enabled)
      if (envConfig.backupEnabled) {
        await this.executeDeploymentStep(deployment, 'backup', async () => {
          await this.createBackup(environment);
        });
      }

      // Step 3: Build application
      await this.executeDeploymentStep(deployment, 'build', async () => {
        await this.buildApplication(envConfig, options);
      });

      // Step 4: Run tests (if enabled)
      if (this.config.build.runTests && !options.skipTests) {
        await this.executeDeploymentStep(deployment, 'test', async () => {
          await this.runTests(envConfig);
        });
      }

      // Step 5: Deploy application
      await this.executeDeploymentStep(deployment, 'deploy', async () => {
        await this.deployApplication(envConfig, deployment);
      });

      // Step 6: Health check
      await this.executeDeploymentStep(deployment, 'health-check', async () => {
        await this.performHealthCheck(envConfig);
      });

      // Step 7: Post-deployment tasks
      await this.executeDeploymentStep(deployment, 'post-deployment', async () => {
        await this.postDeploymentTasks(envConfig, deployment);
      });

      // Deployment successful
      deployment.status = 'success';
      deployment.endTime = Date.now();
      this.stats.successfulDeployments++;

      console.log(`✅ Deployment ${deploymentId} completed successfully`);
      this.emit('deployment-success', deployment);

    } catch (error) {
      deployment.status = 'failed';
      deployment.endTime = Date.now();
      deployment.error = error.message;
      this.stats.failedDeployments++;

      console.error(`❌ Deployment ${deploymentId} failed:`, error);
      this.emit('deployment-failed', deployment);

      // Attempt automatic rollback for production
      if (environment === 'production' && envConfig.rollbackStrategy === 'automatic') {
        try {
          await this.rollback(environment, { reason: 'deployment_failure', deploymentId });
        } catch (rollbackError) {
          console.error(`❌ Automatic rollback failed:`, rollbackError);
        }
      }

      throw error;
    } finally {
      this.activeDeployments.delete(deploymentId);
      this.deploymentHistory.push(deployment);
      this.saveDeploymentHistory();
      this.calculateStatistics();
    }

    return deployment;
  }

  /**
   * Execute a deployment step with error handling
   */
  async executeDeploymentStep(deployment, stepName, stepFunction) {
    const step = {
      name: stepName,
      status: 'in_progress',
      startTime: Date.now(),
      endTime: null,
      error: null
    };

    deployment.steps.push(step);
    console.log(`🔄 Executing step: ${stepName}`);
    this.emit('deployment-step-started', { deployment, step });

    try {
      await stepFunction();
      step.status = 'success';
      step.endTime = Date.now();
      console.log(`✅ Step completed: ${stepName}`);
      this.emit('deployment-step-completed', { deployment, step });
    } catch (error) {
      step.status = 'failed';
      step.endTime = Date.now();
      step.error = error.message;
      console.error(`❌ Step failed: ${stepName} - ${error.message}`);
      this.emit('deployment-step-failed', { deployment, step });
      throw error;
    }
  }

  /**
   * Validate pre-deployment conditions
   */
  async validatePreDeployment(envConfig, options) {
    // Check if another deployment is in progress
    if (this.activeDeployments.size > 1) {
      throw new Error('Another deployment is already in progress');
    }

    // Check disk space
    const { stdout } = await execAsync('df -h .');
    const diskUsage = this.parseDiskUsage(stdout);
    if (diskUsage.usage > 90) {
      throw new Error(`Insufficient disk space: ${diskUsage.usage}% used`);
    }

    // Check if deployment directory is writable
    try {
      await fs.access(envConfig.deploymentPath, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`Deployment directory not writable: ${envConfig.deploymentPath}`);
    }

    // Validate environment-specific requirements
    if (envConfig.requireApproval && !options.approved) {
      throw new Error('Deployment requires approval for this environment');
    }

    console.log('✅ Pre-deployment validation passed');
  }

  /**
   * Parse disk usage from df command output
   */
  parseDiskUsage(dfOutput) {
    const lines = dfOutput.split('\n');
    if (lines.length > 1) {
      const columns = lines[1].split(/\s+/);
      if (columns.length >= 5) {
        const usageStr = columns[4];
        const usage = parseInt(usageStr.replace('%', ''));
        return { usage, available: columns[3] };
      }
    }
    return { usage: 0, available: 'unknown' };
  }

  /**
   * Build application
   */
  async buildApplication(envConfig, options) {
    console.log(`🔨 Building application for ${envConfig.name}`);

    // Clean previous build if enabled
    if (this.config.build.cleanBefore) {
      try {
        await fs.rm(envConfig.outputDir, { recursive: true, force: true });
        console.log(`🧹 Cleaned previous build: ${envConfig.outputDir}`);
      } catch (error) {
        console.warn('⚠️ Failed to clean previous build:', error.message);
      }
    }

    // Run linting (if configured)
    if (this.config.build.lintScript) {
      try {
        await this.runCommand(this.config.build.lintScript, 'Linting');
      } catch (error) {
        console.warn('⚠️ Linting failed:', error.message);
        if (!options.ignoreLintErrors) {
          throw new Error('Build failed due to linting errors');
        }
      }
    }

    // Run type checking (if configured)
    if (this.config.build.typecheckScript) {
      try {
        await this.runCommand(this.config.build.typecheckScript, 'Type checking');
      } catch (error) {
        console.warn('⚠️ Type checking failed:', error.message);
        if (!options.ignoreTypeErrors) {
          throw new Error('Build failed due to type errors');
        }
      }
    }

    // Build application
    await this.runCommand(envConfig.buildScript, 'Building application', this.config.build.timeout);

    // Verify build output
    try {
      await fs.access(envConfig.outputDir);
      console.log(`✅ Build completed: ${envConfig.outputDir}`);
    } catch (error) {
      throw new Error(`Build output directory not found: ${envConfig.outputDir}`);
    }
  }

  /**
   * Run tests
   */
  async runTests(envConfig) {
    console.log('🧪 Running tests');
    await this.runCommand(this.config.build.testScript, 'Running tests', this.config.build.timeout);
    console.log('✅ Tests passed');
  }

  /**
   * Deploy application files
   */
  async deployApplication(envConfig, deployment) {
    console.log(`📦 Deploying to ${envConfig.deploymentPath}`);

    // Create deployment-specific directory
    const deploymentDir = path.join(envConfig.deploymentPath, deployment.id);
    await fs.mkdir(deploymentDir, { recursive: true });

    // Copy build output to deployment directory
    await this.copyDirectory(envConfig.outputDir, deploymentDir);

    // Create symlink for current deployment
    const currentLink = path.join(envConfig.deploymentPath, 'current');
    try {
      await fs.unlink(currentLink);
    } catch (error) {
      // Ignore if symlink doesn't exist
    }
    await fs.symlink(deployment.id, currentLink);

    // Generate deployment manifest
    const manifest = {
      deploymentId: deployment.id,
      environment: envConfig.name,
      timestamp: Date.now(),
      version: deployment.metadata.version,
      commit: deployment.metadata.commit,
      buildNumber: deployment.metadata.buildNumber
    };

    await fs.writeFile(
      path.join(deploymentDir, 'deployment-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`✅ Application deployed to ${deploymentDir}`);
  }

  /**
   * Perform health check
   */
  async performHealthCheck(envConfig) {
    console.log(`🏥 Performing health check for ${envConfig.name}`);

    const healthCheckPromises = this.config.healthCheck.endpoints.map(endpoint => {
      const url = new URL(endpoint, envConfig.healthCheckUrl).toString();
      return this.checkEndpointHealth(url);
    });

    try {
      await Promise.all(healthCheckPromises);
      console.log('✅ Health check passed');
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  /**
   * Check individual endpoint health
   */
  async checkEndpointHealth(url) {
    const maxAttempts = this.config.healthCheck.retryAttempts;
    const retryDelay = this.config.healthCheck.retryDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Using curl for health check (more reliable than fetch in Node.js environment)
        const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" --max-time ${this.config.healthCheck.timeout / 1000} "${url}"`);
        const statusCode = parseInt(stdout.trim());
        
        if (statusCode >= 200 && statusCode < 300) {
          console.log(`✅ Health check passed for ${url} (${statusCode})`);
          return;
        } else {
          throw new Error(`HTTP ${statusCode}`);
        }
      } catch (error) {
        console.warn(`⚠️ Health check attempt ${attempt}/${maxAttempts} failed for ${url}: ${error.message}`);
        
        if (attempt === maxAttempts) {
          throw new Error(`Health check failed after ${maxAttempts} attempts: ${error.message}`);
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  /**
   * Post-deployment tasks
   */
  async postDeploymentTasks(envConfig, deployment) {
    console.log('🔧 Running post-deployment tasks');

    // Update deployment metadata
    if (this.store && typeof this.store.set === 'function') {
      this.store.set(`deployment.current.${envConfig.name}`, {
        deploymentId: deployment.id,
        timestamp: Date.now(),
        version: deployment.metadata.version
      });
    }

    // Clean up old deployments (keep last 5)
    await this.cleanupOldDeployments(envConfig, 5);

    console.log('✅ Post-deployment tasks completed');
  }

  /**
   * Create backup
   */
  async createBackup(environment) {
    const envConfig = this.config.environments[environment];
    if (!envConfig) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    console.log(`💾 Creating backup for ${environment}`);

    const backupId = `backup_${environment}_${Date.now()}`;
    const backupDir = path.join('./backups', environment);
    const backupPath = path.join(backupDir, `${backupId}.tar.gz`);

    await fs.mkdir(backupDir, { recursive: true });

    // Create compressed backup
    const currentDeployment = path.join(envConfig.deploymentPath, 'current');
    try {
      await fs.access(currentDeployment);
      await this.runCommand(`tar -czf "${backupPath}" -C "${envConfig.deploymentPath}" current`, 'Creating backup');
      
      const backup = {
        id: backupId,
        environment: environment,
        timestamp: Date.now(),
        path: backupPath,
        size: (await fs.stat(backupPath)).size
      };

      if (!this.backups.has(environment)) {
        this.backups.set(environment, []);
      }
      this.backups.get(environment).push(backup);

      console.log(`✅ Backup created: ${backupPath}`);
      this.emit('backup-created', backup);

      // Clean up old backups
      await this.cleanupOldBackups(environment);

      return backup;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ℹ️ No current deployment to backup');
        return null;
      }
      throw error;
    }
  }

  /**
   * Rollback to previous deployment
   */
  async rollback(environment, options = {}) {
    const envConfig = this.config.environments[environment];
    if (!envConfig) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    console.log(`🔄 Rolling back ${environment} deployment`);

    const rollbackId = this.generateDeploymentId();
    const rollback = {
      id: rollbackId,
      environment: environment,
      type: 'rollback',
      status: 'in_progress',
      startTime: Date.now(),
      endTime: null,
      steps: [],
      metadata: {
        reason: options.reason || 'manual_rollback',
        originalDeploymentId: options.deploymentId || null,
        triggeredBy: options.triggeredBy || 'system'
      }
    };

    this.deployments.set(rollbackId, rollback);
    this.activeDeployments.add(rollbackId);

    try {
      // Find previous successful deployment or restore from backup
      const previousDeployment = await this.findPreviousDeployment(environment);
      
      if (previousDeployment) {
        await this.executeDeploymentStep(rollback, 'rollback-deployment', async () => {
          await this.restorePreviousDeployment(envConfig, previousDeployment);
        });
      } else {
        await this.executeDeploymentStep(rollback, 'restore-backup', async () => {
          await this.restoreFromBackup(environment);
        });
      }

      // Health check after rollback
      await this.executeDeploymentStep(rollback, 'health-check', async () => {
        await this.performHealthCheck(envConfig);
      });

      rollback.status = 'success';
      rollback.endTime = Date.now();
      this.stats.rollbacks++;

      console.log(`✅ Rollback ${rollbackId} completed successfully`);
      this.emit('rollback-success', rollback);

    } catch (error) {
      rollback.status = 'failed';
      rollback.endTime = Date.now();
      rollback.error = error.message;

      console.error(`❌ Rollback ${rollbackId} failed:`, error);
      this.emit('rollback-failed', rollback);
      throw error;
    } finally {
      this.activeDeployments.delete(rollbackId);
      this.deploymentHistory.push(rollback);
      this.saveDeploymentHistory();
    }

    return rollback;
  }

  /**
   * Find previous successful deployment
   */
  async findPreviousDeployment(environment) {
    const envDeployments = this.deploymentHistory
      .filter(d => d.environment === environment && d.status === 'success' && d.type === 'deployment')
      .sort((a, b) => b.startTime - a.startTime);

    if (envDeployments.length > 1) {
      return envDeployments[1]; // Second most recent (previous to current)
    }
    return null;
  }

  /**
   * Restore previous deployment
   */
  async restorePreviousDeployment(envConfig, previousDeployment) {
    const previousPath = path.join(envConfig.deploymentPath, previousDeployment.id);
    const currentLink = path.join(envConfig.deploymentPath, 'current');

    try {
      await fs.access(previousPath);
      await fs.unlink(currentLink);
      await fs.symlink(previousDeployment.id, currentLink);
      console.log(`✅ Restored deployment ${previousDeployment.id}`);
    } catch (error) {
      throw new Error(`Failed to restore previous deployment: ${error.message}`);
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(environment) {
    const envBackups = this.backups.get(environment) || [];
    if (envBackups.length === 0) {
      throw new Error('No backups available for restoration');
    }

    const latestBackup = envBackups[envBackups.length - 1];
    const envConfig = this.config.environments[environment];

    console.log(`📦 Restoring from backup: ${latestBackup.id}`);
    
    await this.runCommand(
      `tar -xzf "${latestBackup.path}" -C "${envConfig.deploymentPath}"`,
      'Restoring backup'
    );

    console.log(`✅ Restored from backup ${latestBackup.id}`);
  }

  /**
   * Run command with proper error handling and logging
   */
  async runCommand(command, description, timeout = 60000) {
    console.log(`🔄 ${description}: ${command}`);
    
    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      const timeoutId = setTimeout(() => {
        child.kill('SIGKILL');
        reject(new Error(`Command timed out after ${timeout}ms: ${command}`));
      }, timeout);

      child.on('close', (code) => {
        clearTimeout(timeoutId);
        
        if (code === 0) {
          console.log(`✅ ${description} completed successfully`);
          resolve({ stdout, stderr });
        } else {
          console.error(`❌ ${description} failed with code ${code}`);
          console.error('STDERR:', stderr);
          reject(new Error(`Command failed with code ${code}: ${command}\nError: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to execute command: ${error.message}`));
      });
    });
  }

  /**
   * Copy directory recursively
   */
  async copyDirectory(source, destination) {
    await fs.mkdir(destination, { recursive: true });
    const entries = await fs.readdir(source, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(source, entry.name);
      const destPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Clean up old deployments
   */
  async cleanupOldDeployments(envConfig, keepCount = 5) {
    try {
      const deploymentDir = envConfig.deploymentPath;
      const entries = await fs.readdir(deploymentDir, { withFileTypes: true });
      
      const deploymentDirs = entries
        .filter(entry => entry.isDirectory() && entry.name !== 'current')
        .map(entry => ({
          name: entry.name,
          path: path.join(deploymentDir, entry.name),
          stat: null
        }));

      // Get stats for sorting by modification time
      for (const dir of deploymentDirs) {
        try {
          dir.stat = await fs.stat(dir.path);
        } catch (error) {
          console.warn(`⚠️ Failed to stat deployment directory ${dir.path}`);
        }
      }

      // Sort by modification time (newest first) and keep only the specified count
      const sortedDirs = deploymentDirs
        .filter(dir => dir.stat)
        .sort((a, b) => b.stat.mtime - a.stat.mtime);

      const dirsToRemove = sortedDirs.slice(keepCount);

      for (const dir of dirsToRemove) {
        try {
          await fs.rm(dir.path, { recursive: true });
          console.log(`🗑️ Removed old deployment: ${dir.name}`);
        } catch (error) {
          console.warn(`⚠️ Failed to remove old deployment ${dir.name}:`, error.message);
        }
      }

      if (dirsToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${dirsToRemove.length} old deployments`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cleanup old deployments:', error.message);
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups(environment) {
    const retentionMs = this.config.backup.retentionDays * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - retentionMs;

    const envBackups = this.backups.get(environment) || [];
    const backupsToRemove = envBackups.filter(backup => backup.timestamp < cutoffTime);

    for (const backup of backupsToRemove) {
      try {
        await fs.unlink(backup.path);
        console.log(`🗑️ Removed old backup: ${backup.id}`);
      } catch (error) {
        console.warn(`⚠️ Failed to remove old backup ${backup.id}:`, error.message);
      }
    }

    // Update backup list
    const remainingBackups = envBackups.filter(backup => backup.timestamp >= cutoffTime);
    this.backups.set(environment, remainingBackups);

    if (backupsToRemove.length > 0) {
      console.log(`🧹 Cleaned up ${backupsToRemove.length} old backups for ${environment}`);
    }
  }

  /**
   * Save deployment history to store
   */
  saveDeploymentHistory() {
    if (this.store && typeof this.store.set === 'function') {
      // Keep only last 100 deployments in history
      const trimmedHistory = this.deploymentHistory.slice(-100);
      this.store.set('deployment.history', trimmedHistory);
      this.deploymentHistory = trimmedHistory;
    }
  }

  /**
   * Generate unique deployment ID
   */
  generateDeploymentId() {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `deploy_${timestamp}_${random}`;
  }

  /**
   * Generate build number
   */
  generateBuildNumber() {
    const lastBuild = this.store?.get('deployment.lastBuildNumber', 0) || 0;
    const newBuildNumber = lastBuild + 1;
    
    if (this.store && typeof this.store.set === 'function') {
      this.store.set('deployment.lastBuildNumber', newBuildNumber);
    }
    
    return newBuildNumber;
  }

  /**
   * Get deployment status
   */
  getDeploymentStatus(deploymentId) {
    return this.deployments.get(deploymentId);
  }

  /**
   * Get environment status
   */
  getEnvironmentStatus(environment) {
    const envConfig = this.config.environments[environment];
    if (!envConfig) {
      return null;
    }

    const currentDeployment = this.store?.get(`deployment.current.${environment}`);
    const recentDeployments = this.deploymentHistory
      .filter(d => d.environment === environment)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 5);

    return {
      environment: environment,
      currentDeployment: currentDeployment,
      recentDeployments: recentDeployments,
      isDeploying: Array.from(this.activeDeployments).some(id => {
        const deployment = this.deployments.get(id);
        return deployment && deployment.environment === environment;
      })
    };
  }

  /**
   * Get deployment statistics
   */
  getStatistics() {
    return { ...this.stats };
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
      this.store.set('deployment.config', this.config);
    }
    
    this.emit('config-updated', this.config);
    console.log('🔧 Deployment configuration updated');
  }

  /**
   * Export deployment data
   */
  exportData() {
    return {
      config: this.config,
      statistics: this.getStatistics(),
      deploymentHistory: this.deploymentHistory,
      activeDeployments: Array.from(this.activeDeployments),
      backups: Object.fromEntries(this.backups),
      timestamp: new Date()
    };
  }
}

module.exports = DeploymentService;