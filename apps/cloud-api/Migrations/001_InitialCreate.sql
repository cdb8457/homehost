-- HomeHost Database Schema - Initial Migration
-- PostgreSQL 15.x compatible

-- =============================================================================
-- Users Table
-- =============================================================================
CREATE TABLE "Users" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "SteamId" text,
    "Email" text NOT NULL,
    "DisplayName" text NOT NULL,
    "AvatarUrl" text,
    "PersonaType" integer NOT NULL DEFAULT 0, -- 0 = Alex (Casual), 1 = Sam (Pro)
    "PreferredTheme" text DEFAULT 'system',
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "LastLoginAt" timestamp with time zone,
    "IsActive" boolean NOT NULL DEFAULT true,
    
    CONSTRAINT "AK_Users_Email" UNIQUE ("Email"),
    CONSTRAINT "AK_Users_SteamId" UNIQUE ("SteamId")
);

-- =============================================================================
-- Communities Table
-- =============================================================================
CREATE TABLE "Communities" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" text NOT NULL,
    "Description" text,
    "ImageUrl" text,
    "IsPublic" boolean NOT NULL DEFAULT true,
    "OwnerId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    
    CONSTRAINT "FK_Communities_Users_OwnerId" 
        FOREIGN KEY ("OwnerId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

-- =============================================================================
-- Game Servers Table
-- =============================================================================
CREATE TABLE "GameServers" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" text NOT NULL,
    "Description" text,
    "GameId" text NOT NULL, -- e.g., "minecraft", "valheim", "rust"
    "Version" text,
    "Status" integer NOT NULL DEFAULT 0, -- 0 = Stopped, 1 = Starting, 2 = Running, 3 = Stopping
    "Port" integer NOT NULL,
    "MaxPlayers" integer NOT NULL DEFAULT 20,
    "CurrentPlayers" integer NOT NULL DEFAULT 0,
    "IsPublic" boolean NOT NULL DEFAULT false,
    "Password" text,
    "OwnerId" uuid NOT NULL,
    "CommunityId" uuid,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "LastStartedAt" timestamp with time zone,
    
    CONSTRAINT "FK_GameServers_Users_OwnerId" 
        FOREIGN KEY ("OwnerId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_GameServers_Communities_CommunityId" 
        FOREIGN KEY ("CommunityId") REFERENCES "Communities" ("Id") ON DELETE SET NULL
);

-- =============================================================================
-- Plugins Table
-- =============================================================================
CREATE TABLE "Plugins" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "Name" text NOT NULL,
    "Description" text,
    "Version" text NOT NULL,
    "AuthorId" uuid NOT NULL,
    "Category" text NOT NULL,
    "Tags" text[], -- PostgreSQL array type
    "IconUrl" text,
    "DownloadUrl" text,
    "DocumentationUrl" text,
    "SourceCodeUrl" text,
    "Price" decimal(10,2) NOT NULL DEFAULT 0.00,
    "DownloadCount" integer NOT NULL DEFAULT 0,
    "Rating" decimal(3,2) DEFAULT 0.00,
    "RatingCount" integer NOT NULL DEFAULT 0,
    "IsVerified" boolean NOT NULL DEFAULT false,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    
    CONSTRAINT "FK_Plugins_Users_AuthorId" 
        FOREIGN KEY ("AuthorId") REFERENCES "Users" ("Id") ON DELETE CASCADE
);

-- =============================================================================
-- Server Plugin Installations Table
-- =============================================================================
CREATE TABLE "ServerPluginInstallations" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "ServerId" uuid NOT NULL,
    "PluginId" uuid NOT NULL,
    "Version" text NOT NULL,
    "IsEnabled" boolean NOT NULL DEFAULT true,
    "Configuration" jsonb, -- PostgreSQL JSON type for plugin config
    "InstalledAt" timestamp with time zone NOT NULL DEFAULT now(),
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    
    CONSTRAINT "FK_ServerPluginInstallations_GameServers_ServerId" 
        FOREIGN KEY ("ServerId") REFERENCES "GameServers" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ServerPluginInstallations_Plugins_PluginId" 
        FOREIGN KEY ("PluginId") REFERENCES "Plugins" ("Id") ON DELETE CASCADE,
    CONSTRAINT "AK_ServerPluginInstallations_ServerId_PluginId" 
        UNIQUE ("ServerId", "PluginId")
);

-- =============================================================================
-- Community Members Table
-- =============================================================================
CREATE TABLE "CommunityMembers" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "CommunityId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Role" integer NOT NULL DEFAULT 0, -- 0 = Member, 1 = Moderator, 2 = Admin
    "JoinedAt" timestamp with time zone NOT NULL DEFAULT now(),
    
    CONSTRAINT "FK_CommunityMembers_Communities_CommunityId" 
        FOREIGN KEY ("CommunityId") REFERENCES "Communities" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_CommunityMembers_Users_UserId" 
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "AK_CommunityMembers_CommunityId_UserId" 
        UNIQUE ("CommunityId", "UserId")
);

