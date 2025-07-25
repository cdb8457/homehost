-- HomeHost Database Schema - SQL Server Migration
-- SQL Server 2022 compatible

-- =============================================================================
-- Users Table
-- =============================================================================
CREATE TABLE [Users] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [SteamId] nvarchar(450),
    [Email] nvarchar(320) NOT NULL,
    [DisplayName] nvarchar(255) NOT NULL,
    [AvatarUrl] nvarchar(2048),
    [PersonaType] int NOT NULL DEFAULT 0, -- 0 = Alex (Casual), 1 = Sam (Pro)
    [PreferredTheme] nvarchar(50) DEFAULT 'system',
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [LastLoginAt] datetime2,
    [IsActive] bit NOT NULL DEFAULT 1,
    
    CONSTRAINT [AK_Users_Email] UNIQUE ([Email]),
    CONSTRAINT [AK_Users_SteamId] UNIQUE ([SteamId])
);

-- =============================================================================
-- Communities Table
-- =============================================================================
CREATE TABLE [Communities] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [Name] nvarchar(255) NOT NULL,
    [Description] nvarchar(MAX),
    [Banner] nvarchar(2048),
    [Logo] nvarchar(2048),
    [BrandColorsPrimary] nvarchar(7), -- #RRGGBB
    [BrandColorsSecondary] nvarchar(7), -- #RRGGBB
    [BrandColorsAccent] nvarchar(7), -- #RRGGBB
    [MemberCount] int NOT NULL DEFAULT 0,
    [MembersOnline] int NOT NULL DEFAULT 0,
    [TotalServers] int NOT NULL DEFAULT 0,
    [ActiveServers] int NOT NULL DEFAULT 0,
    [JoinType] nvarchar(20) NOT NULL DEFAULT 'open', -- open, application, invite_only
    [Region] nvarchar(100),
    [Timezone] nvarchar(100),
    [Language] nvarchar(10),
    [Tags] nvarchar(MAX), -- JSON array
    [Games] nvarchar(MAX), -- JSON array
    [Rating] decimal(3,2) DEFAULT 0.00,
    [ReviewCount] int NOT NULL DEFAULT 0,
    [IsVerified] bit NOT NULL DEFAULT 0,
    [IsFeatured] bit NOT NULL DEFAULT 0,
    [IsOfficial] bit NOT NULL DEFAULT 0,
    [IsPublic] bit NOT NULL DEFAULT 1,
    [OwnerId] uniqueidentifier NOT NULL,
    [Website] nvarchar(2048),
    [Discord] nvarchar(2048),
    [SocialLinksTwitter] nvarchar(2048),
    [SocialLinksYoutube] nvarchar(2048),
    [SocialLinksTwitch] nvarchar(2048),
    [Rules] nvarchar(MAX), -- JSON array
    [WelcomeMessage] nvarchar(MAX),
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [LastActivity] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_Communities_Users_OwnerId] 
        FOREIGN KEY ([OwnerId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

-- =============================================================================
-- Community Analytics Table
-- =============================================================================
CREATE TABLE [CommunityAnalytics] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [CommunityId] uniqueidentifier NOT NULL,
    [Date] date NOT NULL,
    [MemberGrowthRate] decimal(5,2) NOT NULL DEFAULT 0,
    [ActivityTrend] nvarchar(20) NOT NULL DEFAULT 'stable', -- rising, stable, declining
    [NewMembersThisWeek] int NOT NULL DEFAULT 0,
    [PeakMembersOnline] int NOT NULL DEFAULT 0,
    [AvgDailyActiveMembers] int NOT NULL DEFAULT 0,
    [TrustScore] int NOT NULL DEFAULT 0, -- 0-100
    [AdminResponseTime] nvarchar(50),
    [MemberSatisfaction] decimal(2,1) DEFAULT 0.0, -- 0-5
    [InfraReliability] decimal(5,2) DEFAULT 0.00, -- percentage
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_CommunityAnalytics_Communities_CommunityId] 
        FOREIGN KEY ([CommunityId]) REFERENCES [Communities] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [AK_CommunityAnalytics_CommunityId_Date] 
        UNIQUE ([CommunityId], [Date])
);

