import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { getPrismaClient } from '@/config/database';
import { logger, logSecurity, logUserActivity } from '@/utils/logger';
import { AppError } from '@/utils/errors';

// WebSocket event types
export enum WSEvents {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  AUTHENTICATION_ERROR = 'authentication_error',

  // Server monitoring events
  SERVER_METRICS = 'server_metrics',
  SERVER_STATUS = 'server_status',
  SERVER_PLAYER_COUNT = 'server_player_count',
  SERVER_PERFORMANCE = 'server_performance',

  // Alert events
  ALERT_CREATED = 'alert_created',
  ALERT_ACKNOWLEDGED = 'alert_acknowledged',
  ALERT_RESOLVED = 'alert_resolved',
  ALERT_ESCALATED = 'alert_escalated',

  // User notifications
  NOTIFICATION = 'notification',
  FRIEND_REQUEST = 'friend_request',
  MESSAGE_RECEIVED = 'message_received',
  COMMUNITY_UPDATE = 'community_update',

  // Real-time collaboration
  CONFIG_CHANGE = 'config_change',
  DEPLOYMENT_STATUS = 'deployment_status',
  BACKUP_STATUS = 'backup_status',

  // Chat and communication
  CHAT_MESSAGE = 'chat_message',
  USER_TYPING = 'user_typing',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',

  // Plugin and marketplace events
  PLUGIN_UPDATE = 'plugin_update',
  MARKETPLACE_UPDATE = 'marketplace_update',

  // System events
  SYSTEM_MAINTENANCE = 'system_maintenance',
  RATE_LIMIT_WARNING = 'rate_limit_warning',
  ERROR = 'error'
}

// Socket authentication interface
interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  serverIds?: string[];
  isAuthenticated?: boolean;
}

// Active connections tracking
const activeConnections = new Map<string, AuthenticatedSocket>();
const userSockets = new Map<string, Set<string>>(); // userId -> Set of socket IDs

// WebSocket setup function
export function setupWebSocket(io: SocketIOServer): void {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        logger.warn('WebSocket connection attempt without token', {
          socketId: socket.id,
          ip: socket.handshake.address
        });
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      // Get user from database
      const prisma = getPrismaClient();
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isActive: true,
          ownedServers: {
            select: { id: true }
          },
          memberServers: {
            select: { serverId: true }
          }
        }
      });

      if (!user || !user.isActive) {
        logSecurity('WebSocket Authentication Failed', {
          reason: 'User not found or inactive',
          userId: decoded.userId,
          socketId: socket.id,
          ip: socket.handshake.address
        }, 'medium');
        return next(new Error('Invalid user'));
      }

      // Attach user info to socket
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.isAuthenticated = true;
      
      // Collect server IDs the user has access to
      const serverIds = new Set<string>();
      user.ownedServers.forEach(server => serverIds.add(server.id));
      user.memberServers.forEach(member => serverIds.add(member.serverId));
      socket.serverIds = Array.from(serverIds);

      logUserActivity(user.id, 'websocket_connect', {
        socketId: socket.id,
        ip: socket.handshake.address,
        userAgent: socket.handshake.headers['user-agent']
      });

      next();
    } catch (error) {
      logSecurity('WebSocket Authentication Error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        socketId: socket.id,
        ip: socket.handshake.address
      }, 'medium');
      
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket: AuthenticatedSocket) => {
    handleConnection(socket, io);
  });

  logger.info('WebSocket server configured with authentication');
}

// Handle individual socket connections
function handleConnection(socket: AuthenticatedSocket, io: SocketIOServer): void {
  const userId = socket.userId!;
  
  // Track active connection
  activeConnections.set(socket.id, socket);
  
  // Track user sockets
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(socket.id);

  logger.info('WebSocket client connected', {
    socketId: socket.id,
    userId: userId,
    activeConnections: activeConnections.size
  });

  // Join user to their personal room
  socket.join(`user:${userId}`);
  
  // Join user to server rooms they have access to
  socket.serverIds?.forEach(serverId => {
    socket.join(`server:${serverId}`);
  });

  // Send authentication confirmation
  socket.emit(WSEvents.AUTHENTICATED, {
    success: true,
    userId: userId,
    serverIds: socket.serverIds,
    timestamp: new Date().toISOString()
  });

  // Broadcast user online status to friends
  broadcastUserStatus(socket, io, 'online');

  // Set up event handlers
  setupEventHandlers(socket, io);

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    handleDisconnection(socket, io, reason);
  });

  // Handle connection errors
  socket.on('error', (error) => {
    logger.error('WebSocket connection error', {
      socketId: socket.id,
      userId: userId,
      error: error.message
    });
  });
}

