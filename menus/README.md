# MenUS — Sistema Digital de Menú para Restaurantes

**Men**u **U**nification **S**ystem

MenUS permite que los clientes escaneen un código QR en su mesa, vean el menú, hagan su pedido desde el celular, y que cocina y caja lo reciban instantáneamente.

---

## Fase 1 — Funcionalidades implementadas

- ✅ Cliente escanea QR → entra a `/menu/mesa/:numero`
- ✅ Ve menú por categorías, agrega productos, gestiona carrito
- ✅ Confirma pedido → backend lo valida y guarda en PostgreSQL
- ✅ Panel de cocina en `/kitchen` — ve órdenes pendientes y en preparación
- ✅ Panel de caja en `/cashier` — ve todas las órdenes activas, cobra
- ✅ Cambio de estado de orden con validación de transiciones

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + TypeScript + Express |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Validación | Zod |

---

## Estructura del proyecto

```
menus/
├── backend/                  # API REST Express
│   ├── src/
│   │   ├── server.ts         # Punto de entrada del servidor
│   │   ├── routes/           # Definición de rutas
│   │   ├── controllers/      # Manejo de requests/responses
│   │   ├── services/         # Lógica de negocio
│   │   ├── validators/       # Schemas Zod
│   │   ├── middleware/       # Error handler, etc.
│   │   └── lib/              # Prisma client singleton
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── database/
│   └── prisma/
│       ├── schema.prisma     # Modelos de base de datos
│       └── seed.ts           # Datos iniciales
│
├── frontend/                 # React app (cliente QR + paneles)
│   ├── src/
│   │   ├── App.tsx           # Router principal
│   │   ├── main.tsx          # Punto de entrada React
│   │   ├── index.css         # Estilos globales + Tailwind
│   │   ├── pages/            # MenuPage, KitchenPage, CashierPage
│   │   ├── components/       # Componentes reutilizables
│   │   │   ├── menu/         # ProductCard, CartDrawer, OrderSuccess
│   │   │   ├── kitchen/      # (espacio para componentes futuros)
│   │   │   ├── cashier/      # (espacio para componentes futuros)
│   │   │   └── shared/       # StatusBadge, LoadingSpinner, ErrorMessage, OrderCard
│   │   ├── hooks/            # useMenu, useCart, useOrders
│   │   ├── services/         # api.service.ts
│   │   └── types/            # Tipos TypeScript compartidos
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── package.json              # Scripts globales del monorepo
```

---

## Instalación y configuración

### Requisitos previos

- Node.js 18+
- PostgreSQL 14+ corriendo localmente
- npm 9+

### 1. Clonar / posicionarse en el proyecto

```bash
cd menus
```

### 2. Instalar dependencias

```bash
# Instalar todo de una vez desde la raíz
npm run install:all

# O por separado:
npm install --prefix backend
npm install --prefix frontend
```

### 3. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env`:

```env
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/menus_db"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Crear la base de datos en PostgreSQL

```bash
# Opción A: usando psql
psql -U postgres -c "CREATE DATABASE menus_db;"

# Opción B: usando pgAdmin o tu cliente preferido
# Crear una base de datos llamada: menus_db
```

### 5. Generar el cliente Prisma

```bash
npm run db:generate
```

### 6. Ejecutar las migraciones

```bash
npm run db:migrate
# Nombre sugerido cuando te lo pida: init_fase1
```

### 7. Cargar el seed (datos iniciales)

```bash
npm run db:seed
```

Esto crea:
- 5 mesas activas
- 11 productos en 3 categorías
- 3 usuarios internos mock

---

## Ejecutar el proyecto

Necesitás **2 terminales** abiertas al mismo tiempo:

### Terminal 1 — Backend

```bash
npm run dev:backend
# Servidor corriendo en http://localhost:3001
```

### Terminal 2 — Frontend

```bash
npm run dev:frontend
# App corriendo en http://localhost:5173
```

---

## URLs del sistema

| Sección | URL |
|---------|-----|
| Menú Mesa 1 | http://localhost:5173/menu/mesa/1 |
| Menú Mesa 2 | http://localhost:5173/menu/mesa/2 |
| Menú Mesa 5 | http://localhost:5173/menu/mesa/5 |
| Panel Cocina | http://localhost:5173/kitchen |
| Panel Caja | http://localhost:5173/cashier |
| API Health | http://localhost:3001/api/health |
| API Menú | http://localhost:3001/api/menu/1 |
| API Órdenes activas | http://localhost:3001/api/orders/active |

---

## Comandos útiles

```bash
# Ver base de datos con Prisma Studio
npm run db:studio

# Regenerar cliente Prisma después de cambiar schema
npm run db:generate

# Nueva migración después de modificar schema.prisma
npm run db:migrate

# Re-ejecutar seed (limpia y recrea datos)
npm run db:seed
```

---

## Flujo de prueba manual

1. Abrí `http://localhost:5173/menu/mesa/1`
2. Agregá 2-3 productos al carrito
3. Añadí notas a algún producto (ej: "sin sal")
4. Presioná "Confirmar pedido"
5. Abrí `http://localhost:5173/kitchen` en otra pestaña
6. Verás la orden en "Pendientes" → presioná "Iniciar preparación"
7. Luego "Marcar como listo"
8. En `http://localhost:5173/cashier` verás la orden lista → "Cobrar"

---

## Estados de orden

```
PENDING → IN_PREPARATION → READY → PAID
           ↑ (también puede volver a PENDING si es necesario)
```

| Estado | Español | Quién lo cambia |
|--------|---------|----------------|
| PENDING | Pendiente | Cocina / Caja |
| IN_PREPARATION | En preparación | Cocina / Caja |
| READY | Listo | Cocina / Caja |
| PAID | Pagado | Caja |

---

## API Reference

### GET /api/health
Verifica que el servidor esté corriendo.

### GET /api/menu/:tableNumber
Devuelve datos de la mesa y productos disponibles agrupados por categoría.

### POST /api/orders
Crea una nueva orden.
```json
{
  "tableNumber": 1,
  "items": [
    { "productId": 1, "quantity": 2, "notes": "sin cebolla" },
    { "productId": 6, "quantity": 1 }
  ]
}
```

### GET /api/orders/active
Devuelve órdenes con estado PENDING, IN_PREPARATION o READY.

### PATCH /api/orders/:id/status
Cambia el estado de una orden.
```json
{ "status": "IN_PREPARATION" }
```

---

## Próximos pasos — Fase 2

Ver sección al final del documento de arquitectura o consultar el roadmap del proyecto.

---

## Notas de seguridad (Fase 1)

- Los paneles de cocina y caja **no tienen autenticación** en esta fase. En Fase 2 se implementará JWT + roles.
- Las contraseñas de usuarios internos son plaintext. En Fase 2 se usará bcrypt.
- El proyecto está preparado para agregar **WebSockets** (socket.io) en el servidor Express.

---

*MenUS v1.0.0 — Fase 1*