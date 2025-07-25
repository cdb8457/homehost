export interface ServerInstance {
  id: string;
  name: string;
  game: string;
  communityId: string;
  communityName: string;
  status: 'online' | 'offline' | 'starting' | 'stopping' | 'error' | 'maintenance';
  playerCount: number;
  maxPlayers: number;
  uptime: string;
  version: string;
  lastRestart: Date;
  lastBackup: Date;
  
  // Performance Metrics
  performance: {
    cpu: number; // percentage
    memory: number; // percentage
    networkLatency: number; // ms
    tickRate: number; // server FPS
    diskUsage: number; // percentage
  };
  
  // Configuration
  config: {
    map: string;
    gameMode: string;
    difficulty?: string;
    pvpEnabled: boolean;
    modsEnabled: boolean;
    backupEnabled: boolean;
    autoRestart: boolean;
  };
  
  // Location and Network
  region: string;
  ipAddress: string;
  port: number;
  
  // Plugins
  plugins: ServerPlugin[];
  
  // Recent Activity
  recentEvents: ServerEvent[];
  alerts: ServerAlert[];
}

export interface ServerPlugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  autoUpdate: boolean;
  configurable: boolean;
  category: 'admin' | 'gameplay' | 'quality-of-life' | 'security';
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'error' | 'needs-update';
}

export interface ServerEvent {
  id: string;
  timestamp: Date;
  type: 'player_join' | 'player_leave' | 'chat_message' | 'admin_action' | 'error' | 'warning' | 'info';
  message: string;
  playerName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ServerAlert {
  id: string;
  serverId: string;
  type: 'performance' | 'error' | 'security' | 'maintenance' | 'player_issue';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  autoResolvable: boolean;
  suggestedAction?: string;
}

export interface PlayerSession {
  id: string;
  playerName: string;
  steamId?: string;
  serverId: string;
  serverName: string;
  joinTime: Date;
  sessionDuration: string;
  isOnline: boolean;
  role: 'player' | 'vip' | 'moderator' | 'admin';
  reputation: number;
  violations: number;
  lastSeen: Date;
  
  // Cross-server data
  totalPlaytime: string;
  serversPlayed: string[];
  communityJoinDate: Date;
  
  // Actions
  canKick: boolean;
  canBan: boolean;
  canPromote: boolean;
}

export interface CommunityAnalytics {
  communityId: string;
  timeframe: '24h' | '7d' | '30d' | '90d';
  
  // Player Metrics
  totalPlayers: number;
  activePlayersDaily: number;
  newPlayersThisWeek: number;
  playerRetentionRate: number;
  averageSessionTime: string;
  peakConcurrentPlayers: number;
  
  // Server Metrics
  totalServers: number;
  averageUptime: number;
  totalPlaytimeHours: number;
  
  // Engagement
  messagesSent: number;
  eventsHosted: number;
  averageRating: number;
  
  // Revenue (if applicable)
  revenue?: {
    donations: number;
    vipMemberships: number;
    merchandiseSales: number;
    total: number;
    growth: number;
  };
  
  // Trends
  growth: {
    playerGrowth: number;
    engagementTrend: 'up' | 'stable' | 'down';
    popularTimes: string[];
    topPerformingServer: string;
  };
}

export interface ServerCommand {
  serverId: string;
  action: 'start' | 'stop' | 'restart' | 'backup' | 'update' | 'kick_player' | 'ban_player' | 'broadcast';
  parameters?: Record<string, any>;
  timestamp: Date;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
}

export interface ServerManagementView {
  selectedServers: string[];
  activeTab: 'overview' | 'players' | 'performance' | 'analytics' | 'plugins' | 'logs';
  filterOptions: {
    status?: string;
    game?: string;
    community?: string;
    alertsOnly?: boolean;
  };
  refreshInterval: number;
}