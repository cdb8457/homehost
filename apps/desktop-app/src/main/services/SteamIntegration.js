const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

class SteamIntegration extends EventEmitter {
  constructor(store, steamService) {
    super();
    this.store = store;
    this.steamService = steamService;
    this.isInitialized = false;
    this.gameLibrary = new Map();
    this.downloadQueue = [];
    this.activeDownloads = new Map();
  }

  async initialize() {
    try {
      console.log('Initializing Steam integration...');
      
      // Check if Steam service is ready
      if (!this.steamService.isInitialized) {
        const steamPath = this.store.get('steamPath');
        if (steamPath) {
          await this.steamService.initialize(steamPath);
        } else {
          throw new Error('Steam path not configured');
        }
      }

      // Load game library
      await this.loadGameLibrary();
      
      this.isInitialized = true;
      this.emit('initialized');
      
      console.log('Steam integration initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize Steam integration:', error);
      throw error;
    }
  }

  async loadGameLibrary() {
    try {
      // Get supported games from SteamService
      const supportedGames = this.steamService.getSupportedGames();
      
      // Check installation status for each game
      for (const [gameId, gameInfo] of Object.entries(supportedGames)) {
        const installPath = this.store.get(`gameInstalls.${gameId}.path`);
        const isInstalled = installPath ? await this.verifyInstallation(gameId, installPath) : false;
        
        this.gameLibrary.set(gameId, {
          ...gameInfo,
          id: gameId,
          isInstalled,
          installPath: isInstalled ? installPath : null,
          lastUpdated: this.store.get(`gameInstalls.${gameId}.lastUpdated`),
          version: this.store.get(`gameInstalls.${gameId}.version`)
        });
      }

      console.log(`Loaded ${this.gameLibrary.size} games in library`);
    } catch (error) {
      console.error('Failed to load game library:', error);
      throw error;
    }
  }

  async verifyInstallation(gameId, installPath) {
    try {
      const validation = await this.steamService.validateGameInstallation(gameId, installPath);
      return validation.valid;
    } catch (error) {
      console.warn(`Failed to verify ${gameId} installation:`, error);
      return false;
    }
  }

  async installGame(gameId, customInstallPath = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('Steam integration not initialized');
      }

      const gameInfo = this.gameLibrary.get(gameId);
      if (!gameInfo) {
        throw new Error(`Game ${gameId} not found in library`);
      }

      if (gameInfo.isInstalled) {
        throw new Error(`Game ${gameId} is already installed`);
      }

      // Determine install path
      const defaultPath = this.store.get('defaultInstallPath', 'C:\\GameServers');
      const installPath = customInstallPath || path.join(defaultPath, gameId);

      // Add to download queue
      const downloadTask = {
        gameId,
        appId: gameInfo.appId,
        installPath,
        status: 'queued',
        progress: 0,
        startTime: Date.now()
      };

      this.downloadQueue.push(downloadTask);
      this.emit('download-queued', downloadTask);

      // Start download if not already running
      if (this.activeDownloads.size === 0) {
        await this.processDownloadQueue();
      }

