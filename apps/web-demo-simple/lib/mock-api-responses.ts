// Mock API responses for integration testing simulation
// This simulates what the real HomeHost Cloud API would return

export const MOCK_API_RESPONSES = {
  // Health check response
  health: {
    status: "Healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: "Development"
  },

  // Authentication response
  auth: {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0xMTExLTExMTEtMTExMS0xMTExMTExMTExMTEiLCJlbWFpbCI6ImFsZXhAaG9tZWhvc3QuY29tIiwibmFtZSI6IkFsZXggSm9obnNvbiIsInJvbGUiOiJDYXN1YWxIb3N0IiwiaWF0IjoxNzIxMzQ2NjAwLCJleHAiOjE3MjEzNTA2MDB9.mock_signature",
    refreshToken: "refresh_token_mock_12345",
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
    user: {
      id: "11111111-1111-1111-1111-111111111111",
      email: "alex@homehost.com",
      displayName: "Alex Johnson (Casual Host)",
      personaType: 0
    }
  },

  // Communities list response
  communities: [
    {
      id: "33333333-3333-3333-3333-333333333333",
      name: "Viking Legends",
      description: "Epic Viking adventures in Valheim with a focus on cooperative building and exploration. Join our thriving community of builders and warriors!",
      banner: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200",
      brandColors: {
        primary: "#2563eb",
        secondary: "#1d4ed8",
        accent: "#3b82f6"
      },
      memberCount: 1247,
      membersOnline: 89,
      totalServers: 8,
      activeServers: 6,
      joinType: "open",
      region: "North America",
      timezone: "America/New_York",
      language: "en",
      tags: ["survival", "co-op", "pve", "building", "exploration"],
      games: ["Valheim"],
      rating: 4.8,
      reviewCount: 156,
      isVerified: true,
      isFeatured: true,
      isOfficial: false,
      createdAt: new Date("2024-01-15").toISOString(),
      lastActivity: new Date().toISOString(),
      ownerId: "22222222-2222-2222-2222-222222222222",
      website: "https://vikinglegends.com",
      discord: "https://discord.gg/vikinglegends",
      socialLinks: {
        twitter: "https://twitter.com/vikinglegends",
        youtube: "https://youtube.com/vikinglegends",
        twitch: "https://twitch.tv/vikinglegends"
      },
      rules: [
        "Respect all community members",
        "No griefing or destroying others' builds",
        "Keep chat family-friendly",
        "Follow server-specific rules",
        "Report issues to moderators"
      ],
      welcomeMessage: "Welcome to Viking Legends! Start your epic adventure by joining our Discord and checking out the community guidelines.",
      socialProof: {
        friendsInCommunity: 3,
        mutualFriends: ["sarah_chen", "mike_wilson"],
        recentActivity: "5 new members joined this week",
        endorsements: 12
      },
      growth: {
        memberGrowthRate: 15.2,
        activityTrend: "rising",
        newMembersThisWeek: 23,
        peakMembersOnline: 156,
        avgDailyActiveMembers: 78
      },
      reputation: {
        trustScore: 92,
        adminResponseTime: "< 1 hour",
        memberSatisfaction: 4.7,
        infraReliability: 99.2
      },
      monetization: {
        hasVipPerks: true,
        acceptsDonations: true,
        hasStore: false
      },
      servers: [
        {
          id: "server-1",
          name: "Viking Legends Main",
          game: "Valheim",
          playerCount: 45,
          maxPlayers: 60,
          isOnline: true,
          map: "Midgard",
          gameMode: "Survival",
          difficulty: "normal",
          pvpEnabled: false,
          performance: {
            uptime: 99.5,
            avgPing: 25,
            tps: 60.0,
            lastRestart: new Date(Date.now() - 86400000).toISOString()
          },
          tags: ["main", "pve", "cooperative"],
          createdAt: new Date("2024-01-15").toISOString(),
          lastPlayerActivity: new Date().toISOString()
        }
      ]
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      name: "Tactical Strike Force",
      description: "Competitive Counter-Strike 2 community with professional coaching and tournaments. Rise through the ranks with us!",
      banner: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
      logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200",
      brandColors: {
        primary: "#dc2626",
        secondary: "#b91c1c",
        accent: "#ef4444"
      },
      memberCount: 892,
      membersOnline: 234,
      totalServers: 12,
      activeServers: 10,
      joinType: "application",
      region: "Europe",
      timezone: "Europe/London",
      language: "en",
      tags: ["competitive", "fps", "tournaments", "coaching", "esports"],
      games: ["Counter-Strike 2"],
      rating: 4.6,
      reviewCount: 203,
      isVerified: true,
      isFeatured: true,
      isOfficial: false,
      createdAt: new Date("2023-08-20").toISOString(),
      lastActivity: new Date().toISOString(),
      ownerId: "22222222-2222-2222-2222-222222222222",
      discord: "https://discord.gg/tacticalstrike",
      socialProof: {
        friendsInCommunity: 1,
        mutualFriends: ["pro_player_123"],
        recentActivity: "Tournament starting in 2 hours",
        endorsements: 8
      },
      growth: {
        memberGrowthRate: 8.5,
        activityTrend: "stable",
        newMembersThisWeek: 15,
        peakMembersOnline: 312,
        avgDailyActiveMembers: 198
      },
      reputation: {
        trustScore: 88,
        adminResponseTime: "< 30 minutes",
        memberSatisfaction: 4.5,
        infraReliability: 97.8
      },
      servers: [
        {
          id: "server-2",
          name: "TSF Tournament Server",
          game: "Counter-Strike 2",
          playerCount: 20,
          maxPlayers: 20,
          isOnline: true,
          map: "de_dust2",
          gameMode: "Competitive",
          difficulty: "expert",
          pvpEnabled: true,
          performance: {
            uptime: 98.2,
            avgPing: 15,
            tps: 128.0,
            lastRestart: new Date(Date.now() - 43200000).toISOString()
          },
          tags: ["tournament", "competitive", "ranked"],
          createdAt: new Date("2023-08-20").toISOString(),
          lastPlayerActivity: new Date().toISOString()
        }
      ]
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      name: "Casual Collective",
      description: "Relaxed gaming community for casual players. Multiple games, friendly atmosphere, and no pressure gameplay.",
      brandColors: {
        primary: "#10b981",
        secondary: "#059669",
        accent: "#34d399"
      },
      memberCount: 456,
      membersOnline: 67,
      totalServers: 5,
      activeServers: 4,
      joinType: "open",
      region: "North America",
      games: ["Minecraft", "Among Us", "Fall Guys"],
      rating: 4.9,
      reviewCount: 89,
      isVerified: false,
      isFeatured: false,
      isOfficial: false,
      createdAt: new Date("2024-03-01").toISOString(),
      lastActivity: new Date().toISOString(),
      ownerId: "33333333-3333-3333-3333-333333333333",
      tags: ["casual", "friendly", "multi-game", "relaxed"],
      socialProof: {
        friendsInCommunity: 5,
        mutualFriends: ["casual_gamer_1", "weekend_warrior"],
        recentActivity: "Game night every Friday",
        endorsements: 15
      },
      growth: {
        memberGrowthRate: 12.3,
        activityTrend: "rising",
        newMembersThisWeek: 18,
        peakMembersOnline: 89,
        avgDailyActiveMembers: 45
      },
      reputation: {
        trustScore: 95,
        adminResponseTime: "< 2 hours",
        memberSatisfaction: 4.9,
        infraReliability: 96.5
      },
      servers: []
    }
  ],

  // Community members response
  communityMembers: [
    {
      id: "member-1",
      communityId: "33333333-3333-3333-3333-333333333333",
      userId: "22222222-2222-2222-2222-222222222222",
      role: "owner",
      joinedAt: new Date("2024-01-15").toISOString(),
      lastSeen: new Date().toISOString(),
      isOnline: true
    },
    {
      id: "member-2",
      communityId: "33333333-3333-3333-3333-333333333333",
      userId: "11111111-1111-1111-1111-111111111111",
      role: "member",
      joinedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      isOnline: true
    }
  ],

  // Search results
  searchResults: {
    "valheim": [
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Viking Legends",
        description: "Epic Viking adventures in Valheim...",
        games: ["Valheim"],
        memberCount: 1247,
        rating: 4.8,
        tags: ["survival", "co-op", "pve"]
      }
    ],
    "competitive": [
      {
        id: "44444444-4444-4444-4444-444444444444",
        name: "Tactical Strike Force",
        description: "Competitive Counter-Strike 2 community...",
        games: ["Counter-Strike 2"],
        memberCount: 892,
        rating: 4.6,
        tags: ["competitive", "fps", "tournaments"]
      }
    ]
  },

  // Create community success response
  createCommunitySuccess: {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Integration Test Community",
    description: "This is a test community created by the integration tester",
    brandColors: {
      primary: "#3b82f6",
      secondary: "#1d4ed8"
    },
    memberCount: 1,
    membersOnline: 1,
    totalServers: 0,
    activeServers: 0,
    joinType: "open",
    region: "North America",
    games: ["Test Game"],
    rating: 0,
    reviewCount: 0,
    isVerified: false,
    isFeatured: false,
    isOfficial: false,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    ownerId: "11111111-1111-1111-1111-111111111111",
    tags: ["integration", "test"]
  }
};

// Simulate API delays for realistic testing
export const simulateApiDelay = (ms: number = 200) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate realistic test results
export const generateTestResults = () => ({
  totalTests: 10,
  passed: 9,
  failed: 1,
  successRate: 90,
  avgResponseTime: 245,
  issues: [
    {
      test: "Cross-server ban management",
      status: "warning",
      message: "Feature pending backend implementation"
    }
  ]
});