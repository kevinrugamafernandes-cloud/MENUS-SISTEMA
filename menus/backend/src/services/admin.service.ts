// AdminService — Fase 4
// CRUD: productos, categorías, mesas + historial de órdenes + reportes

import { prisma }   from "../lib/prisma";
import { AppError } from "../middleware/error-handler";
import { Prisma } from "@prisma/client";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CreateProductInput {
  name:         string;
  description?: string;
  price:        number;
  imageUrl?:    string;
  available?:   boolean;
  categoryId:   number;
}
export interface UpdateProductInput extends Partial<CreateProductInput> {}

export interface CreateCategoryInput { name: string; }

export interface CreateTableInput {
  number:  number;
  qrCode?: string;  // si no viene, se genera automáticamente
  active?: boolean;
}

export interface OrderHistoryFilters {
  desde?:  Date;
  hasta?:  Date;
  limite?: number;
  mesa?:   number;
}

// ── Productos ─────────────────────────────────────────────────────────────────

export const adminService = {
  async getAllProducts() {
    return prisma.product.findMany({
      include: { category: true },
      orderBy: [{ categoryId: "asc" }, { name: "asc" }],
    });
  },

  async createProduct(data: CreateProductInput) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new AppError(`Categoría ${data.categoryId} no encontrada`, 404);

    return prisma.product.create({
      data: {
        name:        data.name,
        description: data.description ?? null,
        price:       data.price,
        imageUrl:    data.imageUrl ?? null,
        available:   data.available ?? true,
        categoryId:  data.categoryId,
      },
      include: { category: true },
    });
  },

  async updateProduct(id: number, data: UpdateProductInput) {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) throw new AppError(`Producto ${id} no encontrado`, 404);

    if (data.categoryId !== undefined) {
      const cat = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!cat) throw new AppError(`Categoría ${data.categoryId} no encontrada`, 404);
    }

    return prisma.product.update({ where: { id }, data, include: { category: true } });
  },

  async setProductAvailability(id: number, available: boolean) {
    const exists = await prisma.product.findUnique({ where: { id } });
    if (!exists) throw new AppError(`Producto ${id} no encontrado`, 404);

    return prisma.product.update({
      where: { id }, data: { available }, include: { category: true },
    });
  },

  async toggleProductAvailability(id: number) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError(`Producto ${id} no encontrado`, 404);

    return prisma.product.update({
      where: { id }, data: { available: !product.available }, include: { category: true },
    });
  },

  // ── Categorías ─────────────────────────────────────────────────────────────

  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  },

  async createCategory(data: CreateCategoryInput) {
    const exists = await prisma.category.findUnique({ where: { name: data.name } });
    if (exists) throw new AppError(`La categoría "${data.name}" ya existe`, 409);
    return prisma.category.create({ data: { name: data.name } });
  },

  async updateCategory(id: number, name: string) {
    const exists = await prisma.category.findUnique({ where: { id } });
    if (!exists) throw new AppError(`Categoría ${id} no encontrada`, 404);

    const taken = await prisma.category.findFirst({ where: { name, NOT: { id } } });
    if (taken) throw new AppError(`El nombre "${name}" ya está en uso`, 409);

    return prisma.category.update({ where: { id }, data: { name } });
  },

  // ── Mesas — Fase 4 ─────────────────────────────────────────────────────────

  async getAllTables() {
    return prisma.table.findMany({
      orderBy: { number: "asc" },
      include: {
        _count: { select: { orders: true } },
        // orden activa si existe
        orders: {
          where:   { status: { in: ["PENDING", "PREPARING", "READY"] } },
          select:  { id: true, status: true },
          take:    1,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  },

  async createTable(data: CreateTableInput) {
    const existing = await prisma.table.findUnique({ where: { number: data.number } });
    if (existing) throw new AppError(`La mesa número ${data.number} ya existe`, 409);

    // Generar qrCode si no viene
    const qrCode = data.qrCode?.trim() || `QR-MESA-${String(data.number).padStart(3, "0")}`;

    // Verificar que el qrCode no esté duplicado
    const qrExists = await prisma.table.findUnique({ where: { qrCode } });
    if (qrExists) throw new AppError(`El código QR "${qrCode}" ya está en uso`, 409);

    return prisma.table.create({
      data: { number: data.number, qrCode, active: data.active ?? true },
    });
  },

  async setTableActive(id: number, active: boolean) {
    const table = await prisma.table.findUnique({ where: { id } });
    if (!table) throw new AppError(`Mesa ${id} no encontrada`, 404);

    return prisma.table.update({ where: { id }, data: { active } });
  },

  // ── Historial de órdenes — Fase 4 ─────────────────────────────────────────

  async getOrderHistory(filters: OrderHistoryFilters = {}) {
    const { desde, hasta, limite = 50, mesa } = filters;

    const where: Prisma.OrderWhereInput = {
      status: "PAID",
    };

    if (desde || hasta) {
      where.updatedAt = {
        ...(desde ? { gte: desde } : {}),
        ...(hasta ? { lte: hasta } : {}),
      };
    }

    if (mesa) {
      where.table = { number: mesa };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        table:      true,
        orderItems: { include: { product: { select: { name: true } } } },
      },
      orderBy: { updatedAt: "desc" },
      take:    Math.min(limite, 200), // máximo 200 para evitar abusos
    });

    return orders.map((o) => ({
      id:        o.id,
      mesa:      o.table.number,
      total:     Number(o.total),
      status:    o.status,
      creadaEn:  o.createdAt,
      cobradaEn: o.updatedAt,
      items:     o.orderItems.map((i) => ({
        producto:  i.product.name,
        cantidad:  i.quantity,
        subtotal:  Number(i.subtotal),
      })),
    }));
  },

  // ── Reportes — Fase 4 ──────────────────────────────────────────────────────

  async getDailyReport(fecha?: Date) {
    const dia = fecha ?? new Date();
    dia.setHours(0, 0, 0, 0);
    const finDia = new Date(dia);
    finDia.setHours(23, 59, 59, 999);

    const [ordenes, items] = await Promise.all([
      prisma.order.findMany({
        where:   { status: "PAID", updatedAt: { gte: dia, lte: finDia } },
        include: { table: true },
      }),

      prisma.orderItem.findMany({
        where: { order: { status: "PAID", updatedAt: { gte: dia, lte: finDia } } },
        include: {
          product: { include: { category: true } },
        },
      }),
    ]);

    // Cálculos
    const totalVentas     = ordenes.reduce((s, o) => s + Number(o.total), 0);
    const totalOrdenes    = ordenes.length;
    const ticketPromedio  = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;

    // Productos más vendidos
    const prodMap = new Map<number, { nombre: string; categoria: string; cantidad: number; ingresos: number }>();
    for (const item of items) {
      const id   = item.productId;
      const prev = prodMap.get(id);
      prodMap.set(id, {
        nombre:    item.product.name,
        categoria: item.product.category.name,
        cantidad:  (prev?.cantidad  ?? 0) + item.quantity,
        ingresos:  (prev?.ingresos  ?? 0) + Number(item.subtotal),
      });
    }
    const productosMasVendidos = Array.from(prodMap.values())
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    // Categorías más vendidas
    const catMap = new Map<string, { nombre: string; cantidad: number; ingresos: number }>();
    for (const item of items) {
      const cat  = item.product.category.name;
      const prev = catMap.get(cat);
      catMap.set(cat, {
        nombre:   cat,
        cantidad: (prev?.cantidad ?? 0) + item.quantity,
        ingresos: (prev?.ingresos ?? 0) + Number(item.subtotal),
      });
    }
    const categoriasMasVendidas = Array.from(catMap.values())
      .sort((a, b) => b.ingresos - a.ingresos);

    return {
      fecha:       dia,
      totalVentas,
      totalOrdenes,
      ticketPromedio,
      productosMasVendidos,
      categoriasMasVendidas,
      // Distribución horaria (para gráfico futuro)
      porHora: buildHourlyDistribution(ordenes),
    };
  },
};

// Helper: agrupa ventas por hora del día
function buildHourlyDistribution(
  ordenes: { updatedAt: Date; total: unknown }[]
): { hora: number; ordenes: number; ventas: number }[] {
  const map = new Map<number, { ordenes: number; ventas: number }>();
  for (const o of ordenes) {
    const h    = o.updatedAt.getHours();
    const prev = map.get(h);
    map.set(h, {
      ordenes: (prev?.ordenes ?? 0) + 1,
      ventas:  (prev?.ventas  ?? 0) + Number(o.total),
    });
  }
  return Array.from({ length: 24 }, (_, h) => ({
    hora:    h,
    ordenes: map.get(h)?.ordenes ?? 0,
    ventas:  map.get(h)?.ventas  ?? 0,
  }));
}