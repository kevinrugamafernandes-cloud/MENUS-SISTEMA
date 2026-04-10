// MenUS — Seed Fase 5
// Añade: config inicial del negocio, campo active en usuarios

import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const ROUNDS = 10;

async function main() {
  console.log("🌱 Iniciando seed MenUS v5...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.internalUser.deleteMany();
  await prisma.businessConfig.deleteMany();

  // ── Categorías ────────────────────────────────────────────────────────────
  await prisma.category.createMany({
    data: [
      { name: "Hamburguesas" },
      { name: "Bebidas" },
      { name: "Postres y Snacks" },
    ],
  });
  const catH = await prisma.category.findUnique({ where: { name: "Hamburguesas" } });
  const catB = await prisma.category.findUnique({ where: { name: "Bebidas" } });
  const catP = await prisma.category.findUnique({ where: { name: "Postres y Snacks" } });
  console.log("✅ 3 categorías");

  // ── Productos ─────────────────────────────────────────────────────────────
  await prisma.product.createMany({
    data: [
      { name: "Hamburguesa Clásica",     description: "Carne de res, lechuga, tomate, cebolla y salsa especial",  price: 8.50,  available: true, categoryId: catH!.id },
      { name: "Hamburguesa BBQ",         description: "Carne de res, bacon crujiente, queso cheddar y salsa BBQ", price: 10.50, available: true, categoryId: catH!.id },
      { name: "Hamburguesa Vegetariana", description: "Medallón de vegetales, aguacate y aderezo de limón",       price: 9.00,  available: true, categoryId: catH!.id },
      { name: "Papas Fritas",            description: "Papas crujientes con sal y salsa a elección",              price: 3.50,  available: true, categoryId: catH!.id },
      { name: "Nachos con Queso",        description: "Nachos tostados con salsa de queso y jalapeños",           price: 5.00,  available: true, categoryId: catP!.id },
      { name: "Gaseosa",                 description: "Coca-Cola, Pepsi o Sprite. Tamaño mediano",                price: 2.50,  available: true, categoryId: catB!.id },
      { name: "Café Americano",          description: "Café negro recién preparado",                              price: 2.00,  available: true, categoryId: catB!.id },
      { name: "Té Frío",                 description: "Té negro con hielo y limón",                               price: 2.50,  available: true, categoryId: catB!.id },
      { name: "Agua Mineral",            description: "Agua mineral natural 500ml",                               price: 1.50,  available: true, categoryId: catB!.id },
      { name: "Brownie",                 description: "Brownie de chocolate tibio con helado de vainilla",        price: 4.50,  available: true, categoryId: catP!.id },
      { name: "Pizza Personal",          description: "Pizza individual de pepperoni con queso mozzarella",       price: 7.00,  available: true, categoryId: catP!.id },
    ],
  });
  console.log("✅ 11 productos");

  // ── Mesas ─────────────────────────────────────────────────────────────────
  await prisma.table.createMany({
    data: [
      { number: 1, qrCode: "QR-MESA-001", active: true },
      { number: 2, qrCode: "QR-MESA-002", active: true },
      { number: 3, qrCode: "QR-MESA-003", active: true },
      { number: 4, qrCode: "QR-MESA-004", active: true },
      { number: 5, qrCode: "QR-MESA-005", active: true },
    ],
  });
  console.log("✅ 5 mesas");

  // ── Usuarios internos (con active: true) ──────────────────────────────────
  const [h1, h2, h3] = await Promise.all([
    bcrypt.hash("admin123",   ROUNDS),
    bcrypt.hash("kitchen123", ROUNDS),
    bcrypt.hash("cashier123", ROUNDS),
  ]);
  await prisma.internalUser.createMany({
    data: [
      { name: "admin",  role: UserRole.ADMIN,   password: h1, active: true },
      { name: "cocina", role: UserRole.KITCHEN, password: h2, active: true },
      { name: "caja",   role: UserRole.CASHIER, password: h3, active: true },
    ],
  });
  console.log("✅ 3 usuarios (admin / cocina / caja)");

  // ── Configuración inicial del negocio ─────────────────────────────────────
  const configInicial = [
    { key: "nombre",           value: "Mi Restaurante" },
    { key: "bienvenida",       value: "¡Bienvenido! Escanea el menú y haz tu pedido." },
    { key: "moneda",           value: "USD" },
    { key: "simbolo_moneda",   value: "$" },
    { key: "nota_pie",         value: "Gracias por tu visita. ¡Vuelve pronto!" },
    { key: "logo_url",         value: "" },
    { key: "color_principal",  value: "#ea580c" },    // brand-600 actual
    { key: "horario",          value: "Lun-Dom 10:00–22:00" },
    { key: "activo",           value: "true" },
  ];

  for (const cfg of configInicial) {
    await prisma.businessConfig.upsert({
      where:  { key: cfg.key },
      update: { value: cfg.value },
      create: { key: cfg.key, value: cfg.value },
    });
  }
  console.log(`✅ ${configInicial.length} entradas de configuración`);

  console.log("\n🎉 Seed v5 completado.");
  console.log("   admin / admin123  →  /admin");
  console.log("   cocina / kitchen123  →  /kitchen");
  console.log("   caja / cashier123  →  /cashier");
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());