import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { getPrismaClient } from '@/config/database';
import { asyncHandler } from '@/middleware/errorHandler';
import { requireServerAccess } from '@/middleware/auth';
import { AppError, NotFoundError, ValidationError } from '@/utils/errors';
import { logUserActivity } from '@/utils/logger';

const router = express.Router();

// Get server metrics
router.get('/servers/:serverId/metrics',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR']),
  [
    query('timeRange').optional().isIn(['1h', '6h', '24h', '7d', '30d']),
    query('metricType').optional().isIn(['cpu', 'memory', 'disk', 'network', 'players']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 1000 })
  ],
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const timeRange = req.query.timeRange as string || '24h';
    const metricType = req.query.metricType as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    // Calculate time range
    const timeRangeMap = {
      '1h': 1 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };

    const timeRangeMs = timeRangeMap[timeRange as keyof typeof timeRangeMap];
    const startTime = new Date(Date.now() - timeRangeMs);

    const where = {
      serverId,
      timestamp: { gte: startTime },
      ...(metricType && { metricType })
    };

    const [metrics, total] = await Promise.all([
      prisma.serverMetric.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.serverMetric.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        metrics,
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

// Get server metrics summary
router.get('/servers/:serverId/metrics/summary',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR']),
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const prisma = getPrismaClient();

    // Get latest metrics for each type
    const latestMetrics = await prisma.serverMetric.findMany({
      where: { serverId },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    // Group by metric type and get the latest value
    const metricsSummary = latestMetrics.reduce((acc, metric) => {
      if (!acc[metric.metricType] || metric.timestamp > acc[metric.metricType].timestamp) {
        acc[metric.metricType] = metric;
      }
      return acc;
    }, {} as Record<string, any>);

    // Get server status
    const server = await prisma.server.findUnique({
      where: { id: serverId },
      select: {
        id: true,
        name: true,
        isOnline: true,
        currentPlayers: true,
        maxPlayers: true,
        lastHeartbeat: true
      }
    });

    if (!server) {
      throw new NotFoundError('Server');
    }

    // Calculate uptime
    const uptime = server.lastHeartbeat 
      ? Math.floor((Date.now() - server.lastHeartbeat.getTime()) / 1000)
      : 0;

    res.json({
      success: true,
      data: {
        server,
        metrics: metricsSummary,
        uptime,
        lastUpdated: new Date()
      }
    });
  })
);

// Create server metric
router.post('/servers/:serverId/metrics',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('metricType').isIn(['cpu', 'memory', 'disk', 'network', 'players']).withMessage('Invalid metric type'),
    body('value').isFloat({ min: 0 }).withMessage('Value must be a positive number'),
    body('unit').optional().isLength({ max: 20 }),
    body('metadata').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid metric data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const { metricType, value, unit, metadata } = req.body;
    const prisma = getPrismaClient();

    const metric = await prisma.serverMetric.create({
      data: {
        serverId,
        metricType,
        value,
        unit,
        metadata: metadata || {}
      }
    });

    res.status(201).json({
      success: true,
      data: { metric },
      message: 'Metric created successfully'
    });
  })
);

// Get server alerts
router.get('/servers/:serverId/alerts',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR']),
  [
    query('status').optional().isIn(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']),
    query('severity').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
    const status = req.query.status as string;
    const severity = req.query.severity as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const prisma = getPrismaClient();

    const where = {
      serverId,
      ...(status && { status }),
      ...(severity && { severity })
    };

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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

// Create server alert
router.post('/servers/:serverId/alerts',
  requireServerAccess(['OWNER', 'ADMIN']),
  [
    body('type').isLength({ min: 1, max: 50 }).withMessage('Alert type is required'),
    body('message').isLength({ min: 1, max: 500 }).withMessage('Alert message is required'),
    body('severity').isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid severity'),
    body('metadata').optional().isObject()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid alert data', {
        validationErrors: errors.array()
      });
    }

    const serverId = req.params.serverId;
    const userId = req.user!.id;
    const { type, message, severity, metadata } = req.body;
    const prisma = getPrismaClient();

    const alert = await prisma.alert.create({
      data: {
        serverId,
        type,
        message,
        severity,
        metadata: metadata || {}
      }
    });

    logUserActivity(userId, 'alert_created', {
      serverId,
      alertId: alert.id,
      type,
      severity
    });

    res.status(201).json({
      success: true,
      data: { alert },
      message: 'Alert created successfully'
    });
  })
);

// Update alert status
router.patch('/alerts/:alertId',
  [
    body('status').isIn(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']).withMessage('Invalid status'),
    body('notes').optional().isLength({ max: 1000 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Invalid alert update data', {
        validationErrors: errors.array()
      });
    }

    const alertId = req.params.alertId;
    const userId = req.user!.id;
    const { status, notes } = req.body;
    const prisma = getPrismaClient();

    // Check if alert exists and user has access
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        server: {
          select: { id: true }
        }
      }
    });

    if (!alert) {
      throw new NotFoundError('Alert');
    }

    // Check server access
    const serverMember = await prisma.serverMember.findUnique({
      where: {
        serverId_userId: {
          serverId: alert.server.id,
          userId
        }
      }
    });

    if (!serverMember || !['OWNER', 'ADMIN', 'MODERATOR'].includes(serverMember.role)) {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status,
        notes,
        ...(status === 'ACKNOWLEDGED' && { acknowledgedAt: new Date() }),
        ...(status === 'RESOLVED' && { resolvedAt: new Date() })
      }
    });

    logUserActivity(userId, 'alert_updated', {
      alertId,
      serverId: alert.server.id,
      status,
      oldStatus: alert.status
    });

    res.json({
      success: true,
      data: { alert: updatedAlert },
      message: 'Alert updated successfully'
    });
  })
);

// Get alert statistics
router.get('/servers/:serverId/alerts/stats',
  requireServerAccess(['OWNER', 'ADMIN', 'MODERATOR']),
  [
    query('timeRange').optional().isIn(['24h', '7d', '30d', '90d'])
  ],
  asyncHandler(async (req, res) => {
    const serverId = req.params.serverId;
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
        serverId,
        createdAt: { gte: startTime }
      },
      select: {
        id: true,
        type: true,
        severity: true,
        status: true,
        createdAt: true,
        resolvedAt: true
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
        resolvedRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts) * 100 : 0,
        avgResolutionTimeMs: avgResolutionTime,
        severityBreakdown: severityCount,
        typeBreakdown: typeCount,
        timeRange
      }
    });
  })
);

export default router;