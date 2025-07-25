import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta)}`;
    }
    
    return logMessage;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` ${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'homehost-api'
  },
  transports: [
    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      tailable: true
    }),
  ]
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Add console transport for production with minimal output
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Console({
    level: 'warn',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    )
  }));
}

// Request logging helper
export const logRequest = (req: any, res: any, responseTime?: number) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id,
    responseTime: responseTime ? `${responseTime}ms` : undefined
  };

  if (res.statusCode >= 400) {
    logger.warn('HTTP Request', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

// Database operation logging
export const logDatabase = (operation: string, table: string, duration?: number, error?: Error) => {
  const logData = {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined
  };

  if (error) {
    logger.error('Database Error', { ...logData, error: error.message, stack: error.stack });
  } else if (duration && duration > 1000) {
    logger.warn('Slow Database Query', logData);
  } else {
    logger.debug('Database Operation', logData);
  }
};

// Security event logging
export const logSecurity = (event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  const logData = {
    securityEvent: event,
    severity,
    timestamp: new Date().toISOString(),
    ...details
  };

  switch (severity) {
    case 'critical':
      logger.error('SECURITY CRITICAL', logData);
      break;
    case 'high':
      logger.error('SECURITY HIGH', logData);
      break;
    case 'medium':
      logger.warn('SECURITY MEDIUM', logData);
      break;
    case 'low':
      logger.info('SECURITY LOW', logData);
      break;
  }
};

// Performance logging
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  const logData = {
    performance: operation,
    duration: `${duration}ms`,
    ...metadata
  };

  if (duration > 5000) {
    logger.error('Very Slow Performance', logData);
  } else if (duration > 2000) {
    logger.warn('Slow Performance', logData);
  } else if (duration > 1000) {
    logger.info('Performance', logData);
  } else {
    logger.debug('Performance', logData);
  }
};

// API Error logging
export const logApiError = (error: Error, context: any = {}) => {
  logger.error('API Error', {
    error: error.message,
    stack: error.stack,
    context
  });
};

// Validation error logging
export const logValidationError = (errors: any[], context: any = {}) => {
  logger.warn('Validation Error', {
    validationErrors: errors,
    context
  });
};

// User activity logging
export const logUserActivity = (userId: string, action: string, details: any = {}) => {
  logger.info('User Activity', {
    userId,
    action,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// System health logging
export const logSystemHealth = (component: string, status: 'healthy' | 'degraded' | 'unhealthy', metrics?: any) => {
  const logData = {
    component,
    healthStatus: status,
    metrics,
    timestamp: new Date().toISOString()
  };

  switch (status) {
    case 'unhealthy':
      logger.error('System Health', logData);
      break;
    case 'degraded':
      logger.warn('System Health', logData);
      break;
    case 'healthy':
      logger.info('System Health', logData);
      break;
  }
};

// Rate limiting logging
export const logRateLimit = (ip: string, endpoint: string, limit: number, remaining: number) => {
  if (remaining <= 0) {
    logger.warn('Rate Limit Exceeded', {
      ip,
      endpoint,
      limit,
      remaining
    });
  } else if (remaining <= 5) {
    logger.info('Rate Limit Warning', {
      ip,
      endpoint,
      limit,
      remaining
    });
  }
};

// Export default logger
export default logger;