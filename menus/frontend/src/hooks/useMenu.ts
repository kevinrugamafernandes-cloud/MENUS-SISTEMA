// useMenu - Hook para cargar el menú según el número de mesa
// Gestiona loading, error y datos de forma centralizada

import { useState, useEffect } from "react";
import { MenuResponse } from "../types";
import { fetchMenu } from "../services/api.service";

interface UseMenuResult {
  menuData: MenuResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMenu(tableNumber: number): UseMenuResult {
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetchMenu(tableNumber);
        if (!cancelled) {
          setMenuData(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error al cargar el menú");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [tableNumber, tick]);

  return {
    menuData,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}