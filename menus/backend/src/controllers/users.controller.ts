// UsersController — Fase 5

import { Request, Response, NextFunction } from "express";
import { z }            from "zod";
import { UserRole }     from "@prisma/client";
import { usersService } from "../services/users.service";
import { AppError }     from "../middleware/error-handler";

const createUserSchema = z.object({
  name:     z.string().min(2, "Mínimo 2 caracteres").max(50).regex(/^\S+$/, "Sin espacios"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role:     z.enum(["ADMIN", "KITCHEN", "CASHIER"]),
});

const updateRoleSchema   = z.object({ role: z.enum(["ADMIN", "KITCHEN", "CASHIER"]) });
const resetPassSchema    = z.object({ password: z.string().min(6, "Mínimo 6 caracteres") });
const setActiveSchema    = z.object({ active: z.boolean() });

export const usersController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.getAll();
      res.json({ success: true, data: users, count: users.length });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await usersService.create({ ...data, role: data.role as UserRole });
      res.status(201).json({ success: true, message: `Usuario "${user.name}" creado`, data: user });
    } catch (err) { next(err); }
  },

  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const { role } = updateRoleSchema.parse(req.body);
      const user = await usersService.updateRole(id, role as UserRole);
      res.json({ success: true, message: "Rol actualizado", data: user });
    } catch (err) { next(err); }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const { password } = resetPassSchema.parse(req.body);
      const result = await usersService.resetPassword(id, password);
      res.json({ success: true, message: result.message });
    } catch (err) { next(err); }
  },

  async setActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) throw new AppError("ID inválido", 400);
      const { active } = setActiveSchema.parse(req.body);
      const user = await usersService.setActive(id, active);
      res.json({
        success: true,
        message: `Usuario ${active ? "activado" : "desactivado"}`,
        data:    user,
      });
    } catch (err) { next(err); }
  },
};