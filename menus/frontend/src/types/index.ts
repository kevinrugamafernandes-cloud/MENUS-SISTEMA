// Tipos compartidos de MenUS — Fase 4
// Agrega: AdminTable, OrderHistory, ReportData, DashboardSummary expandido

// ─── Modelos base ─────────────────────────────────────────────────────────────

export interface Product {
  id:          number;
  name:        string;
  description: string | null;
  price:       number;
  imageUrl:    string | null;
  available:   boolean;
  category:    string;
  categoryId?: number;
}

export interface Table {
  id:     number;
  number: number;
  qrCode: string;
}

export interface OrderItem {
  id?:         number;
  productName: string;
  quantity:    number;
  unitPrice:   number;
  subtotal:    number;
  notes:       string | null;
}

export interface Order {
  id:          number;
  table:       { number: number };
  status:      OrderStatus;
  statusLabel: string;
  total:       number;
  createdAt:   string;
  updatedAt?:  string;
  items:       OrderItem[];
}

// ─── Estados de orden ─────────────────────────────────────────────────────────

export type OrderStatus = "PENDING" | "PREPARING" | "READY" | "PAID";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:   "Pendiente",
  PREPARING: "En preparación",
  READY:     "Listo",
  PAID:      "Pagado",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800",
  PREPARING: "bg-blue-100  text-blue-800",
  READY:     "bg-green-100 text-green-700",
  PAID:      "bg-gray-100  text-gray-500",
};

export const ORDER_STATUS_ICONS: Record<OrderStatus, string> = {
  PENDING:   "⏳",
  PREPARING: "🍳",
  READY:     "✅",
  PAID:      "💰",
};

// ─── Carrito ──────────────────────────────────────────────────────────────────

export interface CartItem {
  product:  Product;
  quantity: number;
  notes:    string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = "ADMIN" | "KITCHEN" | "CASHIER";

export interface AuthUser {
  id:   number;
  name: string;
  role: UserRole;
}

export interface LoginPayload  { name: string; password: string; }
export interface LoginResponse { token: string; user: AuthUser; }

// ─── Admin — productos y categorías ──────────────────────────────────────────

export interface Category {
  id:   number;
  name: string;
  _count?: { products: number };
}

export interface AdminProduct {
  id:          number;
  name:        string;
  description: string | null;
  price:       number;
  available:   boolean;
  imageUrl:    string | null;
  categoryId:  number;
  category:    { id: number; name: string };
}

// ─── Admin — mesas — Fase 4 ───────────────────────────────────────────────────

export interface AdminTable {
  id:      number;
  number:  number;
  qrCode:  string;
  active:  boolean;
  _count?: { orders: number };
  orders?: { id: number; status: string }[];  // orden activa si existe
}

// ─── Historial de órdenes — Fase 4 ───────────────────────────────────────────

export interface OrderHistoryItem {
  id:        number;
  mesa:      number;
  total:     number;
  status:    string;
  creadaEn:  string;
  cobradaEn: string;
  items: {
    producto: string;
    cantidad: number;
    subtotal: number;
  }[];
}

// ─── Reportes — Fase 4 ────────────────────────────────────────────────────────

export interface DailyReport {
  fecha:         string;
  totalVentas:   number;
  totalOrdenes:  number;
  ticketPromedio: number;
  productosMasVendidos: {
    nombre:    string;
    categoria: string;
    cantidad:  number;
    ingresos:  number;
  }[];
  categoriasMasVendidas: {
    nombre:   string;
    cantidad: number;
    ingresos: number;
  }[];
  porHora: { hora: number; ordenes: number; ventas: number }[];
}

// ─── Dashboard — Fase 4 (expandido desde Fase 3) ──────────────────────────────

export interface DashboardSummary {
  dia: {
    fecha:          string;
    totalOrdenes:   number;
    ordenesCobradas: number;
    ventasTotales:  number;
    ticketPromedio: number;
    ordenesPorEstado: {
      pendientes: number;
      preparando: number;
      listas:     number;
      cobradas:   number;
    };
  };
  ahora: {
    ordenesActivas: number;
    mesasOcupadas:  number;
  };
  catalogo: {
    totalProductos:    number;
    productosActivos:  number;
    productosInactivos: number;
    totalCategorias:   number;
    totalMesas:        number;
    mesasActivas:      number;
    mesasInactivas:    number;
  };
  topProductos: {
    productId:      number;
    nombre:         string;
    cantidadPedida: number;
    ingresos:       number;
  }[];
  topCategorias: {
    nombre:   string;
    cantidad: number;
    ingresos: number;
  }[];
  ultimasCobradas: {
    id:        number;
    mesa:      number;
    total:     number;
    cobradaEn: string;
    items:     number;
  }[];
}

// ─── Respuestas API ───────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success:  boolean;
  data:     T;
  message?: string;
  error?:   string;
  count?:   number;
}

export interface MenuResponse {
  table:    Table;
  products: Product[];
  menu:     Record<string, Product[]>;
}

export interface CreateOrderPayload {
  tableNumber: number;
  items: { productId: number; quantity: number; notes?: string; }[];
}

export interface UpdateStatusPayload { status: OrderStatus; }

// ─── Fase 5: Configuración del negocio ───────────────────────────────────────

export interface BusinessConfig {
  nombre:          string;
  bienvenida:      string;
  moneda:          string;
  simbolo_moneda:  string;
  nota_pie:        string;
  logo_url:        string;
  color_principal: string;
  horario:         string;
  activo:          string;
}

// ─── Fase 5: Usuarios internos (admin) ───────────────────────────────────────

export interface InternalUserAdmin {
  id:     number;
  name:   string;
  role:   UserRole;
  active: boolean;
}

export interface CreateUserPayload {
  name:     string;
  password: string;
  role:     UserRole;
}