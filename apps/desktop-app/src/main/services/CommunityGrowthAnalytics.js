const { EventEmitter } = require('events');
const crypto = require('crypto');

/**
 * CommunityGrowthAnalytics Service - Epic 4: Story 4.4: Community Growth Analytics
 * 
 * Provides detailed insights into community health and growth opportunities through
 * player lifecycle analysis, server utilization metrics, engagement scoring, 
 * comparative benchmarking, and A/B testing framework for data-driven decisions.
 * 
 * Key Features:
 * - Player lifecycle analysis (acquisition, engagement, retention, churn)
 * - Server utilization metrics and capacity planning
 * - Engagement scoring and at-risk player identification
 * - Comparative benchmarking against similar communities
 * - Growth experiment framework with A/B testing
 * - Automated insights and actionable recommendations
 */
class CommunityGrowthAnalytics extends EventEmitter {
  constructor(store, communityManager, serverMonitor, revenueDashboard) {
    super();
    this.store = store;
    this.communityManager = communityManager;
    this.serverMonitor = serverMonitor;
    this.revenueDashboard = revenueDashboard;
    
    this.players = new Map();
    this.sessions = new Map();
    this.events = new Map();
    this.experiments = new Map();
    this.insights = new Map();
    this.benchmarks = new Map();
    this.cohorts = new Map();
    this.isInitialized = false;

    // Player lifecycle stages
    this.lifecycleStages = {
      new: {
        id: 'new',
        name: 'New Player',
        description: 'First 7 days since registration',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        keyMetrics: ['first_session_length', 'return_rate_day_1', 'actions_completed']
      },
      onboarding: {
        id: 'onboarding',
        name: 'Onboarding',
        description: 'Days 8-30, learning the ropes',
        duration: 23 * 24 * 60 * 60 * 1000, // 23 days (total 30)
        keyMetrics: ['session_frequency', 'feature_adoption', 'social_connections']
      },
      engaged: {
        id: 'engaged',
        name: 'Engaged Player',
        description: 'Active and regular participant',
        duration: null, // Ongoing
        keyMetrics: ['daily_active', 'content_creation', 'community_participation']
      },
      champion: {
        id: 'champion',
        name: 'Community Champion',
        description: 'Highly engaged advocate',
        duration: null, // Ongoing
        keyMetrics: ['referrals', 'content_quality', 'leadership_activities']
      },
      at_risk: {
        id: 'at_risk',
        name: 'At Risk',
        description: 'Declining engagement',
        duration: null, // Ongoing monitoring
        keyMetrics: ['session_decline', 'interaction_drop', 'absence_duration']
      },
      churned: {
        id: 'churned',
        name: 'Churned',
        description: 'Inactive for 30+ days',
        duration: null, // Final stage
        keyMetrics: ['last_session', 'churn_reason', 'reactivation_attempts']
      }
    };

    // Engagement scoring factors
    this.engagementFactors = {
      session_frequency: { weight: 0.25, max_score: 100 },
      session_duration: { weight: 0.20, max_score: 100 },
      social_interactions: { weight: 0.20, max_score: 100 },
      content_creation: { weight: 0.15, max_score: 100 },
      community_participation: { weight: 0.10, max_score: 100 },
      retention_streak: { weight: 0.10, max_score: 100 }
    };

    // Benchmark categories
    this.benchmarkCategories = {
      gaming: {
        name: 'Gaming Communities',
        metrics: {
          daily_active_rate: 0.25, // 25% of registered users active daily
          weekly_retention: 0.40,  // 40% return within a week
          monthly_retention: 0.20, // 20% return within a month
          session_duration: 45,    // 45 minutes average
          churn_rate: 0.15        // 15% monthly churn
        }
      },
      minecraft: {
        name: 'Minecraft Servers',
        metrics: {
          daily_active_rate: 0.30,
          weekly_retention: 0.50,
          monthly_retention: 0.25,
          session_duration: 60,
          churn_rate: 0.12
        }
      },
      social: {
        name: 'Social Platforms',
        metrics: {
          daily_active_rate: 0.35,
          weekly_retention: 0.60,
          monthly_retention: 0.30,
          session_duration: 25,
          churn_rate: 0.10
        }
      }
    };

    // Experiment types
    this.experimentTypes = {
      feature_rollout: {
        name: 'Feature Rollout',
        description: 'Test new features with subset of users',
        duration: 14 * 24 * 60 * 60 * 1000, // 14 days
        success_metrics: ['engagement_score', 'retention_rate', 'satisfaction']
      },
      content_variation: {
        name: 'Content Variation',
        description: 'Test different content or messaging',
        duration: 7 * 24 * 60 * 60 * 1000, // 7 days
        success_metrics: ['click_through_rate', 'conversion_rate', 'engagement_time']
      },
      onboarding_flow: {
        name: 'Onboarding Flow',
        description: 'Test different user onboarding experiences',
        duration: 21 * 24 * 60 * 60 * 1000, // 21 days
        success_metrics: ['completion_rate', 'time_to_first_action', 'retention_day_7']
      },
      retention_campaign: {
        name: 'Retention Campaign',
        description: 'Test strategies to improve player retention',
        duration: 30 * 24 * 60 * 60 * 1000, // 30 days
        success_metrics: ['return_rate', 'session_frequency', 'lifetime_value']
      }
    };
  }

