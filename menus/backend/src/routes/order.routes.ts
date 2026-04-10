// Rutas de órdenes — Fase 2: agrega /paid/recent

import { Router } from "express";
import { orderController } from "../controllers/order.controller";

const router = Router();

// Rutas estáticas ANTES de las dinámicas (:id) para evitar conflictos
router.get("/active",       orderController.getActiveOrders);
router.get("/paid/recent",  orderController.getRecentPaid);    // historial turno caja

router.post("/",            orderController.createOrder);
router.patch("/:id/status", orderController.updateStatus);

export default router;