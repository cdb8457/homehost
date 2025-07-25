'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Brain,
  Target,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Globe,
  Database,
  Settings,
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  MessageCircle,
  Phone,
  Smartphone,
  Send,
  Filter,
  Search,
  Calendar,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  Edit,
  Save,
  Copy,
  ExternalLink,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Layers,
  Grid3X3,
  List,
  BarChart3,
  LineChart,
  PieChart,
  Info,
  AlertCircle,
  Lightbulb,
  Fire,
  Sparkles,
  Star,
  Award,
  Crown,
  Heart,
  ThumbsUp,
  Flag,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Link,
  FileText,
  Camera,
  Video,
  Mic,
  Gamepad2
} from 'lucide-react';

interface Alert {
  id: string;
  serverId: string;
  serverName: string;
  type: 'threshold' | 'anomaly' | 'prediction' | 'correlation' | 'custom';
  severity: 'info' | 'warning' | 'critical' | 'emergency';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed' | 'escalated';
  title: string;
  description: string;
  metric: string;
  value: number;
  threshold?: number;
  timestamp: string;
  lastUpdate: string;
  tags: string[];
  source: {
    system: 'monitoring' | 'prediction' | 'correlation' | 'manual' | 'integration';
    component: string;
    detector: string;
  };
  impact: {
    scope: 'server' | 'cluster' | 'service' | 'global';
    affected: string[];
    severity: number;
    businessImpact: string;
  };
  escalation: {
    level: number;
    policy: string;
    history: EscalationEvent[];
    nextAction?: string;
    nextActionTime?: string;
  };
  correlation: {
    parentId?: string;
    childIds: string[];
    correlatedWith: string[];
    confidence: number;
    pattern: string;
  };
  automation: {
    autoAcknowledge: boolean;
    autoResolve: boolean;
    runbook?: string;
    actions: AutoAction[];
    executed: string[];
  };
  assignee?: {
    id: string;
    name: string;
    role: string;
    contactMethods: string[];
  };
  notes: AlertNote[];
  metrics: AlertMetric[];
}

interface EscalationEvent {
  level: number;
  timestamp: string;
  action: string;
  recipient: string;
  method: 'email' | 'sms' | 'call' | 'webhook' | 'slack' | 'discord';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  response?: string;
}

interface AutoAction {
  id: string;
  type: 'restart_service' | 'scale_resource' | 'run_script' | 'create_ticket' | 'notify_team';
  condition: string;
  script?: string;
  parameters: Record<string, any>;
  cooldown: number;
  lastExecuted?: string;
  status: 'enabled' | 'disabled' | 'executing' | 'cooldown';
}

interface AlertNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'comment' | 'investigation' | 'resolution' | 'escalation';
  attachments?: string[];
}

interface AlertMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  critical: boolean;
}

interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    severity: string[];
    tags: string[];
    servers: string[];
    timeRange: string;
  };
  levels: EscalationLevel[];
  settings: {
    suppressSimilar: boolean;
    groupByServer: boolean;
    autoAcknowledge: boolean;
    businessHoursOnly: boolean;
  };
}

interface EscalationLevel {
  level: number;
  delay: number;
  recipients: EscalationRecipient[];
  actions: string[];
  condition?: string;
}

interface EscalationRecipient {
  type: 'user' | 'group' | 'webhook';
  target: string;
  methods: string[];
  priority: number;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'threshold' | 'anomaly' | 'trend' | 'correlation' | 'ml';
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains';
    value: number;
    duration: number;
    servers: string[];
  };
  severity: string;
  tags: string[];
  suppressionRules: SuppressionRule[];
  actions: AlertAction[];
  schedule?: {
    enabled: boolean;
    timezone: string;
    periods: TimePeriod[];
  };
}

interface SuppressionRule {
  type: 'time' | 'dependency' | 'maintenance' | 'similar';
  condition: string;
  duration?: number;
  active: boolean;
}

interface AlertAction {
  type: string;
  configuration: Record<string, any>;
  delay: number;
  condition?: string;
}

interface TimePeriod {
  days: string[];
  startTime: string;
  endTime: string;
}

interface AlertStatistics {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  escalated: number;
  suppressed: number;
  byHour: { hour: number; count: number }[];
  bySeverity: { severity: string; count: number }[];
  byServer: { server: string; count: number }[];
  mttr: number;
  falsePositiveRate: number;
  escalationRate: number;
  autoResolveRate: number;
}

export function IntelligentAlertingSystem() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [escalationPolicies, setEscalationPolicies] = useState<EscalationPolicy[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [statistics, setStatistics] = useState<AlertStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'policies' | 'correlations' | 'analytics'>('alerts');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    server: 'all',
    timeRange: '24h',
    searchQuery: '',
    showCorrelated: false,
    showSuppressed: false
  });
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'server' | 'status'>('timestamp');
  const [alertingEnabled, setAlertingEnabled] = useState(true);
  const [correlationEngine, setCorrelationEngine] = useState(true);
  const [mlAnomalyDetection, setMlAnomalyDetection] = useState(true);
  
  useEffect(() => {
    loadAlertingData();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (alertingEnabled) {
        updateAlerts();
        processCorrelations();
        checkEscalations();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [alertingEnabled]);

  const loadAlertingData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAlerts(generateMockAlerts());
      setEscalationPolicies(generateMockPolicies());
      setAlertRules(generateMockRules());
      setStatistics(generateMockStatistics());
      
      setError(null);
    } catch (err) {
      setError('Failed to load alerting data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAlerts = (): Alert[] => {
    const servers = ['Minecraft Main', 'Valheim Creative', 'Rust PvP', 'CS:GO Casual', 'ARK Survival'];
    const metrics = ['cpu', 'memory', 'disk', 'network', 'players', 'tps', 'ping'];
    const severities = ['info', 'warning', 'critical', 'emergency'];
    const types = ['threshold', 'anomaly', 'prediction', 'correlation', 'custom'];
    const statuses = ['active', 'acknowledged', 'resolved', 'suppressed', 'escalated'];

    return Array.from({ length: 50 }, (_, i) => {
      const severity = severities[i % severities.length] as any;
      const type = types[i % types.length] as any;
      const status = statuses[i % statuses.length] as any;
      const server = servers[i % servers.length];
      const metric = metrics[i % metrics.length];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      
      return {
        id: `alert-${i + 1}`,
        serverId: `server-${(i % servers.length) + 1}`,
        serverName: server,
        type,
        severity,
        status,
        title: generateAlertTitle(type, metric, severity),
        description: generateAlertDescription(type, metric, server),
        metric,
        value: Math.random() * 100,
        threshold: type === 'threshold' ? Math.random() * 80 + 10 : undefined,
        timestamp,
        lastUpdate: new Date(new Date(timestamp).getTime() + Math.random() * 60 * 60 * 1000).toISOString(),
        tags: generateTags(metric, severity),
        source: {
          system: ['monitoring', 'prediction', 'correlation'][i % 3] as any,
          component: metric,
          detector: `${metric}_detector_v2`
        },
        impact: {
          scope: ['server', 'cluster', 'service', 'global'][i % 4] as any,
          affected: [server],
          severity: Math.floor(Math.random() * 10) + 1,
          businessImpact: generateBusinessImpact(severity)
        },
        escalation: {
          level: Math.floor(Math.random() * 3),
          policy: 'default-policy',
          history: [],
          nextAction: status === 'active' ? 'notify-on-call' : undefined,
          nextActionTime: status === 'active' ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : undefined
        },
        correlation: {
          childIds: [],
          correlatedWith: Math.random() > 0.7 ? [`alert-${Math.floor(Math.random() * 50) + 1}`] : [],
          confidence: Math.random() * 100,
          pattern: Math.random() > 0.5 ? 'cascade_failure' : 'resource_contention'
        },
        automation: {
          autoAcknowledge: Math.random() > 0.7,
          autoResolve: Math.random() > 0.8,
          runbook: `runbook-${metric}`,
          actions: generateAutoActions(metric),
          executed: []
        },
        assignee: Math.random() > 0.6 ? {
          id: 'user-1',
          name: 'On-Call Engineer',
          role: 'SRE',
          contactMethods: ['email', 'sms', 'slack']
        } : undefined,
        notes: Math.random() > 0.7 ? [generateAlertNote()] : [],
        metrics: generateAlertMetrics(metric)
      };
    });
  };

  const generateAlertTitle = (type: string, metric: string, severity: string): string => {
    const titles = {
      threshold: `${metric.toUpperCase()} ${severity} threshold exceeded`,
      anomaly: `Anomalous ${metric} behavior detected`,
      prediction: `Predicted ${metric} issue in next 30 minutes`,
      correlation: `Correlated ${metric} failure pattern`,
      custom: `Custom ${metric} rule triggered`
    };
    return titles[type as keyof typeof titles] || `${metric} alert`;
  };

  const generateAlertDescription = (type: string, metric: string, server: string): string => {
    const descriptions = {
      threshold: `The ${metric} metric on ${server} has exceeded the configured threshold`,
      anomaly: `Machine learning algorithms detected unusual ${metric} patterns on ${server}`,
      prediction: `Predictive analysis indicates potential ${metric} issues on ${server}`,
      correlation: `This ${metric} alert is correlated with other incidents on ${server}`,
      custom: `Custom monitoring rule for ${metric} has been triggered on ${server}`
    };
    return descriptions[type as keyof typeof descriptions] || `Alert for ${metric} on ${server}`;
  };

  const generateTags = (metric: string, severity: string): string[] => {
    const baseTags = [metric, severity];
    const additionalTags = ['performance', 'capacity', 'availability', 'security'];
    return [...baseTags, ...additionalTags.slice(0, Math.floor(Math.random() * 3) + 1)];
  };

  const generateBusinessImpact = (severity: string): string => {
    const impacts = {
      info: 'Minimal impact - informational only',
      warning: 'Potential service degradation',
      critical: 'Significant service impact expected',
      emergency: 'Service outage - immediate action required'
    };
    return impacts[severity as keyof typeof impacts] || 'Unknown impact';
  };

  const generateAutoActions = (metric: string): AutoAction[] => {
    const actions = [
      {
        id: 'auto-restart',
        type: 'restart_service' as const,
        condition: 'severity >= critical',
        parameters: { service: 'game-server', graceful: true },
        cooldown: 300000, // 5 minutes
        status: 'enabled' as const
      },
      {
        id: 'auto-scale',
        type: 'scale_resource' as const,
        condition: 'metric == cpu && value > 90',
        parameters: { resource: 'cpu', factor: 1.5 },
        cooldown: 600000, // 10 minutes
        status: 'enabled' as const
      }
    ];
    
    return actions.slice(0, Math.floor(Math.random() * 2) + 1);
  };

  const generateAlertNote = (): AlertNote => {
    return {
      id: 'note-1',
      author: 'System Admin',
      content: 'Investigating root cause. Server load appears normal.',
      timestamp: new Date().toISOString(),
      type: 'investigation'
    };
  };

  const generateAlertMetrics = (metric: string): AlertMetric[] => {
    return [
      {
        name: metric,
        value: Math.random() * 100,
        unit: metric === 'memory' || metric === 'cpu' ? '%' : metric === 'ping' ? 'ms' : 'count',
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as any,
        critical: Math.random() > 0.7
      }
    ];
  };

  const generateMockPolicies = (): EscalationPolicy[] => {
    return [
      {
        id: 'policy-1',
        name: 'Default Escalation',
        description: 'Standard escalation policy for all critical alerts',
        enabled: true,
        conditions: {
          severity: ['critical', 'emergency'],
          tags: [],
          servers: [],
          timeRange: '24h'
        },
        levels: [
          {
            level: 1,
            delay: 0,
            recipients: [
              {
                type: 'user',
                target: 'on-call-engineer',
                methods: ['email', 'sms'],
                priority: 1
              }
            ],
            actions: ['notify_slack', 'create_ticket']
          },
          {
            level: 2,
            delay: 15 * 60 * 1000, // 15 minutes
            recipients: [
              {
                type: 'group',
                target: 'sre-team',
                methods: ['email', 'call'],
                priority: 1
              }
            ],
            actions: ['notify_manager', 'escalate_ticket']
          }
        ],
        settings: {
          suppressSimilar: true,
          groupByServer: true,
          autoAcknowledge: false,
          businessHoursOnly: false
        }
      }
    ];
  };

  const generateMockRules = (): AlertRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'High CPU Usage',
        description: 'Alert when CPU usage exceeds 80% for 5 minutes',
        enabled: true,
        type: 'threshold',
        conditions: {
          metric: 'cpu',
          operator: 'gt',
          value: 80,
          duration: 300000, // 5 minutes
          servers: []
        },
        severity: 'warning',
        tags: ['performance', 'cpu'],
        suppressionRules: [],
        actions: [
          {
            type: 'email',
            configuration: { template: 'cpu-alert' },
            delay: 0
          }
        ]
      },
      {
        id: 'rule-2',
        name: 'Memory Exhaustion',
        description: 'Critical alert when memory usage exceeds 95%',
        enabled: true,
        type: 'threshold',
        conditions: {
          metric: 'memory',
          operator: 'gt',
          value: 95,
          duration: 60000, // 1 minute
          servers: []
        },
        severity: 'critical',
        tags: ['performance', 'memory'],
        suppressionRules: [],
        actions: [
          {
            type: 'email',
            configuration: { template: 'memory-critical' },
            delay: 0
          },
          {
            type: 'auto_restart',
            configuration: { service: 'game-server' },
            delay: 300000 // 5 minutes
          }
        ]
      }
    ];
  };

  const generateMockStatistics = (): AlertStatistics => {
    return {
      total: 1248,
      active: 23,
      acknowledged: 156,
      resolved: 1045,
      escalated: 24,
      suppressed: 67,
      byHour: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: Math.floor(Math.random() * 50) + 5
      })),
      bySeverity: [
        { severity: 'info', count: 456 },
        { severity: 'warning', count: 378 },
        { severity: 'critical', count: 89 },
        { severity: 'emergency', count: 12 }
      ],
      byServer: [
        { server: 'Minecraft Main', count: 234 },
        { server: 'Valheim Creative', count: 189 },
        { server: 'Rust PvP', count: 167 },
        { server: 'CS:GO Casual', count: 145 },
        { server: 'ARK Survival', count: 123 }
      ],
      mttr: 45.6, // minutes
      falsePositiveRate: 12.3, // percentage
      escalationRate: 8.7, // percentage
      autoResolveRate: 34.2 // percentage
    };
  };

  const updateAlerts = () => {
    // Simulate real-time alert updates
    setAlerts(prevAlerts => {
      const updated = [...prevAlerts];
      
      // Randomly update some alerts
      const indicesToUpdate = Array.from(
        { length: Math.floor(Math.random() * 5) },
        () => Math.floor(Math.random() * updated.length)
      );
      
      indicesToUpdate.forEach(index => {
        if (updated[index]) {
          // Simulate status changes
          if (Math.random() > 0.8) {
            const statuses = ['active', 'acknowledged', 'resolved'];
            updated[index].status = statuses[Math.floor(Math.random() * statuses.length)] as any;
            updated[index].lastUpdate = new Date().toISOString();
          }
          
          // Update metric values
          updated[index].value = Math.max(0, updated[index].value + (Math.random() - 0.5) * 10);
        }
      });
      
      // Occasionally add new alerts
      if (Math.random() > 0.9) {
        const newAlert = generateMockAlerts().slice(0, 1)[0];
        if (newAlert) {
          newAlert.id = `alert-new-${Date.now()}`;
          newAlert.timestamp = new Date().toISOString();
          newAlert.lastUpdate = new Date().toISOString();
          updated.unshift(newAlert);
        }
      }
      
      return updated.slice(0, 100); // Keep only latest 100
    });
  };

  const processCorrelations = () => {
    if (!correlationEngine) return;
    
    // Simulate correlation processing
    setAlerts(prevAlerts => {
      const updated = [...prevAlerts];
      const activeAlerts = updated.filter(a => a.status === 'active');
      
      // Find potential correlations
      activeAlerts.forEach(alert => {
        const correlatedCandidates = activeAlerts.filter(other => 
          other.id !== alert.id &&
          other.serverId === alert.serverId &&
          Math.abs(new Date(other.timestamp).getTime() - new Date(alert.timestamp).getTime()) < 300000 // 5 minutes
        );
        
        if (correlatedCandidates.length > 0 && Math.random() > 0.7) {
          const index = updated.findIndex(a => a.id === alert.id);
          if (index !== -1) {
            updated[index].correlation.correlatedWith = correlatedCandidates.map(c => c.id);
            updated[index].correlation.confidence = 85 + Math.random() * 15;
          }
        }
      });
      
      return updated;
    });
  };

  const checkEscalations = () => {
    setAlerts(prevAlerts => {
      const updated = [...prevAlerts];
      
      updated.forEach((alert, index) => {
        if (alert.status === 'active' && alert.escalation.nextActionTime) {
          const nextActionTime = new Date(alert.escalation.nextActionTime).getTime();
          const now = Date.now();
          
          if (now >= nextActionTime) {
            // Escalate alert
            updated[index].escalation.level += 1;
            updated[index].escalation.history.push({
              level: updated[index].escalation.level,
              timestamp: new Date().toISOString(),
              action: 'auto_escalate',
              recipient: 'sre-team',
              method: 'email',
              status: 'sent'
            });
            
            if (updated[index].escalation.level < 3) {
              updated[index].escalation.nextActionTime = new Date(now + 30 * 60 * 1000).toISOString(); // Next escalation in 30 minutes
            } else {
              updated[index].status = 'escalated';
              delete updated[index].escalation.nextActionTime;
            }
          }
        }
      });
      
      return updated;
    });
  };

  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId
            ? {
                ...alert,
                status: action === 'acknowledge' ? 'acknowledged' : action === 'resolve' ? 'resolved' : alert.status,
                lastUpdate: new Date().toISOString(),
                assignee: action === 'assign' ? {
                  id: 'current-user',
                  name: 'Current User',
                  role: 'Admin',
                  contactMethods: ['email']
                } : alert.assignee
              }
            : alert
        )
      );
    } catch (err) {
      console.error('Failed to perform alert action:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'emergency': return AlertTriangle;
      case 'critical': return XCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-red-600 bg-red-100';
      case 'acknowledged': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'suppressed': return 'text-gray-600 bg-gray-100';
      case 'escalated': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filters.status !== 'all' && alert.status !== filters.status) return false;
    if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
    if (filters.server !== 'all' && alert.serverName !== filters.server) return false;
    if (!filters.showSuppressed && alert.status === 'suppressed') return false;
    if (filters.searchQuery && !alert.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'timestamp':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'severity':
        const severityOrder = { emergency: 4, critical: 3, warning: 2, info: 1 };
        return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder];
      case 'server':
        return a.serverName.localeCompare(b.serverName);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intelligent Alerting System</h2>
          <p className="text-gray-600">AI-powered alert management with correlation and automation</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAlertingEnabled(!alertingEnabled)}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              alertingEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {alertingEnabled ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
            {alertingEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <button
            onClick={() => setShowRuleModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Status Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.resolved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Escalated</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.escalated}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">MTTR</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.mttr.toFixed(1)}m</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Auto Resolve</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.autoResolveRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Engine Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">AI Engine Status</h3>
              <p className="text-sm text-gray-600">Intelligent correlation and prediction systems</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${correlationEngine ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">Correlation Engine</span>
              <button
                onClick={() => setCorrelationEngine(!correlationEngine)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {correlationEngine ? 'Disable' : 'Enable'}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${mlAnomalyDetection ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">ML Anomaly Detection</span>
              <button
                onClick={() => setMlAnomalyDetection(!mlAnomalyDetection)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {mlAnomalyDetection ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'alerts', name: 'Alert Dashboard', icon: AlertTriangle },
            { id: 'rules', name: 'Alert Rules', icon: Settings },
            { id: 'policies', name: 'Escalation Policies', icon: TrendingUp },
            { id: 'correlations', name: 'Correlations', icon: Brain },
            { id: 'analytics', name: 'Analytics', icon: BarChart3 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Alert Dashboard */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
                <option value="suppressed">Suppressed</option>
              </select>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severity</option>
                <option value="emergency">Emergency</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showCorrelated"
                  checked={filters.showCorrelated}
                  onChange={(e) => setFilters(prev => ({ ...prev, showCorrelated: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showCorrelated" className="text-sm text-gray-700">Show Correlated</label>
              </div>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="timestamp">Sort by Time</option>
              <option value="severity">Sort by Severity</option>
              <option value="server">Sort by Server</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>

          {/* Alert List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredAlerts.slice(0, 20).map(alert => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                
                return (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowAlertModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <SeverityIcon className={`h-5 w-5 mt-1 ${alert.severity === 'emergency' || alert.severity === 'critical' ? 'text-red-500' : alert.severity === 'warning' ? 'text-yellow-500' : 'text-blue-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">{alert.title}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{alert.serverName}</span>
                            <span>{alert.metric}</span>
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            {alert.correlation.correlatedWith.length > 0 && (
                              <span className="inline-flex items-center text-blue-600">
                                <Brain className="h-3 w-3 mr-1" />
                                {alert.correlation.correlatedWith.length} correlated
                              </span>
                            )}
                            {alert.assignee && (
                              <span className="inline-flex items-center text-green-600">
                                <Users className="h-3 w-3 mr-1" />
                                {alert.assignee.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {alert.status === 'active' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction(alert.id, 'acknowledge');
                            }}
                            className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          >
                            Acknowledge
                          </button>
                        )}
                        {(alert.status === 'active' || alert.status === 'acknowledged') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction(alert.id, 'resolve');
                            }}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedAlert.title}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                    {selectedAlert.severity}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status}
                  </span>
                </div>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Alert Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Server:</span>
                        <span className="font-medium">{selectedAlert.serverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metric:</span>
                        <span className="font-medium">{selectedAlert.metric}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Value:</span>
                        <span className="font-medium">{selectedAlert.value.toFixed(2)}</span>
                      </div>
                      {selectedAlert.threshold && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Threshold:</span>
                          <span className="font-medium">{selectedAlert.threshold.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Source:</span>
                        <span className="font-medium">{selectedAlert.source.system}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impact Scope:</span>
                        <span className="font-medium">{selectedAlert.impact.scope}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-gray-700">{selectedAlert.description}</p>
                    <p className="text-sm text-gray-600 mt-2">{selectedAlert.impact.businessImpact}</p>
                  </div>

                  {selectedAlert.correlation.correlatedWith.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-blue-600" />
                        Correlated Alerts
                      </h4>
                      <div className="space-y-2">
                        {selectedAlert.correlation.correlatedWith.map(correlatedId => (
                          <div key={correlatedId} className="text-sm">
                            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                              Alert {correlatedId}
                            </span>
                            <span className="text-gray-500 ml-2">
                              (Confidence: {selectedAlert.correlation.confidence.toFixed(1)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Pattern: {selectedAlert.correlation.pattern.replace('_', ' ')}
                      </p>
                    </div>
                  )}

                  {selectedAlert.automation.actions.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Automated Actions</h4>
                      <div className="space-y-2">
                        {selectedAlert.automation.actions.map(action => (
                          <div key={action.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{action.type.replace('_', ' ')}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              action.status === 'enabled' ? 'bg-green-100 text-green-800' :
                              action.status === 'executing' ? 'bg-yellow-100 text-yellow-800' :
                              action.status === 'cooldown' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {action.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Created:</span>
                        <span className="block font-medium">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Update:</span>
                        <span className="block font-medium">{new Date(selectedAlert.lastUpdate).toLocaleString()}</span>
                      </div>
                      {selectedAlert.escalation.nextActionTime && (
                        <div>
                          <span className="text-gray-600">Next Escalation:</span>
                          <span className="block font-medium text-orange-600">
                            {new Date(selectedAlert.escalation.nextActionTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
                    <div className="space-y-2">
                      {selectedAlert.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleAlertAction(selectedAlert.id, 'acknowledge')}
                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          >
                            Acknowledge
                          </button>
                          <button
                            onClick={() => handleAlertAction(selectedAlert.id, 'assign')}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Assign to Me
                          </button>
                        </>
                      )}
                      {(selectedAlert.status === 'active' || selectedAlert.status === 'acknowledged') && (
                        <button
                          onClick={() => handleAlertAction(selectedAlert.id, 'resolve')}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      )}
                      <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                        Add Note
                      </button>
                      <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                        Create Ticket
                      </button>
                    </div>
                  </div>

                  {selectedAlert.assignee && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Assignee</h4>
                      <div className="text-sm">
                        <p className="font-medium">{selectedAlert.assignee.name}</p>
                        <p className="text-gray-600">{selectedAlert.assignee.role}</p>
                        <div className="mt-2 space-y-1">
                          {selectedAlert.assignee.contactMethods.map(method => (
                            <span key={method} className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs mr-1">
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedAlert.tags.map(tag => (
                        <span key={tag} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}