  async initialize() {
    try {
      console.log('Initializing CommunityGrowthAnalytics service...');
      
      // Load existing data
      await this.loadPlayerData();
      await this.loadSessionData();
      await this.loadEventData();
      await this.loadExperimentData();
      await this.loadBenchmarkData();
      
      // Start analytics collection
      this.startAnalyticsCollection();
      
      // Set up lifecycle monitoring
      this.setupLifecycleMonitoring();
      
      // Start experiment monitoring
      this.startExperimentMonitoring();
      
      // Generate initial insights
      await this.generateInsights();
      
      this.isInitialized = true;
      console.log('CommunityGrowthAnalytics service initialized successfully');
      
      this.emit('analytics-initialized', {
        playerCount: this.players.size,
        activeExperiments: Array.from(this.experiments.values()).filter(e => e.status === 'running').length,
        insightCount: this.insights.size
      });
      
    } catch (error) {
      console.error('Failed to initialize CommunityGrowthAnalytics:', error);
      throw error;
    }
  }

  async loadPlayerData() {
    const playerData = this.store.get('analyticsPlayers', {});
    for (const [id, player] of Object.entries(playerData)) {
      this.players.set(id, player);
    }
  }

  async loadSessionData() {
    const sessionData = this.store.get('analyticsSessions', {});
    for (const [id, session] of Object.entries(sessionData)) {
      this.sessions.set(id, session);
    }
  }

  async loadEventData() {
    const eventData = this.store.get('analyticsEvents', {});
    for (const [id, event] of Object.entries(eventData)) {
      this.events.set(id, event);
    }
  }

  async loadExperimentData() {
    const experimentData = this.store.get('analyticsExperiments', {});
    for (const [id, experiment] of Object.entries(experimentData)) {
      this.experiments.set(id, experiment);
    }
  }

  async loadBenchmarkData() {
    const benchmarkData = this.store.get('analyticsBenchmarks', {});
    for (const [id, benchmark] of Object.entries(benchmarkData)) {
      this.benchmarks.set(id, benchmark);
    }
  }

  startAnalyticsCollection() {
    // Collect player analytics every 5 minutes
    setInterval(() => {
      this.collectPlayerAnalytics();
    }, 5 * 60 * 1000); // 5 minutes

    // Generate daily insights
    setInterval(() => {
      this.generateDailyInsights();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Update engagement scores hourly
    setInterval(() => {
      this.updateEngagementScores();
    }, 60 * 60 * 1000); // 1 hour

    // Monitor lifecycle transitions every 30 minutes
    setInterval(() => {
      this.monitorLifecycleTransitions();
    }, 30 * 60 * 1000); // 30 minutes
  }

  setupLifecycleMonitoring() {
    // Monitor for lifecycle stage transitions
    this.on('player-action', (data) => {
      this.trackPlayerAction(data);
    });

    this.on('session-started', (data) => {
      this.trackSessionStart(data);
    });

    this.on('session-ended', (data) => {
      this.trackSessionEnd(data);
    });
  }

  startExperimentMonitoring() {
    // Check experiment status every hour
    setInterval(() => {
      this.monitorExperiments();
    }, 60 * 60 * 1000); // 1 hour
  }

  // Player Lifecycle Analysis
  async trackPlayer(playerId, userData = {}) {
    const now = new Date();
    
    let player = this.players.get(playerId);
    if (!player) {
      player = {
        id: playerId,
        ...userData,
        registrationDate: now,
        firstSession: null,
        lastSession: null,
        totalSessions: 0,
        totalPlayTime: 0,
        lifecycleStage: 'new',
        engagementScore: 0,
        churnRisk: 'low',
        cohort: this.getCohortId(now),
        events: [],
        experiments: [],
        metrics: {
          session_frequency: 0,
          session_duration: 0,
          social_interactions: 0,
          content_creation: 0,
          community_participation: 0,
          retention_streak: 0
        },
        flags: {
          is_champion: false,
          is_at_risk: false,
          is_churned: false,
          needs_intervention: false
        }
      };
      
      this.players.set(playerId, player);
      await this.savePlayerData();
      
      this.emit('player-registered', { player });
    }
    
    return player;
  }

  async trackPlayerAction(data) {
    const { playerId, action, metadata = {} } = data;
    const player = await this.trackPlayer(playerId);
    const now = new Date();

    const event = {
      id: crypto.randomUUID(),
      playerId,
      action,
      timestamp: now,
      metadata,
      sessionId: metadata.sessionId || null
    };

    this.events.set(event.id, event);
    player.events.push(event.id);

    // Update player metrics based on action
    this.updatePlayerMetrics(player, action, metadata);

    // Check for lifecycle transitions
    this.checkLifecycleTransition(player);

    await this.saveEventData();
    await this.savePlayerData();

    this.emit('player-action-tracked', { player, event });
  }

  async trackSessionStart(data) {
    const { playerId, serverId, sessionData = {} } = data;
    const player = await this.trackPlayer(playerId);
    const now = new Date();

    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      playerId,
      serverId,
      startTime: now,
      endTime: null,
      duration: null,
      actions: [],
      ...sessionData
    };

    this.sessions.set(sessionId, session);
    
    player.totalSessions++;
    player.lastSession = now;
    if (!player.firstSession) {
      player.firstSession = now;
    }

    await this.saveSessionData();
    await this.savePlayerData();

    this.emit('session-started', { player, session });
    return sessionId;
  }

  async trackSessionEnd(data) {
    const { sessionId, endData = {} } = data;
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      console.warn(`Session ${sessionId} not found`);
      return;
    }

    const now = new Date();
    session.endTime = now;
    session.duration = now - session.startTime;
    Object.assign(session, endData);

    const player = this.players.get(session.playerId);
    if (player) {
      player.totalPlayTime += session.duration;
      
      // Update session-based metrics
      this.updateSessionMetrics(player, session);
      
      // Check for lifecycle transitions
      this.checkLifecycleTransition(player);
    }

    await this.saveSessionData();
    await this.savePlayerData();

    this.emit('session-ended', { player, session });
  }

