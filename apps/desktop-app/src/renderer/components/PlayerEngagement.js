import React, { useState, useEffect, useCallback } from 'react';
import './PlayerEngagement.css';

/**
 * PlayerEngagement Component - Epic 4: Story 4.2: Player Engagement Monetization
 * 
 * Provides valuable perks and services to community members, generating revenue 
 * while improving the player experience through VIP memberships, cosmetic rewards,
 * event ticketing, and donation systems.
 */
const PlayerEngagement = () => {
  const [vipMembers, setVipMembers] = useState([]);
  const [cosmeticRewards, setCosmeticRewards] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [events, setEvents] = useState([]);
  const [donations, setDonations] = useState([]);
  const [vipTiers, setVipTiers] = useState({});
  const [cosmeticCategories, setCosmeticCategories] = useState({});
  const [eventTypes, setEventTypes] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVipTier, setSelectedVipTier] = useState('silver');
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Initialize component
  useEffect(() => {
    initializePlayerEngagement();
  }, []);

  // Set up real-time listeners
  useEffect(() => {
    const handlers = {
      'vip-membership-purchased': handleVipMembershipPurchased,
      'vip-membership-renewed': handleVipMembershipRenewed,
      'vip-membership-expired': handleVipMembershipExpired,
      'cosmetic-purchased': handleCosmeticPurchased,
      'event-created': handleEventCreated,
      'event-ticket-purchased': handleEventTicketPurchased,
      'event-started': handleEventStarted,
      'event-completed': handleEventCompleted,
      'donation-processed': handleDonationProcessed
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

  const initializePlayerEngagement = async () => {
    try {
      setIsLoading(true);

      // Load VIP members
      const vip = await window.electronAPI.invoke('player-engagement:get-vip-members');
      setVipMembers(vip || []);

      // Load cosmetic rewards
      const cosmetics = await window.electronAPI.invoke('player-engagement:get-cosmetics');
      setCosmeticRewards(cosmetics || []);

      // Load merchandise
      const merch = await window.electronAPI.invoke('player-engagement:get-merchandise');
      setMerchandise(merch || []);

      // Load events
      const eventList = await window.electronAPI.invoke('player-engagement:get-events');
      setEvents(eventList || []);

      // Load donations
      const donationList = await window.electronAPI.invoke('player-engagement:get-donations');
      setDonations(donationList || []);

      // Load configuration data
      const tiers = await window.electronAPI.invoke('player-engagement:get-vip-tiers');
      setVipTiers(tiers || {});

      const categories = await window.electronAPI.invoke('player-engagement:get-cosmetic-categories');
      setCosmeticCategories(categories || {});

      const types = await window.electronAPI.invoke('player-engagement:get-event-types');
      setEventTypes(types || {});

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to initialize player engagement:', error);
      setIsLoading(false);
    }
  };

  const handleVipMembershipPurchased = useCallback((data) => {
    setVipMembers(prev => [data.membership, ...prev]);
  }, []);

  const handleVipMembershipRenewed = useCallback((data) => {
    setVipMembers(prev => 
      prev.map(member => member.id === data.membership.id ? data.membership : member)
    );
  }, []);

  const handleVipMembershipExpired = useCallback((data) => {
    setVipMembers(prev => 
      prev.map(member => member.id === data.membership.id ? data.membership : member)
    );
  }, []);

  const handleCosmeticPurchased = useCallback((data) => {
    setCosmeticRewards(prev => [data.reward, ...prev]);
  }, []);

  const handleEventCreated = useCallback((data) => {
    setEvents(prev => [data.event, ...prev]);
  }, []);

  const handleEventTicketPurchased = useCallback((data) => {
    setEvents(prev => 
      prev.map(event => event.id === data.event.id ? data.event : event)
    );
  }, []);

  const handleEventStarted = useCallback((data) => {
    setEvents(prev => 
      prev.map(event => event.id === data.eventId ? { ...event, status: 'active' } : event)
    );
  }, []);

  const handleEventCompleted = useCallback((data) => {
    setEvents(prev => 
      prev.map(event => event.id === data.eventId ? { ...event, status: 'completed' } : event)
    );
  }, []);

  const handleDonationProcessed = useCallback((data) => {
    setDonations(prev => [data.donation, ...prev]);
  }, []);

  // VIP Actions
  const purchaseVipMembership = async (tier, duration, paymentMethod = 'stripe') => {
    try {
      const membership = await window.electronAPI.invoke('player-engagement:purchase-vip', {
        userId: 'demo-user-' + Date.now(),
        tier,
        duration,
        paymentMethod
      });
      console.log('VIP membership purchased:', membership);
    } catch (error) {
      console.error('Failed to purchase VIP membership:', error);
      alert('Failed to purchase VIP membership: ' + error.message);
    }
  };

  // Cosmetic Actions
  const purchaseCosmetic = async (category, itemId, paymentMethod = 'stripe') => {
    try {
      const reward = await window.electronAPI.invoke('player-engagement:purchase-cosmetic', {
        userId: 'demo-user-' + Date.now(),
        category,
        itemId,
        paymentMethod
      });
      console.log('Cosmetic purchased:', reward);
    } catch (error) {
      console.error('Failed to purchase cosmetic:', error);
      alert('Failed to purchase cosmetic: ' + error.message);
    }
  };

  // Event Actions
  const createEvent = async (eventData) => {
    try {
      const event = await window.electronAPI.invoke('player-engagement:create-event', {
        ...eventData,
        createdBy: 'admin'
      });
      console.log('Event created:', event);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event: ' + error.message);
    }
  };

  const purchaseEventTicket = async (eventId, paymentMethod = 'stripe') => {
    try {
      const ticket = await window.electronAPI.invoke('player-engagement:purchase-ticket', {
        userId: 'demo-user-' + Date.now(),
        eventId,
        paymentMethod
      });
      console.log('Event ticket purchased:', ticket);
    } catch (error) {
      console.error('Failed to purchase event ticket:', error);
      alert('Failed to purchase event ticket: ' + error.message);
    }
  };

  // Donation Actions
  const processDonation = async (donationData) => {
    try {
      const donation = await window.electronAPI.invoke('player-engagement:process-donation', {
        ...donationData,
        userId: 'demo-user-' + Date.now()
      });
      console.log('Donation processed:', donation);
    } catch (error) {
      console.error('Failed to process donation:', error);
      alert('Failed to process donation: ' + error.message);
    }
  };

  // Utility functions
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVipTierColor = (tier) => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      diamond: '#b9f2ff'
    };
    return colors[tier] || '#9aa0a6';
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9e9e9e',
      uncommon: '#4caf50',
      rare: '#2196f3',
      epic: '#9c27b0',
      legendary: '#ff9800'
    };
    return colors[rarity] || '#9e9e9e';
  };

  if (isLoading) {
    return (
      <div className="engagement-loading">
        <div className="loading-spinner"></div>
        <p>Loading Player Engagement...</p>
      </div>
    );
  }

  return (
    <div className="player-engagement">
      {/* Header */}
      <div className="engagement-header">
        <div className="header-title">
          <h1>🎮 Player Engagement</h1>
          <p>Monetize your community while enhancing the player experience</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-number">{vipMembers.filter(m => m.status === 'active').length}</span>
            <span className="stat-label">Active VIPs</span>
          </div>
          <div className="stat">
            <span className="stat-number">{events.filter(e => e.status === 'upcoming').length}</span>
            <span className="stat-label">Upcoming Events</span>
          </div>
          <div className="stat">
            <span className="stat-number">{donations.length}</span>
            <span className="stat-label">Total Donations</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="engagement-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'vip' ? 'active' : ''}`}
          onClick={() => setActiveTab('vip')}
        >
          👑 VIP Memberships
        </button>
        <button 
          className={`tab ${activeTab === 'cosmetics' ? 'active' : ''}`}
          onClick={() => setActiveTab('cosmetics')}
        >
          🎨 Cosmetic Rewards
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          🎫 Events & Tickets
        </button>
        <button 
          className={`tab ${activeTab === 'merchandise' ? 'active' : ''}`}
          onClick={() => setActiveTab('merchandise')}
        >
          🛍️ Merchandise
        </button>
        <button 
          className={`tab ${activeTab === 'donations' ? 'active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          💝 Donations & Tips
        </button>
      </div>

      <div className="engagement-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* VIP Membership Overview */}
            <div className="overview-section">
              <h3>VIP Membership Distribution</h3>
              <div className="vip-distribution">
                {Object.entries(vipTiers).map(([tierId, tier]) => {
                  const memberCount = vipMembers.filter(m => m.tier === tierId && m.status === 'active').length;
                  return (
                    <div key={tierId} className="vip-tier-stat">
                      <div className="tier-icon" style={{ color: tier.color }}>
                        {tier.icon}
                      </div>
                      <div className="tier-info">
                        <div className="tier-name">{tier.name}</div>
                        <div className="tier-count">{memberCount} members</div>
                        <div className="tier-revenue">
                          {formatCurrency(memberCount * tier.price.monthly)}/month
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="overview-section">
              <h3>Recent Activity</h3>
              <div className="activity-feed">
                {[...donations.slice(0, 3), ...vipMembers.slice(0, 2)].map((item, index) => (
                  <div key={index} className="activity-item">
                    {item.amount ? (
                      <>
                        <div className="activity-icon">💝</div>
                        <div className="activity-text">
                          <strong>{item.isAnonymous ? 'Anonymous' : `User ${item.userId}`}</strong> donated {formatCurrency(item.amount)}
                          {item.message && <div className="activity-message">"{item.message}"</div>}
                        </div>
                        <div className="activity-time">{formatDate(item.date)}</div>
                      </>
                    ) : (
                      <>
                        <div className="activity-icon">👑</div>
                        <div className="activity-text">
                          <strong>User {item.userId}</strong> purchased {vipTiers[item.tier]?.name} VIP
                        </div>
                        <div className="activity-time">{formatDate(item.startDate)}</div>
                      </>
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
                  onClick={() => purchaseVipMembership('silver', 'monthly')}
                >
                  👑 Test VIP Purchase
                </button>
                <button 
                  className="action-btn"
                  onClick={() => createEvent({
                    name: 'Weekly Tournament',
                    type: 'tournament',
                    description: 'Competitive gaming tournament',
                    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    endDate: new Date(Date.now() + 25 * 60 * 60 * 1000),
                    price: 5,
                    maxParticipants: 32
                  })}
                >
                  🎫 Create Test Event
                </button>
                <button 
                  className="action-btn"
                  onClick={() => processDonation({
                    amount: 25,
                    message: 'Keep up the great work!',
                    recipient: 'community',
                    paymentMethod: 'stripe'
                  })}
                >
                  💝 Test Donation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIP Memberships Tab */}
        {activeTab === 'vip' && (
          <div className="vip-tab">
            <div className="tab-header">
              <h3>VIP Membership Management</h3>
              <div className="vip-controls">
                <select
                  value={selectedVipTier}
                  onChange={(e) => setSelectedVipTier(e.target.value)}
                  className="tier-select"
                >
                  {Object.entries(vipTiers).map(([tierId, tier]) => (
                    <option key={tierId} value={tierId}>
                      {tier.icon} {tier.name}
                    </option>
                  ))}
                </select>
                <button 
                  className="purchase-vip-btn"
                  onClick={() => purchaseVipMembership(selectedVipTier, 'monthly')}
                >
                  Purchase VIP
                </button>
              </div>
            </div>

            {/* VIP Tiers Display */}
            <div className="vip-tiers">
              {Object.entries(vipTiers).map(([tierId, tier]) => (
                <div key={tierId} className="vip-tier-card">
                  <div className="tier-header">
                    <div className="tier-icon" style={{ color: tier.color }}>
                      {tier.icon}
                    </div>
                    <div className="tier-title">
                      <h4 style={{ color: tier.color }}>{tier.name}</h4>
                      <div className="tier-pricing">
                        <span className="monthly-price">{formatCurrency(tier.price.monthly)}/month</span>
                        <span className="yearly-price">{formatCurrency(tier.price.yearly)}/year</span>
                      </div>
                    </div>
                  </div>

                  <div className="tier-benefits">
                    <h5>Benefits:</h5>
                    <ul>
                      {tier.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="tier-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {vipMembers.filter(m => m.tier === tierId && m.status === 'active').length}
                      </span>
                      <span className="stat-label">Active Members</span>
                    </div>
                  </div>

                  <div className="tier-actions">
                    <button 
                      className="purchase-btn"
                      onClick={() => purchaseVipMembership(tierId, 'monthly')}
                    >
                      Purchase Monthly
                    </button>
                    <button 
                      className="purchase-btn yearly"
                      onClick={() => purchaseVipMembership(tierId, 'yearly')}
                    >
                      Purchase Yearly
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Current VIP Members */}
            <div className="vip-members-section">
              <h3>Current VIP Members</h3>
              <div className="members-table">
                <div className="table-header">
                  <div className="col-user">User</div>
                  <div className="col-tier">Tier</div>
                  <div className="col-start">Start Date</div>
                  <div className="col-end">End Date</div>
                  <div className="col-status">Status</div>
                  <div className="col-spent">Total Spent</div>
                </div>
                <div className="table-body">
                  {vipMembers.map(member => (
                    <div key={member.id} className="member-row">
                      <div className="col-user">User {member.userId}</div>
                      <div className="col-tier">
                        <span 
                          className="tier-badge"
                          style={{ 
                            backgroundColor: getVipTierColor(member.tier),
                            color: '#000'
                          }}
                        >
                          {vipTiers[member.tier]?.icon} {vipTiers[member.tier]?.name}
                        </span>
                      </div>
                      <div className="col-start">{formatDate(member.startDate)}</div>
                      <div className="col-end">{formatDate(member.endDate)}</div>
                      <div className="col-status">
                        <span className={`status ${member.status}`}>
                          {member.status}
                        </span>
                      </div>
                      <div className="col-spent">{formatCurrency(member.totalSpent)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cosmetics Tab */}
        {activeTab === 'cosmetics' && (
          <div className="cosmetics-tab">
            <div className="tab-header">
              <h3>Cosmetic Rewards Store</h3>
            </div>

            <div className="cosmetic-categories">
              {Object.entries(cosmeticCategories).map(([categoryId, category]) => (
                <div key={categoryId} className="cosmetic-category">
                  <div className="category-header">
                    <span className="category-icon">{category.icon}</span>
                    <h4>{category.name}</h4>
                  </div>

                  <div className="category-items">
                    {category.items.map(item => (
                      <div key={item.id} className="cosmetic-item">
                        <div className="item-info">
                          <div className="item-name">{item.name}</div>
                          <div 
                            className="item-rarity"
                            style={{ color: getRarityColor(item.rarity) }}
                          >
                            {item.rarity}
                          </div>
                        </div>
                        <div className="item-price">
                          {formatCurrency(item.price)}
                        </div>
                        <button 
                          className="purchase-cosmetic-btn"
                          onClick={() => purchaseCosmetic(categoryId, item.id)}
                        >
                          Purchase
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Cosmetic Purchases */}
            <div className="cosmetic-purchases">
              <h3>Recent Cosmetic Purchases</h3>
              <div className="purchases-list">
                {cosmeticRewards.slice(0, 10).map(reward => (
                  <div key={reward.id} className="purchase-item">
                    <div className="purchase-info">
                      <span className="user">User {reward.userId}</span>
                      <span className="item">purchased {reward.itemId}</span>
                      <span className="category">in {reward.category}</span>
                    </div>
                    <div className="purchase-details">
                      <span className="price">{formatCurrency(reward.price)}</span>
                      <span className="date">{formatDate(reward.purchaseDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="events-tab">
            <div className="tab-header">
              <h3>Event & Tournament Management</h3>
              <button 
                className="create-event-btn"
                onClick={() => createEvent({
                  name: 'New Tournament',
                  type: 'tournament',
                  description: 'Competitive gaming event',
                  startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  endDate: new Date(Date.now() + 25 * 60 * 60 * 1000),
                  price: 10,
                  maxParticipants: 32
                })}
              >
                🎫 Create Event
              </button>
            </div>

            {/* Event Types */}
            <div className="event-types">
              <h4>Available Event Types</h4>
              <div className="types-grid">
                {Object.entries(eventTypes).map(([typeId, type]) => (
                  <div key={typeId} className="event-type-card">
                    <div className="type-icon">{type.icon}</div>
                    <div className="type-info">
                      <h5>{type.name}</h5>
                      <div className="type-details">
                        <div>Base Price: {formatCurrency(type.basePrice)}</div>
                        <div>Max Participants: {type.maxParticipants}</div>
                      </div>
                      <div className="type-features">
                        {type.features.map((feature, index) => (
                          <span key={index} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events List */}
            <div className="events-list">
              <h4>Scheduled Events</h4>
              <div className="events-grid">
                {events.map(event => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <div className="event-icon">
                        {eventTypes[event.type]?.icon || '🎫'}
                      </div>
                      <div className="event-title">
                        <h5>{event.name}</h5>
                        <span className="event-type">{event.type}</span>
                      </div>
                      <div className={`event-status ${event.status}`}>
                        {event.status}
                      </div>
                    </div>

                    <div className="event-details">
                      <div className="event-info">
                        <div>📅 {formatDate(event.startDate)}</div>
                        <div>💰 {formatCurrency(event.price)}</div>
                        <div>👥 {event.participants.length}/{event.maxParticipants}</div>
                      </div>
                      
                      {event.description && (
                        <div className="event-description">
                          {event.description}
                        </div>
                      )}
                    </div>

                    <div className="event-actions">
                      {event.status === 'upcoming' && (
                        <button 
                          className="purchase-ticket-btn"
                          onClick={() => purchaseEventTicket(event.id)}
                          disabled={event.participants.length >= event.maxParticipants}
                        >
                          {event.participants.length >= event.maxParticipants ? 'Sold Out' : 'Buy Ticket'}
                        </button>
                      )}
                      <button 
                        className="view-details-btn"
                        onClick={() => setSelectedEvent(event)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Merchandise Tab */}
        {activeTab === 'merchandise' && (
          <div className="merchandise-tab">
            <div className="tab-header">
              <h3>Community Merchandise Store</h3>
            </div>

            <div className="merchandise-grid">
              {merchandise.map(item => (
                <div key={item.id} className="merchandise-card">
                  <div className="item-image">
                    <div className="placeholder-image">
                      {item.category === 'apparel' ? '👕' : 
                       item.category === 'accessories' ? '🖱️' : '🎁'}
                    </div>
                  </div>

                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                    <div className="item-price">{formatCurrency(item.price)}</div>

                    <div className="item-variants">
                      {item.variants.map((variant, index) => (
                        <div key={index} className="variant">
                          <span className="variant-info">
                            {variant.size} - {variant.color}
                          </span>
                          <span className="variant-stock">
                            Stock: {variant.stock}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button className="purchase-merchandise-btn">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="donations-tab">
            <div className="tab-header">
              <h3>Donations & Community Support</h3>
              <button 
                className="test-donation-btn"
                onClick={() => processDonation({
                  amount: 15,
                  message: 'Thanks for the awesome community!',
                  recipient: 'community',
                  paymentMethod: 'stripe'
                })}
              >
                💝 Test Donation
              </button>
            </div>

            {/* Donation Tiers */}
            <div className="donation-tiers">
              <h4>Suggested Donation Amounts</h4>
              <div className="tiers-grid">
                {[5, 10, 25, 50, 100].map(amount => (
                  <div key={amount} className="donation-tier">
                    <div className="tier-amount">{formatCurrency(amount)}</div>
                    <div className="tier-perks">
                      {amount >= 10 && <div className="perk">🏆 Supporter Badge</div>}
                      {amount >= 25 && <div className="perk">🎨 Custom Chat Color</div>}
                      {amount >= 50 && <div className="perk">👑 7-Day VIP Trial</div>}
                      {amount >= 100 && <div className="perk">🎖️ Custom Title</div>}
                    </div>
                    <button 
                      className="donate-btn"
                      onClick={() => processDonation({
                        amount,
                        message: `Thanks for the ${formatCurrency(amount)} support!`,
                        recipient: 'community',
                        paymentMethod: 'stripe'
                      })}
                    >
                      Donate
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Donations */}
            <div className="recent-donations">
              <h4>Recent Donations</h4>
              <div className="donations-feed">
                {donations.map(donation => (
                  <div key={donation.id} className="donation-item">
                    <div className="donation-header">
                      <div className="donor-info">
                        <span className="donor-name">
                          {donation.isAnonymous ? 'Anonymous Supporter' : `User ${donation.userId}`}
                        </span>
                        <span className="donation-amount">
                          {formatCurrency(donation.amount)}
                        </span>
                      </div>
                      <div className="donation-date">
                        {formatDate(donation.date)}
                      </div>
                    </div>

                    {donation.message && (
                      <div className="donation-message">
                        "{donation.message}"
                      </div>
                    )}

                    {donation.perks.length > 0 && (
                      <div className="donation-perks">
                        <span className="perks-label">Perks unlocked:</span>
                        {donation.perks.map((perk, index) => (
                          <span key={index} className="perk-badge">
                            {perk.type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay">
          <div className="modal event-details-modal">
            <div className="modal-header">
              <h2>{selectedEvent.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedEvent(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="event-overview">
                <div className="event-meta">
                  <div className="meta-item">
                    <span className="label">Type:</span>
                    <span className="value">{selectedEvent.type}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Price:</span>
                    <span className="value">{formatCurrency(selectedEvent.price)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Participants:</span>
                    <span className="value">
                      {selectedEvent.participants.length}/{selectedEvent.maxParticipants}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Status:</span>
                    <span className={`value status ${selectedEvent.status}`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>

                <div className="event-description">
                  <h4>Description</h4>
                  <p>{selectedEvent.description}</p>
                </div>

                <div className="event-schedule">
                  <h4>Schedule</h4>
                  <div className="schedule-item">
                    <span>Start:</span>
                    <span>{new Date(selectedEvent.startDate).toLocaleString()}</span>
                  </div>
                  <div className="schedule-item">
                    <span>End:</span>
                    <span>{new Date(selectedEvent.endDate).toLocaleString()}</span>
                  </div>
                </div>

                {selectedEvent.prizes.length > 0 && (
                  <div className="event-prizes">
                    <h4>Prizes</h4>
                    <div className="prizes-list">
                      {selectedEvent.prizes.map((prize, index) => (
                        <div key={index} className="prize-item">
                          {prize.name} - {formatCurrency(prize.value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="close-modal-btn"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
              {selectedEvent.status === 'upcoming' && (
                <button 
                  className="purchase-ticket-modal-btn"
                  onClick={() => {
                    purchaseEventTicket(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  disabled={selectedEvent.participants.length >= selectedEvent.maxParticipants}
                >
                  {selectedEvent.participants.length >= selectedEvent.maxParticipants ? 'Sold Out' : 'Buy Ticket'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerEngagement;