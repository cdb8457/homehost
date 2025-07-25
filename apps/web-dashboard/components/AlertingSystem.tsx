'use client';

import { useState, useEffect } from 'react';
import { 
  Alert, 
  AlertRule, 
  NotificationChannel, 
  EscalationPolicy,
  AlertNotification 
} from '@/types/server-monitoring';
import { 
  Bell, 
  BellOff, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Mail, 
  MessageSquare, 
  Webhook,
  Smartphone,
  Volume2,
  VolumeOff,
  Play,
  Pause,
  Square,
  RotateCw,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Eye,
  EyeOff,
  Filter,
  Search,
  Calendar,
  RefreshCw,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  X,
  Check,
  Zap,
  Shield,
  Target,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Thermometer,
  Cpu,
  Memory,
  HardDrive,
  Network,
  Server,
  Database,
  Cloud,
  Wifi,
  Signal,
  Battery,
  Power,
  Lock,
  Unlock,
  Key,
  Globe,
  MapPin,
  Navigation,
  Compass,
  Home,
  Building,
  Folder,
  FileText,
  Archive,
  Layers,
  Grid,
  List,
  LayoutDashboard,
  Flag,
  Star,
  Award,
  Crown,
  Medal,
  Trophy,
  Flame,
  Snowflake,
  Lightbulb,
  Brain,
  Robot,
  Cog,
  Wrench,
  Hammer,
  Tool,
  Crosshair,
  Focus,
  Maximize,
  Minimize,
  ExternalLink,
  Link,
  Paperclip,
  Bookmark,
  BookmarkPlus,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Reply,
  Forward,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerDownRight,
  CornerUpRight
} from 'lucide-react';

interface AlertingSystemProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

interface AlertStats {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface AlertHistory {
  date: string;
  count: number;
  resolved: number;
  averageResolutionTime: number; // minutes
}

export default function AlertingSystem({ 
  serverId, 
  serverName, 
  userRole 
}: AlertingSystemProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateRule, setShowCreateRule] = useState(false);

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      // Mock alerts
      const mockAlerts: Alert[] = [
        {
          id: '1',
          serverId,
          ruleId: 'cpu-critical',
          severity: 'critical',
          status: 'active',
          title: 'Critical CPU Usage',
          description: 'CPU usage has exceeded 90% for more than 15 minutes',
          metric: 'cpu.usage',
          threshold: 90,
          currentValue: 94.2,
          triggeredAt: new Date(Date.now() - 900000), // 15 minutes ago
          escalationLevel: 2,
          notifications: [],
          tags: ['performance', 'cpu', 'critical'],
          metadata: {
            serverName: serverName,
            alertSource: 'monitoring',
            impactLevel: 'high'
          }
        },
        {
          id: '2',
          serverId,
          ruleId: 'memory-high',
          severity: 'high',
          status: 'acknowledged',
          title: 'High Memory Usage',
          description: 'Memory usage approaching dangerous levels',
          metric: 'memory.percentage',
          threshold: 85,
          currentValue: 87.5,
          triggeredAt: new Date(Date.now() - 1800000), // 30 minutes ago
          acknowledgedAt: new Date(Date.now() - 600000), // 10 minutes ago
          acknowledgedBy: 'admin',
          escalationLevel: 1,
          notifications: [],
          tags: ['performance', 'memory'],
          metadata: {
            serverName: serverName,
            alertSource: 'monitoring'
          }
        },
        {
          id: '3',
          serverId,
          ruleId: 'disk-medium',
          severity: 'medium',
          status: 'resolved',
          title: 'Disk Space Warning',
          description: 'Disk usage exceeded 80% threshold',
          metric: 'disk.percentage',
          threshold: 80,
          currentValue: 75.2,
          triggeredAt: new Date(Date.now() - 7200000), // 2 hours ago
          resolvedAt: new Date(Date.now() - 3600000), // 1 hour ago
          resolvedBy: 'auto-cleanup',
          escalationLevel: 0,
          notifications: [],
          tags: ['storage', 'disk'],
          metadata: {
            serverName: serverName,
            alertSource: 'monitoring',
            autoResolved: true
          }
        },
        {
          id: '4',
          serverId,
          ruleId: 'player-count-low',
          severity: 'low',
          status: 'active',
          title: 'Low Player Count',
          description: 'Player count has been below 10 for extended period',
          metric: 'game.playerCount',
          threshold: 10,
          currentValue: 7,
          triggeredAt: new Date(Date.now() - 5400000), // 90 minutes ago
          escalationLevel: 0,
          notifications: [],
          tags: ['game', 'players', 'engagement'],
          metadata: {
            serverName: serverName,
            alertSource: 'monitoring',
            businessImpact: 'low'
          }
        }
      ];

      // Mock alert rules
      const mockRules: AlertRule[] = [
        {
          id: 'cpu-critical',
          name: 'Critical CPU Usage',
          description: 'Triggers when CPU usage exceeds 90% for 15 minutes',
          enabled: true,
          serverId,
          metric: 'cpu.usage',
          condition: {
            operator: 'gte',
            aggregation: 'avg',
            timeWindow: 900, // 15 minutes
            groupBy: []
          },
          severity: 'critical',
          threshold: 90,
          duration: 900, // 15 minutes
          cooldown: 1800, // 30 minutes
          tags: ['performance', 'cpu'],
          notifications: [
            {
              type: 'email',
              enabled: true,
              config: {
                recipients: ['admin@homehost.com', 'alerts@homehost.com']
              },
              retryPolicy: {
                maxRetries: 3,
                retryDelay: 300,
                backoffMultiplier: 2
              }
            },
            {
              type: 'discord',
              enabled: true,
              config: {
                webhookUrl: 'https://discord.com/api/webhooks/...',
                channel: '#alerts'
              },
              retryPolicy: {
                maxRetries: 3,
                retryDelay: 60,
                backoffMultiplier: 1.5
              }
            }
          ],
          escalation: {
            enabled: true,
            levels: [
              {
                level: 1,
                channels: [],
                users: ['admin'],
                requiredAcknowledgments: 1,
                timeout: 900 // 15 minutes
              },
              {
                level: 2,
                channels: [],
                users: ['admin', 'owner'],
                requiredAcknowledgments: 1,
                timeout: 1800 // 30 minutes
              }
            ],
            maxEscalations: 2,
            escalationInterval: 900
          },
          createdBy: 'system',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20')
        },
        {
          id: 'memory-high',
          name: 'High Memory Usage',
          description: 'Triggers when memory usage exceeds 85%',
          enabled: true,
          serverId,
          metric: 'memory.percentage',
          condition: {
            operator: 'gte',
            aggregation: 'avg',
            timeWindow: 300, // 5 minutes
            groupBy: []
          },
          severity: 'high',
          threshold: 85,
          duration: 300,
          cooldown: 900,
          tags: ['performance', 'memory'],
          notifications: [
            {
              type: 'email',
              enabled: true,
              config: {
                recipients: ['admin@homehost.com']
              },
              retryPolicy: {
                maxRetries: 2,
                retryDelay: 180,
                backoffMultiplier: 2
              }
            }
          ],
          escalation: {
            enabled: false,
            levels: [],
            maxEscalations: 0,
            escalationInterval: 0
          },
          createdBy: 'admin',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16')
        }
      ];

