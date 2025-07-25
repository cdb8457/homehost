const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const psTree = require('ps-tree');
const { EventEmitter } = require('events');

class GameServerManager extends EventEmitter {
  constructor(store, serverMonitor = null) {
    super();
    this.store = store;
    this.serverMonitor = serverMonitor;
    this.servers = new Map();
    this.processes = new Map();
    this.serverLogs = new Map(); // Store recent logs for each server
    this.logStreams = new Map(); // Store log file streams
    
    // Load saved servers from storage
    this.loadServers();
    
    // Supported games configuration
    this.supportedGames = {
      'valheim': {
        name: 'Valheim',
        executable: 'valheim_dedicated_server.exe',
        defaultPort: 2456,
        steamAppId: '896660',
        arguments: ['-name', '{serverName}', '-port', '{port}', '-world', '{worldName}', '-password', '{password}']
      },
      'rust': {
        name: 'Rust',
        executable: 'RustDedicated.exe',
        defaultPort: 28015,
        steamAppId: '258550',
        arguments: ['-batchmode', '-nographics', '+server.hostname', '{serverName}', '+server.port', '{port}', '+server.maxplayers', '{maxPlayers}']
      },
      'cs2': {
        name: 'Counter-Strike 2',
        executable: 'cs2.exe',
        defaultPort: 27015,
        steamAppId: '730',
        arguments: ['-dedicated', '+map', '{map}', '+maxplayers', '{maxPlayers}', '-port', '{port}']
      },
      'seven_days': {
        name: '7 Days to Die',
        executable: '7DaysToDieServer.exe',
        defaultPort: 26900,
        steamAppId: '294420',
        arguments: ['-configfile=serverconfig.xml', '-port={port}']
      },
      'motor_town': {
        name: 'MotorTown',
        executable: 'MotorTownServer.exe',
        defaultPort: 27016,
        steamAppId: '1090000', // Placeholder
        arguments: ['-port', '{port}', '-name', '{serverName}']
      }
    };
  }

