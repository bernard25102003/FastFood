import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, Prisma } from '@prisma/client';
import { OrdersService } from '../../src/modules/orders/orders.service';
import { mockUser, mockProduct, mockOrder, mockOrderItem } from '../helpers/factories';

const prismaMock = jest.requireMock('../../src/config/prisma').default as DeepMockProxy<PrismaClient>;

describe('OrdersService', () => {
  let service: OrdersService;
  const userId = 'cuid_user_001';

  beforeEach(() => {
    service = new OrdersService();
  });

  // ─── createOrder ──────────────────────────────────────────────────────────

  describe('createOrder', () => {
    const dto = {
      items: [{ productId: 'cuid_product_001', quantity: 2 }],
      paymentMethod: 'COD' as const,
      recipientName: 'John Doe',
      recipientPhone: '0901234567',
      recipientAddress: '123 Main Street, Hanoi',
    };

    it('should create an order when products exist', async () => {
      const product = {
        ...mockProduct({ id: 'cuid_product_001' }),
        images: [],
      };
      const order = {
        ...mockOrder({ userId }),
        items: [mockOrderItem({ productId: 'cuid_product_001', quantity: 2 })],
      };

      prismaMock.product.findUnique.mockResolvedValueOnce(product as any);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.order.create.mockResolvedValueOnce(order as any);

      const result = await service.createOrder(userId, dto);

      expect(result).toMatchObject({ userId, status: 'PENDING' });
      expect(prismaMock.order.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NOT_FOUND when a product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValueOnce(null);

      await expect(service.createOrder(userId, dto)).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw NOT_FOUND when one of multiple products does not exist', async () => {
      const dtoMulti = {
        ...dto,
        items: [
          { productId: 'cuid_product_001', quantity: 1 },
          { productId: 'cuid_product_missing', quantity: 1 },
        ],
      };

      prismaMock.product.findUnique
        .mockResolvedValueOnce({ ...mockProduct(), images: [] } as any)
        .mockResolvedValueOnce(null);

      await expect(service.createOrder(userId, dtoMulti)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ─── updateOrderStatus ────────────────────────────────────────────────────

  describe('updateOrderStatus', () => {
    it('should transition PENDING -> CONFIRMED', async () => {
      const order = mockOrder({ status: 'PENDING' });
      const updatedOrder = {
        ...mockOrder({ status: 'CONFIRMED', confirmedAt: new Date() }),
        user: { id: userId, name: 'Test', email: 'test@test.com', phone: null },
        items: [],
      };

      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.order.update.mockResolvedValueOnce(updatedOrder as any);

      const result = await service.updateOrderStatus(order.id, 'CONFIRMED');

      expect(result.status).toBe('CONFIRMED');
    });

    it('should transition SHIPPING -> COMPLETED and increment soldCount', async () => {
      const productId = 'cuid_product_001';
      const order = mockOrder({ status: 'SHIPPING' });
      const updatedOrder = {
        ...mockOrder({ status: 'COMPLETED', completedAt: new Date() }),
        user: { id: userId, name: 'Test', email: 'test@test.com', phone: null },
        items: [mockOrderItem({ productId, quantity: 3 })],
      };

      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);
      prismaMock.$transaction.mockImplementationOnce(async (fn: any) => fn(prismaMock));
      prismaMock.order.update.mockResolvedValueOnce(updatedOrder as any);
      prismaMock.product.update.mockResolvedValueOnce({} as any);

      await service.updateOrderStatus(order.id, 'COMPLETED');

      expect(prismaMock.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: productId },
          data: { soldCount: { increment: 3 } },
        }),
      );
    });

    it('should throw NOT_FOUND when order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.updateOrderStatus('nonexistent', 'CONFIRMED')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('should throw BUSINESS_RULE_VIOLATION on invalid transition PENDING -> COMPLETED', async () => {
      const order = mockOrder({ status: 'PENDING' });
      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);

      await expect(service.updateOrderStatus(order.id, 'COMPLETED')).rejects.toMatchObject({
        statusCode: 422,
      });
    });

    it('should throw BUSINESS_RULE_VIOLATION on invalid transition COMPLETED -> CANCELLED', async () => {
      const order = mockOrder({ status: 'COMPLETED' });
      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);

      await expect(service.updateOrderStatus(order.id, 'CANCELLED')).rejects.toMatchObject({
        statusCode: 422,
      });
    });
  });

  // ─── cancelMyOrder ────────────────────────────────────────────────────────

  describe('cancelMyOrder', () => {
    it('should cancel a PENDING order owned by the user', async () => {
      const order = mockOrder({ userId, status: 'PENDING' });
      const cancelled = { ...order, status: 'CANCELLED' as const, cancelledAt: new Date(), items: [] };

      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);
      prismaMock.order.update.mockResolvedValueOnce(cancelled as any);

      const result = await service.cancelMyOrder(order.id, userId);
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw FORBIDDEN when user does not own the order', async () => {
      const order = mockOrder({ userId: 'another_user', status: 'PENDING' });
      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);

      await expect(service.cancelMyOrder(order.id, userId)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('should throw BUSINESS_RULE_VIOLATION when cancelling a COMPLETED order', async () => {
      const order = mockOrder({ userId, status: 'COMPLETED' });
      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);

      await expect(service.cancelMyOrder(order.id, userId)).rejects.toMatchObject({
        statusCode: 422,
      });
    });

    it('should throw NOT_FOUND when order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce(null);

      await expect(service.cancelMyOrder('nonexistent', userId)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ─── getOrderById ─────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    it('should return order for its owner', async () => {
      const order = {
        ...mockOrder({ userId }),
        user: { id: userId, name: 'Test', email: 'test@test.com', phone: null },
        items: [],
      };

      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);
      const result = await service.getOrderById(order.id, userId, false);
      expect(result.id).toBe(order.id);
    });

    it('should throw FORBIDDEN when non-owner and non-admin accesses an order', async () => {
      const order = {
        ...mockOrder({ userId: 'owner_id' }),
        user: { id: 'owner_id', name: 'Owner', email: 'owner@test.com', phone: null },
        items: [],
      };

      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);

      await expect(service.getOrderById(order.id, 'other_user', false)).rejects.toMatchObject({
        statusCode: 403,
      });
    });

    it('should allow admin to access any order', async () => {
      const order = {
        ...mockOrder({ userId: 'some_user' }),
        user: { id: 'some_user', name: 'User', email: 'user@test.com', phone: null },
        items: [],
      };

      prismaMock.order.findUnique.mockResolvedValueOnce(order as any);
      const result = await service.getOrderById(order.id, 'admin_id', true);
      expect(result.id).toBe(order.id);
    });

    it('should throw NOT_FOUND when order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValueOnce(null);
      await expect(service.getOrderById('nonexistent', userId, false)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  // ─── listMyOrders ─────────────────────────────────────────────────────────

  describe('listMyOrders', () => {
    it('should return paginated orders for a user', async () => {
      const orders = [mockOrder({ userId }), mockOrder({ userId })];
      prismaMock.order.findMany.mockResolvedValueOnce(orders as any);
      prismaMock.order.count.mockResolvedValueOnce(2);

      const result = await service.listMyOrders(userId, { page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
    });
  });
});
