// UsersService — Fase 5
// CRUD de usuarios internos: listar, crear, editar rol, reset password, toggle activo.

import bcrypt       from "bcrypt";
import { UserRole } from "@prisma/client";
import { prisma }   from "../lib/prisma";
import { AppError } from "../middleware/error-handler";

const ROUNDS = 10;

export const usersService = {
  /** Lista todos los usuarios (sin devolver el hash de contraseña). */
  async getAll() {
    const users = await prisma.internalUser.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
    return users.map(({ password: _pw, ...u }) => u);
  },

  /** Crea un nuevo usuario interno. */
  async create(data: { name: string; password: string; role: UserRole }) {
    const exists = await prisma.internalUser.findUnique({ where: { name: data.name } });
    if (exists) throw new AppError(`El usuario "${data.name}" ya existe`, 409);

    const hash = await bcrypt.hash(data.password, ROUNDS);
    const user = await prisma.internalUser.create({
      data: { name: data.name, password: hash, role: data.role, active: true },
    });
    const { password: _pw, ...rest } = user;
    return rest;
  },

  /** Cambia el rol de un usuario existente. */
  async updateRole(id: number, role: UserRole) {
    const user = await prisma.internalUser.findUnique({ where: { id } });
    if (!user) throw new AppError(`Usuario ${id} no encontrado`, 404);

    // Evitar dejar el sistema sin ningún ADMIN activo
    if (user.role === "ADMIN" && role !== "ADMIN") {
      const otrosAdmins = await prisma.internalUser.count({
        where: { role: "ADMIN", active: true, NOT: { id } },
      });
      if (otrosAdmins === 0) {
        throw new AppError("Debe existir al menos un usuario ADMIN activo", 400);
      }
    }

    const updated = await prisma.internalUser.update({
      where: { id },
      data:  { role },
    });
    const { password: _pw, ...rest } = updated;
    return rest;
  },

  /** Resetea la contraseña de un usuario. */
  async resetPassword(id: number, newPassword: string) {
    const user = await prisma.internalUser.findUnique({ where: { id } });
    if (!user) throw new AppError(`Usuario ${id} no encontrado`, 404);

    const hash = await bcrypt.hash(newPassword, ROUNDS);
    await prisma.internalUser.update({ where: { id }, data: { password: hash } });
    return { message: "Contraseña actualizada" };
  },

  /** Activa o desactiva un usuario. Protege contra dejar el sistema sin ADMIN. */
  async setActive(id: number, active: boolean) {
    const user = await prisma.internalUser.findUnique({ where: { id } });
    if (!user) throw new AppError(`Usuario ${id} no encontrado`, 404);

    if (!active && user.role === "ADMIN") {
      const otrosAdmins = await prisma.internalUser.count({
        where: { role: "ADMIN", active: true, NOT: { id } },
      });
      if (otrosAdmins === 0) {
        throw new AppError("No puedes desactivar el último administrador activo", 400);
      }
    }

    const updated = await prisma.internalUser.update({
      where: { id },
      data:  { active },
    });
    const { password: _pw, ...rest } = updated;
    return rest;
  },
};