  async loadServers() {
    try {
      const savedServers = this.store.get('servers', {});
      for (const [id, serverData] of Object.entries(savedServers)) {
        this.servers.set(id, {
          ...serverData,
          status: 'stopped', // Reset all servers to stopped on app start
          lastStarted: null,
          currentPlayers: 0
        });
      }
      console.log(`Loaded ${this.servers.size} servers from storage`);
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  }

  saveServers() {
    try {
      const serversData = {};
      for (const [id, server] of this.servers.entries()) {
        serversData[id] = {
          ...server,
          // Don't save runtime data
          status: 'stopped',
          lastStarted: null,
          currentPlayers: 0
        };
      }
      this.store.set('servers', serversData);
    } catch (error) {
      console.error('Failed to save servers:', error);
    }
  }

  async deployServer(gameConfig) {
    try {
      const serverId = uuidv4();
      const gameType = gameConfig.gameType.toLowerCase();
      
      if (!this.supportedGames[gameType]) {
        throw new Error(`Unsupported game type: ${gameType}`);
      }

      const gameInfo = this.supportedGames[gameType];
      
      // Create server configuration
      const server = {
        id: serverId,
        name: gameConfig.name || `${gameInfo.name} Server`,
        gameType: gameType,
        gameName: gameInfo.name,
        port: gameConfig.port || gameInfo.defaultPort,
        maxPlayers: gameConfig.maxPlayers || 10,
        password: gameConfig.password || '',
        worldName: gameConfig.worldName || 'Dedicated',
        map: gameConfig.map || 'de_dust2',
        installPath: gameConfig.installPath || '',
        status: 'stopped',
        createdAt: new Date().toISOString(),
        lastStarted: null,
        currentPlayers: 0,
        configuration: gameConfig
      };

      // Validate installation path
      if (!server.installPath) {
        throw new Error('Installation path is required');
      }

      const executablePath = path.join(server.installPath, gameInfo.executable);
      try {
        await fs.access(executablePath);
      } catch (error) {
        throw new Error(`Game executable not found: ${executablePath}`);
      }

      // Store the server
      this.servers.set(serverId, server);
      this.saveServers();

      console.log(`Server deployed: ${server.name} (${serverId})`);
      return server;
    } catch (error) {
      console.error('Failed to deploy server:', error);
      throw error;
    }
  }

  async startServer(serverId) {
    try {
      const server = this.servers.get(serverId);
      if (!server) {
        throw new Error(`Server not found: ${serverId}`);
      }

      if (server.status === 'running') {
        throw new Error(`Server ${server.name} is already running`);
      }

      const gameInfo = this.supportedGames[server.gameType];
      const executablePath = path.join(server.installPath, gameInfo.executable);

      // Build command line arguments
      const args = gameInfo.arguments.map(arg => {
        return arg
          .replace('{serverName}', server.name)
          .replace('{port}', server.port.toString())
          .replace('{worldName}', server.worldName)
          .replace('{password}', server.password)
          .replace('{maxPlayers}', server.maxPlayers.toString())
          .replace('{map}', server.map || 'de_dust2');
      });

      console.log(`Starting server: ${executablePath} ${args.join(' ')}`);

      // Spawn the game server process
      const process = spawn(executablePath, args, {
        cwd: server.installPath,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Handle process events
      process.on('spawn', () => {
        console.log(`Server ${server.name} started with PID: ${process.pid}`);
        server.status = 'running';
        server.lastStarted = new Date().toISOString();
        this.processes.set(serverId, process);
        
        // Start monitoring this server process
        if (this.serverMonitor) {
          this.serverMonitor.startServerMonitoring(serverId, process, server);
        }
        
        this.saveServers();
      });

      process.on('error', (error) => {
        console.error(`Server ${server.name} error:`, error);
        server.status = 'error';
        this.processes.delete(serverId);
        
        // Stop monitoring
        if (this.serverMonitor) {
          this.serverMonitor.stopServerMonitoring(serverId);
        }
        
        this.saveServers();
      });

      process.on('exit', (code, signal) => {
        console.log(`Server ${server.name} exited with code ${code}, signal ${signal}`);
        server.status = 'stopped';
        server.currentPlayers = 0;
        this.processes.delete(serverId);
        
        // Stop monitoring
        if (this.serverMonitor) {
          this.serverMonitor.stopServerMonitoring(serverId);
        }
        
        this.saveServers();
      });

      // Capture output for logging
      process.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[${server.name}] ${output}`);
        
        // Store logs and emit events
        this.addServerLog(serverId, 'stdout', output);
        
        // Parse player count from output if possible
        this.parseServerOutput(serverId, output);
      });

      process.stderr.on('data', (data) => {
        const error = data.toString();
        console.error(`[${server.name}] ERROR: ${error}`);
        
        // Store error logs
        this.addServerLog(serverId, 'stderr', error);
      });

      return server;
    } catch (error) {
      console.error('Failed to start server:', error);
      throw error;
    }
  }

  async stopServer(serverId) {
    try {
      const server = this.servers.get(serverId);
      if (!server) {
        throw new Error(`Server not found: ${serverId}`);
      }

      const process = this.processes.get(serverId);
      if (!process) {
        server.status = 'stopped';
        return server;
      }

      console.log(`Stopping server: ${server.name}`);
      
      // Stop monitoring first
      if (this.serverMonitor) {
        this.serverMonitor.stopServerMonitoring(serverId);
      }
      
      // Gracefully kill the process and its children
      this.killProcessTree(process.pid);
      
      server.status = 'stopping';
      this.saveServers();

      return server;
    } catch (error) {
      console.error('Failed to stop server:', error);
      throw error;
    }
  }

  killProcessTree(pid) {
    psTree(pid, (err, children) => {
      if (!err && children.length > 0) {
        children.forEach(child => {
          try {
            process.kill(child.PID, 'SIGTERM');
          } catch (killError) {
            console.warn(`Failed to kill child process ${child.PID}:`, killError);
          }
        });
      }
      
      try {
        process.kill(pid, 'SIGTERM');
      } catch (killError) {
        console.warn(`Failed to kill main process ${pid}:`, killError);
      }
    });
  }

  parseServerOutput(serverId, output) {
    const server = this.servers.get(serverId);
    if (!server) return;

    // Parse common server status patterns
    const playerCountRegex = /players?\s*:\s*(\d+)\/(\d+)/i;
    const match = output.match(playerCountRegex);
    
    if (match) {
      server.currentPlayers = parseInt(match[1]);
      server.maxPlayers = parseInt(match[2]);
    }

    // Game-specific parsing
    switch (server.gameType) {
      case 'valheim':
        if (output.includes('Game server connected')) {
          server.status = 'running';
        }
        break;
      
      case 'rust':
        if (output.includes('Server startup complete')) {
          server.status = 'running';
        }
        break;
      
      case 'cs2':
        if (output.includes('Server is hibernating')) {
          server.status = 'running';
        }
        break;
    }
  }

  stopAllServers() {
    console.log('Stopping all servers...');
    for (const [serverId, process] of this.processes.entries()) {
      try {
        // Stop monitoring
        if (this.serverMonitor) {
          this.serverMonitor.stopServerMonitoring(serverId);
        }
        
        this.killProcessTree(process.pid);
        const server = this.servers.get(serverId);
        if (server) {
          server.status = 'stopped';
          server.currentPlayers = 0;
        }
      } catch (error) {
        console.error(`Failed to stop server ${serverId}:`, error);
      }
    }
    this.processes.clear();
    this.saveServers();
  }

  getServers() {
    return Array.from(this.servers.values());
  }

  getServer(serverId) {
    return this.servers.get(serverId);
  }

  deleteServer(serverId) {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    if (server.status === 'running') {
      this.stopServer(serverId);
    }

    this.servers.delete(serverId);
    this.saveServers();
    
    return true;
  }

  getSupportedGames() {
    return this.supportedGames;
  }

  // === LOG MANAGEMENT ===

  addServerLog(serverId, type, message) {
    if (!this.serverLogs.has(serverId)) {
      this.serverLogs.set(serverId, []);
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      type, // 'stdout', 'stderr', 'system'
      message: message.trim(),
      id: Date.now() + Math.random()
    };

    const logs = this.serverLogs.get(serverId);
    logs.push(logEntry);

    // Keep only last 1000 log entries per server
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    // Emit log event for real-time viewing
    this.emit('server-log', { serverId, log: logEntry });

    // Save to log file
    this.writeLogToFile(serverId, logEntry);
  }

  async writeLogToFile(serverId, logEntry) {
    try {
      const server = this.servers.get(serverId);
      if (!server) return;

      const logDir = path.join(server.installPath, 'logs');
      await fs.mkdir(logDir, { recursive: true });

      const logFile = path.join(logDir, `homehost-${new Date().toISOString().split('T')[0]}.log`);
      const logLine = `[${logEntry.timestamp}] [${logEntry.type.toUpperCase()}] ${logEntry.message}\n`;

      await fs.appendFile(logFile, logLine);
    } catch (error) {
      console.warn('Failed to write log to file:', error);
    }
  }

  getServerLogs(serverId, limit = 100) {
    const logs = this.serverLogs.get(serverId) || [];
    return logs.slice(-limit);
  }

  clearServerLogs(serverId) {
    this.serverLogs.set(serverId, []);
    this.emit('logs-cleared', { serverId });
  }

  async getLogFiles(serverId) {
    try {
      const server = this.servers.get(serverId);
      if (!server) throw new Error('Server not found');

      const logDir = path.join(server.installPath, 'logs');
      
      try {
        const files = await fs.readdir(logDir);
        const logFiles = [];

        for (const file of files) {
          if (file.endsWith('.log')) {
            const filePath = path.join(logDir, file);
            const stats = await fs.stat(filePath);
            logFiles.push({
              name: file,
              path: filePath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        }

        return logFiles.sort((a, b) => b.modified - a.modified);
      } catch (error) {
        return []; // No logs directory yet
      }
    } catch (error) {
      console.error('Failed to get log files:', error);
      throw error;
    }
  }

  // === SERVER CONSOLE COMMANDS ===

  async sendServerCommand(serverId, command) {
    try {
      const process = this.processes.get(serverId);
      if (!process) {
        throw new Error('Server is not running');
      }

      // Add system log entry for the command
      this.addServerLog(serverId, 'system', `Command sent: ${command}`);

      // Send command to server process
      process.stdin.write(`${command}\n`);

      return { success: true, command };
    } catch (error) {
      console.error('Failed to send server command:', error);
      throw error;
    }
  }

  // === CONFIGURATION MANAGEMENT ===

  async getServerConfig(serverId) {
    try {
      const server = this.servers.get(serverId);
      if (!server) throw new Error('Server not found');

      const configFiles = await this.getConfigFiles(serverId);
      return configFiles;
    } catch (error) {
      console.error('Failed to get server config:', error);
      throw error;
    }
  }

  async getConfigFiles(serverId) {
    try {
      const server = this.servers.get(serverId);
      if (!server) throw new Error('Server not found');

      const configPatterns = this.getConfigPatterns(server.gameType);
      const configFiles = [];

      for (const pattern of configPatterns) {
        const configPath = path.join(server.installPath, pattern.path);
        
        try {
          await fs.access(configPath);
          const stats = await fs.stat(configPath);
          
          configFiles.push({
            name: pattern.name,
            path: configPath,
            relativePath: pattern.path,
            description: pattern.description,
            size: stats.size,
            modified: stats.mtime,
            editable: pattern.editable
          });
        } catch {
          // File doesn't exist, skip
        }
      }

      return configFiles;
    } catch (error) {
      console.error('Failed to get config files:', error);
      throw error;
    }
  }

  getConfigPatterns(gameType) {
    const patterns = {
      'valheim': [
        {
          name: 'Server Config',
          path: 'start_server.bat',
          description: 'Server startup configuration',
          editable: true
        },
        {
          name: 'World Data',
          path: 'worlds',
          description: 'World save files',
          editable: false
        }
      ],
      'rust': [
        {
          name: 'Server Config',
          path: 'server.cfg',
          description: 'Main server configuration',
          editable: true
        },
        {
          name: 'Users Config', 
          path: 'users.cfg',
          description: 'User permissions and roles',
          editable: true
        }
      ],
      'cs2': [
        {
          name: 'Server Config',
          path: 'game/csgo/cfg/server.cfg',
          description: 'Server configuration file',
          editable: true
        },
        {
          name: 'Game Mode Config',
          path: 'game/csgo/cfg/gamemode_competitive.cfg',
          description: 'Competitive game mode settings',
          editable: true
        }
      ],
      'seven_days': [
        {
          name: 'Server Config',
          path: 'serverconfig.xml',
          description: 'Main server configuration',
          editable: true
        },
        {
          name: 'Admin Config',
          path: 'serveradmin.xml',
          description: 'Administrator settings',
          editable: true
        }
      ]
    };

    return patterns[gameType] || [];
  }

  async readConfigFile(serverId, filePath) {
    try {
      const server = this.servers.get(serverId);
      if (!server) throw new Error('Server not found');

      // Security check - ensure file is within server directory
      const resolvedPath = path.resolve(filePath);
      const serverPath = path.resolve(server.installPath);
      
      if (!resolvedPath.startsWith(serverPath)) {
        throw new Error('Access denied - file outside server directory');
      }

      const content = await fs.readFile(resolvedPath, 'utf8');
      return { content, path: resolvedPath };
    } catch (error) {
      console.error('Failed to read config file:', error);
      throw error;
    }
  }

  async writeConfigFile(serverId, filePath, content) {
    try {
      const server = this.servers.get(serverId);
      if (!server) throw new Error('Server not found');

      // Security check
      const resolvedPath = path.resolve(filePath);
      const serverPath = path.resolve(server.installPath);
      
      if (!resolvedPath.startsWith(serverPath)) {
        throw new Error('Access denied - file outside server directory');
      }

      // Create backup before writing
      await this.backupConfigFile(resolvedPath);

      await fs.writeFile(resolvedPath, content, 'utf8');
      
      this.addServerLog(serverId, 'system', `Configuration file updated: ${path.basename(filePath)}`);
      
      return { success: true, path: resolvedPath };
    } catch (error) {
      console.error('Failed to write config file:', error);
      throw error;
    }
  }

  async backupConfigFile(filePath) {
    try {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      await fs.copyFile(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn('Failed to create config backup:', error);
    }
  }

  // === BACKUP AND RESTORE ===

  async createServerBackup(serverId, name) {
    try {
      const server = this.servers.get(serverId);
      if (!server) throw new Error('Server not found');

      const backupName = name || `backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      const backupDir = path.join(server.installPath, 'backups');
      const backupPath = path.join(backupDir, backupName);

      await fs.mkdir(backupDir, { recursive: true });

      // Copy important files and directories
      const itemsToBackup = this.getBackupItems(server.gameType);
      
      for (const item of itemsToBackup) {
        const sourcePath = path.join(server.installPath, item);
        const destPath = path.join(backupPath, item);
        
        try {
          await this.copyRecursive(sourcePath, destPath);
        } catch (error) {
          console.warn(`Failed to backup ${item}:`, error);
        }
      }

      // Create backup metadata
      const metadata = {
        name: backupName,
        serverId,
        serverName: server.name,
        gameType: server.gameType,
        created: new Date().toISOString(),
        version: '1.0'
      };

      await fs.writeFile(
        path.join(backupPath, 'backup-info.json'),
        JSON.stringify(metadata, null, 2)
      );

      this.addServerLog(serverId, 'system', `Backup created: ${backupName}`);

      return {
        name: backupName,
        path: backupPath,
        created: metadata.created
      };
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  getBackupItems(gameType) {
    const items = {
      'valheim': ['worlds', '*.cfg', '*.txt'],
      'rust': ['server', '*.cfg', '*.txt', 'saves'],
      'cs2': ['game/csgo/cfg', 'game/csgo/maps', '*.cfg'],
      'seven_days': ['Data', '*.xml', '*.txt', 'Saves']
    };

    return items[gameType] || ['*.cfg', '*.xml', '*.txt', 'saves', 'worlds'];
  }

  async copyRecursive(src, dest) {
    const stats = await fs.stat(src);
    
    if (stats.isDirectory()) {
      await fs.mkdir(dest, { recursive: true });
      const files = await fs.readdir(src);
      
      for (const file of files) {
        await this.copyRecursive(
          path.join(src, file),
          path.join(dest, file)
        );
      }
    } else {
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.copyFile(src, dest);
    }
  }

  async getServerBackups(serverId) {
    try {
      const server = this.servers.get(serverId);
      if (!server) throw new Error('Server not found');

      const backupDir = path.join(server.installPath, 'backups');
      
      try {
        const backups = [];
        const items = await fs.readdir(backupDir);
        
        for (const item of items) {
          const backupPath = path.join(backupDir, item);
          const stats = await fs.stat(backupPath);
          
          if (stats.isDirectory()) {
            try {
              const metadataPath = path.join(backupPath, 'backup-info.json');
              const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
              
              backups.push({
                ...metadata,
                path: backupPath,
                size: await this.getDirectorySize(backupPath)
              });
            } catch {
              // No metadata file, create basic info
              backups.push({
                name: item,
                path: backupPath,
                created: stats.birthtime.toISOString(),
                size: await this.getDirectorySize(backupPath)
              });
            }
          }
        }
        
        return backups.sort((a, b) => new Date(b.created) - new Date(a.created));
      } catch (error) {
        return []; // No backups directory
      }
    } catch (error) {
      console.error('Failed to get server backups:', error);
      throw error;
    }
  }

  async getDirectorySize(dirPath) {
    try {
      let totalSize = 0;
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          totalSize += await this.getDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
      
      return totalSize;
    } catch (error) {
      return 0;
    }
  }
}

module.exports = GameServerManager;