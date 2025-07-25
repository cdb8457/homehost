import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import {
  request,
  testUsers,
  createTestUser,
  setupTestDatabase,
  teardownTestDatabase,
} from './helpers/testUtils';

describe('Authentication API', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'password123!',
        firstName: 'New',
        lastName: 'User',
      };

      const response = await request
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should fail with duplicate email', async () => {
      await createTestUser(testUsers.user);

      const response = await request
        .post('/api/v1/auth/register')
        .send(testUsers.user)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser(testUsers.user);

      const response = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUsers.user.email,
          password: testUsers.user.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUsers.user.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail with invalid credentials', async () => {
      await createTestUser(testUsers.user);

      const response = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUsers.user.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should fail with non-existent user', async () => {
      const response = await request
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user with valid token', async () => {
      const user = await createTestUser(testUsers.user);

      const loginResponse = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUsers.user.email,
          password: testUsers.user.password,
        });

      const token = loginResponse.body.data.tokens.accessToken;

      const response = await request
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(user.id);
      expect(response.body.data.user.email).toBe(user.email);
    });

    it('should fail without token', async () => {
      const response = await request
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should fail with invalid token', async () => {
      const response = await request
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      await createTestUser(testUsers.user);

      const loginResponse = await request
        .post('/api/v1/auth/login')
        .send({
          email: testUsers.user.email,
          password: testUsers.user.password,
        });

      const token = loginResponse.body.data.tokens.accessToken;

      const response = await request
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should logout without token', async () => {
      const response = await request
        .post('/api/v1/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});