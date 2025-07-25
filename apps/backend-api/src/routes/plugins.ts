import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireRole, requireServerAccess } from '@/middleware/auth';
import { AppError, NotFoundError, ValidationError } from '@/utils/errors';
import { logUserActivity } from '@/utils/logger';

const router = express.Router();

// Get plugins marketplace
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('search').optional().isLength({ min: 1 }),
    query('category').optional().isLength({ min: 1 }),
    query('gameVersion').optional().isLength({ min: 1 }),
    query('isPremium').optional().isBoolean(),
    query('isVerified').optional().isBoolean(),
    query('sortBy').optional().isIn(['downloads', 'rating', 'created', 'updated', 'name'])
  ],
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const gameVersion = req.query.gameVersion as string;
    const isPremium = req.query.isPremium !== undefined ? req.query.isPremium === 'true' : undefined;
    const isVerified = req.query.isVerified !== undefined ? req.query.isVerified === 'true' : undefined;
    const sortBy = req.query.sortBy as string || 'downloads';
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      publishedAt: { not: null },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { displayName: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } }
        ]
      }),
      ...(category && { category }),
      ...(gameVersion && { gameVersions: { has: gameVersion } }),
      ...(isPremium !== undefined && { isPremium }),
      ...(isVerified !== undefined && { isVerified })
    };

    const orderBy = {
      downloads: { downloads: 'desc' as const },
      rating: { rating: 'desc' as const },
      created: { createdAt: 'desc' as const },
      updated: { updatedAt: 'desc' as const },
      name: { displayName: 'asc' as const }
    }[sortBy] || { downloads: 'desc' as const };

    const [plugins, total] = await Promise.all([
      prisma.plugin.findMany({
        where,
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          version: true,
          author: true,
          category: true,
          tags: true,
          price: true,
          isPremium: true,
          isVerified: true,
          rating: true,
          downloads: true,
          fileSize: true,
          gameVersions: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true
        },
        skip: offset,
        take: limit,
        orderBy
      }),
      prisma.plugin.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        plugins,
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

// Get plugin details
router.get('/:pluginId',
  asyncHandler(async (req, res) => {
    const pluginId = req.params.pluginId;
    const prisma = getPrismaClient();

    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            serverPlugins: true
          }
        }
      }
    });

    if (!plugin) {
      throw new NotFoundError('Plugin');
    }

    res.json({
      success: true,
      data: { plugin }
    });
  })
);

// Upload/Create plugin (for developers)
router.post('/',
  requireRole(['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']),
  [
    body('name').isLength({ min: 1, max: 100 }).withMessage('Plugin name must be 1-100 characters'),
    body('displayName').isLength({ min: 1, max: 100 }).withMessage('Display name must be 1-100 characters'),
    body('description').isLength({ min: 1, max: 1000 }).withMessage('Description must be 1-1000 characters'),
    body('version').matches(/^\d+\.\d+\.\d+$/).withMessage('Version must be in format x.y.z'),
    body('author').isLength({ min: 1, max: 100 }).withMessage('Author name is required'),
    body('category').isLength({ min: 1, max: 50 }).withMessage('Category is required'),
    body('tags').isArray().withMessage('Tags must be an array'),
    body('downloadUrl').isURL().withMessage('Valid download URL is required'),
    body('fileSize').isInt({ min: 1 }).withMessage('File size must be a positive integer'),
    body('checksum').isLength({ min: 1 }).withMessage('File checksum is required'),
    body('gameVersions').isArray().withMessage('Game versions must be an array'),
    body('price').optional().isFloat({ min: 0 }),
    body('readme').optional().isLength({ max: 10000 }),
    body('changelog').optional().isLength({ max: 5000 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid plugin data', {
        validationErrors: errors.array()
      });
    }

    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if plugin name already exists
    const existingPlugin = await prisma.plugin.findUnique({
      where: { name: req.body.name }
    });

    if (existingPlugin) {
      throw new AppError('Plugin with this name already exists', 409, 'PLUGIN_EXISTS');
    }

    const plugin = await prisma.plugin.create({
      data: {
        ...req.body,
        isPremium: (req.body.price || 0) > 0,
        isVerified: req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
      }
    });

    // Create initial version
    await prisma.pluginVersion.create({
      data: {
        pluginId: plugin.id,
        version: req.body.version,
        downloadUrl: req.body.downloadUrl,
        fileSize: req.body.fileSize,
        checksum: req.body.checksum,
        changelog: req.body.changelog,
        gameVersions: req.body.gameVersions
      }
    });

    logUserActivity(userId, 'plugin_created', {
      pluginId: plugin.id,
      pluginName: plugin.name
    });

    res.status(201).json({
      success: true,
      data: { plugin },
      message: 'Plugin created successfully'
    });
  })
);

