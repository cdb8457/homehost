import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import {
  request,
  testUsers,
  createTestUser,
  createTestServer,
  generateTestToken,
  setupTestDatabase,
  teardownTestDatabase,
} from './helpers/testUtils';

describe('Servers API', () => {
  let user: any;
  let adminUser: any;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await setupTestDatabase();
    
    user = await createTestUser(testUsers.user);
    adminUser = await createTestUser(testUsers.admin);
    
    userToken = generateTestToken(user.id, 'USER');
    adminToken = generateTestToken(adminUser.id, 'SUPER_ADMIN');
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('GET /api/v1/servers', () => {
    it('should return user servers', async () => {
      await createTestServer(user.id);

      const response = await request
        .get('/api/v1/servers')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.ownedServers).toHaveLength(1);
      expect(response.body.data.ownedServers[0].name).toBe('Test Server');
    });

    it('should require authentication', async () => {
      const response = await request
        .get('/api/v1/servers')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('POST /api/v1/servers', () => {
    it('should create a new server', async () => {
      const serverData = {
        name: 'New Test Server',
        description: 'A new test server',
        gameType: 'minecraft',
        gameVersion: '1.20.1',
        region: 'US-East',
        maxPlayers: 50,
        port: 25566,
        isPublic: true,
        tags: ['test', 'new'],
      };

      const response = await request
        .post('/api/v1/servers')
        .set('Authorization', `Bearer ${userToken}`)
        .send(serverData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.server.name).toBe(serverData.name);
      expect(response.body.data.server.gameType).toBe(serverData.gameType);
      expect(response.body.data.server.ownerId).toBe(user.id);
    });

    it('should fail with invalid data', async () => {
      const serverData = {
        name: '', // Invalid: empty name
        gameType: 'minecraft',
        region: 'US-East',
        maxPlayers: 50,
      };

      const response = await request
        .post('/api/v1/servers')
        .set('Authorization', `Bearer ${userToken}`)
        .send(serverData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with duplicate port', async () => {
      await createTestServer(user.id);

      const serverData = {
        name: 'Another Server',
        description: 'Another test server',
        gameType: 'minecraft',
        gameVersion: '1.20.1',
        region: 'US-East',
        maxPlayers: 50,
        port: 25565, // Same port as existing server
        isPublic: true,
      };

      const response = await request
        .post('/api/v1/servers')
        .set('Authorization', `Bearer ${userToken}`)
        .send(serverData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PORT_IN_USE');
    });
  });

  describe('GET /api/v1/servers/:serverId', () => {
    it('should return server details for owner', async () => {
      const server = await createTestServer(user.id);

      const response = await request
        .get(`/api/v1/servers/${server.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.server.id).toBe(server.id);
      expect(response.body.data.server.name).toBe(server.name);
      expect(response.body.data.server.members).toBeDefined();
    });

    it('should return 404 for non-existent server', async () => {
      const response = await request
        .get('/api/v1/servers/non-existent-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should fail without access permissions', async () => {
      const server = await createTestServer(adminUser.id);

      const response = await request
        .get(`/api/v1/servers/${server.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('PUT /api/v1/servers/:serverId', () => {
    it('should update server for owner', async () => {
      const server = await createTestServer(user.id);

      const updateData = {
        name: 'Updated Server Name',
        description: 'Updated description',
        maxPlayers: 100,
      };

      const response = await request
        .put(`/api/v1/servers/${server.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.server.name).toBe(updateData.name);
      expect(response.body.data.server.description).toBe(updateData.description);
      expect(response.body.data.server.maxPlayers).toBe(updateData.maxPlayers);
    });

    it('should fail for non-owner', async () => {
      const server = await createTestServer(adminUser.id);

      const updateData = {
        name: 'Updated Server Name',
      };

      const response = await request
        .put(`/api/v1/servers/${server.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('DELETE /api/v1/servers/:serverId', () => {
    it('should delete server for owner', async () => {
      const server = await createTestServer(user.id);

      const response = await request
        .delete(`/api/v1/servers/${server.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail for non-owner', async () => {
      const server = await createTestServer(adminUser.id);

      const response = await request
        .delete(`/api/v1/servers/${server.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('GET /api/v1/servers/:serverId/members', () => {
    it('should return server members', async () => {
      const server = await createTestServer(user.id);

      const response = await request
        .get(`/api/v1/servers/${server.id}/members`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.members).toHaveLength(1);
      expect(response.body.data.members[0].role).toBe('OWNER');
      expect(response.body.data.members[0].user.id).toBe(user.id);
    });

    it('should support pagination', async () => {
      const server = await createTestServer(user.id);

      const response = await request
        .get(`/api/v1/servers/${server.id}/members?page=1&limit=10`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });
  });
});