import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireRole } from '@/middleware/auth';
import { AppError, NotFoundError, ValidationError } from '@/utils/errors';
import { logUserActivity } from '@/utils/logger';

const router = express.Router();

// Get all alerts (admin only)
router.get('/',
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  [
    query('status').optional().isIn(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']),
    query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  asyncHandler(async (req, res) => {
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      ...(status && { status }),
      ...(severity && { severity })
    };

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          server: {
            select: {
              id: true,
              name: true,
              gameType: true,
              owner: {
                select: {
                  id: true,
                  username: true
                }
              }
            }
          }
        },
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.alert.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        alerts,
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

// Get alert details
router.get('/:alertId',
  asyncHandler(async (req, res) => {
    const alertId = req.params.alertId;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            gameType: true,
            owner: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    // Check if user has access to this alert
    if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user!.role)) {
      // Check if user is server owner or member
      const serverMember = await prisma.serverMember.findUnique({
        where: {
          serverId_userId: {
            serverId: alert.server.id,
            userId
          }
        }
      });

      if (!serverMember || !['OWNER', 'ADMIN', 'MODERATOR'].includes(serverMember.role)) {
        throw new AppError('Insufficient permissions to view this alert', 403, 'INSUFFICIENT_PERMISSIONS');
      }
    }

    res.json({
      success: true,
      data: { alert }
    });
  })
);

// Get alert statistics
router.get('/stats/overview',
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  [
    query('timeRange').optional().isIn(['24h', '7d', '30d', '90d'])
  ],
  asyncHandler(async (req, res) => {
    const timeRange = req.query.timeRange as string || '30d';
    const prisma = getPrismaClient();

    // Calculate time range
    const timeRangeMap = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };

    const timeRangeMs = timeRangeMap[timeRange as keyof typeof timeRangeMap];
    const startTime = new Date(Date.now() - timeRangeMs);

    const alerts = await prisma.alert.findMany({
      where: {
        createdAt: { gte: startTime }
      },
      select: {
        id: true,
        type: true,
        severity: true,
        status: true,
        createdAt: true,
        resolvedAt: true,
        server: {
          select: {
            id: true,
            name: true,
            gameType: true
          }
        }
      }
    });

    // Calculate statistics
    const totalAlerts = alerts.length;
    const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;
    const resolvedAlerts = alerts.filter(a => a.status === 'RESOLVED').length;
    
    const severityCount = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeCount = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const gameTypeCount = alerts.reduce((acc, alert) => {
      acc[alert.server.gameType] = (acc[alert.server.gameType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time
    const resolvedAlertsWithTime = alerts.filter(a => a.resolvedAt && a.createdAt);
    const avgResolutionTime = resolvedAlertsWithTime.length > 0
      ? resolvedAlertsWithTime.reduce((sum, alert) => {
          return sum + (alert.resolvedAt!.getTime() - alert.createdAt.getTime());
        }, 0) / resolvedAlertsWithTime.length
      : 0;

    res.json({
      success: true,
      data: {
        totalAlerts,
        activeAlerts,
        resolvedAlerts,
        acknowledgedAlerts: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
        resolvedRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0,
        avgResolutionTimeMs: avgResolutionTime,
        severityBreakdown: severityCount,
        typeBreakdown: typeCount,
        gameTypeBreakdown: gameTypeCount,
        timeRange
      }
    });
  })
);

// Bulk update alerts
router.patch('/bulk-update',
  requireRole(['ADMIN', 'SUPER_ADMIN']),
  [
    body('alertIds').isArray().withMessage('Alert IDs must be an array'),
    body('alertIds.*').notEmpty().withMessage('Alert ID is required'),
    body('status').isIn(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']).withMessage('Invalid status'),
    body('notes').optional().isLength({ max: 1000 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid bulk update data', {
        validationErrors: errors.array()
      });
    }

    const { alertIds, status, notes } = req.body;
    const userId = req.user!.id;
    const prisma = getPrismaClient();

    // Verify all alerts exist
    const alerts = await prisma.alert.findMany({
      where: { id: { in: alertIds } },
      select: { id: true, status: true }
    });

    if (alerts.length !== alertIds.length) {
      throw new NotFoundError('Some alerts not found');
    }

    // Update alerts
    const updateData: any = {
      status,
      notes
    };

    if (status === 'ACKNOWLEDGED') {
      updateData.acknowledgedAt = new Date();
    } else if (status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
    }

    await prisma.alert.updateMany({
      where: { id: { in: alertIds } },
      data: updateData
    });

    logUserActivity(userId, 'bulk_alert_update', {
      alertIds,
      status,
      totalUpdated: alertIds.length
    });

    res.json({
      success: true,
      data: {
        updatedAlerts: alertIds.length,
        status
      },
      message: `${alertIds.length} alerts updated successfully`
    });
  })
);

export default router;