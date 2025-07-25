import { User, NavigationItem, QuickAction, Notification, RecentActivity, DashboardStats } from '@/types/app';

export const MOCK_USER: User = {
  id: 'user-sam',
  name: 'Sam Johnson',
  email: 'sam@example.com',
  avatar: '/avatars/sam-johnson.png',
  role: 'sam',
  preferences: {
    theme: 'light',
    experienceMode: 'auto',
    notifications: {
      serverAlerts: true,
      communityUpdates: true,
      pluginUpdates: true,
      newFeatures: true
    }
  },
  stats: {
    serversHosted: 5,
    communitiesJoined: 3,
    pluginsInstalled: 12,
    totalUptime: '99.7%',
    communityReputation: 4.8
  }
};

export const ALEX_USER: User = {
  id: 'user-alex',
  name: 'Alex Thompson',
  email: 'alex@example.com',
  avatar: '/avatars/alex-thompson.png',
  role: 'alex',
  preferences: {
    theme: 'light',
    experienceMode: 'simple',
    notifications: {
      serverAlerts: true,
      communityUpdates: false,
      pluginUpdates: true,
      newFeatures: false
    }
  },
  stats: {
    serversHosted: 2,
    communitiesJoined: 1,
    pluginsInstalled: 3,
    totalUptime: '98.9%',
    communityReputation: 4.5
  }
};

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'home',
    url: '/app',
    userTypes: ['alex', 'sam']
  },
  {
    id: 'games',
    title: 'Game Library',
    icon: 'gamepad-2',
    url: '/app/games',
    userTypes: ['alex', 'sam']
  },
  {
    id: 'communities',
    title: 'Communities',
    icon: 'users',
    url: '/app/communities',
    userTypes: ['alex', 'sam'],
    children: [
      {
        id: 'discover-communities',
        title: 'Discover',
        icon: 'search',
        url: '/app/communities',
        userTypes: ['alex', 'sam']
      },
      {
        id: 'my-communities',
        title: 'My Communities',
        icon: 'heart',
        url: '/app/communities/mine',
        userTypes: ['alex', 'sam']
      }
    ]
  },
  {
    id: 'console',
    title: 'Server Console',
    icon: 'monitor',
    url: '/app/console',
    badge: 2,
    userTypes: ['sam'],
    children: [
      {
        id: 'server-overview',
        title: 'Overview',
        icon: 'activity',
        url: '/app/console',
        userTypes: ['sam']
      },
      {
        id: 'server-players',
        title: 'Players',
        icon: 'users',
        url: '/app/console/players',
        userTypes: ['sam']
      },
      {
        id: 'server-analytics',
        title: 'Analytics',
        icon: 'bar-chart-3',
        url: '/app/console/analytics',
        userTypes: ['sam']
      }
    ]
  },
  {
    id: 'my-servers',
    title: 'My Servers',
    icon: 'server',
    url: '/app/servers',
    userTypes: ['alex']
  },
  {
    id: 'optimization',
    title: 'Auto-Optimizer',
    icon: 'trending-up',
    url: '/app/optimization',
    userTypes: ['alex', 'sam']
  },
  {
    id: 'marketplace',
    title: 'Plugin Store',
    icon: 'puzzle',
    url: '/app/marketplace',
    userTypes: ['alex', 'sam'],
    children: [
      {
        id: 'browse-plugins',
        title: 'Browse',
        icon: 'search',
        url: '/app/marketplace',
        userTypes: ['alex', 'sam']
      },
      {
        id: 'my-plugins',
        title: 'My Plugins',
        icon: 'download',
        url: '/app/marketplace/installed',
        userTypes: ['alex', 'sam']
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: 'trending-up',
    url: '/app/analytics',
    userTypes: ['sam']
  },
  {
    id: 'help',
    title: 'Help & Support',
    icon: 'help-circle',
    url: '/app/help',
    userTypes: ['alex', 'sam']
  }
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'deploy-server',
    title: 'Deploy New Server',
    description: 'Start hosting a new game in minutes',
    icon: 'play',
    url: '/app/games',
    primary: true,
    userTypes: ['alex', 'sam']
  },
  {
    id: 'join-community',
    title: 'Find Communities',
    description: 'Discover amazing gaming communities',
    icon: 'users',
    url: '/app/communities',
    userTypes: ['alex', 'sam']
  },
  {
    id: 'install-plugin',
    title: 'Browse Plugins',
    description: 'Enhance your servers with plugins',
    icon: 'puzzle',
    url: '/app/marketplace',
    userTypes: ['alex', 'sam']
  },
  {
    id: 'manage-servers',
    title: 'Server Console',
    description: 'Monitor and manage all servers',
    icon: 'monitor',
    url: '/app/console',
    userTypes: ['sam']
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Track community growth and engagement',
    icon: 'bar-chart-3',
    url: '/app/analytics',
    userTypes: ['sam']
  },
  {
    id: 'simple-overview',
    title: 'Server Status',
    description: 'Quick view of your servers',
    icon: 'activity',
    url: '/app/servers',
    userTypes: ['alex']
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    type: 'server-alert',
    title: 'High Memory Usage',
    message: 'Rust PvP Server is using 87% memory. Consider optimization.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
    actionUrl: '/app/console',
    severity: 'warning',
    icon: 'alert-triangle'
  },
  {
    id: 'notif-002',
    type: 'plugin-update',
    title: 'Plugin Update Available',
    message: 'Auto-Backup Guardian v2.1.5 is ready to install.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
    actionUrl: '/app/marketplace/installed',
    severity: 'info',
    icon: 'download'
  },
  {
    id: 'notif-003',
    type: 'community-update',
    title: 'New Community Member',
    message: 'Sarah_Builder joined The Casual Collective.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
    read: true,
    actionUrl: '/app/communities/mine',
    severity: 'success',
    icon: 'user-plus'
  },
  {
    id: 'notif-004',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'Community Builder: Reached 300 members.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: false,
    actionUrl: '/app/analytics',
    severity: 'success',
    icon: 'trophy'
  }
];