-- =============================================================================
-- Game Servers Table
-- =============================================================================
CREATE TABLE [GameServers] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [Name] nvarchar(255) NOT NULL,
    [Description] nvarchar(MAX),
    [GameId] nvarchar(100) NOT NULL, -- e.g., "minecraft", "valheim", "rust"
    [GameVersion] nvarchar(50),
    [Status] int NOT NULL DEFAULT 0, -- 0 = Stopped, 1 = Starting, 2 = Running, 3 = Stopping
    [Port] int NOT NULL,
    [MaxPlayers] int NOT NULL DEFAULT 20,
    [CurrentPlayers] int NOT NULL DEFAULT 0,
    [IsOnline] bit NOT NULL DEFAULT 0,
    [Map] nvarchar(255),
    [GameMode] nvarchar(100),
    [HasQueue] bit DEFAULT 0,
    [QueueLength] int DEFAULT 0,
    [Mods] nvarchar(MAX), -- JSON array
    [Difficulty] nvarchar(20), -- easy, normal, hard, expert
    [PvpEnabled] bit DEFAULT 0,
    [PasswordProtected] bit NOT NULL DEFAULT 0,
    [Password] nvarchar(255),
    [JoinUrl] nvarchar(2048),
    [ConnectInfoIp] nvarchar(45), -- IPv4/IPv6
    [ConnectInfoPort] int,
    [ConnectInfoDirectConnect] nvarchar(255),
    [PerformanceUptime] decimal(5,2) DEFAULT 0.00, -- percentage
    [PerformanceAvgPing] int DEFAULT 0, -- ms
    [PerformanceTps] decimal(5,2) DEFAULT 0.00, -- ticks per second
    [PerformanceLastRestart] datetime2,
    [IsPublic] bit NOT NULL DEFAULT 0,
    [OwnerId] uniqueidentifier NOT NULL,
    [CommunityId] uniqueidentifier,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [LastStartedAt] datetime2,
    [LastPlayerActivity] datetime2,
    
    CONSTRAINT [FK_GameServers_Users_OwnerId] 
        FOREIGN KEY ([OwnerId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_GameServers_Communities_CommunityId] 
        FOREIGN KEY ([CommunityId]) REFERENCES [Communities] ([Id]) ON DELETE SET NULL
);

-- =============================================================================
-- Community Members Table
-- =============================================================================
CREATE TABLE [CommunityMembers] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [CommunityId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [Role] nvarchar(20) NOT NULL DEFAULT 'member', -- member, vip, moderator, admin, owner
    [JoinedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [LastSeen] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [IsOnline] bit NOT NULL DEFAULT 0,
    [CurrentServerId] uniqueidentifier,
    [Permissions] nvarchar(MAX), -- JSON array
    [Notes] nvarchar(MAX),
    
    CONSTRAINT [FK_CommunityMembers_Communities_CommunityId] 
        FOREIGN KEY ([CommunityId]) REFERENCES [Communities] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CommunityMembers_Users_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CommunityMembers_GameServers_CurrentServerId] 
        FOREIGN KEY ([CurrentServerId]) REFERENCES [GameServers] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [AK_CommunityMembers_CommunityId_UserId] 
        UNIQUE ([CommunityId], [UserId])
);

