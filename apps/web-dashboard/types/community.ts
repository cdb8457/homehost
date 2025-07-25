export interface Community {
  id: string;
  name: string;
  description: string;
  banner: string;
  logo: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  memberCount: number;
  membersOnline: number;
  totalServers: number;
  activeServers: number;
  joinType: 'open' | 'application' | 'invite_only';
  region: string;
  timezone?: string;
  language?: string;
  tags: string[];
  games: string[];
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  isOfficial: boolean; // For game developer verified communities
  createdAt: Date;
  lastActivity: Date;
  ownerId: string;
  website?: string;
  discord?: string;
  socialLinks?: {
    twitter?: string;
    youtube?: string;
    twitch?: string;
  };
  rules?: string[];
  welcomeMessage?: string;
  socialProof: {
    friendsInCommunity: number;
    mutualFriends: string[];
    recentActivity: string;
    endorsements: number; // Community recommendations from other communities
  };
  growth: {
    memberGrowthRate: number; // percentage change last 30 days
    activityTrend: 'rising' | 'stable' | 'declining';
    newMembersThisWeek: number;
    peakMembersOnline: number;
    avgDailyActiveMembers: number;
  };
  reputation: {
    trustScore: number; // 0-100 based on member feedback, uptime, etc.
    adminResponseTime: string; // Average response time for community issues
    memberSatisfaction: number; // 0-5 rating from member surveys
    infraReliability: number; // Server uptime percentage
  };
  monetization?: {
    hasVipPerks: boolean;
    acceptsDonations: boolean;
    hasStore: boolean;
    currency?: string;
  };
  servers: CommunityServer[];
  adminData?: CommunityAdminData; // Only visible to Sam for his communities
}

export interface CommunityServer {
  id: string;
  name: string;
  game: string;
  gameVersion?: string;
  playerCount: number;
  maxPlayers: number;
  isOnline: boolean;
  map?: string;
  gameMode?: string;
  hasQueue?: boolean;
  queueLength?: number;
  mods?: string[];
  difficulty?: 'easy' | 'normal' | 'hard' | 'expert';
  pvpEnabled?: boolean;
  passwordProtected?: boolean;
  joinUrl?: string;
  connectInfo?: {
    ip: string;
    port: number;
    directConnect?: string;
  };
  performance: {
    uptime: number; // percentage
    avgPing: number; // ms
    tps: number; // ticks per second for games that support it
    lastRestart: Date;
  };
  tags: string[];
  createdAt: Date;
  lastPlayerActivity: Date;
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
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
}

// Cross-Server Player Management Types
export interface CommunityPlayer {
  id: string;
  steamId?: string;
  username: string;
  displayName: string;
  avatar?: string;
  joinedAt: Date;
  lastSeen: Date;
  isOnline: boolean;
  currentServerId?: string;
  role: 'member' | 'vip' | 'moderator' | 'admin' | 'owner';
  reputation: {
    score: number; // Cross-server reputation score
    commendations: number;
    warnings: number;
    isBanned: boolean;
    banReason?: string;
    banExpiresAt?: Date;
  };
  activity: {
    totalPlayTime: number; // minutes across all servers
    favoriteServer?: string;
    serverPlayTime: { [serverId: string]: number }; // minutes per server
    lastActivity: {
      serverId: string;
      action: string;
      timestamp: Date;
    };
  };
  permissions: string[]; // Custom permissions granted by community admins
  notes?: string; // Admin notes about this player
}

export interface PlayerAction {
  id: string;
  playerId: string;
  serverId: string;
  action: 'join' | 'leave' | 'kick' | 'ban' | 'unban' | 'promote' | 'demote' | 'warn' | 'commend';
  performedBy: string; // Staff member who performed the action
  reason?: string;
  duration?: number; // For temporary actions like bans (in minutes)
  timestamp: Date;
  isActive: boolean;
}

