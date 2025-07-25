'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Wrench,
  Server,
  Cpu,
  HardDrive,
  Network,
  Database,
  Thermometer,
  Battery,
  Shield,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Eye,
  Settings,
  Bell,
  BellOff,
  Play,
  Pause,
  RefreshCw,
  Download,
  ExternalLink,
  Info,
  AlertCircle,
  XCircle,
  Timer,
  Gauge,
  BarChart3,
  LineChart,
  PieChart,
  Star,
  Award,
  Lightbulb,
  Crystal,
  Sparkles,
  Globe,
  Users,
  MessageCircle,
  Search,
  Filter,
  X,
  Plus,
  Edit,
  Save,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface MaintenanceAlert {
  id: string;
  serverId: string;
  type: 'hardware' | 'software' | 'performance' | 'security' | 'capacity' | 'network';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  title: string;
  description: string;
  component: string;
  predictedFailureDate: string;
  confidence: number;
  timeToFailure: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  affectedServices: string[];
  recommendations: MaintenanceRecommendation[];
  preventativeActions: PreventativeAction[];
  healthMetrics: HealthMetric[];
  rootCause: string;
  estimatedDowntime: string;
  maintenanceWindow: string;
  priority: number;
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  tags: string[];
}

interface MaintenanceRecommendation {
  id: string;
  title: string;
  description: string;
  urgency: 'immediate' | 'soon' | 'scheduled' | 'monitor';
  estimatedTime: string;
  cost: number;
  savings: number;
  complexity: 'low' | 'medium' | 'high';
  prerequisites: string[];
  steps: string[];
  risks: string[];
}

interface PreventativeAction {
  id: string;
  title: string;
  description: string;
  type: 'automated' | 'manual' | 'scheduled';
  frequency: string;
  nextExecution: string;
  lastExecution?: string;
  success: boolean;
  enabled: boolean;
  parameters: Record<string, any>;
}

interface HealthMetric {
  name: string;
  current: number;
  threshold: number;
  unit: string;
  trend: 'improving' | 'stable' | 'degrading' | 'critical';
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface MaintenanceSchedule {
  id: string;
  serverId: string;
  title: string;
  description: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'upgrade';
  scheduledDate: string;
  estimatedDuration: string;
  technician: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  checklist: Array<{
    id: string;
    task: string;
    completed: boolean;
    notes?: string;
  }>;
  requiredDowntime: boolean;
  affectedSystems: string[];
  backupPlan: string;
  rollbackPlan: string;
}

interface PredictiveMaintenanceAlertsProps {
  serverId: string;
  serverName: string;
  realTime?: boolean;
}

export default function PredictiveMaintenanceAlerts({
  serverId,
  serverName,
  realTime = true
}: PredictiveMaintenanceAlertsProps) {
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'schedule' | 'history' | 'settings'>('alerts');
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(realTime);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);

  const apiClient = new ApiClient();

