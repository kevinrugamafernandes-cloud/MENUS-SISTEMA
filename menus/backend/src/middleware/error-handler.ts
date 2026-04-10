// Middleware de manejo de errores centralizado
// Captura errores de toda la aplicación y devuelve respuestas consistentes

import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

// Clase de error personalizada para errores de negocio
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Middleware de error global
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Errores de validación Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Error de validación",
      details: err.errors.map((e) => ({
        campo: e.path.join("."),
        mensaje: e.message,
      })),
    });
    return;
  }

  // Errores de negocio conocidos
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Errores desconocidos
  console.error("Error no controlado:", err);
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
  });
}

// Middleware para rutas no encontradas
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}