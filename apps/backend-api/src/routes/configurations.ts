import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireServerAccess } from '@/middleware/auth';
import { AppError, NotFoundError, ValidationError } from '@/utils/errors';
import { logUserActivity } from '@/utils/logger';

const router = express.Router();

// Get server configurations
router.get('/servers/:serverId',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR']),
  [
    query('category').optional().isLength({ min: 1, max: 50 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      serverId,
      ...(category && { category })
    };

    const [configurations, total] = await Promise.all([
      prisma.configuration.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { key: 'asc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.configuration.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        configurations,
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

// Get specific configuration
router.get('/servers/:serverId/:configId',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR']),
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const configId = req.params.configId;
    const prisma = getPrismaClient();

    const configuration = await prisma.configuration.findUnique({
      where: { id: configId },
      include: {
        server: {
          select: { id: true, name: true }
        }
      }
    });

    if (!configuration || configuration.serverId !== serverId) {
      throw new NotFoundError('Configuration');
    }

    res.json({
      success: true,
      data: { configuration }
    });
  })
);

// Create server configuration
router.post('/servers/:serverId',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('key').isLength({ min: 1, max: 100 }).withMessage('Configuration key is required'),
    body('value').notEmpty().withMessage('Configuration value is required'),
    body('category').isLength({ min: 1, max: 50 }).withMessage('Category is required'),
    body('dataType').isIn(['STRING', 'NUMBER', 'BOOLEAN', 'JSON']).withMessage('Invalid data type'),
    body('description').optional().isLength({ max: 500 }),
    body('isRequired').optional().isBoolean(),
    body('isSecret').optional().isBoolean(),
    body('validation').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid configuration data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const userId = req.user!.id;
    const {
      key,
      value,
      category,
      dataType,
      description,
      isRequired = false,
      isSecret = false,
      validation
    } = req.body;

    const prisma = getPrismaClient();

    // Check if configuration key already exists for this server
    const existingConfig = await prisma.configuration.findFirst({
      where: {
        serverId,
        key
      }
    });

    if (existingConfig) {
      throw new AppError('Configuration key already exists for this server', 409, 'CONFIG_EXISTS');
    }

    // Validate value based on data type
    let parsedValue = value;
    try {
      switch (dataType) {
        case 'NUMBER':
          parsedValue = parseFloat(value);
          if (isNaN(parsedValue)) {
            throw new ValidationError('Invalid number value');
          }
          break;
        case 'BOOLEAN':
          parsedValue = value === 'true' || value === true;
          break;
        case 'JSON':
          if (typeof value === 'string') {
            parsedValue = JSON.parse(value);
          }
          break;
        default:
          parsedValue = String(value);
      }
    } catch (error) {
      throw new ValidationError(`Invalid ${dataType.toLowerCase()} value`);
    }

    const configuration = await prisma.configuration.create({
      data: {
        serverId,
        key,
        value: parsedValue,
        category,
        dataType,
        description,
        isRequired,
        isSecret,
        validation: validation || {}
      },
      include: {
        server: {
          select: { id: true, name: true }
        }
      }
    });

    logUserActivity(userId, 'configuration_created', {
      serverId,
      configId: configuration.id,
      key,
      category
    });

    res.status(201).json({
      success: true,
      data: { configuration },
      message: 'Configuration created successfully'
    });
  })
);

// Update server configuration
router.put('/servers/:serverId/:configId',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('value').notEmpty().withMessage('Configuration value is required'),
    body('description').optional().isLength({ max: 500 }),
    body('isRequired').optional().isBoolean(),
    body('isSecret').optional().isBoolean(),
    body('validation').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid configuration data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const configId = req.params.configId;
    const userId = req.user!.id;
    const { value, description, isRequired, isSecret, validation } = req.body;

    const prisma = getPrismaClient();

    // Get existing configuration
    const existingConfig = await prisma.configuration.findUnique({
      where: { id: configId }
    });

    if (!existingConfig || existingConfig.serverId !== serverId) {
      throw new NotFoundError('Configuration');
    }

    // Validate value based on data type
    let parsedValue = value;
    try {
      switch (existingConfig.dataType) {
        case 'NUMBER':
          parsedValue = parseFloat(value);
          if (isNaN(parsedValue)) {
            throw new ValidationError('Invalid number value');
          }
          break;
        case 'BOOLEAN':
          parsedValue = value === 'true' || value === true;
          break;
        case 'JSON':
          if (typeof value === 'string') {
            parsedValue = JSON.parse(value);
          }
          break;
        default:
          parsedValue = String(value);
      }
    } catch (error) {
      throw new ValidationError(`Invalid ${existingConfig.dataType.toLowerCase()} value`);
    }

    const configuration = await prisma.configuration.update({
      where: { id: configId },
      data: {
        value: parsedValue,
        description,
        isRequired,
        isSecret,
        validation: validation || existingConfig.validation
      },
      include: {
        server: {
          select: { id: true, name: true }
        }
      }
    });

    logUserActivity(userId, 'configuration_updated', {
      serverId,
      configId: configuration.id,
      key: configuration.key,
      category: configuration.category
    });

    res.json({
      success: true,
      data: { configuration },
      message: 'Configuration updated successfully'
    });
  })
);

