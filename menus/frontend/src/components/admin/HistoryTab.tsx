// HistoryTab — Fase 4: historial de órdenes pagadas con filtros

import { useState, useCallback } from "react";
import { OrderHistoryItem } from "../../types";
import { fetchOrderHistory, downloadOrdersCsv } from "../../services/api.service";
import { LoadingSpinner } from "../shared/LoadingSpinner";

function formatDateTime(s: string) {
  return new Date(s).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(n: number) {
  return `$${n.toFixed(2)}`;
}

export function HistoryTab() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Filtros
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [mesa, setMesa] = useState("");
  const [limite, setLimite] = useState("50");

  // Expansión de detalle
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: Parameters<typeof fetchOrderHistory>[0] = {
        limite: parseInt(limite) || 50,
      };

      if (desde) params.desde = new Date(desde).toISOString();

      if (hasta) {
        const h = new Date(hasta);
        h.setHours(23, 59, 59, 999);
        params.hasta = h.toISOString();
      }

      if (mesa && !isNaN(parseInt(mesa))) {
        params.mesa = parseInt(mesa);
      }

      const res = await fetchOrderHistory(params);
      setOrders(res.data);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar historial");
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, mesa, limite]);

  function handleExportCsv() {
    downloadOrdersCsv({
      desde: desde ? new Date(desde).toISOString() : undefined,
      hasta: hasta
        ? (() => {
            const h = new Date(hasta);
            h.setHours(23, 59, 59, 999);
            return h.toISOString();
          })()
        : undefined,
      limite: parseInt(limite) || 50,
      mesa: mesa && !isNaN(parseInt(mesa)) ? parseInt(mesa) : undefined,
    });
  }

  const totalVentas = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">Historial de órdenes</h2>
        <p className="text-sm text-gray-500">Órdenes cobradas con filtros opcionales</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Mesa</label>
            <input
              type="number"
              min="1"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              placeholder="Todas"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Límite</label>
            <select
              value={limite}
              onChange={(e) => setLimite(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="btn-primary text-sm py-2.5 px-5 disabled:opacity-40"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>

          <button
            onClick={handleExportCsv}
            className="text-sm border border-gray-200 text-gray-600 hover:border-brand-400
                       hover:text-brand-600 px-4 py-2 rounded-xl font-medium transition-colors"
          >
            ↓ Exportar CSV
          </button>

          <button
            onClick={() => {
              setDesde("");
              setHasta("");
              setMesa("");
              setLimite("50");
            }}
            className="btn-secondary text-sm py-2.5 px-4"
          >
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="Buscando órdenes..." />}

      {/* Resultados */}
      {!loading && loaded && (
        <>
          {orders.length > 0 && (
            <div
              className="flex items-center gap-4 bg-green-50 border border-green-200
                         rounded-xl px-4 py-3 text-sm"
            >
              <span className="font-semibold text-green-800">{orders.length} órdenes encontradas</span>
              <span className="text-green-700">
                Total: <strong>{formatCurrency(totalVentas)}</strong>
              </span>
            </div>
          )}

          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 text-sm">No se encontraron órdenes con esos filtros</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Orden</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Mesa</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs hidden sm:table-cell">
                      Cobrada
                    </th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs hidden md:table-cell">
                      Ítems
                    </th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Total</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <FragmentHistoryRow
                      key={o.id}
                      order={o}
                      expanded={expanded === o.id}
                      onToggle={() => setExpanded(expanded === o.id ? null : o.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && !loaded && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-gray-500 text-sm">Usa los filtros arriba y presiona Buscar</p>
        </div>
      )}
    </div>
  );
}

function FragmentHistoryRow({
  order: o,
  expanded,
  onToggle,
}: {
  order: OrderHistoryItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors ${
          expanded ? "bg-brand-50" : ""
        }`}
      >
        <td className="px-4 py-3 font-medium text-gray-900">#{o.id}</td>
        <td className="px-4 py-3 text-gray-600">Mesa {o.mesa}</td>
        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">
          {formatDateTime(o.cobradaEn)}
        </td>
        <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">{o.items.length}</td>
        <td className="px-4 py-3 text-right font-bold text-gray-900">{formatCurrency(o.total)}</td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={onToggle}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            {expanded ? "Ocultar" : "Ver"}
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-brand-50/40">
          <td colSpan={6} className="px-4 pb-3 pt-1">
            <div className="bg-white rounded-xl border border-brand-100 p-3 text-xs">
              <p className="font-semibold text-gray-700 mb-2">
                Creada: {formatDateTime(o.creadaEn)}
              </p>

              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-1 font-medium">Producto</th>
                    <th className="text-center pb-1 font-medium">Cant.</th>
                    <th className="text-right pb-1 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                      <td className="py-1 text-gray-700">{item.producto}</td>
                      <td className="py-1 text-center text-gray-500">×{item.cantidad}</td>
                      <td className="py-1 text-right font-medium text-gray-800">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}