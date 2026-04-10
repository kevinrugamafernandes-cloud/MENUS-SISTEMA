// AuthController — Fase 3
// Maneja login y devuelve token + datos del usuario

import { Request, Response, NextFunction } from "express";
import { z }              from "zod";
import { authService }    from "../services/auth.service";

const loginSchema = z.object({
  name:     z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const authController = {
  /**
   * POST /api/auth/login
   * Body: { name, password }
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, password } = loginSchema.parse(req.body);
      const result = await authService.login(name, password);

      res.json({
        success: true,
        message: `Bienvenido, ${result.user.name}`,
        data:    result,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   * Devuelve los datos del usuario autenticado (requiere requireAuth antes).
   */
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.json({
        success: true,
        data:    req.user,
      });
    } catch (err) {
      next(err);
    }
  },
};