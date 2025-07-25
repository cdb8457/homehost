import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { logger, logSecurity, logUserActivity } from '@/utils/logger';
import { AppError, AuthenticationError, ValidationError, ConflictError } from '@/utils/errors';
import { asyncHandler } from '@/middleware/errorHandler';
import { userActionRateLimiter } from '@/middleware/rateLimiter';

const router = express.Router();

// Validation schemas
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 characters and contain only letters, numbers, and underscores'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
  body('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match');
    }
    return true;
  })
];

// Helper function to generate JWT tokens
function generateTokens(userId: string, email: string, username: string, role: string, sessionId?: string) {
  const payload = {
    userId,
    email,
    username,
    role,
    sessionId
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  const refreshToken = jwt.sign(
    { userId, sessionId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  return { accessToken, refreshToken };
}

// User Registration
router.post('/register', 
  userActionRateLimiter('register', 5, 900), // 5 attempts per 15 minutes
  registerValidation,
  asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid registration data', {
        validationErrors: errors.array()
      });
    }

    const { email, username, password, firstName, lastName } = req.body;
    const prisma = getPrismaClient();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      logSecurity('Registration Attempt - Duplicate User', {
        email,
        username,
        field,
        ip: req.ip
      }, 'low');
      
      throw new ConflictError(`User with this ${field} already exists`);
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id
      }
    });

    // Create user preferences
    await prisma.userPreferences.create({
      data: {
        userId: user.id
      }
    });

    // Create session
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        token: '', // Will be updated with JWT
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.username, user.role, session.id);

    // Update session with token
    await prisma.userSession.update({
      where: { id: session.id },
      data: { token: tokens.accessToken }
    });

    logUserActivity(user.id, 'user_registered', {
      email: user.email,
      username: user.username,
      ip: req.ip
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      },
      message: 'Registration successful'
    });
  })
);

// User Login
router.post('/login',
  userActionRateLimiter('login', 10, 900), // 10 attempts per 15 minutes
  loginValidation,
  asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid login data', {
        validationErrors: errors.array()
      });
    }

    const { email, password, rememberMe } = req.body;
    const prisma = getPrismaClient();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true
      }
    });

    if (!user) {
      logSecurity('Login Attempt - User Not Found', {
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');
      
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isActive) {
      logSecurity('Login Attempt - Deactivated Account', {
        userId: user.id,
        email,
        ip: req.ip
      }, 'medium');
      
      throw new AuthenticationError('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logSecurity('Login Attempt - Invalid Password', {
        userId: user.id,
        email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }, 'medium');
      
      throw new AuthenticationError('Invalid email or password');
    }

    // Create session
    const sessionExpiresAt = rememberMe 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        token: '', // Will be updated with JWT
        userAgent: req.get('User-Agent') || '',
        ipAddress: req.ip,
        expiresAt: sessionExpiresAt
      }
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.username, user.role, session.id);

    // Update session with token
    await prisma.userSession.update({
      where: { id: session.id },
      data: { token: tokens.accessToken }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    logUserActivity(user.id, 'user_login', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      rememberMe: !!rememberMe
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || '7d'
        }
      },
      message: 'Login successful'
    });
  })
);

// Logout
router.post('/logout',
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        const prisma = getPrismaClient();

        // Remove session
        if (decoded.sessionId) {
          await prisma.userSession.delete({
            where: { id: decoded.sessionId }
          }).catch(() => {
            // Session might already be deleted, ignore error
          });
        }

        logUserActivity(decoded.userId, 'user_logout', {
          ip: req.ip
        });
      } catch (error) {
        // Token might be invalid or expired, that's okay for logout
        logger.debug('Invalid token during logout:', error);
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  })
);

// Refresh Token
router.post('/refresh',
  userActionRateLimiter('refresh', 20, 900), // 20 attempts per 15 minutes
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
      const prisma = getPrismaClient();

      // Verify session exists and is valid
      const session = await prisma.userSession.findUnique({
        where: { id: decoded.sessionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              role: true,
              isActive: true
            }
          }
        }
      });

      if (!session || session.expiresAt < new Date() || !session.user.isActive) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Generate new tokens
      const tokens = generateTokens(
        session.user.id,
        session.user.email,
        session.user.username,
        session.user.role,
        session.id
      );

      // Update session with new token
      await prisma.userSession.update({
        where: { id: session.id },
        data: { 
          token: tokens.accessToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Extend expiration
        }
      });

      res.json({
        success: true,
        data: {
          tokens: {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: process.env.JWT_EXPIRES_IN || '7d'
          }
        },
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  })
);

// Change Password
router.post('/change-password',
  userActionRateLimiter('changePassword', 5, 3600), // 5 attempts per hour
  changePasswordValidation,
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthenticationError('Authentication token required');
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid password change data', {
        validationErrors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const prisma = getPrismaClient();

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          password: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid user');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        logSecurity('Password Change Attempt - Invalid Current Password', {
          userId: user.id,
          ip: req.ip
        }, 'medium');
        
        throw new AuthenticationError('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword }
      });

      // Invalidate all existing sessions except current one
      if (decoded.sessionId) {
        await prisma.userSession.deleteMany({
          where: {
            userId: user.id,
            id: { not: decoded.sessionId }
          }
        });
      }

      logUserActivity(user.id, 'password_changed', {
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid authentication token');
      }
      throw error;
    }
  })
);

// Get Current User
router.get('/me',
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthenticationError('Authentication token required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const prisma = getPrismaClient();

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          role: true,
          emailVerified: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          profile: true,
          preferences: true
        }
      });

      if (!user || !user.isActive) {
        throw new AuthenticationError('Invalid user');
      }

      res.json({
        success: true,
        data: { user },
        message: 'User retrieved successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid authentication token');
      }
      throw error;
    }
  })
);

// Logout from all devices
router.post('/logout-all',
  userActionRateLimiter('logoutAll', 3, 3600), // 3 attempts per hour
  asyncHandler(async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthenticationError('Authentication token required');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const prisma = getPrismaClient();

      // Remove all sessions for the user
      await prisma.userSession.deleteMany({
        where: { userId: decoded.userId }
      });

      logUserActivity(decoded.userId, 'logout_all_devices', {
        ip: req.ip
      });

      res.json({
        success: true,
        message: 'Logged out from all devices successfully'
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid authentication token');
      }
      throw error;
    }
  })
);

export default router;