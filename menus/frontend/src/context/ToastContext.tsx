// ToastContext — Fase 4
// Permite que cualquier componente del panel admin muestre toasts
// sin prop-drilling. Se monta una sola vez en AdminPage.

import { createContext, ReactNode } from "react";
import { useToast }                 from "../hooks/useToast";
import { ToastContainer }           from "../components/shared/Toast";

type ToastContextValue = ReturnType<typeof useToast>;

export const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* El contenedor de toasts vive aquí — siempre visible dentro del admin */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />
    </ToastContext.Provider>
  );
}
