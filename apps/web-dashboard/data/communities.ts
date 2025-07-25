import { Community, CommunityCategory } from '@/types/community';

export const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'viking-legends',
    name: 'Viking Legends',
    description: 'Epic Viking adventures with 500+ warriors. Weekly raids, base building competitions, and legendary tales await!',
    banner: '/images/communities/viking-legends-banner.jpg',
    logo: '/images/communities/viking-legends-logo.png',
    brandColors: {
      primary: '#8B5A2B',
      secondary: '#D4AF37'
    },
    memberCount: 547,
    membersOnline: 89,
    totalServers: 4,
    activeServers: 3,
    joinType: 'open',
    region: 'North America',
    tags: ['PvE', 'Base Building', 'Events', 'Friendly'],
    games: ['Valheim'],
    rating: 4.8,
    reviewCount: 127,
    isVerified: true,
    isFeatured: true,
    createdAt: new Date('2023-03-15'),
    lastActivity: new Date(),
    socialProof: {
      friendsInCommunity: 3,
      mutualFriends: ['Alex Johnson', 'Sarah Chen', 'Mike Wilson'],
      recentActivity: '12 members active in last hour'
    },
    growth: {
      memberGrowthRate: 15.2,
      activityTrend: 'rising',
      newMembersThisWeek: 23
    },
    servers: [
      {
        id: 'vl-main',
        name: 'Main World - Midgard',
        game: 'Valheim',
        playerCount: 18,
        maxPlayers: 20,
        isOnline: true,
        map: 'Procedural #4423',
        gameMode: 'PvE Co-op'
      },
      {
        id: 'vl-hardcore',
        name: 'Hardcore Challenge',
        game: 'Valheim',
        playerCount: 8,
        maxPlayers: 10,
        isOnline: true,
        map: 'Procedural #9871',
        gameMode: 'Hardcore PvE'
      },
      {
        id: 'vl-creative',
        name: 'Creative Building',
        game: 'Valheim',
        playerCount: 12,
        maxPlayers: 15,
        isOnline: true,
        map: 'Custom Build World',
        gameMode: 'Creative'
      }
    ]
  },
  {
    id: 'motorsport-elite',
    name: 'Motorsport Elite',
    description: 'Professional racing community with weekly championships, driver coaching, and realistic race conditions.',
    banner: '/images/communities/motorsport-banner.jpg',
    logo: '/images/communities/motorsport-logo.png',
    brandColors: {
      primary: '#FF4444',
      secondary: '#1A1A1A'
    },
    memberCount: 234,
    membersOnline: 34,
    totalServers: 3,
    activeServers: 2,
    joinType: 'application',
    region: 'Europe',
    tags: ['Competitive', 'Racing', 'Championships', 'Pro'],
    games: ['MotorTown'],
    rating: 4.9,
    reviewCount: 89,
    isVerified: true,
    isFeatured: true,
    createdAt: new Date('2023-06-01'),
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    socialProof: {
      friendsInCommunity: 1,
      mutualFriends: ['Chris Rodriguez'],
      recentActivity: 'Championship race starting in 30 minutes'
    },
    growth: {
      memberGrowthRate: 8.7,
      activityTrend: 'rising',
      newMembersThisWeek: 12
    },
    servers: [
      {
        id: 'me-circuit',
        name: 'Championship Circuit',
        game: 'MotorTown',
        playerCount: 24,
        maxPlayers: 32,
        isOnline: true,
        map: 'Silverstone GP',
        gameMode: 'Championship',
        hasQueue: true
      },
      {
        id: 'me-practice',
        name: 'Practice Track',
        game: 'MotorTown',
        playerCount: 8,
        maxPlayers: 16,
        isOnline: true,
        map: 'Various Circuits',
        gameMode: 'Time Attack'
      }
    ]
  },
  {
    id: 'tactical-strike',
    name: 'Tactical Strike Force',
    description: 'Elite CS2 community focused on tactical gameplay, team coordination, and competitive excellence.',
    banner: '/images/communities/tactical-banner.jpg',
    logo: '/images/communities/tactical-logo.png',
    brandColors: {
      primary: '#2E86AB',
      secondary: '#A23B72'
    },
    memberCount: 1247,
    membersOnline: 178,
    totalServers: 8,
    activeServers: 6,
    joinType: 'application',
    region: 'Global',
    tags: ['Competitive', 'Tactical', 'Esports', 'Team Play'],
    games: ['Counter-Strike 2'],
    rating: 4.7,
    reviewCount: 312,
    isVerified: true,
    isFeatured: false,
    createdAt: new Date('2022-11-20'),
    lastActivity: new Date(Date.now() - 1000 * 60 * 2),
    socialProof: {
      friendsInCommunity: 5,
      mutualFriends: ['Tyler Brooks', 'Emma Davis', 'Jordan Kim', 'Alex Martinez', 'Sam Johnson'],
      recentActivity: 'Tournament finals happening now!'
    },
    growth: {
      memberGrowthRate: 12.4,
      activityTrend: 'rising',
      newMembersThisWeek: 41
    },
    servers: [
      {
        id: 'tsf-main',
        name: 'Main Competitive',
        game: 'Counter-Strike 2',
        playerCount: 20,
        maxPlayers: 20,
        isOnline: true,
        map: 'de_mirage',
        gameMode: 'Competitive',
        hasQueue: true
      },
      {
        id: 'tsf-retake',
        name: 'Retake Practice',
        game: 'Counter-Strike 2',
        playerCount: 16,
        maxPlayers: 16,
        isOnline: true,
        map: 'de_dust2',
        gameMode: 'Retake'
      },
      {
        id: 'tsf-deathmatch',
        name: 'Warmup DM',
        game: 'Counter-Strike 2',
        playerCount: 14,
        maxPlayers: 16,
        isOnline: true,
        map: 'aim_map',
        gameMode: 'Deathmatch'
      }
    ]
  },
  {
    id: 'rust-survivors',
    name: 'Rust Survivors Coalition',
    description: 'Hardcore survival community where alliances matter and trust is earned. Monthly wipe cycles with epic clan wars.',
    banner: '/images/communities/rust-banner.jpg',
    logo: '/images/communities/rust-logo.png',
    brandColors: {
      primary: '#CD5C2A',
      secondary: '#4A4A4A'
    },
    memberCount: 892,
    membersOnline: 156,
    totalServers: 3,
    activeServers: 3,
    joinType: 'open',
    region: 'North America',
    tags: ['PvP', 'Hardcore', 'Clans', 'Survival'],
    games: ['Rust'],
    rating: 4.5,
    reviewCount: 203,
    isVerified: true,
    isFeatured: false,
    createdAt: new Date('2023-01-10'),
    lastActivity: new Date(Date.now() - 1000 * 60 * 5),
    socialProof: {
      friendsInCommunity: 2,
      mutualFriends: ['Jake Miller', 'Lisa Wang'],
      recentActivity: 'Clan war in progress - 200+ online'
    },
    growth: {
      memberGrowthRate: 6.3,
      activityTrend: 'stable',
      newMembersThisWeek: 18
    },
    servers: [
      {
        id: 'rs-main',
        name: 'Main PvP Server',
        game: 'Rust',
        playerCount: 180,
        maxPlayers: 200,
        isOnline: true,
        map: 'Procedural Map',
        gameMode: 'Vanilla PvP',
        hasQueue: true
      },
      {
        id: 'rs-modded',
        name: 'Modded 2x Server',
        game: 'Rust',
        playerCount: 124,
        maxPlayers: 150,
        isOnline: true,
        map: 'Custom Map',
        gameMode: '2x Modded'
      },
      {
        id: 'rs-creative',
        name: 'Creative Sandbox',
        game: 'Rust',
        playerCount: 23,
        maxPlayers: 50,
        isOnline: true,
        map: 'Creative Map',
        gameMode: 'Creative Build'
      }
    ]
  },
  {
    id: 'zombie-apocalypse',
    name: 'Zombie Apocalypse Squad',
    description: 'Cooperative survival against the undead hordes. Team up, build bases, and survive the 7-day hordes together!',
    banner: '/images/communities/zombie-banner.jpg',
    logo: '/images/communities/zombie-logo.png',
    brandColors: {
      primary: '#8B0000',
      secondary: '#228B22'
    },
    memberCount: 156,
    membersOnline: 28,
    totalServers: 2,
    activeServers: 2,
    joinType: 'open',
    region: 'Global',
    tags: ['Co-op', 'PvE', 'Survival', 'Zombies'],
    games: ['7 Days to Die'],
    rating: 4.6,
    reviewCount: 67,
    isVerified: false,
    isFeatured: false,
    createdAt: new Date('2023-09-05'),
    lastActivity: new Date(Date.now() - 1000 * 60 * 20),
    socialProof: {
      friendsInCommunity: 0,
      mutualFriends: [],
      recentActivity: 'Day 21 horde night survived!'
    },
    growth: {
      memberGrowthRate: 22.1,
      activityTrend: 'rising',
      newMembersThisWeek: 8
    },
    servers: [
      {
        id: 'zas-main',
        name: 'Main Co-op World',
        game: '7 Days to Die',
        playerCount: 12,
        maxPlayers: 16,
        isOnline: true,
        map: 'Navezgane',
        gameMode: 'PvE Co-op'
      },
      {
        id: 'zas-hardcore',
        name: 'Nightmare Mode',
        game: '7 Days to Die',
        playerCount: 6,
        maxPlayers: 8,
        isOnline: true,
        map: 'Random Gen',
        gameMode: 'Nightmare Difficulty'
      }
    ]
  },
  {
    id: 'casual-gamers',
    name: 'The Casual Collective',
    description: 'Relaxed gaming community for working professionals. No pressure, just fun gaming sessions after work and weekends.',
    banner: '/images/communities/casual-banner.jpg',
    logo: '/images/communities/casual-logo.png',
    brandColors: {
      primary: '#20B2AA',
      secondary: '#FFE4B5'
    },
    memberCount: 324,
    membersOnline: 42,
    totalServers: 5,
    activeServers: 3,
    joinType: 'open',
    region: 'Global',
    tags: ['Casual', 'Friendly', 'Working Adults', 'Multi-Game'],
    games: ['Valheim', 'MotorTown', '7 Days to Die'],
    rating: 4.9,
    reviewCount: 156,
    isVerified: true,
    isFeatured: true,
    createdAt: new Date('2023-02-28'),
    lastActivity: new Date(Date.now() - 1000 * 60 * 8),
    socialProof: {
      friendsInCommunity: 1,
      mutualFriends: ['Amanda Green'],
      recentActivity: 'Friday game night starting soon!'
    },
    growth: {
      memberGrowthRate: 18.9,
      activityTrend: 'rising',
      newMembersThisWeek: 15
    },
    servers: [
      {
        id: 'cc-valheim',
        name: 'Chill Valheim World',
        game: 'Valheim',
        playerCount: 8,
        maxPlayers: 10,
        isOnline: true,
        map: 'Peaceful Seed',
        gameMode: 'Casual PvE'
      },
      {
        id: 'cc-racing',
        name: 'Weekend Racing',
        game: 'MotorTown',
        playerCount: 12,
        maxPlayers: 16,
        isOnline: true,
        map: 'Fun Tracks',
        gameMode: 'Casual Racing'
      },
      {
        id: 'cc-zombies',
        name: 'Zombie Movie Night',
        game: '7 Days to Die',
        playerCount: 6,
        maxPlayers: 8,
        isOnline: false,
        map: 'Cinematic Map',
        gameMode: 'Story Mode'
      }
    ],
    adminData: {
      isAdministrator: true,
      role: 'owner',
      analytics: {
        weeklyActiveUsers: 89,
        memberRetentionRate: 78.5,
        averageSessionTime: '2h 15m',
        topPerformingServer: 'Chill Valheim World',
        revenueThisMonth: 245.50
      },
      pendingApplications: 0,
      flaggedContent: 1
    }
  }
];