// Update plugin
router.put('/:pluginId',
  requireRole(['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN']),
  asyncHandler(async (req, res) => {
    const pluginId = req.params.pluginId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if plugin exists and user has permission
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new NotFoundError('Plugin');
    }

    // Only allow updates by admin users (in a real app, you'd check plugin ownership)
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      throw new AppError('Insufficient permissions to update plugin', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    const updatedPlugin = await prisma.plugin.update({
      where: { id: pluginId },
      data: req.body
    });

    logUserActivity(userId, 'plugin_updated', {
      pluginId: plugin.id,
      pluginName: plugin.name
    });

    res.json({
      success: true,
      data: { plugin: updatedPlugin },
      message: 'Plugin updated successfully'
    });
  })
);

// Install plugin on server
router.post('/:pluginId/install',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('serverId').notEmpty().withMessage('Server ID is required'),
    body('version').optional().matches(/^\d+\.\d+\.\d+$/),
    body('autoUpdate').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid installation data', {
        validationErrors: errors.array()
      });
    }

    const pluginId = req.params.pluginId;
    const { serverId, version, autoUpdate = false } = req.body;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if plugin exists
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId },
      select: {
        id: true,
        name: true,
        version: true,
        isPremium: true,
        price: true
      }
    });

    if (!plugin) {
      throw new NotFoundError('Plugin');
    }

    // Check if already installed
    const existingInstallation = await prisma.serverPlugin.findUnique({
      where: {
        serverId_pluginId: {
          serverId,
          pluginId
        }
      }
    });

    if (existingInstallation) {
      throw new AppError('Plugin already installed on this server', 409, 'PLUGIN_ALREADY_INSTALLED');
    }

    // Install plugin
    const installation = await prisma.serverPlugin.create({
      data: {
        serverId,
        pluginId,
        version: version || plugin.version,
        autoUpdate
      },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            displayName: true,
            version: true
          }
        }
      }
    });

    // Increment download count
    await prisma.plugin.update({
      where: { id: pluginId },
      data: {
        downloads: {
          increment: 1
        }
      }
    });

    logUserActivity(userId, 'plugin_installed', {
      pluginId: plugin.id,
      pluginName: plugin.name,
      serverId: serverId
    });

    res.status(201).json({
      success: true,
      data: { installation },
      message: 'Plugin installed successfully'
    });
  })
);

// Get server plugins
router.get('/server/:serverId',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR', 'VIP', 'MEMBER']),
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const prisma = getPrismaClient();

    const plugins = await prisma.serverPlugin.findMany({
      where: { serverId },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true,
            author: true,
            category: true,
            isVerified: true,
            rating: true
          }
        }
      },
      orderBy: { installedAt: 'desc' }
    });

    res.json({
      success: true,
      data: { plugins }
    });
  })
);

