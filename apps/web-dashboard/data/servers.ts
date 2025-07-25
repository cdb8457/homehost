import { ServerInstance, PlayerSession, CommunityAnalytics, ServerAlert } from '@/types/server';

export const MOCK_SERVERS: ServerInstance[] = [
  {
    id: 'valheim-main-001',
    name: 'Main World - Midgard',
    game: 'Valheim',
    communityId: 'casual-gamers',
    communityName: 'The Casual Collective',
    status: 'online',
    playerCount: 8,
    maxPlayers: 10,
    uptime: '23d 14h 32m',
    version: '0.217.46',
    lastRestart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 2),
    
    performance: {
      cpu: 34,
      memory: 68,
      networkLatency: 45,
      tickRate: 60,
      diskUsage: 42
    },
    
    config: {
      map: 'Procedural Seed #4423',
      gameMode: 'PvE Co-op',
      difficulty: 'Normal',
      pvpEnabled: false,
      modsEnabled: true,
      backupEnabled: true,
      autoRestart: true
    },
    
    region: 'US East',
    ipAddress: '192.168.1.100',
    port: 2456,
    
    plugins: [
      {
        id: 'backup-guardian',
        name: 'Auto-Backup Guardian',
        version: '2.1.4',
        enabled: true,
        autoUpdate: true,
        configurable: true,
        category: 'admin',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 48),
        status: 'active'
      },
      {
        id: 'player-stats',
        name: 'Enhanced Player Stats',
        version: '1.3.2',
        enabled: true,
        autoUpdate: true,
        configurable: false,
        category: 'gameplay',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: 'active'
      }
    ],
    
    recentEvents: [
      {
        id: 'evt-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        type: 'player_join',
        message: 'Alex_Johnson joined the server',
        playerName: 'Alex_Johnson',
        severity: 'low'
      },
      {
        id: 'evt-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        type: 'info',
        message: 'Automatic backup completed successfully',
        severity: 'low'
      }
    ],
    
    alerts: []
  },
  
  {
    id: 'rust-main-001',
    name: 'Main PvP Server',
    game: 'Rust',
    communityId: 'rust-survivors',
    communityName: 'Rust Survivors Coalition',
    status: 'online',
    playerCount: 187,
    maxPlayers: 200,
    uptime: '6d 8h 15m',
    version: '2023.11.3',
    lastRestart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    lastBackup: new Date(Date.now() - 1000 * 60 * 30),
    
    performance: {
      cpu: 78,
      memory: 85,
      networkLatency: 32,
      tickRate: 60,
      diskUsage: 67
    },
    
    config: {
      map: 'Procedural Map 4000x4000',
      gameMode: 'Vanilla PvP',
      pvpEnabled: true,
      modsEnabled: false,
      backupEnabled: true,
      autoRestart: true
    },
    
    region: 'US West',
    ipAddress: '192.168.1.101',
    port: 28015,
    
    plugins: [
      {
        id: 'anti-cheat-pro',
        name: 'Anti-Cheat Pro',
        version: '3.2.1',
        enabled: true,
        autoUpdate: true,
        configurable: true,
        category: 'security',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        status: 'active'
      },
      {
        id: 'clan-manager',
        name: 'Advanced Clan Manager',
        version: '2.0.8',
        enabled: true,
        autoUpdate: false,
        configurable: true,
        category: 'gameplay',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        status: 'needs-update'
      }
    ],
    
    recentEvents: [
      {
        id: 'evt-rust-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        type: 'admin_action',
        message: 'Player ToxicGamer123 banned for cheating',
        playerName: 'ToxicGamer123',
        severity: 'medium'
      },
      {
        id: 'evt-rust-002',
        timestamp: new Date(Date.now() - 1000 * 60 * 12),
        type: 'warning',
        message: 'High CPU usage detected (78%)',
        severity: 'medium'
      }
    ],
    
    alerts: [
      {
        id: 'alert-rust-001',
        serverId: 'rust-main-001',
        type: 'performance',
        severity: 'warning',
        title: 'High Resource Usage',
        message: 'Server is running at 85% memory usage. Consider optimizing or upgrading.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        resolved: false,
        autoResolvable: false,
        suggestedAction: 'Restart server or reduce player limit'
      }
    ]
  },
  
  {
    id: 'cs2-comp-001',
    name: 'Main Competitive',
    game: 'Counter-Strike 2',
    communityId: 'tactical-strike',
    communityName: 'Tactical Strike Force',
    status: 'online',
    playerCount: 20,
    maxPlayers: 20,
    uptime: '12d 4h 18m',
    version: '13.9.1.20',
    lastRestart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12),
    lastBackup: new Date(Date.now() - 1000 * 60 * 60),
    
    performance: {
      cpu: 45,
      memory: 52,
      networkLatency: 18,
      tickRate: 128,
      diskUsage: 23
    },
    
    config: {
      map: 'de_mirage',
      gameMode: 'Competitive',
      pvpEnabled: true,
      modsEnabled: true,
      backupEnabled: true,
      autoRestart: false
    },
    
    region: 'EU West',
    ipAddress: '192.168.1.102',
    port: 27015,
    
    plugins: [
      {
        id: 'match-tracker',
        name: 'Match Statistics Tracker',
        version: '4.1.2',
        enabled: true,
        autoUpdate: true,
        configurable: true,
        category: 'gameplay',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: 'active'
      },
      {
        id: 'tournament-mode',
        name: 'Tournament Mode Pro',
        version: '1.8.3',
        enabled: true,
        autoUpdate: true,
        configurable: true,
        category: 'admin',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 72),
        status: 'active'
      }
    ],
    
    recentEvents: [
      {
        id: 'evt-cs2-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 8),
        type: 'info',
        message: 'Match completed: Team Alpha won 16-12',
        severity: 'low'
      }
    ],
    
    alerts: []
  },
  
  {
    id: 'valheim-build-001',
    name: 'Creative Building World',
    game: 'Valheim',
    communityId: 'casual-gamers',
    communityName: 'The Casual Collective',
    status: 'maintenance',
    playerCount: 0,
    maxPlayers: 15,
    uptime: '0m',
    version: '0.217.46',
    lastRestart: new Date(),
    lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 4),
    
    performance: {
      cpu: 0,
      memory: 15,
      networkLatency: 0,
      tickRate: 0,
      diskUsage: 38
    },
    
    config: {
      map: 'Creative Build World',
      gameMode: 'Creative',
      pvpEnabled: false,
      modsEnabled: true,
      backupEnabled: true,
      autoRestart: false
    },
    
    region: 'US East',
    ipAddress: '192.168.1.103',
    port: 2457,
    
    plugins: [
      {
        id: 'build-tools',
        name: 'Advanced Building Tools',
        version: '2.3.1',
        enabled: true,
        autoUpdate: true,
        configurable: true,
        category: 'gameplay',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        status: 'active'
      }
    ],
    
    recentEvents: [
      {
        id: 'evt-build-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        type: 'info',
        message: 'Server entered maintenance mode for plugin updates',
        severity: 'low'
      }
    ],
    
    alerts: [
      {
        id: 'alert-build-001',
        serverId: 'valheim-build-001',
        type: 'maintenance',
        severity: 'info',
        title: 'Scheduled Maintenance',
        message: 'Server is offline for plugin updates. Expected completion in 10 minutes.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        resolved: false,
        autoResolvable: true,
        suggestedAction: 'Wait for maintenance to complete'
      }
    ]
  },
  
  {
    id: 'cs2-retake-001',
    name: 'Retake Practice',
    game: 'Counter-Strike 2',
    communityId: 'tactical-strike',
    communityName: 'Tactical Strike Force',
    status: 'error',
    playerCount: 0,
    maxPlayers: 16,
    uptime: '0m',
    version: '13.9.1.20',
    lastRestart: new Date(Date.now() - 1000 * 60 * 15),
    lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6),
    
    performance: {
      cpu: 0,
      memory: 0,
      networkLatency: 0,
      tickRate: 0,
      diskUsage: 45
    },
    
    config: {
      map: 'de_dust2',
      gameMode: 'Retake',
      pvpEnabled: true,
      modsEnabled: true,
      backupEnabled: true,
      autoRestart: true
    },
    
    region: 'EU West',
    ipAddress: '192.168.1.104',
    port: 27016,
    
    plugins: [
      {
        id: 'retake-mode',
        name: 'Retake Game Mode',
        version: '3.1.1',
        enabled: true,
        autoUpdate: true,
        configurable: true,
        category: 'gameplay',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        status: 'error'
      }
    ],
    
    recentEvents: [
      {
        id: 'evt-retake-001',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        type: 'error',
        message: 'Server failed to start - Plugin configuration error',
        severity: 'critical'
      }
    ],
    
    alerts: [
      {
        id: 'alert-retake-001',
        serverId: 'cs2-retake-001',
        type: 'error',
        severity: 'critical',
        title: 'Server Failed to Start',
        message: 'Plugin configuration error preventing server startup. Manual intervention required.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        resolved: false,
        autoResolvable: false,
        suggestedAction: 'Check plugin configuration or disable problematic plugins'
      }
    ]
  }
];

