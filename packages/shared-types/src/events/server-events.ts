// Server Lifecycle Event Types

export interface ServerEvent {
  id: string;
  serverId: string;
  userId: string;
  eventType: ServerEventType;
  data: Record<string, any>;
  timestamp: string;
}

export type ServerEventType =
  | 'server_created'
  | 'server_started'
  | 'server_stopped'
  | 'server_crashed'
  | 'player_joined'
  | 'player_left'
  | 'plugin_installed'
  | 'plugin_removed'
  | 'backup_created'
  | 'backup_restored'
  | 'performance_alert'
  | 'configuration_changed';

export interface ServerCreatedEvent extends ServerEvent {
  eventType: 'server_created';
  data: {
    gameType: string;
    name: string;
    configuration: Record<string, any>;
    communityId?: string;
  };
}

export interface ServerStatusEvent extends ServerEvent {
  eventType: 'server_started' | 'server_stopped' | 'server_crashed';
  data: {
    previousStatus: string;
    newStatus: string;
    reason?: string;
    error?: string;
  };
}

export interface PlayerEvent extends ServerEvent {
  eventType: 'player_joined' | 'player_left';
  data: {
    playerId: string;
    playerName: string;
    sessionDuration?: number;
    playerCount: number;
  };
}

export interface PluginEvent extends ServerEvent {
  eventType: 'plugin_installed' | 'plugin_removed';
  data: {
    pluginId: string;
    pluginName: string;
    version: string;
    configuration?: Record<string, any>;
    error?: string;
  };
}

export interface BackupEvent extends ServerEvent {
  eventType: 'backup_created' | 'backup_restored';
  data: {
    backupId: string;
    size: number;
    location: 'local' | 'cloud';
    automated: boolean;
    restoredFrom?: string;
  };
}

export interface PerformanceAlertEvent extends ServerEvent {
  eventType: 'performance_alert';
  data: {
    alertType: 'high_cpu' | 'high_memory' | 'high_latency' | 'low_fps';
    threshold: number;
    currentValue: number;
    severity: 'warning' | 'critical';
    suggestedAction?: string;
  };
}