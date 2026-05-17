import { Router } from 'express';
import { ProductsController, upload } from './products.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  reorderImagesSchema,
} from '../../utils/validators';

const router = Router();
const controller = new ProductsController();

// ─── Public routes ────────────────────────────────────────────────────────────

/**
 * GET /api/products
 * List products with pagination, search, filter, sort
 */
router.get(
  '/',
  validate(productQuerySchema, 'query'),
  asyncHandler((req, res) => controller.listProducts(req, res)),
);

/**
 * GET /api/products/:productId
 * Get product details
 */
router.get('/:productId', asyncHandler((req, res) => controller.getProductById(req, res)));

// ─── Admin routes ─────────────────────────────────────────────────────────────

/**
 * POST /api/products
 * Create a new product (admin only)
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProductSchema),
  asyncHandler((req, res) => controller.createProduct(req, res)),
);

/**
 * PUT /api/products/:productId
 * Update a product (admin only)
 */
router.put(
  '/:productId',
  authenticate,
  requireAdmin,
  validate(updateProductSchema),
  asyncHandler((req, res) => controller.updateProduct(req, res)),
);

/**
 * DELETE /api/products/:productId
 * Delete a product (admin only)
 */
router.delete(
  '/:productId',
  authenticate,
  requireAdmin,
  asyncHandler((req, res) => controller.deleteProduct(req, res)),
);

/**
 * POST /api/products/:productId/images
 * Upload images for a product (admin only)
 * Accepts: multipart/form-data with field "images" (up to 10 files)
 */
router.post(
  '/:productId/images',
  authenticate,
  requireAdmin,
  upload.array('images', 10),
  asyncHandler((req, res) => controller.uploadProductImages(req, res)),
);

/**
 * DELETE /api/products/:productId/images/:imageId
 * Delete a product image (admin only)
 */
router.delete(
  '/:productId/images/:imageId',
  authenticate,
  requireAdmin,
  asyncHandler((req, res) => controller.deleteProductImage(req, res)),
);

/**
 * PATCH /api/products/:productId/images/reorder
 * Reorder product images (admin only)
 */
router.patch(
  '/:productId/images/reorder',
  authenticate,
  requireAdmin,
  validate(reorderImagesSchema),
  asyncHandler((req, res) => controller.reorderProductImages(req, res)),
);

export default router;