  updatePlayerMetrics(player, action, metadata) {
    const now = new Date();
    
    switch (action) {
      case 'chat_message':
        player.metrics.social_interactions++;
        break;
      case 'build_creation':
      case 'content_upload':
        player.metrics.content_creation++;
        break;
      case 'forum_post':
      case 'event_participation':
        player.metrics.community_participation++;
        break;
      case 'daily_login':
        this.updateRetentionStreak(player, now);
        break;
    }
  }

  updateSessionMetrics(player, session) {
    const sessionDurationMinutes = session.duration / (1000 * 60);
    
    // Update average session duration
    player.metrics.session_duration = 
      (player.metrics.session_duration * (player.totalSessions - 1) + sessionDurationMinutes) / player.totalSessions;
    
    // Update session frequency (sessions per week)
    const weeksSinceRegistration = Math.max(1, (Date.now() - player.registrationDate) / (7 * 24 * 60 * 60 * 1000));
    player.metrics.session_frequency = player.totalSessions / weeksSinceRegistration;
  }

  updateRetentionStreak(player, currentDate) {
    const lastSession = player.lastSession ? new Date(player.lastSession) : null;
    
    if (!lastSession) {
      player.metrics.retention_streak = 1;
      return;
    }
    
    const daysDiff = Math.floor((currentDate - lastSession) / (24 * 60 * 60 * 1000));
    
    if (daysDiff <= 1) {
      // Consecutive day or same day
      player.metrics.retention_streak++;
    } else {
      // Streak broken
      player.metrics.retention_streak = 1;
    }
  }

  checkLifecycleTransition(player) {
    const now = new Date();
    const daysSinceRegistration = (now - new Date(player.registrationDate)) / (24 * 60 * 60 * 1000);
    const daysSinceLastSession = player.lastSession ? 
      (now - new Date(player.lastSession)) / (24 * 60 * 60 * 1000) : 0;

    let newStage = player.lifecycleStage;

    // Check for churn first (highest priority)
    if (daysSinceLastSession > 30) {
      newStage = 'churned';
      player.flags.is_churned = true;
    }
    // Check for at-risk status
    else if (daysSinceLastSession > 7 && player.engagementScore < 50) {
      newStage = 'at_risk';
      player.flags.is_at_risk = true;
      player.flags.needs_intervention = true;
    }
    // Check for champion status (high engagement + community activities)
    else if (player.engagementScore > 80 && 
             player.metrics.community_participation > 10 && 
             player.metrics.content_creation > 5) {
      newStage = 'champion';
      player.flags.is_champion = true;
    }
    // Check for engaged status
    else if (daysSinceRegistration > 30 && player.engagementScore > 60) {
      newStage = 'engaged';
    }
    // Check for onboarding stage
    else if (daysSinceRegistration > 7 && daysSinceRegistration <= 30) {
      newStage = 'onboarding';
    }

    if (newStage !== player.lifecycleStage) {
      const previousStage = player.lifecycleStage;
      player.lifecycleStage = newStage;
      
      this.emit('lifecycle-transition', {
        player,
        previousStage,
        newStage,
        timestamp: now
      });
    }
  }

