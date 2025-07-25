#!/usr/bin/env node

/**
 * Deployment Script for HomeHost Desktop Application
 * 
 * Usage:
 *   npm run deploy -- [environment] [options]
 *   node scripts/deploy.js staging --version=1.0.0
 *   node scripts/deploy.js production --approved --no-tests
 */

const path = require('path');
const { program } = require('commander');
const Store = require('electron-store');

// Import deployment service
const DeploymentService = require('../src/main/services/DeploymentService');

// Configure command line interface
program
  .name('deploy')
  .description('Deploy HomeHost Desktop Application')
  .version('1.0.0');

program
  .argument('[environment]', 'Target environment (development|staging|production)', 'development')
  .option('-v, --version <version>', 'Version to deploy', 'latest')
  .option('-b, --branch <branch>', 'Git branch to deploy', 'main')
  .option('-c, --commit <commit>', 'Specific commit to deploy')
  .option('--approved', 'Mark deployment as approved (required for production)')
  .option('--skip-tests', 'Skip test execution')
  .option('--ignore-lint-errors', 'Continue deployment despite linting errors')
  .option('--ignore-type-errors', 'Continue deployment despite type errors')
  .option('--dry-run', 'Simulate deployment without making changes')
  .option('--rollback', 'Rollback to previous deployment')
  .option('--force', 'Force deployment even with warnings')
  .option('--config <config>', 'Custom configuration file')
  .option('--verbose', 'Enable verbose logging')
  .parse();

const options = program.opts();
const environment = program.args[0] || 'development';