// Delete server configuration
router.delete('/servers/:serverId/:configId',
  requireServerAccess(['OWNER', 'ADMIN']),
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const configId = req.params.configId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Get existing configuration
    const existingConfig = await prisma.configuration.findUnique({
      where: { id: configId }
    });

    if (!existingConfig || existingConfig.serverId !== serverId) {
      throw new NotFoundError('Configuration');
    }

    // Check if configuration is required
    if (existingConfig.isRequired) {
      throw new AppError('Cannot delete required configuration', 400, 'REQUIRED_CONFIG');
    }

    await prisma.configuration.delete({
      where: { id: configId }
    });

    logUserActivity(userId, 'configuration_deleted', {
      serverId,
      configId: existingConfig.id,
      key: existingConfig.key,
      category: existingConfig.category
    });

    res.json({
      success: true,
      message: 'Configuration deleted successfully'
    });
  })
);

// Get configuration templates
router.get('/templates',
  [
    query('category').optional().isLength({ min: 1, max: 50 }),
    query('gameType').optional().isLength({ min: 1, max: 50 }),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  asyncHandler(async (req, res) => {
    const category = req.query.category as string;
    const gameType = req.query.gameType as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      ...(category && { category }),
      ...(gameType && { gameType })
    };

    const [templates, total] = await Promise.all([
      prisma.configTemplate.findMany({
        where,
        orderBy: [
          { category: 'asc' },
          { name: 'asc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.configTemplate.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        templates,
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

// Apply configuration template to server
router.post('/servers/:serverId/apply-template',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('templateId').notEmpty().withMessage('Template ID is required'),
    body('overrideExisting').optional().isBoolean()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid template application data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const userId = req.user!.id;
    const { templateId, overrideExisting = false } = req.body;
    const prisma = getPrismaClient();

    // Get template
    const template = await prisma.configTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new NotFoundError('Configuration template');
    }

    // Get server to check game type compatibility
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: { gameType: true }
    });

    if (!server) {
      throw new NotFoundError('Server');
    }

    // Check game type compatibility
    if (template.gameType && template.gameType !== server.gameType) {
      throw new AppError('Template is not compatible with server game type', 400, 'INCOMPATIBLE_TEMPLATE');
    }

    // Get existing configurations
    const existingConfigs = await prisma.configuration.findMany({
      where: { serverId },
      select: { key: true }
    });

    const existingKeys = new Set(existingConfigs.map(c => c.key));
    const templateConfigs = template.defaultConfigs as any[];

    // Filter configurations to apply
    const configsToApply = templateConfigs.filter(config => {
      if (existingKeys.has(config.key)) {
        return overrideExisting;
      }
      return true;
    });

    // Apply configurations
    const appliedConfigs = [];
    for (const config of configsToApply) {
      if (existingKeys.has(config.key) && overrideExisting) {
        // Update existing configuration
        const updatedConfig = await prisma.configuration.updateMany({
          where: { serverId, key: config.key },
          data: {
            value: config.value,
            category: config.category,
            dataType: config.dataType,
            description: config.description,
            isRequired: config.isRequired || false,
            isSecret: config.isSecret || false,
            validation: config.validation || {}
          }
        });
        appliedConfigs.push({ key: config.key, action: 'updated' });
      } else if (!existingKeys.has(config.key)) {
        // Create new configuration
        await prisma.configuration.create({
          data: {
            serverId,
            key: config.key,
            value: config.value,
            category: config.category,
            dataType: config.dataType,
            description: config.description,
            isRequired: config.isRequired || false,
            isSecret: config.isSecret || false,
            validation: config.validation || {}
          }
        });
        appliedConfigs.push({ key: config.key, action: 'created' });
      }
    }

    logUserActivity(userId, 'template_applied', {
      serverId,
      templateId,
      templateName: template.name,
      configsApplied: appliedConfigs.length,
      overrideExisting
    });

    res.json({
      success: true,
      data: {
        template: {
          id: template.id,
          name: template.name,
          category: template.category
        },
        appliedConfigs,
        totalApplied: appliedConfigs.length
      },
      message: 'Template applied successfully'
    });
  })
);

// Bulk update configurations
router.patch('/servers/:serverId/bulk-update',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('configurations').isArray().withMessage('Configurations must be an array'),
    body('configurations.*.id').notEmpty().withMessage('Configuration ID is required'),
    body('configurations.*.value').notEmpty().withMessage('Configuration value is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid bulk update data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const userId = req.user!.id;
    const { configurations } = req.body;
    const prisma = getPrismaClient();

    const updatedConfigs = [];
    const errors_list = [];

    for (const config of configurations) {
      try {
        // Get existing configuration
        const existingConfig = await prisma.configuration.findUnique({
          where: { id: config.id }
        });

        if (!existingConfig || existingConfig.serverId !== serverId) {
          errors_list.push({ id: config.id, error: 'Configuration not found' });
          continue;
        }

        // Validate value based on data type
        let parsedValue = config.value;
        try {
          switch (existingConfig.dataType) {
            case 'NUMBER':
              parsedValue = parseFloat(config.value);
              if (isNaN(parsedValue)) {
                throw new Error('Invalid number value');
              }
              break;
            case 'BOOLEAN':
              parsedValue = config.value === 'true' || config.value === true;
              break;
            case 'JSON':
              if (typeof config.value === 'string') {
                parsedValue = JSON.parse(config.value);
              }
              break;
            default:
              parsedValue = String(config.value);
          }
        } catch (error) {
          errors_list.push({ id: config.id, error: `Invalid ${existingConfig.dataType.toLowerCase()} value` });
          continue;
        }

        // Update configuration
        const updatedConfig = await prisma.configuration.update({
          where: { id: config.id },
          data: { value: parsedValue }
        });

        updatedConfigs.push({
          id: updatedConfig.id,
          key: updatedConfig.key,
          value: updatedConfig.value
        });
      } catch (error) {
        errors_list.push({ id: config.id, error: (error as Error).message });
      }
    }

    logUserActivity(userId, 'bulk_configuration_update', {
      serverId,
      totalConfigurations: configurations.length,
      successfulUpdates: updatedConfigs.length,
      errors: errors_list.length
    });

    res.json({
      success: true,
      data: {
        updatedConfigurations: updatedConfigs,
        errors: errors_list,
        totalProcessed: configurations.length,
        successfulUpdates: updatedConfigs.length
      },
      message: `Bulk update completed. ${updatedConfigs.length} configurations updated successfully.`
    });
  })
);

export default router;