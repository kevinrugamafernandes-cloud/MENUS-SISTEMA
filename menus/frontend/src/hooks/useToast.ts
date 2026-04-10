// useToast — Fase 4
// Hook para mostrar notificaciones toast temporales (éxito, error, info).
// Se usa en todos los tabs del panel admin.

import { useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id:      number;
  message: string;
  type:    ToastType;
}

const DURATION_MS = 3500;
let counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type }]);

    const timer = setTimeout(() => dismiss(id), DURATION_MS);
    timers.current.set(id, timer);
  }, [dismiss]);

  return {
    toasts,
    success: (msg: string) => show(msg, "success"),
    error:   (msg: string) => show(msg, "error"),
    info:    (msg: string) => show(msg, "info"),
    dismiss,
  };
}