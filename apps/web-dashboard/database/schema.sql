-- HomeHost Database Schema
-- This schema supports Epic 2: Community Infrastructure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL CHECK (role IN ('alex', 'sam')) DEFAULT 'alex',
    gaming_preferences JSONB DEFAULT '{
        "favorite_games": [],
        "playtime_preference": "casual",
        "community_size_preference": "medium",
        "hosting_experience": "none"
    }',
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    banner TEXT,
    logo TEXT,
    brand_colors JSONB DEFAULT '{"primary": "#6366f1", "secondary": "#8b5cf6"}',
    member_count INTEGER DEFAULT 0,
    members_online INTEGER DEFAULT 0,
    total_servers INTEGER DEFAULT 0,
    active_servers INTEGER DEFAULT 0,
    join_type TEXT NOT NULL CHECK (join_type IN ('open', 'application', 'invite_only')) DEFAULT 'open',
    region TEXT DEFAULT 'Global',
    tags TEXT[] DEFAULT '{}',
    games TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('member', 'moderator', 'admin', 'owner')) DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reputation INTEGER DEFAULT 100,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    banned_until TIMESTAMP WITH TIME ZONE,
    UNIQUE(community_id, user_id)
);

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    game TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('online', 'offline', 'starting', 'stopping', 'error')) DEFAULT 'offline',
    player_count INTEGER DEFAULT 0,
    max_players INTEGER DEFAULT 10,
    host_address TEXT,
    host_port INTEGER,
    is_public BOOLEAN DEFAULT TRUE,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    community_id UUID REFERENCES communities(id),
    server_config JSONB DEFAULT '{}',
    installed_plugins TEXT[] DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    uptime_percentage DECIMAL(5,2) DEFAULT 0.0,
    last_restart TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id),
    CHECK (user_id != friend_id)
);

-- Community activity feed
CREATE TABLE IF NOT EXISTS community_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('join', 'leave', 'server_start', 'server_stop', 'event_create', 'achievement')),
    activity_data JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social activity feed (for friends)
CREATE TABLE IF NOT EXISTS social_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('join_community', 'start_server', 'play_game', 'rate_community', 'create_server')),
    activity_data JSONB DEFAULT '{}',
    related_community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    related_server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community join requests
CREATE TABLE IF NOT EXISTS community_join_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Community reviews/ratings
CREATE TABLE IF NOT EXISTS community_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Player sessions (for cross-server tracking)
CREATE TABLE IF NOT EXISTS player_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_communities_owner ON communities(owner_id);
CREATE INDEX IF NOT EXISTS idx_communities_featured ON communities(is_featured);
CREATE INDEX IF NOT EXISTS idx_communities_games ON communities USING GIN(games);
CREATE INDEX IF NOT EXISTS idx_communities_tags ON communities USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_servers_owner ON servers(owner_id);
CREATE INDEX IF NOT EXISTS idx_servers_community ON servers(community_id);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_user ON social_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_social_activities_created ON social_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_community_activities_community ON community_activities(community_id);
CREATE INDEX IF NOT EXISTS idx_player_sessions_user ON player_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_player_sessions_server ON player_sessions(server_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_reviews_updated_at BEFORE UPDATE ON community_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_sessions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);

-- Communities policies
CREATE POLICY "Communities are viewable by everyone" ON communities FOR SELECT USING (true);
CREATE POLICY "Users can create communities" ON communities FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Community owners can update their communities" ON communities FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Community owners can delete their communities" ON communities FOR DELETE USING (auth.uid() = owner_id);

-- Community members policies
CREATE POLICY "Community members are viewable by community members" ON community_members FOR SELECT USING (
    community_id IN (
        SELECT community_id FROM community_members WHERE user_id = auth.uid()
    )
);
CREATE POLICY "Users can join communities" ON community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON community_members FOR DELETE USING (auth.uid() = user_id);

-- Servers policies
CREATE POLICY "Servers are viewable by everyone" ON servers FOR SELECT USING (is_public = true);
CREATE POLICY "Server owners can view their servers" ON servers FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create servers" ON servers FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Server owners can update their servers" ON servers FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Server owners can delete their servers" ON servers FOR DELETE USING (auth.uid() = owner_id);

-- Friendships policies
CREATE POLICY "Users can view their friendships" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friend requests" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their friendships" ON friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can delete their friendships" ON friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Social activities policies
CREATE POLICY "Social activities are viewable by friends" ON social_activities FOR SELECT USING (
    user_id IN (
        SELECT CASE 
            WHEN user_id = auth.uid() THEN friend_id 
            ELSE user_id 
        END
        FROM friendships 
        WHERE (user_id = auth.uid() OR friend_id = auth.uid()) AND status = 'accepted'
    ) OR user_id = auth.uid()
);
CREATE POLICY "Users can create their own social activities" ON social_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Community activities policies
CREATE POLICY "Community activities are viewable by community members" ON community_activities FOR SELECT USING (
    community_id IN (
        SELECT community_id FROM community_members WHERE user_id = auth.uid()
    ) OR is_public = true
);

-- Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();