export const MOCK_PLAYERS: PlayerSession[] = [
  {
    id: 'player-001',
    playerName: 'Alex_Johnson',
    steamId: '76561198123456789',
    serverId: 'valheim-main-001',
    serverName: 'Main World - Midgard',
    joinTime: new Date(Date.now() - 1000 * 60 * 45),
    sessionDuration: '45m',
    isOnline: true,
    role: 'admin',
    reputation: 95,
    violations: 0,
    lastSeen: new Date(),
    totalPlaytime: '127h 32m',
    serversPlayed: ['valheim-main-001', 'valheim-build-001'],
    communityJoinDate: new Date('2023-02-28'),
    canKick: false,
    canBan: false,
    canPromote: false
  },
  {
    id: 'player-002',
    playerName: 'Sarah_Builder',
    steamId: '76561198987654321',
    serverId: 'valheim-main-001',
    serverName: 'Main World - Midgard',
    joinTime: new Date(Date.now() - 1000 * 60 * 120),
    sessionDuration: '2h 0m',
    isOnline: true,
    role: 'vip',
    reputation: 88,
    violations: 0,
    lastSeen: new Date(),
    totalPlaytime: '89h 15m',
    serversPlayed: ['valheim-main-001', 'valheim-build-001'],
    communityJoinDate: new Date('2023-04-15'),
    canKick: true,
    canBan: true,
    canPromote: true
  },
  {
    id: 'player-003',
    playerName: 'ClanLeader_Mike',
    steamId: '76561198456789123',
    serverId: 'rust-main-001',
    serverName: 'Main PvP Server',
    joinTime: new Date(Date.now() - 1000 * 60 * 480),
    sessionDuration: '8h 0m',
    isOnline: true,
    role: 'player',
    reputation: 72,
    violations: 1,
    lastSeen: new Date(),
    totalPlaytime: '234h 45m',
    serversPlayed: ['rust-main-001'],
    communityJoinDate: new Date('2023-01-10'),
    canKick: true,
    canBan: true,
    canPromote: true
  },
  {
    id: 'player-004',
    playerName: 'ProGamer_Tyler',
    steamId: '76561198789123456',
    serverId: 'cs2-comp-001',
    serverName: 'Main Competitive',
    joinTime: new Date(Date.now() - 1000 * 60 * 90),
    sessionDuration: '1h 30m',
    isOnline: true,
    role: 'moderator',
    reputation: 92,
    violations: 0,
    lastSeen: new Date(),
    totalPlaytime: '456h 22m',
    serversPlayed: ['cs2-comp-001', 'cs2-retake-001'],
    communityJoinDate: new Date('2022-11-20'),
    canKick: false,
    canBan: false,
    canPromote: false
  }
];

export const MOCK_ANALYTICS: CommunityAnalytics = {
  communityId: 'casual-gamers',
  timeframe: '30d',
  
  totalPlayers: 324,
  activePlayersDaily: 89,
  newPlayersThisWeek: 15,
  playerRetentionRate: 78.5,
  averageSessionTime: '2h 15m',
  peakConcurrentPlayers: 42,
  
  totalServers: 5,
  averageUptime: 97.8,
  totalPlaytimeHours: 1247,
  
  messagesSent: 3420,
  eventsHosted: 12,
  averageRating: 4.9,
  
  revenue: {
    donations: 185.50,
    vipMemberships: 60.00,
    merchandiseSales: 0,
    total: 245.50,
    growth: 18.2
  },
  
  growth: {
    playerGrowth: 18.9,
    engagementTrend: 'up',
    popularTimes: ['7PM-11PM EST', 'Weekend Afternoons'],
    topPerformingServer: 'Main World - Midgard'
  }
};