import { Router } from 'express';
import { CategoriesController } from './categories.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { createCategorySchema, updateCategorySchema } from '../../utils/validators';

const router = Router();
const controller = new CategoriesController();

/**
 * GET /api/categories
 * List all categories (public)
 */
router.get('/', asyncHandler((req, res) => controller.listCategories(req, res)));

/**
 * GET /api/categories/:categoryId
 * Get a single category by ID (public)
 */
router.get('/:categoryId', asyncHandler((req, res) => controller.getCategoryById(req, res)));

/**
 * POST /api/categories
 * Create a new category (admin only)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createCategorySchema),
  asyncHandler((req, res) => controller.createCategory(req, res)),
);

/**
 * PUT /api/categories/:categoryId
 * Update a category (admin only)
 */
router.put(
  '/:categoryId',
  authenticate,
  requireAdmin,
  validate(updateCategorySchema),
  asyncHandler((req, res) => controller.updateCategory(req, res)),
);

/**
 * DELETE /api/categories/:categoryId
 * Delete a category (admin only)
 */
router.delete(
  '/:categoryId',
  authenticate,
  requireAdmin,
  asyncHandler((req, res) => controller.deleteCategory(req, res)),
);

export default router;