async function main() {
  console.log('🚀 HomeHost Deployment Tool');
  console.log('============================');
  console.log(`Environment: ${environment}`);
  console.log(`Version: ${options.version}`);
  console.log(`Branch: ${options.branch}`);
  
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }
  
  console.log('');

  try {
    // Initialize store
    const store = new Store({
      name: 'deployment-cli-store',
      cwd: path.join(__dirname, '../.deployment')
    });

    // Create logger with appropriate verbosity
    const logger = {
      log: (...args) => console.log(...args),
      warn: (...args) => console.warn(...args),
      error: (...args) => console.error(...args),
      debug: options.verbose ? (...args) => console.log('[DEBUG]', ...args) : () => {}
    };

    // Initialize deployment service
    const deploymentService = new DeploymentService(store, logger);

    // Load custom configuration if provided
    if (options.config) {
      try {
        const customConfig = require(path.resolve(options.config));
        deploymentService.updateConfiguration(customConfig);
        console.log(`📋 Loaded custom configuration: ${options.config}`);
      } catch (error) {
        console.error(`❌ Failed to load configuration file: ${error.message}`);
        process.exit(1);
      }
    }

    // Set up event listeners for deployment progress
    setupEventListeners(deploymentService, options.verbose);

    // Validate environment
    const envConfig = deploymentService.config.environments[environment];
    if (!envConfig) {
      console.error(`❌ Unknown environment: ${environment}`);
      console.log(`Available environments: ${Object.keys(deploymentService.config.environments).join(', ')}`);
      process.exit(1);
    }

    // Handle rollback request
    if (options.rollback) {
      await handleRollback(deploymentService, environment, options);
      return;
    }

    // Perform pre-deployment checks
    await performPreDeploymentChecks(deploymentService, environment, options);

    // Execute deployment
    if (options.dryRun) {
      await simulateDeployment(deploymentService, environment, options);
    } else {
      await executeDeployment(deploymentService, environment, options);
    }

  } catch (error) {
    console.error(`❌ Deployment failed: ${error.message}`);
    if (options.verbose) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Set up event listeners for deployment progress
 */
function setupEventListeners(deploymentService, verbose) {
  deploymentService.on('deployment-started', (deployment) => {
    console.log(`🚀 Deployment ${deployment.id} started`);
    if (verbose) {
      console.log(`   Environment: ${deployment.environment}`);
      console.log(`   Version: ${deployment.metadata.version}`);
      console.log(`   Build: #${deployment.metadata.buildNumber}`);
    }
  });

  deploymentService.on('deployment-step-started', ({ deployment, step }) => {
    const emoji = getStepEmoji(step.name);
    console.log(`${emoji} ${step.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`);
  });

  deploymentService.on('deployment-step-completed', ({ deployment, step }) => {
    const duration = ((step.endTime - step.startTime) / 1000).toFixed(1);
    if (verbose) {
      console.log(`   ✅ Completed in ${duration}s`);
    }
  });

  deploymentService.on('deployment-step-failed', ({ deployment, step }) => {
    console.error(`   ❌ Failed: ${step.error}`);
  });

  deploymentService.on('deployment-success', (deployment) => {
    const duration = ((deployment.endTime - deployment.startTime) / 1000).toFixed(1);
    console.log('');
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log(`   Duration: ${duration}s`);
    console.log(`   Deployment ID: ${deployment.id}`);
    console.log(`   Environment: ${deployment.environment}`);
  });

  deploymentService.on('deployment-failed', (deployment) => {
    console.log('');
    console.error('💥 DEPLOYMENT FAILED!');
    console.error(`   Error: ${deployment.error}`);
    console.error(`   Deployment ID: ${deployment.id}`);
  });

  deploymentService.on('rollback-success', (rollback) => {
    console.log('');
    console.log('🔄 ROLLBACK SUCCESSFUL!');
    console.log(`   Rollback ID: ${rollback.id}`);
    console.log(`   Environment: ${rollback.environment}`);
  });

  deploymentService.on('backup-created', (backup) => {
    if (verbose) {
      const sizeKB = (backup.size / 1024).toFixed(1);
      console.log(`   💾 Backup created: ${backup.id} (${sizeKB} KB)`);
    }
  });
}

/**
 * Get emoji for deployment step
 */
function getStepEmoji(stepName) {
  const emojiMap = {
    'pre-validation': '🔍',
    'backup': '💾',
    'build': '🔨',
    'test': '🧪',
    'deploy': '📦',
    'health-check': '🏥',
    'post-deployment': '🔧',
    'rollback-deployment': '🔄',
    'restore-backup': '📦'
  };
  return emojiMap[stepName] || '⚙️';
}

/**
 * Perform pre-deployment checks
 */
async function performPreDeploymentChecks(deploymentService, environment, options) {
  console.log('🔍 Pre-deployment checks');
  
  // Check if deployment is already in progress
  const envStatus = deploymentService.getEnvironmentStatus(environment);
  if (envStatus && envStatus.isDeploying) {
    if (!options.force) {
      throw new Error(`Deployment already in progress for ${environment}. Use --force to override.`);
    }
    console.warn('⚠️ Another deployment is in progress, but --force was specified');
  }

  // Production-specific checks
  if (environment === 'production') {
    if (!options.approved) {
      throw new Error('Production deployments require approval. Use --approved flag.');
    }
    
    if (!options.version || options.version === 'latest') {
      if (!options.force) {
        throw new Error('Production deployments should specify a version. Use --force to override.');
      }
    }
  }

  // Check git status (if in git repository)
  try {
    const { execSync } = require('child_process');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (gitStatus.trim() && !options.force) {
      console.warn('⚠️ Working directory has uncommitted changes:');
      console.warn(gitStatus);
      if (!options.force) {
        throw new Error('Uncommitted changes detected. Commit or use --force to override.');
      }
    }
  } catch (error) {
    // Not a git repository or git not available
    if (options.verbose) {
      console.log('ℹ️ Git status check skipped (not a git repository)');
    }
  }

  console.log('✅ Pre-deployment checks passed');
  console.log('');
}

/**
 * Execute actual deployment
 */
async function executeDeployment(deploymentService, environment, options) {
  const deploymentOptions = {
    version: options.version,
    branch: options.branch,
    commit: options.commit,
    approved: options.approved,
    skipTests: options.skipTests,
    ignoreLintErrors: options.ignoreLintErrors,
    ignoreTypeErrors: options.ignoreTypeErrors,
    triggeredBy: 'cli'
  };

  const deployment = await deploymentService.deploy(environment, deploymentOptions);
  
  // Show deployment summary
  console.log('');
  console.log('📊 Deployment Summary');
  console.log('=====================');
  console.log(`Deployment ID: ${deployment.id}`);
  console.log(`Environment: ${deployment.environment}`);
  console.log(`Status: ${deployment.status}`);
  console.log(`Duration: ${((deployment.endTime - deployment.startTime) / 1000).toFixed(1)}s`);
  console.log(`Steps completed: ${deployment.steps.filter(s => s.status === 'success').length}/${deployment.steps.length}`);
  
  if (deployment.status === 'success') {
    console.log('');
    console.log('🎯 Next steps:');
    console.log(`   • Monitor application: ${deploymentService.config.environments[environment].healthCheckUrl}`);
    console.log(`   • View logs: npm run logs ${environment}`);
    console.log(`   • Rollback if needed: npm run deploy ${environment} --rollback`);
  }
}

/**
 * Simulate deployment without making changes
 */
async function simulateDeployment(deploymentService, environment, options) {
  console.log('🔍 Simulating deployment process...');
  console.log('');
  
  const envConfig = deploymentService.config.environments[environment];
  const steps = [
    'Pre-validation',
    envConfig.backupEnabled ? 'Backup creation' : null,
    'Application build',
    deploymentService.config.build.runTests && !options.skipTests ? 'Test execution' : null,
    'Application deployment',
    'Health check',
    'Post-deployment tasks'
  ].filter(Boolean);

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    console.log(`${i + 1}. ${step}`);
    
    // Simulate step duration
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('');
  console.log('✅ Simulation completed successfully');
  console.log('');
  console.log('📝 Deployment would include:');
  console.log(`   • Target: ${environment}`);
  console.log(`   • Version: ${options.version}`);
  console.log(`   • Build script: ${envConfig.buildScript}`);
  console.log(`   • Deploy path: ${envConfig.deploymentPath}`);
  console.log(`   • Health check: ${envConfig.healthCheckUrl}`);
  
  if (envConfig.backupEnabled) {
    console.log('   • Backup: enabled');
  }
  
  if (deploymentService.config.build.runTests && !options.skipTests) {
    console.log('   • Tests: enabled');
  }
}

/**
 * Handle rollback request
 */
async function handleRollback(deploymentService, environment, options) {
  console.log(`🔄 Rolling back ${environment} environment`);
  
  if (environment === 'production' && !options.approved) {
    throw new Error('Production rollbacks require approval. Use --approved flag.');
  }
  
  const rollbackOptions = {
    reason: 'manual_rollback',
    triggeredBy: 'cli'
  };
  
  const rollback = await deploymentService.rollback(environment, rollbackOptions);
  
  console.log('');
  console.log('📊 Rollback Summary');
  console.log('===================');
  console.log(`Rollback ID: ${rollback.id}`);
  console.log(`Environment: ${rollback.environment}`);
  console.log(`Status: ${rollback.status}`);
  console.log(`Duration: ${((rollback.endTime - rollback.startTime) / 1000).toFixed(1)}s`);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error.message);
  if (options && options.verbose) {
    console.error(error.stack);
  }
  process.exit(1);
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n⚠️ Deployment interrupted by user');
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = { main, setupEventListeners, performPreDeploymentChecks };