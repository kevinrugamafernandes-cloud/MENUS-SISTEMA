// apiService — Fase 6
// Cocina y caja ahora usan auth=true
// Manejo global de sesión expirada por 401
// Soporte para backend remoto vía VITE_API_BASE

import {
  ApiResponse,
  MenuResponse,
  Order,
  CreateOrderPayload,
  UpdateStatusPayload,
  AdminProduct,
  Category,
  DashboardSummary,
  AdminTable,
  OrderHistoryItem,
  DailyReport,
  BusinessConfig,
  InternalUserAdmin,
  CreateUserPayload,
} from "../types";
import { authService } from "./auth.service";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function buildHeaders(auth = false): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = authService.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
  auth = false
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(auth),
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json();

  if (res.status === 401) {
    authService.logout();
    window.dispatchEvent(new Event("menus:session-expired"));
  }

  if (!res.ok) {
    throw new Error(data.error ?? `Error ${res.status}`);
  }

  return data as ApiResponse<T>;
}

// ── Menú ──────────────────────────────────────────────────────────────────────
export async function fetchMenu(tableNumber: number): Promise<ApiResponse<MenuResponse>> {
  return apiFetch<MenuResponse>(`/menu/${tableNumber}`);
}

// ── Órdenes ───────────────────────────────────────────────────────────────────
export async function createOrder(payload: CreateOrderPayload): Promise<ApiResponse<Order>> {
  return apiFetch<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Cocina / Caja — requieren auth
export async function fetchActiveOrders(): Promise<ApiResponse<Order[]>> {
  return apiFetch<Order[]>("/orders/active", {}, true);
}

export async function fetchRecentPaidOrders(): Promise<ApiResponse<Order[]>> {
  return apiFetch<Order[]>("/orders/paid/recent", {}, true);
}

export async function updateOrderStatus(
  id: number,
  payload: UpdateStatusPayload
): Promise<ApiResponse<Order>> {
  return apiFetch<Order>(
    `/orders/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    true
  );
}

// ── Admin — Productos ─────────────────────────────────────────────────────────
export async function fetchAdminProducts(): Promise<ApiResponse<AdminProduct[]>> {
  return apiFetch<AdminProduct[]>("/admin/products", {}, true);
}

export async function createAdminProduct(
  data: Omit<AdminProduct, "id" | "category">
): Promise<ApiResponse<AdminProduct>> {
  return apiFetch<AdminProduct>(
    "/admin/products",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function updateAdminProduct(
  id: number,
  data: Partial<Omit<AdminProduct, "id" | "category">>
): Promise<ApiResponse<AdminProduct>> {
  return apiFetch<AdminProduct>(
    `/admin/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function setProductAvailability(
  id: number,
  available: boolean
): Promise<ApiResponse<AdminProduct>> {
  return apiFetch<AdminProduct>(
    `/admin/products/${id}/availability`,
    {
      method: "PATCH",
      body: JSON.stringify({ available }),
    },
    true
  );
}

export async function toggleAdminProduct(id: number): Promise<ApiResponse<AdminProduct>> {
  return apiFetch<AdminProduct>(
    `/admin/products/${id}/toggle`,
    { method: "PATCH" },
    true
  );
}

// ── Admin — Categorías ────────────────────────────────────────────────────────
export async function fetchAdminCategories(): Promise<ApiResponse<Category[]>> {
  return apiFetch<Category[]>("/admin/categories", {}, true);
}

export async function createAdminCategory(name: string): Promise<ApiResponse<Category>> {
  return apiFetch<Category>(
    "/admin/categories",
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
    true
  );
}

export async function updateAdminCategory(id: number, name: string): Promise<ApiResponse<Category>> {
  return apiFetch<Category>(
    `/admin/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({ name }),
    },
    true
  );
}

// ── Admin — Mesas ─────────────────────────────────────────────────────────────
export async function fetchAdminTables(): Promise<ApiResponse<AdminTable[]>> {
  return apiFetch<AdminTable[]>("/admin/tables", {}, true);
}

export async function createAdminTable(
  data: { number: number; qrCode?: string; active?: boolean }
): Promise<ApiResponse<AdminTable>> {
  return apiFetch<AdminTable>(
    "/admin/tables",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function setTableActive(id: number, active: boolean): Promise<ApiResponse<AdminTable>> {
  return apiFetch<AdminTable>(
    `/admin/tables/${id}/active`,
    {
      method: "PATCH",
      body: JSON.stringify({ active }),
    },
    true
  );
}

// ── Admin — Historial ─────────────────────────────────────────────────────────
export async function fetchOrderHistory(params?: {
  desde?: string;
  hasta?: string;
  limite?: number;
  mesa?: number;
}): Promise<ApiResponse<OrderHistoryItem[]>> {
  const qs = new URLSearchParams();

  if (params?.desde) qs.set("desde", params.desde);
  if (params?.hasta) qs.set("hasta", params.hasta);
  if (params?.limite) qs.set("limite", String(params.limite));
  if (params?.mesa) qs.set("mesa", String(params.mesa));

  const query = qs.toString() ? `?${qs.toString()}` : "";

  return apiFetch<OrderHistoryItem[]>(`/admin/orders/history${query}`, {}, true);
}

// ── Admin — Reportes ──────────────────────────────────────────────────────────
export async function fetchDailyReport(fecha?: string): Promise<ApiResponse<DailyReport>> {
  const query = fecha ? `?fecha=${fecha}` : "";
  return apiFetch<DailyReport>(`/admin/reports/daily${query}`, {}, true);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export async function fetchDashboardSummary(): Promise<ApiResponse<DashboardSummary>> {
  return apiFetch<DashboardSummary>("/admin/dashboard/summary", {}, true);
}

// ── Health ────────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    return (await fetch(`${API_BASE}/health`)).ok;
  } catch {
    return false;
  }
}

// ── Fase 5: Config pública, usuarios internos, exportación ───────────────────
export async function fetchPublicConfig(): Promise<ApiResponse<BusinessConfig>> {
  return apiFetch<BusinessConfig>("/config");
}

export async function fetchAdminConfig(): Promise<ApiResponse<BusinessConfig>> {
  return apiFetch<BusinessConfig>("/admin/config", {}, true);
}

export async function updateAdminConfig(
  data: Partial<BusinessConfig>
): Promise<ApiResponse<BusinessConfig>> {
  return apiFetch<BusinessConfig>(
    "/admin/config",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    true
  );
}

// ── Admin — Usuarios internos ─────────────────────────────────────────────────
export async function fetchAdminUsers(): Promise<ApiResponse<InternalUserAdmin[]>> {
  return apiFetch<InternalUserAdmin[]>("/admin/users", {}, true);
}

export async function createAdminUser(
  data: CreateUserPayload
): Promise<ApiResponse<InternalUserAdmin>> {
  return apiFetch<InternalUserAdmin>(
    "/admin/users",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true
  );
}

export async function updateUserRole(
  id: number,
  role: string
): Promise<ApiResponse<InternalUserAdmin>> {
  return apiFetch<InternalUserAdmin>(
    `/admin/users/${id}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
    true
  );
}

export async function resetUserPassword(
  id: number,
  password: string
): Promise<ApiResponse<{ message: string }>> {
  return apiFetch<{ message: string }>(
    `/admin/users/${id}/password`,
    {
      method: "PATCH",
      body: JSON.stringify({ password }),
    },
    true
  );
}

export async function setUserActive(
  id: number,
  active: boolean
): Promise<ApiResponse<InternalUserAdmin>> {
  return apiFetch<InternalUserAdmin>(
    `/admin/users/${id}/active`,
    {
      method: "PATCH",
      body: JSON.stringify({ active }),
    },
    true
  );
}

// ── Exportar historial CSV ────────────────────────────────────────────────────
export function downloadOrdersCsv(params?: {
  desde?: string;
  hasta?: string;
  limite?: number;
  mesa?: number;
}): void {
  const token = window.localStorage.getItem("menus_token");
  const query = new URLSearchParams();

  if (params?.desde) query.set("desde", params.desde);
  if (params?.hasta) query.set("hasta", params.hasta);
  if (params?.limite) query.set("limite", String(params.limite));
  if (params?.mesa) query.set("mesa", String(params.mesa));

  const qs = query.toString();
  const url = `${API_BASE}/admin/orders/export${qs ? `?${qs}` : ""}`;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
    },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `menus-historial-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(() => {
      alert("Error al exportar. Intenta de nuevo.");
    });
}