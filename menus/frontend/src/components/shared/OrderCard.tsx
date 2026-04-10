// OrderCard — Fase 2
// Mejoras: timer de tiempo transcurrido, feedback visual durante actualización,
// ícono de estado, notas más prominentes

import { useState, useEffect } from "react";
import { Order, OrderStatus, ORDER_STATUS_ICONS } from "../../types";
import { StatusBadge } from "./StatusBadge";

interface OrderCardProps {
  order:            Order;
  availableActions: { label: string; status: OrderStatus; style: string }[];
  onChangeStatus:   (orderId: number, status: OrderStatus) => void;
  isUpdating:       boolean;
  /** Si true, muestra el card en tema oscuro (para cocina) */
  dark?:            boolean;
}

/** Calcula minutos transcurridos desde createdAt y devuelve string legible */
function useElapsedTime(createdAt: string): string {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function compute() {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      if (diff < 60)  return `${diff}s`;
      if (diff < 3600) return `${Math.floor(diff / 60)}min`;
      return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}min`;
    }
    setElapsed(compute());
    const id = setInterval(() => setElapsed(compute()), 15_000);
    return () => clearInterval(id);
  }, [createdAt]);

  return elapsed;
}

/** Color del timer según urgencia */
function timerColor(createdAt: string, dark: boolean): string {
  const mins = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000);
  if (mins >= 15) return "text-red-500 font-bold";
  if (mins >= 8)  return dark ? "text-orange-400" : "text-orange-500";
  return dark ? "text-gray-400" : "text-gray-400";
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function OrderCard({ order, availableActions, onChangeStatus, isUpdating, dark = false }: OrderCardProps) {
  const elapsed = useElapsedTime(order.createdAt);
  const tc       = timerColor(order.createdAt, dark);

  const cardBg     = dark ? "bg-gray-800 border-gray-700"        : "bg-white border-gray-100";
  const titleColor = dark ? "text-white"                          : "text-gray-900";
  const subColor   = dark ? "text-gray-400"                       : "text-gray-500";
  const divider    = dark ? "border-gray-700"                     : "border-gray-100";
  const itemName   = dark ? "text-gray-200"                       : "text-gray-800";
  const totalLabel = dark ? "text-gray-400"                       : "text-gray-500";
  const totalVal   = dark ? "text-white"                          : "text-gray-900";
  const priceColor = dark ? "text-gray-500"                       : "text-gray-400";

  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-3 transition-opacity duration-200
                     ${cardBg} ${isUpdating ? "opacity-60" : ""}`}>

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className={`font-bold text-base ${titleColor}`}>
              {ORDER_STATUS_ICONS[order.status]} Orden #{order.id}
            </span>
            <StatusBadge status={order.status} />
          </div>
          <span className={`text-sm font-medium ${subColor}`}>Mesa {order.table.number}</span>
        </div>

        {/* Hora + timer */}
        <div className="text-right flex-shrink-0">
          <p className={`text-xs ${subColor}`}>{formatTime(order.createdAt)}</p>
          <p className={`text-xs mt-0.5 ${tc}`}>⏱ {elapsed}</p>
        </div>
      </div>

      {/* ── Productos ── */}
      <div className={`border-t ${divider} pt-3 space-y-2`}>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="bg-brand-600 text-white text-xs font-bold w-6 h-6 rounded-full
                             flex items-center justify-center flex-shrink-0 mt-0.5">
              {item.quantity}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium leading-snug ${itemName}`}>{item.productName}</p>
              {item.notes && (
                <p className="text-xs text-amber-500 bg-amber-500/10 rounded px-2 py-0.5 mt-1 inline-block">
                  📝 {item.notes}
                </p>
              )}
            </div>
            <span className={`text-xs mt-0.5 flex-shrink-0 ${priceColor}`}>
              ${item.subtotal.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Total ── */}
      <div className={`border-t ${divider} pt-2 flex justify-between items-center`}>
        <span className={`text-sm ${totalLabel}`}>Total</span>
        <span className={`font-bold text-base ${totalVal}`}>${order.total.toFixed(2)}</span>
      </div>

      {/* ── Acciones ── */}
      {availableActions.length > 0 && (
        <div className={`border-t ${divider} pt-2 flex gap-2`}>
          {availableActions.map((action) => (
            <button
              key={action.status}
              onClick={() => onChangeStatus(order.id, action.status)}
              disabled={isUpdating}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-colors
                          disabled:opacity-40 disabled:cursor-not-allowed ${action.style}`}
            >
              {isUpdating
                ? <span className="flex items-center justify-center gap-1.5">
                    <span className="w-3.5 h-3.5 border-2 border-current/40 border-t-current
                                     rounded-full animate-spin" />
                    Guardando...
                  </span>
                : action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}