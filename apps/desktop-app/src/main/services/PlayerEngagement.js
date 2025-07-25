const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * PlayerEngagement Service - Epic 4: Story 4.2: Player Engagement Monetization
 * 
 * Provides valuable perks and services to community members, generating revenue 
 * while improving the player experience through VIP memberships, cosmetic rewards,
 * event ticketing, and donation systems.
 * 
 * Key Features:
 * - VIP membership system with priority access and exclusive privileges
 * - Cosmetic rewards and visual customizations
 * - Community merchandise integration
 * - Event ticketing for tournaments and special events
 * - Tip and donation features for community support
 * - Flexible subscription management with automated billing
 */
class PlayerEngagement extends EventEmitter {
  constructor(store, revenueDashboard, communityManager) {
    super();
    this.store = store;
    this.revenueDashboard = revenueDashboard;
    this.communityManager = communityManager;
    
    this.vipMembers = new Map();
    this.cosmeticRewards = new Map();
    this.merchandise = new Map();
    this.events = new Map();
    this.donations = new Map();
    this.perks = new Map();
    this.isInitialized = false;

    // VIP membership tiers
    this.vipTiers = {
      bronze: {
        id: 'bronze',
        name: 'Bronze VIP',
        price: { monthly: 5, yearly: 50 },
        color: '#cd7f32',
        icon: '🥉',
        benefits: [
          'Priority queue access',
          'Bronze name color',
          'VIP chat badge',
          '10% merchandise discount'
        ],
        perks: {
          queuePriority: 1,
          reservedSlots: 1,
          merchandiseDiscount: 0.10,
          chatColor: '#cd7f32'
        }
      },
      silver: {
        id: 'silver',
        name: 'Silver VIP',
        price: { monthly: 10, yearly: 100 },
        color: '#c0c0c0',
        icon: '🥈',
        benefits: [
          'All Bronze benefits',
          'Access to VIP servers',
          'Silver name color',
          'Custom emotes (5)',
          '20% merchandise discount'
        ],
        perks: {
          queuePriority: 2,
          reservedSlots: 2,
          merchandiseDiscount: 0.20,
          chatColor: '#c0c0c0',
          customEmotes: 5,
          vipServers: true
        }
      },
      gold: {
        id: 'gold',
        name: 'Gold VIP',
        price: { monthly: 20, yearly: 200 },
        color: '#ffd700',
        icon: '🥇',
        benefits: [
          'All Silver benefits',
          'Exclusive Gold servers',
          'Gold name color',
          'Custom emotes (15)',
          'Profile customization',
          '30% merchandise discount',
          'VIP-only events access'
        ],
        perks: {
          queuePriority: 3,
          reservedSlots: 3,
          merchandiseDiscount: 0.30,
          chatColor: '#ffd700',
          customEmotes: 15,
          vipServers: true,
          exclusiveServers: true,
          profileCustomization: true,
          vipEvents: true
        }
      },
      diamond: {
        id: 'diamond',
        name: 'Diamond VIP',
        price: { monthly: 50, yearly: 500 },
        color: '#b9f2ff',
        icon: '💎',
        benefits: [
          'All Gold benefits',
          'Maximum priority access',
          'Diamond name color',
          'Unlimited custom emotes',
          'Custom profile themes',
          '50% merchandise discount',
          'Direct admin contact',
          'Beta feature access'
        ],
        perks: {
          queuePriority: 4,
          reservedSlots: 5,
          merchandiseDiscount: 0.50,
          chatColor: '#b9f2ff',
          customEmotes: 999,
          vipServers: true,
          exclusiveServers: true,
          profileCustomization: true,
          vipEvents: true,
          adminContact: true,
          betaAccess: true
        }
      }
    };

    // Cosmetic reward categories
    this.cosmeticCategories = {
      chatColors: {
        name: 'Chat Colors',
        icon: '🎨',
        items: [
          { id: 'rainbow', name: 'Rainbow Text', price: 5, rarity: 'rare' },
          { id: 'gradient', name: 'Gradient Text', price: 3, rarity: 'uncommon' },
          { id: 'glow', name: 'Glowing Text', price: 8, rarity: 'epic' }
        ]
      },
      profileBadges: {
        name: 'Profile Badges',
        icon: '🏆',
        items: [
          { id: 'founder', name: 'Founder Badge', price: 15, rarity: 'legendary' },
          { id: 'supporter', name: 'Community Supporter', price: 5, rarity: 'common' },
          { id: 'champion', name: 'Tournament Champion', price: 25, rarity: 'legendary' }
        ]
      },
      nameEffects: {
        name: 'Name Effects',
        icon: '✨',
        items: [
          { id: 'sparkle', name: 'Sparkle Effect', price: 10, rarity: 'rare' },
          { id: 'flame', name: 'Flame Effect', price: 12, rarity: 'epic' },
          { id: 'lightning', name: 'Lightning Effect', price: 20, rarity: 'legendary' }
        ]
      },
      emotes: {
        name: 'Custom Emotes',
        icon: '😀',
        items: [
          { id: 'pack-basic', name: 'Basic Emote Pack (5)', price: 3, rarity: 'common' },
          { id: 'pack-premium', name: 'Premium Emote Pack (10)', price: 8, rarity: 'rare' },
          { id: 'pack-ultimate', name: 'Ultimate Emote Pack (25)', price: 20, rarity: 'epic' }
        ]
      }
    };

    // Event types
    this.eventTypes = {
      tournament: {
        name: 'Tournament',
        icon: '🏆',
        basePrice: 5,
        maxParticipants: 64,
        features: ['Brackets', 'Prizes', 'Live streaming']
      },
      buildContest: {
        name: 'Build Contest',
        icon: '🏗️',
        basePrice: 3,
        maxParticipants: 100,
        features: ['Judging', 'Voting', 'Showcase']
      },
      raidNight: {
        name: 'Raid Night',
        icon: '⚔️',
        basePrice: 2,
        maxParticipants: 20,
        features: ['Coordination', 'Loot sharing', 'Strategy guides']
      },
      meetAndGreet: {
        name: 'Meet & Greet',
        icon: '🤝',
        basePrice: 10,
        maxParticipants: 25,
        features: ['Voice chat', 'Q&A session', 'Exclusive access']
      }
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🎮 Initializing PlayerEngagement...');

      // Load existing data
      await this.loadPlayerEngagementData();

      // Initialize cosmetic rewards
      await this.initializeCosmeticRewards();

      // Set up VIP membership tracking
      this.startVipMembershipTracking();

      // Initialize merchandise catalog
      await this.initializeMerchandise();

      // Set up event management
      this.initializeEventManagement();

      this.isInitialized = true;
      this.emit('player-engagement-ready');
      
      console.log('✅ PlayerEngagement initialized successfully');
      console.log(`👑 ${this.vipMembers.size} VIP members loaded`);
      console.log(`🎨 ${this.cosmeticRewards.size} cosmetic rewards available`);
      console.log(`🎫 ${this.events.size} events scheduled`);
    } catch (error) {
      console.error('❌ Failed to initialize PlayerEngagement:', error);
      throw error;
    }
  }

