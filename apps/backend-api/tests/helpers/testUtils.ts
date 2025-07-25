import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { app } from '../../src/index';
import supertest from 'supertest';

const prisma = new PrismaClient();

export const request = supertest(app);

// Test user data
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    username: 'admin',
    password: 'password123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'SUPER_ADMIN' as const,
  },
  user: {
    email: 'user@test.com',
    username: 'testuser',
    password: 'password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER' as const,
  },
};

// Helper to create test user
export async function createTestUser(userData: typeof testUsers.user) {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      emailVerified: true,
      isActive: true,
    },
  });

  // Create user profile and preferences
  await prisma.userProfile.create({
    data: { userId: user.id },
  });

  await prisma.userPreferences.create({
    data: { userId: user.id },
  });

  return user;
}

// Helper to generate JWT token
export function generateTestToken(userId: string, role: string = 'USER') {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

// Helper to create test server
export async function createTestServer(ownerId: string) {
  const server = await prisma.server.create({
    data: {
      name: 'Test Server',
      description: 'A test server',
      gameType: 'minecraft',
      gameVersion: '1.20.1',
      region: 'US-East',
      maxPlayers: 20,
      port: 25565,
      isPublic: true,
      tags: ['test'],
      ownerId,
    },
  });

  // Add owner as member
  await prisma.serverMember.create({
    data: {
      serverId: server.id,
      userId: ownerId,
      role: 'OWNER',
    },
  });

  return server;
}

// Helper to create test community
export async function createTestCommunity(serverId: string, ownerId: string) {
  const community = await prisma.community.create({
    data: {
      serverId,
      name: 'Test Community',
      description: 'A test community',
      isPublic: true,
      joinType: 'OPEN',
      allowPosts: true,
      allowEvents: true,
    },
  });

  // Add owner as member
  await prisma.communityMember.create({
    data: {
      communityId: community.id,
      userId: ownerId,
      role: 'OWNER',
    },
  });

  return community;
}

// Helper to clean up test data
export async function cleanupTestData() {
  const tablenames = [
    'UserSession',
    'Notification',
    'UserPreferences',
    'UserProfile',
    'CommunityMember',
    'Community',
    'ServerMember',
    'Server',
    'User',
    'Alert',
    'Configuration',
    'ServerMetric',
    'Plugin',
    'PluginVersion',
    'PluginReview',
    'ServerPlugin',
    'ConfigTemplate',
  ];

  for (const tablename of tablenames) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${tablename}"`);
    } catch (error) {
      // Table might not exist or be empty
    }
  }
}

// Test database setup and teardown
export async function setupTestDatabase() {
  await cleanupTestData();
}

export async function teardownTestDatabase() {
  await cleanupTestData();
  await prisma.$disconnect();
}