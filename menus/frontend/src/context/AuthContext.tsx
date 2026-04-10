// AuthContext — Fase 6 final
// Sin restauración automática de sesión.
// Siempre exige login al entrar de nuevo a rutas protegidas.

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { AuthUser, LoginPayload } from "../types";
import { authService } from "../services/auth.service";

interface LoginResult {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const isLoading = false;

  const login = useCallback(async (payload: LoginPayload): Promise<LoginResult> => {
    const result = await authService.login(payload);
    setToken(result.token);
    setUser(result.user);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    function handleSessionExpired() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener("menus:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("menus:session-expired", handleSessionExpired);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token,
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}