# Database Schema

## PostgreSQL Cloud Database Schema

```sql
-- Core user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'Basic',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile JSONB,
    settings JSONB
);

-- Community management
CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    is_public BOOLEAN DEFAULT true,
    member_count INTEGER DEFAULT 0,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID REFERENCES users(id)
);

-- Game servers (synchronized from Windows apps)
CREATE TABLE game_servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    configuration JSONB,
    performance_metrics JSONB,
    player_count INTEGER DEFAULT 0,
    max_players INTEGER DEFAULT 10,
    uptime_seconds BIGINT DEFAULT 0,
    last_backup TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID REFERENCES users(id),
    community_id UUID REFERENCES communities(id)
);

-- Plugin marketplace
CREATE TABLE plugins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    version VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    downloads INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    supported_games TEXT[],
    is_verified BOOLEAN DEFAULT false,
    package_url VARCHAR(500),
    installation_guide TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    developer_id UUID REFERENCES users(id)
);

-- Community membership
CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES communities(id),
    user_id UUID REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'Member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, user_id)
);

-- Plugin installations (tracks which servers have which plugins)
CREATE TABLE plugin_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES game_servers(id),
    plugin_id UUID REFERENCES plugins(id),
    installed_version VARCHAR(20),
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    configuration JSONB,
    UNIQUE(server_id, plugin_id)
);

-- Revenue tracking for plugins and communities
CREATE TABLE revenue_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(20) NOT NULL, -- 'plugin_sale', 'community_donation', 'subscription'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payer_id UUID REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    plugin_id UUID REFERENCES plugins(id),
    community_id UUID REFERENCES communities(id),
    stripe_payment_intent_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time sync tracking
CREATE TABLE sync_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id),
    data_payload JSONB,
    sync_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_game_servers_owner ON game_servers(owner_id);
CREATE INDEX idx_game_servers_community ON game_servers(community_id);
CREATE INDEX idx_game_servers_status ON game_servers(status);
CREATE INDEX idx_plugins_category ON plugins(category);
CREATE INDEX idx_plugins_supported_games ON plugins USING GIN(supported_games);
CREATE INDEX idx_community_members_community ON community_members(community_id);
CREATE INDEX idx_community_members_user ON community_members(user_id);
CREATE INDEX idx_revenue_transactions_recipient ON revenue_transactions(recipient_id);
CREATE INDEX idx_sync_operations_user ON sync_operations(user_id);
CREATE INDEX idx_sync_operations_status ON sync_operations(sync_status);
```

## SQLite Local Database Schema

```sql
-- Local server configurations and state
CREATE TABLE local_servers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    game_type TEXT NOT NULL,
    status TEXT NOT NULL,
    configuration TEXT, -- JSON serialized configuration
    process_id INTEGER,
    port INTEGER,
    install_path TEXT,
    last_backup TEXT, -- ISO datetime string
    created_at TEXT DEFAULT (datetime('now')),
    cloud_sync_status TEXT DEFAULT 'pending'
);

-- Local plugin installations and configurations
CREATE TABLE local_plugins (
    id TEXT PRIMARY KEY,
    server_id TEXT REFERENCES local_servers(id),
    plugin_id TEXT, -- Cloud plugin ID
    name TEXT NOT NULL,
    version TEXT,
    install_path TEXT,
    configuration TEXT, -- JSON serialized configuration
    is_enabled BOOLEAN DEFAULT 1,
    installed_at TEXT DEFAULT (datetime('now'))
);

-- Performance metrics cache
CREATE TABLE performance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_id TEXT REFERENCES local_servers(id),
    cpu_usage REAL,
    memory_usage REAL,
    network_latency REAL,
    player_count INTEGER,
    recorded_at TEXT DEFAULT (datetime('now'))
);

-- Sync operations queue for offline support
CREATE TABLE pending_sync_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    data_payload TEXT, -- JSON serialized data
    retry_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Local user preferences and settings
CREATE TABLE user_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Game file management
CREATE TABLE game_installations (
    game_type TEXT PRIMARY KEY,
    install_path TEXT NOT NULL,
    version TEXT,
    last_updated TEXT,
    steam_app_id INTEGER,
    is_valid BOOLEAN DEFAULT 1
);

-- Indexes for local performance
CREATE INDEX idx_local_servers_status ON local_servers(status);
CREATE INDEX idx_local_plugins_server ON local_plugins(server_id);
CREATE INDEX idx_performance_history_server ON performance_history(server_id);
CREATE INDEX idx_performance_history_time ON performance_history(recorded_at);
```