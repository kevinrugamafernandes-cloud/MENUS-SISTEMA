// OrderService - Lógica de negocio para gestión de órdenes
// Fase 2: Flujo de estados clarificado PENDING→PREPARING→READY→PAID

import { OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/error-handler";
import { CreateOrderInput } from "../validators/order.validator";

// Etiquetas en español para cada estado
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   "Pendiente",
  PREPARING: "En preparación",
  READY:     "Listo",
  PAID:      "Pagado",
};

// Flujo unidireccional por panel:
//   Cocina:  PENDING → PREPARING → READY
//   Caja:    cualquier activo → PAID (cobro directo)
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:   ["PREPARING", "PAID"],
  PREPARING: ["READY",     "PAID"],
  READY:     ["PAID"],
  PAID:      [],
};

// Include reutilizable para queries de orden completa
const ORDER_INCLUDE = {
  table: true,
  orderItems: { include: { product: true } },
} as const;

// Formatea un objeto orden de Prisma al formato de respuesta de la API
function formatOrder(order: {
  id: number;
  table: { number: number };
  status: OrderStatus;
  total: { toString(): string } | number;
  createdAt: Date;
  updatedAt: Date;
  orderItems: {
    id: number;
    quantity: number;
    unitPrice: { toString(): string } | number;
    subtotal:  { toString(): string } | number;
    notes: string | null;
    product: { name: string };
  }[];
}) {
  return {
    id: order.id,
    table: { number: order.table.number },
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status],
    total: Number(order.total),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.orderItems.map((item) => ({
      id: item.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal:  Number(item.subtotal),
      notes: item.notes,
    })),
  };
}

export const orderService = {
  /**
   * Crea una nueva orden con validación completa de mesa y productos.
   */
  async createOrder(input: CreateOrderInput) {
    const { tableNumber, items } = input;

    const table = await prisma.table.findUnique({ where: { number: tableNumber } });
    if (!table)         throw new AppError(`Mesa ${tableNumber} no encontrada`, 404);
    if (!table.active)  throw new AppError(`La mesa ${tableNumber} no está disponible`, 400);

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products   = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const validItems: {
      productId: number; quantity: number; notes?: string;
      unitPrice: number; subtotal: number;
    }[] = [];
    const skippedItems: number[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product || !product.available) { skippedItems.push(item.productId); continue; }
      const unitPrice = Number(product.price);
      validItems.push({ productId: item.productId, quantity: item.quantity,
        notes: item.notes, unitPrice, subtotal: unitPrice * item.quantity });
    }

    if (validItems.length === 0)
      throw new AppError("No hay productos válidos disponibles en la orden", 400);

    const total = validItems.reduce((sum, i) => sum + i.subtotal, 0);

    const order = await prisma.$transaction(async (tx) =>
      tx.order.create({
        data: {
          tableId: table.id,
          status: "PENDING",
          total,
          orderItems: {
            create: validItems.map((i) => ({
              productId: i.productId, quantity: i.quantity,
              notes: i.notes ?? null, unitPrice: i.unitPrice, subtotal: i.subtotal,
            })),
          },
        },
        include: ORDER_INCLUDE,
      })
    );

    return { ...formatOrder(order), skippedProductIds: skippedItems };
  },

  /**
   * Órdenes activas para cocina y caja (PENDING, PREPARING, READY).
   * Más antiguas primero — prioridad natural de atención.
   */
  async getActiveOrders() {
    const orders = await prisma.order.findMany({
      where:   { status: { in: ["PENDING", "PREPARING", "READY"] } },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "asc" },
    });
    return orders.map(formatOrder);
  },

  /**
   * Órdenes PAID del turno actual (últimas 8 horas, máx 50).
   * Para el historial del panel de caja.
   */
  async getRecentPaidOrders() {
    const since = new Date(Date.now() - 8 * 60 * 60 * 1000);
    const orders = await prisma.order.findMany({
      where:   { status: "PAID", updatedAt: { gte: since } },
      include: ORDER_INCLUDE,
      orderBy: { updatedAt: "desc" },
      take:    50,
    });
    return orders.map(formatOrder);
  },

  /**
   * Cambia el estado de una orden validando la transición permitida.
   */
  async updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError(`Orden ${orderId} no encontrada`, 404);

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Transición inválida: "${ORDER_STATUS_LABELS[order.status]}" → "${ORDER_STATUS_LABELS[newStatus]}"`,
        400
      );
    }

    const updated = await prisma.order.update({
      where:   { id: orderId },
      data:    { status: newStatus },
      include: { table: true },
    });

    return {
      id: updated.id,
      tableNumber: updated.table.number,
      status: updated.status,
      statusLabel: ORDER_STATUS_LABELS[updated.status],
      updatedAt: updated.updatedAt,
    };
  },
};