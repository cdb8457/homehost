const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;

/**
 * CommunityManager Service - Epic 2: Community Infrastructure
 * 
 * Integrates HomeHost's community features into the desktop application.
 * Handles community profiles, cross-server player management, social discovery,
 * analytics, and invitation systems.
 * 
 * Key Features:
 * - Community profile management and public pages
 * - Cross-server player database and reputation tracking
 * - Social discovery with friend activity and recommendations
 * - Community analytics and growth metrics
 * - Player invitation system with Discord integration
 * - Real-time sync with cloud API
 */
class CommunityManager extends EventEmitter {
  constructor(store, cloudSync) {
    super();
    this.store = store;
    this.cloudSync = cloudSync;
    this.communities = new Map();
    this.playerDatabase = new Map();
    this.socialActivity = [];
    this.analyticsCache = new Map();
    this.invitations = new Map();
    this.isInitialized = false;

    this.defaultCommunitySettings = {
      joinRequirement: 'Open', // 'Open', 'Application', 'InviteOnly'
      allowedGames: [],
      moderationLevel: 'Standard', // 'Relaxed', 'Standard', 'Strict'
      monetizationEnabled: false,
      crossServerBans: true,
      playerReputation: true,
      socialFeatures: true,
      publicProfile: true,
      analytics: true
    };

    this.playerReputationConfig = {
      defaultScore: 100,
      maxScore: 200,
      minScore: 0,
      actionWeights: {
        playerJoin: 1,
        playerLeave: 0,
        chatMessage: 0.1,
        adminAction: 5,
        bannedForToxicity: -50,
        helpfulBehavior: 10,
        communityContribution: 15
      }
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🏘️ Initializing CommunityManager...');

      // Load local community data
      await this.loadLocalCommunityData();

      // Load cross-server player database
      await this.loadPlayerDatabase();

      // Initialize social activity tracking
      this.initializeSocialTracking();

      // Set up cloud synchronization
      await this.setupCloudSync();

      // Start analytics collection
      this.startAnalyticsCollection();

      this.isInitialized = true;
      this.emit('community-manager-ready');
      
      console.log('✅ CommunityManager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize CommunityManager:', error);
      throw error;
    }
  }

  async loadLocalCommunityData() {
    try {
      const communitiesData = this.store.get('communities', {});
      
      for (const [communityId, communityData] of Object.entries(communitiesData)) {
        this.communities.set(communityId, {
          id: communityId,
          name: communityData.name || 'Unnamed Community',
          description: communityData.description || '',
          logo: communityData.logo,
          banner: communityData.banner,
          settings: { ...this.defaultCommunitySettings, ...communityData.settings },
          servers: communityData.servers || [],
          members: communityData.members || [],
          admins: communityData.admins || [],
          createdAt: new Date(communityData.createdAt || Date.now()),
          memberCount: communityData.memberCount || 0,
          isOwner: communityData.isOwner || false,
          socialProof: communityData.socialProof || {
            friendsInCommunity: 0,
            recentActivity: 0,
            rating: 0
          },
          analytics: communityData.analytics || {
            totalMembers: 0,
            activeMembers: 0,
            serverCount: 0,
            avgPlaytime: 0
          }
        });
      }

      console.log(`📊 Loaded ${this.communities.size} communities from local storage`);
    } catch (error) {
      console.error('❌ Failed to load local community data:', error);
    }
  }

