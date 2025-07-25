'use client';

import { useState, useEffect, useRef } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Settings,
  FileText,
  GitBranch,
  GitCommit,
  GitMerge,
  Clock,
  User,
  Users,
  Check,
  X,
  Edit,
  Save,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Zap,
  Target,
  Activity,
  BarChart3,
  TrendingUp,
  Server,
  Database,
  Network,
  Cpu,
  MemoryStick,
  HardDrive,
  Globe,
  Layers,
  Grid3X3,
  List,
  Folder,
  FolderOpen,
  File,
  Code,
  Terminal,
  Play,
  Pause,
  Square,
  RotateCcw,
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
  Bell,
  BellOff,
  Heart,
  Star,
  Award,
  Crown,
  Fire,
  Sparkles,
  Lightbulb,
  Brain,
  Rocket,
  Gamepad2
} from 'lucide-react';

interface ConfigurationFile {
  id: string;
  name: string;
  path: string;
  type: 'server' | 'game' | 'plugin' | 'system' | 'security' | 'network';
  format: 'json' | 'yaml' | 'ini' | 'properties' | 'xml' | 'toml';
  size: number;
  encoding: string;
  content: string;
  hash: string;
  lastModified: string;
  modifiedBy: string;
  version: string;
  locked: boolean;
  template: boolean;
  validated: boolean;
  validationErrors: ValidationError[];
  tags: string[];
  description: string;
  dependencies: string[];
  permissions: ConfigPermissions;
}

interface ValidationError {
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
  suggestion?: string;
}

interface ConfigPermissions {
  read: string[];
  write: string[];
  execute: string[];
  admin: string[];
}

interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  gameType: string;
  version: string;
  author: string;
  tags: string[];
  files: ConfigurationFile[];
  variables: TemplateVariable[];
  requirements: string[];
  compatibility: string[];
  documentation: string;
  downloads: number;
  rating: number;
  featured: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  defaultValue: any;
  required: boolean;
  validation: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
}

interface ConfigurationChange {
  id: string;
  fileId: string;
  fileName: string;
  serverId: string;
  serverName: string;
  type: 'create' | 'update' | 'delete' | 'move' | 'copy';
  author: string;
  timestamp: string;
  message: string;
  diff: ConfigDiff;
  status: 'pending' | 'approved' | 'rejected' | 'applied' | 'failed' | 'rolled_back';
  approvers: string[];
  reviewers: ChangeReviewer[];
  rollbackId?: string;
  tags: string[];
  impact: ChangeImpact;
}

interface ConfigDiff {
  additions: number;
  deletions: number;
  modifications: number;
  chunks: DiffChunk[];
}

interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

interface DiffLine {
  type: 'context' | 'addition' | 'deletion';
  oldNumber?: number;
  newNumber?: number;
  content: string;
  highlight?: boolean;
}

interface ChangeReviewer {
  userId: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp?: string;
}

interface ChangeImpact {
  scope: 'file' | 'server' | 'cluster' | 'global';
  risk: 'low' | 'medium' | 'high' | 'critical';
  affectedServices: string[];
  rollbackRequired: boolean;
  testingRequired: boolean;
  maintenanceWindow: boolean;
}

interface BulkOperation {
  id: string;
  name: string;
  description: string;
  type: 'update' | 'deploy' | 'backup' | 'restore' | 'validate' | 'sync';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  targets: BulkTarget[];
  operations: Operation[];
  progress: {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
  };
  schedule?: {
    type: 'immediate' | 'scheduled' | 'recurring';
    startTime?: string;
    endTime?: string;
    cron?: string;
  };
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  logs: OperationLog[];
}

interface BulkTarget {
  serverId: string;
  serverName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  error?: string;
  startTime?: string;
  endTime?: string;
}

interface Operation {
  id: string;
  type: string;
  description: string;
  parameters: Record<string, any>;
  dependencies: string[];
  condition?: string;
}

interface OperationLog {
  timestamp: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  serverId?: string;
  operation?: string;
  details?: Record<string, any>;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'performance' | 'backup' | 'monitoring' | 'documentation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  pattern: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  exceptions: string[];
  lastChecked: string;
  violations: ComplianceViolation[];
}

interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'matches' | 'exists' | 'range';
  value: any;
  negated: boolean;
}

interface RuleAction {
  type: 'warn' | 'block' | 'auto_fix' | 'notify' | 'escalate';
  parameters: Record<string, any>;
}

interface ComplianceViolation {
  id: string;
  ruleId: string;
  serverId: string;
  fileId: string;
  severity: string;
  message: string;
  line?: number;
  column?: number;
  detectedAt: string;
  resolvedAt?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'suppressed';
  assignee?: string;
}

export function ConfigurationManagementSystem() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'templates' | 'changes' | 'bulk' | 'compliance'>('files');
  const [configFiles, setConfigFiles] = useState<ConfigurationFile[]>([]);
  const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
  const [changes, setChanges] = useState<ConfigurationChange[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [selectedFile, setSelectedFile] = useState<ConfigurationFile | null>(null);
  const [selectedChange, setSelectedChange] = useState<ConfigurationChange | null>(null);
  const [selectedBulkOp, setSelectedBulkOp] = useState<BulkOperation | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    server: 'all',
    author: 'all',
    timeRange: 'all',
    searchQuery: '',
    showTemplates: false,
    showValidationErrors: false
  });
  const [viewMode, setViewMode] = useState<'list' | 'tree' | 'grid'>('list');
  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConfigurationData();
  }, []);

  const loadConfigurationData = async () => {
    try {
      setLoading(true);
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfigFiles(generateMockConfigFiles());
      setTemplates(generateMockTemplates());
      setChanges(generateMockChanges());
      setBulkOperations(generateMockBulkOperations());
      setComplianceRules(generateMockComplianceRules());
      
      setError(null);
    } catch (err) {
      setError('Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  const generateMockConfigFiles = (): ConfigurationFile[] => {
    const types = ['server', 'game', 'plugin', 'system', 'security', 'network'];
    const formats = ['json', 'yaml', 'ini', 'properties', 'xml', 'toml'];
    const fileNames = [
      'server.properties',
      'bukkit.yml',
      'spigot.yml',
      'paper.yml',
      'config.json',
      'whitelist.json',
      'ops.json',
      'permissions.yml',
      'worlds.yml',
      'database.properties',
      'logging.properties',
      'security.conf',
      'network.ini',
      'backup.yaml',
      'monitoring.toml'
    ];

    return fileNames.map((name, i) => ({
      id: `config-${i + 1}`,
      name,
      path: `/configs/${name}`,
      type: types[i % types.length] as any,
      format: formats[i % formats.length] as any,
      size: Math.floor(Math.random() * 10000) + 1000,
      encoding: 'UTF-8',
      content: generateMockFileContent(formats[i % formats.length] as any),
      hash: `sha256-${Math.random().toString(36).substring(2, 15)}`,
      lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      modifiedBy: ['admin', 'system', 'operator'][i % 3],
      version: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      locked: Math.random() > 0.8,
      template: Math.random() > 0.7,
      validated: Math.random() > 0.2,
      validationErrors: Math.random() > 0.7 ? generateMockValidationErrors() : [],
      tags: ['production', 'stable', 'backup', 'monitored'].slice(0, Math.floor(Math.random() * 3) + 1),
      description: `Configuration file for ${name.split('.')[0]} settings`,
      dependencies: Math.random() > 0.6 ? [`config-${(i % 5) + 1}`] : [],
      permissions: {
        read: ['admin', 'operator', 'viewer'],
        write: ['admin', 'operator'],
        execute: ['admin'],
        admin: ['admin']
      }
    }));
  };

  const generateMockFileContent = (format: string): string => {
    switch (format) {
      case 'json':
        return JSON.stringify({
          server: {
            port: 25565,
            maxPlayers: 20,
            motd: "Welcome to our server!",
            difficulty: "normal",
            gamemode: "survival"
          },
          world: {
            name: "world",
            seed: 12345,
            generator: "default"
          }
        }, null, 2);
      case 'yaml':
        return `server:
  port: 25565
  max-players: 20
  motd: "Welcome to our server!"
  difficulty: normal
  gamemode: survival
world:
  name: world
  seed: 12345
  generator: default`;
      case 'ini':
        return `[server]
port=25565
max-players=20
motd=Welcome to our server!
difficulty=normal
gamemode=survival

[world]
name=world
seed=12345
generator=default`;
      case 'properties':
        return `server-port=25565
max-players=20
motd=Welcome to our server!
difficulty=normal
gamemode=survival
level-name=world
level-seed=12345`;
      case 'xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <server>
    <port>25565</port>
    <maxPlayers>20</maxPlayers>
    <motd>Welcome to our server!</motd>
  </server>
</configuration>`;
      case 'toml':
        return `[server]
port = 25565
max_players = 20
motd = "Welcome to our server!"
difficulty = "normal"
gamemode = "survival"

[world]
name = "world"
seed = 12345
generator = "default"`;
      default:
        return '# Configuration file\nkey=value\n';
    }
  };

  const generateMockValidationErrors = (): ValidationError[] => {
    const errors = [
      {
        line: 5,
        column: 12,
        severity: 'error' as const,
        message: 'Invalid port number. Must be between 1024 and 65535.',
        rule: 'port-range',
        suggestion: 'Use a port number between 1024 and 65535'
      },
      {
        line: 8,
        column: 1,
        severity: 'warning' as const,
        message: 'Missing required field: server-name',
        rule: 'required-fields',
        suggestion: 'Add server-name property'
      }
    ];
    
    return errors.slice(0, Math.floor(Math.random() * 2) + 1);
  };

  const generateMockTemplates = (): ConfigurationTemplate[] => {
    const categories = ['Minecraft', 'Valheim', 'Rust', 'CS:GO', 'General'];
    const gameTypes = ['Survival', 'Creative', 'PvP', 'Modded', 'Vanilla'];

    return Array.from({ length: 20 }, (_, i) => ({
      id: `template-${i + 1}`,
      name: `${categories[i % categories.length]} ${gameTypes[i % gameTypes.length]} Template`,
      description: `Pre-configured template for ${categories[i % categories.length]} ${gameTypes[i % gameTypes.length]} servers`,
      category: categories[i % categories.length],
      gameType: gameTypes[i % gameTypes.length],
      version: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 5)}.0`,
      author: ['HomeHost Team', 'Community', 'Official'][i % 3],
      tags: ['popular', 'recommended', 'stable', 'optimized'].slice(0, Math.floor(Math.random() * 3) + 1),
      files: generateMockConfigFiles().slice(0, Math.floor(Math.random() * 5) + 2),
      variables: [
        {
          name: 'server_port',
          type: 'number',
          description: 'Server port number',
          defaultValue: 25565,
          required: true,
          validation: { min: 1024, max: 65535 }
        },
        {
          name: 'max_players',
          type: 'number',
          description: 'Maximum number of players',
          defaultValue: 20,
          required: true,
          validation: { min: 1, max: 100 }
        }
      ],
      requirements: ['Java 17+', 'Minimum 2GB RAM'],
      compatibility: ['Linux', 'Windows', 'Docker'],
      documentation: 'Comprehensive setup guide with best practices and optimization tips.',
      downloads: Math.floor(Math.random() * 10000) + 100,
      rating: 3.5 + Math.random() * 1.5,
      featured: Math.random() > 0.8,
      verified: Math.random() > 0.3,
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const generateMockChanges = (): ConfigurationChange[] => {
    const types = ['create', 'update', 'delete', 'move', 'copy'];
    const statuses = ['pending', 'approved', 'rejected', 'applied', 'failed', 'rolled_back'];
    const servers = ['Minecraft Main', 'Valheim Creative', 'Rust PvP', 'CS:GO Casual', 'ARK Survival'];

    return Array.from({ length: 30 }, (_, i) => ({
      id: `change-${i + 1}`,
      fileId: `config-${(i % 15) + 1}`,
      fileName: `config-${(i % 15) + 1}.properties`,
      serverId: `server-${(i % servers.length) + 1}`,
      serverName: servers[i % servers.length],
      type: types[i % types.length] as any,
      author: ['admin', 'operator', 'system'][i % 3],
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      message: `${types[i % types.length]} configuration for ${servers[i % servers.length]}`,
      diff: {
        additions: Math.floor(Math.random() * 10) + 1,
        deletions: Math.floor(Math.random() * 5),
        modifications: Math.floor(Math.random() * 8) + 1,
        chunks: [
          {
            oldStart: 1,
            oldLines: 5,
            newStart: 1,
            newLines: 6,
            lines: [
              { type: 'context', oldNumber: 1, newNumber: 1, content: 'server-port=25565' },
              { type: 'deletion', oldNumber: 2, content: 'max-players=10' },
              { type: 'addition', newNumber: 2, content: 'max-players=20' },
              { type: 'context', oldNumber: 3, newNumber: 3, content: 'difficulty=normal' }
            ]
          }
        ]
      },
      status: statuses[i % statuses.length] as any,
      approvers: ['admin'],
      reviewers: [
        {
          userId: 'reviewer-1',
          name: 'Senior Admin',
          status: Math.random() > 0.5 ? 'approved' : 'pending',
          comment: Math.random() > 0.5 ? 'Looks good to me' : undefined,
          timestamp: Math.random() > 0.5 ? new Date().toISOString() : undefined
        }
      ],
      tags: ['urgent', 'scheduled', 'tested'].slice(0, Math.floor(Math.random() * 2) + 1),
      impact: {
        scope: ['file', 'server', 'cluster', 'global'][i % 4] as any,
        risk: ['low', 'medium', 'high', 'critical'][i % 4] as any,
        affectedServices: ['game-server', 'database'].slice(0, Math.floor(Math.random() * 2) + 1),
        rollbackRequired: Math.random() > 0.7,
        testingRequired: Math.random() > 0.5,
        maintenanceWindow: Math.random() > 0.8
      }
    }));
  };

  const generateMockBulkOperations = (): BulkOperation[] => {
    const types = ['update', 'deploy', 'backup', 'restore', 'validate', 'sync'];
    const statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    const servers = ['Minecraft Main', 'Valheim Creative', 'Rust PvP', 'CS:GO Casual', 'ARK Survival'];

    return Array.from({ length: 10 }, (_, i) => ({
      id: `bulk-${i + 1}`,
      name: `${types[i % types.length]} Operation ${i + 1}`,
      description: `Bulk ${types[i % types.length]} across multiple servers`,
      type: types[i % types.length] as any,
      status: statuses[i % statuses.length] as any,
      targets: servers.map((server, j) => ({
        serverId: `server-${j + 1}`,
        serverName: server,
        status: statuses[j % statuses.length] as any,
        error: j === 2 ? 'Connection timeout' : undefined,
        startTime: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        endTime: j < 3 ? new Date().toISOString() : undefined
      })),
      operations: [
        {
          id: 'op-1',
          type: 'backup_config',
          description: 'Backup current configuration',
          parameters: { includeUserData: true },
          dependencies: []
        },
        {
          id: 'op-2',
          type: 'apply_changes',
          description: 'Apply configuration changes',
          parameters: { validateFirst: true },
          dependencies: ['op-1']
        }
      ],
      progress: {
        total: servers.length,
        completed: Math.floor(Math.random() * servers.length),
        failed: Math.floor(Math.random() * 2),
        skipped: 0
      },
      schedule: Math.random() > 0.7 ? {
        type: 'scheduled',
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      } : { type: 'immediate' },
      createdBy: 'admin',
      createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      startedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString() : undefined,
      completedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Operation started',
          operation: 'op-1'
        },
        {
          timestamp: new Date().toISOString(),
          level: 'warning',
          message: 'Server connection slow',
          serverId: 'server-2',
          operation: 'op-1'
        }
      ]
    }));
  };

  const generateMockComplianceRules = (): ComplianceRule[] => {
    return [
      {
        id: 'rule-1',
        name: 'Security Configuration Check',
        description: 'Ensures security settings are properly configured',
        category: 'security',
        severity: 'critical',
        enabled: true,
        pattern: 'security.*',
        conditions: [
          {
            field: 'enable-encryption',
            operator: 'equals',
            value: true,
            negated: false
          }
        ],
        actions: [
          {
            type: 'warn',
            parameters: { message: 'Security setting not properly configured' }
          }
        ],
        exceptions: [],
        lastChecked: new Date().toISOString(),
        violations: [
          {
            id: 'violation-1',
            ruleId: 'rule-1',
            serverId: 'server-1',
            fileId: 'config-1',
            severity: 'critical',
            message: 'Encryption is disabled',
            line: 15,
            detectedAt: new Date().toISOString(),
            status: 'open'
          }
        ]
      }
    ];
  };

  const handleFileEdit = async (file: ConfigurationFile) => {
    setSelectedFile(file);
    setEditMode(true);
    setShowFileModal(true);
  };

  const handleFileSave = async () => {
    if (!selectedFile || !editorRef.current) return;
    
    try {
      const newContent = editorRef.current.value;
      
      // Create a change record
      const change: ConfigurationChange = {
        id: `change-${Date.now()}`,
        fileId: selectedFile.id,
        fileName: selectedFile.name,
        serverId: 'server-1',
        serverName: 'Current Server',
        type: 'update',
        author: 'current-user',
        timestamp: new Date().toISOString(),
        message: `Updated ${selectedFile.name}`,
        diff: {
          additions: 1,
          deletions: 0,
          modifications: 1,
          chunks: []
        },
        status: 'pending',
        approvers: ['admin'],
        reviewers: [],
        tags: ['manual-edit'],
        impact: {
          scope: 'file',
          risk: 'low',
          affectedServices: [],
          rollbackRequired: true,
          testingRequired: false,
          maintenanceWindow: false
        }
      };
      
      setChanges(prev => [change, ...prev]);
      
      // Update the file
      setConfigFiles(prev => 
        prev.map(f => 
          f.id === selectedFile.id
            ? {
                ...f,
                content: newContent,
                lastModified: new Date().toISOString(),
                modifiedBy: 'current-user'
              }
            : f
        )
      );
      
      setEditMode(false);
      setShowFileModal(false);
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  };

  const handleApproveChange = async (changeId: string) => {
    setChanges(prev => 
      prev.map(change => 
        change.id === changeId
          ? { ...change, status: 'approved' }
          : change
      )
    );
  };

  const handleRejectChange = async (changeId: string) => {
    setChanges(prev => 
      prev.map(change => 
        change.id === changeId
          ? { ...change, status: 'rejected' }
          : change
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'applied': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const filteredFiles = configFiles.filter(file => {
    if (filters.type !== 'all' && file.type !== filters.type) return false;
    if (filters.searchQuery && !file.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
    if (filters.showValidationErrors && file.validationErrors.length === 0) return false;
    return true;
  });

  const filteredChanges = changes.filter(change => {
    if (filters.status !== 'all' && change.status !== filters.status) return false;
    if (filters.author !== 'all' && change.author !== filters.author) return false;
    if (filters.searchQuery && !change.message.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
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
          <h2 className="text-2xl font-bold text-gray-900">Configuration Management</h2>
          <p className="text-gray-600">Version control, templates, and bulk operations for server configurations</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            Bulk Operation
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Configuration Files</p>
              <p className="text-2xl font-bold text-gray-900">{configFiles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <GitCommit className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending Changes</p>
              <p className="text-2xl font-bold text-gray-900">
                {changes.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Folder className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Validation Errors</p>
              <p className="text-2xl font-bold text-gray-900">
                {configFiles.reduce((sum, f) => sum + f.validationErrors.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'files', name: 'Configuration Files', icon: FileText },
            { id: 'templates', name: 'Templates', icon: Folder },
            { id: 'changes', name: 'Change History', icon: GitCommit },
            { id: 'bulk', name: 'Bulk Operations', icon: Users },
            { id: 'compliance', name: 'Compliance', icon: Shield }
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

      {/* Configuration Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="server">Server</option>
                <option value="game">Game</option>
                <option value="plugin">Plugin</option>
                <option value="system">System</option>
                <option value="security">Security</option>
                <option value="network">Network</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showValidationErrors"
                  checked={filters.showValidationErrors}
                  onChange={(e) => setFilters(prev => ({ ...prev, showValidationErrors: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="showValidationErrors" className="text-sm text-gray-700">Show Only Errors</label>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Files List/Grid */}
          {viewMode === 'list' ? (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiles.map(file => (
                      <tr key={file.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{file.name}</div>
                              <div className="text-sm text-gray-500">{file.path}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {file.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFileSize(file.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(file.lastModified).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {file.validated ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            {file.locked && <Lock className="h-4 w-4 text-gray-500" />}
                            {file.template && <Star className="h-4 w-4 text-yellow-500" />}
                            {file.validationErrors.length > 0 && (
                              <span className="text-xs text-red-600">
                                {file.validationErrors.length} errors
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedFile(file);
                                setEditMode(false);
                                setShowFileModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleFileEdit(file)}
                              className="text-gray-600 hover:text-gray-900"
                              disabled={file.locked}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map(file => (
                <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {file.validated ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {file.locked && <Lock className="h-3 w-3 text-gray-500" />}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>Type: {file.type}</div>
                    <div>Size: {formatFileSize(file.size)}</div>
                    <div>Modified: {new Date(file.lastModified).toLocaleDateString()}</div>
                    {file.validationErrors.length > 0 && (
                      <div className="text-red-600">
                        {file.validationErrors.length} validation errors
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setEditMode(false);
                        setShowFileModal(true);
                      }}
                      className="p-1 text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleFileEdit(file)}
                      className="p-1 text-gray-600 hover:text-gray-900"
                      disabled={file.locked}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Changes History Tab */}
      {activeTab === 'changes' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search changes..."
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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="applied">Applied</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={filters.author}
              onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Authors</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Changes List */}
          <div className="space-y-4">
            {filteredChanges.map(change => (
              <div key={change.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <GitCommit className="h-5 w-5 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900">{change.message}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(change.status)}`}>
                        {change.status}
                      </span>
                      <span className={`text-sm font-medium ${getRiskColor(change.impact.risk)}`}>
                        {change.impact.risk} risk
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">File:</span> {change.fileName}
                      </div>
                      <div>
                        <span className="font-medium">Server:</span> {change.serverName}
                      </div>
                      <div>
                        <span className="font-medium">Author:</span> {change.author}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(change.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="text-green-600">+{change.diff.additions}</span>
                      <span className="text-red-600">-{change.diff.deletions}</span>
                      <span>~{change.diff.modifications}</span>
                      <span>Scope: {change.impact.scope}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {change.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveChange(change.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectChange(change.id)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedChange(change);
                        setShowChangeModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {change.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {change.tags.map(tag => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Modal */}
      {selectedFile && showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-semibold text-gray-900">{selectedFile.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedFile.type}
                  </span>
                  {selectedFile.locked && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {editMode && (
                    <>
                      <button
                        onClick={handleFileSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2 inline" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowFileModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">File Content</h4>
                    {editMode ? (
                      <textarea
                        ref={editorRef}
                        defaultValue={selectedFile.content}
                        className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        spellCheck={false}
                      />
                    ) : (
                      <pre className="w-full h-96 font-mono text-sm bg-white border border-gray-300 rounded-lg p-3 overflow-auto">
                        {selectedFile.content}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">File Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Path:</span>
                        <span className="block font-mono">{selectedFile.path}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="block">{formatFileSize(selectedFile.size)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Format:</span>
                        <span className="block">{selectedFile.format}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Modified:</span>
                        <span className="block">{new Date(selectedFile.lastModified).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Modified By:</span>
                        <span className="block">{selectedFile.modifiedBy}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Version:</span>
                        <span className="block">{selectedFile.version}</span>
                      </div>
                    </div>
                  </div>

                  {selectedFile.validationErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-3">Validation Errors</h4>
                      <div className="space-y-2">
                        {selectedFile.validationErrors.map((error, i) => (
                          <div key={i} className="text-sm">
                            <div className="font-medium text-red-800">
                              Line {error.line}, Column {error.column}
                            </div>
                            <div className="text-red-700">{error.message}</div>
                            {error.suggestion && (
                              <div className="text-red-600 italic">{error.suggestion}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedFile.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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