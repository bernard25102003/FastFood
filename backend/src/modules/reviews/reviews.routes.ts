import { Router } from 'express';
import { ReviewsController } from './reviews.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/asyncHandler';
import { createReviewSchema, updateReviewSchema } from '../../utils/validators';

const router = Router();
const controller = new ReviewsController();

/**
 * GET /api/reviews/my
 * Get the authenticated user's reviews
 */
router.get(
  '/my',
  authenticate,
  asyncHandler((req, res) => controller.listMyReviews(req, res)),
);

/**
 * GET /api/reviews/admin
 * Admin: list all reviews with optional filters
 */
router.get(
  '/admin',
  authenticate,
  requireAdmin,
  asyncHandler((req, res) => controller.adminListAllReviews(req, res)),
);

/**
 * POST /api/reviews
 * Create a new review (authenticated users only)
 */
router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  asyncHandler((req, res) => controller.createReview(req, res)),
);

/**
 * GET /api/reviews/product/:productId
 * List reviews for a product (public)
 */
router.get(
  '/product/:productId',
  asyncHandler((req, res) => controller.listProductReviews(req, res)),
);

/**
 * GET /api/reviews/:reviewId
 * Get a single review by ID (public)
 */
router.get(
  '/:reviewId',
  asyncHandler((req, res) => controller.getReviewById(req, res)),
);

/**
 * PUT /api/reviews/:reviewId
 * Update a review (owner only)
 */
router.put(
  '/:reviewId',
  authenticate,
  validate(updateReviewSchema),
  asyncHandler((req, res) => controller.updateReview(req, res)),
);

/**
 * DELETE /api/reviews/:reviewId
 * Delete a review (owner or admin)
 */
router.delete(
  '/:reviewId',
  authenticate,
  asyncHandler((req, res) => controller.deleteReview(req, res)),
);

export default router;