  useEffect(() => {
    loadMaintenanceData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMaintenanceData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [serverId, autoRefresh]);

  const loadMaintenanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading maintenance data
      const mockAlerts = generateMockMaintenanceAlerts();
      const mockSchedules = generateMockMaintenanceSchedules();

      setAlerts(mockAlerts);
      setSchedules(mockSchedules);
    } catch (err) {
      setError('Failed to load maintenance data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockMaintenanceAlerts = (): MaintenanceAlert[] => [
    {
      id: '1',
      serverId,
      type: 'hardware',
      severity: 'critical',
      title: 'SSD Health Degradation Detected',
      description: 'Primary storage SSD showing signs of wear with declining write performance and increasing bad sectors',
      component: 'Primary SSD (/dev/sda1)',
      predictedFailureDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 87.5,
      timeToFailure: '15 days',
      impact: 'critical',
      affectedServices: ['Database', 'File Storage', 'User Data'],
      recommendations: [
        {
          id: '1',
          title: 'Schedule Immediate SSD Replacement',
          description: 'Replace the degraded SSD before failure to prevent data loss',
          urgency: 'immediate',
          estimatedTime: '4 hours',
          cost: 250,
          savings: 2000,
          complexity: 'medium',
          prerequisites: ['Order replacement SSD', 'Schedule maintenance window', 'Backup all data'],
          steps: [
            'Create full system backup',
            'Prepare replacement SSD',
            'Schedule maintenance window',
            'Replace SSD and restore data',
            'Verify system integrity'
          ],
          risks: ['Potential data loss if failure occurs during replacement', 'Service downtime during replacement']
        }
      ],
      preventativeActions: [
        {
          id: '1',
          title: 'SSD Health Monitoring',
          description: 'Continuous monitoring of SSD health metrics',
          type: 'automated',
          frequency: 'hourly',
          nextExecution: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          lastExecution: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          success: true,
          enabled: true,
          parameters: { threshold: 80, checkInterval: 3600 }
        }
      ],
      healthMetrics: [
        {
          name: 'SSD Health',
          current: 73,
          threshold: 80,
          unit: '%',
          trend: 'degrading',
          history: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
            value: 78 - (i * 0.2) + Math.random() * 2
          }))
        },
        {
          name: 'Write Speed',
          current: 425,
          threshold: 500,
          unit: 'MB/s',
          trend: 'degrading',
          history: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
            value: 500 - (i * 3) + Math.random() * 10
          }))
        }
      ],
      rootCause: 'Normal wear and tear exceeding expected lifespan',
      estimatedDowntime: '4 hours',
      maintenanceWindow: '2024-01-28 02:00-06:00',
      priority: 1,
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['hardware', 'storage', 'critical', 'urgent']
    },
    {
      id: '2',
      serverId,
      type: 'performance',
      severity: 'warning',
      title: 'Memory Usage Trend Analysis',
      description: 'Memory usage has been steadily increasing and is predicted to reach critical levels',
      component: 'System Memory',
      predictedFailureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 92.3,
      timeToFailure: '7 days',
      impact: 'medium',
      affectedServices: ['Game Server', 'Plugin System'],
      recommendations: [
        {
          id: '1',
          title: 'Memory Optimization',
          description: 'Optimize memory usage through plugin cleanup and configuration tuning',
          urgency: 'soon',
          estimatedTime: '2 hours',
          cost: 0,
          savings: 150,
          complexity: 'low',
          prerequisites: ['Identify memory-heavy plugins', 'Create system backup'],
          steps: [
            'Analyze memory usage patterns',
            'Identify problematic plugins',
            'Optimize plugin configurations',
            'Clear memory caches',
            'Monitor improved performance'
          ],
          risks: ['Temporary service instability during optimization']
        }
      ],
      preventativeActions: [
        {
          id: '1',
          title: 'Memory Cleanup',
          description: 'Automated memory cleanup and garbage collection',
          type: 'automated',
          frequency: 'daily',
          nextExecution: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          lastExecution: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          success: true,
          enabled: true,
          parameters: { cleanupThreshold: 80, forceCleanup: false }
        }
      ],
      healthMetrics: [
        {
          name: 'Memory Usage',
          current: 78,
          threshold: 85,
          unit: '%',
          trend: 'degrading',
          history: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
            value: 65 + (i * 0.6) + Math.random() * 3
          }))
        }
      ],
      rootCause: 'Gradual memory leak in plugin system',
      estimatedDowntime: '30 minutes',
      maintenanceWindow: '2024-01-26 03:00-03:30',
      priority: 2,
      status: 'active',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['performance', 'memory', 'optimization']
    },
    {
      id: '3',
      serverId,
      type: 'network',
      severity: 'info',
      title: 'Network Bandwidth Utilization',
      description: 'Network bandwidth usage approaching recommended limits during peak hours',
      component: 'Network Interface',
      predictedFailureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 76.8,
      timeToFailure: '30 days',
      impact: 'low',
      affectedServices: ['Game Server', 'Web Interface'],
      recommendations: [
        {
          id: '1',
          title: 'Bandwidth Optimization',
          description: 'Implement traffic shaping and compression to optimize bandwidth usage',
          urgency: 'scheduled',
          estimatedTime: '3 hours',
          cost: 50,
          savings: 200,
          complexity: 'medium',
          prerequisites: ['Analyze traffic patterns', 'Configure QoS settings'],
          steps: [
            'Analyze current bandwidth usage',
            'Implement traffic compression',
            'Configure Quality of Service rules',
            'Monitor performance improvements',
            'Document configuration changes'
          ],
          risks: ['Potential temporary connection issues during configuration']
        }
      ],
      preventativeActions: [
        {
          id: '1',
          title: 'Bandwidth Monitoring',
          description: 'Continuous monitoring of network bandwidth utilization',
          type: 'automated',
          frequency: 'every 5 minutes',
          nextExecution: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          lastExecution: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          success: true,
          enabled: true,
          parameters: { threshold: 80, alertLevel: 'warning' }
        }
      ],
      healthMetrics: [
        {
          name: 'Bandwidth Usage',
          current: 72,
          threshold: 80,
          unit: '%',
          trend: 'stable',
          history: Array.from({ length: 24 }, (_, i) => ({
            timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
            value: 70 + Math.sin(i * 0.5) * 10 + Math.random() * 5
          }))
        }
      ],
      rootCause: 'Increased player activity and content updates',
      estimatedDowntime: '1 hour',
      maintenanceWindow: '2024-02-05 02:00-03:00',
      priority: 3,
      status: 'active',
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['network', 'bandwidth', 'optimization']
    },
    {
      id: '4',
      serverId,
      type: 'security',
      severity: 'warning',
      title: 'SSL Certificate Expiration',
      description: 'SSL certificate will expire soon and needs renewal to maintain secure connections',
      component: 'SSL Certificate',
      predictedFailureDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 100,
      timeToFailure: '21 days',
      impact: 'medium',
      affectedServices: ['Web Interface', 'API', 'Admin Panel'],
      recommendations: [
        {
          id: '1',
          title: 'Renew SSL Certificate',
          description: 'Renew SSL certificate before expiration to maintain secure connections',
          urgency: 'soon',
          estimatedTime: '1 hour',
          cost: 100,
          savings: 500,
          complexity: 'low',
          prerequisites: ['Contact certificate authority', 'Prepare renewal documentation'],
          steps: [
            'Generate new certificate request',
            'Submit renewal to certificate authority',
            'Download new certificate',
            'Install and configure new certificate',
            'Verify secure connections'
          ],
          risks: ['Service interruption if certificate expires', 'Browser security warnings']
        }
      ],
      preventativeActions: [
        {
          id: '1',
          title: 'Certificate Monitoring',
          description: 'Monitor SSL certificate expiration dates',
          type: 'automated',
          frequency: 'daily',
          nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          lastExecution: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          success: true,
          enabled: true,
          parameters: { warningDays: 30, criticalDays: 7 }
        }
      ],
      healthMetrics: [
        {
          name: 'Certificate Validity',
          current: 21,
          threshold: 30,
          unit: 'days',
          trend: 'degrading',
          history: Array.from({ length: 30 }, (_, i) => ({
            timestamp: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
            value: 51 - i
          }))
        }
      ],
      rootCause: 'Scheduled certificate expiration',
      estimatedDowntime: '15 minutes',
      maintenanceWindow: '2024-02-10 01:00-01:15',
      priority: 2,
      status: 'acknowledged',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      acknowledgedBy: 'Admin',
      acknowledgedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      tags: ['security', 'ssl', 'certificate', 'renewal']
    }
  ];

  const generateMockMaintenanceSchedules = (): MaintenanceSchedule[] => [
    {
      id: '1',
      serverId,
      title: 'SSD Replacement',
      description: 'Replace degraded primary SSD to prevent system failure',
      type: 'corrective',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: '4 hours',
      technician: 'John Smith',
      status: 'scheduled',
      checklist: [
        { id: '1', task: 'Create full system backup', completed: false },
        { id: '2', task: 'Order replacement SSD', completed: true },
        { id: '3', task: 'Notify users of maintenance window', completed: false },
        { id: '4', task: 'Prepare installation tools', completed: false },
        { id: '5', task: 'Replace SSD hardware', completed: false },
        { id: '6', task: 'Restore system from backup', completed: false },
        { id: '7', task: 'Verify system integrity', completed: false },
        { id: '8', task: 'Resume normal operations', completed: false }
      ],
      requiredDowntime: true,
      affectedSystems: ['Game Server', 'Database', 'File Storage'],
      backupPlan: 'Full system backup to external storage before maintenance',
      rollbackPlan: 'Restore from backup if new SSD fails during installation'
    },
    {
      id: '2',
      serverId,
      title: 'Monthly Security Update',
      description: 'Apply security patches and system updates',
      type: 'preventive',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: '2 hours',
      technician: 'Jane Doe',
      status: 'scheduled',
      checklist: [
        { id: '1', task: 'Review available updates', completed: true },
        { id: '2', task: 'Test updates in staging environment', completed: false },
        { id: '3', task: 'Create system snapshot', completed: false },
        { id: '4', task: 'Apply security patches', completed: false },
        { id: '5', task: 'Update system packages', completed: false },
        { id: '6', task: 'Restart required services', completed: false },
        { id: '7', task: 'Verify system functionality', completed: false }
      ],
      requiredDowntime: false,
      affectedSystems: ['Operating System', 'Security Framework'],
      backupPlan: 'System snapshot created before applying updates',
      rollbackPlan: 'Restore from snapshot if updates cause issues'
    },
    {
      id: '3',
      serverId,
      title: 'Performance Optimization',
      description: 'Optimize server performance and clean up resources',
      type: 'preventive',
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDuration: '3 hours',
      technician: 'Mike Johnson',
      status: 'scheduled',
      checklist: [
        { id: '1', task: 'Analyze performance metrics', completed: false },
        { id: '2', task: 'Clean up temporary files', completed: false },
        { id: '3', task: 'Optimize database queries', completed: false },
        { id: '4', task: 'Update plugin configurations', completed: false },
        { id: '5', task: 'Defragment storage', completed: false },
        { id: '6', task: 'Test performance improvements', completed: false }
      ],
      requiredDowntime: false,
      affectedSystems: ['Database', 'Plugin System', 'File System'],
      backupPlan: 'Configuration backup before optimization',
      rollbackPlan: 'Restore previous configurations if performance degrades'
    }
  ];

  const handleAcknowledgeAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledgedBy: 'Current User',
            acknowledgedAt: new Date().toISOString()
          }
        : alert
    ));
  };

  const handleResolveAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved',
            resolvedAt: new Date().toISOString()
          }
        : alert
    ));
  };

  const handleDismissAlert = async (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'dismissed'
          }
        : alert
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'text-red-400 bg-red-900';
      case 'critical': return 'text-red-400 bg-red-900';
      case 'warning': return 'text-yellow-400 bg-yellow-900';
      case 'info': return 'text-blue-400 bg-blue-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hardware': return <Server className="w-5 h-5 text-orange-500" />;
      case 'software': return <Settings className="w-5 h-5 text-blue-500" />;
      case 'performance': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'security': return <Shield className="w-5 h-5 text-red-500" />;
      case 'capacity': return <Database className="w-5 h-5 text-purple-500" />;
      case 'network': return <Network className="w-5 h-5 text-green-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-400 bg-red-900';
      case 'acknowledged': return 'text-yellow-400 bg-yellow-900';
      case 'in_progress': return 'text-blue-400 bg-blue-900';
      case 'resolved': return 'text-green-400 bg-green-900';
      case 'dismissed': return 'text-gray-400 bg-gray-700';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'degrading': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.component.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSeverity && matchesType && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading predictive maintenance data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crystal className="w-6 h-6 text-blue-500" />
            Predictive Maintenance
          </h2>
          <p className="text-gray-400">AI-powered maintenance alerts and scheduling for {serverName}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              autoRefresh 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            Auto Refresh
          </button>
          
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              notificationsEnabled 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={loadMaintenanceData}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'alerts', label: 'Active Alerts', icon: AlertTriangle, count: alerts.filter(a => a.status === 'active').length },
          { id: 'schedule', label: 'Maintenance Schedule', icon: Calendar, count: schedules.length },
          { id: 'history', label: 'History', icon: Clock, count: alerts.filter(a => a.status === 'resolved').length },
          { id: 'settings', label: 'Settings', icon: Settings, count: 0 }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {selectedTab === 'alerts' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Severities</option>
              <option value="emergency">Emergency</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="hardware">Hardware</option>
              <option value="software">Software</option>
              <option value="performance">Performance</option>
              <option value="security">Security</option>
              <option value="capacity">Capacity</option>
              <option value="network">Network</option>
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const isExpanded = selectedAlert === alert.id;
              
              return (
                <div key={alert.id} className="bg-gray-800 rounded-lg border border-gray-700">
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedAlert(isExpanded ? null : alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{alert.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{alert.timeToFailure}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              <span>{alert.confidence.toFixed(1)}% confidence</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{alert.impact} impact</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {alert.status === 'active' && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcknowledgeAlert(alert.id);
                              }}
                              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleResolveAlert(alert.id);
                              }}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                            >
                              Resolve
                            </button>
                          </>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-700">
                      <div className="pt-4 space-y-6">
                        {/* Health Metrics */}
                        <div>
                          <h4 className="font-medium text-white mb-3">Health Metrics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {alert.healthMetrics.map((metric) => (
                              <div key={metric.name} className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-white">{metric.name}</h5>
                                  {getTrendIcon(metric.trend)}
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-2xl font-bold text-white">
                                    {metric.current}{metric.unit}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    / {metric.threshold}{metric.unit}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-600 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      metric.current > metric.threshold ? 'bg-red-500' : 'bg-green-500'
                                    }`}
                                    style={{ 
                                      width: `${Math.min(100, (metric.current / metric.threshold) * 100)}%` 
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div>
                          <h4 className="font-medium text-white mb-3">Recommendations</h4>
                          <div className="space-y-3">
                            {alert.recommendations.map((rec) => (
                              <div key={rec.id} className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="font-medium text-white">{rec.title}</h5>
                                    <p className="text-sm text-gray-300">{rec.description}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    rec.urgency === 'immediate' ? 'bg-red-900 text-red-200' :
                                    rec.urgency === 'soon' ? 'bg-yellow-900 text-yellow-200' :
                                    'bg-blue-900 text-blue-200'
                                  }`}>
                                    {rec.urgency}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                                  <div>
                                    <span className="text-gray-400">Time:</span>
                                    <div className="text-white">{rec.estimatedTime}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Cost:</span>
                                    <div className="text-red-400">${rec.cost}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Savings:</span>
                                    <div className="text-green-400">${rec.savings}</div>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Complexity:</span>
                                    <div className="text-white capitalize">{rec.complexity}</div>
                                  </div>
                                </div>
                                
                                <div className="mt-3">
                                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                                    Execute Recommendation
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Affected Services */}
                        <div>
                          <h4 className="font-medium text-white mb-2">Affected Services</h4>
                          <div className="flex flex-wrap gap-2">
                            {alert.affectedServices.map((service) => (
                              <span
                                key={service}
                                className="px-2 py-1 bg-red-900 text-red-200 text-xs rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <h4 className="font-medium text-white mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {alert.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No active alerts</h3>
              <p className="text-gray-400">
                {alerts.length === 0 
                  ? 'All systems are running smoothly. No maintenance alerts detected.'
                  : 'No alerts match your current filters.'}
              </p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Maintenance Schedule</h3>
            <button
              onClick={() => setShowCreateSchedule(true)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Schedule Maintenance
            </button>
          </div>

          <div className="space-y-4">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-white mb-1">{schedule.title}</h4>
                    <p className="text-gray-300 text-sm mb-2">{schedule.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(schedule.scheduledDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.estimatedDuration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{schedule.technician}</span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    schedule.status === 'scheduled' ? 'bg-blue-900 text-blue-200' :
                    schedule.status === 'in_progress' ? 'bg-yellow-900 text-yellow-200' :
                    schedule.status === 'completed' ? 'bg-green-900 text-green-200' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {schedule.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm text-white">
                      {schedule.checklist.filter(item => item.completed).length} / {schedule.checklist.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(schedule.checklist.filter(item => item.completed).length / schedule.checklist.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Checklist */}
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Checklist</h5>
                  <div className="space-y-1">
                    {schedule.checklist.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-500" />
                        )}
                        <span className={item.completed ? 'text-gray-400 line-through' : 'text-gray-300'}>
                          {item.task}
                        </span>
                      </div>
                    ))}
                    {schedule.checklist.length > 3 && (
                      <div className="text-xs text-gray-400 ml-6">
                        +{schedule.checklist.length - 3} more tasks
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'history' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Maintenance History</h3>
          
          <div className="space-y-4">
            {alerts.filter(alert => alert.status === 'resolved').map((alert) => (
              <div key={alert.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(alert.type)}
                    <div>
                      <h4 className="font-medium text-white">{alert.title}</h4>
                      <p className="text-sm text-gray-400">{alert.component}</p>
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-400">
                    <div>Resolved: {alert.resolvedAt && new Date(alert.resolvedAt).toLocaleDateString()}</div>
                    <div>Duration: {alert.estimatedDowntime}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'settings' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Maintenance Settings</h3>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h4 className="font-medium text-white mb-4">Alert Preferences</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Email Notifications</div>
                  <div className="text-sm text-gray-400">Receive email alerts for critical issues</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">SMS Notifications</div>
                  <div className="text-sm text-gray-400">Receive SMS for emergency alerts</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Auto-Acknowledge</div>
                  <div className="text-sm text-gray-400">Automatically acknowledge low-priority alerts</div>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h4 className="font-medium text-white mb-4">Maintenance Windows</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Maintenance Hours
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option>02:00 - 06:00 (Recommended)</option>
                  <option>01:00 - 05:00</option>
                  <option>03:00 - 07:00</option>
                  <option>Custom Range</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Advance Notice Period
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option>24 hours</option>
                  <option>48 hours</option>
                  <option>72 hours</option>
                  <option>1 week</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}