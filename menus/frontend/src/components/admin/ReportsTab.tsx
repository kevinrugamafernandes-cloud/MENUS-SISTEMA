// ReportsTab — Fase 4: reporte del día con ventas, ticket promedio y top productos

import { useState, useCallback, useEffect } from "react";
import { DailyReport }       from "../../types";
import { fetchDailyReport }  from "../../services/api.service";
import { LoadingSpinner }    from "../shared/LoadingSpinner";

function formatCurrency(n: number) { return `$${n.toFixed(2)}`; }
function todayISO() { return new Date().toISOString().slice(0, 10); }

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// Barra de progreso simple para tablas de ranking
function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ReportsTab() {
  const [data,    setData]    = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [fecha,   setFecha]   = useState(todayISO());

  const load = useCallback(async (f: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetchDailyReport(f);
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reporte");
    } finally { setLoading(false); }
  }, []);

  // Cargar hoy al montar
  useEffect(() => { load(todayISO()); }, [load]);

  const maxProd = data?.productosMasVendidos[0]?.cantidad ?? 1;
  const maxCat  = data?.categoriasMasVendidas[0]?.ingresos ?? 1;

  return (
    <div className="space-y-5">

      {/* Cabecera + selector de fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Reporte de ventas</h2>
          <p className="text-sm text-gray-500">Resultados del día seleccionado</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fecha}
            max={todayISO()}
            onChange={(e) => setFecha(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button onClick={() => load(fecha)} disabled={loading}
                  className="btn-primary text-sm py-2 px-4 disabled:opacity-40">
            {loading ? "..." : "Ver"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading && <LoadingSpinner message="Cargando reporte..." />}

      {!loading && data && (
        <>
          {/* KPIs principales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatBox label="Total ventas"    value={formatCurrency(data.totalVentas)} />
            <StatBox label="Órdenes cobradas" value={String(data.totalOrdenes)} />
            <StatBox label="Ticket promedio"  value={formatCurrency(data.ticketPromedio)}
                     sub="por orden cobrada" />
          </div>

          {/* Sin datos del día */}
          {data.totalOrdenes === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-gray-500 text-sm">Sin órdenes cobradas en esta fecha</p>
            </div>
          )}

          {data.totalOrdenes > 0 && (
            <div className="grid md:grid-cols-2 gap-4">

              {/* Top productos */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Productos más vendidos
                </h3>
                {data.productosMasVendidos.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>
                ) : (
                  <div className="space-y-3">
                    {data.productosMasVendidos.map((p, i) => (
                      <div key={p.nombre} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-800 truncate">{p.nombre}</span>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              ×{p.cantidad}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ProgressBar value={p.cantidad} max={maxProd} />
                            <span className="text-xs text-brand-600 font-medium">
                              {formatCurrency(p.ingresos)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top categorías */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Categorías más vendidas
                </h3>
                {data.categoriasMasVendidas.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>
                ) : (
                  <div className="space-y-3">
                    {data.categoriasMasVendidas.map((c, i) => (
                      <div key={c.nombre} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-800">{c.nombre}</span>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              ×{c.cantidad}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ProgressBar value={c.ingresos} max={maxCat} />
                            <span className="text-xs text-brand-600 font-medium">
                              {formatCurrency(c.ingresos)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribución horaria */}
          {data.totalOrdenes > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Actividad por hora
              </h3>
              <div className="flex items-end gap-1 h-24 overflow-x-auto pb-1">
                {data.porHora.map((h) => {
                  const maxV = Math.max(...data.porHora.map((x) => x.ventas), 1);
                  const pct  = (h.ventas / maxV) * 100;
                  return (
                    <div key={h.hora} className="flex flex-col items-center gap-1 flex-1 min-w-[24px]"
                         title={`${h.hora}:00 — ${h.ordenes} órdenes · ${formatCurrency(h.ventas)}`}>
                      <div className="w-full rounded-t"
                           style={{
                             height: `${Math.max(pct, h.ordenes > 0 ? 8 : 2)}%`,
                             backgroundColor: h.ordenes > 0 ? "#ea580c" : "#e5e7eb",
                             minHeight: "4px",
                           }}
                      />
                      <span className="text-gray-400 text-[9px]">
                        {String(h.hora).padStart(2, "0")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}