  async loadPlayerDatabase() {
    try {
      const playerData = this.store.get('crossServerPlayers', {});
      
      for (const [playerId, playerInfo] of Object.entries(playerData)) {
        this.playerDatabase.set(playerId, {
          id: playerId,
          name: playerInfo.name || 'Unknown Player',
          steamId: playerInfo.steamId,
          discordId: playerInfo.discordId,
          reputation: playerInfo.reputation || this.playerReputationConfig.defaultScore,
          joinedAt: new Date(playerInfo.joinedAt || Date.now()),
          lastSeen: new Date(playerInfo.lastSeen || Date.now()),
          communities: playerInfo.communities || [],
          servers: playerInfo.servers || [],
          gameStats: playerInfo.gameStats || {},
          moderationHistory: playerInfo.moderationHistory || [],
          achievements: playerInfo.achievements || [],
          preferences: playerInfo.preferences || {
            games: [],
            playstyle: 'casual',
            region: 'north-america'
          }
        });
      }

      console.log(`👥 Loaded ${this.playerDatabase.size} players in cross-server database`);
    } catch (error) {
      console.error('❌ Failed to load player database:', error);
    }
  }

  initializeSocialTracking() {
    try {
      // Load recent social activity
      const recentActivity = this.store.get('socialActivity', []);
      this.socialActivity = recentActivity.slice(0, 100); // Keep last 100 activities

      // Set up activity monitoring
      this.on('player-joined', this.trackPlayerActivity.bind(this));
      this.on('player-left', this.trackPlayerActivity.bind(this));
      this.on('community-joined', this.trackCommunityActivity.bind(this));
      this.on('server-started', this.trackServerActivity.bind(this));

      console.log('📊 Social activity tracking initialized');
    } catch (error) {
      console.error('❌ Failed to initialize social tracking:', error);
    }
  }

  async setupCloudSync() {
    try {
      if (!this.cloudSync) {
        console.log('⚠️ CloudSync not available - community sync disabled');
        return;
      }

      // Set up bidirectional sync for community data
      this.cloudSync.on('community-updated', async (data) => {
        await this.handleCloudCommunityUpdate(data);
      });

      this.cloudSync.on('player-updated', async (data) => {
        await this.handleCloudPlayerUpdate(data);
      });

      // Sync local data to cloud
      await this.syncToCloud();

      console.log('☁️ Cloud synchronization configured');
    } catch (error) {
      console.error('❌ Failed to setup cloud sync:', error);
    }
  }

  startAnalyticsCollection() {
    try {
      // Collect analytics every 5 minutes
      this.analyticsInterval = setInterval(() => {
        this.collectCommunityAnalytics();
      }, 5 * 60 * 1000);

      // Initial analytics collection
      this.collectCommunityAnalytics();

      console.log('📈 Analytics collection started');
    } catch (error) {
      console.error('❌ Failed to start analytics collection:', error);
    }
  }

  // Community Profile Management
  async createCommunity(communityData) {
    try {
      const communityId = this.generateId();
      const community = {
        id: communityId,
        name: communityData.name,
        description: communityData.description || '',
        logo: communityData.logo,
        banner: communityData.banner,
        settings: { ...this.defaultCommunitySettings, ...communityData.settings },
        servers: [],
        members: [{ 
          userId: 'current-user', 
          role: 'Owner', 
          joinedAt: new Date().toISOString() 
        }],
        admins: ['current-user'],
        createdAt: new Date(),
        memberCount: 1,
        isOwner: true,
        socialProof: {
          friendsInCommunity: 0,
          recentActivity: 0,
          rating: 0
        },
        analytics: {
          totalMembers: 1,
          activeMembers: 1,
          serverCount: 0,
          avgPlaytime: 0
        }
      };

      this.communities.set(communityId, community);
      await this.saveCommunityData();

      // Sync to cloud
      if (this.cloudSync) {
        await this.cloudSync.syncCommunity(community);
      }

      this.emit('community-created', { communityId, community });
      console.log(`✅ Created community: ${community.name} (${communityId})`);

      return community;
    } catch (error) {
      console.error('❌ Failed to create community:', error);
      throw error;
    }
  }

  async updateCommunity(communityId, updateData) {
    try {
      const community = this.communities.get(communityId);
      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      if (!community.isOwner) {
        throw new Error('Insufficient permissions to update community');
      }

      // Update community data
      Object.assign(community, updateData);
      community.updatedAt = new Date();

      this.communities.set(communityId, community);
      await this.saveCommunityData();

      // Sync to cloud
      if (this.cloudSync) {
        await this.cloudSync.syncCommunity(community);
      }

      this.emit('community-updated', { communityId, community });
      console.log(`✅ Updated community: ${community.name}`);

      return community;
    } catch (error) {
      console.error('❌ Failed to update community:', error);
      throw error;
    }
  }

