import { Request, Response } from 'express';
import { UserRole, UserStatus } from '@prisma/client';
import { UsersService } from './users.service';
import { sendSuccess, sendNoContent } from '../../middleware/responseHandler';

const usersService = new UsersService();

export class UsersController {
  // ─── Current user ─────────────────────────────────────────────────────────

  async getProfile(req: Request, res: Response): Promise<void> {
    const user = await usersService.getProfile(req.user!.id);
    sendSuccess(res, user, 'Profile retrieved');
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    const user = await usersService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, user, 'Profile updated');
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    await usersService.changePassword(req.user!.id, req.body);
    sendSuccess(res, null, 'Password changed successfully');
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  async listUsers(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const role = req.query.role as UserRole | undefined;
    const status = req.query.status as UserStatus | undefined;

    const result = await usersService.listUsers({ page, limit, role, status });
    sendSuccess(res, result, 'Users retrieved');
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const user = await usersService.getUserById(req.params.userId);
    sendSuccess(res, user, 'User retrieved');
  }

  async lockUser(req: Request, res: Response): Promise<void> {
    const user = await usersService.lockUser(req.user!.id, req.params.userId);
    sendSuccess(res, user, 'User locked');
  }

  async unlockUser(req: Request, res: Response): Promise<void> {
    const user = await usersService.unlockUser(req.params.userId);
    sendSuccess(res, user, 'User unlocked');
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    await usersService.deleteUser(req.user!.id, req.params.userId);
    sendNoContent(res);
  }
}
