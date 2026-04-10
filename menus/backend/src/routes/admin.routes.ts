// Rutas admin — Fase 5: config, usuarios, exportación CSV

import { Router }             from "express";
import { adminController }    from "../controllers/admin.controller";
import { configController }   from "../controllers/config.controller";
import { usersController }    from "../controllers/users.controller";
import { requireAuth, requireRole } from "../middleware/auth.middleware";

const router = Router();
router.use(requireAuth);
router.use(requireRole("ADMIN"));

// ── Productos ──────────────────────────────────────────────────────────────────
router.get   ("/products",                    adminController.getProducts);
router.post  ("/products",                    adminController.createProduct);
router.put   ("/products/:id",                adminController.updateProduct);
router.patch ("/products/:id",                adminController.updateProduct);
router.patch ("/products/:id/availability",   adminController.setAvailability);
router.patch ("/products/:id/toggle",         adminController.toggleProduct);

// ── Categorías ────────────────────────────────────────────────────────────────
router.get   ("/categories",       adminController.getCategories);
router.post  ("/categories",       adminController.createCategory);
router.put   ("/categories/:id",   adminController.updateCategory);
router.patch ("/categories/:id",   adminController.updateCategory);

// ── Mesas ─────────────────────────────────────────────────────────────────────
router.get   ("/tables",               adminController.getTables);
router.post  ("/tables",               adminController.createTable);
router.patch ("/tables/:id/active",    adminController.setTableActive);

// ── Historial ─────────────────────────────────────────────────────────────────
router.get   ("/orders/history",       adminController.getOrderHistory);

// ── Exportación CSV — Fase 5 ──────────────────────────────────────────────────
router.get   ("/orders/export",        adminController.exportOrdersCsv);

// ── Reportes ──────────────────────────────────────────────────────────────────
router.get   ("/reports/daily",        adminController.getDailyReport);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get   ("/dashboard/summary",    adminController.getDashboardSummary);

// ── Configuración del negocio — Fase 5 ───────────────────────────────────────
router.get   ("/config",               configController.getAll);
router.patch ("/config",               configController.update);

// ── Usuarios internos — Fase 5 ───────────────────────────────────────────────
router.get   ("/users",                usersController.getAll);
router.post  ("/users",                usersController.create);
router.patch ("/users/:id/role",       usersController.updateRole);
router.patch ("/users/:id/password",   usersController.resetPassword);
router.patch ("/users/:id/active",     usersController.setActive);

export default router;