  // Server Association
  async addServerToCommunity(serverId, communityId, serverData) {
    try {
      const community = this.communities.get(communityId);
      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      const server = {
        id: serverId,
        name: serverData.name,
        gameType: serverData.gameType,
        addedAt: new Date().toISOString(),
        isActive: true
      };

      community.servers.push(server);
      community.analytics.serverCount = community.servers.length;
      
      this.communities.set(communityId, community);
      await this.saveCommunityData();

      // Update player tracking for this server
      this.trackServerActivity({
        type: 'server_added_to_community',
        serverId,
        serverName: serverData.name,
        communityId,
        communityName: community.name
      });

      this.emit('server-added-to-community', { serverId, communityId, server });
      console.log(`✅ Added server ${serverData.name} to community ${community.name}`);

      return community;
    } catch (error) {
      console.error('❌ Failed to add server to community:', error);
      throw error;
    }
  }

  // Cross-Server Player Management
  async addPlayerToCrossServerDatabase(playerData) {
    try {
      const playerId = playerData.id || this.generateId();
      const player = {
        id: playerId,
        name: playerData.name,
        steamId: playerData.steamId,
        discordId: playerData.discordId,
        reputation: this.playerReputationConfig.defaultScore,
        joinedAt: new Date(),
        lastSeen: new Date(),
        communities: [],
        servers: [],
        gameStats: {},
        moderationHistory: [],
        achievements: [],
        preferences: {
          games: playerData.preferredGames || [],
          playstyle: playerData.playstyle || 'casual',
          region: playerData.region || 'north-america'
        }
      };

      this.playerDatabase.set(playerId, player);
      await this.savePlayerDatabase();

      this.emit('player-added-to-database', { playerId, player });
      console.log(`✅ Added player ${player.name} to cross-server database`);

      return player;
    } catch (error) {
      console.error('❌ Failed to add player to database:', error);
      throw error;
    }
  }

  async updatePlayerReputation(playerId, action, value = null) {
    try {
      const player = this.playerDatabase.get(playerId);
      if (!player) {
        console.log(`⚠️ Player ${playerId} not found in database`);
        return null;
      }

      const weight = this.playerReputationConfig.actionWeights[action] || 0;
      const change = value !== null ? value : weight;
      
      player.reputation = Math.max(
        this.playerReputationConfig.minScore,
        Math.min(
          this.playerReputationConfig.maxScore,
          player.reputation + change
        )
      );

      player.moderationHistory.push({
        action,
        change,
        timestamp: new Date().toISOString(),
        newReputation: player.reputation
      });

      this.playerDatabase.set(playerId, player);
      await this.savePlayerDatabase();

      this.emit('player-reputation-updated', { playerId, player, action, change });
      console.log(`📈 Updated reputation for ${player.name}: ${player.reputation} (${change > 0 ? '+' : ''}${change})`);

      return player;
    } catch (error) {
      console.error('❌ Failed to update player reputation:', error);
      throw error;
    }
  }

  async banPlayerFromCommunity(playerId, communityId, reason, duration = null) {
    try {
      const community = this.communities.get(communityId);
      const player = this.playerDatabase.get(playerId);

      if (!community) throw new Error(`Community ${communityId} not found`);
      if (!player) throw new Error(`Player ${playerId} not found`);

      const ban = {
        playerId,
        playerName: player.name,
        communityId,
        communityName: community.name,
        reason,
        duration,
        bannedAt: new Date().toISOString(),
        isActive: true
      };

      // Add to player's moderation history
      player.moderationHistory.push({
        action: 'community_ban',
        communityId,
        reason,
        duration,
        timestamp: new Date().toISOString()
      });

      // Update reputation
      await this.updatePlayerReputation(playerId, 'bannedForToxicity');

      // Sync to cloud for cross-server enforcement
      if (this.cloudSync && community.settings.crossServerBans) {
        await this.cloudSync.syncPlayerBan(ban);
      }

      this.emit('player-banned', { playerId, communityId, ban });
      console.log(`🚫 Banned player ${player.name} from community ${community.name}: ${reason}`);

      return ban;
    } catch (error) {
      console.error('❌ Failed to ban player:', error);
      throw error;
    }
  }

