import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { logger, logRateLimit, logSecurity } from '@/utils/logger';
import { AppError } from '@/utils/errors';

// Redis client for distributed rate limiting
let redisClient: Redis | null = null;

// Initialize Redis client if available
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      lazyConnect: true
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected for rate limiting');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis rate limiter error:', err);
    });
  } catch (error) {
    logger.warn('Failed to initialize Redis for rate limiting, falling back to memory:', error);
    redisClient = null;
  }
}

// Default rate limiting configuration
const defaultOptions = {
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000, // Per 15 minutes (converted to seconds)
  blockDuration: 60, // Block for 1 minute
  execEvenly: true, // Spread requests evenly across duration
};

// Create rate limiters
const createRateLimiter = (options: any) => {
  if (redisClient) {
    return new RateLimiterRedis({
      storeClient: redisClient,
      ...options
    });
  } else {
    return new RateLimiterMemory(options);
  }
};

// Different rate limiters for different endpoints
const rateLimiters = {
  // General API rate limiter
  general: createRateLimiter({
    ...defaultOptions,
    keyPrefix: 'general_rl'
  }),

  // Strict rate limiter for authentication endpoints
  auth: createRateLimiter({
    ...defaultOptions,
    points: 10, // 10 attempts
    duration: 900, // per 15 minutes
    blockDuration: 300, // block for 5 minutes
    keyPrefix: 'auth_rl'
  }),

  // Very strict rate limiter for password reset
  passwordReset: createRateLimiter({
    ...defaultOptions,
    points: 3, // 3 attempts
    duration: 3600, // per hour
    blockDuration: 3600, // block for 1 hour
    keyPrefix: 'password_reset_rl'
  }),

  // File upload rate limiter
  upload: createRateLimiter({
    ...defaultOptions,
    points: 20, // 20 uploads
    duration: 3600, // per hour
    blockDuration: 1800, // block for 30 minutes
    keyPrefix: 'upload_rl'
  }),

  // API key requests (more lenient for server-to-server)
  apiKey: createRateLimiter({
    ...defaultOptions,
    points: 1000, // 1000 requests
    duration: 3600, // per hour
    blockDuration: 60, // block for 1 minute
    keyPrefix: 'api_key_rl'
  }),

  // Monitoring endpoints (very high limit)
  monitoring: createRateLimiter({
    ...defaultOptions,
    points: 10000, // 10000 requests
    duration: 3600, // per hour
    blockDuration: 30, // block for 30 seconds
    keyPrefix: 'monitoring_rl'
  })
};

