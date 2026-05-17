import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UsersService } from '../../src/modules/users/users.service';
import { mockUser, mockAdmin } from '../helpers/factories';
import { ApiError } from '../../src/types/error';

const prismaMock = jest.requireMock('../../src/config/prisma').default as DeepMockProxy<PrismaClient>;

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
  });

  // ─── getProfile ───────────────────────────────────────────────────────────

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const user = mockUser();
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      const result = await usersService.getProfile(user.id);
      expect(result.id).toBe(user.id);
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(usersService.getProfile('non-existent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ─── updateProfile ────────────────────────────────────────────────────────

  describe('updateProfile', () => {
    it('should update and return the updated profile', async () => {
      const user = mockUser();
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);
      prismaMock.user.update.mockResolvedValueOnce({ ...user, name: 'Updated Name' } as any);

      const result = await usersService.updateProfile(user.id, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
    });
  });

  // ─── changePassword ───────────────────────────────────────────────────────

  describe('changePassword', () => {
    it('should update password for valid current password', async () => {
      const plainPassword = 'OldPass123!';
      const user = mockUser({ password: await bcrypt.hash(plainPassword, 10) });

      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);
      prismaMock.user.update.mockResolvedValueOnce(user as any);

      await expect(
        usersService.changePassword(user.id, {
          currentPassword: plainPassword,
          newPassword: 'NewPass456!',
        }),
      ).resolves.toBeUndefined();
    });

    it('should throw UNAUTHORIZED for wrong current password', async () => {
      const user = mockUser({ password: await bcrypt.hash('correct', 10) });
      prismaMock.user.findUnique.mockResolvedValueOnce(user as any);

      await expect(
        usersService.changePassword(user.id, { currentPassword: 'wrong', newPassword: 'new' }),
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });

  // ─── lockUser / unlockUser ────────────────────────────────────────────────

  describe('lockUser', () => {
    it('should lock a user', async () => {
      const admin = mockAdmin();
      const target = mockUser();

      prismaMock.user.findUnique.mockResolvedValueOnce(target as any);
      prismaMock.user.update.mockResolvedValueOnce({ ...target, status: 'LOCKED' } as any);

      const result = await usersService.lockUser(admin.id, target.id);
      expect(result.status).toBe('LOCKED');
    });

    it('should prevent admin from locking their own account', async () => {
      const admin = mockAdmin();

      await expect(usersService.lockUser(admin.id, admin.id)).rejects.toMatchObject({
        statusCode: 403,
      });
    });
  });

  // ─── deleteUser ───────────────────────────────────────────────────────────

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const admin = mockAdmin();
      const target = mockUser();

      prismaMock.user.findUnique.mockResolvedValueOnce(target as any);
      prismaMock.user.delete.mockResolvedValueOnce(target as any);

      await expect(usersService.deleteUser(admin.id, target.id)).resolves.toBeUndefined();
    });

    it('should prevent admin from deleting their own account', async () => {
      const admin = mockAdmin();

      await expect(usersService.deleteUser(admin.id, admin.id)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('should throw NOT_FOUND when target does not exist', async () => {
      const admin = mockAdmin();
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      await expect(usersService.deleteUser(admin.id, 'missing-id')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
