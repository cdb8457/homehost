import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('Seeding users...');
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@homehost.com' },
    update: {},
    create: {
      email: 'admin@homehost.com',
      username: 'admin',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      isActive: true,
      profile: {
        create: {
          bio: 'System Administrator',
          location: 'System'
        }
      },
      preferences: {
        create: {
          theme: 'dark',
          emailNotifications: true,
          pushNotifications: true
        }
      }
    }
  });

  // Create demo users
  const demoUsers = [
    {
      email: 'john.doe@example.com',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Minecraft enthusiast and server owner',
      location: 'New York, USA'
    },
    {
      email: 'jane.smith@example.com',
      username: 'janesmith',
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'CS:GO competitive player',
      location: 'London, UK'
    },
    {
      email: 'mike.wilson@example.com',
      username: 'mikewilson',
      firstName: 'Mike',
      lastName: 'Wilson',
      bio: 'Rust server administrator',
      location: 'Toronto, Canada'
    },
    {
      email: 'sarah.connor@example.com',
      username: 'sarahconnor',
      firstName: 'Sarah',
      lastName: 'Connor',
      bio: 'Valheim server community manager',
      location: 'Sydney, Australia'
    }
  ];

  const createdUsers = [];
  for (const userData of demoUsers) {
    const password = await bcrypt.hash('password123!', 12);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        username: userData.username,
        password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'USER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            bio: userData.bio,
            location: userData.location
          }
        },
        preferences: {
          create: {
            theme: 'light',
            emailNotifications: true,
            pushNotifications: false
          }
        }
      }
    });
    createdUsers.push(user);
  }

  return { admin, users: createdUsers };
}

async function seedGameServers(users: any[]) {
  console.log('Seeding game servers...');
  
  const serverData = [
    {
      name: 'Epic Minecraft Survival',
      description: 'A hardcore survival server with custom plugins and epic builds',
      gameType: 'minecraft',
      gameVersion: '1.20.1',
      region: 'US-East',
      maxPlayers: 100,
      port: 25565,
      isPublic: true,
      tags: ['survival', 'hardcore', 'custom', 'community'],
      ownerId: users[0].id
    },
    {
      name: 'Pro CS:GO Competitive',
      description: 'Competitive Counter-Strike server with 128-tick and anti-cheat',
      gameType: 'csgo',
      gameVersion: '1.38.0.1',
      region: 'EU-West',
      maxPlayers: 10,
      port: 27015,
      isPublic: true,
      tags: ['competitive', '128tick', 'anticheat', 'pro'],
      ownerId: users[1].id
    },
    {
      name: 'Rust PvP Arena',
      description: 'High-action PvP server with custom maps and weekly events',
      gameType: 'rust',
      gameVersion: '2023.12.7',
      region: 'US-West',
      maxPlayers: 200,
      port: 28015,
      isPublic: true,
      tags: ['pvp', 'arena', 'events', 'custom'],
      ownerId: users[2].id
    },
    {
      name: 'Valheim Viking Adventures',
      description: 'PvE exploration server with modded content and community events',
      gameType: 'valheim',
      gameVersion: '0.217.46',
      region: 'AP-Southeast',
      maxPlayers: 10,
      port: 2456,
      isPublic: true,
      tags: ['pve', 'exploration', 'modded', 'community'],
      ownerId: users[3].id
    }
  ];

  const createdServers = [];
  for (const server of serverData) {
    const createdServer = await prisma.server.create({
      data: {
        ...server,
        isOnline: Math.random() > 0.3, // 70% chance of being online
        currentPlayers: Math.floor(Math.random() * (server.maxPlayers / 2)),
        lastHeartbeat: new Date(Date.now() - Math.floor(Math.random() * 300000)) // Within last 5 minutes
      }
    });

    // Add server owner as member
    await prisma.serverMember.create({
      data: {
        serverId: createdServer.id,
        userId: server.ownerId,
        role: 'OWNER'
      }
    });

    createdServers.push(createdServer);
  }

  return createdServers;
}

