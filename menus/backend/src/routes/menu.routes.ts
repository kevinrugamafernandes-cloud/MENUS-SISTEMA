// Rutas del menú público (cliente QR)

import { Router } from "express";
import { menuController } from "../controllers/menu.controller";

const router = Router();

// GET /api/menu/:tableNumber - Obtener menú y datos de mesa
router.get("/:tableNumber", menuController.getMenu);

export default router;