// Update plugin configuration
router.patch('/:pluginId/config',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('serverId').notEmpty().withMessage('Server ID is required'),
    body('enabled').optional().isBoolean(),
    body('config').optional().isObject(),
    body('autoUpdate').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid configuration data', {
        validationErrors: errors.array()
      });
    }

    const pluginId = req.params.pluginId;
    const { serverId, enabled, config, autoUpdate } = req.body;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if plugin is installed
    const installation = await prisma.serverPlugin.findUnique({
      where: {
        serverId_pluginId: {
          serverId,
          pluginId
        }
      }
    });

    if (!installation) {
      throw new NotFoundError('Plugin installation');
    }

    // Update configuration
    const updatedInstallation = await prisma.serverPlugin.update({
      where: {
        serverId_pluginId: {
          serverId,
          pluginId
        }
      },
      data: {
        ...(enabled !== undefined && { enabled }),
        ...(config && { config }),
        ...(autoUpdate !== undefined && { autoUpdate })
      },
      include: {
        plugin: {
          select: {
            id: true,
            name: true,
            displayName: true
          }
        }
      }
    });

    logUserActivity(userId, 'plugin_configured', {
      pluginId: pluginId,
      serverId: serverId
    });

    res.json({
      success: true,
      data: { installation: updatedInstallation },
      message: 'Plugin configuration updated successfully'
    });
  })
);

// Uninstall plugin
router.delete('/:pluginId/uninstall',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('serverId').notEmpty().withMessage('Server ID is required')
  ],
  asyncHandler(async (req, res) => {
    const pluginId = req.params.pluginId;
    const { serverId } = req.body;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Check if plugin is installed
    const installation = await prisma.serverPlugin.findUnique({
      where: {
        serverId_pluginId: {
          serverId,
          pluginId
        }
      },
      include: {
        plugin: {
          select: {
            name: true
          }
        }
      }
    });

    if (!installation) {
      throw new NotFoundError('Plugin installation');
    }

    // Remove installation
    await prisma.serverPlugin.delete({
      where: {
        serverId_pluginId: {
          serverId,
          pluginId
        }
      }
    });

    logUserActivity(userId, 'plugin_uninstalled', {
      pluginId: pluginId,
      pluginName: installation.plugin.name,
      serverId: serverId
    });

    res.json({
      success: true,
      message: 'Plugin uninstalled successfully'
    });
  })
);

// Create plugin review
router.post('/:pluginId/reviews',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must not exceed 1000 characters'),
    body('version').matches(/^\d+\.\d+\.\d+$/).withMessage('Version must be in format x.y.z')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid review data', {
        validationErrors: errors.array()
      });
    }

    const pluginId = req.params.pluginId;
    const userId = req.user!.id;
    const { rating, comment, version } = req.body;
    const prisma = getPrismaClient();

    // Check if plugin exists
    const plugin = await prisma.plugin.findUnique({
      where: { id: pluginId }
    });

    if (!plugin) {
      throw new NotFoundError('Plugin');
    }

    // Check if user already reviewed this plugin
    const existingReview = await prisma.pluginReview.findUnique({
      where: {
        pluginId_userId: {
          pluginId,
          userId
        }
      }
    });

    if (existingReview) {
      // Update existing review
      const review = await prisma.pluginReview.update({
        where: {
          pluginId_userId: {
            pluginId,
            userId
          }
        },
        data: {
          rating,
          comment,
          version
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

      res.json({
        success: true,
        data: { review },
        message: 'Review updated successfully'
      });
    } else {
      // Create new review
      const review = await prisma.pluginReview.create({
        data: {
          pluginId,
          userId,
          rating,
          comment,
          version
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

      res.status(201).json({
        success: true,
        data: { review },
        message: 'Review created successfully'
      });
    }

    // Update plugin rating (simplified calculation)
    const reviews = await prisma.pluginReview.findMany({
      where: { pluginId },
      select: { rating: true }
    });

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await prisma.plugin.update({
      where: { id: pluginId },
      data: {
        rating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
      }
    });

    logUserActivity(userId, 'plugin_reviewed', {
      pluginId: pluginId,
      rating: rating
    });
  })
);

export default router;