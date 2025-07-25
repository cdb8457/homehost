const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { promisify } = require('util');

const execAsync = promisify(exec);

class SteamService {
  constructor(store) {
    this.store = store;
    this.steamCmdPath = null;
    this.isInitialized = false;
    
    // Steam app IDs for supported dedicated servers
    this.dedicatedServerApps = {
      'valheim': {
        appId: '896660',
        name: 'Valheim Dedicated Server',
        executable: 'valheim_dedicated_server.exe'
      },
      'rust': {
        appId: '258550',
        name: 'Rust Dedicated Server',
        executable: 'RustDedicated.exe'
      },
      'cs2': {
        appId: '730',
        name: 'Counter-Strike 2 Dedicated Server',
        executable: 'cs2.exe'
      },
      'seven_days': {
        appId: '294420',
        name: '7 Days to Die Dedicated Server',
        executable: '7DaysToDieServer.exe'
      }
    };
  }

  async initialize(steamPath) {
    try {
      this.steamCmdPath = path.join(steamPath, 'steamcmd.exe');
      
      // Check if SteamCMD exists
      try {
        await fs.access(this.steamCmdPath);
        console.log('SteamCMD found at:', this.steamCmdPath);
      } catch (error) {
        // Download SteamCMD if not found
        console.log('SteamCMD not found, downloading...');
        await this.downloadSteamCmd(steamPath);
      }

      this.isInitialized = true;
      this.store.set('steamCmdPath', this.steamCmdPath);
      
      return { success: true, path: this.steamCmdPath };
    } catch (error) {
      console.error('Failed to initialize Steam service:', error);
      throw error;
    }
  }

  async downloadSteamCmd(installPath) {
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(installPath, { recursive: true });
      
      // This is a simplified version - in a real implementation,
      // you would download steamcmd.zip from Valve's servers
      const steamCmdUrl = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';
      
      console.log('Downloading SteamCMD from:', steamCmdUrl);
      console.log('To:', installPath);
      
      // For now, just create a placeholder file and show instructions
      const readmePath = path.join(installPath, 'STEAMCMD_INSTRUCTIONS.txt');
      const instructions = `
SteamCMD Download Instructions:

1. Download steamcmd.zip from: ${steamCmdUrl}
2. Extract it to this folder: ${installPath}
3. Run steamcmd.exe once to let it update itself
4. Restart HomeHost Desktop

The steamcmd.exe file should be located at: ${path.join(installPath, 'steamcmd.exe')}
`;
      
      await fs.writeFile(readmePath, instructions);
      
      throw new Error(`Please download SteamCMD manually. Instructions saved to: ${readmePath}`);
    } catch (error) {
      console.error('Failed to download SteamCMD:', error);
      throw error;
    }
  }

  async installGame(appId, installPath) {
    if (!this.isInitialized) {
      throw new Error('Steam service not initialized');
    }

    try {
      console.log(`Installing Steam app ${appId} to ${installPath}`);
      
      // Create install directory
      await fs.mkdir(installPath, { recursive: true });
      
      // Build SteamCMD command
      const commands = [
        'login anonymous',
        `force_install_dir "${installPath}"`,
        `app_update ${appId} validate`,
        'quit'
      ];
      
      const commandScript = commands.join('\n');
      
      return new Promise((resolve, reject) => {
        const steamCmd = spawn(this.steamCmdPath, ['+runscript', '-'], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        steamCmd.stdout.on('data', (data) => {
          const text = data.toString();
          output += text;
          console.log(`[SteamCMD] ${text}`);
        });

        steamCmd.stderr.on('data', (data) => {
          const text = data.toString();
          errorOutput += text;
          console.error(`[SteamCMD Error] ${text}`);
        });

        steamCmd.on('error', (error) => {
          console.error('SteamCMD spawn error:', error);
          reject(error);
        });

        steamCmd.on('close', (code) => {
          if (code === 0) {
            console.log(`Steam app ${appId} installed successfully`);
            resolve({
              success: true,
              appId: appId,
              installPath: installPath,
              output: output
            });
          } else {
            const error = new Error(`SteamCMD exited with code ${code}. Error: ${errorOutput}`);
            console.error('SteamCMD installation failed:', error);
            reject(error);
          }
        });

        // Send commands to SteamCMD
        steamCmd.stdin.write(commandScript);
        steamCmd.stdin.end();
      });
    } catch (error) {
      console.error('Failed to install game:', error);
      throw error;
    }
  }

  async updateGame(appId, installPath) {
    // Same as install - SteamCMD will update if newer version available
    return this.installGame(appId, installPath);
  }

  async validateGameInstallation(gameType, installPath) {
    try {
      const gameInfo = this.dedicatedServerApps[gameType];
      if (!gameInfo) {
        throw new Error(`Unsupported game type: ${gameType}`);
      }

      const executablePath = path.join(installPath, gameInfo.executable);
      await fs.access(executablePath);
      
      // Check if it's a valid executable
      const stats = await fs.stat(executablePath);
      if (!stats.isFile()) {
        throw new Error(`${gameInfo.executable} is not a valid file`);
      }

      return {
        valid: true,
        gameType: gameType,
        executable: executablePath,
        size: stats.size,
        modified: stats.mtime
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  async getAvailableGames() {
    return Object.entries(this.dedicatedServerApps).map(([key, game]) => ({
      id: key,
      appId: game.appId,
      name: game.name,
      executable: game.executable,
      isInstalled: false, // This would be checked against local installations
      installPath: null
    }));
  }

  async getInstalledGames() {
    const installedGames = [];
    const savedInstallations = this.store.get('gameInstallations', {});
    
    for (const [gameType, installPath] of Object.entries(savedInstallations)) {
      const validation = await this.validateGameInstallation(gameType, installPath);
      if (validation.valid) {
        installedGames.push({
          gameType: gameType,
          installPath: installPath,
          ...validation
        });
      }
    }
    
    return installedGames;
  }

  async searchSteamApps(searchTerm) {
    // This would require Steam Web API integration
    // For now, return filtered list of known dedicated servers
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

  async getSteamAppInfo(appId) {
    // This would integrate with Steam Web API to get app information
    // For now, return static info for known apps
    const knownApp = Object.values(this.dedicatedServerApps)
      .find(app => app.appId === appId);
    
    if (knownApp) {
      return {
        appId: appId,
        name: knownApp.name,
        type: 'Tool', // Dedicated servers are typically categorized as Tools
        oslist: 'windows',
        supported: true
      };
    }
    
    return null;
  }

  isGameSupported(appId) {
    return Object.values(this.dedicatedServerApps)
      .some(app => app.appId === appId);
  }

  getSupportedGames() {
    return this.dedicatedServerApps;
  }

  async checkSteamCmdUpdate() {
    if (!this.isInitialized) {
      throw new Error('Steam service not initialized');
    }

    try {
      // Run SteamCMD with quit command to trigger auto-update
      const result = await execAsync(`"${this.steamCmdPath}" +quit`);
      console.log('SteamCMD update check completed');
      return { success: true, output: result.stdout };
    } catch (error) {
      console.error('SteamCMD update failed:', error);
      throw error;
    }
  }
}

module.exports = SteamService;