// Set up event handlers for the socket
function setupEventHandlers(socket: AuthenticatedSocket, io: SocketIOServer): void {
  const userId = socket.userId!;

  // Server monitoring subscriptions
  socket.on('subscribe_server_metrics', (data: { serverId: string }) => {
    if (hasServerAccess(socket, data.serverId)) {
      socket.join(`metrics:${data.serverId}`);
      logger.debug('Client subscribed to server metrics', {
        userId,
        serverId: data.serverId,
        socketId: socket.id
      });
    } else {
      socket.emit(WSEvents.ERROR, {
        message: 'Access denied to server metrics',
        code: 'ACCESS_DENIED'
      });
    }
  });

  socket.on('unsubscribe_server_metrics', (data: { serverId: string }) => {
    socket.leave(`metrics:${data.serverId}`);
  });

  // Alert subscriptions
  socket.on('subscribe_alerts', (data: { serverId?: string }) => {
    if (data.serverId) {
      if (hasServerAccess(socket, data.serverId)) {
        socket.join(`alerts:${data.serverId}`);
      }
    } else {
      // Subscribe to all user's servers' alerts
      socket.serverIds?.forEach(serverId => {
        socket.join(`alerts:${serverId}`);
      });
    }
  });

  // Chat message handling
  socket.on('send_message', async (data: { recipientId: string; content: string; type?: string }) => {
    try {
      await handleChatMessage(socket, io, data);
    } catch (error) {
      socket.emit(WSEvents.ERROR, {
        message: 'Failed to send message',
        code: 'MESSAGE_SEND_FAILED'
      });
    }
  });

  // Typing indicators
  socket.on('typing_start', (data: { recipientId: string }) => {
    io.to(`user:${data.recipientId}`).emit(WSEvents.USER_TYPING, {
      userId: userId,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data: { recipientId: string }) => {
    io.to(`user:${data.recipientId}`).emit(WSEvents.USER_TYPING, {
      userId: userId,
      isTyping: false
    });
  });

  // Real-time collaboration events
  socket.on('config_edit_start', (data: { configId: string }) => {
    socket.broadcast.to(`config:${data.configId}`).emit('config_edit_lock', {
      userId: userId,
      configId: data.configId
    });
  });

  socket.on('config_edit_end', (data: { configId: string }) => {
    socket.broadcast.to(`config:${data.configId}`).emit('config_edit_unlock', {
      userId: userId,
      configId: data.configId
    });
  });

  // Heartbeat/keepalive
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });
}

