import { Request, Response } from 'express';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { sendSuccess, sendCreated } from '../../middleware/responseHandler';

const ordersService = new OrdersService();

export class OrdersController {
  // ─── User: create order ────────────────────────────────────────────────────

  async createOrder(req: Request, res: Response): Promise<void> {
    const order = await ordersService.createOrder(req.user!.id, req.body);
    sendCreated(res, order, 'Order created successfully');
  }

  async createVnpayPayment(req: Request, res: Response): Promise<void> {
    const forwardedIp = req.headers['x-forwarded-for'];
    const clientIp = Array.isArray(forwardedIp)
      ? forwardedIp[0]
      : (forwardedIp?.split(',')[0]?.trim() ?? req.socket.remoteAddress ?? '127.0.0.1');

    const result = await ordersService.createOrderWithVnpay(req.user!.id, req.body, clientIp);
    sendCreated(res, result, 'VNPAY payment URL created');
  }

  async verifyVnpayReturn(req: Request, res: Response): Promise<void> {
    const query = req.query as Record<string, string | undefined>;
    const result = await ordersService.verifyVnpayReturn(query);
    sendSuccess(res, result, 'VNPAY return verified');
  }

  // ─── User: list my orders ──────────────────────────────────────────────────

  async listMyOrders(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10, status } = req.query as Record<string, string>;

    const result = await ordersService.listMyOrders(req.user!.id, {
      page: Math.max(1, Number(page)),
      limit: Math.min(100, Math.max(1, Number(limit))),
      status: status as OrderStatus | undefined,
    });

    sendSuccess(res, result, 'Orders retrieved');
  }

  // ─── User: get my order detail ─────────────────────────────────────────────

  async getMyOrderById(req: Request, res: Response): Promise<void> {
    const order = await ordersService.getOrderById(req.params.orderId, req.user!.id, false);
    sendSuccess(res, order, 'Order retrieved');
  }

  // ─── User: cancel order ────────────────────────────────────────────────────

  async cancelMyOrder(req: Request, res: Response): Promise<void> {
    const order = await ordersService.cancelMyOrder(req.params.orderId, req.user!.id);
    sendSuccess(res, order, 'Order cancelled');
  }

  // ─── Admin: list all orders ────────────────────────────────────────────────

  async listAllOrders(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10, status, userId } = req.query as Record<string, string>;

    const result = await ordersService.listAllOrders({
      page: Math.max(1, Number(page)),
      limit: Math.min(100, Math.max(1, Number(limit))),
      status: status as OrderStatus | undefined,
      userId: userId || undefined,
    });

    sendSuccess(res, result, 'Orders retrieved');
  }

  // ─── Admin: get order detail ───────────────────────────────────────────────

  async getOrderById(req: Request, res: Response): Promise<void> {
    const order = await ordersService.getOrderById(req.params.orderId, req.user!.id, true);
    sendSuccess(res, order, 'Order retrieved');
  }

  // ─── Admin: update order status ────────────────────────────────────────────

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    const order = await ordersService.updateOrderStatus(
      req.params.orderId,
      req.body.status as OrderStatus,
    );
    sendSuccess(res, order, 'Order status updated');
  }
}