  async loadPlayerEngagementData() {
    try {
      // Load VIP members
      const vipData = this.store.get('vipMembers', {});
      for (const [memberId, member] of Object.entries(vipData)) {
        this.vipMembers.set(memberId, {
          id: memberId,
          userId: member.userId,
          tier: member.tier,
          status: member.status || 'active',
          startDate: new Date(member.startDate),
          endDate: new Date(member.endDate),
          autoRenew: member.autoRenew !== false,
          perks: member.perks || {},
          totalSpent: member.totalSpent || 0,
          benefits: member.benefits || []
        });
      }

      // Load cosmetic purchases
      const cosmeticData = this.store.get('cosmeticRewards', {});
      for (const [rewardId, reward] of Object.entries(cosmeticData)) {
        this.cosmeticRewards.set(rewardId, {
          id: rewardId,
          userId: reward.userId,
          itemId: reward.itemId,
          category: reward.category,
          purchaseDate: new Date(reward.purchaseDate),
          price: reward.price,
          isActive: reward.isActive !== false
        });
      }

      // Load events
      const eventData = this.store.get('playerEvents', {});
      for (const [eventId, event] of Object.entries(eventData)) {
        this.events.set(eventId, {
          id: eventId,
          name: event.name,
          type: event.type,
          description: event.description,
          startDate: new Date(event.startDate),
          endDate: new Date(event.endDate),
          price: event.price,
          maxParticipants: event.maxParticipants,
          participants: event.participants || [],
          status: event.status || 'upcoming',
          prizes: event.prizes || [],
          createdBy: event.createdBy
        });
      }

      // Load donations
      const donationData = this.store.get('playerDonations', {});
      for (const [donationId, donation] of Object.entries(donationData)) {
        this.donations.set(donationId, {
          id: donationId,
          userId: donation.userId,
          amount: donation.amount,
          message: donation.message,
          recipient: donation.recipient, // 'community' or specific admin
          date: new Date(donation.date),
          isAnonymous: donation.isAnonymous || false,
          perks: donation.perks || []
        });
      }

      console.log(`📊 Loaded engagement data: ${this.vipMembers.size} VIP, ${this.cosmeticRewards.size} cosmetics, ${this.events.size} events`);
    } catch (error) {
      console.error('❌ Failed to load player engagement data:', error);
    }
  }

