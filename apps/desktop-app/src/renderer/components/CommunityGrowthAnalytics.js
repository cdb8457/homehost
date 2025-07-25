import React, { useState, useEffect, useCallback } from 'react';
import './CommunityGrowthAnalytics.css';

/**
 * CommunityGrowthAnalytics Component - Epic 4: Story 4.4: Community Growth Analytics
 * 
 * Provides detailed insights into community health and growth opportunities through
 * player lifecycle analysis, server utilization metrics, engagement scoring, 
 * comparative benchmarking, and A/B testing framework for data-driven decisions.
 */
const CommunityGrowthAnalytics = () => {
  const [players, setPlayers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [events, setEvents] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [serverMetrics, setServerMetrics] = useState({});
  const [lifecycleStages, setLifecycleStages] = useState({});
  const [benchmarkCategories, setBenchmarkCategories] = useState({});
  const [experimentTypes, setExperimentTypes] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [selectedBenchmark, setSelectedBenchmark] = useState('gaming');

  // Initialize component
  useEffect(() => {
    initializeCommunityAnalytics();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const handlers = {
      'analytics-initialized': handleAnalyticsInitialized,
      'player-registered': handlePlayerRegistered,
      'lifecycle-transition': handleLifecycleTransition,
      'engagement-score-changed': handleEngagementScoreChanged,
      'experiment-created': handleExperimentCreated,
      'experiment-started': handleExperimentStarted,
      'experiment-stopped': handleExperimentStopped,
      'benchmark-report-generated': handleBenchmarkReportGenerated,
      'insights-generated': handleInsightsGenerated,
      'daily-insights-generated': handleDailyInsightsGenerated,
      'analytics-collected': handleAnalyticsCollected
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      window.electronAPI.on(event, handler);
    });

    return () => {
      Object.keys(handlers).forEach(event => {
        window.electronAPI.removeAllListeners(event);
      });
    };
  }, []);

  const initializeCommunityAnalytics = async () => {
    try {
      setIsLoading(true);

      // Load players and analytics data
      const playerList = await window.electronAPI.invoke('community-analytics:get-players');
      setPlayers(playerList || []);

      const sessionList = await window.electronAPI.invoke('community-analytics:get-sessions');
      setSessions(sessionList || []);

      const eventList = await window.electronAPI.invoke('community-analytics:get-events');
      setEvents(eventList || []);

      const experimentList = await window.electronAPI.invoke('community-analytics:get-experiments');
      setExperiments(experimentList || []);

      const insightList = await window.electronAPI.invoke('community-analytics:get-insights');
      setInsights(insightList || []);

      const benchmarkList = await window.electronAPI.invoke('community-analytics:get-benchmarks');
      setBenchmarks(benchmarkList || []);

      const cohortList = await window.electronAPI.invoke('community-analytics:get-cohorts');
      setCohorts(cohortList || []);

      // Load server utilization metrics
      const serverData = await window.electronAPI.invoke('community-analytics:get-server-metrics');
      setServerMetrics(serverData || {});

      // Load configuration data
      const stages = await window.electronAPI.invoke('community-analytics:get-lifecycle-stages');
      setLifecycleStages(stages || {});

      const categories = await window.electronAPI.invoke('community-analytics:get-benchmark-categories');
      setBenchmarkCategories(categories || {});

      const types = await window.electronAPI.invoke('community-analytics:get-experiment-types');
      setExperimentTypes(types || {});

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize community analytics:', error);
      setIsLoading(false);
    }
  };

  // Event handlers
  const handleAnalyticsInitialized = useCallback((data) => {
    console.log('Analytics initialized:', data);
  }, []);

  const handlePlayerRegistered = useCallback((data) => {
    setPlayers(prev => [data.player, ...prev]);
  }, []);

  const handleLifecycleTransition = useCallback((data) => {
    setPlayers(prev => 
      prev.map(player => player.id === data.player.id ? data.player : player)
    );
  }, []);

  const handleEngagementScoreChanged = useCallback((data) => {
    setPlayers(prev => 
      prev.map(player => player.id === data.player.id ? data.player : player)
    );
  }, []);

  const handleExperimentCreated = useCallback((data) => {
    setExperiments(prev => [data.experiment, ...prev]);
  }, []);

  const handleExperimentStarted = useCallback((data) => {
    setExperiments(prev => 
      prev.map(exp => exp.id === data.experiment.id ? data.experiment : exp)
    );
  }, []);

  const handleExperimentStopped = useCallback((data) => {
    setExperiments(prev => 
      prev.map(exp => exp.id === data.experiment.id ? data.experiment : exp)
    );
  }, []);

  const handleBenchmarkReportGenerated = useCallback((data) => {
    setBenchmarks(prev => [data.report, ...prev]);
  }, []);

  const handleInsightsGenerated = useCallback((data) => {
    setInsights(data.insights);
  }, []);

  const handleDailyInsightsGenerated = useCallback((data) => {
    console.log('Daily insights generated:', data);
  }, []);

  const handleAnalyticsCollected = useCallback((data) => {
    console.log('Analytics collected:', data.analytics);
  }, []);

  // Analytics actions
  const trackPlayer = async (playerId, userData = {}) => {
    try {
      const player = await window.electronAPI.invoke('community-analytics:track-player', {
        playerId,
        userData
      });
      console.log('Player tracked:', player);
    } catch (error) {
      console.error('Failed to track player:', error);
      alert('Failed to track player: ' + error.message);
    }
  };

  const trackPlayerAction = async (playerId, action, metadata = {}) => {
    try {
      await window.electronAPI.invoke('community-analytics:track-action', {
        playerId,
        action,
        metadata
      });
      console.log('Player action tracked:', action);
    } catch (error) {
      console.error('Failed to track player action:', error);
    }
  };

  const startSession = async (playerId, serverId, sessionData = {}) => {
    try {
      const sessionId = await window.electronAPI.invoke('community-analytics:start-session', {
        playerId,
        serverId,
        sessionData
      });
      console.log('Session started:', sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async (sessionId, endData = {}) => {
    try {
      await window.electronAPI.invoke('community-analytics:end-session', {
        sessionId,
        endData
      });
      console.log('Session ended:', sessionId);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  // Experiment actions
  const createExperiment = async (experimentData) => {
    try {
      const experiment = await window.electronAPI.invoke('community-analytics:create-experiment', experimentData);
      console.log('Experiment created:', experiment);
    } catch (error) {
      console.error('Failed to create experiment:', error);
      alert('Failed to create experiment: ' + error.message);
    }
  };

  const startExperiment = async (experimentId) => {
    try {
      const experiment = await window.electronAPI.invoke('community-analytics:start-experiment', experimentId);
      console.log('Experiment started:', experiment);
    } catch (error) {
      console.error('Failed to start experiment:', error);
      alert('Failed to start experiment: ' + error.message);
    }
  };

  const stopExperiment = async (experimentId, reason = 'manual') => {
    try {
      const experiment = await window.electronAPI.invoke('community-analytics:stop-experiment', {
        experimentId,
        reason
      });
      console.log('Experiment stopped:', experiment);
    } catch (error) {
      console.error('Failed to stop experiment:', error);
      alert('Failed to stop experiment: ' + error.message);
    }
  };

  // Benchmark actions
  const generateBenchmarkReport = async (category = 'gaming') => {
    try {
      const report = await window.electronAPI.invoke('community-analytics:generate-benchmark', category);
      console.log('Benchmark report generated:', report);
    } catch (error) {
      console.error('Failed to generate benchmark report:', error);
      alert('Failed to generate benchmark report: ' + error.message);
    }
  };

  const generateCohortAnalysis = async () => {
    try {
      const cohortData = await window.electronAPI.invoke('community-analytics:generate-cohort-analysis');
      setCohorts(cohortData || []);
      console.log('Cohort analysis generated:', cohortData);
    } catch (error) {
      console.error('Failed to generate cohort analysis:', error);
      alert('Failed to generate cohort analysis: ' + error.message);
    }
  };

  // Utility functions
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (value) => {
    return (value * 100).toFixed(1) + '%';
  };

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLifecycleColor = (stage) => {
    const colors = {
      new: '#4caf50',
      onboarding: '#2196f3',
      engaged: '#9c27b0',
      champion: '#ff9800',
      at_risk: '#ff5722',
      churned: '#9e9e9e'
    };
    return colors[stage] || '#9e9e9e';
  };

  const getEngagementColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#8bc34a';
    if (score >= 40) return '#ff9800';
    if (score >= 20) return '#ff5722';
    return '#f44336';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#f44336',
      medium: '#ff9800',
      low: '#4caf50'
    };
    return colors[priority] || '#9e9e9e';
  };

  const getExperimentStatusColor = (status) => {
    const colors = {
      draft: '#9e9e9e',
      running: '#4caf50',
      completed: '#2196f3',
      cancelled: '#f44336'
    };
    return colors[status] || '#9e9e9e';
  };

  const calculateLifecycleDistribution = () => {
    const distribution = {};
    const activePlayers = players.filter(p => !p.flags?.is_churned);
    
    for (const stage of Object.keys(lifecycleStages)) {
      distribution[stage] = activePlayers.filter(p => p.lifecycleStage === stage).length;
    }
    
    return distribution;
  };

  const calculateAverageEngagement = () => {
    const activePlayers = players.filter(p => !p.flags?.is_churned);
    if (activePlayers.length === 0) return 0;
    
    const totalEngagement = activePlayers.reduce((sum, p) => sum + (p.engagementScore || 0), 0);
    return Math.round(totalEngagement / activePlayers.length);
  };

  const getTopInsights = () => {
    return insights
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading Community Analytics...</p>
      </div>
    );
  }

  return (
    <div className="community-growth-analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-title">
          <h1>📈 Community Growth Analytics</h1>
          <p>Data-driven insights for community health and growth optimization</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{formatNumber(players.length)}</span>
            <span className="stat-label">Total Players</span>
          </div>
          <div className="stat">
            <span className="stat-number">{formatNumber(players.filter(p => !p.flags?.is_churned).length)}</span>
            <span className="stat-label">Active Players</span>
          </div>
          <div className="stat">
            <span className="stat-number">{calculateAverageEngagement()}</span>
            <span className="stat-label">Avg Engagement</span>
          </div>
          <div className="stat">
            <span className="stat-number">{experiments.filter(e => e.status === 'running').length}</span>
            <span className="stat-label">Active Tests</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'lifecycle' ? 'active' : ''}`}
          onClick={() => setActiveTab('lifecycle')}
        >
          🔄 Player Lifecycle
        </button>
        <button 
          className={`tab ${activeTab === 'engagement' ? 'active' : ''}`}
          onClick={() => setActiveTab('engagement')}
        >
          🎯 Engagement Scoring
        </button>
        <button 
          className={`tab ${activeTab === 'benchmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmarks')}
        >
          📏 Benchmarking
        </button>
        <button 
          className={`tab ${activeTab === 'experiments' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiments')}
        >
          🧪 A/B Testing
        </button>
        <button 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          💡 Insights
        </button>
      </div>

      <div className="analytics-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Key Metrics Overview */}
            <div className="overview-section">
              <h3>Community Health Overview</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <h4>Player Lifecycle Distribution</h4>
                  </div>
                  <div className="lifecycle-chart">
                    {Object.entries(calculateLifecycleDistribution()).map(([stage, count]) => (
                      <div key={stage} className="lifecycle-bar">
                        <div className="bar-label">
                          <span className="stage-name">{lifecycleStages[stage]?.name || stage}</span>
                          <span className="stage-count">{count}</span>
                        </div>
                        <div 
                          className="bar-fill"
                          style={{ 
                            backgroundColor: getLifecycleColor(stage),
                            width: `${Math.max(5, (count / players.length) * 100)}%`
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h4>Server Utilization</h4>
                  </div>
                  <div className="server-metrics">
                    <div className="server-stat">
                      <span className="label">Active Servers:</span>
                      <span className="value">{serverMetrics.activeServers || 0}/{serverMetrics.totalServers || 0}</span>
                    </div>
                    <div className="server-stat">
                      <span className="label">Current Load:</span>
                      <span className="value">{(serverMetrics.averageLoad || 0).toFixed(1)}%</span>
                    </div>
                    <div className="server-stat">
                      <span className="label">Peak Hours:</span>
                      <span className="value">
                        {serverMetrics.peakHours?.map(h => `${h}:00`).join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <h4>Recent Activity</h4>
                  </div>
                  <div className="activity-summary">
                    <div className="activity-stat">
                      <span className="label">Sessions Today:</span>
                      <span className="value">
                        {sessions.filter(s => {
                          const today = new Date();
                          const sessionDate = new Date(s.startTime);
                          return sessionDate.toDateString() === today.toDateString();
                        }).length}
                      </span>
                    </div>
                    <div className="activity-stat">
                      <span className="label">New Players (7d):</span>
                      <span className="value">
                        {players.filter(p => {
                          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                          return new Date(p.registrationDate) > weekAgo;
                        }).length}
                      </span>
                    </div>
                    <div className="activity-stat">
                      <span className="label">Events Logged:</span>
                      <span className="value">{formatNumber(events.length)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Insights */}
            <div className="overview-section">
              <h3>Key Insights</h3>
              <div className="insights-preview">
                {getTopInsights().map(insight => (
                  <div key={insight.id} className="insight-card">
                    <div className="insight-header">
                      <span 
                        className="insight-priority"
                        style={{ backgroundColor: getPriorityColor(insight.priority) }}
                      >
                        {insight.priority}
                      </span>
                      <h4>{insight.title}</h4>
                    </div>
                    <p>{insight.description}</p>
                    {insight.actionable && (
                      <div className="insight-recommendation">
                        💡 {insight.recommendation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="overview-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button 
                  className="action-btn"
                  onClick={() => trackPlayer(`player-${Date.now()}`, {
                    name: 'Test Player',
                    source: 'demo'
                  })}
                >
                  👤 Track Test Player
                </button>
                <button 
                  className="action-btn"
                  onClick={() => generateBenchmarkReport(selectedBenchmark)}
                >
                  📏 Generate Benchmark Report
                </button>
                <button 
                  className="action-btn"
                  onClick={() => generateCohortAnalysis()}
                >
                  📊 Update Cohort Analysis
                </button>
                <button 
                  className="action-btn"
                  onClick={() => createExperiment({
                    name: 'Test A/B Experiment',
                    description: 'Testing new onboarding flow',
                    type: 'onboarding_flow',
                    targetAudience: 'new',
                    successMetrics: ['retention_rate', 'engagement_score']
                  })}
                >
                  🧪 Create Test Experiment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Lifecycle Tab */}
        {activeTab === 'lifecycle' && (
          <div className="lifecycle-tab">
            <div className="tab-header">
              <h3>Player Lifecycle Analysis</h3>
              <div className="lifecycle-stats">
                {Object.entries(calculateLifecycleDistribution()).map(([stage, count]) => (
                  <span key={stage} className="stat">
                    <span 
                      className="stage-indicator"
                      style={{ backgroundColor: getLifecycleColor(stage) }}
                    ></span>
                    {lifecycleStages[stage]?.name || stage}: {count}
                  </span>
                ))}
              </div>
            </div>

            {/* Lifecycle Stages Overview */}
            <div className="lifecycle-stages">
              {Object.entries(lifecycleStages).map(([stageId, stage]) => {
                const playersInStage = players.filter(p => p.lifecycleStage === stageId);
                return (
                  <div key={stageId} className="stage-card">
                    <div className="stage-header">
                      <div 
                        className="stage-color"
                        style={{ backgroundColor: getLifecycleColor(stageId) }}
                      ></div>
                      <div className="stage-info">
                        <h4>{stage.name}</h4>
                        <p>{stage.description}</p>
                      </div>
                      <div className="stage-count">
                        {playersInStage.length}
                      </div>
                    </div>
                    
                    <div className="stage-metrics">
                      <h5>Key Metrics:</h5>
                      <div className="metrics-list">
                        {stage.keyMetrics.map(metric => (
                          <span key={metric} className="metric-tag">{metric.replace('_', ' ')}</span>
                        ))}
                      </div>
                    </div>

                    {playersInStage.length > 0 && (
                      <div className="stage-players">
                        <h5>Recent Players:</h5>
                        <div className="players-list">
                          {playersInStage.slice(0, 3).map(player => (
                            <div key={player.id} className="player-item">
                              <span className="player-id">Player {player.id.slice(-6)}</span>
                              <span className="engagement-score">
                                Score: {player.engagementScore || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Lifecycle Transitions */}
            <div className="lifecycle-transitions">
              <h3>Recent Lifecycle Transitions</h3>
              <div className="transitions-table">
                <div className="table-header">
                  <div className="col-player">Player</div>
                  <div className="col-from">From</div>
                  <div className="col-to">To</div>
                  <div className="col-date">Date</div>
                  <div className="col-engagement">Engagement</div>
                </div>
                <div className="table-body">
                  {events
                    .filter(e => e.action === 'lifecycle_transition')
                    .slice(0, 10)
                    .map(event => (
                      <div key={event.id} className="transition-row">
                        <div className="col-player">Player {event.playerId.slice(-6)}</div>
                        <div className="col-from">
                          <span 
                            className="stage-badge"
                            style={{ backgroundColor: getLifecycleColor(event.metadata?.previousStage) }}
                          >
                            {lifecycleStages[event.metadata?.previousStage]?.name || event.metadata?.previousStage}
                          </span>
                        </div>
                        <div className="col-to">
                          <span 
                            className="stage-badge"
                            style={{ backgroundColor: getLifecycleColor(event.metadata?.newStage) }}
                          >
                            {lifecycleStages[event.metadata?.newStage]?.name || event.metadata?.newStage}
                          </span>
                        </div>
                        <div className="col-date">{formatDate(event.timestamp)}</div>
                        <div className="col-engagement">
                          {players.find(p => p.id === event.playerId)?.engagementScore || 0}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Scoring Tab */}
        {activeTab === 'engagement' && (
          <div className="engagement-tab">
            <div className="tab-header">
              <h3>Engagement Scoring System</h3>
              <div className="engagement-overview">
                <span className="stat">Average Score: {calculateAverageEngagement()}</span>
                <span className="stat">High Engagement: {players.filter(p => p.engagementScore >= 80).length}</span>
                <span className="stat">At Risk: {players.filter(p => p.flags?.is_at_risk).length}</span>
              </div>
            </div>

            {/* Engagement Factors */}
            <div className="engagement-factors">
              <h4>Engagement Scoring Factors</h4>
              <div className="factors-grid">
                {Object.entries(lifecycleStages.engaged?.keyMetrics || {}).map(([factor, weight]) => (
                  <div key={factor} className="factor-card">
                    <div className="factor-name">{factor.replace('_', ' ')}</div>
                    <div className="factor-weight">Weight: {(weight * 100).toFixed(0)}%</div>
                    <div className="factor-description">
                      {factor === 'session_frequency' && 'How often players start new sessions'}
                      {factor === 'session_duration' && 'Average time spent in each session'}
                      {factor === 'social_interactions' && 'Chat messages and social activities'}
                      {factor === 'content_creation' && 'User-generated content and builds'}
                      {factor === 'community_participation' && 'Forum posts and event participation'}
                      {factor === 'retention_streak' && 'Consecutive days of activity'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player Engagement Distribution */}
            <div className="engagement-distribution">
              <h4>Engagement Score Distribution</h4>
              <div className="distribution-chart">
                {[
                  { range: '80-100', label: 'Champions', color: '#4caf50' },
                  { range: '60-79', label: 'Engaged', color: '#8bc34a' },
                  { range: '40-59', label: 'Moderate', color: '#ff9800' },
                  { range: '20-39', label: 'Low', color: '#ff5722' },
                  { range: '0-19', label: 'At Risk', color: '#f44336' }
                ].map(segment => {
                  const [min, max] = segment.range.split('-').map(Number);
                  const count = players.filter(p => {
                    const score = p.engagementScore || 0;
                    return score >= min && score <= max;
                  }).length;
                  
                  return (
                    <div key={segment.range} className="distribution-segment">
                      <div className="segment-header">
                        <span className="segment-label">{segment.label}</span>
                        <span className="segment-count">{count}</span>
                      </div>
                      <div 
                        className="segment-bar"
                        style={{ 
                          backgroundColor: segment.color,
                          width: `${Math.max(5, (count / players.length) * 100)}%`
                        }}
                      ></div>
                      <div className="segment-range">{segment.range}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Engaged Players */}
            <div className="top-players">
              <h4>Most Engaged Players</h4>
              <div className="players-table">
                <div className="table-header">
                  <div className="col-player">Player</div>
                  <div className="col-score">Score</div>
                  <div className="col-stage">Stage</div>
                  <div className="col-sessions">Sessions</div>
                  <div className="col-playtime">Playtime</div>
                  <div className="col-streak">Streak</div>
                </div>
                <div className="table-body">
                  {players
                    .filter(p => !p.flags?.is_churned)
                    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
                    .slice(0, 10)
                    .map(player => (
                      <div key={player.id} className="player-row">
                        <div className="col-player">Player {player.id.slice(-6)}</div>
                        <div className="col-score">
                          <span 
                            className="score-badge"
                            style={{ backgroundColor: getEngagementColor(player.engagementScore || 0) }}
                          >
                            {player.engagementScore || 0}
                          </span>
                        </div>
                        <div className="col-stage">
                          <span 
                            className="stage-badge"
                            style={{ backgroundColor: getLifecycleColor(player.lifecycleStage) }}
                          >
                            {lifecycleStages[player.lifecycleStage]?.name || player.lifecycleStage}
                          </span>
                        </div>
                        <div className="col-sessions">{player.totalSessions || 0}</div>
                        <div className="col-playtime">{formatDuration(player.totalPlayTime || 0)}</div>
                        <div className="col-streak">{player.metrics?.retention_streak || 0}d</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benchmarking Tab */}
        {activeTab === 'benchmarks' && (
          <div className="benchmarks-tab">
            <div className="tab-header">
              <h3>Comparative Benchmarking</h3>
              <div className="benchmark-controls">
                <select
                  value={selectedBenchmark}
                  onChange={(e) => setSelectedBenchmark(e.target.value)}
                  className="benchmark-select"
                >
                  {Object.entries(benchmarkCategories).map(([id, category]) => (
                    <option key={id} value={id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button 
                  className="generate-btn"
                  onClick={() => generateBenchmarkReport(selectedBenchmark)}
                >
                  Generate Report
                </button>
              </div>
            </div>

            {/* Latest Benchmark Report */}
            {benchmarks.length > 0 && (
              <div className="benchmark-report">
                <h4>Latest Benchmark Report</h4>
                {(() => {
                  const latestReport = benchmarks[0];
                  return (
                    <div className="report-content">
                      <div className="report-header">
                        <div className="report-title">
                          <h5>{latestReport.categoryName}</h5>
                          <span className="report-date">{formatDate(latestReport.generatedAt)}</span>
                        </div>
                        <div className="overall-score">
                          <span className="score-label">Overall Score:</span>
                          <span className="score-value">
                            {(latestReport.overallScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div className="metrics-comparison">
                        {Object.entries(latestReport.metrics || {}).map(([metric, data]) => (
                          <div key={metric} className="metric-comparison">
                            <div className="metric-name">{metric.replace('_', ' ')}</div>
                            <div className="comparison-bars">
                              <div className="bar-set">
                                <div className="bar-label">Current</div>
                                <div 
                                  className="bar current"
                                  style={{ width: `${Math.min(100, (data.current / data.benchmark) * 50)}%` }}
                                >
                                  <span className="bar-value">
                                    {typeof data.current === 'number' && data.current < 1 
                                      ? formatPercentage(data.current)
                                      : data.current.toFixed(1)
                                    }
                                  </span>
                                </div>
                              </div>
                              <div className="bar-set">
                                <div className="bar-label">Benchmark</div>
                                <div 
                                  className="bar benchmark"
                                  style={{ width: '50%' }}
                                >
                                  <span className="bar-value">
                                    {typeof data.benchmark === 'number' && data.benchmark < 1 
                                      ? formatPercentage(data.benchmark)
                                      : data.benchmark.toFixed(1)
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className={`performance-indicator ${data.status}`}>
                              {data.status === 'above' && '↗️ Above benchmark'}
                              {data.status === 'near' && '➡️ Near benchmark'}
                              {data.status === 'below' && '↘️ Below benchmark'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {latestReport.recommendations && latestReport.recommendations.length > 0 && (
                        <div className="benchmark-recommendations">
                          <h5>Recommendations</h5>
                          <div className="recommendations-list">
                            {latestReport.recommendations.map((rec, index) => (
                              <div key={index} className="recommendation">
                                <span 
                                  className="priority-badge"
                                  style={{ backgroundColor: getPriorityColor(rec.priority) }}
                                >
                                  {rec.priority}
                                </span>
                                <div className="recommendation-content">
                                  <div className="metric-name">{rec.metric.replace('_', ' ')}</div>
                                  <div className="recommendation-text">{rec.recommendation}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Benchmark Categories */}
            <div className="benchmark-categories">
              <h4>Available Benchmark Categories</h4>
              <div className="categories-grid">
                {Object.entries(benchmarkCategories).map(([id, category]) => (
                  <div key={id} className="category-card">
                    <h5>{category.name}</h5>
                    <div className="category-metrics">
                      {Object.entries(category.metrics).map(([metric, value]) => (
                        <div key={metric} className="category-metric">
                          <span className="metric-name">{metric.replace('_', ' ')}:</span>
                          <span className="metric-value">
                            {typeof value === 'number' && value < 1 
                              ? formatPercentage(value)
                              : value.toFixed(1)
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* A/B Testing Tab */}
        {activeTab === 'experiments' && (
          <div className="experiments-tab">
            <div className="tab-header">
              <h3>A/B Testing Framework</h3>
              <div className="experiment-stats">
                <span className="stat">Total: {experiments.length}</span>
                <span className="stat">Running: {experiments.filter(e => e.status === 'running').length}</span>
                <span className="stat">Completed: {experiments.filter(e => e.status === 'completed').length}</span>
              </div>
            </div>

            {/* Experiment Types */}
            <div className="experiment-types">
              <h4>Experiment Types</h4>
              <div className="types-grid">
                {Object.entries(experimentTypes).map(([typeId, type]) => (
                  <div key={typeId} className="type-card">
                    <h5>{type.name}</h5>
                    <p>{type.description}</p>
                    <div className="type-details">
                      <div>Duration: {Math.floor(type.duration / (24 * 60 * 60 * 1000))} days</div>
                      <div className="success-metrics">
                        Success Metrics: {type.success_metrics.join(', ')}
                      </div>
                    </div>
                    <button 
                      className="create-experiment-btn"
                      onClick={() => createExperiment({
                        name: `New ${type.name}`,
                        description: type.description,
                        type: typeId,
                        targetAudience: 'active',
                        successMetrics: type.success_metrics
                      })}
                    >
                      Create Experiment
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Experiments */}
            <div className="experiments-list">
              <h4>Current Experiments</h4>
              <div className="experiments-grid">
                {experiments.map(experiment => (
                  <div key={experiment.id} className="experiment-card">
                    <div className="experiment-header">
                      <div className="experiment-title">
                        <h5>{experiment.name}</h5>
                        <span 
                          className="experiment-status"
                          style={{ backgroundColor: getExperimentStatusColor(experiment.status) }}
                        >
                          {experiment.status}
                        </span>
                      </div>
                      <div className="experiment-type">{experiment.type}</div>
                    </div>

                    <div className="experiment-details">
                      <p>{experiment.description}</p>
                      
                      <div className="experiment-meta">
                        <div className="meta-item">
                          <span>Target:</span> {experiment.targetAudience}
                        </div>
                        <div className="meta-item">
                          <span>Traffic Split:</span> 
                          {experiment.trafficSplit.control}%/{experiment.trafficSplit.variant}%
                        </div>
                        {experiment.startDate && (
                          <div className="meta-item">
                            <span>Started:</span> {formatDate(experiment.startDate)}
                          </div>
                        )}
                        {experiment.endDate && (
                          <div className="meta-item">
                            <span>Ends:</span> {formatDate(experiment.endDate)}
                          </div>
                        )}
                      </div>

                      {experiment.variants && (
                        <div className="experiment-variants">
                          <div className="variant">
                            <span className="variant-name">Control:</span>
                            <span className="participant-count">
                              {experiment.variants.control.participants.length} participants
                            </span>
                          </div>
                          <div className="variant">
                            <span className="variant-name">Variant:</span>
                            <span className="participant-count">
                              {experiment.variants.variant.participants.length} participants
                            </span>
                          </div>
                        </div>
                      )}

                      {experiment.results && experiment.results.summary && (
                        <div className="experiment-results">
                          <div className="results-summary">{experiment.results.summary}</div>
                          {experiment.results.winner && (
                            <div className="winner">
                              Winner: <strong>{experiment.results.winner}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="experiment-actions">
                      {experiment.status === 'draft' && (
                        <button 
                          className="start-btn"
                          onClick={() => startExperiment(experiment.id)}
                        >
                          Start Experiment
                        </button>
                      )}
                      {experiment.status === 'running' && (
                        <button 
                          className="stop-btn"
                          onClick={() => stopExperiment(experiment.id, 'manual')}
                        >
                          Stop Experiment
                        </button>
                      )}
                      <button 
                        className="details-btn"
                        onClick={() => setSelectedExperiment(experiment)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="insights-tab">
            <div className="tab-header">
              <h3>Automated Insights & Recommendations</h3>
              <div className="insights-stats">
                <span className="stat">Total: {insights.length}</span>
                <span className="stat">High Priority: {insights.filter(i => i.priority === 'high').length}</span>
                <span className="stat">Actionable: {insights.filter(i => i.actionable).length}</span>
              </div>
            </div>

            {/* Insights List */}
            <div className="insights-list">
              {insights
                .sort((a, b) => {
                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                })
                .map(insight => (
                  <div key={insight.id} className="insight-card detailed">
                    <div className="insight-header">
                      <div className="insight-meta">
                        <span 
                          className="insight-priority"
                          style={{ backgroundColor: getPriorityColor(insight.priority) }}
                        >
                          {insight.priority} priority
                        </span>
                        <span className="insight-type">{insight.type.replace('_', ' ')}</span>
                        <span className="insight-date">{formatDate(insight.createdAt)}</span>
                      </div>
                      <h4>{insight.title}</h4>
                    </div>

                    <div className="insight-content">
                      <p className="insight-description">{insight.description}</p>
                      
                      {insight.actionable && insight.recommendation && (
                        <div className="insight-recommendation">
                          <strong>💡 Recommendation:</strong>
                          <p>{insight.recommendation}</p>
                        </div>
                      )}
                    </div>

                    {insight.actionable && (
                      <div className="insight-actions">
                        <button className="action-btn primary">
                          Take Action
                        </button>
                        <button className="action-btn secondary">
                          Learn More
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {insights.length === 0 && (
              <div className="no-insights">
                <div className="no-insights-icon">💡</div>
                <h4>No insights available yet</h4>
                <p>Insights will be generated as your community grows and more data becomes available.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Experiment Details Modal */}
      {selectedExperiment && (
        <div className="modal-overlay">
          <div className="modal experiment-details-modal">
            <div className="modal-header">
              <h2>{selectedExperiment.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedExperiment(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="experiment-overview">
                <div className="experiment-meta">
                  <div className="meta-item">
                    <span className="label">Type:</span>
                    <span className="value">{selectedExperiment.type}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Status:</span>
                    <span 
                      className="value status"
                      style={{ color: getExperimentStatusColor(selectedExperiment.status) }}
                    >
                      {selectedExperiment.status}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Target Audience:</span>
                    <span className="value">{selectedExperiment.targetAudience}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Success Metrics:</span>
                    <span className="value">{selectedExperiment.successMetrics.join(', ')}</span>
                  </div>
                </div>

                <div className="experiment-description">
                  <h4>Description</h4>
                  <p>{selectedExperiment.description}</p>
                </div>

                {selectedExperiment.variants && (
                  <div className="variants-details">
                    <h4>Variants</h4>
                    <div className="variants-comparison">
                      <div className="variant-detail">
                        <h5>Control Group</h5>
                        <div className="participant-count">
                          {selectedExperiment.variants.control.participants.length} participants
                        </div>
                        <p>{selectedExperiment.variants.control.description}</p>
                        
                        {selectedExperiment.variants.control.metrics && (
                          <div className="variant-metrics">
                            {Object.entries(selectedExperiment.variants.control.metrics).map(([metric, data]) => (
                              <div key={metric} className="metric-item">
                                <span className="metric-name">{metric.replace('_', ' ')}:</span>
                                <span className="metric-value">{data.average.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="variant-detail">
                        <h5>Variant Group</h5>
                        <div className="participant-count">
                          {selectedExperiment.variants.variant.participants.length} participants
                        </div>
                        <p>{selectedExperiment.variants.variant.description}</p>
                        
                        {selectedExperiment.variants.variant.metrics && (
                          <div className="variant-metrics">
                            {Object.entries(selectedExperiment.variants.variant.metrics).map(([metric, data]) => (
                              <div key={metric} className="metric-item">
                                <span className="metric-name">{metric.replace('_', ' ')}:</span>
                                <span className="metric-value">{data.average.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedExperiment.results && selectedExperiment.results.summary && (
                  <div className="experiment-results">
                    <h4>Results</h4>
                    <div className="results-summary">
                      <p>{selectedExperiment.results.summary}</p>
                      
                      {selectedExperiment.results.confidence && (
                        <div className="statistical-significance">
                          <div>Confidence: {selectedExperiment.results.confidence.toFixed(1)}%</div>
                          {selectedExperiment.results.winner && (
                            <div>Winner: <strong>{selectedExperiment.results.winner}</strong></div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedExperiment(null)}
              >
                Close
              </button>
              {selectedExperiment.status === 'draft' && (
                <button 
                  className="start-modal-btn"
                  onClick={() => {
                    startExperiment(selectedExperiment.id);
                    setSelectedExperiment(null);
                  }}
                >
                  Start Experiment
                </button>
              )}
              {selectedExperiment.status === 'running' && (
                <button 
                  className="stop-modal-btn"
                  onClick={() => {
                    stopExperiment(selectedExperiment.id, 'manual');
                    setSelectedExperiment(null);
                  }}
                >
                  Stop Experiment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityGrowthAnalytics;