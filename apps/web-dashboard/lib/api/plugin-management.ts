import { ApiClient } from '../api-client';

export interface PluginConfiguration {
  enabled: boolean;
  autoUpdate: boolean;
  config: Record<string, any>;
  lastConfigured: string;
}

export interface InstalledPlugin {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  price: number;
  rating: number;
  downloads: number;
  verified: boolean;
  gameTypes: string[];
  tags: string[];
  featured: boolean;
  icon?: string;
  installationStatus: 'installed' | 'installing' | 'uninstalling';
  configuration?: PluginConfiguration | null;
  serverId: string;
}

export interface PluginHealth {
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  lastRestart: string;
  errorCount: number;
  warningCount: number;
  performance: string;
}

export interface PluginStatusResponse {
  plugin: string;
  health: PluginHealth;
  configuration: PluginConfiguration;
}

class PluginManagementApi {
  private client = new ApiClient();

  // Get all installed plugins for a server
  async getInstalledPlugins(serverId: string) {
    return this.client.get<{ plugins: InstalledPlugin[] }>(`/servers/${serverId}/plugins`);
  }

  // Get plugin status/health for a specific server
  async getPluginStatus(serverId: string, pluginId: string) {
    return this.client.get<PluginStatusResponse>(`/servers/${serverId}/plugins/${pluginId}/status`);
  }

  // Get plugin configuration for a specific server
  async getPluginConfiguration(serverId: string, pluginId: string) {
    return this.client.get<{ configuration: PluginConfiguration }>(`/servers/${serverId}/plugins/${pluginId}/config`);
  }

  // Update plugin configuration
  async updatePluginConfiguration(
    serverId: string, 
    pluginId: string, 
    updates: {
      config?: Record<string, any>;
      enabled?: boolean;
      autoUpdate?: boolean;
    }
  ) {
    return this.client.post<{ message: string; configuration: PluginConfiguration }>(
      `/servers/${serverId}/plugins/${pluginId}/configure`,
      updates
    );
  }

  // Toggle plugin enabled/disabled state
  async togglePlugin(serverId: string, pluginId: string) {
    return this.client.put<{ message: string; configuration: PluginConfiguration }>(
      `/servers/${serverId}/plugins/${pluginId}/toggle`,
      {}
    );
  }

  // Uninstall plugin from server
  async uninstallPlugin(serverId: string, pluginId: string) {
    return this.client.post<{ message: string; installation: any }>(
      `/plugins/${pluginId}/uninstall`,
      { serverId }
    );
  }

  // Bulk operations for multiple plugins
  async bulkTogglePlugins(serverId: string, pluginIds: string[], enabled: boolean) {
    const promises = pluginIds.map(pluginId =>
      this.updatePluginConfiguration(serverId, pluginId, { enabled })
    );
    return Promise.allSettled(promises);
  }

  async bulkUninstallPlugins(serverId: string, pluginIds: string[]) {
    const promises = pluginIds.map(pluginId =>
      this.uninstallPlugin(serverId, pluginId)
    );
    return Promise.allSettled(promises);
  }

  // Get health status for all plugins on a server
  async getAllPluginStatuses(serverId: string) {
    const installedResponse = await this.getInstalledPlugins(serverId);
    
    if (!installedResponse.success || !installedResponse.data) {
      return { success: false, error: installedResponse.error };
    }

    const statusPromises = installedResponse.data.plugins.map(async (plugin) => {
      const statusResponse = await this.getPluginStatus(serverId, plugin.id);
      return {
        pluginId: plugin.id,
        pluginName: plugin.name,
        status: statusResponse.success ? statusResponse.data : null
      };
    });

    try {
      const statuses = await Promise.allSettled(statusPromises);
      return {
        success: true,
        data: {
          pluginStatuses: statuses.map((result, index) => ({
            pluginId: installedResponse.data.plugins[index].id,
            pluginName: installedResponse.data.plugins[index].name,
            status: result.status === 'fulfilled' ? result.value.status : null
          }))
        }
      };
    } catch (error) {
      return {
        success: false,
        error: { message: 'Failed to fetch plugin statuses' }
      };
    }
  }
}

export const pluginManagementApi = new PluginManagementApi();