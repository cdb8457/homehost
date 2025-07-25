import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireCommunityAccess } from '@/middleware/auth';
import { AppError, NotFoundError, ValidationError } from '@/utils/errors';
import { logUserActivity } from '@/utils/logger';

const router = express.Router();

// Get communities (public listing)
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('search').optional().isLength({ min: 1 }),
    query('joinType').optional().isIn(['OPEN', 'APPLICATION', 'INVITE_ONLY']),
    query('isPublic').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const joinType = req.query.joinType as string;
    const isPublic = req.query.isPublic !== undefined ? req.query.isPublic === 'true' : true;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      isPublic,
      ...(joinType && { joinType }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    };

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          server: {
            select: {
              id: true,
              name: true,
              gameType: true,
              isOnline: true,
              currentPlayers: true,
              maxPlayers: true
            }
          },
          _count: {
            select: {
              members: true,
              posts: true,
              events: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.community.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        communities,
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

// Get community details
router.get('/:communityId',
  asyncHandler(async (req, res) => {
    const communityId = req.params.communityId;
    const userId = req.user?.id;
    const prisma = getPrismaClient();

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            gameType: true,
            gameVersion: true,
            region: true,
            isOnline: true,
            currentPlayers: true,
            maxPlayers: true,
            tags: true
          }
        },
        members: {
          where: userId ? { userId } : undefined,
          select: {
            role: true,
            joinedAt: true,
            reputation: true
          }
        },
        _count: {
          select: {
            members: true,
            posts: true,
            events: true
          }
        }
      }
    });

    if (!community) {
      throw new NotFoundError('Community');
    }

    // Check if user is a member
    const userMembership = community.members[0] || null;

    res.json({
      success: true,
      data: {
        community: {
          ...community,
          userMembership
        }
      }
    });
  })
);

// Create community (for server owners)
router.post('/',
  [
    body('serverId').notEmpty().withMessage('Server ID is required'),
    body('name').isLength({ min: 1, max: 100 }).withMessage('Community name must be 1-100 characters'),
    body('description').isLength({ min: 1, max: 1000 }).withMessage('Description must be 1-1000 characters'),
    body('banner').optional().isURL(),
    body('logo').optional().isURL(),
    body('primaryColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('secondaryColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('isPublic').optional().isBoolean(),
    body('joinType').optional().isIn(['OPEN', 'APPLICATION', 'INVITE_ONLY']),
    body('rules').optional().isArray(),
    body('welcomeMessage').optional().isLength({ max: 500 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid community data', {
        validationErrors: errors.array()
      });
    }

    const userId = req.user!.id;
    const { serverId } = req.body;
    const prisma = getPrismaClient();

    // Check if user owns the server
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { ownerId: true, name: true }
    });

    if (!server) {
      throw new NotFoundError('Server');
    }

    if (server.ownerId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Only server owners can create communities', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    // Check if community already exists for this server
    const existingCommunity = await prisma.community.findUnique({
      where: { serverId }
    });

    if (existingCommunity) {
      throw new AppError('Community already exists for this server', 409, 'COMMUNITY_EXISTS');
    }

    const community = await prisma.community.create({
      data: {
        ...req.body,
        serverId
      },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            gameType: true,
            ownerId: true
          }
        }
      }
    });

    // Add server owner as community owner
    await prisma.communityMember.create({
      data: {
        communityId: community.id,
        userId: userId,
        role: 'OWNER'
      }
    });

    logUserActivity(userId, 'community_created', {
      communityId: community.id,
      serverId: serverId
    });

    res.status(201).json({
      success: true,
      data: { community },
      message: 'Community created successfully'
    });
  })
);

// Update community
router.put('/:communityId',
  requireCommunityAccess(['OWNER', 'ADMIN']),
  [
    body('name').optional().isLength({ min: 1, max: 100 }),
    body('description').optional().isLength({ min: 1, max: 1000 }),
    body('banner').optional().isURL(),
    body('logo').optional().isURL(),
    body('primaryColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('secondaryColor').optional().matches(/^#[0-9A-F]{6}$/i),
    body('isPublic').optional().isBoolean(),
    body('joinType').optional().isIn(['OPEN', 'APPLICATION', 'INVITE_ONLY']),
    body('rules').optional().isArray(),
    body('welcomeMessage').optional().isLength({ max: 500 }),
    body('allowPosts').optional().isBoolean(),
    body('allowEvents').optional().isBoolean(),
    body('moderationLevel').optional().isIn(['open', 'moderate', 'strict'])
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid community data', {
        validationErrors: errors.array()
      });
    }

    const communityId = req.params.communityId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    const community = await prisma.community.update({
      where: { id: communityId },
      data: req.body,
      include: {
        server: {
          select: {
            id: true,
            name: true,
            gameType: true
          }
        }
      }
    });

    logUserActivity(userId, 'community_updated', {
      communityId: community.id
    });

    res.json({
      success: true,
      data: { community },
      message: 'Community updated successfully'
    });
  })
);