async function seedCommunities(servers: any[]) {
  console.log('Seeding communities...');
  
  const communityData = [
    {
      serverId: servers[0].id,
      name: 'Epic Builders Community',
      description: 'A friendly community for Minecraft builders and architects',
      banner: 'https://example.com/banner1.jpg',
      logo: 'https://example.com/logo1.jpg',
      primaryColor: '#4A90E2',
      secondaryColor: '#7ED321',
      isPublic: true,
      joinType: 'OPEN',
      rules: [
        'Be respectful to all members',
        'No griefing or stealing',
        'Share your amazing builds',
        'Help newcomers learn'
      ],
      welcomeMessage: 'Welcome to our building community! Feel free to share your creations and get inspired by others.',
      allowPosts: true,
      allowEvents: true,
      moderationLevel: 'moderate'
    },
    {
      serverId: servers[1].id,
      name: 'CS:GO Pro League',
      description: 'Competitive Counter-Strike community for skilled players',
      banner: 'https://example.com/banner2.jpg',
      logo: 'https://example.com/logo2.jpg',
      primaryColor: '#FF6B35',
      secondaryColor: '#F7931E',
      isPublic: true,
      joinType: 'APPLICATION',
      rules: [
        'Minimum rank: Master Guardian',
        'No cheating or exploiting',
        'Respect teammates and opponents',
        'Participate in tournaments'
      ],
      welcomeMessage: 'Welcome to the Pro League! Show us your skills and climb the ranks.',
      allowPosts: true,
      allowEvents: true,
      moderationLevel: 'strict'
    }
  ];

  const createdCommunities = [];
  for (const community of communityData) {
    const createdCommunity = await prisma.community.create({
      data: community
    });

    // Add server owner as community owner
    const server = servers.find(s => s.id === community.serverId);
    await prisma.communityMember.create({
      data: {
        communityId: createdCommunity.id,
        userId: server.ownerId,
        role: 'OWNER'
      }
    });

    createdCommunities.push(createdCommunity);
  }

  return createdCommunities;
}

async function seedPlugins() {
  console.log('Seeding plugins...');
  
  const pluginData = [
    {
      name: 'worldedit',
      displayName: 'WorldEdit',
      description: 'The most powerful world editing plugin for Minecraft',
      version: '7.2.15',
      author: 'sk89q',
      category: 'World Management',
      tags: ['editing', 'building', 'world', 'essential'],
      price: 0,
      isPremium: false,
      isVerified: true,
      rating: 4.9,
      downloads: 45678,
      fileSize: 2048576,
      downloadUrl: 'https://example.com/worldedit.jar',
      checksum: 'abc123def456',
      gameVersions: ['1.20.1', '1.19.4', '1.18.2'],
      readme: '# WorldEdit\n\nWorldEdit is a powerful world editing plugin...',
      changelog: '- Fixed selection bugs\n- Added new brush types\n- Performance improvements',
      publishedAt: new Date('2023-12-01')
    },
    {
      name: 'essentials',
      displayName: 'EssentialsX',
      description: 'Essential commands and features for Minecraft servers',
      version: '2.20.1',
      author: 'EssentialsX Team',
      category: 'Administration',
      tags: ['commands', 'essential', 'admin', 'teleport'],
      price: 0,
      isPremium: false,
      isVerified: true,
      rating: 4.8,
      downloads: 78901,
      fileSize: 1536000,
      downloadUrl: 'https://example.com/essentials.jar',
      checksum: 'def456ghi789',
      gameVersions: ['1.20.1', '1.19.4'],
      readme: '# EssentialsX\n\nThe essential plugin for Minecraft servers...',
      changelog: '- Updated for 1.20.1\n- Fixed economy bugs\n- Added new commands',
      publishedAt: new Date('2023-11-15')
    },
    {
      name: 'luckperms',
      displayName: 'LuckPerms',
      description: 'A permissions plugin for Minecraft servers',
      version: '5.4.102',
      author: 'Luck',
      category: 'Permissions',
      tags: ['permissions', 'groups', 'admin', 'essential'],
      price: 0,
      isPremium: false,
      isVerified: true,
      rating: 4.9,
      downloads: 56789,
      fileSize: 1024000,
      downloadUrl: 'https://example.com/luckperms.jar',
      checksum: 'ghi789jkl012',
      gameVersions: ['1.20.1', '1.19.4', '1.18.2'],
      readme: '# LuckPerms\n\nA permissions plugin for Minecraft servers...',
      changelog: '- Bug fixes\n- Performance improvements\n- New features',
      publishedAt: new Date('2023-10-20')
    },
    {
      name: 'vault',
      displayName: 'Vault',
      description: 'Economy API for Minecraft plugins',
      version: '1.7.3',
      author: 'MilkBowl',
      category: 'Economy',
      tags: ['economy', 'api', 'dependency', 'essential'],
      price: 0,
      isPremium: false,
      isVerified: true,
      rating: 4.7,
      downloads: 67890,
      fileSize: 512000,
      downloadUrl: 'https://example.com/vault.jar',
      checksum: 'jkl012mno345',
      gameVersions: ['1.20.1', '1.19.4', '1.18.2', '1.17.1'],
      readme: '# Vault\n\nEconomy API for Minecraft plugins...',
      changelog: '- API improvements\n- Bug fixes\n- Updated for newer versions',
      publishedAt: new Date('2023-09-10')
    }
  ];

  const createdPlugins = [];
  for (const plugin of pluginData) {
    const createdPlugin = await prisma.plugin.create({
      data: plugin
    });

    // Create plugin version
    await prisma.pluginVersion.create({
      data: {
        pluginId: createdPlugin.id,
        version: plugin.version,
        downloadUrl: plugin.downloadUrl,
        fileSize: plugin.fileSize,
        checksum: plugin.checksum,
        changelog: plugin.changelog,
        gameVersions: plugin.gameVersions
      }
    });

    createdPlugins.push(createdPlugin);
  }

  return createdPlugins;
}