  async initializeCosmeticRewards() {
    try {
      // Initialize cosmetic rewards catalog in revenue dashboard
      for (const [categoryId, category] of Object.entries(this.cosmeticCategories)) {
        for (const item of category.items) {
          // Create revenue stream for each cosmetic item if not exists
          const streamId = `cosmetic-${categoryId}-${item.id}`;
          const existingStreams = this.revenueDashboard.getRevenueStreams();
          
          if (!existingStreams.find(s => s.id === streamId)) {
            await this.revenueDashboard.createRevenueStream({
              name: `${item.name} (${category.name})`,
              category: 'merchandise',
              configuration: {
                price: item.price,
                rarity: item.rarity,
                category: categoryId,
                itemId: item.id
              }
            });
          }
        }
      }

      console.log('🎨 Cosmetic rewards catalog initialized');
    } catch (error) {
      console.error('❌ Failed to initialize cosmetic rewards:', error);
    }
  }

  startVipMembershipTracking() {
    try {
      // Check VIP memberships every hour for renewals and expirations
      this.vipTrackingInterval = setInterval(() => {
        this.processVipMembershipRenewals();
        this.checkVipMembershipExpirations();
      }, 60 * 60 * 1000);

      console.log('👑 VIP membership tracking started');
    } catch (error) {
      console.error('❌ Failed to start VIP tracking:', error);
    }
  }

  async initializeMerchandise() {
    try {
      // Create default merchandise categories
      const defaultMerchandise = [
        {
          id: 'community-hoodie',
          name: 'Community Hoodie',
          category: 'apparel',
          price: 35,
          description: 'Premium quality hoodie with community logo',
          images: ['/merchandise/hoodie-front.jpg', '/merchandise/hoodie-back.jpg'],
          variants: [
            { size: 'S', color: 'Black', stock: 50 },
            { size: 'M', color: 'Black', stock: 75 },
            { size: 'L', color: 'Black', stock: 60 },
            { size: 'XL', color: 'Black', stock: 40 }
          ]
        },
        {
          id: 'gaming-mousepad',
          name: 'Gaming Mousepad',
          category: 'accessories',
          price: 15,
          description: 'Large gaming mousepad with community artwork',
          images: ['/merchandise/mousepad.jpg'],
          variants: [
            { size: 'Large', color: 'Community Design', stock: 100 }
          ]
        },
        {
          id: 'sticker-pack',
          name: 'Sticker Pack',
          category: 'collectibles',
          price: 8,
          description: 'Pack of 10 premium vinyl stickers',
          images: ['/merchandise/stickers.jpg'],
          variants: [
            { size: 'Standard', color: 'Mixed', stock: 200 }
          ]
        }
      ];

      for (const item of defaultMerchandise) {
        this.merchandise.set(item.id, item);
        
        // Create revenue stream for merchandise
        const existingStreams = this.revenueDashboard.getRevenueStreams();
        if (!existingStreams.find(s => s.id === `merchandise-${item.id}`)) {
          await this.revenueDashboard.createRevenueStream({
            name: `${item.name} Sales`,
            category: 'merchandise',
            configuration: {
              price: item.price,
              itemId: item.id,
              category: item.category
            }
          });
        }
      }

      console.log(`🛍️ Merchandise catalog initialized with ${this.merchandise.size} items`);
    } catch (error) {
      console.error('❌ Failed to initialize merchandise:', error);
    }
  }

