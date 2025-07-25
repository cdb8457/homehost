// Real SteamCMD automation service
const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SteamService {
  constructor(store) {
    this.store = store;
    this.steamCmdPath = null;
    this.steamCmdDir = null;
    this.isInitialized = false;
    this.activeInstalls = new Map();
    
    // Steam app IDs for supported dedicated servers
    this.dedicatedServerApps = {
      'valheim': {
        appId: '896660',
        name: 'Valheim Dedicated Server',
        executable: os.platform() === 'win32' ? 'valheim_dedicated_server.exe' : 'valheim_dedicated_server'
      },
      'rust': {
        appId: '258550',
        name: 'Rust Dedicated Server',
        executable: os.platform() === 'win32' ? 'RustDedicated.exe' : 'RustDedicated'
      },
      'cs2': {
        appId: '730',
        name: 'Counter-Strike 2 Dedicated Server',
        executable: os.platform() === 'win32' ? 'cs2.exe' : 'cs2'
      },
      'seven_days': {
        appId: '294420',
        name: '7 Days to Die Dedicated Server',
        executable: os.platform() === 'win32' ? '7DaysToDieServer.exe' : '7DaysToDieServer'
      }
    };
  }

  async initialize(steamPath) {
    try {
      this.steamCmdDir = steamPath;
      const isWindows = os.platform() === 'win32';
      this.steamCmdPath = path.join(steamPath, isWindows ? 'steamcmd.exe' : 'steamcmd.sh');
      
      // Check if SteamCMD exists
      try {
        await fs.access(this.steamCmdPath);
        console.log(`Found SteamCMD at: ${this.steamCmdPath}`);
      } catch (error) {
        console.log('SteamCMD not found, will attempt to download...');
        await this.downloadSteamCMD();
      }
      
      // Verify SteamCMD works
      await this.verifySteamCMD();
      
      this.isInitialized = true;
      this.store.set('steamCmdPath', this.steamCmdPath);
      
      console.log('Steam service initialized successfully');
      return { success: true, path: this.steamCmdPath };
    } catch (error) {
      console.error('Failed to initialize Steam service:', error);
      throw error;
    }
  }

  async downloadSteamCMD() {
    try {
      console.log('Downloading SteamCMD...');
      
      // Ensure directory exists
      await fs.mkdir(this.steamCmdDir, { recursive: true });
      
      const isWindows = os.platform() === 'win32';
      
      if (isWindows) {
        // Download SteamCMD for Windows
        const url = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
        const zipPath = path.join(this.steamCmdDir, 'steamcmd.zip');
        
        // Use curl or wget if available, otherwise throw error
        try {
          await execAsync(`curl -L "${url}" -o "${zipPath}"`);
          console.log('Downloaded SteamCMD zip');
          
          // Extract using PowerShell (Windows built-in)
          await execAsync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${this.steamCmdDir}' -Force"`);
          console.log('Extracted SteamCMD');
          
          // Clean up zip file
          await fs.unlink(zipPath);
        } catch (error) {
          throw new Error('Failed to download SteamCMD. Please download it manually from https://developer.valvesoftware.com/wiki/SteamCMD');
        }
      } else {
        // For Linux, SteamCMD is typically installed via package manager
        throw new Error('Please install SteamCMD using your package manager: sudo apt install steamcmd');
      }
    } catch (error) {
      console.error('Failed to download SteamCMD:', error);
      throw error;
    }
  }

  async verifySteamCMD() {
    try {
      console.log('Verifying SteamCMD installation...');
      
      // Run SteamCMD with a simple command to verify it works
      const result = await this.runSteamCMD(['+quit']);
      
      if (result.success) {
        console.log('SteamCMD verification successful');
        return true;
      } else {
        throw new Error('SteamCMD verification failed');
      }
    } catch (error) {
      console.error('SteamCMD verification error:', error);
      throw error;
    }
  }

  async installGame(appId, installPath) {
    try {
      if (!this.isInitialized) {
        throw new Error('Steam service not initialized. Please run initialize() first.');
      }

      // Validate inputs
      if (!appId || typeof appId !== 'string') {
        throw new Error('Invalid Steam app ID provided');
      }

      if (!installPath || typeof installPath !== 'string') {
        throw new Error('Invalid installation path provided');
      }

      // Check if app is supported
      const gameInfo = Object.values(this.dedicatedServerApps).find(app => app.appId === appId);
      if (!gameInfo) {
        throw new Error(`Steam app ${appId} is not supported or not a dedicated server`);
      }

      console.log(`Installing ${gameInfo.name} (${appId}) to ${installPath}`);

      // Ensure install directory exists and is writable
      try {
        await fs.mkdir(installPath, { recursive: true });
        // Test write permissions
        const testFile = path.join(installPath, '.write-test');
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
      } catch (error) {
        throw new Error(`Cannot write to installation directory: ${error.message}`);
      }

      // Track active installation
      const installId = `${appId}_${Date.now()}`;
      this.activeInstalls.set(installId, {
        appId,
        installPath,
        status: 'downloading',
        startTime: Date.now(),
        gameInfo
      });

      // Build SteamCMD command
      const commands = [
        '+force_install_dir', `"${installPath}"`,
        '+login', 'anonymous',
        '+app_update', appId, 'validate',
        '+quit'
      ];

      const result = await this.runSteamCMD(commands, (progress) => {
        // Update progress
        const install = this.activeInstalls.get(installId);
        if (install) {
          install.progress = progress;
        }
      });

      this.activeInstalls.delete(installId);

      if (result.success) {
        console.log(`Successfully installed ${appId} to ${installPath}`);
        return {
          success: true,
          appId: appId,
          installPath: installPath,
          output: result.output
        };
      } else {
        throw new Error(`Installation failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`Failed to install app ${appId}:`, error);
      throw error;
    }
  }

  async updateGame(appId, installPath) {
    return this.installGame(appId, installPath);
  }

  async runSteamCMD(commands, progressCallback = null) {
    return new Promise((resolve, reject) => {
      try {
        console.log(`Executing SteamCMD: ${this.steamCmdPath} ${commands.join(' ')}`);

        const process = spawn(this.steamCmdPath, commands, {
          cwd: this.steamCmdDir,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        process.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          console.log(`[SteamCMD] ${text.trim()}`);

          // Parse progress if callback provided
          if (progressCallback) {
            const progress = this.parseProgress(text);
            if (progress !== null) {
              progressCallback(progress);
            }
          }
        });

        process.stderr.on('data', (data) => {
          const text = data.toString();
          error += text;
          console.error(`[SteamCMD Error] ${text.trim()}`);
        });

        process.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              output: output,
              exitCode: code
            });
          } else {
            resolve({
              success: false,
              error: error || `Process exited with code ${code}`,
              output: output,
              exitCode: code
            });
          }
        });

        process.on('error', (err) => {
          reject(new Error(`Failed to start SteamCMD: ${err.message}`));
        });

        // Set timeout for long-running operations
        setTimeout(() => {
          if (!process.killed) {
            process.kill();
            reject(new Error('SteamCMD operation timed out'));
          }
        }, 30 * 60 * 1000); // 30 minutes timeout

      } catch (error) {
        reject(error);
      }
    });
  }

  parseProgress(output) {
    // Parse common SteamCMD progress patterns
    const progressRegex = /(\d+)%/;
    const downloadRegex = /downloading.*?(\d+\.?\d*)%/i;
    const updateRegex = /Update state.*?(\d+)%/i;

    let match = output.match(downloadRegex) || output.match(updateRegex) || output.match(progressRegex);
    
    if (match) {
      return parseFloat(match[1]);
    }

    // Check for completion indicators
    if (output.includes('Success! App') || output.includes('fully installed')) {
      return 100;
    }

    return null;
  }

  async validateGameInstallation(gameType, installPath) {
    try {
      const gameInfo = this.dedicatedServerApps[gameType];
      if (!gameInfo) {
        return { valid: false, error: `Unsupported game type: ${gameType}` };
      }

      // Check if installation directory exists
      try {
        const stats = await fs.stat(installPath);
        if (!stats.isDirectory()) {
          return { valid: false, error: 'Installation path is not a directory' };
        }
      } catch {
        return { valid: false, error: 'Installation directory not found' };
      }

      // Check if game executable exists
      const executablePath = path.join(installPath, gameInfo.executable);
      try {
        const execStats = await fs.stat(executablePath);
        
        // Calculate directory size (simplified)
        const totalSize = await this.calculateDirectorySize(installPath);
        
        return {
          valid: true,
          gameType: gameType,
          executable: executablePath,
          size: totalSize,
          modified: execStats.mtime,
          version: await this.getGameVersion(gameType, installPath)
        };
      } catch {
        return { 
          valid: false, 
          error: `Game executable not found: ${gameInfo.executable}` 
        };
      }
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async calculateDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          totalSize += await this.calculateDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.warn('Failed to calculate directory size:', error);
      return 0;
    }
  }

  async getGameVersion(gameType, installPath) {
    try {
      // Different games store version info differently
      switch (gameType) {
        case 'valheim':
          // Check for version in steam_appid.txt or other version files
          const appIdFile = path.join(installPath, 'steam_appid.txt');
          try {
            await fs.access(appIdFile);
            return 'Latest';
          } catch {
            return 'Unknown';
          }
          
        case 'rust':
        case 'cs2':
        case 'seven_days':
          return 'Latest';
          
        default:
          return 'Unknown';
      }
    } catch (error) {
      console.warn('Failed to get game version:', error);
      return 'Unknown';
    }
  }

  async getAvailableGames() {
    return Object.entries(this.dedicatedServerApps).map(([key, game]) => ({
      id: key,
      appId: game.appId,
      name: game.name,
      executable: game.executable,
      isInstalled: false,
      installPath: null
    }));
  }

  async searchSteamApps(searchTerm) {
    const filtered = Object.entries(this.dedicatedServerApps)
      .filter(([key, game]) => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(([key, game]) => ({
        id: key,
        appId: game.appId,
        name: game.name,
        type: 'dedicated_server'
      }));
    
    return filtered;
  }

  getSupportedGames() {
    return this.dedicatedServerApps;
  }

  getActiveInstalls() {
    return Array.from(this.activeInstalls.values());
  }

  getInstallProgress(appId) {
    for (const install of this.activeInstalls.values()) {
      if (install.appId === appId) {
        return install;
      }
    }
    return null;
  }

  async cancelInstallation(appId) {
    try {
      // Find and cancel active installation
      for (const [installId, install] of this.activeInstalls.entries()) {
        if (install.appId === appId) {
          install.status = 'cancelled';
          this.activeInstalls.delete(installId);
          console.log(`Cancelled installation of app ${appId}`);
          return { success: true };
        }
      }
      
      return { success: false, error: 'Installation not found' };
    } catch (error) {
      console.error(`Failed to cancel installation of ${appId}:`, error);
      throw error;
    }
  }

  async checkSteamCMDHealth() {
    try {
      if (!this.isInitialized) {
        return { healthy: false, error: 'Not initialized' };
      }

      // Check if SteamCMD executable exists
      await fs.access(this.steamCmdPath);
      
      // Try a simple command
      const result = await this.runSteamCMD(['+quit']);
      
      return { 
        healthy: result.success, 
        steamCmdPath: this.steamCmdPath,
        version: 'Latest' // SteamCMD doesn't have version info easily accessible
      };
    } catch (error) {
      return { 
        healthy: false, 
        error: error.message,
        steamCmdPath: this.steamCmdPath 
      };
    }
  }

  async downloadGameList() {
    try {
      // Get info about available apps (this would be more complex in real implementation)
      const commands = ['+login', 'anonymous', '+app_info_print', '896660', '+quit'];
      const result = await this.runSteamCMD(commands);
      
      if (result.success) {
        // Parse app info from output
        return this.parseAppInfo(result.output);
      }
      
      throw new Error('Failed to download game list');
    } catch (error) {
      console.error('Failed to download game list:', error);
      throw error;
    }
  }

  // Validation helpers
  validateGameConfiguration(gameId, config) {
    const gameInfo = this.dedicatedServerApps[gameId];
    if (!gameInfo) {
      throw new Error(`Unsupported game: ${gameId}`);
    }

    // Validate common server configuration
    if (config.port && (config.port < 1024 || config.port > 65535)) {
      throw new Error('Port must be between 1024 and 65535');
    }

    if (config.maxPlayers && (config.maxPlayers < 1 || config.maxPlayers > 200)) {
      throw new Error('Max players must be between 1 and 200');
    }

    // Game-specific validation
    switch (gameId) {
      case 'valheim':
        if (config.maxPlayers && config.maxPlayers > 10) {
          throw new Error('Valheim supports maximum 10 players');
        }
        break;
      case 'rust':
        if (config.maxPlayers && config.maxPlayers > 200) {
          throw new Error('Rust supports maximum 200 players');
        }
        break;
      case 'cs2':
        if (config.maxPlayers && config.maxPlayers > 32) {
          throw new Error('Counter-Strike 2 supports maximum 32 players');
        }
        break;
    }

    return true;
  }

  getSupportedGames() {
    return Object.keys(this.dedicatedServerApps);
  }

  getGameInfo(gameId) {
    return this.dedicatedServerApps[gameId] || null;
  }

  parseAppInfo(output) {
    // This would parse the app_info_print output in a real implementation
    // For now, return our supported games
    return Object.entries(this.dedicatedServerApps).map(([key, game]) => ({
      id: key,
      appId: game.appId,
      name: game.name,
      type: 'dedicated_server'
    }));
  }
}

module.exports = SteamService;