async function seedServerMetrics(servers: any[]) {
  console.log('Seeding server metrics...');
  
  const metricTypes = ['cpu', 'memory', 'disk', 'network', 'players'];
  
  for (const server of servers) {
    for (let i = 0; i < 48; i++) { // 48 hours of hourly metrics
      const timestamp = new Date(Date.now() - (i * 60 * 60 * 1000));
      
      for (const metricType of metricTypes) {
        let value: number;
        let unit: string;
        
        switch (metricType) {
          case 'cpu':
            value = Math.random() * 100;
            unit = 'percent';
            break;
          case 'memory':
            value = Math.random() * 16384; // 16GB max
            unit = 'MB';
            break;
          case 'disk':
            value = Math.random() * 1000000; // 1TB max
            unit = 'MB';
            break;
          case 'network':
            value = Math.random() * 1000;
            unit = 'Mbps';
            break;
          case 'players':
            value = Math.floor(Math.random() * server.maxPlayers);
            unit = 'count';
            break;
          default:
            value = Math.random() * 100;
            unit = 'percent';
        }
        
        await prisma.serverMetric.create({
          data: {
            serverId: server.id,
            metricType,
            value,
            unit,
            timestamp,
            metadata: {
              source: 'system',
              interval: 'hourly'
            }
          }
        });
      }
    }
  }
}

async function seedAlerts(servers: any[]) {
  console.log('Seeding alerts...');
  
  const alertTypes = [
    'high_cpu_usage',
    'low_memory',
    'disk_space_low',
    'server_offline',
    'high_player_count',
    'plugin_error'
  ];
  
  const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];
  
  for (const server of servers) {
    const numAlerts = Math.floor(Math.random() * 5) + 1; // 1-5 alerts per server
    
    for (let i = 0; i < numAlerts; i++) {
      const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)); // Within last week
      
      await prisma.alert.create({
        data: {
          serverId: server.id,
          type: alertType,
          message: `${alertType.replace('_', ' ')} detected on ${server.name}`,
          severity,
          status,
          createdAt,
          ...(status === 'ACKNOWLEDGED' && {
            acknowledgedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 2 * 60 * 60 * 1000))
          }),
          ...(status === 'RESOLVED' && {
            resolvedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 4 * 60 * 60 * 1000))
          }),
          metadata: {
            source: 'monitoring',
            threshold: Math.random() * 100
          }
        }
      });
    }
  }
}

