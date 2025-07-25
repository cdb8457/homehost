import { apiClient, ApiResponse, PaginatedResponse } from '../api-client';

// Monitoring types
export interface ServerMetric {
  id: string;
  serverId: string;
  metricType: 'cpu' | 'memory' | 'disk' | 'network' | 'players';
  value: number;
  unit: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface Alert {
  id: string;
  serverId: string;
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  metadata: Record<string, any>;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes?: string;
  server?: {
    id: string;
    name: string;
    gameType: string;
    owner: {
      id: string;
      username: string;
    };
  };
}

export interface MetricsSummary {
  server: {
    id: string;
    name: string;
    isOnline: boolean;
    currentPlayers: number;
    maxPlayers: number;
    lastHeartbeat?: string;
  };
  metrics: Record<string, ServerMetric>;
  uptime: number;
  lastUpdated: string;
}

export interface AlertStatistics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  acknowledgedAlerts: number;
  resolvedRate: number;
  avgResolutionTimeMs: number;
  severityBreakdown: Record<string, number>;
  typeBreakdown: Record<string, number>;
  gameTypeBreakdown?: Record<string, number>;
  timeRange: string;
}

export interface CreateMetricRequest {
  metricType: 'cpu' | 'memory' | 'disk' | 'network' | 'players';
  value: number;
  unit?: string;
  metadata?: Record<string, any>;
}

export interface CreateAlertRequest {
  type: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata?: Record<string, any>;
}

export interface UpdateAlertRequest {
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  notes?: string;
}

export interface BulkUpdateAlertsRequest {
  alertIds: string[];
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  notes?: string;
}

export class MonitoringApi {
  // Get overall monitoring stats
  async getOverallStats(): Promise<ApiResponse<{ 
    activeServers: number;
    totalPlayers: number;
    uptime: string;
    revenue: number;
  }>> {
    return apiClient.get('/monitoring/overview');
  }

  // Get server metrics
  async getServerMetrics(serverId: string, params?: {
    timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
    metricType?: 'cpu' | 'memory' | 'disk' | 'network' | 'players';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ServerMetric>> {
    return apiClient.get(`/monitoring/servers/${serverId}/metrics`, params);
  }

  // Get server metrics summary
  async getServerMetricsSummary(serverId: string): Promise<ApiResponse<MetricsSummary>> {
    return apiClient.get(`/monitoring/servers/${serverId}/metrics/summary`);
  }

  // Create server metric
  async createServerMetric(serverId: string, metricData: CreateMetricRequest): Promise<ApiResponse<{ metric: ServerMetric }>> {
    return apiClient.post(`/monitoring/servers/${serverId}/metrics`, metricData);
  }

  // Get server alerts
  async getServerAlerts(serverId: string, params?: {
    status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Alert>> {
    return apiClient.get(`/monitoring/servers/${serverId}/alerts`, params);
  }

  // Create server alert
  async createServerAlert(serverId: string, alertData: CreateAlertRequest): Promise<ApiResponse<{ alert: Alert }>> {
    return apiClient.post(`/monitoring/servers/${serverId}/alerts`, alertData);
  }

  // Update alert status
  async updateAlert(alertId: string, updates: UpdateAlertRequest): Promise<ApiResponse<{ alert: Alert }>> {
    return apiClient.patch(`/monitoring/alerts/${alertId}`, updates);
  }

  // Get alert statistics for server
  async getServerAlertStatistics(serverId: string, params?: {
    timeRange?: '24h' | '7d' | '30d' | '90d';
  }): Promise<ApiResponse<AlertStatistics>> {
    return apiClient.get(`/monitoring/servers/${serverId}/alerts/stats`, params);
  }

  // Get all alerts (admin only)
  async getAllAlerts(params?: {
    status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Alert>> {
    return apiClient.get('/alerts', params);
  }

  // Get alert details
  async getAlert(alertId: string): Promise<ApiResponse<{ alert: Alert }>> {
    return apiClient.get(`/alerts/${alertId}`);
  }

  // Get global alert statistics (admin only)
  async getGlobalAlertStatistics(params?: {
    timeRange?: '24h' | '7d' | '30d' | '90d';
  }): Promise<ApiResponse<AlertStatistics>> {
    return apiClient.get('/alerts/stats/overview', params);
  }

  // Bulk update alerts (admin only)
  async bulkUpdateAlerts(updateData: BulkUpdateAlertsRequest): Promise<ApiResponse<{
    updatedAlerts: number;
    status: string;
  }>> {
    return apiClient.patch('/alerts/bulk-update', updateData);
  }
}

export const monitoringApi = new MonitoringApi();