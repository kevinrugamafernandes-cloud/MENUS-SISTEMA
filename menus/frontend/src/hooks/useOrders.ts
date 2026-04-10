// useOrders — Fase 2
// Mejoras: lastUpdated, error recovery automático, polling configurable,
// separación entre órdenes activas y pagadas recientes

import { useState, useEffect, useCallback, useRef } from "react";
import { Order, OrderStatus } from "../types";
import { fetchActiveOrders, fetchRecentPaidOrders, updateOrderStatus } from "../services/api.service";

// Intervalo de polling — en Fase 3 se reemplaza por socket.io
const POLL_INTERVAL_MS = 10_000; // 10 s (mejorado desde 15 s en Fase 1)

interface UseOrdersResult {
  orders:        Order[];          // órdenes activas
  paidOrders:    Order[];          // PAID del turno (para caja)
  loading:       boolean;
  error:         string | null;
  lastUpdated:   Date | null;      // timestamp de última carga exitosa
  updating:      number | null;    // ID de orden en proceso de cambio
  refetch:       () => void;
  changeStatus:  (orderId: number, newStatus: OrderStatus) => Promise<void>;
}

interface UseOrdersOptions {
  includePaid?: boolean;   // si true, también carga paidOrders (solo caja)
}

export function useOrders({ includePaid = false }: UseOrdersOptions = {}): UseOrdersResult {
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [paidOrders,  setPaidOrders]  = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [updating,    setUpdating]    = useState<number | null>(null);
  const [tick,        setTick]        = useState(0);

  // Ref para evitar updates en componentes desmontados
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async (showLoader = true) => {
    if (showLoader && mountedRef.current) setLoading(true);

    try {
      // Cargar activas siempre; pagadas solo si el panel las necesita
      const requests: Promise<unknown>[] = [fetchActiveOrders()];
      if (includePaid) requests.push(fetchRecentPaidOrders());

      const results = await Promise.all(requests);
      const activeRes = results[0] as Awaited<ReturnType<typeof fetchActiveOrders>>;

      if (!mountedRef.current) return;

      setOrders(activeRes.data);
      setError(null);
      setLastUpdated(new Date());

      if (includePaid && results[1]) {
        const paidRes = results[1] as Awaited<ReturnType<typeof fetchRecentPaidOrders>>;
        setPaidOrders(paidRes.data);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      // Mantiene datos anteriores en pantalla; solo muestra aviso de error
      setError(err instanceof Error ? err.message : "Error al cargar órdenes");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [includePaid]);

  // Carga inicial + polling automático
  useEffect(() => {
    load(true);
    // Preparado para reemplazar con socket.io en Fase 3:
    // socket.on("order:updated", () => load(false));
    const interval = setInterval(() => load(false), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load, tick]);

  const changeStatus = useCallback(
    async (orderId: number, newStatus: OrderStatus) => {
      setUpdating(orderId);
      setError(null);
      try {
        await updateOrderStatus(orderId, { status: newStatus });
        await load(false); // refrescar sin spinner
      } catch (err) {
        if (mountedRef.current)
          setError(err instanceof Error ? err.message : "Error al actualizar estado");
      } finally {
        if (mountedRef.current) setUpdating(null);
      }
    },
    [load]
  );

  return {
    orders,
    paidOrders,
    loading,
    error,
    lastUpdated,
    updating,
    refetch:      () => setTick((t) => t + 1),
    changeStatus,
  };
}