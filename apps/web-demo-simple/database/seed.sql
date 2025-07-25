-- Sample data for HomeHost
-- This creates realistic communities and users for testing

-- Insert sample communities
INSERT INTO communities (id, name, description, banner, logo, brand_colors, member_count, members_online, total_servers, active_servers, join_type, region, tags, games, rating, review_count, is_verified, is_featured, owner_id) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    'Viking Legends',
    'Epic Viking adventures with 500+ warriors. Weekly raids, base building competitions, and legendary tales await!',
    '/images/communities/viking-legends-banner.jpg',
    '/images/communities/viking-legends-logo.png',
    '{"primary": "#8B5A2B", "secondary": "#D4AF37"}',
    547,
    89,
    4,
    3,
    'open',
    'North America',
    ARRAY['PvE', 'Base Building', 'Events', 'Friendly'],
    ARRAY['Valheim'],
    4.8,
    127,
    true,
    true,
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'Motorsport Elite',
    'Professional racing community with weekly championships, driver coaching, and realistic race conditions.',
    '/images/communities/motorsport-banner.jpg',
    '/images/communities/motorsport-logo.png',
    '{"primary": "#FF4444", "secondary": "#1A1A1A"}',
    234,
    34,
    3,
    2,
    'application',
    'Europe',
    ARRAY['Competitive', 'Racing', 'Championships', 'Pro'],
    ARRAY['MotorTown'],
    4.9,
    89,
    true,
    true,
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'Tactical Strike Force',
    'Elite CS2 community focused on tactical gameplay, team coordination, and competitive excellence.',
    '/images/communities/tactical-banner.jpg',
    '/images/communities/tactical-logo.png',
    '{"primary": "#2E86AB", "secondary": "#A23B72"}',
    1247,
    178,
    8,
    6,
    'application',
    'Global',
    ARRAY['Competitive', 'Tactical', 'Esports', 'Team Play'],
    ARRAY['Counter-Strike 2'],
    4.7,
    312,
    true,
    false,
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '550e8400-e29b-41d4-a716-446655440004',
    'Rust Survivors Coalition',
    'Hardcore survival community where alliances matter and trust is earned. Monthly wipe cycles with epic clan wars.',
    '/images/communities/rust-banner.jpg',
    '/images/communities/rust-logo.png',
    '{"primary": "#CD5C2A", "secondary": "#4A4A4A"}',
    892,
    156,
    3,
    3,
    'open',
    'North America',
    ARRAY['PvP', 'Hardcore', 'Clans', 'Survival'],
    ARRAY['Rust'],
    4.5,
    203,
    true,
    false,
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '550e8400-e29b-41d4-a716-446655440005',
    'Zombie Apocalypse Squad',
    'Cooperative survival against the undead hordes. Team up, build bases, and survive the 7-day hordes together!',
    '/images/communities/zombie-banner.jpg',
    '/images/communities/zombie-logo.png',
    '{"primary": "#8B0000", "secondary": "#228B22"}',
    156,
    28,
    2,
    2,
    'open',
    'Global',
    ARRAY['Co-op', 'PvE', 'Survival', 'Zombies'],
    ARRAY['7 Days to Die'],
    4.6,
    67,
    false,
    false,
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    '550e8400-e29b-41d4-a716-446655440006',
    'The Casual Collective',
    'Relaxed gaming community for working professionals. No pressure, just fun gaming sessions after work and weekends.',
    '/images/communities/casual-banner.jpg',
    '/images/communities/casual-logo.png',
    '{"primary": "#20B2AA", "secondary": "#FFE4B5"}',
    324,
    42,
    5,
    3,
    'open',
    'Global',
    ARRAY['Casual', 'Friendly', 'Working Adults', 'Multi-Game'],
    ARRAY['Valheim', 'MotorTown', '7 Days to Die'],
    4.9,
    156,
    true,
    true,
    '550e8400-e29b-41d4-a716-446655440000'
);

-- Insert sample servers
INSERT INTO servers (id, name, description, game, status, player_count, max_players, host_address, host_port, is_public, owner_id, community_id, server_config, uptime_percentage) VALUES
(
    '660e8400-e29b-41d4-a716-446655440001',
    'Main World - Midgard',
    'Main community server for Viking Legends',
    'Valheim',
    'online',
    18,
    20,
    '192.168.1.100',
    2456,
    true,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    '{"map": "Procedural #4423", "gameMode": "PvE Co-op", "difficulty": "Normal"}',
    99.2
),
(
    '660e8400-e29b-41d4-a716-446655440002',
    'Hardcore Challenge',
    'Hardcore mode server for experienced players',
    'Valheim',
    'online',
    8,
    10,
    '192.168.1.101',
    2457,
    true,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001',
    '{"map": "Procedural #9871", "gameMode": "Hardcore PvE", "difficulty": "Hard"}',
    97.8
),
(
    '660e8400-e29b-41d4-a716-446655440003',
    'Championship Circuit',
    'Main competitive racing server',
    'MotorTown',
    'online',
    24,
    32,
    '192.168.1.102',
    7777,
    true,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    '{"map": "Silverstone GP", "gameMode": "Championship", "weather": "Dynamic"}',
    98.5
),
(
    '660e8400-e29b-41d4-a716-446655440004',
    'Main Competitive',
    'Primary CS2 competitive server',
    'Counter-Strike 2',
    'online',
    20,
    20,
    '192.168.1.103',
    27015,
    true,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440003',
    '{"map": "de_mirage", "gameMode": "Competitive", "tickrate": 128}',
    99.7
),
(
    '660e8400-e29b-41d4-a716-446655440005',
    'Main PvP Server',
    'Primary Rust PvP server with monthly wipes',
    'Rust',
    'online',
    180,
    200,
    '192.168.1.104',
    28015,
    true,
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440004',
    '{"map": "Procedural Map", "gameMode": "Vanilla PvP", "wipeSchedule": "Monthly"}',
    96.3
);

-- Insert sample social activities
INSERT INTO social_activities (user_id, activity_type, activity_data, related_community_id, created_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440000',
    'join_community',
    '{"community_name": "Viking Legends", "action": "joined"}',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '2 hours'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'start_server',
    '{"server_name": "Main World - Midgard", "game": "Valheim"}',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '45 minutes'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'rate_community',
    '{"community_name": "Tactical Strike Force", "rating": 5}',
    '550e8400-e29b-41d4-a716-446655440003',
    NOW() - INTERVAL '1 hour'
);

-- Insert sample community activities
INSERT INTO community_activities (community_id, user_id, activity_type, activity_data, created_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'server_start',
    '{"server_name": "Main World - Midgard", "players_online": 18}',
    NOW() - INTERVAL '15 minutes'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'event_create',
    '{"event_name": "Championship Finals", "scheduled_time": "2024-01-15T19:00:00Z"}',
    NOW() - INTERVAL '30 minutes'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    'achievement',
    '{"achievement": "Tournament Finals", "description": "Reached the finals in the weekly tournament"}',
    NOW() - INTERVAL '2 minutes'
);

-- Insert sample community reviews
INSERT INTO community_reviews (community_id, user_id, rating, review_text, created_at) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    5,
    'Amazing community with friendly players and well-managed servers. The weekly events are fantastic!',
    NOW() - INTERVAL '3 days'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    5,
    'Best racing community I''ve ever joined. The skill level is high but everyone is helpful and supportive.',
    NOW() - INTERVAL '1 week'
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440000',
    4,
    'Great tactical gameplay and organized matches. Could use more beginner-friendly events.',
    NOW() - INTERVAL '5 days'
);