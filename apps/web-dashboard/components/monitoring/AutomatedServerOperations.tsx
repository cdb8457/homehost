'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  RefreshCw,
  Settings,
  Calendar,
  Clock,
  Zap,
  Brain,
  Target,
  Shield,
  Activity,
  Server,
  Database,
  Network,
  Cpu,
  MemoryStick,
  HardDrive,
  Users,
  User,
  Bell,
  BellOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Eye,
  EyeOff,
  Edit,
  Save,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  PieChart,
  Layers,
  Grid3X3,
  List,
  Folder,
  File,
  FileText,
  Code,
  Terminal,
  ExternalLink,
  Share2,
  Bookmark,
  Flag,
  Tag,
  Hash,
  AtSign,
  Link,
  Mail,
  Phone,
  Globe,
  MapPin,
  Lock,
  Unlock,
  Heart,
  Star,
  Award,
  Crown,
  Fire,
  Sparkles,
  Lightbulb,
  Rocket,
  Gamepad2
} from 'lucide-react';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'performance' | 'security' | 'backup' | 'scaling' | 'monitoring';
  enabled: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  schedule?: AutomationSchedule;
  targets: AutomationTarget[];
  settings: {
    maxRetries: number;
    retryDelay: number;
    timeout: number;
    rollbackOnFailure: boolean;
    requireApproval: boolean;
    notifyOnFailure: boolean;
    maintenanceWindow: boolean;
  };
  statistics: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    lastExecuted?: string;
    nextExecution?: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface AutomationCondition {
  id: string;
  type: 'metric' | 'event' | 'time' | 'status' | 'user_defined';
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'contains' | 'matches' | 'exists' | 'between';
  field: string;
  value: any;
  threshold?: number;
  duration?: number;
  cooldown?: number;
  logic: 'and' | 'or';
}

interface AutomationAction {
  id: string;
  type: 'restart_server' | 'scale_resources' | 'backup_data' | 'update_config' | 'send_notification' | 'run_script' | 'maintenance_mode' | 'health_check';
  parameters: Record<string, any>;
  order: number;
  condition?: string;
  rollbackAction?: AutomationAction;
  timeout: number;
  retryOnFailure: boolean;
  dependencies: string[];
}

interface AutomationSchedule {
  type: 'cron' | 'interval' | 'event' | 'manual';
  expression?: string;
  interval?: number;
  timezone: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
  excludeDates?: string[];
}

interface AutomationTarget {
  type: 'server' | 'cluster' | 'service' | 'all';
  id: string;
  name: string;
  filters?: Record<string, any>;
}

interface AutomationExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'rolled_back';
  startTime: string;
  endTime?: string;
  duration?: number;
  triggeredBy: 'schedule' | 'condition' | 'manual' | 'cascade';
  trigger: string;
  targets: ExecutionTarget[];
  actions: ExecutionAction[];
  logs: ExecutionLog[];
  error?: string;
  rollbackExecution?: string;
  approvals: ExecutionApproval[];
  metrics: ExecutionMetric[];
}

interface ExecutionTarget {
  targetId: string;
  targetName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  error?: string;
  retryCount: number;
}

interface ExecutionAction {
  actionId: string;
  actionType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: string;
  endTime?: string;
  result?: any;
  error?: string;
  retryCount: number;
}

interface ExecutionLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  component: string;
  targetId?: string;
  actionId?: string;
  details?: Record<string, any>;
}

interface ExecutionApproval {
  id: string;
  requiredBy: string;
  approver?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  comment?: string;
}

interface ExecutionMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rule: Partial<AutomationRule>;
  variables: TemplateVariable[];
  documentation: string;
  examples: string[];
  featured: boolean;
  downloads: number;
  rating: number;
}

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select';
  description: string;
  defaultValue?: any;
  options?: { value: any; label: string }[];
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

interface MaintenanceWindow {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  timezone: string;
  recurring: boolean;
  recurrencePattern?: string;
  affectedServers: string[];
  automatedTasks: string[];
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  approvals: string[];
  notifications: {
    advance: number;
    channels: string[];
    template: string;
  };
}

