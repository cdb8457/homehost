const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { EventEmitter } = require('events');
const { v4: uuidv4 } = require('uuid');

class SignalRService extends EventEmitter {
  constructor(store, rateLimitingService = null) {
    super();
    this.store = store;
    this.rateLimitingService = rateLimitingService;
    this.app = express();
    this.server = null;
    this.io = null;
    this.connectedClients = new Map();
    this.devicePairings = new Map();
    this.isRunning = false;
    this.port = 3456; // Default port for SignalR server
    
    this.setupExpress();
  }

  setupExpress() {
    // Enable CORS for web clients
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:3012', 'https://homehost.io'],
      credentials: true
    }));
    
    this.app.use(express.json());
    
    // Apply rate limiting middleware if available
    if (this.rateLimitingService) {
      this.app.use('/health', this.rateLimitingService.createHTTPMiddleware('/health'));
      this.app.use('/pair', this.rateLimitingService.createHTTPMiddleware('/pair'));
      this.app.use('/device-info', this.rateLimitingService.createHTTPMiddleware('/device-info'));
    }
    
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        connectedClients: this.connectedClients.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      });
    });

    // Device pairing endpoint
    this.app.post('/pair', (req, res) => {
      const { deviceName, deviceType } = req.body;
      
      if (!deviceName || !deviceType) {
        return res.status(400).json({ error: 'Device name and type are required' });
      }

      const pairingCode = this.generatePairingCode();
      const pairingId = uuidv4();
      
      this.devicePairings.set(pairingId, {
        id: pairingId,
        deviceName,
        deviceType,
        pairingCode,
        created: new Date(),
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        used: false
      });

      console.log(`New pairing request: ${deviceName} (${deviceType}) - Code: ${pairingCode}`);
      
      res.json({
        pairingId,
        pairingCode,
        expiresIn: 300000 // 5 minutes in milliseconds
      });
    });

    // Get device information
    this.app.get('/device-info', (req, res) => {
      res.json({
        deviceId: this.getDeviceId(),
        deviceName: this.getDeviceName(),
        version: '1.0.0',
        platform: process.platform,
        connectedClients: this.connectedClients.size
      });
    });
  }

  async startServer() {
    try {
      if (this.isRunning) {
        console.log('SignalR server is already running');
        return;
      }

      this.server = createServer(this.app);
      
      // Set up Socket.IO for real-time communication
      const { Server } = require('socket.io');
      this.io = new Server(this.server, {
        cors: {
          origin: ['http://localhost:3000', 'http://localhost:3012', 'https://homehost.io'],
          credentials: true
        },
        transports: ['websocket', 'polling']
      });

      this.setupSocketHandlers();

      await new Promise((resolve, reject) => {
        this.server.listen(this.port, (err) => {
          if (err) {
            reject(err);
          } else {
            this.isRunning = true;
            console.log(`SignalR server started on port ${this.port}`);
            resolve();
          }
        });
      });

      this.emit('server-started', { port: this.port });
    } catch (error) {
      console.error('Failed to start SignalR server:', error);
      throw error;
    }
  }

  setupSocketHandlers() {
    // Apply rate limiting middleware for WebSocket connections
    if (this.rateLimitingService) {
      this.io.use(this.rateLimitingService.createWebSocketMiddleware());
    }
    
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Handle device authentication
      socket.on('authenticate', async (data) => {
        try {
          const { pairingCode, deviceInfo } = data;
          const pairing = this.findPairingByCode(pairingCode);
          
          if (!pairing) {
            socket.emit('auth-failed', { error: 'Invalid pairing code' });
            return;
          }

          if (pairing.expires < new Date()) {
            socket.emit('auth-failed', { error: 'Pairing code expired' });
            this.devicePairings.delete(pairing.id);
            return;
          }

          if (pairing.used) {
            socket.emit('auth-failed', { error: 'Pairing code already used' });
            return;
          }

          // Mark pairing as used
          pairing.used = true;
          pairing.socketId = socket.id;
          pairing.connectedAt = new Date();

          // Store client connection
          this.connectedClients.set(socket.id, {
            id: socket.id,
            deviceName: pairing.deviceName,
            deviceType: pairing.deviceType,
            deviceInfo: deviceInfo || {},
            connectedAt: new Date(),
            lastActivity: new Date()
          });

          socket.emit('auth-success', {
            clientId: socket.id,
            deviceId: this.getDeviceId(),
            deviceName: this.getDeviceName()
          });

          console.log(`Client authenticated: ${pairing.deviceName} (${pairing.deviceType})`);
          this.emit('client-connected', { clientId: socket.id, device: pairing });

        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth-failed', { error: 'Authentication failed' });
        }
      });

      // Handle server status requests
      socket.on('get-server-status', () => {
        this.sendServerStatus(socket);
      });

      // Handle server control commands
      socket.on('server-command', async (data) => {
        try {
          const client = this.connectedClients.get(socket.id);
          if (!client) {
            socket.emit('command-error', { error: 'Not authenticated' });
            return;
          }

          const { command, serverId, params } = data;
          console.log(`Remote command from ${client.deviceName}: ${command} for server ${serverId}`);

          // Emit to main process for handling
          this.emit('remote-command', {
            clientId: socket.id,
            command,
            serverId,
            params,
            device: client
          });

        } catch (error) {
          console.error('Command handling error:', error);
          socket.emit('command-error', { error: 'Command failed' });
        }
      });

      // Handle real-time log requests
      socket.on('subscribe-logs', (data) => {
        const { serverId } = data;
        const client = this.connectedClients.get(socket.id);
        
        if (!client) {
          socket.emit('subscription-error', { error: 'Not authenticated' });
          return;
        }

        socket.join(`logs:${serverId}`);
        console.log(`Client ${client.deviceName} subscribed to logs for server ${serverId}`);
      });

      socket.on('unsubscribe-logs', (data) => {
        const { serverId } = data;
        socket.leave(`logs:${serverId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          console.log(`Client disconnected: ${client.deviceName}`);
          this.connectedClients.delete(socket.id);
          this.emit('client-disconnected', { clientId: socket.id, device: client });
        }
      });

      // Update last activity
      socket.onAny(() => {
        const client = this.connectedClients.get(socket.id);
        if (client) {
          client.lastActivity = new Date();
        }
      });
    });
  }

  // Broadcast server status to all connected clients
  broadcastServerStatus(servers, systemInfo) {
    if (!this.io) return;

    const status = {
      timestamp: new Date().toISOString(),
      servers: servers.map(server => ({
        id: server.id,
        name: server.name,
        status: server.status,
        gameType: server.gameType,
        gameName: server.gameName,
        port: server.port,
        currentPlayers: server.currentPlayers || 0,
        maxPlayers: server.maxPlayers,
        lastStarted: server.lastStarted
      })),
      systemInfo: {
        cpu: systemInfo?.current?.cpu || {},
        memory: systemInfo?.current?.memory || {},
        uptime: process.uptime()
      }
    };

    this.io.emit('server-status-update', status);
  }

  // Broadcast server metrics to connected clients
  broadcastServerMetrics(serverId, metrics) {
    if (!this.io) return;

    this.io.emit('server-metrics-update', {
      serverId,
      metrics,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast performance alerts
  broadcastPerformanceAlert(serverId, alert) {
    if (!this.io) return;

    this.io.emit('performance-alert', {
      serverId,
      alert,
      timestamp: new Date().toISOString()
    });
  }

  // Broadcast server logs to subscribed clients
  broadcastServerLog(serverId, logEntry) {
    if (!this.io) return;

    this.io.to(`logs:${serverId}`).emit('server-log', {
      serverId,
      log: logEntry,
      timestamp: new Date().toISOString()
    });
  }

  // Send command response back to specific client
  sendCommandResponse(clientId, response) {
    if (!this.io) return;

    const socket = this.io.sockets.sockets.get(clientId);
    if (socket) {
      socket.emit('command-response', response);
    }
  }

  // Send server status to specific client
  sendServerStatus(socket) {
    // This will be called by the main process to provide current status
    this.emit('status-requested', { socket });
  }

  // Utility methods
  generatePairingCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  findPairingByCode(code) {
    for (const pairing of this.devicePairings.values()) {
      if (pairing.pairingCode === code && !pairing.used && pairing.expires > new Date()) {
        return pairing;
      }
    }
    return null;
  }

  getDeviceId() {
    let deviceId = this.store.get('deviceId');
    if (!deviceId) {
      deviceId = uuidv4();
      this.store.set('deviceId', deviceId);
    }
    return deviceId;
  }

  getDeviceName() {
    return this.store.get('deviceName', require('os').hostname());
  }

  setDeviceName(name) {
    this.store.set('deviceName', name);
  }

  // Clean up expired pairings
  cleanupExpiredPairings() {
    const now = new Date();
    for (const [id, pairing] of this.devicePairings.entries()) {
      if (pairing.expires < now) {
        this.devicePairings.delete(id);
      }
    }
  }

  getConnectedClients() {
    return Array.from(this.connectedClients.values());
  }

  getActiveParings() {
    return Array.from(this.devicePairings.values()).filter(p => !p.used && p.expires > new Date());
  }

  async stopServer() {
    try {
      if (!this.isRunning || !this.server) {
        return;
      }

      // Disconnect all clients
      if (this.io) {
        this.io.emit('server-shutdown', { message: 'Server is shutting down' });
        this.io.close();
      }

      await new Promise((resolve) => {
        this.server.close(() => {
          this.isRunning = false;
          console.log('SignalR server stopped');
          resolve();
        });
      });

      this.emit('server-stopped');
    } catch (error) {
      console.error('Error stopping SignalR server:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      port: this.port,
      connectedClients: this.connectedClients.size,
      activePairings: this.getActiveParings().length,
      uptime: this.isRunning ? process.uptime() : 0
    };
  }
}

module.exports = SignalRService;