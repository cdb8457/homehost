import { apiClient, ApiResponse, PaginatedResponse } from '../api-client';

// Community types
export interface Community {
  id: string;
  serverId: string;
  name: string;
  description: string;
  banner?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isPublic: boolean;
  joinType: 'OPEN' | 'APPLICATION' | 'INVITE_ONLY';
  rules: string[];
  welcomeMessage?: string;
  allowPosts: boolean;
  allowEvents: boolean;
  moderationLevel: 'open' | 'moderate' | 'strict';
  createdAt: string;
  updatedAt: string;
  server: {
    id: string;
    name: string;
    gameType: string;
    isOnline: boolean;
    currentPlayers: number;
    maxPlayers: number;
  };
  userMembership?: {
    role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
    joinedAt: string;
    reputation: number;
  };
  _count: {
    members: number;
    posts: number;
    events: number;
  };
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'MEMBER';
  joinedAt: string;
  reputation: number;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface CommunityPost {
  id: string;
  communityId: string;
  authorId: string;
  title?: string;
  content: string;
  postType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'POLL' | 'ACHIEVEMENT' | 'EVENT';
  mediaUrls: string[];
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  comments: CommunityComment[];
  _count: {
    comments: number;
    reactions: number;
  };
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface CommunityEvent {
  id: string;
  communityId: string;
  creatorId: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  isPublic: boolean;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  creator: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  _count: {
    participants: number;
  };
}

export interface CreateCommunityRequest {
  serverId: string;
  name: string;
  description: string;
  banner?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isPublic?: boolean;
  joinType?: 'OPEN' | 'APPLICATION' | 'INVITE_ONLY';
  rules?: string[];
  welcomeMessage?: string;
}

export interface UpdateCommunityRequest {
  name?: string;
  description?: string;
  banner?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isPublic?: boolean;
  joinType?: 'OPEN' | 'APPLICATION' | 'INVITE_ONLY';
  rules?: string[];
  welcomeMessage?: string;
  allowPosts?: boolean;
  allowEvents?: boolean;
  moderationLevel?: 'open' | 'moderate' | 'strict';
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  postType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'POLL' | 'ACHIEVEMENT' | 'EVENT';
  mediaUrls?: string[];
  tags?: string[];
}

export class CommunitiesApi {
  // Get public communities
  async getCommunities(params?: {
    page?: number;
    limit?: number;
    search?: string;
    joinType?: 'OPEN' | 'APPLICATION' | 'INVITE_ONLY';
    isPublic?: boolean;
  }): Promise<PaginatedResponse<Community>> {
    return apiClient.get('/communities', params);
  }

  // Get community details
  async getCommunity(communityId: string): Promise<ApiResponse<{ community: Community }>> {
    return apiClient.get(`/communities/${communityId}`);
  }

  // Get user's communities
  async getUserCommunities(): Promise<ApiResponse<{ ownedCommunities: Community[]; memberCommunities: Community[] }>> {
    return apiClient.get('/communities/user');
  }

  // Create community
  async createCommunity(communityData: CreateCommunityRequest): Promise<ApiResponse<{ community: Community }>> {
    return apiClient.post('/communities', communityData);
  }

  // Update community
  async updateCommunity(communityId: string, updates: UpdateCommunityRequest): Promise<ApiResponse<{ community: Community }>> {
    return apiClient.put(`/communities/${communityId}`, updates);
  }

  // Join community
  async joinCommunity(communityId: string): Promise<ApiResponse<{ member: CommunityMember }>> {
    return apiClient.post(`/communities/${communityId}/join`);
  }

  // Leave community
  async leaveCommunity(communityId: string): Promise<ApiResponse> {
    return apiClient.post(`/communities/${communityId}/leave`);
  }

  // Get community posts
  async getCommunityPosts(communityId: string, params?: {
    page?: number;
    limit?: number;
    type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'POLL' | 'ACHIEVEMENT' | 'EVENT';
  }): Promise<PaginatedResponse<CommunityPost>> {
    return apiClient.get(`/communities/${communityId}/posts`, params);
  }

  // Create community post
  async createCommunityPost(communityId: string, postData: CreatePostRequest): Promise<ApiResponse<{ post: CommunityPost }>> {
    return apiClient.post(`/communities/${communityId}/posts`, postData);
  }

  // Get community events
  async getCommunityEvents(communityId: string, params?: {
    page?: number;
    limit?: number;
    status?: 'UPCOMING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  }): Promise<PaginatedResponse<CommunityEvent>> {
    return apiClient.get(`/communities/${communityId}/events`, params);
  }
}

export const communitiesApi = new CommunitiesApi();