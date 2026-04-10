// useToastContext — Fase 4
// Hook consumidor del ToastContext.
// Usar en cualquier tab/componente del panel admin para mostrar toasts.

import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext debe usarse dentro de <ToastProvider>");
  return ctx;
}
