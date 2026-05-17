import { getTestApp } from '../helpers/testApp';
import { mockCategory, mockAdmin, mockUser } from '../helpers/factories';
import jwt from 'jsonwebtoken';

const prismaMock = jest.requireMock('../../src/config/prisma').default;

// Helper to generate a valid JWT for tests
const makeToken = (userId: string, role: 'USER' | 'ADMIN') =>
  jwt.sign({ sub: userId, email: 'test@example.com', role }, process.env.JWT_SECRET || 'test-secret-key-32-chars-minimum!!');

describe('Categories API', () => {
  const app = getTestApp();

  // ─── GET /api/categories ───────────────────────────────────────────────────

  describe('GET /api/categories', () => {
    it('should return categories without authentication', async () => {
      const categories = [
        { ...mockCategory(), _count: { products: 2 } },
        { ...mockCategory({ name: 'Fashion' }), _count: { products: 5 } },
      ];
      prismaMock.category.findMany.mockResolvedValueOnce(categories);

      const res = await app.get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });

  // ─── GET /api/categories/:categoryId ──────────────────────────────────────

  describe('GET /api/categories/:categoryId', () => {
    it('should return a category by ID', async () => {
      const category = { ...mockCategory(), _count: { products: 3 } };
      prismaMock.category.findUnique.mockResolvedValueOnce(category);

      const res = await app.get(`/api/categories/${category.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(category.id);
    });

    it('should return 404 for non-existent category', async () => {
      prismaMock.category.findUnique.mockResolvedValueOnce(null);

      const res = await app.get('/api/categories/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/categories ─────────────────────────────────────────────────

  describe('POST /api/categories', () => {
    it('should create a category for admin users', async () => {
      const admin = mockAdmin();
      const category = mockCategory({ name: 'New Category' });

      prismaMock.user.findUnique.mockResolvedValueOnce(admin); // authenticate
      prismaMock.category.findUnique.mockResolvedValueOnce(null); // name check
      prismaMock.category.create.mockResolvedValueOnce(category);

      const res = await app
        .post('/api/categories')
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({ name: 'New Category', description: 'Test description' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('New Category');
    });

    it('should return 403 for non-admin users', async () => {
      const user = mockUser();
      prismaMock.user.findUnique.mockResolvedValueOnce(user);

      const res = await app
        .post('/api/categories')
        .set('Authorization', `Bearer ${makeToken(user.id, 'USER')}`)
        .send({ name: 'New Category' });

      expect(res.status).toBe(403);
    });

    it('should return 401 without authentication', async () => {
      const res = await app
        .post('/api/categories')
        .send({ name: 'New Category' });

      expect(res.status).toBe(401);
    });

    it('should return 400 for invalid request body', async () => {
      const admin = mockAdmin();
      prismaMock.user.findUnique.mockResolvedValueOnce(admin);

      const res = await app
        .post('/api/categories')
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({ name: 'X' }); // too short

      expect(res.status).toBe(400);
    });

    it('should return 409 when name already exists', async () => {
      const admin = mockAdmin();
      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.category.findUnique.mockResolvedValueOnce(mockCategory());

      const res = await app
        .post('/api/categories')
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({ name: 'Test Category' });

      expect(res.status).toBe(409);
    });
  });

  // ─── PUT /api/categories/:categoryId ──────────────────────────────────────

  describe('PUT /api/categories/:categoryId', () => {
    it('should update a category for admin', async () => {
      const admin = mockAdmin();
      const existing = mockCategory();
      const updated = { ...existing, name: 'Updated Category' };

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.category.findUnique.mockResolvedValueOnce(existing); // exists check
      prismaMock.category.findUnique.mockResolvedValueOnce(null); // name uniqueness
      prismaMock.category.update.mockResolvedValueOnce(updated);

      const res = await app
        .put(`/api/categories/${existing.id}`)
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({ name: 'Updated Category' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Category');
    });
  });

  // ─── DELETE /api/categories/:categoryId ───────────────────────────────────

  describe('DELETE /api/categories/:categoryId', () => {
    it('should delete an empty category for admin', async () => {
      const admin = mockAdmin();
      const category = mockCategory();

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.category.findUnique.mockResolvedValueOnce(category);
      prismaMock.product.count.mockResolvedValueOnce(0);
      prismaMock.category.delete.mockResolvedValueOnce(category);

      const res = await app
        .delete(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`);

      expect(res.status).toBe(204);
    });

    it('should return 422 when category has products', async () => {
      const admin = mockAdmin();
      const category = mockCategory();

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.category.findUnique.mockResolvedValueOnce(category);
      prismaMock.product.count.mockResolvedValueOnce(5);

      const res = await app
        .delete(`/api/categories/${category.id}`)
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`);

      expect(res.status).toBe(422);
    });
  });
});
