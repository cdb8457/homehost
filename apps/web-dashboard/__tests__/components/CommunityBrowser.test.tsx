import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommunityBrowser from '@/components/CommunityBrowser';

// Mock the community data
jest.mock('@/data/communities', () => ({
  MOCK_COMMUNITIES: [
    {
      id: 'viking-legends',
      name: 'Viking Legends',
      description: 'Epic Viking adventures in Valheim',
      memberCount: 1247,
      membersOnline: 89,
      totalServers: 8,
      activeServers: 6,
      joinType: 'open',
      region: 'North America',
      games: ['Valheim'],
      rating: 4.8,
      reviewCount: 156,
      isVerified: true,
      isFeatured: true,
      isOfficial: false,
      createdAt: new Date('2024-01-15'),
      lastActivity: new Date('2024-12-01'),
      tags: ['survival', 'co-op', 'pve'],
      ownerId: 'user-123',
      brandColors: {
        primary: '#2563eb',
        secondary: '#1d4ed8'
      },
      socialProof: {
        friendsInCommunity: 3,
        mutualFriends: ['alex', 'sarah'],
        recentActivity: 'New server launched',
        endorsements: 12
      },
      growth: {
        memberGrowthRate: 15.2,
        activityTrend: 'rising' as const,
        newMembersThisWeek: 23,
        peakMembersOnline: 156,
        avgDailyActiveMembers: 78
      },
      reputation: {
        trustScore: 92,
        adminResponseTime: '< 1 hour',
        memberSatisfaction: 4.7,
        infraReliability: 99.2
      },
      servers: []
    }
  ],
  COMMUNITY_CATEGORIES: [
    {
      id: 'featured',
      title: 'Featured',
      description: 'Top recommended communities',
      icon: 'star',
      communities: [],
      priority: 1
    }
  ]
}));

describe('CommunityBrowser', () => {
  beforeEach(() => {
    // Reset any mocks
    jest.clearAllMocks();
  });

  it('renders community browser with search functionality', () => {
    render(<CommunityBrowser />);
    
    // Check for main elements
    expect(screen.getByText('Discover Gaming Communities')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search communities...')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
  });

  it('displays community cards', () => {
    render(<CommunityBrowser />);
    
    // Should show the mocked community
    expect(screen.getByText('Viking Legends')).toBeInTheDocument();
    expect(screen.getByText('1 community')).toBeInTheDocument();
  });

  it('handles search functionality', () => {
    render(<CommunityBrowser />);
    
    const searchInput = screen.getByPlaceholderText('Search communities...');
    fireEvent.change(searchInput, { target: { value: 'Viking' } });
    
    // Should still show Viking Legends
    expect(screen.getByText('Viking Legends')).toBeInTheDocument();
    
    // Search for something that won't match
    fireEvent.change(searchInput, { target: { value: 'NonExistent' } });
    expect(screen.getByText('No communities found')).toBeInTheDocument();
  });

  it('toggles filter panel', () => {
    render(<CommunityBrowser />);
    
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Should show filter options
    expect(screen.getByText('Games')).toBeInTheDocument();
    expect(screen.getByText('Community Size')).toBeInTheDocument();
    expect(screen.getByText('Join Type')).toBeInTheDocument();
  });

  it('switches between grid and list view', () => {
    render(<CommunityBrowser />);
    
    // Find view toggle buttons (they should exist in the DOM)
    const viewButtons = screen.getAllByRole('button');
    const gridButton = viewButtons.find(btn => btn.querySelector('div')?.textContent === 'Grid3X3');
    const listButton = viewButtons.find(btn => btn.querySelector('div')?.textContent === 'List');
    
    expect(gridButton).toBeInTheDocument();
    expect(listButton).toBeInTheDocument();
  });

  it('shows social activity feed when toggled', () => {
    render(<CommunityBrowser />);
    
    const socialButton = screen.getByText('Social Activity');
    fireEvent.click(socialButton);
    
    // Should show social activity section
    expect(screen.getByText('Friend Activity')).toBeInTheDocument();
    expect(screen.getByText('Last 24 hours')).toBeInTheDocument();
  });

  it('shows recommendations when toggled', () => {
    render(<CommunityBrowser />);
    
    const recoButton = screen.getByText('Recommendations');
    fireEvent.click(recoButton);
    
    // Should show recommendations section
    expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered')).toBeInTheDocument();
  });

  it('displays live events bar', () => {
    render(<CommunityBrowser />);
    
    expect(screen.getByText('Live Events Happening Now')).toBeInTheDocument();
    expect(screen.getByText('Join the action across communities')).toBeInTheDocument();
  });

  it('shows category tabs', () => {
    render(<CommunityBrowser />);
    
    expect(screen.getByText('All Communities')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('handles clear filters functionality', () => {
    render(<CommunityBrowser />);
    
    // Open filters
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Set a filter
    const gameSelect = screen.getByDisplayValue('All Games');
    fireEvent.change(gameSelect, { target: { value: 'Valheim' } });
    
    // Clear filters should appear
    const clearButton = screen.getByText('Clear All');
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    
    // Should reset to all games
    expect(screen.getByDisplayValue('All Games')).toBeInTheDocument();
  });

  it('handles admin view prop', () => {
    render(<CommunityBrowser showAdminView={true} userRole="sam" />);
    
    // Should render the same content but with admin context
    expect(screen.getByText('Discover Gaming Communities')).toBeInTheDocument();
  });
});