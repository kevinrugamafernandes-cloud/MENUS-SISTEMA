// DashboardService — Fase 4
// Métricas del día real + turno actual + ticket promedio + categorías

import { prisma } from "../lib/prisma";

function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function sinceHours(h: number): Date {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}

export const dashboardService = {
  /**
   * Resumen completo del día actual.
   * "Día" = desde 00:00 de hoy hasta ahora.
   * Todas las consultas van en paralelo para minimizar latencia.
   */
  async getSummary() {
    const hoy    = startOfDay();
    const turno  = sinceHours(8); // vista operativa de las últimas 8h

    const [
      // Día completo
      ordenesHoy,
      statusHoy,
      ventasHoy,
      topProductosHoy,
      topCategoriasHoy,

      // Estado actual / catálogo
      ordenesActivas,
      mesasActivas,
      totalProductos,
      productosInactivos,
      totalCategorias,
      totalMesas,
      mesasInactivas,

      // Últimas 5 cobradas (para la tabla del dashboard)
      ultimasCobradas,
    ] = await Promise.all([
      // ── Órdenes del día ────────────────────────────────────────────────
      prisma.order.count({ where: { createdAt: { gte: hoy } } }),

      prisma.order.groupBy({
        by:    ["status"],
        where: { createdAt: { gte: hoy } },
        _count: { status: true },
      }),

      prisma.order.aggregate({
        where: { status: "PAID", updatedAt: { gte: hoy } },
        _sum:  { total: true },
        _avg:  { total: true },
        _count: { id: true },
      }),

      // Top 5 productos del día
      prisma.orderItem.groupBy({
        by:      ["productId"],
        where:   { order: { createdAt: { gte: hoy } } },
        _sum:    { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take:    5,
      }),

      // Top categorías del día (por ingreso)
      prisma.orderItem.groupBy({
        by:      ["productId"],
        where:   { order: { status: "PAID", updatedAt: { gte: hoy } } },
        _sum:    { subtotal: true, quantity: true },
      }),

      // ── Estado actual ──────────────────────────────────────────────────
      prisma.order.count({
        where: { status: { in: ["PENDING", "PREPARING", "READY"] } },
      }),

      prisma.order.findMany({
        where:    { status: { in: ["PENDING", "PREPARING", "READY"] } },
        select:   { tableId: true },
        distinct: ["tableId"],
      }),

      prisma.product.count(),
      prisma.product.count({ where: { available: false } }),
      prisma.category.count(),
      prisma.table.count(),
      prisma.table.count({ where: { active: false } }),

      // Últimas 5 órdenes cobradas hoy
      prisma.order.findMany({
        where:   { status: "PAID", updatedAt: { gte: hoy } },
        include: { table: true, orderItems: { include: { product: true } } },
        orderBy: { updatedAt: "desc" },
        take:    5,
      }),
    ]);

    // Resolver categorías de los top productos
    const allProductIds = [
      ...new Set([
        ...topProductosHoy.map((p) => p.productId),
        ...topCategoriasHoy.map((p) => p.productId),
      ]),
    ];
    const productDetails = await prisma.product.findMany({
      where:   { id: { in: allProductIds } },
      select:  { id: true, name: true, category: { select: { id: true, name: true } } },
    });
    const productMap = new Map(productDetails.map((p) => [p.id, p]));

    // Agrupar ingresos por categoría
    const catRevenueMap = new Map<number, { nombre: string; ingresos: number; cantidad: number }>();
    for (const row of topCategoriasHoy) {
      const prod = productMap.get(row.productId);
      if (!prod) continue;
      const catId = prod.category.id;
      const prev  = catRevenueMap.get(catId);
      catRevenueMap.set(catId, {
        nombre:    prod.category.name,
        ingresos:  (prev?.ingresos ?? 0) + Number(row._sum.subtotal ?? 0),
        cantidad:  (prev?.cantidad ?? 0) + (row._sum.quantity ?? 0),
      });
    }
    const topCategorias = Array.from(catRevenueMap.values())
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 5);

    // Mapa de estados del día
    const statusMap: Record<string, number> = {};
    for (const r of statusHoy) statusMap[r.status] = r._count.status;

    const ventasTotales   = Number(ventasHoy._sum.total  ?? 0);
    const ticketPromedio  = ventasHoy._count.id > 0
      ? ventasTotales / ventasHoy._count.id
      : 0;

    return {
      dia: {
        fecha:          hoy,
        totalOrdenes:   ordenesHoy,
        ordenesCobradas: ventasHoy._count.id,
        ventasTotales,
        ticketPromedio,
        ordenesPorEstado: {
          pendientes: statusMap["PENDING"]   ?? 0,
          preparando: statusMap["PREPARING"] ?? 0,
          listas:     statusMap["READY"]     ?? 0,
          cobradas:   statusMap["PAID"]      ?? 0,
        },
      },
      ahora: {
        ordenesActivas,
        mesasOcupadas: mesasActivas.length,
      },
      catalogo: {
        totalProductos:    totalProductos,
        productosActivos:  totalProductos - productosInactivos,
        productosInactivos,
        totalCategorias,
        totalMesas,
        mesasActivas:      totalMesas - mesasInactivas,
        mesasInactivas,
      },
      topProductos: topProductosHoy.map((p) => ({
        productId:      p.productId,
        nombre:         productMap.get(p.productId)?.name ?? "Desconocido",
        cantidadPedida: p._sum.quantity ?? 0,
        ingresos:       Number(p._sum.subtotal ?? 0),
      })),
      topCategorias,
      ultimasCobradas: ultimasCobradas.map((o) => ({
        id:        o.id,
        mesa:      o.table.number,
        total:     Number(o.total),
        cobradaEn: o.updatedAt,
        items:     o.orderItems.length,
      })),
    };
  },
};