      return downloadTask;
    } catch (error) {
      console.error(`Failed to install game ${gameId}:`, error);
      throw error;
    }
  }

  async processDownloadQueue() {
    if (this.downloadQueue.length === 0 || this.activeDownloads.size > 0) {
      return;
    }

    const task = this.downloadQueue.shift();
    this.activeDownloads.set(task.gameId, task);

    try {
      task.status = 'downloading';
      this.emit('download-started', task);

      // Use SteamService to install the game
      const result = await this.steamService.installGame(task.appId, task.installPath);

      if (result.success) {
        task.status = 'completed';
        task.progress = 100;
        task.endTime = Date.now();

        // Update game library
        const gameInfo = this.gameLibrary.get(task.gameId);
        gameInfo.isInstalled = true;
        gameInfo.installPath = task.installPath;
        gameInfo.lastUpdated = new Date().toISOString();

        // Save to store
        this.store.set(`gameInstalls.${task.gameId}`, {
          path: task.installPath,
          lastUpdated: gameInfo.lastUpdated,
          version: '1.0.0' // Would get actual version from Steam
        });

        this.emit('download-completed', task);
        console.log(`Successfully installed ${task.gameId}`);
      } else {
        throw new Error('Installation failed');
      }
    } catch (error) {
      task.status = 'failed';
      task.error = error.message;
      this.emit('download-failed', task);
      console.error(`Failed to install ${task.gameId}:`, error);
    } finally {
      this.activeDownloads.delete(task.gameId);
      
      // Process next item in queue
      if (this.downloadQueue.length > 0) {
        setTimeout(() => this.processDownloadQueue(), 1000);
      }
    }
  }

  async updateGame(gameId) {
    try {
      const gameInfo = this.gameLibrary.get(gameId);
      if (!gameInfo || !gameInfo.isInstalled) {
        throw new Error(`Game ${gameId} is not installed`);
      }

      console.log(`Updating ${gameId}...`);
      
      // Use SteamService to update the game
      const result = await this.steamService.updateGame(gameInfo.appId, gameInfo.installPath);
      
      if (result.success) {
        gameInfo.lastUpdated = new Date().toISOString();
        this.store.set(`gameInstalls.${gameId}.lastUpdated`, gameInfo.lastUpdated);
        
        this.emit('game-updated', { gameId, gameInfo });
        console.log(`Successfully updated ${gameId}`);
        return result;
      }
      
      throw new Error('Update failed');
    } catch (error) {
      console.error(`Failed to update ${gameId}:`, error);
      throw error;
    }
  }

  async uninstallGame(gameId) {
    try {
      const gameInfo = this.gameLibrary.get(gameId);
      if (!gameInfo || !gameInfo.isInstalled) {
        throw new Error(`Game ${gameId} is not installed`);
      }

      console.log(`Uninstalling ${gameId}...`);

      // Remove installation directory
      if (gameInfo.installPath) {
        try {
          await fs.rmdir(gameInfo.installPath, { recursive: true });
        } catch (error) {
          console.warn(`Failed to remove directory ${gameInfo.installPath}:`, error);
        }
      }

      // Update game library
      gameInfo.isInstalled = false;
      gameInfo.installPath = null;
      gameInfo.lastUpdated = null;

      // Remove from store
      this.store.delete(`gameInstalls.${gameId}`);

      this.emit('game-uninstalled', { gameId, gameInfo });
      console.log(`Successfully uninstalled ${gameId}`);
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to uninstall ${gameId}:`, error);
      throw error;
    }
  }

  getGameLibrary() {
    return Array.from(this.gameLibrary.values());
  }

  getGame(gameId) {
    return this.gameLibrary.get(gameId);
  }

  getInstalledGames() {
    return Array.from(this.gameLibrary.values()).filter(game => game.isInstalled);
  }

  getDownloadQueue() {
    return [...this.downloadQueue];
  }

  getActiveDownloads() {
    return Array.from(this.activeDownloads.values());
  }

  async checkForUpdates() {
    try {
      const installedGames = this.getInstalledGames();
      const updates = [];

      for (const game of installedGames) {
        // In a real implementation, this would check Steam for updates
        // For now, we'll simulate update checking
        const needsUpdate = Math.random() > 0.8; // 20% chance of needing update
        
        if (needsUpdate) {
          updates.push({
            gameId: game.id,
            currentVersion: game.version || '1.0.0',
            availableVersion: '1.0.1',
            updateSize: Math.floor(Math.random() * 1000) + 100 // MB
          });
        }
      }

      this.emit('updates-available', updates);
      return updates;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      throw error;
    }
  }

  async searchSteamStore(query) {
    try {
      // This would integrate with Steam Web API in a real implementation
      // For now, return filtered results from supported games
      const results = this.steamService.searchSteamApps(query);
      return results;
    } catch (error) {
      console.error('Failed to search Steam store:', error);
      throw error;
    }
  }

  getInstallationStats() {
    const games = Array.from(this.gameLibrary.values());
    const installed = games.filter(g => g.isInstalled).length;
    const totalSize = games
      .filter(g => g.isInstalled)
      .reduce((total, game) => total + (game.size || 0), 0);

    return {
      totalGames: games.length,
      installedGames: installed,
      availableGames: games.length - installed,
      totalInstallSize: totalSize,
      activeDownloads: this.activeDownloads.size,
      queuedDownloads: this.downloadQueue.length
    };
  }

  async getDiskUsage() {
    try {
      const installedGames = this.getInstalledGames();
      const usage = [];

      for (const game of installedGames) {
        if (game.installPath) {
          try {
            const stats = await fs.stat(game.installPath);
            // This is simplified - would need recursive directory size calculation
            usage.push({
              gameId: game.id,
              path: game.installPath,
              size: stats.size || 0,
              lastModified: stats.mtime
            });
          } catch (error) {
            console.warn(`Failed to get disk usage for ${game.id}:`, error);
          }
        }
      }

      return usage;
    } catch (error) {
      console.error('Failed to get disk usage:', error);
      throw error;
    }
  }

  cancelDownload(gameId) {
    try {
      // Remove from queue
      this.downloadQueue = this.downloadQueue.filter(task => task.gameId !== gameId);
      
      // Cancel active download
      const activeDownload = this.activeDownloads.get(gameId);
      if (activeDownload) {
        activeDownload.status = 'cancelled';
        this.activeDownloads.delete(gameId);
        this.emit('download-cancelled', activeDownload);
      }

      return { success: true };
    } catch (error) {
      console.error(`Failed to cancel download for ${gameId}:`, error);
      throw error;
    }
  }
}

module.exports = SteamIntegration;