  // Social Discovery Engine
  async getRecommendedCommunities(userPreferences = {}) {
    try {
      const recommendations = [];
      const userGames = userPreferences.games || [];
      const userPlaystyle = userPreferences.playstyle || 'casual';
      const userRegion = userPreferences.region || 'north-america';

      for (const [communityId, community] of this.communities) {
        if (!community.settings.publicProfile) continue;

        let score = 0;
        
        // Game compatibility
        if (userGames.length > 0) {
          const gameMatches = community.servers.filter(server => 
            userGames.includes(server.gameType)
          ).length;
          score += gameMatches * 30;
        }

        // Community size preference
        if (userPlaystyle === 'casual' && community.memberCount <= 100) score += 20;
        if (userPlaystyle === 'competitive' && community.memberCount > 100) score += 20;

        // Social proof
        score += community.socialProof.friendsInCommunity * 40;
        score += community.socialProof.rating * 10;

        // Activity level
        const activityRatio = community.analytics.activeMembers / community.analytics.totalMembers;
        score += activityRatio * 25;

        // Join ease
        if (community.settings.joinRequirement === 'Open') score += 15;

        recommendations.push({
          community,
          score,
          reasons: this.generateRecommendationReasons(community, userPreferences)
        });
      }

      // Sort by score and return top recommendations
      recommendations.sort((a, b) => b.score - a.score);
      
      console.log(`🎯 Generated ${recommendations.length} community recommendations`);
      return recommendations.slice(0, 10);
    } catch (error) {
      console.error('❌ Failed to get recommended communities:', error);
      return [];
    }
  }

  generateRecommendationReasons(community, userPreferences) {
    const reasons = [];
    
    if (community.socialProof.friendsInCommunity > 0) {
      reasons.push(`${community.socialProof.friendsInCommunity} friends are members`);
    }
    
    if (community.socialProof.rating >= 4.5) {
      reasons.push('Highly rated community');
    }
    
    if (community.settings.joinRequirement === 'Open') {
      reasons.push('Instant join available');
    }
    
    const activityRatio = community.analytics.activeMembers / community.analytics.totalMembers;
    if (activityRatio > 0.3) {
      reasons.push('Very active community');
    }
    
    return reasons;
  }

  // Analytics and Insights
  async collectCommunityAnalytics() {
    try {
      const timestamp = new Date().toISOString();
      
      for (const [communityId, community] of this.communities) {
        const analytics = {
          timestamp,
          communityId,
          memberCount: community.memberCount,
          activeMembers: this.calculateActiveMembers(community),
          serverCount: community.servers.length,
          avgPlaytime: this.calculateAveragePlaytime(community),
          newMembersToday: this.calculateNewMembersToday(community),
          retentionRate: this.calculateRetentionRate(community),
          engagement: this.calculateEngagementScore(community)
        };

        // Update community analytics
        community.analytics = {
          ...community.analytics,
          ...analytics,
          lastUpdated: timestamp
        };

        // Cache for dashboard
        this.analyticsCache.set(communityId, analytics);
      }

      await this.saveCommunityData();
      this.emit('analytics-updated', { timestamp, communities: this.communities.size });
      
    } catch (error) {
      console.error('❌ Failed to collect analytics:', error);
    }
  }

  calculateActiveMembers(community) {
    // Mock calculation - in real implementation, would check recent activity
    return Math.floor(community.memberCount * (0.2 + Math.random() * 0.3));
  }

