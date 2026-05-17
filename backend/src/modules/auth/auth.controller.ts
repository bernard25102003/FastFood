import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendCreated } from '../../middleware/responseHandler';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Registration successful');
  }

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const tokens = await authService.refreshToken(req.body.refreshToken);
    sendSuccess(res, tokens, 'Token refreshed');
  }

  async logout(_req: Request, res: Response): Promise<void> {
    // JWT is stateless; client is responsible for discarding the token
    sendSuccess(res, null, 'Logged out successfully');
  }
}
