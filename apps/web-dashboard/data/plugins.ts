import { Plugin, PluginCategory, PluginReview, PluginDeveloper } from '@/types/plugin';

export const PLUGIN_DEVELOPERS: PluginDeveloper[] = [
  {
    id: 'homehost-team',
    name: 'HomeHost Team',
    displayName: 'HomeHost',
    avatar: '/avatars/homehost-team.png',
    verified: true,
    joinDate: new Date('2023-01-01'),
    bio: 'Official plugins by the HomeHost team',
    totalPlugins: 8,
    totalDownloads: 125000,
    averageRating: 4.8
  },
  {
    id: 'community-labs',
    name: 'Community Labs',
    displayName: 'Community Labs',
    avatar: '/avatars/community-labs.png',
    verified: true,
    joinDate: new Date('2023-02-15'),
    bio: 'Advanced tools for serious community administrators',
    website: 'https://communitylabs.dev',
    totalPlugins: 12,
    totalDownloads: 89000,
    averageRating: 4.6
  },
  {
    id: 'indie-dev-alex',
    name: 'Alex Thompson',
    displayName: 'IndieDevAlex',
    avatar: '/avatars/indie-dev-alex.png',
    verified: false,
    joinDate: new Date('2023-05-20'),
    bio: 'Indie developer creating quality-of-life improvements',
    totalPlugins: 5,
    totalDownloads: 23000,
    averageRating: 4.4
  }
];

