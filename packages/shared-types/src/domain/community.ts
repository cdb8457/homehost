export interface Community {
  id: string;
  name: string;
  description: string;
  banner: string;
  logo: string;
  brandColors: {
    primary: string;
    secondary: string;
  };
  memberCount: number;
  membersOnline: number;
  totalServers: number;
  activeServers: number;
  joinType: 'open' | 'application' | 'invite_only';
  region: string;
  tags: string[];
  games: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: Date;
  lastActivity: Date;
  socialProof: {
    friendsInCommunity: number;
    mutualFriends: string[];
    recentActivity: string;
  };
  growth: {
    memberGrowthRate: number; // percentage change last 30 days
    activityTrend: 'rising' | 'stable' | 'declining';
    newMembersThisWeek: number;
  };
  servers: CommunityServer[];
  adminData?: CommunityAdminData; // Only visible to Sam for his communities
}

export interface CommunityServer {
  id: string;
  name: string;
  game: string;
  playerCount: number;
  maxPlayers: number;
  isOnline: boolean;
  map?: string;
  gameMode?: string;
  hasQueue?: boolean;
}

export interface CommunityAdminData {
  isAdministrator: boolean;
  role: 'owner' | 'admin' | 'moderator';
  analytics: {
    weeklyActiveUsers: number;
    memberRetentionRate: number;
    averageSessionTime: string;
    topPerformingServer: string;
    revenueThisMonth?: number;
  };
  pendingApplications?: number;
  flaggedContent?: number;
}

export interface CommunityFilter {
  search?: string;
  games?: string[];
  memberCount?: 'small' | 'medium' | 'large' | 'massive';
  region?: string;
  joinType?: 'open' | 'application' | 'invite_only';
  activity?: 'very_active' | 'active' | 'moderate' | 'quiet';
  sortBy?: 'relevance' | 'members' | 'activity' | 'rating' | 'newest';
  showFriendsOnly?: boolean;
}

export interface CommunityCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  communities: Community[];
  priority: number;
}

export interface JoinRequest {
  communityId: string;
  userId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}