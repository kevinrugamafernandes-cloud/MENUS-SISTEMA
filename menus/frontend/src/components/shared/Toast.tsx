// Toast — Fase 4
// Componente de notificaciones apilables. Se renderiza en AdminLayout.

import { ToastMessage } from "../../hooks/useToast";

interface ToastContainerProps {
  toasts:   ToastMessage[];
  onDismiss: (id: number) => void;
}

const STYLES = {
  success: "bg-green-800 border-green-700 text-green-100",
  error:   "bg-red-900   border-red-700   text-red-100",
  info:    "bg-gray-800  border-gray-600  text-gray-100",
};

const ICONS = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
                      text-sm font-medium animate-in
                      ${STYLES[t.type]}`}
        >
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-current/20
                           flex items-center justify-center text-xs font-bold">
            {ICONS[t.type]}
          </span>
          <span className="flex-1 leading-snug">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity text-xs ml-1"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}