-- =============================================================================
-- Community Player Reputation Table
-- =============================================================================
CREATE TABLE [CommunityPlayerReputation] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [CommunityId] uniqueidentifier NOT NULL,
    [UserId] uniqueidentifier NOT NULL,
    [SteamId] nvarchar(450),
    [Username] nvarchar(255) NOT NULL,
    [DisplayName] nvarchar(255) NOT NULL,
    [Avatar] nvarchar(2048),
    [ReputationScore] int NOT NULL DEFAULT 0,
    [Commendations] int NOT NULL DEFAULT 0,
    [Warnings] int NOT NULL DEFAULT 0,
    [IsBanned] bit NOT NULL DEFAULT 0,
    [BanReason] nvarchar(MAX),
    [BanExpiresAt] datetime2,
    [TotalPlayTime] int NOT NULL DEFAULT 0, -- minutes
    [FavoriteServer] uniqueidentifier,
    [ServerPlayTime] nvarchar(MAX), -- JSON object {serverId: minutes}
    [LastActivityServerId] uniqueidentifier,
    [LastActivityAction] nvarchar(255),
    [LastActivityTimestamp] datetime2,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_CommunityPlayerReputation_Communities_CommunityId] 
        FOREIGN KEY ([CommunityId]) REFERENCES [Communities] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CommunityPlayerReputation_Users_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CommunityPlayerReputation_GameServers_FavoriteServer] 
        FOREIGN KEY ([FavoriteServer]) REFERENCES [GameServers] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [FK_CommunityPlayerReputation_GameServers_LastActivityServerId] 
        FOREIGN KEY ([LastActivityServerId]) REFERENCES [GameServers] ([Id]) ON DELETE SET NULL,
    CONSTRAINT [AK_CommunityPlayerReputation_CommunityId_UserId] 
        UNIQUE ([CommunityId], [UserId])
);

-- =============================================================================
-- Player Actions Table (Audit Log)
-- =============================================================================
CREATE TABLE [PlayerActions] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [PlayerId] uniqueidentifier NOT NULL,
    [ServerId] uniqueidentifier NOT NULL,
    [Action] nvarchar(50) NOT NULL, -- join, leave, kick, ban, unban, promote, demote, warn, commend
    [PerformedBy] uniqueidentifier NOT NULL, -- Staff member who performed the action
    [Reason] nvarchar(MAX),
    [Duration] int, -- For temporary actions like bans (in minutes)
    [Timestamp] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [IsActive] bit NOT NULL DEFAULT 1,
    
    CONSTRAINT [FK_PlayerActions_Users_PlayerId] 
        FOREIGN KEY ([PlayerId]) REFERENCES [Users] ([Id]),
    CONSTRAINT [FK_PlayerActions_GameServers_ServerId] 
        FOREIGN KEY ([ServerId]) REFERENCES [GameServers] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PlayerActions_Users_PerformedBy] 
        FOREIGN KEY ([PerformedBy]) REFERENCES [Users] ([Id])
);

-- =============================================================================
-- Cross Server Bans Table
-- =============================================================================
CREATE TABLE [CrossServerBans] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [PlayerId] uniqueidentifier NOT NULL,
    [CommunityId] uniqueidentifier NOT NULL,
    [ServerIds] nvarchar(MAX), -- JSON array, empty = all servers
    [Reason] nvarchar(MAX) NOT NULL,
    [BannedBy] uniqueidentifier NOT NULL,
    [BannedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [ExpiresAt] datetime2,
    [IsActive] bit NOT NULL DEFAULT 1,
    [AppealUrl] nvarchar(2048),
    
    CONSTRAINT [FK_CrossServerBans_Users_PlayerId] 
        FOREIGN KEY ([PlayerId]) REFERENCES [Users] ([Id]),
    CONSTRAINT [FK_CrossServerBans_Communities_CommunityId] 
        FOREIGN KEY ([CommunityId]) REFERENCES [Communities] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_CrossServerBans_Users_BannedBy] 
        FOREIGN KEY ([BannedBy]) REFERENCES [Users] ([Id])
);

-- =============================================================================
-- Player Invitations Table
-- =============================================================================
CREATE TABLE [PlayerInvitations] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [CommunityId] uniqueidentifier NOT NULL,
    [InvitedBy] uniqueidentifier NOT NULL,
    [InviteeEmail] nvarchar(320),
    [InviteeSteamId] nvarchar(450),
    [Message] nvarchar(MAX),
    [ExpiresAt] datetime2 NOT NULL,
    [IsUsed] bit NOT NULL DEFAULT 0,
    [UsedBy] uniqueidentifier,
    [UsedAt] datetime2,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_PlayerInvitations_Communities_CommunityId] 
        FOREIGN KEY ([CommunityId]) REFERENCES [Communities] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PlayerInvitations_Users_InvitedBy] 
        FOREIGN KEY ([InvitedBy]) REFERENCES [Users] ([Id]),
    CONSTRAINT [FK_PlayerInvitations_Users_UsedBy] 
        FOREIGN KEY ([UsedBy]) REFERENCES [Users] ([Id])
);

