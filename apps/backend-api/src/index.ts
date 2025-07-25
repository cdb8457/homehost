import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables
config();

// Import middleware and utilities
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { authMiddleware } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { setupWebSocket } from '@/services/websocket';

// Import routes
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import serverRoutes from '@/routes/servers';
import communityRoutes from '@/routes/communities';
import pluginRoutes from '@/routes/plugins';
import monitoringRoutes from '@/routes/monitoring';
import alertRoutes from '@/routes/alerts';
import configRoutes from '@/routes/configurations';

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.WS_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
app.use(rateLimiter);

// Health check endpoint (before auth middleware)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version endpoint
app.get(`/api/${API_VERSION}/info`, (req, res) => {
  res.status(200).json({
    name: 'HomeHost API',
    version: API_VERSION,
    description: 'Gaming server management platform API',
    endpoints: {
      auth: `/api/${API_VERSION}/auth`,
      users: `/api/${API_VERSION}/users`,
      servers: `/api/${API_VERSION}/servers`,
      communities: `/api/${API_VERSION}/communities`,
      plugins: `/api/${API_VERSION}/plugins`,
      monitoring: `/api/${API_VERSION}/monitoring`,
      alerts: `/api/${API_VERSION}/alerts`,
      configurations: `/api/${API_VERSION}/configurations`
    },
    websocket: {
      endpoint: '/socket.io',
      events: ['server-metrics', 'alerts', 'notifications']
    }
  });
});

// API Routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, authMiddleware, userRoutes);
app.use(`/api/${API_VERSION}/servers`, authMiddleware, serverRoutes);
app.use(`/api/${API_VERSION}/communities`, authMiddleware, communityRoutes);
app.use(`/api/${API_VERSION}/plugins`, authMiddleware, pluginRoutes);
app.use(`/api/${API_VERSION}/monitoring`, authMiddleware, monitoringRoutes);
app.use(`/api/${API_VERSION}/alerts`, authMiddleware, alertRoutes);
app.use(`/api/${API_VERSION}/configurations`, authMiddleware, configRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
      timestamp: new Date().toISOString()
    }
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Database connection and server startup
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Setup WebSocket handlers
    setupWebSocket(io);
    logger.info('WebSocket server configured');

    // Start HTTP server
    httpServer.listen(PORT, () => {
      logger.info(`🚀 HomeHost API Server started`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🌐 HTTP Server: http://localhost:${PORT}`);
      logger.info(`📡 WebSocket Server: ws://localhost:${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/${API_VERSION}/info`);
      logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown handling
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  httpServer.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    logger.info('HTTP server closed');
    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after 30 seconds');
    process.exit(1);
  }, 30000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export { app, io };