import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { authRateLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../../utils/validators';

const router = Router();
const controller = new AuthController();

/**
 * POST /api/auth/register
 * Register a new user account
 */
router.post(
  '/register',
  authRateLimiter,
  validate(registerSchema),
  asyncHandler((req, res) => controller.register(req, res)),
);

/**
 * POST /api/auth/login
 * Authenticate and receive JWT tokens
 */
router.post(
  '/login',
  authRateLimiter,
  validate(loginSchema),
  asyncHandler((req, res) => controller.login(req, res)),
);

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new token pair
 */
router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler((req, res) => controller.refreshToken(req, res)),
);

/**
 * POST /api/auth/logout
 * Invalidate session (client must discard tokens)
 */
router.post(
  '/logout',
  authenticate,
  asyncHandler((req, res) => controller.logout(req, res)),
);

export default router;