async function seedConfigurations(servers: any[]) {
  console.log('Seeding configurations...');
  
  const configTemplates = [
    {
      category: 'server',
      key: 'max_players',
      value: 100,
      dataType: 'NUMBER',
      description: 'Maximum number of players allowed on the server',
      isRequired: true
    },
    {
      category: 'server',
      key: 'server_name',
      value: 'My Gaming Server',
      dataType: 'STRING',
      description: 'Display name of the server',
      isRequired: true
    },
    {
      category: 'server',
      key: 'enable_pvp',
      value: true,
      dataType: 'BOOLEAN',
      description: 'Enable player vs player combat',
      isRequired: false
    },
    {
      category: 'world',
      key: 'spawn_protection',
      value: 16,
      dataType: 'NUMBER',
      description: 'Spawn protection radius in blocks',
      isRequired: false
    },
    {
      category: 'world',
      key: 'difficulty',
      value: 'normal',
      dataType: 'STRING',
      description: 'Game difficulty level',
      isRequired: false
    }
  ];
  
  for (const server of servers) {
    for (const config of configTemplates) {
      await prisma.configuration.create({
        data: {
          serverId: server.id,
          ...config
        }
      });
    }
  }
}

async function seedConfigTemplates() {
  console.log('Seeding configuration templates...');
  
  const templates = [
    {
      name: 'Minecraft Survival Server',
      description: 'Standard configuration for Minecraft survival servers',
      category: 'minecraft',
      gameType: 'minecraft',
      defaultConfigs: [
        {
          key: 'max_players',
          value: 100,
          category: 'server',
          dataType: 'NUMBER',
          description: 'Maximum number of players',
          isRequired: true
        },
        {
          key: 'enable_pvp',
          value: true,
          category: 'gameplay',
          dataType: 'BOOLEAN',
          description: 'Enable PvP combat',
          isRequired: false
        },
        {
          key: 'difficulty',
          value: 'normal',
          category: 'world',
          dataType: 'STRING',
          description: 'Game difficulty',
          isRequired: false
        }
      ]
    },
    {
      name: 'CS:GO Competitive Server',
      description: 'Configuration for competitive CS:GO servers',
      category: 'csgo',
      gameType: 'csgo',
      defaultConfigs: [
        {
          key: 'tickrate',
          value: 128,
          category: 'server',
          dataType: 'NUMBER',
          description: 'Server tickrate',
          isRequired: true
        },
        {
          key: 'sv_cheats',
          value: false,
          category: 'anticheat',
          dataType: 'BOOLEAN',
          description: 'Enable cheats',
          isRequired: true
        },
        {
          key: 'mp_match_end_restart',
          value: true,
          category: 'match',
          dataType: 'BOOLEAN',
          description: 'Restart after match end',
          isRequired: false
        }
      ]
    }
  ];
  
  for (const template of templates) {
    await prisma.configTemplate.create({
      data: template
    });
  }
}

async function main() {
  console.log('Starting database seeding...');
  
  try {
    // Seed users
    const { admin, users } = await seedUsers();
    console.log(`✓ Created ${users.length + 1} users`);
    
    // Seed servers
    const servers = await seedGameServers(users);
    console.log(`✓ Created ${servers.length} servers`);
    
    // Seed communities
    const communities = await seedCommunities(servers);
    console.log(`✓ Created ${communities.length} communities`);
    
    // Seed plugins
    const plugins = await seedPlugins();
    console.log(`✓ Created ${plugins.length} plugins`);
    
    // Seed server metrics
    await seedServerMetrics(servers);
    console.log(`✓ Created server metrics for ${servers.length} servers`);
    
    // Seed alerts
    await seedAlerts(servers);
    console.log(`✓ Created alerts for ${servers.length} servers`);
    
    // Seed configurations
    await seedConfigurations(servers);
    console.log(`✓ Created configurations for ${servers.length} servers`);
    
    // Seed configuration templates
    await seedConfigTemplates();
    console.log(`✓ Created configuration templates`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nDemo login credentials:');
    console.log('Admin: admin@homehost.com / admin123!');
    console.log('User: john.doe@example.com / password123!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });