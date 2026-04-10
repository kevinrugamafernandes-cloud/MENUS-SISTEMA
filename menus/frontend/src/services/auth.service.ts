// auth.service.ts — Fase 3 (frontend)
// Centraliza login, logout y persistencia del token en localStorage

import { AuthUser, LoginPayload, LoginResponse, ApiResponse } from "../types";

const API_BASE    = "/api";
const TOKEN_KEY   = "menus_token";
const USER_KEY    = "menus_user";

export const authService = {
  /** Envía credenciales al backend y guarda token + usuario en localStorage */
  async login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });
    const data: ApiResponse<LoginResponse> = await res.json();

    if (!res.ok) throw new Error(data.error ?? "Credenciales incorrectas");

    // Persistir en localStorage para sobrevivir recargas
    localStorage.setItem(TOKEN_KEY, data.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));

    return data.data;
  },

  /** Elimina la sesión local */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /** Devuelve el token almacenado o null si no hay sesión */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /** Devuelve el usuario almacenado o null */
  getStoredUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try   { return JSON.parse(raw) as AuthUser; }
    catch { return null; }
  },

  /** true si hay token guardado (no verifica expiración — el backend lo rechaza si expiró) */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};