// Handle chat message
async function handleChatMessage(
  socket: AuthenticatedSocket,
  io: SocketIOServer,
  data: { recipientId: string; content: string; type?: string }
): Promise<void> {
  const senderId = socket.userId!;
  
  // Validate message
  if (!data.content || data.content.trim().length === 0) {
    socket.emit(WSEvents.ERROR, {
      message: 'Message content cannot be empty',
      code: 'INVALID_MESSAGE'
    });
    return;
  }

  if (data.content.length > 1000) {
    socket.emit(WSEvents.ERROR, {
      message: 'Message too long',
      code: 'MESSAGE_TOO_LONG'
    });
    return;
  }

  try {
    // Store message in database
    const prisma = getPrismaClient();
    const message = await prisma.socialMessage.create({
      data: {
        senderId: senderId,
        recipientId: data.recipientId,
        content: data.content.trim(),
        messageType: (data.type as any) || 'TEXT'
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    // Send to recipient
    io.to(`user:${data.recipientId}`).emit(WSEvents.MESSAGE_RECEIVED, {
      id: message.id,
      senderId: senderId,
      sender: message.sender,
      content: message.content,
      type: message.messageType,
      timestamp: message.createdAt
    });

    // Confirm to sender
    socket.emit('message_sent', {
      id: message.id,
      timestamp: message.createdAt
    });

    logUserActivity(senderId, 'message_sent', {
      recipientId: data.recipientId,
      messageId: message.id
    });

  } catch (error) {
    logger.error('Failed to handle chat message', {
      senderId,
      recipientId: data.recipientId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

// Handle disconnection
function handleDisconnection(socket: AuthenticatedSocket, io: SocketIOServer, reason: string): void {
  const userId = socket.userId!;
  
  // Remove from active connections
  activeConnections.delete(socket.id);
  
  // Remove from user sockets tracking
  const userSocketSet = userSockets.get(userId);
  if (userSocketSet) {
    userSocketSet.delete(socket.id);
    if (userSocketSet.size === 0) {
      userSockets.delete(userId);
      // User is completely offline
      broadcastUserStatus(socket, io, 'offline');
    }
  }

  logger.info('WebSocket client disconnected', {
    socketId: socket.id,
    userId: userId,
    reason: reason,
    activeConnections: activeConnections.size
  });

  logUserActivity(userId, 'websocket_disconnect', {
    socketId: socket.id,
    reason: reason
  });
}

// Broadcast user online/offline status
function broadcastUserStatus(socket: AuthenticatedSocket, io: SocketIOServer, status: 'online' | 'offline'): void {
  const userId = socket.userId!;
  
  // In a real implementation, you'd get the user's friends list and broadcast to them
  // For now, we'll broadcast to a general "friends" room
  socket.broadcast.emit(WSEvents.USER_ONLINE, {
    userId: userId,
    status: status,
    timestamp: new Date().toISOString()
  });
}

// Check if user has access to a server
function hasServerAccess(socket: AuthenticatedSocket, serverId: string): boolean {
  return socket.serverIds?.includes(serverId) || false;
}

// Utility functions for broadcasting events

export function broadcastServerMetrics(serverId: string, metrics: any): void {
  const sockets = getServerSockets();
  if (sockets) {
    sockets.to(`metrics:${serverId}`).emit(WSEvents.SERVER_METRICS, {
      serverId,
      metrics,
      timestamp: new Date().toISOString()
    });
  }
}

export function broadcastAlert(serverId: string, alert: any): void {
  const sockets = getServerSockets();
  if (sockets) {
    sockets.to(`alerts:${serverId}`).emit(WSEvents.ALERT_CREATED, {
      serverId,
      alert,
      timestamp: new Date().toISOString()
    });
  }
}

export function broadcastNotification(userId: string, notification: any): void {
  const sockets = getServerSockets();
  if (sockets) {
    sockets.to(`user:${userId}`).emit(WSEvents.NOTIFICATION, {
      notification,
      timestamp: new Date().toISOString()
    });
  }
}

export function broadcastSystemMaintenance(message: string, scheduledTime?: Date): void {
  const sockets = getServerSockets();
  if (sockets) {
    sockets.emit(WSEvents.SYSTEM_MAINTENANCE, {
      message,
      scheduledTime,
      timestamp: new Date().toISOString()
    });
  }
}

export function broadcastDeploymentStatus(serverId: string, deployment: any): void {
  const sockets = getServerSockets();
  if (sockets) {
    sockets.to(`server:${serverId}`).emit(WSEvents.DEPLOYMENT_STATUS, {
      serverId,
      deployment,
      timestamp: new Date().toISOString()
    });
  }
}

// Get the global Socket.IO server instance
let globalIo: SocketIOServer | null = null;

export function setGlobalSocketServer(io: SocketIOServer): void {
  globalIo = io;
}

function getServerSockets(): SocketIOServer | null {
  return globalIo;
}

// Get active connection statistics
export function getConnectionStats() {
  return {
    totalConnections: activeConnections.size,
    uniqueUsers: userSockets.size,
    connectionsPerUser: userSockets.size > 0 ? activeConnections.size / userSockets.size : 0,
    timestamp: new Date().toISOString()
  };
}

// Get user's active socket IDs
export function getUserSockets(userId: string): Set<string> {
  return userSockets.get(userId) || new Set();
}

// Check if user is online
export function isUserOnline(userId: string): boolean {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0;
}

// Send message to specific user
export function sendToUser(userId: string, event: string, data: any): boolean {
  const sockets = getServerSockets();
  if (sockets) {
    sockets.to(`user:${userId}`).emit(event, data);
    return true;
  }
  return false;
}

// Send message to server members
export function sendToServer(serverId: string, event: string, data: any): boolean {
  const sockets = getServerSockets();
  if (sockets) {
    sockets.to(`server:${serverId}`).emit(event, data);
    return true;
  }
  return false;
}

// Graceful shutdown
export function shutdownWebSocket(): void {
  if (globalIo) {
    // Notify all clients about shutdown
    globalIo.emit(WSEvents.SYSTEM_MAINTENANCE, {
      message: 'Server is shutting down for maintenance',
      timestamp: new Date().toISOString()
    });

    // Close all connections
    globalIo.close();
    logger.info('WebSocket server shut down gracefully');
  }
}

export default setupWebSocket;