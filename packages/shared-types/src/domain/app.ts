export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'alex' | 'sam';
  preferences: {
    theme: 'light' | 'dark';
    experienceMode: 'simple' | 'advanced' | 'auto';
    notifications: {
      serverAlerts: boolean;
      communityUpdates: boolean;
      pluginUpdates: boolean;
      newFeatures: boolean;
    };
  };
  stats: {
    serversHosted: number;
    communitiesJoined: number;
    pluginsInstalled: number;
    totalUptime: string;
    communityReputation: number;
  };
}

export interface Notification {
  id: string;
  type: 'server-alert' | 'community-update' | 'plugin-update' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  icon?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  primary?: boolean;
  userTypes: ('alex' | 'sam')[];
}

export interface DashboardStats {
  activeServers: number;
  totalPlayers: number;
  communityMembers: number;
  monthlyRevenue?: number;
  uptime: string;
  alertsCount: number;
}

export interface RecentActivity {
  id: string;
  type: 'server-deployed' | 'community-joined' | 'plugin-installed' | 'achievement' | 'revenue';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  metadata?: Record<string, any>;
}

export interface AppState {
  user: User | null;
  notifications: Notification[];
  sidebarCollapsed: boolean;
  currentSection: string;
  searchQuery: string;
  isLoading: boolean;
}

export interface NavigationItem {
  id: string;
  title: string;
  icon: string;
  url: string;
  badge?: number;
  userTypes: ('alex' | 'sam')[];
  children?: NavigationItem[];
}