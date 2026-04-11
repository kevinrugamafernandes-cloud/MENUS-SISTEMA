// auth.service.ts — robusto para producción
// Centraliza login, logout y persistencia del token en localStorage

import { AuthUser, LoginPayload, LoginResponse, ApiResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";
const TOKEN_KEY = "menus_token";
const USER_KEY = "menus_user";

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data: ApiResponse<LoginResponse> | null = null;

    try {
      data = (await res.json()) as ApiResponse<LoginResponse>;
    } catch {
      if (!res.ok) {
        throw new Error(`Error ${res.status}: el servidor no devolvió JSON válido`);
      }
      throw new Error("Respuesta inválida del servidor");
    }

    if (!res.ok) {
      throw new Error(data?.error ?? "Credenciales incorrectas");
    }

    if (!data?.data?.token || !data?.data?.user) {
      throw new Error("Respuesta incompleta del servidor");
    }

    localStorage.setItem(TOKEN_KEY, data.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));

    return data.data;
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};