      // Mock notification channels
      const mockChannels: NotificationChannel[] = [
        {
          type: 'email',
          enabled: true,
          config: {
            smtpServer: 'smtp.homehost.com',
            recipients: ['admin@homehost.com', 'alerts@homehost.com'],
            subject: '[HomeHost] Server Alert: {{title}}'
          },
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 300,
            backoffMultiplier: 2
          }
        },
        {
          type: 'discord',
          enabled: true,
          config: {
            webhookUrl: 'https://discord.com/api/webhooks/...',
            username: 'HomeHost Alerts',
            avatar: 'https://homehost.com/bot-avatar.png'
          },
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 60,
            backoffMultiplier: 1.5
          }
        },
        {
          type: 'slack',
          enabled: false,
          config: {
            webhookUrl: '',
            channel: '#alerts',
            username: 'HomeHost'
          },
          retryPolicy: {
            maxRetries: 3,
            retryDelay: 60,
            backoffMultiplier: 1.5
          }
        }
      ];

      // Mock stats
      const mockStats: AlertStats = {
        total: mockAlerts.length,
        active: mockAlerts.filter(a => a.status === 'active').length,
        acknowledged: mockAlerts.filter(a => a.status === 'acknowledged').length,
        resolved: mockAlerts.filter(a => a.status === 'resolved').length,
        bySeverity: {
          critical: mockAlerts.filter(a => a.severity === 'critical').length,
          high: mockAlerts.filter(a => a.severity === 'high').length,
          medium: mockAlerts.filter(a => a.severity === 'medium').length,
          low: mockAlerts.filter(a => a.severity === 'low').length
        }
      };

      // Mock history (last 7 days)
      const mockHistory: AlertHistory[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 20) + 5,
          resolved: Math.floor(Math.random() * 15) + 3,
          averageResolutionTime: Math.floor(Math.random() * 120) + 15
        };
      });

      setAlerts(mockAlerts);
      setAlertRules(mockRules);
      setNotificationChannels(mockChannels);
      setStats(mockStats);
      setHistory(mockHistory);
      setLoading(false);
    };

    const timer = setTimeout(initializeData, 1000);
    return () => clearTimeout(timer);
  }, [serverId, serverName]);

  // Filter alerts based on search and filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'suppressed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'discord': return <MessageSquare className="w-4 h-4" />;
      case 'slack': return <MessageSquare className="w-4 h-4" />;
      case 'webhook': return <Webhook className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged' as const,
            acknowledgedAt: new Date(),
            acknowledgedBy: 'current-user'
          }
        : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved' as const,
            resolvedAt: new Date(),
            resolvedBy: 'current-user'
          }
        : alert
    ));
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const diffMs = endTime.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading alerting system...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Alert Management</h2>
            <p className="text-gray-600">{serverName} - Monitoring & Notifications</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateRule(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Rule</span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Alerts</p>
                <p className="text-3xl font-bold text-red-600">{stats.active}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Acknowledged</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.acknowledged}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resolved Today</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Rules</p>
                <p className="text-3xl font-bold text-blue-600">{alertRules.length}</p>
              </div>
              <Shield className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'alerts', label: 'Active Alerts', icon: <Bell className="w-4 h-4" />, count: stats?.active },
              { id: 'rules', label: 'Alert Rules', icon: <Shield className="w-4 h-4" />, count: alertRules.length },
              { id: 'channels', label: 'Notifications', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'history', label: 'History', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'alerts' && (
            <AlertsTab 
              alerts={filteredAlerts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterSeverity={filterSeverity}
              setFilterSeverity={setFilterSeverity}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onAcknowledge={acknowledgeAlert}
              onResolve={resolveAlert}
              onSelectAlert={setSelectedAlert}
              getSeverityColor={getSeverityColor}
              getStatusColor={getStatusColor}
              getSeverityIcon={getSeverityIcon}
              formatDuration={formatDuration}
            />
          )}
          {activeTab === 'rules' && (
            <RulesTab 
              rules={alertRules}
              getSeverityColor={getSeverityColor}
              getSeverityIcon={getSeverityIcon}
            />
          )}
          {activeTab === 'channels' && (
            <ChannelsTab 
              channels={notificationChannels}
              getChannelIcon={getChannelIcon}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab 
              history={history}
            />
          )}
        </div>
      </div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal 
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={acknowledgeAlert}
          onResolve={resolveAlert}
          getSeverityColor={getSeverityColor}
          getStatusColor={getStatusColor}
          getSeverityIcon={getSeverityIcon}
          formatDuration={formatDuration}
        />
      )}
    </div>
  );
}

// Tab Components
function AlertsTab({ 
  alerts, 
  searchTerm, 
  setSearchTerm, 
  filterSeverity, 
  setFilterSeverity, 
  filterStatus, 
  setFilterStatus,
  onAcknowledge,
  onResolve,
  onSelectAlert,
  getSeverityColor,
  getStatusColor,
  getSeverityIcon,
  formatDuration
}: any) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
            <p className="text-gray-500">
              {filterSeverity !== 'all' || filterStatus !== 'all' || searchTerm 
                ? 'No alerts match your current filters.' 
                : 'Everything looks good! No active alerts.'}
            </p>
          </div>
        ) : (
          alerts.map((alert: Alert) => (
            <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Triggered: {formatDuration(alert.triggeredAt)}</span>
                      <span>Current: {alert.currentValue}</span>
                      <span>Threshold: {alert.threshold}</span>
                      {alert.escalationLevel > 0 && (
                        <span className="text-orange-600">Escalation Level {alert.escalationLevel}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm hover:bg-yellow-200 transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() => onResolve(alert.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        Resolve
                      </button>
                    </>
                  )}
                  {alert.status === 'acknowledged' && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => onSelectAlert(alert)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RulesTab({ rules, getSeverityColor, getSeverityIcon }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Alert Rules</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Rule</span>
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule: AlertRule) => (
          <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`p-2 rounded-lg ${getSeverityColor(rule.severity)}`}>
                  {getSeverityIcon(rule.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{rule.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(rule.severity)}`}>
                      {rule.severity}
                    </span>
                    {rule.enabled ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Enabled
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{rule.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Metric: {rule.metric}</span>
                    <span>Threshold: {rule.threshold}</span>
                    <span>Duration: {rule.duration}s</span>
                    <span>Notifications: {rule.notifications.length}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelsTab({ channels, getChannelIcon }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Channel</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel: NotificationChannel, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${channel.enabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                  {getChannelIcon(channel.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">{channel.type}</h4>
                  <span className={`text-xs ${channel.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {channel.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div>Max Retries: {channel.retryPolicy.maxRetries}</div>
              <div>Retry Delay: {channel.retryPolicy.retryDelay}s</div>
              {channel.type === 'email' && channel.config.recipients && (
                <div>Recipients: {channel.config.recipients.length}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ history }: any) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Alert History (Last 7 Days)</h3>
      
      {/* Chart Placeholder */}
      <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Alert history chart would be rendered here</p>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-gray-50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Total Alerts</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Resolved</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Avg Resolution Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((day: AlertHistory, index: number) => (
              <tr key={index} className="border-t border-gray-200">
                <td className="py-3 px-4">{new Date(day.date).toLocaleDateString()}</td>
                <td className="py-3 px-4">{day.count}</td>
                <td className="py-3 px-4 text-green-600">{day.resolved}</td>
                <td className="py-3 px-4">{day.averageResolutionTime}m</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Alert Detail Modal Component
function AlertDetailModal({ 
  alert, 
  onClose, 
  onAcknowledge, 
  onResolve, 
  getSeverityColor, 
  getStatusColor, 
  getSeverityIcon, 
  formatDuration 
}: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-3">
              <div className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                {getSeverityIcon(alert.severity)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{alert.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.status)}`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{alert.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Alert Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Metric:</span>
                    <span className="font-medium">{alert.metric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Value:</span>
                    <span className="font-medium">{alert.currentValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Threshold:</span>
                    <span className="font-medium">{alert.threshold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{formatDuration(alert.triggeredAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Triggered:</span>
                    <span className="font-medium">{alert.triggeredAt.toLocaleString()}</span>
                  </div>
                  {alert.acknowledgedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Acknowledged:</span>
                      <span className="font-medium">{alert.acknowledgedAt.toLocaleString()}</span>
                    </div>
                  )}
                  {alert.resolvedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved:</span>
                      <span className="font-medium">{alert.resolvedAt.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {alert.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {alert.tags.map((tag: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              {alert.status === 'active' && (
                <>
                  <button
                    onClick={() => {
                      onAcknowledge(alert.id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => {
                      onResolve(alert.id);
                      onClose();
                    }}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    Resolve
                  </button>
                </>
              )}
              {alert.status === 'acknowledged' && (
                <button
                  onClick={() => {
                    onResolve(alert.id);
                    onClose();
                  }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Resolve
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}