import { getTestApp } from '../helpers/testApp';
import { mockUser, mockAdmin, mockProduct, mockReview } from '../helpers/factories';
import jwt from 'jsonwebtoken';

const prismaMock = jest.requireMock('../../src/config/prisma').default;

const makeToken = (userId: string, role: 'USER' | 'ADMIN') =>
  jwt.sign(
    { sub: userId, email: 'test@example.com', role },
    process.env.JWT_SECRET || 'test-secret-key-32-chars-minimum!!',
  );

describe('Reviews API', () => {
  const app = getTestApp();
  const user = mockUser({ id: 'cldabcdefghijklmnopqrstu1' });
  const admin = mockAdmin({ id: 'cldabcdefghijklmnopqrstu2' });
  const product = mockProduct({ id: 'cldabcdefghijklmnopqrstu3' });
  const userToken = makeToken(user.id, 'USER');
  const adminToken = makeToken(admin.id, 'ADMIN');

  const validReviewBody = {
    productId: product.id,
    rating: 5,
    title: 'Great product!',
    content: 'This product exceeded all my expectations.',
  };

  // ─── POST /api/reviews ─────────────────────────────────────────────────────

  describe('POST /api/reviews', () => {
    it('should return 401 without token', async () => {
      const res = await app.post('/api/reviews').send(validReviewBody);
      expect(res.status).toBe(401);
    });

    it('should return 400 when productId is missing', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      const res = await app
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validReviewBody, productId: undefined });
      expect(res.status).toBe(400);
    });

    it('should return 400 when rating is out of range', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      const res = await app
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validReviewBody, rating: 6 });
      expect(res.status).toBe(400);
    });

    it('should return 400 when content is too short', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      const res = await app
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validReviewBody, content: 'Short' });
      expect(res.status).toBe(400);
    });

    it('should create a review for authenticated user', async () => {
      const review = {
        ...mockReview({ productId: product.id, userId: user.id, verified: false }),
        user: { id: user.id, name: user.name },
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.review.findUnique.mockResolvedValueOnce(null);
      prismaMock.order.findFirst.mockResolvedValueOnce(null);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.create.mockResolvedValueOnce(review as any);
      prismaMock.review.findMany.mockResolvedValueOnce([{ rating: 5 }] as any);
      prismaMock.product.update.mockResolvedValueOnce(product);

      const res = await app
        .post('/api/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validReviewBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });
  });

  // ─── GET /api/reviews/product/:productId ───────────────────────────────────

  describe('GET /api/reviews/product/:productId', () => {
    it('should return reviews for a product (public)', async () => {
      const reviews = [
        { ...mockReview({ productId: product.id }), user: { id: user.id, name: 'Test User' } },
      ];

      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.review.findMany.mockResolvedValueOnce(reviews as any);
      prismaMock.review.count.mockResolvedValueOnce(1);

      const res = await app.get(`/api/reviews/product/${product.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      const res = await app.get('/api/reviews/product/nonexistentid');
      expect(res.status).toBe(404);
    });
  });

  // ─── GET /api/reviews/:reviewId ────────────────────────────────────────────

  describe('GET /api/reviews/:reviewId', () => {
    it('should return a review by ID (public)', async () => {
      const review = {
        ...mockReview({ productId: product.id, userId: user.id }),
        user: { id: user.id, name: user.name },
      };

      prismaMock.review.findUnique.mockResolvedValueOnce(review as any);

      const res = await app.get(`/api/reviews/${review.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(review.id);
    });

    it('should return 404 for non-existent review', async () => {
      prismaMock.review.findUnique.mockResolvedValueOnce(null);

      const res = await app.get('/api/reviews/nonexistentid');
      expect(res.status).toBe(404);
    });
  });

  // ─── PUT /api/reviews/:reviewId ────────────────────────────────────────────

  describe('PUT /api/reviews/:reviewId', () => {
    it('should return 401 without token', async () => {
      const res = await app.put('/api/reviews/some_id').send({ rating: 4 });
      expect(res.status).toBe(401);
    });

    it('should update a review when user is the owner', async () => {
      const review = mockReview({ userId: user.id, productId: product.id });
      const updatedReview = {
        ...review,
        rating: 3,
        content: 'Updated content for this product review.',
        user: { id: user.id, name: user.name },
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.review.findUnique.mockResolvedValueOnce(review);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.update.mockResolvedValueOnce(updatedReview as any);
      prismaMock.review.findMany.mockResolvedValueOnce([{ rating: 3 }] as any);
      prismaMock.product.update.mockResolvedValueOnce(product);

      const res = await app
        .put(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 3, content: 'Updated content for this product review.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 403 when user is not the owner', async () => {
      const review = mockReview({ userId: 'another_user_id', productId: product.id });

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.review.findUnique.mockResolvedValueOnce(review);

      const res = await app
        .put(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 2 });

      expect(res.status).toBe(403);
    });
  });

  // ─── DELETE /api/reviews/:reviewId ────────────────────────────────────────

  describe('DELETE /api/reviews/:reviewId', () => {
    it('should return 401 without token', async () => {
      const res = await app.delete('/api/reviews/some_id');
      expect(res.status).toBe(401);
    });

    it('should delete a review when user is the owner', async () => {
      const review = mockReview({ userId: user.id, productId: product.id });

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.review.findUnique.mockResolvedValueOnce(review);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.delete.mockResolvedValueOnce(review);
      prismaMock.review.findMany.mockResolvedValueOnce([] as any);
      prismaMock.product.update.mockResolvedValueOnce(product);

      const res = await app
        .delete(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(204);
    });

    it('should allow admin to delete any review', async () => {
      const review = mockReview({ userId: 'some_user_id', productId: product.id });

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.review.findUnique.mockResolvedValueOnce(review);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.review.delete.mockResolvedValueOnce(review);
      prismaMock.review.findMany.mockResolvedValueOnce([] as any);
      prismaMock.product.update.mockResolvedValueOnce(product);

      const res = await app
        .delete(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 403 when user is not the owner', async () => {
      const review = mockReview({ userId: 'another_user_id', productId: product.id });

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.review.findUnique.mockResolvedValueOnce(review);

      const res = await app
        .delete(`/api/reviews/${review.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── GET /api/reviews/my ──────────────────────────────────────────────────

  describe('GET /api/reviews/my', () => {
    it('should return 401 without token', async () => {
      const res = await app.get('/api/reviews/my');
      expect(res.status).toBe(401);
    });

    it('should return the authenticated user\'s reviews', async () => {
      const reviews = [
        {
          ...mockReview({ userId: user.id }),
          user: { id: user.id, name: user.name },
          product: { id: product.id, name: product.name, images: [] },
        },
      ];

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.review.findMany.mockResolvedValueOnce(reviews as any);
      prismaMock.review.count.mockResolvedValueOnce(1);

      const res = await app
        .get('/api/reviews/my')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });
  });

  // ─── GET /api/reviews/admin ───────────────────────────────────────────────

  describe('GET /api/reviews/admin', () => {
    it('should return 401 without token', async () => {
      const res = await app.get('/api/reviews/admin');
      expect(res.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      const res = await app
        .get('/api/reviews/admin')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it('should return all reviews for admin', async () => {
      const reviews = [
        {
          ...mockReview(),
          user: { id: user.id, name: user.name },
          product: { id: product.id, name: product.name },
        },
      ];

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.review.findMany.mockResolvedValueOnce(reviews as any);
      prismaMock.review.count.mockResolvedValueOnce(1);

      const res = await app
        .get('/api/reviews/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
    });
  });
});