export const DASHBOARD_STATS: DashboardStats = {
  activeServers: 5,
  totalPlayers: 234,
  communityMembers: 324,
  monthlyRevenue: 245.50,
  uptime: '99.7%',
  alertsCount: 2
};

export const ALEX_DASHBOARD_STATS: DashboardStats = {
  activeServers: 2,
  totalPlayers: 12,
  communityMembers: 8,
  uptime: '98.9%',
  alertsCount: 0
};

export const RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: 'activity-001',
    type: 'server-deployed',
    title: 'New Server Deployed',
    description: 'Successfully deployed Valheim Creative Building server',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    icon: 'server',
    metadata: { game: 'Valheim', players: 0 }
  },
  {
    id: 'activity-002',
    type: 'plugin-installed',
    title: 'Plugin Installed',
    description: 'Auto-Backup Guardian v2.1.4 installed on all servers',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: 'puzzle',
    metadata: { plugin: 'Auto-Backup Guardian' }
  },
  {
    id: 'activity-003',
    type: 'community-joined',
    title: 'Community Growth',
    description: '5 new members joined The Casual Collective this week',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    icon: 'users',
    metadata: { community: 'The Casual Collective', newMembers: 5 }
  },
  {
    id: 'activity-004',
    type: 'revenue',
    title: 'Revenue Milestone',
    description: 'Monthly revenue exceeded $200 for the first time',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    icon: 'dollar-sign',
    metadata: { amount: 245.50 }
  }
];

export const ALEX_RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: 'alex-activity-001',
    type: 'server-deployed',
    title: 'Valheim Server Started',
    description: 'Your friends can now join the Midgard adventure!',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    icon: 'play',
    metadata: { game: 'Valheim', players: 4 }
  },
  {
    id: 'alex-activity-002',
    type: 'plugin-installed',
    title: 'Backup Protection Added',
    description: 'Auto-Backup Guardian is now protecting your world',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    icon: 'shield',
    metadata: { plugin: 'Auto-Backup Guardian' }
  },
  {
    id: 'alex-activity-003',
    type: 'achievement',
    title: 'First Week Complete!',
    description: 'Successfully hosted for 7 days with 99% uptime',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    icon: 'trophy',
    metadata: { uptime: '99%' }
  }
];