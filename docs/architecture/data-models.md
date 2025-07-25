# Data Models

## Core Data Models

## User

**Purpose:** Represents authenticated users across Windows app and web dashboard

**Key Attributes:**
- Id: Guid - Unique user identifier
- Email: string - Primary authentication email
- DisplayName: string - Public display name
- Role: enum - User permission level (Basic, Pro, Admin)
- CreatedAt: DateTime - Account creation timestamp
- LastSeen: DateTime - Last activity timestamp

**TypeScript Interface:**
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'Basic' | 'Pro' | 'Admin';
  createdAt: Date;
  lastSeen: Date;
  profile: UserProfile;
  settings: UserSettings;
}

interface UserProfile {
  avatarUrl?: string;
  bio?: string;
  steamId?: string;
  discordId?: string;
  timezone: string;
}
```

**Relationships:**
- Owns multiple GameServers (1:n)
- Member of multiple Communities (n:m)
- Creates and manages Plugins (1:n)

## GameServer

**Purpose:** Represents individual game server instances managed by Windows app

**Key Attributes:**
- Id: Guid - Unique server identifier
- Name: string - User-defined server name
- GameType: enum - Supported game type
- Status: enum - Current operational status
- Configuration: JSON - Game-specific settings
- Performance: ServerMetrics - Real-time performance data

**TypeScript Interface:**
```typescript
interface GameServer {
  id: string;
  name: string;
  gameType: 'Valheim' | 'Rust' | 'CS2' | 'SevenDaysToDie' | 'MotorTown';
  status: 'Stopped' | 'Starting' | 'Running' | 'Stopping' | 'Error';
  configuration: GameConfiguration;
  performance: ServerMetrics;
  playerCount: number;
  maxPlayers: number;
  uptime: number;
  lastBackup: Date;
  ownerId: string;
  communityId?: string;
}

interface ServerMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  tickRate: number;
  lastUpdated: Date;
}
```

**Relationships:**
- Belongs to one User (n:1)
- Belongs to zero or one Community (n:1)
- Uses multiple Plugins (n:m)

## Community

**Purpose:** Represents gaming communities with multiple servers and cross-server features

**Key Attributes:**
- Id: Guid - Unique community identifier
- Name: string - Community display name
- Description: string - Community description
- IsPublic: boolean - Public discovery visibility
- MemberCount: number - Total community members
- Settings: CommunitySettings - Community configuration

**TypeScript Interface:**
```typescript
interface Community {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  isPublic: boolean;
  memberCount: number;
  settings: CommunitySettings;
  servers: GameServer[];
  admins: User[];
  createdAt: Date;
  tags: string[];
}

interface CommunitySettings {
  joinRequirement: 'Open' | 'Application' | 'InviteOnly';
  allowedGames: string[];
  moderationLevel: 'Relaxed' | 'Standard' | 'Strict';
  monetizationEnabled: boolean;
}
```

**Relationships:**
- Contains multiple GameServers (1:n)
- Has multiple User members (n:m)
- Generates revenue through CommunityRevenue (1:n)

## Plugin

**Purpose:** Represents installable extensions for game servers

**Key Attributes:**
- Id: Guid - Unique plugin identifier
- Name: string - Plugin display name
- Developer: User - Plugin creator
- Category: enum - Plugin category
- Price: decimal - Plugin cost (0 for free)
- Downloads: number - Total download count

**TypeScript Interface:**
```typescript
interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  developer: User;
  category: 'QualityOfLife' | 'AdminTools' | 'Community' | 'GameSpecific';
  price: number;
  downloads: number;
  rating: number;
  reviewCount: number;
  supportedGames: string[];
  isVerified: boolean;
  packageUrl: string;
  installationGuide: string;
}
```

**Relationships:**
- Created by one User (n:1)
- Installed on multiple GameServers (n:m)
- Generates revenue through PluginRevenue (1:n)