-- =============================================================================
-- User Sessions Table (for JWT token management)
-- =============================================================================
CREATE TABLE "UserSessions" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" uuid NOT NULL,
    "RefreshToken" text NOT NULL,
    "ExpiresAt" timestamp with time zone NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT now(),
    "IsRevoked" boolean NOT NULL DEFAULT false,
    "UserAgent" text,
    "IpAddress" text,
    
    CONSTRAINT "FK_UserSessions_Users_UserId" 
        FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
    CONSTRAINT "AK_UserSessions_RefreshToken" UNIQUE ("RefreshToken")
);

-- =============================================================================
-- Server Statistics Table (for monitoring and analytics)
-- =============================================================================
CREATE TABLE "ServerStatistics" (
    "Id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "ServerId" uuid NOT NULL,
    "Timestamp" timestamp with time zone NOT NULL DEFAULT now(),
    "PlayerCount" integer NOT NULL,
    "CpuUsage" decimal(5,2),
    "MemoryUsage" decimal(5,2),
    "DiskUsage" decimal(5,2),
    "NetworkIn" bigint,
    "NetworkOut" bigint,
    
    CONSTRAINT "FK_ServerStatistics_GameServers_ServerId" 
        FOREIGN KEY ("ServerId") REFERENCES "GameServers" ("Id") ON DELETE CASCADE
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Users indexes
CREATE INDEX "IX_Users_SteamId" ON "Users" ("SteamId") WHERE "SteamId" IS NOT NULL;
CREATE INDEX "IX_Users_Email" ON "Users" ("Email");
CREATE INDEX "IX_Users_PersonaType" ON "Users" ("PersonaType");
CREATE INDEX "IX_Users_CreatedAt" ON "Users" ("CreatedAt");

-- Communities indexes
CREATE INDEX "IX_Communities_OwnerId" ON "Communities" ("OwnerId");
CREATE INDEX "IX_Communities_IsPublic" ON "Communities" ("IsPublic");
CREATE INDEX "IX_Communities_CreatedAt" ON "Communities" ("CreatedAt");

-- Game Servers indexes
CREATE INDEX "IX_GameServers_OwnerId" ON "GameServers" ("OwnerId");
CREATE INDEX "IX_GameServers_CommunityId" ON "GameServers" ("CommunityId");
CREATE INDEX "IX_GameServers_GameId" ON "GameServers" ("GameId");
CREATE INDEX "IX_GameServers_Status" ON "GameServers" ("Status");
CREATE INDEX "IX_GameServers_IsPublic" ON "GameServers" ("IsPublic");

-- Plugins indexes
CREATE INDEX "IX_Plugins_AuthorId" ON "Plugins" ("AuthorId");
CREATE INDEX "IX_Plugins_Category" ON "Plugins" ("Category");
CREATE INDEX "IX_Plugins_IsVerified" ON "Plugins" ("IsVerified");
CREATE INDEX "IX_Plugins_IsActive" ON "Plugins" ("IsActive");
CREATE INDEX "IX_Plugins_Rating" ON "Plugins" ("Rating");
CREATE INDEX "IX_Plugins_DownloadCount" ON "Plugins" ("DownloadCount");

-- Server Plugin Installations indexes
CREATE INDEX "IX_ServerPluginInstallations_ServerId" ON "ServerPluginInstallations" ("ServerId");
CREATE INDEX "IX_ServerPluginInstallations_PluginId" ON "ServerPluginInstallations" ("PluginId");

-- Community Members indexes
CREATE INDEX "IX_CommunityMembers_CommunityId" ON "CommunityMembers" ("CommunityId");
CREATE INDEX "IX_CommunityMembers_UserId" ON "CommunityMembers" ("UserId");

-- User Sessions indexes
CREATE INDEX "IX_UserSessions_UserId" ON "UserSessions" ("UserId");
CREATE INDEX "IX_UserSessions_ExpiresAt" ON "UserSessions" ("ExpiresAt");
CREATE INDEX "IX_UserSessions_IsRevoked" ON "UserSessions" ("IsRevoked");

-- Server Statistics indexes (for time-series queries)
CREATE INDEX "IX_ServerStatistics_ServerId_Timestamp" ON "ServerStatistics" ("ServerId", "Timestamp");
CREATE INDEX "IX_ServerStatistics_Timestamp" ON "ServerStatistics" ("Timestamp");

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to update the UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply UpdatedAt triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "Users" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON "Communities" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gameservers_updated_at BEFORE UPDATE ON "GameServers" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugins_updated_at BEFORE UPDATE ON "Plugins" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_serverplugininstallations_updated_at BEFORE UPDATE ON "ServerPluginInstallations" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Sample Data for Development
-- =============================================================================

-- Insert default games for testing
INSERT INTO "Users" ("Id", "Email", "DisplayName", "PersonaType") VALUES 
    ('11111111-1111-1111-1111-111111111111', 'alex@example.com', 'Alex (Casual Host)', 0),
    ('22222222-2222-2222-2222-222222222222', 'sam@example.com', 'Sam (Community Builder)', 1);

-- Development feedback
COMMENT ON DATABASE CURRENT_DATABASE() IS 'HomeHost Cloud Database - Gaming Server Management Platform';