-- =============================================================================
-- Plugins Table
-- =============================================================================
CREATE TABLE [Plugins] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [Name] nvarchar(255) NOT NULL,
    [Description] nvarchar(MAX),
    [Version] nvarchar(50) NOT NULL,
    [AuthorId] uniqueidentifier NOT NULL,
    [Category] nvarchar(100) NOT NULL,
    [Tags] nvarchar(MAX), -- JSON array
    [IconUrl] nvarchar(2048),
    [DownloadUrl] nvarchar(2048),
    [DocumentationUrl] nvarchar(2048),
    [SourceCodeUrl] nvarchar(2048),
    [Price] decimal(10,2) NOT NULL DEFAULT 0.00,
    [DownloadCount] int NOT NULL DEFAULT 0,
    [Rating] decimal(3,2) DEFAULT 0.00,
    [RatingCount] int NOT NULL DEFAULT 0,
    [IsVerified] bit NOT NULL DEFAULT 0,
    [IsActive] bit NOT NULL DEFAULT 1,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [UpdatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    
    CONSTRAINT [FK_Plugins_Users_AuthorId] 
        FOREIGN KEY ([AuthorId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
);

-- =============================================================================
-- User Sessions Table (for JWT token management)
-- =============================================================================
CREATE TABLE [UserSessions] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [UserId] uniqueidentifier NOT NULL,
    [RefreshToken] nvarchar(512) NOT NULL,
    [ExpiresAt] datetime2 NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [IsRevoked] bit NOT NULL DEFAULT 0,
    [UserAgent] nvarchar(MAX),
    [IpAddress] nvarchar(45),
    
    CONSTRAINT [FK_UserSessions_Users_UserId] 
        FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [AK_UserSessions_RefreshToken] UNIQUE ([RefreshToken])
);

-- =============================================================================
-- Server Statistics Table (for monitoring and analytics)
-- =============================================================================
CREATE TABLE [ServerStatistics] (
    [Id] uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
    [ServerId] uniqueidentifier NOT NULL,
    [Timestamp] datetime2 NOT NULL DEFAULT GETUTCDATE(),
    [PlayerCount] int NOT NULL,
    [CpuUsage] decimal(5,2),
    [MemoryUsage] decimal(5,2),
    [DiskUsage] decimal(5,2),
    [NetworkIn] bigint,
    [NetworkOut] bigint,
    
    CONSTRAINT [FK_ServerStatistics_GameServers_ServerId] 
        FOREIGN KEY ([ServerId]) REFERENCES [GameServers] ([Id]) ON DELETE CASCADE
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Users indexes
CREATE INDEX [IX_Users_SteamId] ON [Users] ([SteamId]) WHERE [SteamId] IS NOT NULL;
CREATE INDEX [IX_Users_Email] ON [Users] ([Email]);
CREATE INDEX [IX_Users_PersonaType] ON [Users] ([PersonaType]);
CREATE INDEX [IX_Users_CreatedAt] ON [Users] ([CreatedAt]);

-- Communities indexes
CREATE INDEX [IX_Communities_OwnerId] ON [Communities] ([OwnerId]);
CREATE INDEX [IX_Communities_IsPublic] ON [Communities] ([IsPublic]);
CREATE INDEX [IX_Communities_CreatedAt] ON [Communities] ([CreatedAt]);
CREATE INDEX [IX_Communities_JoinType] ON [Communities] ([JoinType]);
CREATE INDEX [IX_Communities_Region] ON [Communities] ([Region]);
CREATE INDEX [IX_Communities_Rating] ON [Communities] ([Rating]);
CREATE INDEX [IX_Communities_MemberCount] ON [Communities] ([MemberCount]);

-- Game Servers indexes
CREATE INDEX [IX_GameServers_OwnerId] ON [GameServers] ([OwnerId]);
CREATE INDEX [IX_GameServers_CommunityId] ON [GameServers] ([CommunityId]);
CREATE INDEX [IX_GameServers_GameId] ON [GameServers] ([GameId]);
CREATE INDEX [IX_GameServers_Status] ON [GameServers] ([Status]);
CREATE INDEX [IX_GameServers_IsPublic] ON [GameServers] ([IsPublic]);

-- Community Members indexes
CREATE INDEX [IX_CommunityMembers_CommunityId] ON [CommunityMembers] ([CommunityId]);
CREATE INDEX [IX_CommunityMembers_UserId] ON [CommunityMembers] ([UserId]);
CREATE INDEX [IX_CommunityMembers_Role] ON [CommunityMembers] ([Role]);

-- Community Player Reputation indexes
CREATE INDEX [IX_CommunityPlayerReputation_CommunityId] ON [CommunityPlayerReputation] ([CommunityId]);
CREATE INDEX [IX_CommunityPlayerReputation_UserId] ON [CommunityPlayerReputation] ([UserId]);
CREATE INDEX [IX_CommunityPlayerReputation_SteamId] ON [CommunityPlayerReputation] ([SteamId]);
CREATE INDEX [IX_CommunityPlayerReputation_IsBanned] ON [CommunityPlayerReputation] ([IsBanned]);

-- Player Actions indexes
CREATE INDEX [IX_PlayerActions_PlayerId] ON [PlayerActions] ([PlayerId]);
CREATE INDEX [IX_PlayerActions_ServerId] ON [PlayerActions] ([ServerId]);
CREATE INDEX [IX_PlayerActions_Timestamp] ON [PlayerActions] ([Timestamp]);
CREATE INDEX [IX_PlayerActions_Action] ON [PlayerActions] ([Action]);

-- User Sessions indexes
CREATE INDEX [IX_UserSessions_UserId] ON [UserSessions] ([UserId]);
CREATE INDEX [IX_UserSessions_ExpiresAt] ON [UserSessions] ([ExpiresAt]);
CREATE INDEX [IX_UserSessions_IsRevoked] ON [UserSessions] ([IsRevoked]);

-- Server Statistics indexes (for time-series queries)
CREATE INDEX [IX_ServerStatistics_ServerId_Timestamp] ON [ServerStatistics] ([ServerId], [Timestamp]);
CREATE INDEX [IX_ServerStatistics_Timestamp] ON [ServerStatistics] ([Timestamp]);

-- =============================================================================
-- Sample Data for Development
-- =============================================================================

-- Insert default users for testing
INSERT INTO [Users] ([Id], [Email], [DisplayName], [PersonaType]) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'alex@homehost.com', 'Alex Johnson (Casual Host)', 0),
    ('22222222-2222-2222-2222-222222222222', 'sam@homehost.com', 'Sam Chen (Community Builder)', 1);

-- Insert sample communities
INSERT INTO [Communities] (
    [Id], [Name], [Description], [BrandColorsPrimary], [BrandColorsSecondary],
    [MemberCount], [MembersOnline], [TotalServers], [ActiveServers], [JoinType],
    [Region], [Tags], [Games], [Rating], [ReviewCount], [IsVerified], [IsFeatured],
    [OwnerId]
) VALUES 
(
    '33333333-3333-3333-3333-333333333333',
    'Viking Legends',
    'Epic Viking adventures in Valheim with a focus on cooperative building and exploration.',
    '#2563eb', '#1d4ed8',
    1247, 89, 8, 6, 'open',
    'North America',
    '["survival", "co-op", "pve", "building"]',
    '["Valheim"]',
    4.8, 156, 1, 1,
    '22222222-2222-2222-2222-222222222222'
),
(
    '44444444-4444-4444-4444-444444444444',
    'Tactical Strike Force',
    'Competitive Counter-Strike 2 community with professional coaching and tournaments.',
    '#dc2626', '#b91c1c',
    892, 234, 12, 10, 'application',
    'Europe',
    '["competitive", "fps", "tournaments", "coaching"]',
    '["Counter-Strike 2"]',
    4.6, 203, 1, 1,
    '22222222-2222-2222-2222-222222222222'
);

PRINT 'HomeHost Cloud Database initialized successfully!';
PRINT 'Sample users created: Alex (Casual Host), Sam (Community Builder)';
PRINT 'Sample communities created: Viking Legends, Tactical Strike Force';