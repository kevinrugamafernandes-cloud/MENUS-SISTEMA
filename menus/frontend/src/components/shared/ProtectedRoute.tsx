// ProtectedRoute — Fase 3 corregido
// Guard de rutas protegidas.
// Si no hay sesión, redirige a /login.
// Si el rol no tiene acceso, limpia sesión y redirige a /login.

import { ReactNode, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { UserRole } from "../../types";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) return;

    if (requiredRole && user.role !== requiredRole) {
      logout();
      navigate("/login", { replace: true });
    }
  }, [isLoading, isAuthenticated, user, requiredRole, logout, navigate]);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}