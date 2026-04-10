// OrderController - Fase 2: agrega endpoint de PAID recientes

import { Request, Response, NextFunction } from "express";
import { OrderStatus } from "@prisma/client";
import { orderService } from "../services/order.service";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.validator";
import { AppError } from "../middleware/error-handler";

export const orderController = {
  /** POST /api/orders */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = createOrderSchema.parse(req.body);
      const order = await orderService.createOrder(input);
      res.status(201).json({ success: true, message: "Orden creada exitosamente", data: order });
    } catch (error) { next(error); }
  },

  /** GET /api/orders/active */
  async getActiveOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getActiveOrders();
      res.json({ success: true, data: orders, count: orders.length });
    } catch (error) { next(error); }
  },

  /** GET /api/orders/paid/recent — historial del turno para caja */
  async getRecentPaid(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await orderService.getRecentPaidOrders();
      res.json({ success: true, data: orders, count: orders.length });
    } catch (error) { next(error); }
  },

  /** PATCH /api/orders/:id/status */
  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const orderId = parseInt(req.params.id);
      if (isNaN(orderId) || orderId <= 0)
        throw new AppError("El ID de la orden debe ser un número positivo", 400);

      const { status } = updateOrderStatusSchema.parse(req.body);
      const updated = await orderService.updateOrderStatus(orderId, status as OrderStatus);
      res.json({ success: true, message: `Estado actualizado a: ${updated.statusLabel}`, data: updated });
    } catch (error) { next(error); }
  },
};