  initializeEventManagement() {
    try {
      // Set up event scheduling and management
      this.eventInterval = setInterval(() => {
        this.processUpcomingEvents();
        this.checkEventCompletions();
      }, 60 * 1000); // Check every minute

      console.log('🎫 Event management initialized');
    } catch (error) {
      console.error('❌ Failed to initialize event management:', error);
    }
  }

  // VIP Membership Management
  async purchaseVipMembership(userId, tier, duration = 'monthly', paymentMethod = 'stripe') {
    try {
      const vipTier = this.vipTiers[tier];
      if (!vipTier) {
        throw new Error(`Invalid VIP tier: ${tier}`);
      }

      const price = duration === 'yearly' ? vipTier.price.yearly : vipTier.price.monthly;
      const memberId = crypto.randomUUID();

      // Calculate membership period
      const startDate = new Date();
      const endDate = new Date(startDate);
      if (duration === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Process payment through revenue dashboard
      const transaction = await this.revenueDashboard.processTransaction({
        streamId: 'vip-membership',
        amount: price,
        currency: 'USD',
        category: 'vip',
        paymentProcessor: paymentMethod,
        metadata: {
          userId,
          tier,
          duration,
          memberId
        }
      });

      if (transaction.status !== 'completed') {
        throw new Error('Payment failed for VIP membership');
      }

      // Create VIP membership
      const membership = {
        id: memberId,
        userId,
        tier,
        status: 'active',
        startDate,
        endDate,
        duration,
        autoRenew: true,
        perks: vipTier.perks,
        totalSpent: price,
        benefits: vipTier.benefits,
        transactionId: transaction.id
      };

      this.vipMembers.set(memberId, membership);
      await this.savePlayerEngagementData();

      // Apply VIP perks
      await this.applyVipPerks(userId, vipTier.perks);

      this.emit('vip-membership-purchased', { membership, transaction });
      console.log(`👑 VIP membership purchased: ${vipTier.name} for user ${userId}`);

      return membership;
    } catch (error) {
      console.error('❌ Failed to purchase VIP membership:', error);
      throw error;
    }
  }

  async applyVipPerks(userId, perks) {
    try {
      // Apply queue priority
      if (perks.queuePriority) {
        await this.updatePlayerPriority(userId, perks.queuePriority);
      }

      // Reserve server slots
      if (perks.reservedSlots) {
        await this.reserveServerSlots(userId, perks.reservedSlots);
      }

      // Update chat permissions
      if (perks.chatColor) {
        await this.updateChatColor(userId, perks.chatColor);
      }

      // Grant access to VIP servers
      if (perks.vipServers) {
        await this.grantVipServerAccess(userId);
      }

      // Grant access to exclusive servers
      if (perks.exclusiveServers) {
        await this.grantExclusiveServerAccess(userId);
      }

      console.log(`✨ Applied VIP perks for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to apply VIP perks:', error);
    }
  }

  async updatePlayerPriority(userId, priority) {
    // Implementation would integrate with server queue systems
    console.log(`🚀 Set queue priority ${priority} for user ${userId}`);
  }

  async reserveServerSlots(userId, slots) {
    // Implementation would reserve slots in server configurations
    console.log(`🎟️ Reserved ${slots} server slots for user ${userId}`);
  }

  async updateChatColor(userId, color) {
    // Implementation would update player chat settings
    console.log(`🎨 Set chat color ${color} for user ${userId}`);
  }

  async grantVipServerAccess(userId) {
    // Implementation would add user to VIP server whitelists
    console.log(`🏆 Granted VIP server access for user ${userId}`);
  }

  async grantExclusiveServerAccess(userId) {
    // Implementation would add user to exclusive server access
    console.log(`💎 Granted exclusive server access for user ${userId}`);
  }

  // Cosmetic Rewards Management
  async purchaseCosmetic(userId, category, itemId, paymentMethod = 'stripe') {
    try {
      const categoryData = this.cosmeticCategories[category];
      if (!categoryData) {
        throw new Error(`Invalid cosmetic category: ${category}`);
      }

      const item = categoryData.items.find(i => i.id === itemId);
      if (!item) {
        throw new Error(`Invalid cosmetic item: ${itemId}`);
      }

      // Check if user already owns this cosmetic
      const existingReward = Array.from(this.cosmeticRewards.values())
        .find(r => r.userId === userId && r.itemId === itemId);
      
      if (existingReward) {
        throw new Error('User already owns this cosmetic item');
      }

      const rewardId = crypto.randomUUID();

      // Process payment
      const transaction = await this.revenueDashboard.processTransaction({
        streamId: `cosmetic-${category}-${itemId}`,
        amount: item.price,
        currency: 'USD',
        category: 'merchandise',
        paymentProcessor: paymentMethod,
        metadata: {
          userId,
          category,
          itemId,
          rewardId
        }
      });

      if (transaction.status !== 'completed') {
        throw new Error('Payment failed for cosmetic purchase');
      }

      // Create cosmetic reward
      const reward = {
        id: rewardId,
        userId,
        itemId,
        category,
        purchaseDate: new Date(),
        price: item.price,
        isActive: true,
        transactionId: transaction.id
      };

      this.cosmeticRewards.set(rewardId, reward);
      await this.savePlayerEngagementData();

      // Apply cosmetic to user
      await this.applyCosmeticReward(userId, category, item);

      this.emit('cosmetic-purchased', { reward, item, transaction });
      console.log(`🎨 Cosmetic purchased: ${item.name} for user ${userId}`);

      return reward;
    } catch (error) {
      console.error('❌ Failed to purchase cosmetic:', error);
      throw error;
    }
  }

  async applyCosmeticReward(userId, category, item) {
    try {
      switch (category) {
        case 'chatColors':
          await this.updateChatColor(userId, item.id);
          break;
        case 'profileBadges':
          await this.addProfileBadge(userId, item.id);
          break;
        case 'nameEffects':
          await this.addNameEffect(userId, item.id);
          break;
        case 'emotes':
          await this.addCustomEmotes(userId, item.id);
          break;
      }

      console.log(`✨ Applied cosmetic ${item.name} to user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to apply cosmetic reward:', error);
    }
  }

  async addProfileBadge(userId, badgeId) {
    console.log(`🏆 Added profile badge ${badgeId} for user ${userId}`);
  }

  async addNameEffect(userId, effectId) {
    console.log(`✨ Added name effect ${effectId} for user ${userId}`);
  }

  async addCustomEmotes(userId, emotePackId) {
    console.log(`😀 Added emote pack ${emotePackId} for user ${userId}`);
  }

  // Event Management
  async createEvent(eventData) {
    try {
      const eventId = crypto.randomUUID();
      const eventType = this.eventTypes[eventData.type];
      
      if (!eventType) {
        throw new Error(`Invalid event type: ${eventData.type}`);
      }

      const event = {
        id: eventId,
        name: eventData.name,
        type: eventData.type,
        description: eventData.description,
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        price: eventData.price || eventType.basePrice,
        maxParticipants: eventData.maxParticipants || eventType.maxParticipants,
        participants: [],
        status: 'upcoming',
        prizes: eventData.prizes || [],
        createdBy: eventData.createdBy,
        features: eventType.features
      };

      this.events.set(eventId, event);
      await this.savePlayerEngagementData();

      // Create revenue stream for event
      await this.revenueDashboard.createRevenueStream({
        name: `${event.name} Tickets`,
        category: 'events',
        configuration: {
          eventId,
          price: event.price,
          maxTickets: event.maxParticipants
        }
      });

      this.emit('event-created', { eventId, event });
      console.log(`🎫 Event created: ${event.name}`);

      return event;
    } catch (error) {
      console.error('❌ Failed to create event:', error);
      throw error;
    }
  }

  async purchaseEventTicket(userId, eventId, paymentMethod = 'stripe') {
    try {
      const event = this.events.get(eventId);
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      if (event.status !== 'upcoming') {
        throw new Error('Event is not available for ticket purchase');
      }

      if (event.participants.length >= event.maxParticipants) {
        throw new Error('Event is sold out');
      }

      if (event.participants.some(p => p.userId === userId)) {
        throw new Error('User already has a ticket for this event');
      }

      const ticketId = crypto.randomUUID();

      // Process payment
      const transaction = await this.revenueDashboard.processTransaction({
        streamId: `event-${eventId}`,
        amount: event.price,
        currency: 'USD',
        category: 'events',
        paymentProcessor: paymentMethod,
        metadata: {
          userId,
          eventId,
          ticketId
        }
      });

      if (transaction.status !== 'completed') {
        throw new Error('Payment failed for event ticket');
      }

      // Add participant
      const participant = {
        userId,
        ticketId,
        purchaseDate: new Date(),
        transactionId: transaction.id
      };

      event.participants.push(participant);
      this.events.set(eventId, event);
      await this.savePlayerEngagementData();

      this.emit('event-ticket-purchased', { event, participant, transaction });
      console.log(`🎫 Event ticket purchased: ${event.name} for user ${userId}`);

      return { ticket: participant, event };
    } catch (error) {
      console.error('❌ Failed to purchase event ticket:', error);
      throw error;
    }
  }

  // Donation Management
  async processDonation(donationData) {
    try {
      const donationId = crypto.randomUUID();

      // Process payment
      const transaction = await this.revenueDashboard.processTransaction({
        streamId: 'general-donations',
        amount: donationData.amount,
        currency: 'USD',
        category: 'donations',
        paymentProcessor: donationData.paymentMethod || 'stripe',
        metadata: {
          userId: donationData.userId,
          donationId,
          recipient: donationData.recipient,
          message: donationData.message,
          isAnonymous: donationData.isAnonymous
        }
      });

      if (transaction.status !== 'completed') {
        throw new Error('Payment failed for donation');
      }

      // Create donation record
      const donation = {
        id: donationId,
        userId: donationData.userId,
        amount: donationData.amount,
        message: donationData.message || '',
        recipient: donationData.recipient || 'community',
        date: new Date(),
        isAnonymous: donationData.isAnonymous || false,
        perks: this.calculateDonationPerks(donationData.amount),
        transactionId: transaction.id
      };

      this.donations.set(donationId, donation);
      await this.savePlayerEngagementData();

      // Apply donation perks
      if (donation.perks.length > 0) {
        await this.applyDonationPerks(donationData.userId, donation.perks);
      }

      this.emit('donation-processed', { donation, transaction });
      console.log(`💝 Donation processed: $${donationData.amount} from user ${donationData.userId}`);

      return donation;
    } catch (error) {
      console.error('❌ Failed to process donation:', error);
      throw error;
    }
  }

  calculateDonationPerks(amount) {
    const perks = [];

    if (amount >= 10) {
      perks.push({ type: 'supporter_badge', duration: '30d' });
    }

    if (amount >= 25) {
      perks.push({ type: 'chat_color', value: '#34a853', duration: '30d' });
    }

    if (amount >= 50) {
      perks.push({ type: 'vip_trial', duration: '7d' });
    }

    if (amount >= 100) {
      perks.push({ type: 'custom_title', duration: '60d' });
    }

    return perks;
  }

  async applyDonationPerks(userId, perks) {
    try {
      for (const perk of perks) {
        switch (perk.type) {
          case 'supporter_badge':
            await this.addProfileBadge(userId, 'supporter');
            break;
          case 'chat_color':
            await this.updateChatColor(userId, perk.value);
            break;
          case 'vip_trial':
            await this.grantVipTrial(userId, perk.duration);
            break;
          case 'custom_title':
            await this.grantCustomTitle(userId, perk.duration);
            break;
        }
      }

      console.log(`🎁 Applied donation perks for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to apply donation perks:', error);
    }
  }

  async grantVipTrial(userId, duration) {
    console.log(`⏰ Granted ${duration} VIP trial for user ${userId}`);
  }

  async grantCustomTitle(userId, duration) {
    console.log(`🎖️ Granted custom title for ${duration} for user ${userId}`);
  }

  // VIP Membership Processing
  async processVipMembershipRenewals() {
    try {
      const now = new Date();
      let renewalCount = 0;

      for (const [memberId, membership] of this.vipMembers) {
        if (membership.status === 'active' && membership.autoRenew) {
          // Check if renewal is due (within 24 hours)
          const renewalDate = new Date(membership.endDate);
          renewalDate.setDate(renewalDate.getDate() - 1); // 24 hours before expiry

          if (now >= renewalDate && now < membership.endDate) {
            await this.renewVipMembership(memberId);
            renewalCount++;
          }
        }
      }

      if (renewalCount > 0) {
        console.log(`🔄 Processed ${renewalCount} VIP membership renewals`);
      }
    } catch (error) {
      console.error('❌ Failed to process VIP renewals:', error);
    }
  }

  async renewVipMembership(memberId) {
    try {
      const membership = this.vipMembers.get(memberId);
      if (!membership) return;

      const vipTier = this.vipTiers[membership.tier];
      const price = membership.duration === 'yearly' ? vipTier.price.yearly : vipTier.price.monthly;

      // Process renewal payment
      const transaction = await this.revenueDashboard.processTransaction({
        streamId: 'vip-membership',
        amount: price,
        currency: 'USD',
        category: 'vip',
        paymentProcessor: 'stripe', // Default processor for renewals
        metadata: {
          userId: membership.userId,
          memberId,
          isRenewal: true
        }
      });

      if (transaction.status === 'completed') {
        // Extend membership
        const newEndDate = new Date(membership.endDate);
        if (membership.duration === 'yearly') {
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        } else {
          newEndDate.setMonth(newEndDate.getMonth() + 1);
        }

        membership.endDate = newEndDate;
        membership.totalSpent += price;
        this.vipMembers.set(memberId, membership);

        this.emit('vip-membership-renewed', { membership, transaction });
        console.log(`🔄 VIP membership renewed for user ${membership.userId}`);
      } else {
        console.log(`⚠️ VIP renewal failed for user ${membership.userId}`);
        // Could send notification about failed renewal
      }
    } catch (error) {
      console.error('❌ Failed to renew VIP membership:', error);
    }
  }

  async checkVipMembershipExpirations() {
    try {
      const now = new Date();
      let expiredCount = 0;

      for (const [memberId, membership] of this.vipMembers) {
        if (membership.status === 'active' && now > membership.endDate) {
          await this.expireVipMembership(memberId);
          expiredCount++;
        }
      }

      if (expiredCount > 0) {
        console.log(`⏰ Expired ${expiredCount} VIP memberships`);
      }
    } catch (error) {
      console.error('❌ Failed to check VIP expirations:', error);
    }
  }

  async expireVipMembership(memberId) {
    try {
      const membership = this.vipMembers.get(memberId);
      if (!membership) return;

      // Update membership status
      membership.status = 'expired';
      this.vipMembers.set(memberId, membership);

      // Remove VIP perks
      await this.removeVipPerks(membership.userId);

      this.emit('vip-membership-expired', { membership });
      console.log(`⏰ VIP membership expired for user ${membership.userId}`);
    } catch (error) {
      console.error('❌ Failed to expire VIP membership:', error);
    }
  }

  async removeVipPerks(userId) {
    try {
      // Reset to default privileges
      await this.updatePlayerPriority(userId, 0);
      await this.updateChatColor(userId, '#ffffff');
      // Additional perk removal logic...

      console.log(`🔒 Removed VIP perks for user ${userId}`);
    } catch (error) {
      console.error('❌ Failed to remove VIP perks:', error);
    }
  }

  // Event Processing
  async processUpcomingEvents() {
    try {
      const now = new Date();

      for (const [eventId, event] of this.events) {
        if (event.status === 'upcoming' && now >= event.startDate) {
          await this.startEvent(eventId);
        }
      }
    } catch (error) {
      console.error('❌ Failed to process upcoming events:', error);
    }
  }

  async checkEventCompletions() {
    try {
      const now = new Date();

      for (const [eventId, event] of this.events) {
        if (event.status === 'active' && now >= event.endDate) {
          await this.completeEvent(eventId);
        }
      }
    } catch (error) {
      console.error('❌ Failed to check event completions:', error);
    }
  }

  async startEvent(eventId) {
    try {
      const event = this.events.get(eventId);
      if (!event) return;

      event.status = 'active';
      this.events.set(eventId, event);

      this.emit('event-started', { eventId, event });
      console.log(`🎬 Event started: ${event.name}`);
    } catch (error) {
      console.error('❌ Failed to start event:', error);
    }
  }

  async completeEvent(eventId) {
    try {
      const event = this.events.get(eventId);
      if (!event) return;

      event.status = 'completed';
      this.events.set(eventId, event);

      // Distribute prizes if any
      if (event.prizes.length > 0) {
        await this.distributePrizes(eventId);
      }

      this.emit('event-completed', { eventId, event });
      console.log(`🏁 Event completed: ${event.name}`);
    } catch (error) {
      console.error('❌ Failed to complete event:', error);
    }
  }

  async distributePrizes(eventId) {
    // Implementation would handle prize distribution logic
    console.log(`🏆 Distributing prizes for event ${eventId}`);
  }

  // Data retrieval methods
  getVipMembers() {
    return Array.from(this.vipMembers.values());
  }

  getUserVipMembership(userId) {
    return Array.from(this.vipMembers.values()).find(m => m.userId === userId && m.status === 'active');
  }

  getCosmeticRewards() {
    return Array.from(this.cosmeticRewards.values());
  }

  getUserCosmetics(userId) {
    return Array.from(this.cosmeticRewards.values()).filter(r => r.userId === userId && r.isActive);
  }

  getEvents() {
    return Array.from(this.events.values());
  }

  getUpcomingEvents() {
    return Array.from(this.events.values()).filter(e => e.status === 'upcoming');
  }

  getDonations() {
    return Array.from(this.donations.values());
  }

  getMerchandise() {
    return Array.from(this.merchandise.values());
  }

  getVipTiers() {
    return this.vipTiers;
  }

  getCosmeticCategories() {
    return this.cosmeticCategories;
  }

  getEventTypes() {
    return this.eventTypes;
  }

  // Data persistence
  async savePlayerEngagementData() {
    try {
      // Save VIP members
      const vipData = {};
      for (const [id, member] of this.vipMembers) {
        vipData[id] = {
          ...member,
          startDate: member.startDate.toISOString(),
          endDate: member.endDate.toISOString()
        };
      }
      this.store.set('vipMembers', vipData);

      // Save cosmetic rewards
      const cosmeticData = {};
      for (const [id, reward] of this.cosmeticRewards) {
        cosmeticData[id] = {
          ...reward,
          purchaseDate: reward.purchaseDate.toISOString()
        };
      }
      this.store.set('cosmeticRewards', cosmeticData);

      // Save events
      const eventData = {};
      for (const [id, event] of this.events) {
        eventData[id] = {
          ...event,
          startDate: event.startDate.toISOString(),
          endDate: event.endDate.toISOString()
        };
      }
      this.store.set('playerEvents', eventData);

      // Save donations
      const donationData = {};
      for (const [id, donation] of this.donations) {
        donationData[id] = {
          ...donation,
          date: donation.date.toISOString()
        };
      }
      this.store.set('playerDonations', donationData);
    } catch (error) {
      console.error('❌ Failed to save player engagement data:', error);
    }
  }

  async shutdown() {
    try {
      console.log('🛑 Shutting down PlayerEngagement...');
      
      // Clear intervals
      if (this.vipTrackingInterval) clearInterval(this.vipTrackingInterval);
      if (this.eventInterval) clearInterval(this.eventInterval);

      // Save final state
      await this.savePlayerEngagementData();

      // Clear collections
      this.vipMembers.clear();
      this.cosmeticRewards.clear();
      this.merchandise.clear();
      this.events.clear();
      this.donations.clear();
      this.perks.clear();

      console.log('✅ PlayerEngagement shutdown complete');
    } catch (error) {
      console.error('❌ Error during PlayerEngagement shutdown:', error);
    }
  }
}

module.exports = PlayerEngagement;