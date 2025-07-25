import { apiClient, ApiResponse, PaginatedResponse } from '../api-client';

// Plugin types
export interface Plugin {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  price: number;
  isPremium: boolean;
  isVerified: boolean;
  rating: number;
  downloads: number;
  fileSize: number;
  gameVersions: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  readme?: string;
  changelog?: string;
  versions?: PluginVersion[];
  reviews?: PluginReview[];
  _count?: {
    reviews: number;
    serverPlugins: number;
  };
}

export interface PluginVersion {
  id: string;
  pluginId: string;
  version: string;
  downloadUrl: string;
  fileSize: number;
  checksum: string;
  changelog?: string;
  gameVersions: string[];
  createdAt: string;
}

export interface PluginReview {
  id: string;
  pluginId: string;
  userId: string;
  rating: number;
  comment?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface ServerPlugin {
  id: string;
  serverId: string;
  pluginId: string;
  version: string;
  enabled: boolean;
  autoUpdate: boolean;
  config: Record<string, any>;
  installedAt: string;
  plugin: {
    id: string;
    name: string;
    displayName: string;
    description: string;
    author: string;
    category: string;
    isVerified: boolean;
    rating: number;
  };
}

export interface CreatePluginRequest {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  downloadUrl: string;
  fileSize: number;
  checksum: string;
  gameVersions: string[];
  price?: number;
  readme?: string;
  changelog?: string;
}

export interface UpdatePluginRequest {
  value?: any;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
  validation?: Record<string, any>;
}

export interface InstallPluginRequest {
  serverId: string;
  version?: string;
  autoUpdate?: boolean;
}

export interface UpdatePluginConfigRequest {
  serverId: string;
  enabled?: boolean;
  config?: Record<string, any>;
  autoUpdate?: boolean;
}

export interface UninstallPluginRequest {
  serverId: string;
}

export interface CreatePluginReviewRequest {
  rating: number;
  comment?: string;
  version: string;
}

export class PluginsApi {
  // Get plugins marketplace (updated for simple backend)
  async getPlugins(params?: {
    search?: string;
    category?: string;
    price?: 'all' | 'free' | 'paid';
    verified?: boolean;
    featured?: boolean;
    sort?: 'featured' | 'downloads' | 'rating' | 'price' | 'name' | 'newest';
  }): Promise<ApiResponse<{ plugins: any[] }>> {
    return apiClient.get('/plugins', params);
  }

  // Get plugin details
  async getPlugin(pluginId: string): Promise<ApiResponse<{ plugin: Plugin }>> {
    return apiClient.get(`/plugins/${pluginId}`);
  }

  // Get plugin categories (added for simple backend)
  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return apiClient.get('/plugins/categories');
  }

  // Create/upload plugin
  async createPlugin(pluginData: CreatePluginRequest): Promise<ApiResponse<{ plugin: Plugin }>> {
    return apiClient.post('/plugins', pluginData);
  }

  // Update plugin
  async updatePlugin(pluginId: string, updates: UpdatePluginRequest): Promise<ApiResponse<{ plugin: Plugin }>> {
    return apiClient.put(`/plugins/${pluginId}`, updates);
  }

  // Install plugin on server (updated for simple backend)
  async installPlugin(pluginId: string, installData: InstallPluginRequest): Promise<ApiResponse<{ message: string; installation: any }>> {
    return apiClient.post(`/plugins/${pluginId}/install`, installData);
  }

  // Get server plugins
  async getServerPlugins(serverId: string): Promise<ApiResponse<{ plugins: ServerPlugin[] }>> {
    return apiClient.get(`/plugins/server/${serverId}`);
  }

  // Update plugin configuration
  async updatePluginConfig(pluginId: string, configData: UpdatePluginConfigRequest): Promise<ApiResponse<{ installation: ServerPlugin }>> {
    return apiClient.patch(`/plugins/${pluginId}/config`, configData);
  }

  // Uninstall plugin
  async uninstallPlugin(pluginId: string, uninstallData: UninstallPluginRequest): Promise<ApiResponse> {
    return apiClient.delete(`/plugins/${pluginId}/uninstall`, uninstallData);
  }

  // Create plugin review
  async createPluginReview(pluginId: string, reviewData: CreatePluginReviewRequest): Promise<ApiResponse<{ review: PluginReview }>> {
    return apiClient.post(`/plugins/${pluginId}/reviews`, reviewData);
  }
}

export const pluginsApi = new PluginsApi();