  calculateAveragePlaytime(community) {
    // Mock calculation - in real implementation, would calculate from server logs
    return Math.floor(Math.random() * 240) + 60; // 60-300 minutes
  }

  calculateNewMembersToday(community) {
    // Mock calculation - in real implementation, would check join timestamps
    return Math.floor(Math.random() * 5);
  }

  calculateRetentionRate(community) {
    // Mock calculation - in real implementation, would analyze member retention
    return 0.6 + Math.random() * 0.3; // 60-90%
  }

  calculateEngagementScore(community) {
    const activeRatio = community.analytics.activeMembers / community.analytics.totalMembers;
    const serverUtilization = community.servers.length > 0 ? 0.8 : 0;
    return (activeRatio * 0.6 + serverUtilization * 0.4) * 100;
  }

  async getCommunityInsights(communityId) {
    try {
      const community = this.communities.get(communityId);
      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      const analytics = this.analyticsCache.get(communityId) || community.analytics;
      
      const insights = [
        {
          type: 'growth',
          title: 'Member Growth',
          value: analytics.newMembersToday || 0,
          trend: 'up',
          description: `New members joined today`,
          action: 'Keep promoting your community'
        },
        {
          type: 'engagement',
          title: 'Community Engagement',
          value: Math.round(analytics.engagement || 0),
          trend: analytics.engagement > 70 ? 'up' : 'down',
          description: `Engagement score out of 100`,
          action: analytics.engagement < 70 ? 'Consider hosting events' : 'Great engagement!'
        },
        {
          type: 'retention',
          title: 'Member Retention',
          value: Math.round((analytics.retentionRate || 0.7) * 100),
          trend: analytics.retentionRate > 0.75 ? 'up' : 'down',
          description: `Members staying active`,
          action: analytics.retentionRate < 0.75 ? 'Focus on new member experience' : 'Excellent retention'
        }
      ];

      return insights;
    } catch (error) {
      console.error('❌ Failed to get community insights:', error);
      return [];
    }
  }

  // Player Invitation System
  async createInvitation(communityId, invitationData) {
    try {
      const community = this.communities.get(communityId);
      if (!community) {
        throw new Error(`Community ${communityId} not found`);
      }

      const invitationId = this.generateId();
      const invitation = {
        id: invitationId,
        communityId,
        communityName: community.name,
        code: this.generateInviteCode(),
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        expiresAt: invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maxUses: invitationData.maxUses || null,
        currentUses: 0,
        isActive: true,
        shareableLink: null,
        discordIntegration: invitationData.discordIntegration || false
      };

      // Generate shareable link
      invitation.shareableLink = `https://homehost.gg/invite/${invitation.code}`;

      this.invitations.set(invitationId, invitation);
      await this.saveInvitationData();

      // Discord integration
      if (invitation.discordIntegration) {
        await this.createDiscordInvite(invitation);
      }

      this.emit('invitation-created', { invitationId, invitation });
      console.log(`✉️ Created invitation for ${community.name}: ${invitation.code}`);

      return invitation;
    } catch (error) {
      console.error('❌ Failed to create invitation:', error);
      throw error;
    }
  }

  async createDiscordInvite(invitation) {
    try {
      // Mock Discord integration - in real implementation, would use Discord API
      console.log(`🔗 Discord invite integration for: ${invitation.communityName}`);
      
      // This would create a Discord invite link and associate it with the HomeHost invitation
      invitation.discordInviteUrl = `https://discord.gg/mock-${invitation.code}`;
      
      return invitation;
    } catch (error) {
      console.error('❌ Failed to create Discord invite:', error);
    }
  }

