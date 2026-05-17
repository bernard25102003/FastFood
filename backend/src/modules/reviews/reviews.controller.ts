import { Request, Response } from 'express';
import { ReviewsService } from './reviews.service';
import { sendSuccess, sendCreated, sendNoContent } from '../../middleware/responseHandler';
import { safeInt } from '../../utils/helpers';

const reviewsService = new ReviewsService();

export class ReviewsController {
  async createReview(req: Request, res: Response): Promise<void> {
    const review = await reviewsService.createReview(req.user!.id, req.body);
    sendCreated(res, review, 'Review created');
  }

  async updateReview(req: Request, res: Response): Promise<void> {
    const review = await reviewsService.updateReview(
      req.params.reviewId,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, review, 'Review updated');
  }

  async deleteReview(req: Request, res: Response): Promise<void> {
    const isAdmin = req.user!.role === 'ADMIN';
    await reviewsService.deleteReview(req.params.reviewId, req.user!.id, isAdmin);
    sendNoContent(res);
  }

  async listProductReviews(req: Request, res: Response): Promise<void> {
    const page = safeInt(req.query.page, 1) || 1;
    const limit = Math.min(safeInt(req.query.limit, 10) || 10, 100);
    const ratingParam = req.query.rating as string | undefined;
    const rating = ratingParam ? safeInt(ratingParam) : undefined;

    const result = await reviewsService.listProductReviews(req.params.productId, {
      page,
      limit,
      rating,
    });
    sendSuccess(res, result, 'Reviews retrieved');
  }

  async getReviewById(req: Request, res: Response): Promise<void> {
    const review = await reviewsService.getReviewById(req.params.reviewId);
    sendSuccess(res, review, 'Review retrieved');
  }

  async listMyReviews(req: Request, res: Response): Promise<void> {
    const page = safeInt(req.query.page, 1) || 1;
    const limit = Math.min(safeInt(req.query.limit, 10) || 10, 100);

    const result = await reviewsService.listMyReviews(req.user!.id, { page, limit });
    sendSuccess(res, result, 'My reviews retrieved');
  }

  async adminListAllReviews(req: Request, res: Response): Promise<void> {
    const page = safeInt(req.query.page, 1) || 1;
    const limit = Math.min(safeInt(req.query.limit, 20) || 20, 100);
    const ratingParam = req.query.rating as string | undefined;
    const rating = ratingParam ? safeInt(ratingParam) : undefined;
    const productId = req.query.productId as string | undefined;

    const result = await reviewsService.listAllReviews({ page, limit, rating, productId });
    sendSuccess(res, result, 'Reviews retrieved');
  }
}
