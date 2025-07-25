// Real-time Sync Event Types

export interface SyncEvent {
  id: string;
  userId: string;
  operationType: SyncOperationType;
  entityType: SyncEntityType;
  entityId: string;
  data: Record<string, any>;
  timestamp: string;
  correlationId: string;
}

export type SyncOperationType = 
  | 'create'
  | 'update' 
  | 'delete'
  | 'status_change'
  | 'configuration_update'
  | 'player_action';

export type SyncEntityType =
  | 'server'
  | 'community'
  | 'plugin'
  | 'user'
  | 'player_session';

export interface ServerSyncEvent extends SyncEvent {
  entityType: 'server';
  data: {
    serverId: string;
    status?: string;
    playerCount?: number;
    performance?: {
      cpuUsage: number;
      memoryUsage: number;
      networkLatency: number;
    };
    configuration?: Record<string, any>;
  };
}

export interface CommunitySyncEvent extends SyncEvent {
  entityType: 'community';
  data: {
    communityId: string;
    memberCount?: number;
    settings?: Record<string, any>;
    newMember?: string;
    removedMember?: string;
  };
}

export interface PluginSyncEvent extends SyncEvent {
  entityType: 'plugin';
  data: {
    pluginId: string;
    serverId: string;
    status: 'installing' | 'installed' | 'failed' | 'uninstalled';
    configuration?: Record<string, any>;
    error?: string;
  };
}

export interface ConflictResolutionEvent {
  syncEventId: string;
  conflictType: 'version_mismatch' | 'concurrent_update' | 'missing_dependency';
  localVersion: any;
  cloudVersion: any;
  resolution: 'accept_local' | 'accept_cloud' | 'merge' | 'manual_required';
  timestamp: string;
}