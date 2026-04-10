// Rutas de configuración — Fase 5
// GET público (cliente QR) + GET/PATCH protegido (admin)

import { Router }            from "express";
import { configController }  from "../controllers/config.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Ruta pública: el cliente QR la consume para personalizar la UI
router.get("/", configController.getPublic);

export default router;