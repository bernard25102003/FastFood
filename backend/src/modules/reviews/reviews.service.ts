import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import {
  createNotFoundError,
  createForbiddenError,
  createConflictError,
} from '../../types/error';
import { paginate, getSkip } from '../../utils/helpers';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateReviewDto {
  productId: string;
  rating: number;
  title?: string;
  content: string;
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  content?: string;
}

export interface ListReviewsQuery {
  page: number;
  limit: number;
  rating?: number;
}

// ─── Selects ──────────────────────────────────────────────────────────────────

const REVIEW_SELECT = {
  id: true,
  productId: true,
  userId: true,
  rating: true,
  title: true,
  content: true,
  verified: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: { id: true, name: true },
  },
} as const;

// ─── Service ──────────────────────────────────────────────────────────────────

export class ReviewsService {
  // ─── Create Review ────────────────────────────────────────────────────────

  async createReview(userId: string, dto: CreateReviewDto) {
    // Check product exists
    const product = await prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) {
      throw createNotFoundError('Product');
    }

    // Check if already reviewed
    const existing = await prisma.review.findUnique({
      where: { productId_userId: { productId: dto.productId, userId } },
    });
    if (existing) {
      throw createConflictError('You have already reviewed this product');
    }

    // Check if user has a completed order with this product
    const completedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
        items: { some: { productId: dto.productId } },
      },
    });

    const verified = completedOrder !== null;

    // Create review and update product ratings in a transaction
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          productId: dto.productId,
          userId,
          rating: dto.rating,
          title: dto.title,
          content: dto.content,
          verified,
        },
        select: REVIEW_SELECT,
      });

      await this._updateProductRatings(dto.productId, tx);

      return review;
    });
  }

  // ─── Update Review ────────────────────────────────────────────────────────

  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw createNotFoundError('Review');
    }

    if (review.userId !== userId) {
      throw createForbiddenError('You can only edit your own reviews');
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: reviewId },
        data: {
          ...(dto.rating !== undefined && { rating: dto.rating }),
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.content !== undefined && { content: dto.content }),
        },
        select: REVIEW_SELECT,
      });

      await this._updateProductRatings(review.productId, tx);

      return updated;
    });
  }

  // ─── Delete Review ────────────────────────────────────────────────────────

  async deleteReview(reviewId: string, userId: string, isAdmin = false) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw createNotFoundError('Review');
    }

    if (review.userId !== userId && !isAdmin) {
      throw createForbiddenError('You can only delete your own reviews');
    }

    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: reviewId } });
      await this._updateProductRatings(review.productId, tx);
    });
  }

  // ─── List Product Reviews ─────────────────────────────────────────────────

  async listProductReviews(productId: string, query: ListReviewsQuery) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw createNotFoundError('Product');
    }

    const { page, limit, rating } = query;
    const skip = getSkip(page, limit);

    const where: Prisma.ReviewWhereInput = { productId };
    if (rating !== undefined) where.rating = rating;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: REVIEW_SELECT,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return paginate(reviews, total, page, limit);
  }

  // ─── Get Single Review ────────────────────────────────────────────────────

  async getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: REVIEW_SELECT,
    });

    if (!review) {
      throw createNotFoundError('Review');
    }

    return review;
  }

  // ─── List User's Own Reviews ──────────────────────────────────────────────

  async listMyReviews(userId: string, query: { page: number; limit: number }) {
    const { page, limit } = query;
    const skip = getSkip(page, limit);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        select: {
          ...REVIEW_SELECT,
          product: {
            select: { id: true, name: true, images: { take: 1, select: { thumbnailUrl: true, imageUrl: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    return paginate(reviews, total, page, limit);
  }

  // ─── Admin: List All Reviews ──────────────────────────────────────────────

  async listAllReviews(query: { page: number; limit: number; rating?: number; productId?: string }) {
    const { page, limit, rating, productId } = query;
    const skip = getSkip(page, limit);

    const where: Prisma.ReviewWhereInput = {};
    if (rating !== undefined) where.rating = rating;
    if (productId) where.productId = productId;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        select: {
          ...REVIEW_SELECT,
          product: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return paginate(reviews, total, page, limit);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async _updateProductRatings(
    productId: string,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const reviews = await tx.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? new Prisma.Decimal(
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount,
          ).toDecimalPlaces(2)
        : new Prisma.Decimal(0);

    await tx.product.update({
      where: { id: productId },
      data: { avgRating, reviewCount },
    });
  }
}
