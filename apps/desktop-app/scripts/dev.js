const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Development script to run React dev server and Electron concurrently

const isWindows = process.platform === 'win32';

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: isWindows,
      ...options
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    return child;
  });
}

async function startDevelopment() {
  console.log('🚀 Starting HomeHost Desktop in development mode...');

  try {
    // Check if node_modules exists
    if (!fs.existsSync(path.join(__dirname, '../node_modules'))) {
      console.log('📦 Installing dependencies...');
      await runCommand('npm', ['install'], { cwd: path.join(__dirname, '..') });
    }

    // Start React development server
    console.log('⚛️ Starting React development server...');
    const reactServer = spawn('npm', ['run', 'start'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: isWindows,
      env: {
        ...process.env,
        BROWSER: 'none', // Prevent React from opening browser
        PORT: '3001'
      }
    });

    // Wait a moment for React server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Start Electron
    console.log('⚡ Starting Electron...');
    const electronProcess = spawn('npm', ['run', 'electron'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: isWindows,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    // Handle cleanup
    const cleanup = () => {
      console.log('🧹 Cleaning up...');
      reactServer.kill();
      electronProcess.kill();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    // Wait for Electron to exit
    electronProcess.on('close', () => {
      cleanup();
    });

  } catch (error) {
    console.error('❌ Failed to start development server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startDevelopment();
}

module.exports = { startDevelopment };