export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  {
    id: 'featured',
    title: 'Featured Communities',
    description: 'Hand-picked communities with exceptional quality and engagement',
    icon: 'star',
    communities: MOCK_COMMUNITIES.filter(c => c.isFeatured),
    priority: 1
  },
  {
    id: 'friends-playing',
    title: 'Friends Are Playing',
    description: 'Communities where your friends are active',
    icon: 'users',
    communities: MOCK_COMMUNITIES.filter(c => c.socialProof.friendsInCommunity > 0),
    priority: 2
  },
  {
    id: 'trending',
    title: 'Trending Communities',
    description: 'Rapidly growing communities with rising activity',
    icon: 'trending-up',
    communities: MOCK_COMMUNITIES.filter(c => c.growth.activityTrend === 'rising').slice(0, 6),
    priority: 3
  },
  {
    id: 'new-member-friendly',
    title: 'New Member Friendly',
    description: 'Welcoming communities perfect for getting started',
    icon: 'heart',
    communities: MOCK_COMMUNITIES.filter(c => c.joinType === 'open' && c.rating >= 4.7),
    priority: 4
  },
  {
    id: 'competitive',
    title: 'Competitive Gaming',
    description: 'Serious communities for competitive players',
    icon: 'trophy',
    communities: MOCK_COMMUNITIES.filter(c => c.tags.includes('Competitive')),
    priority: 5
  },
  {
    id: 'casual',
    title: 'Casual & Relaxed',
    description: 'Low-pressure communities for casual gaming',
    icon: 'coffee',
    communities: MOCK_COMMUNITIES.filter(c => c.tags.includes('Casual') || c.tags.includes('Friendly')),
    priority: 6
  }
];