import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireServerAccess } from '@/middleware/auth';
import { AppError, NotFoundError, ValidationError, AuthorizationError } from '@/utils/errors';
import { logUserActivity } from '@/utils/logger';

const router = express.Router();

// Get user's servers
router.get('/',
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    const [ownedServers, memberServers] = await Promise.all([
      prisma.server.findMany({
        where: { ownerId: userId },
        include: {
          _count: {
            select: {
              members: true
            }
          }
        }
      }),
      prisma.server.findMany({
        where: {
          members: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          members: {
            where: { userId },
            select: { role: true, joinedAt: true }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        ownedServers,
        memberServers: memberServers.map(server => ({
          ...server,
          userRole: server.members[0]?.role,
          joinedAt: server.members[0]?.joinedAt
        }))
      }
    });
  })
);

// Create new server
router.post('/',
  [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Server name is required and must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }),
    body('gameType').notEmpty().withMessage('Game type is required'),
    body('gameVersion').optional().isLength({ max: 50 }),
    body('region').notEmpty().withMessage('Region is required'),
    body('maxPlayers').isInt({ min: 1, max: 1000 }).withMessage('Max players must be between 1 and 1000'),
    body('port').optional().isInt({ min: 1024, max: 65535 }),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid server data', {
        validationErrors: errors.array()
      });
    }

    const userId = req.user!.id;
    const {
      name,
      description,
      gameType,
      gameVersion,
      region,
      maxPlayers,
      port,
      isPublic = true,
      tags = []
    } = req.body;

    const prisma = getPrismaClient();

    // Check if port is already in use (if specified)
    if (port) {
      const existingServer = await prisma.server.findFirst({
        where: { port }
      });

      if (existingServer) {
        throw new AppError(`Port ${port} is already in use`, 409, 'PORT_IN_USE');
      }
    }

    const server = await prisma.server.create({
      data: {
        name,
        description,
        gameType,
        gameVersion,
        region,
        maxPlayers,
        port,
        isPublic,
        tags,
        ownerId: userId
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    // Add owner as a member with OWNER role
    await prisma.serverMember.create({
      data: {
        serverId: server.id,
        userId: userId,
        role: 'OWNER'
      }
    });

    logUserActivity(userId, 'server_created', {
      serverId: server.id,
      serverName: server.name
    });

    res.status(201).json({
      success: true,
      data: { server },
      message: 'Server created successfully'
    });
  })
);

// Get server details
router.get('/:serverId',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR', 'VIP', 'MEMBER']),
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const prisma = getPrismaClient();

    const server = await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          },
          orderBy: [
            { role: 'asc' },
            { joinedAt: 'asc' }
          ]
        },
        _count: {
          select: {
            metrics: true,
            alerts: true,
            configurations: true
          }
        }
      }
    });

    if (!server) {
      throw new NotFoundError('Server');
    }

    res.json({
      success: true,
      data: { server }
    });
  })
);

// Update server
router.put('/:serverId',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('name').optional().isLength({ min: 1, max: 100 }),
    body('description').optional().isLength({ max: 500 }),
    body('gameVersion').optional().isLength({ max: 50 }),
    body('maxPlayers').optional().isInt({ min: 1, max: 1000 }),
    body('isPublic').optional().isBoolean(),
    body('tags').optional().isArray()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid server data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    const server = await prisma.server.update({
      where: { id: serverId },
      data: req.body,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    });

    logUserActivity(userId, 'server_updated', {
      serverId: server.id,
      serverName: server.name
    });

    res.json({
      success: true,
      data: { server },
      message: 'Server updated successfully'
    });
  })
);

// Delete server
router.delete('/:serverId',
  requireServerAccess(['OWNER']),
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Get server info before deletion
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { name: true, ownerId: true }
    });

    if (!server) {
      throw new NotFoundError('Server');
    }

    // Verify ownership
    if (server.ownerId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AuthorizationError('Only server owners can delete servers');
    }

    // Delete server (cascade will handle related records)
    await prisma.server.delete({
      where: { id: serverId }
    });

    logUserActivity(userId, 'server_deleted', {
      serverId: serverId,
      serverName: server.name
    });

    res.json({
      success: true,
      message: 'Server deleted successfully'
    });
  })
);

// Get server members
router.get('/:serverId/members',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR', 'VIP', 'MEMBER']),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['MEMBER', 'VIP', 'MODERATOR', 'ADMIN', 'OWNER'])
  ],
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const role = req.query.role as string;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      serverId,
      ...(role && { role })
    };

    const [members, total] = await Promise.all([
      prisma.serverMember.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatarUrl: true
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: [
          { role: 'asc' },
          { joinedAt: 'asc' }
        ]
      }),
      prisma.serverMember.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        members,
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

// Add member to server
router.post('/:serverId/members',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('role').optional().isIn(['MEMBER', 'VIP', 'MODERATOR', 'ADMIN']).withMessage('Invalid role')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid member data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const { userId: targetUserId, role = 'MEMBER' } = req.body;
    const currentUserId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, username: true, isActive: true }
    });

    if (!targetUser || !targetUser.isActive) {
      throw new NotFoundError('User');
    }

    // Check if user is already a member
    const existingMember = await prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId
        }
      }
    });

    if (existingMember) {
      throw new AppError('User is already a member of this server', 409, 'ALREADY_MEMBER');
    }

    // Add member
    const member = await prisma.serverMember.create({
      data: {
        serverId,
        userId: targetUserId,
        role
      },
      include: {
        user: {
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

    logUserActivity(currentUserId, 'member_added', {
      serverId,
      targetUserId,
      role
    });

    res.status(201).json({
      success: true,
      data: { member },
      message: 'Member added successfully'
    });
  })
);

// Update member role
router.patch('/:serverId/members/:userId',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('role').isIn(['MEMBER', 'VIP', 'MODERATOR', 'ADMIN']).withMessage('Invalid role')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid role data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const targetUserId = req.params.userId;
    const { role } = req.body;
    const currentUserId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if member exists
    const member = await prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId
        }
      }
    });

    if (!member) {
      throw new NotFoundError('Member');
    }

    // Update member role
    const updatedMember = await prisma.serverMember.update({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId
        }
      },
      data: { role },
      include: {
        user: {
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

    logUserActivity(currentUserId, 'member_role_updated', {
      serverId,
      targetUserId,
      oldRole: member.role,
      newRole: role
    });

    res.json({
      success: true,
      data: { member: updatedMember },
      message: 'Member role updated successfully'
    });
  })
);

// Remove member from server
router.delete('/:serverId/members/:userId',
  requireServerAccess(['OWNER', 'ADMIN']),
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const targetUserId = req.params.userId;
    const currentUserId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if member exists
    const member = await prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId
        }
      }
    });

    if (!member) {
      throw new NotFoundError('Member');
    }

    // Cannot remove server owner
    if (member.role === 'OWNER') {
      throw new AppError('Cannot remove server owner', 400, 'CANNOT_REMOVE_OWNER');
    }

    // Remove member
    await prisma.serverMember.delete({
      where: {
        serverId_userId: {
          serverId,
          userId: targetUserId
        }
      }
    });

    logUserActivity(currentUserId, 'member_removed', {
      serverId,
      targetUserId,
      role: member.role
    });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  })
);

export default router;