import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/modules/auth/auth.service';
import { mockUser } from '../helpers/factories';
import { ApiError } from '../../src/types/error';

const prismaMock = jest.requireMock('../../src/config/prisma').default as DeepMockProxy<PrismaClient>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  // ─── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should create a new user and return tokens', async () => {
      const dto = {
        email: 'new@example.com',
        password: 'Password1!',
        name: 'New User',
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce(
        mockUser({ email: dto.email, name: dto.name }) as any,
      );

      const result = await authService.register(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(dto.email);
    });

    it('should throw CONFLICT if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(mockUser() as any);

      await expect(
        authService.register({ email: 'test@example.com', password: 'pass', name: 'X' }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const plainPassword = 'Password1!';
      const hashed = await bcrypt.hash(plainPassword, 10);
      const user = mockUser({ password: hashed });

      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      const result = await authService.login({ email: user.email, password: plainPassword });

      expect(result).toHaveProperty('accessToken');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw UNAUTHORIZED for unknown email', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(
        authService.login({ email: 'nobody@example.com', password: 'pass' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw UNAUTHORIZED for wrong password', async () => {
      const user = mockUser({ password: await bcrypt.hash('correct', 10) });
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      await expect(
        authService.login({ email: user.email, password: 'wrong' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw FORBIDDEN for locked account', async () => {
      const user = mockUser({ status: 'LOCKED' });
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      await expect(
        authService.login({ email: user.email, password: 'any' }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  // ─── refreshToken ─────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    it('should throw UNAUTHORIZED for invalid token string', async () => {
      await expect(authService.refreshToken('not-a-jwt')).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