export const MOCK_PLUGINS: Plugin[] = [
  // ALEX'S QUALITY OF LIFE PLUGINS
  {
    id: 'auto-backup-guardian',
    name: 'Auto-Backup Guardian',
    tagline: 'Never lose your world again',
    description: 'Zero-configuration backup system that automatically protects your game worlds.',
    longDescription: 'Auto-Backup Guardian works silently in the background to ensure your game worlds are always protected. With intelligent scheduling and cloud integration, you\'ll never worry about losing progress again. Perfect for casual hosts who want enterprise-level protection without the complexity.',
    icon: '/icons/backup-guardian.png',
    screenshots: ['/screenshots/backup-1.png', '/screenshots/backup-2.png'],
    
    developer: PLUGIN_DEVELOPERS[0],
    
    category: 'quality-of-life',
    isFeatured: true,
    isRecommended: true,
    isNew: false,
    
    price: { type: 'free' },
    
    version: '2.1.4',
    lastUpdated: new Date('2024-01-15'),
    releaseDate: new Date('2023-03-01'),
    fileSize: '2.4 MB',
    requiredHomeHostVersion: '1.0.0',
    
    supportedGames: ['Valheim', 'Rust', '7 Days to Die', 'MotorTown'],
    platformRequirements: {
      minRam: '512 MB',
      minDisk: '100 MB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.9,
    reviewCount: 1247,
    downloadCount: 45000,
    activeInstalls: 38000,
    
    features: [
      'Automatic backup scheduling',
      'Cloud storage integration',
      'One-click restore',
      'Smart compression',
      'Zero configuration'
    ],
    tags: ['backup', 'automation', 'cloud', 'essential'],
    
    installationStatus: 'installed',
    installedVersion: '2.1.4',
    autoUpdate: true
  },
  
  {
    id: 'friend-zone-manager',
    name: 'Friend Zone Manager',
    tagline: 'Invite Discord friends instantly',
    description: 'Visual whitelist management with Discord integration for effortless friend invites.',
    longDescription: 'Transform your server\'s player management with Friend Zone Manager. Connect your Discord server to automatically sync your friend list, create visual invite links, and manage permissions with drag-and-drop simplicity. No more dealing with Steam IDs or complex configurations.',
    icon: '/icons/friend-zone.png',
    screenshots: ['/screenshots/friends-1.png', '/screenshots/friends-2.png'],
    
    developer: PLUGIN_DEVELOPERS[0],
    
    category: 'quality-of-life',
    isFeatured: true,
    isRecommended: true,
    isNew: false,
    
    price: { type: 'free' },
    
    version: '1.8.2',
    lastUpdated: new Date('2024-01-10'),
    releaseDate: new Date('2023-04-15'),
    fileSize: '3.1 MB',
    requiredHomeHostVersion: '1.0.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2', '7 Days to Die'],
    platformRequirements: {
      minRam: '256 MB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.7,
    reviewCount: 892,
    downloadCount: 32000,
    activeInstalls: 28000,
    
    features: [
      'Discord server integration',
      'Visual friend management',
      'Automatic whitelist sync',
      'Shareable invite links',
      'Permission templates'
    ],
    tags: ['friends', 'discord', 'whitelist', 'social'],
    
    installationStatus: 'not-installed'
  },
  
  {
    id: 'performance-watchdog',
    name: 'Performance Watchdog',
    tagline: 'Automatic optimization',
    description: 'Smart resource monitoring and automatic performance optimization for your servers.',
    longDescription: 'Performance Watchdog continuously monitors your server\'s health and automatically optimizes settings for the best experience. It detects lag spikes, optimizes memory usage, and provides clear recommendations in plain English. Perfect for hosts who want great performance without technical expertise.',
    icon: '/icons/performance-watchdog.png',
    screenshots: ['/screenshots/performance-1.png', '/screenshots/performance-2.png'],
    
    developer: PLUGIN_DEVELOPERS[2],
    
    category: 'quality-of-life',
    isFeatured: false,
    isRecommended: true,
    isNew: false,
    
    price: { type: 'paid', amount: 4.99, currency: 'USD' },
    
    version: '3.2.1',
    lastUpdated: new Date('2024-01-08'),
    releaseDate: new Date('2023-06-01'),
    fileSize: '1.8 MB',
    requiredHomeHostVersion: '1.1.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2', 'MotorTown', '7 Days to Die'],
    platformRequirements: {
      minRam: '128 MB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.6,
    reviewCount: 456,
    downloadCount: 18000,
    activeInstalls: 15000,
    
    features: [
      'Real-time performance monitoring',
      'Automatic lag detection',
      'Smart memory optimization',
      'Performance recommendations',
      'Custom alert thresholds'
    ],
    tags: ['performance', 'optimization', 'monitoring', 'automation'],
    
    installationStatus: 'update-available',
    installedVersion: '3.1.8',
    autoUpdate: false
  },
  
  {
    id: 'connection-helper',
    name: 'Connection Helper',
    tagline: 'Friends join effortlessly',
    description: 'Network troubleshooting automation that solves connection issues before they happen.',
    longDescription: 'Connection Helper automatically detects and fixes common networking issues that prevent friends from joining your server. It handles port forwarding, firewall configuration, and provides step-by-step guides when manual intervention is needed. No more "I can\'t connect" frustrations.',
    icon: '/icons/connection-helper.png',
    screenshots: ['/screenshots/connection-1.png', '/screenshots/connection-2.png'],
    
    developer: PLUGIN_DEVELOPERS[0],
    
    category: 'quality-of-life',
    isFeatured: false,
    isRecommended: true,
    isNew: true,
    
    price: { type: 'free' },
    
    version: '1.2.0',
    lastUpdated: new Date('2024-01-12'),
    releaseDate: new Date('2023-12-15'),
    fileSize: '2.7 MB',
    requiredHomeHostVersion: '1.2.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2', 'MotorTown', '7 Days to Die'],
    platformRequirements: {
      minRam: '256 MB',
      operatingSystems: ['Windows']
    },
    
    rating: 4.8,
    reviewCount: 234,
    downloadCount: 12000,
    activeInstalls: 10000,
    
    features: [
      'Automatic port forwarding',
      'Network diagnostics',
      'Connection testing',
      'Step-by-step troubleshooting',
      'Router compatibility check'
    ],
    tags: ['networking', 'troubleshooting', 'connection', 'automation'],
    
    installationStatus: 'not-installed'
  },
  
  // SAM'S ADMIN TOOLS
  {
    id: 'community-analytics-suite',
    name: 'Community Analytics Suite',
    tagline: 'Understand your players',
    description: 'Advanced engagement tracking and community growth analytics for serious administrators.',
    longDescription: 'Get deep insights into your community with advanced analytics that go beyond basic player counts. Track engagement patterns, identify your most valuable members, predict churn risk, and discover growth opportunities. Includes automated reports and actionable recommendations.',
    icon: '/icons/analytics-suite.png',
    screenshots: ['/screenshots/analytics-1.png', '/screenshots/analytics-2.png'],
    
    developer: PLUGIN_DEVELOPERS[1],
    
    category: 'admin-tools',
    isFeatured: true,
    isRecommended: true,
    isNew: false,
    
    price: { type: 'paid', amount: 12.99, currency: 'USD', trialDays: 14 },
    
    version: '4.1.2',
    lastUpdated: new Date('2024-01-14'),
    releaseDate: new Date('2023-02-20'),
    fileSize: '8.2 MB',
    requiredHomeHostVersion: '1.0.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2', 'MotorTown', '7 Days to Die'],
    platformRequirements: {
      minRam: '1 GB',
      minDisk: '500 MB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.8,
    reviewCount: 567,
    downloadCount: 25000,
    activeInstalls: 18000,
    
    features: [
      'Player lifecycle tracking',
      'Engagement heatmaps',
      'Churn prediction',
      'Growth analytics',
      'Automated reporting',
      'Custom dashboards'
    ],
    tags: ['analytics', 'engagement', 'growth', 'reporting', 'professional'],
    
    installationStatus: 'not-installed',
    revenueShare: {
      developerPercent: 70,
      platformPercent: 30,
      monthlyRevenue: 1847.50
    }
  },
  
  {
    id: 'cross-server-hub',
    name: 'Cross-Server Management Hub',
    tagline: 'Unified administration',
    description: 'Multi-server control tools for managing complex community infrastructures.',
    longDescription: 'Manage multiple game servers from a single interface with Cross-Server Management Hub. Synchronize player databases, execute commands across servers, manage permissions globally, and automate routine maintenance tasks. Essential for communities running multiple games.',
    icon: '/icons/cross-server-hub.png',
    screenshots: ['/screenshots/cross-server-1.png', '/screenshots/cross-server-2.png'],
    
    developer: PLUGIN_DEVELOPERS[1],
    
    category: 'admin-tools',
    isFeatured: true,
    isRecommended: true,
    isNew: false,
    
    price: { type: 'paid', amount: 19.99, currency: 'USD', trialDays: 7 },
    
    version: '2.0.8',
    lastUpdated: new Date('2024-01-11'),
    releaseDate: new Date('2023-03-10'),
    fileSize: '12.4 MB',
    requiredHomeHostVersion: '1.1.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2', 'MotorTown', '7 Days to Die'],
    platformRequirements: {
      minRam: '2 GB',
      minDisk: '1 GB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.7,
    reviewCount: 342,
    downloadCount: 15000,
    activeInstalls: 12000,
    
    features: [
      'Multi-server command execution',
      'Global player management',
      'Cross-server messaging',
      'Unified ban lists',
      'Automated maintenance',
      'Load balancing'
    ],
    tags: ['multi-server', 'administration', 'management', 'automation', 'enterprise'],
    
    installationStatus: 'installed',
    installedVersion: '2.0.8',
    autoUpdate: true
  },
  
  {
    id: 'revenue-optimization',
    name: 'Revenue Optimization Toolkit',
    tagline: 'Monetize effectively',
    description: 'Donation and VIP management tools to help your community become financially sustainable.',
    longDescription: 'Turn your community into a sustainable business with advanced monetization tools. Manage VIP perks, track donations, create subscription tiers, and analyze revenue patterns. Includes payment processing integration and automated thank-you systems.',
    icon: '/icons/revenue-toolkit.png',
    screenshots: ['/screenshots/revenue-1.png', '/screenshots/revenue-2.png'],
    
    developer: PLUGIN_DEVELOPERS[1],
    
    category: 'monetization',
    isFeatured: false,
    isRecommended: true,
    isNew: false,
    
    price: { type: 'freemium', trialDays: 30 },
    
    version: '3.4.1',
    lastUpdated: new Date('2024-01-09'),
    releaseDate: new Date('2023-05-01'),
    fileSize: '6.8 MB',
    requiredHomeHostVersion: '1.1.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2', 'MotorTown', '7 Days to Die'],
    platformRequirements: {
      minRam: '512 MB',
      minDisk: '200 MB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.5,
    reviewCount: 289,
    downloadCount: 11000,
    activeInstalls: 8500,
    
    features: [
      'VIP tier management',
      'Donation tracking',
      'Payment processing',
      'Subscription management',
      'Revenue analytics',
      'Automated perks'
    ],
    tags: ['monetization', 'vip', 'donations', 'revenue', 'business'],
    
    installationStatus: 'not-installed'
  },
  
  {
    id: 'advanced-scheduler',
    name: 'Advanced Scheduler',
    tagline: 'Automate everything',
    description: 'Complex event and maintenance automation with conditional triggers and smart scheduling.',
    longDescription: 'Create sophisticated automation workflows with Advanced Scheduler. Set up conditional triggers, schedule maintenance windows, automate server restarts, and create complex event chains. Perfect for communities that need professional-level automation.',
    icon: '/icons/advanced-scheduler.png',
    screenshots: ['/screenshots/scheduler-1.png', '/screenshots/scheduler-2.png'],
    
    developer: PLUGIN_DEVELOPERS[1],
    
    category: 'admin-tools',
    isFeatured: false,
    isRecommended: false,
    isNew: false,
    
    price: { type: 'paid', amount: 8.99, currency: 'USD' },
    
    version: '1.8.3',
    lastUpdated: new Date('2024-01-07'),
    releaseDate: new Date('2023-07-20'),
    fileSize: '4.5 MB',
    requiredHomeHostVersion: '1.2.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2', 'MotorTown', '7 Days to Die'],
    platformRequirements: {
      minRam: '256 MB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.3,
    reviewCount: 156,
    downloadCount: 7500,
    activeInstalls: 6200,
    
    features: [
      'Conditional triggers',
      'Complex scheduling',
      'Event chains',
      'Maintenance windows',
      'Script execution',
      'Webhook integration'
    ],
    tags: ['automation', 'scheduling', 'advanced', 'triggers', 'maintenance'],
    
    installationStatus: 'not-installed'
  },
  
  // COMMUNITY FEATURES
  {
    id: 'event-manager-pro',
    name: 'Event Manager Pro',
    tagline: 'Epic community events',
    description: 'Organize tournaments, competitions, and community events with professional tools.',
    longDescription: 'Create memorable community experiences with Event Manager Pro. Design tournaments, manage registrations, track leaderboards, and automate rewards. Includes integration with Discord for announcements and live updates.',
    icon: '/icons/event-manager.png',
    screenshots: ['/screenshots/events-1.png', '/screenshots/events-2.png'],
    
    developer: PLUGIN_DEVELOPERS[2],
    
    category: 'community-features',
    isFeatured: false,
    isRecommended: false,
    isNew: true,
    
    price: { type: 'paid', amount: 6.99, currency: 'USD' },
    
    version: '1.0.2',
    lastUpdated: new Date('2024-01-13'),
    releaseDate: new Date('2023-11-30'),
    fileSize: '5.2 MB',
    requiredHomeHostVersion: '1.2.0',
    
    supportedGames: ['Valheim', 'Rust', 'Counter-Strike 2'],
    platformRequirements: {
      minRam: '512 MB',
      operatingSystems: ['Windows', 'Linux']
    },
    
    rating: 4.4,
    reviewCount: 89,
    downloadCount: 3500,
    activeInstalls: 2800,
    
    features: [
      'Tournament brackets',
      'Event registration',
      'Leaderboards',
      'Automated rewards',
      'Discord integration',
      'Custom scoring'
    ],
    tags: ['events', 'tournaments', 'community', 'competition', 'new'],
    
    installationStatus: 'not-installed'
  }
];

