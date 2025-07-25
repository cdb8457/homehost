// Epic 6: Advanced Server Management & Monitoring System Types

export interface ServerMetrics {
  serverId: string;
  timestamp: Date;
  system: SystemMetrics;
  game: GameMetrics;
  network: NetworkMetrics;
  storage: StorageMetrics;
  custom: CustomMetrics;
}

export interface SystemMetrics {
  cpu: {
    usage: number; // percentage 0-100
    cores: number;
    load: {
      oneMinute: number;
      fiveMinutes: number;
      fifteenMinutes: number;
    };
    temperature?: number; // Celsius
    processes: ProcessInfo[];
  };
  memory: {
    total: number; // bytes
    used: number; // bytes
    available: number; // bytes
    cached: number; // bytes
    buffers: number; // bytes
    percentage: number; // 0-100
    swap: {
      total: number;
      used: number;
      percentage: number;
    };
  };
  uptime: number; // seconds
  bootTime: Date;
  os: {
    name: string;
    version: string;
    architecture: string;
    kernel: string;
  };
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  status: 'running' | 'sleeping' | 'waiting' | 'zombie' | 'stopped';
  startTime: Date;
  commandLine: string;
}

export interface GameMetrics {
  playerCount: {
    current: number;
    maximum: number;
    peak24h: number;
    averageHourly: number;
  };
  performance: {
    tps: number; // ticks per second
    mspt: number; // milliseconds per tick
    viewDistance: number;
    simulationDistance: number;
  };
  world: {
    size: number; // bytes
    chunks: {
      loaded: number;
      generated: number;
      total: number;
    };
    entities: {
      total: number;
      mobs: number;
      players: number;
      items: number;
    };
  };
  plugins: PluginMetrics[];
  mods: ModMetrics[];
  gameMode: string;
  difficulty: string;
  version: string;
}

export interface PluginMetrics {
  name: string;
  version: string;
  enabled: boolean;
  cpuUsage: number;
  memoryUsage: number;
  eventProcessingTime: number;
  errorCount: number;
  lastError?: {
    message: string;
    timestamp: Date;
    stackTrace: string;
  };
}

export interface ModMetrics {
  name: string;
  version: string;
  loaded: boolean;
  fileSize: number;
  dependencies: string[];
  conflicts: string[];
  performanceImpact: 'low' | 'medium' | 'high';
}

export interface NetworkMetrics {
  connections: {
    active: number;
    total: number;
    refused: number;
    timeouts: number;
  };
  bandwidth: {
    inbound: {
      current: number; // bytes per second
      peak: number;
      total: number; // total bytes
    };
    outbound: {
      current: number;
      peak: number;
      total: number;
    };
  };
  latency: {
    average: number; // milliseconds
    minimum: number;
    maximum: number;
    jitter: number;
  };
  packets: {
    sent: number;
    received: number;
    dropped: number;
    errors: number;
  };
}

export interface StorageMetrics {
  disks: DiskInfo[];
  io: {
    reads: {
      count: number;
      bytes: number;
      time: number; // milliseconds
    };
    writes: {
      count: number;
      bytes: number;
      time: number;
    };
  };
  backups: BackupInfo[];
}

export interface DiskInfo {
  device: string;
  mountpoint: string;
  filesystem: string;
  total: number; // bytes
  used: number; // bytes
  available: number; // bytes
  percentage: number; // 0-100
  inodesTotal: number;
  inodesUsed: number;
  inodesPercentage: number;
}

export interface BackupInfo {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  size: number; // bytes
  duration: number; // seconds
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  timestamp: Date;
  location: string;
  compression: number; // ratio 0-1
}

export interface CustomMetrics {
  [key: string]: number | string | boolean;
}

// Alert System Types
export interface Alert {
  id: string;
  serverId: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'suppressed';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  escalationLevel: number;
  notifications: AlertNotification[];
  tags: string[];
  metadata: {
    [key: string]: any;
  };
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  serverId?: string; // null for global rules
  metric: string;
  condition: AlertCondition;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  duration: number; // seconds - how long condition must persist
  cooldown: number; // seconds - minimum time between alerts
  tags: string[];
  notifications: NotificationChannel[];
  escalation: EscalationPolicy;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  aggregation: 'avg' | 'min' | 'max' | 'sum' | 'count';
  timeWindow: number; // seconds
  groupBy?: string[];
}

export interface AlertNotification {
  id: string;
  alertId: string;
  channel: NotificationChannel;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  escalationLevel: number;
}

export interface NotificationChannel {
  type: 'email' | 'discord' | 'slack' | 'webhook' | 'sms' | 'push';
  enabled: boolean;
  config: {
    [key: string]: any;
  };
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // seconds
    backoffMultiplier: number;
  };
}

