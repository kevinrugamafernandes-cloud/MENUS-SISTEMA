// MenUS — Servidor Express v5.0

import "dotenv/config";
import express from "express";
import cors    from "cors";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import menuRoutes   from "./routes/menu.routes";
import orderRoutes  from "./routes/order.routes";
import adminRoutes  from "./routes/admin.routes";
import authRoutes   from "./routes/auth.routes";
import configRoutes from "./routes/config.routes";

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(express.json());
app.use(cors({
  origin:         process.env.FRONTEND_URL ?? "http://localhost:5173",
  methods:        ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "MenUS API", version: "5.0.0", timestamp: new Date() });
});

// Públicas
app.use("/api/auth",   authRoutes);
app.use("/api/menu",   menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/config", configRoutes);   // config pública para cliente QR — Fase 5

// Protegidas (auth + ADMIN)
app.use("/api/admin",  adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🚀 MenUS API v5.0 en http://localhost:${PORT}`);
  console.log(`   Config pública: GET /api/config`);
  console.log(`   Usuarios admin: GET /api/admin/users  [JWT requerido]\n`);
});

export default app;