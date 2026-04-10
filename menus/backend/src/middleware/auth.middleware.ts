// auth.middleware.ts — Fase 3
// Dos middlewares: requireAuth (cualquier usuario autenticado)
// y requireRole (restringe a roles específicos)

import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { UserRole } from "@prisma/client";
import { AppError }                        from "./error-handler";

// Extendemos el tipo de Request para poder acceder a req.user en controllers
interface AuthenticatedUser {
  sub: string;
  name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extrae y verifica el JWT del header Authorization: Bearer <token>.
 * Si es válido, inyecta req.user y continúa.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    next(new AppError("Acceso no autorizado: token requerido", 401));
    return;
  }

  const token = header.slice(7); // quitar "Bearer "
  try {
    req.user = authService.verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Fábrica de middleware de autorización por rol.
 * Uso: requireRole("ADMIN") o requireRole("ADMIN", "CASHIER")
 * Debe usarse DESPUÉS de requireAuth.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Acceso no autorizado", 401));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(`Acceso denegado: se requiere rol ${roles.join(" o ")}`, 403));
      return;
    }
    next();
  };
}