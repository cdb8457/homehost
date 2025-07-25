import { apiClient, ApiResponse, PaginatedResponse } from '../api-client';

// Server types
export interface Server {
  id: string;
  name: string;
  description?: string;
  gameType: string;
  gameVersion?: string;
  region: string;
  maxPlayers: number;
  currentPlayers: number;
  port?: number;
  isPublic: boolean;
  isOnline: boolean;
  tags: string[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  lastHeartbeat?: string;
  owner?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  members?: ServerMember[];
  _count?: {
    members: number;
    metrics: number;
    alerts: number;
    configurations: number;
  };
}

export interface ServerMember {
  id: string;
  serverId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MODERATOR' | 'VIP' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface CreateServerRequest {
  name: string;
  description?: string;
  gameType: string;
  gameVersion?: string;
  region: string;
  maxPlayers: number;
  port?: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateServerRequest {
  name?: string;
  description?: string;
  gameVersion?: string;
  maxPlayers?: number;
  isPublic?: boolean;
  tags?: string[];
}

export interface AddServerMemberRequest {
  userId: string;
  role?: 'MEMBER' | 'VIP' | 'MODERATOR' | 'ADMIN';
}

export interface UpdateServerMemberRequest {
  role: 'MEMBER' | 'VIP' | 'MODERATOR' | 'ADMIN';
}

export class ServersApi {
  // Get user's servers
  async getUserServers(): Promise<ApiResponse<{
    ownedServers: Server[];
    memberServers: Array<Server & { userRole: string; joinedAt: string }>;
  }>> {
    return apiClient.get('/servers');
  }

  // Create new server
  async createServer(serverData: CreateServerRequest): Promise<ApiResponse<{ server: Server }>> {
    return apiClient.post('/servers', serverData);
  }

  // Get server details
  async getServer(serverId: string): Promise<ApiResponse<{ server: Server }>> {
    return apiClient.get(`/servers/${serverId}`);
  }

  // Update server
  async updateServer(serverId: string, updates: UpdateServerRequest): Promise<ApiResponse<{ server: Server }>> {
    return apiClient.put(`/servers/${serverId}`, updates);
  }

  // Delete server
  async deleteServer(serverId: string): Promise<ApiResponse> {
    return apiClient.delete(`/servers/${serverId}`);
  }

  // Get server members
  async getServerMembers(serverId: string, params?: {
    page?: number;
    limit?: number;
    role?: 'MEMBER' | 'VIP' | 'MODERATOR' | 'ADMIN' | 'OWNER';
  }): Promise<PaginatedResponse<ServerMember>> {
    return apiClient.get(`/servers/${serverId}/members`, params);
  }

  // Add server member
  async addServerMember(serverId: string, memberData: AddServerMemberRequest): Promise<ApiResponse<{ member: ServerMember }>> {
    return apiClient.post(`/servers/${serverId}/members`, memberData);
  }

  // Update server member role
  async updateServerMember(serverId: string, userId: string, updates: UpdateServerMemberRequest): Promise<ApiResponse<{ member: ServerMember }>> {
    return apiClient.patch(`/servers/${serverId}/members/${userId}`, updates);
  }

  // Remove server member
  async removeServerMember(serverId: string, userId: string): Promise<ApiResponse> {
    return apiClient.delete(`/servers/${serverId}/members/${userId}`);
  }
}

export const serversApi = new ServersApi();