export function AutomatedServerOperations() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'templates' | 'maintenance' | 'monitoring'>('rules');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [maintenanceWindows, setMaintenanceWindows] = useState<MaintenanceWindow[]>([]);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<AutomationExecution | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priority: 'all',
    enabled: 'all',
    timeRange: '24h',
    searchQuery: ''
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadAutomationData();
    
    if (realTimeUpdates) {
      updateIntervalRef.current = setInterval(() => {
        updateExecutionStatuses();
      }, 5000);
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [realTimeUpdates]);

  const loadAutomationData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAutomationRules(generateMockRules());
      setExecutions(generateMockExecutions());
      setTemplates(generateMockTemplates());
      setMaintenanceWindows(generateMockMaintenanceWindows());
      
      setError(null);
    } catch (err) {
      setError('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockRules = (): AutomationRule[] => {
    const categories = ['maintenance', 'performance', 'security', 'backup', 'scaling', 'monitoring'];
    const priorities = ['low', 'medium', 'high', 'critical'];

    return Array.from({ length, 20 }, (_, i) => ({
      id: `rule-${i + 1}`,
      name: `Automation Rule ${i + 1}`,
      description: generateRuleDescription(categories[i % categories.length]),
      category: categories[i % categories.length] as any,
      enabled: Math.random() > 0.2,
      priority: priorities[i % priorities.length] as any,
      conditions: [
        {
          id: `condition-${i + 1}`,
          type: 'metric',
          operator: 'gt',
          field: 'cpu_usage',
          value: 80,
          threshold: 80,
          duration: 300000, // 5 minutes
          logic: 'and'
        }
      ],
      actions: [
        {
          id: `action-${i + 1}`,
          type: getActionForCategory(categories[i % categories.length]),
          parameters: getActionParameters(categories[i % categories.length]),
          order: 1,
          timeout: 300000,
          retryOnFailure: true,
          dependencies: []
        }
      ],
      schedule: Math.random() > 0.6 ? {
        type: 'cron',
        expression: '0 2 * * *', // Daily at 2 AM
        timezone: 'UTC',
        enabled: true
      } : undefined,
      targets: [
        {
          type: 'server',
          id: `server-${(i % 5) + 1}`,
          name: `Server ${(i % 5) + 1}`
        }
      ],
      settings: {
        maxRetries: 3,
        retryDelay: 30000,
        timeout: 600000,
        rollbackOnFailure: true,
        requireApproval: i % 4 === 0,
        notifyOnFailure: true,
        maintenanceWindow: i % 6 === 0
      },
      statistics: {
        totalExecutions: Math.floor(Math.random() * 100) + 10,
        successfulExecutions: Math.floor(Math.random() * 90) + 5,
        failedExecutions: Math.floor(Math.random() * 10),
        averageExecutionTime: Math.floor(Math.random() * 300) + 30,
        lastExecuted: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        nextExecution: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : undefined
      },
      createdBy: 'admin',
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['automated', 'production', 'critical'].slice(0, Math.floor(Math.random() * 3) + 1)
    }));
  };

  const generateRuleDescription = (category: string): string => {
    const descriptions = {
      maintenance: 'Automatically restart servers during low activity periods',
      performance: 'Scale resources when CPU usage exceeds threshold',
      security: 'Update security configurations and restart affected services',
      backup: 'Perform automated backups of server data and configurations',
      scaling: 'Dynamically adjust server resources based on player demand',
      monitoring: 'Check server health and send alerts for issues'
    };
    return descriptions[category as keyof typeof descriptions] || 'Automated server operation';
  };

  const getActionForCategory = (category: string): string => {
    const actions = {
      maintenance: 'restart_server',
      performance: 'scale_resources',
      security: 'update_config',
      backup: 'backup_data',
      scaling: 'scale_resources',
      monitoring: 'health_check'
    };
    return actions[category as keyof typeof actions] || 'restart_server';
  };

  const getActionParameters = (category: string): Record<string, any> => {
    const parameters = {
      maintenance: { graceful: true, notifyUsers: true, delay: 60 },
      performance: { resourceType: 'cpu', scaleFactor: 1.5, maxInstances: 10 },
      security: { configFile: 'security.conf', restartRequired: true },
      backup: { includeUserData: true, compression: true, retention: 30 },
      scaling: { minInstances: 1, maxInstances: 5, cooldown: 300 },
      monitoring: { timeout: 30, retries: 3, alertOnFailure: true }
    };
    return parameters[category as keyof typeof parameters] || {};
  };

  const generateMockExecutions = (): AutomationExecution[] => {
    const statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    const triggers = ['schedule', 'condition', 'manual', 'cascade'];

    return Array.from({ length: 50 }, (_, i) => {
      const status = statuses[i % statuses.length] as any;
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const endTime = status === 'completed' || status === 'failed' ? 
        new Date(startTime.getTime() + Math.random() * 60 * 60 * 1000) : undefined;

      return {
        id: `execution-${i + 1}`,
        ruleId: `rule-${(i % 20) + 1}`,
        ruleName: `Automation Rule ${(i % 20) + 1}`,
        status,
        startTime: startTime.toISOString(),
        endTime: endTime?.toISOString(),
        duration: endTime ? endTime.getTime() - startTime.getTime() : undefined,
        triggeredBy: triggers[i % triggers.length] as any,
        trigger: 'CPU usage > 80% for 5 minutes',
        targets: [
          {
            targetId: `server-${(i % 5) + 1}`,
            targetName: `Server ${(i % 5) + 1}`,
            status: status === 'running' ? 'running' : status === 'completed' ? 'completed' : status,
            startTime: startTime.toISOString(),
            endTime: endTime?.toISOString(),
            error: status === 'failed' ? 'Connection timeout' : undefined,
            retryCount: status === 'failed' ? Math.floor(Math.random() * 3) : 0
          }
        ],
        actions: [
          {
            actionId: `action-${i + 1}`,
            actionType: 'restart_server',
            status: status === 'running' ? 'running' : status === 'completed' ? 'completed' : status,
            startTime: startTime.toISOString(),
            endTime: endTime?.toISOString(),
            result: status === 'completed' ? { success: true, message: 'Server restarted successfully' } : undefined,
            error: status === 'failed' ? 'Failed to restart server' : undefined,
            retryCount: 0
          }
        ],
        logs: [
          {
            timestamp: startTime.toISOString(),
            level: 'info',
            message: 'Execution started',
            component: 'automation-engine'
          },
          {
            timestamp: new Date(startTime.getTime() + 30000).toISOString(),
            level: 'info',
            message: 'Target server identified',
            component: 'target-resolver',
            targetId: `server-${(i % 5) + 1}`
          }
        ],
        error: status === 'failed' ? 'Execution failed due to server connection timeout' : undefined,
        approvals: i % 4 === 0 ? [
          {
            id: `approval-${i + 1}`,
            requiredBy: 'automation-policy',
            approver: status !== 'pending' ? 'admin' : undefined,
            status: status === 'pending' ? 'pending' : 'approved',
            timestamp: startTime.toISOString(),
            comment: status !== 'pending' ? 'Approved for execution' : undefined
          }
        ] : [],
        metrics: status === 'completed' ? [
          {
            name: 'execution_time',
            value: endTime ? endTime.getTime() - startTime.getTime() : 0,
            unit: 'ms',
            timestamp: endTime?.toISOString() || startTime.toISOString()
          }
        ] : []
      };
    });
  };

  const generateMockTemplates = (): AutomationTemplate[] => {
    return [
      {
        id: 'template-1',
        name: 'Daily Server Restart',
        description: 'Automatically restart servers during low activity periods',
        category: 'Maintenance',
        icon: 'restart',
        rule: {
          name: 'Daily Server Restart',
          category: 'maintenance',
          schedule: {
            type: 'cron',
            expression: '0 4 * * *',
            timezone: 'UTC',
            enabled: true
          },
          actions: [
            {
              id: 'action-1',
              type: 'restart_server',
              parameters: { graceful: true, notifyUsers: true },
              order: 1,
              timeout: 600000,
              retryOnFailure: true,
              dependencies: []
            }
          ]
        },
        variables: [
          {
            name: 'restart_time',
            type: 'string',
            description: 'Time to restart server (cron format)',
            defaultValue: '0 4 * * *',
            required: true
          },
          {
            name: 'notify_users',
            type: 'boolean',
            description: 'Notify users before restart',
            defaultValue: true,
            required: false
          }
        ],
        documentation: 'This template creates a rule to restart servers daily during low activity periods.',
        examples: ['Daily at 4 AM', 'Weekly on Sunday at 3 AM'],
        featured: true,
        downloads: 1250,
        rating: 4.8
      },
      {
        id: 'template-2',
        name: 'Auto-Scale on High Load',
        description: 'Automatically scale server resources when load is high',
        category: 'Performance',
        icon: 'scale',
        rule: {
          name: 'Auto-Scale on High Load',
          category: 'scaling',
          conditions: [
            {
              id: 'condition-1',
              type: 'metric',
              operator: 'gt',
              field: 'cpu_usage',
              value: 80,
              duration: 300000,
              logic: 'and'
            }
          ],
          actions: [
            {
              id: 'action-1',
              type: 'scale_resources',
              parameters: { resourceType: 'cpu', scaleFactor: 1.5 },
              order: 1,
              timeout: 300000,
              retryOnFailure: true,
              dependencies: []
            }
          ]
        },
        variables: [
          {
            name: 'cpu_threshold',
            type: 'number',
            description: 'CPU usage threshold to trigger scaling',
            defaultValue: 80,
            required: true,
            validation: { min: 50, max: 95 }
          },
          {
            name: 'scale_factor',
            type: 'number',
            description: 'Resource scaling factor',
            defaultValue: 1.5,
            required: true,
            validation: { min: 1.1, max: 3.0 }
          }
        ],
        documentation: 'This template automatically scales server resources when CPU usage exceeds the threshold.',
        examples: ['Scale at 80% CPU', 'Scale at 90% CPU with 2x factor'],
        featured: true,
        downloads: 890,
        rating: 4.6
      }
    ];
  };

  const generateMockMaintenanceWindows = (): MaintenanceWindow[] => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `maintenance-${i + 1}`,
      name: `Maintenance Window ${i + 1}`,
      description: `Scheduled maintenance for server updates and optimization`,
      startTime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      timezone: 'UTC',
      recurring: i % 3 === 0,
      recurrencePattern: i % 3 === 0 ? '0 2 * * 0' : undefined, // Weekly on Sunday at 2 AM
      affectedServers: [`server-${(i % 5) + 1}`, `server-${((i + 1) % 5) + 1}`],
      automatedTasks: [`rule-${(i % 10) + 1}`, `rule-${((i + 5) % 10) + 1}`],
      status: ['scheduled', 'active', 'completed'][i % 3] as any,
      createdBy: 'admin',
      approvals: ['manager', 'lead-engineer'],
      notifications: {
        advance: 24 * 60 * 60 * 1000, // 24 hours
        channels: ['email', 'slack', 'discord'],
        template: 'maintenance-notification'
      }
    }));
  };

  const updateExecutionStatuses = () => {
    setExecutions(prev => 
      prev.map(execution => {
        if (execution.status === 'running' && Math.random() > 0.8) {
          // Randomly complete or fail some running executions
          const newStatus = Math.random() > 0.8 ? 'failed' : 'completed';
          return {
            ...execution,
            status: newStatus,
            endTime: new Date().toISOString(),
            duration: Date.now() - new Date(execution.startTime).getTime()
          };
        }
        return execution;
      })
    );
  };

  const handleToggleRule = async (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const handleExecuteRule = async (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) return;

    const newExecution: AutomationExecution = {
      id: `execution-${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      status: 'running',
      startTime: new Date().toISOString(),
      triggeredBy: 'manual',
      trigger: 'Manual execution',
      targets: rule.targets.map(target => ({
        targetId: target.id,
        targetName: target.name,
        status: 'running',
        startTime: new Date().toISOString(),
        retryCount: 0
      })),
      actions: rule.actions.map(action => ({
        actionId: action.id,
        actionType: action.type,
        status: 'running',
        startTime: new Date().toISOString(),
        retryCount: 0
      })),
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Manual execution started',
          component: 'automation-engine'
        }
      ],
      approvals: [],
      metrics: []
    };

    setExecutions(prev => [newExecution, ...prev]);

    // Simulate completion after a few seconds
    setTimeout(() => {
      setExecutions(prev => 
        prev.map(exec => 
          exec.id === newExecution.id
            ? {
                ...exec,
                status: 'completed',
                endTime: new Date().toISOString(),
                duration: Date.now() - new Date(exec.startTime).getTime(),
                targets: exec.targets.map(target => ({
                  ...target,
                  status: 'completed',
                  endTime: new Date().toISOString()
                })),
                actions: exec.actions.map(action => ({
                  ...action,
                  status: 'completed',
                  endTime: new Date().toISOString(),
                  result: { success: true, message: 'Action completed successfully' }
                }))
              }
            : exec
        )
      );
    }, 3000 + Math.random() * 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      case 'rolled_back': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'maintenance': return RotateCcw;
      case 'performance': return TrendingUp;
      case 'security': return Shield;
      case 'backup': return Database;
      case 'scaling': return ArrowUp;
      case 'monitoring': return Activity;
      default: return Settings;
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const filteredRules = automationRules.filter(rule => {
    if (filters.category !== 'all' && rule.category !== filters.category) return false;
    if (filters.priority !== 'all' && rule.priority !== filters.priority) return false;
    if (filters.enabled !== 'all' && rule.enabled.toString() !== filters.enabled) return false;
    if (filters.searchQuery && !rule.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
  });

  const filteredExecutions = executions.filter(execution => {
    if (filters.status !== 'all' && execution.status !== filters.status) return false;
    if (filters.searchQuery && !execution.ruleName.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    return true;
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
          <h2 className="text-2xl font-bold text-gray-900">Automated Server Operations</h2>
          <p className="text-gray-600">Intelligent automation for server maintenance, scaling, and optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutomationEnabled(!automationEnabled)}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              automationEnabled
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {automationEnabled ? <Play className="h-4 w-4 mr-2" /> : <Pause className="h-4 w-4 mr-2" />}
            {automationEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <button
            onClick={() => setShowRuleModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">
                {automationRules.filter(r => r.enabled).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Play className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-2xl font-bold text-gray-900">
                {executions.filter(e => e.status === 'running').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {executions.filter(e => e.status === 'completed' && 
                  new Date(e.startTime).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Failed Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {executions.filter(e => e.status === 'failed' && 
                  new Date(e.startTime).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">Automation Engine Status</h3>
              <p className="text-sm text-gray-600">Intelligent rule processing and execution management</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${automationEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">Engine</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${realTimeUpdates ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium">Real-time Updates</span>
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {realTimeUpdates ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'rules', name: 'Automation Rules', icon: Settings },
            { id: 'executions', name: 'Executions', icon: Play },
            { id: 'templates', name: 'Templates', icon: Folder },
            { id: 'maintenance', name: 'Maintenance Windows', icon: Calendar },
            { id: 'monitoring', name: 'Monitoring', icon: BarChart3 }
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

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rules..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="maintenance">Maintenance</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="backup">Backup</option>
                <option value="scaling">Scaling</option>
                <option value="monitoring">Monitoring</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={filters.enabled}
                onChange={(e) => setFilters(prev => ({ ...prev, enabled: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRules.map(rule => {
              const CategoryIcon = getCategoryIcon(rule.category);
              
              return (
                <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <CategoryIcon className={`h-5 w-5 ${rule.enabled ? 'text-blue-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                        <p className="text-sm text-gray-600">{rule.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getPriorityColor(rule.priority)}`}>
                        {rule.priority}
                      </span>
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          rule.enabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">{rule.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-600">Executions:</span>
                      <span className="block font-medium">{rule.statistics.totalExecutions}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Success Rate:</span>
                      <span className="block font-medium">
                        {rule.statistics.totalExecutions > 0 
                          ? Math.round((rule.statistics.successfulExecutions / rule.statistics.totalExecutions) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Duration:</span>
                      <span className="block font-medium">{formatDuration(rule.statistics.averageExecutionTime * 1000)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Run:</span>
                      <span className="block font-medium">
                        {rule.statistics.lastExecuted 
                          ? new Date(rule.statistics.lastExecuted).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>

                  {rule.schedule && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">Scheduled:</span>
                        <span className="font-mono">{rule.schedule.expression}</span>
                      </div>
                      {rule.statistics.nextExecution && (
                        <div className="text-xs text-gray-500 mt-1">
                          Next: {new Date(rule.statistics.nextExecution).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {rule.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleExecuteRule(rule.id)}
                        className="p-2 text-green-600 hover:text-green-800"
                        disabled={!rule.enabled}
                        title="Execute now"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRule(rule);
                          setShowRuleModal(true);
                        }}
                        className="p-2 text-blue-600 hover:text-blue-800"
                        title="Edit rule"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Executions Tab */}
      {activeTab === 'executions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search executions..."
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
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Executions List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Execution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trigger
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExecutions.slice(0, 20).map(execution => (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{execution.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{execution.ruleName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{execution.triggeredBy}</div>
                        <div className="text-sm text-gray-500">{execution.trigger}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {execution.duration ? formatDuration(execution.duration) : 
                         execution.status === 'running' ? formatDuration(Date.now() - new Date(execution.startTime).getTime()) : 
                         '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(execution.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedExecution(execution);
                              setShowExecutionModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {execution.status === 'running' && (
                            <button className="text-red-600 hover:text-red-900">
                              <Square className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                  </div>
                  {template.featured && (
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-4">{template.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Downloads:</span>
                    <span className="block font-medium">{template.downloads.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rating:</span>
                    <span className="block font-medium">{template.rating.toFixed(1)}/5</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {template.variables.length} variables
                  </div>
                  <button
                    onClick={() => {
                      // Create a new rule from template
                      const newRule: Partial<AutomationRule> = {
                        ...template.rule,
                        name: `${template.name} - ${Date.now()}`,
                        id: `rule-${Date.now()}`,
                        enabled: false,
                        createdBy: 'current-user',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        tags: ['from-template']
                      };
                      setSelectedRule(newRule as AutomationRule);
                      setShowRuleModal(true);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Detail Modal */}
      {selectedExecution && showExecutionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900">Execution Details</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedExecution.status)}`}>
                    {selectedExecution.status}
                  </span>
                </div>
                <button
                  onClick={() => setShowExecutionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Execution Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Execution ID:</span>
                        <span className="block font-mono">{selectedExecution.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rule:</span>
                        <span className="block">{selectedExecution.ruleName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Triggered By:</span>
                        <span className="block">{selectedExecution.triggeredBy}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Started:</span>
                        <span className="block">{new Date(selectedExecution.startTime).toLocaleString()}</span>
                      </div>
                      {selectedExecution.endTime && (
                        <>
                          <div>
                            <span className="text-gray-600">Ended:</span>
                            <span className="block">{new Date(selectedExecution.endTime).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <span className="block">{selectedExecution.duration ? formatDuration(selectedExecution.duration) : '-'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Targets</h4>
                    <div className="space-y-3">
                      {selectedExecution.targets.map(target => (
                        <div key={target.targetId} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <div className="font-medium">{target.targetName}</div>
                            <div className="text-sm text-gray-500">ID: {target.targetId}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(target.status)}`}>
                              {target.status}
                            </span>
                            {target.retryCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {target.retryCount} retries
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Actions</h4>
                    <div className="space-y-3">
                      {selectedExecution.actions.map(action => (
                        <div key={action.actionId} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div>
                            <div className="font-medium">{action.actionType.replace('_', ' ')}</div>
                            <div className="text-sm text-gray-500">ID: {action.actionId}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                              {action.status}
                            </span>
                            {action.retryCount > 0 && (
                              <span className="text-xs text-gray-500">
                                {action.retryCount} retries
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Execution Logs</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedExecution.logs.map((log, i) => (
                        <div key={i} className="text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={`font-medium ${
                              log.level === 'error' ? 'text-red-600' :
                              log.level === 'warning' ? 'text-yellow-600' :
                              log.level === 'info' ? 'text-blue-600' :
                              'text-gray-600'
                            }`}>
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-gray-600">[{log.component}]</span>
                          </div>
                          <div className="text-gray-800 ml-2">{log.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedExecution.error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-900 mb-2">Error</h4>
                      <p className="text-sm text-red-700">{selectedExecution.error}</p>
                    </div>
                  )}

                  {selectedExecution.approvals.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Approvals</h4>
                      <div className="space-y-2">
                        {selectedExecution.approvals.map(approval => (
                          <div key={approval.id} className="flex items-center justify-between text-sm">
                            <span>{approval.requiredBy}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                              approval.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {approval.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}