export interface EscalationPolicy {
  enabled: boolean;
  levels: EscalationLevel[];
  maxEscalations: number;
  escalationInterval: number; // seconds
}

export interface EscalationLevel {
  level: number;
  channels: NotificationChannel[];
  users: string[];
  requiredAcknowledgments: number;
  timeout: number; // seconds before next escalation
}

// Configuration Management Types
export interface ServerConfiguration {
  id: string;
  serverId: string;
  name: string;
  description: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  config: ConfigurationData;
  template?: ConfigurationTemplate;
  validation: ValidationResult;
  deployment: DeploymentInfo;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface ConfigurationData {
  server: ServerConfig;
  game: GameConfig;
  plugins: PluginConfig[];
  mods: ModConfig[];
  networking: NetworkConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
  backup: BackupConfig;
  custom: {
    [key: string]: any;
  };
}

export interface ServerConfig {
  name: string;
  description: string;
  motd: string;
  maxPlayers: number;
  viewDistance: number;
  simulationDistance: number;
  difficulty: 'peaceful' | 'easy' | 'normal' | 'hard';
  gameMode: 'survival' | 'creative' | 'adventure' | 'spectator';
  pvp: boolean;
  allowFlight: boolean;
  enableCommandBlocks: boolean;
  spawnProtection: number;
  resourcePack?: {
    url: string;
    sha1: string;
    required: boolean;
  };
}

export interface GameConfig {
  version: string;
  type: 'vanilla' | 'bukkit' | 'spigot' | 'paper' | 'forge' | 'fabric';
  javaArgs: string[];
  minMemory: string;
  maxMemory: string;
  autoRestart: boolean;
  restartSchedule?: string; // cron expression
  crashRestart: boolean;
  updatePolicy: 'manual' | 'stable' | 'latest';
}

export interface PluginConfig {
  name: string;
  version: string;
  enabled: boolean;
  autoUpdate: boolean;
  config: {
    [key: string]: any;
  };
  dependencies: string[];
  loadOrder: number;
}

export interface ModConfig {
  name: string;
  version: string;
  enabled: boolean;
  side: 'client' | 'server' | 'both';
  required: boolean;
  config: {
    [key: string]: any;
  };
  dependencies: ModDependency[];
}

export interface ModDependency {
  modId: string;
  versionRange: string;
  ordering: 'before' | 'after' | 'none';
  required: boolean;
}

export interface NetworkConfig {
  port: number;
  bindAddress: string;
  rcon: {
    enabled: boolean;
    port: number;
    password: string;
    bindAddress: string;
  };
  query: {
    enabled: boolean;
    port: number;
  };
  rateLimiting: {
    enabled: boolean;
    connectionsPerSecond: number;
    packetsPerSecond: number;
  };
  compression: {
    enabled: boolean;
    threshold: number;
  };
}

export interface SecurityConfig {
  whitelist: {
    enabled: boolean;
    users: string[];
  };
  ops: string[];
  bannedUsers: BannedUser[];
  bannedIps: BannedIp[];
  antiCheat: {
    enabled: boolean;
    provider: string;
    config: {
      [key: string]: any;
    };
  };
  firewall: {
    enabled: boolean;
    rules: FirewallRule[];
  };
}

export interface BannedUser {
  uuid: string;
  name: string;
  reason: string;
  bannedBy: string;
  bannedAt: Date;
  expiresAt?: Date;
}

export interface BannedIp {
  ip: string;
  reason: string;
  bannedBy: string;
  bannedAt: Date;
  expiresAt?: Date;
}

export interface FirewallRule {
  id: string;
  action: 'allow' | 'deny';
  protocol: 'tcp' | 'udp' | 'any';
  sourceIp?: string;
  sourcePort?: number;
  destinationPort?: number;
  enabled: boolean;
  priority: number;
}

export interface PerformanceConfig {
  tickRate: number;
  maxEntityCramming: number;
  mobSpawning: {
    enabled: boolean;
    spawnRadius: number;
    mobCap: number;
  };
  redstone: {
    maxDelay: number;
    maxIterations: number;
  };
  chunks: {
    loadingThreads: number;
    generationThreads: number;
    maxConcurrentLoads: number;
  };
  gc: {
    type: 'G1' | 'ZGC' | 'Parallel' | 'ConcurrentMarkSweep';
    heapDumpOnOOM: boolean;
    customArgs: string[];
  };
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  retention: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  compression: boolean;
  incremental: boolean;
  location: 'local' | 's3' | 'gcs' | 'azure';
  credentials?: {
    [key: string]: string;
  };
  exclusions: string[];
}

export interface ConfigurationTemplate {
  id: string;
  name: string;
  description: string;
  category: 'vanilla' | 'modded' | 'minigames' | 'creative' | 'survival' | 'custom';
  version: string;
  config: Partial<ConfigurationData>;
  variables: TemplateVariable[];
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
  downloads: number;
  rating: number;
  tags: string[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  defaultValue: any;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  validatedAt: Date;
  validatedBy: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  recommendation: string;
  code: string;
}

export interface DeploymentInfo {
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'rollback';
  deployedAt?: Date;
  deployedBy?: string;
  rollbackVersion?: number;
  changes: ConfigurationChange[];
  deploymentLog: DeploymentLogEntry[];
}

export interface ConfigurationChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'modified' | 'removed';
}

export interface DeploymentLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: {
    [key: string]: any;
  };
}