// Join community
router.post('/:communityId/join',
  asyncHandler(async (req, res) => {
    const communityId = req.params.communityId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if community exists and is public
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: {
        id: true,
        name: true,
        isPublic: true,
        joinType: true
      }
    });

    if (!community) {
      throw new NotFoundError('Community');
    }

    if (!community.isPublic) {
      throw new AppError('Cannot join private community', 403, 'PRIVATE_COMMUNITY');
    }

    if (community.joinType !== 'OPEN') {
      throw new AppError('Community requires approval or invitation to join', 403, 'APPROVAL_REQUIRED');
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId
        }
      }
    });

    if (existingMember) {
      throw new AppError('Already a member of this community', 409, 'ALREADY_MEMBER');
    }

    // Add member
    const member = await prisma.communityMember.create({
      data: {
        communityId,
        userId,
        role: 'MEMBER'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    logUserActivity(userId, 'community_joined', {
      communityId: community.id
    });

    res.status(201).json({
      success: true,
      data: { member },
      message: 'Successfully joined community'
    });
  })
);

// Leave community
router.post('/:communityId/leave',
  asyncHandler(async (req, res) => {
    const communityId = req.params.communityId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if member exists
    const member = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId
        }
      }
    });

    if (!member) {
      throw new NotFoundError('Membership');
    }

    // Cannot leave if owner (must transfer ownership first)
    if (member.role === 'OWNER') {
      throw new AppError('Community owners cannot leave. Transfer ownership first.', 400, 'OWNER_CANNOT_LEAVE');
    }

    // Remove membership
    await prisma.communityMember.delete({
      where: {
        communityId_userId: {
          communityId,
          userId
        }
      }
    });

    logUserActivity(userId, 'community_left', {
      communityId: communityId
    });

    res.json({
      success: true,
      message: 'Successfully left community'
    });
  })
);

// Get community posts
router.get('/:communityId/posts',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('type').optional().isIn(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'ACHIEVEMENT', 'EVENT'])
  ],
  asyncHandler(async (req, res) => {
    const communityId = req.params.communityId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as string;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      communityId,
      ...(type && { postType: type })
    };

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          },
          comments: {
            take: 3,
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              comments: true,
              reactions: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.communityPost.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        posts,
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

// Create community post
router.post('/:communityId/posts',
  requireCommunityAccess(['OWNER', 'ADMIN', 'MODERATOR', 'MEMBER']),
  [
    body('title').optional().isLength({ min: 1, max: 200 }),
    body('content').isLength({ min: 1, max: 5000 }).withMessage('Content must be 1-5000 characters'),
    body('postType').optional().isIn(['TEXT', 'IMAGE', 'VIDEO', 'POLL', 'ACHIEVEMENT', 'EVENT']),
    body('mediaUrls').optional().isArray(),
    body('tags').optional().isArray()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid post data', {
        validationErrors: errors.array()
      });
    }

    const communityId = req.params.communityId;
    const userId = req.user!.id;
    const {
      title,
      content,
      postType = 'TEXT',
      mediaUrls = [],
      tags = []
    } = req.body;

    const prisma = getPrismaClient();

    // Check if community allows posts
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { allowPosts: true }
    });

    if (!community?.allowPosts) {
      throw new AppError('Posts are not allowed in this community', 403, 'POSTS_DISABLED');
    }

    const post = await prisma.communityPost.create({
      data: {
        communityId,
        authorId: userId,
        title,
        content,
        postType,
        mediaUrls,
        tags
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    });

    logUserActivity(userId, 'post_created', {
      communityId,
      postId: post.id
    });

    res.status(201).json({
      success: true,
      data: { post },
      message: 'Post created successfully'
    });
  })
);

// Get community events
router.get('/:communityId/events',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  ],
  asyncHandler(async (req, res) => {
    const communityId = req.params.communityId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      communityId,
      ...(status && { status })
    };

    const [events, total] = await Promise.all([
      prisma.communityEvent.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              avatarUrl: true
            }
          },
          _count: {
            select: {
              participants: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { startTime: 'asc' }
      }),
      prisma.communityEvent.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        events,
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