// Main rate limiting middleware
export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip rate limiting for health checks
    if (req.path === '/health') {
      return next();
    }

    // Determine which rate limiter to use
    const limiter = selectRateLimiter(req);
    const key = generateRateLimitKey(req);

    try {
      const result = await limiter.consume(key);
      
      // Add rate limit headers
      res.set({
        'X-RateLimit-Limit': defaultOptions.points.toString(),
        'X-RateLimit-Remaining': result.remainingPoints?.toString() || '0',
        'X-RateLimit-Reset': new Date(Date.now() + (result.msBeforeNext || 0)).toISOString()
      });

      // Log if approaching limit
      if (result.remainingPoints !== undefined && result.remainingPoints <= 5) {
        logRateLimit(req.ip, req.originalUrl, defaultOptions.points, result.remainingPoints);
      }

      next();
    } catch (rejRes: any) {
      // Rate limit exceeded
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': defaultOptions.points.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + rejRes.msBeforeNext).toISOString(),
        'Retry-After': secs.toString()
      });

      // Log rate limit violation
      logSecurity('Rate Limit Exceeded', {
        ip: req.ip,
        endpoint: req.originalUrl,
        userAgent: req.get('User-Agent'),
        userId: (req as any).user?.id,
        blockedFor: `${secs} seconds`
      }, 'medium');

      // Return rate limit error
      throw new AppError(
        `Rate limit exceeded. Try again in ${secs} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    logger.error('Rate limiter error:', error);
    
    // On rate limiter failure, allow the request but log the issue
    logger.warn('Rate limiter failed, allowing request');
    next();
  }
};

// Progressive rate limiter for repeated violations
export const progressiveRateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = `progressive_${generateRateLimitKey(req)}`;
    const violationKey = `violations_${generateRateLimitKey(req)}`;
    
    // Check violation history
    const violations = redisClient ? 
      await redisClient.get(violationKey).then(val => parseInt(val || '0')) :
      0;

    // Increase strictness based on violations
    const points = Math.max(10 - violations * 2, 1);
    const blockDuration = Math.min(60 * Math.pow(2, violations), 3600); // Exponential backoff, max 1 hour

    const limiter = createRateLimiter({
      points,
      duration: 900, // 15 minutes
      blockDuration,
      keyPrefix: 'progressive_rl'
    });

    try {
      await limiter.consume(key);
      next();
    } catch (rejRes: any) {
      // Increment violation counter
      if (redisClient) {
        await redisClient.set(violationKey, violations + 1, 'EX', 3600); // Expire in 1 hour
      }

      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      logSecurity('Progressive Rate Limit Exceeded', {
        ip: req.ip,
        endpoint: req.originalUrl,
        violations: violations + 1,
        blockedFor: `${secs} seconds`
      }, violations > 2 ? 'high' : 'medium');

      res.set('Retry-After', secs.toString());
      throw new AppError(
        `Rate limit exceeded. Repeated violations detected. Try again in ${secs} seconds.`,
        429,
        'PROGRESSIVE_RATE_LIMIT_EXCEEDED'
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    logger.error('Progressive rate limiter error:', error);
    next();
  }
};

// Rate limiter for specific user actions
export const userActionRateLimiter = (action: string, points: number = 5, duration: number = 300) => {
  const limiter = createRateLimiter({
    points,
    duration,
    blockDuration: duration,
    keyPrefix: `user_action_${action}`
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return next(); // Skip if not authenticated
      }

      const key = `${userId}_${action}`;
      
      try {
        await limiter.consume(key);
        next();
      } catch (rejRes: any) {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        
        logSecurity('User Action Rate Limit Exceeded', {
          userId,
          action,
          ip: req.ip,
          endpoint: req.originalUrl,
          blockedFor: `${secs} seconds`
        }, 'medium');

        res.set('Retry-After', secs.toString());
        throw new AppError(
          `Too many ${action} attempts. Try again in ${secs} seconds.`,
          429,
          'USER_ACTION_RATE_LIMIT_EXCEEDED'
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }

      logger.error(`User action rate limiter error for ${action}:`, error);
      next();
    }
  };
};

// IP-based rate limiter for suspicious activity
export const suspiciousActivityLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const suspiciousPatterns = [
      /\.(php|asp|jsp|cgi)$/i,
      /wp-admin|wp-login/i,
      /admin|phpmyadmin/i,
      /\.env|config\.json/i,
      /eval\(|javascript:/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(req.originalUrl) || pattern.test(req.get('User-Agent') || '')
    );

    if (isSuspicious) {
      const limiter = createRateLimiter({
        points: 1, // Only 1 suspicious request
        duration: 3600, // per hour
        blockDuration: 3600, // block for 1 hour
        keyPrefix: 'suspicious_rl'
      });

      try {
        await limiter.consume(req.ip);
      } catch (rejRes: any) {
        logSecurity('Suspicious Activity Blocked', {
          ip: req.ip,
          endpoint: req.originalUrl,
          userAgent: req.get('User-Agent'),
          reason: 'Repeated suspicious requests'
        }, 'high');

        throw new AppError('Access denied', 403, 'SUSPICIOUS_ACTIVITY');
      }
    }

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    logger.error('Suspicious activity limiter error:', error);
    next();
  }
};

// Helper function to select appropriate rate limiter
function selectRateLimiter(req: Request) {
  const path = req.path.toLowerCase();
  
  // API key authentication
  if (req.headers['x-api-key']) {
    return rateLimiters.apiKey;
  }

  // Authentication endpoints
  if (path.includes('/auth/')) {
    if (path.includes('/password/reset') || path.includes('/forgot-password')) {
      return rateLimiters.passwordReset;
    }
    return rateLimiters.auth;
  }

  // Upload endpoints
  if (path.includes('/upload') || req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
    return rateLimiters.upload;
  }

  // Monitoring endpoints
  if (path.includes('/monitoring') || path.includes('/metrics') || path.includes('/health')) {
    return rateLimiters.monitoring;
  }

  // Default general rate limiter
  return rateLimiters.general;
}

// Helper function to generate rate limit key
function generateRateLimitKey(req: Request): string {
  // Use user ID if authenticated, otherwise IP
  const userId = (req as any).user?.id;
  if (userId) {
    return `user_${userId}`;
  }

  // Use IP address with potential proxy headers
  const ip = req.ip || 
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection.remoteAddress ||
    'unknown';

  return `ip_${ip}`;
}

// Rate limit status endpoint for monitoring
export const getRateLimitStatus = async (req: Request, res: Response) => {
  try {
    const key = generateRateLimitKey(req);
    const limiter = selectRateLimiter(req);
    
    // Get current status without consuming points
    const result = await limiter.get(key);
    
    res.json({
      success: true,
      data: {
        key: key.replace(/ip_\d+\.\d+\.\d+\.\d+/, 'ip_***'), // Mask IP for privacy
        remainingPoints: result?.remainingPoints || defaultOptions.points,
        msBeforeNext: result?.msBeforeNext || 0,
        totalHits: result?.totalHits || 0
      }
    });
  } catch (error) {
    logger.error('Rate limit status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get rate limit status'
    });
  }
};

export default rateLimiter;