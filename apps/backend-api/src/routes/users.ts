import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireRole } from '@/middleware/auth';
import { AppError, NotFoundError, ValidationError } from '@/utils/errors';
import { logUserActivity } from '@/utils/logger';

const router = express.Router();

// Get user profile
router.get('/profile/:userId?', 
  asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user!.id;
    const prisma = getPrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true,
        profile: true,
        badges: {
          include: {
            badge: true
          }
        },
        reputation: true,
        _count: {
          select: {
            ownedServers: true,
            memberServers: true,
            posts: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    res.json({
      success: true,
      data: { user }
    });
  })
);

// Update user profile
router.put('/profile',
  [
    body('firstName').optional().isLength({ min: 1, max: 50 }),
    body('lastName').optional().isLength({ min: 1, max: 50 }),
    body('bio').optional().isLength({ max: 500 }),
    body('location').optional().isLength({ max: 100 }),
    body('website').optional().isURL(),
    body('discord').optional().isLength({ max: 100 }),
    body('twitter').optional().isLength({ max: 100 }),
    body('twitch').optional().isLength({ max: 100 }),
    body('youtube').optional().isLength({ max: 100 }),
    body('steam').optional().isLength({ max: 100 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid profile data', {
        validationErrors: errors.array()
      });
    }

    const userId = req.user!.id;
    const prisma = getPrismaClient();

    const { firstName, lastName, bio, location, website, discord, twitter, twitch, youtube, steam } = req.body;

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true
      }
    });

    // Update user profile
    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        bio,
        location,
        website,
        discord,
        twitter,
        twitch,
        youtube,
        steam
      },
      create: {
        userId,
        bio,
        location,
        website,
        discord,
        twitter,
        twitch,
        youtube,
        steam
      }
    });

    logUserActivity(userId, 'profile_updated');

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully'
    });
  })
);

// Get user preferences
router.get('/preferences',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId }
    });

    res.json({
      success: true,
      data: { preferences }
    });
  })
);

// Update user preferences
router.put('/preferences',
  [
    body('theme').optional().isIn(['light', 'dark', 'auto']),
    body('emailNotifications').optional().isBoolean(),
    body('pushNotifications').optional().isBoolean(),
    body('showOnlineStatus').optional().isBoolean(),
    body('allowFriendRequests').optional().isBoolean(),
    body('showGameActivity').optional().isBoolean(),
    body('language').optional().isLength({ min: 2, max: 5 }),
    body('timezone').optional().isLength({ max: 100 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid preferences data', {
        validationErrors: errors.array()
      });
    }

    const userId = req.user!.id;
    const prisma = getPrismaClient();

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: req.body,
      create: {
        userId,
        ...req.body
      }
    });

    logUserActivity(userId, 'preferences_updated');

    res.json({
      success: true,
      data: { preferences },
      message: 'Preferences updated successfully'
    });
  })
);

// Get user notifications
router.get('/notifications',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('unreadOnly').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      userId,
      ...(unreadOnly && { isRead: false })
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

// Mark notification as read
router.patch('/notifications/:notificationId/read',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const notificationId = req.params.notificationId;
    const prisma = getPrismaClient();

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  })
);

// Search users
router.get('/search',
  [
    query('q').notEmpty().withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid search parameters', {
        validationErrors: errors.array()
      });
    }

    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } }
        ],
        isActive: true
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        createdAt: true
      },
      skip: offset,
      take: limit,
      orderBy: { username: 'asc' }
    });

    res.json({
      success: true,
      data: { users }
    });
  })
);

// Admin: Get all users
router.get('/',
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']),
    query('isActive').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as string;
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              ownedServers: true,
              memberServers: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  })
);

export default router;