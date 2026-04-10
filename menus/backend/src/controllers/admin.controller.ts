
// ── Exportación CSV — Fase 5 ───────────────────────────────────────────────
// Añadido al objeto adminController existente como método adicional
// AdminController — Fase 5
// Añade: exportOrdersCsv

import { Request, Response, NextFunction } from "express";
import { z }                from "zod";
import { adminService }     from "../services/admin.service";
import { dashboardService } from "../services/dashboard.service";
import { AppError }         from "../middleware/error-handler";

const createProductSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(300).optional(),
  price:       z.number().positive("El precio debe ser positivo"),
  imageUrl:    z.string().url().optional().or(z.literal("")),
  available:   z.boolean().optional(),
  categoryId:  z.number().int().positive(),
});
const updateProductSchema  = createProductSchema.partial();
const availabilitySchema   = z.object({ available: z.boolean() });
const categorySchema       = z.object({ name: z.string().min(1).max(60) });
const createTableSchema    = z.object({
  number: z.number().int().positive(),
  qrCode: z.string().max(100).optional(),
  active: z.boolean().optional(),
});
const historyQuerySchema   = z.object({
  desde:  z.string().optional(),
  hasta:  z.string().optional(),
  limite: z.coerce.number().int().min(1).max(200).optional(),
  mesa:   z.coerce.number().int().positive().optional(),
});

export const adminController = {
  // ── Productos ───────────────────────────────────────────────────────────────
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllProducts();
      res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createProductSchema.parse(req.body);
      const prod = await adminService.createProduct(data);
      res.status(201).json({ success: true, message: "Producto creado", data: prod });
    } catch (err) { next(err); }
  },
  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const data = updateProductSchema.parse(req.body);
      const prod = await adminService.updateProduct(id, data);
      res.json({ success: true, message: "Producto actualizado", data: prod });
    } catch (err) { next(err); }
  },
  async setAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const { available } = availabilitySchema.parse(req.body);
      const prod = await adminService.setProductAvailability(id, available);
      res.json({ success: true, message: `Producto ${available ? "activado" : "desactivado"}`, data: prod });
    } catch (err) { next(err); }
  },
  async toggleProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const prod = await adminService.toggleProductAvailability(id);
      res.json({ success: true, message: `Producto ${prod.available ? "activado" : "desactivado"}`, data: prod });
    } catch (err) { next(err); }
  },

  // ── Categorías ──────────────────────────────────────────────────────────────
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllCategories();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = categorySchema.parse(req.body);
      const cat = await adminService.createCategory({ name });
      res.status(201).json({ success: true, message: "Categoría creada", data: cat });
    } catch (err) { next(err); }
  },
  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const { name } = categorySchema.parse(req.body);
      const cat = await adminService.updateCategory(id, name);
      res.json({ success: true, message: "Categoría actualizada", data: cat });
    } catch (err) { next(err); }
  },

  // ── Mesas ───────────────────────────────────────────────────────────────────
  async getTables(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getAllTables();
      res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },
  async createTable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data  = createTableSchema.parse(req.body);
      const table = await adminService.createTable(data);
      res.status(201).json({ success: true, message: `Mesa ${table.number} creada`, data: table });
    } catch (err) { next(err); }
  },
  async setTableActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const { active } = z.object({ active: z.boolean() }).parse(req.body);
      const table = await adminService.setTableActive(id, active);
      res.json({ success: true, message: `Mesa ${active ? "activada" : "desactivada"}`, data: table });
    } catch (err) { next(err); }
  },

  // ── Historial ───────────────────────────────────────────────────────────────
  async getOrderHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q    = historyQuerySchema.parse(req.query);
      const data = await adminService.getOrderHistory({
        desde:  q.desde  ? new Date(q.desde)  : undefined,
        hasta:  q.hasta  ? new Date(q.hasta)  : undefined,
        limite: q.limite,
        mesa:   q.mesa,
      });
      res.json({ success: true, data, count: data.length });
    } catch (err) { next(err); }
  },

  // ── Exportación CSV — Fase 5 ────────────────────────────────────────────────
  // GET /api/admin/orders/export?desde=&hasta=&limite=
  // Descarga directa de CSV sin librerías externas.
  async exportOrdersCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = historyQuerySchema.parse(req.query);
      const orders = await adminService.getOrderHistory({
        desde:  q.desde  ? new Date(q.desde)  : undefined,
        hasta:  q.hasta  ? new Date(q.hasta)  : undefined,
        limite: q.limite ?? 1000,
        mesa:   q.mesa,
      });

      // Construir CSV manualmente (sin dependencias externas)
      const escape  = (s: string | number) =>
        `"${String(s).replace(/"/g, '""')}"`;

      const header  = ["orden_id", "mesa", "total", "estado", "creada_en", "cobrada_en", "items"];
      const rows    = orders.map((o) => [
        o.id,
        o.mesa,
        o.total.toFixed(2),
        o.status,
        new Date(o.creadaEn).toLocaleString("es-CR"),
        new Date(o.cobradaEn).toLocaleString("es-CR"),
        o.items.map((i) => `${i.producto}×${i.cantidad}`).join("; "),
      ].map(escape).join(","));

      const csv  = [header.join(","), ...rows].join("\r\n");
      const date = new Date().toISOString().slice(0, 10);

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="menus-historial-${date}.csv"`);
      res.send("\uFEFF" + csv); // BOM para Excel
    } catch (err) { next(err); }
  },

  // ── Reportes ────────────────────────────────────────────────────────────────
  async getDailyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fecha } = z.object({ fecha: z.string().optional() }).parse(req.query);
      const data = await adminService.getDailyReport(fecha ? new Date(fecha) : undefined);
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  async getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await dashboardService.getSummary();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },
};