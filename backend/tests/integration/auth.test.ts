import { getTestApp } from '../helpers/testApp';

/**
 * Integration tests for Auth endpoints.
 *
 * These tests use the real Express app wired to a mocked Prisma client
 * (see tests/setup.ts). No real database is required.
 */

const prismaMock = jest.requireMock('../../src/config/prisma').default;

import bcrypt from 'bcryptjs';
import { mockUser } from '../helpers/factories';

describe('Auth API', () => {
  const app = getTestApp();

  // ─── POST /api/auth/register ───────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('should register a new user and return 201 with tokens', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      const { password: _pw, ...userWithoutPassword } = mockUser({ email: 'new@example.com' });
      prismaMock.user.create.mockResolvedValueOnce(userWithoutPassword as any);

      const res = await app.post('/api/auth/register').send({
        email: 'new@example.com',
        password: 'Password1!',
        name: 'New User',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 409 when email is already taken', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser() as any);

      const res = await app.post('/api/auth/register').send({
        email: 'taken@example.com',
        password: 'Password1!',
        name: 'User',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid request body', async () => {
      const res = await app.post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'short',
      });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  // ─── POST /api/auth/login ──────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    it('should login and return tokens for valid credentials', async () => {
      const password = 'Password1!';
      const user = mockUser({ password: await bcrypt.hash(password, 10) });
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      const res = await app.post('/api/auth/login').send({
        email: user.email,
        password,
      });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const res = await app.post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'pass',
      });

      expect(res.status).toBe(401);
    });

    it('should return 401 for wrong password', async () => {
      const user = mockUser({ password: await bcrypt.hash('correct', 10) });
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      const res = await app.post('/api/auth/login').send({
        email: user.email,
        password: 'wrong',
      });

      expect(res.status).toBe(401);
    });

    it('should return 403 for locked account', async () => {
      const user = mockUser({ status: 'LOCKED' });
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      const res = await app.post('/api/auth/login').send({
        email: user.email,
        password: 'anypass',
      });

      expect(res.status).toBe(403);
    });
  });

  // ─── POST /api/auth/refresh ────────────────────────────────────────────────

  describe('POST /api/auth/refresh', () => {
    it('should return 400 when refreshToken is missing', async () => {
      const res = await app.post('/api/auth/refresh').send({});
      expect(res.status).toBe(400);
    });

    it('should return 401 for an invalid token', async () => {
      const res = await app.post('/api/auth/refresh').send({ refreshToken: 'not-a-jwt' });
      expect(res.status).toBe(401);
    });
  });

  // ─── POST /api/auth/logout ────────────────────────────────────────────────

  describe('POST /api/auth/logout', () => {
    it('should return 401 without Authorization header', async () => {
      const res = await app.post('/api/auth/logout');
      expect(res.status).toBe(401);
    });
  });
});
