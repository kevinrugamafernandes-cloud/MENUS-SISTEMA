import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient, UserRole } from "@prisma/client";
import { AppError } from "../middleware/error-handler";

const prisma = new PrismaClient();

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no configurado en el archivo .env");
  }
  return secret;
}

interface AuthTokenPayload extends jwt.JwtPayload {
  sub: string;
  name: string;
  role: UserRole;
}

export const authService = {
  async login(name: string, password: string) {
    const user = await prisma.internalUser.findUnique({
      where: { name },
    });

    if (!user) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    if (!user.active) {
      throw new AppError("Usuario desactivado. Contacta al administrador.", 403);
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    const payload: AuthTokenPayload = {
      sub: String(user.id),
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, jwtSecret(), { expiresIn: "8h" });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    };
  },

  verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, jwtSecret()) as AuthTokenPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError("Sesión expirada, inicia sesión de nuevo", 401);
      }
      throw new AppError("Token inválido", 401);
    }
  },
};