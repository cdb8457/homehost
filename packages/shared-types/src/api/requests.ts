// Common API Request Types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SteamAuthRequest {
  steamId: string;
  steamTicket: string;
}

export interface CreateServerRequest {
  name: string;
  gameType: string;
  configuration: Record<string, any>;
  communityId?: string;
}

export interface UpdateServerRequest {
  name?: string;
  configuration?: Record<string, any>;
  status?: string;
}

export interface CreateCommunityRequest {
  name: string;
  description: string;
  isPublic: boolean;
  tags: string[];
  settings: {
    joinRequirement: 'Open' | 'Application' | 'InviteOnly';
    allowedGames: string[];
    moderationLevel: 'Relaxed' | 'Standard' | 'Strict';
    monetizationEnabled: boolean;
  };
}

export interface JoinCommunityRequest {
  message?: string;
}

export interface InstallPluginRequest {
  serverId: string;
  configuration?: Record<string, any>;
}

export interface SyncOperationRequest {
  operationType: string;
  entityType: string;
  entityId: string;
  dataPayload: Record<string, any>;
}

// Query Parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface GameSearchParams extends PaginationParams {
  search?: string;
  difficulty?: string;
  category?: string;
}

export interface CommunitySearchParams extends PaginationParams {
  search?: string;
  gameType?: string;
  size?: 'small' | 'medium' | 'large';
  tags?: string[];
}

export interface PluginSearchParams extends PaginationParams {
  search?: string;
  category?: string;
  gameType?: string;
  free?: boolean;
}