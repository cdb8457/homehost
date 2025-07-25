import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPrismaClient } from '@/config/database';
import { logger, logSecurity } from '@/utils/logger';
import { AppError } from '@/utils/errors';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
        sessionId?: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

// Main authentication middleware
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      logSecurity('Authentication Failed', {
        reason: 'No token provided',
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        endpoint: req.originalUrl
      }, 'medium');
      
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
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
        emailVerified: true
      }
    });

    if (!user) {
      logSecurity('Authentication Failed', {
        reason: 'User not found',
        userId: decoded.userId,
        ip: req.ip,
        endpoint: req.originalUrl
      }, 'high');
      
      throw new AppError('Invalid authentication token', 401, 'INVALID_TOKEN');
    }

    if (!user.isActive) {
      logSecurity('Authentication Failed', {
        reason: 'Account deactivated',
        userId: user.id,
        ip: req.ip,
        endpoint: req.originalUrl
      }, 'medium');
      
      throw new AppError('Account has been deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Verify session if sessionId is present
    if (decoded.sessionId) {
      const session = await prisma.userSession.findUnique({
        where: { 
          id: decoded.sessionId,
          userId: user.id
        }
      });

      if (!session || session.expiresAt < new Date()) {
        logSecurity('Authentication Failed', {
          reason: 'Invalid or expired session',
          userId: user.id,
          sessionId: decoded.sessionId,
          ip: req.ip
        }, 'medium');
        
        throw new AppError('Session expired', 401, 'SESSION_EXPIRED');
      }
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      sessionId: decoded.sessionId
    };

    // Update last login time (throttled to avoid excessive DB writes)
    if (shouldUpdateLastLogin(req)) {
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      }).catch(err => {
        logger.warn('Failed to update last login time:', err);
      });
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logSecurity('Authentication Failed', {
        reason: 'Invalid JWT token',
        error: error.message,
        ip: req.ip,
        endpoint: req.originalUrl
      }, 'medium');
      
      return next(new AppError('Invalid authentication token', 401, 'INVALID_TOKEN'));
    }

    if (error instanceof AppError) {
      return next(error);
    }

    logger.error('Authentication middleware error:', error);
    return next(new AppError('Authentication failed', 500, 'AUTHENTICATION_ERROR'));
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }

    // Try to authenticate, but don't fail if it doesn't work
    await authMiddleware(req, res, () => {});
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      logSecurity('Authorization Failed', {
        reason: 'Insufficient permissions',
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl,
        ip: req.ip
      }, 'medium');
      
      return next(new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS'));
    }

    next();
  };
};

// Server ownership/admin authorization
export const requireServerAccess = (requiredRoles: string[] = ['OWNER', 'ADMIN']) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
      }

      const serverId = req.params.serverId || req.body.serverId;
      
      if (!serverId) {
        return next(new AppError('Server ID is required', 400, 'MISSING_SERVER_ID'));
      }

      const prisma = getPrismaClient();
      
      // Check if user is global admin
      if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return next();
      }

      // Check server membership and role
      const serverMember = await prisma.serverMember.findUnique({
        where: {
          serverId_userId: {
            serverId: serverId,
            userId: req.user.id
          }
        },
        include: {
          server: {
            select: {
              ownerId: true
            }
          }
        }
      });

      // Check if user is server owner
      if (serverMember?.server.ownerId === req.user.id) {
        return next();
      }

      // Check if user has required role on server
      if (serverMember && requiredRoles.includes(serverMember.role)) {
        return next();
      }

      logSecurity('Server Access Denied', {
        reason: 'Insufficient server permissions',
        userId: req.user.id,
        serverId: serverId,
        userRole: serverMember?.role || 'none',
        requiredRoles,
        endpoint: req.originalUrl
      }, 'medium');

      return next(new AppError('Insufficient server permissions', 403, 'INSUFFICIENT_SERVER_PERMISSIONS'));
    } catch (error) {
      logger.error('Server access middleware error:', error);
      return next(new AppError('Authorization failed', 500, 'AUTHORIZATION_ERROR'));
    }
  };
};

// Community access authorization
export const requireCommunityAccess = (requiredRoles: string[] = ['OWNER', 'ADMIN', 'MODERATOR']) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
      }

      const communityId = req.params.communityId || req.body.communityId;
      
      if (!communityId) {
        return next(new AppError('Community ID is required', 400, 'MISSING_COMMUNITY_ID'));
      }

      const prisma = getPrismaClient();
      
      // Check if user is global admin
      if (['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return next();
      }

      // Check community membership and role
      const communityMember = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: communityId,
            userId: req.user.id
          }
        }
      });

      if (communityMember && requiredRoles.includes(communityMember.role)) {
        return next();
      }

      logSecurity('Community Access Denied', {
        reason: 'Insufficient community permissions',
        userId: req.user.id,
        communityId: communityId,
        userRole: communityMember?.role || 'none',
        requiredRoles,
        endpoint: req.originalUrl
      }, 'medium');

      return next(new AppError('Insufficient community permissions', 403, 'INSUFFICIENT_COMMUNITY_PERMISSIONS'));
    } catch (error) {
      logger.error('Community access middleware error:', error);
      return next(new AppError('Authorization failed', 500, 'AUTHORIZATION_ERROR'));
    }
  };
};

// Rate limiting for sensitive operations
export const requireVerifiedEmail = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED'));
  }

  // For this implementation, we'll assume email is verified if user exists
  // In a real implementation, you'd check the emailVerified field
  next();
};

// API key authentication (for server-to-server communication)
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      return next(new AppError('API key required', 401, 'API_KEY_REQUIRED'));
    }

    // In a real implementation, you'd validate the API key against a database
    // For now, we'll use a simple environment variable check
    const validApiKey = process.env.INTERNAL_API_KEY;
    
    if (!validApiKey || apiKey !== validApiKey) {
      logSecurity('API Key Authentication Failed', {
        providedKey: apiKey.substring(0, 8) + '...',
        ip: req.ip,
        endpoint: req.originalUrl
      }, 'high');
      
      return next(new AppError('Invalid API key', 401, 'INVALID_API_KEY'));
    }

    // Set a special user object for API key authentication
    req.user = {
      id: 'system',
      email: 'system@homehost.com',
      username: 'system',
      role: 'SYSTEM'
    };

    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    return next(new AppError('API authentication failed', 500, 'API_AUTH_ERROR'));
  }
};

// Helper function to extract token from request
function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check query parameter (less secure, only for development)
  if (process.env.NODE_ENV === 'development' && req.query.token) {
    return req.query.token as string;
  }

  return null;
}

// Helper function to determine if we should update last login time
function shouldUpdateLastLogin(req: Request): boolean {
  // Only update once per hour to avoid excessive database writes
  const lastUpdate = req.user?.sessionId ? new Date() : new Date();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  return lastUpdate < oneHourAgo;
}

export default authMiddleware;