export interface CrossServerBan {
  id: string;
  playerId: string;
  communityId: string;
  serverIds: string[]; // Empty array means banned from all servers
  reason: string;
  bannedBy: string;
  bannedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  appealUrl?: string;
}

export interface PlayerInvitation {
  id: string;
  communityId: string;
  invitedBy: string;
  inviteeEmail?: string;
  inviteeSteamId?: string;
  message?: string;
  expiresAt: Date;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: Date;
}

// Epic 5: Advanced Community & Social Features Types

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  location?: string;
  socialLinks: {
    discord?: string;
    twitter?: string;
    twitch?: string;
    youtube?: string;
    steam?: string;
  };
  stats: {
    totalPlayTime: number; // minutes
    serversJoined: number;
    friendsCount: number;
    postsCount: number;
    achievementsCount: number;
    reputationScore: number;
  };
  preferences: {
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    showGameActivity: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  badges: Badge[];
  joinedAt: Date;
  lastActive: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'achievement' | 'milestone' | 'event' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
  progress?: {
    current: number;
    required: number;
  };
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
  requesterProfile?: UserProfile;
  addresseeProfile?: UserProfile;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  serverId: string;
  content: string;
  mediaUrls: string[];
  postType: 'text' | 'image' | 'video' | 'poll' | 'achievement' | 'event';
  visibility: 'public' | 'friends' | 'server' | 'private';
  tags: string[];
  likes: {
    count: number;
    userHasLiked: boolean;
  };
  comments: {
    count: number;
    recent: PostComment[];
  };
  shares: {
    count: number;
    userHasShared: boolean;
  };
  poll?: {
    question: string;
    options: {
      id: string;
      text: string;
      votes: number;
    }[];
    endsAt: Date;
    allowMultiple: boolean;
  };
  author?: UserProfile;
  server?: CommunityServer;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  likes: {
    count: number;
    userHasLiked: boolean;
  };
  replies: PostComment[];
  author?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityEvent {
  id: string;
  serverId: string;
  creatorId: string;
  title: string;
  description: string;
  eventType: 'tournament' | 'community' | 'building' | 'pvp' | 'social' | 'educational';
  startTime: Date;
  endTime: Date;
  location: 'server' | 'discord' | 'external';
  maxParticipants?: number;
  registrationRequired: boolean;
  registrationDeadline?: Date;
  prizes: EventPrize[];
  requirements: {
    minLevel?: number;
    gameMode?: string;
    equipment?: string[];
  };
  rules: string;
  status: 'upcoming' | 'registration_open' | 'in_progress' | 'completed' | 'cancelled';
  participants: EventParticipant[];
  spectators: EventSpectator[];
  results?: EventResult[];
  creator?: UserProfile;
  server?: CommunityServer;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventPrize {
  position: number;
  reward: string;
  value: number;
  currency: 'credits' | 'items' | 'premium' | 'badge';
  description: string;
}

export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  status: 'registered' | 'confirmed' | 'participated' | 'withdrew';
  registeredAt: Date;
  team?: string;
  notes?: string;
  user?: UserProfile;
}

export interface EventSpectator {
  id: string;
  userId: string;
  eventId: string;
  joinedAt: Date;
  user?: UserProfile;
}

export interface EventResult {
  id: string;
  eventId: string;
  participantId: string;
  position: number;
  score?: number;
  time?: number;
  achievement?: string;
  prizeAwarded?: EventPrize;
  participant?: UserProfile;
}

export interface Tournament {
  id: string;
  name: string;
  eventId: string;
  gameMode: 'pvp' | 'building' | 'survival' | 'creative' | 'racing' | 'puzzle';
  format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxParticipants: number;
  entryFee?: number;
  prizes: EventPrize[];
  schedule: {
    registrationStart: Date;
    registrationEnd: Date;
    tournamentStart: Date;
    tournamentEnd: Date;
  };
  rules: string;
  brackets: TournamentBracket[];
  currentRound: number;
  totalRounds: number;
  status: 'upcoming' | 'registration' | 'in_progress' | 'completed' | 'cancelled';
  streamUrl?: string;
  chatChannelId?: string;
}

export interface TournamentBracket {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  participant1Id?: string;
  participant2Id?: string;
  winnerId?: string;
  score1?: number;
  score2?: number;
  scheduledTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'forfeited';
  participant1?: UserProfile;
  participant2?: UserProfile;
  winner?: UserProfile;
}

export interface SocialMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments: MessageAttachment[];
  status: 'sent' | 'delivered' | 'read';
  replyToId?: string;
  editedAt?: Date;
  sender?: UserProfile;
  recipient?: UserProfile;
  replyTo?: SocialMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: SocialMessage;
  unreadCount: number;
  participantProfiles?: UserProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialGroup {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private' | 'invite_only';
  category: 'gaming' | 'building' | 'pvp' | 'social' | 'educational' | 'trading';
  iconUrl?: string;
  bannerUrl?: string;
  ownerId: string;
  moderators: string[];
  members: GroupMember[];
  memberCount: number;
  maxMembers?: number;
  rules: string;
  tags: string[];
  isVerified: boolean;
  settings: {
    allowInvites: boolean;
    allowPosts: boolean;
    allowEvents: boolean;
    moderationLevel: 'open' | 'moderated' | 'restricted';
  };
  owner?: UserProfile;
  moderatorProfiles?: UserProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'owner' | 'moderator' | 'member';
  joinedAt: Date;
  invitedBy?: string;
  status: 'active' | 'muted' | 'banned';
  user?: UserProfile;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  activityType: 'post' | 'comment' | 'like' | 'friend' | 'achievement' | 'event' | 'server_join' | 'tournament_win';
  title: string;
  description: string;
  metadata: {
    postId?: string;
    eventId?: string;
    serverId?: string;
    achievementId?: string;
    friendId?: string;
  };
  visibility: 'public' | 'friends' | 'private';
  imageUrl?: string;
  user?: UserProfile;
  createdAt: Date;
}

export interface UserReputation {
  id: string;
  userId: string;
  serverId: string;
  reputationScore: number;
  positiveRatings: number;
  negativeRatings: number;
  categories: {
    helpfulness: number;
    friendliness: number;
    skillLevel: number;
    reliability: number;
    leadership: number;
  };
  recentFeedback: ReputationFeedback[];
  rank: string;
  percentile: number;
  lastUpdated: Date;
}

export interface ReputationFeedback {
  id: string;
  fromUserId: string;
  toUserId: string;
  serverId: string;
  rating: 'positive' | 'negative';
  category: 'helpfulness' | 'friendliness' | 'skillLevel' | 'reliability' | 'leadership';
  comment?: string;
  context?: string;
  fromUser?: UserProfile;
  createdAt: Date;
}

export interface CommunitySettings {
  serverId: string;
  features: {
    enableCommunityHub: boolean;
    enablePlayerProfiles: boolean;
    enableSocialFeed: boolean;
    enableEvents: boolean;
    enableTournaments: boolean;
    enableReputationSystem: boolean;
    enableContentSharing: boolean;
  };
  moderation: {
    autoModeration: boolean;
    moderationLevel: 'open' | 'moderated' | 'restricted';
    contentFiltering: boolean;
    spamProtection: boolean;
    reportingEnabled: boolean;
  };
  permissions: {
    whoCanPost: 'everyone' | 'members' | 'moderators' | 'admins';
    whoCanCreateEvents: 'everyone' | 'members' | 'moderators' | 'admins';
    whoCanInviteFriends: 'everyone' | 'members' | 'moderators' | 'admins';
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    accentColor: string;
    showServerBranding: boolean;
    customCss?: string;
  };
  notifications: {
    newPosts: boolean;
    newComments: boolean;
    newEvents: boolean;
    friendRequests: boolean;
    mentions: boolean;
    achievements: boolean;
  };
}