export const PLUGIN_CATEGORIES: PluginCategory[] = [
  {
    id: 'quality-of-life',
    name: 'Quality of Life',
    description: 'Essential plugins that make hosting effortless and enjoyable',
    icon: 'zap',
    color: 'bg-green-500',
    targetUser: 'alex',
    pluginCount: 28,
    featured: MOCK_PLUGINS.filter(p => p.category === 'quality-of-life').slice(0, 3)
  },
  {
    id: 'admin-tools',
    name: 'Admin Tools',
    description: 'Professional management tools for serious community administrators',
    icon: 'shield',
    color: 'bg-blue-500',
    targetUser: 'sam',
    pluginCount: 35,
    featured: MOCK_PLUGINS.filter(p => p.category === 'admin-tools').slice(0, 3)
  },
  {
    id: 'community-features',
    name: 'Community Features',
    description: 'Social tools to build engagement and grow your community',
    icon: 'users',
    color: 'bg-purple-500',
    targetUser: 'both',
    pluginCount: 22,
    featured: MOCK_PLUGINS.filter(p => p.category === 'community-features')
  },
  {
    id: 'game-specific',
    name: 'Game-Specific',
    description: 'Specialized plugins designed for individual games',
    icon: 'gamepad-2',
    color: 'bg-orange-500',
    targetUser: 'both',
    pluginCount: 47,
    featured: []
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Anti-cheat, moderation, and server protection tools',
    icon: 'lock',
    color: 'bg-red-500',
    targetUser: 'sam',
    pluginCount: 18,
    featured: []
  },
  {
    id: 'monetization',
    name: 'Monetization',
    description: 'Revenue generation and community sustainability tools',
    icon: 'dollar-sign',
    color: 'bg-yellow-500',
    targetUser: 'sam',
    pluginCount: 12,
    featured: MOCK_PLUGINS.filter(p => p.category === 'monetization')
  }
];

export const MOCK_REVIEWS: PluginReview[] = [
  {
    id: 'review-001',
    pluginId: 'auto-backup-guardian',
    userId: 'user-alex',
    username: 'AlexTheHost',
    userAvatar: '/avatars/alex.png',
    rating: 5,
    title: 'Saved my world twice already!',
    content: 'This plugin is incredible. Had a power outage last week and when I came back online, everything was perfectly restored. My friends didn\'t even know anything happened!',
    timestamp: new Date('2024-01-10'),
    helpful: 23,
    verified: true,
    serverSize: 'Small (6-10 players)'
  },
  {
    id: 'review-002',
    pluginId: 'community-analytics-suite',
    userId: 'user-sam',
    username: 'CommunityBuilder_Sam',
    userAvatar: '/avatars/sam.png',
    rating: 5,
    title: 'Game-changer for community management',
    content: 'The insights this provides are incredible. I discovered that our peak activity is actually Tuesday evenings, not weekends like I thought. Helped me optimize event scheduling and grew our community by 40%.',
    timestamp: new Date('2024-01-08'),
    helpful: 45,
    verified: true,
    serverSize: 'Large (200+ players)'
  }
];