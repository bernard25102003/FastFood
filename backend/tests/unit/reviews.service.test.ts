import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, Prisma } from '@prisma/client';
import { ReviewsService } from '../../src/modules/reviews/reviews.service';
import { mockUser, mockProduct, mockOrder, mockReview } from '../helpers/factories';

const prismaMock = jest.requireMock('../../src/config/prisma').default as DeepMockProxy<PrismaClient>;

describe('ReviewsService', () => {
  let service: ReviewsService;
  const userId = 'cuid_user_001';
  const productId = 'cuid_product_001';

  beforeEach(() => {
    service = new ReviewsService();
  });

  // ─── createReview ──────────────────────────────────────────────────────────

  describe('createReview', () => {
    const dto = {
      productId,
      rating: 5,
      title: 'Excellent',
      content: 'This product exceeded my expectations.',
    };

    it('should create a verified review when user has a completed order', async () => {
      const product = mockProduct({ id: productId });
      const completedOrder = mockOrder({ userId, status: 'COMPLETED' });
      const review = {
        ...mockReview({ productId, userId, rating: 5, verified: true }),
        user: { id: userId, name: 'Test User' },
      };

      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.review.findUnique.mockResolvedValueOnce(null);
      prismaMock.order.findFirst.mockResolvedValueOnce(completedOrder);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.create.mockResolvedValueOnce(review as any);
      prismaMock.review.findMany.mockResolvedValueOnce([{ rating: 5 }] as any);
      prismaMock.product.update.mockResolvedValueOnce(product);

      const result = await service.createReview(userId, dto);

      expect(result.verified).toBe(true);
      expect(result.rating).toBe(5);
      expect(prismaMock.review.create).toHaveBeenCalledTimes(1);
    });

    it('should create an unverified review when user has no completed order', async () => {
      const product = mockProduct({ id: productId });
      const review = {
        ...mockReview({ productId, userId, rating: 4, verified: false }),
        user: { id: userId, name: 'Test User' },
      };

      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.review.findUnique.mockResolvedValueOnce(null);
      prismaMock.order.findFirst.mockResolvedValueOnce(null);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.create.mockResolvedValueOnce({ ...review, verified: false } as any);
      prismaMock.review.findMany.mockResolvedValueOnce([{ rating: 4 }] as any);
      prismaMock.product.update.mockResolvedValueOnce(product);

      const result = await service.createReview(userId, { ...dto, rating: 4 });

      expect(result.verified).toBe(false);
    });

    it('should throw 404 when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await expect(service.createReview(userId, dto)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw 409 when user has already reviewed the product', async () => {
      const product = mockProduct({ id: productId });
      const existingReview = mockReview({ productId, userId });

      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.review.findUnique.mockResolvedValueOnce(existingReview);

      await expect(service.createReview(userId, dto)).rejects.toMatchObject({
        statusCode: 409,
      });
    });
  });

  // ─── updateReview ──────────────────────────────────────────────────────────

  describe('updateReview', () => {
    const reviewId = 'cuid_review_001';

    it('should update a review when user is the owner', async () => {
      const review = mockReview({ id: reviewId, userId, productId });
      const updatedReview = {
        ...review,
        rating: 3,
        content: 'Updated content for the review.',
        user: { id: userId, name: 'Test User' },
      };

      prismaMock.review.findUnique.mockResolvedValueOnce(review);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.update.mockResolvedValueOnce(updatedReview as any);
      prismaMock.review.findMany.mockResolvedValueOnce([{ rating: 3 }] as any);
      prismaMock.product.update.mockResolvedValueOnce(mockProduct({ id: productId }));

      const result = await service.updateReview(reviewId, userId, {
        rating: 3,
        content: 'Updated content for the review.',
      });

      expect(result.rating).toBe(3);
    });

    it('should throw 404 when review does not exist', async () => {
      prismaMock.review.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.updateReview(reviewId, userId, { rating: 3 }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should throw 403 when user is not the review owner', async () => {
      const review = mockReview({ id: reviewId, userId: 'other_user_id', productId });

      prismaMock.review.findUnique.mockResolvedValueOnce(review);

      await expect(
        service.updateReview(reviewId, userId, { rating: 3 }),
      ).rejects.toMatchObject({ statusCode: 403 });
    });
  });

  // ─── deleteReview ──────────────────────────────────────────────────────────

  describe('deleteReview', () => {
    const reviewId = 'cuid_review_001';

    it('should delete a review when user is the owner', async () => {
      const review = mockReview({ id: reviewId, userId, productId });

      prismaMock.review.findUnique.mockResolvedValueOnce(review);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.delete.mockResolvedValueOnce(review);
      prismaMock.review.findMany.mockResolvedValueOnce([] as any);
      prismaMock.product.update.mockResolvedValueOnce(mockProduct({ id: productId }));

      await expect(service.deleteReview(reviewId, userId)).resolves.not.toThrow();
    });

    it('should allow admin to delete any review', async () => {
      const review = mockReview({ id: reviewId, userId: 'other_user', productId });

      prismaMock.review.findUnique.mockResolvedValueOnce(review);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.delete.mockResolvedValueOnce(review);
      prismaMock.review.findMany.mockResolvedValueOnce([] as any);
      prismaMock.product.update.mockResolvedValueOnce(mockProduct({ id: productId }));

      await expect(
        service.deleteReview(reviewId, 'admin_id', true),
      ).resolves.not.toThrow();
    });

    it('should throw 403 when non-owner tries to delete', async () => {
      const review = mockReview({ id: reviewId, userId: 'other_user', productId });

      prismaMock.review.findUnique.mockResolvedValueOnce(review);

      await expect(service.deleteReview(reviewId, userId)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('should throw 404 when review does not exist', async () => {
      prismaMock.review.findUnique.mockResolvedValueOnce(null);

      await expect(service.deleteReview(reviewId, userId)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ─── listProductReviews ───────────────────────────────────────────────────

  describe('listProductReviews', () => {
    it('should return paginated reviews for a product', async () => {
      const product = mockProduct({ id: productId });
      const reviews = [
        { ...mockReview({ productId }), user: { id: userId, name: 'Test User' } },
        { ...mockReview({ productId }), user: { id: userId, name: 'Another User' } },
      ];

      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.review.findMany.mockResolvedValueOnce(reviews as any);
      prismaMock.review.count.mockResolvedValueOnce(2);

      const result = await service.listProductReviews(productId, { page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should throw 404 when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await expect(
        service.listProductReviews('nonexistent', { page: 1, limit: 10 }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('should filter reviews by rating', async () => {
      const product = mockProduct({ id: productId });
      const reviews = [
        { ...mockReview({ productId, rating: 5 }), user: { id: userId, name: 'Test User' } },
      ];

      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.review.findMany.mockResolvedValueOnce(reviews as any);
      prismaMock.review.count.mockResolvedValueOnce(1);

      const result = await service.listProductReviews(productId, { page: 1, limit: 10, rating: 5 });

      expect(result.items).toHaveLength(1);
      expect(prismaMock.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ rating: 5 }),
        }),
      );
    });
  });

  // ─── getReviewById ────────────────────────────────────────────────────────

  describe('getReviewById', () => {
    it('should return a review by ID', async () => {
      const review = {
        ...mockReview({ userId, productId }),
        user: { id: userId, name: 'Test User' },
      };

      prismaMock.review.findUnique.mockResolvedValueOnce(review as any);

      const result = await service.getReviewById(review.id);
      expect(result.id).toBe(review.id);
    });

    it('should throw 404 when review does not exist', async () => {
      prismaMock.review.findUnique.mockResolvedValueOnce(null);

      await expect(service.getReviewById('nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
