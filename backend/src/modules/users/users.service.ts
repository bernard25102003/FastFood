import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import {
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
} from '../../types/error';
import { paginate, getSkip } from '../../utils/helpers';

export interface UpdateProfileDto {
  name?: string;
  phone?: string | null;
  address?: string | null;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
  role?: UserRole;
  status?: UserStatus;
}

const PROFILE_SELECT = {
  id: true,
  email: true,
  name: true,
  phone: true,
  address: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class UsersService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createNotFoundError('User');
    }

    return prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
        phone: dto.phone,
        address: dto.address,
      },
      select: PROFILE_SELECT,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw createNotFoundError('User');
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw createUnauthorizedError('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(dto.newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }

  // ─── Admin operations ─────────────────────────────────────────────────────

  async listUsers(query: ListUsersQuery) {
    const { page, limit, role, status } = query;
    const where: { role?: UserRole; status?: UserStatus } = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: PROFILE_SELECT,
        skip: getSkip(page, limit),
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return paginate(users, total, page, limit);
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });

    if (!user) {
      throw createNotFoundError('User');
    }

    return user;
  }

  async lockUser(adminId: string, targetUserId: string) {
    if (adminId === targetUserId) {
      throw createForbiddenError('Cannot lock your own account');
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw createNotFoundError('User');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { status: UserStatus.LOCKED },
      select: PROFILE_SELECT,
    });
  }

  async unlockUser(targetUserId: string) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw createNotFoundError('User');
    }

    return prisma.user.update({
      where: { id: targetUserId },
      data: { status: UserStatus.ACTIVE },
      select: PROFILE_SELECT,
    });
  }

  async deleteUser(adminId: string, targetUserId: string) {
    if (adminId === targetUserId) {
      throw createForbiddenError('Cannot delete your own account');
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw createNotFoundError('User');
    }

    await prisma.user.delete({ where: { id: targetUserId } });
  }
}
