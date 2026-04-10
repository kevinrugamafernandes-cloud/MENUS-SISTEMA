// ConfigController — Fase 5

import { Request, Response, NextFunction } from "express";
import { z }              from "zod";
import { configService }  from "../services/config.service";

const updateConfigSchema = z.object({
  nombre:          z.string().min(1).max(80).optional(),
  bienvenida:      z.string().max(200).optional(),
  moneda:          z.string().min(1).max(10).optional(),
  simbolo_moneda:  z.string().min(1).max(5).optional(),
  nota_pie:        z.string().max(200).optional(),
  logo_url:        z.string().url().optional().or(z.literal("")),
  color_principal: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hex inválido").optional(),
  horario:         z.string().max(100).optional(),
  activo:          z.enum(["true", "false"]).optional(),
});

export const configController = {
  /** GET /api/config  — público, para el cliente QR */
  async getPublic(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await configService.getPublic();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** GET /api/admin/config  — solo ADMIN */
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await configService.getAll();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  },

  /** PATCH /api/admin/config  — solo ADMIN */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data    = updateConfigSchema.parse(req.body);
      const updated = await configService.update(data);
      res.json({ success: true, message: "Configuración guardada", data: updated });
    } catch (err) { next(err); }
  },
};