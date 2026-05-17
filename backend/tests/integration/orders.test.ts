import { getTestApp } from '../helpers/testApp';
import { mockUser, mockAdmin, mockProduct, mockOrder, mockOrderItem } from '../helpers/factories';
import jwt from 'jsonwebtoken';

const prismaMock = jest.requireMock('../../src/config/prisma').default;

const makeToken = (userId: string, role: 'USER' | 'ADMIN') =>
  jwt.sign(
    { sub: userId, email: 'test@example.com', role },
    process.env.JWT_SECRET || 'test-secret-key-32-chars-minimum!!',
  );

const validOrderBody = {
  items: [{ productId: 'cldabcdefghijklmnopqrstu0', quantity: 2 }],
  paymentMethod: 'COD',
  recipientName: 'Test Recipient',
  recipientPhone: '0901234567',
  recipientAddress: '123 Main Street, Hanoi Vietnam',
};

describe('Orders API', () => {
  const app = getTestApp();
  const user = mockUser({ id: 'cldabcdefghijklmnopqrstu1' });
  const admin = mockAdmin({ id: 'cldabcdefghijklmnopqrstu2' });
  const userToken = makeToken(user.id, 'USER');
  const adminToken = makeToken(admin.id, 'ADMIN');

  // ─── POST /api/orders ──────────────────────────────────────────────────────

  describe('POST /api/orders', () => {
    it('should return 401 without token', async () => {
      const res = await app.post('/api/orders').send(validOrderBody);
      expect(res.status).toBe(401);
    });

    it('should return 400 when items is empty', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      const res = await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validOrderBody, items: [] });
      expect(res.status).toBe(400);
    });

    it('should return 400 when paymentMethod is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      const res = await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validOrderBody, paymentMethod: 'CRYPTO' });
      expect(res.status).toBe(400);
    });

    it('should create an order for authenticated user', async () => {
      const productId = 'cld9vz2340000t38gg4m3b4vj'; // valid CUID
      const product = { ...mockProduct({ id: productId }), images: [] };
      const order = {
        ...mockOrder({ userId: user.id }),
        items: [mockOrderItem({ productId, quantity: 2 })],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.product.findUnique.mockResolvedValueOnce(product);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.order.create.mockResolvedValueOnce(order);

      const body = {
        ...validOrderBody,
        items: [{ productId, quantity: 2 }],
      };

      const res = await app
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(body);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PENDING');
    });
  });

  // ─── GET /api/orders ───────────────────────────────────────────────────────

  describe('GET /api/orders', () => {
    it('should return 401 without token', async () => {
      const res = await app.get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('should return paginated orders for authenticated user', async () => {
      const orders = [mockOrder({ userId: user.id })];

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.order.findMany.mockResolvedValueOnce(orders);
      prismaMock.order.count.mockResolvedValueOnce(1);

      const res = await app
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.pagination).toBeDefined();
    });
  });

  // ─── GET /api/orders/:orderId ──────────────────────────────────────────────

  describe('GET /api/orders/:orderId', () => {
    it('should return 401 without token', async () => {
      const res = await app.get('/api/orders/some-id');
      expect(res.status).toBe(401);
    });

    it('should return order for the owner', async () => {
      const order = {
        ...mockOrder({ userId: user.id }),
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
        items: [],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.order.findUnique.mockResolvedValueOnce(order);

      const res = await app
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(order.id);
    });

    it('should return 403 when user tries to access another user\'s order', async () => {
      const order = {
        ...mockOrder({ userId: 'another_user_id' }),
        user: { id: 'another_user_id', name: 'Other', email: 'other@test.com', phone: null },
        items: [],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.order.findUnique.mockResolvedValueOnce(order);

      const res = await app
        .get(`/api/orders/${order.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ─── PATCH /api/orders/:orderId/cancel ─────────────────────────────────────

  describe('PATCH /api/orders/:orderId/cancel', () => {
    it('should cancel a PENDING order', async () => {
      const order = mockOrder({ userId: user.id, status: 'PENDING' });
      const cancelled = { ...order, status: 'CANCELLED', cancelledAt: new Date(), items: [] };

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.order.findUnique.mockResolvedValueOnce(order);
      prismaMock.order.update.mockResolvedValueOnce(cancelled);

      const res = await app
        .patch(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CANCELLED');
    });

    it('should return 422 when order is already COMPLETED', async () => {
      const order = mockOrder({ userId: user.id, status: 'COMPLETED' });

      prismaMock.user.findUnique.mockResolvedValueOnce(user);
      prismaMock.order.findUnique.mockResolvedValueOnce(order);

      const res = await app
        .patch(`/api/orders/${order.id}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(422);
    });
  });

  // ─── GET /api/orders/admin/all ─────────────────────────────────────────────

  describe('GET /api/orders/admin/all', () => {
    it('should return 403 for non-admin users', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);

      const res = await app
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should return all orders for admin', async () => {
      const orders = [mockOrder(), mockOrder(), mockOrder()];

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.order.findMany.mockResolvedValueOnce(orders);
      prismaMock.order.count.mockResolvedValueOnce(3);

      const res = await app
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(3);
    });
  });

  // ─── PATCH /api/orders/admin/:orderId/status ────────────────────────────────

  describe('PATCH /api/orders/admin/:orderId/status', () => {
    it('should return 403 for non-admin users', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(user);

      const res = await app
        .patch('/api/orders/admin/some-id/status')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(403);
    });

    it('should update order status as admin', async () => {
      const order = mockOrder({ status: 'PENDING' });
      const updated = {
        ...mockOrder({ status: 'CONFIRMED', confirmedAt: new Date() }),
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
        items: [],
      };

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.order.findUnique.mockResolvedValueOnce(order);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.order.update.mockResolvedValueOnce(updated);

      const res = await app
        .patch(`/api/orders/admin/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'CONFIRMED' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('should return 400 when status is invalid', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(admin);

      const res = await app
        .patch('/api/orders/admin/some-id/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
    });

    it('should return 422 on invalid state transition', async () => {
      const order = mockOrder({ status: 'PENDING' });

      prismaMock.user.findUnique.mockResolvedValueOnce(admin);
      prismaMock.order.findUnique.mockResolvedValueOnce(order);

      const res = await app
        .patch(`/api/orders/admin/${order.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'COMPLETED' });

      expect(res.status).toBe(422);
    });
  });
});
