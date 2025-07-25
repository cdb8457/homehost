import React, { useState, useEffect, useCallback } from 'react';
import './CommunityManager.css';

/**
 * CommunityManager Component - Epic 2: Community Infrastructure
 * 
 * React component for managing community features in the HomeHost desktop application.
 * Provides interfaces for community profiles, cross-server player management,
 * social discovery, analytics, and invitation systems.
 */
const CommunityManager = () => {
  const [communities, setCommunities] = useState([]);
  const [players, setPlayers] = useState([]);
  const [socialActivity, setSocialActivity] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Form states
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    logo: '',
    settings: {
      joinRequirement: 'Open',
      allowedGames: [],
      moderationLevel: 'Standard',
      publicProfile: true
    }
  });

  const [newInvitation, setNewInvitation] = useState({
    expiresAt: '',
    maxUses: null,
    discordIntegration: false
  });

  // Initialize component
  useEffect(() => {
    initializeCommunityManager();
  }, []);

  const initializeCommunityManager = async () => {
    try {
      setIsLoading(true);

      // Load communities
      const communitiesData = await window.electronAPI.invoke('community-manager:get-communities');
      setCommunities(communitiesData || []);

      // Load player database
      const playersData = await window.electronAPI.invoke('community-manager:get-players');
      setPlayers(playersData || []);

      // Load social activity
      const activityData = await window.electronAPI.invoke('community-manager:get-social-activity');
      setSocialActivity(activityData || []);

      // Load recommendations
      const recommendationsData = await window.electronAPI.invoke('community-manager:get-recommendations');
      setRecommendations(recommendationsData || []);

      // Set up real-time listeners
      window.electronAPI.on('community-updated', handleCommunityUpdate);
      window.electronAPI.on('social-activity', handleSocialActivity);
      window.electronAPI.on('analytics-updated', handleAnalyticsUpdate);

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize CommunityManager:', error);
      setIsLoading(false);
    }
  };

  const handleCommunityUpdate = useCallback((data) => {
    setCommunities(prev => {
      const updated = [...prev];
      const index = updated.findIndex(c => c.id === data.communityId);
      if (index >= 0) {
        updated[index] = data.community;
      } else {
        updated.push(data.community);
      }
      return updated;
    });
  }, []);

  const handleSocialActivity = useCallback((activity) => {
    setSocialActivity(prev => [activity, ...prev.slice(0, 19)]);
  }, []);

  const handleAnalyticsUpdate = useCallback((data) => {
    setAnalytics(prev => ({ ...prev, [data.communityId]: data.analytics }));
  }, []);

  // Community Management
  const createCommunity = async () => {
    try {
      const community = await window.electronAPI.invoke('community-manager:create-community', newCommunity);
      setCommunities(prev => [community, ...prev]);
      setShowCreateModal(false);
      setNewCommunity({
        name: '',
        description: '',
        logo: '',
        settings: {
          joinRequirement: 'Open',
          allowedGames: [],
          moderationLevel: 'Standard',
          publicProfile: true
        }
      });
    } catch (error) {
      console.error('Failed to create community:', error);
      alert('Failed to create community: ' + error.message);
    }
  };

  const addServerToCommunity = async (serverId, communityId, serverData) => {
    try {
      await window.electronAPI.invoke('community-manager:add-server', { serverId, communityId, serverData });
      // Refresh communities
      const updatedCommunities = await window.electronAPI.invoke('community-manager:get-communities');
      setCommunities(updatedCommunities);
    } catch (error) {
      console.error('Failed to add server to community:', error);
      alert('Failed to add server to community: ' + error.message);
    }
  };

  const createInvitation = async (communityId) => {
    try {
      const invitation = await window.electronAPI.invoke('community-manager:create-invitation', {
        communityId,
        ...newInvitation
      });
      
      alert(`Invitation created! Share this link: ${invitation.shareableLink}`);
      
      // Reset form
      setNewInvitation({
        expiresAt: '',
        maxUses: null,
        discordIntegration: false
      });
    } catch (error) {
      console.error('Failed to create invitation:', error);
      alert('Failed to create invitation: ' + error.message);
    }
  };

  // Player Management
  const banPlayerFromCommunity = async (playerId, communityId, reason) => {
    try {
      await window.electronAPI.invoke('community-manager:ban-player', {
        playerId,
        communityId,
        reason
      });
      alert('Player banned successfully');
    } catch (error) {
      console.error('Failed to ban player:', error);
      alert('Failed to ban player: ' + error.message);
    }
  };

  const updatePlayerReputation = async (playerId, action, value) => {
    try {
      await window.electronAPI.invoke('community-manager:update-reputation', {
        playerId,
        action,
        value
      });
    } catch (error) {
      console.error('Failed to update player reputation:', error);
    }
  };

  // Utility Functions
  const formatMemberCount = (count) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  const getJoinTypeIcon = (joinType) => {
    switch (joinType) {
      case 'Open': return '🟢';
      case 'Application': return '🟡';
      case 'InviteOnly': return '🔴';
      default: return '⚪';
    }
  };

  const getReputationLevel = (reputation) => {
    if (reputation >= 150) return { level: 'Excellent', color: '#10B981' };
    if (reputation >= 120) return { level: 'Good', color: '#3B82F6' };
    if (reputation >= 80) return { level: 'Fair', color: '#F59E0B' };
    return { level: 'Poor', color: '#EF4444' };
  };

  if (isLoading) {
    return (
      <div className="community-loading">
        <div className="loading-spinner"></div>
        <p>Loading Community Manager...</p>
      </div>
    );
  }

  return (
    <div className="community-manager">
      {/* Header */}
      <div className="community-header">
        <div className="header-title">
          <h1>🏘️ Community Manager</h1>
          <p>Manage your gaming communities and discover new ones</p>
        </div>
        <div className="header-actions">
          <button 
            className="create-community-btn"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Create Community
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="community-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('communities')}
        >
          🏘️ My Communities
        </button>
        <button 
          className={`tab ${activeTab === 'discovery' ? 'active' : ''}`}
          onClick={() => setActiveTab('discovery')}
        >
          🔍 Discover
        </button>
        <button 
          className={`tab ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          👥 Players
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="community-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">🏘️</div>
                <div className="stat-info">
                  <h3>{communities.length}</h3>
                  <p>Communities</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{players.length}</h3>
                  <p>Players</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎮</div>
                <div className="stat-info">
                  <h3>{communities.reduce((acc, c) => acc + c.servers.length, 0)}</h3>
                  <p>Servers</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <h3>{socialActivity.length}</h3>
                  <p>Activities</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>🔔 Recent Activity</h3>
              <div className="activity-list">
                {socialActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {activity.type === 'player_joined' && '👋'}
                      {activity.type === 'player_left' && '👋'}
                      {activity.type === 'community_joined' && '🏘️'}
                      {activity.type === 'server_started' && '🎮'}
                    </div>
                    <div className="activity-info">
                      <p>
                        <strong>{activity.playerName}</strong> {activity.type.replace('_', ' ')} 
                        {activity.serverName && ` ${activity.serverName}`}
                      </p>
                      <span className="activity-time">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="recommendations">
              <h3>✨ Recommended Communities</h3>
              <div className="recommendation-list">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="rec-header">
                      <h4>{rec.community.name}</h4>
                      <span className="rec-score">{Math.round(rec.score)}% match</span>
                    </div>
                    <p>{rec.community.description}</p>
                    <div className="rec-reasons">
                      {rec.reasons.slice(0, 2).map((reason, idx) => (
                        <span key={idx} className="reason-tag">{reason}</span>
                      ))}
                    </div>
                    <button className="join-btn">Join Community</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Communities Tab */}
        {activeTab === 'communities' && (
          <div className="communities-tab">
            {communities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏘️</div>
                <h3>No Communities Yet</h3>
                <p>Create your first community to get started</p>
                <button 
                  className="create-community-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Community
                </button>
              </div>
            ) : (
              <div className="community-grid">
                {communities.map(community => (
                  <div key={community.id} className="community-card">
                    <div className="community-header">
                      <div className="community-logo">
                        {community.logo ? (
                          <img src={community.logo} alt={community.name} />
                        ) : (
                          <div className="default-logo">{community.name.charAt(0)}</div>
                        )}
                      </div>
                      <div className="community-info">
                        <h3>{community.name}</h3>
                        <p>{community.description}</p>
                        <div className="community-meta">
                          <span>{getJoinTypeIcon(community.settings.joinRequirement)} {community.settings.joinRequirement}</span>
                          <span>👥 {formatMemberCount(community.memberCount)}</span>
                          <span>🎮 {community.servers.length} servers</span>
                        </div>
                      </div>
                    </div>
                    <div className="community-actions">
                      <button 
                        onClick={() => setSelectedCommunity(community)}
                        className="manage-btn"
                      >
                        Manage
                      </button>
                      <button 
                        onClick={() => createInvitation(community.id)}
                        className="invite-btn"
                      >
                        Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discovery Tab */}
        {activeTab === 'discovery' && (
          <div className="discovery-tab">
            <div className="discovery-header">
              <h3>🔍 Discover Communities</h3>
              <div className="discovery-filters">
                <select>
                  <option value="">All Games</option>
                  <option value="valheim">Valheim</option>
                  <option value="rust">Rust</option>
                  <option value="cs2">Counter-Strike 2</option>
                </select>
                <select>
                  <option value="">All Sizes</option>
                  <option value="small">Small (≤100)</option>
                  <option value="medium">Medium (100-500)</option>
                  <option value="large">Large (500+)</option>
                </select>
              </div>
            </div>
            
            <div className="discovery-grid">
              {recommendations.map((rec, index) => (
                <div key={index} className="discovery-card">
                  <div className="discovery-header">
                    <h4>{rec.community.name}</h4>
                    <span className="match-score">{Math.round(rec.score)}% match</span>
                  </div>
                  <p>{rec.community.description}</p>
                  <div className="community-stats">
                    <span>👥 {formatMemberCount(rec.community.memberCount)}</span>
                    <span>🎮 {rec.community.servers.length} servers</span>
                    <span>⭐ {rec.community.socialProof.rating.toFixed(1)}</span>
                  </div>
                  <div className="match-reasons">
                    {rec.reasons.slice(0, 2).map((reason, idx) => (
                      <span key={idx} className="reason-badge">{reason}</span>
                    ))}
                  </div>
                  <button className="join-community-btn">Join Community</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players Tab */}
        {activeTab === 'players' && (
          <div className="players-tab">
            <div className="players-header">
              <h3>👥 Cross-Server Player Management</h3>
              <div className="player-search">
                <input type="text" placeholder="Search players..." />
              </div>
            </div>
            
            <div className="players-table">
              <div className="table-header">
                <div>Player</div>
                <div>Reputation</div>
                <div>Communities</div>
                <div>Last Seen</div>
                <div>Actions</div>
              </div>
              {players.slice(0, 10).map(player => {
                const reputation = getReputationLevel(player.reputation);
                return (
                  <div key={player.id} className="table-row">
                    <div className="player-info">
                      <strong>{player.name}</strong>
                      {player.steamId && <span className="steam-id">Steam: {player.steamId}</span>}
                    </div>
                    <div className="reputation">
                      <span 
                        className="reputation-badge"
                        style={{ backgroundColor: reputation.color }}
                      >
                        {player.reputation} ({reputation.level})
                      </span>
                    </div>
                    <div>{player.communities.length}</div>
                    <div>{new Date(player.lastSeen).toLocaleDateString()}</div>
                    <div className="player-actions">
                      <button 
                        onClick={() => banPlayerFromCommunity(player.id, selectedCommunity?.id, 'Manual ban')}
                        className="ban-btn"
                        disabled={!selectedCommunity}
                      >
                        Ban
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-header">
              <h3>📈 Community Analytics</h3>
              <select 
                value={selectedCommunity?.id || ''}
                onChange={(e) => {
                  const community = communities.find(c => c.id === e.target.value);
                  setSelectedCommunity(community);
                }}
              >
                <option value="">Select Community</option>
                {communities.map(community => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCommunity ? (
              <div className="analytics-dashboard">
                <div className="analytics-cards">
                  <div className="analytics-card">
                    <h4>👥 Total Members</h4>
                    <div className="metric">{selectedCommunity.analytics.totalMembers}</div>
                    <div className="trend positive">↗️ +{selectedCommunity.analytics.newMembersToday || 0} today</div>
                  </div>
                  <div className="analytics-card">
                    <h4>🎯 Active Members</h4>
                    <div className="metric">{selectedCommunity.analytics.activeMembers}</div>
                    <div className="percentage">
                      {Math.round((selectedCommunity.analytics.activeMembers / selectedCommunity.analytics.totalMembers) * 100)}% of total
                    </div>
                  </div>
                  <div className="analytics-card">
                    <h4>🎮 Servers</h4>
                    <div className="metric">{selectedCommunity.analytics.serverCount}</div>
                    <div className="trend">All running</div>
                  </div>
                  <div className="analytics-card">
                    <h4>⏰ Avg Playtime</h4>
                    <div className="metric">{selectedCommunity.analytics.avgPlaytime}m</div>
                    <div className="trend">Per session</div>
                  </div>
                </div>

                <div className="analytics-charts">
                  <div className="chart-placeholder">
                    <h4>📊 Member Growth</h4>
                    <div className="chart-mock">
                      <div className="chart-bars">
                        <div className="bar" style={{ height: '60%' }}></div>
                        <div className="bar" style={{ height: '75%' }}></div>
                        <div className="bar" style={{ height: '85%' }}></div>
                        <div className="bar" style={{ height: '90%' }}></div>
                        <div className="bar" style={{ height: '100%' }}></div>
                      </div>
                      <div className="chart-labels">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-community-selected">
                <p>Select a community to view analytics</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Community</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Community Name</label>
                <input
                  type="text"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter community name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your community"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Join Requirement</label>
                <select
                  value={newCommunity.settings.joinRequirement}
                  onChange={(e) => setNewCommunity(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, joinRequirement: e.target.value }
                  }))}
                >
                  <option value="Open">Open - Anyone can join</option>
                  <option value="Application">Application Required</option>
                  <option value="InviteOnly">Invite Only</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newCommunity.settings.publicProfile}
                    onChange={(e) => setNewCommunity(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, publicProfile: e.target.checked }
                    }))}
                  />
                  Make profile public (discoverable)
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={createCommunity}
                disabled={!newCommunity.name.trim()}
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Community Details Modal */}
      {selectedCommunity && (
        <div className="modal-overlay">
          <div className="modal large">
            <div className="modal-header">
              <h3>{selectedCommunity.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedCommunity(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
              <div className="community-details">
                <div className="detail-section">
                  <h4>📊 Overview</h4>
                  <div className="detail-grid">
                    <div><strong>Members:</strong> {selectedCommunity.memberCount}</div>
                    <div><strong>Servers:</strong> {selectedCommunity.servers.length}</div>
                    <div><strong>Join Type:</strong> {selectedCommunity.settings.joinRequirement}</div>
                    <div><strong>Created:</strong> {new Date(selectedCommunity.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>🎮 Servers</h4>
                  <div className="servers-list">
                    {selectedCommunity.servers.map((server, index) => (
                      <div key={index} className="server-item">
                        <div><strong>{server.name}</strong></div>
                        <div>{server.gameType}</div>
                        <div>{server.isActive ? '🟢 Active' : '🔴 Inactive'}</div>
                      </div>
                    ))}
                    {selectedCommunity.servers.length === 0 && (
                      <p>No servers added yet</p>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h4>📬 Create Invitation</h4>
                  <div className="invitation-form">
                    <div className="form-row">
                      <label>Expires At:</label>
                      <input
                        type="datetime-local"
                        value={newInvitation.expiresAt}
                        onChange={(e) => setNewInvitation(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                    <div className="form-row">
                      <label>Max Uses:</label>
                      <input
                        type="number"
                        value={newInvitation.maxUses || ''}
                        onChange={(e) => setNewInvitation(prev => ({ ...prev, maxUses: e.target.value ? parseInt(e.target.value) : null }))}
                        placeholder="Unlimited"
                      />
                    </div>
                    <div className="form-row">
                      <label>
                        <input
                          type="checkbox"
                          checked={newInvitation.discordIntegration}
                          onChange={(e) => setNewInvitation(prev => ({ ...prev, discordIntegration: e.target.checked }))}
                        />
                        Discord Integration
                      </label>
                    </div>
                    <button 
                      className="create-invitation-btn"
                      onClick={() => createInvitation(selectedCommunity.id)}
                    >
                      Create Invitation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityManager;