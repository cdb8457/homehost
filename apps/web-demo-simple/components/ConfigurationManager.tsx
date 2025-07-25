'use client';

import { useState, useEffect } from 'react';
import { 
  ServerConfiguration, 
  ConfigurationTemplate, 
  ValidationResult, 
  DeploymentInfo,
  ConfigurationData 
} from '@/types/server-monitoring';
import { 
  Settings, 
  FileText, 
  Download, 
  Upload, 
  Copy, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  RotateCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Users,
  Shield,
  Lock,
  Unlock,
  Key,
  Globe,
  Server,
  Database,
  Cloud,
  Network,
  Cpu,
  Memory,
  HardDrive,
  Gamepad2,
  Wrench,
  Tool,
  Cog,
  Gear,
  Hammer,
  Layers,
  Grid,
  List,
  LayoutDashboard,
  LayoutGrid,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Box,
  Truck,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Star,
  Crown,
  Medal,
  Trophy,
  Flag,
  Bookmark,
  BookmarkPlus,
  Heart,
  ThumbsUp,
  MessageCircle,
  Share2,
  ExternalLink,
  Link,
  Paperclip,
  Image,
  Video,
  Music,
  FileAudio,
  FileVideo,
  FileImage,
  Mic,
  Camera,
  Speaker,
  Volume2,
  Headphones,
  Radio,
  Tv,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Wifi,
  Signal,
  Battery,
  Power,
  Home,
  Building,
  MapPin,
  Navigation,
  Compass,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Phone,
  Webhook,
  Send,
  Reply,
  Forward,
  Inbox,
  Outbox,
  Archive as ArchiveIcon,
  FolderArchive,
  X,
  Check,
  Info,
  AlertCircle,
  HelpCircle,
  QuestionMark,
  Lightbulb,
  Brain,
  Robot,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerDownRight,
  CornerUpRight,
  Maximize,
  Minimize,
  RotateCcw,
  Undo,
  Redo,
  History
} from 'lucide-react';

interface ConfigurationManagerProps {
  serverId: string;
  serverName: string;
  userRole: 'owner' | 'admin' | 'moderator' | 'member';
}

interface ConfigChange {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  user: string;
}

export default function ConfigurationManager({ 
  serverId, 
  serverName, 
  userRole 
}: ConfigurationManagerProps) {
  const [configurations, setConfigurations] = useState<ServerConfiguration[]>([]);
  const [templates, setTemplates] = useState<ConfigurationTemplate[]>([]);
  const [activeConfig, setActiveConfig] = useState<ServerConfiguration | null>(null);
  const [editingConfig, setEditingConfig] = useState<ConfigurationData | null>(null);
  const [recentChanges, setRecentChanges] = useState<ConfigChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('configurations');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  // Mock data initialization
  useEffect(() => {
    const initializeData = () => {
      // Mock configurations
      const mockConfigs: ServerConfiguration[] = [
        {
          id: 'config-1',
          serverId,
          name: 'Production Configuration',
          description: 'Current live server configuration',
          version: 5,
          status: 'active',
          config: {
            server: {
              name: serverName,
              description: 'HomeHost gaming server',
              motd: 'Welcome to our awesome server!',
              maxPlayers: 100,
              viewDistance: 10,
              simulationDistance: 8,
              difficulty: 'normal',
              gameMode: 'survival',
              pvp: true,
              allowFlight: false,
              enableCommandBlocks: true,
              spawnProtection: 16,
              resourcePack: {
                url: 'https://cdn.homehost.com/resourcepack.zip',
                sha1: 'abc123def456',
                required: false
              }
            },
            game: {
              version: '1.20.1',
              type: 'paper',
              javaArgs: ['-Xmx8G', '-Xms4G', '-XX:+UseG1GC'],
              minMemory: '4G',
              maxMemory: '8G',
              autoRestart: true,
              restartSchedule: '0 4 * * *',
              crashRestart: true,
              updatePolicy: 'stable'
            },
            plugins: [
              {
                name: 'EssentialsX',
                version: '2.20.1',
                enabled: true,
                autoUpdate: false,
                config: {},
                dependencies: [],
                loadOrder: 1
              },
              {
                name: 'WorldEdit',
                version: '7.2.15',
                enabled: true,
                autoUpdate: true,
                config: {},
                dependencies: [],
                loadOrder: 2
              }
            ],
            mods: [],
            networking: {
              port: 25565,
              bindAddress: '0.0.0.0',
              rcon: {
                enabled: true,
                port: 25575,
                password: 'secure-password-123',
                bindAddress: '127.0.0.1'
              },
              query: {
                enabled: true,
                port: 25565
              },
              rateLimiting: {
                enabled: true,
                connectionsPerSecond: 10,
                packetsPerSecond: 100
              },
              compression: {
                enabled: true,
                threshold: 256
              }
            },
            security: {
              whitelist: {
                enabled: false,
                users: []
              },
              ops: ['admin', 'owner'],
              bannedUsers: [],
              bannedIps: [],
              antiCheat: {
                enabled: true,
                provider: 'NoCheatPlus',
                config: {}
              },
              firewall: {
                enabled: true,
                rules: []
              }
            },
            performance: {
              tickRate: 20,
              maxEntityCramming: 24,
              mobSpawning: {
                enabled: true,
                spawnRadius: 128,
                mobCap: 70
              },
              redstone: {
                maxDelay: 4,
                maxIterations: 1000
              },
              chunks: {
                loadingThreads: 4,
                generationThreads: 4,
                maxConcurrentLoads: 8
              },
              gc: {
                type: 'G1',
                heapDumpOnOOM: true,
                customArgs: []
              }
            },
            backup: {
              enabled: true,
              schedule: '0 */6 * * *',
              retention: {
                daily: 7,
                weekly: 4,
                monthly: 12
              },
              compression: true,
              incremental: false,
              location: 's3',
              credentials: {},
              exclusions: ['*.log', 'cache/*']
            },
            custom: {}
          },
          validation: {
            valid: true,
            errors: [],
            warnings: [
              {
                field: 'networking.rcon.password',
                message: 'Consider using a stronger password',
                recommendation: 'Use at least 16 characters with mixed case, numbers, and symbols',
                code: 'WEAK_PASSWORD'
              }
            ],
            validatedAt: new Date(),
            validatedBy: 'system'
          },
          deployment: {
            status: 'deployed',
            deployedAt: new Date(Date.now() - 86400000),
            deployedBy: 'admin',
            changes: [],
            deploymentLog: []
          },
          createdBy: 'admin',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          tags: ['production', 'stable']
        },
        {
          id: 'config-2',
          serverId,
          name: 'Development Configuration',
          description: 'Configuration for testing new features',
          version: 1,
          status: 'draft',
          config: {
            server: {
              name: `${serverName} - Dev`,
              description: 'Development server for testing',
              motd: 'Development Server - Testing New Features',
              maxPlayers: 20,
              viewDistance: 8,
              simulationDistance: 6,
              difficulty: 'easy',
              gameMode: 'creative',
              pvp: false,
              allowFlight: true,
              enableCommandBlocks: true,
              spawnProtection: 0
            },
            game: {
              version: '1.20.2',
              type: 'paper',
              javaArgs: ['-Xmx4G', '-Xms2G', '-XX:+UseG1GC'],
              minMemory: '2G',
              maxMemory: '4G',
              autoRestart: false,
              crashRestart: true,
              updatePolicy: 'latest'
            },
            plugins: [],
            mods: [],
            networking: {
              port: 25566,
              bindAddress: '0.0.0.0',
              rcon: {
                enabled: true,
                port: 25576,
                password: 'dev-password',
                bindAddress: '127.0.0.1'
              },
              query: {
                enabled: true,
                port: 25566
              },
              rateLimiting: {
                enabled: false,
                connectionsPerSecond: 50,
                packetsPerSecond: 500
              },
              compression: {
                enabled: false,
                threshold: 512
              }
            },
            security: {
              whitelist: {
                enabled: true,
                users: ['developer', 'tester']
              },
              ops: ['developer'],
              bannedUsers: [],
              bannedIps: [],
              antiCheat: {
                enabled: false,
                provider: '',
                config: {}
              },
              firewall: {
                enabled: false,
                rules: []
              }
            },
            performance: {
              tickRate: 20,
              maxEntityCramming: 50,
              mobSpawning: {
                enabled: false,
                spawnRadius: 64,
                mobCap: 20
              },
              redstone: {
                maxDelay: 8,
                maxIterations: 2000
              },
              chunks: {
                loadingThreads: 2,
                generationThreads: 2,
                maxConcurrentLoads: 4
              },
              gc: {
                type: 'G1',
                heapDumpOnOOM: false,
                customArgs: []
              }
            },
            backup: {
              enabled: false,
              schedule: '',
              retention: {
                daily: 3,
                weekly: 0,
                monthly: 0
              },
              compression: false,
              incremental: false,
              location: 'local',
              credentials: {},
              exclusions: []
            },
            custom: {}
          },
          validation: {
            valid: false,
            errors: [
              {
                field: 'networking.port',
                message: 'Port 25566 is already in use',
                severity: 'error',
                code: 'PORT_CONFLICT'
              }
            ],
            warnings: [],
            validatedAt: new Date(),
            validatedBy: 'system'
          },
          deployment: {
            status: 'pending',
            changes: [],
            deploymentLog: []
          },
          createdBy: 'developer',
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date('2024-01-22'),
          tags: ['development', 'testing']
        }
      ];

      // Mock templates
      const mockTemplates: ConfigurationTemplate[] = [
        {
          id: 'template-1',
          name: 'Vanilla Survival Server',
          description: 'Standard vanilla Minecraft survival configuration',
          category: 'vanilla',
          version: '1.0.0',
          config: {
            server: {
              difficulty: 'normal',
              gameMode: 'survival',
              pvp: true,
              allowFlight: false,
              enableCommandBlocks: false,
              spawnProtection: 16
            },
            game: {
              type: 'vanilla',
              autoRestart: true,
              crashRestart: true,
              updatePolicy: 'stable'
            },
            performance: {
              tickRate: 20,
              mobSpawning: {
                enabled: true,
                spawnRadius: 128,
                mobCap: 70
              }
            }
          },
          variables: [
            {
              name: 'maxPlayers',
              type: 'number',
              description: 'Maximum number of players',
              defaultValue: 20,
              required: true,
              validation: {
                min: 1,
                max: 100
              }
            },
            {
              name: 'difficulty',
              type: 'select',
              description: 'Game difficulty',
              defaultValue: 'normal',
              required: true,
              validation: {
                options: ['peaceful', 'easy', 'normal', 'hard']
              }
            }
          ],
          createdBy: 'homehost',
          createdAt: new Date('2024-01-01'),
          isPublic: true,
          downloads: 1247,
          rating: 4.7,
          tags: ['vanilla', 'survival', 'recommended']
        },
        {
          id: 'template-2',
          name: 'Modded Adventure Server',
          description: 'Pre-configured modded server for adventure gameplay',
          category: 'modded',
          version: '2.1.0',
          config: {
            server: {
              difficulty: 'hard',
              gameMode: 'adventure',
              pvp: false,
              allowFlight: true,
              enableCommandBlocks: true,
              spawnProtection: 0
            },
            game: {
              type: 'forge',
              autoRestart: true,
              crashRestart: true,
              updatePolicy: 'manual'
            }
          },
          variables: [
            {
              name: 'modpackUrl',
              type: 'string',
              description: 'URL to the modpack download',
              defaultValue: '',
              required: true
            }
          ],
          createdBy: 'community',
          createdAt: new Date('2024-01-10'),
          isPublic: true,
          downloads: 856,
          rating: 4.4,
          tags: ['modded', 'adventure', 'forge']
        }
      ];

      // Mock recent changes
      const mockChanges: ConfigChange[] = [
        {
          field: 'server.maxPlayers',
          oldValue: 80,
          newValue: 100,
          timestamp: new Date(Date.now() - 3600000),
          user: 'admin'
        },
        {
          field: 'networking.rcon.password',
          oldValue: 'old-password',
          newValue: 'secure-password-123',
          timestamp: new Date(Date.now() - 7200000),
          user: 'admin'
        },
        {
          field: 'backup.schedule',
          oldValue: '0 2 * * *',
          newValue: '0 */6 * * *',
          timestamp: new Date(Date.now() - 86400000),
          user: 'owner'
        }
      ];

      setConfigurations(mockConfigs);
      setTemplates(mockTemplates);
      setActiveConfig(mockConfigs[0]);
      setRecentChanges(mockChanges);
      setLoading(false);
    };

    const timer = setTimeout(initializeData, 1000);
    return () => clearTimeout(timer);
  }, [serverId, serverName]);

  const validateConfiguration = (config: ConfigurationData): ValidationResult => {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Mock validation logic
    if (config.networking.port < 1024 || config.networking.port > 65535) {
      errors.push({
        field: 'networking.port',
        message: 'Port must be between 1024 and 65535',
        severity: 'error',
        code: 'INVALID_PORT'
      });
    }

    if (config.networking.rcon.password.length < 8) {
      warnings.push({
        field: 'networking.rcon.password',
        message: 'RCON password should be at least 8 characters',
        recommendation: 'Use a stronger password for better security',
        code: 'WEAK_PASSWORD'
      });
    }

    if (config.server.maxPlayers > 100) {
      warnings.push({
        field: 'server.maxPlayers',
        message: 'High player count may impact performance',
        recommendation: 'Consider performance optimization settings',
        code: 'HIGH_PLAYER_COUNT'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      validatedAt: new Date(),
      validatedBy: 'system'
    };
  };

  const deployConfiguration = (configId: string) => {
    setConfigurations(prev => prev.map(config => 
      config.id === configId 
        ? {
            ...config,
            status: 'active' as const,
            deployment: {
              ...config.deployment,
              status: 'deployed',
              deployedAt: new Date(),
              deployedBy: 'current-user'
            }
          }
        : { ...config, status: config.status === 'active' ? 'archived' as const : config.status }
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'archived': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getValidationIcon = (validation: ValidationResult) => {
    if (!validation.valid) return <XCircle className="w-4 h-4 text-red-500" />;
    if (validation.warnings.length > 0) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading configuration manager...</span>
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
            <h2 className="text-xl font-semibold text-gray-900">Configuration Manager</h2>
            <p className="text-gray-600">{serverName} - Server Configuration & Deployment</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Config</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'configurations', label: 'Configurations', icon: <Settings className="w-4 h-4" />, count: configurations.length },
              { id: 'templates', label: 'Templates', icon: <FileText className="w-4 h-4" />, count: templates.length },
              { id: 'validation', label: 'Validation', icon: <CheckCircle className="w-4 h-4" /> },
              { id: 'history', label: 'Change History', icon: <Clock className="w-4 h-4" />, count: recentChanges.length }
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
                {tab.count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
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
          {activeTab === 'configurations' && (
            <ConfigurationsTab 
              configurations={configurations}
              activeConfig={activeConfig}
              setActiveConfig={setActiveConfig}
              onDeploy={deployConfiguration}
              getStatusColor={getStatusColor}
              getValidationIcon={getValidationIcon}
              userRole={userRole}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesTab 
              templates={templates}
            />
          )}
          {activeTab === 'validation' && (
            <ValidationTab 
              activeConfig={activeConfig}
              validationResult={validationResult}
              setValidationResult={setValidationResult}
              validateConfiguration={validateConfiguration}
            />
          )}
          {activeTab === 'history' && (
            <HistoryTab 
              changes={recentChanges}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Tab Components
function ConfigurationsTab({ 
  configurations, 
  activeConfig, 
  setActiveConfig, 
  onDeploy, 
  getStatusColor, 
  getValidationIcon, 
  userRole 
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Server Configurations</h3>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {configurations.map((config: ServerConfiguration) => (
          <div key={config.id} className={`border rounded-lg p-4 cursor-pointer transition-all ${
            activeConfig?.id === config.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setActiveConfig(config)}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{config.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{config.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getValidationIcon(config.validation)}
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(config.status)}`}>
                  {config.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-medium">v{config.version}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{config.createdAt.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated:</span>
                <span>{config.updatedAt.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-1">
                {config.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-1">
                {['owner', 'admin'].includes(userRole) && config.status !== 'active' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeploy(config.id);
                    }}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                    title="Deploy configuration"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                <button className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Details */}
      {activeConfig && (
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Configuration Details</h4>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Server Settings</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Players:</span>
                  <span className="font-medium">{activeConfig.config.server.maxPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium capitalize">{activeConfig.config.server.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Game Mode:</span>
                  <span className="font-medium capitalize">{activeConfig.config.server.gameMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PvP:</span>
                  <span className="font-medium">{activeConfig.config.server.pvp ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Performance</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">View Distance:</span>
                  <span className="font-medium">{activeConfig.config.server.viewDistance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory:</span>
                  <span className="font-medium">{activeConfig.config.game.maxMemory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GC Type:</span>
                  <span className="font-medium">{activeConfig.config.performance.gc.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auto Restart:</span>
                  <span className="font-medium">{activeConfig.config.game.autoRestart ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2">Security & Backup</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Whitelist:</span>
                  <span className="font-medium">{activeConfig.config.security.whitelist.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Backup:</span>
                  <span className="font-medium">{activeConfig.config.backup.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Anti-Cheat:</span>
                  <span className="font-medium">{activeConfig.config.security.antiCheat.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Firewall:</span>
                  <span className="font-medium">{activeConfig.config.security.firewall.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatesTab({ templates }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Configuration Templates</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-2">
            <option value="all">All Categories</option>
            <option value="vanilla">Vanilla</option>
            <option value="modded">Modded</option>
            <option value="minigames">Mini-games</option>
            <option value="creative">Creative</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template: ConfigurationTemplate) => (
          <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {template.category}
              </span>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-medium">{template.version}</span>
              </div>
              <div className="flex justify-between">
                <span>Downloads:</span>
                <span className="font-medium">{template.downloads.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Rating:</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{template.rating}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {template.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                by {template.createdBy}
              </span>
              <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                <Download className="w-3 h-3" />
                <span>Use Template</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidationTab({ activeConfig, validationResult, setValidationResult, validateConfiguration }: any) {
  const runValidation = () => {
    if (activeConfig) {
      const result = validateConfiguration(activeConfig.config);
      setValidationResult(result);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Configuration Validation</h3>
        <button
          onClick={runValidation}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Run Validation</span>
        </button>
      </div>

      {!activeConfig ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Configuration Selected</h4>
          <p className="text-gray-500">Select a configuration to validate its settings.</p>
        </div>
      ) : validationResult ? (
        <div className="space-y-4">
          {/* Validation Summary */}
          <div className={`p-4 rounded-lg border ${
            validationResult.valid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {validationResult.valid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <h4 className={`font-medium ${
                validationResult.valid ? 'text-green-900' : 'text-red-900'
              }`}>
                {validationResult.valid ? 'Configuration Valid' : 'Configuration Has Issues'}
              </h4>
            </div>
            <p className={`mt-1 text-sm ${
              validationResult.valid ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationResult.valid 
                ? 'All configuration settings are valid and ready for deployment.'
                : `Found ${validationResult.errors.length} error(s) and ${validationResult.warnings.length} warning(s).`
              }
            </p>
          </div>

          {/* Errors */}
          {validationResult.errors.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-red-900">Errors</h5>
              {validationResult.errors.map((error: any, index: number) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">{error.field}</p>
                      <p className="text-sm text-red-700">{error.message}</p>
                      <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded mt-1 inline-block">
                        {error.code}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {validationResult.warnings.length > 0 && (
            <div className="space-y-3">
              <h5 className="font-medium text-yellow-900">Warnings</h5>
              {validationResult.warnings.map((warning: any, index: number) => (
                <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">{warning.field}</p>
                      <p className="text-sm text-yellow-700">{warning.message}</p>
                      {warning.recommendation && (
                        <p className="text-sm text-yellow-600 mt-1">
                          <strong>Recommendation:</strong> {warning.recommendation}
                        </p>
                      )}
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded mt-1 inline-block">
                        {warning.code}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to Validate</h4>
          <p className="text-gray-500">Click "Run Validation" to check the selected configuration for issues.</p>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ changes }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Recent Configuration Changes</h3>
      
      <div className="space-y-3">
        {changes.map((change: ConfigChange, index: number) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{change.field}</h4>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  Changed by {change.user}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <span className="line-through text-red-600">{JSON.stringify(change.oldValue)}</span>
                {' → '}
                <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {change.timestamp.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {changes.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Recent Changes</h4>
          <p className="text-gray-500">Configuration changes will appear here when they occur.</p>
        </div>
      )}
    </div>
  );
}