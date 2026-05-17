import { getTestApp } from '../helpers/testApp';
import { mockProduct, mockCategory, mockAdmin, mockUser } from '../helpers/factories';
import jwt from 'jsonwebtoken';

const prismaMock = jest.requireMock('../../src/config/prisma').default;

// Mock ImageService to avoid real ImageKit calls
jest.mock('../../src/modules/images/images.service', () => ({
  ImageService: jest.fn().mockImplementation(() => ({
    uploadImage: jest.fn().mockResolvedValue({
      fileId: 'ik_file_001',
      url: 'https://ik.imagekit.io/test/image.jpg',
      thumbnailUrl: 'https://ik.imagekit.io/test/image.jpg?tr=w-200,h-200,c-at,q-80',
      name: 'image.jpg',
      size: 102400,
    }),
    deleteImage: jest.fn().mockResolvedValue(undefined),
  })),
}));

const makeToken = (userId: string, role: 'USER' | 'ADMIN') =>
  jwt.sign({ sub: userId, email: 'test@example.com', role }, process.env.JWT_SECRET || 'test-secret-key-32-chars-minimum!!');

describe('Products API', () => {
  const app = getTestApp();

  // ─── GET /api/products ─────────────────────────────────────────────────────

  describe('GET /api/products', () => {
    it('should return paginated products without authentication', async () => {
      const products = [mockProduct(), mockProduct({ name: 'Product B' })];
      prismaMock.product.findMany.mockResolvedValueOnce(products);
      prismaMock.product.count.mockResolvedValueOnce(2);

      const res = await app.get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should accept query parameters', async () => {
      prismaMock.product.findMany.mockResolvedValueOnce([]);
      prismaMock.product.count.mockResolvedValueOnce(0);

      const res = await app.get('/api/products?search=laptop&page=1&limit=5&sortBy=price&sortOrder=asc');

      expect(res.status).toBe(200);
    });

    it('should return 400 for invalid query params', async () => {
      const res = await app.get('/api/products?sortBy=invalidSort');

      expect(res.status).toBe(400);
    });
  });

  // ─── GET /api/products/:productId ─────────────────────────────────────────

  describe('GET /api/products/:productId', () => {
    it('should return a product with details', async () => {
      const product = {
        ...mockProduct(),
        category: { id: 'cat1', name: 'Electronics', description: null },
        images: [{ id: 'img1', imageUrl: 'https://test.com/img.jpg', thumbnailUrl: null, displayOrder: 0 }],
      };
      prismaMock.product.findUnique.mockResolvedValueOnce(product);

      const res = await app.get(`/api/products/${product.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(product.id);
    });

    it('should return 404 for non-existent product', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      const res = await app.get('/api/products/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  // ─── POST /api/products ────────────────────────────────────────────────────

  describe('POST /api/products', () => {
    // A valid CUID (factories use randomUUID which doesn't pass .cuid() validation)
    const validCuid = 'cjld2cyuq0000t3rmniod1foy';

    it('should create a product for admin', async () => {
      const admin = mockAdmin();
      const category = mockCategory({ id: validCuid });
      const product = {
        ...mockProduct({ categoryId: validCuid }),
        category: { id: validCuid, name: category.name, description: null },
        images: [],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.category.findUnique.mockResolvedValueOnce(category);
      prismaMock.product.create.mockResolvedValueOnce(product);

      const res = await app
        .post('/api/products')
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({
          name: 'New Laptop',
          description: 'A powerful laptop for developers',
          price: 1299.99,
          categoryId: validCuid,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toBeDefined();
    });

    it('should return 403 for non-admin users', async () => {
      const user = mockUser();
      prismaMock.user.findUnique.mockResolvedValueOnce(user);

      const res = await app
        .post('/api/products')
        .set('Authorization', `Bearer ${makeToken(user.id, 'USER')}`)
        .send({
          name: 'New Laptop',
          description: 'A powerful laptop for developers',
          price: 1299.99,
          categoryId: 'some-cat-id',
        });

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid request body', async () => {
      const admin = mockAdmin();
      prismaMock.user.findUnique.mockResolvedValueOnce(admin);

      const res = await app
        .post('/api/products')
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({
          name: 'AB', // too short
          description: 'short', // too short
          price: -1, // negative
          categoryId: 'not-a-cuid',
        });

      expect(res.status).toBe(400);
    });
  });

  // ─── PUT /api/products/:productId ─────────────────────────────────────────

  describe('PUT /api/products/:productId', () => {
    it('should update a product for admin', async () => {
      const admin = mockAdmin();
      const product = mockProduct();
      const updated = {
        ...product,
        name: 'Updated Name',
        category: { id: 'cat1', name: 'Cat', description: null },
        images: [],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.product.update.mockResolvedValueOnce(updated);

      const res = await app
        .put(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });

    it('should return 404 when product not found', async () => {
      const admin = mockAdmin();
      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      const res = await app
        .put('/api/products/nonexistent')
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(404);
    });
  });

  // ─── DELETE /api/products/:productId ──────────────────────────────────────

  describe('DELETE /api/products/:productId', () => {
    it('should delete a product for admin', async () => {
      const admin = mockAdmin();
      const product = { ...mockProduct(), images: [] };

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.product.delete.mockResolvedValueOnce(product);

      const res = await app
        .delete(`/api/products/${product.id}`)
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 when product not found', async () => {
      const admin = mockAdmin();
      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      const res = await app
        .delete('/api/products/nonexistent')
        .set('Authorization', `Bearer ${makeToken(admin.id, 'ADMIN')}`);

      expect(res.status).toBe(404);
    });
  });
});