  // Social Activity Tracking
  trackPlayerActivity(data) {
    const activity = {
      id: this.generateId(),
      type: data.type,
      playerId: data.playerId,
      playerName: data.playerName,
      serverId: data.serverId,
      serverName: data.serverName,
      communityId: data.communityId,
      timestamp: new Date().toISOString(),
      details: data.details || {}
    };

    this.socialActivity.unshift(activity);
    
    // Keep only recent activities
    if (this.socialActivity.length > 100) {
      this.socialActivity = this.socialActivity.slice(0, 100);
    }

    this.emit('social-activity', activity);
    this.store.set('socialActivity', this.socialActivity);
  }

  trackCommunityActivity(data) {
    this.trackPlayerActivity({
      type: 'community_joined',
      ...data
    });
  }

  trackServerActivity(data) {
    this.trackPlayerActivity({
      type: 'server_started',
      ...data
    });
  }

  // Data Management
  async saveCommunityData() {
    try {
      const communitiesData = {};
      for (const [id, community] of this.communities) {
        communitiesData[id] = community;
      }
      this.store.set('communities', communitiesData);
    } catch (error) {
      console.error('❌ Failed to save community data:', error);
    }
  }

  async savePlayerDatabase() {
    try {
      const playerData = {};
      for (const [id, player] of this.playerDatabase) {
        playerData[id] = player;
      }
      this.store.set('crossServerPlayers', playerData);
    } catch (error) {
      console.error('❌ Failed to save player database:', error);
    }
  }

  async saveInvitationData() {
    try {
      const invitationData = {};
      for (const [id, invitation] of this.invitations) {
        invitationData[id] = invitation;
      }
      this.store.set('invitations', invitationData);
    } catch (error) {
      console.error('❌ Failed to save invitation data:', error);
    }
  }

  // Cloud Synchronization
  async syncToCloud() {
    try {
      if (!this.cloudSync) return;

      console.log('☁️ Syncing community data to cloud...');

      for (const [communityId, community] of this.communities) {
        await this.cloudSync.syncCommunity(community);
      }

      for (const [playerId, player] of this.playerDatabase) {
        await this.cloudSync.syncPlayer(player);
      }

      console.log('✅ Community data synced to cloud');
    } catch (error) {
      console.error('❌ Failed to sync to cloud:', error);
    }
  }

  async handleCloudCommunityUpdate(data) {
    try {
      const { communityId, community } = data;
      this.communities.set(communityId, community);
      await this.saveCommunityData();
      
      this.emit('community-updated-from-cloud', { communityId, community });
    } catch (error) {
      console.error('❌ Failed to handle cloud community update:', error);
    }
  }

  async handleCloudPlayerUpdate(data) {
    try {
      const { playerId, player } = data;
      this.playerDatabase.set(playerId, player);
      await this.savePlayerDatabase();
      
      this.emit('player-updated-from-cloud', { playerId, player });
    } catch (error) {
      console.error('❌ Failed to handle cloud player update:', error);
    }
  }

  // Utility Methods
  generateId() {
    return 'cm_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Public API Methods
  getCommunities() {
    return Array.from(this.communities.values());
  }

  getCommunity(communityId) {
    return this.communities.get(communityId);
  }

  getPlayerDatabase() {
    return Array.from(this.playerDatabase.values());
  }

  getPlayer(playerId) {
    return this.playerDatabase.get(playerId);
  }

  getSocialActivity(limit = 20) {
    return this.socialActivity.slice(0, limit);
  }

  getInvitations() {
    return Array.from(this.invitations.values());
  }

  getAnalytics(communityId) {
    return this.analyticsCache.get(communityId);
  }

  async shutdown() {
    try {
      console.log('🛑 Shutting down CommunityManager...');
      
      if (this.analyticsInterval) {
        clearInterval(this.analyticsInterval);
      }

      await this.saveCommunityData();
      await this.savePlayerDatabase();
      await this.saveInvitationData();

      this.communities.clear();
      this.playerDatabase.clear();
      this.analyticsCache.clear();
      this.socialActivity = [];

      console.log('✅ CommunityManager shutdown complete');
    } catch (error) {
      console.error('❌ Error during CommunityManager shutdown:', error);
    }
  }
}

module.exports = CommunityManager;