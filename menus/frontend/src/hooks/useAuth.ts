// useAuth — Fase 3
// Hook consumidor del AuthContext. Lanza error si se usa fuera del AuthProvider.

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}