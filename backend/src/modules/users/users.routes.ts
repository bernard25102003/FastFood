import { Router } from 'express';
import { UsersController } from './users.controller';
import { validate } from '../../middleware/validate';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { updateProfileSchema, changePasswordSchema } from '../../utils/validators';

const router = Router();
const controller = new UsersController();

// All routes require authentication
router.use(authenticate);

// ─── Current user routes ──────────────────────────────────────────────────

/**
 * GET /api/users/profile
 * Get the authenticated user's profile
 */
router.get('/profile', asyncHandler((req, res) => controller.getProfile(req, res)));

/**
 * PUT /api/users/profile
 * Update the authenticated user's profile
 */
router.put(
  '/profile',
  validate(updateProfileSchema),
  asyncHandler((req, res) => controller.updateProfile(req, res)),
);

/**
 * PUT /api/users/change-password
 * Change the authenticated user's password
 */
router.put(
  '/change-password',
  validate(changePasswordSchema),
  asyncHandler((req, res) => controller.changePassword(req, res)),
);

// ─── Admin routes ─────────────────────────────────────────────────────────

/**
 * GET /api/users/admin
 * List all users (admin only)
 */
router.get(
  '/admin',
  requireAdmin,
  asyncHandler((req, res) => controller.listUsers(req, res)),
);

/**
 * GET /api/users/admin/:userId
 * Get a specific user by ID (admin only)
 */
router.get(
  '/admin/:userId',
  requireAdmin,
  asyncHandler((req, res) => controller.getUserById(req, res)),
);

/**
 * PATCH /api/users/admin/:userId/lock
 * Lock a user account (admin only)
 */
router.patch(
  '/admin/:userId/lock',
  requireAdmin,
  asyncHandler((req, res) => controller.lockUser(req, res)),
);

/**
 * PATCH /api/users/admin/:userId/unlock
 * Unlock a user account (admin only)
 */
router.patch(
  '/admin/:userId/unlock',
  requireAdmin,
  asyncHandler((req, res) => controller.unlockUser(req, res)),
);

/**
 * DELETE /api/users/admin/:userId
 * Delete a user (admin only)
 */
router.delete(
  '/admin/:userId',
  requireAdmin,
  asyncHandler((req, res) => controller.deleteUser(req, res)),
);

export default router;
