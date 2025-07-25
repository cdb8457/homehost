import { apiClient, ApiResponse, PaginatedResponse } from '../api-client';

// Configuration types
export interface Configuration {
  id: string;
  serverId: string;
  key: string;
  value: any;
  category: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description?: string;
  isRequired: boolean;
  isSecret: boolean;
  validation: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  server?: {
    id: string;
    name: string;
  };
}

export interface ConfigTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  gameType?: string;
  defaultConfigs: Array<{
    key: string;
    value: any;
    category: string;
    dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
    description: string;
    isRequired: boolean;
    isSecret: boolean;
    validation: Record<string, any>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConfigurationRequest {
  key: string;
  value: any;
  category: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
  validation?: Record<string, any>;
}

export interface UpdateConfigurationRequest {
  value: any;
  description?: string;
  isRequired?: boolean;
  isSecret?: boolean;
  validation?: Record<string, any>;
}

export interface ApplyTemplateRequest {
  templateId: string;
  overrideExisting?: boolean;
}

export interface BulkUpdateConfigurationRequest {
  configurations: Array<{
    id: string;
    value: any;
  }>;
}

export class ConfigurationsApi {
  // Get server configurations
  async getServerConfigurations(serverId: string, params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Configuration>> {
    return apiClient.get(`/configurations/servers/${serverId}`, params);
  }

  // Get specific configuration
  async getConfiguration(serverId: string, configId: string): Promise<ApiResponse<{ configuration: Configuration }>> {
    return apiClient.get(`/configurations/servers/${serverId}/${configId}`);
  }

  // Create server configuration
  async createConfiguration(serverId: string, configData: CreateConfigurationRequest): Promise<ApiResponse<{ configuration: Configuration }>> {
    return apiClient.post(`/configurations/servers/${serverId}`, configData);
  }

  // Update server configuration
  async updateConfiguration(serverId: string, configId: string, updates: UpdateConfigurationRequest): Promise<ApiResponse<{ configuration: Configuration }>> {
    return apiClient.put(`/configurations/servers/${serverId}/${configId}`, updates);
  }

  // Delete server configuration
  async deleteConfiguration(serverId: string, configId: string): Promise<ApiResponse> {
    return apiClient.delete(`/configurations/servers/${serverId}/${configId}`);
  }

  // Get configuration templates
  async getConfigurationTemplates(params?: {
    category?: string;
    gameType?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ConfigTemplate>> {
    return apiClient.get('/configurations/templates', params);
  }

  // Apply configuration template to server
  async applyTemplate(serverId: string, templateData: ApplyTemplateRequest): Promise<ApiResponse<{
    template: {
      id: string;
      name: string;
      category: string;
    };
    appliedConfigs: Array<{
      key: string;
      action: 'created' | 'updated';
    }>;
    totalApplied: number;
  }>> {
    return apiClient.post(`/configurations/servers/${serverId}/apply-template`, templateData);
  }

  // Bulk update configurations
  async bulkUpdateConfigurations(serverId: string, updateData: BulkUpdateConfigurationRequest): Promise<ApiResponse<{
    updatedConfigurations: Array<{
      id: string;
      key: string;
      value: any;
    }>;
    errors: Array<{
      id: string;
      error: string;
    }>;
    totalProcessed: number;
    successfulUpdates: number;
  }>> {
    return apiClient.patch(`/configurations/servers/${serverId}/bulk-update`, updateData);
  }
}

export const configurationsApi = new ConfigurationsApi();