export interface Plugin {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  icon: string;
  screenshots: string[];
  
  // Developer Info
  developer: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
    totalPlugins: number;
    averageRating: number;
  };
  
  // Marketplace Info
  category: 'quality-of-life' | 'admin-tools' | 'community-features' | 'game-specific' | 'security' | 'monetization';
  subcategory?: string;
  isFeatured: boolean;
  isRecommended: boolean;
  isNew: boolean;
  
  // Pricing
  price: {
    type: 'free' | 'paid' | 'freemium';
    amount?: number;
    currency?: string;
    trialDays?: number;
  };
  
  // Technical Details
  version: string;
  lastUpdated: Date;
  releaseDate: Date;
  fileSize: string;
  requiredHomeHostVersion: string;
  
  // Compatibility
  supportedGames: string[];
  platformRequirements: {
    minRam?: string;
    minCpu?: string;
    minDisk?: string;
    operatingSystems: string[];
  };
  
  // Social Proof
  rating: number;
  reviewCount: number;
  downloadCount: number;
  activeInstalls: number;
  
  // Features
  features: string[];
  tags: string[];
  
  // Installation Info
  installationStatus?: 'not-installed' | 'installing' | 'installed' | 'update-available' | 'error';
  installProgress?: number;
  installedVersion?: string;
  autoUpdate?: boolean;
  dependencies?: string[];
  conflicts?: string[];
  
  // Revenue (for developers)
  revenueShare?: {
    developerPercent: number;
    platformPercent: number;
    monthlyRevenue?: number;
  };
}

export interface PluginReview {
  id: string;
  pluginId: string;
  userId: string;
  username: string;
  userAvatar: string;
  rating: number;
  title: string;
  content: string;
  timestamp: Date;
  helpful: number;
  verified: boolean; // Verified purchase/install
  serverSize?: string; // Community size context
}

export interface PluginCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  targetUser: 'alex' | 'sam' | 'both';
  pluginCount: number;
  featured: Plugin[];
}

export interface PluginInstallation {
  pluginId: string;
  serverId?: string; // If installed on specific server
  installedDate: Date;
  configuration?: Record<string, any>;
  enabled: boolean;
  autoUpdate: boolean;
  lastUpdate?: Date;
  issues?: string[];
}

export interface PluginFilter {
  category?: string;
  price?: 'free' | 'paid' | 'all';
  rating?: number;
  compatibility?: string[]; // Games
  search?: string;
  sortBy?: 'relevance' | 'rating' | 'downloads' | 'newest' | 'price-low' | 'price-high';
  showInstalled?: boolean;
  showUpdates?: boolean;
}

export interface PluginDeveloper {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  joinDate: Date;
  bio: string;
  website?: string;
  
  // Portfolio
  totalPlugins: number;
  totalDownloads: number;
  averageRating: number;
  
  // Revenue Stats (if viewing own profile)
  monthlyRevenue?: number;
  totalRevenue?: number;
  topPerformingPlugin?: string;
  
  // Contact
  supportEmail?: string;
  discordServer?: string;
}

export interface PluginChangelog {
  version: string;
  releaseDate: Date;
  changes: {
    type: 'feature' | 'bugfix' | 'improvement' | 'breaking';
    description: string;
  }[];
  downloadUrl?: string;
}