// Analytics and Reporting Types
export interface PerformanceReport {
  id: string;
  serverId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  metrics: ReportMetrics;
  insights: PerformanceInsight[];
  recommendations: Recommendation[];
  generatedAt: Date;
  generatedBy: string;
}

export interface ReportMetrics {
  availability: {
    uptime: number; // percentage
    downtimeMinutes: number;
    incidents: number;
  };
  performance: {
    averageTps: number;
    averagePlayerCount: number;
    peakPlayerCount: number;
    averageLatency: number;
  };
  resources: {
    averageCpuUsage: number;
    peakCpuUsage: number;
    averageMemoryUsage: number;
    peakMemoryUsage: number;
    diskGrowth: number; // bytes
  };
  errors: {
    totalErrors: number;
    criticalErrors: number;
    pluginErrors: number;
    networkErrors: number;
  };
}

export interface PerformanceInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'prediction';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number; // 0-100
  data: {
    [key: string]: any;
  };
  actionable: boolean;
}

export interface Recommendation {
  id: string;
  type: 'performance' | 'capacity' | 'security' | 'cost';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  estimatedBenefit: string;
  implementation: {
    steps: string[];
    automatable: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
  links: {
    documentation?: string;
    tutorial?: string;
    support?: string;
  };
}

// Automation Types
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  serverId?: string; // null for global rules
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  schedule?: string; // cron expression for scheduled rules
  lastExecuted?: Date;
  executionCount: number;
  successRate: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationTrigger {
  type: 'metric' | 'alert' | 'event' | 'schedule' | 'manual';
  config: {
    [key: string]: any;
  };
}

export interface AutomationCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface AutomationAction {
  type: 'restart' | 'scale' | 'backup' | 'notify' | 'script' | 'config';
  config: {
    [key: string]: any;
  };
  timeout: number; // seconds
  retryPolicy: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
}

export interface AutomationExecution {
  id: string;
  ruleId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // seconds
  triggeredBy: string;
  actions: ActionExecution[];
  logs: ExecutionLogEntry[];
  error?: string;
}

export interface ActionExecution {
  actionType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  result?: any;
  error?: string;
}

export interface ExecutionLogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: {
    [key: string]: any;
  };
}

// Dashboard and UI Types
export interface MonitoringDashboard {
  id: string;
  name: string;
  description: string;
  layout: DashboardLayout;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number; // seconds
  isPublic: boolean;
  permissions: DashboardPermission[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardLayout {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  breakpoints: {
    lg: number;
    md: number;
    sm: number;
    xs: number;
    xxs: number;
  };
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'status' | 'custom';
  title: string;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  config: WidgetConfig;
  dataSource: DataSource;
  refreshInterval?: number;
}

export interface WidgetConfig {
  [key: string]: any;
}

export interface DataSource {
  type: 'metric' | 'alert' | 'log' | 'custom';
  query: string;
  aggregation?: string;
  timeRange: TimeRange;
  filters: {
    [key: string]: any;
  };
}

export interface TimeRange {
  type: 'relative' | 'absolute';
  start: Date | string; // ISO string for relative (e.g., '-1h')
  end: Date | string;
}

export interface DashboardFilter {
  field: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'date' | 'range';
  options?: string[];
  defaultValue?: any;
}

export interface DashboardPermission {
  userId: string;
  role: 'viewer' | 'editor' | 'owner';
  grantedBy: string;
  grantedAt: Date;
}

// Real-time Data Types
export interface MetricStream {
  serverId: string;
  metric: string;
  timestamp: Date;
  value: number;
  tags: {
    [key: string]: string;
  };
}

export interface LogEntry {
  id: string;
  serverId: string;
  timestamp: Date;
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  source: string;
  category: string;
  metadata: {
    [key: string]: any;
  };
}

export interface EventStream {
  id: string;
  serverId: string;
  eventType: string;
  timestamp: Date;
  data: {
    [key: string]: any;
  };
  correlationId?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    timestamp: Date;
    requestId: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  metadata: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
    timestamp: Date;
    requestId: string;
  };
}