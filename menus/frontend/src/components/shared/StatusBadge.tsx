// StatusBadge — Fase 2: soporte para tema oscuro

import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "../../types";

interface StatusBadgeProps {
  status:    OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span className={`badge ${ORDER_STATUS_COLORS[status]} ${className}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}