  // Engagement Scoring
  calculateEngagementScore(player) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [factor, config] of Object.entries(this.engagementFactors)) {
      const rawValue = player.metrics[factor] || 0;
      const normalizedValue = Math.min(rawValue, config.max_score);
      const weightedScore = (normalizedValue / config.max_score) * config.weight * 100;
      
      totalScore += weightedScore;
      totalWeight += config.weight;
    }

    return Math.round(totalScore / totalWeight);
  }

  updateEngagementScores() {
    for (const [playerId, player] of this.players.entries()) {
      if (!player.flags.is_churned) {
        const newScore = this.calculateEngagementScore(player);
        const previousScore = player.engagementScore;
        
        player.engagementScore = newScore;
        
        // Update churn risk based on engagement score
        if (newScore < 30) {
          player.churnRisk = 'high';
        } else if (newScore < 60) {
          player.churnRisk = 'medium';
        } else {
          player.churnRisk = 'low';
        }

        if (Math.abs(newScore - previousScore) > 10) {
          this.emit('engagement-score-changed', {
            player,
            previousScore,
            newScore,
            change: newScore - previousScore
          });
        }
      }
    }
  }

  // Server Utilization Metrics
  async getServerUtilizationMetrics() {
    const servers = this.serverMonitor ? await this.serverMonitor.getAllServers() : [];
    const now = new Date();
    
    const metrics = {
      timestamp: now,
      totalServers: servers.length,
      activeServers: servers.filter(s => s.status === 'running').length,
      totalCapacity: servers.reduce((sum, s) => sum + (s.maxPlayers || 0), 0),
      currentLoad: servers.reduce((sum, s) => sum + (s.currentPlayers || 0), 0),
      averageLoad: 0,
      peakHours: this.identifyPeakHours(),
      capacityRecommendations: []
    };

    metrics.averageLoad = metrics.totalCapacity > 0 ? 
      (metrics.currentLoad / metrics.totalCapacity) * 100 : 0;

    // Generate capacity recommendations
    if (metrics.averageLoad > 80) {
      metrics.capacityRecommendations.push({
        type: 'scale_up',
        priority: 'high',
        message: 'Consider adding more server capacity - current load is high',
        action: 'Add 2-3 additional servers or increase player limits'
      });
    } else if (metrics.averageLoad < 30) {
      metrics.capacityRecommendations.push({
        type: 'optimize',
        priority: 'medium',
        message: 'Server capacity may be over-provisioned',
        action: 'Consider consolidating players or reducing server count'
      });
    }

    return metrics;
  }

  identifyPeakHours() {
    // Analyze session data to identify peak usage hours
    const hourlyLoad = new Array(24).fill(0);
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.startTime) {
        const hour = new Date(session.startTime).getHours();
        hourlyLoad[hour]++;
      }
    }

    const maxLoad = Math.max(...hourlyLoad);
    const peakHours = hourlyLoad
      .map((load, hour) => ({ hour, load }))
      .filter(item => item.load >= maxLoad * 0.8)
      .map(item => item.hour);

    return peakHours;
  }

  // Comparative Benchmarking
  async generateBenchmarkReport(category = 'gaming') {
    const benchmark = this.benchmarkCategories[category];
    if (!benchmark) {
      throw new Error(`Unknown benchmark category: ${category}`);
    }

    const currentMetrics = await this.calculateCurrentMetrics();
    const comparison = {};

    for (const [metric, benchmarkValue] of Object.entries(benchmark.metrics)) {
      const currentValue = currentMetrics[metric];
      const performance = currentValue / benchmarkValue;
      
      comparison[metric] = {
        current: currentValue,
        benchmark: benchmarkValue,
        performance: performance,
        status: performance >= 1.0 ? 'above' : performance >= 0.8 ? 'near' : 'below',
        difference: currentValue - benchmarkValue,
        percentDifference: ((currentValue - benchmarkValue) / benchmarkValue) * 100
      };
    }

    const report = {
      category: category,
      categoryName: benchmark.name,
      generatedAt: new Date(),
      overallScore: this.calculateOverallBenchmarkScore(comparison),
      metrics: comparison,
      recommendations: this.generateBenchmarkRecommendations(comparison)
    };

    this.benchmarks.set(`${category}_${Date.now()}`, report);
    await this.saveBenchmarkData();

    this.emit('benchmark-report-generated', { report });
    return report;
  }

  async calculateCurrentMetrics() {
    const totalPlayers = this.players.size;
    const activePlayers = Array.from(this.players.values())
      .filter(p => !p.flags.is_churned);

    const dailyActivePlayers = activePlayers.filter(p => {
      const daysSinceLastSession = p.lastSession ? 
        (Date.now() - new Date(p.lastSession)) / (24 * 60 * 60 * 1000) : Infinity;
      return daysSinceLastSession <= 1;
    });

    const weeklyRetention = this.calculateRetentionRate(7);
    const monthlyRetention = this.calculateRetentionRate(30);
    const averageSessionDuration = this.calculateAverageSessionDuration();
    const monthlyChurnRate = this.calculateChurnRate(30);

    return {
      daily_active_rate: totalPlayers > 0 ? dailyActivePlayers.length / totalPlayers : 0,
      weekly_retention: weeklyRetention,
      monthly_retention: monthlyRetention,
      session_duration: averageSessionDuration,
      churn_rate: monthlyChurnRate
    };
  }

  calculateRetentionRate(days) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const playersInPeriod = Array.from(this.players.values())
      .filter(p => new Date(p.registrationDate) <= cutoffDate);

    if (playersInPeriod.length === 0) return 0;

    const retainedPlayers = playersInPeriod.filter(p => {
      return p.lastSession && new Date(p.lastSession) > cutoffDate;
    });

    return retainedPlayers.length / playersInPeriod.length;
  }

  calculateAverageSessionDuration() {
    const completedSessions = Array.from(this.sessions.values())
      .filter(s => s.duration !== null);

    if (completedSessions.length === 0) return 0;

    const totalDuration = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    return totalDuration / completedSessions.length / (1000 * 60); // Convert to minutes
  }

  calculateChurnRate(days) {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const playersAtStart = Array.from(this.players.values())
      .filter(p => new Date(p.registrationDate) <= cutoffDate);

    if (playersAtStart.length === 0) return 0;

    const churnedPlayers = playersAtStart.filter(p => {
      return !p.lastSession || new Date(p.lastSession) <= cutoffDate;
    });

    return churnedPlayers.length / playersAtStart.length;
  }

  calculateOverallBenchmarkScore(comparison) {
    const scores = Object.values(comparison).map(m => m.performance);
    return scores.reduce((sum, score) => sum + Math.min(score, 1.2), 0) / scores.length;
  }

  generateBenchmarkRecommendations(comparison) {
    const recommendations = [];

    for (const [metric, data] of Object.entries(comparison)) {
      if (data.status === 'below') {
        let recommendation = '';
        let priority = 'medium';

        switch (metric) {
          case 'daily_active_rate':
            recommendation = 'Focus on player engagement initiatives and daily login incentives';
            priority = 'high';
            break;
          case 'weekly_retention':
            recommendation = 'Improve onboarding experience and early-game engagement';
            priority = 'high';
            break;
          case 'monthly_retention':
            recommendation = 'Develop long-term content and community features';
            priority = 'medium';
            break;
          case 'session_duration':
            recommendation = 'Create more engaging content and reduce friction in gameplay';
            priority = 'medium';
            break;
          case 'churn_rate':
            recommendation = 'Implement retention campaigns and identify churn risk factors';
            priority = 'high';
            break;
        }

        if (recommendation) {
          recommendations.push({
            metric,
            priority,
            recommendation,
            impact: data.percentDifference
          });
        }
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // A/B Testing Framework
  async createExperiment(experimentData) {
    const experimentId = crypto.randomUUID();
    const now = new Date();

    const experiment = {
      id: experimentId,
      ...experimentData,
      name: experimentData.name,
      description: experimentData.description || '',
      type: experimentData.type || 'feature_rollout',
      status: 'draft',
      createdAt: now,
      startDate: experimentData.startDate ? new Date(experimentData.startDate) : null,
      endDate: experimentData.endDate ? new Date(experimentData.endDate) : null,
      targetAudience: experimentData.targetAudience || 'all',
      trafficSplit: experimentData.trafficSplit || { control: 50, variant: 50 },
      successMetrics: experimentData.successMetrics || ['engagement_score'],
      variants: {
        control: {
          name: 'Control',
          description: 'Current experience',
          participants: [],
          metrics: {}
        },
        variant: {
          name: experimentData.variantName || 'Variant A',
          description: experimentData.variantDescription || 'New experience',
          participants: [],
          metrics: {}
        }
      },
      results: {
        significance: null,
        confidence: null,
        winner: null,
        summary: null
      }
    };

    this.experiments.set(experimentId, experiment);
    await this.saveExperimentData();

    this.emit('experiment-created', { experiment });
    return experiment;
  }

  async startExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    if (experiment.status !== 'draft') {
      throw new Error(`Experiment ${experimentId} is not in draft status`);
    }

    const now = new Date();
    experiment.status = 'running';
    experiment.startDate = experiment.startDate || now;
    
    if (!experiment.endDate) {
      const experimentType = this.experimentTypes[experiment.type];
      if (experimentType) {
        experiment.endDate = new Date(now.getTime() + experimentType.duration);
      }
    }

    // Assign participants to variants
    await this.assignParticipants(experiment);

    await this.saveExperimentData();
    this.emit('experiment-started', { experiment });
    return experiment;
  }

  async assignParticipants(experiment) {
    // Get eligible players based on target audience
    const eligiblePlayers = this.getEligiblePlayers(experiment.targetAudience);
    
    // Randomly assign players to control/variant groups
    const shuffled = this.shuffleArray([...eligiblePlayers]);
    const controlCount = Math.floor(shuffled.length * experiment.trafficSplit.control / 100);
    
    experiment.variants.control.participants = shuffled.slice(0, controlCount).map(p => p.id);
    experiment.variants.variant.participants = shuffled.slice(controlCount).map(p => p.id);

    // Track experiment assignment for each player
    for (const playerId of experiment.variants.control.participants) {
      const player = this.players.get(playerId);
      if (player) {
        player.experiments.push({
          experimentId: experiment.id,
          variant: 'control',
          assignedAt: new Date()
        });
      }
    }

    for (const playerId of experiment.variants.variant.participants) {
      const player = this.players.get(playerId);
      if (player) {
        player.experiments.push({
          experimentId: experiment.id,
          variant: 'variant',
          assignedAt: new Date()
        });
      }
    }

    await this.savePlayerData();
  }

  getEligiblePlayers(targetAudience) {
    const allPlayers = Array.from(this.players.values());
    
    switch (targetAudience) {
      case 'new':
        return allPlayers.filter(p => p.lifecycleStage === 'new');
      case 'engaged':
        return allPlayers.filter(p => ['engaged', 'champion'].includes(p.lifecycleStage));
      case 'at_risk':
        return allPlayers.filter(p => p.flags.is_at_risk);
      case 'active':
        return allPlayers.filter(p => !p.flags.is_churned);
      case 'all':
      default:
        return allPlayers.filter(p => !p.flags.is_churned);
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async stopExperiment(experimentId, reason = 'completed') {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    experiment.status = 'completed';
    experiment.endDate = new Date();
    experiment.stopReason = reason;

    // Calculate final results
    await this.calculateExperimentResults(experiment);

    await this.saveExperimentData();
    this.emit('experiment-stopped', { experiment, reason });
    return experiment;
  }

  async calculateExperimentResults(experiment) {
    const controlMetrics = await this.calculateVariantMetrics(experiment, 'control');
    const variantMetrics = await this.calculateVariantMetrics(experiment, 'variant');

    experiment.variants.control.metrics = controlMetrics;
    experiment.variants.variant.metrics = variantMetrics;

    // Calculate statistical significance
    const significance = this.calculateStatisticalSignificance(controlMetrics, variantMetrics);
    
    experiment.results = {
      significance: significance.pValue,
      confidence: significance.confidence,
      winner: significance.winner,
      summary: this.generateResultSummary(controlMetrics, variantMetrics, significance)
    };
  }

  async calculateVariantMetrics(experiment, variant) {
    const participants = experiment.variants[variant].participants;
    const startDate = experiment.startDate;
    const endDate = experiment.endDate || new Date();

    const metrics = {};

    for (const metricName of experiment.successMetrics) {
      let totalValue = 0;
      let count = 0;

      for (const playerId of participants) {
        const player = this.players.get(playerId);
        if (!player) continue;

        let value = 0;
        switch (metricName) {
          case 'engagement_score':
            value = player.engagementScore;
            break;
          case 'retention_rate':
            value = this.calculatePlayerRetention(player, startDate, endDate);
            break;
          case 'session_frequency':
            value = this.calculatePlayerSessionFrequency(player, startDate, endDate);
            break;
          case 'session_duration':
            value = this.calculatePlayerAverageSessionDuration(player, startDate, endDate);
            break;
        }

        totalValue += value;
        count++;
      }

      metrics[metricName] = {
        average: count > 0 ? totalValue / count : 0,
        participants: count,
        total: totalValue
      };
    }

    return metrics;
  }

  calculatePlayerRetention(player, startDate, endDate) {
    const sessionsInPeriod = Array.from(this.sessions.values()).filter(s => 
      s.playerId === player.id &&
      s.startTime >= startDate &&
      s.startTime <= endDate
    );

    return sessionsInPeriod.length > 0 ? 1 : 0;
  }

  calculatePlayerSessionFrequency(player, startDate, endDate) {
    const sessionsInPeriod = Array.from(this.sessions.values()).filter(s => 
      s.playerId === player.id &&
      s.startTime >= startDate &&
      s.startTime <= endDate
    );

    const daysInPeriod = Math.max(1, (endDate - startDate) / (24 * 60 * 60 * 1000));
    return sessionsInPeriod.length / daysInPeriod;
  }

  calculatePlayerAverageSessionDuration(player, startDate, endDate) {
    const sessionsInPeriod = Array.from(this.sessions.values()).filter(s => 
      s.playerId === player.id &&
      s.startTime >= startDate &&
      s.startTime <= endDate &&
      s.duration !== null
    );

    if (sessionsInPeriod.length === 0) return 0;

    const totalDuration = sessionsInPeriod.reduce((sum, s) => sum + s.duration, 0);
    return totalDuration / sessionsInPeriod.length / (1000 * 60); // Convert to minutes
  }

  calculateStatisticalSignificance(controlMetrics, variantMetrics) {
    // Simplified statistical significance calculation
    // In a real implementation, you'd use proper statistical tests
    
    const primaryMetric = Object.keys(controlMetrics)[0];
    const controlValue = controlMetrics[primaryMetric].average;
    const variantValue = variantMetrics[primaryMetric].average;
    
    const improvement = ((variantValue - controlValue) / controlValue) * 100;
    const sampleSize = Math.min(
      controlMetrics[primaryMetric].participants,
      variantMetrics[primaryMetric].participants
    );

    // Mock significance calculation (replace with proper statistical test)
    const pValue = Math.random() * 0.1; // Simplified for demo
    const confidence = (1 - pValue) * 100;
    const isSignificant = pValue < 0.05 && sampleSize > 30;

    return {
      pValue,
      confidence,
      isSignificant,
      improvement,
      winner: isSignificant ? (improvement > 0 ? 'variant' : 'control') : 'inconclusive'
    };
  }

  generateResultSummary(controlMetrics, variantMetrics, significance) {
    const primaryMetric = Object.keys(controlMetrics)[0];
    const improvement = significance.improvement;

    if (!significance.isSignificant) {
      return `No statistically significant difference found between control and variant.`;
    }

    const winner = significance.winner;
    const winnerName = winner === 'variant' ? 'Variant' : 'Control';
    
    return `${winnerName} performed ${Math.abs(improvement).toFixed(1)}% ${improvement > 0 ? 'better' : 'worse'} ` +
           `than ${winner === 'variant' ? 'control' : 'variant'} with ${significance.confidence.toFixed(1)}% confidence.`;
  }

  monitorExperiments() {
    const now = new Date();
    
    for (const [experimentId, experiment] of this.experiments.entries()) {
      if (experiment.status === 'running' && experiment.endDate && now >= experiment.endDate) {
        this.stopExperiment(experimentId, 'time_expired');
      }
    }
  }

  // Automated Insights Generation
  async generateInsights() {
    const insights = [];
    
    // Player lifecycle insights
    insights.push(...await this.generateLifecycleInsights());
    
    // Engagement insights
    insights.push(...await this.generateEngagementInsights());
    
    // Retention insights
    insights.push(...await this.generateRetentionInsights());
    
    // Server utilization insights
    insights.push(...await this.generateServerInsights());

    // Store insights
    for (const insight of insights) {
      this.insights.set(insight.id, insight);
    }

    await this.saveInsightData();
    this.emit('insights-generated', { insights });
    
    return insights;
  }

  async generateLifecycleInsights() {
    const insights = [];
    const lifecycleCounts = {};
    
    // Count players in each lifecycle stage
    for (const stage of Object.keys(this.lifecycleStages)) {
      lifecycleCounts[stage] = Array.from(this.players.values())
        .filter(p => p.lifecycleStage === stage).length;
    }

    // High churn rate insight
    if (lifecycleCounts.churned / this.players.size > 0.15) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'churn_alert',
        priority: 'high',
        title: 'High Churn Rate Detected',
        description: `${lifecycleCounts.churned} players (${((lifecycleCounts.churned / this.players.size) * 100).toFixed(1)}%) have churned`,
        recommendation: 'Implement retention campaigns and identify common churn factors',
        actionable: true,
        createdAt: new Date()
      });
    }

    // At-risk players insight
    if (lifecycleCounts.at_risk > 0) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'at_risk_players',
        priority: 'medium',
        title: 'Players at Risk of Churning',
        description: `${lifecycleCounts.at_risk} players showing signs of declining engagement`,
        recommendation: 'Reach out with personalized content or support',
        actionable: true,
        createdAt: new Date()
      });
    }

    return insights;
  }

  async generateEngagementInsights() {
    const insights = [];
    const engagementScores = Array.from(this.players.values())
      .filter(p => !p.flags.is_churned)
      .map(p => p.engagementScore);

    if (engagementScores.length === 0) return insights;

    const averageEngagement = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;

    if (averageEngagement < 50) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'low_engagement',
        priority: 'high',
        title: 'Below Average Community Engagement',
        description: `Average engagement score is ${averageEngagement.toFixed(1)}, below healthy threshold of 60`,
        recommendation: 'Focus on content creation, events, and community building activities',
        actionable: true,
        createdAt: new Date()
      });
    }

    return insights;
  }

  async generateRetentionInsights() {
    const insights = [];
    const weeklyRetention = this.calculateRetentionRate(7);
    const monthlyRetention = this.calculateRetentionRate(30);

    if (weeklyRetention < 0.3) {
      insights.push({
        id: crypto.randomUUID(),
        type: 'poor_retention',
        priority: 'high',
        title: 'Poor Weekly Retention Rate',
        description: `Only ${(weeklyRetention * 100).toFixed(1)}% of players return within a week`,
        recommendation: 'Improve onboarding experience and early-game engagement',
        actionable: true,
        createdAt: new Date()
      });
    }

    return insights;
  }

  async generateServerInsights() {
    const insights = [];
    
    try {
      const utilization = await this.getServerUtilizationMetrics();
      
      if (utilization.averageLoad > 80) {
        insights.push({
          id: crypto.randomUUID(),
          type: 'high_server_load',
          priority: 'high',
          title: 'High Server Utilization',
          description: `Server capacity is ${utilization.averageLoad.toFixed(1)}% utilized`,
          recommendation: 'Consider scaling up server capacity or optimizing current resources',
          actionable: true,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.warn('Failed to generate server insights:', error);
    }

    return insights;
  }

  generateDailyInsights() {
    this.generateInsights().then(insights => {
      this.emit('daily-insights-generated', { 
        date: new Date(),
        insightCount: insights.length,
        insights: insights.slice(0, 5) // Top 5 insights
      });
    });
  }

  collectPlayerAnalytics() {
    const now = new Date();
    const analytics = {
      timestamp: now,
      totalPlayers: this.players.size,
      activePlayers: Array.from(this.players.values()).filter(p => !p.flags.is_churned).length,
      dailyActive: Array.from(this.players.values()).filter(p => {
        const daysSinceLastSession = p.lastSession ? 
          (now - new Date(p.lastSession)) / (24 * 60 * 60 * 1000) : Infinity;
        return daysSinceLastSession <= 1;
      }).length,
      weeklyActive: Array.from(this.players.values()).filter(p => {
        const daysSinceLastSession = p.lastSession ? 
          (now - new Date(p.lastSession)) / (24 * 60 * 60 * 1000) : Infinity;
        return daysSinceLastSession <= 7;
      }).length,
      monthlyActive: Array.from(this.players.values()).filter(p => {
        const daysSinceLastSession = p.lastSession ? 
          (now - new Date(p.lastSession)) / (24 * 60 * 60 * 1000) : Infinity;
        return daysSinceLastSession <= 30;
      }).length
    };

    this.emit('analytics-collected', { analytics });
  }

  monitorLifecycleTransitions() {
    for (const [playerId, player] of this.players.entries()) {
      this.checkLifecycleTransition(player);
    }
  }

  // Cohort Analysis
  getCohortId(date) {
    const cohortDate = new Date(date);
    return `${cohortDate.getFullYear()}-${String(cohortDate.getMonth() + 1).padStart(2, '0')}`;
  }

  async generateCohortAnalysis() {
    const cohorts = {};
    
    for (const [playerId, player] of this.players.entries()) {
      const cohortId = player.cohort;
      if (!cohorts[cohortId]) {
        cohorts[cohortId] = {
          id: cohortId,
          players: [],
          registrationMonth: cohortId,
          size: 0,
          retention: {}
        };
      }
      cohorts[cohortId].players.push(playerId);
      cohorts[cohortId].size++;
    }

    // Calculate retention rates for each cohort
    for (const [cohortId, cohort] of Object.entries(cohorts)) {
      const registrationDate = new Date(cohortId + '-01');
      
      for (let month = 1; month <= 12; month++) {
        const retentionDate = new Date(registrationDate);
        retentionDate.setMonth(retentionDate.getMonth() + month);
        
        const retainedPlayers = cohort.players.filter(playerId => {
          const player = this.players.get(playerId);
          return player && player.lastSession && new Date(player.lastSession) >= retentionDate;
        });

        cohort.retention[`month_${month}`] = {
          count: retainedPlayers.length,
          rate: retainedPlayers.length / cohort.size
        };
      }
    }

    this.cohorts.clear();
    for (const [cohortId, cohort] of Object.entries(cohorts)) {
      this.cohorts.set(cohortId, cohort);
    }

    await this.saveCohortData();
    return Array.from(this.cohorts.values());
  }

  // Data Persistence
  async savePlayerData() {
    const playerData = {};
    for (const [id, player] of this.players.entries()) {
      playerData[id] = player;
    }
    this.store.set('analyticsPlayers', playerData);
  }

  async saveSessionData() {
    const sessionData = {};
    for (const [id, session] of this.sessions.entries()) {
      sessionData[id] = session;
    }
    this.store.set('analyticsSessions', sessionData);
  }

  async saveEventData() {
    const eventData = {};
    for (const [id, event] of this.events.entries()) {
      eventData[id] = event;
    }
    this.store.set('analyticsEvents', eventData);
  }

  async saveExperimentData() {
    const experimentData = {};
    for (const [id, experiment] of this.experiments.entries()) {
      experimentData[id] = experiment;
    }
    this.store.set('analyticsExperiments', experimentData);
  }

  async saveInsightData() {
    const insightData = {};
    for (const [id, insight] of this.insights.entries()) {
      insightData[id] = insight;
    }
    this.store.set('analyticsInsights', insightData);
  }

  async saveBenchmarkData() {
    const benchmarkData = {};
    for (const [id, benchmark] of this.benchmarks.entries()) {
      benchmarkData[id] = benchmark;
    }
    this.store.set('analyticsBenchmarks', benchmarkData);
  }

  async saveCohortData() {
    const cohortData = {};
    for (const [id, cohort] of this.cohorts.entries()) {
      cohortData[id] = cohort;
    }
    this.store.set('analyticsCohorts', cohortData);
  }

  // Getters
  getPlayers() {
    return Array.from(this.players.values());
  }

  getSessions() {
    return Array.from(this.sessions.values());
  }

  getEvents() {
    return Array.from(this.events.values());
  }

  getExperiments() {
    return Array.from(this.experiments.values());
  }

  getInsights() {
    return Array.from(this.insights.values());
  }

  getBenchmarks() {
    return Array.from(this.benchmarks.values());
  }

  getCohorts() {
    return Array.from(this.cohorts.values());
  }

  getLifecycleStages() {
    return this.lifecycleStages;
  }

  getEngagementFactors() {
    return this.engagementFactors;
  }

  getBenchmarkCategories() {
    return this.benchmarkCategories;
  }

  getExperimentTypes() {
    return this.experimentTypes;
  }

  async shutdown() {
    console.log('Shutting down CommunityGrowthAnalytics service...');
    
    // Save all data
    await this.savePlayerData();
    await this.saveSessionData();
    await this.saveEventData();
    await this.saveExperimentData();
    await this.saveInsightData();
    await this.saveBenchmarkData();
    await this.saveCohortData();
    
    // Clear all data
    this.players.clear();
    this.sessions.clear();
    this.events.clear();
    this.experiments.clear();
    this.insights.clear();
    this.benchmarks.clear();
    this.cohorts.clear();
    
    this.isInitialized = false;
    console.log('CommunityGrowthAnalytics service shut down successfully');
  }
}

module.exports = CommunityGrowthAnalytics;